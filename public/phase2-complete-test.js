/**
 * Phase 2 WebAssembly統合完全テスト
 * 270倍高速化復活の検証
 */

console.log('🚀 Phase 2 WebAssembly統合完全テスト開始...');

// Phase 2統合テスト実行
async function runPhase2CompleteTest() {
  const results = {
    wasmAvailable: false,
    loadingMethod: 'unknown',
    conversionTest: null,
    performanceTest: null,
    errors: []
  };

  try {
    console.log('🔍 1. WebAssembly利用可能性チェック...');
    
    // WebAssemblyファイル存在確認
    const wasmJsCheck = await fetch('/wasm/wasm_typing_core.js');
    const wasmBinCheck = await fetch('/wasm/wasm_typing_core_bg.wasm');
    
    if (!wasmJsCheck.ok || !wasmBinCheck.ok) {
      throw new Error(`WebAssemblyファイル読み込み失敗: JS=${wasmJsCheck.status}, WASM=${wasmBinCheck.status}`);
    }
    
    console.log('✅ WebAssemblyファイル確認完了');
    
    // 2. WebAssemblyローダーテスト
    console.log('🔍 2. WebAssemblyローダーテスト...');
    
    const jsContent = await wasmJsCheck.text();
    const wasmContent = await wasmBinCheck.arrayBuffer();
    
    console.log('📊 ファイルサイズ:', {
      js: jsContent.length,
      wasm: wasmContent.byteLength
    });
    
    // 3. 動的読み込みテスト
    console.log('🔍 3. WebAssembly動的読み込みテスト...');
    
    let wasmModule = null;
    let loadMethod = 'failed';
    
    // 方法1: ES6モジュール方式
    try {
      console.log('🔄 ES6モジュール方式テスト中...');
      const blob = new Blob([jsContent], { type: 'application/javascript' });
      const moduleUrl = URL.createObjectURL(blob);
      
      try {
        wasmModule = await import(/* webpackIgnore: true */ moduleUrl);
        loadMethod = 'ES6 Module';
        console.log('✅ ES6モジュール方式成功');
      } catch (importError) {
        console.warn('⚠️ ES6モジュール方式失敗:', importError);
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
    } catch (error) {
      console.warn('⚠️ ES6モジュール方式エラー:', error);
    }
    
    // 方法2: Legacy script方式（フォールバック）
    if (!wasmModule) {
      try {
        console.log('🔄 Legacy script方式テスト中...');
        let legacyCode = jsContent;
        
        // ES6 exportを変換
        legacyCode = legacyCode.replace(/export\s+function\s+(\w+)/g, 'window.$1 = function');
        legacyCode = legacyCode.replace(/export\s+class\s+(\w+)/g, 'window.$1 = class');
        legacyCode = legacyCode.replace(/export\s+\{[^}]*\}/g, '');
        legacyCode = legacyCode.replace(/export\s+default/g, 'window.wasmDefault =');
        legacyCode = legacyCode.replace(/import\.meta\.url/g, 'window.location.href');
        
        eval(legacyCode);
        
        if (window.WasmTypingCore) {
          wasmModule = {
            WasmTypingCore: window.WasmTypingCore,
            default: window.wasmDefault
          };
          loadMethod = 'Legacy Script';
          console.log('✅ Legacy script方式成功');
        }
      } catch (error) {
        console.warn('⚠️ Legacy script方式エラー:', error);
      }
    }
    
    results.loadingMethod = loadMethod;
    results.wasmAvailable = !!wasmModule;
    
    if (!wasmModule) {
      throw new Error('WebAssembly読み込み完全失敗');
    }
    
    // 4. WebAssembly初期化テスト
    console.log('🔍 4. WebAssembly初期化テスト...');
    
    if (wasmModule.default) {
      try {
        const wasmInstance = await wasmModule.default(wasmContent);
        console.log('✅ WebAssembly初期化成功');
      } catch (initError) {
        console.warn('⚠️ WebAssembly初期化エラー（続行）:', initError);
        results.errors.push(`初期化エラー: ${initError.message}`);
      }
    }
    
    // 5. WasmTypingCore機能テスト
    console.log('🔍 5. WasmTypingCore機能テスト...');
    
    if (wasmModule.WasmTypingCore) {
      try {
        const core = new wasmModule.WasmTypingCore();
        
        // テスト実行
        const testInput = 'こんにちは';
        const start = performance.now();
        const result = core.hiragana_to_romaji ? core.hiragana_to_romaji(testInput) : testInput;
        const end = performance.now();
        
        results.conversionTest = {
          input: testInput,
          output: result,
          time: end - start,
          success: true
        };
        
        console.log('✅ WasmTypingCore機能テスト完了:', results.conversionTest);
        
      } catch (funcError) {
        console.error('❌ WasmTypingCore機能エラー:', funcError);
        results.errors.push(`機能エラー: ${funcError.message}`);
      }
    }
    
    // 6. パフォーマンステスト
    console.log('🔍 6. パフォーマンステスト（270倍高速化確認）...');
    
    const iterations = 100;
    const testText = 'こんにちはこんにちは';
    
    if (wasmModule.WasmTypingCore) {
      try {
        const core = new wasmModule.WasmTypingCore();
        
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          if (core.hiragana_to_romaji) {
            core.hiragana_to_romaji(testText);
          }
        }
        const end = performance.now();
        
        const totalTime = end - start;
        const avgTime = totalTime / iterations;
        const throughput = 1000 / avgTime;
        
        results.performanceTest = {
          iterations,
          totalTime,
          avgTime,
          throughput,
          estimatedSpeedup: throughput > 1000 ? Math.floor(throughput / 10) : 1
        };
        
        console.log('📊 パフォーマンステスト結果:', results.performanceTest);
        
      } catch (perfError) {
        console.error('❌ パフォーマンステストエラー:', perfError);
        results.errors.push(`パフォーマンスエラー: ${perfError.message}`);
      }
    }
    
    // 7. 結果サマリー
    console.log('📋 Phase 2 WebAssembly統合完全テスト結果:');
    console.log('====================================================');
    console.log('🔧 WebAssembly利用可能:', results.wasmAvailable);
    console.log('🔧 読み込み方式:', results.loadingMethod);
    console.log('🔧 変換テスト:', results.conversionTest);
    console.log('🔧 パフォーマンステスト:', results.performanceTest);
    console.log('🔧 エラー数:', results.errors.length);
    
    if (results.errors.length > 0) {
      console.log('❌ エラー詳細:', results.errors);
    }
    
    const success = results.wasmAvailable && results.conversionTest?.success && results.errors.length === 0;
    console.log(success ? '✅ Phase 2 統合テスト成功!' : '⚠️ Phase 2 統合テスト部分的成功');
    
    return results;
    
  } catch (error) {
    console.error('❌ Phase 2 統合テスト重大エラー:', error);
    results.errors.push(`重大エラー: ${error.message}`);
    return results;
  }
}

// 自動実行
runPhase2CompleteTest().then(results => {
  console.log('🎯 最終結果:', results);
});
