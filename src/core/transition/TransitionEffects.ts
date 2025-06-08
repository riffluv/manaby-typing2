/**
 * TransitionEffects.ts
 * シンプルな遷移エフェクトの実装
 * 
 * 基本的なfade/slide遷移のみをサポート
 */

import { TransitionType, TransitionConfig } from './TransitionManager';

// エフェクト実行時のコールバック型
export type EffectCallback = () => void;

/**
 * シンプルなトランジションエフェクト
 */
export class TransitionEffects {
  /**
   * 要素にシンプルなエフェクトを適用する
   */
  static applyEffect(
    element: HTMLElement,
    type: TransitionType,
    config: TransitionConfig,
    onComplete?: EffectCallback
  ): void {
    if (!element) {
      if (onComplete) setTimeout(onComplete, 0);
      return;
    }

    const duration = config.duration;
    const direction = config.direction || 'both';

    // エフェクトタイプに基づいてCSSクラスを適用
    const effectClass = this.getEffectClassName(type, direction === 'out' ? 'exit' : 'enter');

    // アニメーションクラスを設定
    element.classList.add(effectClass);

    // アニメーション完了時のコールバック
    const handleComplete = () => {
      element.classList.remove(effectClass);
      if (onComplete) onComplete();
    };

    // シンプルなタイマーベースの完了検知
    setTimeout(handleComplete, duration);
  }

  /**
   * エフェクトタイプとディレクションからCSSクラス名を取得
   */
  private static getEffectClassName(type: TransitionType, direction: 'enter' | 'exit'): string {
    if (type === 'slide') {
      return direction === 'enter' ? 'simple-slide-enter' : 'simple-slide-exit';
    }
    return direction === 'enter' ? 'simple-fade-enter' : 'simple-fade-exit';
  }

}

export default TransitionEffects;
