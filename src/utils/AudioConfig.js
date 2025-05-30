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
    click: 0.3,      // 打鍵音
    error: 0.15,     // エラー音
    success: 0.25,   // 成功音
  }
};

// パフォーマンス測定用
export class AudioPerformanceMonitor {
  static measurements = [];
  
  static measureLatency(callback, label = 'audio') {
    if (!AUDIO_CONFIG.DEBUG_MODE) {
      callback();
      return;
    }
    
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    this.measurements.push({
      label,
      latency,
      timestamp: Date.now()
    });
    
    // 最新100件のみ保持
    if (this.measurements.length > 100) {
      this.measurements = this.measurements.slice(-100);
    }
    
    console.log(`[AudioPerformance] ${label}: ${latency.toFixed(2)}ms`);
  }
  
  static getStats() {
    if (this.measurements.length === 0) return null;
    
    const latencies = this.measurements.map(m => m.latency);
    const avg = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const stdDev = Math.sqrt(
      latencies.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / latencies.length
    );
    
    return { avg, min, max, stdDev, count: latencies.length };
  }
  
  static reset() {
    this.measurements = [];
  }
}

export default AUDIO_CONFIG;
