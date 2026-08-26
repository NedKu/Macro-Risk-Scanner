import { ScanReport } from '../types';

export function generateReportMarkdown(report: ScanReport): string {
  if (!report) return '';

  const indicators = Array.isArray(report.indicators) ? report.indicators : [];
  const hardThresholds = Array.isArray(report.hardThresholds) ? report.hardThresholds : [];
  const dataNotes = Array.isArray(report.dataNotes) ? report.dataNotes : [];

  const shortCategory = indicators.filter(i => i.category === 'short');
  const midCategory = indicators.filter(i => i.category === 'mid');
  const longCategory = indicators.filter(i => i.category === 'long');

  const getSignalEmoji = (signal: string) => {
    if (signal === 'green') return '🟢 正常';
    if (signal === 'yellow') return '🟡 提示';
    return '🔴 警戒';
  };

  const getTrendText = (trend: string) => {
    if (trend === 'up') return '↑ 上升';
    if (trend === 'down') return '↓ 下降';
    return '→ 持平';
  };

  const getStatusEmoji = (status: string) => {
    if (status === 'yes') return '✅ 已達成';
    if (status === 'warning') return '⚠️ 觀察中';
    return '❌ 未達成';
  };

  let md = '';

  if (report.isEscalated) {
    md += `🚨 **【警戒升級】今日 7 項硬賣出閾值中已同時觸發 ≥ 2 項，市場處於極高風險狀態！**\n\n`;
  }

  md += `# 📊 每日宏觀風險掃描報告（${report.date}）\n\n`;

  // 第一部分
  md += `## 第一部分：一張儀表盤表格\n\n`;
  md += `| 指標 | 當前值 | 對比 | 資料日期 | 警戒閾值 | 信號 |\n`;
  md += `|---|---|---|---|---|---|\n`;

  md += `| **🟢 短期指標（天－週級別，判斷過熱回調）** | | | | | |\n`;
  shortCategory.forEach(i => {
    md += `| ${i.name} | ${i.value} | ${getTrendText(i.trend)} | ${i.date} | ${i.threshold} | ${getSignalEmoji(i.signal)} |\n`;
  });

  md += `| **🟡 中期指標（週－月級別，判斷趨勢轉折）** | | | | | |\n`;
  midCategory.forEach(i => {
    md += `| ${i.name} | ${i.value} | ${getTrendText(i.trend)} | ${i.date} | ${i.threshold} | ${getSignalEmoji(i.signal)} |\n`;
  });

  md += `| **🔴 長期指標（月－年級別，判斷結構性週期頂）** | | | | | |\n`;
  longCategory.forEach(i => {
    md += `| ${i.name} | ${i.value} | ${getTrendText(i.trend)} | ${i.date} | ${i.threshold} | ${getSignalEmoji(i.signal)} |\n`;
  });

  md += `\n---\n\n`;

  // 第二部分
  md += `## 第二部分：警報統計速覽\n\n`;
  md += `- **短期信號統計**：${report.shortTermUnwarned} / ${report.shortTermTotal} 未警報\n`;
  md += `- **中期信號統計**：${report.midTermUnwarned} / ${report.midTermTotal} 未警報\n`;
  md += `- **長期信號統計**：${report.longTermUnwarned} / ${report.longTermTotal} 未警報\n\n`;

  md += `---\n\n`;

  // 第三部分
  md += `## 第三部分：逐條簡短解讀\n\n`;
  report.indicators.forEach((i, idx) => {
    md += `### ${idx + 1}. ${i.name}（${i.value}）\n`;
    md += `${i.interpretation}\n\n`;
  });

  md += `---\n\n`;

  // 第四部分
  md += `## 第四部分：短中長期綜合結論\n\n`;
  md += `- **短期（1-3 個月）**：${report.shortTermConclusion}\n\n`;
  md += `- **中期（3-12 個月）**：${report.midTermConclusion}\n\n`;
  md += `- **長期（1-3 年+）**：${report.longTermConclusion}\n\n`;

  md += `---\n\n`;

  // 第五部分
  md += `## 第五部分：賣出觸發狀態追蹤\n\n`;
  md += `| 觸發條件 | 閾值 | 今日狀態 | 達成 |\n`;
  md += `|---|---|---|---|\n`;
  hardThresholds.forEach(ht => {
    md += `| ${ht.condition} | ${ht.threshold} | ${ht.currentReading} | ${getStatusEmoji(ht.status)} |\n`;
  });

  md += `\n**今日共有 ${report.hardTriggersCount || 0} / 7 項觸發**，${
    report.sellThresholdReached
      ? '🚨 **已達到『開始分批賣出』門檻（需同時觸發 3+ 項），建議立即執行賣出與避險計劃！**'
      : '✅ **未達到『開始分批賣出』硬閾值（需同時觸發 3+ 項，目前僅 1 項觸發）。**'
  }\n\n`;

  md += `---\n\n`;

  // 第六部分
  md += `## 第六部分：今日最需關注的一條信號\n\n`;
  md += `### 📌 ${report.spotlightTitle || ''}\n`;
  md += `${report.spotlightReason || ''}\n\n`;

  if (dataNotes.length > 0) {
    md += `---\n\n## 📌 數據滯後與來源說明\n\n`;
    dataNotes.forEach(note => {
      md += `- ${note}\n`;
    });
  }

  return md;
}
