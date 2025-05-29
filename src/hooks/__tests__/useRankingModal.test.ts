import { render, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useRankingModal } from '../useRankingModal';

describe('useRankingModal', () => {
  function HookTest({ callback }: { callback: (result: any) => void }) {
    const result = useRankingModal();
    useEffect(() => {
      callback(result);
    }, [result, callback]);
    return null;
  }
  it('モーダルの開閉状態', () => {
    let hookResult: any = undefined;
    render(React.createElement(HookTest, { callback: (r: any) => { hookResult = r; } }));
    expect(hookResult).toBeDefined();
    expect(hookResult.isOpen).toBe(false);
    act(() => {
      hookResult.open();
    });
    expect(hookResult.isOpen).toBe(true);
    act(() => {
      hookResult.close();
    });
    expect(hookResult.isOpen).toBe(false);
  });
});
