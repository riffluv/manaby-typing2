// WebAssembly直接テストスクリプト
console.log('🚀 WebAssembly直接テスト開始...');

// Node.js環境でのWebAssembly読み込みテスト
const fs = require('fs');
const path = require('path');

async function testWasmDirect() {
  try {
    // WebAssemblyファイルのパス
    const wasmPath = path.join(__dirname, 'public', 'wasm', 'wasm_typing_core_bg.wasm');
    const jsPath = path.join(__dirname, 'public', 'wasm', 'wasm_typing_core.js');
    
    console.log('📁 WASM ファイル存在確認:', fs.existsSync(wasmPath));
    console.log('📁 JS ファイル存在確認:', fs.existsSync(jsPath));
    
    if (fs.existsSync(wasmPath)) {
      const wasmSize = fs.statSync(wasmPath).size;
      console.log('📊 WASM ファイルサイズ:', wasmSize, 'bytes');
    }
    
    if (fs.existsSync(jsPath)) {
      const jsSize = fs.statSync(jsPath).size;
      console.log('📊 JS ファイルサイズ:', jsSize, 'bytes');
      
      // JSファイルの内容を一部読み取り
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      const lines = jsContent.split('\n').slice(0, 10);
      console.log('📄 JS ファイル先頭10行:');
      lines.forEach((line, i) => console.log(`  ${i+1}: ${line.substring(0, 80)}...`));
    }
    
    console.log('✅ WebAssembly直接テスト完了');
    
  } catch (error) {
    console.error('❌ WebAssembly直接テストエラー:', error);
  }
}

testWasmDirect();
