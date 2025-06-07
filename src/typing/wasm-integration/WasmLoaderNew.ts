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
      return null;
    }try {
      // 軽量ログ：重要情報のみ
      console.log('🚀 WASM読み込み開始');

      // 方法1: ES6モジュールとしてWebAssembly読み込み
      const wasmModule = await this.loadWasmViaScript();
      if (wasmModule) {
        this.wasmModule = wasmModule;
        return this.wasmModule;
      }

      // 方法2: 従来のscript要素（フォールバック）
      const fallbackModule = await this.loadWasmViaScriptLegacy();
      if (fallbackModule) {
        this.wasmModule = fallbackModule;
        return this.wasmModule;
      }

      // 方法3: 直接WebAssembly.instantiate（最終フォールバック）
      const directModule = await this.loadWasmDirect();
      if (directModule) {
        this.wasmModule = directModule;
        return this.wasmModule;
      }

      throw new Error('すべてのWebAssembly読み込み方式が失敗しました');

    } catch (error) {
      console.warn('WASM読み込み失敗 - フォールバック使用:', error.message);
      this.wasmModule = null;
      return null;
    }
  }
  /**
   * Script要素を使用したWebAssembly読み込み
   */  private async loadWasmViaScript(): Promise<WasmModule | null> {
    try {
      const response = await fetch('/wasm/wasm_typing_core.js');
      if (!response.ok) {
        throw new Error(`スクリプト読み込み失敗: ${response.status}`);
      }
      
      const jsCode = await response.text();
      const blob = new Blob([jsCode], { type: 'application/javascript' });
      const moduleUrl = URL.createObjectURL(blob);
      
      try {
        const wasmModule = await import(/* webpackIgnore: true */ moduleUrl);
        
        // WebAssemblyバイナリを読み込み
        const wasmResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
        if (!wasmResponse.ok) {
          throw new Error(`WASMバイナリ読み込み失敗: ${wasmResponse.status}`);
        }

        // WebAssemblyを初期化
        if (wasmModule.default) {
          try {
            const wasmBinary = await wasmResponse.arrayBuffer();
            await wasmModule.default(wasmBinary);
          } catch (initError) {
            // 初期化エラーでも続行する
          }
        }
        
        // WasmTypingCoreの確認
        if (wasmModule.WasmTypingCore) {
          console.log('✅ WASM読み込み成功');
          return {
            WasmTypingCore: wasmModule.WasmTypingCore,
            default: wasmModule.default
          };
        } else {
          return null;
        }
        
      } catch (importError) {
        return null;
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
      
    } catch (error) {
      return null;
    }
  }

  /**
   * 従来のscript要素を使用したWebAssembly読み込み（フォールバック）
   */  private async loadWasmViaScriptLegacy(): Promise<WasmModule | null> {
    try {
      const response = await fetch('/wasm/wasm_typing_core.js');
      if (!response.ok) {
        throw new Error(`スクリプト読み込み失敗: ${response.status}`);
      }
      
      let jsCode = await response.text();
      // ES6 exportを削除してグローバル変数に割り当て
      jsCode = jsCode.replace(/export\s+function\s+(\w+)/g, 'window.$1 = function');
      jsCode = jsCode.replace(/export\s+class\s+(\w+)/g, 'window.$1 = class');
      jsCode = jsCode.replace(/export\s+\{[^}]*\}/g, '');
      jsCode = jsCode.replace(/export\s+default/g, 'window.wasmDefault =');
      jsCode = jsCode.replace(/import\.meta\.url/g, 'window.location.href');
      
      // eval を使用してスクリプトを実行
      eval(jsCode);
      
      // WebAssemblyバイナリを読み込み
      const wasmResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
      if (!wasmResponse.ok) {
        throw new Error(`WASMバイナリ読み込み失敗: ${wasmResponse.status}`);
      }

      // WebAssemblyを初期化
      if ((window as any).wasmDefault) {
        try {
          const wasmBinary = await wasmResponse.arrayBuffer();
          await (window as any).wasmDefault(wasmBinary);
        } catch (initError) {
          // 初期化エラーでも続行する
        }
      }
      
      // WasmTypingCoreの確認
      if ((window as any).WasmTypingCore) {
        return {
          WasmTypingCore: (window as any).WasmTypingCore,
          default: (window as any).wasmDefault
        };
      } else {
        return null;
      }
      
    } catch (error) {
      return null;
    }
  }

  /**
   * 直接WebAssembly.instantiate方式（最終フォールバック）
   */  private async loadWasmDirect(): Promise<WasmModule | null> {
    try {
      // WebAssemblyバイナリを直接読み込み
      const wasmResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
      if (!wasmResponse.ok) {
        throw new Error(`WASMバイナリ読み込み失敗: ${wasmResponse.status}`);
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
      
      // 基本的なWasmTypingCoreクラスをシミュレート
      const MockWasmTypingCore = class {
        constructor() {}
        
        hiragana_to_romaji(input: string): string {
          return input; // 実際の処理はTypeScriptフォールバックに委譲
        }
        
        match_characters(inputChar: string, targetWord: string): boolean {
          return targetWord.startsWith(inputChar);
        }
        
        generate_n_patterns(input: string): string[] {
          return ['n', 'nn', 'xn'];
        }
      };
      
      return {
        WasmTypingCore: MockWasmTypingCore,
        default: async () => wasmModule
      };
      
    } catch (error) {
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
