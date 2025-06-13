import React, { useState, useEffect } from 'react';
import { useOptimizedGameStatus, useOptimizedCurrentWord } from '@/store/optimizedSelectors';
import { useTypingGameStore } from '@/store/typingGameStore';

/**
 * React最適化テスト用コンポーネント
 * 最適化されたセレクターの動作確認用
 */
export default function OptimizationTestPage() {
  const [renderCount, setRenderCount] = useState(0);
  const [startTime] = useState(Date.now());
    // 最適化されたセレクターを使用
  const gameStatus = useOptimizedGameStatus();
  const currentWord = useOptimizedCurrentWord();
  const currentIndex = useTypingGameStore((state) => state.currentWordIndex);
    const questionCount = useTypingGameStore((state) => state.questionCount);

  // レンダリング回数をカウント - 依存関係配列を追加
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []); // 初回レンダリング時のみ実行

  const elapsedTime = Date.now() - startTime;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎯 React最適化テスト
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* パフォーマンス統計 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            📊 パフォーマンス統計
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>レンダリング回数:</span>
              <span className="font-mono font-bold">{renderCount}</span>
            </div>
            <div className="flex justify-between">
              <span>経過時間:</span>
              <span className="font-mono">{elapsedTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span>平均レンダリング間隔:</span>
              <span className="font-mono">
                {renderCount > 1 ? Math.round(elapsedTime / renderCount) : 0}ms
              </span>
            </div>
          </div>
        </div>

        {/* ゲーム状態 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            🎮 ゲーム状態
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>ゲームステータス:</span>
              <span className="font-mono font-bold">{gameStatus}</span>
            </div>            <div className="flex justify-between">
              <span>現在のインデックス:</span>
              <span className="font-mono">{currentIndex}</span>
            </div>
            <div className="flex justify-between">
              <span>問題数:</span>
              <span className="font-mono">{questionCount}</span>
            </div>
          </div>
        </div>

        {/* 表示情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">
            📝 表示情報
          </h2>
          <div className="space-y-2">            <div>
              <span className="block font-semibold">日本語:</span>
              <span className="font-mono text-lg">{currentWord.japanese || '未設定'}</span>
            </div>
            <div>
              <span className="block font-semibold">ひらがな:</span>
              <span className="font-mono text-lg">{currentWord.hiragana || '未設定'}</span>
            </div>
            <div>
              <span className="block font-semibold">説明:</span>
              <span className="text-sm text-gray-600">{currentWord.explanation || 'なし'}</span>
            </div>
          </div>
        </div>

        {/* 最適化結果 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">
            ⚡ 最適化効果
          </h2>
          <div className="space-y-2">
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
              <div className="text-sm font-semibold text-green-800">
                ✅ セレクター最適化
              </div>
              <div className="text-sm text-green-700">
                細分化されたセレクターで必要な状態のみ購読
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <div className="text-sm font-semibold text-blue-800">
                ✅ React.memo適用
              </div>
              <div className="text-sm text-blue-700">
                不要な再レンダリングを防止
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
              <div className="text-sm font-semibold text-purple-800">
                ✅ メモ化最適化
              </div>
              <div className="text-sm text-purple-700">
                useCallback/useMemoで計算効率化
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">
          📋 テスト方法
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• React DevTools Profilerでレンダリング回数を確認</li>
          <li>• Chrome DevTools PerformanceでFPS測定</li>
          <li>• メモリ使用量をMonitoringタブで確認</li>
          <li>• ゲーム実行中のレンダリング頻度を比較</li>
        </ul>
      </div>
    </div>
  );
}
