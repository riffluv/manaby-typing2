// UnifiedAudioSystem.js - 統合音響システム
'use client';

import KeyboardSoundUtils from './KeyboardSoundUtils';
import LightweightKeyboardSound from './LightweightKeyboardSound';
import { AUDIO_CONFIG, AudioPerformanceMonitor } from './AudioConfig';

class UnifiedAudioSystem {
  static isInitialized = false;
  static audioEngine = null;

  // 初期化（アプリ起動時に一度だけ実行）
  static async initialize() {
    if (this.isInitialized) return;

    try {
      if (AUDIO_CONFIG.ENGINE === 'lightweight') {
        this.audioEngine = LightweightKeyboardSound;
        
        if (AUDIO_CONFIG.AUTO_INITIALIZE) {
          console.log('[UnifiedAudioSystem] 軽量版音響システムを初期化中...');
          await LightweightKeyboardSound.initializePrerenderedBuffers();
          console.log('[UnifiedAudioSystem] 軽量版音響システム初期化完了');
        }
      } else {
        this.audioEngine = KeyboardSoundUtils;
        console.log('[UnifiedAudioSystem] レガシー音響システムを使用');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[UnifiedAudioSystem] 初期化に失敗:', error);
      // フォールバックとしてレガシーシステムを使用
      this.audioEngine = KeyboardSoundUtils;
      this.isInitialized = true;
    }
  }

  // クリック音再生
  static playClickSound() {
    if (!this.isInitialized) {
      console.warn('[UnifiedAudioSystem] システムが初期化されていません');
      return;
    }    AudioPerformanceMonitor.measureLatency(() => {
      this.audioEngine.playClickSound();
    }, `click-${AUDIO_CONFIG.ENGINE}`);
  }

  // エラー音再生
  static playErrorSound() {
    if (!this.isInitialized) {
      console.warn('[UnifiedAudioSystem] システムが初期化されていません');
      return;
    }

    AudioPerformanceMonitor.measureLatency(() => {
      this.audioEngine.playErrorSound();
    }, 'error');
  }

  // 成功音再生
  static playSuccessSound() {
    if (!this.isInitialized) {
      console.warn('[UnifiedAudioSystem] システムが初期化されていません');
      return;
    }

    AudioPerformanceMonitor.measureLatency(() => {
      this.audioEngine.playSuccessSound();
    }, 'success');
  }

  // パフォーマンス統計取得
  static getPerformanceStats() {
    return AudioPerformanceMonitor.getStats();
  }

  // パフォーマンス統計リセット
  static resetPerformanceStats() {
    AudioPerformanceMonitor.reset();
  }

  // 使用中のエンジン名を取得
  static getCurrentEngine() {
    return AUDIO_CONFIG.ENGINE;
  }

  // エンジンを動的に切り替え（デバッグ用）
  static async switchEngine(engineType) {
    if (engineType === AUDIO_CONFIG.ENGINE) return;

    console.log(`[UnifiedAudioSystem] エンジンを ${AUDIO_CONFIG.ENGINE} から ${engineType} に切り替え`);
    
    AUDIO_CONFIG.ENGINE = engineType;
    this.isInitialized = false;
    await this.initialize();
  }
}

export default UnifiedAudioSystem;
