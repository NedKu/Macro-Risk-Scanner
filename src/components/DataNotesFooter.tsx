import React from 'react';
import { ScanReport } from '../types';
import { Database } from 'lucide-react';
import { publicIndicatorAlternatives } from '../data/publicIndicatorAlternatives';

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
            </>
          )}
        </ul>

        <div className="mt-4 pt-3 border-t border-[#1A1A1A]">
          <h3 className="text-[11px] font-semibold text-[#BBBBBB] mb-2">受限指標的公開替代監測方案（非原始指標）</h3>
          <ul className="space-y-2 text-[11px] leading-relaxed">
            {publicIndicatorAlternatives.map(alternative => (
              <li key={alternative.id}>
                <span className="text-[#BBBBBB]">{alternative.originalName} → {alternative.alternativeName}：</span>
                <span className="text-[#888888]"> {alternative.method} </span>
                <a href={alternative.githubUrl} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 underline">
                  GitHub 方法
                </a>
                {' · '}
                <a href={alternative.dataUrl} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 underline">
                  公開資料／供應商
                </a>
                <div className="text-[#666666] pl-2">{alternative.limitation}</div>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-[#666666] mt-2">
            GitHub 連結是公開的擷取／計算方法參考，不代表 GitHub 提供即時資料。替代值不可視為原指標，也不直接觸發原指標門檻。
          </p>
        </div>

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
