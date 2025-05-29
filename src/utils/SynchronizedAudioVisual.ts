// SynchronizedAudioVisual.ts
// ダミー実装（最低限のエラー回避用）
import UnifiedAudioSystem from './UnifiedAudioSystem';

/**
 * タイピング入力時の即時フィードバック（音声＋視覚）
 * @param key 入力キー
 * @param isCorrect 正解かどうか
 * @param visualCallback 視覚フィードバック用コールバック
 */
export function triggerImmediateFeedback(
  key: string,
  isCorrect: boolean,
  visualCallback?: () => void
): void {
  // 正解・不正解で統合音響API経由で効果音を再生
  if (isCorrect) {
    UnifiedAudioSystem.playSuccessSound();
  } else {
    UnifiedAudioSystem.playErrorSound();
  }
  // 視覚フィードバックも即時実行
  if (visualCallback) visualCallback();
}

export function getSyncStats() {
  return null;
}

export function updateConfig(config: any) {
  // 設定更新用ダミー
}
