import { renderHook } from '@testing-library/react-hooks';
import { useMCP } from '../useMCP';

describe('useMCP', () => {
  it('初期値が正しい', () => {
    const { result } = renderHook(() => useMCP());
    expect(result.current).toBeUndefined();
  });
});
