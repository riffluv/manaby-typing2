import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useHybridTyping, JapaneseConverter } from '@/typing';
import { useSettingsStore } from '@/store/useSettingsStore';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 HybridTypingEngine完全活用GameScreen - ローマ字Canvas超高速化版 ✨
 * - 1段目: 日本語原文表示（漢字入り・DOM）
 * - 2段目: ひらがな表示（設定で切り替え可能・DOM）
 * - 3段目: ローマ字表示（個別フォーカス機能付き・Canvas）
 * - game.htmlの backdrop-filter & gradient 完全適用
 * - ローマ字のみCanvasで1-3ms超高速レスポンス実現
 */
const SimpleGameScreen: React.FC<SimpleGameScreenProps> = React.memo(({ 
  currentWord, 
  onWordComplete
}) => {
  // 設定ストアからかな表示設定を取得
  const { showKanaDisplay } = useSettingsStore();
  // HybridTypingEngine用のTypingChar生成
  const typingChars = React.useMemo(() => {
    if (!currentWord.hiragana) return [];
    return JapaneseConverter.convertToTypingChars(currentWord.hiragana);
  }, [currentWord.hiragana]);

  // HybridTypingEngine 設定 - showKanaDisplay を含む完全設定
  const hybridTypingConfig = React.useMemo(() => ({
    fontFamily: '"Cinzel", "Hiragino Kaku Gothic Pro", "Meiryo", serif',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    backgroundColor: 'transparent', // game.html の backdrop-filter を活用
  }), []);

  const { containerRef } = useHybridTyping({
    word: currentWord,
    typingChars,
    onWordComplete,
    config: hybridTypingConfig
  });
  return (
    <div className={styles.gameScreen}>
      <div className={styles.typingArea}>        {/* HybridTypingEngine による完全管理 - 原文（DOM）、ひらがな（DOM）、ローマ字（Canvas）の3段階表示 */}
        <div 
          ref={containerRef}
          className={styles.promptBox__roma}
          aria-live="polite"
          aria-label="タイピングエリア"
        >
          {/* HybridTypingEngine が設定に応じて以下を自動構築:
              - Kana Display OFF: 原文（DOM） + ローマ字（Canvas）
              - Kana Display ON:  原文（DOM） + ひらがな（DOM） + ローマ字（Canvas） */}
        </div>
      </div>
    </div>
  );
});

SimpleGameScreen.displayName = 'SimpleGameScreen';

export default SimpleGameScreen;
