import React from 'react';
import { ScanReport } from '../types';
import { ShieldCheck, ShieldAlert, Zap, Clock, Compass } from 'lucide-react';

interface StatsCardsProps {
  report: ScanReport;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ report }) => {
  const shortTotal = report?.shortTermTotal || 5;
  const shortUnwarned = report?.shortTermUnwarned ?? 4;
  const shortRatio = Math.round((shortUnwarned / shortTotal) * 100) || 0;

  const midTotal = report?.midTermTotal || 7;
  const midUnwarned = report?.midTermUnwarned ?? 4;
  const midRatio = Math.round((midUnwarned / midTotal) * 100) || 0;

  const longTotal = report?.longTermTotal || 5;
  const longUnwarned = report?.longTermUnwarned ?? 2;
  const longRatio = Math.round((longUnwarned / longTotal) * 100) || 0;

  return (
    <section className="my-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold text-[#666666] uppercase tracking-widest flex items-center gap-2">
          第二部分：警報統計速覽
        </h2>
        <span className="text-[11px] text-[#555555]">（顯示未發出黃/紅警報的健康指標數量）</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 短期卡片 */}
        <div className="bg-[#0A0A0B] border border-[#1A1A1A] rounded-lg p-4 transition hover:border-[#333333]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs tracking-wide">短期信號 (過熱回調)</h3>
                <p className="text-[11px] text-[#666666]">天－週級別</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              🟢 短期偏穩
            </span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div className="text-2xl font-bold text-white font-mono">
              {report.shortTermUnwarned} <span className="text-xs font-normal text-[#666666]">/ {report.shortTermTotal} 未警報</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {shortRatio}% 安全率
            </span>
          </div>

          <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${shortRatio}%` }}
            />
          </div>
          <p className="text-[11px] text-[#777777] mt-2.5 leading-relaxed">
            {report.shortTermUnwarned === report.shortTermTotal
              ? '短期市場結構平穩，過熱回調風險較低。'
              : `目前有 ${report.shortTermTotal - report.shortTermUnwarned} 項短期指標亮起注意燈號。`}
          </p>
        </div>

        {/* 中期卡片 */}
        <div className="bg-[#0A0A0B] border border-[#1A1A1A] rounded-lg p-4 transition hover:border-[#333333]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-950/40 border border-amber-500/30 rounded text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs tracking-wide">中期信號 (趨勢轉折)</h3>
                <p className="text-[11px] text-[#666666]">週－月級別</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
              🟡 趨勢承壓
            </span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div className="text-2xl font-bold text-white font-mono">
              {report.midTermUnwarned} <span className="text-xs font-normal text-[#666666]">/ {report.midTermTotal} 未警報</span>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold">
              {midRatio}% 安全率
            </span>
          </div>

          <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${midRatio}%` }}
            />
          </div>
          <p className="text-[11px] text-[#777777] mt-2.5 leading-relaxed">
            {`共有 ${report.midTermTotal - report.midTermUnwarned} 項中期指標亮起警報（含美銀牛熊指標 9.6 極端賣出信號）。`}
          </p>
        </div>

        {/* 長期卡片 */}
        <div className="bg-[#0A0A0B] border border-[#1A1A1A] rounded-lg p-4 transition hover:border-[#333333]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-950/40 border border-rose-500/30 rounded text-rose-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs tracking-wide">長期信號 (結構週期)</h3>
                <p className="text-[11px] text-[#666666]">月－年級別</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/50">
              🔴 結構極端高估
            </span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div className="text-2xl font-bold text-white font-mono">
              {report.longTermUnwarned} <span className="text-xs font-normal text-[#666666]">/ {report.longTermTotal} 未警報</span>
            </div>
            <span className="text-xs font-mono text-rose-400 font-semibold">
              {longRatio}% 安全率
            </span>
          </div>

          <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${longRatio}%` }}
            />
          </div>
          <p className="text-[11px] text-[#777777] mt-2.5 leading-relaxed">
            巴菲特指標、席勒 CAPE 與散戶持股比等多項長期指標處於歷史高位。
          </p>
        </div>
      </div>
    </section>
  );
};
