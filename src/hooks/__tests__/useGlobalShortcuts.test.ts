import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useGlobalShortcuts } from '../useGlobalShortcuts';

describe('useGlobalShortcuts', () => {
  function HookTest({ callback }: { callback: (result: any) => void }) {
    const result = useGlobalShortcuts();
    useEffect(() => {
      callback(result);
    }, [result, callback]);
    return null;
  }
  it('ショートカット登録・解除', () => {
    let hookResult: any = undefined;
    render(<HookTest callback={r => { hookResult = r; }} />);
    expect(typeof hookResult.register).toBe('function');
    expect(typeof hookResult.unregister).toBe('function');
  });
});
