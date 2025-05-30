/**
 * 直接DOM操作ユーティリティ（typingmania-ref流）
 * React の状態更新をバイパスして最高速度でのタイピング表示を実現
 */

export interface DirectDOMConfig {
  enableDirectUpdates: boolean;
  useRequestAnimationFrame: boolean;
  batchUpdates: boolean;
  maxBatchSize: number;
}

export interface TypingCharElement {
  element: HTMLElement;
  kanaIndex: number;
  charIndex: number;
  state: 'pending' | 'current' | 'completed';
}

class DirectDOMManager {
  private config: DirectDOMConfig = {
    enableDirectUpdates: true,
    useRequestAnimationFrame: true,
    batchUpdates: true,
    maxBatchSize: 50
  };

  private pendingUpdates: (() => void)[] = [];
  private animationFrameId: number | null = null;
  private typingCharElements: Map<string, TypingCharElement> = new Map();

  constructor(config?: Partial<DirectDOMConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * タイピング文字要素の登録
   */
  public registerTypingChar(
    element: HTMLElement,
    kanaIndex: number,
    charIndex: number
  ): void {
    const key = `${kanaIndex}-${charIndex}`;
    this.typingCharElements.set(key, {
      element,
      kanaIndex,
      charIndex,
      state: 'pending'
    });
  }
  /**
   * 文字状態の直接更新（React状態をバイパス）
   */
  public updateCharState(
    kanaIndex: number,
    charIndex: number,
    newState: 'pending' | 'current' | 'completed',
    immediate = false
  ): void {
    if (!this.config.enableDirectUpdates) return;

    const update = () => {
      const key = `${kanaIndex}-${charIndex}`;
      const typingChar = this.typingCharElements.get(key);
      
      if (!typingChar) {
        console.warn(`DirectDOMManager: Element not found for ${key}`);
        return;
      }

      const { element } = typingChar;
        // デバッグログ
      if (newState === 'current') {
        console.log(`🎯 DirectDOMManager: Setting current state for ${key}`, element);
        console.log(`🎯 Before update:`, {
          classList: Array.from(element.classList),
          hasTypingChar: element.classList.contains('typing-char'),
          hasCharCurrent: element.classList.contains('char-current')
        });
      }
      
      // 前の状態クラスを削除
      element.classList.remove('char-pending', 'char-current', 'char-completed');
      
      // 新しい状態クラスを追加
      element.classList.add(`char-${newState}`);
      
      // デバッグ: クラス適用後の確認
      if (newState === 'current') {
        console.log(`🎯 After class update:`, {
          classList: Array.from(element.classList),
          hasTypingChar: element.classList.contains('typing-char'),
          hasCharCurrent: element.classList.contains('char-current'),
          computedStyles: {
            backgroundColor: window.getComputedStyle(element).backgroundColor,
            transform: window.getComputedStyle(element).transform,
            animation: window.getComputedStyle(element).animation
          }
        });
      }
      
      // data属性も更新
      element.dataset.state = newState;
      
      // aria-current も更新
      if (newState === 'current') {
        element.setAttribute('aria-current', 'true');
      } else {
        element.removeAttribute('aria-current');
      }

      // 内部状態更新
      typingChar.state = newState;
    };

    if (immediate || !this.config.batchUpdates) {
      update();
    } else {
      this.scheduleUpdate(update);
    }
  }

  /**
   * 複数文字の一括状態更新
   */
  public batchUpdateChars(updates: Array<{
    kanaIndex: number;
    charIndex: number;
    state: 'pending' | 'current' | 'completed';
  }>): void {
    if (!this.config.enableDirectUpdates) return;

    const batchUpdate = () => {
      updates.forEach(({ kanaIndex, charIndex, state }) => {
        this.updateCharState(kanaIndex, charIndex, state, true);
      });
    };

    if (this.config.useRequestAnimationFrame) {
      this.scheduleUpdate(batchUpdate);
    } else {
      batchUpdate();
    }
  }

  /**
   * 現在文字のハイライト更新
   */
  public updateCurrentCharHighlight(
    currentKanaIndex: number,
    currentCharIndex: number
  ): void {
    if (!this.config.enableDirectUpdates) return;

    // 前の current 状態をクリア
    this.typingCharElements.forEach((typingChar) => {
      if (typingChar.state === 'current') {
        this.updateCharState(
          typingChar.kanaIndex,
          typingChar.charIndex,
          'pending',
          true
        );
      }
    });

    // 新しい current 状態を設定
    this.updateCharState(currentKanaIndex, currentCharIndex, 'current', true);
  }

  /**
   * 更新のスケジューリング
   */
  private scheduleUpdate(updateFn: () => void): void {
    this.pendingUpdates.push(updateFn);

    if (this.config.batchUpdates && this.pendingUpdates.length < this.config.maxBatchSize) {
      return;
    }

    if (this.animationFrameId !== null) {
      return;
    }

    const processBatch = () => {
      const updates = this.pendingUpdates.splice(0, this.config.maxBatchSize);
      
      updates.forEach(update => {
        try {
          update();
        } catch (error) {
          console.warn('Direct DOM update failed:', error);
        }
      });

      this.animationFrameId = null;

      if (this.pendingUpdates.length > 0) {
        this.animationFrameId = requestAnimationFrame(processBatch);
      }
    };

    if (this.config.useRequestAnimationFrame) {
      this.animationFrameId = requestAnimationFrame(processBatch);
    } else {
      processBatch();
    }
  }

  /**
   * プログレス表示の直接更新
   */
  public updateProgress(percentage: number, currentKana: string): void {
    if (!this.config.enableDirectUpdates) return;

    const typingArea = document.querySelector('.typing-area');
    if (typingArea) {
      typingArea.setAttribute('data-progress', percentage.toString());
      typingArea.setAttribute('data-current-kana', currentKana);
      typingArea.setAttribute('aria-description', `進捗: ${percentage}%`);
    }
  }

  /**
   * CSS カスタムプロパティの更新（GPU加速用）
   */
  public updateCSSProperties(properties: Record<string, string>): void {
    if (!this.config.enableDirectUpdates) return;

    const root = document.documentElement;
    Object.entries(properties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * タイピングエリア全体のリセット
   */
  public resetTypingArea(): void {
    this.typingCharElements.forEach((typingChar) => {
      this.updateCharState(
        typingChar.kanaIndex,
        typingChar.charIndex,
        'pending',
        true
      );
    });
  }

  /**
   * 要素の登録解除
   */
  public unregisterTypingChar(kanaIndex: number, charIndex: number): void {
    const key = `${kanaIndex}-${charIndex}`;
    this.typingCharElements.delete(key);
  }

  /**
   * 全要素の登録解除
   */
  public clearAll(): void {
    this.typingCharElements.clear();
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.pendingUpdates = [];
  }

  /**
   * 設定更新
   */
  public updateConfig(newConfig: Partial<DirectDOMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 現在の状態取得（デバッグ用）
   */
  public getState() {
    return {
      config: this.config,
      registeredElements: this.typingCharElements.size,
      pendingUpdates: this.pendingUpdates.length,
      animationFrameActive: this.animationFrameId !== null
    };
  }
}

// シングルトンインスタンス
export const directDOMManager = new DirectDOMManager();

/**
 * カスタムhook：直接DOM操作
 */
export function useDirectDOM() {
  return {
    registerTypingChar: directDOMManager.registerTypingChar.bind(directDOMManager),
    unregisterTypingChar: directDOMManager.unregisterTypingChar.bind(directDOMManager),
    updateCharState: directDOMManager.updateCharState.bind(directDOMManager),
    batchUpdateChars: directDOMManager.batchUpdateChars.bind(directDOMManager),
    updateCurrentCharHighlight: directDOMManager.updateCurrentCharHighlight.bind(directDOMManager),
    updateProgress: directDOMManager.updateProgress.bind(directDOMManager),
    resetTypingArea: directDOMManager.resetTypingArea.bind(directDOMManager),
    clearAll: directDOMManager.clearAll.bind(directDOMManager),
    getState: directDOMManager.getState.bind(directDOMManager)
  };
}
