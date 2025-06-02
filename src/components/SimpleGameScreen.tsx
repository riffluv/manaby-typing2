import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import PortalShortcut from './PortalShortcut';
import { useSimpleTyping } from '@/hooks/useSimpleTyping';
import { createBasicTypingChars, debugSokuonProcessing } from '@/utils/basicJapaneseUtils';
import { getRomajiString } from '@/utils/japaneseUtils';

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
  }, []);  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem 1rem',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>      {/* 日本語単語表示 */}
      <div style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontWeight: '600',
        color: '#111827',
        maxWidth: '100%',
        wordBreak: 'break-word'
      }}>
        {currentWord.japanese}
      </div>

      {/* ローマ字表示エリア（ハイライト機能付き） */}
      <div style={{
        fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
        marginBottom: '2rem',
        textAlign: 'center',
        padding: '1rem',
        maxWidth: '100%',
        wordBreak: 'break-word'
      }}>
        <span className="typed-char">
          {romajiDisplay.accepted}
        </span>
        {romajiDisplay.remaining && (
          <>
            <span className="current-char">
              {romajiDisplay.remaining[0]}
            </span>
            <span className="pending-char">
              {romajiDisplay.remaining.slice(1)}
            </span>
          </>
        )}
      </div>

      {/* ショートカット案内 */}
      <div style={{ marginBottom: '1rem' }}>
        <PortalShortcut shortcuts={[{ key: 'Esc', label: 'メニューに戻る' }]} />
      </div>      {/* タイピングエリア - BasicTypingEngineが制御 */}
      <div 
        ref={containerRef}
        className="typing-area"
        style={{
          fontSize: 'clamp(1.25rem, 3vw, 2rem)',
          textAlign: 'center',
          padding: '1.5rem',
          border: '2px solid #e5e7eb',
          borderRadius: '0.5rem',
          minHeight: '4rem',
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          boxSizing: 'border-box'
        }}
        aria-live="polite"
        aria-label="タイピングエリア"
      >
        {/* BasicTypingEngine が動的にコンテンツを挿入 */}
      </div>
    </div>
  );
};

SimpleGameScreen.displayName = 'SimpleGameScreen';
export default SimpleGameScreen;
