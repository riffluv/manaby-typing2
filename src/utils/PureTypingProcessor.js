// PureTypingProcessor.js - typingmania-ref風純粋タイピング処理（最軽量版）
'use client';

import pureWebAudio from './PureWebAudioEngine.js';

/**
 * typingmania-ref風の純粋なタイピング処理クラス
 * React フックやuseEffect を一切使わない軽量実装
 */
class PureTypingProcessor {
  constructor() {
    this.currentWord = null;
    this.typingChars = [];
    this.currentKanaIndex = 0;
    this.acceptedInput = '';
    this.onUpdate = null;
    this.keyHandler = null;
    this.stats = {
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0
    };
  }

  // typingmania-ref風：単語セット
  setWord(word) {
    this.currentWord = word;
    this.typingChars = word.kanaArray.map(kana => ({
      kana: kana.kana,
      patterns: kana.patterns,
      acceptedInput: '',
      completed: false,
      remainingText: kana.patterns[0] || ''
    }));
    this.currentKanaIndex = 0;
    this.acceptedInput = '';
    this.stats = {
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0
    };
  }

  // typingmania-ref風：キー入力処理
  processKey(key) {
    if (!this.currentWord || this.currentKanaIndex >= this.typingChars.length) {
      return;
    }

    // 初回入力時の開始時間記録
    if (this.stats.keyCount === 0) {
      this.stats.startTime = performance.now();
    }

    this.stats.keyCount++;
    const currentChar = this.typingChars[this.currentKanaIndex];

    // typingmania-ref風：シンプルな入力判定
    const normalizedKey = key.toLowerCase();
    const newInput = currentChar.acceptedInput + normalizedKey;

    // パターンマッチング
    let matched = false;
    for (const pattern of currentChar.patterns) {
      if (newInput.length <= pattern.length && 
          newInput === pattern.substring(0, newInput.length)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      // 正解処理
      currentChar.acceptedInput = newInput;
      
      // 残りテキスト更新
      this.updateRemainingText(currentChar);
      
      // 文字完了チェック
      if (currentChar.remainingText === '') {
        currentChar.completed = true;
        this.currentKanaIndex++;
      }

      // 音響フィードバック（typingmania-ref風）
      pureWebAudio.playClick();
      
      // 表示更新通知
      if (this.onUpdate) {
        this.onUpdate({
          currentKanaIndex: this.currentKanaIndex,
          acceptedText: currentChar.acceptedInput,
          remainingText: currentChar.remainingText,
          completed: this.currentKanaIndex >= this.typingChars.length
        });
      }
    } else {
      // エラー処理
      this.stats.mistakeCount++;
      pureWebAudio.playError();
    }
  }

  // typingmania-ref風：残りテキスト計算
  updateRemainingText(char) {
    let shortestRemaining = '';
    let shortestLength = Infinity;

    for (const pattern of char.patterns) {
      if (char.acceptedInput.length <= pattern.length &&
          char.acceptedInput === pattern.substring(0, char.acceptedInput.length)) {
        const remaining = pattern.substring(char.acceptedInput.length);
        if (remaining.length < shortestLength) {
          shortestRemaining = remaining;
          shortestLength = remaining.length;
        }
      }
    }

    char.remainingText = shortestRemaining;
  }

  // typingmania-ref風：キーイベント監視開始
  startListening() {
    if (this.keyHandler) return;

    this.keyHandler = (e) => {
      // typingmania-ref風：即座にイベント制御
      e.preventDefault();
      e.stopPropagation();
      
      // 特殊キーは無視
      if (e.key.length > 1) return;
      
      // 即座に処理（遅延なし）
      this.processKey(e.key);
    };

    // typingmania-ref風：グローバルイベント監視
    window.addEventListener('keydown', this.keyHandler);
  }

  // typingmania-ref風：監視停止
  stopListening() {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  // 更新コールバック設定
  setUpdateCallback(callback) {
    this.onUpdate = callback;
  }

  // 現在の状態取得
  getCurrentState() {
    const currentChar = this.typingChars[this.currentKanaIndex];
    return {
      currentKanaIndex: this.currentKanaIndex,
      acceptedText: currentChar ? currentChar.acceptedInput : '',
      remainingText: currentChar ? currentChar.remainingText : '',
      completed: this.currentKanaIndex >= this.typingChars.length,
      stats: { ...this.stats }
    };
  }
}

export default PureTypingProcessor;
