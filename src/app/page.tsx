'use client';

import { useRouter } from 'next/navigation';

function MainMenu() {
  const router = useRouter();
  return (
    <div className="panel">
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: 8, color: '#67e8f9', textShadow: '0 0 8px #00f2ff88'}}>SFタイピングゲーム</h1>
        <button onClick={() => router.push('/game')} style={{padding: '1rem 2.5rem', borderRadius: 16, background: '#06b6d4', color: '#fff', fontWeight: 'bold', fontSize: '1.25rem', boxShadow: '0 0 32px #00f2ff88', border: 'none', marginBottom: 24, cursor: 'pointer'}}>スタート</button>
        <div style={{width: '100%'}}>
          <span style={{fontSize: '1.1rem', fontWeight: 600, color: '#a5f3fc', marginBottom: 8, display: 'block'}}>モード選択</span>
          <button style={{width: '100%', padding: '0.75rem', borderRadius: 12, background: '#334155', color: '#fff', fontWeight: 'bold', border: '2px solid #67e8f9', cursor: 'pointer', opacity: 1}}>Normal</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <MainMenu />;
}
