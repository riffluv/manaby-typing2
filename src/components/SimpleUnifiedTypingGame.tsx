import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStatus, useTypingGameStore, useCurrentWord } from '@/store/typingGameStore';
import { TypingWord, PerWordScoreLog, GameScoreLog } from '@/types';
import { useScoreCalculation } from '@/hooks/useScoreCalculation';
import SimpleGameScreen from './SimpleGameScreen';
import SimpleGameResultScreen from './SimpleGameResultScreen';

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

  // WebWorkerを使用したスコア計算
  const { calculateFallbackScore } = useScoreCalculation(
    gameStatus, 
    scoreLog, 
    (calculatedScore) => {
      setResultScore(calculatedScore);
    }
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
  }, [gameStatus, setGameStatus]);  // 現在のお題が変わったときに更新
  useEffect(() => {
    if (storeWord && storeWord.japanese !== currentWord.japanese) {
      setCurrentWord(storeWord);
    }
  }, [storeWord, currentWord.japanese]);// 単語完了時の処理（実際のスコアデータを使用）
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
  };

  // Escキーでメニューに戻る
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameStatus === 'playing') {
        if (onGoMenu) {
          onGoMenu();
        } else {
          router.push('/');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
  }
  if (gameStatus === 'playing' && currentWord.japanese) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>        {/* プログレス表示 */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          fontSize: '1.2rem',
          color: '#000',
          background: 'rgba(255,255,255,0.8)',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #ccc'
        }}>
          {completedCount + 1} / {questionLimit}
        </div>

        <SimpleGameScreen
          currentWord={currentWord}
          onWordComplete={handleWordComplete}
        />
      </div>
    );
  }
  // ローディング状態
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.5rem'
    }}>
      ゲームを準備中...
    </div>
  );
};

SimpleUnifiedTypingGame.displayName = 'SimpleUnifiedTypingGame';
export default SimpleUnifiedTypingGame;
