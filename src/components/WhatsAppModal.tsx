import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  Building, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WhatsAppService } from '../services/whatsapp';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  const {
    t,
    whatsAppConfig,
    updateWhatsAppConfig,
    records,
    vehicles,
  } = useApp();

  const [companyName, setCompanyName] = useState(whatsAppConfig.companyName);
  const [autoAlertOnEntry, setAutoAlertOnEntry] = useState(whatsAppConfig.autoAlertOnEntry);
  const [autoAlertOnExit, setAutoAlertOnExit] = useState(whatsAppConfig.autoAlertOnExit);
  const [testPhone, setTestPhone] = useState('+923001234567');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsAppConfig({
      companyName: companyName.trim(),
      autoAlertOnEntry,
      autoAlertOnExit,
      enabled: true,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const sampleRecord = records[0];
  const sampleVehicle = vehicles[0];

  const sampleEntryText = WhatsAppService.generateEntryMessage(sampleRecord, sampleVehicle, companyName);
  const sampleExitText = WhatsAppService.generateExitMessage(sampleRecord, sampleVehicle, companyName);

  const handleSendTest = () => {
    const link = WhatsAppService.createWhatsAppLink(testPhone, sampleEntryText);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('whatsappTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('whatsappDesc')}
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

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Company / Facility Brand Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. SecurGate Enterprise Facility"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('whatsappAutoEntry')}
                </span>
                <p className="text-[11px] text-slate-400">
                  Notifies owner immediately with vehicle plate, driver name, and gate checkpoint.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAlertOnEntry}
                  onChange={(e) => setAutoAlertOnEntry(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('whatsappAutoExit')}
                </span>
                <p className="text-[11px] text-slate-400">
                  Notifies owner upon departure with stay duration and trip sequence.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAlertOnExit}
                  onChange={(e) => setAutoAlertOnExit(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp alert preferences successfully saved.</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all shadow-md shadow-green-600/20"
            >
              Save Alert Preferences
            </button>
          </div>
        </form>

        {/* Live Message Preview */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            WhatsApp Alert Message Preview
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Entry Message Preview */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono whitespace-pre-line border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                ENTRY NOTIFICATION
              </span>
              {sampleEntryText}
            </div>

            {/* Exit Message Preview */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono whitespace-pre-line border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block mb-1">
                EXIT NOTIFICATION
              </span>
              {sampleExitText}
            </div>
          </div>

          {/* Test Dispatcher */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Phone className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+923001234567"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white"
              />
            </div>
            <button
              onClick={handleSendTest}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all shadow-md shadow-green-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('testWhatsApp')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
