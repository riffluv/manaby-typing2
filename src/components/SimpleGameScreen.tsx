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
  }, [currentWord.hiragana]);  // ローマ字文字列を生成（wanakanaの代替 - BasicTypingCharのパターンから直接構築）
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
    
    // 詳細デバッグ情報をコンソールに出力
    console.log('🔍 Debug romajiDisplay:', {
      currentKanaIndex: detailedProgress.currentKanaIndex,
      acceptedText: detailedProgress.currentKanaDisplay.acceptedText,
      remainingText: detailedProgress.currentKanaDisplay.remainingText,
      romajiString,
      typingCharsLength: typingChars.length
    });
    
    // 正確な同期計算：romajiString生成と同じロジックを使用
    const currentKanaIndex = detailedProgress.currentKanaIndex;
    const currentAcceptedLength = detailedProgress.currentKanaDisplay.acceptedText.length;
    
    console.log('🔧 SYNC DEBUG:', {
      currentKanaIndex,
      currentAcceptedLength,
      currentKanaChar: typingChars[currentKanaIndex]?.kana,
      currentKanaPattern: typingChars[currentKanaIndex]?.patterns[0],
      displayAcceptedText: detailedProgress.currentKanaDisplay.acceptedText,
      displayRemainingText: detailedProgress.currentKanaDisplay.remainingText
    });
      // 累積長さ計算（完了済み文字 + 現在文字の進行分）
    let totalAcceptedLength = 0;
    
    // 完了済み文字の長さを正確に計算
    for (let i = 0; i < currentKanaIndex && i < typingChars.length; i++) {
      const char = typingChars[i];
      const charPattern = char.patterns[0] || '';
      totalAcceptedLength += charPattern.length;
      console.log(`Completed Char ${i}: kana="${char.kana}" pattern="${charPattern}" (length: ${charPattern.length}), total: ${totalAcceptedLength}`);
    }
    
    // 現在処理中の文字での進行分を追加
    totalAcceptedLength += currentAcceptedLength;
    console.log(`Current progress: +${currentAcceptedLength}, final total: ${totalAcceptedLength}`);

    const result = {
      accepted: romajiString.slice(0, totalAcceptedLength),
      remaining: romajiString.slice(totalAcceptedLength)
    };
    
    console.log('🎯 Final romajiDisplay:', {
      totalAcceptedLength,
      acceptedString: result.accepted,
      remainingString: result.remaining,
      expectedNextChar: result.remaining[0]
    });
    
    return result;
  }, [romajiString, detailedProgress?.currentKanaIndex, detailedProgress?.currentKanaDisplay?.acceptedText, typingChars]);React.useEffect(() => {
    // デバッグ用：グローバルテスト関数を追加
    if (typeof window !== 'undefined') {
      (window as any).testSokuon = (hiragana: string) => {
        debugSokuonProcessing(hiragana);
      };
    }
  }, []);  return (
    <div className="game-screen-ff16">
      <div className="typing-container-ff16">
        {/* 日本語単語表示 */}
        <div className="japanese-text-ff16">
          {currentWord.japanese}
        </div>        {/* ローマ字表示エリア（ハイライト機能付き） */}
        <div className="romaji-text-ff16">
          <span className="typed">
            {romajiDisplay.accepted}
          </span>
          {romajiDisplay.remaining && (
            <>
              <span className="active">
                {romajiDisplay.remaining[0]}
              </span>
              <span className="char">
                {romajiDisplay.remaining.slice(1)}
              </span>
            </>
          )}
        </div>

        {/* ショートカット案内 */}
        <div style={{ marginBottom: '1rem', position: 'relative', zIndex: 3 }}>
          <PortalShortcut shortcuts={[{ key: 'Esc', label: 'メニューに戻る' }]} />
        </div>        {/* タイピングエリア - BasicTypingEngineが制御 */}
        <div 
          ref={containerRef}
          className="typing-area"
          style={{
            position: 'relative',
            zIndex: 2
          }}
          aria-live="polite"
          aria-label="タイピングエリア"
        >
          {/* BasicTypingEngine が動的にコンテンツを挿入 */}
        </div>
      </div>
    </div>
  );
};

SimpleGameScreen.displayName = 'SimpleGameScreen';
export default SimpleGameScreen;
