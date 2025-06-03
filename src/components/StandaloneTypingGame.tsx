import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TypingWord, PerWordScoreLog, GameScoreLog } from '@/types';
import { wordList } from '@/data/wordList';
import { createBasicTypingChars } from '@/utils/basicJapaneseUtils';
import SimpleGameScreen from './SimpleGameScreen';

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
const StandaloneTypingGame: React.FC<StandaloneTypingGameProps> = ({
  questionCount = 8,
  customWordList,
  onGameComplete,
  onGoMenu,
  onGoRanking,
  autoStart = true
}) => {
  // ローカル状態管理（グローバルストアを使用しない）
  const [gameState, setGameState] = useState<GameState>(autoStart ? 'playing' : 'ready');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [scoreLog, setScoreLog] = useState<PerWordScoreLog[]>([]);
  const [finalScore, setFinalScore] = useState<GameScoreLog['total'] | null>(null);

  // 使用する単語リストを決定（カスタムまたはデフォルト）
  const gameWordList = useMemo(() => {
    const sourceList = customWordList || wordList;
    
    // 問題数分の単語をランダムに選択
    const shuffled = [...sourceList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, questionCount);
  }, [customWordList, questionCount]);

  // 現在の単語を生成
  const currentWord = useMemo((): TypingWord => {
    if (currentWordIndex >= gameWordList.length) {
      return {
        japanese: '',
        hiragana: '',
        romaji: '',
        typingChars: [],
        displayChars: []
      };
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

  // 単語完了時の処理
  const handleWordComplete = useCallback((wordScoreLog: PerWordScoreLog) => {
    // スコアログに追加
    setScoreLog(prev => [...prev, wordScoreLog]);

    const newCompletedCount = completedCount + 1;
    setCompletedCount(newCompletedCount);

    if (newCompletedCount >= questionCount) {
      // ゲーム完了
      setGameState('finished');
      
      // 最終スコアを計算（簡易版）
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
      
      // コールバック呼び出し
      if (onGameComplete) {
        onGameComplete(calculatedScore, newScoreLog);
      }
    } else {
      // 次の単語に進む
      setCurrentWordIndex(prev => prev + 1);
    }
  }, [completedCount, questionCount, scoreLog, onGameComplete]);

  // ゲーム開始処理
  const handleStartGame = useCallback(() => {
    setGameState('playing');
    setCurrentWordIndex(0);
    setCompletedCount(0);
    setScoreLog([]);
    setFinalScore(null);
  }, []);

  // リスタート処理
  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  // Escキーでメニューに戻る処理（ゲーム中のみ）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'playing' && onGoMenu) {
        onGoMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, onGoMenu]);

  // ゲーム状態に応じたレンダリング
  if (gameState === 'ready') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center' }}>
          タイピングゲーム
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', textAlign: 'center' }}>
          {questionCount}問のタイピング問題にチャレンジしよう！
        </p>
        <button
          onClick={handleStartGame}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            backgroundColor: '#007acc',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ゲーム開始
        </button>
        {onGoMenu && (
          <button
            onClick={onGoMenu}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            メニューに戻る
          </button>
        )}
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center' }}>
          ゲーム完了！
        </h1>
        
        {finalScore && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            padding: '2rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            minWidth: '300px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>KPM</div>
              <div style={{ fontSize: '1.5rem', color: '#fff' }}>
                {Math.floor(finalScore.kpm)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>精度</div>
              <div style={{ fontSize: '1.5rem', color: '#fff' }}>
                {Math.floor(finalScore.accuracy * 100)}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>正解</div>
              <div style={{ fontSize: '1.5rem', color: '#fff' }}>
                {finalScore.correct}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>ミス</div>
              <div style={{ fontSize: '1.5rem', color: '#fff' }}>
                {finalScore.miss}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleRestart}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#007acc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            もう一度
          </button>
          {onGoRanking && (
            <button
              onClick={onGoRanking}
              style={{
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ランキング
            </button>
          )}
          {onGoMenu && (
            <button
              onClick={onGoMenu}
              style={{
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              メニュー
            </button>
          )}
        </div>
      </div>
    );
  }

  // ゲーム中の表示
  if (gameState === 'playing' && currentWord.japanese) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* プログレス表示 */}
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
          {completedCount + 1} / {questionCount}
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
      fontSize: '1.5rem',
      color: '#fff'
    }}>
      ゲームを準備中...
    </div>
  );
};

StandaloneTypingGame.displayName = 'StandaloneTypingGame';
export default StandaloneTypingGame;
