import { renderHook } from '@testing-library/react-hooks';
import { useMCPGameData } from '../useMCPGameData';

describe('useMCPGameData', () => {
  it('初期値が正しい', () => {
    const { result } = renderHook(() => useMCPGameData());
    expect(result.current).toBeDefined();
  });
});
