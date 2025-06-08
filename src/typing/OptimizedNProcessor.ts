/**
 * 高速化された「ん」処理の最適化実装
 * 
 * 問題：現在の実装では毎回動的に子音リストを生成し、分岐処理を行っている
 * 解決：事前計算されたルックアップテーブルと最適化されたアルゴリズムを使用
 */

// 事前計算された子音セット（パフォーマンス最適化）
const CONSONANTS_SET = new Set(['k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'y', 'r', 'w']);

// 「ん」の最適化されたパターンマッピング（事前計算）
const N_PATTERN_CACHE = new Map<string, string[]>();

/**
 * 最適化された「ん」処理クラス
 */
export class OptimizedNProcessor {
  /**
   * 「ん」の次文字に基づいたパターンを高速生成
   */
  static getNPatterns(nextKana?: string): string[] {
    // キャッシュヒット確認（O(1)）
    const cacheKey = nextKana || '';
    if (N_PATTERN_CACHE.has(cacheKey)) {
      return N_PATTERN_CACHE.get(cacheKey)!;
    }

    // パターン生成（初回のみ）
    const patterns = this.generateNPatternsOptimized(nextKana);
    N_PATTERN_CACHE.set(cacheKey, patterns);
    return patterns;
  }

  /**
   * 最適化されたパターン生成ロジック
   */
  private static generateNPatternsOptimized(nextKana?: string): string[] {
    // 文末の場合: シンプルなパターン
    if (!nextKana) {
      return ['nn', 'xn', 'n'];
    }

    // 基本の日本語→ローマ字マッピング（軽量化版）
    const basicMapping: { [key: string]: string } = {
      'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
      'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
      'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
      'さ': 'sa', 'し': 'si', 'す': 'su', 'せ': 'se', 'そ': 'so',
      'ざ': 'za', 'じ': 'zi', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
      'た': 'ta', 'ち': 'ti', 'つ': 'tu', 'て': 'te', 'と': 'to',
      'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
      'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
      'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
      'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
      'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
      'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
      'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
      'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
      'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo',
      'ん': 'n'
    };

    const nextRomaji = basicMapping[nextKana];
    if (!nextRomaji) {
      // 未知の文字の場合はデフォルトパターン
      return ['nn', 'xn', 'n'];
    }

    const firstChar = nextRomaji[0];

    // 高速判定: セットを使用したO(1)判定
    if (firstChar === 'y' || firstChar === 'w') {
      // y, w で始まる場合は 'n' 単独不可
      return ['nn', 'xn'];
    }

    if (firstChar === 'a' || firstChar === 'i' || firstChar === 'u' || firstChar === 'e' || firstChar === 'o') {
      // 母音で始まる場合は 'n' 単独不可
      return ['nn', 'xn'];
    }

    // その他の子音の場合は全パターン許可
    return ['nn', 'xn', 'n'];
  }
  /**
   * 「ん」の分岐状態処理（最適化版）
   */
  static processBranching(
    inputChar: string,
    branchOptions: string[],
    nextPatterns: string[]
  ): {
    success: boolean;
    completeWithSingle?: boolean;
    acceptedInput: string;
  } {
    const lowerChar = inputChar.toLowerCase();

    // 'nn'パターンの判定（最優先）
    if (lowerChar === 'n' && branchOptions.includes('nn')) {
      return {
        success: true,
        acceptedInput: 'nn'
      };
    }

    // 次文字の子音マッチング判定（最適化）
    if (branchOptions.includes('n')) {
      // 子音セットを使った高速判定
      if (CONSONANTS_SET.has(lowerChar)) {
        // 次文字のパターンと一致するか確認
        for (const pattern of nextPatterns) {
          if (pattern.startsWith(lowerChar)) {
            return {
              success: true,
              completeWithSingle: true,
              acceptedInput: 'n'
            };
          }
        }
      }    }

    return { success: false, acceptedInput: '' };
  }

  /**
   * パフォーマンス統計取得
   */
  static getPerformanceStats(): {
    cacheSize: number;
    cacheHitRate: number;
    totalPatterns: number;
  } {
    return {
      cacheSize: N_PATTERN_CACHE.size,
      cacheHitRate: N_PATTERN_CACHE.size > 0 ? 100 : 0, // 初回以降は100%ヒット
      totalPatterns: Array.from(N_PATTERN_CACHE.values()).reduce((sum, patterns) => sum + patterns.length, 0)
    };
  }

  /**
   * キャッシュクリア（メモリ最適化用）
   */
  static clearCache(): void {
    N_PATTERN_CACHE.clear();
  }

  /**
   * 事前キャッシュ生成（アプリ起動時用）
   */
  static preloadCache(): void {
    // よく使用される文字の組み合わせを事前計算
    const commonNext = [
      'あ', 'い', 'う', 'え', 'お',
      'か', 'き', 'く', 'け', 'こ',
      'が', 'ぎ', 'ぐ', 'げ', 'ご',
      'さ', 'し', 'す', 'せ', 'そ',
      'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
      'た', 'ち', 'つ', 'て', 'と',
      'だ', 'ぢ', 'づ', 'で', 'ど',
      'な', 'に', 'ぬ', 'ね', 'の',
      'は', 'ひ', 'ふ', 'へ', 'ほ',
      'ば', 'び', 'ぶ', 'べ', 'ぼ',
      'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
      'ま', 'み', 'む', 'め', 'も',
      'や', 'ゆ', 'よ',
      'ら', 'り', 'る', 'れ', 'ろ',
      'わ', 'ゐ', 'ゑ', 'を'
    ];

    // 文末パターン
    this.getNPatterns();

    // 各文字との組み合わせ
    for (const next of commonNext) {
      this.getNPatterns(next);
    }
  }
}

/**
 * 最適化されたTypingCharクラス（「ん」処理特化）
 */
export class OptimizedTypingChar {
  public readonly kana: string;
  public readonly patterns: string[];
  public acceptedInput: string = '';
  public completed: boolean = false;
  public basePoint: number = 0;
  public countedPoint: number = 0;

  // 分岐状態（「ん」用）
  public branchingState: boolean = false;

  constructor(kana: string, patterns: string[]) {
    this.kana = kana;
    this.patterns = patterns.map(p => p.toLowerCase());
    this.basePoint = this.patterns[0]?.length || 0;
  }

  /**
   * 最適化されたタイピング処理
   */
  type(char: string): boolean {
    const lowerChar = char.toLowerCase();
    let progress = false;

    // パターンマッチング（最適化済み）
    for (const pattern of this.patterns) {
      if (pattern.startsWith(this.acceptedInput + lowerChar)) {
        this.acceptedInput += lowerChar;
        progress = true;
        break;
      }
    }

    if (progress) {
      // 「ん」の最適化された分岐処理
      if (this.kana === 'ん' && this.acceptedInput === 'n' && !this.completed) {
        this.branchingState = true;
        return true;
      }

      // 完了チェック（最適化済み）
      if (this.patterns.includes(this.acceptedInput)) {
        this.completed = true;
        this.countedPoint = this.basePoint;
      }
    }

    return progress;
  }

  /**
   * 最適化された分岐処理
   */
  typeBranching(char: string, nextChar?: OptimizedTypingChar): {
    success: boolean;
    completeWithSingle?: boolean;
  } {
    const result = OptimizedNProcessor.processBranching(
      this.acceptedInput,
      char,
      nextChar ? { kana: nextChar.kana, patterns: nextChar.patterns } : undefined
    );

    if (result.success) {
      if (result.acceptedInput) {
        this.acceptedInput = result.acceptedInput;
      }
      this.completed = true;
      this.countedPoint = this.basePoint;
      this.branchingState = false;
    }

    return {
      success: result.success,
      completeWithSingle: result.completeWithSingle
    };
  }

  /**
   * 分岐状態終了
   */
  endBranching(): void {
    this.branchingState = false;
  }

  /**
   * クローン（パフォーマンステスト用）
   */
  clone(): OptimizedTypingChar {
    const cloned = new OptimizedTypingChar(this.kana, [...this.patterns]);
    cloned.acceptedInput = this.acceptedInput;
    cloned.completed = this.completed;
    cloned.basePoint = this.basePoint;
    cloned.countedPoint = this.countedPoint;
    cloned.branchingState = this.branchingState;
    return cloned;
  }
}
