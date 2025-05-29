import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useTypingGameLifecycle } from '../useTypingGameLifecycle';

describe('useTypingGameLifecycle', () => {
  function HookTest({ callback }: { callback: () => void }) {
    useTypingGameLifecycle();
    useEffect(() => {
      callback();
    }, [callback]);
    return null;
  }
  it('副作用フックが呼ばれる', () => {
    let called = false;
    render(<HookTest callback={() => { called = true; }} />);
    expect(called).toBe(true);
  });
});
