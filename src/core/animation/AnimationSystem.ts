/**
 * AnimationSystem.ts
 * 汎用アニメーションシステム
 * 
 * 画面遷移以外の一般的なアニメーションを管理する中央モジュール
 * UI要素、スコア表示、エフェクトなどを統一的に処理
 */

// アニメーションタイプの定義
export type AnimationType = 'bounce' | 'pulse' | 'flash' | 'shake' | 'tada' | 'float' | 'glow' | 'custom';

// アニメーション設定の型定義
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  iterations?: number; // 繰り返し回数（-1は無限）
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  intensity?: number; // アニメーションの強度（1-10）
  customClass?: string; // カスタムCSSクラス名
}

// アニメーション適用後の結果オブジェクト
interface AnimationResult {
  id: string;
  stop: () => void; // アニメーションを停止する関数
  pause: () => void; // アニメーションを一時停止する関数
  resume: () => void; // アニメーションを再開する関数
  finish: () => void; // アニメーションをすぐに完了する関数
}

/**
 * アニメーションシステムクラス
 * ゲーム全体で一貫したアニメーション管理を提供
 */
export class AnimationSystem {
  // 実行中のアニメーションを追跡
  private static activeAnimations: Map<string, { element: HTMLElement; cleanup: () => void }> = new Map();
  
  // ユニークIDカウンター
  private static idCounter = 0;

  /**
   * 要素にアニメーションを適用する
   * @param element 対象DOM要素
   * @param type アニメーションタイプ
   * @param config アニメーション設定
   * @param onComplete 完了時コールバック
   * @returns アニメーション制御オブジェクト
   */
  static animate(
    element: HTMLElement,
    type: AnimationType,
    config: AnimationConfig = {},
    onComplete?: () => void
  ): AnimationResult {
    // まず既存のアニメーションをクリア
    this.clearAnimation(element);

    // アニメーションIDを生成
    const animId = `anim_${++this.idCounter}`;

    // 設定のデフォルト値設定
    const duration = config.duration || 1000;
    const delay = config.delay || 0;
    const iterations = config.iterations || 1;
    const intensity = config.intensity || 5;

    // アニメーションクラス名を取得
    let className: string;
    if (config.customClass) {
      className = config.customClass;
    } else {
      // 組み込みアニメーションのクラス名構築
      className = `animate-${type}`;
      if (intensity !== 5) {
        className += `-${intensity}`;
      }
    }

    // アニメーション適用
    element.classList.add(className);

    // スタイルのカスタマイズ
    if (config.duration || config.delay || config.easing || 
        config.iterations || config.direction || config.fillMode) {
      
      element.style.animationDuration = `${duration}ms`;
      if (delay) element.style.animationDelay = `${delay}ms`;
      if (config.easing) element.style.animationTimingFunction = config.easing;
      element.style.animationIterationCount = iterations === -1 ? 'infinite' : iterations.toString();
      if (config.direction) element.style.animationDirection = config.direction;
      if (config.fillMode) element.style.animationFillMode = config.fillMode;
    }

    // アニメーション終了の検出
    let timeoutId: number | undefined;
    const animationEndHandler = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      cleanup();
      if (onComplete) onComplete();
    };

    // アニメーションの終了を監視
    let hasEnded = false;
    element.addEventListener('animationend', animationEndHandler);

    // タイムアウトをセット（フォールバック）
    const totalDuration = duration * (iterations === -1 ? 1 : iterations) + delay;
    if (iterations !== -1) { // 無限アニメーションでなければタイムアウトを設定
      timeoutId = window.setTimeout(() => {
        if (!hasEnded) {
          hasEnded = true;
          cleanup();
          if (onComplete) onComplete();
        }
      }, totalDuration + 50); // 余裕を持たせる
    }

    // クリーンアップ関数
    const cleanup = () => {
      hasEnded = true;
      element.classList.remove(className);
      element.removeEventListener('animationend', animationEndHandler);
      element.style.animation = '';
      this.activeAnimations.delete(animId);
    };

    // アニメーション制御オブジェクトを作成
    const result: AnimationResult = {
      id: animId,
      stop: () => {
        cleanup();
      },
      pause: () => {
        element.style.animationPlayState = 'paused';
      },
      resume: () => {
        element.style.animationPlayState = 'running';
      },
      finish: () => {
        if (!hasEnded) {
          hasEnded = true;
          cleanup();
          if (onComplete) onComplete();
        }
      }
    };

    // アクティブアニメーションを記録
    this.activeAnimations.set(animId, {
      element,
      cleanup
    });

    return result;
  }

  /**
   * 要素からアニメーションをクリア
   * @param element 対象DOM要素
   */
  static clearAnimation(element: HTMLElement): void {
    // この要素に関連するアクティブなアニメーションを検索
    for (const [id, data] of this.activeAnimations.entries()) {
      if (data.element === element) {
        data.cleanup();
        this.activeAnimations.delete(id);
      }
    }
  }

  /**
   * すべてのアニメーションを停止
   */
  static clearAllAnimations(): void {
    for (const [, data] of this.activeAnimations) {
      data.cleanup();
    }
    this.activeAnimations.clear();
  }

  /**
   * アクティブなアニメーション数を取得
   * @returns 現在アクティブなアニメーション数
   */
  static getActiveCount(): number {
    return this.activeAnimations.size;
  }

  /**
   * パラレルアニメーション：複数の要素に同時にアニメーションを適用
   * @param elements 対象DOM要素の配列
   * @param type アニメーションタイプ
   * @param config アニメーション設定
   * @param onAllComplete すべて完了時のコールバック
   * @returns アニメーション制御オブジェクトの配列
   */
  static animateAll(
    elements: HTMLElement[],
    type: AnimationType,
    config: AnimationConfig = {},
    onAllComplete?: () => void
  ): AnimationResult[] {
    const results: AnimationResult[] = [];
    let completedCount = 0;
    
    // 各要素にアニメーションを適用
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      // 個別のアニメーション完了ハンドラー
      const onSingleComplete = () => {
        completedCount++;
        if (completedCount === elements.length && onAllComplete) {
          onAllComplete();
        }
      };
      
      // 個別の遅延を追加（連続的なアニメーション効果）
      const elementConfig = { 
        ...config,
        delay: (config.delay || 0) + (i * 100) // 各要素に100msずつ遅延を追加
      };
      
      // アニメーション適用
      const result = this.animate(element, type, elementConfig, onSingleComplete);
      results.push(result);
    }
    
    return results;
  }

  /**
   * シーケンシャルアニメーション：要素に順番にアニメーションを適用
   * @param elements 対象DOM要素の配列
   * @param type アニメーションタイプ
   * @param config アニメーション設定
   * @param onAllComplete すべて完了時のコールバック
   * @returns アニメーション制御オブジェクトの配列
   */
  static animateSequence(
    elements: HTMLElement[],
    type: AnimationType,
    config: AnimationConfig = {},
    onAllComplete?: () => void
  ): AnimationResult[] {
    const results: AnimationResult[] = [];
    
    const animateNext = (index: number) => {
      if (index >= elements.length) {
        if (onAllComplete) onAllComplete();
        return;
      }
      
      const element = elements[index];
      const result = this.animate(element, type, config, () => {
        // 次の要素をアニメーション
        animateNext(index + 1);
      });
      
      results.push(result);
    };
    
    // 最初の要素からアニメーション開始
    animateNext(0);
    
    return results;
  }
}

export default AnimationSystem;
