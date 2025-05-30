// AudioConfig.js - 音響システム設定
'use client';

// 使用する音響システムの選択
export const AUDIO_CONFIG = {
  // 'legacy', 'lightweight', または 'ultrafast'
  ENGINE: 'ultrafast',
    // デバッグモード（パフォーマンス測定）
  DEBUG_MODE: true,
  
  // プリレンダリングバッファーの初期化を自動で行うか
  AUTO_INITIALIZE: true,
  
  // 音量設定
  VOLUME: {
    click: 0.3,
    error: 0.15,
    success: 0.25,
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
