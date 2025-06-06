/**
 * WasmLoader - WebAssemblyファイル読み込み最適化
 * Next.js環境での安全で確実なWebAssembly読み込み
 */

interface WasmModule {
  WasmTypingCore: any;
  default: (wasmPath?: string | WebAssembly.Module) => Promise<any>;
}

class WasmLoader {
  private static instance: WasmLoader;
  private wasmModule: WasmModule | null = null;
  private isLoading = false;
  private loadPromise: Promise<WasmModule | null> | null = null;

  private constructor() {}

  public static getInstance(): WasmLoader {
    if (!WasmLoader.instance) {
      WasmLoader.instance = new WasmLoader();
    }
    return WasmLoader.instance;
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
  }
  private async _loadWasmModuleInternal(): Promise<WasmModule | null> {
    if (typeof window === 'undefined') {
      console.log('🔧 サーバーサイド環境 - WebAssembly読み込みをスキップ');
      return null;
    }

    try {
      console.log('🚀 WebAssembly読み込み開始...');

      // 方法1: Next.js最適化された動的インポート
      try {
        console.log('📦 Next.js最適化動的インポートでWebAssemblyモジュール読み込み中...');
        
        // Next.jsの静的アセット配信を利用
        const response = await fetch('/wasm/wasm_typing_core.js');
        if (!response.ok) {
          throw new Error(`JSファイル読み込み失敗: ${response.status}`);
        }
        
        const jsCode = await response.text();
        
        // ES6モジュールとして評価
        const blob = new Blob([jsCode], { type: 'application/javascript' });
        const moduleUrl = URL.createObjectURL(blob);
        
        // ES6モジュールとしてインポート
        const wasmModule = await import(moduleUrl);
        
        console.log('✅ WebAssemblyモジュール読み込み完了');
        console.log('🔍 モジュールプロパティ:', Object.keys(wasmModule));

        // WebAssemblyを初期化
        if (wasmModule.default && typeof wasmModule.default === 'function') {
          console.log('🚀 WebAssemblyバイナリ初期化中...');
          
          // WebAssemblyバイナリファイルを読み込み
          const wasmBinaryResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
          if (!wasmBinaryResponse.ok) {
            throw new Error(`WebAssemblyバイナリ読み込み失敗: ${wasmBinaryResponse.status}`);
          }
          
          const wasmBinary = await wasmBinaryResponse.arrayBuffer();
          await wasmModule.default(wasmBinary);
          
          console.log('✅ WebAssemblyバイナリ初期化完了');
        }

        // WasmTypingCoreクラスの確認
        if (wasmModule.WasmTypingCore) {
          console.log('🎯 WasmTypingCoreクラス発見');
          
          // メモリクリーンアップ
          URL.revokeObjectURL(moduleUrl);
          
          this.wasmModule = wasmModule as WasmModule;
          return this.wasmModule;
        } else {
          console.warn('⚠️ WasmTypingCoreクラスが見つかりません');
          console.log('利用可能なエクスポート:', Object.keys(wasmModule));
        }

      } catch (nextjsImportError) {
        console.warn('📦 Next.js動的インポート失敗:', nextjsImportError);
          // 方法2: fetch方式（より安全）
        try {
          console.log('🔄 fetch方式でWebAssembly読み込み...');
          
          const wasmScriptResponse = await fetch('/wasm/wasm_typing_core.js');
          if (!wasmScriptResponse.ok) {
            throw new Error(`WebAssemblyスクリプト読み込み失敗: ${wasmScriptResponse.status}`);
          }
          
          const wasmScriptText = await wasmScriptResponse.text();
          const scriptBlob = new Blob([wasmScriptText], { type: 'application/javascript' });
          const scriptUrl = URL.createObjectURL(scriptBlob);
          
          const wasmModule = await import(/* webpackIgnore: true */ scriptUrl);
          
          console.log('✅ WebAssemblyモジュール読み込み完了（fetch方式）');
          
          if (wasmModule.default && typeof wasmModule.default === 'function') {
            const wasmResponse = await fetch('/wasm/wasm_typing_core_bg.wasm');
            if (!wasmResponse.ok) {
              throw new Error(`WebAssemblyバイナリ読み込み失敗: ${wasmResponse.status}`);
            }
            
            const wasmBinary = await wasmResponse.arrayBuffer();
            await wasmModule.default(wasmBinary);
          }
          
          if (wasmModule.WasmTypingCore) {
            this.wasmModule = wasmModule as WasmModule;
            return this.wasmModule;
          }

        } catch (fallbackError) {
          console.warn('🔄 従来動的インポート失敗:', fallbackError);
          throw fallbackError;
        }
      }

      throw new Error('すべてのWebAssembly読み込み方法が失敗しました');

    } catch (error) {
      console.error('❌ WebAssembly読み込み完全失敗:', error);
      this.wasmModule = null;
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

export default WasmLoader;
