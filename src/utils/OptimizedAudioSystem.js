// OptimizedAudioSystem.js - 🚀 超高速統合音声システム（競合削除・パフォーマンス最適化版）
'use client';

// 🔊 快適な音量設定
const AUDIO_VOLUME = {
  click: 0.3,      // 控えめな音量
  error: 0.2,     
  success: 0.25,
};

class OptimizedAudioSystem {
  static ctx = null;
  static clickBuffer = null;
  static errorBuffer = null;
  static successBuffer = null;
  static isReady = false;

  // 🚀 超高速初期化（完全同期・遅延ゼロ）
  static init() {
    if (this.ctx) return;
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // 🚀 AudioContext即座Resume（遅延除去）
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      
      this.generateAudioBuffers();
      this.isReady = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      this.isReady = false;
    }
  }

  // 🎵 純粋合成音声バッファ生成（MP3完全不使用）
  static generateAudioBuffers() {
    const sampleRate = this.ctx.sampleRate;
    
    // クリック音生成
    const clickDuration = 0.06;
    const clickBufferSize = Math.floor(sampleRate * clickDuration);
    this.clickBuffer = this.ctx.createBuffer(1, clickBufferSize, sampleRate);
    const clickData = this.clickBuffer.getChannelData(0);
    
    for (let i = 0; i < clickBufferSize; i++) {
      const t = i / sampleRate;
      const wave = Math.sin(2 * Math.PI * 440 * t) * 0.6 + 
                  Math.sin(2 * Math.PI * 880 * t) * 0.2;
      clickData[i] = wave * Math.exp(-t * 12) * AUDIO_VOLUME.click;
    }
    
    // エラー音生成
    const errorDuration = 0.12;
    const errorBufferSize = Math.floor(sampleRate * errorDuration);
    this.errorBuffer = this.ctx.createBuffer(1, errorBufferSize, sampleRate);
    const errorData = this.errorBuffer.getChannelData(0);
    
    for (let i = 0; i < errorBufferSize; i++) {
      const t = i / sampleRate;
      const wave = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 8);
      errorData[i] = wave * AUDIO_VOLUME.error;
    }
    
    // 成功音生成
    const successDuration = 0.15;
    const successBufferSize = Math.floor(sampleRate * successDuration);
    this.successBuffer = this.ctx.createBuffer(1, successBufferSize, sampleRate);
    const successData = this.successBuffer.getChannelData(0);
    
    for (let i = 0; i < successBufferSize; i++) {
      const t = i / sampleRate;
      const wave = Math.sin(2 * Math.PI * 523 * t) * 0.5 + 
                  Math.sin(2 * Math.PI * 659 * t) * 0.3;
      successData[i] = wave * Math.exp(-t * 6) * AUDIO_VOLUME.success;
    }
  }

  // 🚀 即座音声再生（typingmania-ref流・遅延ゼロ）
  static playSound(buffer) {
    if (!this.isReady || !buffer) return;
    
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start();
    } catch (error) {
      // サイレント処理（パフォーマンス優先）
    }
  }

  // 🚀 公開API（シンプル・高速）
  static playClickSound() {
    if (!this.isReady) this.init();
    this.playSound(this.clickBuffer);
  }

  static playErrorSound() {
    if (!this.isReady) this.init();
    this.playSound(this.errorBuffer);
  }

  static playSuccessSound() {
    if (!this.isReady) this.init();
    this.playSound(this.successBuffer);
  }

  // 🚀 AudioContext復旧（必要時のみ）
  static async resumeAudioContext() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // システム情報
  static getSystemInfo() {
    return {
      engineType: 'OptimizedAudio',
      isReady: this.isReady,
      contextState: this.ctx?.state || 'none',
      timestamp: performance.now()
    };
  }
}

export default OptimizedAudioSystem;
