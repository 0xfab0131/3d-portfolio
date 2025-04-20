'use client' // This component uses hooks that only work in the client

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, MeshReflectorMaterial, BakeShadows } from '@react-three/drei'
// Restore postprocessing imports using the original structure
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import { easing } from 'maath'
import { suspend } from 'suspend-react' // Restore import
import Computers from '../components/computers/Computers'
import Instances from '../components/computers/Instances'
import * as THREE from 'three' // Import THREE if needed directly, though maybe not
import React, { JSX } from 'react' // Import React explicitly and JSX for Bun props type

// Restore dynamic import for the model
const suzi = import('@pmndrs/assets/models/bunny.glb')

// Define types for props if necessary, for now using React.FC
const App: React.FC = () => {
  return (
    // Make sure eventSource is correctly handled in Next.js
    // It might not be needed or needs a different approach (e.g., using refs)
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [-1.5, 1, 5.5], fov: 45, near: 1, far: 20 }}
      // eventSource={document.getElementById('root')} // Likely remove or adapt this
      eventPrefix="client"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} // Ensure canvas fills the page
    >
      {/* Lights */}
      <color attach="background" args={['black']} />
      <hemisphereLight intensity={0.15} groundColor="black" />
      <spotLight decay={0} position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
      {/* Main Scene */}
      <group position={[0, -1, 0]}>
        {' '}
        {/* Adjusted position slightly based on CRA setup? */}
        {/* Instanced models */}
        <Instances>
          <Computers scale={0.5} />
        </Instances>
        {/* Reflective floor */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 30]}
            resolution={2048}
            mixBlur={1}
            mixStrength={180} // Increased strength from original?
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#202020"
            metalness={0.8}
          />
        </mesh>
        {/* Restore Bun and point light */}
        <Bun scale={0.4} position={[0, 0.3, 0.5]} rotation={[0, -Math.PI * 0.85, 0]} />
        <pointLight distance={1.5} intensity={1} position={[-0.15, 0.7, 0]} color="orange" />
      </group>
      {/* Restore Postprocessing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={5} />
        <DepthOfField target={[0, 0, 13]} focalLength={0.3} bokehScale={15} height={700} />
      </EffectComposer>
      {/* Camera movement rig */}
      <CameraRig />
      {/* Helper for baking shadows */}
      <BakeShadows />
    </Canvas>
  )
}

// Restore original Bun component implementation using suspend
function Bun(props: JSX.IntrinsicElements['mesh']) {
  // Use suspend with the dynamic import promise
  // Need to cast the result of suspend or adjust useGLTF typing if possible
  // Keep the 'as any' casts for now to check if the unknown error persists
  const { nodes } = useGLTF(suspend(suzi).default as any) as any

  return (
    // Add optional chaining for safety
    nodes?.mesh ? (
      <mesh receiveShadow castShadow geometry={(nodes.mesh as THREE.Mesh).geometry} {...props}>
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>
    ) : null
  )
}

// Define CameraRig component type
const CameraRig: React.FC = () => {
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [-1 + (state.pointer.x * state.viewport.width) / 3, (1 + state.pointer.y) / 2, 5.5], 0.5, delta)
    state.camera.lookAt(0, 0, 0)
  })
  return null // CameraRig doesn't render anything itself
}

export default App
