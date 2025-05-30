// PureWebAudioEngine.js - typingmania-ref風純粋WebAudio（最軽量版）
'use client';

/**
 * typingmania-ref完全同等の純粋WebAudioエンジン（ゼロ遅延版）
 * typingmania-refの反応速度を実現するための最軽量実装
 * - スロットリング完全排除：ゼロ遅延再生
 * - 最小限エラーハンドリング：継続動作優先
 * - 同期的バッファー管理：初期化時一括生成
 */
class PureWebAudioEngine {  constructor() {
    this.context = null;
    this.gainNode = null;
    this.buffers = {};
    this.initialized = false;
    // typingmania-ref風：スロットリング完全排除（ゼロ遅延）
    this.lastPlayTime = 0;
    this.minInterval = 0; // 最小間隔0ms（typingmania-ref同等の即座再生）
    this.pendingPlays = new Map(); // 保留中の再生要求
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
      this.gainNode.gain.value = 0.45; // 音量向上要請対応（0.3 → 0.45）
      
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
    
    // 成功音: 40ms、800Hz（高音で爽快感）
    const successLength = Math.floor(sampleRate * 0.04);
    const successBuffer = this.context.createBuffer(1, successLength, sampleRate);
    const successData = successBuffer.getChannelData(0);
    
    for (let i = 0; i < successLength; i++) {
      const t = i / sampleRate;
      const decay = 1 - (i / successLength);
      successData[i] = Math.sin(2 * Math.PI * 800 * t) * decay * 0.35;
    }
    
    this.buffers.click = clickBuffer;
    this.buffers.error = errorBuffer;
    this.buffers.success = successBuffer;
  }  // typingmania-ref風：即座再生（スロットリング無し）
  play(name) {
    if (!this.initialized || !this.buffers[name]) {
      return;
    }
    
    // typingmania-ref風：条件なしで即座に再生
    this.performPlay(name);
  }
    // typingmania-ref風：最軽量音響再生処理
  performPlay(name) {
    if (!this.initialized || !this.buffers[name]) {
      return;
    }
    
    this.lastPlayTime = performance.now();
    
    try {
      // typingmania-ref風：最軽量BufferSource作成・再生
      const source = this.context.createBufferSource();
      source.buffer = this.buffers[name];
      source.connect(this.gainNode);
      
      // typingmania-ref風：即座に再生開始（ゼロ遅延）
      source.start(0);
      
      // typingmania-ref風：自動クリーンアップ設定
      source.onended = () => {
        try {
          source.disconnect();
        } catch (e) {
          // 既にdisconnect済みの場合は無視
        }
      };
      
    } catch (e) {
      // typingmania-ref風：エラーは警告のみ（継続動作）
      console.warn('[PureWebAudio] 再生エラー:', e);
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
    this.play('success');
  }
  // AudioContext再開（高速タイピング対応強化）
  resume() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().then(() => {
        console.log('[PureWebAudio] AudioContext resumed for high-speed typing');
      }).catch(e => {
        console.warn('[PureWebAudio] Resume failed:', e);
      });
    }
  }
  
  // 高速タイピング用：AudioContext状態チェック
  isReady() {
    return this.initialized && 
           this.context && 
           this.context.state === 'running';
  }
  
  // 高速タイピング用：パフォーマンス統計
  getPerformanceInfo() {
    if (!this.context) return null;
    
    return {
      sampleRate: this.context.sampleRate,
      currentTime: this.context.currentTime,
      state: this.context.state,
      baseLatency: this.context.baseLatency || 'unknown',
      outputLatency: this.context.outputLatency || 'unknown',
      lastPlayTime: this.lastPlayTime,
      minInterval: this.minInterval
    };
  }
}

// グローバルインスタンス（typingmania-ref風）
const pureWebAudio = new PureWebAudioEngine();

// モジュールロード時に初期化開始
if (typeof window !== 'undefined') {
  pureWebAudio.init().catch(console.warn);
}

export default pureWebAudio;
