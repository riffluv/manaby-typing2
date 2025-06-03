/**
 * TransitionManager.ts
 * 画面遷移を一元管理するためのモジュール
 * 
 * PS5/Steam風の高級感ある遷移エフェクトを実現するための基盤クラス
 * ステート管理とエフェクト処理を分離し、メンテナンス性を向上
 */

import { SceneType } from '@/store/sceneNavigationStore';

// トランジションタイプの定義（将来的に拡張予定）
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'blur' | 'pixelate' | 'none';

// トランジション設定の型定義
export interface TransitionConfig {
  type: TransitionType;
  duration: number;
  easing: string;
  delay?: number;
  direction?: 'in' | 'out' | 'both';
}

// シーン固有の設定
export interface SceneTransitionConfig {
  enter: TransitionConfig;
  exit: TransitionConfig;
  particles?: boolean;
  particleCount?: number;
  bgmFade?: boolean;
  bgmFadeDuration?: number;
}

// シーン遷移履歴のエントリタイプ
interface TransitionHistoryEntry {
  from: SceneType;
  to: SceneType;
  timestamp: number;
  transitionType: TransitionType;
  duration: number;
}

/**
 * トランジションマネージャークラス
 * シーンの切り替えを管理し、適切なエフェクトを適用する
 */
export class TransitionManager {
  // デフォルトのトランジション設定
  private static defaultConfig: SceneTransitionConfig = {
    enter: { type: 'fade', duration: 800, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    exit: { type: 'fade', duration: 600, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)' },
    particles: false,
    bgmFade: true,
    bgmFadeDuration: 500
  };

  // シーン固有の遷移設定
  private static sceneConfigs: Record<string, SceneTransitionConfig> = {
    // メニューシーンのカスタム設定例
    menu: {
      enter: { type: 'fade', duration: 1000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
      exit: { type: 'fade', duration: 800, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)' },
      particles: true,
      particleCount: 30,
      bgmFade: true,
      bgmFadeDuration: 800
    },
    // ゲームシーンのカスタム設定例
    game: {
      enter: { type: 'slide', duration: 1200, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
      exit: { type: 'fade', duration: 500, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)' },
      particles: false,
      bgmFade: true,
      bgmFadeDuration: 300
    },
    // リザルトシーンのカスタム設定例
    result: {
      enter: { type: 'fade', duration: 1200, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
      exit: { type: 'fade', duration: 800, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)' },
      particles: true,
      particleCount: 20,
      bgmFade: true,
      bgmFadeDuration: 500
    }
  };

  // トランジション履歴（デバッグ・分析用）
  private static transitionHistory: TransitionHistoryEntry[] = [];

  /**
   * 特定のシーンのトランジション設定を取得
   * @param scene シーンタイプ
   * @returns そのシーン用のトランジション設定
   */
  static getSceneConfig(scene: SceneType): SceneTransitionConfig {
    try {
      // シーン設定が存在しない場合はデフォルト設定を返す
      return this.sceneConfigs[scene] || this.defaultConfig;
    } catch (error) {
      console.error(`[TransitionManager] シーン設定の取得に失敗しました: ${scene}`, error);
      return this.defaultConfig;
    }
  }

  /**
   * すべてのシーン設定を取得
   * @returns シーン設定の辞書
   */
  static getAllSceneConfigs(): Record<string, SceneTransitionConfig> {
    try {
      return { ...this.sceneConfigs };
    } catch (error) {
      console.error('[TransitionManager] シーン設定の取得に失敗しました', error);
      return {};
    }
  }

  /**
   * 特定のシーンのカスタム遷移設定を更新
   * @param scene シーンタイプ
   * @param config 新しい設定
   */
  static updateSceneConfig(scene: SceneType, config: Partial<SceneTransitionConfig>): void {
    try {
      this.sceneConfigs[scene] = {
        ...(this.sceneConfigs[scene] || this.defaultConfig),
        ...config
      };
    } catch (error) {
      console.error(`[TransitionManager] シーン設定の更新に失敗しました: ${scene}`, error);
    }
  }

  /**
   * デフォルトの遷移設定を更新
   * @param config 新しいデフォルト設定
   */
  static updateDefaultConfig(config: Partial<SceneTransitionConfig>): void {
    try {
      this.defaultConfig = {
        ...this.defaultConfig,
        ...config
      };
    } catch (error) {
      console.error('[TransitionManager] デフォルト設定の更新に失敗しました', error);
    }
  }

  /**
   * シーン間の遷移を記録
   * @param from 遷移元シーン
   * @param to 遷移先シーン
   * @param type 使用したトランジションタイプ
   * @param duration トランジション時間
   */
  static recordTransition(from: SceneType, to: SceneType, type: TransitionType, duration: number): void {
    try {
      this.transitionHistory.push({
        from,
        to,
        timestamp: Date.now(),
        transitionType: type,
        duration
      });

      // 履歴が長くなりすぎないよう制限
      if (this.transitionHistory.length > 50) {
        this.transitionHistory = this.transitionHistory.slice(-50);
      }

      // 開発モードのみコンソールに記録
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Transition] ${from} -> ${to} (${type}, ${duration}ms)`);
      }
    } catch (error) {
      console.error('[TransitionManager] 遷移の記録に失敗しました', error);
    }
  }

  /**
   * 最近の遷移履歴を取得（デバッグ用）
   * @param limit 取得する履歴数
   * @returns 最近の遷移履歴
   */
  static getRecentTransitions(limit: number = 10): TransitionHistoryEntry[] {
    try {
      return this.transitionHistory.slice(-limit);
    } catch (error) {
      console.error('[TransitionManager] 遷移履歴の取得に失敗しました', error);
      return [];
    }
  }

  /**
   * シーン間での最適なトランジションタイプを取得
   * 将来的に、前のシーンと次のシーンの組み合わせに応じたカスタマイズが可能
   * 
   * @param from 遷移元シーン
   * @param to 遷移先シーン
   * @returns 最適なトランジションタイプ
   */
  static getOptimalTransitionType(from: SceneType | null, to: SceneType): TransitionType {
    try {
      // 特定のシーン間遷移のカスタマイズは将来対応
      // 現在は単純に宛先シーンの設定を使用
      const config = this.getSceneConfig(to);
      return config.enter.type;
    } catch (error) {
      console.error(`[TransitionManager] 最適なトランジションタイプの取得に失敗: ${from} -> ${to}`, error);
      return 'fade'; // エラー時はフェードをデフォルトとする
    }
  }

  /**
   * トランジションシステムの動作状態を診断
   * デバッグモードや問題解決に使用
   * 
   * @returns 診断情報オブジェクト
   */
  static diagnose(): Record<string, any> {
    try {
      return {
        defaultConfig: { ...this.defaultConfig },
        sceneConfigs: { ...this.sceneConfigs },
        transitionHistoryCount: this.transitionHistory.length,
        recentTransitions: this.getRecentTransitions(5),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[TransitionManager] 診断の実行に失敗しました', error);
      return {
        error: '診断の実行に失敗しました',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default TransitionManager;
