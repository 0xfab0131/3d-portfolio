import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import { MODEL_PATH, LED_POSITIONS, PERFORMANCE_CONFIG } from '../../utils/constants/computerConstants'
import { createLedMaterial } from '../../utils/materials/screenMaterials'
import { usePerformance } from '../../utils/context/PerformanceContext'
import { useWorkerizedComputation } from '../../utils/hooks/useWorkerizedComputation'
import { InstanceGroup } from './Instances'

// Define type for the worker function data if needed
interface ComputeLedColorsData {
  positions: THREE.Vector3Tuple[]
  time: number
  baseColor: number[]
}

/**
 * LEDアニメーション計算用のワーカー関数
 * メインスレッドの負荷を軽減するために使用
 */
const computeLedColors = (data: ComputeLedColorsData): number[][] => {
  const { positions, time, baseColor } = data
  const results: number[][] = []

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i]
    const rand = Math.abs(2 + position[0])
    const t = Math.round((1 + Math.sin(rand * 10000 + time * rand)) / 2)

    // RGB値を計算
    results.push([
      0, // R
      t * baseColor[1], // G
      t * baseColor[2] // B
    ])
  }

  return results
}

// Define props using the imported type
interface LedsProps {
  instances?: InstanceGroup // Type is now any | undefined
}

/**
 * 点滅するLEDをレンダリングするコンポーネント
 * パフォーマンス最適化とWeb Workerによる並列計算を実装
 * @param {LedsProps} props - プロパティ (型定義を追加)
 */
const Leds: React.FC<LedsProps> = React.memo(({ instances }) => {
  const ref = useRef<THREE.Group>(null)
  const { nodes } = useGLTF(MODEL_PATH)
  const ledsRef = useRef<(THREE.Mesh | null)[]>([])

  // パフォーマンス監視機能
  const performance = usePerformance()
  const animationId = useMemo(() => `leds-${Date.now().toString(36)}`, [])

  // Web Worker を使用してLEDの色計算を並列化
  const { compute, isAvailable } = useWorkerizedComputation(computeLedColors, {
    enabled: typeof window !== 'undefined' && window.Worker !== undefined // Workers APIが使用可能な場合にのみ有効化
  })

  // LED計算用の基本色
  const baseColor = useMemo(() => [1, 1.1, 1], [])

  // 基本材質の設定
  useMemo(() => {
    if (nodes.Sphere && (nodes.Sphere as THREE.Mesh).material) {
      ;(nodes.Sphere as THREE.Mesh).material = createLedMaterial()
    }
  }, [nodes])

  // アニメーションフェーズの登録
  useEffect(() => {
    if (performance) {
      performance.registerAnimationPhase(animationId, PERFORMANCE_CONFIG.ANIMATION.UPDATE_PRIORITIES.LED)
      return () => {
        performance.unregisterAnimationPhase(animationId)
      }
    }
  }, [animationId, performance])

  // LEDの点滅アニメーション（最適化版）
  useFrame(async (state) => {
    if (!instances || !instances.Sphere || !performance || !performance.shouldAnimateThisFrame(animationId)) return

    const time = state.clock.getElapsedTime()
    let colors: number[][] | null = null

    if (isAvailable() && compute) {
      try {
        colors = await compute({ positions: LED_POSITIONS as THREE.Vector3Tuple[], time, baseColor })
      } catch (error) {
        console.error('Error computing LED colors in worker:', error)
        // Fallback to main thread computation on worker error
        colors = computeLedColors({ positions: LED_POSITIONS as THREE.Vector3Tuple[], time, baseColor })
      }
    } else {
      // Fallback for when worker is not available
      colors = computeLedColors({ positions: LED_POSITIONS as THREE.Vector3Tuple[], time, baseColor })
    }

    if (colors) {
      for (let i = 0; i < LED_POSITIONS.length; ++i) {
        const led = ledsRef.current[i]
        // Check if led and its material exist, and if the material has a color property
        if (led && led.material && typeof (led.material as THREE.Material & { color?: THREE.Color }).color?.setRGB === 'function') {
          // Type assertion to access color safely
          const ledMaterial = led.material as THREE.Material & { color: THREE.Color }
          ledMaterial.color.setRGB(colors[i][0], colors[i][1], colors[i][2])
        } else if (led) {
          // Log a warning if material or color is missing for debugging
          // console.warn(`LED ${i} material or color property is missing.`);
        }
      }
    }
  })

  // インスタンス化されたLEDメッシュの参照を保持
  const handleLedRef = (index: number) => (el: THREE.Mesh | null) => {
    ledsRef.current[index] = el
  }

  // Return null or a placeholder if instances are not ready
  if (!instances || !instances.Sphere) {
    return null
  }

  return (
    <group ref={ref}>
      {LED_POSITIONS.map((position, i) => (
        <instances.Sphere key={`led-${i}`} position={position as THREE.Vector3Tuple} scale={0.005} ref={handleLedRef(i)} />
      ))}
    </group>
  )
})

export default Leds
