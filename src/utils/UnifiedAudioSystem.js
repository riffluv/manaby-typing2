// UnifiedAudioSystem.js - 🚀 純粋WebAudioシステム（MP3完全削除版）
'use client';

import UltraFastKeyboardSound from './UltraFastKeyboardSound';
import pureWebAudio from './PureWebAudioEngine.js';
import { AUDIO_CONFIG, AudioPerformanceMonitor } from './AudioConfig';

class UnifiedAudioSystem {
  static isInitialized = false;
  static audioEngine = null;
  static lastKeyTime = 0; // 高速タイピング検出用
  static highSpeedMode = false; // 高速タイピングモード

  // 🚀 初期化（純粋WebAudioのみ - アプリ起動時に一度だけ実行）
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // typingmania-ref風純粋WebAudioシステムを使用（最軽量）
      this.audioEngine = pureWebAudio;
      console.log('🚀 [WebAudioOnly] typingmania-ref風純粋WebAudioシステムを使用');
      
      // 即座に初期化（最軽量）
      await pureWebAudio.init();
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
    // typingmania-ref風：AudioContext状態チェック（最小限）
    if (this.audioEngine === pureWebAudio && !this.audioEngine.isReady()) {
      this.audioEngine.resume();
      // typingmania-ref風：待機時間を最小化（1ms）
      setTimeout(() => {
        if (this.audioEngine.isReady()) {
          this.audioEngine.playClick();
        }
      }, 1); // 最小待機時間
      return;
    }

    AudioPerformanceMonitor.measureLatency(() => {
      if (this.audioEngine === pureWebAudio) {
        this.audioEngine.playClick();
      } else {
        this.audioEngine.playClickSound();
      }
    }, 'click-ultrafast'); // 常に最高速モード表示
  }

  /** 🚀 正解音を再生（純粋WebAudio統一） */
  static playSuccessSound(volume = 1.0) {
    if (!this.isInitialized) {
      console.warn('⚠️ [WebAudioOnly] システムが初期化されていません');
      return;
    }
    
    AudioPerformanceMonitor.measureLatency(() => {
      if (this.audioEngine === pureWebAudio) {
        this.audioEngine.playSuccess();
      } else {
        this.audioEngine.playSuccessSound();
      }
    }, 'success-webaudio');
  }

  /** 🚀 不正解音を再生（高速タイピング対応強化版） */
  static playErrorSound(volume = 1.0) {
    if (!this.isInitialized) {
      console.warn('⚠️ [WebAudioOnly] システムが初期化されていません');
      return;
    }
    
    // typingmania-ref風：AudioContext状態チェック（最小限）
    if (this.audioEngine === pureWebAudio && !this.audioEngine.isReady()) {
      this.audioEngine.resume();
      setTimeout(() => {
        if (this.audioEngine.isReady()) {
          this.audioEngine.playError();
        }
      }, 1); // 最小待機時間
      return;
    }
    
    AudioPerformanceMonitor.measureLatency(() => {
      if (this.audioEngine === pureWebAudio) {
        this.audioEngine.playError();
      } else {
        this.audioEngine.playErrorSound();
      }
    }, 'error-ultrafast'); // 常に最高速モード表示
  }

  // パフォーマンス統計取得
  static getPerformanceStats() {
    return AudioPerformanceMonitor.getStats();
  }

  // パフォーマンス統計リセット
  static resetPerformanceStats() {
    AudioPerformanceMonitor.reset();
  }

  // 高速タイピング用：詳細パフォーマンス情報取得
  static getDetailedPerformanceInfo() {
    const baseStats = AudioPerformanceMonitor.getStats();
    const audioEngineInfo = this.audioEngine && this.audioEngine.getPerformanceInfo ? 
      this.audioEngine.getPerformanceInfo() : null;
    
    return {
      systemStats: baseStats,
      audioEngine: audioEngineInfo,
      engineType: this.audioEngine === pureWebAudio ? 'PureWebAudio' : 'UltraFast',
      initialized: this.isInitialized,
      timestamp: performance.now()
    };
  }

  // 使用中のエンジン名を取得
  static getCurrentEngine() {
    return 'pure-webaudio';
  }

  // 🚀 AudioContextのresume（初回遅延防止用）
  static async resumeAudioContext() {
    if (!this.isInitialized) await this.initialize();
    if (this.audioEngine === pureWebAudio) {
      this.audioEngine.resume();
    } else if (this.audioEngine && typeof this.audioEngine.resume === 'function') {
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
      audioEngine: this.audioEngine === pureWebAudio ? 'PureWebAudio' : 'UltraFast',
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
