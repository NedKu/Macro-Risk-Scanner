# 宏觀風險掃描儀

本機網頁提供 17 項指標、7 個風險門檻、短中長期結論、週一與週四補充資料，以及報告複製和 Markdown 匯出。

## 無需 AI 的公開資料掃描

安裝依賴並啟動：

```powershell
npm install
npm run build
$env:PORT = '3001'
npm start
```

開啟 <http://localhost:3001>，按「更新公開資料」。程式直接讀取 FRED、FINRA、Cboe、NAAIM 延遲資料、Renaissance IPO 統計、Conference Board 等公開來源，計算可核實的讀值與風險門檻。來源拒絕自動讀取或數值未公開時，欄位會顯示「資料未取得」或「待確認」；不會以別的指標冒充原始門檻。

按「補充來源數值」可輸入你合法取得的付費報告讀值、日期與來源，並重新計算。手動數值只存在這台電腦的 `.local/manual-values.json`。BofA 牛熊及 GuruFocus 內部人買賣比要輸入純數字；Fear & Greed 的前後值可填 `80→40`，A/D 頂背離可填 `是` 或 `否`，供七項門檻判定。

## 可選的 AI 進階掃描

1. 安裝並開啟 Codex CLI，執行 `codex login`，使用你的 ChatGPT 帳號登入。可用 `codex login status` 確認狀態。
2. 在網頁按「AI 進階掃描」。

沒有設定 `GEMINI_API_KEY` 時，進階掃描會使用已登入的 Codex CLI 及網路搜尋。掃描可能需要數分鐘，會計入 ChatGPT／Codex 方案的使用額度。Codex 掃描僅接受本機請求，不提供遠端網站共用 ChatGPT 登入的能力。公開資料掃描不需登入 Codex。

若已有 `GEMINI_API_KEY`，原本的 Gemini 搜尋掃描仍可使用。掃描失敗時會顯示錯誤，保留上一份報告，不會把舊讀數標成今天的資料。

掃描記錄儲存在本機 `.local/scan-history.json`，重啟後仍會載入。部分付費或無法核實的資料會標示「資料未取得」，請查看每項指標的日期、來源與資料說明。
