// AudioLatencyTestComponent.jsx - 音響遅延テスト用コンポーネント
'use client';

import React, { useState, useCallback } from 'react';
import AudioPerformanceTest from '../utils/AudioPerformanceTest';
import LightweightKeyboardSound from '../utils/LightweightKeyboardSound';
import KeyboardSoundUtils from '../utils/KeyboardSoundUtils';

const AudioLatencyTestComponent = () => {
  const [currentResults, setCurrentResults] = useState(null);
  const [lightweightResults, setLightweightResults] = useState(null);
  const [isTestingCurrent, setIsTestingCurrent] = useState(false);
  const [isTestingLightweight, setIsTestingLightweight] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 軽量版の初期化
  const initializeLightweight = useCallback(async () => {
    try {
      await LightweightKeyboardSound.initializePrerenderedBuffers();
      setIsInitialized(true);
      console.log('軽量版音響システムが初期化されました');
    } catch (e) {
      console.error('軽量版音響システムの初期化に失敗:', e);
    }
  }, []);

  // 現在の音響システムのテスト
  const testCurrentSystem = useCallback(async () => {
    setIsTestingCurrent(true);
    try {
      // KeyboardSoundUtilsを使用
      const results = await AudioPerformanceTest.measureClickSoundLatency(50);
      setCurrentResults(results);
    } catch (e) {
      console.error('現在システムのテストに失敗:', e);
    } finally {
      setIsTestingCurrent(false);
    }
  }, []);

  // 軽量版音響システムのテスト
  const testLightweightSystem = useCallback(async () => {
    if (!isInitialized) {
      alert('まず軽量版システムを初期化してください');
      return;
    }
    
    setIsTestingLightweight(true);
    try {
      // 軽量版を使用するテスト
      const latencies = [];
      const iterations = 50;
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        LightweightKeyboardSound.playClickSound();
        const endTime = performance.now();
        latencies.push(endTime - startTime);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      const minLatency = Math.min(...latencies);
      const maxLatency = Math.max(...latencies);
      const stdDev = Math.sqrt(
        latencies.reduce((sum, l) => sum + Math.pow(l - avgLatency, 2), 0) / latencies.length
      );
      
      const results = {
        average: avgLatency,
        min: minLatency,
        max: maxLatency,
        standardDeviation: stdDev,
        samples: latencies,
        iterations
      };
      
      setLightweightResults(results);
    } catch (e) {
      console.error('軽量システムのテストに失敗:', e);
    } finally {
      setIsTestingLightweight(false);
    }
  }, [isInitialized]);

  // 比較テスト
  const comparePerformance = useCallback(() => {
    if (!currentResults || !lightweightResults) {
      alert('両方のシステムをテストしてから比較してください');
      return;
    }

    const improvement = {
      averageReduction: currentResults.average - lightweightResults.average,
      minReduction: currentResults.min - lightweightResults.min,
      maxReduction: currentResults.max - lightweightResults.max,
      percentImprovement: ((currentResults.average - lightweightResults.average) / currentResults.average) * 100
    };

    console.log('=== パフォーマンス比較結果 ===');
    console.log(`平均遅延の改善: ${improvement.averageReduction.toFixed(2)}ms (${improvement.percentImprovement.toFixed(1)}%改善)`);
    console.log(`最小遅延の改善: ${improvement.minReduction.toFixed(2)}ms`);
    console.log(`最大遅延の改善: ${improvement.maxReduction.toFixed(2)}ms`);
    
    return improvement;
  }, [currentResults, lightweightResults]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🎵 音響遅延比較テスト</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>初期化</h3>
        <button 
          onClick={initializeLightweight}
          disabled={isInitialized}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: isInitialized ? '#90EE90' : '#FFB6C1',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          {isInitialized ? '✓ 軽量版初期化済み' : '軽量版を初期化'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
          <h3>現在のシステム（複雑版）</h3>
          <button 
            onClick={testCurrentSystem}
            disabled={isTestingCurrent}
            style={{ 
              padding: '10px 20px', 
              marginBottom: '10px',
              backgroundColor: '#87CEEB',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {isTestingCurrent ? '⏳ テスト中...' : '遅延テスト実行'}
          </button>
          
          {currentResults && (
            <div style={{ fontSize: '12px' }}>
              <div>平均遅延: <strong>{currentResults.average.toFixed(2)}ms</strong></div>
              <div>最小遅延: {currentResults.min.toFixed(2)}ms</div>
              <div>最大遅延: {currentResults.max.toFixed(2)}ms</div>
              <div>標準偏差: {currentResults.standardDeviation.toFixed(2)}ms</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
          <h3>軽量版システム</h3>
          <button 
            onClick={testLightweightSystem}
            disabled={isTestingLightweight || !isInitialized}
            style={{ 
              padding: '10px 20px', 
              marginBottom: '10px',
              backgroundColor: isInitialized ? '#98FB98' : '#D3D3D3',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {isTestingLightweight ? '⏳ テスト中...' : '遅延テスト実行'}
          </button>
          
          {lightweightResults && (
            <div style={{ fontSize: '12px' }}>
              <div>平均遅延: <strong>{lightweightResults.average.toFixed(2)}ms</strong></div>
              <div>最小遅延: {lightweightResults.min.toFixed(2)}ms</div>
              <div>最大遅延: {lightweightResults.max.toFixed(2)}ms</div>
              <div>標準偏差: {lightweightResults.standardDeviation.toFixed(2)}ms</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={comparePerformance}
          disabled={!currentResults || !lightweightResults}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#FFD700',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          📊 パフォーマンス比較
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>手動テスト</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => KeyboardSoundUtils.playClickSound()}
            style={{ padding: '10px', backgroundColor: '#FFB6C1' }}
          >
            現在の音を再生
          </button>
          <button 
            onClick={() => LightweightKeyboardSound.playClickSound()}
            disabled={!isInitialized}
            style={{ 
              padding: '10px', 
              backgroundColor: isInitialized ? '#98FB98' : '#D3D3D3'
            }}
          >
            軽量版音を再生
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>注意:</strong> このテストはブラウザの開発者ツールのコンソールも確認してください。</p>
        <p>測定結果の詳細ログが表示されます。</p>
      </div>
    </div>
  );
};

export default AudioLatencyTestComponent;
