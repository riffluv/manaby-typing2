// manaby2専用ランキング Firestore操作ユーティリティ
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  limit,
  query,
  Timestamp
} from 'firebase/firestore';

const COLLECTION = 'RANKING_MANABY2';

export type RankingEntry = {
  name: string;
  kpm: number;
  accuracy: number;
  correct: number;
  miss: number;
  createdAt: Date;
};

// ランキング登録（名前・スコア）
export async function addRankingEntry(entry: Omit<RankingEntry, 'createdAt'>) {
  try {
    console.log('[Firestore] 登録開始', entry);
    const result = await addDoc(collection(db, COLLECTION), {
      ...entry,
      createdAt: Timestamp.now()
    });
    console.log('[Firestore] 登録完了', result);
    return result;
  } catch (e) {
    console.error('[Firestore] 登録エラー', e);
    throw e;
  }
}

function isRankingEntry(data: any): data is RankingEntry {
  return (
    typeof data?.name === 'string' &&
    typeof data?.kpm === 'number' &&
    typeof data?.accuracy === 'number' &&
    typeof data?.correct === 'number' &&
    typeof data?.miss === 'number' &&
    (data?.createdAt instanceof Date || (data?.createdAt && typeof data.createdAt.toDate === 'function'))
  );
}

function safeToDate(createdAt: any): Date {
  if (createdAt instanceof Date) return createdAt;
  if (createdAt && typeof createdAt.toDate === 'function') return createdAt.toDate();
  return new Date();
}

// ランキング取得（上位N件）
export async function getRankingEntries(topN = 30): Promise<RankingEntry[]> {
  try {
    console.log('[Firestore] ランキング取得開始');
    const q = query(
      collection(db, COLLECTION),
      orderBy('kpm', 'desc'),
      limit(topN)
    );
    const snap = await getDocs(q);
    console.log('[Firestore] 取得件数', snap.size);
    return snap.docs.map(doc => {
      const data = doc.data();
      if (isRankingEntry(data)) {
        return {
          name: data.name,
          kpm: data.kpm,
          accuracy: data.accuracy,
          correct: data.correct,
          miss: data.miss,
          createdAt: safeToDate(data.createdAt)
        };
      } else {
        // 型不正時はデフォルト値で返す
        return {
          name: '[不正データ]',
          kpm: 0,
          accuracy: 0,
          correct: 0,
          miss: 0,
          createdAt: new Date()
        };
      }
    });
  } catch (e) {
    console.error('[Firestore] ランキング取得エラー', e);
    throw e;
  }
}
