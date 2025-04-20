import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { PERFORMANCE_CONFIG } from '../constants/computerConstants'

/**
 * レンダーテクスチャのキャッシュを管理するカスタムフック
 * 同じ特性を持つテクスチャを再利用することでGPUメモリとレンダリング負荷を削減
 * @param {Object} options - テクスチャオプション
 * @param {number} options.width - テクスチャの幅
 * @param {number} options.height - テクスチャの高さ
 * @param {number} options.anisotropy - 異方性フィルタリングのレベル
 * @param {string} options.id - キャッシュID（指定しない場合は自動生成）
 * @param {boolean} options.useCache - キャッシュを使用するかどうか
 * @returns {Object} キャッシュされたテクスチャとリソース管理用関数
 */
export const useRenderTextureCache = ({ width, height, anisotropy = 1, id = null, useCache = PERFORMANCE_CONFIG.MEMORY.CACHE_SCREENS }) => {
  const { gl } = useThree()
  const textureRef = useRef(null)
  const textureId = useRef(id || `texture-${Math.random().toString(36).substring(2, 9)}`)

  // 静的なテクスチャキャッシュ（アプリケーション全体で共有）
  const textureCache = useMemo(() => {
    if (!globalThis.__RENDER_TEXTURE_CACHE__) {
      globalThis.__RENDER_TEXTURE_CACHE__ = new Map()
    }
    return globalThis.__RENDER_TEXTURE_CACHE__
  }, [])

  // キャッシュキーの生成（サイズと設定ごとにユニークなキー）
  const cacheKey = useMemo(() => {
    return `${width}x${height}-a${anisotropy}`
  }, [width, height, anisotropy])

  // テクスチャの作成または取得
  const getOrCreateTexture = useMemo(() => {
    if (!useCache) {
      // キャッシュを使用しない場合は新規作成
      const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        colorSpace: THREE.SRGBColorSpace,
        anisotropy
      })
      textureRef.current = renderTarget
      return renderTarget
    }

    // キャッシュから既存のテクスチャを探す
    if (textureCache.has(cacheKey)) {
      const cachedData = textureCache.get(cacheKey)

      // このテクスチャを使用している参照を追加
      if (!cachedData.users.includes(textureId.current)) {
        cachedData.users.push(textureId.current)
      }

      textureRef.current = cachedData.texture
      return cachedData.texture
    }

    // キャッシュにない場合は新規作成してキャッシュに追加
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
      anisotropy
    })

    textureCache.set(cacheKey, {
      texture: renderTarget,
      users: [textureId.current],
      lastUsed: Date.now()
    })

    textureRef.current = renderTarget
    return renderTarget
  }, [width, height, anisotropy, cacheKey, textureCache, useCache])

  // コンポーネントのアンマウント時にリソースをクリーンアップ
  useEffect(() => {
    return () => {
      if (!useCache) {
        // キャッシュを使用していない場合は直接破棄
        if (textureRef.current) {
          textureRef.current.dispose()
        }
        return
      }

      // このコンポーネントがテクスチャの使用を終了したことを登録
      if (textureCache.has(cacheKey)) {
        const cachedData = textureCache.get(cacheKey)

        // 使用者リストから削除
        cachedData.users = cachedData.users.filter((user) => user !== textureId.current)

        // 最終使用時間を更新
        cachedData.lastUsed = Date.now()

        // 誰も使っていない場合、一定時間後に破棄するよう予約
        if (cachedData.users.length === 0) {
          setTimeout(() => {
            // 破棄前に再度チェック（その間に誰かが使い始めた可能性がある）
            const currentData = textureCache.get(cacheKey)
            if (currentData && currentData.users.length === 0) {
              currentData.texture.dispose()
              textureCache.delete(cacheKey)
            }
          }, 30000) // 30秒後に破棄を試みる
        }
      }
    }
  }, [cacheKey, textureCache, useCache])

  // レンダーターゲットの解像度更新（デバイス性能に応じた動的調整）
  const updateResolution = (newWidth, newHeight) => {
    if (textureRef.current) {
      textureRef.current.setSize(newWidth, newHeight)
    }
  }

  return {
    renderTarget: getOrCreateTexture,
    updateResolution,
    textureId: textureId.current
  }
}
