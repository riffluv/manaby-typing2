import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBGMStore } from '@/store/bgmStore';
import type { BGMMode } from '@/utils/BGMPlayer';

/**
 * BGM自動制御フック
 * ページ/状態変化に応じて自動的にBGMモードを切り替える
 */

interface BGMAutoControlOptions {
  /** 強制的に指定モードに設定 */
  forceMode?: BGMMode;
  /** ゲーム開始時にBGMを変更するか */
  changeOnGameStart?: boolean;
  /** ゲーム終了時にBGMを変更するか */
  changeOnGameEnd?: boolean;
}

/**
 * ページベースBGM自動制御
 */
export function useBGMAutoControl(options: BGMAutoControlOptions = {}) {
  const { switchMode } = useBGMStore();
  const router = useRouter();

  useEffect(() => {
    if (options.forceMode) {
      switchMode(options.forceMode);
      return;
    }

    // パス名に基づいて自動モード決定
    const path = window.location.pathname;
    let targetMode: BGMMode = 'lobby'; // デフォルト

    if (path === '/' || path === '/lobby') {
      targetMode = 'lobby';
    } else if (path === '/game' || path.includes('/game')) {
      targetMode = 'game';
    } else if (path === '/result' || path.includes('/result')) {
      targetMode = 'result';
    } else if (path === '/ranking' || path.includes('/ranking')) {
      targetMode = 'ranking';
    } else if (path.includes('/settings')) {
      targetMode = 'settings';
    }

    console.log(`[BGMAutoControl] 🎵 ページ: ${path} → BGMモード: ${targetMode}`);
    switchMode(targetMode);
  }, [options.forceMode, switchMode]);
}

/**
 * ゲーム状態ベースBGM制御
 */
export function useBGMGameControl(
  gameState: 'waiting' | 'playing' | 'finished',
  options: BGMAutoControlOptions = {}
) {
  const { switchMode } = useBGMStore();

  useEffect(() => {
    if (!options.changeOnGameStart && !options.changeOnGameEnd) return;

    let targetMode: BGMMode;

    switch (gameState) {
      case 'waiting':
        targetMode = 'lobby';
        break;
      case 'playing':
        if (options.changeOnGameStart) {
          targetMode = 'game';
        } else {
          return; // 変更しない
        }
        break;
      case 'finished':
        if (options.changeOnGameEnd) {
          targetMode = 'result';
        } else {
          return; // 変更しない
        }
        break;
      default:
        return;
    }

    console.log(`[BGMGameControl] 🎮 ゲーム状態: ${gameState} → BGMモード: ${targetMode}`);
    switchMode(targetMode);
  }, [gameState, options.changeOnGameStart, options.changeOnGameEnd, switchMode]);
}

/**
 * 簡易BGM制御フック
 */
export function useBGMControl() {
  const { switchMode, setVolume, setEnabled, stop } = useBGMStore();

  return {
    // 基本制御
    switchTo: switchMode,
    setVolume,
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    stop,

    // よく使う組み合わせ
    toLobby: () => switchMode('lobby'),
    toGame: () => switchMode('game'),
    toResult: () => switchMode('result'),
    toRanking: () => switchMode('ranking'),
    toSettings: () => switchMode('settings'),
    toSilent: () => switchMode('silent'),

    // 音量プリセット
    setLow: () => setVolume(0.2),
    setMedium: () => setVolume(0.5),
    setHigh: () => setVolume(0.8)
  };
}

export default useBGMAutoControl;
