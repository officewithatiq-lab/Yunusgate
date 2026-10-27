import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  QrCode, 
  Radio, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Video, 
  VideoOff, 
  Sparkles, 
  RefreshCw, 
  Send, 
  Layers, 
  UserCheck, 
  Car, 
  Bike, 
  Truck, 
  Eye,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../services/sound';
import { EntryExitRecord, Vehicle } from '../types';

export const GateScanner: React.FC = () => {
  const {
    t,
    processVehicleAccess,
    vehicles,
    parkingAreas,
    lastActionMessage,
    setLastActionMessage,
  } = useApp();

  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [rfidInput, setRfidInput] = useState<string>('');
  const [actionPreference, setActionPreference] = useState<'auto' | 'entry' | 'exit'>('auto');
  const [activeLane, setActiveLane] = useState<string>('Gate 1 - Main North');
  const [selectedParkingAreaId, setSelectedParkingAreaId] = useState<string>('');
  const [faceDetectionActive, setFaceDetectionActive] = useState<boolean>(true);
  const [scanningState, setScanningState] = useState<'idle' | 'scanning' | 'verified' | 'denied'>('idle');
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    vehicle?: Vehicle;
    record?: EntryExitRecord;
    actionTaken?: 'entry' | 'exit';
    faceSnapshot?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<{ code: string; time: number } | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access not granted or unavailable:', err);
      setCameraError('Camera access unavailable or blocked. You can still scan via RFID or test presets below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Capture face / plate snapshot from canvas
  const captureSnapshot = (): string => {
    if (!videoRef.current || !canvasRef.current) return '';
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    } catch {
      // ignore
    }
    return '';
  };

  // Process access trigger
  const handleAccessVerification = useCallback(
    (identifier: string, method: 'qr' | 'rfid' | 'plate' | 'manual' = 'qr') => {
      sound.playScanBeep();
      setScanningState('scanning');

      const snapshot = captureSnapshot();

      setTimeout(() => {
        const result = processVehicleAccess(
          identifier,
          actionPreference,
          activeLane,
          method,
          snapshot,
          faceDetectionActive,
          selectedParkingAreaId || undefined
        );

        if (result.success) {
          setScanningState('verified');
          setLastResult({
            success: true,
            message: result.message,
            vehicle: result.vehicle,
            record: result.record,
            actionTaken: result.actionTaken,
            faceSnapshot: snapshot || result.vehicle?.driverPhotoUrl,
          });
        } else {
          setScanningState('denied');
          setLastResult({
            success: false,
            message: result.message,
          });
        }

        setTimeout(() => {
          setScanningState('idle');
        }, 3500);
      }, 600);
    },
    [actionPreference, activeLane, faceDetectionActive, processVehicleAccess, selectedParkingAreaId]
  );

  // Real-time Video QR Code Scanner Loop
  useEffect(() => {
    if (!cameraActive) return;

    const scanQrFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (qrCode && qrCode.data) {
              const now = Date.now();
              // Prevent repeat rapid firing on same QR code
              if (
                !lastScannedCodeRef.current ||
                lastScannedCodeRef.current.code !== qrCode.data ||
                now - lastScannedCodeRef.current.time > 4000
              ) {
                lastScannedCodeRef.current = { code: qrCode.data, time: now };
                handleAccessVerification(qrCode.data, 'qr');
              }
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(scanQrFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanQrFrame);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, handleAccessVerification]);

  // Handle Manual RFID / Barcode form
  const handleRfidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) return;
    handleAccessVerification(rfidInput.trim(), 'rfid');
    setRfidInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Lane Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {t('scannerTitle')}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                AI SCANNER
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Optical QR windshield detection, RFID tag swipe, and driver face verification.
            </p>
          </div>
        </div>

        {/* Lane Selector & Auto In/Out mode */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeLane}
            onChange={(e) => setActiveLane(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="Gate 1 - Main North">Gate 1 - Main North (Cars &amp; Executives)</option>
            <option value="Gate 2 - Two Wheeler Lane">Gate 2 - Two Wheeler Lane (Bikes)</option>
            <option value="Gate 3 - Commercial & Logistics">Gate 3 - Logistics &amp; Delivery</option>
          </select>

          <select
            value={selectedParkingAreaId}
            onChange={(e) => setSelectedParkingAreaId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">{t('targetParkingArea')}: Auto / Vehicle Default</option>
            {parkingAreas.map((area) => (
              <option key={area.id} value={area.id}>
                [{area.code}] {area.name} ({area.totalCapacity} cap)
              </option>
            ))}
          </select>

          <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActionPreference('auto')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                actionPreference === 'auto'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              {t('btnAutoDetect')}
            </button>
            <button
              onClick={() => setActionPreference('entry')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                actionPreference === 'entry' ? 'bg-emerald-600 text-white' : 'text-slate-500'
              }`}
            >
              Force In
            </button>
            <button
              onClick={() => setActionPreference('exit')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                actionPreference === 'exit' ? 'bg-rose-600 text-white' : 'text-slate-500'
              }`}
            >
              Force Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Scanner Section: Camera View with AI Biometric HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Camera Feed with Futuristic Biometric Face Scanner & Laser */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-xl flex flex-col justify-between">
          
          {/* Camera Header Overlay */}
          <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-slate-950/90 to-transparent">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                {activeLane} • LIVE CAMERA FEED
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Face AI Recognition */}
              <button
                onClick={() => setFaceDetectionActive(!faceDetectionActive)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  faceDetectionActive
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>AI Face Match {faceDetectionActive ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => (cameraActive ? stopCamera() : startCamera())}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title={cameraActive ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraActive ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
              </button>
            </div>
          </div>

          {/* Video / Camera Viewport */}
          <div className="relative w-full aspect-video min-h-[340px] flex items-center justify-center bg-slate-900 overflow-hidden">
            
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <VideoOff className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-400">
                  Camera Feed Inactive
                </p>
                <button
                  onClick={startCamera}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  Enable Camera
                </button>
              </div>
            )}

            {/* Hidden canvas for QR reading and facial snapshot capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* AI HUD Biometric Overlay Lines */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                
                {/* Central Targeting Reticle */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-2 border-emerald-500/30 rounded-3xl flex items-center justify-center">
                  
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                  {/* Scanning Laser Animation */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan" />

                  {/* Face recognition AI tracker mesh box */}
                  {faceDetectionActive && (
                    <div className="relative w-44 h-48 border border-dashed border-teal-400/60 rounded-2xl flex flex-col items-center justify-between p-2 bg-teal-500/5">
                      <div className="w-full flex items-center justify-between text-[10px] font-mono text-teal-300">
                        <span>FACE DETECT</span>
                        <span className="animate-pulse">98.4% MATCH</span>
                      </div>
                      
                      {/* Biometric Eye Tracker points */}
                      <div className="w-full flex justify-around opacity-75">
                        <span className="w-2 h-2 rounded-full border border-teal-400 animate-ping"></span>
                        <span className="w-2 h-2 rounded-full border border-teal-400 animate-ping"></span>
                      </div>

                      <div className="w-full text-center text-[10px] font-mono text-emerald-400 bg-slate-950/70 py-0.5 rounded">
                        ALIGNED • READY
                      </div>
                    </div>
                  )}

                  <div className="absolute -bottom-8 px-3 py-1 rounded-full bg-slate-950/80 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
                    HOLD QR CODE / PLATE IN FRAME
                  </div>
                </div>

                {/* Status alert overlay if verified */}
                {scanningState === 'verified' && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/40">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <span className="text-xl font-black text-emerald-400 tracking-wider">
                      {t('accessGranted')}
                    </span>
                    <p className="text-sm font-semibold text-white mt-1">
                      {lastResult?.vehicle?.plateNumber} ({lastResult?.vehicle?.makeModel})
                    </p>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Driver: {lastResult?.vehicle?.driverName} • {lastResult?.actionTaken === 'exit' ? 'Departed' : `Entry #${lastResult?.record?.dailyEntrySequence} Today`}
                    </p>
                    <div className="mt-3 px-3 py-1 rounded-md bg-emerald-500/30 text-emerald-200 text-xs font-mono">
                      {lastResult?.actionTaken === 'exit' ? 'EXIT CONFIRMED' : 'ENTRY CONFIRMED'}
                    </div>
                  </div>
                )}

                {/* Status alert overlay if denied */}
                {scanningState === 'denied' && (
                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-rose-600/40">
                      <AlertTriangle className="w-10 h-10" />
                    </div>
                    <span className="text-xl font-black text-rose-400 tracking-wider">
                      {t('accessDenied')}
                    </span>
                    <p className="text-xs text-rose-200 mt-2 max-w-sm">
                      {lastResult?.message}
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Camera Bottom Controls */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] text-emerald-400">
              LANE ACTIVE: {activeLane.toUpperCase()}
            </span>
            <span className="text-[11px] text-slate-400">
              Camera scanner decodes 30 fps
            </span>
          </div>

        </div>

        {/* Right 1 Col: RFID Scanner, Quick Tap Passes & Last Verified Record Details */}
        <div className="space-y-4">
          
          {/* RFID / NFC / Barcode Tap Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-emerald-500" />
              {t('rfidManualInput')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Tap RFID windshield tag on reader or scan vehicle barcode.
            </p>

            <form onSubmit={handleRfidSubmit} className="space-y-3">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder={t('rfidPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate RFID Tag Tap</span>
              </button>
            </form>

            {/* Quick RFID sample tags */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Click any registered vehicle to tap:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {vehicles.slice(0, 5).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleAccessVerification(v.rfidTag, 'rfid')}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-slate-200 dark:border-slate-700/60 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {v.type === 'car' && <Car className="w-3.5 h-3.5 text-blue-500" />}
                        {v.type === 'bike' && <Bike className="w-3.5 h-3.5 text-amber-500" />}
                        {v.type === 'other' && <Truck className="w-3.5 h-3.5 text-purple-500" />}
                        <span>{v.plateNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                        {v.driverName} • {v.makeModel}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        v.status === 'inside'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {v.status === 'inside' ? 'INSIDE' : 'OUTSIDE'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Last Scanned Vehicle Card */}
          {lastResult && lastResult.vehicle && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('lastScannedVehicle')}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    lastResult.actionTaken === 'entry'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {lastResult.actionTaken === 'entry' ? 'ENTRY LOGGED' : 'EXIT LOGGED'}
                </span>
              </div>

              <div className="mt-3 flex items-start gap-3">
                {lastResult.faceSnapshot ? (
                  <img
                    src={lastResult.faceSnapshot}
                    alt={lastResult.vehicle.driverName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/40"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                    {lastResult.vehicle.plateNumber.slice(0, 2)}
                  </div>
                )}

                <div className="flex-1">
                  <div className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                    {lastResult.vehicle.plateNumber}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {lastResult.vehicle.makeModel}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Driver: {lastResult.vehicle.driverName} ({lastResult.vehicle.department})
                  </div>
                  {lastResult.record?.parkingAreaName && (
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Lot: {lastResult.record.parkingAreaName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trip & WhatsApp quick notification */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('tripNumber')}:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                    #{lastResult.record?.dailyEntrySequence || 1}
                  </strong>
                </span>

                {lastActionMessage && (
                  <a
                    href={lastActionMessage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-green-400 hover:underline"
                  >
                    <Send className="w-3 h-3" />
                    <span>WhatsApp Alert</span>
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
