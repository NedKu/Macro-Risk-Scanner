import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import scanSchema from './codex-scan-schema.json';
import { initialScanReport } from './src/data/mockScanData';
import type { HardThreshold, IndicatorData, ScanReport } from './src/types';

const indicatorIds = initialScanReport.indicators.map(indicator => indicator.id);
const thresholdIds = initialScanReport.hardThresholds.map(threshold => threshold.id);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validItems(items: unknown, ids: string[], fields: string[]): items is Record<string, unknown>[] {
  return Array.isArray(items) && items.length === ids.length &&
    new Set(items.map(item => isRecord(item) ? item.id : undefined)).size === ids.length &&
    items.every(item => isRecord(item) && ids.includes(String(item.id)) &&
      fields.every(field => typeof item[field] === 'string' && String(item[field]).trim().length > 0));
}

function buildReport(raw: unknown, date: string): ScanReport {
  if (!isRecord(raw) ||
      !validItems(raw.indicators, indicatorIds, ['id', 'value', 'date', 'source', 'signal', 'trend', 'interpretation']) ||
      !validItems(raw.hardThresholds, thresholdIds, ['id', 'currentReading', 'status', 'notes'])) {
    throw new Error('Codex 未返回完整的 17 項指標和 7 項門檻。');
  }

  const indicators = initialScanReport.indicators.map(base => {
    const item = (raw.indicators as Record<string, unknown>[]).find(row => row.id === base.id)!;
    if (!['green', 'yellow', 'red'].includes(String(item.signal)) ||
        !['up', 'down', 'same'].includes(String(item.trend))) {
      throw new Error(`指標 ${base.id} 的狀態無效。`);
    }
    return {
      ...base,
      value: String(item.value),
      numValue: typeof item.numValue === 'number' ? item.numValue : undefined,
      date: String(item.date),
      source: String(item.source),
      signal: item.signal as IndicatorData['signal'],
      trend: item.trend as IndicatorData['trend'],
      interpretation: String(item.interpretation),
    };
  });

  const hardThresholds = initialScanReport.hardThresholds.map(base => {
    const item = (raw.hardThresholds as Record<string, unknown>[]).find(row => row.id === base.id)!;
    if (!['no', 'warning', 'yes'].includes(String(item.status))) {
      throw new Error(`門檻 ${base.id} 的狀態無效。`);
    }
    return {
      ...base,
      currentReading: String(item.currentReading),
      status: item.status as HardThreshold['status'],
      notes: String(item.notes),
    };
  });

  const requiredText = ['shortTermConclusion', 'midTermConclusion', 'longTermConclusion',
    'spotlightSignalId', 'spotlightTitle', 'spotlightReason'];
  if (requiredText.some(field => typeof raw[field] !== 'string' || !String(raw[field]).trim()) ||
      !indicatorIds.includes(String(raw.spotlightSignalId)) ||
      !isRecord(raw.weeklyExtra) || !isRecord(raw.thursdayDeepDive) ||
      !Array.isArray(raw.dataNotes) || !raw.dataNotes.every(note => typeof note === 'string')) {
    throw new Error('Codex 報告缺少必要欄位。');
  }

  for (const [section, fields] of [
    [raw.weeklyExtra, ['sp500ForwardPE', 'tipsRealYield10Y', 'dxy', 'goldSp500Ratio', 'date']],
    [raw.thursdayDeepDive, ['m2Growth', 'sloosReport', 'chicagoFedNfci', 'date']],
  ] as [Record<string, unknown>, string[]][]) {
    if (fields.some(field => typeof section[field] !== 'string' || !String(section[field]).trim())) {
      throw new Error('Codex 報告缺少補充指標。');
    }
  }

  const greenCount = (category: IndicatorData['category']) =>
    indicators.filter(item => item.category === category && item.signal === 'green').length;
  const hardTriggersCount = hardThresholds.filter(item => item.status === 'yes').length;
  return {
    date,
    indicators,
    hardThresholds,
    hardTriggersCount,
    isEscalated: hardTriggersCount >= 2,
    sellThresholdReached: hardTriggersCount >= 3,
    shortTermUnwarned: greenCount('short'),
    shortTermTotal: indicators.filter(item => item.category === 'short').length,
    midTermUnwarned: greenCount('mid'),
    midTermTotal: indicators.filter(item => item.category === 'mid').length,
    longTermUnwarned: greenCount('long'),
    longTermTotal: indicators.filter(item => item.category === 'long').length,
    shortTermConclusion: String(raw.shortTermConclusion),
    midTermConclusion: String(raw.midTermConclusion),
    longTermConclusion: String(raw.longTermConclusion),
    spotlightSignalId: String(raw.spotlightSignalId),
    spotlightTitle: String(raw.spotlightTitle),
    spotlightReason: String(raw.spotlightReason),
    weeklyExtra: raw.weeklyExtra as unknown as ScanReport['weeklyExtra'],
    thursdayDeepDive: raw.thursdayDeepDive as unknown as ScanReport['thursdayDeepDive'],
    dataNotes: raw.dataNotes as string[],
  };
}

export async function runCodexScan(): Promise<ScanReport> {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const workDir = await mkdtemp(path.join(os.tmpdir(), 'macro-risk-scan-'));
  const schemaPath = path.join(workDir, 'schema.json');
  const outputPath = path.join(workDir, 'report.json');
  const prompt = `Today in Taiwan is ${date}. Research the latest publicly verifiable US macro market data using live web search. Return a Traditional Chinese JSON report matching the schema. This is a market risk dashboard, not personalized investment advice.

Research all 17 indicator IDs in this exact order: ${indicatorIds.join(', ')}. Research these 7 hard threshold IDs: ${thresholdIds.join(', ')}. The hard thresholds are: VIX >25; FINRA margin debt declines month-over-month for 3 consecutive months; ICE BofA US HY OAS >4.5%; CNN Fear & Greed falls from >75 to <50; NYSE A/D line fails to confirm a new S&P 500 high; BofA Bull & Bear >8.0; US overall insider buy/sell ratio <0.17.

For each indicator supply the latest observed value, observation date, identifiable source URL or publisher, green/yellow/red signal, up/down/same trend, and concise interpretation. If a value or history cannot be verified, write 資料未取得, use date 未確認, numValue null, signal yellow, and explain the limitation. Never reuse the August 2026 sample values as current facts. For a hard threshold, use yes only with sufficient evidence, no only when evidence disproves it, and warning when unverifiable or near threshold. Cite evidence and dates in notes or dataNotes. Do not invent inaccessible proprietary readings (especially BofA, GuruFocus, NAAIM). Distinguish observation date from scan date.

Provide short/mid/long conclusions, spotlight on one of the 17 IDs, weekly extra values (S&P 500 forward PE, 10Y TIPS real yield, DXY, gold/S&P 500 ratio), Thursday deep dive values (M2 growth, SLOOS, Chicago Fed NFCI), and dataNotes. For unavailable extras use 資料未取得 with date 未確認. Keep all 17 and all 7 IDs exactly once. No Markdown, only JSON.`;

  try {
    await writeFile(schemaPath, JSON.stringify(scanSchema), 'utf8');
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.env.CODEX_BIN || 'codex', [
        '--search', '--ask-for-approval', 'never', 'exec', '--ephemeral', '--ignore-user-config', '--skip-git-repo-check',
        '--sandbox', 'read-only', '-C', workDir,
        '--output-schema', schemaPath, '--output-last-message', outputPath, '-'
      ], { cwd: workDir, windowsHide: true, env: process.env });
      let stderr = '';
      const timeout = setTimeout(() => child.kill(), 8 * 60 * 1000);
      child.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-8000); });
      child.stdout.resume();
      child.on('error', error => { clearTimeout(timeout); reject(error); });
      child.on('close', code => {
        clearTimeout(timeout);
        if (code === 0) resolve();
        else reject(new Error(`Codex CLI 結束碼 ${code}: ${stderr.slice(-1500)}`));
      });
      child.stdin.on('error', () => {});
      child.stdin.end(prompt);
    });
    return buildReport(JSON.parse(await readFile(outputPath, 'utf8')), date);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
