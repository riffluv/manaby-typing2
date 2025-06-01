/**
 * ⚡ 寿司打レベル最適化タイピングプロセッサ V2
 * 
 * UltraFastTypingEngineに完全委譲して
 * React処理を最小限に削減
 */
import { useCallback, useState, useEffect, useRef } from 'react';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import type { TypingChar } from '@/utils/OptimizedTypingChar';
import { ultraFastTypingEngine } from '@/utils/UltraFastTypingEngine';
import { useGameStatus } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';

interface UseOptimizedTypingProcessorProps {
  typingChars: TypingChar[];
  onWordComplete: (scoreLog: PerWordScoreLog) => void;
  onKeyDown?: (key: string) => void;
}

interface UseOptimizedTypingProcessorReturn {
  currentKanaIndex: number;
  kanaDisplay: KanaDisplay;
  handleProgress: (kanaIndex: number, display: KanaDisplay) => void;
  handleWordComplete: (scoreLog: PerWordScoreLog) => void;
  isEngineActive: boolean;
  resetWord: () => void;
}

export function useUltraFastTypingProcessor({
  typingChars,
  onWordComplete,
  onKeyDown,
}: UseOptimizedTypingProcessorProps): UseOptimizedTypingProcessorReturn {
  
  const gameStatus = useGameStatus();
  const audioEnabled = useAudioStore(state => state.effectsEnabled);
  const containerRef = useRef<HTMLElement | null>(null);
  
  // ⚡ コールバック参照の安定化（再初期化を防ぐ）
  const onWordCompleteRef = useRef(onWordComplete);
  const onKeyDownRef = useRef(onKeyDown);
  
  // コールバック参照を更新
  useEffect(() => {
    onWordCompleteRef.current = onWordComplete;
    onKeyDownRef.current = onKeyDown;
  }, [onWordComplete, onKeyDown]);
  
  // ⚡ 最小限のReact状態管理（表示用のみ）
  const [currentKanaIndex, setCurrentKanaIndex] = useState(0);
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay>({
    acceptedText: '',
    remainingText: '',
    displayText: ''
  });

  // ⚡ UltraFastEngineからの進捗更新（安定化された関数）
  const handleProgress = useCallback((kanaIndex: number, display: KanaDisplay) => {
    setCurrentKanaIndex(kanaIndex);
    setKanaDisplay({
      acceptedText: display.acceptedText,
      remainingText: display.remainingText,
      displayText: display.displayText
    });
    
    // onKeyDownコールバック（必要時のみ）
    if (onKeyDownRef.current) {
      onKeyDownRef.current(''); // UltraFastEngineが直接処理するため空文字
    }
  }, []);

  // ⚡ 単語完了処理（安定化された関数）
  const handleWordComplete = useCallback((scoreLog: PerWordScoreLog) => {
    if (onWordCompleteRef.current) {
      onWordCompleteRef.current(scoreLog);
    }
  }, []);
  // ⚡ エンジン初期化（ゲーム開始時）
  useEffect(() => {
    if (gameStatus === 'playing' && typingChars.length > 0) {
      // コンテナ要素を検索（ゲーム画面内のtyping-area）
      const container = document.querySelector('.typing-area') as HTMLElement;
      if (container) {
        containerRef.current = container;
          // UltraFastEngine初期化
        ultraFastTypingEngine.initialize(
          container,
          typingChars,
          handleProgress,
          handleWordComplete,
          audioEnabled
        );
      }
    }
    
    return () => {
      // クリーンアップ
      if (gameStatus !== 'playing') {
        ultraFastTypingEngine.destroy();
      }
    };
  }, [gameStatus, typingChars, audioEnabled]); // handleProgress, handleWordCompleteを削除
  // ⚡ 単語リセット処理
  const resetWord = useCallback(() => {
    ultraFastTypingEngine.resetWord();
    setCurrentKanaIndex(0);
    setKanaDisplay({
      acceptedText: '',
      remainingText: '',
      displayText: ''
    });
  }, []);

  // ⚡ エンジンアクティブ状態
  const isEngineActive = ultraFastTypingEngine.isEngineActive();

  return {
    currentKanaIndex,
    kanaDisplay,
    handleProgress,
    handleWordComplete,
    isEngineActive,
    resetWord,
  };
}
