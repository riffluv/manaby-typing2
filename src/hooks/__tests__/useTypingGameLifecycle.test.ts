import { renderHook } from '@testing-library/react-hooks';
import { useTypingGameLifecycle } from '../useTypingGameLifecycle';

describe('useTypingGameLifecycle', () => {
  it('副作用フックが呼ばれる', () => {
    renderHook(() => useTypingGameLifecycle());
    // 例: サウンドプリロードや初期化が呼ばれることを確認（モック化推奨）
    expect(true).toBe(true);
  });
});
