import React, { useMemo } from 'react';
import type { OptimizedTypingChar, TypingChar } from '@/utils/OptimizedTypingChar';
import type { KanaDisplay } from '@/types';
import { calculateProgress } from '@/utils/optimizedJapaneseUtils';

export type OptimizedTypingAreaProps = {
  currentKanaIndex: number;
  typingChars: TypingChar[];
  kanaDisplay: KanaDisplay;
};

// 1文字ごとの情報型
type FlatChar = {
  char: string;
  kanaIndex: number;
  charIndex: number;
};

/**
 * typingmania-ref流 シンプルなクラス名判定
 */
function getCharClass(
  kanaIndex: number,
  charIndex: number,
  currentKanaIndex: number,
  acceptedLength: number
): string {
  if (kanaIndex < currentKanaIndex) return 'completed';
  if (kanaIndex === currentKanaIndex) {
    if (charIndex < acceptedLength) return 'completed';
    if (charIndex === acceptedLength) return 'current';
  }
  return 'pending';
}

/**
 * OptimizedTypingArea: シンプル&高速タイピング表示
 * 
 * 重いアニメーションとDOM操作を削除し、React標準レンダリングのみを使用
 */
const OptimizedTypingArea: React.FC<OptimizedTypingAreaProps> = ({
  currentKanaIndex,
  typingChars,
  kanaDisplay,
}) => {
  // シンプルな文字配列作成
  const allChars = useMemo((): FlatChar[] => {
    const chars: FlatChar[] = [];
    
    typingChars.forEach((typingChar, kanaIndex) => {
      const displayInfo = typingChar.getDisplayInfo();
      const displayText = displayInfo.displayText;
      
      [...displayText].forEach((char, charIndex) => {
        chars.push({ char, kanaIndex, charIndex });
      });
    });
      return chars;
  }, [typingChars]);

  // 現在の入力状態
  const acceptedLength = kanaDisplay.acceptedText.length;
    // 進捗計算
  const progress = calculateProgress(typingChars, currentKanaIndex);

  return (
    <div
      className="typing-area"
      role="region"
      aria-label="タイピング入力欄"
      aria-live="polite"
      aria-atomic="false"
      data-progress={progress}
      style={{
        willChange: 'auto',
        contain: 'content'
      }}
    >
      {allChars.map(({ char, kanaIndex, charIndex }, idx) => {
        const isCompleted = kanaIndex < currentKanaIndex || 
                          (kanaIndex === currentKanaIndex && charIndex < acceptedLength);
        const isCurrent = kanaIndex === currentKanaIndex && charIndex === acceptedLength;
        
        const stateClass = getCharClass(kanaIndex, charIndex, currentKanaIndex, acceptedLength);
        const stateText = isCurrent ? '入力中' : isCompleted ? '入力済み' : '未入力';
        
        return (
          <span
            key={idx}
            className={`typing-char ${stateClass}`}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`${char} (${stateText})`}
            data-state={isCurrent ? 'current' : isCompleted ? 'completed' : 'pending'}
            data-kana-index={kanaIndex}
            data-char-index={charIndex}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default OptimizedTypingArea;
