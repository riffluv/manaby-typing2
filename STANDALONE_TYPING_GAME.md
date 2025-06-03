# StandaloneTypingGame - 独立タイピングゲームコンポーネント

## 概要

`StandaloneTypingGame`は、Phase 1「タイピング処理の分離」の成果として作成された、SPA遷移システムから完全に独立したタイピングゲームコンポーネントです。

## 特徴

### ✅ 完全な独立性
- **SPA依存なし**: Next.jsのルーター、グローバルストア、シーンナビゲーションに一切依存しない
- **自己完結型**: 内部で必要な状態をすべて管理
- **外部統合容易**: シンプルなpropsとコールバックで外部システムと連携

### ✅ 高性能タイピング処理
- **BasicTypingEngine活用**: 既存の高速タイピングエンジンを使用
- **useSimpleTyping統合**: React hooksによる最適化されたタイピング処理
- **typingmania-ref流設計**: シンプルで効率的な実装

### ✅ 柔軟な設定
- **カスタム問題数**: デフォルト8問、任意に変更可能
- **カスタム単語リスト**: 独自の問題セットを使用可能
- **自動スタート制御**: 即座開始またはスタート画面表示

## API仕様

### Props

```typescript
interface StandaloneTypingGameProps {
  /** 問題数（デフォルト: 8） */
  questionCount?: number;
  
  /** カスタム単語リスト（未指定時はデフォルトのwordListを使用） */
  customWordList?: Array<{ japanese: string; hiragana: string }>;
  
  /** ゲーム完了時のコールバック */
  onGameComplete?: (finalScore: GameScoreLog['total'], scoreLog: PerWordScoreLog[]) => void;
  
  /** メニューに戻るコールバック */
  onGoMenu?: () => void;
  
  /** ランキングに移動するコールバック */
  onGoRanking?: () => void;
  
  /** 自動スタート（デフォルト: true） */
  autoStart?: boolean;
}
```

### スコアデータ形式

```typescript
// 最終スコア
GameScoreLog['total'] = {
  kpm: number;      // 1分間あたりのキー入力数
  accuracy: number; // 精度 (0-1)
  correct: number;  // 正解数
  miss: number;     // ミス数
}

// 単語ごとのスコアログ
PerWordScoreLog = {
  keyCount: number;   // 総キー入力数
  correct: number;    // 正解キー数
  miss: number;       // ミスキー数
  duration: number;   // 所要時間（秒）
  kpm: number;        // KPM
  accuracy: number;   // 精度
  startTime: number;  // 開始時刻
  endTime: number;    // 終了時刻
}
```

## 使用例

### 基本的な使用方法

```tsx
import StandaloneTypingGame from '@/components/StandaloneTypingGame';

const MyApp = () => {
  const handleGameComplete = (finalScore, scoreLog) => {
    console.log('ゲーム完了:', finalScore);
    // スコア保存、表示などの処理
  };

  return (
    <StandaloneTypingGame
      questionCount={10}
      onGameComplete={handleGameComplete}
      onGoMenu={() => console.log('メニューへ')}
      onGoRanking={() => console.log('ランキングへ')}
    />
  );
};
```

### カスタム単語リストの使用

```tsx
const customWords = [
  { japanese: "プログラミング", hiragana: "ぷろぐらみんぐ" },
  { japanese: "タイピング", hiragana: "たいぴんぐ" },
  // ... 他の単語
];

<StandaloneTypingGame
  customWordList={customWords}
  questionCount={5}
  autoStart={false}
  onGameComplete={handleComplete}
/>
```

### 埋め込み統合例

```tsx
const EmbeddedTypingGame = () => {
  const [showGame, setShowGame] = useState(false);
  const [scores, setScores] = useState([]);

  if (!showGame) {
    return (
      <button onClick={() => setShowGame(true)}>
        タイピングゲーム開始
      </button>
    );
  }

  return (
    <StandaloneTypingGame
      onGameComplete={(score, log) => {
        setScores(prev => [...prev, score]);
        setShowGame(false);
      }}
      onGoMenu={() => setShowGame(false)}
    />
  );
};
```

## 動作確認

### デモページ
開発サーバー起動後、以下のURLでStandaloneTypingGameの動作確認ができます：

```
http://localhost:3002/standalone-typing-demo
```

### 操作方法
1. **ゲーム開始**: 「ゲーム開始」ボタンをクリック
2. **タイピング**: 表示された日本語をローマ字で入力
3. **進行確認**: 右上に進行状況（例: 3/5）が表示
4. **中断**: ゲーム中にEscキーでメニューに戻る
5. **結果確認**: 全問完了後にスコア表示とアクション選択

## 技術仕様

### 依存関係
- `@/types`: 型定義（TypingWord, PerWordScoreLog, GameScoreLog）
- `@/data/wordList`: デフォルト問題データ
- `@/utils/basicJapaneseUtils`: 日本語→BasicTypingChar変換
- `@/components/SimpleGameScreen`: ゲーム画面コンポーネント

### 除去された依存関係
- ❌ `useRouter` (Next.js navigation)
- ❌ `useSceneNavigationStore` (グローバル画面状態)
- ❌ `useTypingGameStore` (グローバルゲーム状態)
- ❌ Session storage チェック
- ❌ Scene transition システム

### 状態管理
- **ローカル状態のみ**: `useState`でゲーム状態を管理
- **外部ストア不要**: 自己完結型の状態管理
- **プロプスベース**: 外部連携はコールバックで実現

## Phase 1 達成事項

✅ **タイピング処理の完全分離**
- SPA遷移システムから独立したコンポーネント作成
- グローバルストア依存の除去
- 独立動作可能な自己完結型設計

✅ **高性能タイピング処理の維持**
- BasicTypingEngineの活用継続
- useSimpleTypingによる最適化維持
- タイピング処理性能の劣化なし

✅ **簡単統合の実現**
- propsとコールバックによるシンプルAPI
- カスタム設定の柔軟な対応
- 最小限の外部依存

✅ **動作確認とテスト**
- デモページによる動作検証
- エラーフリーなコンパイル
- 実際のタイピング動作確認

## 次のPhase（Phase 2）への準備

このStandaloneTypingGameは、今後の以下の拡張に対応できる設計になっています：

- **モジュラー化**: 各機能の独立したモジュールとして分離
- **テーマシステム**: UI/UXのカスタマイズ対応
- **結果画面分離**: リザルト処理の独立コンポーネント化
- **設定システム**: ゲーム設定の柔軟な管理

Phase 1の目標である「タイピング処理の分離」が完全に達成されました。
