import { EntryExitRecord, GoogleSheetsConfig } from '../types';

export const GoogleSheetsService = {
  // Sync a single record to Google Sheets webhook
  async syncRecord(record: EntryExitRecord, config: GoogleSheetsConfig): Promise<{ success: boolean; message: string }> {
    if (!config.enabled || !config.webhookUrl) {
      return { success: false, message: 'Google Sheets sync is disabled or Webhook URL is missing.' };
    }

    const payload = {
      action: record.exitTime ? 'EXIT' : 'ENTRY',
      id: record.id,
      plateNumber: record.plateNumber,
      vehicleType: record.vehicleType.toUpperCase(),
      driverName: record.driverName,
      ownerName: record.ownerName,
      ownerPhone: record.ownerPhone,
      department: record.department,
      gate: record.gate,
      entryTime: record.entryTime,
      exitTime: record.exitTime || 'STILL_INSIDE',
      durationMinutes: record.durationMinutes || 0,
      dailyEntrySequence: record.dailyEntrySequence,
      method: record.method,
      faceVerified: record.faceVerified ? 'YES' : 'NO',
      status: record.status,
      timestamp: new Date().toISOString(),
    };

    try {
      // Use standard fetch. When sending to Google Apps Script Web App, mode: 'no-cors' or normal POST
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors', // Avoids cross-origin blocking on Apps Script redirects
      });

      return { success: true, message: 'Synced to Google Sheets successfully.' };
    } catch (err) {
      console.warn('Google Sheets sync error (saved to offline queue):', err);
      return { success: false, message: 'Network offline. Saved to offline sync queue.' };
    }
  },

  // Export records to CSV for instant manual Google Sheets upload
  exportToCsv(records: EntryExitRecord[]): string {
    const headers = [
      'Record ID',
      'Plate Number',
      'Vehicle Type',
      'Driver Name',
      'Owner Name',
      'Owner Phone',
      'Department',
      'Entry Time (UTC)',
      'Exit Time (UTC)',
      'Duration (Minutes)',
      'Trips Today',
      'Gate',
      'Method',
      'Face Biometric Verified',
      'Status',
    ];

    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.plateNumber}"`,
      `"${r.vehicleType.toUpperCase()}"`,
      `"${r.driverName}"`,
      `"${r.ownerName}"`,
      `"${r.ownerPhone}"`,
      `"${r.department}"`,
      `"${r.entryTime}"`,
      `"${r.exitTime || 'STILL_INSIDE'}"`,
      r.durationMinutes || 0,
      r.dailyEntrySequence,
      `"${r.gate}"`,
      `"${r.method}"`,
      r.faceVerified ? 'VERIFIED' : 'NOT_CHECKED',
      `"${r.status}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },

  downloadCsv(records: EntryExitRecord[], filename = 'SecurGate_Vehicle_Logs.csv') {
    const csvContent = this.exportToCsv(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Ready-to-use Google Apps Script code for users to copy-paste
  getAppsScriptTemplate(): string {
    return `// ==========================================
// SECUGATE PRO - GOOGLE SHEETS LIVE SYNC SCRIPT
// 1. Open your Google Sheet
// 2. Click Extensions > Apps Script
// 3. Paste this code and click Deploy > New Deployment
// 4. Select "Web App", Execute as: "Me", Who has access: "Anyone"
// 5. Copy the generated Web App URL into SecurGate Pro!
// ==========================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add header if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Action", "Record ID", "Plate Number", "Type", "Driver Name", 
        "Owner Name", "Phone", "Department", "Gate", "Entry Time", 
        "Exit Time", "Duration (Mins)", "Trip # Today", "Face Verified", "Status", "Synced At"
      ]);
      sheet.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#e2e8f0");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    // Check if this record already exists (update exit if present)
    var foundRow = 0;
    var dataRange = sheet.getDataRange().getValues();
    for (var i = 1; i < dataRange.length; i++) {
      if (dataRange[i][1] === data.id) {
        foundRow = i + 1;
        break;
      }
    }
    
    if (foundRow > 0 && data.action === 'EXIT') {
      sheet.getRange(foundRow, 11).setValue(data.exitTime);
      sheet.getRange(foundRow, 12).setValue(data.durationMinutes);
      sheet.getRange(foundRow, 15).setValue(data.status);
    } else {
      sheet.appendRow([
        data.action,
        data.id,
        data.plateNumber,
        data.vehicleType,
        data.driverName,
        data.ownerName,
        data.ownerPhone,
        data.department,
        data.gate,
        data.entryTime,
        data.exitTime,
        data.durationMinutes,
        data.dailyEntrySequence,
        data.faceVerified,
        data.status,
        new Date().toISOString()
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  },
};
