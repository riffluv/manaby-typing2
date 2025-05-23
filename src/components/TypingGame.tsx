'use client';

import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { useGameStatus, useTypingGameStore, useCurrentWord } from '@/store/typingGameStore';
import { useAudioStore } from '@/store/audioStore';
import { TypingWord, KanaDisplay } from '@/types/typing';
import { useTypingGameLifecycle } from '@/hooks/useTypingGameLifecycle';
import MCPStatus from '@/components/MCPStatus';
import GameScreen from '@/components/GameScreen';
import type { PerWordScoreLog, GameScoreLog } from '@/types/score';
import { useRouter } from 'next/navigation';
import KeyboardSoundUtils from '@/utils/KeyboardSoundUtils';
import { addRankingEntry } from '@/lib/rankingManaby2';
import type { ScoreWorkerRequest, ScoreWorkerResponse } from '@/workers/scoreWorker';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- 型定義・reducer・getScoreWorkerはコンポーネント外 ---
type ModalState = {
  show: boolean;
  name: string;
  registering: boolean;
  done: boolean;
  error: string;
};
const initialModalState: ModalState = {
  show: false,
  name: '',
  registering: false,
  done: false,
  error: '',
};
function modalReducer(state: ModalState, action: any): ModalState {
  switch (action.type) {
    case 'open': return { ...state, show: true, done: false, error: '', name: '' };
    case 'close': return { ...initialModalState };
    case 'setName': return { ...state, name: action.name };
    case 'registering': return { ...state, registering: true, error: '' };
    case 'success': return { ...state, registering: false, done: true, error: '' };
    case 'error': return { ...state, registering: false, error: action.error };
    default: return state;
  }
}
let scoreWorker: Worker | null = null;
function getScoreWorker() {
  if (!scoreWorker) {
    // Next.jsではpublic配下のscoreWorker.jsを直接参照
    scoreWorker = new Worker('/scoreWorker.js');
  }
  return scoreWorker;
}

const TypingGame: React.FC<{ onGoMenu?: () => void; onGoRanking?: () => void }> = ({ onGoMenu, onGoRanking }) => {
  // --- ここから下はすべて関数コンポーネント内でフック・store・propsを宣言 ---
  const router = useRouter();
  const gameStatus = useGameStatus();
  const { setGameStatus, advanceToNextWord, resetGame, setupCurrentWord } = useTypingGameStore();
  const storeWord = useCurrentWord();
  const { playSound } = useAudioStore();
  useTypingGameLifecycle();

  // --- タイピング進行・スコア記録はuseRefで管理し、再レンダリングを抑制 ---
  const typingCharsRef = useRef<TypingWord['typingChars']>([]);
  const displayCharsRef = useRef<TypingWord['displayChars']>([]);
  const kanaIndexRef = useRef<number>(0);
  const wordKeyCountRef = useRef(0);
  const wordCorrectRef = useRef(0);
  const wordMissRef = useRef(0);
  const wordStartTimeRef = useRef<number>(0);

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
  const [scoreLog, setScoreLog] = useState<PerWordScoreLog[]>([]);
  const [resultScore, setResultScore] = useState<GameScoreLog['total'] | null>(null);
  const [modalState, dispatchModal] = useReducer(modalReducer, initialModalState);
  const [isScoreRegistered, setIsScoreRegistered] = useState(false);

  // --- useCallbackで関数の再生成を抑制 ---
  const handleReset = useCallback(() => {
    resetGame();
    setupCurrentWord();
    setScoreLog([]);
    setResultScore(null);
    setIsScoreRegistered(false); // ゲームリセット時に登録済みフラグもリセット
  }, [resetGame, setupCurrentWord]);

  const handleRegisterRanking = useCallback(async () => {
    if (!resultScore || !modalState.name.trim() || isScoreRegistered) return;
    dispatchModal({ type: 'registering' });
    try {
      await addRankingEntry({
        name: modalState.name.trim(),
        kpm: resultScore.kpm,
        accuracy: resultScore.accuracy,
        correct: resultScore.correct,
        miss: resultScore.miss
      });
      setIsScoreRegistered(true); // 登録成功時にフラグを立てる
      dispatchModal({ type: 'success' });
      setTimeout(() => dispatchModal({ type: 'close' }), 1200);
    } catch (e: any) {
      dispatchModal({ type: 'error', error: '登録に失敗しました: ' + (e?.message || String(e)) });
    }
  }, [resultScore, modalState.name, isScoreRegistered]);

  const handleGoRanking = useCallback(() => {
    if (onGoRanking) onGoRanking();
  }, [onGoRanking]);
  const handleGoMenu = useCallback(() => {
    if (onGoMenu) onGoMenu();
  }, [onGoMenu]);

  // --- WebWorkerスコア計算はゲーム終了時のみ ---
  const calcScoreWithWorker = useCallback((payload: ScoreWorkerRequest['payload']): Promise<ScoreWorkerResponse['payload']> => {
    return new Promise((resolve, reject) => {
      const worker = getScoreWorker();
      const handleMessage = (e: MessageEvent<any>) => {
        const data = e.data;
        if (data && data.type === 'scoreResult' && data.payload) {
          resolve(data.payload);
        } else {
          reject(new Error('Workerから不正なレスポンス'));
        }
        worker.removeEventListener('message', handleMessage);
      };
      worker.addEventListener('message', handleMessage);
      worker.postMessage({ type: 'calcScore', payload });
    });
  }, []);

  // --- useEffectでお題切り替え・スコア計算・キー入力を管理（再レンダリング最小化） ---
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
        const mappedData = scoreLog.map(log => ({
          keyCount: typeof log.keyCount === 'number' ? log.keyCount : 0,
          missCount: typeof log.miss === 'number' ? log.miss : 0,
          correctCount: typeof log.correct === 'number' ? log.correct : 0,
          startTime: typeof log.startTime === 'number' ? log.startTime : 0,
          endTime: typeof log.endTime === 'number' ? log.endTime : 0,
        }));
        if (mappedData.length === 0) {
          setResultScore({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
          return;
        }
        calcScoreWithWorker({ results: mappedData })
          .then(result => {
            setResultScore({
              kpm: typeof result.kpm === 'number' ? result.kpm : 0,
              accuracy: typeof result.accuracy === 'number' ? result.accuracy : 0,
              correct: typeof result.correct === 'number' ? result.correct : 0,
              miss: typeof result.miss === 'number' ? result.miss : 0,
            });
          })
          .catch(error => {
            setResultScore({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
          });
      } catch (e) {
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

  // 画面分割レンダリング
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-transparent text-white relative z-10 overflow-hidden">
      {/* 画面切り替えごとにTailwindクラスで装飾 - monkeytype風ミニマルデザイン */}
      {gameStatus === 'ready' && (
        <motion.div 
          className="bg-transparent rounded p-8 text-center w-full max-w-2xl animate-fadeIn min-h-[45vh] flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* スタート画面 */}
          <h2 className="text-4xl font-mono font-bold mb-8 tracking-tight">manaby typing</h2>
          
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-800 border border-amber-400 text-amber-400 rounded px-4 py-2 font-mono mr-2">space</div>
            <p className="text-xl">を押してスタート</p>
          </div>
          
          <div className="text-gray-400 text-sm mt-4">
            <MCPStatus />
          </div>
          
          {/* 背景は既存のものを維持 */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 rounded-lg pointer-events-none"></div>
        </motion.div>
      )}
      
      {gameStatus === 'playing' && (
        <motion.div 
          className="bg-transparent rounded p-8 text-center w-full max-w-3xl animate-fadeIn min-h-[45vh] flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* ゲーム画面 - GameScreenはほぼそのまま使用 */}
          <GameScreen 
            currentWord={currentWord}
            currentKanaIndex={kanaIndexRef.current}
            currentKanaDisplay={kanaDisplay}
          />
          
          {/* プログレスバーとステータス */}
          <div className="w-full max-w-lg mx-auto mt-6">
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-400"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min((scoreLog.length / 10) * 100, 100)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-400 mt-2 font-mono">
              <div>WORDS: {scoreLog.length}</div>
              {scoreLog.length > 0 && (
                <>
                  <div>KPM: {Math.round(scoreLog.reduce((sum, log) => sum + log.kpm, 0) / scoreLog.length)}</div>
                  <div>ACC: {Math.round(scoreLog.reduce((sum, log) => sum + log.accuracy, 0) / scoreLog.length)}%</div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {gameStatus === 'finished' && (
        <motion.div 
          className="bg-transparent rounded p-8 text-center w-full max-w-2xl animate-fadeIn min-h-[45vh] flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* リザルト画面 */}
          <h2 className="text-3xl font-mono font-bold mb-8 text-center">test complete</h2>
          
          <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-center mb-10 w-full max-w-md mx-auto">
            {resultScore ? (
              <>
                <div>
                  <div className="text-gray-400 text-sm mb-1 font-mono">kpm</div>
                  <div className="text-4xl font-mono text-amber-400 font-bold">{Math.floor(resultScore.kpm)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1 font-mono">accuracy</div>
                  <div className="text-4xl font-mono text-amber-400 font-bold">{Math.floor(resultScore.accuracy)}%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1 font-mono">correct</div>
                  <div className="text-3xl font-mono text-green-400 font-bold">{resultScore.correct}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1 font-mono">miss</div>
                  <div className="text-3xl font-mono text-red-400 font-bold">{resultScore.miss}</div>
                </div>
              </>
            ) : gameStatus === 'finished' && scoreLog.length > 0 ? (
              <div className="col-span-2 text-center py-4">
                <div className="text-lg font-mono mb-4">計算中...</div>
                <button 
                  className="bg-amber-500 hover:bg-amber-600 text-gray-900 rounded px-4 py-2 font-bold transition-colors"
                  onClick={() => {
                    // 強制的に再計算を試みる
                    const dummyScore = {
                      kpm: Math.floor(scoreLog.reduce((sum, log) => sum + (log.kpm || 0), 0) / scoreLog.length || 0),
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
              <div className="col-span-2 text-center py-4 font-mono">計算中...</div>
            )}
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            {/* ランキング登録ボタン */}
            {resultScore && !modalState.done && !isScoreRegistered && (
              <button 
                onClick={() => dispatchModal({ type: 'open' })} 
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded transition-colors w-48"
              >
                ランキング登録
              </button>
            )}
            
            {isScoreRegistered && (
              <div className="text-green-400 font-mono">このスコアは登録済みです</div>
            )}
            
            <button 
              onClick={handleReset} 
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded transition-colors w-48"
            >
              もう一度プレイ
            </button>
            
            <button 
              onClick={handleGoRanking} 
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-colors w-48"
            >
              ランキングへ
            </button>
            
            <button 
              onClick={handleGoMenu} 
              className="px-6 py-2 border border-gray-700 hover:bg-gray-800 text-white font-medium rounded transition-colors w-48"
            >
              メニューへ
            </button>
          </div>
          
          {/* 背景は既存のものを維持 */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 rounded-lg pointer-events-none"></div>
        </motion.div>
      )}

      {/* ランキング登録モーダル - monkeytype風にリデザイン */}
      {modalState.show && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={modalState.done ? 'done' : 'form'}
              className="bg-gray-900 rounded-lg p-8 shadow-xl w-full max-w-md mx-4 border border-gray-700"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              layout
            >
              <h3 className="text-xl font-mono font-semibold mb-6 text-amber-400">ランキング登録</h3>
              {modalState.done ? (
                <div className="min-h-[120px] flex flex-col items-center justify-center">
                  <div className="text-green-400 font-bold text-lg mb-4">登録が完了しました！</div>
                  <button 
                    onClick={()=>dispatchModal({type:'close'})} 
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              ) : (
                <form className="min-h-[120px]" onSubmit={e => {e.preventDefault();handleRegisterRanking();}}>
                  <input
                    type="text"
                    placeholder="名前を入力（10文字以内）"
                    maxLength={10}
                    value={modalState.name}
                    onChange={e => dispatchModal({ type: 'setName', name: e.target.value })}
                    className="p-3 rounded border border-gray-600 w-full text-center mb-4 bg-gray-800 text-white font-mono"
                    disabled={modalState.registering || isScoreRegistered}
                  />
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded font-bold transition-colors disabled:opacity-50"
                      disabled={modalState.registering || !modalState.name.trim() || isScoreRegistered}
                    >
                      {modalState.registering ? '登録中...' : '登録する'}
                    </button>
                    
                    {modalState.error && <div className="text-red-400 text-sm my-2 font-mono">{modalState.error}</div>}
                    
                    <button 
                      type="button" 
                      onClick={()=>dispatchModal({type:'close'})} 
                      className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TypingGame;
