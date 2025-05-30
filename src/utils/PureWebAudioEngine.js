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
      // 高速タイピング対応：音響呼び出し制御
    this.lastPlayTime = 0;
    this.minInterval = 5; // 最小間隔5ms（超高速タイピング対応、さらに短縮）
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
  }  // 高速タイピング対応：スロットリング付き再生メソッド
  play(name) {
    if (!this.initialized || !this.buffers[name]) {
      return;
    }
    
    const now = performance.now();
    
    // 高速入力対応：最小間隔チェック
    if (now - this.lastPlayTime < this.minInterval) {
      // 前回の再生から間隔が短い場合、最新の要求で上書き
      if (this.pendingPlays.has('timeout')) {
        clearTimeout(this.pendingPlays.get('timeout'));
      }
      
      const timeoutId = setTimeout(() => {
        this.performPlay(name);
        this.pendingPlays.delete('timeout');
      }, this.minInterval - (now - this.lastPlayTime));
      
      this.pendingPlays.set('timeout', timeoutId);
      return;
    }
    
    // 即座に再生
    this.performPlay(name);
  }
  
  // 実際の音響再生処理
  performPlay(name) {
    if (!this.initialized || !this.buffers[name]) {
      return;
    }
    
    this.lastPlayTime = performance.now();
    
    try {
      // 高速入力対応：BufferSourceを即座に作成・再生・破棄
      const source = this.context.createBufferSource();
      source.buffer = this.buffers[name];
      source.connect(this.gainNode);
      
      // 即座に再生開始（遅延最小化）
      source.start(0);
      
      // 高速入力対応：明示的なクリーンアップタイミング設定
      const cleanupTime = this.context.currentTime + source.buffer.duration + 0.1;
      source.stop(cleanupTime);
      
      // メモリリーク防止：確実なdisconnect
      source.onended = () => {
        try {
          source.disconnect();
        } catch (e) {
          // 既にdisconnect済みの場合は無視
        }
      };
    } catch (e) {
      // エラーは無視（typingmania-ref風）
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
    this.play('click'); // 成功音はクリック音と同じ（シンプル化）
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
