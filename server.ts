import 'dotenv/config';
import express from 'express';
import path from 'path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { GoogleGenAI } from '@google/genai';
import { initialScanReport } from './src/data/mockScanData';
import { ScanReport } from './src/types';
import { runCodexScan } from './codexScan';
import { runPublicScan, type ManualValues } from './publicScan';

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || (process.env.GEMINI_API_KEY ? '0.0.0.0' : '127.0.0.1');
let codexScanInProgress = false;
let publicScanInProgress = false;
let manualValues: ManualValues = {};

let scanHistory: ScanReport[] = [initialScanReport];
const historyPath = path.join(process.cwd(), '.local', 'scan-history.json');
const manualPath = path.join(process.cwd(), '.local', 'manual-values.json');

async function loadHistory() {
  try {
    const saved = JSON.parse(await readFile(historyPath, 'utf8'));
    if (Array.isArray(saved) && saved.length > 0 &&
        saved.every(report => report && typeof report.date === 'string' && Array.isArray(report.indicators))) {
      scanHistory = saved;
    }
  } catch (error: any) {
    if (error?.code !== 'ENOENT') console.error('Could not load scan history:', error);
  }
  try { manualValues = JSON.parse(await readFile(manualPath, 'utf8')); }
  catch (error: any) { if (error?.code !== 'ENOENT') console.error('Could not load manual values:', error); }
}

async function saveHistory() {
  await mkdir(path.dirname(historyPath), { recursive: true });
  await writeFile(historyPath, JSON.stringify(scanHistory, null, 2), 'utf8');
}

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get all history
app.get('/api/history', (_req, res) => {
  res.json({ success: true, history: scanHistory });
});

// Get latest scan
app.get('/api/scan/latest', (_req, res) => {
  const latest = scanHistory[scanHistory.length - 1] || initialScanReport;
  res.json({ success: true, scan: latest });
});

function isLocalRequest(req: express.Request) {
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress || '') &&
    [`localhost:${PORT}`, `127.0.0.1:${PORT}`].includes(req.get('host') || '') &&
    (!req.get('origin') || [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`].includes(req.get('origin')!));
}

app.get('/api/manual', (req, res) => {
  if (!isLocalRequest(req)) { res.status(403).json({ success: false }); return; }
  res.json({ success: true, values: manualValues });
});
app.post('/api/manual', async (req, res) => {
  if (!isLocalRequest(req)) {
    res.status(403).json({ success: false, message: '手動補值僅供本機使用。' }); return;
  }
  const { id, value, date, source } = req.body || {};
  if (!initialScanReport.indicators.some(item => item.id === id) ||
      ![value, date, source].every(x => typeof x === 'string' && x.trim() && x.length <= 300) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > new Date().toISOString().slice(0, 10)) {
    res.status(400).json({ success: false, message: '請提供有效的指標、數值、日期與來源。' }); return;
  }
  const numeric = Number(value);
  manualValues[id] = { value: value.trim(), date: date.trim(), source: source.trim(),
    numValue: Number.isFinite(numeric) ? numeric : undefined };
  try {
    await mkdir(path.dirname(manualPath), { recursive: true });
    await writeFile(manualPath, JSON.stringify(manualValues, null, 2), 'utf8');
    res.json({ success: true, values: manualValues });
  } catch (error) { res.status(500).json({ success: false, message: '手動數值儲存失敗。' }); }
});

// Save a scan report
app.post('/api/history', async (req, res) => {
  const report: ScanReport = req.body;
  if (!report || !report.date || !Array.isArray(report.indicators)) {
    res.status(400).json({ success: false, error: 'Invalid scan report format' });
    return;
  }
  
  // Replace if exists for same date, else append
  const idx = scanHistory.findIndex(s => s.date === report.date);
  if (idx >= 0) {
    scanHistory[idx] = report;
  } else {
    scanHistory.push(report);
  }

  try {
    await saveHistory();
    res.json({ success: true, count: scanHistory.length, scan: report });
  } catch (error) {
    console.error('Could not save scan history:', error);
    res.status(500).json({ success: false, message: '無法儲存掃描歷史。' });
  }
});

// Trigger an AI Realtime Scan using Gemini with Search Grounding
app.post('/api/scan/run', async (req, res) => {
  try {
    if (req.body?.mode !== 'ai') {
      if (publicScanInProgress) { res.status(409).json({ success: false, message: '公開資料掃描正在進行。' }); return; }
      publicScanInProgress = true;
      try {
        const scan = await runPublicScan(manualValues);
        scanHistory.push(scan);
        await saveHistory();
        res.json({ success: true, source: 'public', scan,
          message: `✅ 公開資料掃描完成：${scan.indicators.filter(item => item.value !== '資料未取得').length}/17 項有讀值。` });
      } catch (error) {
        console.error('Public scan failed:', error);
        res.status(503).json({ success: false, message: '公開資料掃描失敗；原有報告未更新。' });
      } finally { publicScanInProgress = false; }
      return;
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const host = req.get('host');
      const origin = req.get('origin');
      const allowedHosts = [`localhost:${PORT}`, `127.0.0.1:${PORT}`];
      const localAddress = req.socket.remoteAddress;
      if (!host || !allowedHosts.includes(host) ||
          !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(localAddress || '') ||
          (origin && !allowedHosts.some(allowed => origin === `http://${allowed}`))) {
        res.status(403).json({ success: false, message: 'Codex 掃描僅供本機網頁使用。' });
        return;
      }
      if (codexScanInProgress) {
        res.status(409).json({ success: false, message: '掃描正在進行，請稍候。' });
        return;
      }
      codexScanInProgress = true;
      try {
        const scan = await runCodexScan();
        scanHistory.push(scan);
        await saveHistory();
        res.json({ success: true, source: 'codex_search', scan,
          message: '✅ Codex 網路檢索掃描完成；請留意各指標的資料日期與來源。' });
      } catch (error) {
        console.error('Codex scan failed:', error);
        res.status(503).json({ success: false,
          message: 'Codex 掃描未完成；原有報告未更新。請確認 Codex CLI 已登入，並檢查伺服器日誌。' });
      } finally {
        codexScanInProgress = false;
      }
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are a financial analyst specializing in macro risk scanning.
Your task is to fetch the latest real-time values for 17 key macro market indicators and compile a JSON report.
Today is ${todayStr}. Use Google Search to look up recent readings (within 1-2 days if short-term, or most recent published for monthly/quarterly indicators).

The 17 indicators are:
1. VIX (CBOE Volatility Index)
2. CNN Fear & Greed Index
3. AAII Investor Sentiment Survey (Bullish %, Bearish %, Spread)
4. CBOE Equity Put/Call Ratio
5. NAAIM Exposure Index
6. FINRA Margin Debt ($ total & YoY growth)
7. Margin Debt / GDP ratio
8. Renaissance IPO Stats
9. Insider Buy/Sell Ratio (GuruFocus USA Overall Market)
10. BofA Bull & Bear Indicator
11. ICE BofA US High Yield OAS Spread (BAMLH0A0HYM2)
12. NYSE Advance/Decline Line divergence status
13. Buffett Indicator (Total Market / GDP)
14. Shiller CAPE / PE10
15. 10Y-2Y Treasury Yield Curve (T10Y2Y)
16. Conference Board US LEI
17. AAII Household Stock Allocation %

Analyze if any of the 7 hard sell thresholds are triggered:
1. VIX > 25
2. Margin Debt MoM decline for 3 consecutive months
3. HY Spread > 4.5%
4. Fear & Greed dropped from >75 to <50
5. A/D Line top divergence with S&P
6. BofA Bull & Bear > 8.0
7. Insider Buy/Sell < 0.17

Count how many hard thresholds are triggered (yes). If >= 2, set isEscalated to true. If >= 3, set sellThresholdReached to true.
Return valid JSON matching the schema provided.`;

    const promptText = `Please run a full live macro scan for today (${todayStr}) and return a clean JSON object containing all 17 indicator readings, signal statuses (green/yellow/red), hard thresholds checks, short/mid/long conclusions, spotlight signal, and data notes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    
    // Attempt to extract JSON from codeblock or text
    let parsed: any = null;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, responseText];
    try {
      parsed = JSON.parse(jsonMatch[1] || responseText);
    } catch (err) {
      console.log('AI response parsing failed, falling back to base report with current date');
    }

    if (parsed && Array.isArray(parsed.indicators) && parsed.indicators.length === initialScanReport.indicators.length &&
        Array.isArray(parsed.hardThresholds) && parsed.hardThresholds.length === initialScanReport.hardThresholds.length) {
      const finalScan: ScanReport = {
        ...initialScanReport,
        ...parsed,
        date: todayStr,
      };
      
      // Save to history
      scanHistory.push(finalScan);
      await saveHistory();

      res.json({
        success: true,
        source: 'ai_grounded',
        scan: finalScan,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
      });
      return;
    }

    res.status(502).json({
      success: false,
      message: 'Gemini 未返回完整掃描報告；原有報告未更新。',
    });

  } catch (error: any) {
    const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);
    console.error('Error running AI scan:', errorMessage);
    
    // Helper to check for quota error in various possible error structures
    const isQuotaError = 
      error?.status === 429 || 
      error?.name === 'ApiError' ||
      errorMessage.includes('429') || 
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      (error?.error?.code === 429);

    res.status(503).json({
      success: false,
      message: isQuotaError
        ? '⚠️ Gemini 已達使用上限；原有報告未更新。'
        : '⚠️ Gemini 掃描失敗；原有報告未更新。',
    });
  }
});

// Vite dev server vs static serving
async function setupServer() {
  await loadHistory();
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
}

setupServer();
