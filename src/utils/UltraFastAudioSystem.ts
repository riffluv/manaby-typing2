/**
 * UltraFastAudioSystem - メカニカルキーボード風のゼロ遅延音響システム
 * 
 * 40年のタイピング経験者向け超高速レスポンス実装
 * 
 * 🎹 メカニカルスイッチ音響特性：
 * - Cherry MX Blue軸風クリック音: カチカチ音が特徴的な正解音
 * - エラー音: 優しい低音の間違い音
 * 
 * 🔧 物理特性模倣：
 * - 接点接触音（高周波クリック）
 * - スプリング共振（金属音）
 * - プラスチック共振（基音）
 * - キーボトミング（底突き音）
 * - スプリング反発音（リリース音）
 * - 摩擦ノイズ（リアリティ向上）
 * 
 * ⚡ 最適化：
 * - requestAnimationFrame排除
 * - 複雑なレイヤリング排除  
 * - 即座実行のみ
 */
'use client';

// 🚀 タイピング愛好家向け最適音量（メカニカルキーボード風）
const ULTRA_FAST_VOLUME = {
  click: 0.5,     // メカニカルキーボードらしい心地よい打鍵音
  error: 0.5,     // 不正解音（正解音と同音量）
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
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.generateSimpleBuffers();
      this.isReady = true;
    } catch (error) {
      console.warn('UltraFastAudio initialization failed:', error);
      this.isReady = false;
    }
  }  // 🎵 typingmania-ref流：シンプルで高品質なバッファ生成
  private static generateSimpleBuffers(): void {
    if (!this.ctx) return;
    
    const sampleRate = this.ctx.sampleRate;
    
    // 🎹 メインクリック音（Cherry MX Blue軸風）
    this.generateClickSound(sampleRate);
    
    // 🔕 エラー音（優しく）
    this.generateErrorSound(sampleRate);
    
    // 🎉 成功音
    this.generateSuccessSound(sampleRate);
  }// 🎹 メカニカルキーボード風クリック音（Cherry MX Blue軸風）
  private static generateClickSound(sampleRate: number): void {
    const duration = 0.10; // メカニカル感を演出するために少し長め
    const bufferSize = Math.floor(sampleRate * duration);
    this.clickBuffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = this.clickBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      
      // 🔧 メカニカルスイッチの物理特性を模倣（より詳細）
      
      // 1. 初期の「カチッ」音（接点接触）- 鋭い高周波
      const clickAttack = Math.sin(2 * Math.PI * 1300 * t) * 0.5 * Math.exp(-t * 150);
      
      // 2. 基本的なキー押下音（プラスチック/ABS樹脂共振）
      const fundamental = Math.sin(2 * Math.PI * 450 * t) * 0.6;
      const harmonic2 = Math.sin(2 * Math.PI * 675 * t) * 0.3;  // 3/2倍音
      const harmonic3 = Math.sin(2 * Math.PI * 900 * t) * 0.2;  // 2倍音
      const harmonic4 = Math.sin(2 * Math.PI * 1125 * t) * 0.1; // 高次倍音
      
      // 3. メカニカルスイッチの金属音（スプリング共振＋金属接点）
      const springResonance = Math.sin(2 * Math.PI * 1900 * t) * 0.25 * Math.exp(-t * 50);
      const metalContact = Math.sin(2 * Math.PI * 2400 * t) * 0.15 * Math.exp(-t * 100);
      
      // 4. ノイズ成分（プラスチックの摩擦音 + 微細な振動）
      const friction = (Math.random() - 0.5) * 0.12 * Math.exp(-t * 35);
      const microVib = Math.sin(2 * Math.PI * 800 * t + Math.random() * 0.5) * 0.05 * Math.exp(-t * 60);
      
      // 5. 「カチャッ」音の第二段階（キーボトミング）- より現実的な遅延
      const bottomingDelay = 0.025; // 25ms遅延
      const bottoming = t > bottomingDelay ? 
        Math.sin(2 * Math.PI * 320 * (t - bottomingDelay)) * 0.35 * Math.exp(-((t - bottomingDelay) * 70)) : 0;
      
      // 6. スプリング反発音（キーリリース模倣）
      const springBackDelay = 0.05; // 50ms遅延
      const springBack = t > springBackDelay ?
        Math.sin(2 * Math.PI * 1600 * (t - springBackDelay)) * 0.2 * Math.exp(-((t - springBackDelay) * 120)) : 0;
      
      // 🎵 全体合成
      const wave = clickAttack + fundamental + harmonic2 + harmonic3 + harmonic4 + 
                   springResonance + metalContact + friction + microVib + bottoming + springBack;
      
      // 🎚️ メカニカルキーボード特有のエンベロープ（三段階減衰）
      const primaryEnvelope = Math.exp(-t * 10) * (1 - Math.exp(-t * 200)); // 初期アタック
      const sustainEnvelope = Math.exp(-t * 6) * 0.4; // 持続音
      const releaseEnvelope = Math.exp(-t * 4) * 0.2; // 余韻
      const envelope = primaryEnvelope + sustainEnvelope + releaseEnvelope;
      
      data[i] = wave * envelope * ULTRA_FAST_VOLUME.click;    }
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
  }  // 🚀 パブリックAPI（typingmania-ref互換）
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
