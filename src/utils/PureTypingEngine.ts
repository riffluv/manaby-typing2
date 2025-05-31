/**
 * typingmania-ref完全互換 純粋タイピングエンジン
 * 
 * React仮想DOMを完全にバイパスし、typingmania-refと同等の
 * 超高速レスポンスを実現する純粋なJavaScript実装
 */

import { TypingChar } from './OptimizedTypingChar';
import { createOptimizedTypingChars } from './optimizedJapaneseUtils';
import UnifiedAudioSystem from './UnifiedAudioSystem';

export interface PureTypingEngineCallbacks {
  onKeyAccepted: (key: string, point: number) => void;
  onKeyRejected: (key: string) => void;
  onCharCompleted: (charIndex: number) => void;
  onWordCompleted: () => void;
  onDisplayUpdate: (display: {
    acceptedText: string;
    remainingText: string;
    currentCharIndex: number;
  }) => void;
}

export class PureTypingEngine {
  private container: HTMLElement | null = null;
  private typingChars: TypingChar[] = [];
  private currentCharIndex = 0;
  private charElements: HTMLSpanElement[] = [];
  private callbacks: PureTypingEngineCallbacks;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private audioEnabled = true;

  constructor(callbacks: PureTypingEngineCallbacks) {
    this.callbacks = callbacks;
    this.setupGlobalKeyHandler();
  }

  /**
   * typingmania-ref流: グローバルキーハンドラー設定
   */
  private setupGlobalKeyHandler() {
    this.keyHandler = (e: KeyboardEvent) => {
      // typingmania-ref互換: 必要なキーのみ許可
      if (e.key.toLowerCase() === 'r' && (e.metaKey || e.ctrlKey)) {
        return; // ページリフレッシュ許可
      } else if (e.key === 'F12') {
        return; // デベロッパーツール許可
      } else {
        e.preventDefault();
        e.stopPropagation();
      }

      // タイピング処理（1文字キーのみ）
      if (e.key.length === 1) {
        this.processKeyInput(e.key);
      }
    };

    // グローバルに1つのリスナーのみ設定
    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * コンテナDOMを設定
   */
  setContainer(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 新しい単語を設定
   */
  setWord(hiragana: string) {
    if (!hiragana) return;

    // typingmania-ref流: シンプルな初期化
    this.typingChars = createOptimizedTypingChars(hiragana);
    this.currentCharIndex = 0;
    this.buildDOM();
    this.updateDisplay();
  }

  /**
   * typingmania-ref流: 直接DOM構築
   */
  private buildDOM() {
    if (!this.container) return;

    // 既存要素をクリア
    this.container.innerHTML = '';
    this.charElements = [];

    // 各文字のDOM要素を直接作成
    this.typingChars.forEach((char, index) => {
      const displayInfo = char.getDisplayInfo();
      const charElement = document.createElement('span');
      
      charElement.className = index === 0 ? 'typing-char current' : 'typing-char pending';
      charElement.textContent = displayInfo.displayText;
      charElement.setAttribute('data-char-index', index.toString());
      
      this.container!.appendChild(charElement);
      this.charElements.push(charElement);
    });
  }

  /**
   * typingmania-ref流: キー入力処理
   */
  private processKeyInput(key: string) {
    if (this.currentCharIndex >= this.typingChars.length) return;

    const currentChar = this.typingChars[this.currentCharIndex];
    if (!currentChar) return;

    // typingmania-ref互換: accept メソッド使用
    const result = currentChar.accept(key);

    if (result >= 0) {
      // 正解
      this.callbacks.onKeyAccepted(key, result);
      
      // 音声再生（最高速）
      if (this.audioEnabled) {
        UnifiedAudioSystem.playClickSound();
      }

      // 文字完了チェック
      if (currentChar.isCompleted()) {
        this.callbacks.onCharCompleted(this.currentCharIndex);
        this.currentCharIndex++;

        // 単語完了チェック
        if (this.currentCharIndex >= this.typingChars.length) {
          this.callbacks.onWordCompleted();
          return;
        }
      }

      this.updateDisplay();
    } else {
      // ミス
      this.callbacks.onKeyRejected(key);
      
      // エラー音声再生
      if (this.audioEnabled) {
        UnifiedAudioSystem.playErrorSound();
      }
    }
  }

  /**
   * typingmania-ref流: 最小限の表示更新
   */
  private updateDisplay() {
    // DOM直接更新（最高速）
    this.charElements.forEach((element, index) => {
      let newClass = 'typing-char ';
      
      if (index < this.currentCharIndex) {
        newClass += 'completed';
      } else if (index === this.currentCharIndex) {
        newClass += 'current';
      } else {
        newClass += 'pending';
      }

      // クラス変更（必要な場合のみ）
      if (element.className !== newClass) {
        element.className = newClass;
      }
    });

    // コールバック通知
    const currentChar = this.typingChars[this.currentCharIndex];
    if (currentChar) {
      const displayInfo = currentChar.getDisplayInfo();
      this.callbacks.onDisplayUpdate({
        acceptedText: displayInfo.acceptedText,
        remainingText: displayInfo.remainingText,
        currentCharIndex: this.currentCharIndex,
      });
    }
  }

  /**
   * 音声設定
   */
  setAudioEnabled(enabled: boolean) {
    this.audioEnabled = enabled;
  }

  /**
   * リセット
   */
  reset() {
    this.currentCharIndex = 0;
    this.typingChars.forEach(char => {
      if (char.reset) {
        char.reset();
      }
    });
    this.updateDisplay();
  }

  /**
   * 破棄
   */
  destroy() {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  /**
   * 現在の進捗情報を取得
   */
  getProgress() {
    return {
      currentCharIndex: this.currentCharIndex,
      totalChars: this.typingChars.length,
      completed: this.currentCharIndex >= this.typingChars.length,
    };
  }
}
