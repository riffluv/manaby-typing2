import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTypingGameStore } from '@/store/typingGameStore';
import ShortcutFooter, { Shortcut } from '@/components/ShortcutFooter';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { containerVariants, itemVariants, buttonVariants } from '@/styles/animations';

interface MainMenuProps {
  onStart: () => void;
  onRanking: () => void;
  onRetry: () => void;
}

/**
 * メインメニュー画面コンポーネント
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStart, onRanking, onRetry }) => {
  const { resetGame, setGameStatus, setMode } = useTypingGameStore();
  const [selectedMode, setSelectedMode] = useState<'normal' | 'hard'>('normal');

  // ゲーム開始ハンドラー
  const handleStart = () => {
    resetGame();
    setMode(selectedMode);
    setGameStatus('playing');
    onStart();
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
      handler: (e) => { e.preventDefault(); handleStart(); },
    },
    {
      key: 'r',
      altKey: true,
      handler: (e) => { e.preventDefault(); onRanking(); },
    },
    {
      key: 'r',
      handler: (e) => { e.preventDefault(); onRetry(); },
    },
  ], [handleStart, onRanking, onRetry]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
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
            whileHover={buttonVariants.hover}
            whileTap={buttonVariants.tap}
          >
            スタート
          </motion.button>
        </motion.div>
        
        {/* モード選択 */}
        <motion.div variants={itemVariants} className="w-full">
          <h2 className="text-amber-400 font-mono text-lg mb-3">モード選択</h2>
          <div className="grid grid-cols-1 gap-3">
            <button
              className={`py-3 px-6 rounded-md border flex items-center justify-between transition-all duration-200 font-medium ${selectedMode === 'normal' ? 'bg-amber-500 text-gray-900 border-amber-500' : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-amber-500/30'}`}
              onClick={() => setSelectedMode('normal')}
            >
              <span>Normal</span>
              {selectedMode === 'normal' && <span className="text-amber-400">●</span>}
            </button>
            <button
              className={`py-3 px-6 rounded-md border flex items-center justify-between transition-all duration-200 font-medium ${selectedMode === 'hard' ? 'bg-amber-500 text-gray-900 border-amber-500' : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-amber-500/30'}`}
              onClick={() => setSelectedMode('hard')}
            >
              <span>Hard</span>
              {selectedMode === 'hard' && <span className="text-amber-400">●</span>}
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
};

export default MainMenu;
