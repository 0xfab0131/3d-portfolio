import * as THREE from 'three'

/**
 * スキャンライン効果のシェーダーマテリアルを作成
 * @param {Object} options - シェーダーオプション
 * @returns {THREE.ShaderMaterial} シェーダーマテリアル
 */
export const createScanlineMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      tMap: { value: null },
      uTime: { value: 0 },
      uIntensity: { value: 0.15 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tMap;
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      
      void main() {
        vec4 color = texture2D(tMap, vUv);
        
        // スキャンライン効果
        float scanline = sin(vUv.y * 100.0 + uTime) * 0.04 * uIntensity;
        
        // ブラウン管風のビネット効果
        float vignetteAmount = 1.0 - length(vUv - 0.5) * 0.7;
        
        // 微小なノイズ
        float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233) * uTime * 0.1)) * 43758.5453) * 0.03 * uIntensity;
        
        gl_FragColor = vec4(color.rgb * (1.0 + scanline + noise) * vignetteAmount, color.a);
      }
    `,
    transparent: true
  })
}

/**
 * スキャンラインシェーダーのアニメーションを更新する関数
 * @param {THREE.ShaderMaterial} material - 更新するシェーダーマテリアル
 * @param {number} time - 現在の時間
 */
export const updateScanlineAnimation = (material, time) => {
  if (material && material.uniforms) {
    material.uniforms.uTime.value = time
  }
}
