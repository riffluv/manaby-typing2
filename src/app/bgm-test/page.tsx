'use client';

import React from 'react';
import BGMController from '@/components/BGMController';
import { useBGMStore } from '@/store/bgmStore';
import { useBGMControl } from '@/hooks/useBGMControl';

/**
 * BGMテストページ
 * MP3ファイル設定前のシステム動作確認用
 */
const BGMTestPage: React.FC = () => {
  const { currentMode, isPlaying, volume, enabled, getStatus } = useBGMStore();
  const bgmControl = useBGMControl();

  const handleQuickTest = () => {
    // クイックテスト：モード切り替えシーケンス
    const sequence = ['lobby', 'game', 'result', 'silent'] as const;
    let index = 0;

    const nextMode = () => {
      if (index < sequence.length) {
        bgmControl.switchTo(sequence[index]);
        index++;
        setTimeout(nextMode, 3000); // 3秒間隔
      }
    };

    nextMode();
  };

  const status = getStatus();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎵 BGMシステムテスト</h1>
      
      <div style={{ 
        background: '#e3f2fd', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>📋 システム情報</h2>
        <p><strong>✅ 打撃音システム:</strong> WebAudio（完全分離・影響なし）</p>
        <p><strong>🎵 BGMシステム:</strong> HTML5 Audio（MP3対応）</p>
        <p><strong>🔄 SPA対応:</strong> ページ遷移で途切れない設計</p>
        <p><strong>📁 MP3配置先:</strong> <code>/public/sounds/bgm/</code></p>
      </div>

      <div style={{ 
        background: '#fff3e0', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>⚠️ 現在の状態</h3>
        <p>BGMファイルが未設定のため、音声は再生されません。</p>
        <p>システムの動作確認とUI操作のテストが可能です。</p>
      </div>

      {/* 現在の状態表示 */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>📊 現在の状態</h3>
        <ul>
          <li><strong>モード:</strong> {currentMode}</li>
          <li><strong>再生中:</strong> {isPlaying ? 'Yes' : 'No'}</li>
          <li><strong>音量:</strong> {(volume * 100).toFixed(0)}%</li>
          <li><strong>有効:</strong> {enabled ? 'Yes' : 'No'}</li>
          <li><strong>設定済み:</strong> {status.trackConfigured ? 'Yes' : 'No'}</li>
        </ul>
      </div>

      {/* BGMコントローラー */}
      <BGMController />

      {/* クイックテストボタン */}
      <div style={{ marginTop: '20px' }}>
        <h3>🧪 クイックテスト</h3>
        <button 
          onClick={handleQuickTest}
          style={{
            padding: '12px 24px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔄 モード切り替えテスト（3秒間隔）
        </button>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          lobby → game → result → silent の順で自動切り替えします
        </p>
      </div>

      {/* 使用例 */}
      <div style={{ 
        background: '#e8f5e8', 
        padding: '16px', 
        borderRadius: '8px', 
        marginTop: '20px' 
      }}>
        <h3>💡 MP3ファイル設定方法</h3>
        <ol>
          <li><code>/public/sounds/bgm/</code> フォルダを作成</li>
          <li>BGMファイルを配置（例：<code>lobby-theme.mp3</code>）</li>
          <li><code>src/utils/BGMPlayer.ts</code> の <code>BGM_TRACKS</code> を更新</li>
          <li>自動的にBGMが再生開始されます</li>
        </ol>
        
        <h4>📁 推奨ファイル名</h4>
        <ul>
          <li><code>lobby-theme.mp3</code> - ロビー用</li>
          <li><code>game-battle.mp3</code> - ゲーム用</li>
          <li><code>result-fanfare.mp3</code> - 結果発表用</li>
          <li><code>ranking-epic.mp3</code> - ランキング用</li>
          <li><code>settings-calm.mp3</code> - 設定画面用</li>
        </ul>
      </div>
    </div>
  );
};

export default BGMTestPage;
