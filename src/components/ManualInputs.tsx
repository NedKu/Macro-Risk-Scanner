import React, { useEffect, useState } from 'react';
import type { ScanReport } from '../types';

type Props = { open: boolean; report: ScanReport; onClose: () => void; onSaved: () => void };

export function ManualInputs({ open, report, onClose, onSaved }: Props) {
  const [id, setId] = useState('bofa_bull_bear');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch('/api/manual').then(res => res.json()).then(data => {
      const entry = data.values?.[id];
      setValue(entry?.value || ''); setDate(entry?.date || ''); setSource(entry?.source || '');
    }).catch(() => {});
  }, [open, id]);

  if (!open) return null;
  const options = report.indicators.filter(item => item.value === '資料未取得' || item.source.includes('手動輸入'));
  const choices = options.length ? options : report.indicators;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch('/api/manual', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, value, date, source }) });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || '儲存失敗');
      onSaved();
    } catch (error) { setError(String(error)); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="補充來源數值">
      <form onSubmit={submit} className="w-full max-w-lg bg-[#111] border border-[#333] rounded-xl p-5 space-y-3 text-sm">
        <div className="flex justify-between items-start gap-3">
          <div><h2 className="text-lg text-white font-semibold">補充來源數值</h2>
            <p className="text-xs text-[#999] mt-1">輸入你合法取得的原始讀值、觀測日期與來源。更新後會重新計算公開資料報告。</p></div>
          <button type="button" onClick={onClose} className="text-[#aaa] hover:text-white">關閉</button>
        </div>
        <label className="block">指標
          <select value={id} onChange={event => setId(event.target.value)} className="block w-full mt-1 p-2 bg-[#191919] border border-[#444] rounded">
            {!choices.some(item => item.id === id) && <option value={id}>{report.indicators.find(item => item.id === id)?.name || id}</option>}
            {choices.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="block">讀值（BofA／Insider 請輸入純數字；Fear & Greed 可填 80→40；A/D 頂背離填 是 或 否）
          <input required maxLength={300} value={value} onChange={event => setValue(event.target.value)}
            className="block w-full mt-1 p-2 bg-[#191919] border border-[#444] rounded" placeholder="例如 8.2" />
        </label>
        <label className="block">資料日期
          <input required type="date" value={date} onChange={event => setDate(event.target.value)}
            className="block w-full mt-1 p-2 bg-[#191919] border border-[#444] rounded" />
        </label>
        <label className="block">來源或訂閱報告名稱
          <input required maxLength={300} value={source} onChange={event => setSource(event.target.value)}
            className="block w-full mt-1 p-2 bg-[#191919] border border-[#444] rounded" placeholder="例如 BofA Global Research 週報" />
        </label>
        {error && <p className="text-rose-400 text-xs">{error}</p>}
        <button disabled={saving} className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 px-4 py-2 rounded text-white">儲存並重新掃描</button>
      </form>
    </div>
  );
}
