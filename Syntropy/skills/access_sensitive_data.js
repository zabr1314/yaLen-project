/**
 * Access Sensitive Data Skill (HIGH RISK)
 * Triggers the Imperial Approval (御批) workflow when an agent attempts to
 * access sensitive information such as user core data, financial records,
 * or competitive intelligence.
 */
export default {
    name: 'access_sensitive_data',
    description: 'Access sensitive data or core system information for security analysis or competitive intelligence. This operation involves data privacy and security risks and MUST be approved by the human operator (Emperor).',
    riskLevel: 'high',
    parameters: {
        type: 'object',
        properties: {
            dataType: {
                type: 'string',
                enum: ['user_core_data', 'financial_records', 'competitor_intelligence', 'system_security_log', 'privileged_communication'],
                description: 'The type of sensitive data being accessed'
            },
            purpose: {
                type: 'string',
                description: 'Clear purpose for accessing this sensitive data'
            },
            scope: {
                type: 'string',
                description: 'Scope of access (e.g., "top 10 competitors", "Q3 financials", "all user profiles")'
            }
        },
        required: ['dataType', 'purpose']
    },
    handler: async ({ dataType, purpose, scope }) => {
        console.log(`[Skill:AccessSensitiveData] HIGH RISK access approved: ${dataType} | ${purpose}`);

        const dataTypeLabels = {
            user_core_data: '用户核心数据',
            financial_records: '财务记录',
            competitor_intelligence: '竞争情报',
            system_security_log: '系统安全日志',
            privileged_communication: '特权通信记录'
        };

        // Simulated sensitive data access result
        const mockResults = {
            user_core_data: `用户画像样本（已脱敏）：\n- 活跃用户：12,847人\n- 付费转化率：3.2%\n- 平均客单价：¥428\n- 流失预警用户：342人`,
            financial_records: `财务概览（Q3）：\n- 营收：¥2.1M\n- 毛利率：42%\n- 运营成本：¥1.2M\n- 现金流：+¥340K`,
            competitor_intelligence: `竞品动态：\n- 主要对手A：上轮融资$50M，DAU增长35%\n- 主要对手B：推出相似功能，定价低20%\n- 市场集中度：CR3 = 68%`,
            system_security_log: `安全态势：\n- 近30天入侵尝试：127次\n- 已拦截：127次\n- 高危漏洞：2个（已修复）\n- 平均响应时间：4.2分钟`,
            privileged_communication: `内部通信摘要：\n- 高管会议记录：3份\n- 战略决策文档：5份\n- 风险提示：1份（待处理）`
        };

        return `【敏感数据访问结果 — 已审批执行】
━━━━━━━━━━━━━━━━━━━━━━
数据类型：${dataTypeLabels[dataType] || dataType}
访问目的：${purpose}
访问范围：${scope || '默认范围'}
━━━━━━━━━━━━━━━━━━━━━━

${mockResults[dataType] || '数据已加载'}

━━━━━━━━━━━━━━━━━━━━━━
审计追踪：
- 操作时间：${new Date().toLocaleString('zh-CN')}
- 审计ID：AUDIT_${Date.now()}
- 风险等级：HIGH
- 此操作已被永久记录`;
    }
};
