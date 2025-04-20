import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Text } from '@react-three/drei'

import { COMPUTER_CONSTANTS, PERFORMANCE_CONFIG } from '../../utils/constants/computerConstants'
import Screen from './Screen'
import { usePerformance } from '../../utils/context/PerformanceContext'
import { useWorkerizedComputation } from '../../utils/hooks/useWorkerizedComputation'

/**
 * テキストアニメーション計算用のワーカー関数
 * テキスト位置の計算をバックグラウンドで行う
 */
const computeTextPosition = (data) => {
  const { baseX, time, rand, animated } = data

  if (!animated) return { x: baseX, y: data.y }

  // アニメーション計算
  const x = baseX + Math.sin(rand + time / 4) * 8

  return { x, y: data.y }
}

/**
 * テキストを表示するモニターコンポーネント
 * パフォーマンス最適化機能を統合
 * @param {Object} props - 表示プロパティ
 * @param {boolean} props.invert - 配色を反転するかどうか
 * @param {number} props.x - X位置（デフォルト：0）
 * @param {number} props.y - Y位置（デフォルト：1.2）
 * @param {string} props.content - 表示するテキスト内容（デフォルト：'Poimandres.'）
 * @param {number} props.fontSize - フォントサイズ（デフォルト：4）
 * @param {boolean} props.animated - テキストをアニメーションするかどうか（デフォルト：true）
 * @param {boolean} props.customEffect - カスタムスキャンラインエフェクトを使用するかどうか（デフォルト：false）
 */
const ScreenText = React.memo((props) => {
  const { invert, x = 0, y = 1.2, content = 'Poimandres.', fontSize = 4, animated = true, customEffect = false, ...otherProps } = props

  const textRef = useRef()
  const positionRef = useRef({ x, y })

  // パフォーマンス監視
  const performance = usePerformance()
  const animationId = useMemo(() => `text-${content}-${Date.now().toString(36)}`, [content])
  const qualitySettings = performance.getQualitySettings()

  // 乱数値をメモ化して再レンダリング時に保持
  const rand = useMemo(() => Math.random() * 10000, [])

  // Web Workerでテキストアニメーション計算
  const { compute, isAvailable } = useWorkerizedComputation(computeTextPosition, {
    enabled: window.Worker !== undefined && animated // Workerがサポートされており、アニメーションが有効な場合のみ使用
  })

  // アニメーションの登録
  useEffect(() => {
    if (animated) {
      // テキスト用アニメーションの登録（優先度：高）
      performance.registerAnimationPhase(animationId, PERFORMANCE_CONFIG.ANIMATION.UPDATE_PRIORITIES.SCREEN_TEXT)
    }

    return () => {
      if (animated) {
        performance.unregisterAnimationPhase(animationId)
      }
    }
  }, [animated, animationId, performance])

  // テキストの位置アニメーション（最適化版）
  useFrame(async ({ clock }) => {
    if (!textRef.current || !animated) return

    // パフォーマンスに応じてアニメーション更新頻度を調整
    if (performance.shouldAnimateThisFrame(animationId)) {
      try {
        if (isAvailable()) {
          // Web Workerを使用して位置計算を並列処理
          const newPosition = await compute({
            baseX: x,
            y,
            time: clock.getElapsedTime(),
            rand,
            animated
          })

          // 計算結果を適用
          if (textRef.current) {
            textRef.current.position.x = newPosition.x
            positionRef.current = newPosition
          }
        } else {
          // Worker未サポート環境ではメインスレッドで計算
          const newX = x + Math.sin(rand + clock.getElapsedTime() / 4) * 8
          textRef.current.position.x = newX
          positionRef.current = { x: newX, y }
        }
      } catch (error) {
        // エラー時はメインスレッドで計算（フォールバック）
        const newX = x + Math.sin(rand + clock.getElapsedTime() / 4) * 8
        textRef.current.position.x = newX
        positionRef.current = { x: newX, y }
      }
    }
  })

  // レンダリング品質に応じたアスペクト比設定
  const aspectRatio = qualitySettings.textureSize.width / qualitySettings.textureSize.height

  // 配色を決定
  const colors = {
    background: invert ? COMPUTER_CONSTANTS.COLORS.black : COMPUTER_CONSTANTS.COLORS.glow,
    text: !invert ? COMPUTER_CONSTANTS.COLORS.black : COMPUTER_CONSTANTS.COLORS.glow
  }

  return (
    <Screen {...otherProps} customEffect={customEffect}>
      <PerspectiveCamera makeDefault manual aspect={aspectRatio} position={[0, 0, 15]} />
      <color attach="background" args={[colors.background]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Text
        font="/Inter-Medium.woff"
        position={[x, y, 0]}
        ref={textRef}
        fontSize={fontSize}
        letterSpacing={-0.1}
        color={colors.text}
        anchorX="center"
        anchorY="middle"
        maxWidth={30}>
        {content}
      </Text>
    </Screen>
  )
})

export default ScreenText
