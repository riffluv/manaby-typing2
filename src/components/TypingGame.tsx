'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStatus, useTypingGameStore, useCurrentWord } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { useTypingGameLifecycle } from '@/hooks/useTypingGameLifecycle';
import { TypingWord, KanaDisplay } from '@/types/typing';
import { PerWordScoreLog, GameScoreLog } from '@/types/score';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore'; 
import { containerVariants, itemVariants } from '@/styles/animations';

// カスタムフックとコンポーネントのインポート
import { useTypingKeyboardHandler } from '@/hooks/useTypingKeyboardHandler';
import { useScoreCalculation } from '@/hooks/useScoreCalculation';
import { useRankingModal } from '@/hooks/useRankingModal';
import GamePlayingScreen from '@/components/GamePlayingScreen';
import GameResultScreen from '@/components/GameResultScreen';
import RankingModal from '@/components/RankingModal';

/**
 * タイピングゲームのメインコンポーネント
 * 画面遷移、スコア管理、ゲームライフサイクルを制御
 */
const TypingGame: React.FC<{ onGoMenu?: () => void; onGoRanking?: () => void }> = ({ 
  onGoMenu, 
  onGoRanking 
}) => {
  const router = useRouter();
  const gameStatus = useGameStatus();
  const { setGameStatus, resetGame, setupCurrentWord } = useTypingGameStore();
  const storeWord = useCurrentWord();
  const { playSound } = useAudioStore();
  const { goToResult } = useSceneNavigationStore();
  
  // ゲームライフサイクルフックの使用
  useTypingGameLifecycle();

  // 状態管理
  const [kanaDisplay, setKanaDisplay] = useState<KanaDisplay>({
    acceptedText: '',
    remainingText: '',
    displayText: ''
  });
  const [currentWord, setCurrentWord] = useState<TypingWord>({
    japanese: '',
    hiragana: '',
    romaji: '',
    typingChars: [],
    displayChars: []
  });
  const [scoreLog, setScoreLog] = useState<PerWordScoreLog[]>([]);
  const [resultScore, setResultScore] = useState<GameScoreLog['total'] | null>(null);
  const [isScoreRegistered, setIsScoreRegistered] = useState(false);

  // 直アクセス防止機能
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ready状態をskipしてplaying状態に自動遷移
  useEffect(() => {
    if (gameStatus === 'ready') {
      setGameStatus('playing');
    }
  }, [gameStatus, setGameStatus]);

  // 現在のお題が変わったときに更新
  useEffect(() => {
    if (storeWord && storeWord.japanese !== currentWord.japanese) {
      setCurrentWord(storeWord);
    }
  }, [storeWord, currentWord.japanese]);

  // タイピングキーボード入力のハンドリング
  const { currentKanaIndex } = useTypingKeyboardHandler(currentWord, setKanaDisplay, setScoreLog);

  // スコア計算処理
  const { calculateFallbackScore } = useScoreCalculation(
    gameStatus, 
    scoreLog, 
    (calculatedScore) => setResultScore(calculatedScore)
  );

  // リセット処理
  const handleReset = useCallback(() => {
    resetGame();
    setupCurrentWord();
    setScoreLog([]);
    setResultScore(null);
    setIsScoreRegistered(false);
  }, [resetGame, setupCurrentWord]);

  // ランキングモーダル管理
  const { modalState, dispatch, handleRegisterRanking } = useRankingModal(
    resultScore,
    isScoreRegistered,
    () => setIsScoreRegistered(true)
  );

  // 画面遷移ハンドラ
  const handleGoRanking = useCallback(() => {
    if (onGoRanking) onGoRanking();
  }, [onGoRanking]);

  const handleGoMenu = useCallback(() => {
    if (onGoMenu) onGoMenu();
  }, [onGoMenu]);

  // ESCキーでメニューに戻る
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleGoMenu();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleGoMenu]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ゲームプレイ中の画面 */}
      {gameStatus === 'playing' && (
        <GamePlayingScreen
          currentWord={currentWord}
          currentKanaIndex={currentKanaIndex}
          kanaDisplay={kanaDisplay}
          scoreLog={scoreLog}
        />
      )}
      
      {/* ゲーム終了後の結果画面 */}
      {gameStatus === 'finished' && (
        <GameResultScreen
          resultScore={resultScore}
          scoreLog={scoreLog}
          onCalculateFallbackScore={() => setResultScore(calculateFallbackScore())}
          isScoreRegistered={isScoreRegistered}
          onOpenRankingModal={() => dispatch({ type: 'open' })}
          onReset={handleReset}
          onGoRanking={handleGoRanking}
          onGoMenu={handleGoMenu}
        />
      )}

      {/* ランキング登録モーダル */}
      <RankingModal
        show={modalState.show}
        name={modalState.name}
        registering={modalState.registering}
        done={modalState.done}
        error={modalState.error}
        isScoreRegistered={isScoreRegistered}
        onSubmit={(e) => {
          e.preventDefault();
          handleRegisterRanking();
        }}
        onChangeName={(name) => dispatch({ type: 'setName', name })}
        onClose={() => dispatch({ type: 'close' })}
      />
    </motion.div>
  );
};

export default TypingGame;
