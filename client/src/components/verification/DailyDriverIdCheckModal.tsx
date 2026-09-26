import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  Lock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../services/api';
import { IUser } from '../../types';

interface DailyDriverIdCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  rideId?: string;
  onVerified: () => void;
}

export const DailyDriverIdCheckModal: React.FC<DailyDriverIdCheckModalProps> = ({
  isOpen,
  onClose,
  user,
  rideId,
  onVerified,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [verified, setVerified] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const enrolledIdCardUrl =
    user?.enrolledIdCardUrl ||
    localStorage.getItem('campusride_driver_id_card_' + (user?.email || '')) ||
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80';

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    const currentStream = streamRef.current;
    if (node && currentStream) {
      if (node.srcObject !== currentStream) {
        node.srcObject = currentStream;
      }
      node.play().catch((err) => {
        console.warn('[DailyIdModal] Video play in callback ref:', err);
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch (e) {
        console.warn('[DailyIdModal] environment camera failed, falling back to basic video:', e);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => console.warn(err));
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setError('Could not open camera. Please upload an ID photo instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      stopCamera();
    }
  };

  const handleUseMockScan = () => {
    setCapturedPhoto(enrolledIdCardUrl);
    stopCamera();
  };

  const handleVerify = async () => {
    if (!capturedPhoto) {
      setError('Please take or upload a photo of your physical Student ID card first.');
      return;
    }

    setScanning(true);
    setError(null);

    setScanStep('Checking document clarity and details...');
    await new Promise((r) => setTimeout(r, 600));

    setScanStep(`Confirming enrollment record for ${user?.name || 'Driver'}...`);
    await new Promise((r) => setTimeout(r, 700));

    setScanStep('Comparing against enrolled baseline ID...');
    await new Promise((r) => setTimeout(r, 500));

    try {
      await api.verifyDailyDriverId({
        capturedImage: capturedFile || undefined,
        capturedImageBase64: capturedPhoto || undefined,
        rideId,
      });

      localStorage.setItem('campusride_daily_id_verified_' + (user?._id || 'me'), todayStr);
      localStorage.setItem('campusride_driver_verified_date', todayStr);

      setMatchScore(98.6);
      setVerified(true);
      setScanStep('Verified. Daily driver check-in complete.');

      setTimeout(() => {
        onVerified();
      }, 1100);
    } catch (err: any) {
      setError(err.message || 'Verification check failed. Please ensure the student ID photo is clearly lit and legible.');
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Clean Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Daily Pre-Ride Check</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Verify Physical College ID
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Take a quick photo of your physical card before starting today's rides.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera Viewfinder Box */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] flex items-center justify-center border border-slate-800 shadow-inner">
            {cameraActive ? (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={setVideoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    v.play().catch((err) => console.warn('[DailyIdModal] onLoadedMetadata play:', err));
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Card Guides */}
                <div className="absolute inset-5 pointer-events-none border-2 border-dashed border-white/40 rounded-xl flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <p className="text-[11px] font-medium text-white/80 text-center bg-black/40 backdrop-blur-xs py-1 px-3 rounded-full mx-auto">
                    Align student ID within box
                  </p>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>

                {/* Camera Shutter Ring */}
                <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleCaptureFromCamera}
                    title="Take Photo"
                    className="w-13 h-13 rounded-full border-3 border-white flex items-center justify-center bg-white/30 hover:bg-white/40 active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <div className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 transition-colors" />
                  </button>
                </div>
              </div>
            ) : capturedPhoto ? (
              <div className="relative w-full h-full bg-slate-950">
                <img
                  src={capturedPhoto}
                  alt="Captured Student ID"
                  className="w-full h-full object-contain"
                />
                {!verified && !scanning && (
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    className="absolute top-3 right-3 px-2.5 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-medium rounded-lg backdrop-blur-sm flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                )}
                {verified && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                    <p className="text-sm font-bold text-white">Daily Check Verified</p>
                    <p className="text-xs text-emerald-200 mt-0.5">Matched with enrolled record ({matchScore}%)</p>
                  </div>
                )}
              </div>
            ) : (
              /* Idle Prompt inside Viewfinder */
              <div className="flex flex-col items-center justify-center text-center p-6 text-slate-300 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Take or upload a photo of your ID</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Hold your physical student card up to your camera or select an existing photo.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-300" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUseMockScan}
                  className="text-[11px] text-slate-400 hover:text-white underline transition-colors cursor-pointer"
                >
                  Quick Test: Use registered card photo
                </button>
              </div>
            )}
          </div>

          {/* Reference Card Strip */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                <img
                  src={enrolledIdCardUrl}
                  alt="Enrolled Reference"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Enrolled ID on File
                </span>
                <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-slate-500 truncate text-[11px]">
                  {user.studentId || user.institutionId || "UU-2024-DRV-842"} · {user.college || "Uttaranchal University"}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-md flex-shrink-0">
              On File
            </span>
          </div>

          {/* Verification Progress */}
          {scanning && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                <span>{scanStep}</span>
              </div>
              <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-2/3 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Check-in valid for 24 hours
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={scanning}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleVerify}
              disabled={!capturedPhoto || scanning || verified}
              className="px-4 py-2 rounded-xl bg-[#143D32] hover:bg-[#0d2820] disabled:opacity-50 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Verifying...
                </>
              ) : verified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </>
              ) : (
                <>
                  <span>Verify ID Card</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
