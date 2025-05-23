'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

// 空ファイルのため、ESモジュールとして認識させるために空のエクスポートを追加
export {};

// Next.jsのappディレクトリのページは必ずdefaultエクスポートが必要
export default function RankingPage() {
  const router = useRouter();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [activeDifficulty, setActiveDifficulty] = useState<string>('normal');
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
  // ランキングデータを取得する（リアルなダミーデータ生成）
  const fetchRankings = async () => {
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
  };

  // マウント時およびdifficulty変更時にデータ取得
  useEffect(() => {
    fetchRankings();
  }, [activeDifficulty]);

  // 難易度変更ハンドラ
  const handleDifficultyChange = (difficulty: string) => {
    if (difficulty === activeDifficulty) return;
    setActiveDifficulty(difficulty);
  };

  // メニュー画面に戻る
  const handleBackToMenu = () => {
    router.push('/');
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
        >          {isLoading ? (
            <motion.div 
              className="py-20 text-center text-gray-400 font-mono flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">ランキング読み込み中</div>
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : rankings.length === 0 ? (
            <motion.div 
              className="py-20 text-center text-gray-400 font-mono flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-2 text-amber-400 text-lg">まだスコアがありません</p>
              <p className="mb-6">ゲームをプレイして最初のランキング入りを目指しましょう！</p>
              <Link href="/game">
                <button className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-md transition-all duration-200 shadow-md">
                  プレイする
                </button>
              </Link>
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
                <tbody>                  {rankings.map((entry, index) => (
                    <motion.tr 
                      key={entry.id}
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
            onClick={handleBackToMenu}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md transition-all duration-200 w-48 border border-gray-700 hover:border-amber-500/30 relative group overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">メニューに戻る</span>
            <span className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </motion.button>
          
          <Link href="/game" className="w-48">
            <motion.button
              className="w-full px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg relative group overflow-hidden"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">ゲームをプレイ</span>
              <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute -inset-x-2 bottom-0 h-0.5 bg-amber-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
