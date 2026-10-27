import { EntryExitRecord, Vehicle, WhatsAppConfig } from '../types';

export const WhatsAppService = {
  // Format an automated entry message
  generateEntryMessage(record: EntryExitRecord, vehicle?: Vehicle, companyName = 'SecurGate Enterprise'): string {
    const timeFormatted = new Date(record.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date(record.entryTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const vehicleDesc = vehicle ? `${vehicle.makeModel} (${vehicle.color})` : record.vehicleType.toUpperCase();

    return `🚨 *${companyName.toUpperCase()} - SECURITY GATE ALERT*

*VEHICLE ENTRY REGISTERED*
🚗 *Plate:* ${record.plateNumber}
🏷️ *Vehicle:* ${vehicleDesc}
👤 *Driver:* ${record.driverName}
🏢 *Owner:* ${record.ownerName}
📍 *Gate:* ${record.gate}
⏰ *Entry Time:* ${timeFormatted} (${dateFormatted})
🔁 *Today's Trip:* #${record.dailyEntrySequence}
📌 *Status:* Currently Inside Premises

_This is an automated access notification. If you did not authorize this vehicle entry, immediately notify Gate Security._`;
  },

  // Format an automated exit message
  generateExitMessage(record: EntryExitRecord, vehicle?: Vehicle, companyName = 'SecurGate Enterprise'): string {
    const exitTime = record.exitTime ? new Date(record.exitTime) : new Date();
    const timeFormatted = exitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = exitTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const vehicleDesc = vehicle ? `${vehicle.makeModel} (${vehicle.color})` : record.vehicleType.toUpperCase();

    const hours = Math.floor((record.durationMinutes || 0) / 60);
    const mins = (record.durationMinutes || 0) % 60;
    const durationStr = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

    return `✅ *${companyName.toUpperCase()} - SECURITY GATE ALERT*

*VEHICLE EXIT REGISTERED*
🚗 *Plate:* ${record.plateNumber}
🏷️ *Vehicle:* ${vehicleDesc}
👤 *Driver:* ${record.driverName}
🏢 *Owner:* ${record.ownerName}
📍 *Gate:* ${record.gate}
⏰ *Exit Time:* ${timeFormatted} (${dateFormatted})
⏳ *Stay Duration:* ${durationStr}
🔁 *Total Trips Today:* ${record.dailyEntrySequence}
📌 *Status:* Exited Company Premises

_Vehicle has safely checked out from premises. Thank you!_`;
  },

  // Sanitize phone number for WhatsApp international standard
  cleanPhoneNumber(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  },

  // Generate direct click-to-chat WhatsApp link
  createWhatsAppLink(phone: string, text: string): string {
    const cleanPhone = this.cleanPhoneNumber(phone);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  },

  // Dispatch alert
  dispatchAlert(
    type: 'entry' | 'exit',
    record: EntryExitRecord,
    vehicle?: Vehicle,
    config?: WhatsAppConfig
  ): { link: string; message: string; autoDispatched: boolean } {
    const message = type === 'entry' 
      ? this.generateEntryMessage(record, vehicle, config?.companyName)
      : this.generateExitMessage(record, vehicle, config?.companyName);

    const link = this.createWhatsAppLink(record.ownerPhone, message);

    return {
      link,
      message,
      autoDispatched: Boolean(config?.enabled),
    };
  },
};
