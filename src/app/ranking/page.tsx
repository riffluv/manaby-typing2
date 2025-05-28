'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import ShortcutFooter, { Shortcut } from '@/components/ShortcutFooter';

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
    <div className="ranking-screen">
      {/* 背景エフェクト（必要なら追加） */}
      {/* <div className="backgroundElements"></div> */}
      <motion.div
        className="ranking-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ヘッダー */}
        <motion.div variants={itemVariants} className="ranking-header">
          <h1 className="ranking-title">ranking</h1>
          <p className="ranking-subtitle">タイピングスコアランキング</p>
        </motion.div>
        
        {/* 難易度選択 */}
        <motion.div variants={itemVariants} className="difficulty-selector">
          {['easy', 'normal', 'hard'].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              className={`btn-secondary${activeDifficulty === difficulty ? ' btn-active' : ''}`}
            >
              {difficulty === 'easy' ? 'やさしい' : 
               difficulty === 'normal' ? 'ふつう' : 'むずかしい'}
            </button>
          ))}
        </motion.div>
        
        {/* ランキングテーブル */}
        <motion.div variants={itemVariants} className="ranking-table-container">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-text">ランキング読み込み中</div>
              <div className="loading-spinner"></div>
            </div>
          ) : rankings.length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-title">まだスコアがありません</h3>
              <p className="empty-message">
                ゲームをプレイして最初のランキング入りを目指しましょう！
              </p>
              <Link href="/game">
                <button className="btn-primary">
                  プレイする
                </button>
              </Link>
            </div>
          ) : (
            <table className="ranking-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">順位</th>
                  <th className="table-header-cell">プレイヤー</th>
                  <th className="table-header-cell">KPM</th>
                  <th className="table-header-cell">正確率</th>
                  <th className="table-header-cell">正解</th>
                  <th className="table-header-cell">ミス</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((entry, index) => (
                  <motion.tr 
                    key={entry.id}
                    className={`table-row fade-in${index < 3 ? ' table-row-top3' : ''}${index === 0 ? ' table-row-first' : ''}${index === 1 ? ' table-row-second' : ''}${index === 2 ? ' table-row-third' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <td className={`table-cell rank-cell${index === 0 ? ' rank-cell-first' : index === 1 ? ' rank-cell-second' : index === 2 ? ' rank-cell-third' : ''}`}>
                      {index === 0 ? '🏆 1st' :
                       index === 1 ? '🥈 2nd' :
                       index === 2 ? '🥉 3rd' :
                       `${index + 1}`}
                    </td>
                    <td className="table-cell name-cell">{entry.name}</td>
                    <td className="table-cell kpm-cell">{entry.kpm}</td>
                    <td className="table-cell accuracy-cell">{entry.accuracy}%</td>
                    <td className="table-cell correct-cell">{entry.correct}</td>
                    <td className="table-cell miss-cell">{entry.miss}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
        
        {/* アクションボタン */}
        <motion.div variants={itemVariants} className="result-actions">
          <button
            onClick={handleBackToMenu}
            className="btn-secondary"
          >
            メニューに戻る
          </button>
          
          <Link href="/game">
            <button className="btn-primary">
              ゲームをプレイ
            </button>
          </Link>
        </motion.div>
      </motion.div>
      
      <ShortcutFooter shortcuts={shortcuts} />
    </div>
  );
}
