import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStatus, useTypingGameStore, useCurrentWord } from '@/store/typingGameStore';
import { TypingWord, PerWordScoreLog, GameScoreLog } from '@/types';
import { useScoreCalculation } from '@/hooks/useScoreCalculation';
// import { PerformanceProfiler } from '@/utils/PerformanceProfiler'; // sub-5ms optimization: 測定オーバーヘッド除去
import SimpleGameScreen from './SimpleGameScreen';
import SimpleGameResultScreen from './SimpleGameResultScreen';
import styles from '@/styles/components/SimpleUnifiedTypingGame.module.css';

/**
 * シンプル統合タイピングゲーム
 * - typingmania-ref流のシンプル設計
 * - 複雑な最適化を排除
 * - 必要最小限の状態管理
 */
const SimpleUnifiedTypingGame: React.FC<{ 
  onGoMenu?: () => void; 
  onGoRanking?: () => void; 
}> = ({ 
  onGoMenu, 
  onGoRanking 
}) => {
  const router = useRouter();
  const gameStatus = useGameStatus();
  const { setGameStatus, advanceToNextWord } = useTypingGameStore();
  const storeWord = useCurrentWord();
    const [currentWord, setCurrentWord] = useState<TypingWord>({
    japanese: '',
    hiragana: '',
    romaji: '',
    typingChars: [],
    displayChars: []
  });
  
  const [completedCount, setCompletedCount] = useState(0);
  const [questionLimit] = useState(8); // 固定値でシンプルに
  // スコア管理の追加
  const [scoreLog, setScoreLog] = useState<PerWordScoreLog[]>([]);
  const [resultScore, setResultScore] = useState<GameScoreLog['total'] | null>(null);
  // スコア計算コールバックをメモ化して無限ループを防ぐ
  const onScoreCalculated = useCallback((calculatedScore: GameScoreLog['total']) => {
    setResultScore(calculatedScore);
  }, []);

  // WebWorkerを使用したスコア計算
  const { calculateFallbackScore } = useScoreCalculation(
    gameStatus, 
    scoreLog, 
    onScoreCalculated
  );

  // 直アクセス防止
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
  }, [gameStatus, setGameStatus]);  // 現在のお題が変わったときに更新 - 深い比較で不要な更新を防ぐ
  useEffect(() => {
    if (storeWord && storeWord.hiragana && storeWord.hiragana !== currentWord.hiragana) {

      setCurrentWord(storeWord);
    }
  }, [storeWord?.hiragana, currentWord.hiragana]);// 単語完了時の処理（実際のスコアデータを使用）
  const handleWordComplete = (scoreLog: PerWordScoreLog) => {
    // BasicTypingEngineから受け取った実際のスコアデータを使用
    setScoreLog(prev => [...prev, scoreLog]);

    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    
    if (newCount >= questionLimit) {
      // ゲーム終了
      setGameStatus('finished');
    } else {
      // 次の単語に進む
      advanceToNextWord();
    }
  };  // Escキーでメニューに戻る（ゲーム中のみ）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⚡ PerformanceProfiler測定を完全除去（sub-5ms最適化）
      // 連続入力遅延の原因となるrequestAnimationFrameと測定オーバーヘッドを除去
      
      // ゲーム中のEscキーのみハンドル（タイピング入力との競合を避ける）
      if (e.key === 'Escape' && gameStatus === 'playing') {
        // タイピングエンジンがキャプチャモードなので、通常のイベントとして処理
        if (onGoMenu) {
          onGoMenu();
        } else {
          router.push('/');
        }
      }
    };

    // 🔍 高優先度：captureフェーズで早期測定開始
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [gameStatus, onGoMenu, router]);
  // ゲーム状態に応じたレンダリング
  if (gameStatus === 'finished') {
    return (
      <SimpleGameResultScreen
        onGoMenu={onGoMenu || (() => router.push('/'))}
        onGoRanking={onGoRanking || (() => router.push('/ranking'))}
        resultScore={resultScore}
        scoreLog={scoreLog}
        onCalculateFallbackScore={() => setResultScore(calculateFallbackScore())}
      />
    );
  }  if (gameStatus === 'playing' && currentWord.japanese) {
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
};

SimpleUnifiedTypingGame.displayName = 'SimpleUnifiedTypingGame';
export default SimpleUnifiedTypingGame;
