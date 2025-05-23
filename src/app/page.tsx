'use client';
import { useEffect, useState } from 'react';
import TypingGame from '@/components/TypingGame';
import { useTypingGameStore } from '@/store/typingGameStore';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';

function MainMenu({ onStart }: { onStart: () => void }) {
  const { resetGame } = useTypingGameStore();
  const handleStart = () => {
    resetGame();
    onStart();
  };
  return (
    <div className="panel bg-gradient-to-br from-cyan-900/80 to-blue-900/80 shadow-2xl rounded-2xl p-8 w-full max-w-md flex flex-col items-center gap-8">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-cyan-300 drop-shadow-lg tracking-wide text-center select-none">
        SFタイピングゲーム
      </h1>
      <button
        onClick={handleStart}
        className="w-full py-3 md:py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl text-lg md:text-2xl shadow-lg transition mb-4"
      >
        スタート
      </button>
      <div className="w-full">
        <span className="text-base md:text-lg font-semibold text-cyan-200 mb-2 block">モード選択</span>
        <button
          className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold border-2 border-cyan-300 transition"
        >
          Normal
        </button>
      </div>
    </div>
  );
}

function Ranking({ onGoMenu }: { onGoMenu: () => void }) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getRankingEntries(30)
      .then(setRanking)
      .catch(() => setError('ランキングの取得に失敗しました'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="panel bg-gradient-to-br from-cyan-900/80 to-blue-900/80 shadow-2xl rounded-2xl p-8 w-full max-w-md flex flex-col items-center gap-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-cyan-300 drop-shadow-lg text-center select-none">
        RANKING画面
      </h1>
      {loading && <div className="text-white">読み込み中...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && (
        <div className="w-full overflow-x-auto">
          <table className="w-full max-w-lg bg-slate-900/80 rounded-xl overflow-hidden shadow-lg text-white text-center">
            <thead>
              <tr className="bg-slate-800 text-cyan-300">
                <th className="py-2 px-3">順位</th>
                <th className="py-2 px-3">名前</th>
                <th className="py-2 px-3">KPM</th>
                <th className="py-2 px-3">正確率</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 && (
                <tr><td colSpan={4} className="text-white text-center py-4">データなし</td></tr>
              )}
              {ranking.map((r, i) => (
                <tr key={i} className={i%2 ? "bg-slate-800" : "bg-slate-900"}>
                  <td className="font-bold">{i+1}</td>
                  <td>{r.name}</td>
                  <td>{r.kpm}</td>
                  <td>{r.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={onGoMenu}
        className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold border-2 border-cyan-300 transition"
      >
        メニューへ
      </button>
    </div>
  );
}

export default function Home() {
  const [scene, setScene] = useState<'menu'|'game'|'ranking'>('menu');
  if (scene === 'menu') return <MainMenu onStart={() => setScene('game')} />;
  if (scene === 'game') return <TypingGame onGoMenu={() => setScene('menu')} onGoRanking={() => setScene('ranking')} />;
  if (scene === 'ranking') return <Ranking onGoMenu={() => setScene('menu')} />;
  return null;
}
