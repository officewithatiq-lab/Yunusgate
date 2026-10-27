import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Sun, 
  Moon, 
  Languages, 
  Bell, 
  Lock, 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  MessageSquare,
  Maximize2,
  Minimize2,
  LayoutDashboard,
  Scan,
  Layers,
  Clock,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBiometricModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenParkingAreasModal?: () => void;
  isWideView?: boolean;
  onToggleWideView?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBiometricModal,
  onOpenSheetsModal,
  onOpenWhatsAppModal,
  onOpenParkingAreasModal,
  isWideView,
  onToggleWideView,
}) => {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    t,
    isOnline,
    offlineQueue,
    currentUser,
    alerts,
    markAlertAsRead,
    clearAlerts,
    sheetsConfig,
    whatsAppConfig,
    logout,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.read);

  const navTabs = [
    { id: 'dashboard', label: t('tabDashboard'), icon: LayoutDashboard },
    { id: 'scanner', label: t('tabScanner'), icon: Scan },
    { id: 'directory', label: t('tabDirectory'), icon: Layers },
    { id: 'logs', label: t('tabLogs'), icon: Clock },
    { id: 'reports', label: t('tabReports'), icon: FileText },
  ];

  const languagesList: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ur', label: 'اردو (Urdu)', flag: '🇵🇰' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b transition-colors bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm">
      <div className={isWideView ? "max-w-[98%] mx-auto px-3 sm:px-6 transition-all duration-300" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300"}>
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Brand & Gate status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  {t('appTitle')}
                </h1>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block mt-1 leading-none">
                {t('liveGate')} • {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Right: Status Indicators & Quick Actions */}
          <div className="flex items-center gap-2">
            
            {/* Live Clock */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {currentTime}
            </div>

            {/* Offline / Online Badge */}
            <div
              title={isOnline ? t('online') : t('offlineNotice')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('online')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>{t('offline')}</span>
                  {offlineQueue.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px]">
                      {offlineQueue.length}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Parking Areas & Capacity shortcut button */}
            {onOpenParkingAreasModal && (
              <button
                onClick={onOpenParkingAreasModal}
                title={t('manageAreas')}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/30 transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold hidden lg:inline">{t('tabParkingAreas')}</span>
              </button>
            )}

            {/* Google Sheets Sync shortcut button */}
            <button
              onClick={onOpenSheetsModal}
              title={sheetsConfig.enabled ? 'Google Sheets Sync Active' : 'Configure Google Sheets'}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/30 transition-all relative"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {sheetsConfig.enabled && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* WhatsApp alerts shortcut button */}
            <button
              onClick={onOpenWhatsAppModal}
              title="Configure WhatsApp Automated Alerts"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 border border-slate-200 dark:border-slate-700 hover:border-green-500/30 transition-all relative"
            >
              <MessageSquare className="w-4 h-4" />
              {whatsAppConfig.enabled && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all relative"
                aria-label="Security Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Security Alerts ({alerts.length})
                    </span>
                    {alerts.length > 0 && (
                      <button
                        onClick={clearAlerts}
                        className="text-[11px] text-slate-400 hover:text-rose-500 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No new alerts</p>
                    ) : (
                      alerts.map((alt) => (
                        <div
                          key={alt.id}
                          onClick={() => markAlertAsRead(alt.id)}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer border transition-colors ${
                            alt.read
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-70'
                              : 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {alt.type === 'danger' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                              {alt.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            {alt.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all"
                title={t('language')}
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="font-semibold text-[11px]">{language === 'ur' ? 'اردو' : 'EN'}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                        language === lang.code
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {language === lang.code && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Extend View / Full Width Toggle */}
            {onToggleWideView && (
              <button
                onClick={onToggleWideView}
                className={`p-2 rounded-lg border transition-all ${
                  isWideView
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700'
                }`}
                title={isWideView ? 'Exit Extended Width' : 'Extend View (Full Width)'}
                aria-label="Toggle Extend View"
              >
                {isWideView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all"
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile & Biometric Badge */}
            <button
              onClick={onOpenBiometricModal}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all text-xs"
              title="Guard Biometric Profile & Session"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
                />
                <Fingerprint className="w-3 h-3 text-emerald-500 absolute -bottom-1 -right-1 bg-slate-900 rounded-full" />
              </div>
              <div className="hidden lg:block text-left">
                <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {currentUser.badgeNumber}
                </div>
              </div>
            </button>

            {/* Lock Session Button */}
            <button
              onClick={logout}
              title={t('btnLogout')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700 hover:border-rose-500/30 transition-all flex items-center justify-center"
              aria-label="Lock Session"
            >
              <Lock className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>

      {/* Navigation Menu Bar Below Main Header */}
      <div className="border-t border-slate-200/90 dark:border-slate-800/90 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className={isWideView ? "max-w-[98%] mx-auto px-3 sm:px-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
          <nav className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-1 ring-emerald-500/50'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
