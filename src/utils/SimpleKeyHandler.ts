/**
 * typingmania-ref流 シンプルキー入力システム
 * 
 * 複雑な最適化を削除し、typingmania-refと同様の
 * シンプルで効率的なキー入力処理を実現
 */

export interface SimpleKeyHandler {
  (e: KeyboardEvent): boolean; // trueを返すとハンドラーを削除
}

class SimpleKeyInput {
  private handlers: SimpleKeyHandler[] = [];
  private initialized: boolean = false;

  constructor() {
    // ブラウザ環境でのみ初期化
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init(): void {
    if (this.initialized) return;
    
    // typingmania-ref流：グローバルに1つだけのkeydownイベント
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.initialized = true;
  }
  private handleKeyDown(e: KeyboardEvent): void {
    // ブラウザ環境チェック
    if (typeof window === 'undefined') return;
    
    // typingmania-ref流：即座にイベント制御（さらに高速化）
    if (e.key.toLowerCase() === 'r' && (e.metaKey || e.ctrlKey)) {
      // ページリフレッシュは許可
      return;
    } else if (e.key === 'F12') {
      // デベロッパーツールは許可
      return;
    } else {
      // 🚀 超高速化: preventDefault/stopPropagationを同時実行
      e.preventDefault();
      e.stopPropagation();
    }

    // 🚀 超高速化: ハンドラー実行を最適化（typingmania-ref流）
    if (this.handlers.length === 0) return;
    
    const remainingHandlers: SimpleKeyHandler[] = [];
    for (let i = 0; i < this.handlers.length; i++) {
      try {
        const handler = this.handlers[i];
        const shouldRemove = handler(e);
        if (!shouldRemove) {
          remainingHandlers.push(handler);
        }
      } catch (error) {
        console.error('Key handler error:', error);
        // エラーのあるハンドラーは削除
      }
    }
    this.handlers = remainingHandlers;
  }

  /**
   * typingmania-ref流：promise-basedキー待機
   */
  waitForKey(): Promise<KeyboardEvent> {
    return new Promise((resolve) => {
      const handler: SimpleKeyHandler = (e: KeyboardEvent) => {
        resolve(e);
        return true; // ハンドラーを削除
      };
      this.handlers.push(handler);
    });
  }

  /**
   * 継続的なキー監視（タイピング用）
   */
  onKey(handler: (e: KeyboardEvent) => void): () => void {
    const wrapperHandler: SimpleKeyHandler = (e: KeyboardEvent) => {
      handler(e);
      return false; // ハンドラーを継続
    };
    
    this.handlers.push(wrapperHandler);
    
    // cleanup関数を返す
    return () => {
      const index = this.handlers.indexOf(wrapperHandler);
      if (index >= 0) {
        this.handlers.splice(index, 1);
      }
    };
  }
}

// シングルトンインスタンス
export const simpleKeyInput = new SimpleKeyInput();

/**
 * typingmania-ref流 シンプルキー入力フック
 */
export function useSimpleKeyInput() {
  return simpleKeyInput;
}
