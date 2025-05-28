import { render, screen } from '@testing-library/react';
import UnifiedTypingGame from '../UnifiedTypingGame';

describe('UnifiedTypingGame', () => {
  it('ゲーム本体の初期表示', () => {
    render(
      <UnifiedTypingGame />
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
