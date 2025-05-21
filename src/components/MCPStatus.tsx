'use client';

import { useState, useEffect } from 'react';
import { checkMCPStatusPromise } from '@/utils/mcpChecker';

interface MCPStatusProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const MCPStatus: React.FC<MCPStatusProps> = ({ position = 'bottom-right' }) => {
  const [mcpStatus, setMcpStatus] = useState<{
    success: boolean;
    data: any;
    error: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const result = await checkMCPStatusPromise();
        setMcpStatus(result);
      } catch (error: any) {
        setMcpStatus({
          success: false,
          data: null,
          error: error.message || 'MCPサーバー接続エラー'
        });
      } finally {
        setIsLoading(false);
      }
    };

    // 初回チェック
    checkStatus();

    // 30秒ごとにステータスをチェック
    const intervalId = setInterval(checkStatus, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // 位置に基づくスタイルを計算
  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  // 表示するものがない場合
  if (isLoading) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionStyle()} z-50`}>
      {mcpStatus?.success ? (
        <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-1 rounded-md text-xs flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          MCPサーバー接続中
        </div>
      ) : (
        <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-1 rounded-md text-xs flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          MCPサーバー未接続
        </div>
      )}
    </div>
  );
};

export default MCPStatus;