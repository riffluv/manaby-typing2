import React, { useRef, useEffect, useCallback } from 'react';
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
  element: HTMLSpanElement;
};

/**
 * typingmania-ref流 超高速DOM直接操作 タイピングエリア
 * 
 * React仮想DOMを完全にバイパスし、直接DOM操作で最高速レスポンスを実現
 * - 初回レンダリングのみReactで行い、以降は直接DOM更新
 * - キー入力から表示更新まで1ms以下を目指す
 */
const OptimizedTypingArea: React.FC<OptimizedTypingAreaProps> = ({
  currentKanaIndex,
  typingChars,
  kanaDisplay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flatCharsRef = useRef<FlatChar[]>([]);
  const lastKanaIndexRef = useRef(-1);
  const lastAcceptedLengthRef = useRef(-1);

  // typingmania-ref流: 初回DOM構築（Reactで1回のみ）
  const buildInitialDOM = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // 既存の要素をクリア
    container.innerHTML = '';
    flatCharsRef.current = [];

    // 直接DOM要素を作成
    typingChars.forEach((typingChar, kanaIndex) => {
      const displayInfo = typingChar.getDisplayInfo();
      const displayText = displayInfo.displayText;
      
      [...displayText].forEach((char, charIndex) => {
        const element = document.createElement('span');
        element.className = 'typing-char pending';
        element.textContent = char;
        element.setAttribute('data-kana-index', kanaIndex.toString());
        element.setAttribute('data-char-index', charIndex.toString());
        element.setAttribute('aria-label', `${char} (未入力)`);
        
        container.appendChild(element);
        
        flatCharsRef.current.push({
          char,
          kanaIndex,
          charIndex,
          element
        });
      });
    });

    // 初回状態設定
    updateCharStates(0, 0);
  }, [typingChars]);

  // typingmania-ref流: 超高速状態更新（DOM直接操作）
  const updateCharStates = useCallback((newKanaIndex: number, newAcceptedLength: number) => {
    const flatChars = flatCharsRef.current;
    
    // 前回から変更された範囲のみ更新（最適化）
    for (let i = 0; i < flatChars.length; i++) {
      const { kanaIndex, charIndex, element } = flatChars[i];
      
      let newState: string;
      let ariaLabel: string;
      
      if (kanaIndex < newKanaIndex) {
        newState = 'completed';
        ariaLabel = '入力済み';
      } else if (kanaIndex === newKanaIndex) {
        if (charIndex < newAcceptedLength) {
          newState = 'completed';
          ariaLabel = '入力済み';
        } else if (charIndex === newAcceptedLength) {
          newState = 'current';
          ariaLabel = '入力中';
        } else {
          newState = 'pending';
          ariaLabel = '未入力';
        }
      } else {
        newState = 'pending';
        ariaLabel = '未入力';
      }

      // クラス名変更（必要な場合のみ）
      const expectedClass = `typing-char ${newState}`;
      if (element.className !== expectedClass) {
        element.className = expectedClass;
      }

      // aria-label更新（必要な場合のみ）
      const expectedAriaLabel = `${flatChars[i].char} (${ariaLabel})`;
      if (element.getAttribute('aria-label') !== expectedAriaLabel) {
        element.setAttribute('aria-label', expectedAriaLabel);
      }

      // aria-current更新（必要な場合のみ）
      const shouldHaveCurrent = newState === 'current';
      const hasCurrent = element.hasAttribute('aria-current');
      if (shouldHaveCurrent && !hasCurrent) {
        element.setAttribute('aria-current', 'true');
      } else if (!shouldHaveCurrent && hasCurrent) {
        element.removeAttribute('aria-current');
      }
    }

    // 進捗更新
    const container = containerRef.current;
    if (container) {
      const progress = calculateProgress(typingChars, newKanaIndex);
      container.setAttribute('data-progress', progress.toString());
    }
  }, [typingChars]);

  // 初回DOM構築
  useEffect(() => {
    buildInitialDOM();
  }, [buildInitialDOM]);

  // プロップス変更時の高速更新
  useEffect(() => {
    const currentAcceptedLength = kanaDisplay.acceptedText.length;
    
    // 変更がある場合のみ更新
    if (currentKanaIndex !== lastKanaIndexRef.current || 
        currentAcceptedLength !== lastAcceptedLengthRef.current) {
      
      updateCharStates(currentKanaIndex, currentAcceptedLength);
      
      lastKanaIndexRef.current = currentKanaIndex;
      lastAcceptedLengthRef.current = currentAcceptedLength;
    }
  }, [currentKanaIndex, kanaDisplay.acceptedText.length, updateCharStates]);

  // Reactレンダリング（初回のみ、以降は直接DOM更新）
  return (
    <div
      ref={containerRef}
      className="typing-area"
      role="region"
      aria-label="タイピング入力欄"
      aria-live="polite"
      aria-atomic="false"
      style={{
        willChange: 'auto',
        contain: 'content'
      }}
    />
  );
};

export default OptimizedTypingArea;
