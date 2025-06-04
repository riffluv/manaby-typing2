import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useSimpleTyping } from '@/hooks/useSimpleTyping';
import { createBasicTypingChars, debugSokuonProcessing } from '@/utils/basicJapaneseUtils';
import { getRomajiString } from '@/utils/japaneseUtils';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 typingmania-ref流超高速GameScreen - OptimizedTypingEngine対応版
 * - OptimizedTypingEngineによる直接DOM操作で最高速を実現
 * - BasicTypingChar配列を正しく処理
 * - 複数入力パターン（ji/zi）をサポート
 * - デモページレベルの応答性を実現
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
    // エンジンが初期化されていない、または詳細進捗がない場合は初期状態
    if (!romajiString || !detailedProgress?.currentKanaDisplay) {
      console.log('🔄 [SimpleGameScreen] romajiDisplay: Initial state - no progress data');
      return { accepted: '', remaining: romajiString || '' };
    }
    
    const currentKanaIndex = detailedProgress.currentKanaIndex;
    const currentAcceptedLength = detailedProgress.currentKanaDisplay.acceptedText.length;
    
    console.log('📊 [SimpleGameScreen] romajiDisplay calculation:', {
      currentKanaIndex,
      currentAcceptedLength,
      totalKanaCount: detailedProgress.totalKanaCount,
      currentKanaDisplayAccepted: detailedProgress.currentKanaDisplay.acceptedText,
      currentKanaDisplayRemaining: detailedProgress.currentKanaDisplay.remainingText
    });
    
    // 累積長さ計算（完了済み文字 + 現在文字の進行分）
    let totalAcceptedLength = 0;
    
    // 完了済み文字の長さを正確に計算
    for (let i = 0; i < currentKanaIndex && i < typingChars.length; i++) {
      const charPattern = typingChars[i].patterns[0] || '';
      totalAcceptedLength += charPattern.length;
    }
    
    // 現在処理中の文字での進行分を追加
    totalAcceptedLength += currentAcceptedLength;

    const result = {
      accepted: romajiString.slice(0, totalAcceptedLength),
      remaining: romajiString.slice(totalAcceptedLength)
    };
    
    console.log('✨ [SimpleGameScreen] romajiDisplay result:', {
      totalAcceptedLength,
      accepted: result.accepted,
      remaining: result.remaining,
      romajiStringTotal: romajiString
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
    <div className={styles.gameScreen}>
      {/* メインのお題エリア */}
      <div className={styles.typingContainer}>
        {/* 日本語単語表示 */}
        <div className={styles.japaneseText}>
          {currentWord.japanese}
        </div>

        {/* ローマ字表示エリア（ハイライト機能付き） */}
        <div className={styles.romajiText}>
          <span className={styles.typed}>
            {romajiDisplay.accepted}
          </span>
          {romajiDisplay.remaining && (
            <>
              <span className={styles.active}>
                {romajiDisplay.remaining[0]}
              </span>
              <span className={styles.remaining}>
                {romajiDisplay.remaining.slice(1)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* タイピングエリア - BasicTypingEngineが制御（非表示） */}
      <div 
        ref={containerRef}
        className={styles.typingArea}
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
