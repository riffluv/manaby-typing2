import React from 'react';
import { TypingWord, GameScoreLog, PerWordScoreLog } from '@/types';
import SimpleGameScreen from './SimpleGameScreen';

export interface StandaloneTypingGameScreenProps {
  gameState: 'ready' | 'playing' | 'finished';
  currentWord: TypingWord;
  completedCount: number;
  questionCount: number;
  finalScore: GameScoreLog['total'] | null;
  scoreLog: PerWordScoreLog[];
  onWordComplete: (scoreLog: PerWordScoreLog) => void;
  onStartGame: () => void;
  onRestart: () => void;
  onGoMenu?: () => void;
  onGoRanking?: () => void;
}

/**
 * StandaloneTypingGameScreen - UI描画専用
 * 状態・進行はpropsで受け取り、描画のみ担当
 */
const StandaloneTypingGameScreen: React.FC<StandaloneTypingGameScreenProps> = ({
  gameState,
  currentWord,
  completedCount,
  questionCount,
  finalScore,
  scoreLog,
  onWordComplete,
  onStartGame,
  onRestart,
  onGoMenu,
  onGoRanking,
}) => {
  if (gameState === 'ready') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center' }}>タイピングゲーム</h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', textAlign: 'center' }}>{questionCount}問のタイピング問題にチャレンジしよう！</p>
        <button onClick={onStartGame} style={{ padding: '1rem 2rem', fontSize: '1.2rem', backgroundColor: '#007acc', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>ゲーム開始</button>
        {onGoMenu && (
          <button onClick={onGoMenu} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', backgroundColor: '#666', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>メニューに戻る</button>
        )}
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center' }}>ゲーム完了！</h1>
        {finalScore && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '2rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', minWidth: '300px' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.9rem', color: '#ccc' }}>KPM</div><div style={{ fontSize: '1.5rem', color: '#fff' }}>{Math.floor(finalScore.kpm)}</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.9rem', color: '#ccc' }}>精度</div><div style={{ fontSize: '1.5rem', color: '#fff' }}>{Math.floor(finalScore.accuracy * 100)}%</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.9rem', color: '#ccc' }}>正解</div><div style={{ fontSize: '1.5rem', color: '#fff' }}>{finalScore.correct}</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.9rem', color: '#ccc' }}>ミス</div><div style={{ fontSize: '1.5rem', color: '#fff' }}>{finalScore.miss}</div></div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onRestart} style={{ padding: '1rem 1.5rem', fontSize: '1rem', backgroundColor: '#007acc', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>もう一度</button>
          {onGoRanking && (
            <button onClick={onGoRanking} style={{ padding: '1rem 1.5rem', fontSize: '1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>ランキング</button>
          )}
          {onGoMenu && (
            <button onClick={onGoMenu} style={{ padding: '1rem 1.5rem', fontSize: '1rem', backgroundColor: '#666', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>メニュー</button>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && currentWord.japanese) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'fixed', top: '20px', right: '20px', fontSize: '1.2rem', color: '#000', background: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: '8px', border: '1px solid #ccc' }}>{completedCount + 1} / {questionCount}</div>
        <SimpleGameScreen currentWord={currentWord} onWordComplete={onWordComplete} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', color: '#fff' }}>ゲームを準備中...</div>
  );
};

export default StandaloneTypingGameScreen;
