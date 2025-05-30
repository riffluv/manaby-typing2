'use client';

import React from 'react';
import { useBGMStore } from '@/store/bgmStore';
import type { BGMMode } from '@/utils/BGMPlayer';

interface BGMControllerProps {
  className?: string;
  showModeSelector?: boolean;
  showVolumeControl?: boolean;
}

/**
 * BGM制御コンポーネント（インラインスタイル版）
 * 音量調整、モード切り替え、有効/無効切り替えが可能
 */
const BGMController: React.FC<BGMControllerProps> = ({
  className = '',
  showModeSelector = true,
  showVolumeControl = true
}) => {
  const { 
    currentMode, 
    isPlaying, 
    volume, 
    enabled,
    switchMode,
    setVolume,
    setEnabled,
    stop
  } = useBGMStore();

  const handleModeChange = (mode: BGMMode) => {
    switchMode(mode);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleEnabledToggle = () => {
    setEnabled(!enabled);
  };

  const modes: { value: BGMMode; label: string; emoji: string }[] = [
    { value: 'silent', label: '無音', emoji: '🔇' },
    { value: 'lobby', label: 'ロビー', emoji: '🏠' },
    { value: 'game', label: 'ゲーム', emoji: '🎮' },
    { value: 'result', label: '結果', emoji: '🏆' },
    { value: 'ranking', label: 'ランキング', emoji: '👑' },
    { value: 'settings', label: '設定', emoji: '⚙️' }
  ];

  return (
    <div 
      className={className}
      style={{
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
          🎵 BGMコントロール
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
          <span style={{ color: isPlaying ? '#4CAF50' : '#999' }}>
            {isPlaying ? '▶️' : '⏹️'}
          </span>
          <span>現在: {modes.find(m => m.value === currentMode)?.label || 'Unknown'}</span>
        </div>
      </div>

      {/* BGM有効/無効切り替え */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleEnabledToggle}
          />
          BGM有効
        </label>
      </div>

      {/* 音量制御 */}
      {showVolumeControl && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#333' }}>
            🔊 音量: {(volume * 100).toFixed(0)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!enabled}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </label>
        </div>
      )}

      {/* モード選択 */}
      {showModeSelector && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
            🎵 BGMモード選択
          </h4>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {modes.map(mode => (
              <button
                key={mode.value}
                onClick={() => handleModeChange(mode.value)}
                disabled={!enabled}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: currentMode === mode.value ? '#2196F3' : 'white',
                  color: currentMode === mode.value ? 'white' : 'black',
                  borderColor: currentMode === mode.value ? '#1976D2' : '#ccc',
                  cursor: enabled ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                  opacity: enabled ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
              >
                {mode.emoji} {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 停止ボタン */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={stop}
          disabled={!enabled || !isPlaying}
          style={{
            padding: '8px 16px',
            background: (!enabled || !isPlaying) ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!enabled || !isPlaying) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: (!enabled || !isPlaying) ? 0.5 : 1
          }}
        >
          🛑 停止
        </button>
      </div>
    </div>
  );
};

export default BGMController;
