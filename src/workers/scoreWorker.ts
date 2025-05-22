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

self.onmessage = (e: MessageEvent<any>) => {
  try {
    console.log('Worker: メッセージ受信', e.data);
    
    if (!e.data || typeof e.data !== 'object') {
      throw new Error('不正なメッセージ形式');
    }
    
    const { type, payload } = e.data;
    
    if (type !== 'calcScore' || !payload || !payload.results) {
      throw new Error(`不正なメッセージタイプまたはデータ: ${type}`);
    }
    
    const { results } = payload;
    console.log('Worker: 計算開始', results);
    
    let kpmSum = 0;
    let kpmCount = 0;
    let totalCorrect = 0;
    let totalMiss = 0;
    let totalKey = 0;
    let totalInput = 0;
    
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error('結果データが配列ではないか空です');
    }
    
    for (const r of results) {
      console.log('Worker: 処理中のデータ', r);
      
      // 厳格なプロパティチェック
      const correctCount = typeof r.correctCount === 'number' ? r.correctCount : 
                         (typeof r.correct === 'number' ? r.correct : 0);
                         
      const missCount = typeof r.missCount === 'number' ? r.missCount : 
                      (typeof r.miss === 'number' ? r.miss : 0);
      
      const keyCount = typeof r.keyCount === 'number' ? r.keyCount : 0;
      const startTime = typeof r.startTime === 'number' ? r.startTime : 0;
      const endTime = typeof r.endTime === 'number' ? r.endTime : 0;
      
      const timeSec = (endTime - startTime) / 1000;
      if (timeSec > 0 && keyCount > 0) {
        kpmSum += (keyCount / timeSec) * 60;
        kpmCount++;
      }
      
      totalCorrect += correctCount;
      totalMiss += missCount;
      totalKey += keyCount;
      totalInput += correctCount + missCount;
    }
    
    // 結果計算
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
    
    console.log('Worker: 計算結果', result);
    self.postMessage(result);
    
  } catch (error) {
    console.error('Worker: エラー発生', error);
    // エラーが発生しても結果を返す
    self.postMessage({
      type: 'scoreResult',
      payload: {
        kpm: 0,
        accuracy: 0,
        correct: 0,
        miss: 0,
      }
    });
  }
};
