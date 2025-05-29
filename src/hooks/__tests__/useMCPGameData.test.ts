import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useMCPGameData } from '../useMCPGameData';

describe('useMCPGameData', () => {
  function HookTest({ callback }: { callback: (result: any) => void }) {
    const result = useMCPGameData();
    useEffect(() => {
      callback(result);
    }, [result, callback]);
    return null;
  }
  it('初期値が正しい', () => {
    let hookResult: any = undefined;
    render(<HookTest callback={r => { hookResult = r; }} />);
    expect(hookResult).toBeDefined();
  });
});
