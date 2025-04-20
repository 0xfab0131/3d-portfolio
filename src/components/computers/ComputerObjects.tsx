import React, { useMemo } from 'react'
import * as THREE from 'three'
import { COMPUTER_OBJECTS } from '../../utils/constants/computerConstants'
// Import the shared type (now any)
import { InstanceGroup } from './Instances'

// Remove local definition
/*
interface InstanceGroup {
  [key: string]: THREE.Mesh
  Object: THREE.Mesh
  Object1: THREE.Mesh
  Object3: THREE.Mesh
  Object13: THREE.Mesh
  Object14: THREE.Mesh
  Object23: THREE.Mesh
  Object24: THREE.Mesh
  Object32: THREE.Mesh
  Object36: THREE.Mesh
  Object45: THREE.Mesh
  Object46: THREE.Mesh
  Object47: THREE.Mesh
  Object48: THREE.Mesh
  Sphere: THREE.Mesh
}
*/

interface ComputerObjectsProps {
  instances?: InstanceGroup // Type is now any | undefined
}

/**
 * コンピュータの各パーツ（インスタンス化されたもの）を配置するコンポーネント
 * @param {ComputerObjectsProps} props - プロパティ (型定義を追加)
 */
const ComputerObjects: React.FC<ComputerObjectsProps> = React.memo(({ instances }) => {
  // console.log('[ComputerObjects.tsx] Received instances prop:', instances); // Removed log

  // Return null if instances are not yet available (important check)
  if (!instances) {
    // console.log('[ComputerObjects.tsx] Instances prop is undefined, returning null.'); // Removed log
    return null
  }

  // Restore mapping logic (assuming instances holds geometry/material info)
  const objectMappings = {
    basic: instances.Object, // Assuming these keys exist and hold mesh data
    type1: instances.Object1,
    type3: instances.Object3,
    type13: instances.Object13,
    type14: instances.Object14,
    type23: instances.Object23,
    type24: instances.Object24,
    type32: instances.Object32,
    type36: instances.Object36,
    type45: instances.Object45,
    type46: instances.Object46,
    type47: instances.Object47,
    type48: instances.Object48
  }

  // Restore the original rendering logic using InstancedComponent
  const computerObjectComponents = useMemo(() => {
    return Object.entries(COMPUTER_OBJECTS).flatMap(([type, data]) => {
      const InstancedComponent = objectMappings[type as keyof typeof objectMappings]
      if (!InstancedComponent) {
        console.warn(`Instance component not found for type: ${type}`)
        return []
      }

      return data.map((item: any, index: number) => (
        // Render the InstancedComponent directly
        <InstancedComponent key={`${type}-${index}`} position={item.position as THREE.Vector3Tuple} rotation={item.rotation as THREE.EulerTuple} scale={item.scale || 1} />
      ))
    })
  }, [instances, objectMappings])

  // Restore return statement
  return <>{computerObjectComponents}</>
})

export default ComputerObjects
