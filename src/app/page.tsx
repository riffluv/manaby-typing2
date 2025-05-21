export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundImage: `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#0a0a23', // 画像が表示されない場合の宇宙っぽい色
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* 必要ならここにロゴやタイトルを追加 */}
    </div>
  );
}
