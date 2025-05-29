// LightweightKeyboardSound.js - 軽量版キーボード音
'use client';

// 軽量版の音量設定
const LIGHT_VOLUME_SETTINGS = {
  click: 0.3,
  error: 0.15,
  success: 0.25,
};

let audioContext = null;
let prerenderedBuffers = {};

class LightweightKeyboardSound {
  static getAudioContext() {
    if (!audioContext && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
      } catch (e) {
        console.warn('[LightweightKeyboardSound] AudioContextの作成に失敗:', e);
        return null;
      }
    }
    return audioContext;
  }

  // プリレンダリングされたオーディオバッファーを作成
  static async initializePrerenderedBuffers() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      // クリック音用のバッファーを作成
      prerenderedBuffers.click = await this.createClickBuffer(ctx);
      prerenderedBuffers.error = await this.createErrorBuffer(ctx);
      prerenderedBuffers.success = await this.createSuccessBuffer(ctx);
      
      console.log('[LightweightKeyboardSound] プリレンダリングバッファーを初期化しました');
    } catch (e) {
      console.warn('[LightweightKeyboardSound] バッファー初期化に失敗:', e);
    }
  }

  // 軽量クリック音バッファーを作成
  static async createClickBuffer(ctx) {
    const sampleRate = ctx.sampleRate;
    const duration = 0.05; // 50ms
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // シンプルな合成クリック音（単一のエンベロープ付きサイン波）
      const envelope = Math.exp(-t * 30); // 指数減衰
      const frequency = 1800 * (1 - t * 2); // 周波数下降
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * LIGHT_VOLUME_SETTINGS.click;
    }
    
    return buffer;
  }

  // 軽量エラー音バッファーを作成
  static async createErrorBuffer(ctx) {
    const sampleRate = ctx.sampleRate;
    const duration = 0.1; // 100ms
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // 低めの周波数で重い音
      const envelope = Math.exp(-t * 15);
      const frequency = 120 + 50 * Math.sin(t * 20); // 少しのワブル
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * LIGHT_VOLUME_SETTINGS.error;
    }
    
    return buffer;
  }

  // 軽量成功音バッファーを作成
  static async createSuccessBuffer(ctx) {
    const sampleRate = ctx.sampleRate;
    const duration = 0.15; // 150ms
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // アップワードスイープで成功感
      const envelope = Math.exp(-t * 8);
      const frequency = 300 + t * 500; // 上昇音
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * LIGHT_VOLUME_SETTINGS.success;
    }
    
    return buffer;
  }

  // プリレンダリングバッファーを使用した高速再生
  static playBufferedSound(bufferName) {
    const ctx = this.getAudioContext();
    if (!ctx || !prerenderedBuffers[bufferName]) return;

    try {
      const source = ctx.createBufferSource();
      source.buffer = prerenderedBuffers[bufferName];
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.warn(`[LightweightKeyboardSound] ${bufferName}音の再生に失敗:`, e);
    }
  }

  // 超軽量クリック音（リアルタイム生成、最小限）
  static playMinimalClickSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const currentTime = ctx.currentTime;
      
      // 単一のサイン波、短時間
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, currentTime + 0.03);
      
      // シンプルなエンベロープ
      gain.gain.setValueAtTime(LIGHT_VOLUME_SETTINGS.click, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(currentTime);
      osc.stop(currentTime + 0.03);
    } catch (e) {
      console.warn('[LightweightKeyboardSound] 最小クリック音の再生に失敗:', e);
    }
  }

  // 公開API - クリック音
  static playClickSound() {
    if (prerenderedBuffers.click) {
      this.playBufferedSound('click');
    } else {
      this.playMinimalClickSound();
    }
  }

  // 公開API - エラー音
  static playErrorSound() {
    if (prerenderedBuffers.error) {
      this.playBufferedSound('error');
    } else {
      // フォールバック用の軽量エラー音
      this.playMinimalErrorSound();
    }
  }

  // 公開API - 成功音
  static playSuccessSound() {
    if (prerenderedBuffers.success) {
      this.playBufferedSound('success');
    } else {
      // フォールバック用の軽量成功音
      this.playMinimalSuccessSound();
    }
  }

  // フォールバック用の軽量エラー音
  static playMinimalErrorSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const currentTime = ctx.currentTime;
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, currentTime);
      
      gain.gain.setValueAtTime(LIGHT_VOLUME_SETTINGS.error, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(currentTime);
      osc.stop(currentTime + 0.08);
    } catch (e) {
      console.warn('[LightweightKeyboardSound] 最小エラー音の再生に失敗:', e);
    }
  }

  // フォールバック用の軽量成功音
  static playMinimalSuccessSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const currentTime = ctx.currentTime;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, currentTime);
      osc.frequency.linearRampToValueAtTime(600, currentTime + 0.1);
      
      gain.gain.setValueAtTime(LIGHT_VOLUME_SETTINGS.success, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(currentTime);
      osc.stop(currentTime + 0.12);
    } catch (e) {
      console.warn('[LightweightKeyboardSound] 最小成功音の再生に失敗:', e);
    }
  }

  static async resumeAudioContext() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
        console.log('[LightweightKeyboardSound] AudioContext resumed');
      } catch (e) {
        console.warn('[LightweightKeyboardSound] AudioContext resume failed:', e);
      }
    }
  }
}

export default LightweightKeyboardSound;
