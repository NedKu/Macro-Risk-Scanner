export interface PublicIndicatorAlternative {
  id: string;
  originalName: string;
  alternativeName: string;
  method: string;
  githubUrl: string;
  dataUrl: string;
  limitation: string;
}

export const publicIndicatorAlternatives: PublicIndicatorAlternative[] = [
  {
    id: 'insider_buy_sell',
    originalName: 'Insider Buy/Sell Ratio（內部人買賣比）',
    alternativeName: 'SEC Form 4 公開市場買入／賣出比',
    method: '彙總近 30／90 日 Form 4 中 P（公開市場買入）與 S（公開市場賣出）交易的金額或筆數，再計算比率。',
    githubUrl: 'https://github.com/bagoldbe/form4lab',
    dataUrl: 'https://www.sec.gov/edgar/search/',
    limitation: 'Form4Lab 是需自行部署的 SEC EDGAR 擷取工具，須設定 SEC 聯絡身分；計算口徑不等同 GuruFocus 全市場比率。',
  },
  {
    id: 'bofa_bull_bear',
    originalName: 'BofA Bull & Bear Indicator（美銀牛熊指標）',
    alternativeName: 'AAII 投資人看多－看空差',
    method: '以 AAII 每週看多百分比減看空百分比，作為散戶情緒的公開替代觀察。',
    githubUrl: 'https://github.com/SimFre/AAIISentiment',
    dataUrl: 'https://usmacro.com/indicator/aaii_bull_bear_spread',
    limitation: 'AAII 是散戶調查，與 BofA 的全球資金流、倉位及債市組成不同；不可套用 BofA >8 門檻。',
  },
  {
    id: 'nyse_ad_line',
    originalName: 'NYSE Advance/Decline Line（騰落線）',
    alternativeName: '美股市場廣度監測',
    method: '追蹤 4% 突破／跌破家數、5／10 日廣度比及高於均線的股票比例，觀察廣度是否確認大盤走勢。',
    githubUrl: 'https://github.com/dcimring/stockbee-dashboard',
    dataUrl: 'https://massive.com/',
    limitation: '此方法不是 NYSE 累積 A/D 線；GitHub 專案需行情資料服務，歷史回補可能需付費方案。',
  },
];
