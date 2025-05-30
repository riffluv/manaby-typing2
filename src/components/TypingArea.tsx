import React, { useEffect, useRef } from 'react';
import type { TypingChar } from '@/utils/japaneseUtils';
import type { KanaDisplay } from '@/types';
import { useDirectDOM } from '@/utils/DirectDOMManager';
import { usePerformanceMonitor } from '@/utils/PerformanceMonitor';

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
): 'pending' | 'current' | 'completed' {
  // 入力済みのかな: すべての文字が completed
  if (kanaIndex < currentKanaIndex) return 'completed';
  
  // 現在入力中のかな
  if (kanaIndex === currentKanaIndex) {
    // すでに受け入れられた文字
    if (charIndex < acceptedLength) return 'completed';
    // 次に入力すべき文字
    if (charIndex === acceptedLength) return 'current';
  }
  
  // 上記以外は未入力文字
  return 'pending';
}

/**
 * TypingArea: タイピングゲームの中核となるローマ字表示コンポーネント（超高速化版）
 * 
 * typingmania-ref流パフォーマンス最適化:
 * - 不要なメモ化を削除
 * - 直接的なDOM表現
 * - 直接DOM操作による超高速更新
 * - パフォーマンス監視統合
 * - アクセシビリティ対応
 * - 分離されたスタイルモジュールによるリファクタリング耐性
 */
const TypingArea: React.FC<TypingAreaProps> = ({
  currentKanaIndex,
  typingChars,
  displayChars,
  kanaDisplay
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefsRef = useRef<Map<string, HTMLSpanElement>>(new Map());
  const previousKanaIndexRef = useRef(currentKanaIndex);
  const previousAcceptedLengthRef = useRef(kanaDisplay.acceptedText.length);
  
  // 直接DOM操作とパフォーマンス監視
  const directDOM = useDirectDOM();
  const performanceMonitor = usePerformanceMonitor();

  // すべての文字を1次元配列にフラット化（高速化：useMemoを削除）
  const allChars: FlatChar[] = typingChars.flatMap((_, kanaIndex) => {
    const displayText = displayChars[kanaIndex] || '';
    return [...displayText].map((char, charIndex) => ({ char, kanaIndex, charIndex }));
  });

  // 現在の入力状態
  const acceptedLength = kanaDisplay.acceptedText.length;
  
  // ARIA属性用のコンテキスト情報（高速化：計算を簡素化）
  const currentKana = typingChars[currentKanaIndex]?.kana || '';
  const progress = Math.floor((currentKanaIndex / Math.max(1, typingChars.length)) * 100);

  // 初期化時の全文字状態設定
  useEffect(() => {
    // 少し遅延させてDOM要素の登録完了を待つ
    const timer = setTimeout(() => {
      allChars.forEach(({ kanaIndex, charIndex }) => {
        const initialState = getCharClass(kanaIndex, charIndex, currentKanaIndex, acceptedLength);
        directDOM.updateCharState(kanaIndex, charIndex, initialState, true);
      });
    }, 50);

    return () => clearTimeout(timer);
  }, []); // 初回のみ実行

  // 直接DOM更新による超高速レスポンス
  useEffect(() => {
    const perfStart = performanceMonitor.startInputMeasurement('state-update');
    
    // かなインデックスが変わった場合の処理
    if (previousKanaIndexRef.current !== currentKanaIndex) {
      // 前のかなの全文字を completed に更新
      if (previousKanaIndexRef.current < currentKanaIndex) {
        const prevDisplayText = displayChars[previousKanaIndexRef.current] || '';
        [...prevDisplayText].forEach((_, charIndex) => {
          directDOM.updateCharState(previousKanaIndexRef.current, charIndex, 'completed');
        });
      }
      
      previousKanaIndexRef.current = currentKanaIndex;
    }

    // 受け入れ文字数が変わった場合の処理
    if (previousAcceptedLengthRef.current !== acceptedLength) {
      const currentDisplayText = displayChars[currentKanaIndex] || '';
      
      // 受け入れられた文字を completed に更新
      [...currentDisplayText].forEach((_, charIndex) => {
        if (charIndex < acceptedLength) {
          directDOM.updateCharState(currentKanaIndex, charIndex, 'completed');
        } else if (charIndex === acceptedLength) {
          directDOM.updateCharState(currentKanaIndex, charIndex, 'current');
        } else {
          directDOM.updateCharState(currentKanaIndex, charIndex, 'pending');
        }
      });
      
      previousAcceptedLengthRef.current = acceptedLength;
    }

    // プログレス情報の直接更新
    directDOM.updateProgress(progress, currentKana);
    
    performanceMonitor.endRenderMeasurement('state-update', perfStart);
  }, [currentKanaIndex, acceptedLength, directDOM, performanceMonitor, displayChars, progress, currentKana]);

  // 文字要素参照のコールバック
  const setCharRef = (element: HTMLSpanElement | null, kanaIndex: number, charIndex: number) => {
    const key = `${kanaIndex}-${charIndex}`;
    
    if (element) {
      charRefsRef.current.set(key, element);
      directDOM.registerTypingChar(element, kanaIndex, charIndex);
      
      // 初期状態の設定（レンダリング直後に正しい状態クラスを適用）
      const initialState = getCharClass(kanaIndex, charIndex, currentKanaIndex, acceptedLength);
      
      // すべての状態クラスを一旦削除
      element.classList.remove('char-pending', 'char-current', 'char-completed');
      // 正しい状態クラスを追加
      element.classList.add(`char-${initialState}`);
      
      // デバッグ: 初期状態の確認
      const isCurrent = kanaIndex === currentKanaIndex && charIndex === acceptedLength;
      if (isCurrent) {
        console.log(`🎯 TypingArea: Setting up current char element ${key}`, {
          element,
          initialState,
          classList: Array.from(element.classList),
          computedStyle: window.getComputedStyle(element).backgroundColor
        });
      }
    } else {
      charRefsRef.current.delete(key);
      directDOM.unregisterTypingChar(kanaIndex, charIndex);
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      directDOM.clearAll();
    };
  }, [directDOM]);

  // 効率的なレンダリングとアクセシビリティを両立（直接DOM操作版）
  return (
    <div
      ref={containerRef}
      className="typing-area"
      role="region"
      aria-label="タイピング入力欄"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions text"
      aria-description={`進捗: ${progress}%`}
      data-current-kana={currentKana}
      data-progress={progress}
      style={{
        willChange: 'transform',
        contain: 'content'
      }}
    >
      {allChars.map(({ char, kanaIndex, charIndex }, idx) => {
        // 文字の現在の状態を判定（パフォーマンス最適化）
        const isCompleted = kanaIndex < currentKanaIndex || 
                          (kanaIndex === currentKanaIndex && charIndex < acceptedLength);
        const isCurrent = kanaIndex === currentKanaIndex && charIndex === acceptedLength;
        
        // 状態に基づいて適切なクラスを適用
        const stateClass = getCharClass(kanaIndex, charIndex, currentKanaIndex, acceptedLength);
        
        // 文字の状態を表す文字列（アクセシビリティ向上）
        const stateText = isCurrent ? '入力中' : isCompleted ? '入力済み' : '未入力';
        
        return (
          <span
            key={idx}
            ref={(el) => setCharRef(el, kanaIndex, charIndex)}
            className="typing-char" // 基本クラスのみ。状態クラスはDirectDOMManagerで動的適用
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`${char} (${stateText})`}
            data-state={isCurrent ? 'current' : isCompleted ? 'completed' : 'pending'}
            data-kana-index={kanaIndex}
            data-char-index={charIndex}
            data-char={char}
            style={{
              willChange: isCurrent ? 'transform, background-color' : undefined,
              transform: 'translateZ(0)' // GPU レイヤー促進
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

TypingArea.displayName = 'TypingArea';
export default TypingArea;
