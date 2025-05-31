/**
 * SimpleDOM: 軽量化されたDOM操作ユーティリティ
 * 
 * 重い操作を削除し、必要最小限の機能のみ提供
 */

export class SimpleDOM {
  private container: HTMLElement | null = null;

  setContainer(container: HTMLElement): void {
    this.container = container;
  }

  // 軽量化: 基本的な要素取得のみ
  findCharElement(kanaIndex: number, charIndex: number): HTMLElement | null {
    if (!this.container) return null;
    
    return this.container.querySelector(
      `[data-kana-index="${kanaIndex}"][data-char-index="${charIndex}"]`
    ) as HTMLElement;
  }

  // 軽量化: 基本的な状態更新のみ（重いアニメーション削除）
  updateCharState(kanaIndex: number, charIndex: number, state: 'current' | 'completed' | 'pending'): void {
    const element = this.findCharElement(kanaIndex, charIndex);
    if (!element) return;

    // シンプルなクラス更新のみ
    element.classList.remove('current', 'completed', 'pending');
    element.classList.add(state);
  }

  // 軽量化: 基本的な進捗更新のみ
  updateProgress(progress: number): void {
    if (!this.container) return;
    this.container.setAttribute('data-progress', progress.toString());
  }
}

export const simpleDOM = new SimpleDOM();
