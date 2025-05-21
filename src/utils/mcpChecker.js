// コールバック関数版のMCPステータスチェッカー
export async function checkMCPStatus(callback) {
  try {
    console.log('MCPサーバーのステータスを確認しています...');
    const response = await fetch('http://localhost:3005/mcp/status');
    
    if (!response.ok) {
      throw new Error(`MCPサーバーからエラーレスポンス: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('MCPステータスデータ:', data);
    callback({
      success: true,
      data: data,
      error: null
    });
  } catch (err) {
    console.error('MCPステータス確認エラー:', err);
    callback({
      success: false,
      data: null,
      error: err.message
    });
  }
}

// プロミス版のMCPステータスチェッカー
export function checkMCPStatusPromise() {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3005/mcp/status')
      .then(response => {
        if (!response.ok) {
          throw new Error(`MCPサーバーからエラーレスポンス: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => resolve({
        success: true,
        data: data,
        error: null
      }))
      .catch(err => reject({
        success: false,
        data: null,
        error: err.message
      }));
  });
}

// XHR版のMCPステータスチェッカー（フォールバック用）
export function checkMCPStatusXHR(callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:3005/mcp/status');
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        callback({
          success: true,
          data: data,
          error: null
        });
      } catch (e) {
        callback({
          success: false,
          data: null,
          error: 'JSONの解析に失敗しました: ' + e.message
        });
      }
    } else {
      callback({
        success: false,
        data: null,
        error: `HTTPエラー: ${xhr.status} ${xhr.statusText}`
      });
    }
  };
  
  xhr.onerror = function() {
    callback({
      success: false,
      data: null,
      error: 'ネットワークエラーが発生しました'
    });
  };
  
  xhr.send();
}
