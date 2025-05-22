// KeyboardSoundUtils.js (コピー元: manabyUI/src/utils/KeyboardSoundUtils.js)
'use client';

// 効果音のキャッシュ
const soundCache = {
  click: null,
  error: null,
  success: null,
};

// 音量設定 (0.0 - 1.0)
const VOLUME_SETTINGS = {
  click: 0.35,
  error: 0.2,
  success: 0.3,
};

let audioContext = null;

class KeyboardSoundUtils {
  static getAudioContext() {
    if (!audioContext && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
      } catch (e) {
        console.warn('[KeyboardSoundUtils] AudioContextの作成に失敗:', e);
        return null;
      }
    }
    return audioContext;
  }
  static playClickSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      // --- 青軸メカニカルキーボード風（改良版） ---
      
      // わずかなランダム性を追加して自然さを向上
      const randomPitch = 1.0 + (Math.random() * 0.1 - 0.05); // ±5%のピッチ変動
      const randomVol = 1.0 + (Math.random() * 0.1 - 0.05);   // ±5%の音量変動
      const currentTime = ctx.currentTime;
      
      // 1. 初期クリック音（カチッという鋭い音）
      const initialClick = ctx.createOscillator();
      initialClick.type = 'square';
      initialClick.frequency.setValueAtTime(3800 * randomPitch, currentTime);
      initialClick.frequency.exponentialRampToValueAtTime(280, currentTime + 0.025);
      
      // 初期クリックのエンベロープ（短い音）
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(VOLUME_SETTINGS.click * 0.9 * randomVol, currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03);
      
      // 2. キースイッチの「ボトム音」（低い倍音を含む、ボディに伝わる音）
      const bottomSound = ctx.createOscillator();
      bottomSound.type = 'triangle';
      bottomSound.frequency.setValueAtTime(220 * randomPitch, currentTime + 0.005);
      bottomSound.frequency.exponentialRampToValueAtTime(180, currentTime + 0.04);
      
      // 3. 金属的な倍音（高音部の質感）
      const metalSound = ctx.createOscillator();
      metalSound.type = 'sawtooth';
      metalSound.frequency.setValueAtTime(2400 * randomPitch, currentTime);
      metalSound.frequency.exponentialRampToValueAtTime(1800, currentTime + 0.02);
      
      // メタル音のフィルター（高域強調）
      const metalFilter = ctx.createBiquadFilter();
      metalFilter.type = 'bandpass';
      metalFilter.frequency.setValueAtTime(3000, currentTime);
      metalFilter.Q.value = 2.5;
      
      // 4. キースイッチの「戻り」の音（微妙な上昇音）
      const returnSound = ctx.createOscillator();
      returnSound.type = 'triangle';
      returnSound.frequency.setValueAtTime(180 * randomPitch, currentTime + 0.025);
      returnSound.frequency.linearRampToValueAtTime(280 * randomPitch, currentTime + 0.05);
      
      // 戻り音のエンベロープ（遅れて始まり徐々に小さく）
      const returnGain = ctx.createGain();
      returnGain.gain.setValueAtTime(0.001, currentTime);
      returnGain.gain.linearRampToValueAtTime(VOLUME_SETTINGS.click * 0.15 * randomVol, currentTime + 0.03);
      returnGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.06);
      
      // 5. 微細なノイズ成分（キーキャップの質感）
      const bufferSize = 512; // より長いノイズバッファ
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      
      // ノイズフィルター（ホワイトノイズを整形）
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2800, currentTime);
      noiseFilter.Q.value = 0.8;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.14 * randomVol, currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03);
      
      // メイン出力のエンベロープ
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(VOLUME_SETTINGS.click * randomVol, currentTime);
      mainGain.gain.linearRampToValueAtTime(VOLUME_SETTINGS.click * 0.7 * randomVol, currentTime + 0.015);
      mainGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.07);
      
      // コンプレッサーで全体の音をまとめる
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -15;
      compressor.knee.value = 10;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.002;
      compressor.release.value = 0.05;
      
      // 接続
      initialClick.connect(clickGain);
      clickGain.connect(mainGain);
      
      bottomSound.connect(mainGain);
      
      metalSound.connect(metalFilter);
      metalFilter.connect(mainGain);
      
      returnSound.connect(returnGain);
      returnGain.connect(mainGain);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(mainGain);
      
      mainGain.connect(compressor);
      compressor.connect(ctx.destination);
      
      // 音の開始と停止
      initialClick.start(currentTime);
      bottomSound.start(currentTime);
      metalSound.start(currentTime);
      returnSound.start(currentTime);
      noise.start(currentTime);
      
      initialClick.stop(currentTime + 0.03);
      bottomSound.stop(currentTime + 0.05);
      metalSound.stop(currentTime + 0.04);
      returnSound.stop(currentTime + 0.07);
      noise.stop(currentTime + 0.03);
      
    } catch (e) {
      console.warn('[KeyboardSoundUtils] クリック音の再生に失敗:', e);
    }
  }
  static playErrorSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const currentTime = ctx.currentTime;
      
      // 通常のクリック音よりも「重い」ボタン押しを表現
      const dullClick = ctx.createOscillator();
      dullClick.type = 'square';
      dullClick.frequency.setValueAtTime(180, currentTime);
      dullClick.frequency.exponentialRampToValueAtTime(90, currentTime + 0.15);
      
      // 低音のエラーサウンド（警告感）
      const errorOsc = ctx.createOscillator();
      errorOsc.type = 'sawtooth';
      errorOsc.frequency.setValueAtTime(140, currentTime);
      errorOsc.frequency.exponentialRampToValueAtTime(80, currentTime + 0.2);
      
      // 摩擦音（キーの引っかかり感）
      const friction = ctx.createOscillator();
      friction.type = 'sawtooth';
      friction.frequency.setValueAtTime(280, currentTime);
      friction.frequency.linearRampToValueAtTime(120, currentTime + 0.1);
      
      // 摩擦音のフィルター
      const frictionFilter = ctx.createBiquadFilter();
      frictionFilter.type = 'bandpass';
      frictionFilter.frequency.setValueAtTime(200, currentTime);
      frictionFilter.Q.value = 1.5;
      
      // ノイズ成分（こすれ音）
      const bufferSize = 1024;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.2;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      
      // ノイズフィルター
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(400, currentTime);
      
      // 各要素のゲイン設定
      const dullGain = ctx.createGain();
      dullGain.gain.setValueAtTime(VOLUME_SETTINGS.error * 0.7, currentTime);
      dullGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
      
      const errorGain = ctx.createGain();
      errorGain.gain.setValueAtTime(VOLUME_SETTINGS.error, currentTime);
      errorGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.25);
      
      const frictionGain = ctx.createGain();
      frictionGain.gain.setValueAtTime(VOLUME_SETTINGS.error * 0.5, currentTime);
      frictionGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.12);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1);
      
      // 接続
      dullClick.connect(dullGain);
      errorOsc.connect(errorGain);
      friction.connect(frictionFilter);
      frictionFilter.connect(frictionGain);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      
      dullGain.connect(ctx.destination);
      errorGain.connect(ctx.destination);
      frictionGain.connect(ctx.destination);
      noiseGain.connect(ctx.destination);
      
      // 開始と停止
      dullClick.start(currentTime);
      errorOsc.start(currentTime);
      friction.start(currentTime);
      noise.start(currentTime);
      
      dullClick.stop(currentTime + 0.15);
      errorOsc.stop(currentTime + 0.25);
      friction.stop(currentTime + 0.12);
      noise.stop(currentTime + 0.1);
    } catch (e) {
      console.warn('[KeyboardSoundUtils] エラー音の再生に失敗:', e);
    }
  }
  static playSuccessSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const currentTime = ctx.currentTime;
      
      // 大きなエンターキー風の低音「クリック」
      const bigClick = ctx.createOscillator();
      bigClick.type = 'square';
      bigClick.frequency.setValueAtTime(220, currentTime);
      bigClick.frequency.exponentialRampToValueAtTime(150, currentTime + 0.08);
      
      // スプリング戻り音（大きめのキーの戻り音）
      const spring = ctx.createOscillator();
      spring.type = 'triangle';
      spring.frequency.setValueAtTime(280, currentTime + 0.05);
      spring.frequency.exponentialRampToValueAtTime(380, currentTime + 0.12);
      
      // 高周波の「達成感」成分
      const achievement = ctx.createOscillator();
      achievement.type = 'sine';
      achievement.frequency.setValueAtTime(500, currentTime);
      achievement.frequency.exponentialRampToValueAtTime(800, currentTime + 0.15);
      
      // 「カチャ」としたメカニカル感を出すためのノイズ
      const bufferSize = 1024;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // より強いノイズパルスを前半に集中
        const factor = i < bufferSize / 4 ? 0.25 : 0.08;
        output[i] = (Math.random() * 2 - 1) * factor;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      
      // ノイズフィルター（高域のみ通過）
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2000, currentTime);
      
      // 各成分のゲイン設定
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(VOLUME_SETTINGS.success * 1.2, currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.12);
      
      const springGain = ctx.createGain();
      springGain.gain.setValueAtTime(0.001, currentTime);
      springGain.gain.linearRampToValueAtTime(VOLUME_SETTINGS.success * 0.5, currentTime + 0.07);
      springGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);
      
      const achievementGain = ctx.createGain();
      achievementGain.gain.setValueAtTime(VOLUME_SETTINGS.success * 0.5, currentTime + 0.02);
      achievementGain.gain.linearRampToValueAtTime(VOLUME_SETTINGS.success * 0.6, currentTime + 0.10);
      achievementGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.25);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08);
      
      // コンプレッサーで音圧を整える
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.knee.value = 12;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.002;
      compressor.release.value = 0.1;
      
      // 接続
      bigClick.connect(clickGain);
      spring.connect(springGain);
      achievement.connect(achievementGain);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      
      clickGain.connect(compressor);
      springGain.connect(compressor);
      achievementGain.connect(compressor);
      noiseGain.connect(compressor);
      
      compressor.connect(ctx.destination);
      
      // 開始と停止
      bigClick.start(currentTime);
      spring.start(currentTime);
      achievement.start(currentTime);
      noise.start(currentTime);
      
      bigClick.stop(currentTime + 0.12);
      spring.stop(currentTime + 0.20);
      achievement.stop(currentTime + 0.25);
      noise.stop(currentTime + 0.08);
    } catch (e) {
      console.warn('[KeyboardSoundUtils] 成功音の再生に失敗:', e);
    }
  }
}

export default KeyboardSoundUtils;
