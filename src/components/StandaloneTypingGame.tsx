import React, { useMemo } from 'react';
import { TypingWord, PerWordScoreLog, GameScoreLog } from '@/types';
import { wordList } from '@/data/wordList';
import { createBasicTypingChars } from '@/utils/basicJapaneseUtils';
import StandaloneTypingGameController from './StandaloneTypingGameController';
import StandaloneTypingGameScreen from './StandaloneTypingGameScreen';

/**
 * StandaloneTypingGame - 独立したタイピングゲームコンポーネント
 * 
 * Phase 1: タイピング処理の分離
 * - SPA遷移システムから完全に独立
 * - ルーター、グローバルストア、シーンナビゲーションに依存しない
 * - 独立して動作する自己完結型タイピングゲーム
 * 
 * 特徴:
 * - ローカル状態管理のみ使用
 * - 外部依存を最小限に抑制
 * - BasicTypingEngineを活用した高性能タイピング処理
 * - 簡単な統合を可能にするコールバック API
 */

// ゲームの状態を表現する型
type GameState = 'ready' | 'playing' | 'finished';

// プロパティの型定義
export interface StandaloneTypingGameProps {
  /** 問題数（デフォルト: 8） */
  questionCount?: number;
  /** カスタム単語リスト（未指定時はデフォルトのwordListを使用） */
  customWordList?: Array<{ japanese: string; hiragana: string }>;
  /** ゲーム完了時のコールバック */
  onGameComplete?: (finalScore: GameScoreLog['total'], scoreLog: PerWordScoreLog[]) => void;
  /** メニューに戻るコールバック */
  onGoMenu?: () => void;
  /** ランキングに移動するコールバック */
  onGoRanking?: () => void;
  /** 自動スタート（デフォルト: true） */
  autoStart?: boolean;
}

/**
 * 独立したタイピングゲームコンポーネント
 * - SPA遷移システムから完全分離
 * - 自己完結型の状態管理
 * - BasicTypingEngineベースの高性能処理
 */
const StandaloneTypingGame: React.FC<StandaloneTypingGameProps> = (props) => {
  // Controller/Screen分離構造にリファクタ
  return (
    <StandaloneTypingGameController
      questionCount={props.questionCount}
      customWordList={props.customWordList}
      onGameComplete={props.onGameComplete}
      autoStart={props.autoStart}
    >
      {({
        gameState,
        currentWord,
        completedCount,
        questionCount,
        finalScore,
        scoreLog,
        handleWordComplete,
        handleStartGame,
        handleRestart,
      }) => (
        <StandaloneTypingGameScreen
          gameState={gameState}
          currentWord={currentWord}
          completedCount={completedCount}
          questionCount={questionCount}
          finalScore={finalScore}
          scoreLog={scoreLog}
          onWordComplete={handleWordComplete}
          onStartGame={handleStartGame}
          onRestart={handleRestart}
          onGoMenu={props.onGoMenu}
          onGoRanking={props.onGoRanking}
        />
      )}
    </StandaloneTypingGameController>
  );
};

StandaloneTypingGame.displayName = 'StandaloneTypingGame';
export default StandaloneTypingGame;
