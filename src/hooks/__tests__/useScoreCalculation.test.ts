import { renderHook } from '@testing-library/react-hooks';
import { useScoreCalculation } from '../useScoreCalculation';

describe('useScoreCalculation', () => {
  it('スコア計算の初期値', () => {
    const { result } = renderHook(() => useScoreCalculation([]));
    expect(result.current.totalScore).toBe(0);
    expect(result.current.correct).toBe(0);
    expect(result.current.miss).toBe(0);
    expect(result.current.accuracy).toBe(100);
  });
});
