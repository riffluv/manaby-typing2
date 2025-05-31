/**
 * 純粋タイピングエンジン用Reactラッパー
 * 
 * PureTypingEngineをReactコンポーネントから使用するための
 * 最小限のラッパーコンポーネント
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { PureTypingEngine, PureTypingEngineCallbacks } from '@/utils/PureTypingEngine';
import { TypingWord } from '@/types';

export interface PureTypingWrapperProps {
  currentWord: TypingWord;
  onKeyAccepted: (key: string, point: number) => void;
  onKeyRejected: (key: string) => void;
  onCharCompleted: (charIndex: number) => void;
  onWordCompleted: () => void;
  audioEnabled?: boolean;
}

/**
 * typingmania-ref流 純粋タイピングエンジンラッパー
 * 
 * ReactとPureTypingEngineの橋渡しを行う最小限のコンポーネント
 * DOM操作は完全にPureTypingEngineに委譲
 */
const PureTypingWrapper: React.FC<PureTypingWrapperProps> = ({
  currentWord,
  onKeyAccepted,
  onKeyRejected,
  onCharCompleted,
  onWordCompleted,
  audioEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PureTypingEngine | null>(null);

  // コールバック定義
  const callbacks: PureTypingEngineCallbacks = {
    onKeyAccepted,
    onKeyRejected,
    onCharCompleted,
    onWordCompleted,
    onDisplayUpdate: useCallback((display) => {
      // 必要に応じてReact側への通知
      // 現在は最小限の実装
    }, []),
  };

  // エンジン初期化
  useEffect(() => {
    if (!containerRef.current) return;

    // PureTypingEngine インスタンス作成
    const engine = new PureTypingEngine(callbacks);
    engine.setContainer(containerRef.current);
    engine.setAudioEnabled(audioEnabled);
    engineRef.current = engine;

    return () => {
      // クリーンアップ
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // 単語変更時の処理
  useEffect(() => {
    if (engineRef.current && currentWord.hiragana) {
      engineRef.current.setWord(currentWord.hiragana);
    }
  }, [currentWord.hiragana]);

  // 音声設定変更
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setAudioEnabled(audioEnabled);
    }
  }, [audioEnabled]);

  return (
    <div
      ref={containerRef}
      className="typing-area"
      role="region"
      aria-label="タイピング入力欄"
      style={{
        // typingmania-ref流: 最小限のスタイル
        willChange: 'auto',
        contain: 'content',
      }}
    />
  );
};

export default PureTypingWrapper;
