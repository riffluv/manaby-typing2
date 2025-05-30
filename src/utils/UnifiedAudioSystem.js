// UnifiedAudioSystem.js - 🚀 超高速統合音響システム（爆速WebAudio + 超高速MP3）
'use client';

import UltraFastKeyboardSound from './UltraFastKeyboardSound';
import pureWebAudio from './PureWebAudioEngine.js';
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

  // 🚀 初期化（爆速WebAudioのみ - アプリ起動時に一度だけ実行）
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // typingmania-ref風純粋WebAudioシステムを使用（最軽量）
      this.audioEngine = pureWebAudio;
      console.log('🚀 [UnifiedAudioSystem] typingmania-ref風純粋WebAudioシステムを使用');
      
      // 即座に初期化（最軽量）
      await pureWebAudio.init();
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ [UnifiedAudioSystem] 初期化に失敗:', error);
      // フォールバック: UltraFastを使用
      this.audioEngine = UltraFastKeyboardSound;
      UltraFastKeyboardSound.init();
      this.isInitialized = true;
    }
  }  // 🚀 クリック音再生（爆速）
  static playClickSound() {
    if (!this.isInitialized) {
      console.warn('⚠️ [UnifiedAudioSystem] システムが初期化されていません');
      return;
    }

    AudioPerformanceMonitor.measureLatency(() => {
      if (this.audioEngine === pureWebAudio) {
        this.audioEngine.playClick();
      } else {
        this.audioEngine.playClickSound();
      }
    }, 'click-ultrafast');
  }

  /** 🚀 正解音を再生（爆速WebAudio統一） */
  static playSuccessSound(volume = 1.0) {
    // 🚀 正解音もWebAudioに統一（MP3ではなくWebAudio使用）
    if (!this.isInitialized) {
      console.warn('⚠️ [UnifiedAudioSystem] システムが初期化されていません');
      return;
    }
    
    AudioPerformanceMonitor.measureLatency(() => {
      if (this.audioEngine === pureWebAudio) {
        this.audioEngine.playSuccess();
      } else {
        this.audioEngine.playSuccessSound();
      }
    }, 'success-ultrafast');
  }

  /** 🚀 不正解音を再生（爆速WebAudio統一） */
  static playErrorSound(volume = 1.0) {
    // 🚀 不正解音もWebAudioに統一（MP3と同じような音質）
    if (!this.isInitialized) {
      console.warn('⚠️ [UnifiedAudioSystem] システムが初期化されていません');
      return;
    }
    
    AudioPerformanceMonitor.measureLatency(() => {
      if (this.audioEngine === pureWebAudio) {
        this.audioEngine.playError();
      } else {
        this.audioEngine.playErrorSound();
      }
    }, 'error-ultrafast');
  }

  // パフォーマンス統計取得
  static getPerformanceStats() {
    return AudioPerformanceMonitor.getStats();
  }

  // パフォーマンス統計リセット
  static resetPerformanceStats() {
    AudioPerformanceMonitor.reset();
  }

  // 使用中のエンジン名を取得（常に'ultrafast'）
  static getCurrentEngine() {
    return 'ultrafast';
  }

  // 🚀 AudioContextのresume（初回遅延防止用）
  static async resumeAudioContext() {
    if (!this.isInitialized) await this.initialize();
    if (this.audioEngine === pureWebAudio) {
      this.audioEngine.resume();
    } else if (this.audioEngine && typeof this.audioEngine.resumeAudioContext === 'function') {
      await this.audioEngine.resumeAudioContext();
    }
  }

  // --- 🚀 超高速BGM操作API ---
  /**
   * BGM種別
   * @typedef {'game' | 'menu' | 'result'} BGMType
   */

  /**
   * 🚀 超高速BGMを再生
   * @param {BGMType} bgmType
   * @param {boolean} [loop=true]
   * @param {number} [volume=1.0]
   */
  static playBGM(bgmType, loop = true, volume = 1.0) {
    _playBGM(bgmType, loop, volume);
  }

  /** 🚀 BGMを停止 */
  static stopBGM() {
    _stopBGM();
  }

  /** 🚀 BGMを一時停止 */
  static pauseBGM() {
    _pauseBGM();
  }

  /** 🚀 BGMを再開 */
  static resumeBGM() {
    _resumeBGM();
  }

  /** 🚀 BGM音量を設定 */
  static setBGMVolume(volume) {
    _setBGMVolume(volume);
  }

  /** 🚀 BGM有効/無効を設定 */
  static setBGMEnabled(enabled) {
    _setBGMEnabled(enabled);
  }

  /**
   * 🚀 超高速効果音を再生
   * @param {'correct'|'wrong'} soundType
   * @param {number} [volume=1.0]
   */
  static playSound(soundType, volume = 1.0) {
    _playSound(soundType, volume);
  }

  /** 🚀 効果音有効/無効を設定 */
  static setEffectsEnabled(enabled) {
    _setEffectsEnabled(enabled);
  }

  /** 🚀 効果音音量を設定 */
  static setEffectsVolume(volume) {
    _setEffectsVolume(volume);
  }

  // 🔄 音響システム切り替え機能
  
  /** 🚀 MP3版正解音を再生（切り替え用） */
  static playSuccessSoundMP3(volume = 1.0) {
    this.playSound('correct', volume);
  }

  /** 🚀 MP3版不正解音を再生（切り替え用） */
  static playErrorSoundMP3(volume = 1.0) {
    this.playSound('wrong', volume);
  }

  /** 
   * 🔄 音響システム統一切り替え
   * @param {'webaudio'|'mp3'} systemType - 使用する音響システム
   */
  static setAudioSystem(systemType) {
    if (systemType === 'mp3') {
      // MP3版に切り替え（正解・不正解ともにMP3）
      this.playSuccessSound = this.playSuccessSoundMP3;
      this.playErrorSound = this.playErrorSoundMP3;
      console.log('🎵 [UnifiedAudioSystem] MP3版音響システムに切り替え');
    } else {
      // WebAudio版に切り替え（正解・不正解ともにWebAudio）
      this.playSuccessSound = (volume = 1.0) => {
        if (!this.isInitialized) {
          console.warn('⚠️ [UnifiedAudioSystem] システムが初期化されていません');
          return;
        }
        AudioPerformanceMonitor.measureLatency(() => {
          if (this.audioEngine === pureWebAudio) {
            this.audioEngine.playSuccess();
          } else {
            this.audioEngine.playSuccessSound();
          }
        }, 'success-ultrafast');
      };
      this.playErrorSound = (volume = 1.0) => {
        if (!this.isInitialized) {
          console.warn('⚠️ [UnifiedAudioSystem] システムが初期化されていません');
          return;
        }
        AudioPerformanceMonitor.measureLatency(() => {
          if (this.audioEngine === pureWebAudio) {
            this.audioEngine.playError();
          } else {
            this.audioEngine.playErrorSound();
          }
        }, 'error-ultrafast');
      };
      console.log('⚡ [UnifiedAudioSystem] WebAudio版音響システムに切り替え');
    }
  }
}

export default UnifiedAudioSystem;
