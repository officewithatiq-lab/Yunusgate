import React, { useState } from 'react';
import QRCode from 'qrcode';
import { 
  Car, 
  Bike, 
  Truck, 
  Plus, 
  Search, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  Download, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  User, 
  Phone, 
  Building, 
  Radio, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vehicle, VehicleType, VehicleCategory } from '../types';

export const VehicleDirectory: React.FC = () => {
  const {
    t,
    vehicles,
    parkingAreas,
    registerVehicle,
    updateVehicle,
    deleteVehicle,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | VehicleType>('all');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPassVehicle, setSelectedPassVehicle] = useState<Vehicle | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Form State for new vehicle
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: 'car' as VehicleType,
    makeModel: '',
    color: '',
    ownerName: '',
    ownerPhone: '+92',
    driverName: '',
    department: 'Operations',
    category: 'employee' as VehicleCategory,
    rfidTag: '',
    parkingAreaId: '',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plateNumber.trim() || !formData.ownerName.trim()) return;

    const selectedArea =
      parkingAreas.find((a) => a.id === formData.parkingAreaId) ||
      parkingAreas.find((a) => a.isDefault) ||
      parkingAreas[0];

    registerVehicle({
      ...formData,
      plateNumber: formData.plateNumber.trim().toUpperCase(),
      driverName: formData.driverName.trim() || formData.ownerName.trim(),
      parkingAreaId: selectedArea?.id,
      parkingAreaName: selectedArea?.name,
    });

    setShowRegisterModal(false);
    setFormData({
      plateNumber: '',
      type: 'car',
      makeModel: '',
      color: '',
      ownerName: '',
      ownerPhone: '+92',
      driverName: '',
      department: 'Operations',
      category: 'employee',
      rfidTag: '',
      parkingAreaId: '',
      driverPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });
  };

  const handleOpenPassModal = async (v: Vehicle) => {
    setSelectedPassVehicle(v);
    try {
      // Generate clean QR code data URL
      const url = await QRCode.toDataURL(v.qrCode || v.plateNumber, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.warn('QR Code generation error:', err);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesType = filterType === 'all' || v.type === filterType;
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Register Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {t('directoryTitle')}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                FLEET &amp; PASSES
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authorized company fleet, registered employee vehicles &amp; printable digital QR passes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('btnRegisterVehicle')}</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plate, RFID, driver, department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex rounded-xl p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold self-stretch sm:self-auto">
          {[
            { id: 'all', label: `All (${vehicles.length})` },
            { id: 'car', label: `Cars (${vehicles.filter(v => v.type === 'car').length})`, icon: Car },
            { id: 'bike', label: `Bikes (${vehicles.filter(v => v.type === 'bike').length})`, icon: Bike },
            { id: 'other', label: `Others (${vehicles.filter(v => v.type === 'other').length})`, icon: Truck },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id as 'all' | VehicleType)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                filterType === btn.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {btn.icon && <btn.icon className="w-3.5 h-3.5" />}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Type & Status */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl ${
                      v.type === 'car'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : v.type === 'bike'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {v.type === 'car' && <Car className="w-4 h-4" />}
                    {v.type === 'bike' && <Bike className="w-4 h-4" />}
                    {v.type === 'other' && <Truck className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white tracking-wider">
                      {v.plateNumber}
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                      {v.category}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                    v.status === 'inside'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {v.status === 'inside' ? '● INSIDE' : '○ OUTSIDE'}
                </span>
              </div>

              {/* Vehicle & Driver Details */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">Make &amp; Model:</span>
                  <span className="font-semibold text-right">{v.makeModel} ({v.color})</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">Driver:</span>
                  <span className="font-semibold">{v.driverName}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">Owner:</span>
                  <span className="font-semibold">{v.ownerName}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">WhatsApp:</span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {v.ownerPhone}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">RFID Tag:</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    {v.rfidTag}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">Department:</span>
                  <span className="font-medium">{v.department}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">{t('assignedParkingArea')}:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right truncate max-w-[150px]">
                    {v.parkingAreaName || parkingAreas.find(a => a.id === v.parkingAreaId)?.name || 'Default Area'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: QR Pass generator */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleOpenPassModal(v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{t('generateQrPass')}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    updateVehicle(v.id, { isBlacklisted: !v.isBlacklisted })
                  }
                  title={v.isBlacklisted ? 'Remove Blacklist' : 'Blacklist Vehicle'}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    v.isBlacklisted
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'text-slate-400 hover:text-rose-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteVehicle(v.id)}
                  title="Remove from directory"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Register New Vehicle */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                {t('btnRegisterVehicle')}
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('plateNumber')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="e.g. LEA-24-9021"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('vehicleType')} *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="car">{t('car')}</option>
                    <option value="bike">{t('bike')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('makeModel')}
                  </label>
                  <input
                    type="text"
                    value={formData.makeModel}
                    onChange={(e) => setFormData({ ...formData, makeModel: e.target.value })}
                    placeholder="e.g. Toyota Corolla / Honda 70"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. White / Black / Silver"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('ownerName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('driverName')}
                  </label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    placeholder="Driver Name (if different)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('ownerPhone')} (For WhatsApp Alerts) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    placeholder="+923001234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('rfidTag')} (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.rfidTag}
                    onChange={(e) => setFormData({ ...formData, rfidTag: e.target.value })}
                    placeholder="e.g. RFID-9021-AF"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('department')}
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Operations / Accounts"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {t('category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as VehicleCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="executive">Executive / VIP</option>
                    <option value="visitor">Visitor</option>
                    <option value="delivery">Delivery / Courier</option>
                    <option value="contractor">Contractor</option>
                  </select>
                </div>
              </div>

              {/* Designated Parking Area Selection */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  {t('assignedParkingArea')}
                </label>
                <select
                  value={formData.parkingAreaId}
                  onChange={(e) => setFormData({ ...formData, parkingAreaId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Default Area ({parkingAreas.find(a => a.isDefault)?.name || 'First Lot'})</option>
                  {parkingAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      [{area.code}] {area.name} (Capacity: {area.totalCapacity} slots)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  Register Vehicle &amp; Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Windshield QR Pass & Badge */}
      {selectedPassVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Authorized Vehicle Gate Pass
              </span>
              <button
                onClick={() => setSelectedPassVehicle(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Printable Physical Windshield Badge Card */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white border-2 border-emerald-500/40 shadow-xl relative overflow-hidden print-card">
              
              {/* Card top banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                    SECUGATE ENTERPRISE ACCESS
                  </div>
                  <div className="text-sm font-black tracking-tight">
                    AUTHORIZED VEHICLE PASS
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {selectedPassVehicle.category.toUpperCase()}
                </span>
              </div>

              {/* QR Code and Vehicle Info */}
              <div className="my-4 flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Vehicle QR Pass"
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                      Generating...
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      Plate Number
                    </span>
                    <span className="font-mono text-lg font-black text-emerald-400 tracking-wider">
                      {selectedPassVehicle.plateNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">
                      Vehicle &amp; Color
                    </span>
                    <span className="font-semibold text-slate-200">
                      {selectedPassVehicle.makeModel}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">
                      Driver / Owner
                    </span>
                    <span className="font-semibold text-slate-200">
                      {selectedPassVehicle.driverName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">
                      RFID Badge
                    </span>
                    <span className="font-mono text-[11px] text-teal-300">
                      {selectedPassVehicle.rfidTag}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pass Footer */}
              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>GATE 1 • GATE 2 • GATE 3</span>
                <span>SEC-VERIFIED 2026</span>
              </div>
            </div>

            {/* Actions: Print & Download */}
            <div className="mt-5 flex items-center justify-end gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sticker Pass</span>
              </button>

              <a
                href={qrCodeDataUrl}
                download={`Pass_${selectedPassVehicle.plateNumber}.png`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Save QR Image</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
