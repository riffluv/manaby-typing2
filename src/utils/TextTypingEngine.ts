// TextTypingEngine: typingmania-ref流の日本語タイピング最小ロジック
// UIなし・テキスト状態のみ・キーフォーカス（t=と問題含む）対応

import { createOptimizedTypingChars } from './optimizedJapaneseUtils';
import type { TypingChar } from './OptimizedTypingChar';

export type TypingEngineState = {
  chars: TypingChar[];
  currentKanaIndex: number;
  // 今押すべきキー（ローマ字1文字）
  currentKey: string;
  // 進行状況テキスト
  accepted: string;
  remaining: string;
  // 今のかな
  currentKana: string;
  // 今のローマ字パターン
  currentRomaji: string;
  // そのかなの全パターン
  currentPatterns: string[];
  // 完了フラグ
  completed: boolean;
};

export class TextTypingEngine {
  private chars: TypingChar[] = [];
  private currentKanaIndex = 0;

  constructor(hiragana: string) {
    this.chars = createOptimizedTypingChars(hiragana);
    this.currentKanaIndex = 0;
  }

  getState(): TypingEngineState {
    const char = this.chars[this.currentKanaIndex];
    const accepted = this.chars.map(c => c.acceptedInput).join('');
    const remaining = this.chars.map(c => c.remainingText).join('');
    return {
      chars: this.chars,
      currentKanaIndex: this.currentKanaIndex,
      currentKey: char ? (char.remainingText[0] || '') : '',
      accepted,
      remaining,
      currentKana: char ? char.kana : '',
      currentRomaji: char ? char.patterns[0] : '',
      currentPatterns: char ? char.getActivePatterns() : [],
      completed: this.currentKanaIndex >= this.chars.length
    };
  }

  /**
   * キー入力処理（1文字）
   * @param key 入力キー
   * @returns 正解:true, ミス:false
   */
  input(key: string): boolean {
    if (this.currentKanaIndex >= this.chars.length) return false;
    const char = this.chars[this.currentKanaIndex];
    if (char.canAccept(key)) {
      char.accept(key);
      if (char.isCompleted()) {
        this.currentKanaIndex++;
      }
      return true;
    }
    return false;
  }

  /**
   * リセット
   */
  reset() {
    this.chars.forEach(c => c.reset());
    this.currentKanaIndex = 0;
  }
}

// --- サンプル実行コード（Node/ブラウザ両対応） ---
// import { TextTypingEngine } from './TextTypingEngine';
// const engine = new TextTypingEngine('とまとたべたい');
// console.log(engine.getState());
// engine.input('t'); // ...
// 状態を見ながら accepted/remaining/currentKey で進行状況・キーフォーカスを判定できます
