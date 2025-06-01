import React, { useState } from 'react';
import { TypingWord, KanaDisplay } from '@/types';
import PortalShortcut from './PortalShortcut';
import styles from './GameScreen.module.css';

export type GameScreenProps = {
  currentWord: TypingWord;
  currentKanaIndex: number;
  currentKanaDisplay: KanaDisplay;
};

/**
 * MonkeyType + THE FINALS インスパイアード cyberpunk ゲーム画面（高速化版）
 * typingmania-ref流最適化 + 40年ベテラン対応:
 * - 不要なアニメーションを削除
 * - 直接的なDOM表現
 * - GPU加速レンダリング最適化
 * - リアルタイムキー遅延解析システム搭載
 */
const GameScreen: React.FC<GameScreenProps> = ({ currentWord, currentKanaIndex, currentKanaDisplay }) => {
  const [latencyAlertCount, setLatencyAlertCount] = useState(0);

  // ベテラン向け遅延アラート処理
  const handleLatencyAlert = (latency: number) => {
    setLatencyAlertCount(prev => prev + 1);
    console.warn(`🚨 ベテラン感覚遅延アラート #${latencyAlertCount + 1}: ${latency.toFixed(3)}ms`);
  };

  return (
    <div className={styles.gameScreenWrapper}>
      <div 
        className="game-screen"
        style={{ 
          willChange: 'transform',
          contain: 'content'
        }}
      >
        {/* 日本語単語 - メイン表示（シンプル化） */}
        <div 
          className="word-japanese"
          aria-label="日本語"
          key={`jp-${currentWord.japanese}`}
        >
          {currentWord.japanese}
        </div>
        
        {/* ひらがな - サブ表示（UltraFastTypingEngineが直接DOM操作） */}
        <div 
          className="word-hiragana"
          aria-label="ひらがな"
          key={`hira-${currentWord.hiragana}`}
          style={{
            fontSize: '1.3rem',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '0.5rem',
            minHeight: '1.5em',
            letterSpacing: '0.08em',
            fontFamily: 'monospace',
            userSelect: 'none',
          }}
        >
          {/* UltraFastTypingEngineがtextContentを直接更新 */}
        </div>

        {/* ショートカット案内（ローマ字の直下・中央上部） */}
        <div style={{ margin: '0 auto', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <PortalShortcut shortcuts={[{ key: 'Esc', label: '戻る' }]} />
        </div>
        
        {/* ⚡ UltraFastTypingEngine専用コンテナ */}
        <div 
          className="typing-area"
          style={{ 
            willChange: 'transform',
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            letterSpacing: '0.1em',
            fontFamily: 'monospace'
          }}
        >
          {/* UltraFastTypingEngineがDOM直接操作でコンテンツを生成 */}
        </div>

        {/* ローマ字 - 進行表示（UltraFastTypingEngineが直接DOM操作） */}
        <div 
          className="romaji-display"
          aria-label="ローマ字"
          key={`romaji-${currentWord.romaji}`}
          style={{
            fontSize: '1.2rem',
            color: '#00e0ff',
            textAlign: 'center',
            marginBottom: '0.5rem',
            minHeight: '1.5em',
            letterSpacing: '0.08em',
            fontFamily: 'monospace',
            userSelect: 'none',
          }}
        >
          {/* UltraFastTypingEngineがtextContentを直接更新 */}
        </div>

        {/* 
        パフォーマンス監視（開発/デバッグ用） 
        <PerformanceDebug enabled={process.env.NODE_ENV === 'development'} />
        
        ベテラン向けキー遅延解析システム（Ctrl+Shift+L で切り替え） 
        <KeyLatencyAnalyzer 
          enabled={process.env.NODE_ENV === 'development'} 
          onLatencyAlert={handleLatencyAlert}
        />
        
        ベテラン向け最適化ガイド（Ctrl+Shift+V で切り替え） 
        <VeteranOptimizationGuide enabled={false} />
        */}
        
        {/* ベテラン遅延アラート表示 */}
        {latencyAlertCount > 0 && (
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 68, 68, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 9999,
            backdropFilter: 'blur(10px)',
            border: '1px solid #ff4444'
          }}>
            🚨 遅延アラート: {latencyAlertCount}回
          </div>
        )}
      </div>
    </div>
  );
};

GameScreen.displayName = 'GameScreen';
export default GameScreen;
