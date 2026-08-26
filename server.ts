import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { initialScanReport } from './src/data/mockScanData';
import { ScanReport } from './src/types';

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// In-memory persistent scan history array
let scanHistory: ScanReport[] = [initialScanReport];

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

// Save a scan report
app.post('/api/history', (req, res) => {
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

  res.json({ success: true, count: scanHistory.length, scan: report });
});

// Trigger an AI Realtime Scan using Gemini with Search Grounding
app.post('/api/scan/run', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return latest cached or initial scan with warning
      res.json({
        success: true,
        source: 'cached',
        scan: scanHistory[scanHistory.length - 1] || initialScanReport,
        message: 'GEMINI_API_KEY not configured. Returned latest cached macro scan dataset.'
      });
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

    if (parsed && parsed.indicators && Array.isArray(parsed.indicators)) {
      const finalScan: ScanReport = {
        ...initialScanReport,
        ...parsed,
        indicators: Array.isArray(parsed.indicators) && parsed.indicators.length > 0
          ? parsed.indicators
          : initialScanReport.indicators,
        hardThresholds: Array.isArray(parsed.hardThresholds) && parsed.hardThresholds.length > 0
          ? parsed.hardThresholds
          : initialScanReport.hardThresholds,
        date: todayStr,
      };
      
      // Save to history
      scanHistory.push(finalScan);

      res.json({
        success: true,
        source: 'ai_grounded',
        scan: finalScan,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
      });
      return;
    }

    // Fallback to initial scan report with updated date
    const updatedInitial: ScanReport = {
      ...initialScanReport,
      date: todayStr,
    };
    scanHistory.push(updatedInitial);

    res.json({
      success: true,
      source: 'fallback',
      scan: updatedInitial,
      rawAiResponse: responseText.slice(0, 500),
    });

  } catch (error: any) {
    const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);
    console.error('Error running AI scan:', errorMessage);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const latestScan = scanHistory[scanHistory.length - 1] || initialScanReport;
    const updatedScan: ScanReport = {
      ...latestScan,
      date: todayStr,
    };

    // Helper to check for quota error in various possible error structures
    const isQuotaError = 
      error?.status === 429 || 
      error?.name === 'ApiError' ||
      errorMessage.includes('429') || 
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      (error?.error?.code === 429);

    // Return 200 with fallback scan data so app UI never breaks when API quota is exhausted
    res.json({
      success: true,
      source: 'quota_fallback',
      scan: updatedScan,
      message: isQuotaError
        ? '⚠️ AI 檢索次數已達當日頻率上限，系統已自動為您加載最新歷史數據基準。'
        : '⚠️ AI 檢索服務暫時繁忙，系統已為您加載最新基準掃描報告。',
    });
  }
});

// Vite dev server vs static serving
async function setupServer() {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
