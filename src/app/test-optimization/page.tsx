'use client';

import { useState, useEffect } from 'react';
import { OptimizedJapaneseProcessor } from '@/typing/OptimizedJapaneseProcessor';

// テスト用の日本語単語（「ん」を含む）
const TEST_WORDS = [
  'プログラミング',     // puroguramingu vs puroguraminngu
  'コンピューター',     // konpyu-ta- vs kompyu-ta-
  'インターネット',     // inta-netto vs iNta-netto
  'レストラン',         // 文末の「ん」: resutoran
  'ガンダム',           // gan + d
  'ワンダフル',         // wan + d
  'プレゼンテーション', // prezen...
];

interface TestResult {
  word: string;
  typingChars: any[];
  nChars: any[];
  processingTime: number;
}

export default function OptimizationTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  const runTests = async () => {
    setIsLoading(true);
    const results: TestResult[] = [];

    console.log('🚀 最適化テスト開始');

    for (const word of TEST_WORDS) {
      const startTime = performance.now();
      
      try {
        const typingChars = OptimizedJapaneseProcessor.convertToTypingChars(word);
        const nChars = typingChars.filter(char => char.kana === 'ん');
        const processingTime = performance.now() - startTime;

        results.push({
          word,
          typingChars,
          nChars,
          processingTime
        });

        console.log(`✅ "${word}": ${processingTime.toFixed(3)}ms`);
          } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ "${word}": ${errorMessage}`);
        results.push({
          word,
          typingChars: [],
          nChars: [],
          processingTime: -1
        });
      }
    }

    // パフォーマンス統計を取得
    try {
      const stats = OptimizedJapaneseProcessor.getPerformanceStats();
      setPerformanceStats(stats);
      console.log('📊 パフォーマンス統計:', stats);    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('統計取得エラー:', errorMessage);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    // ページロード時に自動実行
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🚀 OptimizedJapaneseProcessor テスト結果
          </h1>

          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
            >
              {isLoading ? '🔄 テスト実行中...' : '▶️ テスト再実行'}
            </button>
          </div>

          {/* パフォーマンス統計 */}
          {performanceStats && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-3">📊 パフォーマンス統計</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">キャッシュサイズ:</span>
                  <span className="ml-2">{performanceStats.cacheSize}</span>
                </div>
                <div>
                  <span className="font-medium">キャッシュヒット率:</span>
                  <span className="ml-2">{performanceStats.cacheHitRate}%</span>
                </div>
                <div>
                  <span className="font-medium">総パターン数:</span>
                  <span className="ml-2">{performanceStats.totalPatterns || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* テスト結果 */}
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {index + 1}. 「{result.word}」
                  </h3>
                  <div className="text-sm text-gray-600">
                    {result.processingTime >= 0 
                      ? `⏱️ ${result.processingTime.toFixed(3)}ms`
                      : '❌ エラー'
                    }
                  </div>
                </div>

                {result.typingChars.length > 0 && (
                  <>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        生成された文字数: {result.typingChars.length}
                      </span>
                    </div>

                    {/* 「ん」の文字の表示 */}
                    {result.nChars.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          🔄 「ん」の分岐パターン ({result.nChars.length}個)
                        </h4>
                        {result.nChars.map((nChar, nIndex) => (
                          <div key={nIndex} className="text-sm text-yellow-700">
                            「ん」[{nIndex}]: {nChar.patterns.join(', ')}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 最初の数文字のパターン表示 */}
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-medium text-gray-700 mb-2">
                        文字パターン (最初の5文字)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {result.typingChars.slice(0, 5).map((char, charIndex) => (
                          <div key={charIndex} className="text-gray-600">
                            <span className="font-medium">[{charIndex}] {char.kana}:</span>
                            <span className="ml-2">{char.patterns.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {testResults.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📈 総合結果</h3>
              <div className="text-sm text-blue-700">
                <div>総テスト単語数: {testResults.length}</div>
                <div>
                  平均処理時間: {
                    (testResults
                      .filter(r => r.processingTime >= 0)
                      .reduce((sum, r) => sum + r.processingTime, 0) / 
                     testResults.filter(r => r.processingTime >= 0).length
                    ).toFixed(3)
                  }ms
                </div>
                <div>
                  「ん」を含む単語: {testResults.filter(r => r.nChars.length > 0).length}個
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
