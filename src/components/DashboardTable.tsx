import React, { useState } from 'react';
import { IndicatorData, SignalType, TrendType } from '../types';
import { ArrowUp, ArrowDown, Minus, Info, Search, Filter } from 'lucide-react';

interface DashboardTableProps {
  indicators: IndicatorData[];
}

export const DashboardTable: React.FC<DashboardTableProps> = ({ indicators }) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'short' | 'mid' | 'long'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const renderSignalBadge = (signal: SignalType) => {
    switch (signal) {
      case 'green':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            🟢 正常 / 偏穩
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/50">
            🟡 提示 / 注意
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/50">
            🔴 警戒 / 極端
          </span>
        );
    }
  };

  const renderTrendIcon = (trend: TrendType) => {
    switch (trend) {
      case 'up':
        return (
          <span className="inline-flex items-center text-rose-400 font-mono text-xs" title="較上次掃描上升">
            <ArrowUp className="w-3 h-3 mr-0.5" /> 上升
          </span>
        );
      case 'down':
        return (
          <span className="inline-flex items-center text-emerald-400 font-mono text-xs" title="較上次掃描下降">
            <ArrowDown className="w-3 h-3 mr-0.5" /> 下降
          </span>
        );
      case 'same':
        return (
          <span className="inline-flex items-center text-[#666666] font-mono text-xs" title="較上次掃描持平">
            <Minus className="w-3 h-3 mr-0.5" /> 持平
          </span>
        );
    }
  };

  const safeIndicators = Array.isArray(indicators) ? indicators : [];

  const categories = [
    { key: 'short', title: '🟢 短期指標（天－週級別，判斷過熱回調）', headerColor: 'text-emerald-400', items: safeIndicators.filter(i => i.category === 'short') },
    { key: 'mid', title: '🟡 中期指標（週－月級別，判斷趨勢轉折）', headerColor: 'text-amber-400', items: safeIndicators.filter(i => i.category === 'mid') },
    { key: 'long', title: '🔴 長期指標（月－年級別，判斷結構性週期頂）', headerColor: 'text-rose-400', items: safeIndicators.filter(i => i.category === 'long') },
  ];

  const term = (searchTerm || '').toLowerCase();
  const filteredCategories = categories
    .filter(cat => filterCategory === 'all' || filterCategory === cat.key)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        (item.name || '').toLowerCase().includes(term) ||
        (item.source || '').toLowerCase().includes(term) ||
        (item.value || '').toString().toLowerCase().includes(term)
      ),
    }));

  return (
    <section className="my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xs font-semibold text-[#666666] uppercase tracking-widest flex items-center gap-2">
            第一部分：一張儀表盤表格
          </h2>
          <p className="text-[11px] text-[#555555] mt-0.5">
            17 項市場關鍵風險指標最新讀數、資料日期、警戒閾值與趨勢變化
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter Pills */}
          <div className="flex bg-[#0A0A0B] border border-[#1A1A1A] p-0.5 rounded text-[11px] font-medium">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterCategory === 'all' ? 'bg-[#222222] text-white font-semibold' : 'text-[#666666] hover:text-white'
              }`}
            >
              全部 (17)
            </button>
            <button
              onClick={() => setFilterCategory('short')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterCategory === 'short' ? 'bg-[#222222] text-white font-semibold' : 'text-[#666666] hover:text-white'
              }`}
            >
              🟢 短期 (5)
            </button>
            <button
              onClick={() => setFilterCategory('mid')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterCategory === 'mid' ? 'bg-[#222222] text-white font-semibold' : 'text-[#666666] hover:text-white'
              }`}
            >
              🟡 中期 (7)
            </button>
            <button
              onClick={() => setFilterCategory('long')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterCategory === 'long' ? 'bg-[#222222] text-white font-semibold' : 'text-[#666666] hover:text-white'
              }`}
            >
              🔴 長期 (5)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3 h-3 text-[#555555] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="搜尋指標..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-1 bg-[#0A0A0B] border border-[#1A1A1A] rounded text-[11px] focus:outline-none focus:border-[#444444] text-[#E0E0E0]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-[#0A0A0B] border border-[#1A1A1A] rounded-lg">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="text-[#555555] border-b border-[#1A1A1A] uppercase tracking-wider font-mono text-[10px]">
              <th className="py-2 px-3 w-1/3 font-medium">指標名稱 & 數據源</th>
              <th className="py-2 px-3 font-medium">當前值</th>
              <th className="py-2 px-3 font-medium">趨勢</th>
              <th className="py-2 px-3 font-medium">資料日期</th>
              <th className="py-2 px-3 font-medium">警戒閾值</th>
              <th className="py-2 px-3 text-center font-medium">信號</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A] text-[#CCCCCC]">
            {filteredCategories.map(cat => (
              <React.Fragment key={cat.key}>
                {cat.items.length > 0 && (
                  <tr className="bg-[#0F0F10] font-bold">
                    <td colSpan={6} className={`py-1.5 px-3 text-[10px] tracking-wider uppercase ${cat.headerColor}`}>
                      {cat.title}
                    </td>
                  </tr>
                )}
                {cat.items.map(item => (
                  <tr key={item.id} className="hover:bg-[#121214] transition">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[10px] text-[#555555] font-mono mt-0.5">{item.source}</div>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-white">
                      {item.value}
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {item.value === '資料未取得'
                        ? <span className="text-[#666666] font-mono text-xs">未確認</span>
                        : renderTrendIcon(item.trend)}
                    </td>
                    <td className="py-2 px-3 font-mono text-[#777777] whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-2 px-3 text-[#777777]">
                      {item.threshold}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      {renderSignalBadge(item.signal)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
