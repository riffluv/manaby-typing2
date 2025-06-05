import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useSimpleTyping } from '@/hooks/useSimpleTyping';
import { createBasicTypingChars } from '@/utils/basicJapaneseUtils';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 typingmania-ref流超高速GameScreen - リファクタリング完了版
 * - TypingEngineによる直接DOM操作で最高速を実現
 * - JapaneseConverterによる統合された日本語処理
 * - 複数入力パターン（ji/zi）をサポート
 * - デモページレベルの応答性を実現
 */
const SimpleGameScreen: React.FC<SimpleGameScreenProps> = ({ 
  currentWord, 
  onWordComplete
}) => {  // typingmania-ref流：ひらがなからBasicTypingChar配列を生成
  const typingChars = React.useMemo(() => {
    return currentWord.hiragana ? createBasicTypingChars(currentWord.hiragana) : [];
  }, [currentWord.hiragana]);

  // typingmania-ref流：ローマ字文字列を生成
  const romajiString = React.useMemo(() => {
    if (!typingChars || typingChars.length === 0) return '';
    
    // 各BasicTypingCharの最初のパターン（デフォルトパターン）を連結
    return typingChars.map((char: any) => char.patterns[0] || '').join('');
  }, [typingChars]);

  const { containerRef, currentCharIndex, kanaDisplay, detailedProgress } = useSimpleTyping({
    word: currentWord,
    typingChars,
    onWordComplete,
  });// typingmania-ref流: 効率的なローマ字位置計算とハイライト表示
  const romajiDisplay = React.useMemo(() => {
    // エンジンが初期化されていない、または詳細進捗がない場合は初期状態
    if (!romajiString || !detailedProgress?.currentKanaDisplay) {
      return { accepted: '', remaining: romajiString || '' };
    }
    
    const currentKanaIndex = detailedProgress.currentKanaIndex;
    const currentAcceptedLength = detailedProgress.currentKanaDisplay.acceptedText.length;
    
    // 累積長さ計算（完了済み文字 + 現在文字の進行分）
    let totalAcceptedLength = 0;
    
    // 完了済み文字の長さを正確に計算
    for (let i = 0; i < currentKanaIndex && i < typingChars.length; i++) {
      const charPattern = typingChars[i].patterns[0] || '';
      totalAcceptedLength += charPattern.length;
    }
    
    // 現在処理中の文字での進行分を追加
    totalAcceptedLength += currentAcceptedLength;

    return {
      accepted: romajiString.slice(0, totalAcceptedLength),
      remaining: romajiString.slice(totalAcceptedLength)
    };
  }, [romajiString, detailedProgress?.currentKanaIndex, detailedProgress?.currentKanaDisplay?.acceptedText, typingChars]);return (
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
      </div>      {/* タイピングエリア - TypingEngineが制御（非表示） */}
      <div 
        ref={containerRef}
        className={styles.typingArea}
        aria-live="polite"
        aria-label="タイピングエリア"
      >
        {/* TypingEngine が動的にコンテンツを挿入 */}
      </div>
    </div>
  );
};

SimpleGameScreen.displayName = 'SimpleGameScreen';
export default SimpleGameScreen;
