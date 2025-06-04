/**
 * StandaloneTypingGame.tsx
 * SPA遷移システムから完全独立したタイピングゲーム
 * 
 * 目的:
 * - AppRouter/TransitionManagerから分離
 * - シンプルな開始/停止制御のみ
 * - typingmania-refのシンプルさに近づける第一歩
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TypingWord, PerWordScoreLog, KanaDisplay } from '@/types';
import { useCurrentWord } from '@/store/typingGameStore';
import { createBasicTypingChars } from '@/utils/basicJapaneseUtils';
import { getRomajiString } from '@/utils/japaneseUtils';
import { BasicTypingEngine } from '@/utils/BasicTypingEngine';
import styles from '@/styles/components/StandaloneTypingGame.module.css';

export type StandaloneTypingGameProps = {
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
  onExit?: () => void;
};

/**
 * 独立したタイピングゲームコンポーネント
 * - SPA遷移に依存しない
 * - 最小限の状態管理
 * - デバッグログなし（クリーンな実装）
 */
const StandaloneTypingGame: React.FC<StandaloneTypingGameProps> = ({ 
  onWordComplete, 
  onExit 
}) => {
  const currentWord = useCurrentWord();
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BasicTypingEngine | null>(null);
  
  // UI状態（最小限）
  const [romajiDisplay, setRomajiDisplay] = useState({ accepted: '', remaining: '' });
  const [isInitialized, setIsInitialized] = useState(false);

  // タイピングエンジンの初期化
  const initializeEngine = useCallback((word: TypingWord) => {
    if (!containerRef.current) return;

    // 前のエンジンをクリーンアップ
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    // BasicTypingCharを生成
    const typingChars = createBasicTypingChars(word.hiragana);
    const romajiString = getRomajiString(word.hiragana);

    // 初期表示を設定
    setRomajiDisplay({
      accepted: '',
      remaining: romajiString
    });    // エンジンを初期化
    try {
      engineRef.current = new BasicTypingEngine();
      
      if (containerRef.current) {
        engineRef.current.initialize(
          containerRef.current,
          typingChars,
          (index: number, display: KanaDisplay) => {
            // 進捗に基づいてローマ字表示を更新
            const currentKanaIndex = index;
            const currentAcceptedText = display.acceptedText || '';
            
            let totalAcceptedLength = 0;
            
            // 完了した文字までの長さを計算
            for (let i = 0; i < currentKanaIndex; i++) {
              totalAcceptedLength += typingChars[i]?.patterns[0]?.length || 0;
            }
            
            // 現在の文字の進行分を追加
            totalAcceptedLength += currentAcceptedText.length;

            setRomajiDisplay({
              accepted: romajiString.slice(0, totalAcceptedLength),
              remaining: romajiString.slice(totalAcceptedLength)
            });
          },
          (scoreLog: PerWordScoreLog) => {
            // 単語完了時
            onWordComplete?.(scoreLog);
          }
        );
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('タイピングエンジンの初期化に失敗:', error);
    }
  }, [onWordComplete]);

  // 単語変更時の処理
  useEffect(() => {
    if (currentWord?.hiragana) {
      initializeEngine(currentWord);
    }
    
    return () => {
      // コンポーネントアンマウント時のクリーンアップ
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [currentWord?.hiragana, initializeEngine]);

  // キーボードイベント（ESCで終了）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // 単語が設定されていない場合
  if (!currentWord?.japanese) {
    return (
      <div className="standalone-typing-game">
        <div className="loading-state">
          <p>単語を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="standalone-typing-game">
      <div className="typing-content">
        {/* 日本語単語表示 */}
        <div className="japanese-text">
          <h2>{currentWord.japanese}</h2>
        </div>

        {/* ローマ字表示（ハイライト機能付き） */}
        <div className="romaji-display">
          <span className="accepted">{romajiDisplay.accepted}</span>
          {romajiDisplay.remaining && (
            <>
              <span className="current">{romajiDisplay.remaining[0]}</span>
              <span className="remaining">{romajiDisplay.remaining.slice(1)}</span>
            </>
          )}
        </div>        {/* タイピングエリア（エンジンが制御） */}
        <div 
          ref={containerRef}
          className={styles.typingArea}
        />

        {/* 操作ガイド */}
        <div className="controls-guide">
          <p><kbd>ESC</kbd> : 終了</p>
        </div>
      </div>

      <style jsx>{`
        .standalone-typing-game {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          background: #f5f5f5;
        }

        .typing-content {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          width: 100%;
        }

        .japanese-text {
          text-align: center;
          margin-bottom: 2rem;
        }

        .japanese-text h2 {
          font-size: 2.5rem;
          color: #333;
          margin: 0;
        }

        .romaji-display {
          text-align: center;
          font-size: 1.8rem;
          font-family: monospace;
          margin-bottom: 2rem;
          min-height: 3rem;
        }

        .accepted {
          color: #28a745;
          background: rgba(40, 167, 69, 0.1);
        }

        .current {
          color: #007bff;
          background: rgba(0, 123, 255, 0.2);
          animation: blink 1s infinite;
        }

        .remaining {
          color: #666;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        .controls-guide {
          text-align: center;
          margin-top: 1rem;
          color: #666;
        }

        .controls-guide kbd {
          background: #f1f1f1;
          border: 1px solid #ccc;
          border-radius: 3px;
          padding: 2px 6px;
          font-family: monospace;
        }

        .loading-state {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default StandaloneTypingGame;
