'use client';

import { motion } from 'framer-motion';
import type { GameScoreLog } from '@/types/score';
import type { PerWordScoreLog } from '@/types/score';
import { useEffect } from 'react';
import ShortcutFooter, { Shortcut } from './ShortcutFooter';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

interface GameResultScreenProps {
  resultScore: GameScoreLog['total'] | null;
  scoreLog: PerWordScoreLog[];
  onCalculateFallbackScore: () => void;
  isScoreRegistered: boolean;
  onOpenRankingModal: () => void;
  onReset: () => void;
  onGoRanking: () => void;
  onGoMenu: () => void;
}

/**
 * ゲーム結果表示画面コンポーネント
 */
export default function GameResultScreen({
  resultScore,
  scoreLog,
  onCalculateFallbackScore,
  isScoreRegistered,
  onOpenRankingModal,
  onReset,
  onGoRanking,
  onGoMenu
}: GameResultScreenProps) {
  // ショートカット案内内容
  const shortcuts: Shortcut[] = [
    { key: 'R', label: 'リトライ' },
    { key: 'Alt+R', label: 'ランキング' },
    { key: 'Esc', label: 'メニューへ' },
  ];

  useGlobalShortcuts([
    {
      key: 'r',
      handler: (e) => { e.preventDefault(); onReset(); },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => { e.preventDefault(); onGoRanking(); },
    },
    {
      key: 'Escape',
      handler: (e) => { e.preventDefault(); onGoMenu(); },
    },
  ], [onReset, onGoRanking, onGoMenu]);

  return (
    <motion.div 
      className="bg-transparent rounded p-4 md:p-8 text-center w-full max-w-screen-sm max-w-[95vw] animate-fadeIn min-h-[40vh] flex flex-col items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* リザルト画面 */}
      <h2 className="font-mono font-bold mb-8 text-center" style={{fontSize:'clamp(1.2rem,3vw,2rem)'}}>test complete</h2>
      <div className="grid grid-cols-2 gap-y-6 gap-x-6 md:gap-x-12 text-center mb-10 w-full max-w-xs md:max-w-md mx-auto">
        {resultScore ? (
          <>
            <div>
              <div className="text-gray-400 text-xs md:text-sm mb-1 font-mono">kpm</div>
              <div className="font-mono text-amber-400 font-bold" style={{fontSize:'clamp(1.5rem,4vw,2.5rem)'}}>{Math.floor(resultScore.kpm)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs md:text-sm mb-1 font-mono">accuracy</div>
              <div className="font-mono text-amber-400 font-bold" style={{fontSize:'clamp(1.5rem,4vw,2.5rem)'}}>{Math.floor(resultScore.accuracy)}%</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs md:text-sm mb-1 font-mono">correct</div>
              <div className="font-mono text-green-400 font-bold" style={{fontSize:'clamp(1.2rem,3vw,2rem)'}}>{resultScore.correct}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs md:text-sm mb-1 font-mono">miss</div>
              <div className="font-mono text-red-400 font-bold" style={{fontSize:'clamp(1.2rem,3vw,2rem)'}}>{resultScore.miss}</div>
            </div>
          </>
        ) : scoreLog.length > 0 ? (
          <div className="col-span-2 text-center py-4">
            <div className="text-lg font-mono mb-4">計算中...</div>
            <button 
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 rounded px-4 py-2 font-bold transition-colors"
              onClick={onCalculateFallbackScore}
            >
              スコアを表示
            </button>
          </div>
        ) : (
          <div className="col-span-2 text-center py-4 font-mono">計算中...</div>
        )}
      </div>
      
      <div className="flex flex-col items-center space-y-3 w-full max-w-xs md:max-w-md mx-auto">
        {/* ランキング登録ボタン */}
        {resultScore && !isScoreRegistered && (
          <button 
            onClick={onOpenRankingModal} 
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded transition-colors w-full"
          >
            ランキング登録
          </button>
        )}
        {isScoreRegistered && (
          <div className="text-green-400 font-mono">このスコアは登録済みです</div>
        )}
        <button 
          onClick={onReset} 
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded transition-colors w-full"
        >
          もう一度プレイ
        </button>
        <button 
          onClick={onGoRanking} 
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-colors w-full"
        >
          ランキングへ
        </button>
        <button 
          onClick={onGoMenu} 
          className="px-6 py-2 border border-gray-700 hover:bg-gray-800 text-white font-medium rounded transition-colors w-full"
        >
          メニューへ
        </button>
      </div>
      
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 rounded-lg pointer-events-none"></div>
      <ShortcutFooter shortcuts={shortcuts} />
    </motion.div>
  );
}
