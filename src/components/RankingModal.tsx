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
 * monkeytype × THE FINALS サイバーパンク美学
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
    <div className="modal-overlay">
      <AnimatePresence mode="wait">
        <motion.div
          key={done ? 'done' : 'form'}
          className="modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          layout
        >
          <h3 className="modal-title">RANKING REGISTRATION</h3>
          {done ? (
            <div className="modal-success">
              <div className="success-message">登録が完了しました！</div>
              <button 
                onClick={onClose} 
                className="btn-primary"
              >
                閉じる
              </button>
            </div>
          ) : (
            <form className="modal-form" onSubmit={onSubmit}>
              <input
                type="text"
                placeholder="名前を入力（10文字以内）"
                maxLength={10}
                value={name}
                onChange={e => onChangeName(e.target.value)}
                className="modal-input"
                disabled={registering || isScoreRegistered}
              />
              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={registering || !name.trim() || isScoreRegistered}
                >
                  {registering ? '登録中...' : '登録する'}
                </button>
                {error && <div className="error-message">{error}</div>}
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="btn-secondary"
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
