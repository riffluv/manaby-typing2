// PureWebAudioEngine.js - typingmania-ref風純粋WebAudio（最軽量版）
'use client';

/**
 * typingmania-ref のSfxクラスを参考にした純粋WebAudioエンジン
 * 高速タイピング時の詰まりを解消するため最小限の実装
 */
class PureWebAudioEngine {
  constructor() {
    this.context = null;
    this.gainNode = null;
    this.buffers = {};
    this.initialized = false;
  }

  // typingmania-ref風の初期化
  async init() {
    if (this.initialized) return;
    
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioCtx();
      
      // メインGainNode（typingmania-ref風）
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.gainNode.gain.value = 0.3;
      
      // バッファーを同期的に生成（typingmania-ref風）
      this.createBuffers();
      this.initialized = true;
      
      console.log('[PureWebAudio] 初期化完了 - typingmania-ref風');
    } catch (e) {
      console.warn('[PureWebAudio] 初期化失敗:', e);
    }
  }

  // typingmania-ref風のシンプルなバッファー生成
  createBuffers() {
    const sampleRate = this.context.sampleRate;
    
    // クリック音: 15ms、600Hz単純サイン波（typingmania-ref風）
    const clickLength = Math.floor(sampleRate * 0.015);
    const clickBuffer = this.context.createBuffer(1, clickLength, sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    
    for (let i = 0; i < clickLength; i++) {
      const t = i / sampleRate;
      const decay = 1 - (i / clickLength);
      clickData[i] = Math.sin(2 * Math.PI * 600 * t) * decay * 0.4;
    }
    
    // エラー音: 25ms、200Hz（typingmania-ref風）
    const errorLength = Math.floor(sampleRate * 0.025);
    const errorBuffer = this.context.createBuffer(1, errorLength, sampleRate);
    const errorData = errorBuffer.getChannelData(0);
    
    for (let i = 0; i < errorLength; i++) {
      const t = i / sampleRate;
      const decay = 1 - (i / errorLength);
      errorData[i] = Math.sin(2 * Math.PI * 200 * t) * decay * 0.3;
    }
    
    this.buffers.click = clickBuffer;
    this.buffers.error = errorBuffer;
  }

  // typingmania-ref Sfx.play() 風の再生メソッド
  play(name) {
    if (!this.initialized || !this.buffers[name]) {
      return;
    }
    
    try {
      // typingmania-ref風：最小限のBufferSource作成
      const source = this.context.createBufferSource();
      source.buffer = this.buffers[name];
      source.connect(this.gainNode);
      source.start();
      
      // GC対策：自動クリーンアップ（typingmania-ref風）
      source.onended = () => {
        source.disconnect();
      };
    } catch (e) {
      // エラーは無視（typingmania-ref風）
    }
  }

  // 統一インターフェース
  playClick() {
    this.play('click');
  }

  playError() {
    this.play('error');
  }

  playSuccess() {
    this.play('click'); // 成功音はクリック音と同じ（シンプル化）
  }

  // AudioContext再開（必要時のみ）
  resume() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }
}

// グローバルインスタンス（typingmania-ref風）
const pureWebAudio = new PureWebAudioEngine();

// モジュールロード時に初期化開始
if (typeof window !== 'undefined') {
  pureWebAudio.init().catch(console.warn);
}

export default pureWebAudio;
