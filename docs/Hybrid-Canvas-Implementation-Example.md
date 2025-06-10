# ハイブリッドCanvas実装例

## 🎯 実装コンセプト

**重要な文字表示部分のみCanvas、UIはReact/DOM**

## 🔧 実装案

### 1. ハイブリッドコンポーネント設計

```typescript
// HybridTypingGame.tsx
import React, { useRef, useEffect } from 'react';

interface HybridTypingGameProps {
  currentWord: TypingWord;
  onWordComplete: (score: PerWordScoreLog) => void;
}

const HybridTypingGame: React.FC<HybridTypingGameProps> = ({
  currentWord,
  onWordComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasEngine = useRef<CanvasTypingEngine | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasEngine.current = new CanvasTypingEngine(canvasRef.current);
      canvasEngine.current.setWord(currentWord);
    }
  }, [currentWord]);

  return (
    <div className={styles.hybridGameScreen}>
      {/* DOM部分：通常のReactコンポーネント */}
      <Header />
      
      <div className={styles.gameArea}>
        {/* DOM: 日本語表示 */}
        <div className={styles.japaneseText}>
          {currentWord.japanese}
        </div>
        
        {/* Canvas: 高速レスポンス必要部分 */}
        <canvas 
          ref={canvasRef}
          className={styles.typingCanvas}
          width={800}
          height={200}
        />
      </div>
      
      {/* DOM部分：ゲームコントロール */}
      <GameControls />
    </div>
  );
};
```

### 2. Canvas専用タイピングエンジン

```typescript
// CanvasTypingEngine.ts
class CanvasTypingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private chars: CanvasTypingChar[] = [];
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupKeyListener();
  }
  
  setWord(word: TypingWord) {
    this.chars = this.convertToCanvasChars(word.hiragana);
    this.render();
  }
  
  private setupKeyListener() {
    window.addEventListener('keydown', (e) => {
      this.processKey(e.key);
      this.render(); // 即座に再描画
    });
  }
  
  private render() {
    // 🚀 超高速描画
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    let x = 50;
    this.chars.forEach((char) => {
      // 状態に応じた色分け
      this.ctx.fillStyle = char.getColor();
      this.ctx.font = '24px monospace';
      this.ctx.fillText(char.display, x, 100);
      x += 30;
    });
  }
}

class CanvasTypingChar {
  constructor(
    public display: string,
    public patterns: string[],
    private state: 'inactive' | 'active' | 'completed' = 'inactive'
  ) {}
  
  getColor(): string {
    switch (this.state) {
      case 'active': return '#ffeb3b';
      case 'completed': return '#87ceeb';
      default: return '#999';
    }
  }
  
  type(key: string): boolean {
    // typingmania-ref流の高速処理
    return this.processInput(key);
  }
}
```

### 3. メリット・デメリット

#### ✅ メリット
- **既存のReactコンポーネント活用**: Header、Footer、設定画面など
- **開発効率**: UI部分は既存のCSS/Reactで実装
- **段階的移行**: 重要部分から徐々にCanvas化
- **メンテナンス性**: DOMとCanvasの責任分離

#### ❌ デメリット
- **複雑性**: 2つのレンダリングシステム管理
- **同期問題**: DOM状態とCanvas状態の同期
- **限定的効果**: 一部のみの高速化

## 🎮 純Canvas実装との比較

### ハイブリッド（推奨）
```typescript
// 必要な部分のみCanvas
<div>
  <ReactHeader />           // DOM: 簡単
  <CanvasTypingArea />      // Canvas: 高速
  <ReactControls />         // DOM: 簡単
</div>
```

### 純Canvas
```typescript
// 全てCanvas（typingmania-ref方式）
class FullCanvasGame {
  drawHeader() { /* Canvas APIで描画 */ }
  drawTypingArea() { /* Canvas APIで描画 */ }
  drawControls() { /* Canvas APIで描画 */ }
  drawButton() { /* Canvas APIで描画 */ }
  handleClick() { /* 座標計算で判定 */ }
}
```

## 🚀 推奨実装ステップ

### Phase 1: 最小限Canvas導入
1. ローマ字表示部分のみCanvas化
2. 既存DOMコンポーネントと併用
3. パフォーマンス測定

### Phase 2: 段階的拡張
1. ひらがな表示もCanvas化
2. エフェクト追加
3. 最適化継続

### Phase 3: 必要に応じて拡張
1. より多くの部分をCanvas化
2. または現状維持（十分高品質）

この方式なら、**開発効率を保ちながら重要部分の反応速度を向上**できます。
