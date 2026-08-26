import React, { useState, useEffect } from 'react';
import { initialScanReport } from './data/mockScanData';
import { ScanReport } from './types';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { SpotlightSignal } from './components/SpotlightSignal';
import { DashboardTable } from './components/DashboardTable';
import { DetailedInterpretations } from './components/DetailedInterpretations';
import { ComprehensiveConclusions } from './components/ComprehensiveConclusions';
import { ThresholdTracker } from './components/ThresholdTracker';
import { WeeklyModals } from './components/WeeklyModals';
import { DataNotesFooter } from './components/DataNotesFooter';
import { generateReportMarkdown } from './utils/markdownGenerator';

export default function App() {
  const [report, setReport] = useState<ScanReport>(initialScanReport);
  const [isScanning, setIsScanning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showThursdayModal, setShowThursdayModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latest scan on initial load if available from server
    fetch('/api/scan/latest')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.scan) {
          setReport(data.scan);
        }
      })
      .catch(err => {
        console.log('Using default client report:', err);
      });
  }, []);

  const handleRunScan = async () => {
    setIsScanning(true);
    setNotification('正在通過 Gemini AI 與網絡接地檢索 17 項最新指標數據...');

    try {
      const res = await fetch('/api/scan/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success && data.scan) {
        setReport(data.scan);
        setNotification(data.message || '✅ 實時風險掃描成功完成！數據已更新。');
      } else {
        setNotification('⚠️ AI 掃描未返回全新數據，已加載當前最新數據基準。');
      }
    } catch (err) {
      console.error(err);
      setNotification('❌ 網絡連線異常，已加載最近一次本地掃描報告。');
    } finally {
      setIsScanning(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleCopyReport = () => {
    try {
      const markdown = generateReportMarkdown(report);
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(markdown)
          .then(() => {
            setIsCopied(true);
            setNotification('📋 完整風險掃描報告已複製至剪貼簿！');
            setTimeout(() => setIsCopied(false), 3000);
            setTimeout(() => setNotification(null), 3000);
          })
          .catch(() => {
            fallbackCopy(markdown);
          });
      } else {
        fallbackCopy(markdown);
      }
    } catch (err) {
      console.error('Copy error:', err);
      setNotification('⚠️ 複製失敗，請點選「導出 MD」下載報告檔案。');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setIsCopied(true);
        setNotification('📋 完整風險掃描報告已複製至剪貼簿！');
        setTimeout(() => setIsCopied(false), 3000);
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification('⚠️ 剪貼簿存取受限，請點選「導出 MD」下載報告檔案。');
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      setNotification('⚠️ 剪貼簿存取受限，請點選「導出 MD」下載報告檔案。');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExportMarkdown = () => {
    try {
      const markdown = generateReportMarkdown(report);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Macro_Risk_Scan_${report?.date || 'today'}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setNotification('📥 已導出 Markdown 檔案！');
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setNotification('⚠️ 導出失敗，請稍後再試。');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F0F10] border border-[#222222] text-[#E0E0E0] px-4 py-3 rounded-lg shadow-2xl text-xs font-mono font-medium flex items-center gap-2 max-w-md">
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        report={report}
        onRunScan={handleRunScan}
        isScanning={isScanning}
        onExportMarkdown={handleExportMarkdown}
        onCopyReport={handleCopyReport}
        isCopied={isCopied}
        onToggleWeeklyModal={() => setShowWeeklyModal(true)}
        onToggleThursdayModal={() => setShowThursdayModal(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* Section 2: Alert Stats */}
        <StatsCards report={report} />

        {/* Section 6: Spotlight Signal (High Priority Alert) */}
        <SpotlightSignal report={report} />

        {/* Section 1: Dashboard Table (All 17 Metrics) */}
        <DashboardTable indicators={report.indicators} />

        {/* Section 3: Detailed 2-3 Sentences Interpretations */}
        <DetailedInterpretations indicators={report.indicators} />

        {/* Section 4: Short, Mid, Long Term Action Conclusions */}
        <ComprehensiveConclusions report={report} />

        {/* Section 5: 7 Hard Threshold Status Tracker */}
        <ThresholdTracker report={report} />

        {/* Section 8: Data Sources & Lag Notes */}
        <DataNotesFooter report={report} />
      </main>

      {/* Modals for Monday Extras & Thursday Deep Dive */}
      <WeeklyModals
        report={report}
        showWeekly={showWeeklyModal}
        showThursday={showThursdayModal}
        onCloseWeekly={() => setShowWeeklyModal(false)}
        onCloseThursday={() => setShowThursdayModal(false)}
      />
    </div>
  );
}
