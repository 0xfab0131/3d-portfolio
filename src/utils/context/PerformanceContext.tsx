import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PERFORMANCE_CONFIG } from '../constants/computerConstants'
import { usePerformanceMonitor, PerformanceStats } from '../hooks/usePerformanceMonitor'

// Get the return type of usePerformanceMonitor for accurate context typing
type PerformanceMonitorReturn = ReturnType<typeof usePerformanceMonitor>

// パフォーマンス最適化のためのコンテキスト (Provide accurate default values matching the type)
export const PerformanceContext = createContext<PerformanceMonitorReturn>({
  qualityLevel: 'HIGH',
  fps: 60,
  getQualitySettings: () => PERFORMANCE_CONFIG.LOD.QUALITY_LEVELS.HIGH,
  registerAnimationPhase: (id: string, priority: number) => {
    console.warn('Default registerAnimationPhase called')
  },
  unregisterAnimationPhase: (id: string) => {
    console.warn('Default unregisterAnimationPhase called')
  },
  shouldAnimateThisFrame: (id: string) => true,
  isLowPerformanceDevice: false
  // Add any other properties returned by usePerformanceMonitor if missing
})

interface PerformanceProviderProps {
  children: ReactNode
}

/**
 * パフォーマンス最適化のためのプロバイダーコンポーネント
 * シーン全体のパフォーマンス監視と最適化設定を提供
 */
export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const performance = usePerformanceMonitor()
  const { camera, clock } = useThree()

  // Web Worker 用のグローバルなパフォーマンスデータ更新 (useFrame の必要性は要検討)
  // useFrame(() => {
  //   PerformanceStats.frameCount = (performance as any).frameCount; // Need to access frameCount from performance hook
  //   PerformanceStats.fps = performance.fps;
  //   PerformanceStats.frameTime = (performance as any).frameTime; // Need to access frameTime
  //   PerformanceStats.qualityLevel = performance.qualityLevel;
  // });

  return <PerformanceContext.Provider value={performance}>{children}</PerformanceContext.Provider>
}

/**
 * パフォーマンスコンテキストを使用するためのカスタムフック
 * @returns {PerformanceMonitorReturn} パフォーマンス最適化ユーティリティと設定
 */
export const usePerformance = (): PerformanceMonitorReturn => {
  return useContext(PerformanceContext)
}
