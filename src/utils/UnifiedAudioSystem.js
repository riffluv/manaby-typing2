// UnifiedAudioSystem.js - 🚀 純粋WebAudioシステム（MP3完全削除版）
'use client';

import InstantKeyboardSound from './InstantKeyboardSound';
import { AUDIO_CONFIG } from './AudioConfig';

class UnifiedAudioSystem {
  static isInitialized = false;
  static audioEngine = null;

  // 🚀 typingmania-ref風: 即座初期化（遅延ゼロ）
  static async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioEngine = InstantKeyboardSound;
      InstantKeyboardSound.init();
      InstantKeyboardSound.ensureReady(); // 🚀 即座準備完了
      this.isInitialized = true;
    } catch (error) {
      // フォールバック：初期化強制実行
      this.audioEngine = InstantKeyboardSound;
      InstantKeyboardSound.init();
      this.isInitialized = true;
    }
  }

  // 🚀 typingmania-ref風: 即座音声再生（遅延ゼロ・条件チェック最小化）
  static playClickSound() {
    if (!this.isInitialized) this.initialize();
    if (this.audioEngine && this.audioEngine.ensureReady()) {
      this.audioEngine.playClickSound();
    }
  }

  static playSuccessSound() {
    if (!this.isInitialized) this.initialize();
    if (this.audioEngine && this.audioEngine.ensureReady()) {
      this.audioEngine.playSuccessSound();
    }
  }

  static playErrorSound() {
    if (!this.isInitialized) this.initialize();
    if (this.audioEngine && this.audioEngine.ensureReady()) {
      this.audioEngine.playErrorSound();
    }
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
