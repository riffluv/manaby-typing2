// UnifiedAudioSystem.js - 🚀 純粋WebAudioシステム（MP3完全削除版）
'use client';

import InstantKeyboardSound from './InstantKeyboardSound';
import { AUDIO_CONFIG } from './AudioConfig';

class UnifiedAudioSystem {
  static isInitialized = false;
  static audioEngine = null;

  // 🚀 typingmania-ref風: 即座初期化
  static async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioEngine = InstantKeyboardSound;
      InstantKeyboardSound.init();
      this.isInitialized = true;
    } catch (error) {
      this.audioEngine = InstantKeyboardSound;
      InstantKeyboardSound.init();
      this.isInitialized = true;
    }
  }

  // 🚀 typingmania-ref風: 即座音声再生（条件チェック一切なし）
  static playClickSound() {
    if (!this.isInitialized) return;
    this.audioEngine.playClickSound();
  }

  static playSuccessSound() {
    if (!this.isInitialized) return;
    this.audioEngine.playSuccessSound();
  }

  static playErrorSound() {
    if (!this.isInitialized) return;
    this.audioEngine.playErrorSound();
  }

  // システム情報取得
  static getSystemInfo() {
    return {
      engineType: 'Instant',
      isInitialized: this.isInitialized,
      initialized: this.isInitialized,
      timestamp: performance.now()
    };
  }

  static getCurrentEngine() {
    return 'instant';
  }

  static async resumeAudioContext() {
    if (!this.isInitialized) await this.initialize();
    if (this.audioEngine && typeof this.audioEngine.resume === 'function') {
      this.audioEngine.resume();
    }
  }
}

export default UnifiedAudioSystem;
