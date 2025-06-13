// OptimizedAudioSystem.ts - 🚀 超高速統合音声システム（病みつきタイピング音響版）
'use client';

// 🎵 タイピング愛好家向け音量設定（高級キーボード音質）
const AUDIO_VOLUME = {
  click: 0.35,     // 心地よい打鍵音量（少し上げて満足感向上）
  error: 0.15,     // 優しいエラー音（不快感を排除）
  success: 0.28,   // 成功音
  clickVariant: 0.32, // バリエーション音量
};

interface AudioSystemInfo {
  engineType: string;
  isReady: boolean;
  contextState: string;
  timestamp: number;
}

class OptimizedAudioSystem {
  private static ctx: AudioContext | null = null;
  private static clickBuffer: AudioBuffer | null = null;
  private static clickVariantBuffers: AudioBuffer[] = []; // 🎵 複数バリエーション
  private static errorBuffer: AudioBuffer | null = null;
  private static successBuffer: AudioBuffer | null = null;
  private static isReady = false;
  // 🚀 超高速初期化（完全同期・遅延ゼロ）
  static init(): void {
    if (this.ctx) return;
      try {
      // @ts-expect-error - webkitAudioContext for Safari compatibility
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // 🚀 ユーザージェスチャー後のみAudioContextをResume（警告回避）
      // if (this.ctx.state === 'suspended') {
      //   this.ctx.resume();
      // }
      
      this.generateAudioBuffers();
      this.isReady = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      this.isReady = false;
    }
  }
  // 🎵 タイピング愛好家向け高品質音声バッファ生成
  static generateAudioBuffers(): void {
    if (!this.ctx) return;
    
    const sampleRate = this.ctx.sampleRate;
    
    // 🎹 メインクリック音生成（高級機械式キーボード風）
    this.generateMainClickSound(sampleRate);
    
    // 🎼 バリエーションクリック音生成（連打時の心地よさ向上）
    this.generateClickVariations(sampleRate);
    
    // 🔕 優しいエラー音生成（不快感ゼロ）
    this.generateGentleErrorSound(sampleRate);
    
    // 🎉 満足感のある成功音生成
    this.generateSatisfyingSuccessSound(sampleRate);
  }

  // 🎹 メインクリック音：HHKB/Realforce風の高品質音色
  private static generateMainClickSound(sampleRate: number): void {
    const duration = 0.08; // 少し長めで余韻を楽しむ
    const bufferSize = Math.floor(sampleRate * duration);
    this.clickBuffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = this.clickBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      
      // 🎵 高級キーボード風の複雑な倍音構成
      const fundamental = Math.sin(2 * Math.PI * 520 * t) * 0.6;  // 基音（少し高め）
      const harmonic2 = Math.sin(2 * Math.PI * 780 * t) * 0.25;   // 3/2倍音（完全5度）
      const harmonic3 = Math.sin(2 * Math.PI * 1040 * t) * 0.15;  // 2倍音（オクターブ）
      const harmonic4 = Math.sin(2 * Math.PI * 1300 * t) * 0.08;  // 高次倍音（キラキラ感）
      
      // 🎛️ ノイズ成分（機械的なリアリティ）
      const noise = (Math.random() - 0.5) * 0.02 * Math.exp(-t * 25);
      
      // 🎵 最終波形合成
      const wave = fundamental + harmonic2 + harmonic3 + harmonic4 + noise;
      
      // 🎚️ 自然な減衰エンベロープ（実物キーボード風）
      const envelope = Math.exp(-t * 15) * (1 - Math.exp(-t * 80));
      
      data[i] = wave * envelope * AUDIO_VOLUME.click;
    }
  }

  // 🎼 クリック音バリエーション：連続タイピングの単調さを防ぐ
  private static generateClickVariations(sampleRate: number): void {
    this.clickVariantBuffers = [];
    const baseFreqs = [495, 540, 485, 510]; // 微妙に異なる基音
    
    baseFreqs.forEach(baseFreq => {
      const duration = 0.07;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        
        // バリエーション豊かな倍音構成
        const fund = Math.sin(2 * Math.PI * baseFreq * t) * 0.55;
        const harm2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.2;
        const harm3 = Math.sin(2 * Math.PI * baseFreq * 2.0 * t) * 0.12;
        
        const wave = fund + harm2 + harm3;
        const envelope = Math.exp(-t * 18) * (1 - Math.exp(-t * 90));
        
        data[i] = wave * envelope * AUDIO_VOLUME.clickVariant;
      }
      
      this.clickVariantBuffers.push(buffer);
    });
  }

  // 🔕 優しいエラー音：不快感を排除したタイピング継続可能な音
  private static generateGentleErrorSound(sampleRate: number): void {
    const duration = 0.1; // 短めで邪魔にならない
    const bufferSize = Math.floor(sampleRate * duration);
    this.errorBuffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = this.errorBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      
      // 🎵 優しい周波数（不快な低音を避ける）
      const primary = Math.sin(2 * Math.PI * 320 * t) * 0.4;   // 明るめの低音
      const secondary = Math.sin(2 * Math.PI * 240 * t) * 0.3; // サブ音
      const smooth = Math.sin(2 * Math.PI * 160 * t) * 0.2;    // 丸みを加える
      
      const wave = primary + secondary + smooth;
      
      // 🎚️ 素早く減衰（邪魔にならない）
      const envelope = Math.exp(-t * 20) * (1 - Math.exp(-t * 50));
      
      data[i] = wave * envelope * AUDIO_VOLUME.error;
    }
  }

  // 🎉 満足感のある成功音：達成感を演出
  private static generateSatisfyingSuccessSound(sampleRate: number): void {
    const duration = 0.15;
    const bufferSize = Math.floor(sampleRate * duration);
    this.successBuffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = this.successBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      
      // 🎵 明るく心地よい和音構成（C5 + E5 + G5）
      const note1 = Math.sin(2 * Math.PI * 523 * t) * 0.4;  // C5
      const note2 = Math.sin(2 * Math.PI * 659 * t) * 0.3;  // E5  
      const note3 = Math.sin(2 * Math.PI * 784 * t) * 0.2;  // G5
      const sparkle = Math.sin(2 * Math.PI * 1047 * t) * 0.1; // 高音のキラメキ
      
      const wave = note1 + note2 + note3 + sparkle;
      
      // 🎚️ 余韻を楽しむエンベロープ
      const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 40));
      
      data[i] = wave * envelope * AUDIO_VOLUME.success;
    }
  }
  // 🚀 即座音声再生（typingmania-ref流・遅延ゼロ）
  static playSound(buffer: AudioBuffer | null): void {
    if (!this.isReady || !buffer || !this.ctx) return;
    
    try {
      const source = this.ctx.createBufferSource();      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start();
    } catch {
      // サイレント処理（パフォーマンス優先）
    }
  }
  // 🚀 病みつきクリック音再生（バリエーション付き）
  static playClickSound() {
    if (!this.isReady) this.init();
    
    // 🎲 ランダムでバリエーション音を混ぜて単調さを防ぐ
    if (Math.random() < 0.3 && this.clickVariantBuffers.length > 0) {
      const randomVariant = this.clickVariantBuffers[
        Math.floor(Math.random() * this.clickVariantBuffers.length)
      ];
      this.playSound(randomVariant);
    } else {
      this.playSound(this.clickBuffer);
    }
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
  static async resumeAudioContext(): Promise<void> {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // システム情報
  static getSystemInfo(): AudioSystemInfo {
    return {
      engineType: 'OptimizedAudio',
      isReady: this.isReady,
      contextState: this.ctx?.state || 'none',
      timestamp: performance.now()
    };
  }
}

export default OptimizedAudioSystem;
