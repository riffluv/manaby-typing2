import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useDirectTyping2, JapaneseConverter } from '@/typing';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type NewSimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 typingmania-ref流超高速GameScreen - 新タイピングシステム版
 * - 新TypingEngineによる直接DOM操作で最高速を実現
 * - 新JapaneseConverterによる統合された日本語処理
 * - 複数入力パターン（ji/zi）をサポート
 * - デモページレベルの応答性を実現
 */
const NewSimpleGameScreen: React.FC<NewSimpleGameScreenProps> = ({ 
  currentWord, 
  onWordComplete
}) => {  // typingmania-ref流：ひらがなから新TypingChar配列を生成
  const typingChars = React.useMemo(() => {
    if (!currentWord.hiragana) return [];
    // 🚀 JapaneseConverter使用で最新最適化技術を活用
    return JapaneseConverter.convertToTypingChars(currentWord.hiragana);
  }, [currentWord.hiragana]);
  // typingmania-ref流：ローマ字文字列を生成
  const romajiString = React.useMemo(() => {
    if (!typingChars || typingChars.length === 0) return '';
    
    // 各TypingCharの最初のパターン（デフォルトパターン）を連結
    return typingChars.map((char: any) => char.patterns[0] || '').join('');
  }, [typingChars]);  const { containerRef } = useDirectTyping2({
    word: currentWord,
    typingChars,
    onWordComplete,
  });

  // typingmania-ref流: 効率的なローマ字位置計算とハイライト表示
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
  }, [romajiString, detailedProgress?.currentKanaIndex, detailedProgress?.currentKanaDisplay?.acceptedText, typingChars]);

  return (
    <div className={styles.gameScreen}>
      {/* メインのお題エリア */}
      <div className={styles.typingContainer}>
        {/* 日本語単語表示 */}
        <div className={styles.japaneseText}>
          {currentWord.japanese}
        </div>

        {/* ひらがな表示 */}
        <div className={styles.hiraganaText}>
          {currentWord.hiragana}
        </div>

        {/* ローマ字表示 - typingmania-ref流の高速ハイライト */}
        <div className={styles.romajiText}>
          <span className={styles.romajiAccepted}>
            {romajiDisplay.accepted}
          </span>
          <span className={styles.romajiRemaining}>
            {romajiDisplay.remaining}
          </span>
        </div>

        {/* 新タイピングエンジンコンテナ（直接DOM操作用） */}
        <div 
          ref={containerRef}
          className={styles.typingEngineContainer}
          style={{ minHeight: '100px' }}
        />

        {/* デバッグ情報（開発時のみ） */}
        {process.env.NODE_ENV === 'development' && detailedProgress && (
          <div className={styles.debugInfo}>
            <div>現在位置: {detailedProgress.currentKanaIndex} / {detailedProgress.totalKanaCount}</div>
            <div>ローマ字進捗: {detailedProgress.currentRomajiIndex}</div>
            <div>システム: 新TypingEngine</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewSimpleGameScreen;
