// UltraFastKeyboardSound.js - 🚨 DEPRECATED - 重複のため無効化
'use client';

// ⚠️ このファイルは InstantKeyboardSound.js と重複のため無効化
// AudioContext重複による遅延を防止

console.warn('🚨 UltraFastKeyboardSound は重複のため無効化されました。InstantKeyboardSound を使用してください。');

// 🔊 音量設定（typingmania-ref同等レベル）
const ULTRA_VOLUME = {
  click: 0.65,   // typingmania-ref同等：音量向上要請対応（0.4 → 0.65）
  error: 0.3,    // typingmania-ref同等：0.4 → 0.3（バランス調整）
  success: 0.35, // 正解音量維持
};

// AudioContext作成を無効化（重複防止）
let ctx = null;
let clickBuffer = null;
let errorBuffer = null;
let successBuffer = null;
let initialized = false;

class UltraFastKeyboardSound {
  // ⚠️ 全ての機能を無効化（重複防止）
  static init() {
    console.warn('🚨 UltraFastKeyboardSound.init() - 重複のため無効化');
    return false;
  }

  static createBuffersSync() {
    console.warn('🚨 UltraFastKeyboardSound.createBuffersSync() - 重複のため無効化');
    return false;
  }

  static playClick() {
    // 何もしない（重複防止）
    return false;
  }

  static playError() {
    // 何もしない（重複防止）
    return false;
  }

  static playSuccess() {
    // 何もしない（重複防止）
    return false;
  }

  static resume() {
    // 何もしない（重複防止）
    return false;
  }

  static isReady() {
    return false; // 常にfalse
  }

  // 統一インターフェース（無効化）
  static playClickSound() {
    return false;
  }

  static playErrorSound() {
    return false;
  }

  static playSuccessSound() {
    return false;
  }

  static playInstantClick() {
    // 何もしない（重複防止）
    return false;
  }
}

// ⚠️ 初期化を無効化（重複防止）
// モジュール読み込み時に即座に初期化
// if (typeof window !== 'undefined') {
//   UltraFastKeyboardSound.init();
// }

console.warn('🚨 UltraFastKeyboardSound モジュールは重複のため完全無効化されました');

export default UltraFastKeyboardSound;
