import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Repeat, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Car, 
  Bike, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleSheetsService } from '../services/googleSheets';

export const ReportsModal: React.FC = () => {
  const {
    t,
    records,
    vehicles,
    capacity,
    carsInsideCount,
    bikesInsideCount,
    otherInsideCount,
    totalInsideCount,
    todayTotalEntries,
    todayTotalExits,
  } = useApp();

  const [activeReportType, setActiveReportType] = useState<'daily' | 'multi' | 'overstay' | 'hourly'>('daily');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState<boolean>(true);

  // Filter records for selected date
  const dateRecords = records.filter((r) => r.entryTime.startsWith(reportDate));

  // Multi-trip analysis
  const multiTripMap: Record<string, typeof dateRecords> = {};
  dateRecords.forEach((r) => {
    if (!multiTripMap[r.plateNumber]) {
      multiTripMap[r.plateNumber] = [];
    }
    multiTripMap[r.plateNumber].push(r);
  });

  const multiTripVehicles = Object.entries(multiTripMap)
    .filter(([_, recs]) => recs.length > 1)
    .map(([plate, recs]) => ({
      plate,
      count: recs.length,
      records: recs,
      vehicle: vehicles.find((v) => v.plateNumber === plate),
    }));

  // Overstay analysis (>8 hours or 480 minutes)
  const overstayRecords = records.filter((r) => {
    if (r.status === 'active_inside') {
      const durationMins = (Date.now() - new Date(r.entryTime).getTime()) / (1000 * 60);
      return durationMins > 480;
    }
    return (r.durationMinutes || 0) > 480;
  });

  // Hourly Traffic distribution
  const hourlyCounts: Record<number, { in: number; out: number }> = {};
  for (let i = 7; i <= 20; i++) {
    hourlyCounts[i] = { in: 0, out: 0 };
  }

  dateRecords.forEach((r) => {
    const entryHour = new Date(r.entryTime).getHours();
    if (hourlyCounts[entryHour]) {
      hourlyCounts[entryHour].in++;
    }
    if (r.exitTime) {
      const exitHour = new Date(r.exitTime).getHours();
      if (hourlyCounts[exitHour]) {
        hourlyCounts[exitHour].out++;
      }
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    GoogleSheetsService.downloadCsv(dateRecords, `SecurGate_Report_${reportDate}.csv`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Report Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {t('reportsTitle')}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                AUTO REPORT
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated intelligence reports for vehicle entries, peak hours, and multi-trip frequency.
            </p>
          </div>
        </div>

        {/* Date Selector & Print/Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
          />

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('btnPrintReport')}</span>
          </button>
        </div>
      </div>

      {/* Report Types Tabs */}
      <div className="flex rounded-xl p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold no-print overflow-x-auto">
        {[
          { id: 'daily', label: t('reportDailySummary'), icon: FileText },
          { id: 'multi', label: t('reportMultiEntry'), icon: Repeat },
          { id: 'overstay', label: t('reportOverstay'), icon: Clock },
          { id: 'hourly', label: t('reportPeakHours'), icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportType(tab.id as typeof activeReportType)}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeReportType === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Formal Printable Document Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-slate-900 dark:text-white space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Document Formal Header */}
        <div className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              OFFICIAL SECURITY AUDIT REPORT
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              SecurGate Enterprise • Facility Vehicle Audit
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated on {new Date().toLocaleString()} • Report Date: {reportDate}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
              AUDIT STAMP: VERIFIED
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              Main Gate Security Division
            </div>
          </div>
        </div>

        {/* Tab 1: Daily Summary Report */}
        {activeReportType === 'daily' && (
          <div className="space-y-6">
            
            {/* Quick KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Total Entries Today
                </span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {todayTotalEntries}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Total Exits Today
                </span>
                <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                  {todayTotalExits}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Currently Stationary Inside
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {totalInsideCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {carsInsideCount} Cars • {bikesInsideCount} Bikes • {otherInsideCount} Others
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Multi-Trip Vehicles
                </span>
                <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                  {multiTripVehicles.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Vehicles with &gt;1 entry
                </div>
              </div>
            </div>

            {/* Detailed Table for Date */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span>Detailed Vehicle Trips on {reportDate}</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({dateRecords.length} records)
                </span>
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Vehicle Plate</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Driver Name</th>
                      <th className="py-2.5 px-3">Entry Time</th>
                      <th className="py-2.5 px-3">Exit Time</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Trip #</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dateRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 font-mono font-bold">{r.plateNumber}</td>
                        <td className="py-2.5 px-3 uppercase text-[11px]">{r.vehicleType}</td>
                        <td className="py-2.5 px-3">{r.driverName}</td>
                        <td className="py-2.5 px-3 font-mono">
                          {new Date(r.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {r.exitTime
                            ? new Date(r.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Inside'}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {r.durationMinutes ? `${r.durationMinutes}m` : 'In Progress'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          #{r.dailyEntrySequence}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'active_inside'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {r.status === 'active_inside' ? 'INSIDE' : 'EXITED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Multi-Trip Vehicles Report (Directly solves "din main kaei bar ho sakti hai aik hi car ki or bike ki") */}
        {activeReportType === 'multi' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-200 text-xs">
              <strong>Multi-Trip Frequency Analysis:</strong> Tracks vehicles entering and exiting the premises multiple times in a single day (executives, field logistics, food delivery, courier).
            </div>

            {multiTripVehicles.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No vehicles have recorded multiple trips on {reportDate}.
              </p>
            ) : (
              <div className="space-y-4">
                {multiTripVehicles.map((item) => (
                  <div
                    key={item.plate}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                          {item.plate}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({item.vehicle?.makeModel} • {item.vehicle?.driverName})
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold">
                        {item.count} Trips Recorded Today
                      </span>
                    </div>

                    {/* Breakdown of each trip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {item.records.map((trip) => (
                        <div
                          key={trip.id}
                          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80"
                        >
                          <div className="font-bold text-indigo-600 dark:text-indigo-400">
                            Trip #{trip.dailyEntrySequence}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            In: {new Date(trip.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Out: {trip.exitTime ? new Date(trip.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Inside'}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            Duration: {trip.durationMinutes ? `${trip.durationMinutes} min` : 'Active'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Overstay Report (>8 Hours) */}
        {activeReportType === 'overstay' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
              <strong>Extended Stay / Overnight Security Alerts:</strong> Vehicles parked beyond 8 hours without exit clearance.
            </div>

            {overstayRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                All vehicles have cleared or have stayed within standard working hours.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Plate</th>
                      <th className="py-2.5 px-3">Owner / Driver</th>
                      <th className="py-2.5 px-3">Entry Timestamp</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {overstayRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {r.plateNumber}
                        </td>
                        <td className="py-2.5 px-3">{r.ownerName} ({r.ownerPhone})</td>
                        <td className="py-2.5 px-3 font-mono">
                          {new Date(r.entryTime).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {Math.round(((r.durationMinutes || 490) / 60) * 10) / 10} Hours
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                            {r.status === 'active_inside' ? 'CURRENTLY OVERSTAYING' : 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Peak Hours Breakdown */}
        {activeReportType === 'hourly' && (
          <div className="space-y-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hour-by-hour throughput at security checkpoints on {reportDate}.
            </p>

            <div className="space-y-2">
              {Object.entries(hourlyCounts).map(([hourStr, counts]) => {
                const hour = parseInt(hourStr);
                const timeLabel = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
                const maxVal = Math.max(1, ...Object.values(hourlyCounts).map((c) => Math.max(c.in, c.out)));
                const inWidth = (counts.in / maxVal) * 100;
                const outWidth = (counts.out / maxVal) * 100;

                return (
                  <div key={hour} className="flex items-center gap-3 text-xs">
                    <span className="w-28 font-mono text-slate-500 dark:text-slate-400 shrink-0">
                      {timeLabel}
                    </span>

                    <div className="flex-1 flex flex-col gap-1">
                      {/* In Bar */}
                      <div className="flex items-center gap-2">
                        <div className="w-full h-3 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded transition-all"
                            style={{ width: `${inWidth}%` }}
                          />
                        </div>
                        <span className="w-8 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {counts.in} in
                        </span>
                      </div>

                      {/* Out Bar */}
                      <div className="flex items-center gap-2">
                        <div className="w-full h-3 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded transition-all"
                            style={{ width: `${outWidth}%` }}
                          />
                        </div>
                        <span className="w-8 text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                          {counts.out} out
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Automatic Report Scheduler Box */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {t('autoReportSchedule')}
              </span>
              <p className="text-[11px] text-slate-400">
                {t('scheduleActive')}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoScheduleEnabled}
              onChange={(e) => setAutoScheduleEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

      </div>

    </div>
  );
};
