/**
 * 超高速タイピングエンジン - typingmania-ref完全互換版
 * 現在の実装の遅延要因を排除した最適化バージョン
 * 
 * 主な最適化:
 * 1. console.log完全削除
 * 2. AudioContext状態チェック削除
 * 3. setTimeout削除
 * 4. 関数呼び出し層削除（直接実行）
 * 5. パフォーマンス測定削除
 */
'use client';

// 音量設定（typingmania-ref同等）
const OPTIMIZED_VOLUME = {
  click: 0.65,
  error: 0.3,
  success: 0.35,
};

// グローバルリソース
let ctx = null;
let clickBuffer = null;
let errorBuffer = null;
let successBuffer = null;
let initialized = false;

export class OptimizedTypingAudio {
  // 初期化（一度だけ実行）
  static init() {
    if (initialized || typeof window === 'undefined') return;
    
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      this.createBuffers();
      initialized = true;
    } catch (e) {
      // エラーハンドリング最小限
      initialized = false;
    }
  }

  // バッファー作成（最小限の計算）
  static createBuffers() {
    if (!ctx) return;

    const sampleRate = ctx.sampleRate;
    
    // クリック音: 20ms、シンプルなサイン波
    const clickLength = Math.floor(sampleRate * 0.02);
    clickBuffer = ctx.createBuffer(1, clickLength, sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    
    for (let i = 0; i < clickLength; i++) {
      const t = i / sampleRate;
      const decay = 1 - (i / clickLength);
      clickData[i] = Math.sin(3770 * t) * decay * OPTIMIZED_VOLUME.click;
    }

    // エラー音: 60ms
    const errorLength = Math.floor(sampleRate * 0.06);
    errorBuffer = ctx.createBuffer(1, errorLength, sampleRate);
    const errorData = errorBuffer.getChannelData(0);
    
    for (let i = 0; i < errorLength; i++) {
      const t = i / sampleRate;
      const decay = Math.max(0, 1 - (i / errorLength) * 1.5);
      const lowBuzz = Math.sin(2 * Math.PI * 80 * t);
      const midBuzz = Math.sin(2 * Math.PI * 140 * t);
      errorData[i] = (lowBuzz * 0.6 + midBuzz * 0.4) * decay * OPTIMIZED_VOLUME.error;
    }

    // 成功音: 40ms
    const successLength = Math.floor(sampleRate * 0.04);
    successBuffer = ctx.createBuffer(1, successLength, sampleRate);
    const successData = successBuffer.getChannelData(0);
    
    for (let i = 0; i < successLength; i++) {
      const t = i / sampleRate;
      const decay = 1 - (i / successLength);
      successData[i] = Math.sin(3140 * t) * decay * OPTIMIZED_VOLUME.success;
    }
  }

  // 超高速クリック音再生（遅延要因完全削除）
  static playClick() {
    if (!ctx || !clickBuffer) return;
    
    const source = ctx.createBufferSource();
    source.buffer = clickBuffer;
    source.connect(ctx.destination);
    source.start();
  }

  // 超高速エラー音再生
  static playError() {
    if (!ctx || !errorBuffer) return;
    
    const source = ctx.createBufferSource();
    source.buffer = errorBuffer;
    source.connect(ctx.destination);
    source.start();
  }

  // 超高速成功音再生
  static playSuccess() {
    if (!ctx || !successBuffer) return;
    
    const source = ctx.createBufferSource();
    source.buffer = successBuffer;
    source.connect(ctx.destination);
    source.start();
  }

  // 状態確認（デバッグ用）
  static isReady() {
    return initialized && ctx && clickBuffer;
  }

  // リソース状態確認
  static getStatus() {
    return {
      initialized,
      contextReady: !!ctx,
      buffersReady: !!(clickBuffer && errorBuffer && successBuffer)
    };
  }
}

// 自動初期化
if (typeof window !== 'undefined') {
  OptimizedTypingAudio.init();
}

export default OptimizedTypingAudio;
