/**
 * 超高速キー入力検知システム（typingmania-ref流）
 * 
 * 40年のtypingmania経験者が感じるキー検知遅延を解決する
 * 最高速度のキーイベント処理システム
 */

export interface HighSpeedKeyConfig {
  useRawKeyEvents: boolean;
  preventDefaultBehavior: boolean;
  immediateCapture: boolean;
  highPriorityEventLoop: boolean;
  bypassBrowserOptimizations: boolean;
}

export interface KeyInputMetrics {
  hardwareToJs: number;
  jsToHandler: number;
  handlerToResponse: number;
  totalLatency: number;
}

class HighSpeedKeyDetector {
  private config: HighSpeedKeyConfig = {
    useRawKeyEvents: true,
    preventDefaultBehavior: true,
    immediateCapture: true,
    highPriorityEventLoop: true,
    bypassBrowserOptimizations: true
  };

  private keyHandlers: Map<string, (e: KeyboardEvent) => void> = new Map();
  private isListening = false;
  private lastKeyTime = 0;
  private keyMetrics: KeyInputMetrics[] = [];
  
  constructor(config?: Partial<HighSpeedKeyConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 超高速キーリスナー開始（typingmania-ref流）
   */
  public startListening(): void {
    if (this.isListening) return;

    // 最高優先度でキーイベントをキャプチャ
    const options = {
      passive: false, // ブラウザ最適化を無効化
      capture: true,  // キャプチャフェーズで即座処理
      once: false
    };

    // keydown - 最速検知
    document.addEventListener('keydown', this.handleKeyDown, options);
    
    // keypress - 文字入力専用（より低レベル）
    document.addEventListener('keypress', this.handleKeyPress, options);
    
    // 実験的：beforeinput（さらに早い段階）
    document.addEventListener('beforeinput', this.handleBeforeInput, options);

    this.isListening = true;
    // デバッグログ完全削除
  }

  /**
   * キーダウンハンドラー（最優先）
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    const keyTime = performance.now();
    // ESCや修飾キー（Ctrl/Alt/Meta）は無効化しない（Shiftは除外しない！）
    if (e.key === 'Escape' || e.ctrlKey || e.altKey || e.metaKey) {
      // 通常の伝播に任せる（preventDefault/stopImmediatePropagationしない）
      return;
    }
    // 即座にイベント制御
    if (this.config.preventDefaultBehavior) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    // タイピング文字のみ処理（shift記号も含む）
    if (e.key.length === 1) {
      this.processKeyInput(e, keyTime, 'keydown');
    }
  };

  /**
   * キープレスハンドラー（文字入力特化）
   */
  private handleKeyPress = (e: KeyboardEvent): void => {
    const keyTime = performance.now();
    if (this.config.preventDefaultBehavior) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    if (e.key.length === 1) {
      this.processKeyInput(e, keyTime, 'keypress');
    }
  };

  /**
   * beforeinputハンドラー（実験的最速）
   */
  private handleBeforeInput = (e: InputEvent): void => {
    const keyTime = performance.now();
    
    if (e.data && e.data.length === 1) {
      // beforeinputからKeyboardEventを模擬
      const simulatedEvent = new KeyboardEvent('keydown', {
        key: e.data,
        bubbles: true,
        cancelable: true
      });
      
      this.processKeyInput(simulatedEvent, keyTime, 'beforeinput');
    }
  };

  /**
   * キー入力処理（超高速）
   */
  private processKeyInput(e: KeyboardEvent, keyTime: number, source: string): void {
    const processingStart = performance.now();
    
    // 遅延計測
    const timeSinceLastKey = keyTime - this.lastKeyTime;
    this.lastKeyTime = keyTime;

    // 登録されたハンドラーを即座実行
    const handler = this.keyHandlers.get('typing');
    if (handler) {
      // 高優先度で即座実行
      if (this.config.highPriorityEventLoop) {
        // MessageChannelで最高優先度実行
        this.executeHighPriority(() => {
          handler(e);
          
          // メトリクス記録
          const processingEnd = performance.now();
          this.recordKeyMetrics({
            hardwareToJs: keyTime - (this.lastKeyTime || keyTime),
            jsToHandler: processingStart - keyTime,
            handlerToResponse: processingEnd - processingStart,
            totalLatency: processingEnd - keyTime
          });
        });
      } else {
        handler(e);
      }
    }
  }

  /**
   * 最高優先度実行（MessageChannel活用）
   */
  private executeHighPriority(callback: () => void): void {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => callback();
    channel.port2.postMessage(null);
  }

  /**
   * タイピングハンドラー登録
   */
  public setTypingHandler(handler: (e: KeyboardEvent) => void): void {
    this.keyHandlers.set('typing', handler);
  }

  /**
   * リスニング停止
   */
  public stopListening(): void {
    if (!this.isListening) return;

    document.removeEventListener('keydown', this.handleKeyDown, true);
    document.removeEventListener('keypress', this.handleKeyPress, true);
    document.removeEventListener('beforeinput', this.handleBeforeInput, true);

    this.isListening = false;
    // デバッグログ完全削除
  }

  /**
   * キーメトリクス記録
   */
  private recordKeyMetrics(metrics: KeyInputMetrics): void {
    this.keyMetrics.push(metrics);
    
    // 過去100回分のみ保持
    if (this.keyMetrics.length > 100) {
      this.keyMetrics.shift();
    }
  }

  /**
   * 平均入力遅延取得
   */
  public getAverageInputDelay(): number {
    if (this.keyMetrics.length === 0) return 0;
    
    const total = this.keyMetrics.reduce((sum, m) => sum + m.totalLatency, 0);
    return total / this.keyMetrics.length;
  }

  /**
   * 詳細メトリクス取得
   */
  public getDetailedMetrics() {
    if (this.keyMetrics.length === 0) {
      return {
        count: 0,
        averageTotal: 0,
        averageHardwareToJs: 0,
        averageJsToHandler: 0,
        averageHandlerToResponse: 0,
        minLatency: 0,
        maxLatency: 0
      };
    }

    const totals = this.keyMetrics.map(m => m.totalLatency);
    
    return {
      count: this.keyMetrics.length,
      averageTotal: totals.reduce((a, b) => a + b, 0) / this.keyMetrics.length,
      averageHardwareToJs: this.keyMetrics.reduce((a, b) => a + b.hardwareToJs, 0) / this.keyMetrics.length,
      averageJsToHandler: this.keyMetrics.reduce((a, b) => a + b.jsToHandler, 0) / this.keyMetrics.length,
      averageHandlerToResponse: this.keyMetrics.reduce((a, b) => a + b.handlerToResponse, 0) / this.keyMetrics.length,
      minLatency: Math.min(...totals),
      maxLatency: Math.max(...totals)
    };
  }

  /**
   * 設定更新
   */
  public updateConfig(newConfig: Partial<HighSpeedKeyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // リスニング中なら再起動
    if (this.isListening) {
      this.stopListening();
      this.startListening();
    }
  }

  /**
   * リセット
   */
  public reset(): void {
    this.keyMetrics = [];
    this.lastKeyTime = 0;
  }

  /**
   * 破棄
   */
  public dispose(): void {
    this.stopListening();
    this.keyHandlers.clear();
    this.keyMetrics = [];
  }
}

// シングルトンインスタンス
export const highSpeedKeyDetector = new HighSpeedKeyDetector();

/**
 * カスタムhook：超高速キー検知
 */
export function useHighSpeedKeys() {
  return {
    startListening: highSpeedKeyDetector.startListening.bind(highSpeedKeyDetector),
    stopListening: highSpeedKeyDetector.stopListening.bind(highSpeedKeyDetector),
    setTypingHandler: highSpeedKeyDetector.setTypingHandler.bind(highSpeedKeyDetector),
    getAverageInputDelay: highSpeedKeyDetector.getAverageInputDelay.bind(highSpeedKeyDetector),
    getDetailedMetrics: highSpeedKeyDetector.getDetailedMetrics.bind(highSpeedKeyDetector),
    reset: highSpeedKeyDetector.reset.bind(highSpeedKeyDetector),
    updateConfig: highSpeedKeyDetector.updateConfig.bind(highSpeedKeyDetector)
  };
}
