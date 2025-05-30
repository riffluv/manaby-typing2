import React, { useEffect, useRef, useMemo } from 'react';
import type { OptimizedTypingChar, TypingChar } from '@/utils/OptimizedTypingChar';
import type { KanaDisplay } from '@/types';
import { simpleDOM } from '@/utils/SimpleDOM';
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
 * OptimizedTypingArea: typingmania-ref流 シンプル高速タイピング表示
 * 
 * 複雑な最適化を削除し、シンプルで効率的な表示を実現
 */
const OptimizedTypingArea: React.FC<OptimizedTypingAreaProps> = ({
  currentKanaIndex,
  typingChars,
  kanaDisplay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousKanaIndexRef = useRef(currentKanaIndex);
  const previousAcceptedLengthRef = useRef(0);

  // typingmania-ref流：シンプルな文字配列作成
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

  // DOM要素の初期化
  useEffect(() => {
    if (containerRef.current) {
      simpleDOM.setContainer(containerRef.current);
    }
  }, []);

  // 現在の入力状態
  const acceptedLength = kanaDisplay.acceptedText.length;
  
  // 進捗計算
  const progress = calculateProgress(typingChars, currentKanaIndex);

  // typingmania-ref流：最小限の状態更新
  useEffect(() => {
    // かなインデックスが変わった場合
    if (previousKanaIndexRef.current !== currentKanaIndex) {
      // 前のかなの全文字を completed に更新
      if (previousKanaIndexRef.current < currentKanaIndex && previousKanaIndexRef.current >= 0) {
        const prevTypingChar = typingChars[previousKanaIndexRef.current];
        if (prevTypingChar) {
          const prevDisplayText = prevTypingChar.getDisplayInfo().displayText;
          [...prevDisplayText].forEach((_, charIndex) => {
            simpleDOM.updateCharState(previousKanaIndexRef.current, charIndex, 'completed');
          });
        }
      }
      
      previousKanaIndexRef.current = currentKanaIndex;
    }

    // 受け入れ文字数が変わった場合
    if (previousAcceptedLengthRef.current !== acceptedLength) {
      const currentTypingChar = typingChars[currentKanaIndex];
      if (currentTypingChar) {
        const currentDisplayText = currentTypingChar.getDisplayInfo().displayText;
        
        [...currentDisplayText].forEach((_, charIndex) => {
          const state = getCharClass(currentKanaIndex, charIndex, currentKanaIndex, acceptedLength);
          simpleDOM.updateCharState(currentKanaIndex, charIndex, state as any);
        });
      }
      
      previousAcceptedLengthRef.current = acceptedLength;
    }

    // 進捗更新
    simpleDOM.updateProgress(progress);
  }, [currentKanaIndex, acceptedLength, typingChars, progress]);

  // typingmania-ref流：シンプルなレンダリング
  return (
    <div
      ref={containerRef}
      className="typing-area"
      role="region"
      aria-label="タイピング入力欄"
      aria-live="polite"
      aria-atomic="false"
      data-progress={progress}
      style={{
        willChange: 'transform',
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
