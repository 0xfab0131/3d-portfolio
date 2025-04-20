import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { STATIC_MESHES, OBJECT32_POSITIONS } from '../../utils/constants/computerConstants'

// Infer types from useGLTF hook return value
type GLTFResult = ReturnType<typeof useGLTF>

// Define Props type using the inferred types
interface StaticMeshesProps {
  nodes: GLTFResult['nodes']
  materials: GLTFResult['materials']
  instances?: any // Made instances optional
}

/**
 * 静的なメッシュ（動かない背景オブジェクトなど）をレンダリングするコンポーネント
 * @param {StaticMeshesProps} props - プロパティ (型定義を修正)
 */
const StaticMeshes: React.FC<StaticMeshesProps> = React.memo(({ nodes, materials, instances }) => {
  // メモ化された静的メッシュのリスト
  const staticMeshComponents = useMemo(() => {
    return STATIC_MESHES.map((meshData, index) => {
      const geometry = nodes[meshData.id]?.geometry
      if (!geometry) {
        console.warn(`Geometry not found for static mesh ID: ${meshData.id}`)
        return null
      }
      return (
        <mesh
          key={`static-mesh-${index}`}
          castShadow
          receiveShadow
          geometry={geometry}
          material={materials.Texture}
          position={meshData.position as THREE.Vector3Tuple}
          rotation={meshData.rotation as THREE.EulerTuple}
          scale={meshData.scale || 1}
        />
      )
    }).filter(Boolean)
  }, [nodes, materials])

  // Object32 インスタンスのレンダリング (InstancesContextが不要な場合、この部分は削除または修正が必要)
  const object32Instances = useMemo(() => {
    if (!instances || !instances.Object32) return null // Check if instances exist
    // Pass pos.position to the position prop
    return OBJECT32_POSITIONS.map((pos, i) => <instances.Object32 key={`object32-${i}`} position={pos.position as THREE.Vector3Tuple} />)
  }, [instances])

  return (
    <>
      {staticMeshComponents}
      {object32Instances}
    </>
  )
})

export default StaticMeshes
