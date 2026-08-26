import React from 'react';
import { Activity, AlertTriangle, Download, RefreshCw, Sparkles, Copy, Check, Calendar, ShieldAlert } from 'lucide-react';
import { ScanReport } from '../types';

interface HeaderProps {
  report: ScanReport;
  onRunScan: () => void;
  isScanning: boolean;
  onExportMarkdown: () => void;
  onCopyReport: () => void;
  isCopied: boolean;
  onToggleWeeklyModal: () => void;
  onToggleThursdayModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  report,
  onRunScan,
  isScanning,
  onExportMarkdown,
  onCopyReport,
  isCopied,
  onToggleWeeklyModal,
  onToggleThursdayModal,
}) => {
  return (
    <header className="bg-[#050505] border-b border-[#222222] text-[#E0E0E0] pt-6 pb-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Escalation Alert Banner */}
        {report.isEscalated && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-500/80 rounded-lg flex items-center gap-3 text-red-300">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-xs font-medium tracking-wide">
              <span className="font-bold text-red-400">🚨 警戒升級 ({report.hardTriggersCount}/7 觸發)：</span>
              今日賣出硬閾值中同時觸發 ≥ 2 項！市場位於高風險區域，請密切防範深度回調。
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#111111] border border-[#222222] rounded-lg text-emerald-400">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-light tracking-tighter text-white">
                宏觀風險掃描儀 <span className="text-[#666666] text-base md:text-lg font-mono ml-2 font-normal">MACRO RISK SCANNER</span>
              </h1>
            </div>
            <p className="text-[#777777] text-xs max-w-2xl tracking-wide mt-1">
              美股盤前 17 項關鍵量化指標監測 ． 短中長期風險評估 ． 7 大賣出觸發點實時追蹤
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0B] border border-[#1A1A1A] rounded-lg text-xs font-mono text-[#AAA]">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] text-[#666] uppercase tracking-wider mr-1">資料更新</span>
              <span className="text-white font-semibold">{report.date}</span>
            </div>

            <button
              onClick={onRunScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold tracking-wide border border-emerald-500/30 transition-all cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                  <span>AI 檢索掃描中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>執行 AI 實時掃描</span>
                </>
              )}
            </button>

            <button
              onClick={onCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] hover:bg-[#1A1A1A] text-[#CCC] border border-[#222222] rounded-lg text-xs font-medium transition cursor-pointer"
              title="複製每日掃描完整報告文本"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#888]" />}
              <span>{isCopied ? '已複製' : '複製報告'}</span>
            </button>

            <button
              onClick={onExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] hover:bg-[#1A1A1A] text-[#CCC] border border-[#222222] rounded-lg text-xs font-medium transition cursor-pointer"
              title="導出 Markdown 檔案"
            >
              <Download className="w-3.5 h-3.5 text-[#888]" />
              <span>導出 MD</span>
            </button>
          </div>
        </div>

        {/* Action quick links for extra features */}
        <div className="mt-4 pt-3 border-t border-[#1A1A1A] flex flex-wrap items-center gap-3 text-xs text-[#666]">
          <span className="font-semibold text-[#888] uppercase tracking-wider text-[11px]">專案模組:</span>
          <button
            onClick={onToggleWeeklyModal}
            className="hover:text-emerald-400 text-[#AAA] transition cursor-pointer text-xs"
          >
            🗓️ 週一補充指標（前瞻 PE / 實質殖利率 / DXY / Gold Ratio）
          </button>
          <span className="text-[#333]">|</span>
          <button
            onClick={onToggleThursdayModal}
            className="hover:text-amber-400 text-[#AAA] transition cursor-pointer text-xs"
          >
            📊 週四深度指標（M2 / SLOOS 信貸 / 芝加哥聯儲 NFCI）
          </button>
        </div>
      </div>
    </header>
  );
};
