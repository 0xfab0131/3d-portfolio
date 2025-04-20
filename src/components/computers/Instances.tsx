'use client' // Add 'use client' as this component uses hooks like useGLTF

import React, { useMemo, createContext, ReactNode } from 'react'
import { useGLTF, Merged } from '@react-three/drei'
import { Mesh } from 'three'
import * as THREE from 'three'
import { MODEL_PATH } from '../../utils/constants/computerConstants'

// Temporarily define context type as any to bypass casting error
export type InstanceGroup = any

// Context definition using the temporary type
export const InstancesContext = createContext<InstanceGroup | undefined>(undefined)

// GLTFモデルをプリロード
// useGLTF.preload(MODEL_PATH)

interface InstancesProps {
  children: ReactNode
  // Add other props if <Merged> accepts them
}

/**
 * インスタンス管理コンポーネント
 * 類似のジオメトリを検出してインスタンス化し、描画コールを最小限に抑えます
 * @param {InstancesProps} props - プロパティとchildren (型定義を追加)
 */
const Instances: React.FC<InstancesProps> = React.memo(({ children, ...props }) => {
  const { nodes, materials } = useGLTF(MODEL_PATH)
  const typedNodes = nodes as { [key: string]: Mesh }

  // Define the meshes to be merged (original logic)
  const meshesToMerge = useMemo(
    () => ({
      Object: typedNodes.Object_4,
      Object1: typedNodes.Object_16,
      Object3: typedNodes.Object_52,
      Object13: typedNodes.Object_172,
      Object14: typedNodes.Object_174,
      Object23: typedNodes.Object_22,
      Object24: typedNodes.Object_26,
      Object32: typedNodes.Object_178,
      Object36: typedNodes.Object_28,
      Object45: typedNodes.Object_206,
      Object46: typedNodes.Object_207,
      Object47: typedNodes.Object_215,
      Object48: typedNodes.Object_216,
      Sphere: typedNodes.Sphere
    }),
    [typedNodes]
  )

  return (
    // Pass the original meshes object to Merged
    <Merged castShadow receiveShadow meshes={meshesToMerge} {...props}>
      {(mergedInstances) => {
        // Provide the mergedInstances directly without casting to the old InstanceGroup
        return <InstancesContext.Provider value={mergedInstances} children={children} />
      }}
    </Merged>
  )
})

export default Instances
