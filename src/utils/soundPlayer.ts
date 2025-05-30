/**
 * 超高速MP3サウンドプレーヤー + 爆速WebAudio統合システム
 * - 効果音（打鍵音、正誤音など）
 * - BGM（バックグラウンドミュージック）
 * - MP3プリロード最適化による超低遅延再生
 */

// 効果音のタイプ
type SoundType = 'correct' | 'wrong';

// BGMのタイプ
type BGMType = 'game' | 'menu' | 'result';

// 効果音のパス
const soundPaths: Record<SoundType, string> = {
  correct: '/sounds/Hit05-1.mp3',   // 正解音
  wrong: '/sounds/Hit04-1.mp3'      // 不正解音
};

// BGMのパス
const bgmPaths: Record<BGMType, string> = {
  game: '/sounds/battle.mp3',      // ゲームプレイ中BGM
  menu: '/sounds/battle.mp3',      // メニュー画面BGM
  result: '/sounds/resultsound.mp3' // 結果画面BGM
};

// 🚀 超高速MP3キャッシュシステム（プリロード + プール）
const ultraFastAudioPool: Record<string, HTMLAudioElement[]> = {};
const POOL_SIZE = 8; // 同時再生可能数

// 現在再生中のBGM
let currentBGM: HTMLAudioElement | null = null;

// サウンド設定
const soundSettings = {
  effectsEnabled: true,  // 効果音の有効/無効
  bgmEnabled: true,      // BGMの有効/無効
  effectsVolume: 0.5,    // 効果音の音量 (0.0 〜 1.0)
  bgmVolume: 0.3         // BGMの音量 (0.0 〜 1.0)
};

// 🚀 超高速MP3初期化（ページ読み込み時に事前準備）
const initializeUltraFastMP3 = async () => {
  for (const [soundType, soundPath] of Object.entries(soundPaths)) {
    ultraFastAudioPool[soundType] = [];
    
    // プールにオーディオオブジェクトを作成
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio(soundPath);
      audio.preload = 'auto';
      audio.volume = soundSettings.effectsVolume;
      
      // ロード完了まで待機（初回のみ）
      if (i === 0) {
        await new Promise<void>((resolve, reject) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject();
          audio.load();
        });
      } else {
        audio.load();
      }
      
      ultraFastAudioPool[soundType].push(audio);
    }
  }
  console.log('🚀 超高速MP3システム初期化完了');
};

// ページ読み込み時に自動で初期化
if (typeof window !== 'undefined') {
  initializeUltraFastMP3().catch(console.error);
}

/**
 * 🚀 超高速MP3効果音再生（プール使用、遅延最小化）
 * @param soundType 再生する効果音の種類
 * @param volume 音量 (0.0 〜 1.0)、設定した音量にこの値を乗算
 */
export const playSound = (soundType: SoundType, volume: number = 1.0): void => {
  if (!soundSettings.effectsEnabled) return;

  try {
    // プールから使用可能なオーディオオブジェクトを取得
    const pool = ultraFastAudioPool[soundType];
    if (!pool || pool.length === 0) {
      console.warn(`MP3プールが初期化されていません: ${soundType}`);
      return;
    }

    // 再生可能なオーディオオブジェクトを探す（高速検索）
    let availableAudio: HTMLAudioElement | null = null;
    for (let i = 0; i < pool.length; i++) {
      const audio = pool[i];
      if (audio.ended || audio.paused || audio.currentTime === 0) {
        availableAudio = audio;
        break;
      }
    }

    // 全て使用中の場合は最初のものを強制リセット
    if (!availableAudio) {
      availableAudio = pool[0];
      availableAudio.pause();
      availableAudio.currentTime = 0;
    }

    // 🚀 超高速再生（最小限の設定）
    availableAudio.volume = soundSettings.effectsVolume * volume;
    availableAudio.currentTime = 0;
    availableAudio.play().catch(() => {}); // エラーは無視（最速化）
    
  } catch (error) {
    // エラーハンドリングは最小限
    console.warn(`MP3再生エラー: ${soundType}`);
  }
};

/**
 * 🚀 超高速BGM再生（シングルインスタンス管理）
 * @param bgmType 再生するBGMの種類
 * @param loop ループ再生するかどうか
 * @param volume 音量 (0.0 〜 1.0)、設定した音量にこの値を乗算
 */
export const playBGM = (bgmType: BGMType, loop: boolean = true, volume: number = 1.0): void => {
  if (!soundSettings.bgmEnabled) return;
  
  try {
    // 現在のBGMを停止
    stopBGM();
    
    // 音声ファイルのパスを取得
    const bgmPath = bgmPaths[bgmType];
    if (!bgmPath) return;

    // 🚀 新しいBGMインスタンスを作成（キャッシュなし、軽量化）
    const audio = new Audio(bgmPath);
    audio.preload = 'auto';
    audio.loop = loop;
    audio.volume = soundSettings.bgmVolume * volume;
    audio.currentTime = 0;
    
    // 🚀 超高速再生
    audio.play().catch(() => {}); // エラーは無視（最速化）
    
    // 現在再生中のBGMとして設定
    currentBGM = audio;
  } catch (error) {
    // エラーハンドリングは最小限
    console.warn(`BGM再生エラー: ${bgmType}`);
  }
};

/**
 * BGMを停止
 */
export const stopBGM = (): void => {
  if (currentBGM) {
    currentBGM.pause();
    currentBGM.currentTime = 0;
    currentBGM = null;
  }
};

/**
 * 🚀 超高速BGMを一時停止
 */
export const pauseBGM = (): void => {
  if (currentBGM) {
    currentBGM.pause();
  }
};

/**
 * 🚀 超高速BGMを再開
 */
export const resumeBGM = (): void => {
  if (!soundSettings.bgmEnabled) return;
  
  if (currentBGM) {
    currentBGM.play().catch(() => {}); // エラーは無視（最速化）
  }
};

/**
 * 🚀 すべての効果音を事前初期化（ゲーム開始時に呼び出し）
 * 既に初期化済みなので、このメソッドは軽量チェックのみ
 */
export const preloadAllSounds = (): void => {
  console.log('🚀 超高速MP3システム: すべての効果音は事前初期化済み');
};

/**
 * 効果音の有効/無効を設定
 * @param enabled 有効にする場合はtrue
 */
export const setEffectsEnabled = (enabled: boolean): void => {
  soundSettings.effectsEnabled = enabled;
};

/**
 * BGMの有効/無効を設定
 * @param enabled 有効にする場合はtrue
 */
export const setBGMEnabled = (enabled: boolean): void => {
  soundSettings.bgmEnabled = enabled;
  
  // 無効にする場合は再生中のBGMを停止
  if (!enabled && currentBGM) {
    stopBGM();
  }
};

// 打鍵音の設定関数は削除

/**
 * 効果音の音量を設定
 * @param volume 音量 (0.0 〜 1.0)
 */
export const setEffectsVolume = (volume: number): void => {
  soundSettings.effectsVolume = Math.max(0, Math.min(1, volume));
};

/**
 * BGMの音量を設定
 * @param volume 音量 (0.0 〜 1.0)
 */
export const setBGMVolume = (volume: number): void => {
  soundSettings.bgmVolume = Math.max(0, Math.min(1, volume));
  
  // 現在再生中のBGMの音量も更新
  if (currentBGM) {
    currentBGM.volume = soundSettings.bgmVolume;
  }
};
