/**
 * タイピングゲーム用のサウンドプレーヤー
 * - 効果音（打鍵音、正誤音など）
 * - BGM（バックグラウンドミュージック）
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

// キャッシュ用のオーディオオブジェクト
const audioCache: Record<string, HTMLAudioElement> = {};

// 現在再生中のBGM
let currentBGM: HTMLAudioElement | null = null;

// サウンド設定
const soundSettings = {
  effectsEnabled: true,  // 効果音の有効/無効
  bgmEnabled: true,      // BGMの有効/無効
  effectsVolume: 0.5,    // 効果音の音量 (0.0 〜 1.0)
  bgmVolume: 0.3         // BGMの音量 (0.0 〜 1.0)
};

// WebAudio API（プリレンダバッファ）方式のインポート
import LightweightKeyboardSound from './LightweightKeyboardSound';

// サウンドエンジンの選択（"webaudio" or "mp3"）
let soundEngine: 'webaudio' | 'mp3' = 'webaudio';

// WebAudioの初期化フラグ
let webAudioReady = false;

// WebAudioの初期化
const initWebAudio = async () => {
  try {
    await LightweightKeyboardSound.initializePrerenderedBuffers();
    webAudioReady = true;
  } catch (e) {
    webAudioReady = false;
    soundEngine = 'mp3'; // フォールバック
  }
};

// ゲーム開始時などで明示的に初期化推奨
initWebAudio();

/**
 * 効果音を再生
 * @param soundType 再生する効果音の種類
 * @param volume 音量 (0.0 〜 1.0)、設定した音量にこの値を乗算
 */
export const playSound = (soundType: SoundType, volume: number = 1.0): void => {
  if (!soundSettings.effectsEnabled) return;

  // WebAudio方式（最速）
  if (soundEngine === 'webaudio' && webAudioReady) {
    if (soundType === 'correct') {
      LightweightKeyboardSound.playSuccessSound();
    } else if (soundType === 'wrong') {
      LightweightKeyboardSound.playErrorSound();
    }
    return;
  }

  // mp3方式（セカンド/フォールバック）
  try {
    const soundPath = soundPaths[soundType];
    if (!soundPath) return;
    let audio = audioCache[soundType];
    if (!audio) {
      audio = new Audio(soundPath);
      audio.preload = 'auto';
      audioCache[soundType] = audio;
    }
    const clonedAudio = audio.cloneNode() as HTMLAudioElement;
    clonedAudio.volume = soundSettings.effectsVolume * volume;
    if (!audio.ended) {
      audio.currentTime = 0;
    }
    clonedAudio.play().catch(error => {
      console.warn(`サウンド再生エラー: ${soundType}`, error);
    });
  } catch (error) {
    console.error('効果音再生中にエラーが発生しました:', error);
  }
};

/**
 * BGMを再生
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

    // 音声をキャッシュから取得するか、新規作成
    let audio = audioCache[`bgm-${bgmType}`];
    if (!audio) {
      audio = new Audio(bgmPath);
      audio.preload = 'auto';
      audioCache[`bgm-${bgmType}`] = audio;
    }

    // 音声の設定
    audio.loop = loop;
    audio.volume = soundSettings.bgmVolume * volume;
    audio.currentTime = 0;
    
    // 再生
    audio.play().catch(error => {
      console.warn(`BGM再生エラー: ${bgmType}`, error);
    });
    
    // 現在再生中のBGMとして設定
    currentBGM = audio;
  } catch (error) {
    console.error('BGM再生中にエラーが発生しました:', error);
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
 * BGMを一時停止
 */
export const pauseBGM = (): void => {
  if (currentBGM) {
    currentBGM.pause();
  }
};

/**
 * BGMを再開
 */
export const resumeBGM = (): void => {
  if (!soundSettings.bgmEnabled) return;
  
  if (currentBGM) {
    currentBGM.play().catch(error => {
      console.warn('BGM再開エラー:', error);
    });
  }
};

/**
 * すべての効果音とBGMをプリロード
 * ゲーム開始時に呼び出すことで、初回再生時の遅延を防ぐ
 */
export const preloadAllSounds = (): void => {
  // 効果音のプリロード
  Object.keys(soundPaths).forEach(key => {
    const soundType = key as SoundType;
    const audio = new Audio(soundPaths[soundType]);
    audio.preload = 'auto';
    audioCache[soundType] = audio;
  });
  
  // BGMのプリロード
  Object.keys(bgmPaths).forEach(key => {
    const bgmType = key as BGMType;
    const audio = new Audio(bgmPaths[bgmType]);
    audio.preload = 'auto';
    audioCache[`bgm-${bgmType}`] = audio;
  });
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
