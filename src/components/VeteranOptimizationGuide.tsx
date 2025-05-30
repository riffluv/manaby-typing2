// このファイルは不要になりました。安全に削除できます。

/**
 * ベテランタイピングプレイヤー向け最適化ガイド
 * 40年の経験者が感じる微細な遅延を解決するための包括的ガイド
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useHardwareKeyOptimizer } from '@/utils/HardwareKeyOptimizer';

interface VeteranOptimizationGuideProps {
  enabled?: boolean;
}

export const VeteranOptimizationGuide: React.FC<VeteranOptimizationGuideProps> = ({ 
  enabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(enabled);
  const [currentOS, setCurrentOS] = useState<string>('');
  const [osOptimizationTips, setOsOptimizationTips] = useState<string[]>([]);
  
  const hardwareOptimizer = useHardwareKeyOptimizer();
  // OS検出とOS固有の最適化取得
  useEffect(() => {
    const userAgent = navigator.userAgent;
    let detectedOS = '';
    
    if (userAgent.includes('Windows')) {
      detectedOS = 'Windows';
    } else if (userAgent.includes('Mac')) {
      detectedOS = 'macOS';
    } else if (userAgent.includes('Linux')) {
      detectedOS = 'Linux';
    } else {
      detectedOS = 'Unknown';
    }
    
    setCurrentOS(detectedOS);
    
    // OS最適化ヒントを直接設定（依存関係による無限ループを回避）
    if (hardwareOptimizer) {
      setOsOptimizationTips(hardwareOptimizer.getOSOptimizationTips());
    }
  }, []); // 依存配列を空にして初回のみ実行

  // キーボードショートカット（Ctrl+Shift+V）でガイド表示切り替え
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10000,
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(25, 25, 50, 0.95))',
      border: '2px solid #00ffff',
      borderRadius: '15px',
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto',
      backdropFilter: 'blur(15px)',
      boxShadow: '0 20px 40px rgba(0, 255, 255, 0.3)'
    }}>
      {/* ヘッダー */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #00ffff'
      }}>
        <h2 style={{ 
          color: '#00ffff', 
          margin: 0, 
          fontSize: '18px',
          textShadow: '0 0 10px #00ffff'
        }}>
          🎯 ベテラン級タイピング最適化ガイド
        </h2>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: '#ff4444',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          ✕ 閉じる
        </button>
      </div>

      {/* 検出情報 */}
      <div style={{ 
        background: 'rgba(0, 255, 255, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '1px solid #00ffff'
      }}>
        <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '5px' }}>
          📊 システム情報
        </div>
        <div>OS: <span style={{ color: '#ffff00' }}>{currentOS}</span></div>
        <div>ブラウザ: <span style={{ color: '#ffff00' }}>{navigator.userAgent.split(' ')[0]}</span></div>
        <div>ハードウェア最適化: <span style={{ color: '#00ff00' }}>有効</span></div>
      </div>

      {/* OS固有最適化 */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: '#ffcc00', fontSize: '15px', marginBottom: '8px' }}>
          🔧 {currentOS} 固有最適化
        </h3>
        <div style={{ 
          background: 'rgba(255, 204, 0, 0.1)',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ffcc00'
        }}>
          {osOptimizationTips.map((tip, index) => (
            <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* ハードウェア推奨 */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: '#ff6600', fontSize: '15px', marginBottom: '8px' }}>
          ⚡ ハードウェア推奨事項
        </h3>
        <div style={{ 
          background: 'rgba(255, 102, 0, 0.1)',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ff6600'
        }}>
          <div style={{ marginBottom: '5px' }}>🎮 ゲーミングキーボード（1000Hz ポーリングレート）</div>
          <div style={{ marginBottom: '5px' }}>⚡ メカニカルスイッチ（リニア推奨）</div>
          <div style={{ marginBottom: '5px' }}>🔌 USB 直接接続（ハブ経由NG）</div>
          <div style={{ marginBottom: '5px' }}>🖥️ 144Hz以上のモニター</div>
          <div style={{ marginBottom: '5px' }}>💻 ゲーミングモード有効化</div>
        </div>
      </div>

      {/* ソフトウェア最適化 */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: '#9966ff', fontSize: '15px', marginBottom: '8px' }}>
          💻 ソフトウェア最適化
        </h3>
        <div style={{ 
          background: 'rgba(153, 102, 255, 0.1)',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #9966ff'
        }}>
          <div style={{ marginBottom: '5px' }}>🔥 ブラウザをゲームモードで起動</div>
          <div style={{ marginBottom: '5px' }}>📊 他のタブ・アプリを閉じる</div>
          <div style={{ marginBottom: '5px' }}>🛡️ アンチウイルスのリアルタイム保護一時無効</div>
          <div style={{ marginBottom: '5px' }}>⚡ Windows ゲームモード有効化</div>
          <div style={{ marginBottom: '5px' }}>🎯 V-Sync 無効化</div>
        </div>
      </div>

      {/* 測定値の解釈 */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: '#00ff99', fontSize: '15px', marginBottom: '8px' }}>
          📈 遅延値の評価基準
        </h3>
        <div style={{ 
          background: 'rgba(0, 255, 153, 0.1)',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #00ff99'
        }}>
          <div style={{ color: '#00ff00', marginBottom: '3px' }}>🎯 0-3ms: プロ競技レベル</div>
          <div style={{ color: '#00ccff', marginBottom: '3px' }}>✅ 3-8ms: ベテラン納得レベル</div>
          <div style={{ color: '#ffcc00', marginBottom: '3px' }}>⚠️ 8-15ms: 上級者レベル</div>
          <div style={{ color: '#ff9900', marginBottom: '3px' }}>🔧 15-30ms: 改善推奨</div>
          <div style={{ color: '#ff4444', marginBottom: '3px' }}>🚨 30ms+: 大幅最適化必要</div>
        </div>
      </div>

      {/* typingmania-ref流テクニック */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: '#ff0099', fontSize: '15px', marginBottom: '8px' }}>
          🏆 typingmania-ref流 秘訣
        </h3>
        <div style={{ 
          background: 'rgba(255, 0, 153, 0.1)',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ff0099'
        }}>
          <div style={{ marginBottom: '5px' }}>🎵 キー音で体感遅延をチェック</div>
          <div style={{ marginBottom: '5px' }}>👁️ 視線は常に次の文字へ</div>
          <div style={{ marginBottom: '5px' }}>⚡ 指の重心を浮かせてキープ</div>
          <div style={{ marginBottom: '5px' }}>🎯 リズムキープで遅延を最小化</div>
          <div style={{ marginBottom: '5px' }}>🔄 定期的に設定を見直し</div>
        </div>
      </div>

      {/* フッター */}
      <div style={{ 
        textAlign: 'center',
        paddingTop: '10px',
        borderTop: '1px solid #444',
        color: '#888',
        fontSize: '11px'
      }}>
        <div>Ctrl+Shift+V: ガイド切り替え</div>
        <div>Ctrl+Shift+L: 遅延解析切り替え</div>
        <div style={{ marginTop: '5px', color: '#00ffff' }}>
          typingmania-ref流 40年ベテラン対応システム
        </div>
      </div>
    </div>
  );
};

export default VeteranOptimizationGuide;
