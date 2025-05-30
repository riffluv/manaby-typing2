'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStatus, useTypingGameStore, useCurrentWord } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { useTypingGameLifecycle } from '@/hooks/useTypingGameLifecycle';
import { TypingWord, KanaDisplay, PerWordScoreLog, GameScoreLog } from '@/types';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore'; 
import { containerVariants, itemVariants } from '@/styles/animations';
import styles from './UnifiedTypingGame.module.css';
import screenStyles from './common/ScreenWrapper.module.css';

// 統合されたカスタムフックとコンポーネントのインポート
import { useOptimizedTypingProcessor } from '@/hooks/useOptimizedTypingProcessor';
import { useScoreCalculation } from '@/hooks/useScoreCalculation';
import { useRankingModal } from '@/hooks/useRankingModal';
import GameResultScreen from '@/components/GameResultScreen';
import RankingModal from '@/components/RankingModal';
import PortalShortcut from '@/components/PortalShortcut';
import GameScreen from '@/components/GameScreen';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

/**
 * タイピングゲーム本体コンポーネント
 * @returns {JSX.Element}
 */

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
  const sceneNav = useSceneNavigationStore();
  
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

  // 出題数を管理する状態を追加
  const [questionLimit, setQuestionLimit] = useState(8);

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

  // typingmania-ref流 最適化されたタイピング処理フックの使用
  const { currentKanaIndex, wordStats, resetProgress } = useOptimizedTypingProcessor(
    currentWord, 
    setKanaDisplay, 
    setScoreLog
  );

  // スコア計算処理（WebWorker使用）
  const { calculateFallbackScore } = useScoreCalculation(
    gameStatus, 
    scoreLog, 
    (calculatedScore) => {
      setResultScore(calculatedScore);
      // ゲーム終了時にグローバルストアへ保存
      if (gameStatus === 'finished') {
        sceneNav.setLastScore(scoreLog, calculatedScore);
      }
    }
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
  useGlobalShortcuts([
    {
      key: 'Escape',
      allowInputFocus: true,
      handler: (e) => {
        e.preventDefault();
        handleGoMenu();
      },
    },
  ], [handleGoMenu, gameStatus]);

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

  // ゲーム終了時にリザルト画面へ遷移した場合、直近スコアを復元
  useEffect(() => {
    if (gameStatus === 'finished' && scoreLog.length === 0 && !resultScore) {
      // グローバルストアから復元
      if (sceneNav.lastScoreLog && sceneNav.lastScoreLog.length > 0) {
        setScoreLog(sceneNav.lastScoreLog);
      }
      if (sceneNav.lastResultScore) {
        setResultScore(sceneNav.lastResultScore);
      }
    }
  }, [gameStatus, scoreLog.length, resultScore, sceneNav.lastScoreLog, sceneNav.lastResultScore]);

  return (
    <div className={screenStyles.screenWrapper}>
      {/* ゲームプレイ中の画面 */}
      {gameStatus === 'playing' && (
        <GameScreen 
          currentWord={currentWord}
          currentKanaIndex={currentKanaIndex}
          currentKanaDisplay={kanaDisplay}
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
    </div>
  );
};

export default UnifiedTypingGame;
