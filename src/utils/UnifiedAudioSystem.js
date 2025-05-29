// UnifiedAudioSystem.js - 統合音響システム
'use client';

import KeyboardSoundUtils from './KeyboardSoundUtils';
import LightweightKeyboardSound from './LightweightKeyboardSound';
import { AUDIO_CONFIG, AudioPerformanceMonitor } from './AudioConfig';

// --- BGM操作API ---
import {
  playBGM as _playBGM,
  stopBGM as _stopBGM,
  pauseBGM as _pauseBGM,
  resumeBGM as _resumeBGM,
  setBGMVolume as _setBGMVolume,
  setBGMEnabled as _setBGMEnabled
} from './soundPlayer';
import { playSound as _playSound, setEffectsEnabled as _setEffectsEnabled, setEffectsVolume as _setEffectsVolume } from './soundPlayer';

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

  /** 正解音を再生 */
  static playSuccessSound(volume = 1.0) {
    this.playSound('correct', volume);
  }

  /** 不正解音を再生 */
  static playErrorSound(volume = 1.0) {
    this.playSound('wrong', volume);
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

  // AudioContextのresume（初回遅延防止用）
  static async resumeAudioContext() {
    if (!this.isInitialized) await this.initialize();
    if (this.audioEngine && typeof this.audioEngine.resumeAudioContext === 'function') {
      await this.audioEngine.resumeAudioContext();
    }
  }

  // --- BGM操作API ---
  /**
   * BGM種別
   * @typedef {'game' | 'menu' | 'result'} BGMType
   */

  /**
   * BGMを再生
   * @param {BGMType} bgmType
   * @param {boolean} [loop=true]
   * @param {number} [volume=1.0]
   */
  static playBGM(bgmType, loop = true, volume = 1.0) {
    _playBGM(bgmType, loop, volume);
  }

  /** BGMを停止 */
  static stopBGM() {
    _stopBGM();
  }

  /** BGMを一時停止 */
  static pauseBGM() {
    _pauseBGM();
  }

  /** BGMを再開 */
  static resumeBGM() {
    _resumeBGM();
  }

  /** BGM音量を設定 */
  static setBGMVolume(volume) {
    _setBGMVolume(volume);
  }

  /** BGM有効/無効を設定 */
  static setBGMEnabled(enabled) {
    _setBGMEnabled(enabled);
  }

  /**
   * 効果音を再生
   * @param {'correct'|'wrong'} soundType
   * @param {number} [volume=1.0]
   */
  static playSound(soundType, volume = 1.0) {
    _playSound(soundType, volume);
  }

  /** 効果音有効/無効を設定 */
  static setEffectsEnabled(enabled) {
    _setEffectsEnabled(enabled);
  }

  /** 効果音音量を設定 */
  static setEffectsVolume(volume) {
    _setEffectsVolume(volume);
  }
}

export default UnifiedAudioSystem;
