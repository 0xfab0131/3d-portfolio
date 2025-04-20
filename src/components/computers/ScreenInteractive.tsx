import React from 'react'
import { PerspectiveCamera } from '@react-three/drei'

import { COMPUTER_CONSTANTS } from '../../utils/constants/computerConstants'
import { SpinningBox } from '../../SpinningBox'
import Screen from './Screen'

/**
 * 回転するボックスを表示するモニターコンポーネント
 */
interface ScreenInteractiveProps {
  backgroundColor?: string
  customEffect?: boolean
  frame?: string
  panel?: string
  position?: THREE.Vector3Tuple
  rotation?: THREE.EulerTuple
  scale?: number
}

const ScreenInteractive: React.FC<ScreenInteractiveProps> = React.memo((props) => {
  const { backgroundColor = COMPUTER_CONSTANTS.COLORS.orange, customEffect = true, frame, panel, position, rotation, scale, ...otherProps } = props

  const aspectRatio = COMPUTER_CONSTANTS.TEXTURE.width / COMPUTER_CONSTANTS.TEXTURE.height

  const screenProps = { frame, panel, position, rotation, scale, ...otherProps }

  return (
    <Screen {...screenProps} customEffect={customEffect}>
      <PerspectiveCamera makeDefault manual aspect={aspectRatio} position={[0, 0, 10]} />
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={COMPUTER_CONSTANTS.FULL_PI / 2} />
      <pointLight decay={0} position={[10, 10, 10]} intensity={COMPUTER_CONSTANTS.FULL_PI} />
      <pointLight decay={0} position={[-10, -10, -10]} />
      <SpinningBox position={[-3.15, 0.75, 0]} scale={0.5} />
    </Screen>
  )
})

export default ScreenInteractive
