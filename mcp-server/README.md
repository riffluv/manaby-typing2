cd C:\Users\hr-hm\Desktop\newProject\typing-next



このディレクトリには、GitHub Copilotとの連携を支援するMCPサーバーが含まれています。MCPサーバーは、プロジェクトのコンテキスト情報をGitHub Copilotに提供し、より的確な補完と提案を可能にします。

## 機能

- プロジェクト構造の提供
- Gitリポジトリ情報の取得
- パッケージ依存関係の情報提供
- リアルタイムのステータス情報

## 使用方法

### サーバーの起動

```
npm run mcp
```

または

```
node mcp-server/index.js
```

### 利用可能なエンドポイント

- `http://localhost:3003/mcp/status` - サーバーステータス
- `http://localhost:3003/mcp/repository` - リポジトリ情報
- `http://localhost:3003/mcp/project` - プロジェクト構造
- `http://localhost:3003/mcp/package` - パッケージ情報

## 動作確認

サーバーの動作を確認するには、ブラウザで次のURLにアクセスしてください：

```
http://localhost:3003/mcp/status
```

または、プロジェクトに含まれるテストページを使用：

```
/public/mcp-test.html
```

## トラブルシューティング

- **ポートが使用中の場合**: 環境変数 `MCP_PORT` を設定して別のポートを指定してください。
- **Gitリポジトリエラー**: プロジェクトがGitリポジトリとして正しく初期化されていることを確認してください。