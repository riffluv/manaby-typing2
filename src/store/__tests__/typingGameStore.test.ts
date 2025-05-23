import { act } from 'react-dom/test-utils';
import { useTypingGameStore } from '../typingGameStore';

describe('useTypingGameStore', () => {
  it('初期状態が正しい', () => {
    const store = useTypingGameStore.getState();
    expect(store.gameStatus).toBe('ready');
    expect(store.currentWordIndex).toBe(0);
    expect(store.currentWord).toBeDefined();
  });

  it('setGameStatusで状態が変わる', () => {
    act(() => {
      useTypingGameStore.getState().setGameStatus('playing');
    });
    expect(useTypingGameStore.getState().gameStatus).toBe('playing');
  });

  it('resetGameで初期化される', () => {
    act(() => {
      useTypingGameStore.getState().setGameStatus('finished');
      useTypingGameStore.getState().resetGame();
    });
    expect(useTypingGameStore.getState().gameStatus).toBe('ready');
    expect(useTypingGameStore.getState().currentWordIndex).toBe(0);
  });
});
