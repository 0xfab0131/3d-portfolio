import React, { useRef, useMemo, useEffect, useState, ReactNode } from 'react'
import { useFrame, GroupProps } from '@react-three/fiber'
import { useGLTF, RenderTexture } from '@react-three/drei'
import * as THREE from 'three'

import { MODEL_PATH, COMPUTER_CONSTANTS, PERFORMANCE_CONFIG } from '../../utils/constants/computerConstants'
import { createGlowMaterial, createCornerMaterial } from '../../utils/materials/screenMaterials'
import { calculateScreenParameters } from '../../utils/geometry/screenGeometry'
import { createScanlineMaterial, updateScanlineAnimation } from '../../utils/shaders/screenShaders'
import { useRenderTextureCache } from '../../utils/hooks/useRenderTextureCache'
import { usePerformance } from '../../utils/context/PerformanceContext'

// Define Props interface
interface ScreenProps extends GroupProps {
  frame: string
  panel: string
  children?: ReactNode
  customEffect?: boolean
  [key: string]: any
}

/**
 * 最適化されたスクリーンコンポーネント
 * モニター（GLTFモデルから取り出したもの）をレンダリングし、
 * カスタムシーンをテクスチャにレンダリングして、それをモニターの画面に投影します
 * パフォーマンス最適化機能を組み込み済み
 */
const Screen: React.FC<ScreenProps> = React.memo(({ frame, panel, children, customEffect = false, ...props }) => {
  const { nodes, materials } = useGLTF(MODEL_PATH) as any
  const screenRef = useRef<THREE.Mesh>(null!)

  const performance = usePerformance()
  const safePerformance = {
    getQualitySettings: performance?.getQualitySettings ?? (() => PERFORMANCE_CONFIG.LOD.QUALITY_LEVELS.MEDIUM),
    registerAnimationPhase: performance?.registerAnimationPhase ?? (() => {}),
    unregisterAnimationPhase: performance?.unregisterAnimationPhase ?? (() => {}),
    shouldAnimateThisFrame: performance?.shouldAnimateThisFrame ?? (() => true)
  }

  const animationId = useMemo(() => `screen-${panel}-${Date.now().toString(36)}`, [panel])
  const qualitySettings = useMemo(() => safePerformance.getQualitySettings(), [safePerformance])

  const textureWidth = qualitySettings.textureSize.width
  const textureHeight = qualitySettings.textureSize.height

  const { renderTarget } = useRenderTextureCache({
    width: textureWidth,
    height: textureHeight,
    anisotropy: qualitySettings.anisotropy,
    id: `screen-${panel}`,
    useCache: PERFORMANCE_CONFIG.MEMORY.CACHE_SCREENS
  })

  const scanlineMaterial = useMemo(() => createScanlineMaterial(), [])

  const screenParams = useMemo(() => {
    const panelNode = nodes?.[panel]
    if (!panelNode || !(panelNode as THREE.Mesh).geometry) {
      console.warn(`Screen panel geometry not found for node: ${panel}`)
      return null
    }
    return calculateScreenParameters((panelNode as THREE.Mesh).geometry)
  }, [nodes, panel])

  const glowMaterial = useMemo(() => createGlowMaterial(), [])
  const cornerMaterial = useMemo(() => createCornerMaterial(), [])

  useEffect(() => {
    if (customEffect) {
      safePerformance.registerAnimationPhase(animationId, PERFORMANCE_CONFIG.ANIMATION.UPDATE_PRIORITIES.SCANLINE)
    }
    return () => {
      if (customEffect) {
        safePerformance.unregisterAnimationPhase(animationId)
      }
    }
  }, [customEffect, animationId, safePerformance])

  useFrame(({ clock }) => {
    if (customEffect && screenRef.current && screenParams) {
      if (safePerformance.shouldAnimateThisFrame(animationId)) {
        updateScanlineAnimation(scanlineMaterial, clock.getElapsedTime() * 2)
      }
    }
  })

  const cornerSegments = qualitySettings.cornerSegments
  const cornerGeometry = useMemo(() => <sphereGeometry args={[1, cornerSegments, cornerSegments, 0, COMPUTER_CONSTANTS.HALF_PI]} />, [cornerSegments])

  if (!screenParams) return null

  const frameGeometry = nodes?.[frame]?.geometry
  if (!frameGeometry) {
    console.warn(`Screen frame geometry not found for node: ${frame}`)
  }

  const panelGeometry = nodes?.[panel]?.geometry
  if (!panelGeometry) return null

  return (
    <group {...props}>
      {frameGeometry && materials?.Texture && <mesh castShadow receiveShadow geometry={frameGeometry} material={materials.Texture} />}

      <mesh geometry={panelGeometry} position={[0, screenParams.yAdjustment, screenParams.z.glow]} scale={[screenParams.scale, screenParams.scale, 1.3]} material={glowMaterial} />

      <mesh ref={screenRef} geometry={panelGeometry} position={[0, screenParams.yAdjustment, screenParams.z.main]} scale={screenParams.scale}>
        <meshBasicMaterial transparent={false} toneMapped={false}>
          <RenderTexture width={textureWidth} height={textureHeight} attach="map" anisotropy={qualitySettings.anisotropy} renderTarget={renderTarget}>
            {children}
          </RenderTexture>
        </meshBasicMaterial>
      </mesh>

      {customEffect && (
        <mesh geometry={panelGeometry} position={[0, screenParams.yAdjustment, screenParams.z.main + 0.001]} scale={screenParams.scale}>
          <primitive object={scanlineMaterial}>
            <RenderTexture width={textureWidth} height={textureHeight} attach="uniforms-tMap-value" anisotropy={qualitySettings.anisotropy} />
          </primitive>
        </mesh>
      )}

      <mesh position={[-screenParams.corner.x, screenParams.corner.topY, screenParams.z.corner]} scale={screenParams.cornerScale}>
        {cornerGeometry}
        <primitive object={cornerMaterial} />
      </mesh>
      <mesh position={[screenParams.corner.x, screenParams.corner.topY, screenParams.z.corner]} scale={screenParams.cornerScale} rotation={[0, 0, COMPUTER_CONSTANTS.HALF_PI]}>
        {cornerGeometry}
        <primitive object={cornerMaterial} />
      </mesh>
      <mesh position={[-screenParams.corner.x, screenParams.corner.bottomY, screenParams.z.corner]} scale={screenParams.cornerScale} rotation={[0, 0, -COMPUTER_CONSTANTS.HALF_PI]}>
        {cornerGeometry}
        <primitive object={cornerMaterial} />
      </mesh>
      <mesh position={[screenParams.corner.x, screenParams.corner.bottomY, screenParams.z.corner]} scale={screenParams.cornerScale} rotation={[0, 0, COMPUTER_CONSTANTS.FULL_PI]}>
        {cornerGeometry}
        <primitive object={cornerMaterial} />
      </mesh>
    </group>
  )
})

export default Screen
