/**
 * UltraFastAudioSystem - typingmania-ref流のゼロ遅延音響システム
 * 
 * 40年のタイピング経験者向け超高速レスポンス実装
 * - requestAnimationFrame排除
 * - 複雑なレイヤリング排除
 * - 即座実行のみ
 */
'use client';

// 🚀 タイピング愛好家向け最適音量（typingmania-ref互換）
const ULTRA_FAST_VOLUME = {
  click: 0.4,     // 心地よい打鍵音
  error: 0.2,     // 優しいエラー音
  success: 0.3,   // 成功音
};

class UltraFastAudioSystem {
  private static ctx: AudioContext | null = null;
  private static clickBuffer: AudioBuffer | null = null;
  private static errorBuffer: AudioBuffer | null = null;
  private static successBuffer: AudioBuffer | null = null;
  private static isReady = false;
  // 🚀 typingmania-ref流：超高速初期化
  static init(): void {
    if (this.ctx) return;
    
    try {
      // Safari対応のためのWebkit互換性処理
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.generateSimpleBuffers();
      this.isReady = true;
    } catch (error) {
      console.warn('UltraFastAudio initialization failed:', error);
      this.isReady = false;
    }
  }

  // 🎵 typingmania-ref流：シンプルで高品質なバッファ生成
  private static generateSimpleBuffers(): void {
    if (!this.ctx) return;
    
    const sampleRate = this.ctx.sampleRate;
    
    // 🎹 メインクリック音（HHKB風）
    this.generateClickSound(sampleRate);
    
    // 🔕 エラー音（優しく）
    this.generateErrorSound(sampleRate);
    
    // 🎉 成功音
    this.generateSuccessSound(sampleRate);
  }

  // 🎹 typingmania-ref流クリック音
  private static generateClickSound(sampleRate: number): void {
    const duration = 0.06;
    const bufferSize = Math.floor(sampleRate * duration);
    this.clickBuffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = this.clickBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      
      // シンプルで美しい倍音構成
      const fundamental = Math.sin(2 * Math.PI * 520 * t) * 0.6;
      const harmonic = Math.sin(2 * Math.PI * 780 * t) * 0.25;
      const sparkle = Math.sin(2 * Math.PI * 1040 * t) * 0.15;
      
      const wave = fundamental + harmonic + sparkle;
      const envelope = Math.exp(-t * 18) * (1 - Math.exp(-t * 80));
      
      data[i] = wave * envelope * ULTRA_FAST_VOLUME.click;
    }
  }

  // 🔕 優しいエラー音
  private static generateErrorSound(sampleRate: number): void {
    const duration = 0.08;
    const bufferSize = Math.floor(sampleRate * duration);
    this.errorBuffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = this.errorBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      
      const primary = Math.sin(2 * Math.PI * 320 * t) * 0.5;
      const secondary = Math.sin(2 * Math.PI * 240 * t) * 0.3;
      
      const wave = primary + secondary;
      const envelope = Math.exp(-t * 20) * (1 - Math.exp(-t * 50));
      
      data[i] = wave * envelope * ULTRA_FAST_VOLUME.error;
    }
  }

  // 🎉 成功音
  private static generateSuccessSound(sampleRate: number): void {
    const duration = 0.12;
    const bufferSize = Math.floor(sampleRate * duration);
    this.successBuffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = this.successBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      
      const note1 = Math.sin(2 * Math.PI * 523 * t) * 0.4;  // C5
      const note2 = Math.sin(2 * Math.PI * 659 * t) * 0.3;  // E5
      const note3 = Math.sin(2 * Math.PI * 784 * t) * 0.2;  // G5
      
      const wave = note1 + note2 + note3;
      const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 40));
      
      data[i] = wave * envelope * ULTRA_FAST_VOLUME.success;
    }
  }

  // 🚀 typingmania-ref流：即座音声再生（遅延ゼロ）
  private static playSound(buffer: AudioBuffer | null): void {
    if (!this.isReady || !buffer || !this.ctx) return;
    
    // typingmania-ref同様の超シンプル再生
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start();
  }
  // 🚀 パブリックAPI（typingmania-ref互換）
  static playClickSound(): void {
    if (!this.isReady) this.init();
    if (this.isReady && this.clickBuffer) {
      this.playSound(this.clickBuffer);
    }
  }

  static playErrorSound(): void {
    if (!this.isReady) this.init();
    if (this.isReady && this.errorBuffer) {
      this.playSound(this.errorBuffer);
    }
  }

  static playSuccessSound(): void {
    if (!this.isReady) this.init();
    if (this.isReady && this.successBuffer) {
      this.playSound(this.successBuffer);
    }
  }

  // 🚀 AudioContext復旧（必要時のみ）
  static async resumeAudioContext(): Promise<void> {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // システム情報
  static getSystemInfo() {
    return {
      engineType: 'UltraFastAudio',
      isReady: this.isReady,
      contextState: this.ctx?.state || 'none',
      timestamp: performance.now()
    };
  }
}

export default UltraFastAudioSystem;
