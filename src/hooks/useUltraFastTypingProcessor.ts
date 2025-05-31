/**
 * ⚡ 寿司打レベル最適化タイピングプロセッサ V2
 * 
 * UltraFastTypingEngineに完全委譲して
 * React処理を最小限に削減
 */
import { useCallback, useState } from 'react';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import type { TypingChar } from '@/utils/OptimizedTypingChar';
import { ultraFastTypingEngine } from '@/utils/UltraFastTypingEngine';

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
}

export function useUltraFastTypingProcessor({
  typingChars,
  onWordComplete,
  onKeyDown,
}: UseOptimizedTypingProcessorProps): UseOptimizedTypingProcessorReturn {
  
  // ⚡ 最小限のReact状態管理
  const [currentKanaIndex, setCurrentKanaIndex] = useState(0);
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay>({
    acceptedText: '',
    remainingText: '',
    displayText: ''
  });

  // ⚡ UltraFastEngineからの進捗更新
  const handleProgress = useCallback((kanaIndex: number, display: KanaDisplay) => {
    setCurrentKanaIndex(kanaIndex);
    setKanaDisplay({
      acceptedText: display.acceptedText,
      remainingText: display.remainingText,
      displayText: display.displayText
    });
    
    // onKeyDownコールバック（必要時のみ）
    if (onKeyDown) {
      onKeyDown(''); // UltraFastEngineが直接処理するため空文字
    }
  }, [onKeyDown]);

  // ⚡ 単語完了処理
  const handleWordComplete = useCallback((scoreLog: PerWordScoreLog) => {
    onWordComplete(scoreLog);
  }, [onWordComplete]);
  // ⚡ エンジンアクティブ状態
  const isEngineActive = ultraFastTypingEngine.isEngineActive();

  return {
    currentKanaIndex,
    kanaDisplay,
    handleProgress,
    handleWordComplete,
    isEngineActive,
  };
}
