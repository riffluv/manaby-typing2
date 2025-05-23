'use client';

import { motion } from 'framer-motion';
import GameScreen from '@/components/GameScreen';
import { TypingWord, KanaDisplay } from '@/types/typing';
import { PerWordScoreLog } from '@/types/score';

interface GamePlayingScreenProps {
  currentWord: TypingWord;
  currentKanaIndex: number;
  kanaDisplay: KanaDisplay;
  scoreLog: PerWordScoreLog[];
}

/**
 * タイピングゲームのプレイ画面コンポーネント
 */
export default function GamePlayingScreen({
  currentWord,
  currentKanaIndex,
  kanaDisplay,
  scoreLog
}: GamePlayingScreenProps) {
  return (
    <motion.div 
      className="bg-transparent rounded p-4 md:p-8 text-center w-full max-w-screen-md max-w-[98vw] animate-fadeIn min-h-[40vh] flex flex-col items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ゲーム画面 */}
      <GameScreen 
        currentWord={currentWord}
        currentKanaIndex={currentKanaIndex}
        currentKanaDisplay={kanaDisplay}
      />

      {/* プログレスバーとステータス */}
      <div className="w-full max-w-md mx-auto mt-6">
        <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-amber-400"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min((scoreLog.length / 10) * 100, 100)}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="flex justify-between text-xs md:text-sm text-gray-400 mt-2 font-mono">
          <div>WORDS: {scoreLog.length}</div>
          {scoreLog.length > 0 && (
            <>
              <div>KPM: {Math.round(scoreLog.reduce((sum, log) => sum + log.kpm, 0) / scoreLog.length)}</div>
              <div>ACC: {Math.round(scoreLog.reduce((sum, log) => sum + log.accuracy, 0) / scoreLog.length)}%</div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
