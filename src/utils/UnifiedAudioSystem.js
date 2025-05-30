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

    // 高速タイピング検出：連続キー入力間隔をチェック
    const now = performance.now();
    const keyInterval = now - this.lastKeyTime;
    this.lastKeyTime = now;
    
    // 100ms以下の連続入力で高速モード有効化
    if (keyInterval < 100) {
      this.highSpeedMode = true;
    } else if (keyInterval > 500) {
      this.highSpeedMode = false; // 500ms以上空いたら通常モードに戻す
    }

    // 高速タイピング対応：AudioContext状態チェック
    if (this.audioEngine === pureWebAudio && !this.audioEngine.isReady()) {
      this.audioEngine.resume();
      // 状態が復旧するまで少し待機してから再試行
      setTimeout(() => {
        if (this.audioEngine.isReady()) {
          this.audioEngine.playClick();
        }
      }, this.highSpeedMode ? 5 : 10); // 高速モードでは待機時間短縮
      return;
    }

    AudioPerformanceMonitor.measureLatency(() => {
      if (this.audioEngine === pureWebAudio) {
        this.audioEngine.playClick();
      } else {
        this.audioEngine.playClickSound();
      }
    }, this.highSpeedMode ? 'click-highspeed' : 'click-webaudio');
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
    
    // 高速タイピング対応：AudioContext状態チェック
    if (this.audioEngine === pureWebAudio && !this.audioEngine.isReady()) {
      this.audioEngine.resume();
      setTimeout(() => {
        if (this.audioEngine.isReady()) {
          this.audioEngine.playError();
        }
      }, this.highSpeedMode ? 5 : 10); // 高速モードでは待機時間短縮
      return;
    }
    
    AudioPerformanceMonitor.measureLatency(() => {
      if (this.audioEngine === pureWebAudio) {
        this.audioEngine.playError();
      } else {
        this.audioEngine.playErrorSound();
      }
    }, this.highSpeedMode ? 'error-highspeed' : 'error-webaudio');
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
