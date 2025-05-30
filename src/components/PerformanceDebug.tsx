// このファイルは不要になりました。安全に削除できます。

/**
 * パフォーマンスデバッグコンポーネント
 * typingmania-ref流最適化の監視・デバッグ用
 */

'use client';

import React, { useEffect, useState } from 'react';
import { usePerformanceMonitor } from '@/utils/PerformanceMonitor';
import { useDirectDOM } from '@/utils/DirectDOMManager';

interface PerformanceDebugProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceDebug: React.FC<PerformanceDebugProps> = ({ 
  enabled = false, 
  position = 'top-right' 
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [domState, setDomState] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(enabled);

  const performanceMonitor = usePerformanceMonitor();
  const directDOM = useDirectDOM();

  // メトリクス更新
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setStats(performanceMonitor.getPerformanceStats());
      setDomState(directDOM.getState());
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, performanceMonitor, directDOM]);

  // キーボードショートカットでデバッグ表示切り替え
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible || !metrics) return null;

  const positionStyles = {
    'top-left': { top: '1rem', left: '1rem' },
    'top-right': { top: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' }
  };

  return (
    <div 
      className="performance-debug"
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid var(--color-accent-cyan)',
        borderRadius: '8px',
        padding: '0.75rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--color-text-primary)',
        minWidth: '280px',
        backdropFilter: 'blur(10px)',
        contain: 'layout style'
      }}
    >
      {/* ヘッダー */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--color-accent-cyan)'
      }}>
        <span style={{ color: 'var(--color-accent-cyan)', fontWeight: 'bold' }}>
          Performance Monitor
        </span>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* 基本メトリクス */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ color: 'var(--color-accent-neon)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Input Performance
        </div>
        <div>Latency: <span style={{ color: 'var(--color-success)' }}>
          {stats?.averageLatency?.toFixed(1) || 0}ms
        </span></div>
        <div>Min/Max: <span style={{ color: 'var(--color-text-secondary)' }}>
          {stats?.minLatency?.toFixed(1) || 0}ms / {stats?.maxLatency?.toFixed(1) || 0}ms
        </span></div>
        <div>Frame Rate: <span style={{ 
          color: metrics.frameRate >= 55 ? 'var(--color-success)' : 
                metrics.frameRate >= 30 ? 'var(--color-warning)' : 'var(--color-error)'
        }}>
          {metrics.frameRate}fps
        </span></div>
      </div>

      {/* DOM 操作統計 */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ color: 'var(--color-accent-purple)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          DOM Operations
        </div>
        <div>Updates: <span style={{ color: 'var(--color-text-secondary)' }}>
          {stats?.totalDomUpdates || 0}
        </span></div>
        <div>Registered: <span style={{ color: 'var(--color-text-secondary)' }}>
          {domState?.registeredElements || 0}
        </span></div>
        <div>Pending: <span style={{ color: 'var(--color-text-secondary)' }}>
          {domState?.pendingUpdates || 0}
        </span></div>
        <div>Animation: <span style={{ 
          color: domState?.animationFrameActive ? 'var(--color-success)' : 'var(--color-text-muted)'
        }}>
          {domState?.animationFrameActive ? 'Active' : 'Idle'}
        </span></div>
      </div>

      {/* メモリ使用量 */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ color: 'var(--color-accent-cyan)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Memory Usage
        </div>
        <div>Heap: <span style={{ 
          color: metrics.memoryUsage > 50 ? 'var(--color-warning)' : 'var(--color-success)'
        }}>
          {metrics.memoryUsage?.toFixed(1) || 0}MB
        </span></div>
      </div>

      {/* パフォーマンス評価 */}
      <div>
        <div style={{ color: 'var(--color-accent-neon)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Performance Grade
        </div>
        <div style={{ 
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          background: getPerformanceGrade(stats, metrics).color,
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {getPerformanceGrade(stats, metrics).grade}
        </div>
      </div>

      {/* ショートカットヒント */}
      <div style={{ 
        marginTop: '0.75rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--color-base-medium)',
        color: 'var(--color-text-muted)',
        fontSize: '0.65rem'
      }}>
        Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

/**
 * パフォーマンス評価計算
 */
function getPerformanceGrade(stats: any, metrics: any) {
  if (!stats || !metrics) {
    return { grade: 'N/A', color: 'var(--color-text-muted)' };
  }

  const avgLatency = stats.averageLatency || 0;
  const frameRate = metrics.frameRate || 0;
  const memoryUsage = metrics.memoryUsage || 0;

  // スコア計算（100点満点）
  let score = 100;
  
  // レイテンシー評価（最重要）
  if (avgLatency > 50) score -= 40;
  else if (avgLatency > 30) score -= 25;
  else if (avgLatency > 15) score -= 10;
  else if (avgLatency > 8) score -= 5;

  // フレームレート評価
  if (frameRate < 30) score -= 30;
  else if (frameRate < 45) score -= 15;
  else if (frameRate < 55) score -= 5;

  // メモリ使用量評価
  if (memoryUsage > 100) score -= 15;
  else if (memoryUsage > 50) score -= 5;

  // グレード決定
  if (score >= 90) return { grade: 'S+', color: 'var(--color-success)' };
  if (score >= 80) return { grade: 'S', color: 'var(--color-success)' };
  if (score >= 70) return { grade: 'A', color: 'var(--color-accent-cyan)' };
  if (score >= 60) return { grade: 'B', color: 'var(--color-accent-neon)' };
  if (score >= 50) return { grade: 'C', color: 'var(--color-warning)' };
  return { grade: 'D', color: 'var(--color-error)' };
}

export default PerformanceDebug;
