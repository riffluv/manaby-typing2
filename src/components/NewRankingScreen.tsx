'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';

import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { containerVariants, itemVariants, tableRowVariants } from '@/styles/animations';

interface NewRankingScreenProps {
  onGoMenu: () => void;
}

const NewRankingScreen: React.FC<NewRankingScreenProps> = ({ onGoMenu }) => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('normal');

  useEffect(() => {
    setLoading(true);
    setError('');
    getRankingEntries(30)
      .then(setRanking)
      .catch(() => setError('ランキングの取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [activeDifficulty]);

  // 難易度変更ハンドラ
  const handleDifficultyChange = (difficulty: string) => {
    if (difficulty === activeDifficulty) return;
    setActiveDifficulty(difficulty);
  };


  
  useGlobalShortcuts([
    {
      key: 'Escape',
      handler: (e) => { e.preventDefault(); onGoMenu(); },
    },
  ], [onGoMenu]);
    return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        className="w-full bg-transparent rounded-lg p-8 relative overflow-hidden flex flex-col items-center"
        style={{ border: 'none' }} // ボーダーを明示的に無効化
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* タイトルとヘッダー */}
        <motion.div variants={itemVariants} className="mb-8 text-center relative z-10 w-full">
          <h1 className="text-5xl font-mono font-bold mb-2 text-amber-400 tracking-tight">ranking</h1>
          <p className="text-gray-400 text-sm">タイピングスコアランキング</p>
        </motion.div>
        
        {/* 難易度選択 */}
        <motion.div 
          variants={itemVariants} 
          className="flex justify-center gap-4 mb-10 relative z-10 w-full"
        >
          <button
            onClick={() => handleDifficultyChange('easy')}
            className={`px-5 py-2 font-mono text-sm rounded-md transition-all duration-200 
              ${activeDifficulty === 'easy'
                ? 'bg-amber-500 text-gray-900 font-semibold shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700 hover:border-amber-500/30'
              }`}
          >
            やさしい
          </button>
          <button
            onClick={() => handleDifficultyChange('normal')}
            className={`px-5 py-2 font-mono text-sm rounded-md transition-all duration-200
              ${activeDifficulty === 'normal'
                ? 'bg-amber-500 text-gray-900 font-semibold shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700 hover:border-amber-500/30'
              }`}
          >
            ふつう
          </button>
          <button
            onClick={() => handleDifficultyChange('hard')}
            className={`px-5 py-2 font-mono text-sm rounded-md transition-all duration-200
              ${activeDifficulty === 'hard'
                ? 'bg-amber-500 text-gray-900 font-semibold shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700 hover:border-amber-500/30'
              }`}
          >
            むずかしい
          </button>
        </motion.div>
        
        {/* ランキングテーブル */}
        <motion.div 
          variants={itemVariants} 
          className="w-full bg-gray-800/30 rounded-lg overflow-hidden mb-10 shadow-lg relative z-10"
        >
          {loading ? (
            <motion.div 
              className="py-20 text-center text-gray-400 font-mono flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">ランキング読み込み中</div>
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : error ? (
            <motion.div 
              className="py-20 text-center text-red-400 font-mono flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">{error}</div>
              <button 
                onClick={() => {
                  setLoading(true);
                  getRankingEntries(30)
                    .then(setRanking)
                    .catch(() => setError('ランキングの取得に失敗しました'))
                    .finally(() => setLoading(false));
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
              >
                リトライ
              </button>
            </motion.div>
          ) : ranking.length === 0 ? (
            <motion.div 
              className="py-20 text-center text-gray-400 font-mono flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-2 text-amber-400 text-lg">まだスコアがありません</p>
              <p className="mb-6">ゲームをプレイして最初のランキング入りを目指しましょう！</p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/80">
                    <th className="py-4 px-6 text-center text-amber-400 font-bold">順位</th>
                    <th className="py-4 px-6 text-center text-amber-400 font-bold">プレイヤー</th>
                    <th className="py-4 px-6 text-center text-amber-400 font-bold">KPM</th>
                    <th className="py-4 px-6 text-center text-amber-400 font-bold">正確率</th>
                    <th className="py-4 px-6 text-center text-amber-400 font-bold">正解</th>
                    <th className="py-4 px-6 text-center text-amber-400 font-bold">ミス</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((entry, index) => (
                    <motion.tr 
                      key={index}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      variants={tableRowVariants}
                      className={`
                        ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-900/30'} 
                        hover:bg-gray-700/50 transition-all duration-200
                        ${index < 3 ? 'border-l-2' : ''}
                        ${index === 0 ? 'border-l-amber-300' : index === 1 ? 'border-l-gray-300' : index === 2 ? 'border-l-amber-600' : ''}
                      `}
                    >
                      <td className="py-4 px-6 text-center">
                        {index === 0 ? (
                          <span className="text-amber-300 font-bold text-lg">🏆 1st</span>
                        ) : index === 1 ? (
                          <span className="text-gray-300 font-bold">🥈 2nd</span>
                        ) : index === 2 ? (
                          <span className="text-amber-600 font-bold">🥉 3rd</span>
                        ) : (
                          <span className="text-gray-400">{index + 1}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">{entry.name}</td>
                      <td className="py-4 px-6 text-center font-bold text-white">{entry.kpm}</td>
                      <td className="py-4 px-6 text-center">{entry.accuracy}%</td>
                      <td className="py-4 px-6 text-center text-green-400">{entry.correct}</td>
                      <td className="py-4 px-6 text-center text-red-400">{entry.miss}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
        
        {/* ボタン */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-wrap justify-center gap-4 relative z-10 w-full max-w-md mx-auto pt-2"
        >
          <motion.button
            onClick={onGoMenu}
            className="w-full px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">メニューに戻る</span>
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* <ShortcutFooter shortcuts={shortcuts} /> */}
    </div>
  );
};

export default NewRankingScreen;
