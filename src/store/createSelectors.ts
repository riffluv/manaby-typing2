import { StoreApi, UseBoundStore } from 'zustand';

/**
 * Zustandストア用のセレクター作成ヘルパー
 * このユーティリティ関数は、Zustandストア全体へのアクセスと
 * 個別のプロパティへのアクセスを両方提供するセレクターを生成します
 */
export const createSelectors = <T extends object, F extends object = T>(
  store: UseBoundStore<StoreApi<T>>
) => {
  const useStore = store;
  
  // Proxy オブジェクトを使用して、store(selector) の形式のアクセスを可能に
  const useSelectors = new Proxy(
    {},
    {
      get: (_, prop: string) => {
        // prop が元のストアのプロパティであれば、セレクターを返す
        return useStore((state) => {
          const storeState = state as any;
          if (prop in storeState) {
            return storeState[prop];
          }
          return undefined;
        });
      },
    }
  );
  
  // 元のストアとセレクター機能を組み合わせて返す
  return Object.assign(useStore, useSelectors as F);
};
