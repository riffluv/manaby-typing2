/* ==========================================================================
   CSS パフォーマンス測定・検証スクリプト - 2025年基準
   ========================================================================== */

// CSS読み込み時間測定
function measureCSSLoadTime() {
  const startTime = performance.now();
    // CSS読み込み完了を監視
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('.css')) {
        const resourceEntry = entry as PerformanceResourceTiming;
        console.log(`📊 CSS Load Time: ${entry.name}`, {
          duration: `${entry.duration.toFixed(2)}ms`,
          startTime: `${entry.startTime.toFixed(2)}ms`,
          transferSize: resourceEntry.transferSize ? `${resourceEntry.transferSize} bytes` : 'cached'
        });
      }
    }
  });
  
  observer.observe({ entryTypes: ['resource'] });
  
  // CSS適用完了時間測定
  document.addEventListener('DOMContentLoaded', () => {
    const endTime = performance.now();
    console.log(`🎯 Total CSS Load Time: ${(endTime - startTime).toFixed(2)}ms`);
  });
}

// レンダリング性能測定
function measureRenderingPerformance() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`🚀 Rendering Metrics:`, {
        type: entry.entryType,
        name: entry.name,
        startTime: entry.startTime ? `${entry.startTime.toFixed(2)}ms` : 'N/A',
        duration: entry.duration ? `${entry.duration.toFixed(2)}ms` : 'N/A',
        // Layout Shift専用のvalueプロパティがある場合のみ表示
        ...(entry.entryType === 'layout-shift' && 'value' in entry ? { value: (entry as unknown as { value: number }).value.toFixed(4) } : {})
      });
    }
  });
  
  observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
}

// DPIスケール対応確認
function checkDPIScaling() {
  const dpr = window.devicePixelRatio;
  const screenInfo = {
    devicePixelRatio: dpr,
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    dpiScale: dpr >= 1.25 ? 'High DPI' : 'Standard DPI'
  };
  
  console.log(`📱 DPI Scale Information:`, screenInfo);
  
  // CSS カスタムプロパティでDPI情報を設定
  document.documentElement.style.setProperty('--actual-dpr', dpr.toString());
  document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`);
  document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
}

// Container Query対応確認
function checkContainerQuerySupport() {
  const supportsContainerQueries = CSS.supports('container-type: inline-size');
  console.log(`📦 Container Query Support: ${supportsContainerQueries ? '✅ Supported' : '❌ Not Supported'}`);
  
  if (!supportsContainerQueries) {
    console.warn('⚠️ Container Queries not supported. Consider adding a polyfill.');
  }
}

// Modern CSS Features検証
function checkModernCSSFeatures() {
  const features = {
    'Dynamic Viewport Units': CSS.supports('height: 100dvh'),
    'Color Mix Function': CSS.supports('color: color-mix(in oklch, red, blue)'),
    'Logical Properties': CSS.supports('margin-inline-start: 10px'),
    'Container Queries': CSS.supports('container-type: inline-size'),
    'Range Syntax': CSS.supports('width < 640px'),
    'P3 Color Space': CSS.supports('color: color(display-p3 1 0 0)')
  };
  
  console.log(`🔍 Modern CSS Features Support:`);
  for (const [feature, supported] of Object.entries(features)) {
    console.log(`  ${feature}: ${supported ? '✅' : '❌'}`);
  }
}

// CSS競合チェック
function checkCSSConflicts() {
  const duplicateRules = new Map<string, Array<{sheet: number, rule: number, href: string}>>();
  const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach((sheet, sheetIndex) => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule, ruleIndex) => {
        if (rule.type === CSSRule.STYLE_RULE) {
          const styleRule = rule as CSSStyleRule;
          const selector = styleRule.selectorText;
          if (duplicateRules.has(selector)) {
            duplicateRules.get(selector)!.push({
              sheet: sheetIndex,
              rule: ruleIndex,
              href: sheet.href || 'inline'
            });
          } else {
            duplicateRules.set(selector, [{
              sheet: sheetIndex,
              rule: ruleIndex,
              href: sheet.href || 'inline'
            }]);
          }
        }
      });
    } catch (error: unknown) {
      const e = error as Error;
      console.warn(`Could not access stylesheet ${sheetIndex}:`, e.message);
    }
  });
    const conflicts = Array.from(duplicateRules.entries())
    .filter(([, locations]) => locations.length > 1);
    if (conflicts.length > 0) {
    console.warn(`⚠️ CSS Conflicts detected (${conflicts.length} selectors):`);    conflicts.slice(0, 10).forEach(([selector, locations]) => {
      console.log(`  ${selector} appears in:`, locations.map((l: { href: string }) => l.href));
    });
  } else {
    console.log(`✅ No CSS conflicts detected`);
  }
}

// GPU加速確認
function checkGPUAcceleration() {
  const testElement = document.createElement('div');
  testElement.style.transform = 'translateZ(0)';
  testElement.style.willChange = 'transform';
  document.body.appendChild(testElement);
  
  const computedStyle = getComputedStyle(testElement);
  const isGPUAccelerated = computedStyle.transform !== 'none' || 
                          computedStyle.willChange !== 'auto';
  
  console.log(`🎮 GPU Acceleration: ${isGPUAccelerated ? '✅ Active' : '❌ Inactive'}`);
  document.body.removeChild(testElement);
}

// メイン実行
function runPerformanceTests() {
  console.log(`🚀 CSS Performance Tests - 2025年基準`);
  console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
  console.log(`🌐 User Agent: ${navigator.userAgent}`);
  console.log(`─────────────────────────────────────────`);
  
  checkDPIScaling();
  checkModernCSSFeatures();
  checkContainerQuerySupport();
  checkGPUAcceleration();
  measureCSSLoadTime();
  measureRenderingPerformance();
  
  // CSS競合チェックは少し遅延実行
  setTimeout(checkCSSConflicts, 1000);
    // パフォーマンス監視継続
  setInterval(() => {
    const memoryInfo = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (memoryInfo) {
      console.log(`💾 Memory Usage:`, {
        used: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
    }
  }, 10000); // 10秒ごと
}

// ページ読み込み完了後に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runPerformanceTests);
} else {
  runPerformanceTests();
}

export { runPerformanceTests };
