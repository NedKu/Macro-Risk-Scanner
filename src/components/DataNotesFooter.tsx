import React from 'react';
import { ScanReport } from '../types';
import { Database, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DataNotesFooterProps {
  report: ScanReport;
}

export const DataNotesFooter: React.FC<DataNotesFooterProps> = ({ report }) => {
  return (
    <footer className="my-8 pt-6 border-t border-[#1A1A1A] text-xs text-[#666666]">
      <div className="bg-[#0A0A0B] p-4 rounded-lg border border-[#1A1A1A]">
        <div className="flex items-center gap-2 font-bold text-[#E0E0E0] mb-2.5">
          <Database className="w-4 h-4 text-emerald-500" />
          <span className="text-xs uppercase tracking-wider text-[#888888]">數據時效性與資料來源說明</span>
        </div>

        <ul className="space-y-1.5 list-disc list-inside text-[#888888] text-[11px] leading-relaxed">
          {report.dataNotes && report.dataNotes.length > 0 ? (
            report.dataNotes.map((note, i) => <li key={i}>{note}</li>)
          ) : (
            <>
              <li>長期指標（Buffett Indicator / Shiller CAPE / LEI）採用月度或季度最新官方數據。</li>
              <li>短期指標（VIX / Fear & Greed / Put-Call Ratio）均採用盤前最新實時市場數據。</li>
              <li>BofA Bull & Bear 指標與 Insider Buy/Sell 比率採用美銀週報與權威機構最新數據。</li>
            </>
          )}
        </ul>

        <div className="mt-3 pt-2.5 border-t border-[#1A1A1A] flex flex-col md:flex-row items-center justify-between text-[10px] text-[#555555] font-mono gap-2">
          <div>
            紀律守則：所有警戒閾值基於歷史經驗定常設定，不因短期市場情緒調整。
          </div>
          <div>
            MACRO RISK SCANNER &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
};
