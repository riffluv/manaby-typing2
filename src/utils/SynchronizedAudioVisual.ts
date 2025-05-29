// SynchronizedAudioVisual.ts
// ダミー実装（最低限のエラー回避用）
import { playSound } from './soundPlayer';

export function triggerImmediateFeedback(key: string, isCorrect: boolean, visualCallback?: () => void): void {
  // 正解・不正解で効果音を再生
  if (isCorrect) {
    playSound('correct');
  } else {
    playSound('wrong');
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
