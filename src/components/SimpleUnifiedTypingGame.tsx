import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOptimizedGameStatus, useOptimizedCurrentWord } from '@/store/optimizedSelectors';
import { useTypingGameStore } from '@/store/typingGameStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { TypingWord, PerWordScoreLog, GameScoreLog, TypingChar } from '@/types';
import { useScoreCalculation } from '@/hooks/useScoreCalculation';
// import { PerformanceProfiler } from '@/utils/PerformanceProfiler'; // sub-5ms optimization: 測定オーバーヘッド除去
import SimpleGameScreen from './SimpleGameScreen';
import SimpleGameResultScreen from './SimpleGameResultScreen';
import styles from '@/styles/components/SimpleUnifiedTypingGame.module.css';

/**
 * シンプル統合タイピングゲーム - Hybridエンジン最適化版
 * - React.memo適用による不要な再レンダリング防止
 * - useCallback/useMemoによる関数・値のメモ化
 * - 依存配列の最適化による無限ループ防止
 * - HybridTypingEngine固定で「コロシアム級」レスポンス実現
 * - 日本語処理システムは変更せず、React層のみ最適化
 */
const SimpleUnifiedTypingGame: React.FC<{ 
  onGoMenu?: () => void; 
  onGoRanking?: () => void; 
}> = React.memo(({ 
  onGoMenu, 
  onGoRanking 
}) => {
  const router = useRouter();
  const gameStatus = useOptimizedGameStatus();
  const setGameStatus = useTypingGameStore((state) => state.setGameStatus);
  const advanceToNextWord = useTypingGameStore((state) => state.advanceToNextWord);
  const storeWord = useOptimizedCurrentWord();  
  // currentWordのメモ化された初期値
  const initialCurrentWord = useMemo(() => ({
    japanese: '',
    hiragana: '',
    romaji: '',
    typingChars: [] as TypingChar[],
    displayChars: [] as string[]
  }), []);

  const [currentWord, setCurrentWord] = useState<TypingWord>(initialCurrentWord);
  const [completedCount, setCompletedCount] = useState(0);
  const [questionLimit] = useState(8); // 固定値でシンプルに
  const [scoreLog, setScoreLog] = useState<PerWordScoreLog[]>([]);
  const [resultScore, setResultScore] = useState<GameScoreLog['total'] | null>(null);
  
  // メモ化されたコールバック
  const onScoreCalculated = useCallback((calculatedScore: GameScoreLog['total']) => {
    setResultScore(calculatedScore);
  }, []);

  // WebWorkerを使用したスコア計算
  const { calculateFallbackScore } = useScoreCalculation(
    gameStatus, 
    scoreLog, 
    onScoreCalculated
  );

  // メモ化されたナビゲーション関数
  const handleGoMenu = useCallback(() => {
    if (onGoMenu) {
      onGoMenu();
    } else {
      router.push('/');
    }
  }, [onGoMenu, router]);
  const handleGoRanking = useCallback(() => {
    if (onGoRanking) {
      onGoRanking();
    } else {
      router.push('/ranking');
    }
  }, [onGoRanking, router]);

  // リトライハンドラー - 同じモードでゲームを再開
  const handleRetry = useCallback(() => {
    // resetGame() はストアから現在のモードを保持してゲームをリセット
    const resetGame = useTypingGameStore.getState().resetGame;
    resetGame();
    
    // 状態をリセット
    setCompletedCount(0);
    setScoreLog([]);
    setResultScore(null);
    setGameStatus('playing');
  }, [setGameStatus]);

  // 直アクセス防止 - メモ化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDirectAccess = window.location.pathname === '/game';
      const fromMenu = sessionStorage.getItem('fromMenu');
      if (isDirectAccess && !fromMenu) {
        router.replace('/');
      }
      if (fromMenu) {
        sessionStorage.removeItem('fromMenu');
      }
    }
  }, [router]);

  // ready状態をskipしてplaying状態に自動遷移
  useEffect(() => {
    if (gameStatus === 'ready') {
      setGameStatus('playing');
    }
  }, [gameStatus, setGameStatus]);

  // 現在のお題が変わったときに更新 - 最適化された比較
  useEffect(() => {
    if (storeWord?.hiragana && storeWord.hiragana !== currentWord.hiragana) {
          setCurrentWord(storeWord);
    }
  }, [storeWord?.hiragana, currentWord.hiragana, storeWord]); // storeWordを依存関係に追加

  // 単語完了時の処理 - メモ化
  const handleWordComplete = useCallback((scoreLog: PerWordScoreLog) => {
    setScoreLog(prev => [...prev, scoreLog]);

    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    
    if (newCount >= questionLimit) {
      setGameStatus('finished');
    } else {
      advanceToNextWord();
    }
  }, [completedCount, questionLimit, setGameStatus, advanceToNextWord]);
  // Escキー処理 - DirectTypingEngine2との競合を回避
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 🚀 遅延修正: タイピング処理中は介入しない（DirectTypingEngine2に優先権を譲る）
      if (e.key === 'Escape' && gameStatus === 'playing') {
        e.stopImmediatePropagation(); // 他のリスナーをブロック
        handleGoMenu();
      }
    };

    // 🚀 遅延修正: capture: false でDirectTypingEngine2より後に実行
    window.addEventListener('keydown', handleKeyDown, { capture: false, passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown, false);
  }, [gameStatus, handleGoMenu]);

  // メモ化されたレンダリング条件
  const isFinished = gameStatus === 'finished';
  const isPlaying = gameStatus === 'playing' && currentWord.japanese;
  if (isFinished) {
    return (
      <SimpleGameResultScreen
        onGoMenu={handleGoMenu}
        onGoRanking={handleGoRanking}
        onRetry={handleRetry}
        resultScore={resultScore}
        scoreLog={scoreLog}
        onCalculateFallbackScore={() => setResultScore(calculateFallbackScore())}
      />
    );
  }  if (isPlaying) {
    return (
      <div className={styles.gameContainer}>
        <SimpleGameScreen
          currentWord={currentWord}
          onWordComplete={handleWordComplete}
        />
      </div>
    );
  }

  // ローディング状態
  return (
    <div className={styles.loadingScreen}>
      ゲームを準備中...
    </div>
  );
});

SimpleUnifiedTypingGame.displayName = 'SimpleUnifiedTypingGame';
export default SimpleUnifiedTypingGame;
