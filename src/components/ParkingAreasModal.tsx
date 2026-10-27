import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  Bike, 
  Truck, 
  X, 
  ShieldCheck, 
  MapPin, 
  Sliders, 
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ParkingArea } from '../types';

interface ParkingAreasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_TAGS: { key: 'emerald' | 'blue' | 'indigo' | 'amber' | 'purple' | 'rose' | 'slate'; label: string; bg: string; text: string; border: string }[] = [
  { key: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30' },
  { key: 'blue', label: 'Navy Blue', bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/30' },
  { key: 'indigo', label: 'Indigo', bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-500/30' },
  { key: 'amber', label: 'Amber Orange', bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/30' },
  { key: 'purple', label: 'Purple / Violet', bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30' },
  { key: 'rose', label: 'Rose Red', bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500/30' },
  { key: 'slate', label: 'Slate Grey', bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-500/30' },
];

export const ParkingAreasModal: React.FC<ParkingAreasModalProps> = ({ isOpen, onClose }) => {
  const {
    t,
    language,
    parkingAreas,
    areaOccupancyStats,
    totalMaxCapacity,
    totalInsideCount,
    availableSlots,
    addParkingArea,
    updateParkingArea,
    deleteParkingArea,
    activeVehiclesInside,
  } = useApp();

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);

  // Form State for creating / editing
  const [formData, setFormData] = useState({
    name: '',
    nameUrdu: '',
    code: '',
    totalCapacity: 30,
    carCapacity: 20,
    bikeCapacity: 10,
    otherCapacity: 0,
    description: '',
    colorTag: 'emerald' as ParkingArea['colorTag'],
    isDefault: false,
  });

  if (!isOpen) return null;

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameUrdu: '',
      code: '',
      totalCapacity: 30,
      carCapacity: 20,
      bikeCapacity: 10,
      otherCapacity: 0,
      description: '',
      colorTag: 'emerald',
      isDefault: false,
    });
    setEditingAreaId(null);
    setShowCreateForm(false);
  };

  const handleStartEdit = (area: ParkingArea) => {
    setEditingAreaId(area.id);
    setFormData({
      name: area.name,
      nameUrdu: area.nameUrdu || '',
      code: area.code,
      totalCapacity: area.totalCapacity,
      carCapacity: area.carCapacity || 0,
      bikeCapacity: area.bikeCapacity || 0,
      otherCapacity: area.otherCapacity || 0,
      description: area.description || '',
      colorTag: area.colorTag || 'emerald',
      isDefault: !!area.isDefault,
    });
    setShowCreateForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.totalCapacity <= 0) {
      showFeedback('Please provide a valid Area Name and Total Capacity (>0).', 'error');
      return;
    }

    const cleanCode = (formData.code.trim() || formData.name.substring(0, 4)).toUpperCase();

    if (editingAreaId) {
      updateParkingArea(editingAreaId, {
        name: formData.name.trim(),
        nameUrdu: formData.nameUrdu.trim() || undefined,
        code: cleanCode,
        totalCapacity: Number(formData.totalCapacity),
        carCapacity: Number(formData.carCapacity) || 0,
        bikeCapacity: Number(formData.bikeCapacity) || 0,
        otherCapacity: Number(formData.otherCapacity) || 0,
        description: formData.description.trim(),
        colorTag: formData.colorTag,
        isDefault: formData.isDefault,
      });
      showFeedback(`Parking Area "${formData.name}" updated successfully.`);
    } else {
      addParkingArea({
        name: formData.name.trim(),
        nameUrdu: formData.nameUrdu.trim() || undefined,
        code: cleanCode,
        totalCapacity: Number(formData.totalCapacity),
        carCapacity: Number(formData.carCapacity) || 0,
        bikeCapacity: Number(formData.bikeCapacity) || 0,
        otherCapacity: Number(formData.otherCapacity) || 0,
        description: formData.description.trim(),
        colorTag: formData.colorTag,
        isDefault: formData.isDefault,
      });
      showFeedback(`New Parking Area "${formData.name}" created with capacity of ${formData.totalCapacity} slots!`);
    }

    resetForm();
  };

  const handleDelete = (areaId: string, areaName: string) => {
    const res = deleteParkingArea(areaId);
    if (res.success) {
      showFeedback(`Area "${areaName}" was deleted.`);
      if (editingAreaId === areaId) resetForm();
    } else {
      showFeedback(res.message || 'Cannot delete area.', 'error');
    }
  };

  const handleQuickCapacityChange = (areaId: string, currentCap: number, delta: number) => {
    const nextCap = Math.max(1, currentCap + delta);
    updateParkingArea(areaId, { totalCapacity: nextCap });
    showFeedback(`Total capacity updated to ${nextCap} slots.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir={language === 'ur' ? 'rtl' : 'ltr'}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('parkingAreasTitle')}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {parkingAreas.length} {t('tabParkingAreas')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('parkingAreasDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
            feedbackMessage.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
          }`}>
            {feedbackMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Quick Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {t('allParkingAreas')}
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {parkingAreas.length}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Configured zones</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {t('totalFacilityCapacity')}
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {totalMaxCapacity}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Total vehicle slots</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {t('slotsOccupied')}
              </span>
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                {totalInsideCount}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Vehicles inside</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {t('slotsRemaining')}
              </span>
              <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                {availableSlots}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Available slots</span>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('tabParkingAreas')} ({parkingAreas.length})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define total capacity for each area. Live occupancy automatically updates on entry/exit.
              </p>
            </div>
            
            <button
              onClick={() => {
                if (showCreateForm && !editingAreaId) {
                  setShowCreateForm(false);
                } else {
                  resetForm();
                  setShowCreateForm(true);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{showCreateForm && !editingAreaId ? t('cancel') : t('createNewArea')}</span>
            </button>
          </div>

          {/* Create / Edit Form Drawer */}
          {showCreateForm && (
            <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {editingAreaId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      {editingAreaId ? t('editParkingArea') : t('createNewArea')}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Specify the zone name, code identifier, and define its total capacity limit.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Area Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('areaName')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Executive Ground (Zone A)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Area Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('areaCode')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EXEC-A1"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Total Capacity (The Main Requirement!) */}
                <div className="sm:col-span-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-emerald-500/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {t('totalAreaCapacity')} *
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Maximum number of total parking spaces permitted in this specific area
                      </p>
                    </div>

                    {/* Numeric Input + Quick Increments */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        required
                        value={formData.totalCapacity}
                        onChange={(e) => setFormData({ ...formData, totalCapacity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-28 px-3 py-1.5 rounded-lg text-sm font-mono font-black text-center bg-slate-50 dark:bg-slate-900 border border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                      <div className="flex items-center gap-1">
                        {[5, 10, 25, 50].map((inc) => (
                          <button
                            key={inc}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, totalCapacity: prev.totalCapacity + inc }))}
                            className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            +{inc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Optional breakdown slots */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <Car className="w-3.5 h-3.5 text-blue-500" />
                        <span>{t('carSlotsLabel')}</span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.carCapacity}
                        onChange={(e) => setFormData({ ...formData, carCapacity: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <Bike className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('bikeSlotsLabel')}</span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.bikeCapacity}
                        onChange={(e) => setFormData({ ...formData, bikeCapacity: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <Truck className="w-3.5 h-3.5 text-purple-500" />
                        <span>{t('otherSlotsLabel')}</span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.otherCapacity}
                        onChange={(e) => setFormData({ ...formData, otherCapacity: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('areaDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Basement Level 1, near elevator shaft C"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Color Tag Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('colorTheme')}
                  </label>
                  <select
                    value={formData.colorTag}
                    onChange={(e) => setFormData({ ...formData, colorTag: e.target.value as ParkingArea['colorTag'] })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    {COLOR_TAGS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Is Default Checkbox */}
                <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultArea"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                  />
                  <label htmlFor="isDefaultArea" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    {t('defaultAreaLabel')}
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-500/20">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingAreaId ? t('save') : t('createNewArea')}</span>
                </button>
              </div>
            </form>
          )}

          {/* Parking Areas Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areaOccupancyStats.map(({ area, occupied, available, percentage, cars, bikes, other, isFull, isNearFull }) => {
              const colorConfig = COLOR_TAGS.find((c) => c.key === area.colorTag) || COLOR_TAGS[0];
              const isExpanded = expandedAreaId === area.id;

              // Vehicles inside this area
              const vehiclesParkedHere = activeVehiclesInside.filter(
                (r) => r.parkingAreaId === area.id || (!r.parkingAreaId && area.isDefault)
              );

              return (
                <div
                  key={area.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                    area.isDefault 
                      ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {/* Top Row: Color badge, Code, and Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}>
                        {area.code}
                      </span>
                      {area.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(area)}
                        title={t('editParkingArea')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(area.id, area.name)}
                        title={t('deleteParkingArea')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Area Title & Description */}
                  <div className="mt-3">
                    <h5 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {language === 'ur' && area.nameUrdu ? area.nameUrdu : area.name}
                    </h5>
                    {area.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{area.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Capacity Definition & Quick Adjustment Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                        {t('totalAreaCapacity')}
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                          {area.totalCapacity}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          slots defined
                        </span>
                      </div>
                    </div>

                    {/* Quick increment/decrement buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickCapacityChange(area.id, area.totalCapacity, -5)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                        title="Reduce capacity by 5"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickCapacityChange(area.id, area.totalCapacity, -1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                        title="Reduce capacity by 1"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickCapacityChange(area.id, area.totalCapacity, 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                        title="Increase capacity by 1"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickCapacityChange(area.id, area.totalCapacity, 5)}
                        className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center justify-center transition-colors shadow-sm"
                        title="Increase capacity by 5"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Live Occupancy Gauge */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {occupied} / {area.totalCapacity} {t('slotsOccupied')}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                          {available} free
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        isFull 
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' 
                          : isNearFull 
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {percentage}% {isFull ? t('fullStatus') : isNearFull ? t('fillingFastStatus') : t('availableStatus')}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull ? 'bg-rose-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Vehicle Breakdown Pills */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-mono">{cars}</span> cars
                    </span>
                    <span className="flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-mono">{bikes}</span> bikes
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-mono">{other}</span> other
                    </span>
                  </div>

                  {/* Expand / View Vehicles inside */}
                  {vehiclesParkedHere.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setExpandedAreaId(isExpanded ? null : area.id)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <span>Vehicles Parked Here ({vehiclesParkedHere.length})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {vehiclesParkedHere.map((veh) => (
                            <div
                              key={veh.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-[11px] border border-slate-200 dark:border-slate-700/60"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  {veh.plateNumber}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                                  {veh.driverName}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                {new Date(veh.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Capacity changes take effect immediately across all checkpoint displays.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
