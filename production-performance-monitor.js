// 本番環境パフォーマンス監視スクリプト
// ブラウザのコンソールで実行して、リアルタイムの性能統計を確認

function createProductionPerformanceMonitor() {
    const stats = {
        conversions: 0,
        totalTime: 0,
        cacheHits: 0,
        cacheMisses: 0,
        memoryUsage: [],
        averageResponseTime: 0,
        lastUpdated: new Date().toISOString()
    };

    // UltraOptimizedJapaneseProcessorの統計を取得
    function getProcessorStats() {
        try {
            // グローバルに公開されている統計オブジェクトを探す
            const processor = window.__ultraOptimizedProcessor || 
                            window.UltraOptimizedJapaneseProcessor ||
                            globalThis.ultraProcessor;
            
            if (processor && processor.getStatistics) {
                return processor.getStatistics();
            }
            
            // 手動で統計を収集
            const performance = window.performance;
            if (performance.getEntriesByType) {
                const entries = performance.getEntriesByType('measure');
                const typingEntries = entries.filter(entry => 
                    entry.name.includes('typing') || 
                    entry.name.includes('convert') ||
                    entry.name.includes('japanese')
                );
                
                if (typingEntries.length > 0) {
                    const avgDuration = typingEntries.reduce((sum, entry) => 
                        sum + entry.duration, 0) / typingEntries.length;
                    
                    return {
                        conversions: typingEntries.length,
                        averageResponseTime: avgDuration,
                        totalTime: typingEntries.reduce((sum, entry) => sum + entry.duration, 0),
                        timestamp: Date.now()
                    };
                }
            }
            
            return null;
        } catch (error) {
            console.warn('統計取得エラー:', error);
            return null;
        }
    }

    // メモリ使用量を測定
    function getMemoryUsage() {
        try {
            if (performance.memory) {
                return {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // 統計を更新
    function updateStats() {
        const processorStats = getProcessorStats();
        const memoryUsage = getMemoryUsage();
        
        if (processorStats) {
            stats.conversions = processorStats.conversions || stats.conversions;
            stats.totalTime = processorStats.totalTime || stats.totalTime;
            stats.averageResponseTime = processorStats.averageResponseTime || stats.averageResponseTime;
            stats.cacheHits = processorStats.cacheHits || stats.cacheHits;
            stats.cacheMisses = processorStats.cacheMisses || stats.cacheMisses;
        }
        
        if (memoryUsage) {
            stats.memoryUsage.push({
                timestamp: Date.now(),
                ...memoryUsage
            });
            
            // 最新の10件のみ保持
            if (stats.memoryUsage.length > 10) {
                stats.memoryUsage = stats.memoryUsage.slice(-10);
            }
        }
        
        stats.lastUpdated = new Date().toISOString();
        return stats;
    }

    // 詳細レポートを生成
    function generateReport() {
        const currentStats = updateStats();
        const cacheHitRate = currentStats.cacheHits + currentStats.cacheMisses > 0 
            ? (currentStats.cacheHits / (currentStats.cacheHits + currentStats.cacheMisses) * 100).toFixed(2)
            : 'N/A';
        
        const latestMemory = currentStats.memoryUsage[currentStats.memoryUsage.length - 1];
        const memoryEfficiency = latestMemory 
            ? ((latestMemory.total - latestMemory.used) / latestMemory.total * 100).toFixed(2)
            : 'N/A';

        return {
            'パフォーマンス統計': {
                '変換処理回数': currentStats.conversions,
                '平均応答時間': `${currentStats.averageResponseTime.toFixed(2)}ms`,
                '総処理時間': `${currentStats.totalTime.toFixed(2)}ms`,
                'キャッシュヒット率': `${cacheHitRate}%`,
                'メモリ効率': `${memoryEfficiency}%`
            },
            'メモリ使用状況': latestMemory ? {
                '使用中': `${latestMemory.used}MB`,
                '総計': `${latestMemory.total}MB`,
                '制限': `${latestMemory.limit}MB`
            } : 'N/A',
            '最終更新': currentStats.lastUpdated
        };
    }

    // タイピング入力を監視
    function monitorTypingInput() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', updateStats);
            input.addEventListener('keydown', updateStats);
        });
    }

    // 自動監視を開始
    function startAutoMonitoring(intervalMs = 5000) {
        console.log('🚀 本番環境パフォーマンス監視を開始します...');
        
        monitorTypingInput();
        
        const interval = setInterval(() => {
            const report = generateReport();
            console.group('📊 パフォーマンス統計 (自動更新)');
            console.table(report['パフォーマンス統計']);
            if (report['メモリ使用状況'] !== 'N/A') {
                console.table(report['メモリ使用状況']);
            }
            console.log('⏰ 更新時刻:', report['最終更新']);
            console.groupEnd();
        }, intervalMs);
        
        return {
            stop: () => clearInterval(interval),
            getReport: generateReport,
            getStats: () => updateStats()
        };
    }

    return {
        updateStats,
        generateReport,
        startAutoMonitoring,
        monitorTypingInput
    };
}

// グローバルに公開
window.ProductionPerformanceMonitor = createProductionPerformanceMonitor();

// 使用方法をコンソールに表示
console.log(`
🎯 本番環境パフォーマンス監視ツールが利用可能です

📋 使用方法:
1. 手動レポート生成:
   window.ProductionPerformanceMonitor.generateReport()

2. 自動監視開始 (5秒間隔):
   const monitor = window.ProductionPerformanceMonitor.startAutoMonitoring()

3. 自動監視停止:
   monitor.stop()

4. リアルタイム統計取得:
   window.ProductionPerformanceMonitor.updateStats()

🚀 今すぐ自動監視を開始するには:
   window.ProductionPerformanceMonitor.startAutoMonitoring()
`);
