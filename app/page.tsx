'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameArea from '@/components/GameArea';
import { useGameStore } from '@/store/gameStore';

// サンプル単語リスト (本番ではAPIかJSONファイルから取得)
const sampleWords = [
  'こんにちは', 'タイピング', 'ゲーム', 'プログラミング', 'フレームワーク',
  'ジャバスクリプト', 'タイプスクリプト', 'リアクト', 'ネクスト', 'ズースタンド',
  'フレーマー', 'テイルウィンド', 'コンポーネント', 'フック', 'ステート'
];

// 難易度設定
const difficultySettings = {
  easy: {
    wordCount: 15,
    timeLimit: 60,
  },
  normal: {
    wordCount: 25,
    timeLimit: 60,
  },
  hard: {
    wordCount: 40,
    timeLimit: 60,
  },
};

export default function Home() {
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [showGame, setShowGame] = useState(false);
  
  const { score, accuracy, highScore, startGame, endGame, resetGame } = useGameStore();

  // ゲーム初期化
  const initializeGame = () => {
    const settings = difficultySettings[difficulty];
    
    // APIやJSONファイルから単語を取得（現在はサンプル単語を使用）
    fetch('/data/wordList.json')
      .then(response => response.json())
      .then(data => {
        // JSONファイルが存在すればそこから単語を取得、なければサンプル単語を使用
        const wordPool = data?.words || sampleWords;
        // 単語をシャッフルして指定数だけ取得
        const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, settings.wordCount);
        setGameWords(selectedWords);
        setShowGame(true);
        resetGame();
        startGame();
      })
      .catch(error => {
        // JSONファイルの読み込みに失敗した場合はサンプル単語を使用
        console.error('単語リストの読み込みに失敗しました:', error);
        const shuffled = [...sampleWords].sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, settings.wordCount);
        setGameWords(selectedWords);
        setShowGame(true);
        resetGame();
        startGame();
      });
  };

  // ゲーム終了時の処理
  const handleGameComplete = (newScore: number, newAccuracy: number) => {
    endGame(newScore, newAccuracy);
  };

  // 難易度変更
  const handleDifficultyChange = (newDifficulty: 'easy' | 'normal' | 'hard') => {
    setDifficulty(newDifficulty);
    setShowGame(false);
  };

  // ハイスコアをローカルストレージから読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHighScore = localStorage.getItem('typingHighScore');
      if (savedHighScore) {
        // ここでZustandストアを初期化する必要がありますが、
        // Zustandの永続化機能を使用しているため不要
      }
    }
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-blue-800">タイピングマスター</h1>
          <p className="text-lg text-gray-600">Next.js + Zustand + Framer Motionで作られた高速タイピングゲーム</p>
        </header>

        {/* 難易度選択 */}
        {!showGame && (
          <motion.div 
            className="bg-white p-8 rounded-lg shadow-lg text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">難易度を選択してください</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {(['easy', 'normal', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleDifficultyChange(level)}
                  className={`px-6 py-3 rounded-lg text-lg font-medium transition-all ${
                    difficulty === level
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'easy' ? '簡単' : level === 'normal' ? '普通' : '難しい'}
                </button>
              ))}
            </div>
            
            <button
              onClick={initializeGame}
              className="mt-8 px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg shadow-md hover:bg-green-600 transition-colors"
            >
              ゲームスタート
            </button>

            {highScore > 0 && (
              <div className="mt-6 text-gray-700">
                ハイスコア: <span className="font-bold text-blue-600">{highScore}</span> WPM
              </div>
            )}
          </motion.div>
        )}

        {/* ゲーム画面 */}
        {showGame && (
          <GameArea
            words={gameWords}
            timeLimit={difficultySettings[difficulty].timeLimit}
            onComplete={handleGameComplete}
            onExit={() => setShowGame(false)}
          />
        )}

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2023 タイピングマスター - Next.js 14 + TypeScript + Tailwind + Zustand + Framer Motion</p>
        </footer>
      </motion.div>
    </div>
  );
}
