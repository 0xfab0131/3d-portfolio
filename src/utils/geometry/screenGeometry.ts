import * as THREE from 'three'
import { SCREEN_PARAMS } from '../constants/computerConstants'

/**
 * パネルのジオメトリサイズを計算し、スクリーンパラメータを返す
 * @param {THREE.BufferGeometry} geometry - パネルのジオメトリ
 * @returns {Object} スクリーンパラメータオブジェクト
 */
export const calculateScreenParameters = (geometry) => {
  // ジオメトリのバウンディングボックスを計算
  const box = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position)
  const size = box.getSize(new THREE.Vector3())

  // スクリーンのスケール係数
  const { screenScale, yAdjustment, cornerOffset, z, cornerScale } = SCREEN_PARAMS

  // 実際のスクリーンサイズを計算
  const width = size.x * screenScale
  const height = size.y * screenScale

  return {
    size,
    yAdjustment,
    scale: screenScale,
    width,
    height,
    cornerOffset,
    cornerScale,
    z,
    corner: {
      x: width / 2 - cornerOffset,
      topY: height / 2 - cornerOffset + yAdjustment,
      bottomY: -height / 2 + cornerOffset + yAdjustment
    }
  }
}
