'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';

interface HighSpeedTypingTestProps {}

/**
 * 高速タイピング時のWebAudio遅延テストコンポーネント
 * 連続入力での音響レスポンス性能を検証
 */
const HighSpeedTypingTest: React.FC<HighSpeedTypingTestProps> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [keyPressCount, setKeyPressCount] = useState(0);
  const [testDuration, setTestDuration] = useState(5); // 5秒間のテスト

  const startTimeRef = useRef<number>(0);
  const keyTimesRef = useRef<number[]>([]);
  const activeIntervalsRef = useRef<NodeJS.Timeout[]>([]);

  // 高速タイピングシミュレーション
  const simulateHighSpeedTyping = useCallback(() => {
    const intervals = [50, 75, 100, 125, 150]; // ms間隔での連続入力
    let testIndex = 0;
    
    const runSingleTest = (interval: number) => {
      const testName = `${interval}ms間隔テスト`;
      
      console.log(`🚀 開始: ${testName}`);
      setTestResults(prev => [...prev, { 
        name: testName, 
        status: '実行中...', 
        keyPresses: 0,
        avgLatency: 0,
        minLatency: Infinity,
        maxLatency: 0,
        dropouts: 0 // 遅延が閾値を超えた回数
      }]);
      
      let count = 0;
      const maxKeys = Math.floor((testDuration * 1000) / interval);
      const latencies: number[] = [];
      const startTestTime = performance.now();
      
      const keyInterval = setInterval(() => {
        const audioStartTime = performance.now();
        
        // 音響再生
        UnifiedAudioSystem.playClickSound();
        
        // より正確なレスポンス時間測定
        requestAnimationFrame(() => {
          const latency = performance.now() - audioStartTime;
          latencies.push(latency);
          
          count++;
          setKeyPressCount(prev => prev + count);
          
          // リアルタイム統計更新
          if (latencies.length > 0) {
            const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
            const minLatency = Math.min(...latencies);
            const maxLatency = Math.max(...latencies);
            const dropouts = latencies.filter(l => l > 100).length;
            
            setTestResults(prev => prev.map(result => 
              result.name === testName ? {
                ...result,
                keyPresses: count,
                avgLatency: avgLatency.toFixed(2),
                minLatency: minLatency.toFixed(2),
                maxLatency: maxLatency.toFixed(2),
                dropouts
              } : result
            ));
          }
          
          if (count >= maxKeys) {
            clearInterval(keyInterval);
            
            const totalTestTime = performance.now() - startTestTime;
            const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
            const dropouts = latencies.filter(l => l > 100).length;
            
            setTestResults(prev => prev.map(result => 
              result.name === testName ? {
                ...result,
                status: '完了',
                keyPresses: count,
                avgLatency: avgLatency.toFixed(2),
                maxLatency: Math.max(...latencies).toFixed(2),
                minLatency: Math.min(...latencies).toFixed(2),
                dropouts,
                testDuration: (totalTestTime / 1000).toFixed(1)
              } : result
            ));
            
            console.log(`✅ 完了: ${testName} - 平均遅延: ${avgLatency.toFixed(2)}ms, ドロップアウト: ${dropouts}回`);
            
            // 次のテストを開始
            if (testIndex < intervals.length - 1) {
              testIndex++;
              setTimeout(() => runSingleTest(intervals[testIndex]), 2000); // 2秒間隔
            }
          }
        });
      }, interval);
      
      activeIntervalsRef.current.push(keyInterval);
    };
    
    // 最初のテストを開始
    runSingleTest(intervals[0]);
  }, [testDuration]);

  // マニュアルテスト用キーハンドラー
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isRunning) return;
    if (e.key.length !== 1) return;
    
    const now = performance.now();
    keyTimesRef.current.push(now);
    setKeyPressCount(prev => prev + 1);
    
    UnifiedAudioSystem.playClickSound();
  }, [isRunning]);
  // テスト開始
  const startTest = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    setKeyPressCount(0);
    
    // システム初期化
    await UnifiedAudioSystem.initialize();
    
    startTimeRef.current = performance.now();
    keyTimesRef.current = [];
    
    // 自動テスト実行
    simulateHighSpeedTyping();
    
    // マニュアルキー監視開始
    window.addEventListener('keydown', handleKeyPress);
    
    console.log('🚀 高速タイピングテスト開始 - 純粋WebAudioシステム');
  }, [handleKeyPress, simulateHighSpeedTyping]);

  // テスト停止
  const stopTest = useCallback(() => {
    setIsRunning(false);
      // 監視停止（純粋WebAudioシステムでは削除）
    window.removeEventListener('keydown', handleKeyPress);
    
    // アクティブなインターバルをクリア
    activeIntervalsRef.current.forEach(interval => clearInterval(interval));
    activeIntervalsRef.current = [];
    
    console.log('🛑 高速タイピングテスト停止');
  }, [handleKeyPress]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopTest();
    };
  }, [stopTest]);

  return (
    <div className="high-speed-typing-test" style={{ padding: '20px' }}>
      <h2>🚀 高速タイピング遅延テスト</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startTest} 
          disabled={isRunning}
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px',
            backgroundColor: isRunning ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {isRunning ? '実行中...' : 'テスト開始'}
        </button>
        
        <button 
          onClick={stopTest} 
          disabled={!isRunning}
          style={{ 
            padding: '10px 20px',
            backgroundColor: !isRunning ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          テスト停止
        </button>
      </div>      <div style={{ marginBottom: '20px' }}>
        <p><strong>キー入力数:</strong> {keyPressCount}</p>
        <p><strong>テスト時間:</strong> {testDuration}秒/テスト</p>
        <p><strong>システム:</strong> 純粋WebAudioエンジン</p>
      </div>

      {/* テスト結果 */}
      {testResults.length > 0 && (
        <div>
          <h3>📈 テスト結果</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>テスト名</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>状態</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>キー数</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>平均遅延</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>最大遅延</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>最小遅延</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>ドロップアウト</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.status}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.keyPresses}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.avgLatency}ms</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.maxLatency}ms</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.minLatency}ms</td>
                  <td style={{ 
                    border: '1px solid #ddd', 
                    padding: '8px',
                    backgroundColor: result.dropouts > 0 ? '#ffebee' : '#e8f5e8'
                  }}>
                    {result.dropouts || 0}回
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>📝 使用方法</h4>
        <ul>
          <li>「テスト開始」ボタンで自動高速入力テストが開始されます</li>
          <li>テスト中にキーボードで手動入力も可能です</li>
          <li>異なる間隔（50ms〜150ms）での連続入力性能を測定します</li>
          <li>WebAudio最適化の効果を数値で確認できます</li>
          <li>🔴 ドロップアウト: 100ms以上の遅延が発生した回数</li>
        </ul>
      </div>
    </div>
  );
};

export default HighSpeedTypingTest;
