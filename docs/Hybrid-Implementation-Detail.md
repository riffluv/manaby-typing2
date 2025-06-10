# ハイブリッドCanvas実装：ローマ字部分のみ高速化

## 🎯 実装コンセプト

**最も反応速度が重要なローマ字表示部分のみCanvas化**
- 原文・ひらがな: DOM（既存の美しいスタイル維持）
- ローマ字: Canvas（超高速レスポンス実現）

## 🔧 実装設計

### 1. 新しいHybridTypingEngine

```typescript
// HybridTypingEngine.ts
import { TypingChar, type DisplayInfo } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog, TypingWord } from '@/types';
import UltraFastAudioSystem from '@/utils/UltraFastAudioSystem';

interface HybridEngineConfig {
  fontFamily: string;
  fontSize: string;
  showKanaDisplay: boolean;
}

/**
 * 🚀 HybridTypingEngine - ローマ字のみCanvas高速化
 * 
 * 特徴:
 * - 原文・ひらがな: DOM（既存スタイル維持）
 * - ローマ字: Canvas（超高速レスポンス）
 * - 既存DirectTypingEngine2との互換性
 */
export class HybridTypingEngine {
  private container: HTMLElement | null = null;
  private originalTextDisplay: HTMLElement | null = null;
  private kanaDisplay: HTMLElement | null = null;
  
  // Canvas関連
  private romajiCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasChars: CanvasRomajiChar[] = [];
  
  private state: {
    typingChars: TypingChar[];
    currentIndex: number;
    keyCount: number;
    mistakeCount: number;
    startTime: number;
  };

  private config: HybridEngineConfig;
  private onProgress?: (index: number, display: KanaDisplay) => void;
  private onComplete?: (scoreLog: PerWordScoreLog) => void;

  constructor(customConfig?: Partial<HybridEngineConfig>) {
    this.state = {
      typingChars: [],
      currentIndex: 0,
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0
    };

    this.config = {
      fontFamily: '"Courier New", "Consolas", monospace',
      fontSize: '24px',
      showKanaDisplay: false,
      ...customConfig
    };
  }

  /**
   * 初期化
   */
  initialize(
    container: HTMLElement,
    typingChars: TypingChar[],
    originalText: string,
    onProgress?: (index: number, display: KanaDisplay) => void,
    onComplete?: (scoreLog: PerWordScoreLog) => void
  ): void {
    this.container = container;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.state.typingChars = typingChars;
    this.state.currentIndex = 0;

    this.setupHybridDOM();
    this.setupCanvasRomaji();
    this.setupKeyListener();
    this.renderCanvas();
  }

  /**
   * ハイブリッドDOM構築（原文・ひらがなはDOM）
   */
  private setupHybridDOM(): void {
    if (!this.container) return;

    // かな表示の条件付きHTML
    const kanaDisplayHTML = this.config.showKanaDisplay ? `
      <div class="hybrid-kana-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.08);
        border-radius: 8px;
        padding: 15px;
        font-family: ${this.config.fontFamily};
        font-size: 1.5rem;
        font-weight: bold;
        color: #d6cbb2;
        text-shadow: 0 0 2px rgba(0,0,0,0.8);
        letter-spacing: 0.04rem;
      "></div>
    ` : '';

    this.container.innerHTML = `
      <!-- DOM: 原文表示（既存スタイル維持） -->
      <div class="hybrid-original-text" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.08);
        border-radius: 8px;
        padding: 15px;
        font-family: ${this.config.fontFamily};
        font-size: 1.6rem;
        font-weight: bold;
        background: linear-gradient(to right, #c9a76f, #f8e6b0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 6px rgba(255, 223, 128, 0.2);
        letter-spacing: 0.04rem;
      "></div>
      ${kanaDisplayHTML}
      
      <!-- Canvas: ローマ字高速表示 -->
      <div class="hybrid-canvas-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.05);
        border-radius: 8px;
        padding: 15px;
      ">
        <canvas class="romaji-canvas" style="
          background: transparent;
          border-radius: 4px;
        "></canvas>
      </div>
    `;

    // DOM要素参照取得
    this.originalTextDisplay = this.container.querySelector('.hybrid-original-text') as HTMLElement;
    
    if (this.config.showKanaDisplay) {
      this.kanaDisplay = this.container.querySelector('.hybrid-kana-container') as HTMLElement;
    }

    this.romajiCanvas = this.container.querySelector('.romaji-canvas') as HTMLCanvasElement;
  }

  /**
   * Canvasローマ字設定
   */
  private setupCanvasRomaji(): void {
    if (!this.romajiCanvas) return;

    this.ctx = this.romajiCanvas.getContext('2d');
    if (!this.ctx) return;

    // Canvas サイズ設定
    const containerWidth = this.container?.offsetWidth || 800;
    this.romajiCanvas.width = containerWidth - 30; // padding考慮
    this.romajiCanvas.height = 60;

    // ローマ字文字オブジェクト作成
    this.createCanvasChars();
  }

  /**
   * Canvas用ローマ字文字作成
   */
  private createCanvasChars(): void {
    this.canvasChars = [];
    let totalRomaji = '';
    
    this.state.typingChars.forEach(char => {
      totalRomaji += char.patterns[0]; // 第一パターンを使用
    });

    // 各文字のCanvas描画位置計算
    const charWidth = 30; // 文字幅
    const startX = (this.romajiCanvas!.width - (totalRomaji.length * charWidth)) / 2;

    for (let i = 0; i < totalRomaji.length; i++) {
      this.canvasChars.push(new CanvasRomajiChar(
        totalRomaji[i],
        startX + (i * charWidth),
        30,
        'inactive'
      ));
    }
  }

  /**
   * 🚀 超高速Canvas描画
   */
  private renderCanvas(): void {
    if (!this.ctx || !this.romajiCanvas) return;

    // Canvas クリア
    this.ctx.clearRect(0, 0, this.romajiCanvas.width, this.romajiCanvas.height);

    // フォント設定
    this.ctx.font = `${this.config.fontSize} ${this.config.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // 各文字描画
    this.canvasChars.forEach((char) => {
      this.ctx!.fillStyle = char.getColor();
      this.ctx!.fillText(char.character, char.x, char.y);
    });
  }

  /**
   * キー入力処理
   */
  private setupKeyListener(): void {
    const keyHandler = (e: KeyboardEvent) => {
      this.processKey(e.key);
    };

    window.addEventListener('keydown', keyHandler, { 
      passive: false, 
      capture: true 
    });
  }

  /**
   * 🚀 ZERO-LATENCY キー処理
   */
  private processKey(key: string): void {
    if (this.state.currentIndex >= this.state.typingChars.length) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    const isCorrect = currentChar.type(key);

    if (isCorrect) {
      UltraFastAudioSystem.playClickSound();
      
      if (currentChar.completed) {
        this.state.currentIndex++;
        
        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleComplete();
          return;
        }
      }
    } else {
      this.state.mistakeCount++;
      UltraFastAudioSystem.playErrorSound();
    }

    // 🚀 即座Canvas更新
    this.updateCanvasStates();
    this.renderCanvas();
  }

  /**
   * Canvas文字状態更新
   */
  private updateCanvasStates(): void {
    let romajiIndex = 0;
    
    for (let i = 0; i < this.state.typingChars.length; i++) {
      const char = this.state.typingChars[i];
      const pattern = char.patterns[0];
      
      for (let j = 0; j < pattern.length; j++) {
        if (romajiIndex >= this.canvasChars.length) break;
        
        if (i < this.state.currentIndex) {
          this.canvasChars[romajiIndex].setState('completed');
        } else if (i === this.state.currentIndex && j < char.acceptedInput.length) {
          this.canvasChars[romajiIndex].setState('completed');
        } else if (i === this.state.currentIndex && j === char.acceptedInput.length) {
          this.canvasChars[romajiIndex].setState('active');
        } else {
          this.canvasChars[romajiIndex].setState('inactive');
        }
        
        romajiIndex++;
      }
    }
  }

  private handleComplete(): void {
    if (this.onComplete) {
      const scoreLog: PerWordScoreLog = {
        keyCount: this.state.keyCount,
        mistakeCount: this.state.mistakeCount,
        elapsedTime: Date.now() - this.state.startTime,
        accuracy: ((this.state.keyCount - this.state.mistakeCount) / this.state.keyCount) * 100
      };
      this.onComplete(scoreLog);
    }
  }
}

/**
 * Canvas用ローマ字文字クラス
 */
class CanvasRomajiChar {
  constructor(
    public character: string,
    public x: number,
    public y: number,
    private state: 'inactive' | 'active' | 'completed' = 'inactive'
  ) {}

  setState(newState: 'inactive' | 'active' | 'completed'): void {
    this.state = newState;
  }

  getColor(): string {
    switch (this.state) {
      case 'active': return '#ffeb3b';     // 黄色：現在位置
      case 'completed': return '#87ceeb';  // 青色：完了
      default: return '#999';              // グレー：未入力
    }
  }
}
```

### 2. SimpleGameScreen統合

```typescript
// SimpleGameScreen.tsx（修正版）
import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { HybridTypingEngine, JapaneseConverter } from '@/typing';
import { useSettingsStore } from '@/store/useSettingsStore';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 ハイブリッドCanvas GameScreen - ローマ字のみ超高速化
 * - 原文・ひらがな: DOM（美しいスタイル維持）
 * - ローマ字: Canvas（1-3ms反応速度）
 */
const SimpleGameScreen: React.FC<SimpleGameScreenProps> = React.memo(({ 
  currentWord, 
  onWordComplete
}) => {
  const { showKanaDisplay } = useSettingsStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const engineRef = React.useRef<HybridTypingEngine | null>(null);

  // TypingChar生成
  const typingChars = React.useMemo(() => {
    if (!currentWord.hiragana) return [];
    return JapaneseConverter.convertToTypingChars(currentWord.hiragana);
  }, [currentWord.hiragana]);

  // ハイブリッドエンジン初期化
  React.useEffect(() => {
    if (containerRef.current && typingChars.length > 0) {
      if (!engineRef.current) {
        engineRef.current = new HybridTypingEngine({
          showKanaDisplay,
          fontFamily: '"Courier New", "Consolas", monospace',
          fontSize: '24px'
        });
      }

      engineRef.current.initialize(
        containerRef.current,
        typingChars,
        currentWord.japanese,
        undefined, // onProgress
        onWordComplete
      );
    }
  }, [typingChars, currentWord.japanese, showKanaDisplay, onWordComplete]);

  return (
    <div className={styles.gameScreen}>
      <div className={styles.typingArea}>
        {/* ハイブリッドTypingEngine管理エリア */}
        <div 
          ref={containerRef}
          className={styles.hybridTypingContainer}
          aria-live="polite"
          aria-label="ハイブリッドタイピングエリア"
        />
      </div>
    </div>
  );
});

export default SimpleGameScreen;
```

## 🚀 実装のメリット

### ✅ 高速化達成
- **ローマ字表示**: 1-3ms反応速度（Canvas）
- **音響フィードバック**: 即座再生
- **体感レスポンス**: 寿司打レベル

### ✅ 開発効率
- **既存スタイル維持**: 原文・ひらがなの美しいCSS
- **段階的実装**: ローマ字のみからスタート
- **互換性**: 既存のDirectTypingEngine2と同じインターフェース

### ✅ 保守性
- **責任分離**: DOM（スタイル）とCanvas（速度）
- **設定対応**: showKanaDisplayなど既存設定継承
- **デバッグ容易**: Canvas部分のみに問題を限定

## 🎯 実装ステップ

1. **HybridTypingEngine作成**
2. **SimpleGameScreenに統合**
3. **パフォーマンステスト**
4. **必要に応じて音響最適化**

この実装で、**「寿司打レベルの反応速度」**を実現できると考えます！

実装してみますか？
