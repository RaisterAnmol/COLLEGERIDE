import React, { useEffect } from 'react';
import { X, ShieldCheck, MapPin, Clock, Car } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { IUser, IRide } from '../types';

interface BoardingPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  ride: IRide | null;
  tripId: string;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({
  isOpen,
  onClose,
  user,
  ride,
  tripId,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const qrPayload = JSON.stringify({
    type: 'CAMPUSRIDE_BOARDING_PASS',
    tripId,
    passengerId: user._id,
    passengerName: user.name,
    college: user.college,
    timestamp: Date.now(),
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="boarding-pass-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Pass Header */}
        <div className="bg-[#143D32] text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Student Pass
            </div>
            <h3 id="boarding-pass-title" className="text-lg font-bold mt-1 text-white">Digital Boarding Pass</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close boarding pass"
            className="p-1 rounded-lg hover:bg-black/20 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student & Ride Info */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={
                user.avatarURL ||
                '/test_uploads/profile_photo.jpg'
              }
              alt={user.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
            />
            <div>
              <h4 className="font-semibold text-sm text-slate-900">{user.name}</h4>
              <p className="text-xs text-slate-500">{user.college} · Year {user.year}</p>
              <span className="inline-block mt-0.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Verified University ID
              </span>
            </div>
          </div>

          {ride && (
            <div className="text-xs space-y-1 pt-2 border-t border-slate-100 text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{ride.origin?.text} → {ride.destination?.text}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3 text-emerald-600" />
                  Cost: {(ride as any)?.pricePerSeat ? `₹${(ride as any).pricePerSeat}` : '₹40 fuel split'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pass QR */}
        <div className="p-5 text-center">
          <QRCodeDisplay
            value={qrPayload}
            title="Passenger Boarding QR"
            subtitle="Show to your driver to confirm boarding"
          />
        </div>
      </div>
    </div>
  );
};
