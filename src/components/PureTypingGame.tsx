// PureTypingGame.tsx - typingmania-ref風純粋タイピングゲーム（最軽量版）
'use client';

import React, { useRef, useEffect, useState } from 'react';
import PureTypingProcessor from '../utils/PureTypingProcessor.js';

interface PureTypingGameProps {
  currentWord: any;
  onWordComplete?: () => void;
}

/**
 * typingmania-ref風の純粋なタイピングゲーム
 * 最小限のReact統合で高速レスポンスを実現
 */
const PureTypingGame: React.FC<PureTypingGameProps> = ({ 
  currentWord, 
  onWordComplete 
}) => {
  const processorRef = useRef<PureTypingProcessor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 表示用の状態（最小限）
  const [displayState, setDisplayState] = useState({
    currentKanaIndex: 0,
    acceptedText: '',
    remainingText: '',
    completed: false
  });

  // typingmania-ref風：プロセッサー初期化
  useEffect(() => {
    if (!processorRef.current) {
      processorRef.current = new PureTypingProcessor();
      
      // 更新コールバック設定
      processorRef.current.setUpdateCallback((state) => {
        setDisplayState(state);
        
        if (state.completed && onWordComplete) {
          onWordComplete();
        }
      });
    }
    
    return () => {
      if (processorRef.current) {
        processorRef.current.stopListening();
      }
    };
  }, [onWordComplete]);

  // 単語変更時の処理
  useEffect(() => {
    if (currentWord && processorRef.current) {
      processorRef.current.setWord(currentWord);
      processorRef.current.startListening();
      
      // 初期状態設定
      const initialState = processorRef.current.getCurrentState();
      setDisplayState(initialState);
    }
  }, [currentWord]);

  // typingmania-ref風：シンプルな文字表示
  const renderTypingText = () => {
    if (!currentWord) return null;

    return currentWord.kanaArray.map((kana: any, kanaIndex: number) => {
      const isCurrent = kanaIndex === displayState.currentKanaIndex;
      const isCompleted = kanaIndex < displayState.currentKanaIndex;
      
      let displayText = kana.patterns[0] || '';
      
      if (isCurrent) {
        // 現在入力中の文字：受け入れ済み部分 + 残り部分
        displayText = displayState.acceptedText + displayState.remainingText;
      }
      
      const chars = [...displayText];
      
      return (
        <span
          key={kanaIndex}
          className={`kana-group ${isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}`}
        >
          {chars.map((char, charIndex) => {
            let charClass = 'char';
            
            if (isCompleted) {
              charClass += ' completed';
            } else if (isCurrent) {
              if (charIndex < displayState.acceptedText.length) {
                charClass += ' accepted';
              } else {
                charClass += ' remaining';
              }
            }
            
            return (
              <span
                key={charIndex}
                className={charClass}
              >
                {char}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div 
      ref={containerRef}
      className="pure-typing-game"
      style={{
        fontFamily: 'monospace',
        fontSize: '24px',
        lineHeight: '1.5',
        padding: '20px',
        userSelect: 'none',
        outline: 'none'
      }}
      tabIndex={0}
    >
      <div className="typing-text">
        {renderTypingText()}
      </div>
      
      <div className="typing-info" style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        進捗: {displayState.currentKanaIndex} / {currentWord?.kanaArray?.length || 0}
      </div>

      <style jsx>{`
        .char {
          transition: none; /* typingmania-ref風：アニメーション無し */
        }
        
        .char.completed {
          color: #4CAF50;
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .char.accepted {
          color: #2196F3;
          background-color: rgba(33, 150, 243, 0.1);
        }
        
        .char.remaining {
          color: #666;
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .kana-group.current {
          outline: 2px solid #2196F3;
          outline-offset: 2px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default PureTypingGame;
