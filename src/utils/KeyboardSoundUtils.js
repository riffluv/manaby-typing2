// KeyboardSoundUtils.js (コピー元: manabyUI/src/utils/KeyboardSoundUtils.js)
'use client';

// 効果音のキャッシュ
const soundCache = {
  click: null,
  error: null,
  success: null,
};

// 音量設定 (0.0 - 1.0)
const VOLUME_SETTINGS = {
  click: 0.3,
  error: 0.2,
  success: 0.3,
};

let audioContext = null;

class KeyboardSoundUtils {
  static getAudioContext() {
    if (!audioContext && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
      } catch (e) {
        console.warn('[KeyboardSoundUtils] AudioContextの作成に失敗:', e);
        return null;
      }
    }
    return audioContext;
  }

  static playClickSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      // --- 青軸メカニカルゲーミングキーボード風 ---
      // 1. 高周波矩形波（カチッという粒立ち）
      const osc1 = ctx.createOscillator();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(3400, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.045);
      // 2. 金属的な三角波（倍音感）
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1800, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      // 3. わずかなノイズ（クリック感の補助）
      const bufferSize = 256;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.12;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.13, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.006);
      // 高域を強調
      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.setValueAtTime(2200, ctx.currentTime);
      noise.connect(hpFilter).connect(noiseGain).connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.006);
      // 4. エンベロープ
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(VOLUME_SETTINGS.click, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.055);
      osc2.stop(ctx.currentTime + 0.055);
    } catch (e) {
      console.warn('[KeyboardSoundUtils] クリック音の再生に失敗:', e);
    }
  }

  static playErrorSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(VOLUME_SETTINGS.error, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('[KeyboardSoundUtils] エラー音の再生に失敗:', e);
    }
  }

  static playSuccessSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(VOLUME_SETTINGS.success, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('[KeyboardSoundUtils] 成功音の再生に失敗:', e);
    }
  }
}

export default KeyboardSoundUtils;
