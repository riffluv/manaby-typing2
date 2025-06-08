import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useDirectTyping2, JapaneseConverter } from '@/typing';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 DirectTypingEngine2完全活用GameScreen - 原文+ローマ字版 ✨
 * - 上部: 原文表示（漢字入り）
 * - 下部: ローマ字一文字ずつフォーカス表示
 * - 最高速入力レスポンス + 美しい視覚効果
 */
const SimpleGameScreen: React.FC<SimpleGameScreenProps> = React.memo(({ 
  currentWord, 
  onWordComplete
}) => {  // DirectTypingEngine2用のTypingChar生成
  const typingChars = React.useMemo(() => {
    if (!currentWord.hiragana) return [];
    return JapaneseConverter.convertToTypingChars(currentWord.hiragana);
  }, [currentWord.hiragana]);

  const { containerRef } = useDirectTyping2({
    word: currentWord,
    typingChars,
    onWordComplete,
  });
  return (
    <div className={styles.gameScreen}>
      {/* DirectTypingEngine2による原文+ローマ字フォーカス表示エリア */}
      <div 
        ref={containerRef}
        className={styles.typingArea}
        aria-live="polite"
        aria-label="タイピングエリア"
      >
        {/* DirectTypingEngine2 が原文とローマ字フォーカスを表示 */}
      </div>
    </div>
  );
});

SimpleGameScreen.displayName = 'SimpleGameScreen';

export default SimpleGameScreen;
