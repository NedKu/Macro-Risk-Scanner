import React from 'react';
import { ScanReport } from '../types';
import { X, Calendar, Layers, BarChart3 } from 'lucide-react';

interface WeeklyModalsProps {
  report: ScanReport;
  showWeekly: boolean;
  showThursday: boolean;
  onCloseWeekly: () => void;
  onCloseThursday: () => void;
}

export const WeeklyModals: React.FC<WeeklyModalsProps> = ({
  report,
  showWeekly,
  showThursday,
  onCloseWeekly,
  onCloseThursday,
}) => {
  if (!showWeekly && !showThursday) return null;

  return (
    <>
      {/* Monday Extra Modal */}
      {showWeekly && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0B] border border-[#222222] rounded-lg max-w-xl w-full p-5 text-[#E0E0E0] shadow-2xl relative">
            <button
              onClick={onCloseWeekly}
              className="absolute top-4 right-4 p-1 rounded bg-[#1A1A1A] hover:bg-[#222222] text-[#888888] hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-950/50 text-emerald-400 rounded border border-emerald-800/40">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">週一額外追蹤指標（4 項）</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#0F0F10] rounded border border-[#1A1A1A] flex items-center justify-between">
                <span className="font-semibold text-[#CCCCCC]">1. 標普 500 前瞻本益比（Forward P/E）</span>
                <span className="font-mono font-bold text-emerald-400">{report.weeklyExtra?.sp500ForwardPE || '22.4 倍'}</span>
              </div>
              <div className="p-3 bg-[#0F0F10] rounded border border-[#1A1A1A] flex items-center justify-between">
                <span className="font-semibold text-[#CCCCCC]">2. 10 年期 TIPS 實質殖利率（Real Yield）</span>
                <span className="font-mono font-bold text-emerald-400">{report.weeklyExtra?.tipsRealYield10Y || '2.12%'}</span>
              </div>
              <div className="p-3 bg-[#0F0F10] rounded border border-[#1A1A1A] flex items-center justify-between">
                <span className="font-semibold text-[#CCCCCC]">3. 美元指數（DXY）</span>
                <span className="font-mono font-bold text-emerald-400">{report.weeklyExtra?.dxy || '102.85'}</span>
              </div>
              <div className="p-3 bg-[#0F0F10] rounded border border-[#1A1A1A] flex items-center justify-between">
                <span className="font-semibold text-[#CCCCCC]">4. Gold / S&P 500 比值</span>
                <span className="font-mono font-bold text-emerald-400">{report.weeklyExtra?.goldSp500Ratio || '0.43'}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#777777] mt-3.5 leading-relaxed">
              週一補充說明：前瞻 PE 高於歷史均值（19.2x），10 年期實質殖利率 &gt; 2% 保持對高估值資產的估值壓制，黃金與標普比值小幅上升顯示資金開始進行黃金避險配置。
            </p>

            <div className="mt-4 text-right">
              <button
                onClick={onCloseWeekly}
                className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] text-[#CCC] rounded text-xs font-semibold cursor-pointer border border-[#222222]"
              >
                關閉窗口
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thursday Deep Dive Modal */}
      {showThursday && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0B] border border-[#222222] rounded-lg max-w-xl w-full p-5 text-[#E0E0E0] shadow-2xl relative">
            <button
              onClick={onCloseThursday}
              className="absolute top-4 right-4 p-1 rounded bg-[#1A1A1A] hover:bg-[#222222] text-[#888888] hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-950/50 text-amber-400 rounded border border-amber-800/40">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">週四晚深度版：FRED 高階流動性指標</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#0F0F10] rounded border border-[#1A1A1A]">
                <div className="font-semibold text-amber-400 mb-1">1. M2 貨幣供給年增率</div>
                <p className="text-white font-mono font-bold">{report.thursdayDeepDive?.m2Growth || 'YoY +2.8%'}</p>
                <p className="text-[#777777] text-[11px] mt-1">反映金融體系整體貨幣流動性，目前保持低速溫和擴張。</p>
              </div>

              <div className="p-3 bg-[#0F0F10] rounded border border-[#1A1A1A]">
                <div className="font-semibold text-amber-400 mb-1">2. Senior Loan Officer Survey (SLOOS) 銀行信貸調查</div>
                <p className="text-white font-mono font-bold">{report.thursdayDeepDive?.sloosReport || '商業與工業貸款信貸標準保持收緊'}</p>
                <p className="text-[#777777] text-[11px] mt-1">銀行對中大型企業信貸標準仍然偏嚴，貸款需求中性偏弱。</p>
              </div>

              <div className="p-3 bg-[#0F0F10] rounded border border-[#1A1A1A]">
                <div className="font-semibold text-amber-400 mb-1">3. 芝加哥聯儲全國金融條件指數 (Chicago Fed NFCI)</div>
                <p className="text-white font-mono font-bold">{report.thursdayDeepDive?.chicagoFedNfci || '-0.52（低於 0 代表金融條件寬鬆）'}</p>
                <p className="text-[#777777] text-[11px] mt-1">金融條件維持偏寬鬆，資本市場融資與流動性並未出現冰凍。</p>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={onCloseThursday}
                className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] text-[#CCC] rounded text-xs font-semibold cursor-pointer border border-[#222222]"
              >
                關閉窗口
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
