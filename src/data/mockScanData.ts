import { ScanReport } from '../types';

export const initialScanReport: ScanReport = {
  date: '2026-08-07',
  isEscalated: false, // 1 / 7 triggered (BofA Bull & Bear = 9.6)
  
  indicators: [
    // 🟢 短期指標 (1-5)
    {
      id: 'vix',
      name: 'VIX（CBOE Volatility Index）',
      category: 'short',
      value: '15.15',
      numValue: 15.15,
      unit: '',
      date: '2026-08-06',
      source: 'cboe.com / FRED',
      threshold: '> 20 警惕 / > 25 恐慌',
      signal: 'green',
      trend: 'down',
      interpretation: 'VIX 目前處於 15.15 低位區間，顯示短期期權市場隱含波動率低迷，市場情緒持續偏向溫和自滿。與上次掃描相比波動小幅回落，對投資決策而言意味著美股短期極度平穩，但避險成本（Put Options）價格相對便宜，適合低成本構建下行保護。'
    },
    {
      id: 'fear_greed',
      name: 'CNN Fear & Greed Index',
      category: 'short',
      value: '60.71（貪婪）',
      numValue: 60.71,
      unit: '分',
      date: '2026-08-05',
      source: 'cnn.com/markets/fear-and-greed',
      threshold: '> 75 極度貪婪 / < 25 極度恐懼',
      signal: 'green',
      trend: 'up',
      interpretation: '恐懼與貪婪指數讀數為 60.71，從 7 月下旬的 42.46 中性偏低區間快速反彈至「貪婪」範疇。市場買氣回升但未達 >75 的極度狂熱閾值。對決策的含義是短期追高風險上升，但不至於立即誘發回調，建議保持原有倉位而不加槓桿。'
    },
    {
      id: 'aaii_sentiment',
      name: 'AAII Investor Sentiment Survey',
      category: 'short',
      value: '看多 37.0% / 看空 38.0%（多空差 -1.0%）',
      numValue: -1.0,
      unit: '%',
      date: '2026-08-05',
      source: 'aaii.com/sentimentsurvey',
      threshold: '多空差 > +20% 狂熱警戒',
      signal: 'green',
      trend: 'up',
      interpretation: '散戶看多比率由上週 31.0% 大幅回升至 37.0%，多空差由 -11.1% 縮窄至 -1.0%，接近歷史均值。雖然看空比率（38.0%）仍高於歷史均值，但情緒正加速改善。此指標未呈現單邊散戶極度看多狂熱，表明籌碼結構尚未失控。'
    },
    {
      id: 'put_call_ratio',
      name: 'CBOE Equity Put/Call Ratio',
      category: 'short',
      value: '0.57',
      numValue: 0.57,
      unit: '',
      date: '2026-08-06',
      source: 'cboe.com',
      threshold: '< 0.50 自滿 / > 1.00 恐慌',
      signal: 'yellow',
      trend: 'same',
      interpretation: '權益賣買權比率降至 0.57，接近 0.50 的過熱自滿警戒區，顯示市場參與者對 Call 期權的偏好顯著高於 Put 期權。這意味著市場短線對下跌防範意識薄弱，一旦出現外部利空容易引發短線快速清算，建議暫緩追高個股期權。'
    },
    {
      id: 'naaim_exposure',
      name: 'NAAIM Exposure Index',
      category: 'short',
      value: '79.70%',
      numValue: 79.70,
      unit: '%',
      date: '2026-07-29',
      source: 'naaim.org',
      threshold: '> 90% 極端過熱 / < 30% 極端悲觀',
      signal: 'green',
      trend: 'down',
      interpretation: '主動型基金經理股票曝險比率由前一週的 84.02% 小幅降至 79.70%，健康回落至 80% 以下的中性高位。專業機構維持高倉位但並未達到 90%+ 的槓桿極限，提供了一定的緩衝空間，符合逢調整加倉非狂熱頂部的特徵。'
    },

    // 🟡 中期指標 (6-12)
    {
      id: 'margin_debt',
      name: 'FINRA Margin Debt（保證金負債）',
      category: 'mid',
      value: '$1.50 Trillion（月擴張，YoY +50.1%）',
      numValue: 1.5,
      unit: '萬億美元',
      date: '2026-06-30',
      source: 'finra.org',
      threshold: '年增率 > 30% / 連續 3 個月月減',
      signal: 'yellow',
      trend: 'up',
      interpretation: '美股保證金負債刷新歷史新高至 1.50 兆美元，年增率衝破 50% 大關，反映市場去槓桿動力不足，散戶與機構均大量借貸入市。雖然尚未出現「連續 3 個月下降」的賣出訊號，但高槓桿環境大幅增加了中期波動敏銳度，一旦股市下行易觸發強制平倉。'
    },
    {
      id: 'margin_debt_gdp',
      name: 'Margin Debt / GDP 比率',
      category: 'mid',
      value: '5.30%',
      numValue: 5.30,
      unit: '%',
      date: '2026-Q2',
      source: 'gurufocus.com',
      threshold: '> 3.0% 警戒區（歷史高位峰值）',
      signal: 'red',
      trend: 'up',
      interpretation: ' Margin Debt 佔美 GDP 比率達 5.30%，處於歷史最高分位數區間，遠超 2000 年與 2007 年泡沬前夕。此讀數說明股市融資槓桿相對於實體經濟體量極度膨脹，中期內市場承受流動性緊縮的能力極低，是顯著的中期結構性風險點。'
    },
    {
      id: 'renaissance_ipo',
      name: 'Renaissance IPO 發行量',
      category: 'mid',
      value: 'Q2 38 家 / 募資 $12.4 Billion',
      numValue: 38,
      unit: '家',
      date: '2026-Q2',
      source: 'renaissancecapital.com',
      threshold: '單季 > 60 家狂熱 / 募資 > $30B',
      signal: 'green',
      trend: 'same',
      interpretation: '第二季 IPO 數量 38 家，募資 124 億美元，活動較 2025 年溫和復甦，但距離 2021 年單季 100+ 家的極端狂熱仍有很大距離。新股市場尚未出現垃圾股暴漲與瘋狂套現潮，意味著一級市場到二級市場的泡沫傳導仍受控。'
    },
    {
      id: 'insider_buy_sell',
      name: 'Insider Buy/Sell Ratio（內部人買賣比）',
      category: 'mid',
      value: '0.26',
      numValue: 0.26,
      unit: '',
      date: '2026-08-01',
      source: 'gurufocus.com',
      threshold: '< 0.17 拋售警報（歷史均值 0.39）',
      signal: 'yellow',
      trend: 'down',
      interpretation: 'GuruFocus 美股整體內部人買賣比率為 0.26，低於歷史平均值 0.39 約 33.3%，且 CFO 層級買賣比更降至 0.09 低位。高管與內部人士在目前高估值下傾向於淨賣出套現，讀數正逼近 0.17 的硬閾值警報，值得密切提防。'
    },

    {
      id: 'bofa_bull_bear',
      name: 'BofA Bull & Bear Indicator（美銀牛熊指標）',
      category: 'mid',
      value: '9.6（極度牛市反向賣出信號）',
      numValue: 9.6,
      unit: '分',
      date: '2026-07-31',
      source: 'Bank of America Global Research',
      threshold: '> 8.0 發布賣出信號',
      signal: 'red',
      trend: 'up',
      interpretation: '美銀牛熊指標攀升至 9.6 的歷史罕見高位（>8.0 即觸發賣出信號），主要由極端的股票基金資金流入、高收益債極窄利差及新興市場買氣推升。作為高度可靠的反向指標，9.6 警告市場籌碼已極度擁擠，未來 1-3 個月修正風險極高！'
    },
    {
      id: 'hy_spread',
      name: 'ICE BofA US High Yield OAS Spread（高收益債利差）',
      category: 'mid',
      value: '2.85%（285 bps）',
      numValue: 2.85,
      unit: '%',
      date: '2026-07-31',
      source: 'FRED（BAMLH0A0HYM2）',
      threshold: '> 4.5% 信用緊縮擴張警報',
      signal: 'green',
      trend: 'down',
      interpretation: '美高收益債利差僅 2.85%，處於歷史極低分位，顯示信用市場完全沒有計入違約風險，市場流動性極度充裕。雖然信用市場尚無違約危機，但利差過窄意味著風險補償不足，一旦宏觀經濟意外降溫容易引發債股市同步重估。'
    },
    {
      id: 'nyse_ad_line',
      name: 'NYSE Advance/Decline Line（騰落線）',
      category: 'mid',
      value: '廣度溫和分化（標普創高，騰落線高位平盤）',
      date: '2026-08-06',
      source: 'NYSE Market Data',
      threshold: '與 S&P 500 頂背離',
      signal: 'yellow',
      trend: 'same',
      interpretation: '近期標普 500 在科技巨頭拉升下刷新高點，但 NYSE 騰落線並未同步創出新高，顯示市場上漲廣度有所集中於少數權重股。雖然尚未出現嚴重的全面背離，但寬基參與度下降意味著大盤抗震能力減弱。'
    },

    // 🔴 長期指標 (13-17)
    {
      id: 'buffett_indicator',
      name: 'Buffett Indicator（巴菲特指標，總市值 / GDP）',
      category: 'long',
      value: '229.9%',
      numValue: 229.9,
      unit: '%',
      date: '2026-08-06',
      source: 'currentmarketvaluation.com',
      threshold: '> 150% 嚴重高估 / > 200% 極端高估',
      signal: 'red',
      trend: 'up',
      interpretation: '美股市值相對於 GDP 比率高達 229.9%，位於歷史極端高估區間（顯著高於歷史趨勢線 +2.5 標準差）。這意味著美股長期預期回報率已被嚴重擠壓，未來 3-5 年美股指數級的年化報酬率恐顯著低於歷史平均。'
    },
    {
      id: 'shiller_cape',
      name: 'Shiller CAPE / PE10（席勒本益比）',
      category: 'long',
      value: '41.85',
      numValue: 41.85,
      unit: '倍',
      date: '2026-08-01',
      source: 'multpl.com',
      threshold: '> 30 嚴重高估 / > 40 歷史頂點（均值 17.1）',
      signal: 'red',
      trend: 'up',
      interpretation: '席勒 CAPE 讀數突破 41.85，在美股 150 年歷史中僅次於 1999 年科技泡沫頂峰的 44.2。歷史數據表明，當 CAPE > 40 時，未來 10 年美股實質回報率接近零甚至負值。投資人長期資產配置必須大幅降低對美股公募指數的報酬預期。'
    },
    {
      id: 'yield_curve',
      name: '10Y-2Y Treasury Yield Curve（殖利率曲線）',
      category: 'long',
      value: '+0.44%（+44 bps，結束倒掛陡化中）',
      numValue: 0.44,
      unit: '%',
      date: '2026-08-06',
      source: 'FRED（T10Y2Y）',
      threshold: '長達數月倒掛後快速轉正急陡化',
      signal: 'yellow',
      trend: 'up',
      interpretation: '10 年期與 2 年期美債殖利差為 +0.44%，已徹底結束先前的長期倒掛並持續急陡化。歷史規律表明，真正衰退與股市大幅調整往往不是發生在倒掛期間，而是發生在倒掛結束轉正後的 6-18 個月內，需時刻保持警惕。'
    },
    {
      id: 'lei_index',
      name: 'Conference Board US LEI（領先經濟指數）',
      category: 'long',
      value: '99.1（月減 0.2%，6 個月年化 -0.3%）',
      numValue: 99.1,
      unit: '',
      date: '2026-06-30',
      source: 'conference-board.org',
      threshold: '6 個月變化率 < -3.0%',
      signal: 'yellow',
      trend: 'down',
      interpretation: '美國 LEI 讀數降至 99.1，半年變化率為 -0.3%，衰退降幅有所放緩但仍處於負值收縮狀態，顯示美國宏觀經濟增長動能依然脆弱，高度依賴 AI 相關資本支出與服務業支撐，實體經濟缺乏強勁擴張引擎。'
    },
    {
      id: 'aaii_stock_allocation',
      name: 'AAII 家庭股票配置比（% Asset Allocation）',
      category: 'long',
      value: '68.5%',
      numValue: 68.5,
      unit: '%',
      date: '2026-07-31',
      source: 'aaii.com/assetallocationsurvey',
      threshold: '> 65% 擁擠高位（歷史均值 ~61%）',
      signal: 'red',
      trend: 'up',
      interpretation: '個人投資者資產配置中股票佔比高達 68.5%，現金持倉降至低點。散戶將近七成資產壓在股市，說明市場潛在購買力（乾柴）已相當消耗，一旦發生資產再平衡清算，缺乏充足的場外資金進行下檔承接。'
    }
  ],

  shortTermUnwarned: 4,
  shortTermTotal: 5,
  midTermUnwarned: 4,
  midTermTotal: 7,
  longTermUnwarned: 2,
  longTermTotal: 5,

  shortTermConclusion: '短期（1-3 個月）：目前 5 項短期指標中僅有 CBOE Equity Put/Call Ratio 出現偏向自滿的黃燈，VIX 與 NAAIM 仍處於相對理性區間，短期無全面崩盤風險。然而由於美銀牛熊指標已高達 9.6，市場極度擁擠，強烈建議不要在當前點位加槓桿追高，可利用目前 VIX（15.15）極低之際，以極低成本購買 3 個月期 S&P 500 虛值 Put 選擇權（看跌期權）做為低成本組合保險，暫不需大規模砍倉。',

  midTermConclusion: '中期（3-12 個月）：中期趨勢面臨顯著壓力。保證金負債衝破 1.5 兆美元（Margin Debt/GDP 達 5.3%），且美銀牛熊指標高達 9.6，觸發硬性反向賣出訊號。儘管高收益債利差（2.85%）尚未擴張，但內部人買賣比（0.26）持續下滑。建議在未來 1-3 個月內的任何高位反彈中，逐步調整持倉結構：適度減持高 Beta 科技暴漲股與高槓桿成長股，將 15%-20% 資金轉向防禦性高股息、優質短債或現金儲備。',

  longTermConclusion: '長期（1-3 年+）：長期結構性風險顯著高企。巴菲特指標（229.9%）與席勒 CAPE（41.85，歷史第二高位）雙雙處於極端高估區間，且 AAII 股票配置比達 68.5% 的擁擠狀態，10Y-2Y 殖利率曲線也已完成倒掛修復急陡化。這意味著未來 3-5 年美股指數化投資（如 S&P 500 / QQQ 盲目定投）的預期年化年化報酬率將被大幅壓低。長期組合必須執行結構性再平衡：提高全球非美資產（如日本、新興市場優質標的）、實物黃金及短天期國債配置比重。',

  hardThresholds: [
    {
      id: 'vix_break',
      condition: 'VIX 突破並站穩',
      threshold: '> 25',
      currentReading: '15.15',
      status: 'no',
      notes: '當前 VIX 僅 15.15，波動率低迷，未觸發警戒。'
    },
    {
      id: 'margin_debt_decline',
      condition: 'Margin Debt 月減',
      threshold: '連續 3 個月',
      currentReading: '連月持續擴張，創 $1.50T 歷史新高',
      status: 'no',
      notes: '槓桿持續積累未去化，無月減趨勢。'
    },
    {
      id: 'hy_spread_expand',
      condition: 'HY Spread 擴張',
      threshold: '> 4.5%',
      currentReading: '2.85%（285 bps）',
      status: 'no',
      notes: '信用市場流動性充沛，無信貸緊縮。'
    },
    {
      id: 'fear_greed_drop',
      condition: 'Fear & Greed 從高位回落',
      threshold: '>75 跌回 <50',
      currentReading: '目前 60.71（自 78 高位震盪回落）',
      status: 'warning',
      notes: '由極狂熱區域回落，但目前讀數 60.71 仍處於 >50 貪婪區，未跌破 50。'
    },
    {
      id: 'ad_line_divergence',
      condition: 'A/D Line 頂背離',
      threshold: 'S&P 新高但 A/D 不創新高',
      currentReading: '標普強勁，NYSE 騰落線高位橫盤分化',
      status: 'warning',
      notes: '廣度出現局部集中化，但尚未形成嚴重全面背離。'
    },
    {
      id: 'bofa_bull_bear_sell',
      condition: 'BofA Bull & Bear',
      threshold: '> 8.0',
      currentReading: '9.6（極度牛市極端區）',
      status: 'yes',
      notes: '⚠️ 已達成！高於 8.0 觸發硬性反向賣出警報！'
    },
    {
      id: 'insider_buy_sell_alert',
      condition: 'Insider Buy/Sell',
      threshold: '< 0.17',
      currentReading: '0.26',
      status: 'no',
      notes: '目前 0.26 高於 0.17，但相較歷史均值 0.39 已大幅下滑，逼近警戒線。'
    }
  ],

  hardTriggersCount: 1,
  sellThresholdReached: false, // Need 3+ triggers, currently 1 triggered + 2 warnings

  spotlightSignalId: 'bofa_bull_bear',
  spotlightTitle: 'BofA Bull & Bear Indicator 攀升至 9.6（觸發硬性反向賣出信號）',
  spotlightReason: '今天最需要特別關注的指標是美銀牛熊指標（BofA Bull & Bear Indicator）已暴增至 9.6 的極端高位！這是 7 個硬閾值中今日唯一正式達成觸發（> 8.0）的指標。歷史經驗顯示，當該指標衝破 8.0 極端狂熱門檻時，代表全球基金經理人的股票持倉、衍生品多頭與現金水平已到達物理極限，歷史上每次出現此信號後 1-3 個月內，大盤均面臨高機率的顯著修正。雖然目前總觸發數（1/7）尚未達到 3+ 的全面分批賣出門檻，但 9.6 的極端讀數發出了最強烈的「禁止追高、增買避險」警訊！',

  weeklyExtra: {
    sp500ForwardPE: '22.4 倍（遠高於 5 年均值 19.2 倍）',
    tipsRealYield10Y: '2.12%（保持實質高利率壓制）',
    dxy: '102.85（美元指數高位震盪）',
    goldSp500Ratio: '0.43（金價與標普同步走強）',
    date: '2026-08-03'
  },

  thursdayDeepDive: {
    m2Growth: 'YoY +2.8%（貨幣供應溫和復甦）',
    sloosReport: '信貸標準持續緊縮，企業貸款需求放緩',
    chicagoFedNfci: '-0.52（金融條件依然寬鬆）',
    date: '2026-08-06'
  },

  dataNotes: [
    'FINRA Margin Debt 資料滯後至 2026 年 6 月底（7 月數據預計 8 月下旬由 FINRA 發布）。',
    'NAAIM Exposure Index 資料日期為 2026 年 7 月 29 日（NAAIM 自 8 月起對大眾延遲 3 個月發布，本報告採用最新機構轉載數據）。',
    'Conference Board LEI 資料滯後至 2026 年 6 月底（7 月數據預計 8 月 20 日發布）。'
  ]
};
