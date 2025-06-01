import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import PortalShortcut from './PortalShortcut';
import { useSimpleTyping } from '@/hooks/useSimpleTyping';
import { createBasicTypingChars } from '@/utils/basicJapaneseUtils';
import { getRomajiString } from '@/utils/japaneseUtils';
import '@/styles/typing-animations.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * typingmania-ref流シンプルGameScreen - BasicTypingChar対応版
 * - BasicTypingChar配列を正しく処理
 * - 複数入力パターン（ji/zi）をサポート
 * - シンプルで高速なレスポンス
 */
const SimpleGameScreen: React.FC<SimpleGameScreenProps> = ({ 
  currentWord, 
  onWordComplete 
}) => {  
  // ひらがなからBasicTypingChar配列を生成
  const typingChars = React.useMemo(() => {
    return currentWord.hiragana ? createBasicTypingChars(currentWord.hiragana) : [];
  }, [currentWord.hiragana]);

  // ローマ字文字列を生成（wanakanaの代替）
  const romajiString = React.useMemo(() => {
    return currentWord.hiragana ? getRomajiString(currentWord.hiragana) : '';
  }, [currentWord.hiragana]);

  const { containerRef, currentCharIndex, kanaDisplay } = useSimpleTyping({
    word: currentWord,
    typingChars,
    onWordComplete,
  });
  // ローマ字のハイライト表示のためのメモ
  const romajiDisplay = React.useMemo(() => {
    if (!kanaDisplay || !romajiString) {
      return { accepted: '', remaining: romajiString || '' };
    }
    
    // 現在の文字のインデックスベースで進捗を計算
    const currentCharProgress = currentCharIndex;
    const totalChars = typingChars.length;
    
    if (totalChars === 0) {
      return { accepted: '', remaining: romajiString };
    }
    
    // 文字レベルでの進捗比率を計算
    const progressRatio = currentCharProgress / totalChars;
    
    // ローマ字での進捗位置を計算（より細かく）
    let romajiProgress = Math.floor(progressRatio * romajiString.length);
    
    // 現在の文字内での進捗も考慮
    if (kanaDisplay.acceptedText && currentCharProgress < totalChars) {
      const currentCharTotal = kanaDisplay.acceptedText.length + kanaDisplay.remainingText.length;
      const currentCharAccepted = kanaDisplay.acceptedText.length;
      
      if (currentCharTotal > 0) {
        const charProgressRatio = currentCharAccepted / currentCharTotal;
        const nextCharStart = Math.floor(((currentCharProgress + 1) / totalChars) * romajiString.length);
        const currentCharStart = Math.floor((currentCharProgress / totalChars) * romajiString.length);
        const charRomajiLength = nextCharStart - currentCharStart;
        
        romajiProgress = currentCharStart + Math.floor(charProgressRatio * charRomajiLength);
      }
    }
    
    return {
      accepted: romajiString.slice(0, romajiProgress),
      remaining: romajiString.slice(romajiProgress)
    };
  }, [kanaDisplay, romajiString, currentCharIndex, typingChars.length]);  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem',
      gap: '1rem'
    }}>
        {/* 日本語単語表示 */}
      <div 
        className="japanese-display slide-in"
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '800',
          marginBottom: '1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {currentWord.japanese}
      </div>

      {/* ひらがな表示 */}
      <div 
        className="hiragana-display slide-in"
        style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#cbd5e1',
          letterSpacing: '0.5rem',
          fontWeight: '500',
          animationDelay: '0.1s'
        }}
      >
        {currentWord.hiragana}
      </div>      {/* ローマ字表示エリア（ハイライト機能付き） */}
      <div 
        className="romaji-display slide-in"
        style={{
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          marginBottom: '2.5rem',
          textAlign: 'center',
          letterSpacing: '0.3rem',
          fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '1.5rem 2.5rem',
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          minHeight: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          animationDelay: '0.2s'
        }}
      >
        <span style={{ 
          color: '#10b981',
          textShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
          fontWeight: '600'
        }}>
          {romajiDisplay.accepted}
        </span>
        <span style={{ 
          color: '#64748b',
          position: 'relative'
        }}>
          {romajiDisplay.remaining}
          {romajiDisplay.remaining && (
            <span 
              className="typing-cursor"
              style={{
                position: 'absolute',
                left: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '2px',
                height: '1.5em',
                background: '#3b82f6',
                borderRadius: '1px',
                boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)'
              }} 
            />
          )}
        </span>
      </div>

      {/* ショートカット案内 */}
      <div style={{ marginBottom: '2rem' }}>
        <PortalShortcut shortcuts={[{ key: 'Esc', label: 'メニューに戻る' }]} />
      </div>      {/* タイピングエリア - BasicTypingEngineが制御 */}
      <div 
        ref={containerRef}
        className="typing-area slide-in"
        style={{
          minHeight: '5rem',
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace',
          textAlign: 'center',
          letterSpacing: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          background: 'rgba(6, 78, 59, 0.2)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          maxWidth: '90vw',
          wordBreak: 'break-all',
          animationDelay: '0.3s'
        }}
        aria-live="polite"
        aria-label="タイピングエリア"
      >
        {/* BasicTypingEngine が動的にコンテンツを挿入 */}
      </div>

      {/* Escキーヒント */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        fontSize: '1rem',
        color: '#6b7280',
        opacity: 0.7
      }}>
        ESC でメニューに戻る
      </div>
    </div>
  );
};

SimpleGameScreen.displayName = 'SimpleGameScreen';
export default SimpleGameScreen;
