'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TypingGame from '@/components/TypingGame';
import RetroBackground from '@/components/RetroBackground';
import { useTypingGameStore } from '@/store/typingGameStore';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';

function MainMenu({ onStart }: { onStart: () => void }) {
  const { resetGame } = useTypingGameStore();
  const handleStart = () => {
    resetGame();
    onStart();
  };

  // モーション用のバリアント
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      },
    }
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
    }
  };
  
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white font-mono relative py-10">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(55,65,81,0.3)_0,rgba(17,24,39,0)_70%)]"></div>
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
      </div>
      
      <motion.div
        className="w-full max-w-xl bg-transparent rounded-lg p-8 relative overflow-hidden flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ゲームロゴ/タイトル */}
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <h1 className="text-6xl font-mono font-bold mb-2 text-amber-400 tracking-tight">
            manaby typing
          </h1>
        </motion.div>
        
        {/* スタートボタン */}
        <motion.div variants={itemVariants} className="w-full mb-10">
          <motion.button
            onClick={handleStart}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-md text-xl shadow-md transition-all duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            スタート
          </motion.button>
        </motion.div>
        
        {/* モード選択 */}
        <motion.div variants={itemVariants} className="w-full">
          <h2 className="text-amber-400 font-mono text-lg mb-3">モード選択</h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              className="py-3 px-6 rounded-md bg-gray-800 hover:bg-gray-700 text-white font-medium border border-gray-700 hover:border-amber-500/30 transition-all duration-200 flex items-center justify-between"
            >
              <span>Normal</span>
              <span className="text-amber-400">●</span>
            </button>
            <button
              className="py-3 px-6 rounded-md bg-gray-800/50 hover:bg-gray-800 text-gray-400 font-medium border border-gray-800 transition-all duration-200 flex items-center justify-between opacity-70"
              disabled
            >
              <span>Hard</span>
              <span className="text-xs">近日公開</span>
            </button>
          </div>
        </motion.div>
        
        {/* バージョン情報 */}
        <motion.div variants={itemVariants} className="mt-12 text-gray-500 text-xs">
          v2.0.0 | monkeytype UI
        </motion.div>
      </motion.div>
    </div>
  );
}

function Ranking({ onGoMenu }: { onGoMenu: () => void }) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('normal');

  // モーション用のバリアント - より洗練されたアニメーション効果
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      },
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.4,
        ease: [0.65, 0, 0.35, 1]
      }
    }
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
    exit: { 
      y: -20, 
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.65, 0, 0.35, 1]
      }
    }
  };
  
  // テーブル行のアニメーション用バリアント
  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: custom * 0.05,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    hover: {
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
      scale: 1.01,
      transition: {
        duration: 0.2
      }
    }
  };

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

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white font-mono relative py-10">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(55,65,81,0.3)_0,rgba(17,24,39,0)_70%)]"></div>
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
      </div>
      
      <motion.div
        className="w-full max-w-3xl bg-transparent rounded-lg p-8 relative overflow-hidden flex flex-col items-center"
        initial="hidden"
        animate="visible"
        exit="exit"
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
          className="w-full bg-gray-800/30 rounded-lg overflow-hidden mb-10 shadow-lg relative z-10 border border-gray-700/50"
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
    </div>
  );
}

export default function Home() {
  const [scene, setScene] = useState<'menu'|'game'|'ranking'>('menu');
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gray-900 overflow-hidden">
      {/* レトロな宇宙背景 - メニュー画面とランキング画面では新しいスタイルを適用するため非表示 */}
      {scene === 'game' && <RetroBackground />}
      
      {/* コンテンツコンテナ */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {scene === 'menu' && <MainMenu onStart={() => setScene('game')} />}
        {scene === 'game' && <TypingGame onGoMenu={() => setScene('menu')} onGoRanking={() => setScene('ranking')} />}
        {scene === 'ranking' && <Ranking onGoMenu={() => setScene('menu')} />}
      </div>
    </div>
  );
}
