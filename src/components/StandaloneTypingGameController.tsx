import React, { useRef, useState, useCallback, useMemo } from 'react';
import { TypingWord, PerWordScoreLog, GameScoreLog } from '@/types';
import { wordList } from '@/data/wordList';
import { createBasicTypingChars } from '@/utils/basicJapaneseUtils';

export type GameState = 'ready' | 'playing' | 'finished';

export interface StandaloneTypingGameControllerProps {
  questionCount?: number;
  customWordList?: Array<{ japanese: string; hiragana: string }>;
  autoStart?: boolean;
  onGameComplete?: (finalScore: GameScoreLog['total'], scoreLog: PerWordScoreLog[]) => void;
  children: (controller: {
    gameState: GameState;
    currentWord: TypingWord;
    completedCount: number;
    questionCount: number;
    finalScore: GameScoreLog['total'] | null;
    scoreLog: PerWordScoreLog[];
    handleWordComplete: (scoreLog: PerWordScoreLog) => void;
    handleStartGame: () => void;
    handleRestart: () => void;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    setCurrentWordIndex: React.Dispatch<React.SetStateAction<number>>;
  }) => React.ReactNode;
}

/**
 * StandaloneTypingGameController - 状態・進行・スコア管理を一元化
 * UI描画はchildren関数に委譲
 */
export const StandaloneTypingGameController: React.FC<StandaloneTypingGameControllerProps> = ({
  questionCount = 8,
  customWordList,
  autoStart = true,
  onGameComplete,
  children
}) => {
  const [gameState, setGameState] = useState<GameState>(autoStart ? 'playing' : 'ready');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [scoreLog, setScoreLog] = useState<PerWordScoreLog[]>([]);
  const [finalScore, setFinalScore] = useState<GameScoreLog['total'] | null>(null);

  const gameWordList = useMemo(() => {
    const sourceList = customWordList || wordList;
    const shuffled = [...sourceList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, questionCount);
  }, [customWordList, questionCount]);

  const currentWord = useMemo((): TypingWord => {
    if (currentWordIndex >= gameWordList.length) {
      return { japanese: '', hiragana: '', romaji: '', typingChars: [], displayChars: [] };
    }
    const word = gameWordList[currentWordIndex];
    const typingChars = createBasicTypingChars(word.hiragana);
    const displayChars = typingChars.map(char => char.patterns[0] || '');
    return {
      japanese: word.japanese,
      hiragana: word.hiragana,
      romaji: displayChars.join(''),
      typingChars,
      displayChars
    };
  }, [gameWordList, currentWordIndex]);

  const handleWordComplete = useCallback((wordScoreLog: PerWordScoreLog) => {
    setScoreLog(prev => [...prev, wordScoreLog]);
    const newCompletedCount = completedCount + 1;
    setCompletedCount(newCompletedCount);
    if (newCompletedCount >= questionCount) {
      setGameState('finished');
      const newScoreLog = [...scoreLog, wordScoreLog];
      const totalKeyCount = newScoreLog.reduce((sum, log) => sum + log.keyCount, 0);
      const totalCorrect = newScoreLog.reduce((sum, log) => sum + log.correct, 0);
      const totalMiss = newScoreLog.reduce((sum, log) => sum + log.miss, 0);
      const totalDuration = newScoreLog.reduce((sum, log) => sum + log.duration, 0);
      const avgKpm = totalDuration > 0 ? (totalCorrect / totalDuration) * 60 : 0;
      const avgAccuracy = totalKeyCount > 0 ? totalCorrect / totalKeyCount : 1;
      const calculatedScore: GameScoreLog['total'] = {
        kpm: Math.max(0, avgKpm),
        accuracy: Math.min(1, Math.max(0, avgAccuracy)),
        correct: totalCorrect,
        miss: totalMiss
      };
      setFinalScore(calculatedScore);
      if (onGameComplete) {
        onGameComplete(calculatedScore, newScoreLog);
      }
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  }, [completedCount, questionCount, scoreLog, onGameComplete]);

  const handleStartGame = useCallback(() => {
    setGameState('playing');
    setCurrentWordIndex(0);
    setCompletedCount(0);
    setScoreLog([]);
    setFinalScore(null);
  }, []);

  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  return children({
    gameState,
    currentWord,
    completedCount,
    questionCount,
    finalScore,
    scoreLog,
    handleWordComplete,
    handleStartGame,
    handleRestart,
    setGameState,
    setCurrentWordIndex,
  });
};

export default StandaloneTypingGameController;
