import React from 'react';
import { TypingWord } from '@/types';
import PortalShortcut from './PortalShortcut';
import { useSimpleTyping } from '@/hooks/useSimpleTyping';
import { createBasicTypingChars } from '@/utils/basicJapaneseUtils';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: () => void;
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
}) => {  // ひらがなからBasicTypingChar配列を生成
  const typingChars = React.useMemo(() => {
    return currentWord.hiragana ? createBasicTypingChars(currentWord.hiragana) : [];
  }, [currentWord.hiragana]);

  const { containerRef } = useSimpleTyping({
    word: currentWord,
    typingChars,
    onWordComplete,
  });
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      
      {/* 日本語単語表示 */}
      <div style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textAlign: 'center',
        textShadow: '0 0 20px rgba(124, 255, 203, 0.5)',
        color: '#7cffcb'
      }}>
        {currentWord.japanese}
      </div>

      {/* ひらがな表示 */}
      <div style={{
        fontSize: '2rem',
        marginBottom: '3rem',
        textAlign: 'center',
        color: '#a0aec0',
        letterSpacing: '0.5rem'
      }}>
        {currentWord.hiragana}
      </div>

      {/* ショートカット案内 */}
      <div style={{ marginBottom: '2rem' }}>
        <PortalShortcut shortcuts={[{ key: 'Esc', label: 'メニューに戻る' }]} />
      </div>

      {/* タイピングエリア - BasicTypingEngineが制御 */}
      <div 
        ref={containerRef}
        style={{
          minHeight: '4rem',
          fontSize: '2.5rem',
          fontFamily: 'monospace',
          textAlign: 'center',
          letterSpacing: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(124, 255, 203, 0.2)',
          borderRadius: '12px',
          padding: '1rem 2rem',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
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
