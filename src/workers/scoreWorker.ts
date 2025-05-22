// タイピングゲーム用スコア計算Web Worker
// 入力: 各お題ごとの履歴配列 [{ keyCount, missCount, correctCount, startTime, endTime }]
// 出力: { kpm, accuracy, correct, miss }

export type ScoreWorkerRequest = {
  type: 'calcScore';
  payload: {
    results: Array<{
      keyCount: number;
      missCount: number;
      correctCount: number;
      startTime: number; // ms
      endTime: number;   // ms
    }>,
  },
};

export type ScoreWorkerResponse = {
  type: 'scoreResult';
  payload: {
    kpm: number;
    accuracy: number;
    correct: number;
    miss: number;
  },
};

self.onmessage = (e: MessageEvent<ScoreWorkerRequest>) => {
  const { type, payload } = e.data;
  if (type === 'calcScore') {
    const { results } = payload;
    let kpmSum = 0;
    let kpmCount = 0;
    let totalCorrect = 0;
    let totalMiss = 0;
    let totalKey = 0;
    let totalInput = 0;
    for (const r of results) {
      const timeSec = (r.endTime - r.startTime) / 1000;
      if (timeSec > 0 && r.keyCount > 0) {
        kpmSum += (r.keyCount / timeSec) * 60;
        kpmCount++;
      }
      totalCorrect += r.correctCount;
      totalMiss += r.missCount;
      totalKey += r.keyCount;
      totalInput += r.correctCount + r.missCount;
    }
    const kpm = kpmCount > 0 ? Math.round((kpmSum / kpmCount) * 10) / 10 : 0;
    const accuracy = totalInput > 0 ? Math.round((totalCorrect / totalInput) * 1000) / 10 : 0;
    const result: ScoreWorkerResponse = {
      type: 'scoreResult',
      payload: {
        kpm,
        accuracy,
        correct: totalCorrect,
        miss: totalMiss,
      },
    };
    self.postMessage(result);
  }
};
