// UnifiedAudioSystem.js - 🚀 純粋WebAudioシステム（MP3完全削除版）
'use client';

import UltraFastKeyboardSound from './UltraFastKeyboardSound';
import { AUDIO_CONFIG } from './AudioConfig';

class UnifiedAudioSystem {
  static isInitialized = false;
  static audioEngine = null;
  static lastKeyTime = 0; // 高速タイピング検出用
  static highSpeedMode = false; // 高速タイピングモード

  // 🚀 初期化（純粋WebAudioのみ - アプリ起動時に一度だけ実行）
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // UltraFastKeyboardSoundを使用（最軽量）
      this.audioEngine = UltraFastKeyboardSound;
      console.log('🚀 [WebAudioOnly] UltraFastKeyboardSoundシステムを使用');
      
      // 即座に初期化（最軽量）
      UltraFastKeyboardSound.init();
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ [WebAudioOnly] 初期化に失敗:', error);
      // フォールバック: UltraFastを使用
      this.audioEngine = UltraFastKeyboardSound;
      UltraFastKeyboardSound.init();
      this.isInitialized = true;
    }
  }

  // 🚀 クリック音再生（高速タイピング対応強化版）
  static playClickSound() {
    if (!this.isInitialized) {
      console.warn('⚠️ [WebAudioOnly] システムが初期化されていません');
      return;
    }

    // typingmania-ref風：高速タイピング検出の完全排除
    const now = performance.now();
    const keyInterval = now - this.lastKeyTime;
    this.lastKeyTime = now;
    
    // typingmania-ref風：条件なしで常に最高速モード
    this.highSpeedMode = true;

    // typingmania-ref風：AudioContext状態チェック（最小限）
    if (this.audioEngine && !this.audioEngine.isReady()) {
      this.audioEngine.resume();
      // typingmania-ref風：待機時間を最小化（1ms）
      setTimeout(() => {
        if (this.audioEngine.isReady()) {
          this.audioEngine.playClickSound();
        }
      }, 1); // 最小待機時間
      return;
    }

    this.audioEngine.playClickSound();
  }

  /** 🚀 正解音を再生（純粋WebAudio統一） */
  static playSuccessSound(volume = 1.0) {
    if (!this.isInitialized) {
      console.warn('⚠️ [WebAudioOnly] システムが初期化されていません');
      return;
    }
    
    this.audioEngine.playSuccessSound();
  }

  /** 🚀 不正解音を再生（高速タイピング対応強化版） */
  static playErrorSound(volume = 1.0) {
    if (!this.isInitialized) {
      console.warn('⚠️ [WebAudioOnly] システムが初期化されていません');
      return;
    }
    
    // typingmania-ref風：AudioContext状態チェック（最小限）
    if (this.audioEngine && !this.audioEngine.isReady()) {
      this.audioEngine.resume();
      setTimeout(() => {
        if (this.audioEngine.isReady()) {
          this.audioEngine.playErrorSound();
        }
      }, 1); // 最小待機時間
      return;
    }
    
    this.audioEngine.playErrorSound();
  }

  // システム情報取得
  static getSystemInfo() {
    return {
      engineType: 'UltraFast',
      isInitialized: this.isInitialized,
      highSpeedMode: this.highSpeedMode,
      initialized: this.isInitialized,
      timestamp: performance.now()
    };
  }

  // 使用中のエンジン名を取得
  static getCurrentEngine() {
    return 'ultra-fast';
  }

  // 🚀 AudioContextのresume（初回遅延防止用）
  static async resumeAudioContext() {
    if (!this.isInitialized) await this.initialize();
    if (this.audioEngine && typeof this.audioEngine.resume === 'function') {
      this.audioEngine.resume();
    }
  }

  /**
   * 🚀 高速タイピング統計情報を取得
   */
  static getHighSpeedStats() {
    return {
      highSpeedMode: this.highSpeedMode,
      lastKeyTime: this.lastKeyTime,
      audioEngine: 'UltraFast',
      performance: this.audioEngine?.getPerformanceInfo ? this.audioEngine.getPerformanceInfo() : null
    };
  }

  /**
   * 🚀 高速タイピングモードを手動設定
   */
  static setHighSpeedMode(enabled) {
    this.highSpeedMode = enabled;
    console.log(`🚀 [WebAudioOnly] 高速タイピングモード: ${enabled ? 'ON' : 'OFF'}`);
  }

  // BGM・効果音操作は削除（WebAudioのみでシンプル化）
  // 必要に応じてWebAudioで実装可能

}

export default UnifiedAudioSystem;
