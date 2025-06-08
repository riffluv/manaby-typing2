import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useDirectTyping2, JapaneseConverter } from '@/typing';
import { useSettingsStore } from '@/store/useSettingsStore';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 DirectTypingEngine2完全活用GameScreen - game.html完全デザイン再現版 ✨
 * - 1段目: 日本語原文表示（漢字入り）
 * - 2段目: ひらがな表示（設定で切り替え可能）
 * - 3段目: ローマ字表示（個別フォーカス機能付き）
 * - game.htmlの backdrop-filter & gradient 完全適用
 */
const SimpleGameScreen: React.FC<SimpleGameScreenProps> = React.memo(({ 
  currentWord, 
  onWordComplete
}) => {
  // 設定ストアからかな表示設定を取得
  const { showKanaDisplay } = useSettingsStore();

  // DirectTypingEngine2用のTypingChar生成
  const typingChars = React.useMemo(() => {
    if (!currentWord.hiragana) return [];
    return JapaneseConverter.convertToTypingChars(currentWord.hiragana);
  }, [currentWord.hiragana]);  // DirectTypingEngine2 設定 - showKanaDisplay を含む完全設定
  const directTypingConfig = React.useMemo(() => ({
    fontFamily: '"Cinzel", "Hiragino Kaku Gothic Pro", "Meiryo", serif',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    backgroundColor: 'transparent', // game.html の backdrop-filter を活用
    showKanaDisplay, // 設定ストアの値を直接渡す
  }), [showKanaDisplay]);

  const { containerRef } = useDirectTyping2({
    word: currentWord,
    typingChars,
    onWordComplete,
    config: directTypingConfig
  });
  return (
    <div className={styles.gameScreen}>
      <div className={styles.typingArea}>
        {/* DirectTypingEngine2による完全管理 - 原文、ひらがな、ローマ字の3段階表示 */}
        <div 
          ref={containerRef}
          className={styles.promptBox__roma}
          aria-live="polite"
          aria-label="タイピングエリア"
        >
          {/* DirectTypingEngine2 が設定に応じて以下を自動構築:
              - Kana Display OFF: 原文 + ローマ字
              - Kana Display ON:  原文 + ひらがな + ローマ字 */}
        </div>
      </div>
    </div>
  );
});

SimpleGameScreen.displayName = 'SimpleGameScreen';

export default SimpleGameScreen;
