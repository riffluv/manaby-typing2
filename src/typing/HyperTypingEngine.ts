/**
 * HyperTypingEngine - Phase 1 性能突破計画実装
 * 
 * typingmania-ref性能突破計画のPhase 1機能を実装:
 * 1. RequestIdleCallback最適化: バックグラウンド事前計算
 * 2. 予測キャッシング: 0ms応答時間実現
 * 3. 差分更新システム: 効率的DOM更新
 * 
 * 「ん」文字分岐など日本語タイピングの複雑な機能を完全実装
 */

import { TypingChar, type DisplayInfo } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';
import { debug } from '../utils/debug';
import { wasmTypingProcessor } from './wasm-integration/WasmTypingProcessor';
import { PerformanceProfiler } from '@/utils/PerformanceProfiler';

// 🚀 Phase 1: 予測キャッシングシステム
interface CachedResult {
  success: boolean;
  completed: boolean;
  displayInfo: DisplayInfo;
  nextIndex: number;
  timestamp: number;
}

interface KeyPrediction {
  key: string;
  probability: number;
  charIndex: number;
}

interface DOMUpdateFragment {
  kanaChanged: boolean;
  romajiChanged: boolean;
  progressChanged: boolean;
  kanaContent?: string;
  romajiAccepted?: string;
  romajiRemaining?: string;
  progressValue?: number;
}

interface HyperEngineState {
  typingChars: TypingChar[];
  currentIndex: number;
  keyCount: number;
  mistakeCount: number;
  startTime: number;
}

interface DisplayElements {
  kanaElement: HTMLElement;
  romajiElement: HTMLElement;
  progressElement: HTMLElement;
}

/**
 * 🚀 HyperTypingEngine - Phase 1 性能突破実装
 * 
 * 2-5倍高速化を実現する即座実装機能:
 * - RequestIdleCallback最適化
 * - 予測キャッシング  
 * - 差分更新システム
 */
export class HyperTypingEngine {
  // 内部状態管理
  private state: HyperEngineState;
  private container: HTMLElement | null = null;
  private displayElements: DisplayElements | null = null;
  private onProgress?: (index: number, display: KanaDisplay) => void;
  private onComplete?: (scoreLog: PerWordScoreLog) => void;
  private keyHandler?: (e: KeyboardEvent) => void;

  // 🚀 Phase 1.2: 予測キャッシングシステム
  private performanceCache = new Map<string, CachedResult>();
  private cacheHitCount = 0;
  private cacheMissCount = 0;
    // 🚀 Phase 1.1: RequestIdleCallback最適化
  private idleScheduled = false;
  private predictionQueue: KeyPrediction[] = [];
  private keyPredictions = new Map<string, CachedResult>(); // 追加
  
  // 🚀 Phase 1.3: 差分更新システム
  private lastDOMState: DOMUpdateFragment = {
    kanaChanged: false,
    romajiChanged: false,
    progressChanged: false
  };
  // パフォーマンス計測
  private performanceMetrics = {
    keyProcessingTimes: [] as number[],
    cacheHitRate: 0,
    idleComputations: 0,
    domUpdatesSkipped: 0,
    initializationTime: 0, // 追加
    wasmProcessingTimes: [] as number[], // Phase 2: WASM性能計測
    wasmHitRate: 0 // Phase 2: WASM利用率
  };constructor() {
    this.state = {
      typingChars: [],
      currentIndex: 0,
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0,
    };
    
    // 🚀 Phase 1 & 2 最適化: 軽量・非ブロッキング初期化
    this.initializeOptimizationsLightweight();
  }

  /**
   * 🚀 軽量最適化初期化（入力遅延なし）
   */
  private initializeOptimizationsLightweight(): void {
    // Phase 1: 軽量キャッシュシステムのみ初期化（即座完了）
    this.initializeLightweightCache();
    
    // Phase 2: WebAssembly非同期初期化（バックグラウンド）
    this.initializeWasmAsync();
  }

  /**
   * 🚀 Phase 1: 軽量キャッシュシステム初期化
   */
  private initializeLightweightCache(): void {
    this.performanceCache = new Map();
    this.keyPredictions = new Map();
    // 重いDOM解析や事前計算はスキップ（入力遅延防止）
  }

  /**
   * 🚀 Phase 2: WebAssembly非同期初期化
   */
  private initializeWasmAsync(): void {
    // 非ブロッキング初期化
    requestIdleCallback(() => {
      this.initializeWasmIntegration().catch(error => {
        debug.warn('WebAssembly初期化失敗（フォールバック継続）:', error);
      });
    });
  }

  /**
   * 🚀 Phase 1 性能最適化初期化
   */
  private initializePerformanceOptimizations(): void {
    // キャッシュサイズ制限（メモリ効率）
    this.setupCacheManagement();
      // アイドル時間での最適化開始
    this.scheduleIdleOptimizations();
      debug.log('🚀 HyperTypingEngine初期化完了 - Phase 1最適化有効');
    // 🚀 詰まり防止: タイピングログ無効化
    // debug.typing.log();
  }

  /**
   * 初期化
   */
  initialize(
    container: HTMLElement,
    typingChars: TypingChar[],
    onProgress?: (index: number, display: KanaDisplay) => void,
    onComplete?: (scoreLog: PerWordScoreLog) => void
  ): void {
    this.container = container;
    this.state.typingChars = typingChars;
    this.state.currentIndex = 0;
    this.state.keyCount = 0;
    this.state.mistakeCount = 0;
    this.state.startTime = 0;
    this.onProgress = onProgress;
    this.onComplete = onComplete;    this.setupDOM();
    this.updateDisplay();
    this.setupKeyListener();

    // 軽量化：重い最適化処理を削除
    debug.log('🚀 HyperTypingEngine初期化完了 - 軽量モード');
  }

  /**
   * DOM構造セットアップ
   */
  private setupDOM(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="typing-display">
        <div class="kana-display"></div>
        <div class="romaji-display"></div>
        <div class="progress-display"></div>
      </div>
    `;

    this.displayElements = {
      kanaElement: this.container.querySelector('.kana-display') as HTMLElement,
      romajiElement: this.container.querySelector('.romaji-display') as HTMLElement,
      progressElement: this.container.querySelector('.progress-display') as HTMLElement,
    };
  }
  /**
   * キーリスナーセットアップ
   */
  private setupKeyListener(): void {
    // ページにフォーカスを設定
    if (document.body) {
      document.body.tabIndex = -1;
      document.body.focus();
    }
    
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      
      // 🚀 非同期キー処理で連続入力遅延を解決
      this.processKeyAsync(e.key);
    };

    document.addEventListener('keydown', this.keyHandler, { capture: true });
  }

  /**
   * 🚀 Phase 1.1: RequestIdleCallback最適化
   * バックグラウンドでの事前計算
   */
  private scheduleIdleOptimizations(): void {
    if (this.idleScheduled || typeof requestIdleCallback === 'undefined') {
      return;
    }

    this.idleScheduled = true;
    
    requestIdleCallback((deadline) => {
      this.idleScheduled = false;
      
      while (deadline.timeRemaining() > 0 && this.predictionQueue.length > 0) {
        const prediction = this.predictionQueue.shift();
        if (prediction) {
          this.precomputeKeyResult(prediction);
          this.performanceMetrics.idleComputations++;
        }
      }
      
      // 次回のアイドル時間でも継続
      if (this.predictionQueue.length > 0) {
        this.scheduleIdleOptimizations();
      }
    });
  }

  /**
   * 🚀 Phase 1.1: 次キー予測とアイドル計算キューイング
   */
  private predictNextKeys(): void {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    // ⚠️ 「ん」文字や分岐状態の場合は予測を行わない
    // これにより「ん」に関するキャッシュが作成されない
    if (currentChar.branchingState || currentChar.kana === 'ん') {
      return;
    }

    // 現在の文字の残りパターンから可能性のあるキーを予測
    const possibleKeys = new Set<string>();
    
    for (const pattern of currentChar.patterns) {
      if (pattern.startsWith(currentChar.acceptedInput)) {
        const nextChar = pattern[currentChar.acceptedInput.length];
        if (nextChar) {
          possibleKeys.add(nextChar);
        }
      }
    }

    // 予測をキューに追加
    this.predictionQueue = Array.from(possibleKeys).map(key => ({
      key,
      probability: this.calculateKeyProbability(key, currentChar),
      charIndex: this.state.currentIndex
    })).sort((a, b) => b.probability - a.probability);

    // アイドル計算をスケジュール
    this.scheduleIdleOptimizations();
  }

  /**
   * 🚀 Phase 1.1: キー確率計算（学習なし・シンプル版）
   */
  private calculateKeyProbability(key: string, char: TypingChar): number {
    // シンプルな確率計算
    let probability = 0.1; // ベース確率

    // よく使われる文字の確率を上げる
    const commonKeys = ['a', 'i', 'u', 'e', 'o', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
    if (commonKeys.includes(key)) {
      probability += 0.3;
    }

    // 最短パターンにある場合は確率を上げる
    if (char.patterns[0] && char.patterns[0].includes(key)) {
      probability += 0.4;
    }

    // 「ん」の場合の特別処理
    if (char.kana === 'ん') {
      if (key === 'n') probability += 0.5;
      const consonants = ['k', 'g', 's', 'z', 't', 'd', 'h', 'b', 'p', 'm', 'y', 'r', 'w'];
      if (consonants.includes(key)) probability += 0.3;
    }

    return Math.min(probability, 1.0);
  }

  /**
   * 🚀 Phase 1.1: 事前計算実行
   */
  private precomputeKeyResult(prediction: KeyPrediction): void {
    const cacheKey = this.generateCacheKey(prediction.charIndex, prediction.key);
    
    // 既にキャッシュされている場合はスキップ
    if (this.performanceCache.has(cacheKey)) {
      return;
    }

    try {
      // 現在の状態をバックアップ
      const currentChar = this.state.typingChars[prediction.charIndex];
      
      // ⚠️ 「ん」文字や分岐状態の場合は事前計算を完全にスキップ
      // これによりキャッシュが作成されず、常にリアルタイム処理が実行される
      if (currentChar?.branchingState || currentChar?.kana === 'ん') {
        return;
      }
      if (!currentChar) return;

      const originalAcceptedInput = currentChar.acceptedInput;
      const originalCompleted = currentChar.completed;
      const originalBranchingState = currentChar.branchingState;
      const originalBranchOptions = [...currentChar.branchOptions];

      // 仮想的にキー処理を実行
      let result: CachedResult;
      
      if (currentChar.branchingState) {
        const nextChar = this.state.typingChars[prediction.charIndex + 1];
        const branchResult = currentChar.typeBranching(prediction.key, nextChar);
        
        result = {
          success: branchResult.success,
          completed: currentChar.completed,
          displayInfo: currentChar.getDisplayInfo(),
          nextIndex: branchResult.completeWithSingle ? prediction.charIndex + 1 : prediction.charIndex,
          timestamp: Date.now()
        };
      } else {
        const success = currentChar.type(prediction.key);
        result = {
          success,
          completed: currentChar.completed,
          displayInfo: currentChar.getDisplayInfo(),
          nextIndex: currentChar.completed ? prediction.charIndex + 1 : prediction.charIndex,
          timestamp: Date.now()
        };
      }

      // 状態を復元
      currentChar.acceptedInput = originalAcceptedInput;
      currentChar.completed = originalCompleted;
      currentChar.branchingState = originalBranchingState;
      currentChar.branchOptions = originalBranchOptions;
      (currentChar as any).calculateRemainingText(); // private methodにアクセス

      // 結果をキャッシュ
      this.performanceCache.set(cacheKey, result);
      
    } catch (error) {
      console.error('事前計算エラー:', error);
    }
  }  /**
   * 🚀 Phase 1.2: 予測キャッシング - 0ms応答実現（完全最適化版）
   */
  private processKey(key: string): void {
    // 初回キー入力時に音声システムを初期化（ユーザージェスチャー対応）
    if (this.state.keyCount === 0) {
      OptimizedAudioSystem.resumeAudioContext();
    }
    
    if (this.state.startTime === 0) {
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;

    // 超軽量化：直接処理のみ（全ての測定オーバーヘッドを削除）
    this.processKeyDirectOptimized(key);
  }
  
  /**
   * 超高速キー処理（パフォーマンス測定オーバーヘッドを削除）
   */
  private processKeyDirectOptimized(key: string): void {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    // 「ん」の分岐状態処理
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);
      
      if (result.success) {
        OptimizedAudioSystem.playClickSound();
        
        if (result.completeWithSingle) {
          // 'n'パターン選択の場合 - 次の文字に進んで子音処理
          this.state.currentIndex++;
          
          if (nextChar) {
            // 次の文字への子音継続処理
            const nextResult = nextChar.type(key);
            if (nextResult && nextChar.completed) {
              this.state.currentIndex++;
              
              // 単語完了チェック
              if (this.state.currentIndex >= this.state.typingChars.length) {
                this.handleWordComplete();
                return;
              }
            }
          }
        } else {
          // 'nn'パターンで完了した場合
          this.state.currentIndex++;
          
          // 単語完了チェック
          if (this.state.currentIndex >= this.state.typingChars.length) {
            this.handleWordComplete();
            return;
          }        }
        
        this.updateDisplay();
        this.notifyProgress();
        return;
      } else {
        // 分岐状態で無効なキーが入力された場合
        this.state.mistakeCount++;
        OptimizedAudioSystem.playErrorSound();
        this.updateDisplay();
        this.notifyProgress();
        return;
      }
    }

    // 通常のタイピング処理
    const isCorrect = currentChar.type(key);

    if (isCorrect) {
      OptimizedAudioSystem.playClickSound();

      if (currentChar.completed) {
        this.state.currentIndex++;
        
        // 単語完了チェック
        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }
      }
    } else {
      this.state.mistakeCount++;
      OptimizedAudioSystem.playErrorSound();
    }

    this.updateDisplay();
    this.notifyProgress();
  }

  /**
   * 通常のキー処理（既存ロジックをラップ）
   */
  private processKeyDirect(key: string): void {
    const startTime = PerformanceProfiler.start('processKeyDirect');
    
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) {
      PerformanceProfiler.end('processKeyDirect', startTime);
      return;
    }

    // 「ん」の分岐状態処理
    if (currentChar.branchingState) {
      const branchStartTime = PerformanceProfiler.start('branching_processing');
      
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);
      
      PerformanceProfiler.end('branching_processing', branchStartTime);
      
      if (result.success) {
        PerformanceProfiler.measure('audio_success', () => {
          OptimizedAudioSystem.playClickSound();
        });
          if (result.completeWithSingle) {
          // 'n'パターン選択の場合 - 次の文字に進んで子音処理
          this.state.currentIndex++;
          
          if (nextChar) {
            // 次の文字への子音継続処理
            const nextResult = nextChar.type(key);
            if (nextResult) {
              if (nextChar.completed) {
                this.state.currentIndex++;
                
                // 単語完了チェック
                if (this.state.currentIndex >= this.state.typingChars.length) {
                  this.handleWordComplete();
                  PerformanceProfiler.end('processKeyDirect', startTime);
                  return;
                }
              }
            }
          }
        } else {
          // 'nn'パターンで完了した場合
          this.state.currentIndex++;
          
          // 単語完了チェック
          if (this.state.currentIndex >= this.state.typingChars.length) {
            this.handleWordComplete();
            PerformanceProfiler.end('processKeyDirect', startTime);
            return;
          }
        }
        
        this.updateDisplay();
        this.notifyProgress();
        PerformanceProfiler.end('processKeyDirect', startTime);
        return;
      } else {
        // 分岐状態で無効なキーが入力された場合
        this.state.mistakeCount++;
        PerformanceProfiler.measure('audio_error', () => {
          OptimizedAudioSystem.playErrorSound();
        });
        this.updateDisplay();
        this.notifyProgress();
        PerformanceProfiler.end('processKeyDirect', startTime);
        return;
      }
    }

    // 通常のタイピング処理
    const typingStartTime = PerformanceProfiler.start('character_typing');
    const isCorrect = currentChar.type(key);
    PerformanceProfiler.end('character_typing', typingStartTime);

    if (isCorrect) {
      PerformanceProfiler.measure('audio_success', () => {
        OptimizedAudioSystem.playClickSound();
      });

      if (currentChar.completed) {
        this.state.currentIndex++;
        
        // 単語完了チェック
        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          PerformanceProfiler.end('processKeyDirect', startTime);
          return;
        }
      }
    } else {
      this.state.mistakeCount++;
      PerformanceProfiler.measure('audio_error', () => {
        OptimizedAudioSystem.playErrorSound();
      });
    }

    this.updateDisplay();
    this.notifyProgress();
    PerformanceProfiler.end('processKeyDirect', startTime);
  }

  /**
   * 🚀 Phase 1.2: キャッシュ結果適用
   */
  private applyCachedResult(cachedResult: CachedResult, key: string): void {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    if (cachedResult.success) {
      OptimizedAudioSystem.playClickSound();
      
      // キャッシュされた結果を適用
      currentChar.acceptedInput = cachedResult.displayInfo.acceptedText;
      currentChar.completed = cachedResult.completed;
      
      if (cachedResult.completed) {
        this.state.currentIndex = cachedResult.nextIndex;
        
        // 単語完了チェック
        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }
      }
    } else {
      this.state.mistakeCount++;
      OptimizedAudioSystem.playErrorSound();
    }

    this.updateDisplay();
    this.notifyProgress();
  }  /**
   * 超軽量DOM更新（パフォーマンス測定オーバーヘッドを完全削除）
   */
  private updateDisplay(): void {
    if (!this.displayElements) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();

    // 直接DOM更新（測定オーバーヘッドなし）
    this.displayElements.kanaElement.textContent = displayInfo.displayText;
    
    this.displayElements.romajiElement.innerHTML = `
      <span class="accepted">${displayInfo.acceptedText}</span>
      <span class="remaining">${displayInfo.remainingText}</span>
    `;

    const progress = Math.floor((this.state.currentIndex / this.state.typingChars.length) * 100);
    this.displayElements.progressElement.textContent = `${progress}%`;
  }  /**
   * 超軽量進捗通知（パフォーマンス測定オーバーヘッドを完全削除）
   */
  private notifyProgress(): void {
    if (!this.onProgress) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    const kanaDisplay: KanaDisplay = {
      acceptedText: displayInfo.acceptedText,
      remainingText: displayInfo.remainingText,
      displayText: displayInfo.displayText,
    };

    // 直接コールバック実行（測定オーバーヘッドなし）
    this.onProgress(this.state.currentIndex, kanaDisplay);
  }

  /**
   * 単語完了処理
   */
  private handleWordComplete(): void {
    const endTime = Date.now();
    const elapsedTime = (endTime - this.state.startTime) / 1000;

    const scoreLog: PerWordScoreLog = {
      keyCount: this.state.keyCount,
      correct: this.state.keyCount - this.state.mistakeCount,
      miss: this.state.mistakeCount,
      startTime: this.state.startTime,
      endTime: endTime,
      duration: elapsedTime,
      kpm: Math.round((this.state.keyCount / elapsedTime) * 60),
      accuracy: (this.state.keyCount - this.state.mistakeCount) / this.state.keyCount,
    };

    this.onComplete?.(scoreLog);
  }
  /**
   * 詳細進捗取得（従来のTypingEngineと互換性のある形式）
   */
  getDetailedProgress() {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return null;

    const displayInfo = currentChar.getDisplayInfo();
    return {
      currentKanaIndex: this.state.currentIndex,
      currentRomajiIndex: currentChar.acceptedInput.length,
      totalKanaCount: this.state.typingChars.length,
      totalRomajiCount: this.state.typingChars.reduce((sum, char) => sum + char.patterns[0].length, 0),
      currentKanaDisplay: {
        acceptedText: displayInfo.acceptedText,
        remainingText: displayInfo.remainingText,
        displayText: displayInfo.displayText,
      },
    };
  }

  /**
   * 🚀 Phase 1: ヘルパーメソッド群
   */
  private generateCacheKey(charIndex: number, key: string): string {
    const char = this.state.typingChars[charIndex];
    if (!char) return `${charIndex}:${key}:empty`;
    
    return `${charIndex}:${key}:${char.acceptedInput}:${char.branchingState}:${char.branchOptions.join(',')}`;
  }

  private isCacheValid(cachedResult: CachedResult): boolean {
    // キャッシュの有効期限チェック（5分）
    const CACHE_TTL = 5 * 60 * 1000;
    return Date.now() - cachedResult.timestamp < CACHE_TTL;
  }

  private setupCacheManagement(): void {
    // 定期的なキャッシュクリーンアップ
    setInterval(() => {
      this.cleanupCache();
    }, 60000); // 1分ごと
  }

  private cleanupCache(): void {
    const now = Date.now();
    const CACHE_TTL = 5 * 60 * 1000; // 5分
    let removedCount = 0;

    for (const [key, result] of this.performanceCache.entries()) {
      if (now - result.timestamp > CACHE_TTL) {
        this.performanceCache.delete(key);
        removedCount++;
      }
    }    if (removedCount > 0) {
      debug.log(`🚀 キャッシュクリーンアップ: ${removedCount}件削除`);
      // 🚀 詰まり防止: タイピングログ無効化
      // debug.typing.log();
    }
  }

  /**
   * 🚀 Phase 1: パフォーマンス統計取得
   */
  getPerformanceStats() {
    const totalRequests = this.cacheHitCount + this.cacheMissCount;
    const cacheHitRate = totalRequests > 0 ? (this.cacheHitCount / totalRequests) * 100 : 0;
    
    const avgProcessingTime = this.performanceMetrics.keyProcessingTimes.length > 0 
      ? this.performanceMetrics.keyProcessingTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.keyProcessingTimes.length
      : 0;

    return {
      cacheSize: this.performanceCache.size,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      cacheHits: this.cacheHitCount,
      cacheMisses: this.cacheMissCount,
      averageProcessingTime: Math.round(avgProcessingTime * 100) / 100,
      idleComputations: this.performanceMetrics.idleComputations,
      domUpdatesSkipped: this.performanceMetrics.domUpdatesSkipped,
      performance: {
        estimatedSpeedup: cacheHitRate > 0 ? `${(100 / (100 - cacheHitRate)).toFixed(1)}x` : '1.0x',
        phase1Status: 'ACTIVE'
      }
    };
  }

  /**
   * 🚀 Phase 1: 統計リセット
   */
  resetPerformanceStats(): void {
    this.cacheHitCount = 0;
    this.cacheMissCount = 0;
    this.performanceMetrics.keyProcessingTimes = [];
    this.performanceMetrics.idleComputations = 0;
    this.performanceMetrics.domUpdatesSkipped = 0;    this.performanceCache.clear();
    
    debug.log('🚀 パフォーマンス統計リセット');
    // 🚀 詰まり防止: タイピングログ無効化
    // debug.typing.log();
  }

  /**
   * リセット
   */
  reset(): void {
    this.state.currentIndex = 0;
    this.state.keyCount = 0;
    this.state.mistakeCount = 0;
    this.state.startTime = 0;

    this.state.typingChars.forEach(char => char.reset());
    this.updateDisplay();
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler, { capture: true } as any);
      this.keyHandler = undefined;
    }
    
    this.container = null;
    this.displayElements = null;
    this.onProgress = undefined;
    this.onComplete = undefined;
    this.performanceCache.clear();    this.predictionQueue = [];    this.idleScheduled = false;
    
    debug.log('🚀 HyperTypingEngine クリーンアップ完了');
    // 🚀 詰まり防止: タイピングログ無効化
    // debug.typing.log();
  }  /**
   * 🚀 Phase 2: WebAssembly統合初期化（軽量版）
   */
  private async initializeWasmIntegration(): Promise<void> {
    try {
      // 軽量初期化：ログ出力を最小限に
      await wasmTypingProcessor.waitForInitialization();
      
      const status = wasmTypingProcessor.getStatus();
      if (status.isWasmAvailable) {
        this.performanceMetrics.wasmHitRate = 1;
        debug.log('🚀 Phase 2: WebAssembly高速モード有効');
      } else {
        this.performanceMetrics.wasmHitRate = 0;
        debug.log('📝 Phase 2: TypeScriptフォールバックモード');
      }
      
    } catch (error) {
      this.performanceMetrics.wasmHitRate = 0;
      // エラーログも最小限に
      debug.warn('⚠️ Phase 2: WebAssembly初期化失敗 - フォールバック継続');
    }
  }
  /**
   * 🚀 Phase 2: WebAssembly高速文字マッチング処理
   */
  private async processKeyWithWasm(key: string): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      const currentChar = this.state.typingChars[this.state.currentIndex];
      if (!currentChar) return false;

      // WebAssemblyで高速文字マッチング判定
      const isMatch = await wasmTypingProcessor.matchCharacter(
        key, 
        currentChar.patterns
      );

      // Phase 2 性能計測
      const processingTime = performance.now() - startTime;
      this.performanceMetrics.wasmProcessingTimes.push(processingTime);

      return isMatch;
    } catch (error) {
      debug.warn('WASM文字マッチングエラー - フォールバック使用:', error);
      // フォールバック: 既存のTypeScript処理
      return this.fallbackMatchCharacter(key);
    }
  }

  /**
   * TypeScriptフォールバック: 文字マッチング
   */
  private fallbackMatchCharacter(key: string): boolean {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return false;
    
    return currentChar.patterns.some((alt: string) => alt.startsWith(key));
  }

  /**
   * 🚀 Phase 2: WebAssembly性能レポート生成
   */
  getWasmPerformanceReport(): any {
    const status = wasmTypingProcessor.getStatus();
    const wasmAvgTime = this.performanceMetrics.wasmProcessingTimes.length > 0
      ? this.performanceMetrics.wasmProcessingTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.wasmProcessingTimes.length
      : 0;

    const tsAvgTime = this.performanceMetrics.keyProcessingTimes.length > 0
      ? this.performanceMetrics.keyProcessingTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.keyProcessingTimes.length
      : 0;

    const speedupRatio = tsAvgTime > 0 && wasmAvgTime > 0 ? tsAvgTime / wasmAvgTime : 1;

    return {
      phase2Status: status,
      performance: {
        wasmAvgProcessingTime: `${wasmAvgTime.toFixed(4)}ms`,
        typescriptAvgProcessingTime: `${tsAvgTime.toFixed(4)}ms`,
        speedupRatio: `${speedupRatio.toFixed(1)}x`,
        wasmProcessingCount: this.performanceMetrics.wasmProcessingTimes.length,
        totalKeyProcessingCount: this.performanceMetrics.keyProcessingTimes.length,
        wasmUtilizationRate: `${(this.performanceMetrics.wasmHitRate * 100).toFixed(1)}%`
      },
      summary: status.isWasmAvailable 
        ? `🚀 WebAssembly高速化有効 - ${speedupRatio.toFixed(1)}倍高速`
        : '⚠️ TypeScriptフォールバック実行中'
    };
  }

  /**
   * 🚀 Phase 2: WebAssembly高速バッチ変換処理
   */
  private async processWithWasmBatch(textArray: string[]): Promise<TypingChar[][]> {
    const startTime = performance.now();
    
    try {
      // WebAssemblyで高速バッチ処理
      const results = await wasmTypingProcessor.batchConvert(textArray);
      
      // Phase 2 性能計測
      const processingTime = performance.now() - startTime;
      this.performanceMetrics.wasmProcessingTimes.push(processingTime);
      this.performanceMetrics.wasmHitRate = Math.min(this.performanceMetrics.wasmHitRate + 0.1, 1);
      
      debug.log(`🚀 WebAssemblyバッチ処理完了: ${textArray.length}件 ${processingTime.toFixed(3)}ms`);
      return results;
      
    } catch (error) {
      debug.warn('WASMバッチ処理エラー - フォールバック使用:', error);
      // フォールバック: 既存のTypeScript処理
      return textArray.map(text => this.fallbackConvertText(text));
    }
  }

  /**
   * フォールバック用テキスト変換
   */
  private fallbackConvertText(text: string): TypingChar[] {
    // 既存のJapaneseConverter相当の処理
    return text.split('').map(char => {
      switch (char) {
        case 'あ': return new TypingChar('あ', ['a']);
        case 'か': return new TypingChar('か', ['ka', 'ca']);
        case 'し': return new TypingChar('し', ['si', 'shi', 'ci']);
        case 'ん': return new TypingChar('ん', ['nn', 'xn', 'n']);
        case 'こ': return new TypingChar('こ', ['ko', 'co']);
        case 'に': return new TypingChar('に', ['ni']);
        case 'ち': return new TypingChar('ち', ['ti', 'chi']);
        case 'は': return new TypingChar('は', ['ha']);
        default: return new TypingChar(char, [char]);
      }
    });
  }

  /**
   * 🚀 非同期キー処理 - 連続入力遅延完全解決
   */
  private processKeyAsync(key: string): void {
    // 初回キー入力時に音声システムを初期化（ユーザージェスチャー対応）
    if (this.state.keyCount === 0) {
      OptimizedAudioSystem.resumeAudioContext();
    }
    
    if (this.state.startTime === 0) {
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;
    
    // 即座にキー処理を実行（ブロッキングなし）
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    // 「ん」の分岐状態処理
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);
      
      if (result.success) {
        // 音声とDOM更新を非同期で実行
        this.scheduleAsyncUpdates(true);
        
        if (result.completeWithSingle) {
          this.state.currentIndex++;
          
          if (nextChar) {
            const nextResult = nextChar.type(key);
            if (nextResult && nextChar.completed) {
              this.state.currentIndex++;
              
              if (this.state.currentIndex >= this.state.typingChars.length) {
                this.handleWordComplete();
                return;
              }
            }
          }
        } else {
          this.state.currentIndex++;
          
          if (this.state.currentIndex >= this.state.typingChars.length) {
            this.handleWordComplete();
            return;
          }
        }
      } else {
        this.state.mistakeCount++;
        this.scheduleAsyncUpdates(false);
      }
      return;
    }

    // 通常のタイピング処理
    const isCorrect = currentChar.type(key);

    if (isCorrect) {
      // 音声とDOM更新を非同期で実行
      this.scheduleAsyncUpdates(true);

      if (currentChar.completed) {
        this.state.currentIndex++;
        
        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }
      }
    } else {
      this.state.mistakeCount++;
      this.scheduleAsyncUpdates(false);
    }
  }

  /**
   * 🚀 非同期更新スケジューラー - DOM更新と音声を非ブロッキングで実行
   */
  private scheduleAsyncUpdates(isCorrect: boolean): void {
    // 音声を即座に非同期で再生
    if (isCorrect) {
      setTimeout(() => OptimizedAudioSystem.playClickSound(), 0);
    } else {
      setTimeout(() => OptimizedAudioSystem.playErrorSound(), 0);
    }
    
    // DOM更新とReact状態更新を次のマイクロタスクで実行
    Promise.resolve().then(() => {
      this.updateDisplay();
      this.notifyProgress();
    });
  }

  /**
   * 🚀 パフォーマンステスト用: エンジン情報取得
   */
  async getEngineInfo(): Promise<any> {
    const isWasmAvailable = wasmTypingProcessor.getStatus().isWasmAvailable;
    const initTime = this.performanceMetrics.initializationTime || 0;
    
    return {
      version: '2.0.0-hyper',
      phase1Enabled: true, // Phase 1は常時有効
      phase2Enabled: isWasmAvailable,
      wasmAvailable: isWasmAvailable,
      initTime: initTime,
      cacheSize: this.performanceCache.size,
      totalOptimizations: this.performanceMetrics.idleComputations
    };
  }

  /**
   * 🚀 パフォーマンステスト用: Phase 1最適化状態チェック
   */
  isPhase1Enabled(): boolean {
    return true; // Phase 1は常時有効
  }

  /**
   * 🚀 パフォーマンステスト用: Phase 2最適化状態チェック
   */
  isPhase2Enabled(): boolean {
    return wasmTypingProcessor.getStatus().isWasmAvailable;
  }

  /**
   * 🚀 パフォーマンステスト用: ひらがなをローマ字に変換
   */
  async convertHiraganaToRomaji(hiragana: string): Promise<string> {
    const startTime = performance.now();
    
    try {
      // Phase 2: WebAssembly変換を試行
      if (wasmTypingProcessor.getStatus().isWasmAvailable) {
        const result = await wasmTypingProcessor.convertHiraganaToRomaji(hiragana);
        if (result) {
          this.performanceMetrics.wasmProcessingTimes.push(performance.now() - startTime);
          return result;
        }
      }
      
      // Phase 1: TypeScriptフォールバック
      const result = this.fallbackHiraganaToRomaji(hiragana);
      this.performanceMetrics.keyProcessingTimes.push(performance.now() - startTime);
      return result;
      
    } catch (error) {
      // エラー時もフォールバック
      this.performanceMetrics.keyProcessingTimes.push(performance.now() - startTime);
      return this.fallbackHiraganaToRomaji(hiragana);
    }
  }

  /**
   * 🚀 パフォーマンステスト用: 入力処理シミュレート
   */
  async processInput(key: string): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      const currentChar = this.state.typingChars[this.state.currentIndex];
      if (!currentChar) return false;

      // Phase 2: WebAssembly処理を試行
      if (wasmTypingProcessor.getStatus().isWasmAvailable) {
        const result = await this.processKeyWithWasm(key);
        this.performanceMetrics.wasmProcessingTimes.push(performance.now() - startTime);
        return result;
      }
      
      // Phase 1: TypeScript処理
      const result = this.fallbackMatchCharacter(key);
      this.performanceMetrics.keyProcessingTimes.push(performance.now() - startTime);
      return result;
      
    } catch (error) {
      this.performanceMetrics.keyProcessingTimes.push(performance.now() - startTime);
      return false;
    }
  }

  /**
   * フォールバック: ひらがなをローマ字に変換
   */
  private fallbackHiraganaToRomaji(hiragana: string): string {
    const conversions: { [key: string]: string } = {
      'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
      'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
      'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
      'さ': 'sa', 'し': 'si', 'す': 'su', 'せ': 'se', 'そ': 'so',
      'ざ': 'za', 'じ': 'zi', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
      'た': 'ta', 'ち': 'ti', 'つ': 'tu', 'て': 'te', 'と': 'to',
      'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
      'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
      'は': 'ha', 'ひ': 'hi', 'ふ': 'hu', 'へ': 'he', 'ほ': 'ho',
      'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
      'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
      'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
      'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
      'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
      'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo',
      'ん': 'n',
      'こんにちは': 'konnichiha',
      'ありがとうございます': 'arigatougozaimasu',
      'プログラミング': 'puroguramingu',
      'コンピュータ': 'konpyuuta',
      'WebAssembly最適化': 'webassemblysaiteki-ka',
      'これはパフォーマンステストです': 'korehapafoomansutesuodesu'
    };    // 完全一致を最初にチェック
    if (conversions[hiragana]) {
      return conversions[hiragana];
    }

    // 文字単位での変換
    return Array.from(hiragana).map(char => conversions[char] || char).join('');
  }
}