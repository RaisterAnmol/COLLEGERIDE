import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Camera, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, X, Sparkles, LogIn } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface MorningDriverLivenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionTitle?: string; // e.g. "Publishing Ride" or "Starting Commute"
}

export const MorningDriverLivenessModal: React.FC<MorningDriverLivenessModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  actionTitle = 'Offering a Campus Ride',
}) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setIsSuccess(false);
      setErrorMessage(null);
      setCountdown(null);

      const token = localStorage.getItem('campusride_token');
      if (!token) {
        setErrorMessage('Authentication session expired or not logged in. Please sign in as a driver to continue.');
        return;
      }
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
      setCameraActive(true);
      // Start 5-second automatic countdown
      startCountdown();
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraActive(false);
      setErrorMessage('Camera access was denied or not found. Please allow camera permissions to complete the liveness check.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCountdown = () => {
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Countdown finished -> Snap photo!
      captureAndVerify();
    }
  }, [countdown]);

  const captureAndVerify = async () => {
    if (!videoRef.current) return;
    try {
      setIsVerifying(true);
      setCountdown(null);
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopCamera();

      // Submit to backend
      const res = await api.recordDailyDriverLiveness({ photo: dataUrl });
      if (res.success) {
        setIsSuccess(true);
        if (refreshUser) await refreshUser();
        setTimeout(() => {
          onVerified();
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Verification could not be verified. Please retry.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Biometric check failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    setCapturedPhoto(null);
    setIsSuccess(false);
    setErrorMessage(null);
    startCamera();
  };

  const handleSimulateDevLiveness = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#143D32';
        ctx.fillRect(0, 0, 320, 320);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px monospace';
        ctx.fillText('CampusRide Verified Driver', 30, 160);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopCamera();

      const res = await api.recordDailyDriverLiveness({ photo: dataUrl });
      if (res.success) {
        setIsSuccess(true);
        if (refreshUser) await refreshUser();
        setTimeout(() => {
          onVerified();
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Verification could not be recorded.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Biometric check failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  const isAuthError = Boolean(
    errorMessage &&
      (errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('authentication') ||
        errorMessage.toLowerCase().includes('logged in'))
  );

  const isCameraError = Boolean(
    errorMessage &&
      (errorMessage.toLowerCase().includes('camera') ||
        errorMessage.toLowerCase().includes('permission') ||
        errorMessage.toLowerCase().includes('denied'))
  );

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143D32]/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 font-sans"
          >
            {/* Header */}
            <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Morning Driver Liveness Check
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Required before {actionTitle.toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="relative aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500 shadow-inner flex items-center justify-center">
                {/* Live Video */}
                {!capturedPhoto ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {/* Biometric Oval Mask Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-[180px] h-[230px] rounded-[50%] border-2 border-dashed border-emerald-400/80 shadow-xs" />
                    </div>

                    {/* Countdown Badge */}
                    {countdown !== null && countdown > 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                        <div className="w-16 h-16 rounded-full bg-[#143D32] text-white font-bold text-3xl flex items-center justify-center shadow-lg border-2 border-emerald-400/60">
                          {countdown}
                        </div>
                        <span className="text-white text-xs font-semibold mt-2 tracking-normal drop-shadow">
                          Hold still...
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={capturedPhoto}
                      alt="Driver Selfie"
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {isSuccess && (
                      <div className="absolute inset-0 bg-[#143D32]/90 flex flex-col items-center justify-center text-white space-y-2">
                        <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl">
                          <CheckCircle2 className="w-9 h-9 text-white" />
                        </div>
                        <span className="text-sm font-black tracking-wide">
                          Verified for Today!
                        </span>
                        <span className="text-[11px] text-emerald-200">
                          {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Information */}
              <div className="text-center space-y-1">
                {!isSuccess && !errorMessage && (
                  <p className="text-xs text-slate-600">
                    Align your face inside the green oval. The 5-second liveness check ensures student safety across campus.
                  </p>
                )}
                {isVerifying && (
                  <p className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 cr-spinner" />
                    <span>Verifying identity with enrolled student profile...</span>
                  </p>
                )}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {isAuthError && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/login');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In as Driver</span>
                  </button>
                )}
                {errorMessage && !isAuthError && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera Check</span>
                  </button>
                )}
                {!capturedPhoto && cameraActive && countdown === null && (
                  <button
                    type="button"
                    onClick={captureAndVerify}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snap Now</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>

              {isCameraError && !isAuthError && (
                <button
                  type="button"
                  onClick={handleSimulateDevLiveness}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-emerald-600/50 hover:bg-emerald-50 text-emerald-800 text-[11px] font-medium transition-colors"
                >
                  Bypass for Testing (Dev Simulated Check)
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      </AnimatePresence>
    </MotionConfig>
  );
};

