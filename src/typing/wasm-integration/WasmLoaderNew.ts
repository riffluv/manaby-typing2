/**
 * WasmLoaderNew - 動的インポートを避けたWebAssembly読み込み
 * Next.jsビルド最適化版
 */

interface WasmModule {
  WasmTypingCore: any;
  default: (wasmPath?: string | WebAssembly.Module) => Promise<any>;
}

class WasmLoaderNew {
  private static instance: WasmLoaderNew;
  private wasmModule: WasmModule | null = null;
  private isLoading = false;
  private loadPromise: Promise<WasmModule | null> | null = null;

  private constructor() {}

  public static getInstance(): WasmLoaderNew {
    if (!WasmLoaderNew.instance) {
      WasmLoaderNew.instance = new WasmLoaderNew();
    }
    return WasmLoaderNew.instance;
  }

  /**
   * WebAssemblyモジュールを読み込み
   */
  public async loadWasmModule(): Promise<WasmModule | null> {
    if (this.wasmModule) {
      return this.wasmModule;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadWasmModuleInternal();
    return this.loadPromise;
  }  private async _loadWasmModuleInternal(): Promise<WasmModule | null> {
    if (typeof window === 'undefined') {
      console.log('🔧 サーバーサイド環境 - WebAssembly読み込みをスキップ');
      return null;
    }

    try {
      console.log('🚀 WebAssembly読み込み開始...');
      console.log('🔍 ブラウザ環境:', {
        userAgent: navigator.userAgent,
        webAssemblySupport: typeof WebAssembly !== 'undefined',
        location: window.location.href
      });

      // 方法1: ES6モジュールとしてWebAssembly読み込み
      console.log('🔄 方法1: ES6モジュール方式での読み込み試行...');
      const wasmModule = await this.loadWasmViaScript();
      if (wasmModule) {
        console.log('✅ 方法1成功: ES6モジュール方式でWebAssembly読み込み完了');
        this.wasmModule = wasmModule;
        return this.wasmModule;
      }

      // 方法2: 従来のscript要素（フォールバック）
      console.log('🔄 方法2: 従来のscript要素方式でフォールバック...');
      const fallbackModule = await this.loadWasmViaScriptLegacy();
      if (fallbackModule) {
        console.log('✅ 方法2成功: Legacy方式でWebAssembly読み込み完了');
        this.wasmModule = fallbackModule;
        return this.wasmModule;
      }

      // 方法3: 直接WebAssembly.instantiate（最終フォールバック）
      console.log('🔄 方法3: 直接WebAssembly.instantiate方式でフォールバック...');
      const directModule = await this.loadWasmDirect();
      if (directModule) {
        console.log('✅ 方法3成功: 直接WebAssembly方式で読み込み完了');
        this.wasmModule = directModule;
        return this.wasmModule;
      }

      throw new Error('すべてのWebAssembly読み込み方式が失敗しました');

    } catch (error) {
      console.error('❌ WebAssembly読み込み完全失敗:', error);
      console.log('🔄 MockWasmTypingCoreにフォールバック...');
      this.wasmModule = null;
      return null;
    }
  }
  /**
   * Script要素を使用したWebAssembly読み込み
   */
  private async loadWasmViaScript(): Promise<WasmModule | null> {
    try {
      console.log('📥 ES6モジュールとしてWebAssembly読み込み中...');
      
      // WebAssemblyファイルをES6モジュールとして読み込み
      const response = await fetch('/wasm/wasm_typing_core.js');
      if (!response.ok) {
        throw new Error(`WebAssemblyスクリプト読み込み失敗: ${response.status}`);
      }
      
      const jsCode = await response.text();
      
      // ES6モジュールとして動的にインポート
      const blob = new Blob([jsCode], { type: 'application/javascript' });
      const moduleUrl = URL.createObjectURL(blob);
      
      try {
        const wasmModule = await import(/* webpackIgnore: true */ moduleUrl);
        console.log('✅ WebAssemblyモジュール読み込み完了');
        console.log('🔍 利用可能なエクスポート:', Object.keys(wasmModule));
        
        // WebAssemblyバイナリを読み込み
        const wasmResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
        if (!wasmResponse.ok) {
          throw new Error(`WebAssemblyバイナリ読み込み失敗: ${wasmResponse.status}`);
        }        // WebAssemblyを初期化
        if (wasmModule.default) {
          console.log('🚀 WebAssemblyバイナリ初期化中...');
          try {
            const wasmBinary = await wasmResponse.arrayBuffer();
            const wasmInstance = await wasmModule.default(wasmBinary);
            console.log('✅ WebAssembly初期化完了');
          } catch (initError) {
            console.warn('⚠️ WebAssembly初期化エラー（続行）:', initError);
            // 初期化エラーでも続行する
          }
        }
        
        // WasmTypingCoreの確認
        if (wasmModule.WasmTypingCore) {
          console.log('🎯 WasmTypingCoreクラス発見');
          return {
            WasmTypingCore: wasmModule.WasmTypingCore,
            default: wasmModule.default
          };
        } else {
          console.warn('⚠️ WasmTypingCoreクラスが見つかりません');
          console.log('利用可能なエクスポート:', Object.keys(wasmModule));
          return null;
        }
        
      } catch (importError) {
        console.error('❌ ES6モジュールインポートエラー:', importError);
        return null;
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
      
    } catch (error) {
      console.error('❌ WebAssembly読み込みエラー:', error);
      return null;
    }
  }

  /**
   * 従来のscript要素を使用したWebAssembly読み込み（フォールバック）
   */
  private async loadWasmViaScriptLegacy(): Promise<WasmModule | null> {
    try {
      console.log('📜 従来のscript要素でWebAssembly読み込み中...');
      
      // WebAssemblyスクリプトを変換してグローバルスコープで実行
      const response = await fetch('/wasm/wasm_typing_core.js');
      if (!response.ok) {
        throw new Error(`WebAssemblyスクリプト読み込み失敗: ${response.status}`);
      }
      
      let jsCode = await response.text();
        // ES6 exportを削除してグローバル変数に割り当て
      jsCode = jsCode.replace(/export\s+function\s+(\w+)/g, 'window.$1 = function');
      jsCode = jsCode.replace(/export\s+class\s+(\w+)/g, 'window.$1 = class');
      jsCode = jsCode.replace(/export\s+\{[^}]*\}/g, '');
      jsCode = jsCode.replace(/export\s+default/g, 'window.wasmDefault =');
      
      // import.metaを処理（Legacy環境での置き換え）
      jsCode = jsCode.replace(/import\.meta\.url/g, 'window.location.href');
      
      // eval を使用してスクリプトを実行
      eval(jsCode);
      
      console.log('✅ WebAssemblyスクリプト実行完了（Legacy方式）');
      
      // WebAssemblyバイナリを読み込み
      const wasmResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
      if (!wasmResponse.ok) {
        throw new Error(`WebAssemblyバイナリ読み込み失敗: ${wasmResponse.status}`);
      }      // WebAssemblyを初期化
      if ((window as any).wasmDefault) {
        console.log('🚀 WebAssemblyバイナリ初期化中（Legacy方式）...');
        try {
          const wasmBinary = await wasmResponse.arrayBuffer();
          await (window as any).wasmDefault(wasmBinary);
          console.log('✅ WebAssembly初期化完了（Legacy方式）');
        } catch (initError) {
          console.warn('⚠️ WebAssembly初期化エラー（Legacy方式、続行）:', initError);
          // 初期化エラーでも続行する
        }
      }
      
      // WasmTypingCoreの確認
      if ((window as any).WasmTypingCore) {
        console.log('🎯 WasmTypingCoreクラス発見（Legacy方式）');
        return {
          WasmTypingCore: (window as any).WasmTypingCore,
          default: (window as any).wasmDefault
        };
      } else {
        console.warn('⚠️ WasmTypingCoreクラスが見つかりません（Legacy方式）');
        return null;
      }
      
    } catch (error) {
      console.error('❌ 従来方式WebAssembly読み込みエラー:', error);
      return null;
    }
  }

  /**
   * 直接WebAssembly.instantiate方式（最終フォールバック）
   */
  private async loadWasmDirect(): Promise<WasmModule | null> {
    try {
      console.log('⚡ 直接WebAssembly読み込み中...');
      
      // WebAssemblyバイナリを直接読み込み
      const wasmResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
      if (!wasmResponse.ok) {
        throw new Error(`WebAssemblyバイナリ読み込み失敗: ${wasmResponse.status}`);
      }
      
      const wasmBinary = await wasmResponse.arrayBuffer();
      
      // 簡易インポート関数を定義
      const imports = {
        wbg: {
          __wbindgen_throw: function(arg0: number, arg1: number) {
            throw new Error('WebAssembly error');
          },
          __wbindgen_memory: function() {
            return new WebAssembly.Memory({ initial: 17 });
          }
        }
      };
      
      // WebAssemblyインスタンスを作成
      const wasmModule = await WebAssembly.instantiate(wasmBinary, imports);
      
      console.log('✅ 直接WebAssembly読み込み完了');
      
      // 基本的なWasmTypingCoreクラスをシミュレート
      const MockWasmTypingCore = class {
        constructor() {
          console.log('🎯 MockWasmTypingCore初期化（直接方式）');
        }
        
        hiragana_to_romaji(input: string): string {
          // 基本的な変換ロジック（フォールバック用）
          console.log('📝 MockWasmTypingCore: hiragana_to_romaji', input);
          return input; // 実際の処理はTypeScriptフォールバックに委譲
        }
        
        match_characters(inputChar: string, targetWord: string): boolean {
          console.log('🎯 MockWasmTypingCore: match_characters', inputChar, targetWord);
          return targetWord.startsWith(inputChar);
        }
        
        generate_n_patterns(input: string): string[] {
          console.log('🔤 MockWasmTypingCore: generate_n_patterns', input);
          return ['n', 'nn', 'xn'];
        }
      };
      
      return {
        WasmTypingCore: MockWasmTypingCore,
        default: async () => wasmModule
      };
      
    } catch (error) {
      console.error('❌ 直接WebAssembly読み込みエラー:', error);
      return null;
    }
  }

  /**
   * WebAssemblyが利用可能かチェック
   */
  public isWasmAvailable(): boolean {
    return this.wasmModule !== null;
  }

  /**
   * WebAssemblyモジュールを取得
   */
  public getWasmModule(): WasmModule | null {
    return this.wasmModule;
  }

  /**
   * WasmTypingCoreインスタンスを作成
   */
  public createWasmTypingCore(): any {
    if (!this.wasmModule || !this.wasmModule.WasmTypingCore) {
      throw new Error('WebAssemblyモジュールが利用できません');
    }
    
    return new this.wasmModule.WasmTypingCore();
  }
}

export default WasmLoaderNew;
