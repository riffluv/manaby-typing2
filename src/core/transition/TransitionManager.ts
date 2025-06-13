/**
 * TransitionManager.ts
 * シンプルな画面遷移を管理するためのモジュール
 * 
 * 基本的なfade/slide遷移のみをサポート
 */

import { SceneType } from '@/store/sceneNavigationStore';

// シンプルなトランジションタイプの定義
export type TransitionType = 'fade' | 'slide' | 'none';

// トランジション設定の型定義
export interface TransitionConfig {
  type: TransitionType;
  duration: number;
  easing: string;
  delay?: number;
  direction?: 'in' | 'out' | 'both';
}

// シンプルなシーン設定
export interface SceneTransitionConfig {
  enter: TransitionConfig;
  exit: TransitionConfig;
}

/**
 * シンプルなトランジションマネージャークラス
 */
export class TransitionManager {
  // デフォルトのトランジション設定
  private static defaultConfig: SceneTransitionConfig = {
    enter: { type: 'fade', duration: 600, easing: 'ease-in-out' },
    exit: { type: 'fade', duration: 400, easing: 'ease-in-out' }
  };

  /**
   * 特定のシーンのトランジション設定を取得
   * @param scene シーンタイプ
   * @returns デフォルト設定
   */  static getSceneConfig(_scene: SceneType): SceneTransitionConfig {
    // すべてのシーンでデフォルト設定を使用
    return this.defaultConfig;
  }

  /**
   * 遷移記録（シンプルなログのみ）
   */
  static recordTransition(_from: SceneType, _to: SceneType, _type: TransitionType, _duration: number): void {
    // プロダクションでは何もしない
  }
}

export default TransitionManager;
