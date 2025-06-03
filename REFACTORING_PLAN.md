# タイピングゲーム リファクタリング計画

## 現状の問題

### 1. スパゲティ化の原因
- SPA画面遷移システム（TransitionManager/RPGTransitionSystem）とタイピング処理の不適切な結合
- typingmania-refの段階的移行が中途半端な状態
- 複雑なトランジションシステムがタイピングエンジンの状態管理に干渉

### 2. typingmania-ref vs 現在の構造
```
[typingmania-ref]           [現在]
Controller (ゲーム状態)  →  useSimpleTyping + AppRouter + TransitionManager
Screen (UI表示)         →  SimpleGameScreen + RPGTransitionSystem  
Engine (タイピング)     →  BasicTypingEngine
```

## リファクタリング戦略（優先順位順）

### Phase 1: 緊急対応 - タイピング処理の分離 🔥
**目標**: タイピング処理をSPA遷移システムから完全分離

1. **独立したタイピングコントローラーの作成**
   ```typescript
   // src/game/SimpleTypingController.ts
   // - typingmania-refのControllerパターンを参考
   // - SPA遷移に依存しない独立した状態管理
   // - BasicTypingEngineを直接制御
   ```

2. **タイピング専用レイアウトの作成**
   ```typescript
   // src/components/typing/StandaloneTypingGame.tsx
   // - SPA遷移システムから独立
   // - シンプルなstart/stop制御のみ
   // - デバッグログ除去
   ```

3. **AppRouterとの疎結合化**
   ```typescript
   // AppRouter内でのタイピングゲーム呼び出しを最小化
   // - 単純なコンポーネント渡しのみ
   // - 遷移完了イベントをタイピング処理に伝播させない
   ```

### Phase 2: 段階的リファクタリング 📝
**目標**: typingmania-refパターンに近づける

1. **Screen/Controllerパターンの部分導入**
   ```typescript
   // src/game/screens/TypingScreen.ts
   // src/game/controllers/TypingController.ts
   // - 既存Reactコンポーネントを段階的に移行
   ```

2. **状態管理の簡素化**
   ```typescript
   // - useTypingGameStoreの複雑さを削減
   // - Controller側で状態を一元管理
   ```

### Phase 3: 画面遷移システムの簡素化 🎨
**目標**: 過度に複雑なトランジションシステムの整理

1. **TransitionManagerの簡素化**
   ```typescript
   // - シーン固有設定の削減
   // - シンプルなfade/slide遷移のみに限定
   ```

2. **RPGTransitionSystemの軽量化**
   ```typescript
   // - パーティクルエフェクト等の高級演出を削減
   // - 基本的なトランジションのみ保持
   ```

### Phase 4: 最終整理とテスト 🧹
**目標**: コードの整理と安定性確保

1. **デバッグログの完全除去**
2. **未使用ファイルの削除**
3. **型安全性の向上**
4. **パフォーマンス最適化**

## 実装の優先順位

### 🔥 今すぐ実行 (Phase 1)
1. `StandaloneTypingGame.tsx` の作成
2. `SimpleTypingController.ts` の作成
3. `AppRouter.tsx` からタイピング処理の分離

### 📅 今週中 (Phase 2)
1. Screen/Controllerパターンの部分導入
2. useSimpleTypingの簡素化

### 🎯 今月中 (Phase 3-4)
1. 画面遷移システムの整理
2. 最終コード整理

## リスク評価

### 低リスク（すぐ実行可能）
- タイピング処理の分離
- 独立コンポーネントの作成

### 中リスク（計画的実行が必要）
- 既存状態管理の変更
- Screen/Controllerパターンの導入

### 高リスク（慎重な実行が必要）
- AppRouterの大幅変更
- トランジションシステムの削除

## 次のアクション

1. **まず `StandaloneTypingGame.tsx` を作成**して、SPA遷移に依存しないタイピングゲームを実装
2. **動作確認後**、AppRouterから徐々に移行
3. **段階的にtypingmania-refパターンに近づける**
