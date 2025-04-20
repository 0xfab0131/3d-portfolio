import * as THREE from 'three'
import { COLORS } from '../constants/computerConstants'

/**
 * スクリーンの輝き効果用のマテリアルを作成
 * @returns {THREE.MeshPhysicalMaterial} 輝き効果マテリアル
 */
export const createGlowMaterial = () => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COLORS.glow),
    emissive: new THREE.Color(COLORS.glow).multiplyScalar(0.15),
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    transmission: 0.95,
    thickness: 0.05,
    transparent: true,
    opacity: 0.6
  })
}

/**
 * コーナー装飾用の共通マテリアルを作成
 * @returns {THREE.MeshStandardMaterial} コーナー装飾マテリアル
 */
export const createCornerMaterial = () => {
  return new THREE.MeshStandardMaterial({
    color: COLORS.glow,
    emissive: COLORS.glow,
    emissiveIntensity: 0.6
  })
}

/**
 * LED用の基本マテリアルを作成して返す
 * @returns {THREE.MeshBasicMaterial} LEDマテリアル
 */
export const createLedMaterial = () => {
  const material = new THREE.MeshBasicMaterial()
  material.toneMapped = false
  return material
}
