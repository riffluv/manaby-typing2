import { addRankingEntry, getRankingEntries, RankingEntry } from '../rankingManaby2';

describe('rankingManaby2 Firestoreユーティリティ', () => {
  it('getRankingEntries: データ取得型安全', async () => {
    const entries = await getRankingEntries(3);
    expect(Array.isArray(entries)).toBe(true);
    entries.forEach(e => {
      expect(typeof e.name).toBe('string');
      expect(typeof e.kpm).toBe('number');
      expect(typeof e.accuracy).toBe('number');
      expect(typeof e.correct).toBe('number');
      expect(typeof e.miss).toBe('number');
      expect(e.createdAt instanceof Date).toBe(true);
    });
  });

  // Firestore書き込みはCI環境ではスキップ推奨
  it.skip('addRankingEntry: データ登録', async () => {
    const entry: Omit<RankingEntry, 'createdAt'> = {
      name: 'テスト',
      kpm: 100,
      accuracy: 99,
      correct: 50,
      miss: 1
    };
    const result = await addRankingEntry(entry);
    expect(result).toBeDefined();
  });
});
