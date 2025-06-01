// InstantKeyboardSound.js - 超高速純粋合成音声（MP3完全不使用）
'use client';

// 🔊 快適な音量設定
const INSTANT_VOLUME = {
  click: 0.3,      // 控えめな音量
  error: 0.2,     
  success: 0.25,
};

// グローバルリソース
let ctx = null;
let clickBuffer = null;
let errorBuffer = null;
let successBuffer = null;

// 🚀 超高速合成音声初期化（MP3一切不使用）
function initAudio() {
  if (ctx) return;
  
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 🎵 心地よいクリック音（純粋合成、即座生成）
    const clickFreq = 440;  // A音（心地よい）
    const duration = 0.06;   // 短く軽やか
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    
    clickBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      // 美しい音色（倍音含む）
      const wave = Math.sin(2 * Math.PI * clickFreq * t) * 0.6 + 
                  Math.sin(2 * Math.PI * clickFreq * 2 * t) * 0.2;
      clickData[i] = wave * Math.exp(-t * 12) * INSTANT_VOLUME.click;
    }
    
    // 🎵 エラー音（低く短く）
    const errorFreq = 180;
    const errorDuration = 0.12;
    const errorBufferSize = Math.floor(sampleRate * errorDuration);
    
    errorBuffer = ctx.createBuffer(1, errorBufferSize, sampleRate);
    const errorData = errorBuffer.getChannelData(0);
    
    for (let i = 0; i < errorBufferSize; i++) {
      const t = i / sampleRate;
      errorData[i] = Math.sin(2 * Math.PI * errorFreq * t) * Math.exp(-t * 8) * INSTANT_VOLUME.error;
    }
    
    // 🎵 成功音（美しい和音 C+E）
    const successDuration = 0.15;
    const successBufferSize = Math.floor(sampleRate * successDuration);
    
    successBuffer = ctx.createBuffer(1, successBufferSize, sampleRate);
    const successData = successBuffer.getChannelData(0);
    
    for (let i = 0; i < successBufferSize; i++) {
      const t = i / sampleRate;
      // C+E和音（美しい響き）
      const c = Math.sin(2 * Math.PI * 523 * t);  // C5
      const e = Math.sin(2 * Math.PI * 659 * t);  // E5
      successData[i] = (c + e) * 0.5 * Math.exp(-t * 6) * INSTANT_VOLUME.success;
    }
  } catch (e) {
    // サイレント失敗
  }
}

class InstantKeyboardSound {
  static playClickSound() {
    if (!ctx || !clickBuffer) return;
    
    const source = ctx.createBufferSource();
    source.buffer = clickBuffer;
    source.connect(ctx.destination);
    source.start();
  }
  
  static playErrorSound() {
    if (!ctx || !errorBuffer) return;
    
    const source = ctx.createBufferSource();
    source.buffer = errorBuffer;
    source.connect(ctx.destination);
    source.start();
  }
  
  static playSuccessSound() {
    if (!ctx || !successBuffer) return;
    
    const source = ctx.createBufferSource();
    source.buffer = successBuffer;
    source.connect(ctx.destination);
    source.start();
  }
  
  static init() {
    initAudio();
  }
  
  static isReady() {
    return ctx && ctx.state === 'running';
  }
  
  static resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }
}

// 即座初期化（同期）
initAudio();

export default InstantKeyboardSound;
