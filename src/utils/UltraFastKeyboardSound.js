// UltraFastKeyboardSound.js - 超高速キーボード音（typingmania-ref風）
'use client';

// 最小限の音量設定
const ULTRA_VOLUME = {
  click: 0.2,
  error: 0.1,
  success: 0.15,
};

// グローバルなAudioContextとプリコンパイル済みバッファー
let ctx = null;
let clickBuffer = null;
let errorBuffer = null;
let successBuffer = null;
let initialized = false;

class UltraFastKeyboardSound {
  // 即座にAudioContextを作成（遅延なし）
  static init() {
    if (initialized || typeof window === 'undefined') return;
    
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      
      // バッファーを同期的に作成（await不要）
      this.createBuffersSync();
      initialized = true;
      
      console.log('[UltraFast] 初期化完了');
    } catch (e) {
      console.warn('[UltraFast] 初期化失敗:', e);
    }
  }

  // 同期的にバッファーを作成（最小限の計算）
  static createBuffersSync() {
    if (!ctx) return;

    const sampleRate = ctx.sampleRate;
    
    // クリック音: 20ms、単純な減衰サイン波
    const clickLength = Math.floor(sampleRate * 0.02);
    clickBuffer = ctx.createBuffer(1, clickLength, sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    
    for (let i = 0; i < clickLength; i++) {
      const t = i / sampleRate;
      const decay = 1 - (i / clickLength); // 線形減衰（指数関数より高速）
      clickData[i] = Math.sin(3770 * t) * decay * ULTRA_VOLUME.click; // 600Hz固定
    }

    // エラー音: 30ms、低周波
    const errorLength = Math.floor(sampleRate * 0.03);
    errorBuffer = ctx.createBuffer(1, errorLength, sampleRate);
    const errorData = errorBuffer.getChannelData(0);
    
    for (let i = 0; i < errorLength; i++) {
      const t = i / sampleRate;
      const decay = 1 - (i / errorLength);
      errorData[i] = Math.sin(628 * t) * decay * ULTRA_VOLUME.error; // 100Hz固定
    }

    // 成功音: 40ms、高周波
    const successLength = Math.floor(sampleRate * 0.04);
    successBuffer = ctx.createBuffer(1, successLength, sampleRate);
    const successData = successBuffer.getChannelData(0);
    
    for (let i = 0; i < successLength; i++) {
      const t = i / sampleRate;
      const decay = 1 - (i / successLength);
      successData[i] = Math.sin(3140 * t) * decay * ULTRA_VOLUME.success; // 500Hz固定
    }
  }

  // 即座に音を再生（エラーハンドリング最小限）
  static playClick() {
    if (!ctx || !clickBuffer) {
      this.init();
      if (!clickBuffer) return;
    }

    const source = ctx.createBufferSource();
    source.buffer = clickBuffer;
    source.connect(ctx.destination);
    source.start();
  }

  static playError() {
    if (!ctx || !errorBuffer) {
      this.init();
      if (!errorBuffer) return;
    }

    const source = ctx.createBufferSource();
    source.buffer = errorBuffer;
    source.connect(ctx.destination);
    source.start();
  }

  static playSuccess() {
    if (!ctx || !successBuffer) {
      this.init();
      if (!successBuffer) return;
    }

    const source = ctx.createBufferSource();
    source.buffer = successBuffer;
    source.connect(ctx.destination);
    source.start();
  }

  // AudioContextの状態チェック（最小限）
  static resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  // 統一インターフェース
  static playClickSound() {
    this.playClick();
  }

  static playErrorSound() {
    this.playError();
  }

  static playSuccessSound() {
    this.playSuccess();
  }

  // バックアップ: 即座に鳴る最小限の音（バッファー無し）
  static playInstantClick() {
    if (!ctx) this.init();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.value = 600;
    gain.gain.value = ULTRA_VOLUME.click;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }
}

// モジュール読み込み時に即座に初期化
if (typeof window !== 'undefined') {
  // ユーザー操作後に初期化
  document.addEventListener('click', () => {
    UltraFastKeyboardSound.init();
    UltraFastKeyboardSound.resume();
  }, { once: true });
  
  document.addEventListener('keydown', () => {
    UltraFastKeyboardSound.init();
    UltraFastKeyboardSound.resume();
  }, { once: true });
}

export default UltraFastKeyboardSound;
