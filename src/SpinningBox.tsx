'use client'

import React, { useRef, useState, ComponentProps } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import { Mesh } from 'three'
import * as THREE from 'three'

/*
このファイルは3D空間でインタラクティブに回転するボックスを表示するコンポーネントを提供します。
主な機能:
- マウスホバーとクリックイベントに反応する立方体
- ユーザーがホバーすると色が変わり、ポインターのスタイルが変更される
- クリックすると大きさが変わる
- 常に自動回転する3Dボックス

このコンポーネントは、モニター画面に表示されるインタラクティブなコンテンツや、
3D空間内のインタラクティブな要素として使用されます。
*/

interface SpinningBoxProps extends Omit<ComponentProps<'mesh'>, 'scale'> {
  scale?: number
}

export function SpinningBox({ scale = 1, ...props }: SpinningBoxProps) {
  const ref = useRef<Mesh>(null!)
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useCursor(hovered)

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x = ref.current.rotation.y += delta
    }
  })

  const actualScale = clicked ? scale * 1.4 : scale * 1.2
  return (
    <mesh {...props} ref={ref} scale={actualScale} onClick={(event) => click(!clicked)} onPointerOver={(event) => hover(true)} onPointerOut={(event) => hover(false)}>
      <boxGeometry />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'indianred'} />
    </mesh>
  )
}
