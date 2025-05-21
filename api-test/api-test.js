// テスト用の簡易APIサーバー
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// CORSを有効化
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 簡易レスポンスの設定
app.get('/api/status', (req, res) => {
  console.log('ステータスリクエストを受信しました');
  res.json({
    status: 'ok',
    version: '1.0-test',
    uptime: Math.floor(process.uptime()),
    connections: 1,
    requests: 1,
    message: 'これはテスト用APIサーバーからの応答です'
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`テストAPIサーバーが http://localhost:${PORT} で起動しました`);
  console.log(`エンドポイント: http://localhost:${PORT}/api/status`);
});
