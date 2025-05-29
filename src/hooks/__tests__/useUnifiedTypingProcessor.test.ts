import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useUnifiedTypingProcessor } from '../useUnifiedTypingProcessor';

describe('useUnifiedTypingProcessor', () => {
  function HookTest({ callback }: { callback: (result: any) => void }) {
    const result = useUnifiedTypingProcessor(
      { kana: 'あ', word: 'あ', display: 'あ' } as any,
      jest.fn(),
      jest.fn()
    );
    useEffect(() => {
      callback(result);
    }, [result, callback]);
    return null;
  }
  it('初期化時に状態が返る', (done: any) => {
    let hookResult: any = undefined;
    render(<HookTest callback={r => { hookResult = r; }} />);
    setTimeout(() => {
      expect(hookResult).toBeDefined();
      done();
    }, 0);
  });
});
