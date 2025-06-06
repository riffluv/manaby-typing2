// Phase 2 WebAssembly修正版テストスクリプト
// ブラウザコンソールで実行するためのデバッグスクリプト

console.log('🚀 Phase 2 WebAssembly修正版テスト開始...');

async function testWasmFixedLoader() {
  try {
    console.log('📦 WasmLoaderNewをインポート中...');
    
    // テスト環境情報を出力
    console.log('🔍 ブラウザ環境情報:', {
      userAgent: navigator.userAgent,
      webAssemblySupport: typeof WebAssembly !== 'undefined',
      fetchSupport: typeof fetch !== 'undefined',
      location: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // WebAssemblyファイルの存在確認
    console.log('📁 WebAssemblyファイル存在確認中...');
    const wasmJsResponse = await fetch('/wasm/wasm_typing_core.js');
    const wasmBinResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
    
    console.log('📊 WebAssemblyファイル状況:', {
      jsFile: {
        status: wasmJsResponse.status,
        ok: wasmJsResponse.ok,
        size: wasmJsResponse.headers.get('content-length')
      },
      wasmFile: {
        status: wasmBinResponse.status,
        ok: wasmBinResponse.ok,
        size: wasmBinResponse.headers.get('content-length')
      }
    });
    
    if (!wasmJsResponse.ok || !wasmBinResponse.ok) {
      throw new Error('WebAssemblyファイルが利用できません');
    }
    
    // JavaScriptファイルの内容を一部確認
    const jsContent = await fetch('/wasm/wasm_typing_core.js').then(r => r.text());
    const jsLines = jsContent.split('\n').slice(0, 5);
    console.log('📄 WebAssembly JSファイル先頭5行:', jsLines);
    
    // WebAssemblyバイナリのサイズ確認
    const wasmContent = await fetch('/wasm/wasm_typing_core_bg.wasm').then(r => r.arrayBuffer());
    console.log('📊 WebAssemblyバイナリサイズ:', wasmContent.byteLength, 'bytes');
    
    console.log('✅ WebAssembly修正版ファイル確認完了');
    
    // 動的インポートテスト
    console.log('🔄 動的インポートテスト中...');
    const blob = new Blob([jsContent], { type: 'application/javascript' });
    const moduleUrl = URL.createObjectURL(blob);
    
    try {
      const wasmModule = await import(/* webpackIgnore: true */ moduleUrl);
      console.log('✅ 動的インポート成功');
      console.log('🔍 エクスポート内容:', Object.keys(wasmModule));
      
      if (wasmModule.default) {
        console.log('🚀 WebAssembly初期化テスト中...');
        try {
          const wasmInstance = await wasmModule.default(wasmContent);
          console.log('✅ WebAssembly初期化成功');
          console.log('🎯 WasmTypingCore利用可能:', !!wasmModule.WasmTypingCore);
        } catch (initError) {
          console.warn('⚠️ WebAssembly初期化エラー:', initError);
        }
      }
      
    } catch (importError) {
      console.error('❌ 動的インポートエラー:', importError);
    } finally {
      URL.revokeObjectURL(moduleUrl);
    }
    
  } catch (error) {
    console.error('❌ WebAssembly修正版テストエラー:', error);
  }
}

// テスト実行
testWasmFixedLoader();
