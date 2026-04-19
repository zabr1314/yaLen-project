import React, { useState } from 'react';
import { useAgentStore } from '../../store/useAgentStore';
import { LiveAgentService } from '../../services/LiveAgentService';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ShieldX, Scroll, Lock } from 'lucide-react';

const riskLevelMap: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  high: {
    label: '高危',
    color: 'text-red-400',
    bg: 'bg-red-950/40',
    border: 'border-red-800/60',
    icon: <ShieldAlert className="w-6 h-6 text-red-400" />
  },
  medium: {
    label: '中危',
    color: 'text-orange-400',
    bg: 'bg-orange-950/40',
    border: 'border-orange-800/60',
    icon: <ShieldAlert className="w-6 h-6 text-orange-400" />
  },
  low: {
    label: '低危',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800/60',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />
  },
};

const officialNameMap: Record<string, string> = {
  minister: '丞相',
  historian: '史官',
  official_revenue: '户部',
  official_war: '兵部',
  official_works: '工部',
  official_rites: '礼部',
  official_personnel: '吏部',
  official_justice: '刑部',
};

const functionNameMap: Record<string, string> = {
  access_sensitive_data: '访问敏感数据',
  call_officials: '并行传唤官员',
  call_official: '传唤官员',
  memory_search: '记忆检索',
  save_memory: '保存记忆',
  spawn_agent: '创建子代理',
};

const ApprovalModal: React.FC = () => {
  const { approvalRequest, setApprovalRequest } = useAgentStore();
  const [revealArgs, setRevealArgs] = useState(false);

  if (!approvalRequest) return null;

  const risk = riskLevelMap[approvalRequest.riskLevel] || riskLevelMap.low;
  const officialName = officialNameMap[approvalRequest.agentId] || approvalRequest.agentId;
  const functionName = functionNameMap[approvalRequest.functionName] || approvalRequest.functionName;

  const handleAction = (action: 'approve' | 'reject') => {
    LiveAgentService.getInstance().sendCommand(
      approvalRequest.agentId,
      action,
      {
        toolCallId: approvalRequest.toolCallId,
        feedback: action === 'reject' ? '皇帝驳回此请求' : undefined
      }
    );
    setApprovalRequest(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
      >
        {/* Background ambient effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-[520px] border-2 border-[#d4af37]/40 bg-[#0a0606] shadow-2xl overflow-hidden"
        >
          {/* Top decorative bar */}
          <div className="h-1.5 bg-gradient-to-r from-transparent via-red-700/60 to-transparent" />

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#d4af37]/30" />
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#d4af37]/30" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#d4af37]/30" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#d4af37]/30" />

          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <Lock className="w-5 h-5 text-[#d4af37]" />
              <h2 className="text-xl font-serif font-bold text-[#d4af37] tracking-widest">
                ⚠️ 御批请求
              </h2>
            </div>
            <p className="text-xs text-[#d4af37]/40 font-mono">
              IMPERIAL APPROVAL REQUIRED — {approvalRequest.riskLevel.toUpperCase()} RISK
            </p>
          </div>

          {/* Risk Banner */}
          <div className={`mx-6 mb-4 px-4 py-2.5 ${risk.bg} border ${risk.border} flex items-center gap-3`}>
            {risk.icon}
            <div>
              <div className={`text-sm font-bold ${risk.color}`}>
                风险等级：{risk.label}
              </div>
              <div className="text-xs text-stone-400">
                此操作涉及敏感权限，需皇帝亲自裁决
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a0f0f]/60 border border-[#d4af37]/10 p-3">
                <div className="text-[10px] text-[#d4af37]/40 uppercase tracking-wider mb-1">申请人</div>
                <div className="text-sm text-[#e6d5ac] font-bold">{officialName}</div>
              </div>
              <div className="bg-[#1a0f0f]/60 border border-[#d4af37]/10 p-3">
                <div className="text-[10px] text-[#d4af37]/40 uppercase tracking-wider mb-1">拟执行</div>
                <div className="text-sm text-blue-300 font-mono">{functionName}</div>
              </div>
            </div>

            {/* Args reveal */}
            <div className="bg-[#1a0f0f]/40 border border-[#d4af37]/10">
              <button
                onClick={() => setRevealArgs(!revealArgs)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#d4af37]/50 hover:text-[#d4af37] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Scroll className="w-3.5 h-3.5" />
                  参数详情
                </span>
                <span>{revealArgs ? '收起 ▲' : '展开 ▼'}</span>
              </button>
              <AnimatePresence>
                {revealArgs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <pre className="px-3 pb-3 text-xs font-mono text-stone-400 whitespace-pre-wrap">
                      {JSON.stringify(approvalRequest.args, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />

          {/* Action Buttons */}
          <div className="px-6 py-5 flex gap-3">
            <button
              onClick={() => handleAction('reject')}
              className="flex-1 group relative py-3 border border-red-800/60 bg-red-950/20 text-red-400 hover:bg-red-900/40 hover:border-red-600 transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <ShieldX className="w-4 h-4" />
                <span className="font-bold tracking-wider">驳回</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => handleAction('approve')}
              className="flex-1 group relative py-3 bg-[#d4af37] text-[#1a0f0f] hover:bg-[#e8c855] transition-all font-bold tracking-wider"
            >
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>准奏</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-200/50 to-transparent" />
            </button>
          </div>

          {/* Footer hint */}
          <div className="px-6 pb-4 text-center">
            <span className="text-[10px] text-stone-600">
              此审批将被永久记录于系统审计日志
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApprovalModal;
