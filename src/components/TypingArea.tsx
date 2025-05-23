import React, { memo, useCallback } from 'react';
import styles from '@/styles/TypingGame.module.css';
import { TypingChar } from '@/utils/japaneseUtils';
import { KanaDisplay } from '@/types/typing';

export type TypingAreaProps = {
  currentKanaIndex: number;
  typingChars: TypingChar[];
  displayChars: string[];
  kanaDisplay: KanaDisplay;
};

const TypingArea: React.FC<TypingAreaProps> = memo(({ 
  currentKanaIndex,
  typingChars, 
  displayChars, 
  kanaDisplay
}) => {
  const getCharClass = useCallback((kanaIndex: number, charIndex: number) => {
    if (kanaIndex < currentKanaIndex) {
      return styles.completed;
    } else if (kanaIndex === currentKanaIndex) {
      const acceptedLength = kanaDisplay.acceptedText.length;
      if (charIndex < acceptedLength) {
        return styles.completed;
      } else if (charIndex === acceptedLength) {
        return styles.current;
      }
    }
    return styles.pending;
  }, [currentKanaIndex, kanaDisplay.acceptedText.length]);

  // すべての文字を1つの配列にフラット化
  const allChars = typingChars.map((typingChar, kanaIndex) => {
    const displayText = displayChars[kanaIndex] || '';
    return displayText.split('').map((char, charIndex) => ({
      char,
      kanaIndex,
      charIndex
    }));
  }).flat();

  return (
    <div className={styles.typingArea}>
      {allChars.map((item, index) => (
        <span 
          key={index} 
          className={`${styles.typingChar} ${getCharClass(item.kanaIndex, item.charIndex)}`}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
});
TypingArea.displayName = 'TypingArea';
export default TypingArea;
