import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useScoreCalculation } from '../useScoreCalculation';

describe('useScoreCalculation', () => {
  function HookTest({ callback }: { callback: (result: any) => void }) {
    const result = useScoreCalculation('', 0, 0);
    useEffect(() => {
      callback(result);
    }, [result, callback]);
    return null;
  }
  it('スコア計算の初期値', () => {
    let hookResult: any = undefined;
    render(<HookTest callback={r => { hookResult = r; }} />);
    expect(hookResult.totalScore).toBe(0);
    expect(hookResult.correct).toBe(0);
    expect(hookResult.miss).toBe(0);
    expect(hookResult.accuracy).toBe(100);
  });
});
