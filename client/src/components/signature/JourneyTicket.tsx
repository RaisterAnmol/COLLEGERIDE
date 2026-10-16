import React, { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, MotionConfig } from 'framer-motion';
import { ShieldCheck, ChevronDown, ChevronUp, Clock, MapPin, Users, Car, AlertCircle, Check } from 'lucide-react';
import { sanitizeLocationText } from '../../utils/sanitizeLocation';

export interface JourneyTicketRide {
  _id: string;
  creator?: {
    _id?: string;
    name?: string;
    college?: string;
    department?: string;
    course?: string;
    semester?: number | string;
    gender?: string;
    rating?: number;
    verificationStatus?: string;
    avatarURL?: string;
  };
  origin?: {
    text?: string;
    lat?: number;
    lng?: number;
  };
  destination?: {
    text?: string;
    lat?: number;
    lng?: number;
  };
  departureTime?: string | Date;
  seatsAvailable?: number;
  availableSeats?: number;
  seatsTotal?: number;
  fare?: number;
  pricePerSeat?: number;
  notes?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  isWomenOnly?: boolean;
  status?: string;
}

export type JourneyTicketVariant = 'compact' | 'detail';
export type JourneyTicketRideStatus = 'active' | 'confirmed' | 'requested' | 'cancelled' | 'completed';

export interface JourneyTicketProps {
  ride?: JourneyTicketRide | null;
  variant?: JourneyTicketVariant;
  status?: JourneyTicketRideStatus | string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRequestSeat?: (rideId: string) => void;
  onCancelRequest?: (rideId: string) => void;
  onViewDetails?: (rideId: string) => void;
  onSelect?: (rideId: string) => void;
  onToggleMap?: (rideId: string) => void;
  isMapOpen?: boolean;
  isRequested?: boolean;
  requestLoading?: boolean;
  isCurrentUserCreator?: boolean;
  isUserVerified?: boolean;
  onVerifyPrompt?: () => void;
  className?: string;
}

// Spring config for tilt reset
const tiltSpringConfig = { stiffness: 250, damping: 25, mass: 0.5 };

export const JourneyTicket: React.FC<JourneyTicketProps> = ({
  ride,
  variant = 'detail',
  status,
  isLoading = false,
  isError = false,
  errorMessage,
  isEmpty = false,
  emptyMessage,
  onRequestSeat,
  onCancelRequest,
  onViewDetails,
  onSelect,
  onToggleMap,
  isMapOpen = false,
  isRequested = false,
  requestLoading = false,
  isCurrentUserCreator = false,
  isUserVerified = true,
  onVerifyPrompt,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 3D tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Map mouse position to rotation: rotateY from mouseX (±6°), rotateX from mouseY (±4°)
  const rawRotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);
  const rawRotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);

  // Apply spring smoothing for organic feel
  const rotateX = useSpring(rawRotateX, tiltSpringConfig);
  const rotateY = useSpring(rawRotateY, tiltSpringConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      // Normalize to -0.5 to 0.5 range from center
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  if (isLoading) {
    return (
      <div className={`ticket-wrapper h-full ${className}`}>
        <article
          className="ticket-silhouette bg-surface border border-line-base p-5 sm:p-6 relative overflow-hidden h-full flex flex-col justify-between"
          role="status"
          aria-label="Loading ride pass..."
        >
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="h-6 w-28 bg-line-subtle rounded-control" />
            <div className="h-6 w-16 bg-line-subtle rounded-control" />
          </div>
          <div className="py-4 space-y-3">
            <div className="h-4 w-3/4 bg-line-subtle rounded-control" />
            <div className="h-4 w-1/2 bg-line-subtle rounded-control" />
          </div>
          <div className="border-t border-dashed border-line-base my-2 -mx-5 sm:-mx-6" />
          <div className="pt-2 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-control bg-line-subtle" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-line-subtle rounded-control" />
                <div className="h-3 w-32 bg-line-subtle rounded-control" />
              </div>
            </div>
            <span className="text-xs font-mono text-ink-muted">Loading pass...</span>
          </div>
        </article>
      </div>
    );
  }

  if (isError || errorMessage) {
    return (
      <div className={`ticket-wrapper ${className}`}>
        <article
          className="ticket-silhouette bg-surface border border-red-200 p-5 sm:p-6 relative overflow-hidden"
          role="alert"
          aria-label="Error loading ride pass"
        >
          <div className="flex items-center gap-2 text-emergency-crimson text-sm font-semibold pb-2 border-b border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage || 'Unable to load ticket details'}</span>
          </div>
          <p className="text-xs text-ink-secondary mt-3">
            The requested campus commute pass could not be retrieved from the server.
          </p>
        </article>
      </div>
    );
  }

  if (isEmpty || !ride) {
    return (
      <div className={`ticket-wrapper ${className}`}>
        <article
          className="ticket-silhouette bg-surface border border-line-base p-5 sm:p-6 relative overflow-hidden text-center"
          role="region"
          aria-label="No ride ticket available"
        >
          <p className="text-sm font-semibold text-ink-secondary">
            {emptyMessage || 'No ride ticket selected'}
          </p>
          <p className="text-xs text-ink-muted mt-1 font-mono">
            Select a corridor route from the listings to preview the verified pass.
          </p>
        </article>
      </div>
    );
  }

  const originText = sanitizeLocationText(ride.origin?.text || 'Campus Point');
  const destText = sanitizeLocationText(ride.destination?.text || 'Target Building');
  const fareAmount = ride.fare ?? ride.pricePerSeat ?? 20;

  const formattedTime = (() => {
    if (!ride.departureTime) return 'Scheduled Today';
    try {
      const d = new Date(ride.departureTime);
      if (isNaN(d.getTime())) return String(ride.departureTime);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(ride.departureTime);
    }
  })();

  const isVerified = ride.creator?.verificationStatus === 'verified';
  const effectiveStatus = status || ride.status;
  const isCancelled = effectiveStatus === 'cancelled';
  const isConfirmed = effectiveStatus === 'confirmed';
  const isEffectivelyRequested = isRequested || effectiveStatus === 'requested';
  const seatsCount = ride.seatsAvailable ?? ride.availableSeats ?? 1;

  if (variant === 'compact') {
    return (
      <MotionConfig reducedMotion="user">
        <motion.div
          className={`ticket-wrapper transition-all duration-200 ${className}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: 1000,
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <article
            className="ticket-silhouette bg-surface border border-line-base p-4 transition-all duration-200 relative overflow-hidden focus-within:ring-2 focus-within:ring-route focus-within:ring-offset-2"
            role="region"
            aria-label={`Ride pass: ${originText} to ${destText}`}
          >
            {/* Compact Header: Time & Fare */}
            <div className="flex items-center justify-between gap-3 border-b border-line-subtle pb-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-control bg-route-pale text-route text-xs font-mono font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>{formattedTime}</span>
                </span>
                {isConfirmed && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-control bg-route-pale text-route border border-route/30 text-[11px] font-mono font-semibold">
                    Confirmed ✓
                  </span>
                )}
                {isCancelled && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-control bg-red-50 text-emergency-crimson border border-red-200 text-[11px] font-mono font-semibold">
                    Cancelled
                  </span>
                )}
                {ride.isWomenOnly && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-control bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-semibold">
                    Women-Only Carpool
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-bold text-ink-primary">
                  ₹{fareAmount}
                </span>
                <span className="text-[10px] text-ink-muted block -mt-1 font-sans">
                  fuel share
                </span>
              </div>
            </div>

            {/* Compact Route Line */}
            <div className="py-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-route shrink-0" />
                <span className="font-medium text-ink-primary truncate">{originText}</span>
                <span className="text-ink-muted shrink-0">→</span>
                <span className="w-2 h-2 rounded-full bg-signal-amber shrink-0" />
                <span className="font-medium text-ink-primary truncate">{destText}</span>
              </div>
            </div>

            {/* Perforated Divider Line */}
            <div className="border-t border-dashed border-line-base my-1.5 relative -mx-4" />

            {/* Compact Driver & Action */}
            <div className="pt-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {ride.creator?.avatarURL ? (
                  <img
                    src={ride.creator.avatarURL}
                    alt={ride.creator.name || 'Driver'}
                    className="w-7 h-7 rounded-control object-cover border border-line-base shrink-0"
                    loading="lazy"
                    width="28"
                    height="28"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-control bg-route-pale text-route font-display font-bold flex items-center justify-center text-xs border border-route-light/20 shrink-0">
                    {(ride.creator?.name || 'S')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-display font-semibold text-ink-primary text-xs truncate">
                      {ride.creator?.name || 'Student Driver'}
                    </span>
                    {isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-status-verified shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-ink-secondary flex items-center gap-1">
                  <Users className="w-3 h-3 text-route" />
                  <span>
                    {seatsCount} seat{seatsCount === 1 ? '' : 's'} open
                  </span>
                </span>

                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(ride._id)}
                    className="px-3 py-1 rounded-control text-xs font-semibold bg-route text-surface hover:bg-route-light transition-all active:translate-y-[1.5px] cursor-pointer"
                  >
                    Select Pass
                  </button>
                ) : onViewDetails ? (
                  <button
                    type="button"
                    onClick={() => onViewDetails(ride._id)}
                    className="px-3 py-1 rounded-control text-xs font-medium border border-line-base bg-surface text-ink-secondary hover:bg-canvas transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        </motion.div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={`ticket-wrapper h-full flex flex-col transition-all duration-200 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: 1000,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <article
          className="ticket-silhouette bg-surface border border-line-base p-5 sm:p-6 transition-all duration-200 relative overflow-hidden focus-within:ring-2 focus-within:ring-route focus-within:ring-offset-2 h-full flex flex-col justify-between"
          role="region"
          aria-label={`Ride pass: ${originText} to ${destText}`}
        >
          {/* Top Header: Departure & Status */}
          <div className="flex items-center justify-between gap-3 border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control bg-route-pale text-route text-xs font-mono font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedTime}</span>
              </span>

              {isConfirmed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-control bg-route-pale text-route border border-route/30 text-[11px] font-mono font-semibold">
                  <Check className="w-3 h-3" />
                  <span>Confirmed Pass</span>
                </span>
              )}

              {isCancelled && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-control bg-red-50 text-emergency-crimson border border-red-200 text-[11px] font-mono font-semibold">
                  Ride Cancelled
                </span>
              )}

              {ride.isWomenOnly && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-control bg-pink-50 text-pink-700 border border-pink-200 text-[11px] font-semibold">
                  Women-Only Carpool
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="font-mono text-base font-bold text-ink-primary">
                ₹{fareAmount}
              </span>
              <span className="text-[11px] text-ink-muted block -mt-1 font-sans">
                fuel share
              </span>
            </div>
          </div>

          {/* Corridor Route Details */}
          <div className="py-4 space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1 select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-route ring-4 ring-route-pale" />
                <span className="w-0.5 h-7 bg-line-base my-0.5" />
                <span className="w-2.5 h-2.5 rounded-full bg-signal-amber ring-4 ring-amber-50" />
              </div>

              <div className="flex-1 space-y-2 text-sm leading-snug">
                <div>
                  <span className="text-[11px] font-mono text-ink-muted uppercase block">
                    Pickup Stop
                  </span>
                  <span className="font-semibold text-ink-primary">{originText}</span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-ink-muted uppercase block">
                    Drop-off Point
                  </span>
                  <span className="font-semibold text-ink-primary">{destText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Divider Line */}
          <div className="border-t border-dashed border-line-base my-2 relative -mx-5 sm:-mx-6" />

          {/* Driver Profile & Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
            <div className="flex items-center gap-3">
              {ride.creator?.avatarURL ? (
                <img
                  src={ride.creator.avatarURL}
                  alt={ride.creator.name || 'Driver profile'}
                  className="w-10 h-10 rounded-control object-cover border border-line-base"
                  loading="lazy"
                  width="40"
                  height="40"
                />
              ) : (
                <div className="w-10 h-10 rounded-control bg-route-pale text-route font-display font-bold flex items-center justify-center text-sm border border-route-light/20">
                  {(ride.creator?.name || 'S')[0].toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-ink-primary text-sm">
                    {ride.creator?.name || 'Student Driver'}
                  </span>
                  {isVerified && (
                    <span
                      className="inline-flex items-center text-status-verified"
                      title="Verified Institutional Student"
                      role="img"
                      aria-label="Verified ID"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-ink-secondary">
                  {ride.creator?.college || 'Uttaranchal University'}
                  {ride.creator?.department ? ` • ${ride.creator.department}` : ''}
                </p>
              </div>
            </div>

            {/* Action Button & Seat Status */}
            <div className="flex flex-wrap items-center gap-2.5 justify-between sm:justify-end">
              <span className="text-xs font-mono text-ink-secondary flex items-center gap-1 mr-1">
                <Users className="w-3.5 h-3.5 text-route" />
                <span>
                  {ride.seatsAvailable ?? ride.availableSeats ?? 1} seat
                  {(ride.seatsAvailable ?? ride.availableSeats ?? 1) === 1 ? '' : 's'} open
                </span>
              </span>

              {onToggleMap && (
                <button
                  type="button"
                  onClick={() => onToggleMap(ride._id)}
                  className={`px-3 py-1.5 rounded-control text-xs font-medium border transition-colors cursor-pointer ${
                    isMapOpen
                      ? 'bg-route text-surface border-route'
                      : 'bg-surface text-ink-secondary border-line-base hover:bg-canvas'
                  }`}
                >
                  {isMapOpen ? 'Close Map' : 'Map'}
                </button>
              )}

              {onViewDetails && (
                <button
                  type="button"
                  onClick={() => onViewDetails(ride._id)}
                  className="px-3 py-1.5 rounded-control text-xs font-medium border border-line-base bg-surface text-ink-secondary hover:bg-canvas transition-colors cursor-pointer"
                >
                  View Details
                </button>
              )}

              {isCancelled ? (
                <span className="px-3 py-1.5 rounded-control bg-red-50 text-emergency-crimson border border-red-200 text-xs font-semibold">
                  Ride Cancelled
                </span>
              ) : isConfirmed ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1.5 rounded-control bg-route-pale text-route border border-route/30 text-xs font-semibold">
                    Confirmed ✓
                  </span>
                  {onCancelRequest && (
                    <button
                      type="button"
                      onClick={() => onCancelRequest(ride._id)}
                      className="px-2 py-1.5 rounded-control bg-red-50 text-emergency-crimson border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                      title="Cancel request"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : isCurrentUserCreator ? (
                <span className="px-3 py-1.5 rounded-control bg-route-pale text-route text-xs font-semibold">
                  Your Ride
                </span>
              ) : !isUserVerified ? (
                <button
                  type="button"
                  onClick={onVerifyPrompt}
                  className="px-3 py-1.5 rounded-control bg-amber-50 text-signal-amber border border-signal-amber/30 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Verify ID to Request
                </button>
              ) : isEffectivelyRequested ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1.5 rounded-control bg-status-verified-bg text-status-verified border border-status-verified/40 text-xs font-semibold">
                    Requested ✓
                  </span>
                  {onCancelRequest && (
                    <button
                      type="button"
                      onClick={() => onCancelRequest(ride._id)}
                      className="px-2 py-1.5 rounded-control bg-red-50 text-emergency-crimson border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                      title="Cancel request"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : onRequestSeat ? (
                <button
                  type="button"
                  onClick={() => onRequestSeat(ride._id)}
                  disabled={requestLoading || (ride.seatsAvailable ?? ride.availableSeats ?? 0) <= 0}
                  className={`px-4 py-2 rounded-control text-xs font-semibold transition-all duration-150 active:translate-y-[1.5px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-route focus:ring-offset-1 ${
                    (ride.seatsAvailable ?? ride.availableSeats ?? 0) <= 0
                      ? 'bg-canvas text-ink-muted border border-line-base cursor-not-allowed'
                      : 'bg-route text-surface hover:bg-route-light shadow-subtle'
                  }`}
                >
                  {requestLoading ? 'Requesting...' : 'Request Seat'}
                </button>
              ) : onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(ride._id)}
                  className="px-4 py-2 rounded-control text-xs font-semibold bg-route text-surface hover:bg-route-light shadow-subtle transition-all duration-150 active:translate-y-[1.5px] cursor-pointer"
                >
                  Select Pass
                </button>
              ) : null}
            </div>
          </div>

          {/* Expandable Disclosure for Vehicle & Notes */}
          <div className="mt-3 pt-2 border-t border-line-subtle/60 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="text-xs font-medium text-ink-secondary hover:text-route flex items-center gap-1 transition-colors cursor-pointer py-1"
            >
              <span>{isExpanded ? 'Less details' : 'Vehicle & Corridor Notes'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {ride.vehicleModel && (
              <span className="text-[11px] font-mono text-ink-muted flex items-center gap-1">
                <Car className="w-3 h-3 text-ink-secondary" />
                <span>{ride.vehicleModel}</span>
              </span>
            )}
          </div>

          {isExpanded && (
            <div className="mt-2.5 pt-2 border-t border-line-subtle text-xs text-ink-secondary space-y-1.5 animate-fadeIn">
              {ride.vehiclePlate && (
                <p>
                  <strong className="text-ink-primary font-medium">Plate:</strong>{' '}
                  <span className="font-mono bg-canvas px-1.5 py-0.5 rounded border border-line-base">
                    {ride.vehiclePlate}
                  </span>
                </p>
              )}
              {ride.notes && (
                <p>
                  <strong className="text-ink-primary font-medium">Driver note:</strong>{' '}
                  {ride.notes}
                </p>
              )}
              {!ride.vehiclePlate && !ride.notes && (
                <p className="text-ink-muted italic">No additional passenger notes posted.</p>
              )}
            </div>
          )}
        </article>
      </motion.div>
    </MotionConfig>
  );
};
