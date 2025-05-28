import { renderHook } from '@testing-library/react-hooks';
import { useScoreCalculationSimple } from '../useScoreCalculationSimple';

describe('useScoreCalculationSimple', () => {
  it('初期値が正しい', () => {
    const { result } = renderHook(() => useScoreCalculationSimple([]));
    expect(result.current.totalScore).toBe(0);
    expect(result.current.correct).toBe(0);
    expect(result.current.miss).toBe(0);
    expect(result.current.accuracy).toBe(100);
  });
});
