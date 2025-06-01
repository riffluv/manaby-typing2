import React from 'react';
import OptimizedTypingArea from './OptimizedTypingArea';
import { TypingWord, KanaDisplay, PerWordScoreLog } from '@/types';
import { createOptimizedTypingChars } from '@/utils/optimizedJapaneseUtils';
import PortalShortcut from '../PortalShortcut';
import styles from './GameScreen.module.css';

export type GameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
  onProgress?: (kanaIndex: number, display: KanaDisplay) => void;
  audioEnabled?: boolean;
};

/**
 * ⚡ 寿司打レベル ゲーム画面
 * 
 * UltraFastTypingEngineとの統合による超高速応答
 */
const GameScreen: React.FC<GameScreenProps> = ({ 
  currentWord, 
  onWordComplete, 
  onProgress,
  audioEnabled = true 
}) => {
  // ⚡ タイピング文字生成（最小限）
  const typingChars = React.useMemo(() => {
    return currentWord.hiragana ? createOptimizedTypingChars(currentWord.hiragana) : [];
  }, [currentWord.hiragana]);

  return (
    <div className={styles.gameScreenWrapper}>
      <div 
        className="game-screen"
        style={{ 
          willChange: 'transform',
          contain: 'content'
        }}
      >
        {/* 日本語単語 - メイン表示 */}
        <div 
          className="word-japanese"
          aria-label="日本語"
          key={`jp-${currentWord.japanese}`}
        >
          {currentWord.japanese}
        </div>
        
        {/* ひらがな - サブ表示 */}
        <div 
          className="word-hiragana"
          aria-label="ひらがな"
          key={`hira-${currentWord.hiragana}`}
        >
          {currentWord.hiragana}
        </div>

        {/* ⚡ 超高速タイピングエリア */}
        <OptimizedTypingArea
          typingChars={typingChars}
          onProgress={onProgress}
          onWordComplete={onWordComplete}
          audioEnabled={audioEnabled}
          style={{
            minHeight: '160px',
            fontSize: '1.8rem',
            letterSpacing: '0.08em',
          }}
        />

        {/* ショートカット表示 */}
        <PortalShortcut shortcuts={[{ key: 'Esc', label: '戻る' }]} />
      </div>
    </div>
  );
};

GameScreen.displayName = 'GameScreen';
export default GameScreen;
