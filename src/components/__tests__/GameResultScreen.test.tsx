import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameResultScreen from '../GameResultScreen';

describe('GameResultScreen', () => {
  it('リザルト画面の基本表示', () => {
    render(
      <GameResultScreen
        resultScore={{
          kpm: 123,
          accuracy: 95.5,
          correct: 10,
          miss: 2,
        }}
        scoreLog={[]}
        onCalculateFallbackScore={jest.fn()}
        isScoreRegistered={false}
        onOpenRankingModal={jest.fn()}
        onReset={jest.fn()}
        onGoRanking={jest.fn()}
        onGoMenu={jest.fn()}
      />
    );
    expect(screen.getByText(/リザルト|結果|score|kpm/i)).toBeInTheDocument();
    expect(screen.getByText(/123/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/95.5/)).toBeInTheDocument();
  });
});
