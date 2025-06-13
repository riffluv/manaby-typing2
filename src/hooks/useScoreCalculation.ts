'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { PerWordScoreLog, GameScoreLog } from '@/types';
import type { ScoreWorkerRequest, ScoreWorkerResponse } from '@/workers/scoreWorker';

/**
 * ゲームスコア計算のためのカスタムフック（WebWorker使用版）
 * パフォーマンス向上のためWebWorkerでスコア計算を実行
 */
export function useScoreCalculation(
  gameStatus: string, 
  scoreLog: PerWordScoreLog[],
  onScoreCalculated: (score: GameScoreLog['total']) => void
) {
  // WebWorkerとコールバックのref管理
  const workerRef = useRef<Worker | null>(null);
  const onScoreCalculatedRef = useRef(onScoreCalculated);
    // 常に最新のコールバックを参照
  useEffect(() => {
    onScoreCalculatedRef.current = onScoreCalculated;
  }, [onScoreCalculated]);

  // フォールバックスコア計算（WebWorker失敗時用）
  const calculateFallbackScore = useCallback(() => {
    if (scoreLog.length === 0) return { kpm: 0, accuracy: 0, correct: 0, miss: 0 };
    
    const totalCorrect = scoreLog.reduce((sum, log) => sum + (log.correct || 0), 0);
    const totalMiss = scoreLog.reduce((sum, log) => sum + (log.miss || 0), 0);
    const avgKpm = scoreLog.reduce((sum, log) => sum + (log.kpm || 0), 0) / scoreLog.length;
    const avgAccuracy = scoreLog.reduce((sum, log) => sum + (log.accuracy || 0), 0) / scoreLog.length;
    
    return {
      kpm: Math.floor(avgKpm),
      accuracy: Math.floor(avgAccuracy * 100),
      correct: totalCorrect,
      miss: totalMiss
    };
  }, [scoreLog]);

  // WebWorker初期化
  useEffect(() => {
    try {
      // WebWorkerを作成
      workerRef.current = new Worker('/scoreWorker.js');
      
      // WebWorkerからの結果受信
      workerRef.current.onmessage = (e: MessageEvent<ScoreWorkerResponse>) => {
        if (e.data && e.data.type === 'scoreResult') {
          onScoreCalculatedRef.current(e.data.payload);
        }
      };

      // WebWorkerエラーハンドリング
      workerRef.current.onerror = (error) => {
        console.error('WebWorker エラー:', error);
        // フォールバック計算を実行
        const fallbackResult = calculateFallbackScore();
        onScoreCalculatedRef.current(fallbackResult);
      };

      console.log('WebWorker初期化完了');
    } catch (error) {
      console.error('WebWorker初期化エラー:', error);
      // WebWorker作成に失敗した場合もフォールバックを用意
    }

    // クリーンアップ
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        console.log('WebWorkerクリーンアップ完了');
      }    };  }, [calculateFallbackScore]);

  // ゲーム終了時にWebWorkerでスコア計算実行
  useEffect(() => {
    if (gameStatus === 'finished' && scoreLog.length > 0 && workerRef.current) {
      // WebWorker用データ形式に変換
      const workerData: ScoreWorkerRequest = {
        type: 'calcScore',
        payload: {
          results: scoreLog.map(log => ({
            keyCount: log.keyCount || 0,
            missCount: log.miss || 0,
            correctCount: log.correct || 0,
            startTime: log.startTime || 0,
            endTime: log.endTime || 0
          }))
        }
      };      // WebWorkerにデータ送信
      console.log('WebWorkerにスコア計算データ送信:', workerData);
      try {
        workerRef.current.postMessage(workerData);
      } catch (error) {
        console.error('WebWorker通信エラー:', error);
        // フォールバック計算を実行
        const fallbackResult = calculateFallbackScore();
        onScoreCalculatedRef.current(fallbackResult);      }
    }  }, [gameStatus, scoreLog, calculateFallbackScore]);

  return {
    calculateFallbackScore
  };
}
