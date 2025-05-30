/**
 * typingmania-ref流 シンプルDOM更新システム
 * 
 * 複雑なDirectDOMManagerを削除し、
 * 必要最小限の直接DOM操作を実現
 */

export class SimpleDOM {
  private container: HTMLElement | null = null;
  private charElements: HTMLElement[] = [];

  setContainer(container: HTMLElement): void {
    this.container = container;
    this.charElements = Array.from(container.querySelectorAll('.typing-char'));
  }
  /**
   * typingmania-ref流：最小限の状態更新
   */
  updateCharState(kanaIndex: number, charIndex: number, state: 'current' | 'completed' | 'pending'): void {
    // 簡単なインデックス計算で要素を特定
    const element = this.findCharElement(kanaIndex, charIndex);
    if (!element) {
      console.warn(`🚨 SimpleDOM: Element not found for ${kanaIndex}-${charIndex}`);
      return;
    }

    // デバッグログ
    if (state === 'current') {
      console.log(`🎯 SimpleDOM: Setting current state for ${kanaIndex}-${charIndex}`, element);
      console.log(`🎯 Before update:`, {
        classList: Array.from(element.classList),
        hasTypingChar: element.classList.contains('typing-char'),
        hasCurrent: element.classList.contains('current')
      });
    }

    // typingmania-ref流：クラス名による状態管理
    element.classList.remove('current', 'completed', 'pending');
    element.classList.add(state);
    
    // デバッグ: クラス適用後の確認
    if (state === 'current') {
      console.log(`🎯 After class update:`, {
        classList: Array.from(element.classList),
        hasTypingChar: element.classList.contains('typing-char'),
        hasCurrent: element.classList.contains('current'),
        computedStyles: {
          backgroundColor: window.getComputedStyle(element).backgroundColor,
          transform: window.getComputedStyle(element).transform,
          animation: window.getComputedStyle(element).animation
        }
      });
    }
    
    // ARIA属性の更新（アクセシビリティ）
    if (state === 'current') {
      element.setAttribute('aria-current', 'true');
    } else {
      element.removeAttribute('aria-current');
    }
  }

  private findCharElement(kanaIndex: number, charIndex: number): HTMLElement | null {
    return this.container?.querySelector(`[data-kana-index="${kanaIndex}"][data-char-index="${charIndex}"]`) as HTMLElement || null;
  }

  /**
   * 全体の進捗更新
   */
  updateProgress(progress: number): void {
    if (this.container) {
      this.container.setAttribute('data-progress', progress.toString());
    }
  }
}

// シングルトンインスタンス
export const simpleDOM = new SimpleDOM();
