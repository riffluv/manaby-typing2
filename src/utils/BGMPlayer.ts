/**
 * BGM専用MP3プレイヤーシステム
 * 打撃音WebAudioシステムとは完全分離
 * SPA全体でBGMが途切れない設計
 * パフォーマンス影響調査機能付き
 */

export type BGMMode = 'lobby' | 'game' | 'result' | 'settings' | 'ranking' | 'silent';

export interface BGMTrack {
  mode: BGMMode;
  filename: string;
  volume: number;
  loop: boolean;
}

// BGMプレイヤーの状態型定義
export interface BGMStatus {
  isInitialized: boolean;
  currentTrack: BGMTrack | null;
  volume: number;
  contextState: string;
  isPlaying: boolean;
}

// BGM設定（後でMP3ファイルを追加時に更新）
const BGM_TRACKS: Record<BGMMode, BGMTrack | null> = {
  lobby: null,    // 後で設定: { mode: 'lobby', filename: 'lobby-theme.mp3', volume: 0.3, loop: true }
  game: null,     // 後で設定: { mode: 'game', filename: 'game-battle.mp3', volume: 0.2, loop: true }
  result: null,   // 後で設定: { mode: 'result', filename: 'result-fanfare.mp3', volume: 0.4, loop: false }
  settings: null, // 後で設定: { mode: 'settings', filename: 'settings-calm.mp3', volume: 0.2, loop: true }
  ranking: null,  // 後で設定: { mode: 'ranking', filename: 'ranking-epic.mp3', volume: 0.3, loop: true }
  silent: null    // 無音モード
};

class BGMPlayer {
  // BGM専用AudioContext（効果音とは完全分離）
  private static bgmCtx: AudioContext | null = null;
  private static gainNode: GainNode | null = null;
  private static source: AudioBufferSourceNode | null = null;
  private static currentTrack: BGMTrack | null = null;
  private static isInitialized = false;
  private static globalVolume = 0.5;
  // BGM用AudioContext初期化
  private static async initContext() {
    if (this.bgmCtx) return;
    // @ts-expect-error - webkitAudioContext for Safari compatibility
    this.bgmCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.bgmCtx.createGain();
    this.gainNode.gain.value = this.globalVolume;
    this.gainNode.connect(this.bgmCtx.destination);
    this.isInitialized = true;
  }

  // BGM再生（MP3ファイルをWebAudioで）
  static async play(track: BGMTrack) {
    await this.initContext();
    this.stop();
    this.currentTrack = track;
    // fetch & decode
    const response = await fetch(`/sounds/bgm/${track.filename}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.bgmCtx!.decodeAudioData(arrayBuffer);
    const source = this.bgmCtx!.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = track.loop;
    source.connect(this.gainNode!);
    source.start();
    this.source = source;
  }

  // BGM停止
  static stop() {
    if (this.source) {
      try { this.source.stop(); } catch {}
      this.source.disconnect();
      this.source = null;
    }
    this.currentTrack = null;
  }

  // 音量設定
  static setVolume(volume: number) {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.globalVolume;
    }
  }  // 状態取得
  static getStatus(): BGMStatus {
    return {
      isInitialized: this.isInitialized,
      currentTrack: this.currentTrack,
      volume: this.globalVolume,
      contextState: this.bgmCtx?.state || 'none',
      isPlaying: this.source !== null && this.currentTrack !== null, // 🔧 isPlayingプロパティを追加
    };
  }

  // BGMモード切り替え（従来互換API）
  static async switchMode(mode: BGMMode) {
    const track = BGM_TRACKS[mode];
    if (!track) {
      this.stop();
      return;
    }
    await this.play(track);
  }
}

// グローバルシングルトンインスタンス（従来互換）
export const globalBGMPlayer = BGMPlayer;

export default BGMPlayer;
