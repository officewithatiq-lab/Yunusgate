import React, { useState } from 'react';
import { 
  Car, 
  Bike, 
  Truck, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  Clock, 
  QrCode, 
  Radio, 
  Scan, 
  ShieldCheck, 
  Send, 
  LogOut, 
  FileSpreadsheet, 
  Search,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VehicleType, EntryExitRecord } from '../types';

interface DashboardProps {
  onOpenScanner: () => void;
  onOpenDirectory: () => void;
  onOpenLogs: () => void;
  onOpenSheets: () => void;
  onOpenWhatsApp: () => void;
  onOpenParkingAreas?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenScanner,
  onOpenDirectory,
  onOpenLogs,
  onOpenSheets,
  onOpenWhatsApp,
  onOpenParkingAreas,
}) => {
  const {
    t,
    carsInsideCount,
    bikesInsideCount,
    otherInsideCount,
    totalInsideCount,
    availableSlots,
    capacity,
    parkingAreas,
    areaOccupancyStats,
    totalMaxCapacity,
    todayTotalEntries,
    todayTotalExits,
    multiTripVehiclesCount,
    activeVehiclesInside,
    manualExitVehicle,
    processVehicleAccess,
    sheetsConfig,
    whatsAppConfig,
    lastActionMessage,
    setLastActionMessage,
    language,
  } = useApp();

  const [quickInput, setQuickInput] = useState('');
  const [quickActionType, setQuickActionType] = useState<'auto' | 'entry' | 'exit'>('auto');
  const [filterType, setFilterType] = useState<'all' | VehicleType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickMessage, setQuickMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const res = processVehicleAccess(quickInput.trim(), quickActionType, 'Gate 1 - Main North', 'manual');
    setQuickMessage({ text: res.message, success: res.success });
    if (res.success) {
      setQuickInput('');
    }
    setTimeout(() => setQuickMessage(null), 5000);
  };

  const filteredInsideVehicles = activeVehiclesInside.filter((r) => {
    const matchesType = filterType === 'all' || r.vehicleType === filterType;
    const matchesSearch =
      r.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const carPct = Math.min(100, Math.round((carsInsideCount / Math.max(1, capacity.carCapacity)) * 100));
  const bikePct = Math.min(100, Math.round((bikesInsideCount / Math.max(1, capacity.bikeCapacity)) * 100));
  const otherPct = Math.min(100, Math.round((otherInsideCount / Math.max(1, capacity.otherCapacity)) * 100));
  const totalCapacity = totalMaxCapacity || (capacity.carCapacity + capacity.bikeCapacity + capacity.otherCapacity);
  const totalPct = Math.min(100, Math.round((totalInsideCount / Math.max(1, totalCapacity)) * 100));

  const formatParkedDuration = (entryIso: string) => {
    const diff = Math.max(0, Date.now() - new Date(entryIso).getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner: WhatsApp Alert Popup if an action was just taken */}
      {lastActionMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/40 text-slate-800 dark:text-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold">
              WA
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                {t('ownerNotified')} ({lastActionMessage.plate})
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 max-w-xl">
                {lastActionMessage.text.split('\n')[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={lastActionMessage.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </a>
            <button
              onClick={() => setLastActionMessage(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Executive Section Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'ur' ? 'مرکزی سیکیورٹی و وہیکل مانیٹرنگ ڈیش بورڈ' : 'Security Checkpoint & Vehicle Access Dashboard'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ur'
                ? 'احاطے کے اندر موجود تمام گاڑیوں، بائیکس اور پارکنگ لاٹ کی لائیو مانیٹرنگ'
                : 'Real-time occupancy monitoring for stationary cars, motorbikes, and commercial freight'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            {todayTotalEntries} In • {todayTotalExits} Out
          </div>
          {onOpenParkingAreas && (
            <button
              onClick={onOpenParkingAreas}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('manageAreas')}</span>
            </button>
          )}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'اسکینر چیک پوائنٹ' : 'Launch Scanner'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 4 Prominent Stat Cards (Cars, Bikes, Other Vehicles, Overall Premises) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Cars Parked */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('statsCarsInside')}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {carsInsideCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {capacity.carCapacity} max capacity
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="text-slate-500 dark:text-slate-400">Occupancy</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{carPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${carPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Bikes Parked */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('statsBikesInside')}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bike className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {bikesInsideCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {capacity.bikeCapacity} max capacity
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="text-slate-500 dark:text-slate-400">Occupancy</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">{bikePct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${bikePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Other Vehicles (Vans, Trucks, Delivery) */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('statsOtherInside')}
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {otherInsideCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {capacity.otherCapacity} max capacity
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="text-slate-500 dark:text-slate-400">Occupancy</span>
              <span className="font-mono text-purple-600 dark:text-purple-400">{otherPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${otherPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Total Inside Company Premises */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              {t('statsTotalInside')}
            </span>
            <div className="p-2.5 rounded-xl bg-white/15 text-white backdrop-blur-sm">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight">
              {totalInsideCount}
            </span>
            <span className="text-xs text-emerald-100 font-medium">
              / {totalCapacity} spaces ({availableSlots} free)
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] mb-1 font-medium text-emerald-100">
              <span>Premises Load</span>
              <span className="font-mono font-bold">{totalPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-950/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${totalPct}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Parking Areas & Zone Defined Capacities Grid */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t('parkingAreasTitle')}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {parkingAreas.length} {language === 'ur' ? 'ایریاز' : 'ZONES'} • {totalCapacity} TOTAL SLOTS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('parkingAreasDesc')}
              </p>
            </div>
          </div>

          {onOpenParkingAreas && (
            <button
              onClick={onOpenParkingAreas}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('manageAreas')}</span>
            </button>
          )}
        </div>

        {/* Areas Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {areaOccupancyStats.map(({ area, occupied, available, percentage, isFull, isNearFull, cars, bikes, other }) => (
            <div
              key={area.id}
              onClick={onOpenParkingAreas}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                    {area.code}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isFull
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : isNearFull
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {percentage}% {isFull ? t('fullStatus') : `${available} free`}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {language === 'ur' && area.nameUrdu ? area.nameUrdu : area.name}
                  </h4>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {occupied}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      / {area.totalCapacity} slots defined
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                {/* Progress meter */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull ? 'bg-rose-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Footer: breakdown */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>{cars} Cars • {bikes} Bikes</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">
                    Edit &gt;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Bar: Today's Metrics (Entries, Exits, Multi-Trip count, Google Sheet Sync status) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-slate-800 dark:text-white">
              {todayTotalEntries}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t('statsTodayEntries')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-slate-800 dark:text-white">
              {todayTotalExits}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t('statsTodayExits')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-slate-800 dark:text-white">
              {multiTripVehiclesCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t('statsMultiEntries')}
            </div>
          </div>
        </div>

        <div 
          onClick={onOpenSheets}
          className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                Google Sheets
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {sheetsConfig.totalSyncedCount} logs synced
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </div>
      </div>

      {/* Middle Interactive Zone: Quick Checkpoint Access */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scan className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t('quickEntry')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Type plate, RFID, or scan tag. System auto-identifies if entering or exiting.
            </p>
          </div>

          {/* Launch Full Camera & Face Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Camera & Face Scanner</span>
          </button>
        </div>

        {/* Quick Input Form */}
        <form onSubmit={handleQuickSubmit} className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={t('quickSearchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all uppercase"
              />
            </div>

            {/* Action type radio / toggle */}
            <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setQuickActionType('auto')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  quickActionType === 'auto'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t('btnAutoDetect')}
              </button>
              <button
                type="button"
                onClick={() => setQuickActionType('entry')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  quickActionType === 'entry'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                In
              </button>
              <button
                type="button"
                onClick={() => setQuickActionType('exit')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  quickActionType === 'exit'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Out
              </button>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide transition-all shadow-sm cursor-pointer"
            >
              Submit Check
            </button>
          </div>

          {/* Quick Result Feedback */}
          {quickMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                quickMessage.success
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30'
              }`}
            >
              {quickMessage.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{quickMessage.text}</span>
            </div>
          )}

          {/* Quick demo tags for fast 1-click testing */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Try quick vehicles:
            </span>
            {[
              { plate: 'LEA-24-9021', label: 'Civic (Multi-Trip)' },
              { plate: 'ICT-22-3810', label: 'Corolla' },
              { plate: 'LER-23-1122', label: 'Yamaha Bike' },
              { plate: 'LES-19-4500', label: 'Staff Van' },
              { plate: 'LEK-21-9988', label: 'Delivery Bike' },
            ].map((sample) => (
              <button
                type="button"
                key={sample.plate}
                onClick={() => {
                  setQuickInput(sample.plate);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {sample.plate} ({sample.label})
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Currently Parked Inside Vehicles Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Table Header & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('statsTotalInside')} ({activeVehiclesInside.length})
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
                Live Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time directory of all vehicles currently stationary within company boundaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              {[
                { id: 'all', label: 'All' },
                { id: 'car', label: 'Cars', icon: Car },
                { id: 'bike', label: 'Bikes', icon: Bike },
                { id: 'other', label: 'Others', icon: Truck },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterType(btn.id as 'all' | VehicleType)}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    filterType === btn.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {btn.icon && <btn.icon className="w-3.5 h-3.5" />}
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onOpenLogs}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 ml-2"
            >
              <span>{t('viewAllLogs')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Vehicles Inside Table */}
        <div className="mt-4 overflow-x-auto">
          {filteredInsideVehicles.length === 0 ? (
            <div className="py-12 text-center">
              <Car className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('noVehiclesInside')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Scan a vehicle RFID or QR code above to log an entry.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Vehicle / Plate</th>
                  <th className="py-3 px-3">Driver / Owner</th>
                  <th className="py-3 px-3">Entry Time</th>
                  <th className="py-3 px-3">Duration Parked</th>
                  <th className="py-3 px-3">Trip # Today</th>
                  <th className="py-3 px-3">Security Check</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredInsideVehicles.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Plate & Type */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            record.vehicleType === 'car'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : record.vehicleType === 'bike'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {record.vehicleType === 'car' && <Car className="w-4 h-4" />}
                          {record.vehicleType === 'bike' && <Bike className="w-4 h-4" />}
                          {record.vehicleType === 'other' && <Truck className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {record.plateNumber}
                          </div>
                          <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                            {record.category}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Driver & Owner */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {record.faceSnapshotUrl && (
                          <img
                            src={record.faceSnapshotUrl}
                            alt={record.driverName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                          />
                        )}
                        <div>
                          <div className="text-slate-800 dark:text-slate-200 font-semibold">
                            {record.driverName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {record.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Entry Time */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 dark:text-slate-200 font-mono">
                        {new Date(record.entryTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">{record.gate}</div>
                    </td>

                    {/* Parked Duration */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatParkedDuration(record.entryTime)}
                      </span>
                    </td>

                    {/* Daily trip number */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          record.dailyEntrySequence > 1
                            ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {record.dailyEntrySequence > 1 && <Repeat className="w-3 h-3" />}
                        Trip #{record.dailyEntrySequence}
                      </span>
                    </td>

                    {/* Verification check */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Face &amp; {record.method.toUpperCase()}</span>
                      </div>
                    </td>

                    {/* Action: Manual exit button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => manualExitVehicle(record.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 transition-colors"
                        title="Register vehicle departure"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('btnManualExit')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
};
