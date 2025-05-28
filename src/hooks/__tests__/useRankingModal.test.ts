import { renderHook, act } from '@testing-library/react-hooks';
import { useRankingModal } from '../useRankingModal';

describe('useRankingModal', () => {
  it('モーダルの開閉状態', () => {
    const { result } = renderHook(() => useRankingModal());
    expect(result.current.isOpen).toBe(false);
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
