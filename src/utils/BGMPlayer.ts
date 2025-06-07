import { PerformanceProfiler } from './PerformanceProfiler';

/**
 * BGM専用MP3プレイヤーシステム
 * 打撃音WebAudioシステムとは完全分離
 * SPA全体でBGMが途切れない設計
 * パフォーマンス影響調査機能付き
 */

export type BGMMode = 'lobby' | 'game' | 'result' | 'settings' | 'ranking' | 'silent';

interface BGMTrack {
  mode: BGMMode;
  filename: string;
  volume: number;
  loop: boolean;
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
  private currentAudio: HTMLAudioElement | null = null;
  private currentMode: BGMMode = 'silent';
  private isInitialized = false;
  private fadeInterval: NodeJS.Timeout | null = null;
  private globalVolume = 0.5; // マスター音量
  private performanceDebugMode = false; // パフォーマンス調査モード

  constructor() {
    this.initialize();
  }
  private async initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
  }

  /**
   * 🔍 パフォーマンス調査: BGM処理無効化
   */
  setPerformanceDebugMode(enabled: boolean): void {
    this.performanceDebugMode = enabled;
    if (enabled) {
      console.log('[BGMPlayer] 🔍 パフォーマンス調査モード: BGM処理を無効化');
      this.stop(); // 既存のBGMを停止
    }
  }

  /**
   * BGMモード切り替え（フェード付き） - パフォーマンス計測版
   */
  async switchMode(mode: BGMMode): Promise<void> {
    const startTime = PerformanceProfiler.start('bgm_mode_switch');
    
    try {
      // パフォーマンス調査モードの場合は何もしない
      if (this.performanceDebugMode) {
        PerformanceProfiler.end('bgm_mode_switch', startTime);
        return;
      }

      if (this.currentMode === mode) {
        PerformanceProfiler.end('bgm_mode_switch', startTime);
        return;
      }
      
      const track = BGM_TRACKS[mode];
      
      // 無音モードまたはトラック未設定の場合
      if (!track) {
        await this.stop();
        this.currentMode = mode;
        PerformanceProfiler.end('bgm_mode_switch', startTime);
        return;
      }

      // 現在の音楽をフェードアウト
      if (this.currentAudio && !this.currentAudio.paused) {
        await this.fadeOut();
      }

      // 新しい音楽を開始
      await this.playTrack(track);
      this.currentMode = mode;
    } finally {
      PerformanceProfiler.end('bgm_mode_switch', startTime);
    }
  }
  /**
   * 指定トラックを再生 - パフォーマンス計測版
   */
  private async playTrack(track: BGMTrack): Promise<void> {
    const startTime = PerformanceProfiler.start('bgm_track_play');
    
    try {
      // パフォーマンス調査モードの場合は何もしない
      if (this.performanceDebugMode) {
        PerformanceProfiler.end('bgm_track_play', startTime);
        return;
      }

      // 新しいAudioオブジェクト作成
      this.currentAudio = new Audio(`/sounds/bgm/${track.filename}`);
      this.currentAudio.loop = track.loop;
      this.currentAudio.volume = 0; // フェードイン開始のため0から
      
      // 音楽ロード完了を待機
      await new Promise((resolve, reject) => {
        if (!this.currentAudio) return reject('Audio not created');
        
        this.currentAudio.addEventListener('canplaythrough', resolve, { once: true });
        this.currentAudio.addEventListener('error', reject, { once: true });
        this.currentAudio.load();
      });

      // 再生開始
      await this.currentAudio.play();
      // フェードイン
      await this.fadeIn(track.volume * this.globalVolume);
      
    } catch (error) {
      console.warn(`[BGMPlayer] ⚠️ BGM再生エラー: ${track.filename}`, error);
    } finally {
      PerformanceProfiler.end('bgm_track_play', startTime);
    }
  }

  /**
   * フェードイン
   */
  private async fadeIn(targetVolume: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentAudio) return resolve();
      
      this.clearFadeInterval();
      let volume = 0;
      const step = targetVolume / 20; // 20ステップで目標音量に
      
      this.fadeInterval = setInterval(() => {
        if (!this.currentAudio) {
          this.clearFadeInterval();
          return resolve();
        }
        
        volume += step;
        if (volume >= targetVolume) {
          this.currentAudio.volume = targetVolume;
          this.clearFadeInterval();
          resolve();
        } else {
          this.currentAudio.volume = volume;
        }
      }, 50); // 50ms間隔
    });
  }

  /**
   * フェードアウト
   */
  private async fadeOut(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentAudio) return resolve();
      
      this.clearFadeInterval();
      const startVolume = this.currentAudio.volume;
      const step = startVolume / 20;
      
      this.fadeInterval = setInterval(() => {
        if (!this.currentAudio) {
          this.clearFadeInterval();
          return resolve();
        }
        
        this.currentAudio.volume -= step;
        if (this.currentAudio.volume <= 0) {
          this.currentAudio.volume = 0;
          this.clearFadeInterval();
          resolve();
        }
      }, 50);
    });
  }

  /**
   * BGM停止
   */
  async stop(): Promise<void> {
    if (this.currentAudio) {
      await this.fadeOut();
      this.currentAudio.pause();      this.currentAudio = null;
    }
    this.currentMode = 'silent';
  }

  /**
   * マスター音量設定
   */
  setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    
    if (this.currentAudio && this.currentMode !== 'silent') {
      const track = BGM_TRACKS[this.currentMode];
      if (track) {        this.currentAudio.volume = track.volume * this.globalVolume;
      }
    }
  }
  /**
   * 現在の状態取得 - パフォーマンス情報付き
   */
  getStatus() {
    return {
      currentMode: this.currentMode,
      isPlaying: this.currentAudio && !this.currentAudio.paused,
      volume: this.globalVolume,
      trackConfigured: !!BGM_TRACKS[this.currentMode],
      performanceDebugMode: this.performanceDebugMode
    };
  }

  private clearFadeInterval(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }
}

// グローバルシングルトンインスタンス
export const globalBGMPlayer = new BGMPlayer();

export default BGMPlayer;
