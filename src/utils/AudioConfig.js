// AudioConfig.js - 🚀 超高速音響システム設定
'use client';

// 🚀 爆速WebAudio + 超高速MP3統合システム
export const AUDIO_CONFIG = {
  // 常に'ultrafast'（爆速WebAudio）を使用
  ENGINE: 'ultrafast',
  
  // デバッグモード（パフォーマンス測定）
  DEBUG_MODE: true,
  
  // 自動初期化（常にtrue）
  AUTO_INITIALIZE: true,
  
  // 🚀 最適化済み音量設定
  VOLUME: {
    click: 0.5,      // 打鍵音（音量向上要請対応：0.3 → 0.5）
    error: 0.15,     // エラー音
    success: 0.25,   // 成功音
  }
};

export default AUDIO_CONFIG;
