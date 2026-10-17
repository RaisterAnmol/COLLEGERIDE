import React, { useState } from 'react';
import { RouteThread } from '../components/signature/RouteThread';
import { JourneyTicket, JourneyTicketRide, JourneyTicketVariant } from '../components/signature/JourneyTicket';
import { DestinationStamp } from '../components/signature/DestinationStamp';
import { TactileButton } from '../components/signature/TactileButton';
import { AvatarFrame, FrameVariant } from '../components/signature/AvatarFrame';
import { HoldToConfirm } from '../components/signature/HoldToConfirm';
import { StudentAvatar, StudentArchetype, AvatarState } from '../components/signature/StudentAvatar';
import { TactileStudentBadge } from '../components/signature/TactileStudentBadge';
import { CampusVehicleMascot } from '../components/signature/CampusVehicleMascot';
import { VerificationJourneyTrack } from '../components/verification/VerificationJourneyTrack';
import { LivingEmptyState } from '../components/signature/LivingEmptyState';
import { ShieldCheck, Check, Clock, AlertTriangle, RefreshCw, Eye } from 'lucide-react';

export const DesignPlaygroundPage: React.FC = () => {
  const [confirmCount, setConfirmCount] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [routeThreadKey, setRouteThreadKey] = useState(0);

  // JourneyTicket Interactive State Controls
  const [activeTicketVariant, setActiveTicketVariant] = useState<JourneyTicketVariant>('detail');
  const [activeTicketState, setActiveTicketState] = useState<'confirmed' | 'requested' | 'cancelled' | 'active' | 'loading' | 'error' | 'empty'>('confirmed');

  // DestinationStamp Interactive State Control
  const [stampStatus, setStampStatus] = useState<'confirmed' | 'verified' | 'pending' | 'rejected'>('confirmed');

  // StudentAvatar Commute State Control (Volume 1 §6.2 & Volume 2 §F)
  const [playgroundAvatarState, setPlaygroundAvatarState] = useState<AvatarState>('waiting');

  // Living Micro-Interactions Suite State
  const [vehicleState, setVehicleState] = useState<'idle' | 'driving' | 'celebrating' | 'waiting'>('idle');
  const [verificationStep, setVerificationStep] = useState<1 | 2 | 3 | 4>(3);
  const [isVerificationApproved, setIsVerificationApproved] = useState(false);

  // Real campus commute ride mock conforming strictly to real database schema
  const mockRideConfirmed: JourneyTicketRide = {
    _id: 'ride-uit-001',
    creator: {
      _id: 'usr-aarav-01',
      name: 'Aarav Sharma',
      college: 'Uttaranchal University (UIT)',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      semester: 6,
      gender: 'male',
      rating: 4.9,
      verificationStatus: 'verified',
    },
    origin: { text: 'Premnagar Chowk' },
    destination: { text: 'Uttaranchal University Gate 1' },
    departureTime: '2026-10-10T08:30:00Z',
    seatsAvailable: 2,
    seatsTotal: 4,
    fare: 20,
    vehicleModel: 'Honda City (UK 07)',
    vehiclePlate: 'UK 07 AK 4821',
    notes: 'Leaving on time from near the chai stall opposite police booth.',
    status: 'confirmed',
  };

  const mockRideRequested: JourneyTicketRide = {
    _id: 'ride-uit-002',
    creator: {
      _id: 'usr-priya-02',
      name: 'Priya Nautiyal',
      college: 'Uttaranchal University (UIM)',
      department: 'Management Studies',
      course: 'MBA',
      semester: 2,
      gender: 'female',
      rating: 4.8,
      verificationStatus: 'verified',
    },
    origin: { text: 'Suddhowala Hub' },
    destination: { text: 'Central Academic Library' },
    departureTime: '2026-10-10T09:15:00Z',
    seatsAvailable: 3,
    seatsTotal: 4,
    fare: 20,
    vehicleModel: 'Maruti Swift (UK 07)',
    vehiclePlate: 'UK 07 BM 1944',
    isWomenOnly: true,
    notes: 'Morning corridor carpool for female students and faculty.',
    status: 'requested',
  };

  const mockRideCancelled: JourneyTicketRide = {
    _id: 'ride-uit-003',
    creator: {
      _id: 'usr-rohit-03',
      name: 'Rohit Negi',
      college: 'Uttaranchal University (UIT)',
      department: 'Mechanical Engineering',
      course: 'B.Tech ME',
      semester: 8,
      gender: 'male',
      rating: 4.7,
      verificationStatus: 'verified',
    },
    origin: { text: 'Nanda Ki Chowki' },
    destination: { text: 'UIT Main Workshop Quad' },
    departureTime: '2026-10-10T10:00:00Z',
    seatsAvailable: 0,
    seatsTotal: 3,
    fare: 20,
    vehicleModel: 'Hyundai i20 (UK 07)',
    vehiclePlate: 'UK 07 DA 6120',
    notes: 'Cancelled due to university morning assembly.',
    status: 'cancelled',
  };

  const mockRideActive: JourneyTicketRide = {
    _id: 'ride-uit-004',
    creator: {
      _id: 'usr-kabir-04',
      name: 'Kabir Singh',
      college: 'Uttaranchal University (USCS)',
      department: 'Computer Applications',
      course: 'MCA',
      semester: 4,
      gender: 'male',
      rating: 4.9,
      verificationStatus: 'verified',
    },
    origin: { text: 'Premnagar Market' },
    destination: { text: 'USCS Building Gate 1' },
    departureTime: '2026-10-10T11:00:00Z',
    seatsAvailable: 3,
    seatsTotal: 4,
    fare: 20,
    vehicleModel: 'Tata Nexon (UK 07)',
    vehiclePlate: 'UK 07 FG 3311',
    notes: 'Direct transit along Chakrata Road corridor.',
    status: 'active',
  };

  // Select ride object based on active state
  const getSelectedRide = () => {
    switch (activeTicketState) {
      case 'confirmed':
        return mockRideConfirmed;
      case 'requested':
        return mockRideRequested;
      case 'cancelled':
        return mockRideCancelled;
      case 'active':
        return mockRideActive;
      default:
        return mockRideConfirmed;
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary py-10 px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto space-y-12 overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-line-base pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-mono font-bold text-route bg-route-pale px-2.5 py-0.5 rounded">
            DEV ENVIRONMENT ONLY
          </span>
          <span className="text-xs font-mono text-ink-muted">• CAMPUS ATLAS v2</span>
        </div>
        <h1 className="text-3xl font-display font-black text-ink-primary tracking-tight">
          CampusRide Signature Design Playground
        </h1>
        <p className="text-sm text-ink-secondary mt-1 max-w-3xl">
          Comprehensive verification surface for human-crafted signature components: RouteThread SVG draw,
          JourneyTicket circular notch masks, DestinationStamp land-and-settle seal, TactileButton mechanical depressions,
          750ms HoldToConfirm, and AvatarFrame grammar.
        </p>
      </div>

      {/* 1. Signature Route Thread */}
      <section className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-display font-bold text-ink-primary">
              1. Signature Route Thread (Continuous SVG Curve)
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Draws once on viewport intersection. Features real transit corridor waypoints: Premnagar → Suddhowala → Nanda Ki Chowki → UIT Gate 1.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReducedMotion(!isReducedMotion)}
              className={`px-3 py-1.5 rounded-control text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                isReducedMotion
                  ? 'bg-route text-surface border-route'
                  : 'bg-canvas text-ink-secondary border-line-base hover:bg-line-subtle/40'
              }`}
            >
              {isReducedMotion ? 'Reduced Motion: ON (Static)' : 'Reduced Motion: OFF (Animated)'}
            </button>
            <button
              type="button"
              onClick={() => setRouteThreadKey((k) => k + 1)}
              className="p-1.5 rounded-control bg-canvas border border-line-base text-ink-secondary hover:text-ink-primary hover:bg-line-subtle/40 transition-colors cursor-pointer"
              title="Re-trigger Route Thread intersection draw"
              aria-label="Re-trigger Route Thread animation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-canvas/60 rounded-control p-4 sm:p-6 border border-line-subtle">
          <RouteThread
            key={routeThreadKey}
            reducedMotion={isReducedMotion}
            ariaLabel="Premnagar to UIT Campus Transit Corridor"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
          <span>Mode: {isReducedMotion ? 'Static instant rendering (prefers-reduced-motion fallback)' : 'Animated viewport draw (executes once)'}</span>
          <span className="text-route font-semibold">4 Verified Stops</span>
        </div>
      </section>

      {/* 2. Signature Journey Ticket */}
      <section className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-display font-bold text-ink-primary">
              2. Journey Ticket (Tactile Circular Notches & Real Ride Data)
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Tactile silhouette via CSS radial mask with drop-shadow wrapper. Displays real server fields only.
            </p>
          </div>

          {/* Interactive State & Variant Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-control border border-line-base bg-canvas p-0.5">
              <button
                type="button"
                onClick={() => setActiveTicketVariant('detail')}
                className={`px-2.5 py-1 text-xs font-medium rounded-control transition-colors cursor-pointer ${
                  activeTicketVariant === 'detail' ? 'bg-surface text-ink-primary shadow-xs font-semibold' : 'text-ink-secondary'
                }`}
              >
                Detail View
              </button>
              <button
                type="button"
                onClick={() => setActiveTicketVariant('compact')}
                className={`px-2.5 py-1 text-xs font-medium rounded-control transition-colors cursor-pointer ${
                  activeTicketVariant === 'compact' ? 'bg-surface text-ink-primary shadow-xs font-semibold' : 'text-ink-secondary'
                }`}
              >
                Compact Pass
              </button>
            </div>
          </div>
        </div>

        {/* State Selection Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-line-subtle">
          <span className="text-xs font-mono text-ink-muted mr-1">Interactive States:</span>
          {(['confirmed', 'requested', 'cancelled', 'active', 'loading', 'error', 'empty'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveTicketState(st)}
              className={`px-2.5 py-1 rounded-control text-xs font-mono transition-colors cursor-pointer capitalize ${
                activeTicketState === st
                  ? 'bg-route text-surface font-semibold'
                  : 'bg-canvas text-ink-secondary border border-line-base hover:bg-line-subtle/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Active Selected Journey Ticket Preview */}
        <div className="max-w-xl mx-auto py-2">
          <div className="text-center mb-2">
            <span className="text-xs font-mono text-ink-muted">
              Live Preview: {activeTicketVariant} • {activeTicketState} state
            </span>
          </div>

          <JourneyTicket
            ride={activeTicketState === 'empty' ? null : getSelectedRide()}
            variant={activeTicketVariant}
            status={activeTicketState === 'active' ? undefined : activeTicketState}
            isRequested={activeTicketState === 'requested'}
            isLoading={activeTicketState === 'loading'}
            isError={activeTicketState === 'error'}
            errorMessage={activeTicketState === 'error' ? 'Failed to fetch ride pass from database' : undefined}
            isEmpty={activeTicketState === 'empty'}
            onRequestSeat={(id) => alert(`Requested seat for ride ${id}`)}
            onCancelRequest={(id) => alert(`Cancelled request for ride ${id}`)}
            onViewDetails={(id) => alert(`Viewing details for ride ${id}`)}
            onSelect={(id) => alert(`Selected pass for ride ${id}`)}
          />
        </div>

        {/* Comprehensive State Showcase Gallery */}
        <div className="pt-6 border-t border-line-subtle space-y-4">
          <h3 className="text-sm font-bold text-ink-primary">
            Static State Matrix (Direct Surface Verification)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-route font-semibold block">A. Confirmed Booking State</span>
              <JourneyTicket
                ride={mockRideConfirmed}
                variant="detail"
                status="confirmed"
                onCancelRequest={(id) => alert(`Cancel confirmed booking ${id}`)}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-status-verified font-semibold block">B. Requested State (Seat Waitlist)</span>
              <JourneyTicket
                ride={mockRideRequested}
                variant="detail"
                isRequested={true}
                onCancelRequest={(id) => alert(`Cancel request ${id}`)}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-emergency-crimson font-semibold block">C. Cancelled Ride State</span>
              <JourneyTicket
                ride={mockRideCancelled}
                variant="detail"
                status="cancelled"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-ink-secondary font-semibold block">D. Compact Corridor Pass Variant</span>
              <JourneyTicket
                ride={mockRideConfirmed}
                variant="compact"
                onSelect={(id) => alert(`Selected compact pass ${id}`)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-ink-muted block">E. Loading State</span>
              <JourneyTicket isLoading={true} />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-emergency-crimson block">F. Error State</span>
              <JourneyTicket isError={true} errorMessage="Ride listing not found on server" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-ink-muted block">G. Empty State</span>
              <JourneyTicket isEmpty={true} emptyMessage="No corridor pass selected" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Destination Stamp */}
      <section className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-display font-bold text-ink-primary">
              3. Destination Stamp (Gated to Real Server Verification)
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Organic -2deg stamped seal with dashed border exclusively appears for confirmed/verified server status.
              Pending and rejected statuses display calm, plain badges (Rule R6).
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-control border border-line-base">
            {(['confirmed', 'verified', 'pending', 'rejected'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStampStatus(st)}
                className={`px-2.5 py-1 text-xs font-mono rounded-control transition-colors cursor-pointer capitalize ${
                  stampStatus === st ? 'bg-route text-surface font-semibold' : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Live Interactive Tester */}
        <div className="p-4 rounded-control bg-canvas/60 border border-line-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            <span className="font-semibold text-ink-primary">Live Tester: </span>
            <span className="font-mono text-xs text-ink-secondary capitalize">{stampStatus} status output</span>
          </div>
          <div>
            <DestinationStamp
              status={stampStatus}
              label={
                stampStatus === 'confirmed'
                  ? 'BOOKING CONFIRMED'
                  : stampStatus === 'verified'
                  ? 'CAMPUS VERIFIED'
                  : stampStatus === 'pending'
                  ? 'Institutional ID In Review'
                  : 'Verification Incomplete'
              }
              issuedDate="Autumn Term 2026"
            />
          </div>
        </div>

        {/* Side-by-side Comparative Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-control bg-canvas border border-line-base space-y-2 text-center">
            <span className="text-xs font-mono text-route font-semibold block">
              A. Verified / Confirmed Stamped Seal
            </span>
            <div className="py-2">
              <DestinationStamp status="verified" label="UIT CAMPUS VERIFIED" issuedDate="Academic Yr 2026" />
            </div>
            <p className="text-[11px] text-ink-muted">
              Features organic -2deg tilt, dashed route border, and ShieldCheck seal icon.
            </p>
          </div>

          <div className="p-4 rounded-control bg-canvas border border-line-base space-y-2 text-center">
            <span className="text-xs font-mono text-signal-amber font-semibold block">
              B. Pending Status (Calm Plain Text)
            </span>
            <div className="py-2">
              <DestinationStamp status="pending" label="Institutional ID Under Review" />
            </div>
            <p className="text-[11px] text-ink-muted">
              No tilt, no dashed border, no seal. Plain calm institutional badge (Rule R6).
            </p>
          </div>

          <div className="p-4 rounded-control bg-canvas border border-line-base space-y-2 text-center">
            <span className="text-xs font-mono text-emergency-crimson font-semibold block">
              C. Incomplete / Rejected Badge
            </span>
            <div className="py-2">
              <DestinationStamp status="rejected" label="Verification Incomplete" />
            </div>
            <p className="text-[11px] text-ink-muted">
              Emergency crimson calm notice without decorative elements.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Tactile Buttons & Hold-To-Confirm */}
      <section className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-display font-bold text-ink-primary">
            4. Tactile Buttons & Destructive Hold-to-Confirm
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Mechanical 1–2px depression (active:translate-y-[1.5px]), minimum 44px touch target floor, visible focus rings.
          </p>
        </div>

        {/* Architectural Variants Showcase */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono text-ink-muted">A. Architectural Variants (All Min 44px Touch Target)</h3>
          <div className="flex flex-wrap items-center gap-4">
            <TactileButton variant="primary" size="md">
              Primary (Deep Route)
            </TactileButton>
            <TactileButton variant="secondary" size="md">
              Secondary (Surface)
            </TactileButton>
            <TactileButton variant="signal" size="md">
              Signal (Amber Accent)
            </TactileButton>
            <TactileButton variant="ghost" size="md">
              Ghost (Transparent)
            </TactileButton>
            <TactileButton variant="danger" size="md">
              Danger (Emergency 112)
            </TactileButton>
          </div>
        </div>

        {/* State Modifiers */}
        <div className="space-y-3 pt-2 border-t border-line-subtle">
          <h3 className="text-xs font-mono text-ink-muted">B. Touch Target Floors & States</h3>
          <div className="flex flex-wrap items-center gap-4">
            <TactileButton variant="primary" size="sm">
              Small (36px)
            </TactileButton>
            <TactileButton variant="primary" size="md">
              Medium (44px floor)
            </TactileButton>
            <TactileButton variant="primary" size="lg">
              Large (50px)
            </TactileButton>
            <TactileButton variant="primary" size="md" disabled>
              Disabled State
            </TactileButton>
            <TactileButton variant="primary" size="md" isLoading>
              Loading Spinner
            </TactileButton>
          </div>
        </div>

        {/* Hold-to-Confirm Destructive Action */}
        <div className="pt-4 border-t border-line-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-ink-primary">C. 750ms Hold-to-Confirm Action</h3>
            <p className="text-xs text-ink-secondary">
              Requires 750ms continuous press to trigger destructive actions. Prevents accidental commute cancellations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <HoldToConfirm
              onConfirm={() => setConfirmCount((c) => c + 1)}
              durationMs={750}
              label="Hold to Cancel Ride"
              confirmLabel="Cancelling Ride..."
            />

            {confirmCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emergency-crimson font-bold bg-red-50 border border-red-200 px-2 py-1 rounded">
                  Cancelled {confirmCount}x
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmCount(0)}
                  className="text-xs text-ink-muted hover:text-ink-primary underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Avatar Frame Grammar */}
      <section className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-lg font-display font-bold text-ink-primary">
            5. Avatar Frame Grammar (One Grammar, Four Variants)
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Consistent SVG overlay frames, square-safe face cropping (overflow-hidden, object-cover).
            Initials fallback renders clean uppercase letters when photo is unavailable.
          </p>
        </div>

        {/* Four Variants with Initials */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono text-ink-muted">A. Standard Student Initials Fallbacks</h3>
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center space-y-1.5">
              <AvatarFrame name="Priya Sharma" frame="plain" size={56} />
              <span className="text-xs font-mono text-ink-secondary block">Plain</span>
            </div>
            <div className="text-center space-y-1.5">
              <AvatarFrame name="Aarav Kumar" frame="route" size={56} />
              <span className="text-xs font-mono text-ink-secondary block">Route</span>
            </div>
            <div className="text-center space-y-1.5">
              <AvatarFrame name="Kabir Singh" frame="ticket" size={56} />
              <span className="text-xs font-mono text-ink-secondary block">Ticket</span>
            </div>
            <div className="text-center space-y-1.5">
              <AvatarFrame name="Bao Mascot" frame="milestone" size={56} />
              <span className="text-xs font-mono text-ink-secondary block">Milestone</span>
            </div>
          </div>
        </div>

        {/* Four Variants with Simulated Profile Images */}
        <div className="space-y-3 pt-3 border-t border-line-subtle">
          <h3 className="text-xs font-mono text-ink-muted">B. Overlay Frames with Square-Safe Cropping</h3>
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center space-y-1.5">
              <AvatarFrame
                name="Ananya Verma"
                frame="plain"
                size={56}
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              />
              <span className="text-xs font-mono text-ink-secondary block">Plain (Dot)</span>
            </div>
            <div className="text-center space-y-1.5">
              <AvatarFrame
                name="Devansh Joshi"
                frame="route"
                size={56}
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              />
              <span className="text-xs font-mono text-ink-secondary block">Route (Concentric)</span>
            </div>
            <div className="text-center space-y-1.5">
              <AvatarFrame
                name="Meera Rawat"
                frame="ticket"
                size={56}
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
              />
              <span className="text-xs font-mono text-ink-secondary block">Ticket (Notched)</span>
            </div>
            <div className="text-center space-y-1.5">
              <AvatarFrame
                name="Rohan Bisht"
                frame="milestone"
                size={56}
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
              />
              <span className="text-xs font-mono text-ink-secondary block">Milestone (Star)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Original Student Avatars (Open Peeps / Humaaans Archetypes & Commute States) */}
      <section className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-subtle">
          <div>
            <h2 className="text-lg font-display font-bold text-ink-primary">
              6. Student Avatars (Appendix H: Open Peeps & Humaaans Principles)
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              6 hand-drawn student archetypes with 4 commute states (waiting, matched, on_the_way, arrived). 100% original SVG, zero external DiceBear calls.
            </p>
          </div>

          {/* Commute State Switcher */}
          <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-control border border-line-base">
            {(['waiting', 'matched', 'on_the_way', 'arrived'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setPlaygroundAvatarState(st)}
                className={`px-3 py-1 rounded-cut text-xs font-mono capitalize transition-all cursor-pointer ${
                  playgroundAvatarState === st
                    ? 'bg-route text-surface font-bold shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Archetypes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 pt-2">
          {(
            [
              { id: 'aarav', name: 'Aarav Sharma', role: 'Engineering Commuter', desc: 'Round glasses, backpack straps' },
              { id: 'priya', name: 'Priya Nautiyal', role: 'Science Postgraduate', desc: 'Ponytail, cardigan, notebook' },
              { id: 'aditya', name: 'Aditya Kumar', role: 'Architecture Student', desc: 'Scarf wrap, drafting tube' },
              { id: 'kavita', name: 'Kavita Joshi', role: 'Law Junior', desc: 'Blazer lapels, student ID lanyard' },
              { id: 'rohan', name: 'Rohan Negi', role: 'Day-Scholar Rider', desc: 'Cap, hoodie, helmet clip' },
              { id: 'neha', name: 'Neha Rawat', role: 'Transit-Hub Commuter', desc: 'Volume curls, over-ear headphones' },
            ] as const
          ).map((arch) => (
            <div key={arch.id} className="text-center p-3 rounded-control bg-canvas border border-line-base space-y-2">
              <div className="flex justify-center">
                <AvatarFrame
                  name={arch.name}
                  archetype={arch.id}
                  avatarState={playgroundAvatarState}
                  frame="ticket"
                  size={72}
                />
              </div>
              <div>
                <span className="font-display font-bold text-xs text-ink-primary block truncate">
                  {arch.name}
                </span>
                <span className="text-[10px] text-route font-mono block">
                  {arch.role}
                </span>
                <span className="text-[9px] text-ink-muted block mt-0.5 leading-tight">
                  {arch.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 6.B: Handcrafted Tactile Stitched Campus Badges (Clay/Papercraft 3D Relief) */}
        <div className="pt-6 border-t border-line-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-route">
                6.B Handcrafted Tactile Stitched Badges (Exact 3D Papercraft Relief)
              </h3>
              <p className="text-[11px] text-ink-secondary mt-0.5">
                Physical blanket-stitch borders, stamped checkmark seals, and typewriter paper tape tags on warm kraft card.
              </p>
            </div>
            <span className="text-[10px] font-mono text-ink-muted">4 Verified Roles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <TactileStudentBadge
              name="Aditya Kumar"
              collegeShort="UU"
              role="driver"
              archetype="aditya"
            />
            <TactileStudentBadge
              name="Ananya Verma"
              collegeShort="GEU"
              role="anchor"
              archetype="kavita"
            />
            <TactileStudentBadge
              name="Rahul Sharma"
              collegeShort="UU"
              role="passenger"
              archetype="rohan"
            />
            <TactileStudentBadge
              name="Priya Singh"
              collegeShort="GEHU"
              role="passenger"
              archetype="priya"
            />
          </div>
        </div>
      </section>

      {/* 6. LIVING INTERACTIONS, MASCOT SUITE & VERIFICATION JOURNEY */}
      <section className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-mono font-semibold text-route">
            Signature Suite 06
          </span>
          <h2 className="text-2xl font-display font-extrabold text-ink-primary mt-1">
            Living Interactions, Mascot & Verification Journey
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            Micro-interactions that communicate status, provide helpful guidance, and reinforce the illuminated campus road motif.
          </p>
        </div>

        {/* 6.1: Tiny Car Mascot ("Pip" the Campus EV) */}
        <div className="p-5 rounded-surface bg-canvas border border-line-base space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-sm text-ink-primary">
                Pip • Campus Vehicle Mascot
              </h3>
              <p className="text-xs text-ink-secondary">
                Electric campus hatchback with headlight blink, suspension settle, and reactive states.
              </p>
            </div>
            {/* Interactive State Switcher */}
            <div className="flex flex-wrap gap-1.5">
              {(['idle', 'driving', 'celebrating', 'waiting'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setVehicleState(st)}
                  className={`px-3 py-1 rounded-control text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    vehicleState === st
                      ? 'bg-route text-surface'
                      : 'bg-surface text-ink-secondary border border-line-base hover:bg-surface-raised'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-6 bg-surface rounded-2xl border border-line-subtle">
            <CampusVehicleMascot
              state={vehicleState}
              size={140}
              showSpeech={true}
            />
            <div className="text-xs text-ink-secondary max-w-xs space-y-2">
              <span className="font-bold text-ink-primary block">Micro-Interaction Rules:</span>
              <p>• <strong>Click anywhere on Pip</strong> to trigger an instant friendly headlight wink & hop.</p>
              <p>• <strong>'driving':</strong> Renders forward suspension rake, rotating hubcaps, and road speed dust.</p>
              <p>• <strong>'celebrating':</strong> Renders celebratory hop with confetti sparkles upon ride booking.</p>
              <p>• <strong>'waiting':</strong> Renders alongside campus bus stop signpost for empty state queues.</p>
            </div>
          </div>
        </div>

        {/* 6.2: Animated Verification Journey Track */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-sm text-ink-primary">
                Animated Verification Journey
              </h3>
              <p className="text-xs text-ink-secondary">
                Illuminated road connecting the 4 student credential verification milestones.
              </p>
            </div>
            {/* Step Switcher */}
            <div className="flex flex-wrap items-center gap-1.5">
              {([1, 2, 3, 4] as const).map((stepNum) => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => {
                    setVerificationStep(stepNum);
                    setIsVerificationApproved(stepNum === 4);
                  }}
                  className={`px-3 py-1 rounded-control text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    verificationStep === stepNum
                      ? 'bg-route text-surface'
                      : 'bg-surface text-ink-secondary border border-line-base hover:bg-canvas'
                  }`}
                >
                  Step {stepNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsVerificationApproved(!isVerificationApproved)}
                className={`px-3 py-1 rounded-control text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  isVerificationApproved
                    ? 'bg-emerald-700 text-white'
                    : 'bg-surface text-ink-secondary border border-line-base'
                }`}
              >
                {isVerificationApproved ? 'Approved ✓' : 'Approve'}
              </button>
            </div>
          </div>

          <VerificationJourneyTrack
            currentStep={verificationStep}
            isApproved={isVerificationApproved}
          />
        </div>

        {/* 6.3: Living Empty State Demonstration */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-ink-primary">
            Living Empty State (Waiting Carpool Variant)
          </h3>
          <LivingEmptyState
            variant="no-rides"
            title="No rides scheduled on this corridor yet"
            description="Be the first student to offer empty seats on this route, or notify classmates that you're heading this way."
            primaryAction={{
              label: "Offer a Ride on This Route",
              onClick: () => alert("Redirecting to offer a ride"),
            }}
            secondaryAction={{
              label: "Reset Academic Filters",
              onClick: () => alert("Filters reset"),
            }}
          />
        </div>
      </section>
    </div>
  );
};
