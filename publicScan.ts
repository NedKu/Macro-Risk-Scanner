import { initialScanReport } from './src/data/mockScanData';
import { publicIndicatorAlternatives } from './src/data/publicIndicatorAlternatives';
import type { HardThreshold, IndicatorData, ScanReport, SignalType } from './src/types';

type Point = { date: string; value: number };
type ManualValue = { value: string; date: string; source: string; numValue?: number };
export type ManualValues = Record<string, ManualValue>;

const unavailable = '資料未取得';
const fredUrl = (id: string) => `https://fred.stlouisfed.org/series/${id}`;

async function getText(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'MacroRiskScanner/1.0 (personal research)' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function fred(id: string): Promise<Point[]> {
  const text = await getText(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=2023-01-01`);
  return text.trim().split(/\r?\n/).slice(1).map(line => {
    const [date, raw] = line.split(',');
    return { date, value: Number(raw) };
  }).filter(point => point.date && Number.isFinite(point.value));
}

const latest = (series: Point[]) => series[series.length - 1];
const trend = (now: number, before?: number): IndicatorData['trend'] =>
  before === undefined ? 'same' : now > before ? 'up' : now < before ? 'down' : 'same';
const fmt = (value: number, digits = 2) => value.toFixed(digits);

export async function runPublicScan(manual: ManualValues = {}): Promise<ScanReport> {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const indicators: IndicatorData[] = initialScanReport.indicators.map(base => ({ ...base, value: unavailable, numValue: undefined,
    date: '未確認', source: base.source, signal: 'yellow' as SignalType, trend: 'same' as const,
    interpretation: '公開來源未能核實最新讀值；此項不計為已觸發或未觸發的硬門檻。' }));
  const notes: string[] = ['此報告由公開網頁與 FRED 資料直接解析，未使用 AI。資料日期為來源觀測日，不等同掃描日。'];
  const set = (id: string, value: string, numValue: number | undefined, observed: string, source: string,
    signal: SignalType, interpretation: string, previous?: number) => {
    const item = indicators.find(x => x.id === id)!;
    item.value = value; item.numValue = numValue; item.date = observed; item.source = source;
    item.signal = signal; item.trend = numValue === undefined ? 'same' : trend(numValue, previous);
    item.interpretation = interpretation;
  };

  const ids = ['VIXCLS', 'BAMLH0A0HYM2', 'T10Y2Y', 'GDP', 'M2SL', 'DFII10', 'NFCI', 'DRTSCILM', 'DTWEXBGS'];
  const fetched = await Promise.all(ids.map(async id => {
    try { return [id, await fred(id)] as const; }
    catch (error) { notes.push(`FRED ${id} 讀取失敗：${String(error)}`); return [id, []] as const; }
  }));
  const data = Object.fromEntries(fetched) as Record<string, Point[]>;
  const p = (id: string) => latest(data[id] || []);
  const prev = (id: string) => data[id]?.at(-2)?.value;

  if (p('VIXCLS')) { const x = p('VIXCLS'); set('vix', fmt(x.value), x.value, x.date, fredUrl('VIXCLS'),
    x.value > 25 ? 'red' : x.value > 20 ? 'yellow' : 'green', `FRED VIX 收盤讀值 ${fmt(x.value)}；超過 25 為硬門檻。`, prev('VIXCLS')); }
  if (p('BAMLH0A0HYM2')) { const x = p('BAMLH0A0HYM2'); set('hy_spread', `${fmt(x.value)}%`, x.value, x.date, fredUrl('BAMLH0A0HYM2'),
    x.value > 4.5 ? 'red' : x.value > 4 ? 'yellow' : 'green', `ICE BofA 高收益債 OAS 為 ${fmt(x.value)}%；硬門檻是 4.5%。`, prev('BAMLH0A0HYM2')); }
  if (p('T10Y2Y')) { const x = p('T10Y2Y'); set('yield_curve', `${fmt(x.value)} 個百分點`, x.value, x.date, fredUrl('T10Y2Y'),
    x.value < 0 ? 'red' : x.value < 0.5 ? 'yellow' : 'green', '10 年減 2 年期美債殖利率差；接近零或倒掛時需留意。', prev('T10Y2Y')); }

  const pages = await Promise.allSettled([
    getText('https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics'),
    getText('https://index.naaim.org/embeddable/table'),
    getText('https://www.renaissancecapital.com/IPO-Center/Stats'),
    getText('https://www.cboe.com/us/options/market_statistics/daily/'),
    getText('https://www.multpl.com/shiller-pe'),
    getText('https://currentmarketvaluation.com/models/buffett-indicator.php'),
    getText('https://www.conference-board.org/topics/us-leading-indicators/'),
    getText('https://marketvaluation.eu/'),
    getText('https://usmacro.com/indicator/aaii_bull_bear_spread'),
  ]);
  const html = pages.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    notes.push(`公開來源 ${index + 1} 讀取失敗：${String(result.reason)}`);
    return '';
  });

  const marginRows = [...html[0].matchAll(/<tr><td>([A-Za-z]{3}-\d{2})<\/td><td>([\d,]+)<\/td>/g)].map(match => ({
    date: match[1], value: Number(match[2].replaceAll(',', '')),
  }));
  if (marginRows.length) {
    const [current, prior] = marginRows;
    const change = prior ? (current.value / prior.value - 1) * 100 : undefined;
    set('margin_debt', `${(current.value / 1e6).toFixed(3)} 兆美元${change === undefined ? '' : `；月變 ${fmt(change)}%`}`,
      current.value, current.date, 'https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics',
      change !== undefined && change < 0 ? 'yellow' : 'green', 'FINRA 客戶證券保證金帳戶借方餘額；月變化由相鄰兩月計算。', prior?.value);
    if (p('GDP')) {
      const gdp = p('GDP');
      const ratio = current.value / (gdp.value * 1000) * 100;
      set('margin_debt_gdp', `${fmt(ratio)}%（不同發布期的估算）`, ratio, `${current.date} / ${gdp.date}`,
        'FINRA + ' + fredUrl('GDP'), ratio > 4.5 ? 'red' : ratio > 4 ? 'yellow' : 'green',
        'FINRA 百萬美元借方餘額除以 BEA 年率 GDP（十億美元）；分子與分母發布期不同，屬估算。');
    }
  }

  const naaim = html[1].match(/<td>(\d{2}\/\d{2}\/\d{4})<\/td>\s*<td[^>]*>([\d.]+)<\/td>/);
  if (naaim) { const value = Number(naaim[2]); set('naaim_exposure', `${fmt(value)}%（延遲發布）`, value,
    naaim[1], 'https://index.naaim.org/embeddable/table', value > 90 ? 'red' : value > 80 ? 'yellow' : 'green',
    'NAAIM 官網公開值延遲約三個月，不代表當週曝險。'); notes.push('NAAIM 公開數值有三個月延遲；需要即時原值須由 NAAIM 合法訂閱取得。'); }

  const ipo = html[2].match(/Pricing Activity<\/a>[\s\S]{0,400}?There have been <strong>(\d+)<\/strong> IPOs priced this year, a <span[^>]*>([-\d.]+)%<\/span>/);
  const ipoDate = html[2].match(/data-subtitle="as of (\d{1,2}\/\d{1,2}\/\d{4})"/);
  if (ipo) { const count = Number(ipo[1]), yoy = Number(ipo[2]); set('renaissance_ipo', `年初至今 ${count} 家；同比 ${fmt(yoy, 1)}%`, count,
    ipoDate?.[1] || date, 'https://www.renaissancecapital.com/IPO-Center/Stats', yoy > 50 ? 'red' : yoy > 20 ? 'yellow' : 'green',
    'Renaissance 公開 IPO 定價數量及同比；不是其付費 IPO 指數。'); }

  const cboe = html[3].match(/EQUITY PUT\/CALL RATIO\\",\\"value\\":\\"([\d.]+)\\"/);
  const cboeDate = html[3].match(/selectedDate\\":\\"(\d{4}-\d{2}-\d{2})\\"/);
  if (cboe && cboeDate) { const value = Number(cboe[1]); set('put_call_ratio', fmt(value), value, cboeDate[1],
    'https://www.cboe.com/us/options/market_statistics/daily/', value < 0.5 || value > 1 ? 'red' : value < 0.6 || value > 0.9 ? 'yellow' : 'green',
    'Cboe 每日 Equity Put/Call Ratio；與總市場口徑不同。'); }

  const cape = html[4].match(/Current Shiller PE Ratio is ([\d.]+)/);
  if (cape) { const value = Number(cape[1]); set('shiller_cape', `${fmt(value)} 倍`, value, date,
    'https://www.multpl.com/shiller-pe', value > 35 ? 'red' : value > 30 ? 'yellow' : 'green',
    'Multpl 公開 CAPE 估計；頁面未提供可解析的單獨觀測日期，以抓取日標示。'); }

  const buffett = html[5].match(/current Buffett Indicator value of (\d+(?:\.\d+)?)%/);
  if (buffett) { const value = Number(buffett[1]); set('buffett_indicator', `${fmt(value, 0)}%（公開估算）`, value, date,
    'https://currentmarketvaluation.com/models/buffett-indicator.php', value > 200 ? 'red' : value > 150 ? 'yellow' : 'green',
    'Current Market Valuation 的市場總值／GDP 估算；方法與其他供應商可能不同，日期為抓取日。'); }

  const lei = html[6].match(/Leading Economic Index&reg;[\s\S]{0,350}?in ([A-Za-z]+) (20\d{2}) at ([\d.]+) \(2016=100\)/);
  if (lei) { const value = Number(lei[3]); set('lei_index', fmt(value, 1), value, `${lei[1]} ${lei[2]}`,
    'https://www.conference-board.org/topics/us-leading-indicators/', value < 100 ? 'yellow' : 'green',
    'Conference Board 最近公布的美國 LEI；屬月度資料。'); }

  const fear = html[7].match(/Fear &#38; Greed at (\d{1,3})\/100/);
  const fearDate = html[7].match(/Data as of (\d{1,2} [A-Za-z]+ 20\d{2})/);
  if (fear) { const value = Number(fear[1]); set('fear_greed', `${value}/100（公開轉載）`, value,
    fearDate?.[1] || date, 'https://marketvaluation.eu/', value > 75 || value < 25 ? 'red' : value > 65 || value < 35 ? 'yellow' : 'green',
    '第三方網站轉載 CNN Fear & Greed 讀值；需與 CNN 原頁核對，單一讀值不足以判斷由 >75 跌破 50。'); }

  const sentiment = html[8].match(/class="stat-value[^\"]*">([+−-]?[\d.]+) pp<\/span>/);
  const sentimentDate = html[8].match(/Data through: ([A-Za-z]+ \d{1,2}, 20\d{2})/);
  if (sentiment && sentimentDate) { const value = Number(sentiment[1].replace('−', '-')); set('aaii_sentiment', `多空差 ${fmt(value, 1)} 個百分點（公開轉載）`, value,
    sentimentDate[1], 'https://usmacro.com/indicator/aaii_bull_bear_spread', value > 20 ? 'red' : value > 10 ? 'yellow' : 'green',
    'USMacro 轉載 AAII 看多減看空差；本來源沒有完整看多與看空分項。'); }

  for (const [id, entry] of Object.entries(manual)) {
    if (!indicators.some(x => x.id === id)) continue;
    set(id, entry.value, entry.numValue, entry.date, `${entry.source}（手動輸入）`, 'yellow',
      '由使用者提供的合法取得讀數；請自行核對來源及觀測日期。');
  }

  const thresholds: HardThreshold[] = initialScanReport.hardThresholds.map(item => ({ ...item, currentReading: unavailable,
    status: 'warning' as const, notes: '缺少可核實的即時資料，暫不判定。' }));
  const hard = (id: string, reading: string, status: 'no' | 'yes' | 'warning', note: string) => {
    const item = thresholds.find(x => x.id === id)!; item.currentReading = reading; item.status = status; item.notes = note;
  };
  const val = (id: string) => indicators.find(x => x.id === id)!;
  if (val('vix').numValue !== undefined) hard('vix_break', val('vix').value,
    val('vix').numValue! > 25 ? 'yes' : 'no', `FRED 觀測日 ${val('vix').date}。`);
  if (marginRows.length >= 4) hard('margin_debt_decline', marginRows.slice(0, 4).map(x => `${x.date} ${x.value}`).join(' / '),
    marginRows[0].value < marginRows[1].value && marginRows[1].value < marginRows[2].value && marginRows[2].value < marginRows[3].value ? 'yes' : 'no',
    '按 FINRA 最近四個月借方餘額判斷連續三個月月減。');
  if (val('hy_spread').numValue !== undefined) hard('hy_spread_expand', val('hy_spread').value,
    val('hy_spread').numValue! > 4.5 ? 'yes' : 'no', `FRED 觀測日 ${val('hy_spread').date}。`);
  if (val('bofa_bull_bear').numValue !== undefined) hard('bofa_bull_bear_sell', val('bofa_bull_bear').value,
    val('bofa_bull_bear').numValue! > 8 ? 'yes' : 'no', '手動提供的 BofA 原始指標；請確認為牛熊指標而非替代值。');
  if (val('insider_buy_sell').numValue !== undefined) hard('insider_buy_sell_alert', val('insider_buy_sell').value,
    val('insider_buy_sell').numValue! < 0.17 ? 'yes' : 'no', '手動提供的 GuruFocus 美國整體市場買賣比。');
  const fearManual = manual.fear_greed?.value.match(/^(\d+(?:\.\d+)?)\s*(?:->|→)\s*(\d+(?:\.\d+)?)$/);
  if (fearManual) hard('fear_greed_drop', manual.fear_greed.value,
    Number(fearManual[1]) > 75 && Number(fearManual[2]) < 50 ? 'yes' : 'no', '使用者提供的前後兩個讀值；請核對觀測日與來源。');
  if (manual.nyse_ad_line && ['是', '否'].includes(manual.nyse_ad_line.value))
    hard('ad_line_divergence', manual.nyse_ad_line.value, manual.nyse_ad_line.value === '是' ? 'yes' : 'no',
      '使用者提供的頂背離判定；請核對 S&P 與 NYSE A/D 的同期走勢。');
  notes.push('CNN 與 AAII 的部分讀值由第三方公開轉載；GuruFocus 對自動請求設限，BofA 牛熊數值未公開授權。未經核實的硬門檻維持「待確認」，不以代理指標冒充原值。');
  notes.push(`公開替代監測方案已列於儀表板：${publicIndicatorAlternatives.map(item => `${item.originalName} → ${item.alternativeName}`).join('；')}。GitHub 專案是方法參考，不是即時資料 API；替代指標不套用原始硬門檻。`);

  const hardTriggersCount = thresholds.filter(x => x.status === 'yes').length;
  const green = (category: IndicatorData['category']) => indicators.filter(x => x.category === category && x.signal === 'green').length;
  const known = indicators.filter(x => x.value !== unavailable);
  const spotlight = known.find(x => x.signal === 'red') || known[0] || indicators[0];
  const summary = (category: IndicatorData['category']) => {
    const group = indicators.filter(x => x.category === category);
    return `${group.filter(x => x.value !== unavailable).length}/${group.length} 項有可追溯讀值；${group.filter(x => x.signal === 'red').length} 項紅燈。未取得與延遲發布的資料不視為正常。`;
  };
  const extra = (id: string, formatter: (n: number) => string) => p(id) ? formatter(p(id).value) : unavailable;
  return {
    date, indicators, hardThresholds: thresholds, hardTriggersCount,
    isEscalated: hardTriggersCount >= 2, sellThresholdReached: hardTriggersCount >= 3,
    shortTermUnwarned: green('short'), shortTermTotal: 5,
    midTermUnwarned: green('mid'), midTermTotal: 7,
    longTermUnwarned: green('long'), longTermTotal: 5,
    shortTermConclusion: summary('short'), midTermConclusion: summary('mid'), longTermConclusion: summary('long'),
    spotlightSignalId: spotlight.id, spotlightTitle: `${spotlight.name}：${spotlight.value}`,
    spotlightReason: spotlight.interpretation,
    weeklyExtra: { sp500ForwardPE: unavailable, tipsRealYield10Y: extra('DFII10', n => `${fmt(n)}%`),
      dxy: p('DTWEXBGS') ? `${fmt(p('DTWEXBGS').value)}（美元廣義貿易加權指數，非 DXY）` : unavailable,
      goldSp500Ratio: unavailable, date: p('DFII10')?.date || '未確認' },
    thursdayDeepDive: { m2Growth: data.M2SL.length >= 13 ?
      `${fmt((p('M2SL').value / data.M2SL.at(-13)!.value - 1) * 100)}% 年增` : unavailable,
      sloosReport: extra('DRTSCILM', n => `${fmt(n)}% 淨緊縮（大型及中型企業 C&I 貸款）`),
      chicagoFedNfci: extra('NFCI', n => fmt(n)), date: p('DRTSCILM')?.date || '未確認' },
    dataNotes: notes,
  };
}
