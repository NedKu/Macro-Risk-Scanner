import React from 'react';
import { AlertCircle, ArrowUpRight, Flame } from 'lucide-react';
import { ScanReport } from '../types';

interface SpotlightSignalProps {
  report: ScanReport;
}

export const SpotlightSignal: React.FC<SpotlightSignalProps> = ({ report }) => {
  return (
    <section className="my-6">
      <div className="bg-[#0D0D0E] border-y border-r border-[#1A1A1A] border-l-4 border-l-rose-500 rounded-r-lg p-4 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1.5">
          <Flame className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
            今日最需關注信號 | CRITICAL FOCUS
          </span>
        </div>

        <h3 className="text-sm md:text-base font-bold text-white mb-2 tracking-tight">
          {report.spotlightTitle}
        </h3>

        <p className="text-xs text-[#CCC] leading-relaxed bg-[#050505] p-3 rounded border border-[#1A1A1A]">
          {report.spotlightReason}
        </p>
      </div>
    </section>
  );
};
