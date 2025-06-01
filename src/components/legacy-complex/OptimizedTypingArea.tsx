import React, { useRef, useEffect, useCallback } from 'react';
import type { OptimizedTypingChar, TypingChar } from '@/utils/OptimizedTypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import { calculateProgress } from '@/utils/optimizedJapaneseUtils';

export type OptimizedTypingAreaProps = {
  typingChars: OptimizedTypingChar[];
  onProgress?: (kanaIndex: number, display: KanaDisplay) => void;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
  audioEnabled: boolean;
  style?: React.CSSProperties;
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
  typingChars,
  onProgress,
  onWordComplete,
  audioEnabled,
  style,
}) => {  const containerRef = useRef<HTMLDivElement>(null);
  const flatCharsRef = useRef<FlatChar[]>([]);
  const lastUpdateRef = useRef({ kanaIndex: -1, acceptedLength: -1 });

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
        element.className = 'typing-char';
        element.textContent = char;
        element.style.color = '#6b7280'; // PENDING
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
    updateDisplay();
  }, [typingChars]);

  // typingmania-ref流: 超高速状態更新（DOM直接操作）
  const updateDisplay = useCallback(() => {
    // 現在の状態を計算
    let currentKanaIndex = 0;
    let currentAcceptedLength = 0;
    
    // 最新の状態を各typingCharから取得
    for (let i = 0; i < typingChars.length; i++) {
      const displayInfo = typingChars[i].getDisplayInfo();
      if (displayInfo.acceptedText.length > 0) {
        currentKanaIndex = i;
        currentAcceptedLength = displayInfo.acceptedText.length;
      } else if (displayInfo.acceptedText.length === 0 && i === currentKanaIndex) {
        break;
      }
    }

    // 変更チェック（最適化）
    const lastUpdate = lastUpdateRef.current;
    if (currentKanaIndex === lastUpdate.kanaIndex && 
        currentAcceptedLength === lastUpdate.acceptedLength) {
      return; // 変更なし
    }

    const flatChars = flatCharsRef.current;
    
    // 色の定数
    const COLORS = {
      PENDING: '#6b7280',
      CURRENT: '#000000', 
      COMPLETED: '#10b981',
      ERROR: '#ef4444'
    };
    
    // 全文字の状態を更新
    for (let i = 0; i < flatChars.length; i++) {
      const { kanaIndex, charIndex, element } = flatChars[i];
      
      let color: string;
      let ariaLabel: string;
      
      if (kanaIndex < currentKanaIndex) {
        color = COLORS.COMPLETED;
        ariaLabel = '入力済み';
      } else if (kanaIndex === currentKanaIndex) {
        if (charIndex < currentAcceptedLength) {
          color = COLORS.COMPLETED;
          ariaLabel = '入力済み';
        } else if (charIndex === currentAcceptedLength) {
          color = COLORS.CURRENT;
          ariaLabel = '入力中';
        } else {
          color = COLORS.PENDING;
          ariaLabel = '未入力';
        }
      } else {
        color = COLORS.PENDING;
        ariaLabel = '未入力';
      }

      // 直接色変更（最高速）
      if (element.style.color !== color) {
        element.style.color = color;
      }

      // aria-label更新
      const expectedAriaLabel = `${flatChars[i].char} (${ariaLabel})`;
      if (element.getAttribute('aria-label') !== expectedAriaLabel) {
        element.setAttribute('aria-label', expectedAriaLabel);
      }

      // aria-current更新
      const shouldHaveCurrent = color === COLORS.CURRENT;
      const hasCurrent = element.hasAttribute('aria-current');
      if (shouldHaveCurrent && !hasCurrent) {
        element.setAttribute('aria-current', 'true');
      } else if (!shouldHaveCurrent && hasCurrent) {
        element.removeAttribute('aria-current');
      }
    }

    // 進捗コールバック
    if (onProgress && typingChars[currentKanaIndex]) {
      const kanaDisplay = typingChars[currentKanaIndex].getDisplayInfo();
      onProgress(currentKanaIndex, kanaDisplay);
    }

    // 更新記録
    lastUpdateRef.current = { kanaIndex: currentKanaIndex, acceptedLength: currentAcceptedLength };
  }, [typingChars, onProgress]);

  // 初回DOM構築
  useEffect(() => {
    buildInitialDOM();
  }, [buildInitialDOM]);

  // プロップス変更時の更新監視
  useEffect(() => {
    const interval = setInterval(updateDisplay, 16); // 60fps
    return () => clearInterval(interval);
  }, [updateDisplay]);

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
        contain: 'content',
        ...style
      }}
    />
  );
};

export default OptimizedTypingArea;
