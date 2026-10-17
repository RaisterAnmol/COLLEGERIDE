import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Car, 
  CalendarX2, 
  BellOff, 
  Search, 
  PlusCircle, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export type EmptyStateVariant = 'no-rides' | 'no-bookings' | 'no-notifications' | 'no-requests' | 'generic';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'generic',
  title,
  description,
  actionText,
  actionLink,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  // Preset defaults per variant
  const getPreset = () => {
    switch (variant) {
      case 'no-rides':
        return {
          icon: <Compass className="w-8 h-8 text-route" />,
          title: title || 'No verified rides on this corridor yet',
          desc:
            description ||
            'There are no student commutes currently matching your specific filters or pickup time. Try expanding your corridor radius or be the first classmate to offer a ride!',
          btnText: actionText || 'Offer a Ride Instead',
          btnLink: actionLink || '/post',
          secBtnText: secondaryActionText || 'Reset Filters',
        };
      case 'no-bookings':
        return {
          icon: <Car className="w-8 h-8 text-amber-600" />,
          title: title || 'No upcoming ride bookings',
          desc:
            description ||
            'You haven’t booked any student carpools for today. Search your university corridor to connect with verified peers.',
          btnText: actionText || 'Find a Campus Ride',
          btnLink: actionLink || '/search',
          secBtnText: secondaryActionText,
        };
      case 'no-notifications':
        return {
          icon: <BellOff className="w-8 h-8 text-emerald-600" />,
          title: title || 'All caught up!',
          desc: description || 'You have zero pending notifications. Route alerts and OTP confirmations will appear here.',
          btnText: actionText,
          btnLink: actionLink,
          secBtnText: secondaryActionText,
        };
      case 'no-requests':
        return {
          icon: <CalendarX2 className="w-8 h-8 text-slate-500" />,
          title: title || 'Zero pending seat requests',
          desc: description || 'No classmates have requested seats on your offered rides yet. As departure approaches, requests will arrive here.',
          btnText: actionText,
          btnLink: actionLink,
          secBtnText: secondaryActionText,
        };
      default:
        return {
          icon: <Compass className="w-8 h-8 text-route" />,
          title: title || 'No data found',
          desc: description || 'There is nothing to display in this view right now.',
          btnText: actionText,
          btnLink: actionLink,
          secBtnText: secondaryActionText,
        };
    }
  };

  const preset = getPreset();

  return (
    <div
      className={`p-8 sm:p-12 rounded-3xl bg-paper/90 border border-line-base text-center space-y-4 shadow-xs max-w-lg mx-auto ${className}`}
      role="region"
    >
      {/* Tactile Icon Container */}
      <div className="w-16 h-16 rounded-2xl bg-canvas border border-line-base flex items-center justify-center mx-auto shadow-inner">
        {preset.icon}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display font-extrabold text-base sm:text-lg text-ink-primary">
          {preset.title}
        </h3>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans max-w-sm mx-auto">
          {preset.desc}
        </p>
      </div>

      {/* Action Buttons */}
      {(preset.btnText || preset.secBtnText) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {preset.btnText && (
            preset.btnLink ? (
              <Link
                to={preset.btnLink}
                className="px-5 py-2.5 rounded-xl bg-route text-white font-mono text-xs font-bold hover:bg-route-light transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{preset.btnText}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={onAction}
                className="px-5 py-2.5 rounded-xl bg-route text-white font-mono text-xs font-bold hover:bg-route-light transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{preset.btnText}</span>
              </button>
            )
          )}

          {preset.secBtnText && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-4 py-2.5 rounded-xl border border-line-base bg-surface hover:bg-canvas text-xs font-mono font-bold text-ink-primary transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1 text-ink-muted" />
              <span>{preset.secBtnText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

