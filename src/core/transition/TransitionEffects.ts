/**
 * TransitionEffects.ts
 * 遷移エフェクトの具体的な実装を提供するモジュール
 * 
 * 画面遷移時の様々なエフェクトを統一的に提供し、
 * コンポーネントからアニメーション実装の詳細を分離する
 */

import { TransitionType, TransitionConfig } from './TransitionManager';

// エフェクト実行時のコールバック型
export type EffectCallback = () => void;

/**
 * エフェクト適用のためのヘルパークラス
 * CSSアニメーション制御やWebAnimations APIなど、低レベルの実装詳細を隠蔽する
 */
export class TransitionEffects {
  /**
   * 要素にエフェクトを適用する
   * @param element 対象DOM要素
   * @param type エフェクトタイプ
   * @param config エフェクト設定
   * @param onComplete 完了時コールバック
   */
  static applyEffect(
    element: HTMLElement,
    type: TransitionType,
    config: TransitionConfig,
    onComplete?: EffectCallback
  ): void {
    // まず既存のアニメーションをすべてクリア
    this.clearEffects(element);

    // 存在しない要素の場合は何もしない
    if (!element) {
      if (onComplete) setTimeout(onComplete, 0);
      return;
    }

    const duration = config.duration;
    const delay = config.delay || 0;
    const direction = config.direction || 'both';

    // エフェクトタイプに基づいてCSSクラスを適用
    const effectClass = this.getEffectClassName(type, direction === 'out' ? 'exit' : 'enter');

    // デバッグ情報
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TransitionEffects] Applying effect: ${type}, class: ${effectClass}`);
    }

    // アニメーションクラスを設定
    element.classList.add(effectClass);

    // アニメーション完了時のコールバック
    const handleComplete = () => {
      element.classList.remove(effectClass);
      if (onComplete) onComplete();
    };

    // アニメーション完了を検出
    if (element.animate && window.Animation) {
      // Web Animations API 使用
      try {
        const animation = element.animate([], {
          duration: duration,
          delay: delay
        });
        
        animation.onfinish = handleComplete;
      } catch (e) {
        // フォールバック: タイマー使用
        setTimeout(handleComplete, duration + delay);
      }
    } else {
      // アニメーションAPIが使えない場合はタイマーで対応
      setTimeout(handleComplete, duration + delay);
    }
  }

  /**
   * ブラーエフェクトの強さを設定
   * （モーダル表示時の背景ぼかしなどに使用）
   * @param element 対象DOM要素
   * @param amount ぼかし量（0-10）
   */
  static setBlurAmount(element: HTMLElement, amount: number): void {
    if (!element) return;
    element.style.filter = amount > 0 ? `blur(${amount}px)` : '';
  }

  /**
   * 要素から既存のエフェクトをすべて削除
   * @param element 対象DOM要素
   */
  static clearEffects(element: HTMLElement | null): void {
    if (!element) return;

    // アニメーション関連のクラスを削除
    const animationClasses = [
      'rpg-transition-enter', 'rpg-transition-exit',
      'rpg-slide-enter', 'rpg-slide-exit',
      'rpg-zoom-enter', 'rpg-zoom-exit',
      'rpg-blur-enter', 'rpg-blur-exit',
      'rpg-pixelate-enter', 'rpg-pixelate-exit'
    ];

    animationClasses.forEach(cls => {
      if (element.classList.contains(cls)) {
        element.classList.remove(cls);
      }
    });

    // スタイルもクリア
    element.style.animation = '';
  }

  /**
   * エフェクトタイプとディレクションからCSSクラス名を取得
   * @param type エフェクトタイプ
   * @param direction エフェクト方向（enter/exit）
   * @returns CSSクラス名
   */
  private static getEffectClassName(type: TransitionType, direction: 'enter' | 'exit'): string {
    // 基本パターン: rpg-{type}-{direction}
    return `rpg-${type}-${direction}`;
  }
}

export default TransitionEffects;
