import React from 'react';

export type SimpleGameResultScreenProps = {
  onGoMenu: () => void;
  onGoRanking: () => void;
};

/**
 * シンプルなゲーム結果画面
 * - 複雑なスコア計算や状態管理を排除
 * - 基本的な結果表示のみ
 */
const SimpleGameResultScreen: React.FC<SimpleGameResultScreenProps> = ({ 
  onGoMenu, 
  onGoRanking 
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        padding: '2rem'
      }}>
        {/* タイトル */}
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '2rem',
          color: '#00e0ff',
          textShadow: '0 0 20px rgba(0, 224, 255, 0.5)'
        }}>
          お疲れ様でした！
        </h1>
        
        {/* メッセージ */}
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '3rem',
          lineHeight: '1.6',
          color: '#ccc'
        }}>
          タイピング練習が完了しました。<br />
          引き続き練習を頑張りましょう！
        </p>
        
        {/* ボタン */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onGoMenu}
            style={{
              padding: '12px 24px',
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #00e0ff, #0080ff)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 224, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            メニューに戻る
          </button>
          
          <button
            onClick={onGoRanking}
            style={{
              padding: '12px 24px',
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #666, #888)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(136, 136, 136, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ランキング
          </button>
        </div>
        
        {/* ショートカット情報 */}
        <div style={{
          marginTop: '3rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <p>ESC: メニューに戻る | R: ランキング</p>
        </div>
      </div>
    </div>
  );
};

SimpleGameResultScreen.displayName = 'SimpleGameResultScreen';
export default SimpleGameResultScreen;
