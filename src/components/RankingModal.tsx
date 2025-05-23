'use client';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface RankingModalProps {
  show: boolean;
  name: string;
  registering: boolean;
  done: boolean;
  error: string;
  isScoreRegistered: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChangeName: (name: string) => void;
  onClose: () => void;
}

/**
 * ランキング登録用モーダルコンポーネント
 */
export default function RankingModal({
  show,
  name,
  registering,
  done,
  error,
  isScoreRegistered,
  onSubmit,
  onChangeName,
  onClose
}: RankingModalProps) {
  if (!show || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={done ? 'done' : 'form'}
          className="bg-gray-900 rounded-lg p-6 md:p-8 shadow-xl w-full max-w-md mx-4 border border-gray-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          layout
        >
          <h3 className="text-xl font-mono font-semibold mb-6 text-amber-400">ランキング登録</h3>
          {done ? (
            <div className="min-h-[120px] flex flex-col items-center justify-center">
              <div className="text-green-400 font-bold text-lg mb-4">登録が完了しました！</div>
              <button 
                onClick={onClose} 
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
              >
                閉じる
              </button>
            </div>
          ) : (
            <form className="min-h-[120px]" onSubmit={onSubmit}>
              <input
                type="text"
                placeholder="名前を入力（10文字以内）"
                maxLength={10}
                value={name}
                onChange={e => onChangeName(e.target.value)}
                className="p-3 rounded border border-gray-600 w-full text-center mb-4 bg-gray-800 text-white font-mono text-base md:text-lg"
                disabled={registering || isScoreRegistered}
              />
              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded font-bold transition-colors disabled:opacity-50 w-full"
                  disabled={registering || !name.trim() || isScoreRegistered}
                >
                  {registering ? '登録中...' : '登録する'}
                </button>
                {error && <div className="text-red-400 text-sm my-2 font-mono">{error}</div>}
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors w-full"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
