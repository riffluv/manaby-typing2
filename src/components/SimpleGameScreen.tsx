import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useHyperTyping, UltraOptimizedJapaneseProcessor } from '@/typing';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 typingmania-ref流超高速GameScreen - React最適化版 ✨
 * - React.memo適用による不要な再レンダリング防止
 * - useMemo最適化によるローマ字計算効率化
 * - 依存配列の最適化
 * - 日本語処理システムには触れずReact層のみ最適化
 */
const SimpleGameScreen: React.FC<SimpleGameScreenProps> = React.memo(({ 
  currentWord, 
  onWordComplete
}) => {
  // 軽量化：シンプルなTypingChar生成（非同期処理を削除して入力遅延を防止）
  const typingChars = React.useMemo(() => {
    if (!currentWord.hiragana) return [];
    // 🚀 UltraOptimizedJapaneseProcessor使用で最新最適化技術を活用
    return UltraOptimizedJapaneseProcessor.convertToTypingChars(currentWord.hiragana);
  }, [currentWord.hiragana]);

  // typingmania-ref流：ローマ字文字列を生成（メモ化最適化）
  const romajiString = React.useMemo(() => {
    if (!typingChars || typingChars.length === 0) return '';
    
    // 各TypingCharの最初のパターン（デフォルトパターン）を連結
    return typingChars.map((char: any) => char.patterns[0] || '').join('');
  }, [typingChars]);

  const { containerRef, currentCharIndex, kanaDisplay, detailedProgress } = useHyperTyping({
    word: currentWord,
    typingChars,
    onWordComplete,
  });

  // typingmania-ref流: 効率的なローマ字位置計算とハイライト表示（最適化版）
  const romajiDisplay = React.useMemo(() => {
    // エンジンが初期化されていない、または詳細進捗がない場合は初期状態
    if (!romajiString || !detailedProgress?.currentKanaDisplay) {
      return { accepted: '', remaining: romajiString || '' };
    }
    
    const currentKanaIndex = detailedProgress.currentKanaIndex;
    const currentAcceptedLength = detailedProgress.currentKanaDisplay.acceptedText?.length || 0;

    // 累積長さ計算（完了済み文字 + 現在文字の進行分）
    let totalAcceptedLength = 0;
    
    // 完了済み文字の長さを正確に計算
    for (let i = 0; i < currentKanaIndex && i < typingChars.length; i++) {
      const charPattern = typingChars[i].patterns?.[0] || '';
      totalAcceptedLength += charPattern.length;
    }
    
    // 現在処理中の文字での進行分を追加
    totalAcceptedLength += currentAcceptedLength;

    return {
      accepted: romajiString.slice(0, totalAcceptedLength),
      remaining: romajiString.slice(totalAcceptedLength)
    };
  }, [
    romajiString, 
    detailedProgress?.currentKanaIndex, 
    detailedProgress?.currentKanaDisplay?.acceptedText,
    typingChars
  ]);

  // メモ化されたレンダリング
  const remainingRomaji = React.useMemo(() => {
    if (!romajiDisplay.remaining) return null;
    
    return (
      <>
        <span className={styles.active}>
          {romajiDisplay.remaining[0]}
        </span>
        <span className={styles.remaining}>
          {romajiDisplay.remaining.slice(1)}
        </span>
      </>
    );
  }, [romajiDisplay.remaining]);

  return (
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
          {remainingRomaji}
        </div>
      </div>

      {/* タイピングエリア - HyperTypingEngineが制御（非表示） */}
      <div 
        ref={containerRef}
        className={styles.typingArea}
        aria-live="polite"
        aria-label="タイピングエリア"
      >
        {/* HyperTypingEngine が動的にコンテンツを挿入 */}      </div>    </div>
  );
});

SimpleGameScreen.displayName = 'SimpleGameScreen';

export default SimpleGameScreen;
