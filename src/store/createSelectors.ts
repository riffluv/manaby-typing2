import { StoreApi, UseBoundStore } from 'zustand';

/**
 * Zustandストア用セレクター作成ユーティリティ - 安定版
 * @template T ストア型
 * @template F セレクター型
 * @param store Zustandストア
 * @returns セレクター付きストア
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
        return (selector?: any) => {
          if (selector) {
            return useStore(selector);
          }
          return useStore((state) => {
            const storeState = state as any;
            if (prop in storeState) {
              return storeState[prop];
            }
            return undefined;
          });
        };
      },
    }
  );
  
  // 元のストアとセレクター機能を組み合わせて返す
  return Object.assign(useStore, useSelectors as F);
};
