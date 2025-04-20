import React, { useContext, useMemo, useEffect, JSX } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

import { MODEL_PATH } from '../../utils/constants/computerConstants'
// Import the context
import { InstancesContext, InstanceGroup } from './Instances'
import ComputerObjects from './ComputerObjects'
import StaticMeshes from './StaticMeshes'
import ScreenGroup from './ScreenGroup'
import Leds from './Leds'
import { PerformanceProvider } from '../../utils/context/PerformanceContext'
// PerformanceStats might need context handling if used across client/server
// import { PerformanceStats } from '../../utils/hooks/usePerformanceMonitor'

// Define Props type, potentially using JSX intrinsic elements for group props
// For now, just define scale explicitly and allow other props via intersection
interface ComputersProps extends Omit<JSX.IntrinsicElements['group'], 'scale'> {
  scale?: number | [number, number, number]
}

/**
 * メインコンピュータグループコンポーネント
 * 3Dのレトロコンピュータモデルを表示する
 * パフォーマンス最適化機能を統合
 * @param {ComputersProps} props - プロパティ (型定義を修正)
 */
const Computers: React.FC<ComputersProps> = React.memo(({ scale, ...props }) => {
  const { nodes, materials } = useGLTF(MODEL_PATH)
  const instances = useContext(InstancesContext)
  // console.log('[Computers.tsx] Instances from context:', instances) // Removed log

  // Ensure context provides a value
  if (!instances) {
    console.error('InstancesContext not found!')
    // Optionally return null or a loading indicator
    // return null;
  }

  // グローバルなパフォーマンス状態を更新 (useFrame works only in client components)
  // useFrame(({ clock }) => {
  //   // フレームカウンターの更新
  //   PerformanceStats.frameCount++
  //   // ここの処理は最も優先度が高く、毎フレーム実行される
  //   // 他のコンポーネントがパフォーマンス状態を参照するため
  // })

  // Pass instances to child components
  const computerObjects = useMemo(() => <ComputerObjects instances={instances} />, [instances])
  const staticMeshes = useMemo(() => <StaticMeshes nodes={nodes} materials={materials} instances={instances} />, [nodes, materials, instances])
  const screenGroup = useMemo(() => <ScreenGroup instances={instances} />, [instances])
  const leds = useMemo(() => <Leds instances={instances} />, [instances])

  return (
    <PerformanceProvider>
      {/* Pass scale prop to the group */}
      <group scale={scale} {...props} dispose={null} frustumCulled={true}>
        {/* 各コンポーネントをメモ化して不要な再レンダリングを防止 */}
        {computerObjects}
        {staticMeshes}
        {screenGroup}
        {leds}
      </group>
    </PerformanceProvider>
  )
})

// Component preloading might need adjustment in Next.js
// if (typeof window !== 'undefined') {
//   useGLTF.preload(MODEL_PATH)
// }

export default Computers
