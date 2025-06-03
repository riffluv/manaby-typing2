/**
 * SPA画面遷移用の型・定数・補助関数を集約
 * - AppRouterの設計補助
 * - 今後の拡張やテスト容易性を考慮
 */

export type AppRoute = 'menu' | 'game' | 'result' | 'ranking';

export const ROUTE_LABELS: Record<AppRoute, string> = {
  menu: 'メインメニュー',
  game: 'ゲーム',
  result: 'リザルト',
  ranking: 'ランキング',
};

// 画面遷移の補助関数例（今後拡張用）
export function isValidRoute(route: string): route is AppRoute {
  return ['menu', 'game', 'result', 'ranking'].includes(route);
}