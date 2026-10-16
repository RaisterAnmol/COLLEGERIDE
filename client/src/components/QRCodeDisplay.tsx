// QR code display - prefers-reduced-motion compliant
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { RefreshCw, Copy, Check, ShieldCheck, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  backupCode?: string;
  title?: string;
  subtitle?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  backupCode,
  title = 'Pickup Verification QR',
  subtitle = 'Passenger scans this QR upon entering vehicle',
  onRegenerate,
  isRegenerating = false,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setDataUrl(url);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        setError('Failed to generate QR code');
      });
  }, [value]);

  const handleCopyCode = () => {
    if (!backupCode) return;
    navigator.clipboard.writeText(backupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm mx-auto text-center shadow-sm">
      <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#143D32] font-semibold mb-2">
        <ShieldCheck className="w-4 h-4" />
        {title}
      </div>
      <p className="text-xs text-slate-500 mb-4">{subtitle}</p>

      {/* QR Display Frame */}
      <div className="relative inline-block p-3 bg-white border border-slate-200 rounded-xl shadow-inner">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="CampusRide Verification QR Code"
            className="w-56 h-56 mx-auto rounded-lg"
          />
        ) : error ? (
          <div className="w-56 h-56 flex flex-col items-center justify-center text-xs text-red-500">
            <QrCode className="w-10 h-10 text-red-300 mb-2" />
            {error}
          </div>
        ) : (
          <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
            Generating secure QR...
          </div>
        )}
      </div>

      {/* Backup Numeric OTP */}
      {backupCode && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="block text-[11px] font-mono text-slate-500 font-medium">
            Backup 6-Digit Code
          </span>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="font-mono text-3xl font-bold tracking-widest text-slate-900 bg-slate-50 px-4 py-1 rounded-lg border border-slate-200">
              {backupCode}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy OTP"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'cr-spinner' : ''}`} />
          <span>Regenerate QR / Code</span>
        </button>
      )}
    </div>
  );
};

