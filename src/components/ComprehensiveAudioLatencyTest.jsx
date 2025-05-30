// ComprehensiveAudioLatencyTest.jsx - 統合音響遅延測定テスト
'use client';

import React, { useState, useCallback, useRef } from 'react';
import KeyboardSoundUtils from '../utils/KeyboardSoundUtils';
import LightweightKeyboardSound from '../utils/LightweightKeyboardSound';
import UltraFastKeyboardSound from '../utils/UltraFastKeyboardSound';
import UnifiedAudioSystem from '../utils/UnifiedAudioSystem';

const ComprehensiveAudioLatencyTest = () => {
  const [testResults, setTestResults] = useState({
    complex: null,
    lightweight: null,
    ultrafast: null,
    mp3: null
  });
  const [isInitialized, setIsInitialized] = useState({
    lightweight: false,
    ultrafast: false,
    mp3: false
  });
  const [testing, setTesting] = useState(null);
  const audioRef = useRef(null);

  // 各システムの初期化
  const initializeSystems = useCallback(async () => {
    try {
      // 軽量版初期化
      await LightweightKeyboardSound.initializePrerenderedBuffers();
      
      // 超高速版初期化
      UltraFastKeyboardSound.init();
      UltraFastKeyboardSound.resume();
      
      // MP3システムの準備
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/Hit05-1.mp3');
        audioRef.current.preload = 'auto';
        await new Promise((resolve, reject) => {
          audioRef.current.oncanplaythrough = resolve;
          audioRef.current.onerror = reject;
          audioRef.current.load();
        });
      }

      setIsInitialized({
        lightweight: true,
        ultrafast: true,
        mp3: true
      });
      
      console.log('✅ 全音響システムの初期化完了');
    } catch (e) {
      console.error('❌ システム初期化エラー:', e);
    }
  }, []);

  // 遅延測定の実行
  const measureLatency = useCallback(async (testType, playFunction, iterations = 50) => {
    setTesting(testType);
    const latencies = [];
    
    try {
      console.log(`🔧 ${testType}システムの遅延測定開始 (${iterations}回)`);
      
      for (let i = 0; i < iterations; i++) {
        // ガベージコレクション対策: 3回に1回少し待機
        if (i % 3 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        
        const startTime = performance.now();
        await playFunction();
        const endTime = performance.now();
        latencies.push(endTime - startTime);
        
        // 短い間隔で次のテスト
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      
      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      const minLatency = Math.min(...latencies);
      const maxLatency = Math.max(...latencies);
      const stdDev = Math.sqrt(
        latencies.reduce((sum, l) => sum + Math.pow(l - avgLatency, 2), 0) / latencies.length
      );
      
      // パーセンタイル計算
      const sortedLatencies = [...latencies].sort((a, b) => a - b);
      const p95 = sortedLatencies[Math.floor(0.95 * latencies.length)];
      const p99 = sortedLatencies[Math.floor(0.99 * latencies.length)];
      
      const results = {
        average: avgLatency,
        min: minLatency,
        max: maxLatency,
        standardDeviation: stdDev,
        p95,
        p99,
        samples: latencies,
        iterations
      };
      
      console.log(`📊 ${testType}測定完了:`, results);
      return results;
    } catch (e) {
      console.error(`❌ ${testType}測定エラー:`, e);
      return null;
    } finally {
      setTesting(null);
    }
  }, []);

  // 各システムのテスト関数
  const testComplexSystem = useCallback(async () => {
    const results = await measureLatency('複雑版WebAudio', () => {
      KeyboardSoundUtils.playClickSound();
    });
    setTestResults(prev => ({ ...prev, complex: results }));
  }, [measureLatency]);

  const testLightweightSystem = useCallback(async () => {
    if (!isInitialized.lightweight) {
      alert('軽量版システムを初期化してください');
      return;
    }
    const results = await measureLatency('軽量版WebAudio', () => {
      LightweightKeyboardSound.playClickSound();
    });
    setTestResults(prev => ({ ...prev, lightweight: results }));
  }, [measureLatency, isInitialized.lightweight]);

  const testUltraFastSystem = useCallback(async () => {
    if (!isInitialized.ultrafast) {
      alert('超高速版システムを初期化してください');
      return;
    }
    const results = await measureLatency('超高速WebAudio', () => {
      UltraFastKeyboardSound.playClick();
    });
    setTestResults(prev => ({ ...prev, ultrafast: results }));
  }, [measureLatency, isInitialized.ultrafast]);

  const testMP3System = useCallback(async () => {
    if (!isInitialized.mp3) {
      alert('MP3システムを初期化してください');
      return;
    }
    const results = await measureLatency('MP3', async () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        return audioRef.current.play().catch(() => {});
      }
    });
    setTestResults(prev => ({ ...prev, mp3: results }));
  }, [measureLatency, isInitialized.mp3]);

  // 全システム連続テスト
  const runComprehensiveTest = useCallback(async () => {
    if (!isInitialized.lightweight || !isInitialized.ultrafast || !isInitialized.mp3) {
      alert('まず全システムを初期化してください');
      return;
    }

    console.log('🚀 統合音響システム性能テスト開始');
    await testComplexSystem();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testLightweightSystem();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testUltraFastSystem();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testMP3System();
    console.log('✅ 全システムテスト完了');
  }, [isInitialized, testComplexSystem, testLightweightSystem, testUltraFastSystem, testMP3System]);

  // 結果の比較分析
  const generateComparison = useCallback(() => {
    const { complex, lightweight, ultrafast, mp3 } = testResults;
    if (!complex || !lightweight || !ultrafast || !mp3) {
      alert('全システムのテストを完了してから比較してください');
      return;
    }

    console.log('\n=== 🏆 統合音響システム性能比較結果 ===');
    console.log(`複雑版WebAudio   : 平均 ${complex.average.toFixed(2)}ms (P95: ${complex.p95.toFixed(2)}ms)`);
    console.log(`軽量版WebAudio   : 平均 ${lightweight.average.toFixed(2)}ms (P95: ${lightweight.p95.toFixed(2)}ms)`);
    console.log(`超高速WebAudio   : 平均 ${ultrafast.average.toFixed(2)}ms (P95: ${ultrafast.p95.toFixed(2)}ms)`);
    console.log(`MP3             : 平均 ${mp3.average.toFixed(2)}ms (P95: ${mp3.p95.toFixed(2)}ms)`);
    
    // 最速システムの特定
    const systems = [
      { name: '複雑版WebAudio', result: complex },
      { name: '軽量版WebAudio', result: lightweight },
      { name: '超高速WebAudio', result: ultrafast },
      { name: 'MP3', result: mp3 }
    ];
    
    const fastest = systems.reduce((prev, current) => 
      current.result.average < prev.result.average ? current : prev
    );
    
    console.log(`\n🥇 最速システム: ${fastest.name} (${fastest.result.average.toFixed(2)}ms)`);
    
    // 改善率計算
    const ultrafastImprovement = ((complex.average - ultrafast.average) / complex.average) * 100;
    const mp3Comparison = ultrafast.average < mp3.average ? 
      `MP3より${((mp3.average - ultrafast.average) / mp3.average * 100).toFixed(1)}%高速` :
      `MP3より${((ultrafast.average - mp3.average) / ultrafast.average * 100).toFixed(1)}%低速`;
    
    console.log(`\n📈 超高速WebAudio改善率: ${ultrafastImprovement.toFixed(1)}% (vs 複雑版)`);
    console.log(`🆚 MP3との比較: ${mp3Comparison}`);
    
    return {
      fastest: fastest.name,
      ultrafastImprovement,
      mp3Comparison,
      systems
    };
  }, [testResults]);

  // システム状態の表示
  const getSystemStatus = (systemKey) => {
    if (testing === systemKey) return '⏳ テスト中...';
    if (!isInitialized[systemKey]) return '❌ 未初期化';
    if (testResults[systemKey]) return '✅ テスト完了';
    return '⭕ 準備完了';
  };

  const ResultCard = ({ title, result, systemKey, testFunction, bgColor }) => (
    <div style={{ 
      flex: 1, 
      border: '2px solid #333', 
      padding: '15px', 
      borderRadius: '8px',
      backgroundColor: bgColor,
      minHeight: '200px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{title}</h3>
      <div style={{ marginBottom: '10px', fontSize: '12px' }}>
        状態: {getSystemStatus(systemKey)}
      </div>
      
      <button 
        onClick={testFunction}
        disabled={testing || (systemKey !== 'complex' && !isInitialized[systemKey])}
        style={{ 
          padding: '8px 16px', 
          marginBottom: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer'
        }}
      >
        {testing === systemKey ? '測定中...' : 'テスト実行'}
      </button>
      
      {result && (
        <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
          <div><strong>平均: {result.average.toFixed(2)}ms</strong></div>
          <div>最小: {result.min.toFixed(2)}ms</div>
          <div>最大: {result.max.toFixed(2)}ms</div>
          <div>P95: {result.p95.toFixed(2)}ms</div>
          <div>P99: {result.p99.toFixed(2)}ms</div>
          <div>標準偏差: {result.standardDeviation.toFixed(2)}ms</div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🎵 統合音響システム遅延測定テスト
      </h1>
      
      {/* 初期化セクション */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 15px 0' }}>🔧 システム初期化</h2>
        <button 
          onClick={initializeSystems}
          disabled={isInitialized.lightweight && isInitialized.ultrafast && isInitialized.mp3}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {(isInitialized.lightweight && isInitialized.ultrafast && isInitialized.mp3) ? 
            '✅ 全システム初期化完了' : '全システムを初期化'}
        </button>
      </div>

      {/* テスト実行セクション */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <ResultCard 
          title="複雑版WebAudio" 
          result={testResults.complex}
          systemKey="complex"
          testFunction={testComplexSystem}
          bgColor="#ffebee"
        />
        <ResultCard 
          title="軽量版WebAudio" 
          result={testResults.lightweight}
          systemKey="lightweight"
          testFunction={testLightweightSystem}
          bgColor="#e8f5e8"
        />
        <ResultCard 
          title="超高速WebAudio" 
          result={testResults.ultrafast}
          systemKey="ultrafast"
          testFunction={testUltraFastSystem}
          bgColor="#e3f2fd"
        />
        <ResultCard 
          title="MP3" 
          result={testResults.mp3}
          systemKey="mp3"
          testFunction={testMP3System}
          bgColor="#fff3e0"
        />
      </div>

      {/* 統合テスト・比較セクション */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 15px 0' }}>📊 統合テスト・比較</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={runComprehensiveTest}
            disabled={testing || !isInitialized.lightweight || !isInitialized.ultrafast || !isInitialized.mp3}
            style={{ 
              padding: '12px 24px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            🚀 全システム連続テスト
          </button>
          <button 
            onClick={generateComparison}
            disabled={!testResults.complex || !testResults.lightweight || !testResults.ultrafast || !testResults.mp3}
            style={{ 
              padding: '12px 24px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            📈 詳細比較分析
          </button>
        </div>
        
        <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
          💡 詳細な測定結果とパフォーマンス分析は、ブラウザの開発者ツール（F12）のコンソールで確認できます。
        </p>
      </div>

      {/* 手動テストセクション */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 15px 0' }}>🎹 手動聞き比べテスト</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <button onClick={() => KeyboardSoundUtils.playClickSound()} style={{ padding: '10px', backgroundColor: '#ffcdd2' }}>
            複雑版音を再生
          </button>
          <button 
            onClick={() => LightweightKeyboardSound.playClickSound()}
            disabled={!isInitialized.lightweight}
            style={{ padding: '10px', backgroundColor: isInitialized.lightweight ? '#c8e6c9' : '#e0e0e0' }}
          >
            軽量版音を再生
          </button>
          <button 
            onClick={() => UltraFastKeyboardSound.playClick()}
            disabled={!isInitialized.ultrafast}
            style={{ padding: '10px', backgroundColor: isInitialized.ultrafast ? '#bbdefb' : '#e0e0e0' }}
          >
            超高速版音を再生
          </button>
          <button 
            onClick={() => audioRef.current && audioRef.current.play()}
            disabled={!isInitialized.mp3}
            style={{ padding: '10px', backgroundColor: isInitialized.mp3 ? '#ffe0b2' : '#e0e0e0' }}
          >
            MP3音を再生
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAudioLatencyTest;
