// Model Context Protocol (MCP) サーバー
// GitHub Copilotとの連携を支援するためのローカルサーバー

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// サーバー設定
const PORT = process.env.MCP_PORT || 3004;
const HOST = 'localhost';
const SERVER_START_TIME = Date.now();

// 統計情報
let stats = {
  connections: 0,
  requests: 0
};

// リポジトリ情報をキャッシュするオブジェクト
let repoInfoCache = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

/**
 * GitHubリポジトリの情報を取得する
 */
function getRepositoryInfo() {
  // キャッシュがあり、有効期限内であれば使用
  if (repoInfoCache && (Date.now() - repoInfoCache.timestamp < CACHE_DURATION)) {
    return repoInfoCache.data;
  }

  try {
    // gitコマンドを実行してリモート情報を取得
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const lastCommit = execSync('git log -1 --pretty=format:"%h - %s"', { encoding: 'utf8' }).trim();
    
    // 変更ステータスを取得
    const status = execSync('git status -s', { encoding: 'utf8' }).trim();
    const hasChanges = status.length > 0;

    const data = {
      remoteUrl,
      currentBranch,
      lastCommit,
      hasUncommittedChanges: hasChanges,
      changesCount: hasChanges ? status.split('\n').length : 0
    };

    // 結果をキャッシュ
    repoInfoCache = {
      timestamp: Date.now(),
      data
    };

    return data;
  } catch (error) {
    console.error('Gitリポジトリ情報の取得に失敗:', error.message);
    return {
      error: 'Gitリポジトリ情報の取得に失敗しました',
      message: error.message
    };
  }
}

/**
 * プロジェクト構造情報を取得する
 */
function getProjectStructure(maxDepth = 3) {
  const basePath = process.cwd();
  const ignorePatterns = [
    'node_modules', '.git', '.next', 'out', 'build', 'dist',
    '*.log', '.DS_Store', '.env', '.env.*', '*.lock'
  ];

  function shouldIgnore(filePath) {
    return ignorePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(path.basename(filePath));
      }
      return filePath.includes(pattern);
    });
  }

  function scanDirectory(dirPath, currentDepth = 0, relativePath = '') {
    if (currentDepth > maxDepth || shouldIgnore(dirPath)) {
      return { type: 'directory', name: path.basename(dirPath), truncated: true };
    }

    try {
      const entries = fs.readdirSync(dirPath);
      const contents = entries
        .filter(entry => !shouldIgnore(path.join(dirPath, entry)))
        .map(entry => {
          const fullPath = path.join(dirPath, entry);
          const entryRelativePath = path.join(relativePath, entry);
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            if (currentDepth === maxDepth) {
              return { type: 'directory', name: entry, truncated: true };
            }
            return {
              type: 'directory',
              name: entry,
              contents: scanDirectory(fullPath, currentDepth + 1, entryRelativePath)
            };
          } else {
            return { 
              type: 'file', 
              name: entry,
              size: stats.size,
              path: entryRelativePath
            };
          }
        });

      return contents;
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
      return [{ type: 'error', message: error.message }];
    }
  }

  return {
    rootPath: basePath,
    structure: scanDirectory(basePath, 0, '')
  };
}

/**
 * パッケージ情報を取得する
 */
function getPackageInfo() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {})
      };
    }
    return { error: 'package.json not found' };
  } catch (error) {
    return { error: error.message };
  }
}

// HTTPサーバーの作成
const server = http.createServer((req, res) => {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストに対する対応
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 統計情報を更新
  stats.connections++;
  stats.requests++;

  // URLに基づいて処理を分岐
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // ステータスエンドポイント
  if (pathname === '/mcp/status') {
    const uptime = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'running',
      version: '1.0.0',
      uptime,
      connections: stats.connections,
      requests: stats.requests
    }));
  }
  // リポジトリ情報エンドポイント
  else if (pathname === '/mcp/repository') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getRepositoryInfo()));
  }
  // プロジェクト構造エンドポイント
  else if (pathname === '/mcp/project') {
    const depthParam = url.searchParams.get('depth');
    const depth = depthParam ? parseInt(depthParam, 10) : 3;
    
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getProjectStructure(depth)));
  }
  // パッケージ情報エンドポイント
  else if (pathname === '/mcp/package') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getPackageInfo()));
  }
  // その他の不明なエンドポイント
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// サーバー起動
server.listen(PORT, HOST, () => {
  console.log(`MCPサーバーが起動しました - http://${HOST}:${PORT}`);
  console.log('使用可能なエンドポイント:');
  console.log(`- http://${HOST}:${PORT}/mcp/status - サーバーステータス`);
  console.log(`- http://${HOST}:${PORT}/mcp/repository - リポジトリ情報`);
  console.log(`- http://${HOST}:${PORT}/mcp/project - プロジェクト構造`);
  console.log(`- http://${HOST}:${PORT}/mcp/package - パッケージ情報`);
});

// エラーハンドリング
server.on('error', (error) => {
  console.error('サーバーエラー:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`ポート ${PORT} は既に使用されています。別のポートを指定してください。`);
    process.exit(1);
  }
});

// プロセス終了時のクリーンアップ
process.on('SIGINT', () => {
  console.log('MCPサーバーをシャットダウンしています...');
  server.close(() => {
    console.log('MCPサーバーが正常にシャットダウンしました。');
    process.exit(0);
  });
});