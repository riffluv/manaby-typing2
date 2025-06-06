'use client';

import { useEffect, useState } from 'react';
import { wasmTypingProcessor } from '../../typing/wasm-integration/WasmTypingProcessor';
import { TypingChar } from '../../typing/TypingChar';

/**
 * Phase 2 WebAssembly統合テストページ
 * WebAssemblyの機能とパフォーマンスを検証
 */
export default function WasmTestPage() {
  const [wasmStatus, setWasmStatus] = useState<{ isWasmAvailable: boolean; mode: string } | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    testWasmIntegration();
  }, []);

  const testWasmIntegration = async () => {
    try {
      setIsLoading(true);
      addTestResult('🚀 Phase 2 WebAssembly統合テスト開始...');

      // 初期化完了を待機
      await wasmTypingProcessor.waitForInitialization();
      
      // WebAssembly利用状況を確認
      const status = wasmTypingProcessor.getStatus();
      setWasmStatus(status);
      addTestResult(`✅ WebAssembly状況: ${status.mode}`);

      // テスト1: 日本語→ローマ字変換
      addTestResult('\n📝 テスト1: 日本語→ローマ字変換');
      const start1 = performance.now();
      const result1 = await wasmTypingProcessor.convertToRomaji('こんにちは');
      const time1 = performance.now() - start1;
      addTestResult(`  - 入力: "こんにちは"`);      addTestResult(`  - 結果: ${JSON.stringify(result1.map((r: TypingChar) => ({ kana: r.kana, patterns: r.patterns })))}`);
      addTestResult(`  - 処理時間: ${time1.toFixed(3)}ms`);

      // テスト2: 文字マッチング
      addTestResult('\n🎯 テスト2: 文字マッチング');
      const start2 = performance.now();
      const result2 = await wasmTypingProcessor.matchCharacter('k', ['ka', 'ki', 'ku']);
      const time2 = performance.now() - start2;
      addTestResult(`  - 入力: 'k', ['ka', 'ki', 'ku']`);
      addTestResult(`  - 結果: ${result2}`);
      addTestResult(`  - 処理時間: ${time2.toFixed(3)}ms`);

      // テスト3: 「ん」パターン生成
      addTestResult('\n🔤 テスト3: 「ん」パターン生成');
      const start3 = performance.now();
      const result3 = await wasmTypingProcessor.getNPatterns('か');
      const time3 = performance.now() - start3;
      addTestResult(`  - 入力: 'か'`);
      addTestResult(`  - 結果: ${JSON.stringify(result3)}`);
      addTestResult(`  - 処理時間: ${time3.toFixed(3)}ms`);

      // テスト4: バッチ処理
      addTestResult('\n📦 テスト4: バッチ処理');
      const testStrings = ['あ', 'か', 'さ', 'た', 'な'];
      const start4 = performance.now();
      const result4 = await wasmTypingProcessor.batchConvert(testStrings);
      const time4 = performance.now() - start4;
      addTestResult(`  - 入力: ${JSON.stringify(testStrings)}`);
      addTestResult(`  - 結果: ${result4.length}件変換完了`);
      addTestResult(`  - 処理時間: ${time4.toFixed(3)}ms`);

      addTestResult('\n✅ Phase 2 WebAssembly統合テスト完了');
      
    } catch (error) {
      addTestResult(`❌ テストエラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  const addTestResult = (message: string) => {
    setTestResults((prev: string[]) => [...prev, message]);
  };

  const runPerformanceTest = async () => {
    addTestResult('\n🏃‍♂️ パフォーマンステスト開始...');
    
    const testText = 'こんにちはこんにちはこんにちは';
    const iterations = 1000;
    
    // WebAssembly/TypeScriptテスト
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await wasmTypingProcessor.convertToRomaji(testText);
    }
    const end = performance.now();
    
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    
    addTestResult(`  - ${iterations}回実行`);
    addTestResult(`  - 総時間: ${totalTime.toFixed(3)}ms`);
    addTestResult(`  - 平均時間: ${avgTime.toFixed(3)}ms`);
    addTestResult(`  - 1秒あたり処理数: ${(1000 / avgTime).toFixed(0)}回`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          🚀 Phase 2 WebAssembly統合テスト
        </h1>
        
        {wasmStatus && (
          <div className={`p-4 rounded-lg mb-6 ${wasmStatus.isWasmAvailable ? 'bg-green-100 border-green-500' : 'bg-yellow-100 border-yellow-500'} border-2`}>
            <h2 className="text-xl font-semibold mb-2">
              {wasmStatus.isWasmAvailable ? '✅' : '⚠️'} WebAssembly状況
            </h2>
            <p><strong>モード:</strong> {wasmStatus.mode}</p>
            <p><strong>WASM利用可能:</strong> {wasmStatus.isWasmAvailable ? 'はい' : 'いいえ'}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">テスト結果</h2>
            <div className="space-x-4">
              <button
                onClick={testWasmIntegration}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? '実行中...' : '再テスト'}
              </button>
              <button
                onClick={runPerformanceTest}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                パフォーマンステスト
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">            {testResults.map((result: string, index: number) => (
              <div key={index} className="whitespace-pre-wrap">
                {result}
              </div>
            ))}
            {isLoading && (
              <div className="text-yellow-400">
                処理中...
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Phase 2 目標</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              WebAssembly統合レイヤーの実装
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              TypeScriptフォールバック機能
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Rust → WebAssembly変換処理
            </li>
            <li className="flex items-center">
              <span className="text-yellow-500 mr-2">🔍</span>
              10-30倍パフォーマンス改善の検証
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
