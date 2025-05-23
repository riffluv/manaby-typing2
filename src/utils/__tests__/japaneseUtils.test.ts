import { japaneseToRomajiMap } from '../japaneseUtils';

describe('japaneseToRomajiMap', () => {
  it('ひらがな→ローマ字変換が正しい', () => {
    expect(japaneseToRomajiMap['し']).toContain('shi');
    expect(japaneseToRomajiMap['ち']).toContain('chi');
    expect(japaneseToRomajiMap['ふ']).toContain('fu');
  });
});
