import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useScoreCalculationSimple } from '../useScoreCalculationSimple';

describe('useScoreCalculationSimple', () => {
  function HookTest({ callback }: { callback: (result: any) => void }) {
    const result = useScoreCalculationSimple([]);
    useEffect(() => {
      callback(result);
    }, [result, callback]);
    return null;
  }
  it('初期値が正しい', () => {
    let hookResult: any = undefined;
    render(<HookTest callback={r => { hookResult = r; }} />);
    expect(hookResult.totalScore).toBe(0);
    expect(hookResult.correct).toBe(0);
    expect(hookResult.miss).toBe(0);
    expect(hookResult.accuracy).toBe(100);
  });
});
