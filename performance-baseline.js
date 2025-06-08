/**
 * パフォーマンスベースライン測定スクリプト
 * 最適化前後の比較用
 */

const fs = require('fs');
const path = require('path');

// 現在のビルドサイズを取得
function getCurrentBuildSize() {
  const buildDir = path.join(__dirname, '.next');
  if (!fs.existsSync(buildDir)) {
    console.log('⚠️ ビルドディレクトリが見つかりません。npm run build を実行してください。');
    return null;
  }

  // 静的ファイルサイズを計算
  function getDirectorySize(dirPath) {
    let totalSize = 0;
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          totalSize += getDirectorySize(fullPath);
        } else {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.log(`Error reading directory ${dirPath}:`, error.message);
    }
    return totalSize;
  }

  const staticDir = path.join(buildDir, 'static');
  const serverDir = path.join(buildDir, 'server');
  
  const staticSize = fs.existsSync(staticDir) ? getDirectorySize(staticDir) : 0;
  const serverSize = fs.existsSync(serverDir) ? getDirectorySize(serverDir) : 0;
  
  return {
    static: staticSize,
    server: serverSize,
    total: staticSize + serverSize
  };
}

// インポート分析
function analyzeImports() {
  const srcDir = path.join(__dirname, 'src');
  const imports = new Set();
  const exports = new Set();
  
  function analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // import文を抽出
      const importMatches = content.match(/import\s+.*?from\s+['"`]([^'"`]+)['"`]/g);
      if (importMatches) {
        importMatches.forEach(match => {
          const module = match.match(/from\s+['"`]([^'"`]+)['"`]/)?.[1];
          if (module) imports.add(module);
        });
      }
      
      // export文を抽出
      const exportMatches = content.match(/export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+(\w+)/g);
      if (exportMatches) {
        exportMatches.forEach(match => {
          const exported = match.match(/export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+(\w+)/)?.[1];
          if (exported) exports.add(exported);
        });
      }
    } catch (error) {
      // ファイル読み込みエラーは無視
    }
  }
  
  function walkDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDirectory(fullPath);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          analyzeFile(fullPath);
        }
      }
    } catch (error) {
      // ディレクトリエラーは無視
    }
  }
  
  walkDirectory(srcDir);
  
  return {
    totalImports: imports.size,
    totalExports: exports.size,
    externalModules: Array.from(imports).filter(imp => !imp.startsWith('./')),
    internalModules: Array.from(imports).filter(imp => imp.startsWith('./')),
  };
}

// メイン実行
function measureBaseline() {
  console.log('🔍 パフォーマンスベースライン測定開始\n');
  
  // ビルドサイズ測定
  const buildSize = getCurrentBuildSize();
  if (buildSize) {
    console.log('📦 現在のビルドサイズ:');
    console.log(`  静的ファイル: ${(buildSize.static / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  サーバーファイル: ${(buildSize.server / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  合計: ${(buildSize.total / 1024 / 1024).toFixed(2)} MB\n`);
  }
  
  // インポート分析
  const importAnalysis = analyzeImports();
  console.log('📋 コード分析結果:');
  console.log(`  総インポート数: ${importAnalysis.totalImports}`);
  console.log(`  総エクスポート数: ${importAnalysis.totalExports}`);
  console.log(`  外部モジュール: ${importAnalysis.externalModules.length}`);
  console.log(`  内部モジュール: ${importAnalysis.internalModules.length}\n`);
  
  // 重いインポートを特定
  const heavyModules = importAnalysis.externalModules.filter(mod => 
    ['lodash', 'moment', 'antd', '@mui', 'react-bootstrap'].some(heavy => mod.includes(heavy))
  );
  
  if (heavyModules.length > 0) {
    console.log('⚠️ 重いモジュールの検出:');
    heavyModules.forEach(mod => console.log(`  - ${mod}`));
    console.log('');
  }
  
  // Next.js最適化推奨事項
  console.log('💡 最適化推奨順序 (リスク順):');
  console.log('1. 🟢 Tree Shaking: 未使用エクスポートの削除 (低リスク)');
  console.log('2. 🟡 コード分割: 動的インポート (中リスク)');
  console.log('3. 🟡 Service Worker: キャッシュ戦略 (中リスク)');
  console.log('4. 🔴 Web Workers: バックグラウンド処理 (高リスク)\n');
  
  // 結果をファイルに保存
  const baseline = {
    timestamp: new Date().toISOString(),
    buildSize,
    importAnalysis,
    recommendations: {
      lowRisk: ['tree-shaking'],
      mediumRisk: ['code-splitting', 'service-worker'],
      highRisk: ['web-workers']
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'performance-baseline.json'),
    JSON.stringify(baseline, null, 2)
  );
  
  console.log('✅ ベースライン測定完了。performance-baseline.json に保存されました。');
  
  return baseline;
}

// 実行
if (require.main === module) {
  measureBaseline();
}

module.exports = { measureBaseline, getCurrentBuildSize, analyzeImports };
