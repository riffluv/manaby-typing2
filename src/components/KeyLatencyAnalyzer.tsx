/**
 * キー入力遅延解析コンポーネント
 * 40年のtypingmania経験者が感じる遅延を数値化・可視化
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useHighSpeedKeys } from '@/utils/HighSpeedKeyDetector';

interface LatencyMeasurement {
  timestamp: number;
  key: string;
  hardwareToJs: number;
  jsToHandler: number;
  handlerToResponse: number;
  totalLatency: number;
  browserLatency: number;
  osLatency: number;
}

interface KeyLatencyAnalyzerProps {
  enabled?: boolean;
  onLatencyAlert?: (latency: number) => void;
}

export const KeyLatencyAnalyzer: React.FC<KeyLatencyAnalyzerProps> = ({ 
  enabled = false,
  onLatencyAlert 
}) => {
  const [measurements, setMeasurements] = useState<LatencyMeasurement[]>([]);  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVisible, setIsVisible] = useState(enabled);
  const [veteranThreshold] = useState(8); // 40年経験者の感覚閾値（8ms以下）
  const [realTimeLatency, setRealTimeLatency] = useState<number>(0);
  const [alertCount, setAlertCount] = useState(0);
  const highSpeedKeys = useHighSpeedKeys();
  const measurementBufferRef = useRef<LatencyMeasurement[]>([]);
  const lastKeyTimeRef = useRef<number>(0);

  // キーボードショートカット（Ctrl+Shift+L）で表示切り替え
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        setIsVisible(prev => !prev);
        console.log('🎯 キー遅延解析表示切り替え');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  // ベテラン専用遅延測定
  useEffect(() => {
    if (!isVisible || !isAnalyzing) return;

    const analyzeKeyLatency = (e: KeyboardEvent) => {
      const jsReceiveTime = performance.now();
      
      // ハードウェア→JS間の遅延推定
      const hardwareToJs = jsReceiveTime - (e.timeStamp || jsReceiveTime);
      
      // ブラウザ内部遅延推定
      const browserLatency = e.timeStamp ? jsReceiveTime - e.timeStamp : 0;
      
      // OS遅延推定（前のキーとの間隔から）
      const timeSinceLastKey = jsReceiveTime - lastKeyTimeRef.current;
      const osLatency = timeSinceLastKey > 500 ? 0 : Math.max(0, timeSinceLastKey - 50);
      
      const handlerStartTime = performance.now();
      
      // 実際の処理時間測定
      setTimeout(() => {
        const handlerEndTime = performance.now();
        const jsToHandler = handlerStartTime - jsReceiveTime;
        const handlerToResponse = handlerEndTime - handlerStartTime;
        const totalLatency = handlerEndTime - jsReceiveTime;

        const measurement: LatencyMeasurement = {
          timestamp: jsReceiveTime,
          key: e.key,
          hardwareToJs,
          jsToHandler,
          handlerToResponse,
          totalLatency,
          browserLatency,
          osLatency
        };

        // リアルタイム更新
        setRealTimeLatency(totalLatency);
        
        // ベテラン閾値チェック
        if (totalLatency > veteranThreshold) {
          setAlertCount(prev => prev + 1);
          onLatencyAlert?.(totalLatency);
        }

        // 測定データ蓄積
        measurementBufferRef.current.push(measurement);
        
        // 最新100回分のみ保持
        if (measurementBufferRef.current.length > 100) {
          measurementBufferRef.current.shift();
        }
        
        setMeasurements([...measurementBufferRef.current]);
      }, 0);

      lastKeyTimeRef.current = jsReceiveTime;
    };

    // 超高速キー検知システムにフック
    const originalHandler = highSpeedKeys.setTypingHandler;
    
    // キー解析ハンドラーを設定
    window.addEventListener('keydown', analyzeKeyLatency, { 
      passive: false, 
      capture: true 
    });    return () => {
      window.removeEventListener('keydown', analyzeKeyLatency, true);
    };
  }, [isVisible, isAnalyzing, veteranThreshold, highSpeedKeys, onLatencyAlert]);

  // 統計計算
  const stats = React.useMemo(() => {
    if (measurements.length === 0) return null;

    const latencies = measurements.map(m => m.totalLatency);
    const hardwareLatencies = measurements.map(m => m.hardwareToJs);
    const jsLatencies = measurements.map(m => m.jsToHandler);
    const handlerLatencies = measurements.map(m => m.handlerToResponse);

    return {
      count: measurements.length,
      averageTotal: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      minTotal: Math.min(...latencies),
      maxTotal: Math.max(...latencies),
      averageHardware: hardwareLatencies.reduce((a, b) => a + b, 0) / hardwareLatencies.length,
      averageJs: jsLatencies.reduce((a, b) => a + b, 0) / jsLatencies.length,
      averageHandler: handlerLatencies.reduce((a, b) => a + b, 0) / handlerLatencies.length,
      veteranCompliance: (latencies.filter(l => l <= veteranThreshold).length / latencies.length) * 100
    };
  }, [measurements, veteranThreshold]);

  // パフォーマンス評価
  const getPerformanceLevel = (avgLatency: number) => {
    if (avgLatency <= 3) return { level: 'プロ級', color: '#00ff00', description: 'typingmania競技レベル' };
    if (avgLatency <= 8) return { level: 'ベテラン級', color: '#00ccff', description: '40年経験者納得レベル' };
    if (avgLatency <= 15) return { level: '上級', color: '#ffcc00', description: '一般上級者レベル' };
    if (avgLatency <= 30) return { level: '中級', color: '#ff9900', description: '改善の余地あり' };
    return { level: '要改善', color: '#ff0000', description: '大幅な最適化が必要' };
  };

  if (!enabled) return null;

  const performanceLevel = stats ? getPerformanceLevel(stats.averageTotal) : null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 10000,
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #00ffff',
      borderRadius: '10px',
      padding: '15px',
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      minWidth: '350px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px',
        borderBottom: '1px solid #00ffff',
        paddingBottom: '8px'
      }}>
        <span style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '14px' }}>
          🎯 ベテラン級キー遅延解析
        </span>
        <button
          onClick={() => setIsAnalyzing(!isAnalyzing)}
          style={{
            background: isAnalyzing ? '#ff4444' : '#00ff00',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            color: 'black',
            fontSize: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isAnalyzing ? '停止' : '開始'}
        </button>
      </div>

      {/* リアルタイム遅延表示 */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: '#ffff00', fontWeight: 'bold' }}>
          リアルタイム遅延: <span style={{ 
            color: realTimeLatency <= veteranThreshold ? '#00ff00' : '#ff4444',
            fontSize: '16px'
          }}>
            {realTimeLatency.toFixed(2)}ms
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#cccccc' }}>
          ベテラン閾値: {veteranThreshold}ms | アラート回数: {alertCount}
        </div>
      </div>

      {/* パフォーマンスレベル */}
      {performanceLevel && (
        <div style={{ 
          marginBottom: '10px',
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          border: `1px solid ${performanceLevel.color}`
        }}>
          <div style={{ color: performanceLevel.color, fontWeight: 'bold' }}>
            レベル: {performanceLevel.level}
          </div>
          <div style={{ fontSize: '10px', color: '#cccccc' }}>
            {performanceLevel.description}
          </div>
        </div>
      )}

      {/* 詳細統計 */}
      {stats && (
        <div>
          <div style={{ color: '#ffcc00', fontWeight: 'bold', marginBottom: '5px' }}>
            統計 (測定数: {stats.count})
          </div>
          <div>平均総遅延: <span style={{ color: '#ffffff' }}>{stats.averageTotal.toFixed(2)}ms</span></div>
          <div>最小/最大: <span style={{ color: '#aaaaaa' }}>
            {stats.minTotal.toFixed(2)}ms / {stats.maxTotal.toFixed(2)}ms
          </span></div>
          <div>ハードウェア→JS: <span style={{ color: '#aaaaaa' }}>{stats.averageHardware.toFixed(2)}ms</span></div>
          <div>JS処理: <span style={{ color: '#aaaaaa' }}>{stats.averageJs.toFixed(2)}ms</span></div>
          <div>ハンドラー実行: <span style={{ color: '#aaaaaa' }}>{stats.averageHandler.toFixed(2)}ms</span></div>
          <div>ベテラン適合率: <span style={{ 
            color: stats.veteranCompliance >= 90 ? '#00ff00' : 
                  stats.veteranCompliance >= 70 ? '#ffcc00' : '#ff4444'
          }}>
            {stats.veteranCompliance.toFixed(1)}%
          </span></div>
        </div>
      )}

      {/* 最新測定値表示 */}
      {measurements.length > 0 && (
        <div style={{ 
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #444444',
          maxHeight: '120px',
          overflowY: 'auto'
        }}>
          <div style={{ color: '#ffcc00', fontWeight: 'bold', marginBottom: '5px' }}>
            最新キー入力履歴
          </div>
          {measurements.slice(-5).reverse().map((m, idx) => (
            <div key={idx} style={{ 
              fontSize: '10px', 
              color: m.totalLatency <= veteranThreshold ? '#00ff00' : '#ff9999',
              marginBottom: '2px'
            }}>
              {m.key}: {m.totalLatency.toFixed(2)}ms 
              {m.totalLatency > veteranThreshold && ' ⚠️'}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '8px',
        fontSize: '9px',
        color: '#888888',
        textAlign: 'center'
      }}>
        typingmania-ref流 超高速解析システム
      </div>
    </div>
  );
};

export default KeyLatencyAnalyzer;
