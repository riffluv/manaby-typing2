import React, { memo, useMemo } from 'react';
import type { TypingChar } from '@/utils/japaneseUtils';
import type { KanaDisplay } from '@/types';

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
 * @param kanaIndex かな文字のインデックス
 * @param charIndex 文字のインデックス
 * @param currentKanaIndex 現在のかなインデックス
 * @param acceptedLength 現在受け入れられた文字数
 * @returns 適用するCSSクラス
 */
function getCharClass(
  kanaIndex: number,
  charIndex: number,
  currentKanaIndex: number,
  acceptedLength: number
): string {
  // 入力済みのかな: すべての文字が completed
  if (kanaIndex < currentKanaIndex) return 'char-completed';
  
  // 現在入力中のかな
  if (kanaIndex === currentKanaIndex) {
    // すでに受け入れられた文字
    if (charIndex < acceptedLength) return 'char-completed';
    // 次に入力すべき文字
    if (charIndex === acceptedLength) return 'char-current';
  }
  
  // 上記以外は未入力文字
  return 'char-pending';
}

/**
 * TypingArea: タイピングゲームの中核となるローマ字表示コンポーネント
 * 
 * 製品版用に最適化されたパフォーマンス重視の実装:
 * - メモ化による再レンダリング最小化
 * - アクセシビリティ対応
 * - データ属性を活用した状態管理
 * - 分離されたスタイルモジュールによるリファクタリング耐性
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

  // 現在の入力状態
  const acceptedLength = kanaDisplay.acceptedText.length;
  
  // ARIA属性用のコンテキスト情報
  const ariaContext = useMemo(() => {
    const currentKana = typingChars[currentKanaIndex]?.kana || '';
    const progress = Math.floor((currentKanaIndex / Math.max(1, typingChars.length)) * 100);
    return { currentKana, progress };
  }, [currentKanaIndex, typingChars]);

  // 効率的なレンダリングとアクセシビリティを両立
  return (
    <div
      className="typing-area"
      role="region"
      aria-label="タイピング入力欄"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions text"
      aria-description={`進捗: ${ariaContext.progress}%`}
      data-current-kana={ariaContext.currentKana}
      data-progress={ariaContext.progress}
    >
      {allChars.map(({ char, kanaIndex, charIndex }, idx) => {
        // 文字の現在の状態を判定（パフォーマンス最適化）
        const isCompleted = kanaIndex < currentKanaIndex || 
                          (kanaIndex === currentKanaIndex && charIndex < acceptedLength);
        const isCurrent = kanaIndex === currentKanaIndex && charIndex === acceptedLength;
        const isPending = !isCompleted && !isCurrent;
        
        // 状態に基づいて適切なクラスを適用
        const stateClass = getCharClass(kanaIndex, charIndex, currentKanaIndex, acceptedLength);
        
        // 文字の状態を表す文字列（アクセシビリティ向上）
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
            data-char={char}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
});
TypingArea.displayName = 'TypingArea';
export default TypingArea;
