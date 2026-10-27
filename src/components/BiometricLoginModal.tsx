import React, { useState } from 'react';
import { 
  Fingerprint, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  KeyRound, 
  User, 
  BadgeCheck, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BiometricService } from '../services/biometric';

interface BiometricLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BiometricLoginModal: React.FC<BiometricLoginModalProps> = ({ isOpen, onClose }) => {
  const {
    t,
    currentUser,
    isAuthenticated,
    login,
    biometricLogin,
    logout,
    updateUserProfile,
  } = useApp();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [biometricSuccessMessage, setBiometricSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const success = login(pin);
    if (success) {
      setPin('');
      onClose();
    } else {
      setErrorMsg('Incorrect Security PIN. (Default demo PIN is 1234)');
    }
  };

  const handleBiometricTouch = async () => {
    setIsScanningBiometric(true);
    setErrorMsg(null);
    try {
      const res = await BiometricService.verifyBiometric(currentUser.name);
      if (res.success) {
        setBiometricSuccessMessage(res.message);
        await biometricLogin();
        setTimeout(() => {
          setIsScanningBiometric(false);
          setBiometricSuccessMessage(null);
          onClose();
        }, 1200);
      }
    } catch {
      setIsScanningBiometric(false);
      setErrorMsg('Biometric verification failed. Use PIN instead.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('loginTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Profile Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/50"
          />
          <div className="flex-1">
            <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{currentUser.name}</span>
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Badge: {currentUser.badgeNumber} • {currentUser.role.toUpperCase()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <Fingerprint className="w-3 h-3" />
              <span>Biometric Profile Secured</span>
            </div>
          </div>
        </div>

        {/* Biometric Fingerprint Sensor Tap Target */}
        <div className="my-6 flex flex-col items-center justify-center">
          <button
            onClick={handleBiometricTouch}
            disabled={isScanningBiometric}
            className="group relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Fingerprint className={`w-12 h-12 ${isScanningBiometric ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
            
            {/* Sensor Scan Ring */}
            <div className={`absolute inset-0 rounded-3xl border-2 border-emerald-300 ${isScanningBiometric ? 'animate-ping' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
          </button>

          <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isScanningBiometric ? t('faceScanning') : t('biometricPrompt')}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Compatible with Fingerprint sensor, Touch ID, Face ID &amp; WebAuthn
          </span>

          {biometricSuccessMessage && (
            <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{biometricSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Alternative: PIN Login Form */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">
                {t('pinLogin')} (Default: 1234)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                {t('btnLogin')}
              </button>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
