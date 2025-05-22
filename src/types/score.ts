// スコア計算用の型定義

export type PerWordScoreLog = {
  keyCount: number; // そのお題で入力したキー数
  correct: number; // 正解数
  miss: number; // ミス数
  startTime: number; // 最初のキー入力時刻（ms）
  endTime: number;   // 最後のキー入力時刻（ms）
  duration: number;  // 入力にかかった時間（秒）
  kpm: number;       // そのお題のKPM
  accuracy: number;  // 正確率（0-1）
};

export type GameScoreLog = {
  perWord: PerWordScoreLog[];
  total: {
    kpm: number; // 平均KPM
    accuracy: number; // 平均正確率
    correct: number;
    miss: number;
  }
};
