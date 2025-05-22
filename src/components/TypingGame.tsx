'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStatus, useTypingGameStore, useCurrentWord } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay } from '@/types/typing';
import { useTypingGameLifecycle } from '@/hooks/useTypingGameLifecycle';
import MCPStatus from '@/components/MCPStatus';
import GameScreen from '@/components/GameScreen';
import styles from '@/styles/TypingGame.module.css';
import type { PerWordScoreLog, GameScoreLog } from '@/types/score';
import { useRouter } from 'next/navigation';

// --- Web Workerスコア計算ラッパー ---
let scoreWorker: Worker | null = null;
function getScoreWorker() {
  if (!scoreWorker) {
    scoreWorker = new Worker(new URL('@/workers/scoreWorker.ts', import.meta.url));
  }
  return scoreWorker;
}
function calcScoreWithWorker(payload: any): Promise<any> {
  return new Promise((resolve) => {
    const worker = getScoreWorker();
    const handleMessage = (e: MessageEvent<any>) => {
      if (e.data.type === 'scoreResult') {
        resolve(e.data.payload);
        worker.removeEventListener('message', handleMessage);
      }
    };
    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'calcScore', payload });
  });
}

const TypingGame: React.FC = () => {
  const router = useRouter();
  // Zustandストアから「お題情報」「ゲーム状態」だけ購読
  const gameStatus = useGameStatus();
  const { setGameStatus, advanceToNextWord, resetGame, setupCurrentWord } = useTypingGameStore();
  const storeWord = useCurrentWord();
  const { playSound } = useAudioStore();
  useTypingGameLifecycle();

  // typingmania-ref流: 進行状態はuseRefで管理
  const typingCharsRef = useRef<TypingWord['typingChars']>([]);
  const displayCharsRef = useRef<TypingWord['displayChars']>([]);
  const kanaIndexRef = useRef<number>(0);

  // 画面表示用のみuseState
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

  // スコア記録
  const [scoreLog, setScoreLog] = useState<PerWordScoreLog[]>([]);
  const [resultScore, setResultScore] = useState<GameScoreLog['total'] | null>(null);
  const wordKeyCountRef = useRef(0);
  const wordCorrectRef = useRef(0);
  const wordMissRef = useRef(0);
  const wordStartTimeRef = useRef<number>(0);

  // お題切り替え時のみuseRefを初期化
  useEffect(() => {
    if (storeWord && storeWord.japanese !== currentWord.japanese) {
      setCurrentWord(storeWord);
      typingCharsRef.current = storeWord.typingChars;
      displayCharsRef.current = storeWord.displayChars;
      kanaIndexRef.current = 0;
      if (storeWord.typingChars.length > 0) {
        const info = storeWord.typingChars[0].getDisplayInfo();
        setKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
      }
      // お題切り替え時にスコア記録用refもリセット
      wordKeyCountRef.current = 0;
      wordCorrectRef.current = 0;
      wordMissRef.current = 0;
      wordStartTimeRef.current = 0;
    }
  }, [storeWord]);

  // typingmania-ref流: キー入力はuseRefを直接ミューテート
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const keyDownHandler = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      if (e.key.length !== 1) return;
      const typingChars = typingCharsRef.current;
      const idx = kanaIndexRef.current;
      const currentTypingChar = typingChars[idx];
      if (!currentTypingChar) return;
      if (wordKeyCountRef.current === 0) {
        wordStartTimeRef.current = Date.now();
      }
      wordKeyCountRef.current++;
      if (currentTypingChar.canAccept(e.key)) {
        currentTypingChar.accept(e.key);
        wordCorrectRef.current++;
        playSound && playSound('correct');
        const info = currentTypingChar.getDisplayInfo();
        setKanaDisplay({
          acceptedText: info.acceptedText,
          remainingText: info.remainingText,
          displayText: info.displayText
        });
        // かなが完了したら次へ
        if (info.isCompleted) {
          const nextIdx = idx + 1;
          kanaIndexRef.current = nextIdx;
          if (nextIdx < typingChars.length) {
            const nextInfo = typingChars[nextIdx].getDisplayInfo();
            setKanaDisplay({
              acceptedText: nextInfo.acceptedText,
              remainingText: nextInfo.remainingText,
              displayText: nextInfo.displayText
            });
          } else {
            // 1問分のスコア記録
            setScoreLog(prev => [...prev, {
              keyCount: wordKeyCountRef.current,
              correct: wordCorrectRef.current,
              miss: wordMissRef.current,
              startTime: wordStartTimeRef.current,
              endTime: Date.now(),
              duration: 0,
              kpm: 0,
              accuracy: 0
            }]);
            setTimeout(() => {
              advanceToNextWord();
            }, 300);
          }
        }
      } else {
        wordMissRef.current++;
        playSound && playSound('wrong');
      }
    };
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, advanceToNextWord, playSound]);

  // スペースキーでゲーム開始
  useEffect(() => {
    if (gameStatus !== 'ready') return;
    const keyDownHandler = (e: KeyboardEvent) => {
      if (gameStatus === 'ready' && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        setGameStatus('playing');
      }
    };
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, setGameStatus]);

  // ゲーム終了時にスコア計算
  useEffect(() => {
    if (gameStatus === 'finished' && scoreLog.length > 0) {
      calcScoreWithWorker({ results: scoreLog.map(log => ({
        keyCount: log.keyCount,
        missCount: log.miss ?? 0,
        correctCount: log.correct ?? 0,
        startTime: log.startTime,
        endTime: log.endTime
      })) }).then(setResultScore);
    }
  }, [gameStatus, scoreLog]);

  // リセットハンドラ
  const handleReset = useCallback(() => {
    resetGame();
    setupCurrentWord();
    setScoreLog([]);
    setResultScore(null);
  }, [resetGame, setupCurrentWord]);

  // 画面分割レンダリング
  return (
    <div className={styles.typingGameContainer}>
      {/* スタート画面 */}
      {gameStatus === 'ready' && (
        <div className={styles.startScreen}>
          <h2>タイピングゲーム</h2>
          <p>スペースキーを押してスタート</p>
        </div>
      )}
      {/* ゲーム画面 */}
      {gameStatus === 'playing' && (
        <GameScreen
          currentWord={currentWord}
          currentKanaIndex={kanaIndexRef.current}
          currentKanaDisplay={kanaDisplay}
        />
      )}
      {/* リザルト画面 */}
      {gameStatus === 'finished' && (
        <div className={styles.finishScreen}>
          <h2>リザルト画面</h2>
          <div className={styles.scoreBoard}>
            {resultScore ? <>
              <div>KPM<br /><span>{resultScore.kpm}</span></div>
              <div>Accuracy<br /><span>{resultScore.accuracy}%</span></div>
              <div>Correct<br /><span>{resultScore.correct}</span></div>
              <div>Miss<br /><span>{resultScore.miss}</span></div>
            </> : <div>計算中...</div>}
          </div>
          <button onClick={handleReset} className={styles.resetButton}>
            もう一度プレイ
          </button>
          <button onClick={() => router.push('/ranking')} className={styles.resetButton} style={{marginTop: 12, background: '#06b6d4'}}>
            ランキングへ
          </button>
          <button onClick={() => router.push('/')} className={styles.resetButton} style={{marginTop: 12, background: '#334155'}}>
            メニューへ
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingGame;
