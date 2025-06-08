'use client';

import React, { useCallback } from 'react';
import CommonModal from './common/CommonModal';
import CommonButton from './common/CommonButton';

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
 * ランキング登録用モーダルコンポーネント - React最適化版
 * monkeytype × THE FINALS サイバーパンク美学
 * React最適化: React.memo + useCallback最適化
 */
const RankingModal: React.FC<RankingModalProps> = React.memo(({
  show,
  name,
  registering,
  done,
  error,
  isScoreRegistered,
  onSubmit,
  onChangeName,
  onClose
}) => {
  // フォーム送信をメモ化
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  }, [onSubmit]);

  // 名前変更をメモ化
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeName(e.target.value);
  }, [onChangeName]);

  if (!show || typeof window === 'undefined') return null;

  return (
    <CommonModal open={show} onClose={onClose}>
      <h3 className="modal-title">RANKING REGISTRATION</h3>
      {done ? (
        <div className="modal-success">
          <div className="success-message">登録が完了しました！</div>
          <CommonButton onClick={onClose} variant="primary">閉じる</CommonButton>
        </div>
      ) : (        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="名前を入力（10文字以内）"
            maxLength={10}
            value={name}
            onChange={handleNameChange}
            className="modal-input"
            disabled={registering || isScoreRegistered}
          />
          <div className="modal-actions">
            <CommonButton
              onClick={handleSubmit}
              variant="primary"
              disabled={registering || isScoreRegistered}
            >登録</CommonButton>
            <CommonButton
              onClick={onClose}
              variant="secondary"
            >キャンセル</CommonButton>
            {error && <div className="error-message">{error}</div>}
          </div>
        </form>      )}
    </CommonModal>
  );
});

RankingModal.displayName = 'RankingModal';

export default RankingModal;
