'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TypingGame from '@/components/TypingGame';
import RetroBackground from '@/components/RetroBackground';
import { useTypingGameStore } from '@/store/typingGameStore';
import ShortcutFooter, { Shortcut } from '@/components/ShortcutFooter';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import NewRankingScreen from '@/components/NewRankingScreen';

function MainMenu({ onStart, onRanking, onRetry }: { onStart: () => void, onRanking: () => void, onRetry: () => void }) {
  const { resetGame, setGameStatus } = useTypingGameStore();
  const handleStart = () => {
    resetGame();
    // ゲーム開始時に直接playing状態にする
    setGameStatus('playing');
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
  
  // ショートカット案内
  const shortcuts: Shortcut[] = [
    { key: 'Space', label: 'スタート' },
    { key: 'Alt+R', label: 'ランキング' },
    { key: 'R', label: 'リトライ' },
  ];

  // ショートカット定義
  useGlobalShortcuts([
    {
      key: ' ',
      handler: (e) => { e.preventDefault(); onStart(); },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => {
        e.preventDefault();
        onRanking();
      },
    },
    {
      key: 'r',
      handler: (e) => {
        e.preventDefault();
        onRetry();
      },
    },
  ], [onStart, onRanking, onRetry]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white font-mono relative py-10">
      {/* 背景エフェクト - ボーダーなしに修正 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{border: 'none'}}>
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

      <ShortcutFooter shortcuts={shortcuts} />
    </div>
  );
}

export default function Home() {
  const [scene, setScene] = useState<'menu'|'game'|'ranking'>('menu');
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gray-900 overflow-hidden" style={{border: 'none'}}>
      {/* レトロな宇宙背景 - メニュー画面とランキング画面では新しいスタイルを適用するため非表示 */}
      {scene === 'game' && <RetroBackground />}
      <div className="relative z-10 w-full flex items-center justify-center" style={{border: 'none'}}>
        {scene === 'menu' && <MainMenu onStart={() => setScene('game')} onRanking={() => setScene('ranking')} onRetry={() => {/* リトライ処理をここに実装 */}} />}
        {scene === 'game' && <TypingGame onGoMenu={() => setScene('menu')} onGoRanking={() => setScene('ranking')} />}
        {scene === 'ranking' && <NewRankingScreen onGoMenu={() => setScene('menu')} />}
      </div>
    </div>
  );
}
