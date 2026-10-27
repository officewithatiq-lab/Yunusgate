import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { GateScanner } from './components/GateScanner';
import { VehicleDirectory } from './components/VehicleDirectory';
import { LiveLogs } from './components/LiveLogs';
import { ReportsModal } from './components/ReportsModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { BiometricLoginModal } from './components/BiometricLoginModal';
import { ParkingAreasModal } from './components/ParkingAreasModal';
import { LoginScreen } from './components/LoginScreen';
import { ShieldCheck, WifiOff, FileSpreadsheet, MessageSquare, QrCode, Layers } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [showSheetsModal, setShowSheetsModal] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);
  const [showParkingAreasModal, setShowParkingAreasModal] = useState<boolean>(false);
  const [isWideView, setIsWideView] = useState<boolean>(false);

  const { isOnline, offlineQueue, syncOfflineQueueNow, t, language, isAuthenticated } = useApp();

  // If user has not authenticated, show secure Login Screen first!
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const isExpandedMode = isWideView;

  return (
    <div dir={language === 'ur' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Offline Mode Sticky Banner if network is down */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>
              {t('offlineNotice')} ({offlineQueue.length} records in offline queue).
            </span>
          </div>
          {offlineQueue.length > 0 && (
            <button
              onClick={() => syncOfflineQueueNow()}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-bold transition-colors"
            >
              Retry Sync
            </button>
          )}
        </div>
      )}

      {/* Main Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBiometricModal={() => setShowBiometricModal(true)}
        onOpenSheetsModal={() => setShowSheetsModal(true)}
        onOpenWhatsAppModal={() => setShowWhatsAppModal(true)}
        onOpenParkingAreasModal={() => setShowParkingAreasModal(true)}
        isWideView={isExpandedMode}
        onToggleWideView={() => setIsWideView(!isWideView)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full pt-6 transition-all duration-300 ${
        isExpandedMode ? 'max-w-[98%] mx-auto px-2 sm:px-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      }`}>
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenScanner={() => setActiveTab('scanner')}
            onOpenDirectory={() => setActiveTab('directory')}
            onOpenLogs={() => setActiveTab('logs')}
            onOpenSheets={() => setShowSheetsModal(true)}
            onOpenWhatsApp={() => setShowWhatsAppModal(true)}
            onOpenParkingAreas={() => setShowParkingAreasModal(true)}
          />
        )}

        {activeTab === 'scanner' && <GateScanner />}

        {activeTab === 'directory' && <VehicleDirectory />}

        {activeTab === 'logs' && <LiveLogs />}

        {activeTab === 'reports' && <ReportsModal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-4 text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              SecurGate Pro 2.6
            </span>
            <span>•</span>
            <span>Vehicle Entry/Exit &amp; Facial Recognition System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowParkingAreasModal(true)}
              className="hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Parking Areas &amp; Capacity</span>
            </button>

            <button
              onClick={() => setShowSheetsModal(true)}
              className="hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sheets Sync</span>
            </button>

            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="hover:text-green-500 transition-colors flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Alerts</span>
            </button>

            <button
              onClick={() => setShowBiometricModal(true)}
              className="hover:text-emerald-500 transition-colors"
            >
              Biometric Profile
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ParkingAreasModal
        isOpen={showParkingAreasModal}
        onClose={() => setShowParkingAreasModal(false)}
      />

      <BiometricLoginModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
      />

      <GoogleSheetsModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
      />

      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
