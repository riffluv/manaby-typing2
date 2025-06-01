/**
 * ⚠️ DEPRECATED - AudioContext重複による遅延防止のため無効化
 * 
 * InstantKeyboardSound.js を使用してください
 * このファイルはAudioSystemManagerでのみ使用されていましたが、
 * 複数AudioContext作成による遅延を防ぐため無効化します
 */
'use client';

console.warn('🚨 OptimizedTypingAudio は重複のため無効化されました。InstantKeyboardSound を使用してください。');

// 音量設定（typingmania-ref同等）
const OPTIMIZED_VOLUME = {
  click: 0.65,
  error: 0.3,
  success: 0.35,
};

// AudioContext作成を無効化（重複防止）
let ctx: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;
let errorBuffer: AudioBuffer | null = null;
let successBuffer: AudioBuffer | null = null;
let initialized = false;

export class OptimizedTypingAudio {
  // ⚠️ 全ての機能を無効化（重複防止）
  static init() {
    console.warn('🚨 OptimizedTypingAudio.init() - 重複のため無効化');
    return false;
  }

  static createBuffers() {
    console.warn('🚨 OptimizedTypingAudio.createBuffers() - 重複のため無効化');
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

  static isReady() {
    return false; // 常にfalse
  }

  static getStatus() {
    return {
      initialized: false,
      contextReady: false,
      buffersReady: false
    };
  }
}

// 自動初期化
if (typeof window !== 'undefined') {
  OptimizedTypingAudio.init();
}

export default OptimizedTypingAudio;
