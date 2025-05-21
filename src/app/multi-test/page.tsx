'use client';

import { useState, useEffect } from 'react';
import { checkMCPStatus, checkMCPStatusXHR, checkMCPStatusPromise } from '@/utils/mcpChecker';

export default function MultiTestPage() {
  const [fetchResult, setFetchResult] = useState(null);
  const [xhrResult, setXhrResult] = useState(null);
  const [promiseResult, setPromiseResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runAllTests() {
    setLoading(true);
    setFetchResult(null);
    setXhrResult(null);
    setPromiseResult(null);
    
    // Fetch APIテスト
    checkMCPStatus(result => {
      setFetchResult(result);
    });
    
    // XHRテスト
    checkMCPStatusXHR(result => {
      setXhrResult(result);
    });
    
    // Promiseテスト
    try {
      const result = await checkMCPStatusPromise();
      setPromiseResult(result);
    } catch (error) {
      setPromiseResult(error);
    }
    
    setLoading(false);
  }
  
  // ページ読み込み時に自動実行
  useEffect(() => {
    runAllTests();
  }, []);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">複数方式MCP接続テスト</h1>
      
      <div className="mb-6">
        <button
          onClick={runAllTests}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'テスト実行中...' : 'すべてのテストを実行'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fetch API結果 */}
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">Fetch API</h2>
          {loading && <p className="text-gray-500">テスト中...</p>}
          {fetchResult && (
            <div>
              <div className={fetchResult.success ? "text-green-600" : "text-red-600"}>
                {fetchResult.success ? "✅ 成功" : "❌ 失敗"}
              </div>
              {fetchResult.error && <p className="text-red-500 text-sm mt-2">{fetchResult.error}</p>}
              {fetchResult.data && (
                <pre className="bg-gray-100 p-2 text-xs mt-2 overflow-auto max-h-40">
                  {JSON.stringify(fetchResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
        
        {/* XHR結果 */}
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">XMLHttpRequest</h2>
          {loading && <p className="text-gray-500">テスト中...</p>}
          {xhrResult && (
            <div>
              <div className={xhrResult.success ? "text-green-600" : "text-red-600"}>
                {xhrResult.success ? "✅ 成功" : "❌ 失敗"}
              </div>
              {xhrResult.error && <p className="text-red-500 text-sm mt-2">{xhrResult.error}</p>}
              {xhrResult.data && (
                <pre className="bg-gray-100 p-2 text-xs mt-2 overflow-auto max-h-40">
                  {JSON.stringify(xhrResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
        
        {/* Promise結果 */}
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">Promise</h2>
          {loading && <p className="text-gray-500">テスト中...</p>}
          {promiseResult && (
            <div>
              <div className={promiseResult.success ? "text-green-600" : "text-red-600"}>
                {promiseResult.success ? "✅ 成功" : "❌ 失敗"}
              </div>
              {promiseResult.error && <p className="text-red-500 text-sm mt-2">{promiseResult.error}</p>}
              {promiseResult.data && (
                <pre className="bg-gray-100 p-2 text-xs mt-2 overflow-auto max-h-40">
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
            <pre className="bg-white p-2 text-xs mt-1 rounded border">
              NEXT_PUBLIC_MCP_SERVER_URL: {process.env.NEXT_PUBLIC_MCP_SERVER_URL || '未設定'}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-sm">ブラウザ情報:</h3>
            <pre className="bg-white p-2 text-xs mt-1 rounded border">
              {`UserAgent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'SSRモード'}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
