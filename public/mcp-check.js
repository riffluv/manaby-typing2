// 最も単純なMCPステータスチェック用スクリプト
//
// 使用方法:
// 1. このファイルをindex.htmlの近くに保存
// 2. index.htmlに以下を追加:
//    <script src="mcp-check.js"></script>
// 3. ブラウザでindex.htmlを開く
// 4. コンソールに結果が表示される

// 即時実行関数でスコープを囲む
(function() {
  console.log('MCPステータスチェッカーを開始します...');
  
  // MCPサーバーのURL
  const MCP_URL = 'http://localhost:3004/mcp/status';
  // ステータスチェック関数
  function checkMcpStatus() {
    console.log(`MCPサーバーに接続します: ${MCP_URL}`);
    
    fetch(MCP_URL)
      .then(response => {
        console.log('レスポンス受信:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP エラー: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('MCPサーバーから受信したデータ:', data);
        
        // 成功メッセージを表示
        const statusDiv = document.getElementById('mcp-status');
        if (statusDiv) {
          statusDiv.innerHTML = `
            <div style="background-color: #d1fae5; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
              <h3 style="color: #065f46; margin-top: 0;">MCPサーバーに接続しました！</h3>
              <p><strong>ステータス:</strong> ${data.status}</p>
              <p><strong>バージョン:</strong> ${data.version}</p>
              <p><strong>稼働時間:</strong> ${data.uptime}秒</p>
              <p><strong>接続数:</strong> ${data.connections}</p>
              <p><strong>リクエスト数:</strong> ${data.requests}</p>
            </div>
          `;
        }
      })
      .catch(error => {
        console.error('MCPサーバー接続エラー:', error);
        
        // エラーメッセージを表示
        const statusDiv = document.getElementById('mcp-status');
        if (statusDiv) {
          statusDiv.innerHTML = `
            <div style="background-color: #fee2e2; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
              <h3 style="color: #b91c1c; margin-top: 0;">MCPサーバー接続エラー</h3>
              <p>${error.message}</p>
              <p>MCPサーバーが起動していることを確認してください。</p>
              <button onclick="location.reload()" style="background-color: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">再試行</button>
            </div>
          `;
        }
      });
  }
  
  // ページ読み込み完了時に実行
  window.addEventListener('DOMContentLoaded', function() {
    console.log('ページ読み込み完了、MCPステータスチェックを実行します');
    
    // 待機中メッセージ
    const appRoot = document.getElementById('app') || document.body;
    const statusDiv = document.createElement('div');
    statusDiv.id = 'mcp-status';
    statusDiv.innerHTML = `
      <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
        <h3 style="margin-top: 0;">MCPサーバーに接続中...</h3>
        <p>少々お待ちください...</p>
      </div>
    `;
    appRoot.prepend(statusDiv);
    
    // ステータスチェック実行
    checkMcpStatus();
  });
})();
