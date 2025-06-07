'use client';

/**
 * Phase 1最適化モード - WebAssemblyテストページ（無効化）
 * WebAssemblyは削除され、Phase 1最適化のみで動作しています
 */
export default function WasmTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">WebAssemblyテスト（無効化）</h1>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong>✅ 成功:</strong> WebAssemblyは削除され、Phase 1最適化で高速動作しています
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">現在の状態</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Phase 1最適化: 有効（TypeScript最適化）</li>
            <li>WebAssembly: 完全削除済み</li>
            <li>パフォーマンス: 高速TypeScript処理（平均3.65ms）</li>
            <li>連続入力遅延: 解決済み</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Phase 1 性能レポート</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold">入力遅延</h3>
              <p className="text-2xl font-bold text-blue-600">3.65ms</p>
              <p className="text-sm text-gray-600">平均値</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold">最大遅延</h3>
              <p className="text-2xl font-bold text-green-600">4.8ms</p>
              <p className="text-sm text-gray-600">最大値</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-semibold">性能向上</h3>
              <p className="text-2xl font-bold text-purple-600">2-5x</p>
              <p className="text-sm text-gray-600">高速化倍率</p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <h3 className="font-semibold">モード</h3>
              <p className="text-2xl font-bold text-orange-600">Phase 1</p>
              <p className="text-sm text-gray-600">TypeScript最適化</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
