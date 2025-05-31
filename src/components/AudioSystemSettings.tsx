/**
 * 音声システム設定コンポーネント
 * ユーザーが音声エンジンを切り替えてパフォーマンスを比較可能
 */
'use client';

import React, { useState, useEffect } from 'react';
import AudioSystemManager from '@/utils/AudioSystemManager';
import type { AudioSystemConfig } from '@/utils/AudioSystemManager';

interface AudioSystemSettingsProps {
  className?: string;
}

const AudioSystemSettings: React.FC<AudioSystemSettingsProps> = ({ className }) => {
  const [config, setConfig] = useState<AudioSystemConfig>(AudioSystemManager.getConfig());
  const [stats, setStats] = useState(AudioSystemManager.getStats());
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // 設定の同期
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(AudioSystemManager.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleEngineChange = (engine: AudioSystemConfig['engine']) => {
    AudioSystemManager.switchEngine(engine);
    const newConfig = AudioSystemManager.getConfig();
    setConfig(newConfig);
    setStats(AudioSystemManager.getStats());
  };

  const handlePerformanceToggle = () => {
    const newValue = !config.enablePerformanceMeasurement;
    AudioSystemManager.configure({ enablePerformanceMeasurement: newValue });
    const newConfig = AudioSystemManager.getConfig();
    setConfig(newConfig);
  };

  const handleLoggingToggle = () => {
    const newValue = !config.enableConsoleLogging;
    AudioSystemManager.configure({ enableConsoleLogging: newValue });
    const newConfig = AudioSystemManager.getConfig();
    setConfig(newConfig);
  };

  const runBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const results = await AudioSystemManager.benchmarkEngines(30);
      setBenchmarkResults(results);
    } catch (error) {
      console.error('ベンチマークエラー:', error);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const enablePerformanceMode = () => {
    AudioSystemManager.enablePerformanceMode();
    const newConfig = AudioSystemManager.getConfig();
    setConfig(newConfig);
    setStats(AudioSystemManager.getStats());
  };

  const enableDebugMode = () => {
    AudioSystemManager.enableDebugMode();
    const newConfig = AudioSystemManager.getConfig();
    setConfig(newConfig);
    setStats(AudioSystemManager.getStats());
  };

  const testAudio = () => {
    AudioSystemManager.playClickSound();
    setTimeout(() => AudioSystemManager.playErrorSound(), 200);
    setTimeout(() => AudioSystemManager.playSuccessSound(), 400);
  };

  return (
    <div className={`audio-system-settings ${className || ''}`}>
      <style jsx>{`
        .audio-system-settings {
          background: #2a2a2a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 20px;
          margin: 10px 0;
          color: #e0e0e0;
          font-family: 'Consolas', 'Monaco', monospace;
        }
        .settings-title {
          color: #4CAF50;
          font-size: 1.2em;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .settings-section {
          margin: 15px 0;
          padding: 15px;
          background: #333;
          border-radius: 4px;
          border-left: 4px solid #4CAF50;
        }
        .section-title {
          color: #aaa;
          font-size: 0.9em;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .engine-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin: 10px 0;
        }
        .engine-button {
          background: #444;
          border: 2px solid #555;
          color: #e0e0e0;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s;
          font-size: 14px;
        }
        .engine-button:hover {
          background: #555;
          border-color: #4CAF50;
        }
        .engine-button.active {
          background: #4CAF50;
          border-color: #4CAF50;
          color: white;
          font-weight: bold;
        }
        .toggle-button {
          background: #555;
          border: none;
          color: #e0e0e0;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px 5px 5px 0;
          transition: background 0.3s;
        }
        .toggle-button:hover {
          background: #666;
        }
        .toggle-button.enabled {
          background: #4CAF50;
          color: white;
        }
        .action-button {
          background: #2196F3;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px 5px 5px 0;
          transition: background 0.3s;
          font-weight: bold;
        }
        .action-button:hover {
          background: #1976D2;
        }
        .action-button:disabled {
          background: #666;
          cursor: not-allowed;
        }
        .performance-button {
          background: #FF9800;
        }
        .performance-button:hover {
          background: #F57C00;
        }
        .debug-button {
          background: #9C27B0;
        }
        .debug-button:hover {
          background: #7B1FA2;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin: 10px 0;
        }
        .stat-item {
          background: #444;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
        }
        .stat-label {
          color: #aaa;
          font-size: 0.8em;
          margin-bottom: 5px;
        }
        .stat-value {
          color: #4CAF50;
          font-weight: bold;
          font-size: 1.1em;
        }
        .benchmark-results {
          background: #1a1a1a;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
          border: 1px solid #333;
        }
        .benchmark-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #333;
        }
        .benchmark-item:last-child {
          border-bottom: none;
        }
        .improvement {
          color: #4CAF50;
          font-weight: bold;
        }
        .current-engine {
          color: #f44336;
        }
        .optimized-engine {
          color: #4CAF50;
        }
      `}</style>

      <h3 className="settings-title">
        🎵 音声システム設定
        {stats.engine === 'optimized' && <span>⚡</span>}
        {stats.engine === 'silent' && <span>🔇</span>}
      </h3>

      {/* エンジン選択 */}
      <div className="settings-section">
        <div className="section-title">音声エンジン</div>
        <div className="engine-selector">
          <button
            className={`engine-button ${config.engine === 'current' ? 'active' : ''}`}
            onClick={() => handleEngineChange('current')}
          >
            🐌 現在の実装
          </button>
          <button
            className={`engine-button ${config.engine === 'optimized' ? 'active' : ''}`}
            onClick={() => handleEngineChange('optimized')}
          >
            🚀 最適化版
          </button>
          <button
            className={`engine-button ${config.engine === 'silent' ? 'active' : ''}`}
            onClick={() => handleEngineChange('silent')}
          >
            🔇 音声なし
          </button>
        </div>
      </div>

      {/* 詳細設定 */}
      <div className="settings-section">
        <div className="section-title">詳細設定</div>
        <button
          className={`toggle-button ${config.enablePerformanceMeasurement ? 'enabled' : ''}`}
          onClick={handlePerformanceToggle}
        >
          📊 パフォーマンス測定: {config.enablePerformanceMeasurement ? 'ON' : 'OFF'}
        </button>
        <button
          className={`toggle-button ${config.enableConsoleLogging ? 'enabled' : ''}`}
          onClick={handleLoggingToggle}
        >
          🐛 コンソールログ: {config.enableConsoleLogging ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* クイック設定 */}
      <div className="settings-section">
        <div className="section-title">クイック設定</div>
        <button className="action-button performance-button" onClick={enablePerformanceMode}>
          ⚡ パフォーマンスモード
        </button>
        <button className="action-button debug-button" onClick={enableDebugMode}>
          🐛 デバッグモード
        </button>
        <button className="action-button" onClick={testAudio}>
          🔊 音声テスト
        </button>
      </div>

      {/* 統計情報 */}
      <div className="settings-section">
        <div className="section-title">システム状態</div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">現在のエンジン</div>
            <div className="stat-value">{stats.engine}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">初期化状態</div>
            <div className="stat-value">{stats.initialized ? '✅' : '❌'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">最適化版準備</div>
            <div className="stat-value">{stats.optimizedReady ? '✅' : '❌'}</div>
          </div>
        </div>
      </div>

      {/* ベンチマーク */}
      <div className="settings-section">
        <div className="section-title">パフォーマンステスト</div>
        <button
          className="action-button"
          onClick={runBenchmark}
          disabled={isBenchmarking}
        >
          {isBenchmarking ? '🔄 測定中...' : '🏁 ベンチマーク実行'}
        </button>

        {benchmarkResults && (
          <div className="benchmark-results">
            <h4>📊 ベンチマーク結果</h4>
            <div className="benchmark-item">
              <span>現在の実装:</span>
              <span className="current-engine">
                {benchmarkResults.results.current.averageLatency.toFixed(2)}ms
              </span>
            </div>
            <div className="benchmark-item">
              <span>最適化版:</span>
              <span className="optimized-engine">
                {benchmarkResults.results.optimized.averageLatency.toFixed(2)}ms
              </span>
            </div>
            <div className="benchmark-item">
              <span>改善度:</span>
              <span className="improvement">
                {benchmarkResults.improvement.toFixed(2)}ms 
                ({benchmarkResults.improvementPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="benchmark-item">
              <span>推奨:</span>
              <span>
                {benchmarkResults.improvementPercent > 20 ? 
                  '🚀 最適化版の使用を推奨' : 
                  '📊 現在の実装で十分'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioSystemSettings;
