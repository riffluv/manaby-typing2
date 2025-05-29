import React from 'react';
import TypingArea from './TypingArea';
import { TypingWord, KanaDisplay } from '@/types';
import PortalShortcut from './PortalShortcut';
import PerformanceDebug from './PerformanceDebug';
import styles from './GameScreen.module.css';

export type GameScreenProps = {
  currentWord: TypingWord;
  currentKanaIndex: number;
  currentKanaDisplay: KanaDisplay;
};

/**
 * MonkeyType + THE FINALS インスパイアード cyberpunk ゲーム画面（高速化版）
 * typingmania-ref流最適化:
 * - 不要なアニメーションを削除
 * - 直接的なDOM表現
 * - GPU加速レンダリング最適化
 */
const GameScreen: React.FC<GameScreenProps> = ({ currentWord, currentKanaIndex, currentKanaDisplay }) => {

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
        
        {/* ひらがな - サブ表示（シンプル化） */}
        <div 
          className="word-hiragana"
          aria-label="ひらがな"
          key={`hira-${currentWord.hiragana}`}
        >
          {currentWord.hiragana}
        </div>

        {/* ショートカット案内（ローマ字の直下・中央上部） */}
        <div style={{ margin: '0 auto', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <PortalShortcut shortcuts={[{ key: 'Esc', label: '戻る' }]} />
        </div>
        
        {/* タイピングエリア - メイン インタラクション（シンプル化） */}
        <div style={{ willChange: 'transform' }}>
          <TypingArea 
            currentKanaIndex={currentKanaIndex}
            typingChars={currentWord.typingChars}
            displayChars={currentWord.displayChars}
            kanaDisplay={currentKanaDisplay}
          />
        </div>

        {/* パフォーマンス監視（開発/デバッグ用） */}
        <PerformanceDebug enabled={process.env.NODE_ENV === 'development'} />
      </div>
    </div>
  );
};

GameScreen.displayName = 'GameScreen';
export default GameScreen;
