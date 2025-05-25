# タイピングゲーム 製品版スタイリングガイド

## ローマ字表示のスタイル設計とパフォーマンス最適化

このプロジェクトでは、タイピングゲーム製品版のローマ字表示を最高のユーザー体験で提供するため、パフォーマンスとアクセシビリティを重視した設計を採用しています。

## 設計原則

### 1. 関心の分離 (Separation of Concerns)

異なる機能のスタイルは個別のファイルに分離することで保守性と拡張性を高めています：

- **`typing-theme.css`**: タイピングゲーム専用のテーマ変数（色、サイズ、エフェクト）
- **`TypingModule.module.css`**: タイピング文字表示に関する最適化されたスタイル定義
- **`theme.css`**: アプリケーション全体のテーマ変数、typing-theme.cssをインポート

### 2. パフォーマンス最適化アーキテクチャ

製品版向けにパフォーマンスを最適化したCSSアーキテクチャを採用しています：

```
.typingArea (Block) - コンテナ要素
├── will-change, contain: content でGPUアクセラレーション
└── .typingChar (Element) - 個々の文字要素
    ├── .completed (Modifier) - 入力済み状態（高速トランジション）
    ├── .current (Modifier) - 入力中状態（最適化されたアニメーション）
    ├── .pending (Modifier) - 未入力状態（静的表示）
    └── .error (Modifier) - エラー状態（効率的なアニメーション）
```

### 3. アクセシビリティとユーザー体験の強化

製品版としての品質を確保するため、アクセシビリティとユーザー体験を重視しています：

- **明確なデータ属性**: 状態管理とデバッグを容易にするdata-*属性
- **ARIAサポート**: スクリーンリーダー対応のaria-*属性
- **レスポンシブ対応**: モバイルからデスクトップまでシームレスに動作
- **パフォーマンス指標**: アニメーションの最適化と効率的なレンダリング

## ファイル構成と役割

### タイピングテーマ (`src/styles/typing-theme.css`)

製品版タイピングゲーム用の変数を集約し、一貫したビジュアルスタイルを提供します。

```css
:root {
  /* カラーパレット - 視認性とアクセシビリティを考慮 */
  --typing-typed-color: #7cffcb;
  --typing-untyped-color: rgba(170, 170, 170, 0.7);
  --typing-error-color: #ff5252;
  
  /* アニメーション - 流動的で自然な動きを実現 */
  --typing-animation-duration: 1s;
  --typing-animation-timing: cubic-bezier(0.4, 0.0, 0.2, 1);
  
  /* その他の最適化されたタイピング専用変数 */
}
```

### タイピングモジュール (`src/styles/TypingModule.module.css`)

パフォーマンスとユーザー体験を最大化する最適化されたスタイル定義です。

```css
.typingArea {
  /* GPUアクセラレーションの活用 */
  will-change: transform;
  contain: content;
  
  /* その他の最適化されたスタイル */
}

.typingChar { /* 最適化された文字スタイル */ }
.current { 
  /* パフォーマンスを考慮したアニメーション */
  animation: typingCurrentChar var(--typing-animation-duration) var(--typing-animation-timing) infinite;
}
/* その他の状態別スタイル */
```

### コンポーネント実装 (`src/components/TypingArea.tsx`)

製品版向けに最適化されたコンポーネントは、パフォーマンスとアクセシビリティを両立します。

```tsx
// 効率的なメモ化によるレンダリング最適化
const allChars = useMemo(() => /* 文字データの計算 */, [dependencies]);

return (
  <div 
    className={styles.typingArea}
    aria-live="polite"
    aria-description={`進捗: ${progress}%`}
  >
    {allChars.map(({ char, kanaIndex, charIndex }, idx) => (
      <span
        key={idx}
        className={`${styles.typingChar} ${stateClass}`}
        aria-current={isCurrent ? 'true' : undefined}
        aria-label={`${char} (${stateText})`}
        data-state={isCurrent ? 'current' : isCompleted ? 'completed' : 'pending'}
      >
        {char}
      </span>
    ))}
  </div>
);
```

## 製品版メンテナンスガイドライン

### スタイルの変更方法

1. **テーマの色変更**: `typing-theme.css`の変数を編集（全体的な外観変更）
2. **文字の表示スタイル変更**: `TypingModule.module.css`の対応するセレクタを編集（個別スタイル変更）
3. **状態の追加/変更**: `TypingArea.tsx`のロジックと対応するCSSを更新（新機能追加時）

### パフォーマンス最適化のポイント

1. **GPUアクセラレーション**: `will-change`と`transform`を活用し、アニメーションを滑らかに
2. **メモ化**: `useMemo`を使用して不必要な再計算を防止
3. **効率的なセレクタ**: セレクタの詳細度を最適化し、レンダリングを高速化
4. **コンテナ最適化**: `contain: content`を使用して再レイアウト範囲を制限

### プロ品質テスト方法

実際のリリース前に以下の項目をテストしてください：

1. **視覚的一貫性**: 様々なデバイスでのレンダリング確認
   - 高解像度ディスプレイ（4K, Retina）
   - 標準的なデスクトップ / ラップトップ
   - タブレット / スマートフォン（様々な画面サイズ）

2. **パフォーマンス検証**:
   - Chrome DevToolsのPerformanceパネルで再レンダリングを分析
   - 高速タイピング時のフレームレート低下がないか確認
   - メモリリークの検証（長時間使用テスト）

3. **アクセシビリティ確認**:
   - スクリーンリーダーでの動作確認
   - キーボードナビゲーション
   - 色のコントラスト比

4. **エッジケース**:
   - 非常に長いテキスト入力時の挙動
   - 特殊文字を含むテキストの表示
   - 高負荷時のレスポンシブネス

このガイドラインを遵守することで、製品版として最高品質のタイピングゲーム体験を提供できます。
