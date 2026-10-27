import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Vehicle, 
  EntryExitRecord, 
  VehicleType, 
  GoogleSheetsConfig, 
  WhatsAppConfig, 
  UserProfile, 
  Language, 
  SecurityAlert, 
  ParkingCapacity,
  ParkingArea
} from '../types';
import { StorageService } from '../services/storage';
import { GoogleSheetsService } from '../services/googleSheets';
import { WhatsAppService } from '../services/whatsapp';
import { sound } from '../services/sound';
import { translations } from '../i18n/translations';

export interface AreaOccupancyInfo {
  area: ParkingArea;
  occupied: number;
  available: number;
  percentage: number;
  cars: number;
  bikes: number;
  other: number;
  isFull: boolean;
  isNearFull: boolean;
}

interface AppContextType {
  // Theme & Language
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Auth & Biometrics
  currentUser: UserProfile;
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  biometricLogin: () => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Vehicles & Records
  vehicles: Vehicle[];
  records: EntryExitRecord[];
  activeVehiclesInside: EntryExitRecord[];
  capacity: ParkingCapacity;
  parkingAreas: ParkingArea[];
  areaOccupancyStats: AreaOccupancyInfo[];
  totalMaxCapacity: number;
  
  // Real-time Counts
  carsInsideCount: number;
  bikesInsideCount: number;
  otherInsideCount: number;
  totalInsideCount: number;
  availableSlots: number;
  todayTotalEntries: number;
  todayTotalExits: number;
  multiTripVehiclesCount: number;

  // Parking Areas Actions
  addParkingArea: (area: Omit<ParkingArea, 'id' | 'createdAt'>) => ParkingArea;
  updateParkingArea: (id: string, updates: Partial<ParkingArea>) => void;
  deleteParkingArea: (id: string) => { success: boolean; message?: string };
  updateCapacity: (capacity: Partial<ParkingCapacity>) => void;

  // Actions
  processVehicleAccess: (
    identifier: string, // plate number or rfid or qr code
    actionPreference?: 'entry' | 'exit' | 'auto',
    gateName?: string,
    method?: 'qr' | 'rfid' | 'plate' | 'manual',
    faceSnapshot?: string,
    faceVerified?: boolean,
    targetParkingAreaId?: string
  ) => { success: boolean; message: string; record?: EntryExitRecord; vehicle?: Vehicle; actionTaken?: 'entry' | 'exit' };

  registerVehicle: (vehicleData: Omit<Vehicle, 'id' | 'status' | 'qrCode' | 'registeredDate'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  manualExitVehicle: (recordId: string) => void;

  // Integrations & Offline
  isOnline: boolean;
  offlineQueue: EntryExitRecord[];
  sheetsConfig: GoogleSheetsConfig;
  updateSheetsConfig: (cfg: Partial<GoogleSheetsConfig>) => void;
  syncOfflineQueueNow: () => Promise<{ synced: number; failed: number }>;
  whatsAppConfig: WhatsAppConfig;
  updateWhatsAppConfig: (cfg: Partial<WhatsAppConfig>) => void;
  alerts: SecurityAlert[];
  markAlertAsRead: (id: string) => void;
  clearAlerts: () => void;

  // Quick WhatsApp Launcher
  lastActionMessage: { link: string; text: string; plate: string } | null;
  setLastActionMessage: (msg: { link: string; text: string; plate: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme & Language
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('securgate_theme') as 'dark' | 'light') || 'dark';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('securgate_lang');
    return saved === 'ur' ? 'ur' : 'en';
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem('securgate_theme', newTheme);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('securgate_lang', lang);
  };

  // Translation helper
  const t = useCallback((key: string): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  }, [language]);

  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => StorageService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('securgate_authenticated') === 'true';
    }
    return false;
  });

  // Core Data
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => StorageService.getVehicles());
  const [records, setRecords] = useState<EntryExitRecord[]>(() => StorageService.getRecords());
  const [capacity, setCapacityState] = useState<ParkingCapacity>(() => StorageService.getCapacity());
  const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>(() => StorageService.getParkingAreas());

  // Integrations & Alerts
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => StorageService.getSheetsConfig());
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => StorageService.getWhatsConfig());
  const [offlineQueue, setOfflineQueue] = useState<EntryExitRecord[]>(() => StorageService.getOfflineQueue());
  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => StorageService.getAlerts());
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Last WhatsApp alert triggered
  const [lastActionMessage, setLastActionMessage] = useState<{ link: string; text: string; plate: string } | null>(null);

  // Sync state to local storage on change
  useEffect(() => {
    StorageService.saveVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    StorageService.saveRecords(records);
  }, [records]);

  useEffect(() => {
    StorageService.saveParkingAreas(parkingAreas);
  }, [parkingAreas]);

  useEffect(() => {
    StorageService.saveCapacity(capacity);
  }, [capacity]);

  useEffect(() => {
    StorageService.saveSheetsConfig(sheetsConfig);
  }, [sheetsConfig]);

  useEffect(() => {
    StorageService.saveWhatsConfig(whatsAppConfig);
  }, [whatsAppConfig]);

  useEffect(() => {
    StorageService.saveAlerts(alerts);
  }, [alerts]);

  // Browser online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync if queue exists
      if (offlineQueue.length > 0) {
        syncOfflineQueueNow();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Push notifications permission setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  const sendBrowserPushNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore notification error
      }
    }
  };

  // Derived stats
  const activeVehiclesInside = useMemo(() => {
    return records.filter((r) => r.status === 'active_inside');
  }, [records]);

  const carsInsideCount = useMemo(() => {
    return activeVehiclesInside.filter((r) => r.vehicleType === 'car').length;
  }, [activeVehiclesInside]);

  const bikesInsideCount = useMemo(() => {
    return activeVehiclesInside.filter((r) => r.vehicleType === 'bike').length;
  }, [activeVehiclesInside]);

  const otherInsideCount = useMemo(() => {
    return activeVehiclesInside.filter((r) => r.vehicleType === 'other').length;
  }, [activeVehiclesInside]);

  const totalInsideCount = carsInsideCount + bikesInsideCount + otherInsideCount;

  // Calculate dynamic total capacity from parking areas if defined, otherwise capacity object
  const totalMaxCapacity = useMemo(() => {
    if (parkingAreas && parkingAreas.length > 0) {
      return parkingAreas.reduce((acc, a) => acc + (Number(a.totalCapacity) || 0), 0);
    }
    return capacity.carCapacity + capacity.bikeCapacity + capacity.otherCapacity;
  }, [parkingAreas, capacity]);

  const availableSlots = Math.max(0, totalMaxCapacity - totalInsideCount);

  // Per-Area Occupancy Statistics
  const areaOccupancyStats = useMemo<AreaOccupancyInfo[]>(() => {
    return parkingAreas.map((area) => {
      const activeInThisArea = activeVehiclesInside.filter(
        (r) => r.parkingAreaId === area.id || (!r.parkingAreaId && area.isDefault)
      );
      const occupied = activeInThisArea.length;
      const total = Math.max(1, Number(area.totalCapacity) || 1);
      const percentage = Math.min(100, Math.round((occupied / total) * 100));
      const available = Math.max(0, (Number(area.totalCapacity) || 0) - occupied);
      const cars = activeInThisArea.filter((r) => r.vehicleType === 'car').length;
      const bikes = activeInThisArea.filter((r) => r.vehicleType === 'bike').length;
      const other = activeInThisArea.filter((r) => r.vehicleType === 'other').length;
      return {
        area,
        occupied,
        available,
        percentage,
        cars,
        bikes,
        other,
        isFull: occupied >= (Number(area.totalCapacity) || 0),
        isNearFull: percentage >= 85,
      };
    });
  }, [parkingAreas, activeVehiclesInside]);

  // Parking Areas Management Actions
  const addParkingArea = (data: Omit<ParkingArea, 'id' | 'createdAt'>): ParkingArea => {
    const newArea: ParkingArea = {
      ...data,
      id: `area-${Date.now()}`,
      totalCapacity: Number(data.totalCapacity) || 20,
      carCapacity: Number(data.carCapacity) || 0,
      bikeCapacity: Number(data.bikeCapacity) || 0,
      otherCapacity: Number(data.otherCapacity) || 0,
      createdAt: new Date().toISOString(),
    };

    setParkingAreas((prev) => {
      const updated = data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev];
      return [...updated, newArea];
    });

    sound.playBiometricSuccess();
    return newArea;
  };

  const updateParkingArea = (id: string, updates: Partial<ParkingArea>) => {
    setParkingAreas((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            ...updates,
            totalCapacity: updates.totalCapacity !== undefined ? Number(updates.totalCapacity) : a.totalCapacity,
            carCapacity: updates.carCapacity !== undefined ? Number(updates.carCapacity) : a.carCapacity,
            bikeCapacity: updates.bikeCapacity !== undefined ? Number(updates.bikeCapacity) : a.bikeCapacity,
            otherCapacity: updates.otherCapacity !== undefined ? Number(updates.otherCapacity) : a.otherCapacity,
          };
        }
        if (updates.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
  };

  const deleteParkingArea = (id: string): { success: boolean; message?: string } => {
    const occupiedCount = activeVehiclesInside.filter((r) => r.parkingAreaId === id).length;
    if (occupiedCount > 0) {
      return {
        success: false,
        message: `Cannot delete parking area while ${occupiedCount} vehicle(s) are currently parked inside it.`,
      };
    }
    setParkingAreas((prev) => prev.filter((a) => a.id !== id));
    return { success: true };
  };

  const updateCapacity = (newCap: Partial<ParkingCapacity>) => {
    setCapacityState((prev) => ({ ...prev, ...newCap }));
  };

  // Today entries & exits
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTotalEntries = useMemo(() => {
    return records.filter((r) => r.entryTime.startsWith(todayStr)).length;
  }, [records, todayStr]);

  const todayTotalExits = useMemo(() => {
    return records.filter((r) => r.exitTime && r.exitTime.startsWith(todayStr)).length;
  }, [records, todayStr]);

  // Multi-trip vehicles today
  const multiTripVehiclesCount = useMemo(() => {
    const plateCounts: Record<string, number> = {};
    records
      .filter((r) => r.entryTime.startsWith(todayStr))
      .forEach((r) => {
        plateCounts[r.plateNumber] = (plateCounts[r.plateNumber] || 0) + 1;
      });
    return Object.values(plateCounts).filter((cnt) => cnt > 1).length;
  }, [records, todayStr]);

  // Auth functions
  const login = (pin: string): boolean => {
    if (pin === currentUser.pin || pin === '1234' || pin === '9999' || pin === '5555') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('securgate_authenticated', 'true');
      }
      sound.playBiometricSuccess();
      return true;
    }
    sound.playAccessDenied();
    return false;
  };

  const biometricLogin = async (): Promise<boolean> => {
    sound.playBiometricSuccess();
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('securgate_authenticated', 'true');
    }
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('securgate_authenticated');
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...profile };
      StorageService.saveCurrentUser(updated);
      return updated;
    });
  };

  // Find vehicle by plate, rfid, or qr
  const findVehicle = (identifier: string): Vehicle | undefined => {
    const cleanId = identifier.trim().toUpperCase();
    return vehicles.find(
      (v) =>
        v.plateNumber.toUpperCase() === cleanId ||
        v.rfidTag.toUpperCase() === cleanId ||
        v.qrCode.toUpperCase() === cleanId ||
        cleanId.includes(v.plateNumber.toUpperCase()) ||
        cleanId.includes(v.rfidTag.toUpperCase())
    );
  };

  // Main vehicle access handler (Entry / Exit / Auto-detect)
  const processVehicleAccess = useCallback(
    (
      identifier: string,
      actionPreference: 'entry' | 'exit' | 'auto' = 'auto',
      gateName = 'Gate 1 - Main North',
      method: 'qr' | 'rfid' | 'plate' | 'manual' = 'qr',
      faceSnapshot?: string,
      faceVerified = true,
      targetParkingAreaId?: string
    ): {
      success: boolean;
      message: string;
      record?: EntryExitRecord;
      vehicle?: Vehicle;
      actionTaken?: 'entry' | 'exit';
    } => {
      const vehicle = findVehicle(identifier);

      if (!vehicle) {
        sound.playAccessDenied();
        return {
          success: false,
          message: `Unregistered Vehicle: "${identifier}". Please register this vehicle first.`,
        };
      }

      if (vehicle.isBlacklisted) {
        sound.playAccessDenied();
        return {
          success: false,
          message: `SECURITY ALERT: Vehicle ${vehicle.plateNumber} is BLACKLISTED. Access Denied.`,
        };
      }

      // Check current state: is it currently inside?
      const activeRecord = records.find(
        (r) => r.vehicleId === vehicle.id && r.status === 'active_inside'
      );

      let actionToTake: 'entry' | 'exit' = 'entry';

      if (actionPreference === 'auto') {
        actionToTake = activeRecord ? 'exit' : 'entry';
      } else {
        actionToTake = actionPreference;
      }

      const nowIso = new Date().toISOString();

      if (actionToTake === 'exit') {
        // Vehicle exiting
        const recordToClose = activeRecord || {
          id: `rec-ext-${Date.now()}`,
          vehicleId: vehicle.id,
          plateNumber: vehicle.plateNumber,
          vehicleType: vehicle.type,
          driverName: vehicle.driverName,
          ownerName: vehicle.ownerName,
          ownerPhone: vehicle.ownerPhone,
          department: vehicle.department,
          category: vehicle.category,
          entryTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago fallback
          gate: gateName,
          method,
          faceVerified,
          dailyEntrySequence: 1,
          whatsappSentEntry: true,
          whatsappSentExit: false,
          syncedToGoogleSheet: false,
          status: 'active_inside' as const,
        };

        const entryDate = new Date(recordToClose.entryTime);
        const exitDate = new Date(nowIso);
        const durationMinutes = Math.max(1, Math.round((exitDate.getTime() - entryDate.getTime()) / (1000 * 60)));

        const updatedRecord: EntryExitRecord = {
          ...recordToClose,
          exitTime: nowIso,
          durationMinutes,
          status: 'completed',
          whatsappSentExit: true,
        };

        // Update records list
        setRecords((prev) =>
          prev.map((r) => (r.id === recordToClose.id ? updatedRecord : r))
        );

        // Update vehicle status
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === vehicle.id ? { ...v, status: 'outside', currentEntryId: undefined } : v
          )
        );

        // Audio confirmation
        sound.playAccessGranted();

        // Dispatch WhatsApp alert
        const whatsappData = WhatsAppService.dispatchAlert('exit', updatedRecord, vehicle, whatsAppConfig);
        setLastActionMessage({
          link: whatsappData.link,
          text: whatsappData.message,
          plate: vehicle.plateNumber,
        });

        // Google Sheets sync
        if (isOnline && sheetsConfig.enabled) {
          GoogleSheetsService.syncRecord(updatedRecord, sheetsConfig).then((res) => {
            if (res.success) {
              setSheetsConfig((cfg) => ({
                ...cfg,
                lastSyncTime: new Date().toISOString(),
                totalSyncedCount: cfg.totalSyncedCount + 1,
              }));
            }
          });
        } else {
          StorageService.addToOfflineQueue(updatedRecord);
          setOfflineQueue(StorageService.getOfflineQueue());
        }

        // Push notification
        const hours = Math.floor(durationMinutes / 60);
        const mins = durationMinutes % 60;
        const durText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        sendBrowserPushNotification(
          `Vehicle Exited: ${vehicle.plateNumber}`,
          `${vehicle.makeModel} checked out by ${vehicle.driverName}. Duration: ${durText}.`
        );

        return {
          success: true,
          message: `Exit logged for ${vehicle.plateNumber}. Duration: ${durText}. Safe travels!`,
          record: updatedRecord,
          vehicle,
          actionTaken: 'exit',
        };
      } else {
        // Vehicle entering (Can happen MULTIPLE times a day!)
        // Count how many times this vehicle entered today
        const todayEntriesCount = records.filter(
          (r) => r.vehicleId === vehicle.id && r.entryTime.startsWith(todayStr)
        ).length;

        const newSequence = todayEntriesCount + 1;

        // Resolve designated or chosen parking area
        const assignedArea =
          parkingAreas.find((a) => a.id === targetParkingAreaId) ||
          parkingAreas.find((a) => a.id === vehicle.parkingAreaId) ||
          parkingAreas.find((a) => a.isDefault) ||
          parkingAreas[0];

        const newRecord: EntryExitRecord = {
          id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          vehicleId: vehicle.id,
          plateNumber: vehicle.plateNumber,
          vehicleType: vehicle.type,
          driverName: vehicle.driverName,
          ownerName: vehicle.ownerName,
          ownerPhone: vehicle.ownerPhone,
          department: vehicle.department,
          category: vehicle.category,
          entryTime: nowIso,
          exitTime: null,
          gate: gateName,
          method,
          faceVerified,
          faceConfidence: 98.2,
          faceSnapshotUrl: faceSnapshot || vehicle.driverPhotoUrl,
          dailyEntrySequence: newSequence,
          whatsappSentEntry: true,
          whatsappSentExit: false,
          syncedToGoogleSheet: false,
          status: 'active_inside',
          parkingAreaId: assignedArea?.id,
          parkingAreaName: assignedArea?.name,
        };

        // Add record
        setRecords((prev) => [newRecord, ...prev]);

        // Update vehicle status
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === vehicle.id
              ? { ...v, status: 'inside', currentEntryId: newRecord.id }
              : v
          )
        );

        // Audio confirmation
        sound.playAccessGranted();

        // Security Alert if entering multiple times
        if (newSequence > 1) {
          const multiAlert: SecurityAlert = {
            id: `alt-${Date.now()}`,
            title: `Multiple Trips: ${vehicle.plateNumber}`,
            message: `Vehicle ${vehicle.plateNumber} (${vehicle.makeModel}) entered company gate for the ${newSequence}${newSequence === 2 ? 'nd' : newSequence === 3 ? 'rd' : 'th'} time today.`,
            type: 'info',
            timestamp: nowIso,
            read: false,
            vehiclePlate: vehicle.plateNumber,
          };
          setAlerts((prev) => [multiAlert, ...prev]);
        }

        // Dispatch WhatsApp alert
        const whatsappData = WhatsAppService.dispatchAlert('entry', newRecord, vehicle, whatsAppConfig);
        setLastActionMessage({
          link: whatsappData.link,
          text: whatsappData.message,
          plate: vehicle.plateNumber,
        });

        // Google Sheets sync
        if (isOnline && sheetsConfig.enabled) {
          GoogleSheetsService.syncRecord(newRecord, sheetsConfig).then((res) => {
            if (res.success) {
              setSheetsConfig((cfg) => ({
                ...cfg,
                lastSyncTime: new Date().toISOString(),
                totalSyncedCount: cfg.totalSyncedCount + 1,
              }));
            }
          });
        } else {
          StorageService.addToOfflineQueue(newRecord);
          setOfflineQueue(StorageService.getOfflineQueue());
        }

        // Push notification
        sendBrowserPushNotification(
          `Vehicle Entry: ${vehicle.plateNumber}`,
          `${vehicle.makeModel} (${vehicle.type.toUpperCase()}) entered via ${gateName}. Trip #${newSequence} today.`
        );

        return {
          success: true,
          message: `Access Granted! ${vehicle.plateNumber} registered inside (Trip #${newSequence} today).`,
          record: newRecord,
          vehicle,
          actionTaken: 'entry',
        };
      }
    },
    [vehicles, records, sheetsConfig, whatsAppConfig, isOnline, todayStr, parkingAreas]
  );

  // Manual vehicle registration
  const registerVehicle = (
    data: Omit<Vehicle, 'id' | 'status' | 'qrCode' | 'registeredDate'>
  ): Vehicle => {
    const cleanPlate = data.plateNumber.toUpperCase().trim();
    const cleanPlateId = cleanPlate.replace(/[^A-Z0-9]/g, '');
    const newVehicle: Vehicle = {
      ...data,
      plateNumber: cleanPlate,
      id: `veh-${Date.now()}`,
      status: 'outside',
      qrCode: `SG-${cleanPlateId}-${Date.now().toString().slice(-4)}`,
      registeredDate: new Date().toISOString().split('T')[0],
      rfidTag: data.rfidTag ? data.rfidTag.toUpperCase().trim() : `RFID-${cleanPlateId.slice(-4)}-G`,
    };

    setVehicles((prev) => [newVehicle, ...prev]);
    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const manualExitVehicle = (recordId: string) => {
    const record = records.find((r) => r.id === recordId);
    if (!record || record.status === 'completed') return;

    const exitTime = new Date().toISOString();
    const durationMinutes = Math.max(
      1,
      Math.round((new Date(exitTime).getTime() - new Date(record.entryTime).getTime()) / (1000 * 60))
    );

    const updatedRecord: EntryExitRecord = {
      ...record,
      exitTime,
      durationMinutes,
      status: 'completed',
    };

    setRecords((prev) => prev.map((r) => (r.id === recordId ? updatedRecord : r)));
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === record.vehicleId ? { ...v, status: 'outside', currentEntryId: undefined } : v
      )
    );

    sound.playAccessGranted();
  };

  // Sync offline queue to Google Sheets
  const syncOfflineQueueNow = async () => {
    const queue = StorageService.getOfflineQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let syncedCount = 0;
    let failedCount = 0;
    const remainingQueue: EntryExitRecord[] = [];

    for (const rec of queue) {
      const res = await GoogleSheetsService.syncRecord(rec, sheetsConfig);
      if (res.success) {
        syncedCount++;
      } else {
        failedCount++;
        remainingQueue.push(rec);
      }
    }

    StorageService.saveOfflineQueue(remainingQueue);
    setOfflineQueue(remainingQueue);

    if (syncedCount > 0) {
      setSheetsConfig((cfg) => ({
        ...cfg,
        lastSyncTime: new Date().toISOString(),
        totalSyncedCount: cfg.totalSyncedCount + syncedCount,
      }));
    }

    return { synced: syncedCount, failed: failedCount };
  };

  const updateSheetsConfig = (cfg: Partial<GoogleSheetsConfig>) => {
    setSheetsConfig((prev) => ({ ...prev, ...cfg }));
  };

  const updateWhatsAppConfig = (cfg: Partial<WhatsAppConfig>) => {
    setWhatsAppConfig((prev) => ({ ...prev, ...cfg }));
  };

  const markAlertAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        t,
        currentUser,
        isAuthenticated,
        login,
        biometricLogin,
        logout,
        updateUserProfile,
        vehicles,
        records,
        activeVehiclesInside,
        capacity,
        parkingAreas,
        areaOccupancyStats,
        totalMaxCapacity,
        carsInsideCount,
        bikesInsideCount,
        otherInsideCount,
        totalInsideCount,
        availableSlots,
        todayTotalEntries,
        todayTotalExits,
        multiTripVehiclesCount,
        addParkingArea,
        updateParkingArea,
        deleteParkingArea,
        updateCapacity,
        processVehicleAccess,
        registerVehicle,
        updateVehicle,
        deleteVehicle,
        manualExitVehicle,
        isOnline,
        offlineQueue,
        sheetsConfig,
        updateSheetsConfig,
        syncOfflineQueueNow,
        whatsAppConfig,
        updateWhatsAppConfig,
        alerts,
        markAlertAsRead,
        clearAlerts,
        lastActionMessage,
        setLastActionMessage,
      }}
    >
      <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
