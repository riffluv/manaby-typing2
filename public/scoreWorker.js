// タイピングゲーム用スコア計算Web Worker（public用）
// 入力: 各お題ごとの履歴配列 [{ keyCount, missCount, correctCount, startTime, endTime }]
// 出力: { kpm, accuracy, correct, miss }

self.onmessage = function(e) {
  try {
    if (!e.data || typeof e.data !== 'object') throw new Error('不正なメッセージ形式');
    var type = e.data.type;
    var payload = e.data.payload;
    if (type !== 'calcScore' || !payload || !payload.results) throw new Error('不正なメッセージタイプまたはデータ: ' + type);
    var results = payload.results;
    var totalKey = 0, totalMiss = 0, totalCorrect = 0, totalTime = 0;
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      totalKey += r.keyCount || 0;
      totalMiss += r.missCount || 0;
      totalCorrect += r.correctCount || 0;
      totalTime += (r.endTime || 0) - (r.startTime || 0);
    }
    var kpm = totalTime > 0 ? Math.round((totalKey / (totalTime / 1000)) * 60 * 10) / 10 : 0;
    var accuracy = (totalCorrect + totalMiss) > 0 ? Math.round((totalCorrect / (totalCorrect + totalMiss)) * 1000) / 10 : 0;
    self.postMessage({ type: 'scoreResult', payload: { kpm: kpm, accuracy: accuracy, correct: totalCorrect, miss: totalMiss } });
  } catch (err) {
    self.postMessage({ type: 'scoreResult', payload: { kpm: 0, accuracy: 0, correct: 0, miss: 0 } });
  }
};
