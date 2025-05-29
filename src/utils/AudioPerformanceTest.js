// AudioPerformanceTest.js - 音響パフォーマンステスト用ユーティリティ
'use client';

import KeyboardSoundUtils from './KeyboardSoundUtils';

class AudioPerformanceTest {
  static async measureClickSoundLatency(iterations = 100) {
    const latencies = [];
    
    console.log(`音響遅延テスト開始 (${iterations}回測定)`);
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // クリック音を再生
      KeyboardSoundUtils.playClickSound();
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      latencies.push(latency);
      
      // 次のテストまで少し待機（ブラウザへの負荷軽減）
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);
    const stdDev = Math.sqrt(
      latencies.reduce((sum, l) => sum + Math.pow(l - avgLatency, 2), 0) / latencies.length
    );
    
    const results = {
      average: avgLatency,
      min: minLatency,
      max: maxLatency,
      standardDeviation: stdDev,
      samples: latencies,
      iterations
    };
    
    console.log('=== 音響遅延テスト結果 ===');
    console.log(`平均遅延: ${avgLatency.toFixed(2)}ms`);
    console.log(`最小遅延: ${minLatency.toFixed(2)}ms`);
    console.log(`最大遅延: ${maxLatency.toFixed(2)}ms`);
    console.log(`標準偏差: ${stdDev.toFixed(2)}ms`);
    console.log(`サンプル数: ${iterations}`);
    
    return results;
  }
  
  static async measureMemoryUsage(callback, iterations = 50) {
    if (!performance.memory) {
      console.warn('Performance.memory は利用できません (Chrome以外のブラウザ)');
      return null;
    }
    
    const initialMemory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
    
    console.log('メモリ使用量テスト開始');
    console.log(`初期メモリ使用量: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB`);
    
    for (let i = 0; i < iterations; i++) {
      callback();
      // メモリ測定のために少し待機
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // ガベージコレクションを促す（手動GCは通常利用できない）
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalMemory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
    
    const memoryDelta = finalMemory.used - initialMemory.used;
    
    console.log('=== メモリ使用量テスト結果 ===');
    console.log(`最終メモリ使用量: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`);
    console.log(`メモリ増加量: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
    console.log(`1回あたりのメモリ増加: ${(memoryDelta / iterations / 1024).toFixed(2)}KB`);
    
    return {
      initial: initialMemory,
      final: finalMemory,
      delta: memoryDelta,
      perIteration: memoryDelta / iterations,
      iterations
    };
  }
  
  static async runComprehensiveTest() {
    console.log('=== 包括的音響パフォーマンステスト開始 ===');
    
    // 遅延テスト
    const latencyResults = await this.measureClickSoundLatency(100);
    
    // メモリ使用量テスト
    const memoryResults = await this.measureMemoryUsage(() => {
      KeyboardSoundUtils.playClickSound();
    }, 50);
    
    // 高頻度テスト（タイピング時の負荷をシミュレート）
    console.log('\n高頻度音生成テスト開始...');
    const rapidStartTime = performance.now();
    
    for (let i = 0; i < 20; i++) {
      KeyboardSoundUtils.playClickSound();
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms間隔（600WPM相当）
    }
    
    const rapidEndTime = performance.now();
    const totalRapidTime = rapidEndTime - rapidStartTime;
    
    console.log(`高頻度テスト完了: ${totalRapidTime.toFixed(2)}ms (20回音生成)`);
    console.log(`1回あたりの平均時間: ${(totalRapidTime / 20).toFixed(2)}ms`);
    
    return {
      latency: latencyResults,
      memory: memoryResults,
      rapidTest: {
        totalTime: totalRapidTime,
        averagePerSound: totalRapidTime / 20,
        soundCount: 20
      }
    };
  }
}

export default AudioPerformanceTest;
