import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  KeyRound, 
  Lock, 
  UserCheck, 
  AlertTriangle, 
  Languages, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Radio, 
  Sparkles,
  Car,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BiometricService } from '../services/biometric';
import { sound } from '../services/sound';
import { UserProfile } from '../types';

const DEMO_OFFICERS: UserProfile[] = [
  {
    id: 'usr-guard-01',
    name: 'Officer Zafar Iqbal',
    email: 'security.gate1@enterprise.local',
    role: 'gate_supervisor',
    badgeNumber: 'SG-8842',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    pin: '1234',
    biometricRegistered: true,
  },
  {
    id: 'usr-admin-01',
    name: 'Tariq Mehmood (Admin)',
    email: 'admin.security@enterprise.local',
    role: 'admin',
    badgeNumber: 'ADM-001',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    pin: '9999',
    biometricRegistered: true,
  },
  {
    id: 'usr-guard-02',
    name: 'Guard Hamza Khan',
    email: 'gate2.security@enterprise.local',
    role: 'security_guard',
    badgeNumber: 'SG-5510',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    pin: '5555',
    biometricRegistered: true,
  },
];

export const LoginScreen: React.FC = () => {
  const { 
    t, 
    login, 
    biometricLogin, 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    updateUserProfile,
    carsInsideCount,
    bikesInsideCount,
    otherInsideCount
  } = useApp();

  const [selectedOfficer, setSelectedOfficer] = useState<UserProfile>(DEMO_OFFICERS[0]);
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanningBiometric, setIsScanningBiometric] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<string | null>(null);

  const handleOfficerSelect = (officer: UserProfile) => {
    setSelectedOfficer(officer);
    updateUserProfile(officer);
    setPin('');
    setErrorMsg(null);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!pin.trim()) {
      setErrorMsg(language === 'ur' ? 'براہ کرم سیکیورٹی پن درج کریں' : 'Please enter security PIN');
      return;
    }

    if (pin === selectedOfficer.pin || pin === '1234') {
      login(pin);
    } else {
      setErrorMsg(
        language === 'ur' 
          ? `غلط سیکیورٹی پن۔ درست پن ${selectedOfficer.pin} ہے` 
          : `Invalid PIN code. Correct PIN for this profile is ${selectedOfficer.pin}`
      );
    }
  };

  const handleBiometricTouch = async () => {
    setIsScanningBiometric(true);
    setErrorMsg(null);
    try {
      const res = await BiometricService.verifyBiometric(selectedOfficer.name);
      if (res.success) {
        setBiometricSuccess(
          language === 'ur'
            ? `بایومیٹرک شناخت تصدیق شدہ: ${selectedOfficer.name}`
            : `Biometric Identity Verified: ${selectedOfficer.name}`
        );
        setTimeout(async () => {
          await biometricLogin();
          setIsScanningBiometric(false);
        }, 900);
      }
    } catch {
      setIsScanningBiometric(false);
      setErrorMsg(language === 'ur' ? 'بایومیٹرک تصدیق ناکام ہو گئی' : 'Biometric verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Background Ambience / Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Top Header on Login Screen */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                {t('appTitle')}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Top Right Controls: Language & Theme */}
        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            title="Switch Language / زبان تبدیل کریں"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Main Login Card Center */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-6">
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Gate Terminal Status Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">
                GATE 1 TERMINAL • RESTRICTED
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
              SECURE
            </span>
          </div>

          {/* Title */}
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {language === 'ur' ? 'سیکیورٹی گیٹ لاگ ان ٹرمینل' : 'Security Terminal Access'}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'ur'
                ? 'نظام تک رسائی کے لیے سیکیورٹی پن درج کریں یا بایومیٹرک سینسر چھوئیں'
                : 'Enter your authorization PIN or verify via biometric sensor to proceed'}
            </p>
          </div>

          {/* Officer Selector Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              {language === 'ur' ? 'سیکیورٹی آفیسر کا انتخاب کریں' : 'Select Officer On Duty'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_OFFICERS.map((officer) => (
                <button
                  type="button"
                  key={officer.id}
                  onClick={() => handleOfficerSelect(officer)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedOfficer.id === officer.id
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <img
                    src={officer.avatarUrl}
                    alt={officer.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <div className="w-full truncate">
                    <span className="text-xs font-bold block truncate">
                      {officer.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      {officer.badgeNumber}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Biometric Touch Sensor */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-2">
            <button
              type="button"
              onClick={handleBiometricTouch}
              disabled={isScanningBiometric}
              className="group relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
              title="Touch sensor for instant biometric unlock"
            >
              <Fingerprint className={`w-9 h-9 ${isScanningBiometric ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
              <div className={`absolute inset-0 rounded-2xl border-2 border-emerald-300 ${isScanningBiometric ? 'animate-ping' : 'opacity-0'} transition-opacity`} />
            </button>

            <span className="text-xs font-bold text-slate-200">
              {isScanningBiometric
                ? t('faceScanning')
                : t('biometricAuth')}
            </span>
            <span className="text-[11px] text-slate-400">
              {t('biometricPrompt')}
            </span>

            {biometricSuccess && (
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{biometricSuccess}</span>
              </div>
            )}
          </div>

          {/* PIN Login Form */}
          <form onSubmit={handlePinSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {t('pinLogin')}
                </label>
                <button
                  type="button"
                  onClick={() => setPin(selectedOfficer.pin)}
                  className="text-[11px] font-mono text-emerald-400 hover:underline"
                >
                  {language === 'ur' ? `خودکار پن (${selectedOfficer.pin})` : `Autofill PIN (${selectedOfficer.pin})`}
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={language === 'ur' ? 'سیکیورٹی پن درج کریں...' : 'Enter 4-digit PIN...'}
                  maxLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in shake">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{t('btnLogin')}</span>
            </button>
          </form>

        </div>
      </main>

      {/* Bottom Live Facility Mini Status */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 py-4 text-center text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Facility Status: Active</span>
          </span>
          <span>•</span>
          <span>Cars Parked: {carsInsideCount}</span>
          <span>•</span>
          <span>Bikes Parked: {bikesInsideCount}</span>
          <span>•</span>
          <span>Commercial/Others: {otherInsideCount}</span>
        </div>
      </footer>

    </div>
  );
};
