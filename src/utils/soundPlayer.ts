/**
 * タイピングゲーム用の効果音プレーヤー
 */

// 効果音のタイプ
type SoundType = 'correct' | 'wrong' | 'complete' | 'start';

// 効果音のパス
const soundPaths: Record<SoundType, string> = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  complete: '/sounds/complete.mp3',
  start: '/sounds/start.mp3'
};

// キャッシュ用のオーディオオブジェクト
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * 効果音を再生
 * @param soundType 再生する効果音の種類
 * @param volume 音量 (0.0 〜 1.0)
 */
export const playSound = (soundType: SoundType, volume: number = 1.0): void => {
  try {
    // 音声ファイルのパスを取得
    const soundPath = soundPaths[soundType];
    if (!soundPath) return;

    // 音声をキャッシュから取得するか、新規作成
    let audio = audioCache[soundType];
    if (!audio) {
      audio = new Audio(soundPath);
      audioCache[soundType] = audio;
    }

    // 音声の設定
    audio.volume = volume;
    
    // 再生が終了していない場合は巻き戻して再生
    if (!audio.ended) {
      audio.currentTime = 0;
    }
    
    // 再生
    audio.play().catch(error => {
      console.warn(`サウンド再生エラー: ${soundType}`, error);
    });
  } catch (error) {
    console.error('効果音再生中にエラーが発生しました:', error);
  }
};

/**
 * すべての効果音をプリロード
 */
export const preloadSounds = (): void => {
  Object.keys(soundPaths).forEach(key => {
    const soundType = key as SoundType;
    const audio = new Audio(soundPaths[soundType]);
    audio.preload = 'auto';
    audioCache[soundType] = audio;
  });
};

/**
 * 音量を設定
 * @param volume 音量 (0.0 〜 1.0)
 */
export const setVolume = (volume: number): void => {
  Object.values(audioCache).forEach(audio => {
    audio.volume = volume;
  });
};
