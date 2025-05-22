'use client';

export default function Ranking() {
  return (
    <div className="panel">
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32}}>
        <h1 style={{fontSize:'2rem',fontWeight:'bold',marginBottom:8,color:'#67e8f9',textShadow:'0 0 8px #00f2ff88'}}>RANKING画面</h1>
        <button onClick={()=>window.location.href = '/'} style={{padding:'0.75rem 2rem',borderRadius:12,background:'#334155',color:'#fff',fontWeight:'bold',border:'2px solid #67e8f9',cursor:'pointer',opacity:1}}>メニューへ</button>
      </div>
    </div>
  );
}
