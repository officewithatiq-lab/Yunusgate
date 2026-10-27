import { 
  Vehicle, 
  EntryExitRecord, 
  GoogleSheetsConfig, 
  WhatsAppConfig, 
  UserProfile, 
  SecurityAlert, 
  ParkingCapacity,
  ParkingArea
} from '../types';

const STORAGE_KEYS = {
  VEHICLES: 'securgate_vehicles_v2',
  RECORDS: 'securgate_records_v2',
  SHEETS_CONFIG: 'securgate_sheets_config_v2',
  WHATSAPP_CONFIG: 'securgate_whatsapp_config_v2',
  USER: 'securgate_current_user_v2',
  ALERTS: 'securgate_alerts_v2',
  OFFLINE_QUEUE: 'securgate_offline_queue_v2',
  PARKING_CAPACITY: 'securgate_parking_capacity_v2',
  PARKING_AREAS: 'securgate_parking_areas_v2',
  THEME: 'securgate_theme',
  LANG: 'securgate_lang',
};

// Realistic Seed Vehicles
const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    plateNumber: 'LEA-24-9021',
    type: 'car',
    makeModel: 'Honda Civic RS Turbo',
    color: 'Sonic Grey',
    ownerName: 'Tariq Mehmood',
    ownerPhone: '+923008451234',
    driverName: 'Muhammad Tariq',
    department: 'Executive Management',
    category: 'executive',
    rfidTag: 'RFID-9021-X',
    qrCode: 'SG-LEA249021-9021',
    registeredDate: '2026-01-10',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'inside',
    currentEntryId: 'rec-001-3',
    parkingAreaId: 'area-001',
    parkingAreaName: 'Executive North Ground',
  },
  {
    id: 'veh-002',
    plateNumber: 'ICT-22-3810',
    type: 'car',
    makeModel: 'Toyota Corolla Altis',
    color: 'Pearl White',
    ownerName: 'Sara Ahmed',
    ownerPhone: '+923214567890',
    driverName: 'Sara Ahmed',
    department: 'Finance & Accounts',
    category: 'employee',
    rfidTag: 'RFID-3810-F',
    qrCode: 'SG-ICT223810-3810',
    registeredDate: '2026-02-14',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'inside',
    currentEntryId: 'rec-002-1',
    parkingAreaId: 'area-002',
    parkingAreaName: 'Underground Basement Level 1',
  },
  {
    id: 'veh-003',
    plateNumber: 'LER-23-1122',
    type: 'bike',
    makeModel: 'Yamaha YBR 125G',
    color: 'Vivid Red',
    ownerName: 'Hamza Bilal',
    ownerPhone: '+923335551234',
    driverName: 'Hamza Bilal',
    department: 'IT Infrastructure',
    category: 'employee',
    rfidTag: 'RFID-1122-B',
    qrCode: 'SG-LER231122-1122',
    registeredDate: '2026-03-01',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'inside',
    currentEntryId: 'rec-003-2',
    parkingAreaId: 'area-003',
    parkingAreaName: 'Two-Wheeler / Bike Bay',
  },
  {
    id: 'veh-004',
    plateNumber: 'LEK-21-9988',
    type: 'bike',
    makeModel: 'Honda CD 70 Dream',
    color: 'Black Metallic',
    ownerName: 'Rashid Khan',
    ownerPhone: '+923129876543',
    driverName: 'Rashid Khan',
    department: 'Field Logistics',
    category: 'delivery',
    rfidTag: 'RFID-9988-B',
    qrCode: 'SG-LEK219988-9988',
    registeredDate: '2026-01-20',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'outside',
    parkingAreaId: 'area-003',
    parkingAreaName: 'Two-Wheeler / Bike Bay',
  },
  {
    id: 'veh-005',
    plateNumber: 'LES-19-4500',
    type: 'other',
    makeModel: 'Toyota HiAce Staff Van (15-Seater)',
    color: 'Silver',
    ownerName: 'Apex Transport Fleet',
    ownerPhone: '+923017778899',
    driverName: 'Ghulam Rasool',
    department: 'Administration Transport',
    category: 'contractor',
    rfidTag: 'RFID-4500-T',
    qrCode: 'SG-LES194500-4500',
    registeredDate: '2025-11-15',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    status: 'inside',
    currentEntryId: 'rec-005-1',
    parkingAreaId: 'area-004',
    parkingAreaName: 'Visitor & Logistics Yard (South)',
  },
  {
    id: 'veh-006',
    plateNumber: 'KHI-20-7711',
    type: 'other',
    makeModel: 'FAW Carrier / Shehzore Logistics',
    color: 'White',
    ownerName: 'FastEx Courier Logistics',
    ownerPhone: '+923223334444',
    driverName: 'Waqas Ali',
    department: 'Incoming Shipments',
    category: 'delivery',
    rfidTag: 'RFID-7711-D',
    qrCode: 'SG-KHI207711-7711',
    registeredDate: '2026-04-05',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    status: 'outside',
    parkingAreaId: 'area-004',
    parkingAreaName: 'Visitor & Logistics Yard (South)',
  },
  {
    id: 'veh-007',
    plateNumber: 'MN-20-4100',
    type: 'car',
    makeModel: 'Suzuki Alto VXL',
    color: 'Cerulean Blue',
    ownerName: 'Dr. Ayesha Malik',
    ownerPhone: '+923348889900',
    driverName: 'Dr. Ayesha Malik',
    department: 'Medical Center',
    category: 'employee',
    rfidTag: 'RFID-4100-C',
    qrCode: 'SG-MN204100-4100',
    registeredDate: '2026-02-18',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'inside',
    currentEntryId: 'rec-007-1',
    parkingAreaId: 'area-002',
    parkingAreaName: 'Underground Basement Level 1',
  },
  {
    id: 'veh-008',
    plateNumber: 'ISB-23-0007',
    type: 'car',
    makeModel: 'Toyota Land Cruiser V8',
    color: 'Attitude Black',
    ownerName: 'Sheikh Imran (Managing Director)',
    ownerPhone: '+923000000007',
    driverName: 'Naveed Akhtar',
    department: 'Board of Directors',
    category: 'executive',
    rfidTag: 'RFID-0007-V',
    qrCode: 'SG-ISB230007-0007',
    registeredDate: '2026-01-01',
    driverPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'inside',
    currentEntryId: 'rec-008-2',
    parkingAreaId: 'area-001',
    parkingAreaName: 'Executive North Ground',
  },
];

// Helper to get today's date formatted
const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const INITIAL_RECORDS: EntryExitRecord[] = [
  // LEA-24-9021 multiple entries today (Trip 1)
  {
    id: 'rec-001-1',
    vehicleId: 'veh-001',
    plateNumber: 'LEA-24-9021',
    vehicleType: 'car',
    driverName: 'Muhammad Tariq',
    ownerName: 'Tariq Mehmood',
    ownerPhone: '+923008451234',
    department: 'Executive Management',
    category: 'executive',
    entryTime: `${getTodayDateStr()}T08:15:00.000Z`,
    exitTime: `${getTodayDateStr()}T11:45:00.000Z`,
    durationMinutes: 210,
    gate: 'Gate 1 - Main North',
    method: 'rfid',
    faceVerified: true,
    faceConfidence: 98.4,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 1,
    notes: 'Morning executive arrival',
    whatsappSentEntry: true,
    whatsappSentExit: true,
    syncedToGoogleSheet: true,
    syncedAt: `${getTodayDateStr()}T08:15:05.000Z`,
    status: 'completed',
  },
  // LEA-24-9021 multiple entries today (Trip 2)
  {
    id: 'rec-001-2',
    vehicleId: 'veh-001',
    plateNumber: 'LEA-24-9021',
    vehicleType: 'car',
    driverName: 'Muhammad Tariq',
    ownerName: 'Tariq Mehmood',
    ownerPhone: '+923008451234',
    department: 'Executive Management',
    category: 'executive',
    entryTime: `${getTodayDateStr()}T13:10:00.000Z`,
    exitTime: `${getTodayDateStr()}T15:20:00.000Z`,
    durationMinutes: 130,
    gate: 'Gate 1 - Main North',
    method: 'qr',
    faceVerified: true,
    faceConfidence: 99.1,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 2,
    notes: 'Returned from client lunch',
    whatsappSentEntry: true,
    whatsappSentExit: true,
    syncedToGoogleSheet: true,
    syncedAt: `${getTodayDateStr()}T13:10:04.000Z`,
    status: 'completed',
  },
  // LEA-24-9021 multiple entries today (Trip 3 - Currently Inside!)
  {
    id: 'rec-001-3',
    vehicleId: 'veh-001',
    plateNumber: 'LEA-24-9021',
    vehicleType: 'car',
    driverName: 'Muhammad Tariq',
    ownerName: 'Tariq Mehmood',
    ownerPhone: '+923008451234',
    department: 'Executive Management',
    category: 'executive',
    entryTime: `${getTodayDateStr()}T16:05:00.000Z`,
    exitTime: null,
    gate: 'Gate 1 - Main North',
    method: 'rfid',
    faceVerified: true,
    faceConfidence: 98.7,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 3,
    notes: 'Re-entry for evening executive session',
    whatsappSentEntry: true,
    whatsappSentExit: false,
    syncedToGoogleSheet: true,
    syncedAt: `${getTodayDateStr()}T16:05:03.000Z`,
    status: 'active_inside',
    parkingAreaId: 'area-001',
    parkingAreaName: 'Executive North Ground',
  },
  // ICT-22-3810 Currently Inside
  {
    id: 'rec-002-1',
    vehicleId: 'veh-002',
    plateNumber: 'ICT-22-3810',
    vehicleType: 'car',
    driverName: 'Sara Ahmed',
    ownerName: 'Sara Ahmed',
    ownerPhone: '+923214567890',
    department: 'Finance & Accounts',
    category: 'employee',
    entryTime: `${getTodayDateStr()}T08:45:00.000Z`,
    exitTime: null,
    gate: 'Gate 1 - Main North',
    method: 'qr',
    faceVerified: true,
    faceConfidence: 97.2,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 1,
    whatsappSentEntry: true,
    whatsappSentExit: false,
    syncedToGoogleSheet: true,
    syncedAt: `${getTodayDateStr()}T08:45:02.000Z`,
    status: 'active_inside',
    parkingAreaId: 'area-002',
    parkingAreaName: 'Underground Basement Level 1',
  },
  // Bike Hamza Bilal (Trip 1 earlier exited, Trip 2 currently inside)
  {
    id: 'rec-003-1',
    vehicleId: 'veh-003',
    plateNumber: 'LER-23-1122',
    vehicleType: 'bike',
    driverName: 'Hamza Bilal',
    ownerName: 'Hamza Bilal',
    ownerPhone: '+923335551234',
    department: 'IT Infrastructure',
    category: 'employee',
    entryTime: `${getTodayDateStr()}T09:00:00.000Z`,
    exitTime: `${getTodayDateStr()}T12:30:00.000Z`,
    durationMinutes: 210,
    gate: 'Gate 2 - Two Wheeler Lane',
    method: 'rfid',
    faceVerified: true,
    faceConfidence: 96.8,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 1,
    whatsappSentEntry: true,
    whatsappSentExit: true,
    syncedToGoogleSheet: true,
    status: 'completed',
  },
  {
    id: 'rec-003-2',
    vehicleId: 'veh-003',
    plateNumber: 'LER-23-1122',
    vehicleType: 'bike',
    driverName: 'Hamza Bilal',
    ownerName: 'Hamza Bilal',
    ownerPhone: '+923335551234',
    department: 'IT Infrastructure',
    category: 'employee',
    entryTime: `${getTodayDateStr()}T14:15:00.000Z`,
    exitTime: null,
    gate: 'Gate 2 - Two Wheeler Lane',
    method: 'rfid',
    faceVerified: true,
    faceConfidence: 98.1,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 2,
    whatsappSentEntry: true,
    whatsappSentExit: false,
    syncedToGoogleSheet: true,
    status: 'active_inside',
    parkingAreaId: 'area-003',
    parkingAreaName: 'Two-Wheeler / Bike Bay',
  },
  // Staff Van Currently Inside
  {
    id: 'rec-005-1',
    vehicleId: 'veh-005',
    plateNumber: 'LES-19-4500',
    vehicleType: 'other',
    driverName: 'Ghulam Rasool',
    ownerName: 'Apex Transport Fleet',
    ownerPhone: '+923017778899',
    department: 'Administration Transport',
    category: 'contractor',
    entryTime: `${getTodayDateStr()}T07:45:00.000Z`,
    exitTime: null,
    gate: 'Gate 3 - Commercial & Logistics',
    method: 'rfid',
    faceVerified: true,
    faceConfidence: 95.5,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 1,
    notes: 'Morning shift staff drop-off',
    whatsappSentEntry: true,
    whatsappSentExit: false,
    syncedToGoogleSheet: true,
    status: 'active_inside',
    parkingAreaId: 'area-004',
    parkingAreaName: 'Visitor & Logistics Yard (South)',
  },
  // MN-20-4100 Alto currently inside
  {
    id: 'rec-007-1',
    vehicleId: 'veh-007',
    plateNumber: 'MN-20-4100',
    vehicleType: 'car',
    driverName: 'Dr. Ayesha Malik',
    ownerName: 'Dr. Ayesha Malik',
    ownerPhone: '+923348889900',
    department: 'Medical Center',
    category: 'employee',
    entryTime: `${getTodayDateStr()}T09:30:00.000Z`,
    exitTime: null,
    gate: 'Gate 1 - Main North',
    method: 'plate',
    faceVerified: true,
    faceConfidence: 96.0,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 1,
    whatsappSentEntry: true,
    whatsappSentExit: false,
    syncedToGoogleSheet: true,
    status: 'active_inside',
    parkingAreaId: 'area-002',
    parkingAreaName: 'Underground Basement Level 1',
  },
  // ISB-23-0007 Land Cruiser currently inside (Trip 2)
  {
    id: 'rec-008-2',
    vehicleId: 'veh-008',
    plateNumber: 'ISB-23-0007',
    vehicleType: 'car',
    driverName: 'Naveed Akhtar',
    ownerName: 'Sheikh Imran (Managing Director)',
    ownerPhone: '+923000000007',
    department: 'Board of Directors',
    category: 'executive',
    entryTime: `${getTodayDateStr()}T15:45:00.000Z`,
    exitTime: null,
    gate: 'Gate 1 - Main North',
    method: 'rfid',
    faceVerified: true,
    faceConfidence: 99.4,
    faceSnapshotUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    dailyEntrySequence: 2,
    whatsappSentEntry: true,
    whatsappSentExit: false,
    syncedToGoogleSheet: true,
    status: 'active_inside',
    parkingAreaId: 'area-001',
    parkingAreaName: 'Executive North Ground',
  },
];

const INITIAL_CAPACITY: ParkingCapacity = {
  carCapacity: 70,
  bikeCapacity: 90,
  otherCapacity: 20,
};

const INITIAL_PARKING_AREAS: ParkingArea[] = [
  {
    id: 'area-001',
    name: 'Executive North Ground',
    nameUrdu: 'ایگزیکٹو نارتھ گراؤنڈ (زون اے)',
    code: 'EXEC-A1',
    totalCapacity: 35,
    carCapacity: 25,
    bikeCapacity: 8,
    otherCapacity: 2,
    description: 'VIP, Directors & Senior Executive bays near Main Building entrance',
    colorTag: 'emerald',
    isDefault: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'area-002',
    name: 'Underground Basement Level 1',
    nameUrdu: 'انڈر گراؤنڈ بیسمنٹ لیول ۱ (زون بی)',
    code: 'B1-STAFF',
    totalCapacity: 60,
    carCapacity: 35,
    bikeCapacity: 20,
    otherCapacity: 5,
    description: 'Shaded, secure parking for permanent company staff & employees',
    colorTag: 'blue',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'area-003',
    name: 'Two-Wheeler / Bike Bay',
    nameUrdu: 'موٹر سائیکل و ٹو وہیلر بے (زون سی)',
    code: 'BIKE-BAY',
    totalCapacity: 60,
    carCapacity: 0,
    bikeCapacity: 60,
    otherCapacity: 0,
    description: 'Covered canopy terminal for motorbikes, scooters & e-bikes',
    colorTag: 'amber',
    isDefault: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'area-004',
    name: 'Visitor & Logistics Yard (South)',
    nameUrdu: 'وزیٹر و لاجسٹکس یارڈ (زون ڈی)',
    code: 'VIS-LOG',
    totalCapacity: 25,
    carCapacity: 10,
    bikeCapacity: 5,
    otherCapacity: 10,
    description: 'Commercial delivery vans, contractor pickups, and registered visitor lot',
    colorTag: 'purple',
    isDefault: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const INITIAL_SHEETS_CONFIG: GoogleSheetsConfig = {
  enabled: true,
  webhookUrl: 'https://script.google.com/macros/s/AKfycbx_DEMO_SECURGATE_SYNC/exec',
  sheetName: 'Vehicle_Gate_Logs',
  autoSync: true,
  lastSyncTime: new Date().toISOString(),
  totalSyncedCount: 8,
};

const INITIAL_WHATSAPP_CONFIG: WhatsAppConfig = {
  enabled: true,
  autoAlertOnEntry: true,
  autoAlertOnExit: true,
  directWebLaunch: true,
  companyName: 'SecurGate Enterprise Facility',
};

const INITIAL_USER: UserProfile = {
  id: 'usr-guard-01',
  name: 'Officer Zafar Iqbal',
  email: 'security.gate1@enterprise.local',
  role: 'gate_supervisor',
  badgeNumber: 'SG-8842',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  pin: '1234',
  biometricRegistered: true,
};

export const StorageService = {
  getVehicles(): Vehicle[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VEHICLES;
    }
  },

  saveVehicles(vehicles: Vehicle[]) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  },

  getRecords(): EntryExitRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RECORDS;
    }
  },

  saveRecords(records: EntryExitRecord[]) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  getParkingAreas(): ParkingArea[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PARKING_AREAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARKING_AREAS, JSON.stringify(INITIAL_PARKING_AREAS));
      return INITIAL_PARKING_AREAS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return INITIAL_PARKING_AREAS;
    } catch {
      return INITIAL_PARKING_AREAS;
    }
  },

  saveParkingAreas(areas: ParkingArea[]) {
    localStorage.setItem(STORAGE_KEYS.PARKING_AREAS, JSON.stringify(areas));
  },

  getCapacity(): ParkingCapacity {
    const raw = localStorage.getItem(STORAGE_KEYS.PARKING_CAPACITY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARKING_CAPACITY, JSON.stringify(INITIAL_CAPACITY));
      return INITIAL_CAPACITY;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CAPACITY;
    }
  },

  saveCapacity(capacity: ParkingCapacity) {
    localStorage.setItem(STORAGE_KEYS.PARKING_CAPACITY, JSON.stringify(capacity));
  },

  getSheetsConfig(): GoogleSheetsConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(INITIAL_SHEETS_CONFIG));
      return INITIAL_SHEETS_CONFIG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SHEETS_CONFIG;
    }
  },

  saveSheetsConfig(config: GoogleSheetsConfig) {
    localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
  },

  getWhatsConfig(): WhatsAppConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.WHATSAPP_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WHATSAPP_CONFIG, JSON.stringify(INITIAL_WHATSAPP_CONFIG));
      return INITIAL_WHATSAPP_CONFIG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_WHATSAPP_CONFIG;
    }
  },

  saveWhatsConfig(config: WhatsAppConfig) {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_CONFIG, JSON.stringify(config));
  },

  getCurrentUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USER;
    }
  },

  saveCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getOfflineQueue(): EntryExitRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveOfflineQueue(queue: EntryExitRecord[]) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },

  addToOfflineQueue(record: EntryExitRecord) {
    const queue = this.getOfflineQueue();
    queue.push(record);
    this.saveOfflineQueue(queue);
  },

  clearOfflineQueue() {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  },

  getAlerts(): SecurityAlert[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!raw) {
      const initialAlerts: SecurityAlert[] = [
        {
          id: 'alt-01',
          title: 'Multi-Trip Activity Detected',
          message: 'Vehicle LEA-24-9021 has checked into company premises 3 times today.',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          vehiclePlate: 'LEA-24-9021',
        },
        {
          id: 'alt-02',
          title: 'Google Sheets Connected',
          message: 'Real-time sync webhook is operational. Logs sync automatically.',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: true,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(initialAlerts));
      return initialAlerts;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveAlerts(alerts: SecurityAlert[]) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },
};
