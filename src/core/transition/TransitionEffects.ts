/**
 * TransitionEffects.ts - DISABLED FOR FUTURE RICH TRANSITION LIBRARY
 * シンプルな遷移エフェクトの実装
 * 
 * 🚀 将来のリッチな画面遷移ライブラリとの競合を防ぐため、全機能を無効化
 * 基本的なfade/slide遷移のみをサポート
 */

import { TransitionType, TransitionConfig } from './TransitionManager';

// エフェクト実行時のコールバック型
export type EffectCallback = () => void;

/**
 * シンプルなトランジションエフェクト
 */
export class TransitionEffects {  /**
   * 要素にシンプルなエフェクトを適用する - DISABLED
   * 🚀 将来のリッチな画面遷移ライブラリとの競合を防ぐため無効化
   */
  static applyEffect(
    element: HTMLElement,
    type: TransitionType,
    config: TransitionConfig,
    onComplete?: EffectCallback
  ): void {
    // 🚀 DISABLED: All transition effects disabled for future rich transition library
    
    if (!element) {
      if (onComplete) setTimeout(onComplete, 0);
      return;
    }

    // すぐに完了時コールバックを実行（アニメーションなし）
    if (onComplete) {
      setTimeout(onComplete, 0);
    }
  }

  /**
   * エフェクトタイプとディレクションからCSSクラス名を取得
   */  /**
   * エフェクトタイプとディレクションからCSSクラス名を取得 - DISABLED
   * 🚀 将来のリッチな画面遷移ライブラリとの競合を防ぐため無効化
   */  private static getEffectClassName(_type: TransitionType, _direction: 'enter' | 'exit'): string {
    // 🚀 DISABLED: Return empty string as no classes are applied
    return '';
  }

}

export default TransitionEffects;
