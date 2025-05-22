'use client';

import { useState, useEffect } from 'react';

// MCPサーバーのURL
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3003';

export default function MidwayTestPage() {
  // 型安全のため、useStateの型を明示
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('MCPサーバーにリクエストを送信中...', `${MCP_SERVER_URL}/mcp/status`);
        const response = await fetch(`${MCP_SERVER_URL}/mcp/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache',
          mode: 'cors',
        });
        console.log('レスポンスステータス:', response.status);
        
        if (!response.ok) {
          throw new Error(`MCP server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('受信したデータ:', data);
        setApiResponse(data);
      } catch (err) {
        console.error('MCP接続エラー:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [refresh]);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MCPサーバー接続テスト</h1>
      
      <div className="mb-4">
        <p className="text-gray-700">
          テスト対象URL: <code className="bg-gray-100 px-2 py-1 rounded">{`${MCP_SERVER_URL}/mcp/status`}</code>
        </p>
        
        <button
          onClick={() => setRefresh(prev => prev + 1)}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'リクエスト中...' : '再度テスト'}
        </button>
      </div>
      
      {loading && (
        <div className="animate-pulse bg-gray-100 p-4 rounded">
          <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h2 className="text-lg font-medium text-red-700 mb-2">エラーが発生しました</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {apiResponse && !loading && !error && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <h2 className="text-lg font-medium text-green-700 mb-2">接続成功！</h2>
          <div className="bg-white p-4 rounded border border-gray-200 overflow-auto">
            <pre className="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
        <h2 className="text-lg font-medium mb-2">トラブルシューティング</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>MCPサーバーが起動していることを確認してください（<code>npm run mcp</code>）</li>
          <li>CORSヘッダーが正しく設定されていることを確認してください</li>
          <li>ブラウザのコンソールでネットワークエラーを確認してください</li>
          <li>.envファイルのNEXT_PUBLIC_MCP_SERVER_URLが正しく設定されていることを確認してください</li>
          <li>コンソールにMCP_SERVER_URLの値が表示されているか確認してください</li>
        </ul>
      </div>
    </div>
  );
}
