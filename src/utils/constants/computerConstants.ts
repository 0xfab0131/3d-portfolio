import * as THREE from 'three'

// パフォーマンス最適化用の設定
export const PERFORMANCE_CONFIG = {
  // LOD (Level of Detail) 設定
  LOD: {
    DISTANCE_THRESHOLDS: [0, 5, 10], // カメラからの距離によるLODレベル変更の閾値
    QUALITY_LEVELS: {
      HIGH: {
        cornerSegments: 16,
        anisotropy: 16,
        textureSize: { width: 764, height: 400 }
      },
      MEDIUM: {
        cornerSegments: 8,
        anisotropy: 8,
        textureSize: { width: 512, height: 256 }
      },
      LOW: {
        cornerSegments: 4,
        anisotropy: 4,
        textureSize: { width: 256, height: 128 }
      }
    }
  },

  // アニメーション最適化設定
  ANIMATION: {
    // フレームスキップの制御（CPUパフォーマンスが低下した場合にスキップするフレーム数）
    FRAME_SKIP_THRESHOLD: 16.67, // 60fpsの場合の1フレームの理想時間（ミリ秒）
    UPDATE_PRIORITIES: {
      LED: 2, // 優先度中（レベル2）
      SCREEN_TEXT: 1, // 優先度高（レベル1）
      SCANLINE: 3 // 優先度低（レベル3）
    }
  },

  // メモリ管理設定
  MEMORY: {
    // 共有マテリアル/ジオメトリを使用するかどうか
    USE_SHARED_MATERIALS: true,
    // キャッシュ設定
    CACHE_SCREENS: true
  }
}

// 基本設定とコンピュータモデル関連の定数を集約
export const COMPUTER_CONSTANTS = {
  // モデル関連
  MODEL_PATH: '/computers_1-transformed.glb',
  DEFAULT_OBJECT_SCALE: 1.52,
  SMALL_OBJECT_SCALE: 0.5,

  // カラー設定
  COLORS: {
    glow: '#35c19f',
    white: '#ffffff',
    black: 'black',
    orange: 'orange',
    blue: '#3b82f6',
    purple: '#8b5cf6'
  },

  // テクスチャ設定
  TEXTURE: {
    width: PERFORMANCE_CONFIG.LOD.QUALITY_LEVELS.HIGH.textureSize.width,
    height: PERFORMANCE_CONFIG.LOD.QUALITY_LEVELS.HIGH.textureSize.height,
    anisotropy: PERFORMANCE_CONFIG.LOD.QUALITY_LEVELS.HIGH.anisotropy
  },

  // 数学定数
  HALF_PI: Math.PI / 2,
  FULL_PI: Math.PI
}

// スクリーン関連の定数
export const SCREEN_PARAMS = {
  // スクリーンのスケール係数
  screenScale: 1.3,
  // y軸位置の調整値
  yAdjustment: -0.02,
  // コーナー装飾の位置調整のためのオフセット
  cornerOffset: 0.02,
  // コーナー装飾のサイズ
  cornerScale: 0.02,
  // Z軸位置設定
  z: {
    glow: 0.48, // 輝き効果のZ位置
    main: 0.5, // メインスクリーンのZ位置
    corner: 0.51 // コーナー装飾のZ位置
  }
}

// LED位置の定義
export const LED_POSITIONS = [
  [-0.41, 1.1, -2.21],
  [0.59, 1.32, -2.22],
  [1.77, 1.91, -1.17],
  [2.44, 1.1, -0.79],
  [4.87, 3.8, -0.1],
  [1.93, 3.8, -3.69],
  [-2.35, 3.8, -3.48],
  [-4.71, 4.59, -1.81],
  [-3.03, 2.85, 1.19],
  [-1.21, 1.73, -1.49]
]

// スクリーン定義
export const SCREEN_DEFINITIONS = [
  {
    type: 'interactive',
    frame: 'Object_206',
    panel: 'Object_207',
    position: [0.27, 1.53, -2.61],
    backgroundColor: COMPUTER_CONSTANTS.COLORS.blue,
    customEffect: true
  },
  {
    type: 'text',
    frame: 'Object_209',
    panel: 'Object_210',
    y: 5,
    position: [-1.43, 2.5, -1.8],
    rotation: [0, 1, 0],
    content: 'System online.',
    customEffect: true
  },
  {
    type: 'text',
    frame: 'Object_212',
    panel: 'Object_213',
    x: -5,
    y: 5,
    position: [-2.73, 0.63, -0.52],
    rotation: [0, 1.09, 0],
    invert: true,
    content: 'Initializing...',
    customEffect: false
  },
  {
    type: 'text',
    frame: 'Object_215',
    panel: 'Object_216',
    position: [1.84, 0.38, -1.77],
    rotation: [0, -COMPUTER_CONSTANTS.FULL_PI / 9, 0],
    invert: true,
    content: 'Poimandres.',
    animated: false,
    customEffect: true
  },
  {
    type: 'text',
    frame: 'Object_218',
    panel: 'Object_219',
    x: -5,
    position: [3.11, 2.15, -0.18],
    rotation: [0, -0.79, 0],
    scale: 0.81,
    invert: true,
    content: 'Loading...',
    fontSize: 3.5,
    customEffect: true
  },
  {
    type: 'text',
    frame: 'Object_221',
    panel: 'Object_222',
    y: 5,
    position: [-3.42, 3.06, 1.3],
    rotation: [0, 1.22, 0],
    scale: 0.9,
    content: 'Ready',
    customEffect: false
  },
  {
    type: 'text',
    frame: 'Object_224',
    panel: 'Object_225',
    position: [-3.9, 4.29, -2.64],
    rotation: [0, 0.54, 0],
    invert: true,
    content: 'System check',
    fontSize: 3,
    customEffect: true
  },
  {
    type: 'text',
    frame: 'Object_227',
    panel: 'Object_228',
    position: [0.96, 4.28, -4.2],
    rotation: [0, -0.65, 0],
    content: 'Standby',
    customEffect: false
  },
  {
    type: 'text',
    frame: 'Object_230',
    panel: 'Object_231',
    position: [4.68, 4.29, -1.56],
    rotation: [0, -COMPUTER_CONSTANTS.FULL_PI / 3, 0],
    content: 'Processing',
    animated: true,
    customEffect: true
  }
]

// 静的メッシュのプロパティ定義
export const STATIC_MESHES = [
  { id: 'Object_24.geometry', position: [-2.42, 0.94, -2.25], rotation: [0, 0.14, COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
  { id: 'Object_140.geometry', position: [5.53, 2.18, 0.17], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_144.geometry', position: [5.74, 1.57, 0.05], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_148.geometry', position: [5.65, 2.79, 0.11], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_152.geometry', position: [5.46, 3.41, 0.26], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_156.geometry', position: [4.86, 0, -2.54], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_160.geometry', position: [5.06, 0, -1.6], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_164.geometry', position: [2.59, 0, -4], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_168.geometry', position: [1.66, 0, -4.54], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_170.geometry', position: [0.59, 0, -4.7], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_176.geometry', position: [1.33, 1.83, -3.82], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_180.geometry', position: [4.86, 2.14, -2.54], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_184.geometry', position: [5.06, 2.14, -1.6], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_188.geometry', position: [2.59, 2.14, -4], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_192.geometry', position: [1.66, 2.14, -4.54], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_194.geometry', position: [0.59, 2.14, -4.7], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_200.geometry', position: [0.75, 3.98, -4.66], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_18.geometry', position: [-0.19, 0, -2.96], rotation: [0, -0.06, 0], scale: COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
  { id: 'Object_142.geometry', position: [5.79, 0.94, 0.18], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_146.geometry', position: [5.43, 0.32, 0.37], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_150.geometry', position: [5.56, 4.03, 0.35], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_154.geometry', position: [5.87, 4.66, 0.08], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_158.geometry', position: [5.53, 0, -0.85], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_162.geometry', position: [4.05, 0, -2.96], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_166.geometry', position: [3.29, 0, -3.1], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_190.geometry', position: [3.3, 2.14, -3.31], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { id: 'Object_204.geometry', position: [3.2, 4.29, -3.09], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0.56, 0], scale: -1 }
]

// Object32のインスタンス位置
export const OBJECT32_POSITIONS = [
  { position: [3.77, 1.84, -2.98], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 },
  { position: [3.77, 3.98, -2.98], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 0, 0], scale: -1 }
]

// コンピュータオブジェクト定義
export const COMPUTER_OBJECTS = {
  basic: [
    { position: [0.16, 0.79, -1.97], rotation: [-0.54, 0.93, -1.12], scale: COMPUTER_CONSTANTS.SMALL_OBJECT_SCALE },
    { position: [-2.79, 0.27, 1.82], rotation: [-1.44, 1.22, 1.43], scale: COMPUTER_CONSTANTS.SMALL_OBJECT_SCALE },
    { position: [-5.6, 4.62, -0.03], rotation: [-1.96, 0.16, 1.2], scale: COMPUTER_CONSTANTS.SMALL_OBJECT_SCALE },
    { position: [2.62, 1.98, -2.47], rotation: [-0.42, -0.7, -1.85], scale: COMPUTER_CONSTANTS.SMALL_OBJECT_SCALE },
    { position: [4.6, 3.46, 1.19], rotation: [-1.24, -0.72, 0.48], scale: COMPUTER_CONSTANTS.SMALL_OBJECT_SCALE }
  ],

  type1: [
    { position: [0.63, 0, -3], rotation: [0, 0.17, 0] },
    { position: [-2.36, 0.32, -2.02], rotation: [0, 0.53, -COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-3.53, 0, 0.59], rotation: [COMPUTER_CONSTANTS.FULL_PI, -1.09, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-3.53, 1.53, 0.59], rotation: [0, 0.91, 0] },
    { position: [3.42, 0, 0], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 1.13, -COMPUTER_CONSTANTS.FULL_PI] },
    { position: [4.09, 2.18, 2.41], rotation: [0, -1.55, 1.57] },
    { position: [-3.69, 0, 2.59], rotation: [0, -1.57, 0] },
    { position: [-5.36, 2.18, 0.81], rotation: [0, 0.77, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-5.47, 2.79, 0.74], rotation: [COMPUTER_CONSTANTS.FULL_PI, -1.16, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-5.28, 0, -2.33], rotation: [0, 0.75, 0] },
    { position: [-5.49, 0, -1.38], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.99, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-3.01, 0, -3.79], rotation: [0, 0.6, 0] },
    { position: [-2.08, 0, -4.32], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.6, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-1.02, 0, -4.49], rotation: [0, 0.31, 0] },
    { position: [-5.31, 1.83, -1.41], rotation: [0, 1.06, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-4.18, 1.83, -3.06], rotation: [-COMPUTER_CONSTANTS.FULL_PI, -0.46, -COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-1.76, 1.83, -3.6], rotation: [0, -1.16, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-0.25, 1.83, -5.54], rotation: [0, 1.55, 1.57] },
    { position: [-5.28, 2.14, -2.33], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.75, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-5.49, 2.14, -1.38], rotation: [0, 0.99, 0] },
    { position: [-3.01, 2.14, -3.79], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.6, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-2.08, 2.14, -4.32], rotation: [0, 0.6, 0] },
    { position: [-1.02, 2.14, -4.49], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.31, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-5.31, 3.98, -1.41], rotation: [0, 1.06, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-4.18, 3.98, -3.06], rotation: [-COMPUTER_CONSTANTS.FULL_PI, -0.46, -COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-1.17, 3.98, -4.45], rotation: [0, 0.17, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-0.94, 3.98, -4.66], rotation: [COMPUTER_CONSTANTS.FULL_PI, 0.02, -COMPUTER_CONSTANTS.HALF_PI] }
  ],

  type3: [
    { position: [4.31, 1.57, 2.34], rotation: [0, -1.15, -COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [-3.79, 0, 1.66], rotation: [COMPUTER_CONSTANTS.FULL_PI, -1.39, 0], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [-3.79, 1.53, 1.66], rotation: [0, 1.22, -COMPUTER_CONSTANTS.FULL_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [-5.56, 1.57, 0.69], rotation: [0, 1.17, -COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [-5.29, 3.41, 0.89], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.76, -COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE }
  ],

  type23: [
    { position: [-2.29, 1.56, -2.26], rotation: [0, -0.005, -COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-2.9, 0.3, -1.47], rotation: [COMPUTER_CONSTANTS.FULL_PI, -1.35, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [3.22, 0, -0.8], rotation: [0, -1.32, 0] },
    { position: [3.53, 1.83, 0.44], rotation: [-COMPUTER_CONSTANTS.FULL_PI, 1.32, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [4.26, 0.94, 2.22], rotation: [0, -1, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-5.61, 0.94, 0.82], rotation: [0, 1.32, 1.57] },
    { position: [-5.39, 4.03, 0.99], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.61, COMPUTER_CONSTANTS.HALF_PI] },
    { position: [-5.95, 0, -0.64], rotation: [0, 0.95, 0] },
    { position: [-4.48, 0, -2.75], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.57, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-3.72, 0, -2.89], rotation: [0, 0.64, 0] },
    { position: [-0.08, 0, -5.03], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.04, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-5.95, 2.14, -0.64], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.95, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-4.48, 2.14, -2.75], rotation: [0, 0.57, 0] },
    { position: [-3.73, 2.14, -3.1], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.64, COMPUTER_CONSTANTS.FULL_PI] },
    { position: [-0.08, 2.14, -5.03], rotation: [0, 0.04, 0] }
  ],

  type24: [
    { position: [-2.19, 2.19, -1.87], rotation: [0, 0.51, COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [3.87, 0.32, 2.35], rotation: [0, -1.53, -1.57], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [-5.26, 0.32, 1.01], rotation: [0, 0.79, -COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [-5.7, 4.66, 0.72], rotation: [COMPUTER_CONSTANTS.FULL_PI, -1.13, -COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [-4.19, 1.84, -2.77], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.66, -COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE },
    { position: [-4.19, 3.98, -2.77], rotation: [COMPUTER_CONSTANTS.FULL_PI, -0.66, -COMPUTER_CONSTANTS.HALF_PI], scale: -COMPUTER_CONSTANTS.DEFAULT_OBJECT_SCALE }
  ],

  type36: [
    { position: [0.35, 2.35, -3.34], rotation: [-0.26, 0, 0] },
    { position: [0.18, 2.8, -2.85], rotation: [0.09, 0.15, -0.005] },
    { position: [1.89, 0, -1.94], rotation: [0, -0.44, 0], scale: [1.5, 1, 1.5] },
    { position: [1.86, 1.61, -1.81], rotation: [0, -COMPUTER_CONSTANTS.FULL_PI / 3, 0] },
    { position: [3.95, 2.49, 1.61], rotation: [0, -COMPUTER_CONSTANTS.FULL_PI / 3, 0] },
    { position: [-1.1, 4.29, -4.43], rotation: [0, 0.36, 0] },
    { position: [-5.25, 4.29, -1.47], rotation: [0, 1.25, 0] }
  ]
}

// カラー設定のエクスポート
export const COLORS = COMPUTER_CONSTANTS.COLORS

// モデルパスのエクスポート
export const MODEL_PATH = COMPUTER_CONSTANTS.MODEL_PATH

// 基本的な設定
THREE.ColorManagement.legacyMode = false
