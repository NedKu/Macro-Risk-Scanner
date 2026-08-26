import React from 'react';
import { ScanReport } from '../types';
import { ShieldCheck, TrendingUp, Compass, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ComprehensiveConclusionsProps {
  report: ScanReport;
}

export const ComprehensiveConclusions: React.FC<ComprehensiveConclusionsProps> = ({ report }) => {
  return (
    <section className="my-6">
      <div className="mb-3">
        <h2 className="text-xs font-semibold text-[#666666] uppercase tracking-widest flex items-center gap-2">
          第四部分：短中長期綜合結論
        </h2>
        <p className="text-[11px] text-[#555555] mt-0.5">
          基於 17 項數據的明確認策指引：減倉/避險、調倉板塊與資產再平衡建議
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 短期結論 */}
        <div className="bg-[#0A0A0B] border border-emerald-500/20 rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-950/40 text-emerald-400 rounded border border-emerald-800/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">短期（1 - 3 個月）</h3>
              <p className="text-[10px] text-emerald-400 font-medium">要不要減倉？要不要買保險？</p>
            </div>
          </div>

          <div className="text-[11px] text-[#BBBBBB] leading-relaxed border-t border-[#1A1A1A] pt-2.5">
            <p>{report.shortTermConclusion}</p>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1A1A1A] flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>核心行動：買低成本 Put 保險，不盲目追高</span>
          </div>
        </div>

        {/* 中期結論 */}
        <div className="bg-[#0A0A0B] border border-amber-500/20 rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-950/40 text-amber-400 rounded border border-amber-800/40">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">中期（3 - 12 個月）</h3>
              <p className="text-[10px] text-amber-400 font-medium">趨勢是否變化？哪些板塊需要調倉？</p>
            </div>
          </div>

          <div className="text-[11px] text-[#BBBBBB] leading-relaxed border-t border-[#1A1A1A] pt-2.5">
            <p>{report.midTermConclusion}</p>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1A1A1A] flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>核心行動：減持高 Beta 暴漲股，增配防禦型高股息/短債</span>
          </div>
        </div>

        {/* 長期結論 */}
        <div className="bg-[#0A0A0B] border border-rose-500/20 rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-950/40 text-rose-400 rounded border border-rose-800/40">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">長期（1 - 3 年+）</h3>
              <p className="text-[10px] text-rose-400 font-medium">組合結構是否需要再平衡？</p>
            </div>
          </div>

          <div className="text-[11px] text-[#BBBBBB] leading-relaxed border-t border-[#1A1A1A] pt-2.5">
            <p>{report.longTermConclusion}</p>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1A1A1A] flex items-center gap-1.5 text-[11px] font-semibold text-rose-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>核心行動：降低美股大盤指數期望，增配黃金與非美優質資產</span>
          </div>
        </div>
      </div>
    </section>
  );
};
