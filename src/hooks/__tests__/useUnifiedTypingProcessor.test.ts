import { renderHook, act } from '@testing-library/react-hooks';
import { useUnifiedTypingProcessor } from '../useUnifiedTypingProcessor';

describe('useUnifiedTypingProcessor', () => {
  it('初期化時に状態が返る', () => {
    const { result } = renderHook(() =>
      useUnifiedTypingProcessor(
        { kana: 'あ', word: 'あ', display: 'あ' },
        jest.fn(),
        jest.fn()
      )
    );
    expect(result.current).toBeDefined();
  });
});
