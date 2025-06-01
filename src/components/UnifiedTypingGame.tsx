'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { useUltraFastTypingProcessor } from '@/hooks/useUltraFastTypingProcessor';
import { useScoreCalculation } from '@/hooks/useScoreCalculation';
import { createOptimizedTypingChars } from '@/utils/optimizedJapaneseUtils';
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
  const { setGameStatus, resetGame, setupCurrentWord, advanceToNextWord } = useTypingGameStore();
  const storeWord = useCurrentWord();
  const sceneNav = useSceneNavigationStore();
  
  // ゲームライフサイクルフックの使用
  useTypingGameLifecycle();

  // 状態管理（React状態更新最小化 - UltraFastEngine委譲）
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

  // ⚡ UltraFast流 最高速タイピング処理フックの使用
  const typingChars = React.useMemo(() => {
    return currentWord.hiragana ? createOptimizedTypingChars(currentWord.hiragana) : [];
  }, [currentWord.hiragana]);

  const { 
    currentKanaIndex, 
    kanaDisplay, 
    handleProgress, 
    handleWordComplete, 
    isEngineActive,
    resetWord
  } = useUltraFastTypingProcessor({
    typingChars,
    onWordComplete: (scoreLog) => {
      setScoreLog(prev => [...prev, scoreLog]);
      advanceToNextWord();
    },
    onKeyDown: () => {
      // 必要に応じて追加処理
    }
  });

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
  // リセット処理（⚡ UltraFastEngine対応版）
  const handleReset = useCallback(() => {
    console.log('🔄 handleReset: Starting complete reset...');
    
    // 1. ゲーム状態をリセット（これが最初に必要）
    resetGame();
    
    // 2. UltraFastEngineの単語状態をリセット
    resetWord();
    
    // 3. スコア関連をクリア
    setScoreLog([]);
    setResultScore(null);
    setIsScoreRegistered(false);
    
    // 4. 新しい単語をセットアップ（最後に実行）
    setupCurrentWord();
    
    console.log('🔄 handleReset: Complete reset finished');
  }, [resetGame, resetWord, setupCurrentWord]);

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
