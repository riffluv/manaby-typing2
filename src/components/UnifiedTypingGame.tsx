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

// 統合されたカスタムフックとコンポーネントのインポート
import { useUnifiedTypingProcessor } from '@/hooks/useUnifiedTypingProcessor';
import { useScoreCalculation } from '@/hooks/useScoreCalculation';
import { useRankingModal } from '@/hooks/useRankingModal';
import GameResultScreen from '@/components/GameResultScreen';
import RankingModal from '@/components/RankingModal';
import PortalShortcut from '@/components/PortalShortcut';
import GameScreen from '@/components/GameScreen';

// スタイルのインポート
import styles from '@/styles/GamePlayingScreen.module.css';

/**
 * 統合されたタイピングゲームコンポーネント
 * - TypingGame.tsxとGamePlayingScreen.tsxの機能を統合
 * - WebWorkerスコア計算とKeyboardSoundUtilsを保持
 * - 無限ループ防止と依存関係の最適化
 */
const UnifiedTypingGame: React.FC<{ onGoMenu?: () => void; onGoRanking?: () => void }> = ({ 
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

  // プログレス表示用の状態
  const [hasStarted, setHasStarted] = useState(false);

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

  // 統合されたタイピング処理フックの使用
  const { currentKanaIndex, wordStats, resetProgress } = useUnifiedTypingProcessor(
    currentWord, 
    setKanaDisplay, 
    setScoreLog
  );

  // スコア計算処理（WebWorker使用）
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
    resetProgress();
  }, [resetGame, setupCurrentWord, resetProgress]);

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

  // ESCキーでメニューに戻る（ゲーム中のみ）
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleGoMenu();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleGoMenu, gameStatus]);

  // アニメーション制御
  useEffect(() => {
    if (scoreLog.length > 0 && !hasStarted) {
      setHasStarted(true);
    }
    if (scoreLog.length === 0 && hasStarted) {
      setHasStarted(false);
    }
  }, [scoreLog.length, hasStarted]);

  // スコア計算ロジック
  const latestKpm = scoreLog.length > 0 ? Math.round(scoreLog[scoreLog.length - 1].kpm) : 0;
  const latestAccuracy = scoreLog.length > 0 ? Math.round(scoreLog[scoreLog.length - 1].accuracy) : 0;
  const progressPercentage = Math.min((scoreLog.length / 10) * 100, 100);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ゲームプレイ中の画面 */}
      {gameStatus === 'playing' && (
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
        >
          {/* ゲーム画面はEscのみ */}
          <PortalShortcut shortcuts={[{ key: 'Esc', label: '戻る' }]} />
          
          {/* ゲーム画面 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <GameScreen 
              currentWord={currentWord}
              currentKanaIndex={currentKanaIndex}
              currentKanaDisplay={kanaDisplay}
            />
          </motion.div>

          {/* プログレスバーとステータス */}
          <motion.div 
            className={styles.progressContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className={styles.progressBarTrack}>
              <motion.div 
                className={styles.progressBar}
                style={{ width: !hasStarted ? `${progressPercentage}%` : undefined }}
                animate={hasStarted ? { width: `${progressPercentage}%` } : false}
                transition={hasStarted ? { duration: 0.3, ease: "easeOut" } : {}}
              />
            </div>
            <div className={styles.statusText}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                WORDS: {scoreLog.length}/10
              </motion.div>
              
              {scoreLog.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    KPM: <span>{latestKpm}</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                  >
                    ACC: <span>{latestAccuracy}%</span>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
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

export default UnifiedTypingGame;
