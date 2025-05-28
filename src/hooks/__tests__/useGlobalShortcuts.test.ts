import { renderHook, act } from '@testing-library/react-hooks';
import { useGlobalShortcuts } from '../useGlobalShortcuts';

describe('useGlobalShortcuts', () => {
  it('ショートカット登録・解除', () => {
    const { result } = renderHook(() => useGlobalShortcuts());
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.unregister).toBe('function');
  });
});
