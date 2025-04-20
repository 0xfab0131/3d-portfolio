import { useEffect, useState, useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PERFORMANCE_CONFIG } from '../constants/computerConstants'

/**
 * パフォーマンスを監視して最適化するカスタムフック
 * フレームレート、距離に基づくLOD、アニメーション優先度を管理
 * @returns {Object} パフォーマンス関連のユーティリティと状態
 */
export const usePerformanceMonitor = () => {
  const { camera, gl } = useThree()

  // 現在のLODレベルの状態
  const [qualityLevel, setQualityLevel] = useState('HIGH')

  // パフォーマンス測定用の変数
  const frameTimeRef = useRef(0)
  const lastTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  const fpsRef = useRef(60)
  const animationPhaseRef = useRef({})

  // LODレベルを距離に応じて計算
  const calculateLODLevel = useCallback((distance) => {
    const { DISTANCE_THRESHOLDS } = PERFORMANCE_CONFIG.LOD

    if (distance < DISTANCE_THRESHOLDS[1]) return 'HIGH'
    if (distance < DISTANCE_THRESHOLDS[2]) return 'MEDIUM'
    return 'LOW'
  }, [])

  // オブジェクトが現在のフレームで更新すべきかを判断
  const shouldUpdateThisFrame = useCallback((priority) => {
    // 高優先度(1)は毎フレーム更新
    if (priority === 1) return true

    // フレームレートが高い場合はすべての優先度を更新
    if (fpsRef.current >= 55) return true

    // 中優先度(2)は2フレームに1回更新
    if (priority === 2) return frameCountRef.current % 2 === 0

    // 低優先度(3)は3フレームに1回更新
    if (priority === 3) return frameCountRef.current % 3 === 0

    // それ以外の優先度は4フレームに1回更新
    return frameCountRef.current % 4 === 0
  }, [])

  // アニメーションフェーズ管理（並列処理の最適化）
  const registerAnimationPhase = useCallback((id, priority) => {
    animationPhaseRef.current[id] = { priority, lastUpdated: 0 }
  }, [])

  const unregisterAnimationPhase = useCallback((id) => {
    delete animationPhaseRef.current[id]
  }, [])

  // アニメーションが現在更新すべきかをチェック
  const shouldAnimateThisFrame = useCallback(
    (id) => {
      if (!animationPhaseRef.current[id]) return true

      const { priority } = animationPhaseRef.current[id]
      const shouldUpdate = shouldUpdateThisFrame(priority)

      if (shouldUpdate) {
        animationPhaseRef.current[id].lastUpdated = frameCountRef.current
      }

      return shouldUpdate
    },
    [shouldUpdateThisFrame]
  )

  // パフォーマンス監視
  useFrame((state, delta) => {
    const currentTime = performance.now()

    if (lastTimeRef.current !== 0) {
      const frameTime = currentTime - lastTimeRef.current
      frameTimeRef.current = frameTime

      // フレームレート計算（移動平均）
      fpsRef.current = 0.9 * fpsRef.current + 0.1 * (1000 / frameTime)
    }

    lastTimeRef.current = currentTime
    frameCountRef.current++

    // カメラからの距離に基づいてLODレベルを更新
    // ここではsceneのメッシュ群の中心を原点と仮定
    const distanceFromCenter = camera.position.distanceTo({ x: 0, y: 0, z: 0 })
    const newQualityLevel = calculateLODLevel(distanceFromCenter)

    if (newQualityLevel !== qualityLevel) {
      setQualityLevel(newQualityLevel)
    }
  })

  // WebGLコンテキストの最適化
  useEffect(() => {
    if (gl) {
      // レンダラーの最適化設定
      gl.physicallyCorrectLights = true

      // モバイルデバイスの場合、追加の最適化
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      }
    }

    return () => {
      // クリーンアップ
      animationPhaseRef.current = {}
    }
  }, [gl])

  return {
    qualityLevel,
    fps: fpsRef.current,
    registerAnimationPhase,
    unregisterAnimationPhase,
    shouldAnimateThisFrame,
    getQualitySettings: () => PERFORMANCE_CONFIG.LOD.QUALITY_LEVELS[qualityLevel],
    isLowPerformanceDevice: fpsRef.current < 40
  }
}

// グローバルなパフォーマンスコンテキスト用のシングルトンインスタンス
// 複数コンポーネント間で共有するためのオブジェクト
export const PerformanceStats = {
  frameCount: 0,
  frameTime: 0,
  fps: 60,
  qualityLevel: 'HIGH',

  // 並列処理管理用のデータベース
  animations: {},

  // 最後の更新時刻
  getAnimationTimeOffset: (id, priority = 1) => {
    if (!PerformanceStats.animations[id]) {
      PerformanceStats.animations[id] = { lastTime: 0, priority }
    }

    // 優先度に応じた時間オフセット
    const currentTime = performance.now()
    const { lastTime } = PerformanceStats.animations[id]

    // 優先度が高いほど頻繁に更新
    const updateInterval = Math.max(16.67, PerformanceStats.frameTime * priority)

    if (currentTime - lastTime >= updateInterval) {
      PerformanceStats.animations[id].lastTime = currentTime
      return currentTime - lastTime
    }

    return 0
  },

  // 並列処理をスケジュールする
  scheduleUpdate: (id, priority = 1) => {
    if (!PerformanceStats.animations[id]) {
      PerformanceStats.animations[id] = { lastTime: 0, priority }
    }

    // 現在のフレーム数で優先度に基づきスケジュール
    return PerformanceStats.frameCount % Math.max(1, priority) === 0
  }
}
