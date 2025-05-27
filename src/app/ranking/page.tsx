'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import ShortcutFooter, { Shortcut } from '@/components/ShortcutFooter';
import styles from '@/styles/NewRankingScreen.module.css';

// ランキングのデータ型
type RankingEntry = {
  id: string;
  name: string;
  kpm: number;
  accuracy: number;
  correct: number;
  miss: number;
  date: number;
};

export default function RankingPage() {
  const router = useRouter();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [activeDifficulty, setActiveDifficulty] = useState<string>('normal');
  const [isLoading, setIsLoading] = useState<boolean>(true);  // シンプルなアニメーション設定 - フレーマーモーション
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
  };  // ランキングデータを取得する（リアルなダミーデータ生成）
  const fetchRankings = useCallback(async () => {
    setIsLoading(true);
    try {
      // 難易度に応じたダミーデータの調整
      const difficultyKpmBase = {
        easy: { min: 100, max: 300 },
        normal: { min: 180, max: 450 },
        hard: { min: 250, max: 550 }
      };
      
      const range = difficultyKpmBase[activeDifficulty as keyof typeof difficultyKpmBase];
      
      // リアルなプレイヤー名
      const playerNames = [
        'monkeyTyper', 'Keymaster', 'SpeedFingers',
        'TypeNinja', 'TypeLord', 'KeyboardWarrior',
        'SwiftKeys', 'FlashType', 'RapidType',
        'KeyWizard', 'SpeedHero', 'PreciseTypist',
        'TypeStorm', 'QuickTap', 'CodeTyper'
      ];
      
      // 仮のデータを生成（実際のAPIを使う場合は置き換え）
      const dummyData = Array.from({ length: 10 }, (_, i) => {
        const kpm = Math.floor(Math.random() * (range.max - range.min)) + range.min;
        const accuracy = Math.floor(Math.random() * 20) + 80; // 80-100%
        const correct = Math.floor(kpm * (Math.random() * 0.5 + 0.5)); // KPMに基づく正解数
        const miss = Math.floor(correct * (100 - accuracy) / accuracy); // 正確率に基づくミス数
        
        return {
          id: `id-${i}`,
          name: playerNames[Math.floor(Math.random() * playerNames.length)],
          kpm,
          accuracy,
          correct,
          miss,
          date: Date.now() - (Math.random() * 10000000),
        };
      });
      
      // スコア順にソート
      dummyData.sort((a, b) => b.kpm - a.kpm);
      
      // 擬似的な遅延を挿入して、ロード感を出す（実際のAPI呼び出しでは不要）
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setRankings(dummyData);
    } catch (error) {
      console.error('ランキングデータの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeDifficulty]);
  // マウント時およびdifficulty変更時にデータ取得
  useEffect(() => {
    fetchRankings();
  }, [activeDifficulty, fetchRankings]);

  // 難易度変更ハンドラ
  const handleDifficultyChange = (difficulty: string) => {
    if (difficulty === activeDifficulty) return;
    setActiveDifficulty(difficulty);
  };

  // メニュー画面に戻る
  const handleBackToMenu = () => {
    router.push('/');
  };

  // ショートカット案内
  const shortcuts: Shortcut[] = [
    { key: 'Esc', label: 'メニューに戻る' },
  ];
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => { e.preventDefault(); handleBackToMenu(); },
    },
  ], []);  return (
    <div className={styles.container}>
      {/* 背景エフェクト */}
      <div className={styles.backgroundElements}></div>
      <motion.div
        className={styles.content}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ヘッダー */}
        <motion.div variants={itemVariants} className={styles.header}>
          <h1 className={styles.title}>ranking</h1>
          <p className={styles.subtitle}>タイピングスコアランキング</p>
        </motion.div>
        
        {/* 難易度選択 */}
        <motion.div variants={itemVariants} className={styles.difficultySelector}>
          {['easy', 'normal', 'hard'].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              className={`${styles.difficultyButton} ${
                activeDifficulty === difficulty ? styles.difficultyButtonActive : ''
              }`}
            >
              {difficulty === 'easy' ? 'やさしい' : 
               difficulty === 'normal' ? 'ふつう' : 'むずかしい'}
            </button>
          ))}
        </motion.div>
        
        {/* ランキングテーブル */}
        <motion.div variants={itemVariants} className={styles.rankingContainer}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingText}>ランキング読み込み中</div>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : rankings.length === 0 ? (
            <div className={styles.emptyContainer}>
              <h3 className={styles.emptyTitle}>まだスコアがありません</h3>
              <p className={styles.emptyMessage}>
                ゲームをプレイして最初のランキング入りを目指しましょう！
              </p>
              <Link href="/game">
                <button className={styles.playButton}>
                  プレイする
                </button>
              </Link>
            </div>
          ) : (
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>順位</th>
                  <th className={styles.tableHeaderCell}>プレイヤー</th>
                  <th className={styles.tableHeaderCell}>KPM</th>
                  <th className={styles.tableHeaderCell}>正確率</th>
                  <th className={styles.tableHeaderCell}>正解</th>
                  <th className={styles.tableHeaderCell}>ミス</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((entry, index) => (
                  <motion.tr 
                    key={entry.id}
                    className={`
                      ${styles.tableRow} 
                      ${styles.fadeIn}
                      ${index < 3 ? styles.tableRowTop3 : ''}
                      ${index === 0 ? styles.tableRowFirst : ''}
                      ${index === 1 ? styles.tableRowSecond : ''}
                      ${index === 2 ? styles.tableRowThird : ''}
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <td className={`${styles.tableCell} ${styles.rankCell} ${
                      index === 0 ? styles.rankCellFirst :
                      index === 1 ? styles.rankCellSecond :
                      index === 2 ? styles.rankCellThird : ''
                    }`}>
                      {index === 0 ? '🏆 1st' :
                       index === 1 ? '🥈 2nd' :
                       index === 2 ? '🥉 3rd' :
                       `${index + 1}`}
                    </td>
                    <td className={`${styles.tableCell} ${styles.nameCell}`}>
                      {entry.name}
                    </td>
                    <td className={`${styles.tableCell} ${styles.kpmCell}`}>
                      {entry.kpm}
                    </td>
                    <td className={`${styles.tableCell} ${styles.accuracyCell}`}>
                      {entry.accuracy}%
                    </td>
                    <td className={`${styles.tableCell} ${styles.correctCell}`}>
                      {entry.correct}
                    </td>
                    <td className={`${styles.tableCell} ${styles.missCell}`}>
                      {entry.miss}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
        
        {/* アクションボタン */}
        <motion.div variants={itemVariants} className={styles.actions}>
          <button
            onClick={handleBackToMenu}
            className={`${styles.actionButton} ${styles.backButton}`}
          >
            メニューに戻る
          </button>
          
          <Link href="/game">
            <button className={`${styles.actionButton} ${styles.playButton}`}>
              ゲームをプレイ
            </button>
          </Link>
        </motion.div>
      </motion.div>
      
      <ShortcutFooter shortcuts={shortcuts} />
    </div>
  );
}
