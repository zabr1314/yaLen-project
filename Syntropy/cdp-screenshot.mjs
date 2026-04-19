import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://localhost:9222');
const context = browser.contexts()[0] || await browser.newContext();
const page = await context.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/syntropy-home.png' });
console.log('Homepage screenshot saved');

// Inject mock decree with nested decision tree
await page.evaluate(() => {
  const mockDecree = {
    id: '1234567890123',
    title: '测试指令',
    content: '检查各部最近工作进展',
    status: 'completed',
    plan: ['调用户部查询财务', '调用兵部查询安全', '户部调用工部协助'],
    logs: [
      { timestamp: 1234567890123, actor: 'Emperor', action: '发布诏令', details: '检查各部最近工作进展' },
      { timestamp: 1234567890124, actor: 'minister', action: '回复', details: '丞相汇总报告' }
    ],
    decisionTree: {
      id: 'root-abc123',
      agentId: 'minister',
      action: '拆解任务并调度',
      reasoning: '用户问题涉及多个部门，需要统筹调度',
      timestamp: 1234567890123,
      children: [
        {
          id: 'decision-revenue',
          agentId: 'official_revenue',
          action: '查询财务数据',
          reasoning: '用户问题涉及财务统计',
          timestamp: 1234567890124,
          confidence: 85,
          outputSummary: '本季度税收增长15%',
          output: '本季度税收增长15%，主要来源于商业税',
          durationMs: 3200,
          children: [
            {
              id: 'decision-works-nested',
              agentId: 'official_works',
              action: '协助数据分析',
              reasoning: '需要工部协助进行数据可视化',
              timestamp: 1234567890125,
              confidence: 72,
              outputSummary: '已完成数据报表生成',
              output: '已生成详细数据报表，包含图表和趋势分析',
              durationMs: 2800,
              children: []
            }
          ]
        },
        {
          id: 'decision-war',
          agentId: 'official_war',
          action: '查询安全状况',
          reasoning: '用户问题涉及系统安全',
          timestamp: 1234567890124,
          confidence: 90,
          outputSummary: '系统运行正常，无异常',
          output: '系统运行正常，最近7天无安全事件',
          durationMs: 2100,
          children: []
        }
      ]
    }
  };
  const storage = JSON.parse(localStorage.getItem('court-storage') || '{}');
  storage.state = storage.state || {};
  storage.state.decrees = [mockDecree];
  localStorage.setItem('court-storage', JSON.stringify(storage));
  window.location.reload();
});

await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/syntropy-injected.png' });
console.log('Injected screenshot saved');

// Click decree to expand, then click 决策链
try {
  const rows = await page.locator('text=/奉天承运第/').all();
  if (rows.length > 0) {
    await rows[0].click();
    await page.waitForTimeout(500);
    const btns = await page.locator('text=决策链').all();
    if (btns.length > 0) {
      await btns[0].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '/tmp/syntropy-trace.png' });
      console.log('Decision trace screenshot saved');
    }
  }
} catch (e) {
  console.log('Interaction failed:', e.message);
}

await browser.close();
