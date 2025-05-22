'use client';
import { useState } from 'react';
import TypingGame from '@/components/TypingGame';
import { useTypingGameStore } from '@/store/typingGameStore';

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
  return (
    <div className="panel">
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32}}>
        <h1 style={{fontSize:'2rem',fontWeight:'bold',marginBottom:8,color:'#67e8f9',textShadow:'0 0 8px #00f2ff88'}}>RANKING画面</h1>
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
