import React, { memo, useMemo } from 'react';
// 分離したスタイルシートを使用
import styles from '@/styles/TypingCharacters.module.css';
import type { TypingChar } from '@/utils/japaneseUtils';
import type { KanaDisplay } from '@/types/typing';

export type TypingAreaProps = {
  currentKanaIndex: number;
  typingChars: TypingChar[];
  displayChars: string[];
  kanaDisplay: KanaDisplay;
};

// 1文字ごとの情報型
type FlatChar = {
  char: string;
  kanaIndex: number;
  charIndex: number;
};

/**
 * 文字の状態に応じたクラス名を返す
 */
function getCharClass(
  kanaIndex: number,
  charIndex: number,
  currentKanaIndex: number,
  acceptedLength: number
): string {
  if (kanaIndex < currentKanaIndex) return styles.completed;
  if (kanaIndex === currentKanaIndex) {
    if (charIndex < acceptedLength) return styles.completed;
    if (charIndex === acceptedLength) return styles.current;
  }
  return styles.pending;
}

/**
 * TypingArea: タイピング中のローマ字を1文字ずつ表示
 * - 分離したスタイル(TypingCharacters.module.css)を使用し、リファクタリングの影響を受けないように設計
 * - スタイルは固定され、TypingCharacters.module.cssで完全に定義されています
 */
const TypingArea: React.FC<TypingAreaProps> = memo(({
  currentKanaIndex,
  typingChars,
  displayChars,
  kanaDisplay
}) => {
  // すべての文字を1次元配列にフラット化（useMemoでパフォーマンス最適化）
  const allChars: FlatChar[] = useMemo(() =>
    typingChars.flatMap((_, kanaIndex) => {
      const displayText = displayChars[kanaIndex] || '';
      return [...displayText].map((char, charIndex) => ({ char, kanaIndex, charIndex }));
    }),
    [typingChars, displayChars]
  );

  const acceptedLength = kanaDisplay.acceptedText.length;

  return (
    <div
      className={styles.typingArea}
      role="region"
      aria-label="タイピング入力欄"
    >
      {allChars.map(({ char, kanaIndex, charIndex }, idx) => (
        <span
          key={idx}
          className={
            styles.typingChar + ' ' +
            getCharClass(kanaIndex, charIndex, currentKanaIndex, acceptedLength)
          }
          aria-current={
            kanaIndex === currentKanaIndex && charIndex === acceptedLength ? 'true' : undefined
          }
          data-typed={kanaIndex < currentKanaIndex || (kanaIndex === currentKanaIndex && charIndex < acceptedLength)}
          data-active={kanaIndex === currentKanaIndex && charIndex === acceptedLength}
        >
          {char}
        </span>
      ))}
    </div>
  );
});
TypingArea.displayName = 'TypingArea';
export default TypingArea;
