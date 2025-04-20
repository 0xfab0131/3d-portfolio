import React, { useMemo, Suspense } from 'react'
import * as THREE from 'three'

import { SCREEN_DEFINITIONS } from '../../utils/constants/computerConstants'
import ScreenText from './ScreenText'
import ScreenInteractive from './ScreenInteractive'
import { InstanceGroup } from './Instances'

interface ScreenGroupProps {
  instances?: InstanceGroup
}

/**
 * スクリーングループコンポーネント - 複数のスクリーンをまとめて管理
 * @param {ScreenGroupProps} props - プロパティ (型定義を追加)
 */
const ScreenGroup: React.FC<ScreenGroupProps> = React.memo(({ instances }) => {
  // メモ化してパフォーマンスを向上
  const screenComponents = useMemo(
    () => {
      // instancesが未定義の場合、または必要なスクリーンコンポーネントがない場合は、
      // 何もレンダリングしないか、ローディング表示などを返すことも検討。
      // if (!instances) return null;

      return SCREEN_DEFINITIONS.map((def, i) => {
        if (def.type === 'interactive') {
          return <ScreenInteractive key={`screen-${i}`} {...def} />
        } else if (def.type === 'text') {
          return (
            <ScreenText
              key={`screen-${i}`}
              frame={def.frame}
              panel={def.panel}
              position={def.position as THREE.Vector3Tuple} // Type assertion
              rotation={def.rotation as THREE.EulerTuple} // Type assertion
              scale={def.scale || 1} // Default scale
              content={def.content}
              animated={def.animated}
              customEffect={def.customEffect}
            />
          )
        }
        // Add other screen types (e.g., image, video) here if needed
        return null
      }).filter(Boolean)
    },
    [
      /* instances */
    ]
  ) // Remove instances from dependency array if not used directly

  return (
    <Suspense fallback={null}>
      {' '}
      {/* Add Suspense for lazy loaded components if any */}
      {screenComponents}
    </Suspense>
  )
})

export default ScreenGroup
