# モニターのカスタマイズ検証ドキュメント

このドキュメントは、3D モニターのカスタマイズに関する検証プロセスと結果を記録するためのものです。

## 目的

以下の機能を段階的に検証します：

1. モニターのサイズ変更
2. モニターへの画像表示
3. クリックイベントの追加
4. ページ遷移機能の実装

## 1. モニターのサイズ変更

### 検証内容

- ScreenText コンポーネントの scale プロパティの調整
- アスペクト比の変更
- テキストサイズの調整

### 実装手順

1. **scale プロパティの変更**

```jsx
<ScreenText
  frame="Object_209"
  panel="Object_210"
  y={5}
  position={[-1.43, 2.5, -1.8]}
  rotation={[0, 1, 0]}
  scale={1.5} // 元のサイズから1.5倍に変更
/>
```

2. **テキストサイズの変更**

```jsx
<Text
  font="/Inter-Medium.woff"
  position={[x, y, 0]}
  ref={textRef}
  fontSize={6} // 元のサイズから変更
  letterSpacing={-0.1}
  color={!invert ? 'black' : '#35c19f'}>
  Poimandres.
</Text>
```

### 検証結果

- [ ] スケール変更でモニター全体のサイズが変更できることを確認
- [ ] テキストサイズの変更が反映されることを確認
- [ ] アスペクト比の変更が適切に反映されることを確認

## 2. モニターへの画像表示

### 検証内容

- テキストの代わりに画像を表示する
- 画像のアスペクト比とモニターの形状の調整
- 画像の解像度と表示品質

### 準備作業

1. 画像ファイルを `public/images/` ディレクトリに配置
2. @react-three/drei から `useTexture` をインポート

### 実装手順

1. **新しいコンポーネントの作成**

```jsx
import { useTexture } from '@react-three/drei'

function ScreenImage({ invert, imageUrl, ...props }) {
  const texture = useTexture(imageUrl)

  return (
    <Screen {...props}>
      <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 15]} />
      <color attach="background" args={[invert ? 'black' : '#ffffff']} />
      <mesh>
        <planeGeometry args={[16, 9]} /> {/* 16:9アスペクト比 */}
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </Screen>
  )
}
```

2. **Computers コンポーネント内で使用**

```jsx
<ScreenImage frame="Object_209" panel="Object_210" imageUrl="/images/sample.jpg" position={[-1.43, 2.5, -1.8]} rotation={[0, 1, 0]} />
```

### 検証結果

- [ ] 画像がモニターに適切に表示されることを確認
- [ ] 画像のアスペクト比が適切に維持されることを確認
- [ ] 背景色と画像の組み合わせが自然に見えることを確認

## 3. クリックイベントの追加

### 検証内容

- モニターをクリックできるようにする
- ホバー時の視覚的フィードバックを追加
- クリックイベントの伝播を管理

### 実装手順

1. **クリック可能なスクリーンコンポーネント**

```jsx
function ClickableScreen({ imageUrl, onClick, ...props }) {
  const texture = useTexture(imageUrl)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  return (
    <Screen {...props}>
      <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 15]} />
      <color attach="background" args={['#ffffff']} />
      <mesh onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial
          map={texture}
          transparent
          color={hovered ? '#dddddd' : '#ffffff'} // ホバー時に色を変更
        />
      </mesh>
    </Screen>
  )
}
```

2. **使用例**

```jsx
<ClickableScreen
  frame="Object_209"
  panel="Object_210"
  imageUrl="/images/sample.jpg"
  position={[-1.43, 2.5, -1.8]}
  rotation={[0, 1, 0]}
  onClick={() => console.log('モニターがクリックされました！')}
/>
```

### 検証結果

- [ ] モニターをホバーするとカーソルが変わることを確認
- [ ] クリック時にコンソールにログが出力されることを確認
- [ ] ホバー時の視覚的フィードバックが自然に見えることを確認

## 4. ページ遷移機能の実装

### 検証内容

- React Router を使用したページ遷移
- モニターからの遷移が自然に行われるか
- 別ページからの戻り機能

### 準備作業

1. React Router のインストール

```bash
npm install react-router-dom
```

2. ルーティング構造の設定

### 実装手順

1. **index.js の修正**

```jsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import App from './App'
import DetailPage from './DetailPage' // 新しく作成するページ

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/detail/:id" element={<DetailPage />} />
    </Routes>
  </BrowserRouter>
)
```

2. **DetailPage.js の作成**

```jsx
import { useParams, Link } from 'react-router-dom'

export default function DetailPage() {
  const { id } = useParams()

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{id}の詳細ページ</h1>
      <p>このページはモニターをクリックして遷移してきました。</p>
      <Link to="/">戻る</Link>
    </div>
  )
}
```

3. **モニターのクリックイベントの修正**

```jsx
import { useNavigate } from 'react-router-dom'

function ClickableScreenWithNavigation({ imageUrl, to, ...props }) {
  const navigate = useNavigate()
  // ...他のコード

  return (
    <Screen {...props}>
      {/* ...他のコード */}
      <mesh
        onClick={() => navigate(to)}
        // ...他のコード
      >
        {/* ...他のコード */}
      </mesh>
    </Screen>
  )
}
```

### 検証結果

- [ ] モニターをクリックすると詳細ページに遷移することを確認
- [ ] URL 中のパラメータが正しく渡されることを確認
- [ ] 「戻る」リンクで元のページに戻れることを確認

## 課題と改善点

このセクションでは検証中に発生した課題と、それに対する解決策や改善点を記録します。

1. **課題**: [未記入]
   **解決策**: [未記入]

2. **課題**: [未記入]
   **解決策**: [未記入]

## 次のステップ

- [ ] パフォーマンス最適化
- [ ] モバイル対応の検証
- [ ] 異なるモニターごとの個別設定
- [ ] アニメーションの追加
