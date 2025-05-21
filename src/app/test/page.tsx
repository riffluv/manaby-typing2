/** 
 * このファイルはMCP接続テスト用のページです
 */
'use client';

import { useState, useEffect } from 'react';
import TestMCP from '@/components/TestMCP';

export default function TestPage() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  // 時間を1秒ごとに更新して再レンダリングを強制
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">MCP接続テストページ</h1>
      <p className="mb-4">現在時刻: {time}</p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <TestMCP />
        
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-bold mb-2">手動テスト</h2>
          <button
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:3003/mcp/status');
                const data = await response.json();
                alert(`MCPサーバー応答あり: ${JSON.stringify(data)}`);
              } catch (err) {
                alert(`エラー: ${err}`);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            MCPサーバーに直接接続
          </button>
        </div>
      </div>
    </div>
  );
}
