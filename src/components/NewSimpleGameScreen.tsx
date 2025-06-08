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
    // 初期状態の表示
    return { accepted: '', remaining: romajiString || '' };
  }, [romajiString]);

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
        </div>        {/* 新タイピングエンジンコンテナ（直接DOM操作用） */}
        <div 
          ref={containerRef}
          className={styles.typingEngineContainer}
          style={{ minHeight: '100px' }}
        />
      </div>
    </div>
  );
};

export default NewSimpleGameScreen;
