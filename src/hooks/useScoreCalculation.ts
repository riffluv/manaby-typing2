'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { PerWordScoreLog, GameScoreLog } from '@/types';

/**
 * ゲームスコア計算のためのカスタムフック（無限ループ修正版）
 * WebWorkerを使用せず、シンプルな計算に変更
 */
export function useScoreCalculation(
  gameStatus: string, 
  scoreLog: PerWordScoreLog[],
  onScoreCalculated: (score: GameScoreLog['total']) => void
) {
  // onScoreCalculatedのrefを作成して依存配列から除外し、無限ループを防ぐ
  const onScoreCalculatedRef = useRef(onScoreCalculated);
  
  // 常に最新のコールバックを参照
  useEffect(() => {
    onScoreCalculatedRef.current = onScoreCalculated;
  }, [onScoreCalculated]);

  // ゲーム終了時にスコア計算実行（依存配列からonScoreCalculatedを除外）
  useEffect(() => {
    if (gameStatus === 'finished' && scoreLog.length > 0) {
      // 直接計算（WebWorkerを使わずシンプルに）
      const totalCorrect = scoreLog.reduce((sum, log) => sum + (log.correct || 0), 0);
      const totalMiss = scoreLog.reduce((sum, log) => sum + (log.miss || 0), 0);
      const totalKeyCount = scoreLog.reduce((sum, log) => sum + (log.keyCount || 0), 0);
      const avgKpm = scoreLog.length > 0 ? scoreLog.reduce((sum, log) => sum + (log.kpm || 0), 0) / scoreLog.length : 0;
      const avgAccuracy = scoreLog.length > 0 ? scoreLog.reduce((sum, log) => sum + (log.accuracy || 0), 0) / scoreLog.length : 0;

      const result = {
        kpm: Math.floor(avgKpm),
        accuracy: Math.floor(avgAccuracy * 100),
        correct: totalCorrect,
        miss: totalMiss
      };

      // refを使用してコールバックを呼び出し
      onScoreCalculatedRef.current(result);
    }
  }, [gameStatus, scoreLog]); // onScoreCalculatedを依存配列から除外

  // フォールバックスコア計算
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

  return {
    calculateFallbackScore
  };
}
