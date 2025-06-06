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
  mode: 'normal' | 'hard' | 'sonkeigo' | 'kenjougo' | 'business'; // 難易度を追加
  createdAt: Date;
};

// ランキング登録（名前・スコア・難易度）
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
    (data?.mode === 'normal' || data?.mode === 'hard') &&
    (data?.createdAt instanceof Date || (data?.createdAt && typeof data.createdAt.toDate === 'function'))
  );
}

function safeToDate(createdAt: any): Date {
  if (createdAt instanceof Date) return createdAt;
  if (createdAt && typeof createdAt.toDate === 'function') return createdAt.toDate();
  return new Date();
}

// ランキング取得（上位N件、modeでフィルタ）
export async function getRankingEntries(topN = 30, mode: 'normal' | 'hard' = 'normal'): Promise<RankingEntry[]> {
  try {
    console.log('[Firestore] ランキング取得開始', mode);
    const q = query(
      collection(db, COLLECTION),
      orderBy('kpm', 'desc'),
      limit(100) // まず多めに取得
    );
    const snap = await getDocs(q);
    console.log('[Firestore] 取得件数', snap.size);
    // modeでフィルタ
    const filtered = snap.docs
      .map(doc => doc.data())
      .filter(data => isRankingEntry(data) && data.mode === mode)
      .map(data => ({
        name: data.name,
        kpm: data.kpm,
        accuracy: data.accuracy,
        correct: data.correct,
        miss: data.miss,
        mode: data.mode,
        createdAt: safeToDate(data.createdAt)
      }))
      .slice(0, topN);
    return filtered;
  } catch (e) {
    console.error('[Firestore] ランキング取得エラー', e);
    throw e;
  }
}

// ランキング全削除（モード指定）
export async function deleteRankingEntriesByMode(mode: 'normal' | 'hard') {
  try {
    const q = query(
      collection(db, COLLECTION),
      // Firestoreのwhereでmode一致を抽出
      // Firestore v9: whereはimportが必要
      // ここではimport済みと仮定
      // import { where } from 'firebase/firestore';
      // where('mode', '==', mode)
    );
    const snap = await getDocs(q);
    const batch = (await import('firebase/firestore')).writeBatch(db);
    let count = 0;
    snap.docs.forEach(doc => {
      const data = doc.data();
      if (data.mode === mode) {
        batch.delete(doc.ref);
        count++;
      }
    });
    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (e) {
    console.error('[Firestore] ランキング削除エラー', e);
    throw e;
  }
}
