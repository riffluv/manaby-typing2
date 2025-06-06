import React from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { useHyperTyping, JapaneseConverter } from '@/typing';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type SimpleGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 typingmania-ref流超高速GameScreen - Phase 1最適化版 ✨
 * - HyperTypingEngineによる次世代パフォーマンス最適化
 * - RequestIdleCallback最適化によるバックグラウンド事前計算
 * - 予測キャッシュシステムによる0ms応答入力システム
 * - 差分更新システムによる効率的DOM更新
 * - 完全な「ん」文字分岐機能の保持
 */
const SimpleGameScreen: React.FC<SimpleGameScreenProps> = ({ 
  currentWord, 
  onWordComplete
}) => {  // typingmania-ref流：新しいJapaneseConverterでTypingChar配列を生成
  const typingChars = React.useMemo(() => {
    return currentWord.hiragana ? JapaneseConverter.convertToTypingChars(currentWord.hiragana) : [];
  }, [currentWord.hiragana]);
  // typingmania-ref流：ローマ字文字列を生成
  const romajiString = React.useMemo(() => {
    if (!typingChars || typingChars.length === 0) return '';
    
    // 各TypingCharの最初のパターン（デフォルトパターン）を連結
    return typingChars.map((char: any) => char.patterns[0] || '').join('');
  }, [typingChars]);
  const { containerRef, currentCharIndex, kanaDisplay, detailedProgress, getPerformanceStats } = useHyperTyping({
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
      </div>      {/* タイピングエリア - HyperTypingEngineが制御（非表示） */}
      <div 
        ref={containerRef}
        className={styles.typingArea}
        aria-live="polite"
        aria-label="タイピングエリア"
      >
        {/* HyperTypingEngine が動的にコンテンツを挿入 */}
      </div>

      {/* Phase 1 パフォーマンス統計表示（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && getPerformanceStats && (
        <div className={styles.performanceStats}>          <h4>⚡ Phase 1 最適化統計</h4>
          {(() => {
            const stats = getPerformanceStats();
            return (
              <div className={styles.statsGrid}>
                <div><strong>キャッシュヒット率:</strong> {(stats.cacheHitRate || 0).toFixed(1)}%</div>
                <div><strong>平均処理時間:</strong> {(stats.averageProcessingTime || 0).toFixed(2)}ms</div>
                <div><strong>アイドル計算数:</strong> {stats.idleComputations || 0}</div>
                <div><strong>DOM更新スキップ:</strong> {stats.domUpdatesSkipped || 0}</div>
                <div><strong>予測キャッシュサイズ:</strong> {stats.cacheSize || 0}</div>
                <div><strong>最適化効果:</strong> {(stats.cacheHitRate || 0) > 80 ? '🟢 優秀' : (stats.cacheHitRate || 0) > 50 ? '🟡 良好' : '🔴 要改善'}</div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

SimpleGameScreen.displayName = 'SimpleGameScreen';
export default SimpleGameScreen;
