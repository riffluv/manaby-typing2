'use client';

import { useState, useEffect } from 'react';
import TypingGame from '@/components/TypingGame';
import { useGameStatus } from '@/store/typingGameStore';

function MainMenu({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80')`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      backgroundColor: '#0a0a23', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{background: 'rgba(20,30,60,0.7)', borderRadius: 24, boxShadow: '0 0 32px #00f2ff88', padding: '2rem 3rem', color: '#fff', backdropFilter: 'blur(8px)', maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: 8, color: '#67e8f9', textShadow: '0 0 8px #00f2ff88'}}>SFタイピングゲーム</h1>
        <button onClick={onStart} style={{padding: '1rem 2.5rem', borderRadius: 16, background: '#06b6d4', color: '#fff', fontWeight: 'bold', fontSize: '1.25rem', boxShadow: '0 0 32px #00f2ff88', border: 'none', marginBottom: 24, cursor: 'pointer'}}>スタート</button>
        <div style={{width: '100%'}}>
          <span style={{fontSize: '1.1rem', fontWeight: 600, color: '#a5f3fc', marginBottom: 8, display: 'block'}}>モード選択</span>
          <button style={{width: '100%', padding: '0.75rem', borderRadius: 12, background: '#334155', color: '#fff', fontWeight: 'bold', border: '2px solid #67e8f9', cursor: 'pointer', opacity: 1}}>Normal</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [scene, setScene] = useState<'menu'|'game'|'result'|'ranking'>('menu');
  const gameStatus = useGameStatus();

  // ゲーム終了時にリザルト画面へ遷移
  useEffect(() => {
    if (scene === 'game' && gameStatus === 'finished') {
      setScene('result');
    }
  }, [scene, gameStatus]);

  if (scene === 'menu') return <MainMenu onStart={() => setScene('game')} />;
  if (scene === 'game') return <TypingGame />;
  if (scene === 'result') return (
    <div style={{minHeight:'100vh',width:'100vw',backgroundImage:`url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80')`,backgroundSize:'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat',backgroundColor:'#0a0a23',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'rgba(20,30,60,0.7)',borderRadius:24,boxShadow:'0 0 32px #00f2ff88',padding:'2rem 3rem',color:'#fff',backdropFilter:'blur(8px)',maxWidth:400,width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:32}}>
        <h1 style={{fontSize:'2rem',fontWeight:'bold',marginBottom:8,color:'#67e8f9',textShadow:'0 0 8px #00f2ff88'}}>リザルト画面</h1>
        <button onClick={()=>setScene('ranking')} style={{padding:'1rem 2.5rem',borderRadius:16,background:'#06b6d4',color:'#fff',fontWeight:'bold',fontSize:'1.25rem',boxShadow:'0 0 32px #00f2ff88',border:'none',marginBottom:24,cursor:'pointer'}}>ランキングへ</button>
        <button onClick={()=>setScene('menu')} style={{padding:'0.75rem 2rem',borderRadius:12,background:'#334155',color:'#fff',fontWeight:'bold',border:'2px solid #67e8f9',cursor:'pointer',opacity:1}}>メニューへ</button>
      </div>
    </div>
  );
  if (scene === 'ranking') return (
    <div style={{minHeight:'100vh',width:'100vw',backgroundImage:`url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80')`,backgroundSize:'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat',backgroundColor:'#0a0a23',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'rgba(20,30,60,0.7)',borderRadius:24,boxShadow:'0 0 32px #00f2ff88',padding:'2rem 3rem',color:'#fff',backdropFilter:'blur(8px)',maxWidth:400,width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:32}}>
        <h1 style={{fontSize:'2rem',fontWeight:'bold',marginBottom:8,color:'#67e8f9',textShadow:'0 0 8px #00f2ff88'}}>RANKING画面</h1>
        <button onClick={()=>setScene('menu')} style={{padding:'0.75rem 2rem',borderRadius:12,background:'#334155',color:'#fff',fontWeight:'bold',border:'2px solid #67e8f9',cursor:'pointer',opacity:1}}>メニューへ</button>
      </div>
    </div>
  );
  return null;
}
