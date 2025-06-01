// InstantKeyboardSound.js - 心地よい音声システム
'use client';

// 🔊 快適な音量設定
const INSTANT_VOLUME = {
  click: 0.4,      // より控えめな音量
  error: 0.25,     
  success: 0.3,
};

// グローバルリソース
let ctx = null;
let clickBuffer = null;
let errorBuffer = null;
let successBuffer = null;

// 🎵 音声ファイル読み込み
async function loadAudioBuffer(url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  } catch (e) {
    return null;
  }
}

// 🚀 快適な音声初期化
async function initAudio() {
  if (ctx) return;
  
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 🎵 心地よいクリック音（ファイルベース）
    clickBuffer = await loadAudioBuffer('/sounds/buttonsound1.mp3');
    
    // ファイル読み込み失敗時の代替音（より心地よい周波数）
    if (!clickBuffer) {
      const clickFreq = 440;  // A音（心地よい）
      const duration = 0.08;   // より短く
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      
      clickBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const clickData = clickBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        // より柔らかい音色
        const wave = Math.sin(2 * Math.PI * clickFreq * t) * 0.3 + 
                    Math.sin(2 * Math.PI * clickFreq * 2 * t) * 0.1;
        clickData[i] = wave * Math.exp(-t * 8) * INSTANT_VOLUME.click;
      }
    }
    
    // 🎵 エラー音（低く短く）
    const errorFreq = 150;  // より低く
    const errorDuration = 0.15;
    const errorSampleRate = ctx.sampleRate;
    const errorBufferSize = Math.floor(errorSampleRate * errorDuration);
    
    errorBuffer = ctx.createBuffer(1, errorBufferSize, errorSampleRate);
    const errorData = errorBuffer.getChannelData(0);
    
    for (let i = 0; i < errorBufferSize; i++) {
      const t = i / errorSampleRate;
      errorData[i] = Math.sin(2 * Math.PI * errorFreq * t) * Math.exp(-t * 4) * INSTANT_VOLUME.error;
    }
    
    // 🎵 成功音（心地よい和音）
    const successDuration = 0.2;
    const successSampleRate = ctx.sampleRate;
    const successBufferSize = Math.floor(successSampleRate * successDuration);
    
    successBuffer = ctx.createBuffer(1, successBufferSize, successSampleRate);
    const successData = successBuffer.getChannelData(0);    
    for (let i = 0; i < successBufferSize; i++) {
      const t = i / successSampleRate;
      // 心地よい和音（C + E）
      const wave1 = Math.sin(2 * Math.PI * 523 * t) * 0.4; // C5
      const wave2 = Math.sin(2 * Math.PI * 659 * t) * 0.3; // E5
      successData[i] = (wave1 + wave2) * Math.exp(-t * 3) * INSTANT_VOLUME.success;
    }
  } catch (e) {
    // サイレント失敗
  }
}

class InstantKeyboardSound {
  // 🚀 即座再生（高速）
  static playClickSound() {
    if (!ctx || !clickBuffer) return;
    
    const source = ctx.createBufferSource();
    source.buffer = clickBuffer;
    
    // 音量調整（より快適に）
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.4;
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
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
  
  // 🚀 非同期初期化
  static async init() {
    await initAudio();
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

// 初期化（非同期）
if (typeof window !== 'undefined') {
  initAudio();
}

export default InstantKeyboardSound;
