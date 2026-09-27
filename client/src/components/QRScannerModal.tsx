import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, ScanLine, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (otp: string) => void;
  targetOtp?: string; // Optional driver OTP for demo/simulate mode
  tripId: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  targetOtp,
  tripId,
}) => {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedSuccess(false);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);

      // Check if BarcodeDetector is available natively
      if ('BarcodeDetector' in window) {
        try {
          detectorRef.current = new (window as any).BarcodeDetector({
            formats: ['qr_code'],
          });
        } catch (e) {
          console.warn('BarcodeDetector format qr_code not supported:', e);
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setHasCamera(true);
        startDetectionLoop();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasCamera(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. You can use 1-Tap Simulation or enter the code manually.'
          : 'Camera device unavailable on this machine.'
      );
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleDecodedText = (text: string) => {
    let extractedOtp = text.trim();
    try {
      const parsed = JSON.parse(text);
      if (parsed.otp) {
        extractedOtp = String(parsed.otp);
      }
    } catch {
      // Raw OTP or text
    }

    // Match 4-6 digit numeric code
    const otpMatch = extractedOtp.match(/\b\d{4,6}\b/);
    const finalOtp = otpMatch ? otpMatch[0] : extractedOtp;

    setScannedSuccess(true);
    stopCamera();

    setTimeout(() => {
      onScan(finalOtp);
      onClose();
    }, 600);
  };

  const startDetectionLoop = () => {
    const detect = async () => {
      if (!detectorRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes && barcodes.length > 0) {
          const rawVal = barcodes[0].rawValue;
          if (rawVal) {
            handleDecodedText(rawVal);
            return;
          }
        }
      } catch (err) {
        // detection frame error
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
  };

  const handleSimulateScan = () => {
    if (targetOtp) {
      handleDecodedText(targetOtp);
    } else {
      // Sample OTP format
      handleDecodedText('4821');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#143D32]/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#143D32] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#143D32]">Scan Driver's QR Code</h3>
              <p className="text-[11px] text-slate-500">Align QR within frame to verify pickup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-[#0B1E19] aspect-square flex items-center justify-center overflow-hidden">
          {scannedSuccess ? (
            <div className="text-center text-white space-y-2 z-10">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <p className="text-sm font-semibold">QR Code Recognized!</p>
              <p className="text-xs text-slate-300">Verifying pickup OTP with server...</p>
            </div>
          ) : hasCamera ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Scan Overlay Rect */}
              <div className="absolute inset-12 border-2 border-emerald-400 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col justify-between p-2">
                <div className="w-full h-0.5 bg-emerald-400 animate-pulse shadow-md" />
                <div className="text-center text-[10px] text-emerald-300 font-mono">
                  Point camera at Driver's screen
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-slate-300 space-y-3">
              <ScanLine className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {cameraError || 'Camera stream not initialized on this browser.'}
              </p>
              <p className="text-[11px] text-slate-400">
                You can simulate camera recognition with one click below:
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 text-center">
          <button
            onClick={handleSimulateScan}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate QR Scan (Instant Verification)</span>
          </button>
          <p className="text-[10px] text-slate-400 font-mono">
            Trip ID: {tripId.slice(-6)} · Encrypted OTP Verification
          </p>
        </div>
      </div>
    </div>
  );
};

