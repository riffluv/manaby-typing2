import React, { useRef, useEffect, useState } from 'react';
import { TypingWord, PerWordScoreLog } from '@/types';
import { UltraFastTypingEngine, JapaneseConverter } from '@/typing';
import { useSettingsStore } from '@/store/useSettingsStore';
import styles from '@/styles/components/SimpleGameScreen.module.css';

export type UltraFastGameScreenProps = {
  currentWord: TypingWord;
  onWordComplete?: (scoreLog: PerWordScoreLog) => void;
};

/**
 * 🚀 UltraFastTypingEngine実証版GameScreen - ネイティブゲーム級超高速レスポンス ⚡
 * - タイピングコロシアム級の超低遅延を目指す実験的実装
 * - 低レベルキーイベントキャプチャ（キャプチャフェーズ）
 * - Canvas部分描画（変更文字のみ）
 * - オブジェクトプール（メモリアロケーション削減）
 * - 予測キャッシュ（処理済み結果再利用）
 * - パフォーマンス監視（平均・最大レスポンス時間、キャッシュヒット率）
 */
const UltraFastGameScreen: React.FC<UltraFastGameScreenProps> = React.memo(({ 
  currentWord, 
  onWordComplete
}) => {
  const { showKanaDisplay } = useSettingsStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<UltraFastTypingEngine | null>(null);
    // パフォーマンス統計の表示用state
  const [performanceStats, setPerformanceStats] = useState({
    averageResponseTime: 0,
    maxResponseTime: 0,
    cacheHitRate: 0,
    totalProcessed: 0
  });

  // TypingChar生成
  const typingChars = React.useMemo(() => {
    if (!currentWord.hiragana) return [];
    return JapaneseConverter.convertToTypingChars(currentWord.hiragana);
  }, [currentWord.hiragana]);
  // エンジン初期化
  useEffect(() => {
    if (!containerRef.current || !typingChars.length) return;

    const engine = new UltraFastTypingEngine(containerRef.current);
    engineRef.current = engine;    // ローマ字テキストを設定
    const romajiText = typingChars
      .flatMap(char => char.patterns[0] || [])
      .join('');
    
    engine.setText(romajiText, onWordComplete);

    // パフォーマンス統計を定期的に更新
    const updateStats = () => {
      const stats = engine.getPerformanceStats();
      setPerformanceStats(stats);
    };

    const statsInterval = setInterval(updateStats, 1000); // 1秒ごと

    return () => {
      clearInterval(statsInterval);
      engine.destroy();
    };
  }, [typingChars, showKanaDisplay]);  // 単語変更時の処理
  useEffect(() => {
    if (engineRef.current && typingChars.length) {
      const romajiText = typingChars
        .flatMap(char => char.patterns[0] || [])
        .join('');
      engineRef.current.setText(romajiText, onWordComplete);
    }
  }, [typingChars, onWordComplete]);

  return (
    <div className={styles.gameScreen}>
      <div className={styles.typingArea}>
        {/* パフォーマンス統計表示 */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: '#00ff00',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1000
        }}>
          <div>平均レスポンス: {performanceStats.averageResponseTime.toFixed(2)}ms</div>
          <div>最大レスポンス: {performanceStats.maxResponseTime.toFixed(2)}ms</div>
          <div>キャッシュヒット率: {(performanceStats.cacheHitRate * 100).toFixed(1)}%</div>
          <div>総処理回数: {performanceStats.totalProcessed}</div>
        </div>

        {/* UltraFastTypingEngine による完全管理 */}
        <div 
          ref={containerRef}
          className={styles.promptBox__roma}
          aria-live="polite"
          aria-label="ウルトラファストタイピングエリア"
        >
          {/* UltraFastTypingEngine が以下を自動構築:
              - 低レベルキーイベントキャプチャ
              - Canvas部分描画
              - オブジェクトプール活用
              - 予測キャッシュ最適化 */}
        </div>
      </div>
    </div>
  );
});

UltraFastGameScreen.displayName = 'UltraFastGameScreen';

export default UltraFastGameScreen;
