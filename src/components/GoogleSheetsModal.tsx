import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  ExternalLink,
  WifiOff,
  Sparkles,
  Link2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleSheetsService } from '../services/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose }) => {
  const {
    t,
    sheetsConfig,
    updateSheetsConfig,
    offlineQueue,
    syncOfflineQueueNow,
    records,
    isOnline,
  } = useApp();

  const [webhookUrl, setWebhookUrl] = useState(sheetsConfig.webhookUrl);
  const [sheetName, setSheetName] = useState(sheetsConfig.sheetName);
  const [autoSync, setAutoSync] = useState(sheetsConfig.autoSync);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);
  const [syncQueueMessage, setSyncQueueMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSheetsConfig({
      webhookUrl: webhookUrl.trim(),
      sheetName: sheetName.trim(),
      autoSync,
      enabled: Boolean(webhookUrl.trim()),
    });
    setTestResult({ success: true, message: 'Google Sheets configuration saved.' });
  };

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid Google Apps Script Webhook URL.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Create a ping dummy record
    const dummyRecord = records[0] || {
      id: `ping-${Date.now()}`,
      vehicleId: 'test',
      plateNumber: 'TEST-SHEET-01',
      vehicleType: 'car' as const,
      driverName: 'Security System Test',
      ownerName: 'Test Owner',
      ownerPhone: '+923000000000',
      department: 'Security Test',
      category: 'employee' as const,
      entryTime: new Date().toISOString(),
      gate: 'Gate 1',
      method: 'qr' as const,
      faceVerified: true,
      dailyEntrySequence: 1,
      whatsappSentEntry: true,
      whatsappSentExit: false,
      syncedToGoogleSheet: false,
      status: 'active_inside' as const,
    };

    const res = await GoogleSheetsService.syncRecord(dummyRecord, {
      ...sheetsConfig,
      webhookUrl: webhookUrl.trim(),
      enabled: true,
    });

    setIsTesting(false);
    setTestResult(res);
  };

  const handleCopyScript = () => {
    const code = GoogleSheetsService.getAppsScriptTemplate();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 3000);
    });
  };

  const handleSyncPendingNow = async () => {
    setIsSyncingQueue(true);
    setSyncQueueMessage(null);
    const res = await syncOfflineQueueNow();
    setIsSyncingQueue(false);
    setSyncQueueMessage(`Synced ${res.synced} records. ${res.failed > 0 ? `${res.failed} failed.` : 'Queue cleared!'}`);
    setTimeout(() => setSyncQueueMessage(null), 5000);
  };

  const handleDownloadCsv = () => {
    GoogleSheetsService.downloadCsv(records, `SecurGate_Vehicle_Logs_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('sheetsTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('sheetsDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Offline Queue Notice */}
        {offlineQueue.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>{offlineQueue.length} records in Offline Queue</strong> waiting to be synced to Google Sheets.
              </span>
            </div>
            <button
              onClick={handleSyncPendingNow}
              disabled={isSyncingQueue || !isOnline}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold transition-all shadow-sm"
            >
              {isSyncingQueue ? 'Syncing...' : 'Sync Queue Now'}
            </button>
          </div>
        )}

        {syncQueueMessage && (
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {syncQueueMessage}
          </div>
        )}

        {/* Webhook Configuration Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {t('sheetsWebhookUrl')}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{t('sheetsTestConnection')}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Every vehicle entry and exit is automatically dispatched in real-time to this Google Sheet endpoint.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Automatic Background Sync
              </span>
              <p className="text-[11px] text-slate-400">
                Sync immediately upon gate scan when internet is available.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              Save Google Sheet Settings
            </button>
          </div>
        </form>

        {/* Step-by-Step Setup Guide */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('sheetsSetupInstructions')}
            </span>
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-colors"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Script Copied!' : 'Copy Apps Script Code'}</span>
            </button>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>Create or open a blank Google Sheet in your Google Drive.</li>
            <li>In Google Sheets menu, click <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>Click &quot;Copy Apps Script Code&quot; button above and paste into the editor.</li>
            <li>Click <strong>Deploy &gt; New Deployment</strong>, choose <strong>Web App</strong>.</li>
            <li>Set <em>Execute as: &quot;Me&quot;</em> and <em>Who has access: &quot;Anyone&quot;</em>, then Deploy.</li>
            <li>Paste your Web App URL into the field above!</li>
          </ol>

          {/* Fallback Direct CSV Export */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Prefer manual CSV import?
            </span>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV for Google Sheets</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
