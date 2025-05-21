/** 
 * このファイルはMCPStatus表示テスト用の簡易コンポーネントです
 */
'use client';

import { useMCP } from "@/hooks/useMCP";

export default function TestMCP() {
  const { isConnected, status, error } = useMCP();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg text-sm">
      <h2 className="text-lg font-bold mb-2">MCP接続テスト</h2>
      <div>
        <p>
          <span className="font-medium">接続状態: </span> 
          <span className={isConnected ? "text-green-600" : "text-red-600"}>
            {isConnected ? "接続中 ✅" : "未接続 ❌"}
          </span>
        </p>
        
        {status && (
          <div className="mt-2">
            <p><span className="font-medium">バージョン:</span> {status.version}</p>
            <p><span className="font-medium">稼働時間:</span> {status.uptime}秒</p>
            <p><span className="font-medium">接続数:</span> {status.connections}</p>
            <p><span className="font-medium">リクエスト数:</span> {status.requests}</p>
          </div>
        )}
        
        {error && (
          <p className="text-red-500 mt-2">
            <span className="font-medium">エラー:</span> {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
