import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import PortalShortcut from './PortalShortcut';
import { useSimpleTyping } from '@/hooks/useSimpleTyping';
import { createBasicTypingChars, debugSokuonProcessing } from '@/utils/basicJapaneseUtils';
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
    const chars = currentWord.hiragana ? createBasicTypingChars(currentWord.hiragana) : [];
    
    // デバッグ：促音処理の確認
    if (currentWord.hiragana) {
      debugSokuonProcessing(currentWord.hiragana);
    }
    
    return chars;
  }, [currentWord.hiragana]);
  // ローマ字文字列を生成（wanakanaの代替 - BasicTypingCharのパターンから直接構築）
  const romajiString = React.useMemo(() => {
    if (!typingChars || typingChars.length === 0) return '';
    
    // 各BasicTypingCharの最初のパターン（デフォルトパターン）を連結
    return typingChars.map(char => char.patterns[0] || '').join('');
  }, [typingChars]);const { containerRef, currentCharIndex, kanaDisplay, detailedProgress } = useSimpleTyping({
    word: currentWord,
    typingChars,
    onWordComplete,
  });  // typingmania-ref流: 効率的なローマ字位置計算とハイライト表示
  const romajiDisplay = React.useMemo(() => {
    if (!romajiString || !detailedProgress?.currentKanaDisplay) {
      return { accepted: '', remaining: romajiString || '' };
    }
    
    // シンプルで高速な位置計算
    const currentKanaIndex = detailedProgress.currentKanaIndex;
    const acceptedLength = detailedProgress.currentKanaDisplay.acceptedText.length;
    
    // 累積長さ計算（typingmania-ref方式）
    let totalAcceptedLength = 0;
    for (let i = 0; i < currentKanaIndex && i < typingChars.length; i++) {
      totalAcceptedLength += typingChars[i].patterns[0]?.length || 0;
    }
    totalAcceptedLength += acceptedLength;

    return {
      accepted: romajiString.slice(0, totalAcceptedLength),
      remaining: romajiString.slice(totalAcceptedLength)
    };
  }, [romajiString, detailedProgress?.currentKanaIndex, detailedProgress?.currentKanaDisplay?.acceptedText]);  React.useEffect(() => {
    // デバッグ用：グローバルテスト関数を追加
    if (typeof window !== 'undefined') {
      (window as any).testSokuon = (hiragana: string) => {
        debugSokuonProcessing(hiragana);
      };
    }
  }, []);return (
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
    }}>      {/* 日本語単語表示 */}
      <div 
        className="japanese-display slide-in"
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '800',
          marginBottom: '2.5rem',
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
      </div>{/* ローマ字表示エリア（ハイライト機能付き） */}
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
      >        <span style={{ 
          color: '#10b981',
          textShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
          fontWeight: '600'
        }}>
          {romajiDisplay.accepted}
        </span>
        {romajiDisplay.remaining && (
          <>
            {/* 次に打つべき文字をハイライト */}
            <span 
              className="next-char-highlight pulse"
              style={{
                color: '#fbbf24',
                textShadow: '0 0 12px rgba(251, 191, 36, 0.8)',
                fontWeight: '700',
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                padding: '0.2em 0.3em',
                borderRadius: '6px',
                border: '2px solid rgba(251, 191, 36, 0.5)'
              }}
            >
              {romajiDisplay.remaining[0]}
            </span>
            {/* 残りの文字 */}
            <span style={{ 
              color: '#64748b'
            }}>
              {romajiDisplay.remaining.slice(1)}
            </span>
          </>
        )}
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
