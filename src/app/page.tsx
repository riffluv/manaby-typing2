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
    <div className="panel">
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: 8, color: '#67e8f9', textShadow: '0 0 8px #00f2ff88'}}>SFタイピングゲーム</h1>
        <button onClick={handleStart} style={{padding: '1rem 2.5rem', borderRadius: 16, background: '#06b6d4', color: '#fff', fontWeight: 'bold', fontSize: '1.25rem', boxShadow: '0 0 32px #00f2ff88', border: 'none', marginBottom: 24, cursor: 'pointer'}}>スタート</button>
        <div style={{width: '100%'}}>
          <span style={{fontSize: '1.1rem', fontWeight: 600, color: '#a5f3fc', marginBottom: 8, display: 'block'}}>モード選択</span>
          <button style={{width: '100%', padding: '0.75rem', borderRadius: 12, background: '#334155', color: '#fff', fontWeight: 'bold', border: '2px solid #67e8f9', cursor: 'pointer', opacity: 1}}>Normal</button>
        </div>
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
    <div className="panel">
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%'}}>
        <h1 style={{fontSize:'2rem',fontWeight:'bold',marginBottom:8,color:'#67e8f9',textShadow:'0 0 8px #00f2ff88'}}>RANKING画面</h1>
        {loading && <div style={{color:'#fff'}}>読み込み中...</div>}
        {error && <div style={{color:'#f87171'}}>{error}</div>}
        {!loading && !error && (
          <table style={{width:'100%',maxWidth:400,background:'#222',borderRadius:12,overflow:'hidden',boxShadow:'0 0 16px #00f2ff44'}}>
            <thead>
              <tr style={{background:'#334155',color:'#67e8f9'}}>
                <th style={{padding:'0.5rem'}}>順位</th>
                <th style={{padding:'0.5rem'}}>名前</th>
                <th style={{padding:'0.5rem'}}>KPM</th>
                <th style={{padding:'0.5rem'}}>正確率</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 && (
                <tr><td colSpan={4} style={{color:'#fff',textAlign:'center',padding:'1rem'}}>データなし</td></tr>
              )}
              {ranking.map((r, i) => (
                <tr key={i} style={{background:i%2?'#1e293b':'#222',color:'#fff'}}>
                  <td style={{textAlign:'center',fontWeight:'bold'}}>{i+1}</td>
                  <td style={{textAlign:'center'}}>{r.name}</td>
                  <td style={{textAlign:'center'}}>{r.kpm}</td>
                  <td style={{textAlign:'center'}}>{r.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={onGoMenu} style={{padding:'0.75rem 2rem',borderRadius:12,background:'#334155',color:'#fff',fontWeight:'bold',border:'2px solid #67e8f9',cursor:'pointer',opacity:1}}>メニューへ</button>
      </div>
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
