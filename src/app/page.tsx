'use client';
import { useEffect, useState } from 'react';
import TypingGame from '@/components/TypingGame';
import RetroBackground from '@/components/RetroBackground';
import { useTypingGameStore } from '@/store/typingGameStore';
import { getRankingEntries, RankingEntry } from '@/lib/rankingManaby2';

function MainMenu({ onStart }: { onStart: () => void }) {
  const { resetGame } = useTypingGameStore();
  const handleStart = () => {
    resetGame();
    onStart();
  };
  return (
    <div className="sf-panel backdrop-blur-sm border border-cyan-500/30 bg-slate-900/80 shadow-xl rounded-lg p-6 md:p-8 w-full max-w-md md:max-w-2xl flex flex-col items-center gap-6 md:gap-8">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-1 md:mb-2 text-cyan-300 drop-shadow-lg tracking-wide text-center select-none">
        SFタイピングゲーム
      </h1>
      <button
        onClick={handleStart}
        className="w-full py-3 md:py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-lg md:text-2xl shadow-lg transition mb-2 md:mb-4 border border-cyan-400/30"
      >
        スタート
      </button>
      <div className="w-full">
        <span className="text-base md:text-lg font-semibold text-cyan-200 mb-2 block">モード選択</span>
        <button
          className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold border-2 border-cyan-500/50 transition"
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
    <div className="sf-panel backdrop-blur-sm border border-cyan-500/30 bg-slate-900/80 shadow-xl rounded-lg p-6 md:p-8 w-full max-w-md md:max-w-2xl flex flex-col items-center gap-6 md:gap-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-cyan-300 drop-shadow-lg text-center select-none">
        RANKING画面
      </h1>
      {loading && <div className="text-white">読み込み中...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && (
        <div className="w-full overflow-x-auto">
          <table className="w-full max-w-lg bg-slate-900/80 rounded-xl overflow-hidden shadow-lg text-white text-center">
            <thead>
              <tr className="bg-slate-800/90 text-cyan-300">
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
                <tr key={i} className={i%2 ? "bg-slate-800/70" : "bg-slate-900/70"}>
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
        className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold border-2 border-cyan-500/50 transition"
      >
        メニューへ
      </button>
    </div>
  );
}

export default function Home() {
  const [scene, setScene] = useState<'menu'|'game'|'ranking'>('menu');
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {/* レトロな宇宙背景 */}
      <RetroBackground />
      
      {/* コンテンツコンテナ */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {scene === 'menu' && <MainMenu onStart={() => setScene('game')} />}
        {scene === 'game' && <TypingGame onGoMenu={() => setScene('menu')} onGoRanking={() => setScene('ranking')} />}
        {scene === 'ranking' && <Ranking onGoMenu={() => setScene('menu')} />}
      </div>
    </div>
  );
}
