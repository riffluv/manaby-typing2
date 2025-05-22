// タイピングゲーム用スコア計算Web Worker（雛形）
// 必要な型やロジックは後で拡張可能

export type ScoreWorkerRequest = {
  type: 'calcScore';
  payload: any; // スコア計算用データ（後で型定義）
};

export type ScoreWorkerResponse = {
  type: 'scoreResult';
  payload: any; // 計算結果（後で型定義）
};

self.onmessage = (e: MessageEvent<ScoreWorkerRequest>) => {
  const { type, payload } = e.data;
  if (type === 'calcScore') {
    // 仮のスコア計算（後で本実装）
    const score = 0;
    const result: ScoreWorkerResponse = {
      type: 'scoreResult',
      payload: { score },
    };
    self.postMessage(result);
  }
};
