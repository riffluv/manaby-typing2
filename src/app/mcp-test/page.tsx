'use client';

import useSWR from 'swr';

const MCP_SERVER_URL = 'http://localhost:3003';
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`MCP server responded with status: ${res.status}`);
  return res.json();
});

export default function McpTestPage() {
  const { data: apiResponse, error, isLoading, mutate } = useSWR(
    `${MCP_SERVER_URL}/mcp/status`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MCP接続テスト</h1>
      
      <div className="mb-4">
        <p className="text-gray-700">テスト対象URL: <code className="bg-gray-100 px-2 py-1 rounded">{MCP_SERVER_URL}/mcp/status</code></p>
        
        <button
          onClick={() => mutate()}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? 'リクエスト中...' : '再度テスト'}
        </button>
      </div>
      
      {isLoading && (
        <div className="animate-pulse bg-gray-100 p-4 rounded">
          <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h2 className="text-lg font-medium text-red-700 mb-2">エラーが発生しました</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      )}
      
      {apiResponse && !isLoading && !error && (
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
          <li>MCPサーバーが起動していることを確認する（npm run mcp）</li>
          <li>CORSヘッダーが正しく設定されていることを確認する</li>
          <li>環境変数NEXT_PUBLIC_MCP_SERVER_URLが正しく設定されていることを確認する</li>
          <li>ブラウザのコンソールとサーバーのログを確認する</li>
        </ul>
      </div>
    </div>
  );
}
