import React, { useState } from 'react';
import { 
  Car, 
  Bike, 
  Truck, 
  Clock, 
  Search, 
  Download, 
  Repeat, 
  ShieldCheck, 
  LogOut, 
  Send, 
  CheckCircle2, 
  FileSpreadsheet, 
  Calendar, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EntryExitRecord, VehicleType } from '../types';
import { GoogleSheetsService } from '../services/googleSheets';
import { WhatsAppService } from '../services/whatsapp';

export const LiveLogs: React.FC = () => {
  const {
    t,
    records,
    manualExitVehicle,
    whatsAppConfig,
    sheetsConfig,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'inside' | 'exited'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | VehicleType>('all');
  const [selectedSnapshot, setSelectedSnapshot] = useState<{ url: string; plate: string; driver: string; time: string } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredRecords = records.filter((r) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'inside' && r.status === 'active_inside') ||
      (statusFilter === 'exited' && r.status === 'completed');

    const matchesType = typeFilter === 'all' || r.vehicleType === typeFilter;

    const matchesSearch =
      r.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.gate.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleExportCsv = () => {
    GoogleSheetsService.downloadCsv(filteredRecords, `SecurGate_Vehicle_Logs_${todayStr}.csv`);
  };

  const handleSendWhatsApp = (record: EntryExitRecord) => {
    const msg = record.status === 'completed'
      ? WhatsAppService.generateExitMessage(record, undefined, whatsAppConfig.companyName)
      : WhatsAppService.generateEntryMessage(record, undefined, whatsAppConfig.companyName);
    const link = WhatsAppService.createWhatsAppLink(record.ownerPhone, msg);
    window.open(link, '_blank');
  };

  const formatDuration = (mins?: number) => {
    if (!mins) return 'In Progress';
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours > 0) return `${hours}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {t('logsTitle')}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                AUDIT TRAIL
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Complete timestamped audit trail of all vehicle entries and exits with multi-trip indicators.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('btnExportCsv')}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plate, driver, gate, owner..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {/* Status filter */}
          <div className="flex rounded-xl p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              onClick={() => setStatusFilter('inside')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'inside'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('filterInside')}
            </button>
            <button
              onClick={() => setStatusFilter('exited')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'exited'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('filterExited')}
            </button>
          </div>

          {/* Type filter */}
          <div className="flex rounded-xl p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                typeFilter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('car')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                typeFilter === 'car' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Cars
            </button>
            <button
              onClick={() => setTypeFilter('bike')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                typeFilter === 'bike' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Bikes
            </button>
            <button
              onClick={() => setTypeFilter('other')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                typeFilter === 'other' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Others
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                <th className="py-3 px-3">{t('colPlate')}</th>
                <th className="py-3 px-3">{t('colDriver')}</th>
                <th className="py-3 px-3">{t('colEntryTime')}</th>
                <th className="py-3 px-3">{t('colExitTime')}</th>
                <th className="py-3 px-3">{t('colDuration')}</th>
                <th className="py-3 px-3">{t('colTripSequence')}</th>
                <th className="py-3 px-3">{t('colVerification')}</th>
                <th className="py-3 px-3 text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No logs found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Plate & Type */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg ${
                            r.vehicleType === 'car'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : r.vehicleType === 'bike'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {r.vehicleType === 'car' && <Car className="w-3.5 h-3.5" />}
                          {r.vehicleType === 'bike' && <Bike className="w-3.5 h-3.5" />}
                          {r.vehicleType === 'other' && <Truck className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            {r.plateNumber}
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 rounded ${
                              r.status === 'active_inside'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {r.status === 'active_inside' ? 'INSIDE' : 'EXITED'}
                          </span>
                          {r.parkingAreaName && (
                            <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]" title={r.parkingAreaName}>
                              📍 {r.parkingAreaName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Driver & Phone */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 dark:text-slate-200 font-semibold">
                        {r.driverName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {r.ownerPhone}
                      </div>
                    </td>

                    {/* Entry Time */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-800 dark:text-slate-200">
                        {new Date(r.entryTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.entryTime).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {r.gate}
                      </div>
                    </td>

                    {/* Exit Time */}
                    <td className="py-3 px-3">
                      {r.exitTime ? (
                        <>
                          <div className="font-mono text-slate-800 dark:text-slate-200">
                            {new Date(r.exitTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(r.exitTime).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Parked inside
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {formatDuration(r.durationMinutes)}
                      </span>
                    </td>

                    {/* Trips sequence */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.dailyEntrySequence > 1
                            ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {r.dailyEntrySequence > 1 && <Repeat className="w-3 h-3" />}
                        Trip #{r.dailyEntrySequence}
                      </span>
                    </td>

                    {/* Verification & Snapshot */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {r.faceSnapshotUrl ? (
                          <button
                            onClick={() =>
                              setSelectedSnapshot({
                                url: r.faceSnapshotUrl!,
                                plate: r.plateNumber,
                                driver: r.driverName,
                                time: new Date(r.entryTime).toLocaleString(),
                              })
                            }
                            className="relative group cursor-pointer"
                            title="Click to view security face snapshot"
                          >
                            <img
                              src={r.faceSnapshotUrl}
                              alt={r.driverName}
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/50 group-hover:ring-2"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <UserCheck className="w-3 h-3 text-white" />
                            </div>
                          </button>
                        ) : (
                          <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            -
                          </span>
                        )}
                        <div>
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{r.method.toUpperCase()}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {r.faceVerified ? 'Face Verified' : 'Manual Pass'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Alert Button */}
                        <button
                          onClick={() => handleSendWhatsApp(r)}
                          title="Open WhatsApp Alert to Owner"
                          className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Manual Checkout button if still inside */}
                        {r.status === 'active_inside' && (
                          <button
                            onClick={() => manualExitVehicle(r.id)}
                            title="Mark Exit and open barrier"
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-semibold border border-rose-500/20 transition-colors"
                          >
                            Exit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Security Camera Face Snapshot
              </span>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black aspect-square flex items-center justify-center">
              <img
                src={selectedSnapshot.url}
                alt={selectedSnapshot.driver}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">License Plate:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedSnapshot.plate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driver Identified:</span>
                <span className="font-semibold">{selectedSnapshot.driver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Captured At:</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {selectedSnapshot.time}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSnapshot(null)}
              className="mt-4 w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
            >
              Close Snapshot
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
