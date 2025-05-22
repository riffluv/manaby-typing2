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
import KeyboardSoundUtils from '@/utils/KeyboardSoundUtils';

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

const TypingGame: React.FC<{ onGoMenu?: () => void; onGoRanking?: () => void }> = ({ onGoMenu, onGoRanking }) => {
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
      if (e.key === 'Escape') {
        router.push('/'); // ESCでメインメニューに遷移
        return;
      }
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
        // --- ここをWeb Audio API合成音に差し替え ---
        KeyboardSoundUtils.playClickSound();
        // ---
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
            const now = Date.now();
            const durationMs = now - wordStartTimeRef.current;
            const durationSec = durationMs / 1000;
            let wordKpm = 0;
            let wordAccuracy = 0;
            
            if (durationSec > 0) {
              wordKpm = Math.round((wordKeyCountRef.current / durationSec) * 60 * 10) / 10;
            }
            
            const totalInput = wordCorrectRef.current + wordMissRef.current;
            if (totalInput > 0) {
              wordAccuracy = Math.round((wordCorrectRef.current / totalInput) * 1000) / 10;
            }
            
            setScoreLog(prev => [...prev, {
              keyCount: wordKeyCountRef.current,
              correct: wordCorrectRef.current,
              miss: wordMissRef.current,
              startTime: wordStartTimeRef.current,
              endTime: now,
              duration: durationSec,
              kpm: wordKpm,
              accuracy: wordAccuracy
            }]);
            setTimeout(() => {
              advanceToNextWord();
            }, 300);
          }
        }
      } else {
        wordMissRef.current++;
        // --- ここもWeb Audio API合成音に差し替え ---
        KeyboardSoundUtils.playErrorSound();
        // ---
      }
    };
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameStatus, advanceToNextWord, router]);

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
      console.log('スコア計算開始', scoreLog);
      
      try {
        // 型変換とプロパティ名の修正を明示的に行う
        const mappedData = scoreLog.map(log => {
          // nullチェックと型変換を行い、Workerが要求する形式に合わせる
          const missCount = typeof log.miss === 'number' ? log.miss : 0;
          const correctCount = typeof log.correct === 'number' ? log.correct : 0;
          
          return {
            keyCount: log.keyCount,
            missCount: missCount,
            correctCount: correctCount,
            startTime: log.startTime,
            endTime: log.endTime
          };
        });
        
        console.log('Worker送信データ', mappedData);
        
        if (mappedData.length === 0) {
          console.error('スコアデータがありません');
          setResultScore({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
          return;
        }
        
        calcScoreWithWorker({ results: mappedData })
          .then(result => {
            console.log('Worker結果', result);
            if (result && typeof result === 'object') {
              // 結果のバリデーション
              const validatedResult = {
                kpm: typeof result.kpm === 'number' ? result.kpm : 0,
                accuracy: typeof result.accuracy === 'number' ? result.accuracy : 0,
                correct: typeof result.correct === 'number' ? result.correct : 0,
                miss: typeof result.miss === 'number' ? result.miss : 0,
              };
              setResultScore(validatedResult);
            } else {
              console.error('不正な結果形式', result);
              setResultScore({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
            }
          })
          .catch(error => {
            console.error('スコア計算エラー', error);
            setResultScore({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
          });
      } catch (e) {
        console.error('スコア計算の準備中にエラー', e);
        setResultScore({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
      }
    }
  }, [gameStatus, scoreLog]);

  // /game直アクセス時のみリダイレクト（初回マウント時に一度だけ判定）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDirectAccess = window.location.pathname === '/game';
      const fromMenu = sessionStorage.getItem('fromMenu');
      if (isDirectAccess && !fromMenu) {
        router.replace('/');
      }
      if (fromMenu) {
        sessionStorage.removeItem('fromMenu'); // 一度だけ消す
      }
    }
    // eslint-disable-next-line
  }, []); // 初回マウント時のみ判定

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
            </> : 
            gameStatus === 'finished' && scoreLog.length > 0 ? (
              // 10秒以上経過してもスコアが計算されない場合のフォールバック
              <div className={styles.calculatingScore}>
                計算中...
                <button 
                  className={styles.recalcButton}
                  onClick={() => {
                    // 強制的に再計算を試みる
                    const dummyScore = {
                      kpm: scoreLog.reduce((sum, log) => sum + (log.kpm || 0), 0) / scoreLog.length || 0,
                      accuracy: scoreLog.reduce((sum, log) => sum + (log.accuracy || 0), 0) / scoreLog.length || 0,
                      correct: scoreLog.reduce((sum, log) => sum + (log.correct || 0), 0),
                      miss: scoreLog.reduce((sum, log) => sum + (log.miss || 0), 0)
                    };
                    setResultScore(dummyScore);
                  }}
                >
                  スコアを表示
                </button>
              </div>
            ) : (
              <div>計算中...</div>
            )}
          </div>
          <button onClick={handleReset} className={styles.resetButton}>
            もう一度プレイ
          </button>
          <button onClick={onGoRanking} className={styles.resetButton} style={{marginTop: 12, background: '#06b6d4'}}>
            ランキングへ
          </button>
          <button onClick={onGoMenu} className={styles.resetButton} style={{marginTop: 12, background: '#334155'}}>
            メニューへ
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingGame;
