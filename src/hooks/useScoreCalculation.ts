'use client';

import { useEffect, useCallback } from 'react';
import type { PerWordScoreLog, GameScoreLog } from '@/types/score';
import type { ScoreWorkerRequest, ScoreWorkerResponse } from '@/workers/scoreWorker';

// Worker管理（モジュールスコープでWorkerを一度だけ作成）
let scoreWorker: Worker | null = null;
function getScoreWorker() {
  if (!scoreWorker && typeof window !== 'undefined') {
    // Next.jsではpublic配下のscoreWorker.jsを直接参照
    scoreWorker = new Worker('/scoreWorker.js');
  }
  return scoreWorker;
}

/**
 * ゲームスコア計算のためのカスタムフック
 * WebWorkerを使用して計算を行い、UIブロッキングを防止
 */
export function useScoreCalculation(
  gameStatus: string, 
  scoreLog: PerWordScoreLog[],
  onScoreCalculated: (score: GameScoreLog['total']) => void
) {
  // WebWorkerを使ったスコア計算
  const calcScoreWithWorker = useCallback((payload: ScoreWorkerRequest['payload']): Promise<ScoreWorkerResponse['payload']> => {
    return new Promise((resolve, reject) => {
      const worker = getScoreWorker();
      if (!worker) {
        reject(new Error('Worker initialization failed'));
        return;
      }

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

  // ゲーム終了時にスコア計算実行
  useEffect(() => {
    if (gameStatus === 'finished' && scoreLog.length > 0) {
      try {
        // スコアデータをWorker用に整形
        const mappedData = scoreLog.map(log => ({
          keyCount: typeof log.keyCount === 'number' ? log.keyCount : 0,
          missCount: typeof log.miss === 'number' ? log.miss : 0,
          correctCount: typeof log.correct === 'number' ? log.correct : 0,
          startTime: typeof log.startTime === 'number' ? log.startTime : 0,
          endTime: typeof log.endTime === 'number' ? log.endTime : 0,
        }));

        if (mappedData.length === 0) {
          onScoreCalculated({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
          return;
        }

        // Workerでスコア計算
        calcScoreWithWorker({ results: mappedData })
          .then(result => {
            onScoreCalculated({
              kpm: typeof result.kpm === 'number' ? result.kpm : 0,
              accuracy: typeof result.accuracy === 'number' ? result.accuracy : 0,
              correct: typeof result.correct === 'number' ? result.correct : 0,
              miss: typeof result.miss === 'number' ? result.miss : 0,
            });
          })
          .catch(error => {
            console.error('Score calculation error:', error);
            onScoreCalculated({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
          });
      } catch (e) {
        console.error('Score processing error:', e);
        onScoreCalculated({ kpm: 0, accuracy: 0, correct: 0, miss: 0 });
      }
    }
  }, [gameStatus, scoreLog, calcScoreWithWorker, onScoreCalculated]);

  // フォールバックスコア計算（Workerが失敗した場合）
  const calculateFallbackScore = useCallback(() => {
    if (scoreLog.length === 0) return { kpm: 0, accuracy: 0, correct: 0, miss: 0 };
    
    return {
      kpm: Math.floor(scoreLog.reduce((sum, log) => sum + (log.kpm || 0), 0) / scoreLog.length || 0),
      accuracy: scoreLog.reduce((sum, log) => sum + (log.accuracy || 0), 0) / scoreLog.length || 0,
      correct: scoreLog.reduce((sum, log) => sum + (log.correct || 0), 0),
      miss: scoreLog.reduce((sum, log) => sum + (log.miss || 0), 0)
    };
  }, [scoreLog]);

  return {
    calculateFallbackScore
  };
}

/**
 * スコア計算フック
 * @param scoreLog スコアログ
 * @returns スコア・正答率等の集計値
 */
