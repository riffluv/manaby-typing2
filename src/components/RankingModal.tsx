'use client';

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

  return (
    <CommonModal open={show} onClose={onClose}>
      <h3 className="modal-title">RANKING REGISTRATION</h3>
      {done ? (
        <div className="modal-success">
          <div className="success-message">登録が完了しました！</div>
          <CommonButton onClick={onClose} variant="primary">閉じる</CommonButton>
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
            <CommonButton
              onClick={onSubmit}
              variant="primary"
              disabled={registering || isScoreRegistered}
            >登録</CommonButton>
            <CommonButton
              onClick={onClose}
              variant="secondary"
            >キャンセル</CommonButton>
            {error && <div className="error-message">{error}</div>}
          </div>
        </form>
      )}
    </CommonModal>
  );
}
