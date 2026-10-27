export type VehicleType = 'car' | 'bike' | 'other';

export type VehicleCategory = 'employee' | 'executive' | 'visitor' | 'delivery' | 'contractor';

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  makeModel: string;
  color: string;
  ownerName: string;
  ownerPhone: string;
  driverName: string;
  department: string;
  category: VehicleCategory;
  rfidTag: string;
  qrCode: string;
  registeredDate: string;
  driverPhotoUrl?: string;
  status: 'inside' | 'outside';
  currentEntryId?: string;
  isBlacklisted?: boolean;
  parkingAreaId?: string;
  parkingAreaName?: string;
}

export interface EntryExitRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  driverName: string;
  ownerName: string;
  ownerPhone: string;
  department: string;
  category: VehicleCategory;
  entryTime: string; // ISO
  exitTime?: string | null; // ISO
  durationMinutes?: number;
  gate: string;
  method: 'qr' | 'rfid' | 'plate' | 'manual';
  faceVerified: boolean;
  faceConfidence?: number;
  faceSnapshotUrl?: string;
  dailyEntrySequence: number; // e.g. 1st entry today, 2nd, etc.
  notes?: string;
  whatsappSentEntry: boolean;
  whatsappSentExit: boolean;
  syncedToGoogleSheet: boolean;
  syncedAt?: string;
  status: 'active_inside' | 'completed';
  parkingAreaId?: string;
  parkingAreaName?: string;
}

export interface GoogleSheetsConfig {
  enabled: boolean;
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
  totalSyncedCount: number;
}

export interface WhatsAppConfig {
  enabled: boolean;
  autoAlertOnEntry: boolean;
  autoAlertOnExit: boolean;
  directWebLaunch: boolean;
  companyName: string;
}

export type UserRole = 'admin' | 'security_guard' | 'gate_supervisor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber: string;
  avatarUrl: string;
  pin: string;
  biometricRegistered: boolean;
}

export type Language = 'en' | 'ur';

export interface SecurityAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  timestamp: string;
  read: boolean;
  vehiclePlate?: string;
}

export interface ParkingCapacity {
  carCapacity: number;
  bikeCapacity: number;
  otherCapacity: number;
}

export interface ParkingArea {
  id: string;
  name: string;
  nameUrdu?: string;
  code: string; // e.g. "ZONE-A", "B1-EXEC", "LOT-NORTH"
  totalCapacity: number;
  carCapacity?: number;
  bikeCapacity?: number;
  otherCapacity?: number;
  description?: string;
  colorTag?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'purple' | 'rose' | 'slate';
  isDefault?: boolean;
  createdAt?: string;
}
