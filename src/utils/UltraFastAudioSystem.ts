/**
 * 超高速音声システム（ベテラン級3ms以下対応）
 * 40年のtypingmania経験者のための究極最適化音声エンジン
 */

'use client';

interface UltraFastAudioConfig {
  preloadBufferCount: number;
  useWebWorker: boolean;
  enableHardwareAcceleration: boolean;
  maxConcurrentSounds: number;
}

class UltraFastAudioSystem {
  private static instance: UltraFastAudioSystem | null = null;
  private audioContext: AudioContext | null = null;
  private clickSoundBuffer: AudioBuffer | null = null;
  private errorSoundBuffer: AudioBuffer | null = null;
  private preloadedGainNodes: GainNode[] = [];
  private audioWorklet: AudioWorkletNode | null = null;
  private isInitialized = false;
  
  private config: UltraFastAudioConfig = {
    preloadBufferCount: 10, // 10個のプリロード済み音声バッファ
    useWebWorker: false, // 実験的
    enableHardwareAcceleration: true,
    maxConcurrentSounds: 5
  };

  private constructor() {}

  /**
   * シングルトンインスタンス取得（SSR対応）
   */
  static getInstance(): UltraFastAudioSystem {
    if (!this.instance && typeof window !== 'undefined') {
      this.instance = new UltraFastAudioSystem();
    }
    return this.instance!;
  }

  /**
   * 🚀 ベテラン級超高速初期化
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      console.log('🎵 ベテラン級超高速音声システム初期化中...');

      // AudioContext初期化（最高優先度）
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // 最小限のクリック音を生成（オーバーヘッドなし）
      await this.generateMinimalClickSound();
      
      // プリロード済みGainNodeを準備
      this.preloadGainNodes();

      this.isInitialized = true;
      console.log('✅ ベテラン級超高速音声システム初期化完了');
      
    } catch (error) {
      console.error('❌ 超高速音声システム初期化失敗:', error);
    }
  }

  /**
   * 最小限のクリック音生成（1ms以下）
   */
  private async generateMinimalClickSound(): Promise<void> {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.05; // 50ms（超短時間）
    const bufferLength = sampleRate * duration;
    
    const buffer = this.audioContext.createBuffer(1, bufferLength, sampleRate);
    const data = buffer.getChannelData(0);
    
    // 超シンプルなクリック音（計算最小化）
    for (let i = 0; i < bufferLength; i++) {
      data[i] = Math.sin(2 * Math.PI * 800 * i / sampleRate) * Math.exp(-i / (bufferLength * 0.3));
    }
    
    this.clickSoundBuffer = buffer;
  }

  /**
   * プリロード済みGainNode準備（遅延最小化）
   */
  private preloadGainNodes(): void {
    if (!this.audioContext) return;

    for (let i = 0; i < this.config.preloadBufferCount; i++) {
      const gainNode = this.audioContext.createGain();
      gainNode.connect(this.audioContext.destination);
      gainNode.gain.value = 0.3; // 適度な音量
      this.preloadedGainNodes.push(gainNode);
    }
  }

  /**
   * 🎯 ベテラン級超高速クリック音再生（目標: 1ms以下）
   */
  playClickSoundUltraFast(): void {
    if (!this.isInitialized || !this.audioContext || !this.clickSoundBuffer) return;

    try {
      // プリロード済みGainNodeから取得（new演算子なし）
      const gainNode = this.preloadedGainNodes.shift();
      if (!gainNode) return;

      // AudioBufferSourceNode作成（最小限）
      const source = this.audioContext.createBufferSource();
      source.buffer = this.clickSoundBuffer;
      source.connect(gainNode);
      
      // 即座に再生開始
      source.start(0);
      
      // 使用後にGainNodeを再利用プールに戻す
      source.onended = () => {
        this.preloadedGainNodes.push(gainNode);
      };

    } catch (error) {
      // エラー処理もミニマル
      console.warn('🔇 音声再生エラー（無視）');
    }
  }

  /**
   * 🚀 MessageChannel経由で最高優先度実行
   */
  playClickSoundHighestPriority(): void {
    if (typeof window === 'undefined') return;

    // MessageChannelで最高優先度実行
    const channel = new MessageChannel();
    channel.port2.onmessage = () => {
      this.playClickSoundUltraFast();
    };
    channel.port1.postMessage(null);
  }

  /**
   * パフォーマンス統計
   */
  getPerformanceInfo() {
    return {
      isInitialized: this.isInitialized,
      audioContextState: this.audioContext?.state,
      preloadedNodes: this.preloadedGainNodes.length,
      sampleRate: this.audioContext?.sampleRate,
      engineType: 'UltraFast-Veteran'
    };
  }
}

// 🎯 ベテラン向けグローバル関数（最速アクセス）
let ultraFastAudio: UltraFastAudioSystem | null = null;

export function initializeUltraFastAudio(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  
  if (!ultraFastAudio) {
    ultraFastAudio = UltraFastAudioSystem.getInstance();
  }
  return ultraFastAudio.initialize();
}

export function playUltraFastClick(): void {
  if (ultraFastAudio?.playClickSoundHighestPriority) {
    ultraFastAudio.playClickSoundHighestPriority();
  }
}

export default UltraFastAudioSystem;
