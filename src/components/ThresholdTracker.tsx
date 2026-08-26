import React from 'react';
import { ScanReport, HardTriggerStatus } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ThresholdTrackerProps {
  report: ScanReport;
}

export const ThresholdTracker: React.FC<ThresholdTrackerProps> = ({ report }) => {
  const renderStatusBadge = (status: HardTriggerStatus) => {
    switch (status) {
      case 'yes':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
            <CheckCircle className="w-3 h-3" /> ✅ 已觸發
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
            <AlertTriangle className="w-3 h-3" /> ⚠️ 觀察中
          </span>
        );
      case 'no':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-[#666666] bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#222222]">
            <XCircle className="w-3 h-3" /> ❌ 未達成
          </span>
        );
    }
  };

  return (
    <section className="my-6">
      <div className="mb-3">
        <h2 className="text-xs font-semibold text-[#666666] uppercase tracking-widest flex items-center gap-2">
          第五部分：賣出觸發狀態追蹤
        </h2>
        <p className="text-[11px] text-[#555555] mt-0.5">
          7 項硬紀律警戒閾值判斷（需要同時觸發 3+ 項才正式啟動「分批賣出／大規模避險」程序）
        </p>
      </div>

      <div className="overflow-x-auto bg-[#0A0A0B] border border-[#1A1A1A] rounded-lg">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="text-[#555555] border-b border-[#1A1A1A] uppercase tracking-wider font-mono text-[10px]">
              <th className="py-2 px-3 font-medium">觸發條件</th>
              <th className="py-2 px-3 font-medium">硬性警戒閾值</th>
              <th className="py-2 px-3 font-medium">今日實測狀態</th>
              <th className="py-2 px-3 text-center font-medium">狀態</th>
              <th className="py-2 px-3 font-medium">備註說明</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A] text-[#CCCCCC]">
            {(report.hardThresholds || []).map(ht => (
              <tr key={ht.id} className="hover:bg-[#121214] transition">
                <td className="py-2.5 px-3 font-bold text-white">
                  {ht.condition}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-rose-400 whitespace-nowrap">
                  {ht.threshold}
                </td>
                <td className="py-2.5 px-3 font-mono font-semibold text-white">
                  {ht.currentReading}
                </td>
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  {renderStatusBadge(ht.status)}
                </td>
                <td className="py-2.5 px-3 text-[#777777]">
                  {ht.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Box */}
      <div className={`mt-3 p-4 rounded-lg border flex flex-col md:flex-row items-center justify-between gap-4 ${
        report.sellThresholdReached
          ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
          : 'bg-[#0A0A0B] border-[#1A1A1A] text-[#CCCCCC]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded shrink-0 ${
            report.sellThresholdReached ? 'bg-rose-600 text-white' : 'bg-[#1A1A1A] text-emerald-400'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span>今日硬閾值觸發總數：</span>
              <span className="font-mono text-sm text-amber-400 font-bold">{report.hardTriggersCount} / 7 項觸發</span>
            </div>
            <p className="text-[11px] text-[#666666] mt-0.5">
              紀律要求：必須同時觸發 ≥ 3 項硬閾值，才達到「開始分批賣出」之系統指示。
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className={`px-3 py-1.5 rounded text-[11px] font-bold font-mono border ${
            report.sellThresholdReached
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
          }`}>
            {report.sellThresholdReached
              ? '🚨 系統建議：已達到『開始分批賣出』門檻（觸發 3+ 項）'
              : '✅ 系統建議：未達到『開始分批賣出』硬閾值（目前僅 1 項觸發）'}
          </div>
        </div>
      </div>
    </section>
  );
};
