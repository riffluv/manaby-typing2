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

  return (
    <>
      {typingChars.map((typingChar, kanaIndex) => {
        const displayText = displayChars[kanaIndex] || '';
        return (
          <span key={kanaIndex} className={styles.kanaGroup}>
            {displayText.split('').map((char, charIndex) => (
              <span key={`${kanaIndex}-${charIndex}`} className={getCharClass(kanaIndex, charIndex)}>
                {char}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
});
TypingArea.displayName = 'TypingArea';
export default TypingArea;
