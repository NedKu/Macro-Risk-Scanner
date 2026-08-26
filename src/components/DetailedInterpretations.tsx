import React, { useState } from 'react';
import { IndicatorData } from '../types';
import { ChevronDown, ChevronUp, FileText, Filter } from 'lucide-react';

interface DetailedInterpretationsProps {
  indicators: IndicatorData[];
}

export const DetailedInterpretations: React.FC<DetailedInterpretationsProps> = ({ indicators }) => {
  const [openCategory, setOpenCategory] = useState<'all' | 'short' | 'mid' | 'long'>('all');

  const safeIndicators = Array.isArray(indicators) ? indicators : [];

  const categories = [
    { key: 'short', title: '🟢 短期指標解讀（1-5）', items: safeIndicators.filter(i => i.category === 'short') },
    { key: 'mid', title: '🟡 中期指標解讀（6-12）', items: safeIndicators.filter(i => i.category === 'mid') },
    { key: 'long', title: '🔴 長期指標解讀（13-17）', items: safeIndicators.filter(i => i.category === 'long') },
  ];

  return (
    <section className="my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xs font-semibold text-[#666666] uppercase tracking-widest flex items-center gap-2">
            第三部分：逐條簡短解讀
          </h2>
          <p className="text-[11px] text-[#555555] mt-0.5">
            17 項指標當前歷史位置、變化方向及對投資決策的具體含義（每條 2-3 句）
          </p>
        </div>

        <div className="flex bg-[#0A0A0B] border border-[#1A1A1A] p-0.5 rounded text-[11px] font-medium">
          <button
            onClick={() => setOpenCategory('all')}
            className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
              openCategory === 'all' ? 'bg-[#222222] text-white font-semibold' : 'text-[#666666] hover:text-white'
            }`}
          >
            顯示全部
          </button>
          <button
            onClick={() => setOpenCategory('short')}
            className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
              openCategory === 'short' ? 'bg-[#222222] text-white font-semibold' : 'text-[#666666] hover:text-white'
            }`}
          >
            短期 (5)
          </button>
          <button
            onClick={() => setOpenCategory('mid')}
            className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
              openCategory === 'mid' ? 'bg-[#222222] text-white font-semibold' : 'text-[#666666] hover:text-white'
            }`}
          >
            中期 (7)
          </button>
          <button
            onClick={() => setOpenCategory('long')}
            className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
              openCategory === 'long' ? 'bg-[#222222] text-white font-semibold' : 'text-[#666666] hover:text-white'
            }`}
          >
            長期 (5)
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {categories
          .filter(cat => openCategory === 'all' || openCategory === cat.key)
          .map(cat => (
            <div key={cat.key} className="bg-[#0A0A0B] border border-[#1A1A1A] rounded-lg p-4">
              <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider border-b border-[#1A1A1A] pb-2 mb-3">
                {cat.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.items.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded bg-[#0F0F10] border border-[#1A1A1A] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-white text-xs">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#E0E0E0] shrink-0 border border-[#222222]">
                          {item.value}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#BBBBBB] leading-relaxed">
                        {item.interpretation}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-[#1A1A1A] flex items-center justify-between text-[10px] text-[#555555] font-mono">
                      <span>來源: {item.source}</span>
                      <span>日期: {item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};
