'use client';

import { useEffect, useState } from 'react';
// useMCPが未実装のため、一時的にコメントアウト
// import { useMCP } from '@/hooks/useMCP';
import MCPStatus from '@/components/MCPStatus';

export default function MCPDebugPage() {
  // const { isConnected, status, error } = useMCP();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // 環境変数のログ
    const envLog = `MCP_SERVER_URL: ${process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'undefined'}`;
    console.log(envLog);
    
    // コンポーネントのマウントログ
    const mountLog = "MCPDebugページがマウントされました";
    console.log(mountLog);
    
    setLogs([envLog, mountLog]);
  }, []);

  // 接続状態が変わったときにログを追加
  useEffect(() => {
    // const connectionLog = `MCP接続状態: ${isConnected ? '接続済み' : '未接続'}`;
    // console.log(connectionLog);
    // if (status) {
    //   console.log('MCPステータス:', status);
    // }
    // if (error) {
    //   console.error('MCPエラー:', error);
    // }
    
    // setLogs(prevLogs => [...prevLogs, connectionLog]);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">MCP接続デバッグページ</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">接続ステータス</h2>
        <div className="flex items-center mb-2">
          <div 
            className={`w-4 h-4 rounded-full mr-2 ${true ? 'bg-green-500' : 'bg-red-500'}`} 
          />
          <span>{true ? '接続済み' : '未接続'}</span>
        </div>
        {/* {status && (
          <div className="mt-2">
            <p><strong>バージョン:</strong> {status.version}</p>
            <p><strong>リクエスト数:</strong> {status.requests}</p>
            <p><strong>稼働時間:</strong> {status.uptime}秒</p>
          </div>
        )} */}
        {/* {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
            <p><strong>エラー:</strong> {error.message}</p>
          </div>
        )} */}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">環境変数</h2>
        <div className="p-3 bg-gray-100 rounded-lg">
          <pre className="whitespace-pre-wrap">
            NEXT_PUBLIC_MCP_SERVER_URL: {process.env.NEXT_PUBLIC_MCP_SERVER_URL || '未設定'}
          </pre>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">ログ</h2>
        <div className="p-3 bg-gray-100 rounded-lg max-h-60 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">テスト接続ボタン</h2>
        <button 
          onClick={() => {
            const log = "テスト接続を開始します...";
            console.log(log);
            setLogs(prevLogs => [...prevLogs, log]);
            
            fetch(process.env.NEXT_PUBLIC_MCP_SERVER_URL + '/mcp/status')
              .then(response => {
                const statusLog = `ステータスレスポンス: ${response.status} ${response.statusText}`;
                console.log(statusLog);
                setLogs(prevLogs => [...prevLogs, statusLog]);
                return response.json();
              })
              .then(data => {
                const dataLog = `受信データ: ${JSON.stringify(data)}`;
                console.log(dataLog);
                setLogs(prevLogs => [...prevLogs, dataLog]);
              })
              .catch(err => {
                const errLog = `エラー: ${err.message}`;
                console.error(errLog);
                setLogs(prevLogs => [...prevLogs, errLog]);
              });
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          MCPサーバーに接続テスト
        </button>
      </div>
      
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-bold mb-4">MCPStatusコンポーネント</h2>
        <p className="mb-4">以下にMCPStatusコンポーネントが表示されるはずです：</p>
        <div className="p-4 border border-dashed border-gray-300 rounded-lg min-h-20">
          <MCPStatus />
        </div>
      </div>
    </div>
  );
}
