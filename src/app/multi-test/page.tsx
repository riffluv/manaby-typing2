'use client';

import { useState, useEffect } from 'react';
import { checkMCPStatus, checkMCPStatusXHR, checkMCPStatusPromise } from '@/utils/mcpChecker';

// MCPサーバーのレスポンス型
interface MCPStatusResult {
  success: boolean;
  data: any;
  error: string | null;
}

export default function MultiTestPage() {
  // 型安全のため、useStateの型を明示
  const [fetchResult, setFetchResult] = useState<MCPStatusResult | null>(null);
  const [xhrResult, setXhrResult] = useState<MCPStatusResult | null>(null);
  const [promiseResult, setPromiseResult] = useState<MCPStatusResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function runAllTests() {
    setLoading(true);
    setFetchResult(null);
    setXhrResult(null);
    setPromiseResult(null);
    
    // Fetch APIテスト
    // 型安全のため、コールバックの型を明示
    checkMCPStatus((result: any) => {
      setFetchResult(result);
    });
    
    // XHRテスト
    // 型安全のため、コールバックの型を明示
    checkMCPStatusXHR((result: any) => {
      setXhrResult(result);
    });
    
    // Promiseテスト
    try {
      const result = await checkMCPStatusPromise();
      setPromiseResult(result);
    } catch (error) {
      setPromiseResult({ success: false, data: null, error: error instanceof Error ? error.message : String(error) });
    }
    
    setLoading(false);
  }
  
  // ページ読み込み時に自動実行
  useEffect(() => {
    runAllTests();
  }, []);
  
  return (
    <div className="p-8 max-w-4xl mx-auto" role="main" aria-labelledby="multi-test-title">
      <h1 id="multi-test-title" className="text-2xl font-bold mb-6">複数方式MCP接続テスト</h1>
      <div className="mb-6">
        <button
          onClick={runAllTests}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          disabled={loading}
          aria-busy={loading}
          aria-label="すべてのテストを実行"
        >
          {loading ? 'テスト実行中...' : 'すべてのテストを実行'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fetch API結果 */}
        <div className="border rounded p-4" role="region" aria-labelledby="fetch-api-title">
          <h2 id="fetch-api-title" className="font-bold mb-2">Fetch API</h2>
          {loading && <p className="text-gray-500" aria-live="polite">テスト中...</p>}
          {fetchResult && (
            <div>
              <div className={fetchResult.success ? "text-green-600" : "text-red-600"}>
                {fetchResult.success ? "✅ 成功" : "❌ 失敗"}
              </div>
              {fetchResult.error && <p className="text-red-500 text-sm mt-2" role="alert">{fetchResult.error}</p>}
              {fetchResult.data && (
                <pre className="bg-gray-100 p-2 text-xs mt-2 overflow-auto max-h-40" aria-label="Fetch APIレスポンス">
                  {JSON.stringify(fetchResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
        {/* XHR結果 */}
        <div className="border rounded p-4" role="region" aria-labelledby="xhr-title">
          <h2 id="xhr-title" className="font-bold mb-2">XMLHttpRequest</h2>
          {loading && <p className="text-gray-500" aria-live="polite">テスト中...</p>}
          {xhrResult && (
            <div>
              <div className={xhrResult.success ? "text-green-600" : "text-red-600"}>
                {xhrResult.success ? "✅ 成功" : "❌ 失敗"}
              </div>
              {xhrResult.error && <p className="text-red-500 text-sm mt-2" role="alert">{xhrResult.error}</p>}
              {xhrResult.data && (
                <pre className="bg-gray-100 p-2 text-xs mt-2 overflow-auto max-h-40" aria-label="XHRレスポンス">
                  {JSON.stringify(xhrResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
        {/* Promise結果 */}
        <div className="border rounded p-4" role="region" aria-labelledby="promise-title">
          <h2 id="promise-title" className="font-bold mb-2">Promise</h2>
          {loading && <p className="text-gray-500" aria-live="polite">テスト中...</p>}
          {promiseResult && (
            <div>
              <div className={promiseResult.success ? "text-green-600" : "text-red-600"}>
                {promiseResult.success ? "✅ 成功" : "❌ 失敗"}
              </div>
              {promiseResult.error && <p className="text-red-500 text-sm mt-2" role="alert">{promiseResult.error}</p>}
              {promiseResult.data && (
                <pre className="bg-gray-100 p-2 text-xs mt-2 overflow-auto max-h-40" aria-label="Promiseレスポンス">
                  {JSON.stringify(promiseResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 bg-blue-50 p-4 rounded">
        <h2 className="font-bold mb-2">環境情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-sm">Next.js環境変数:</h3>
            <pre className="bg-white p-2 text-xs mt-1 rounded border" aria-label="NEXT_PUBLIC_MCP_SERVER_URL">
              NEXT_PUBLIC_MCP_SERVER_URL: {process.env.NEXT_PUBLIC_MCP_SERVER_URL || '未設定'}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-sm">ブラウザ情報:</h3>
            <pre className="bg-white p-2 text-xs mt-1 rounded border" aria-label="UserAgent">
              {`UserAgent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'SSRモード'}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
