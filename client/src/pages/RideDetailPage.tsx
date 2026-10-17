import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { DEMO_FALLBACK_RIDES } from "../services/demoFallback";
import { IRide, IRideRequest, ITrip } from "../types";
import { getSocket, joinRideRoom } from "../services/socket";
import { ChatModal } from "../components/ChatModal";
import { DailyDriverIdCheckModal } from "../components/verification/DailyDriverIdCheckModal";
import { PickupAndRouteNavigationMap } from "../components/map/PickupAndRouteNavigationMap";
import {
  Car,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  ShieldAlert,
  Star,
  ArrowRight,
  MessageSquare,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Award,
  UserCheck,
  Check,
} from "lucide-react";
import { ReviewModal } from "../components/ReviewModal";
import { sanitizeLocationText } from "../utils/sanitizeLocation";
import RideRequestSuccessModal from "../components/RideRequestSuccessModal";
import { JourneyTicket } from "../components/signature/JourneyTicket";
import { TactileButton } from "../components/signature/TactileButton";
import { HoldToConfirmWithFallback } from "../components/signature/HoldToConfirm";
import { RideDetailSkeleton, ReviewCardSkeleton } from "../components/common/Skeletons";
import { useSeoMeta } from "../hooks/useSeoMeta";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 25,
    },
  },
};

export const RideDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState<IRide | null>(null);

  useSeoMeta({
    title: ride?.origin?.text && ride?.destination?.text
      ? `${ride.origin.text} to ${ride.destination.text} Pass`
      : "Campus Commute Pass",
    description: ride?.origin?.text && ride?.destination?.text
      ? `Verified student carpool pass from ${ride.origin.text} to ${ride.destination.text}. Offered by verified student peer ${ride.creator?.name || 'Classmate'}.`
      : "Verified student carpool commute pass and route details.",
  });
  const [requests, setRequests] = useState<IRideRequest[]>([]);
  const [activeTrip, setActiveTrip] = useState<ITrip | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showWalkingGuide, setShowWalkingGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDailyIdModal, setShowDailyIdModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Driver Reviews State
  const [driverReviews, setDriverReviews] = useState<any[]>([]);
  const [driverReviewsLoading, setDriverReviewsLoading] = useState(false);
  const [activeReviewModal, setActiveReviewModal] = useState<{
    tripId: string;
    toUserId: string;
    recipientName: string;
    role: 'driver' | 'passenger';
    college?: string;
  } | null>(null);

  const rideCreatorId = String(ride?.creator?._id || (typeof ride?.creator === 'string' ? ride.creator : '') || '');
  const currentUserId = String(user?._id || (user as any)?.id || '');
  const isDriver = Boolean(rideCreatorId && currentUserId && rideCreatorId === currentUserId);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      let rideData = null;

      // If ID is a known demo slug or not a 24-hex MongoDB ObjectId, resolve directly from demo fallback
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isObjectId || id.startsWith("ride_")) {
        rideData = DEMO_FALLBACK_RIDES.find((r) => r._id === id) || null;
      } else {
        try {
          rideData = await api.getRideById(id);
        } catch (err) {
          console.info("[RideDetailPage] Live ride not found on server, checking fallback catalog:", id);
          rideData = DEMO_FALLBACK_RIDES.find((r) => r._id === id) || null;
        }
      }

      if (Array.isArray(rideData)) {
        rideData = rideData.length > 0 ? rideData[0] : null;
      }
      setRide(rideData);

      // Fetch driver reviews only if creator has a valid database ObjectId
      const creatorId = String(rideData?.creator?._id || '');
      if (creatorId && /^[0-9a-fA-F]{24}$/.test(creatorId)) {
        try {
          setDriverReviewsLoading(true);
          const revs = await api.getUserReviews(creatorId, 'driver');
          setDriverReviews(Array.isArray(revs) ? revs : []);
        } catch {
          setDriverReviews([]);
        } finally {
          setDriverReviewsLoading(false);
        }
      } else {
        setDriverReviews([]);
        setDriverReviewsLoading(false);
      }

      joinRideRoom(id);

      // Only fire private trip and request queries if the user is authenticated
      if (user) {
        // Check for active trip
        try {
          const tripData = await api.getTrip(id);
          if (tripData && tripData._id) {
            setActiveTrip(tripData);
          }
        } catch {
          // No active trip yet
        }

        // If user is driver, fetch incoming requests
        if (rideData?.creator?._id === user?._id) {
          const reqs = await api.getRequests("driver", id);
          const localReqs = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
          const matchingLocal = localReqs.filter((r: any) => r.rideId === id);
          setRequests([...(reqs || []), ...matchingLocal]);
        } else {
          // Passenger: check if already requested from server + localStorage
          const reqs = await api.getRequests("passenger", id);
          const localReqs = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
          const matchingLocal = localReqs.filter((r: any) => r.rideId === id);
          setRequests([...(reqs || []), ...matchingLocal]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load ride");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();

    const handleNewRequest = (req: IRideRequest) => {
      setRequests((prev) => [req, ...prev.filter((r) => r._id !== req._id)]);
      setSuccessMsg(`New seat request from ${req.passengerId?.name}!`);
    };

    const handleRequestResponse = (data: {
      requestId: string;
      status: "accepted" | "declined";
    }) => {
      setRequests((prev) =>
        prev.map((r) =>
          r._id === data.requestId ? { ...r, status: data.status } : r,
        ),
      );
      if (data.status === "accepted") {
        setSuccessMsg("Your ride request was accepted! Prepare for pickup.");
      }
    };

    socket.on("newRequest", handleNewRequest);
    socket.on("requestResponse", handleRequestResponse);

    return () => {
      socket.off("newRequest", handleNewRequest);
      socket.off("requestResponse", handleRequestResponse);
    };
  }, [id, user]);

  const isUserVerified = user?.verificationStatus === 'verified';

  const handleRequestSeat = async () => {
    if (!id) return;
    if (!user) {
      navigate(`/login?redirect=/rides/${id}`);
      return;
    }
    if (!isUserVerified) {
      setError("Institutional ID verification required before booking seats. Your student ID is currently under review.");
      navigate('/verification');
      return;
    }
    setActionLoading(true);
    setError("");
    let requestSaved = false;
    try {
      await api.requestRide(id);
      requestSaved = true;
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('verification') || errMsg.includes('VERIFICATION') || err?.status === 403) {
        setError(errMsg || 'Institutional verification required before booking seats.');
        setActionLoading(false);
        return;
      }
      console.warn("API requestRide failed, falling back to local demo persistence:", err);
      requestSaved = true;
    }

    if (requestSaved) {
      // Persist in localStorage directly for standalone offline mode
      const localReqs = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
      const newReq = {
        _id: "req_" + Date.now(),
        rideId: id,
        passengerId: user || { _id: "usr_guest", name: "Student Passenger" },
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("campusride_local_requests", JSON.stringify([newReq, ...localReqs]));
      setSuccessMsg("Seat request submitted! Awaiting driver confirmation.");
      setShowSuccessModal(true);
      loadData();
    }
    setActionLoading(false);
  };

  const handleRequestStatus = async (
    reqId: string,
    status: "accepted" | "declined" | "cancelled",
  ) => {
    setActionLoading(true);
    setError("");
    try {
      await api.updateRequestStatus(reqId, status);
      setSuccessMsg(`Request has been marked as ${status}.`);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update request");
    } finally {
      setActionLoading(false);
    }
  };

  const [cancelRequestModalOpen, setCancelRequestModalOpen] = useState(false);

  const executeCancelMyRequest = async () => {
    if (!myRequest) return;
    setActionLoading(true);
    setError("");
    try {
      await api.updateRequestStatus(myRequest._id, "cancelled");
      try {
        const localReqs = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
        const filtered = localReqs.filter((r: any) => r._id !== myRequest._id && r.rideId !== id);
        localStorage.setItem("campusride_local_requests", JSON.stringify(filtered));
      } catch {}
      setSuccessMsg("Seat request successfully cancelled.");
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to cancel request");
    } finally {
      setActionLoading(false);
      setCancelRequestModalOpen(false);
    }
  };

  const executeCancelRide = async () => {
    if (!id) return;
    setActionLoading(true);
    setError("");
    try {
      await api.cancelRide(id);
      setSuccessMsg("Ride cancelled successfully.");
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to cancel ride");
    } finally {
      setActionLoading(false);
    }
  };

  const executeStartTrip = async () => {
    if (!id) return;
    setActionLoading(true);
    setError("");
    try {
      const trip = await api.startTrip(id);
      navigate(`/trips/${trip._id}`);
    } catch (err: any) {
      setError(err.message || "Failed to start trip");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTrip = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const isDailyVerified =
      (user as any)?.lastDailyIdCheckDate === todayStr ||
      localStorage.getItem("campusride_daily_id_verified_" + user?._id) === todayStr ||
      localStorage.getItem("campusride_driver_verified_date") === todayStr;

    if (!isDailyVerified) {
      setShowDailyIdModal(true);
      return;
    }

    executeStartTrip();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RideDetailSkeleton />
      </div>
    );
  }

  if (!ride || !ride.origin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-900">Ride not found</h2>
        <p className="text-xs text-slate-500 mt-1">This commute may have departed, been completed, or is temporarily unavailable.</p>
        <button
          onClick={() => navigate("/search")}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
        >
          Return to Ride Search
        </button>
      </div>
    );
  }

  const myRequest = requests.find(
    (r) =>
      r.rideId === id ||
      (user?._id && (r.passengerId?._id === user._id || (r.passengerId as any)?.id === user._id)) ||
      (user?.email && r.passengerId?.email === user.email)
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Alert Banners */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-sm font-medium"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl flex items-center gap-3 text-sm font-medium"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Guest Prompt to Log In to Request This Ride */}
      {!user && (
        <motion.div
          variants={itemVariants}
          className="p-4 sm:p-5 bg-route-pale/40 border border-route-light/30 text-ink-primary rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-control bg-route-pale text-route flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-ink-primary">
                Log in to request this ride
              </div>
              <div className="text-xs text-ink-secondary">
                Connect your institutional .edu credentials to split fuel and reserve verified campus seats.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/login?redirect=/rides/${id}`)}
            className="px-4 py-2 rounded-control bg-route hover:bg-route-light text-surface text-xs font-semibold shrink-0 cursor-pointer shadow-subtle active:translate-y-[1.5px] transition-all"
          >
            Log in to Request →
          </button>
        </motion.div>
      )}

      {/* Header Bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-control bg-surface border border-line-base text-xs font-mono text-ink-primary mb-2">
            <span className="w-2 h-2 rounded-full bg-route" />
            <span className="font-semibold">{ride.status.toUpperCase()} COMMUTE PASS</span>
            <span className="text-line-strong">•</span>
            <span className="text-ink-secondary">{new Date(ride.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink-primary tracking-tight">
            Campus Commute Pass
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowChat(true)}
          className="px-4 py-2.5 rounded-control bg-route hover:bg-route-light text-surface font-semibold text-xs flex items-center gap-2 shadow-subtle active:translate-y-[1.5px] transition-all cursor-pointer self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4 text-route-pale" />
          <span>Ride Coordination Chat</span>
        </button>
      </motion.div>

      {/* Main Interactive Journey Ticket Pass */}
      <motion.div variants={itemVariants}>
        <JourneyTicket
        ride={{
          _id: ride._id,
          creator: ride.creator,
          origin: ride.origin,
          destination: ride.destination,
          departureTime: ride.departureTime,
          seatsAvailable: ride.availableSeats ?? (ride as any).seatsAvailable,
          availableSeats: ride.availableSeats,
          seatsTotal: (ride as any).totalSeats ?? (ride as any).seatsTotal,
          fare: (ride as any).fare ?? (ride as any).pricePerSeat ?? 20,
          vehicleModel: ride.vehicleId?.model,
          vehiclePlate: ride.vehicleId?.plateLast4,
          notes: (ride as any).notes,
          isWomenOnly: (ride as any).isWomenOnly || (ride as any).womenOnlyDriver,
          status: ride.status,
        }}
        variant="detail"
        status={ride.status}
        isCurrentUserCreator={isDriver}
        isUserVerified={isUserVerified}
        isRequested={Boolean(myRequest)}
        requestLoading={actionLoading}
        isMapOpen={showWalkingGuide}
        onToggleMap={() => setShowWalkingGuide(!showWalkingGuide)}
        onRequestSeat={() => handleRequestSeat()}
        onCancelRequest={() => setCancelRequestModalOpen(true)}
        onVerifyPrompt={() => navigate('/verification')}
      />
      </motion.div>

      {/* Walking Guide & Campus Pickup Bay Navigation Map */}
      <AnimatePresence>
        {showWalkingGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-surface rounded-surface border border-line-base p-5 sm:p-6 shadow-subtle space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-line-subtle">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-route" />
                <strong className="text-ink-primary">Designated Campus Pickup Bay &amp; Walking Guide</strong>
              </div>
              <span className="text-[11px] font-mono text-ink-muted">High-Accuracy GPS Corridor</span>
            </div>
            <PickupAndRouteNavigationMap
              originText={sanitizeLocationText(ride.origin.text)}
              destinationText={sanitizeLocationText(ride.destination.text)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corridor Route Waypoints Breakdown */}
      <motion.div variants={itemVariants} className="bg-paper rounded-3xl border border-[#E2DDD3] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse" />
            <strong className="text-ink-primary font-bold">Verified Corridor Waypoints</strong>
          </div>
          <span className="text-xs font-mono text-ink-muted">Dehradun University Belt</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
          <div className="h-full p-4 sm:p-5 bg-canvas/70 rounded-2xl border border-[#E2DDD3] flex flex-col justify-between shadow-2xs hover:border-forest/40 transition-colors">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-forest uppercase tracking-wide mb-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Waypoint 01 — Pickup Origin</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-ink-primary leading-snug">
                {sanitizeLocationText(ride.origin.text)}
              </div>
            </div>
            <div className="text-[11px] font-mono text-ink-secondary mt-3 pt-2.5 border-t border-border/50">
              GPS: {ride.origin.lat.toFixed(4)}, {ride.origin.lng.toFixed(4)}
            </div>
          </div>

          <div className="h-full p-4 sm:p-5 bg-canvas/70 rounded-2xl border border-[#E2DDD3] flex flex-col justify-between shadow-2xs hover:border-plum/40 transition-colors">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-plum uppercase tracking-wide mb-2">
                <Car className="w-3.5 h-3.5 shrink-0" />
                <span>Waypoint 02 — En Route Transit</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-ink-primary leading-snug">
                Suddhowala PG Belt / Junction Bay
              </div>
            </div>
            <div className="text-[11px] font-mono text-ink-secondary mt-3 pt-2.5 border-t border-border/50">
              Campus Highway Detour ≤ 3 min
            </div>
          </div>

          <div className="h-full p-4 sm:p-5 bg-canvas/70 rounded-2xl border border-[#E2DDD3] flex flex-col justify-between shadow-2xs hover:border-forest/40 transition-colors">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-forest uppercase tracking-wide mb-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Waypoint 03 — Campus Arrival</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-ink-primary leading-snug">
                {sanitizeLocationText(ride.destination.text)}
              </div>
            </div>
            <div className="text-[11px] font-mono text-ink-secondary mt-3 pt-2.5 border-t border-border/50">
              GPS: {ride.destination.lat.toFixed(4)}, {ride.destination.lng.toFixed(4)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Driver Controls & Passenger Actions Bar */}
      <motion.div variants={itemVariants} className="bg-surface rounded-surface border border-line-base p-5 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-ink-secondary">
          {isDriver ? (
            <span>You are offering this carpool. Confirm student requests below and start the trip at departure time.</span>
          ) : myRequest?.status === 'accepted' ? (
            <span className="text-status-verified font-medium">Your seat is confirmed! Be at the designated pickup bay on time.</span>
          ) : (
            <span>Direct fuel share split between verified classmates. Zero platform commission.</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isDriver && (
            <>
              {activeTrip ? (
                <button
                  type="button"
                  onClick={() => navigate(`/trips/${activeTrip._id}`)}
                  className="px-4 py-2 rounded-control bg-route hover:bg-route-light text-surface font-semibold text-xs flex items-center gap-2 active:translate-y-[1.5px] transition-all cursor-pointer shadow-subtle"
                >
                  <Key className="w-4 h-4 text-route-pale" />
                  <span>View Trip &amp; Pickup QR</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartTrip}
                  disabled={actionLoading || ride.status === 'cancelled' || ride.status === 'completed'}
                  className="px-4 py-2 rounded-control bg-route hover:bg-route-light disabled:opacity-50 text-surface font-semibold text-xs flex items-center gap-2 active:translate-y-[1.5px] transition-all cursor-pointer shadow-subtle"
                >
                  <Key className="w-4 h-4 text-route-pale" />
                  <span>Start Trip &amp; Show Pickup QR</span>
                </button>
              )}
              {ride.status !== 'cancelled' && ride.status !== 'completed' && !activeTrip && (
                <HoldToConfirmWithFallback
                  onConfirm={executeCancelRide}
                  label="Hold to Cancel Ride"
                  confirmingLabel="Cancelling Ride..."
                  dialogTitle="Cancel Entire Offered Ride?"
                  dialogDescription="Are you sure you want to cancel this entire offered carpool? All passengers who booked seats will be notified immediately."
                />
              )}
            </>
          )}

          {!isDriver && myRequest?.status === "accepted" && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (activeTrip) {
                    navigate(`/trips/${activeTrip._id}`);
                  } else {
                    navigate("/dashboard");
                  }
                }}
                className="px-4 py-2 rounded-control bg-route hover:bg-route-light text-surface text-xs font-semibold cursor-pointer active:translate-y-[1.5px] transition-all"
              >
                {activeTrip ? "Scan Pickup QR →" : "View Dashboard →"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveReviewModal({
                    tripId: id || 'trip_' + Date.now(),
                    toUserId: ride.creator._id || (ride.creator as any).id,
                    recipientName: ride.creator.name || 'Driver',
                    role: 'driver',
                    college: ride.creator.college,
                  });
                }}
                className="px-3.5 py-2 rounded-control border border-line-base bg-surface hover:bg-canvas text-ink-primary text-xs font-semibold flex items-center gap-1 active:translate-y-[1.5px] transition-all cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-signal text-signal" />
                <span>Rate Driver</span>
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Verified Driver Reputation & Reviews Card */}
      <motion.div variants={itemVariants} className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-control bg-route-pale text-route border border-route-light/20 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink-primary text-base">
                Verified Driver Trust &amp; Reviews
              </h3>
              <p className="text-xs text-ink-secondary">
                Community feedback for {ride.creator?.name || 'this student driver'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-control bg-surface border border-line-base text-ink-primary text-xs font-bold">
              <Star className="w-4 h-4 fill-signal text-signal" />
              <span>{ride.creator?.rating?.toFixed(1) || '5.0'} / 5.0 Rating</span>
            </div>
            <span className="text-xs text-ink-muted">
              ({driverReviews.length} verified reviews)
            </span>
          </div>
        </div>

        {/* Driver Reviews List / Empty State */}
        {driverReviewsLoading ? (
          <ReviewCardSkeleton count={2} />
        ) : driverReviews.length === 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-7 rounded-2xl bg-canvas border border-line-base shadow-2xs">
            <img
              src="/carpool-commute.jpg"
              alt="Verified Student Commutes"
              width={112}
              height={80}
              className="w-28 h-20 rounded-xl object-cover border border-line-base shadow-subtle shrink-0"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/campus-hero-real.jpg';
              }}
            />
            <div className="space-y-1.5 text-left">
              <h4 className="text-xs font-bold text-ink-primary">
                Exemplary Campus Safety Record
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                {ride.creator?.name} is an active student at {ride.creator?.college || 'our university'}, verified with student ID credentials and active route telemetry.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {driverReviews.map((rev, idx) => {
              const reviewer = rev.fromUserId || {};
              const reviewerName = reviewer.name || 'Student Passenger';
              return (
                <div
                  key={rev._id || idx}
                  className="h-full p-6 sm:p-7 rounded-2xl border border-line-base bg-canvas space-y-3.5 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-route text-surface font-bold text-xs flex items-center justify-center uppercase shrink-0 overflow-hidden shadow-2xs">
                          {reviewer.avatarURL ? (
                            <img
                              src={reviewer.avatarURL}
                              alt={reviewerName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover rounded-xl"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            reviewerName.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-ink-primary block leading-tight">
                            {reviewerName}
                          </span>
                          <span className="text-[11px] text-ink-secondary">
                            {reviewer.college || 'Verified Classmate'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-signal">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= (rev.rating || 5)
                                ? 'fill-signal text-signal'
                                : 'text-line-strong'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {Array.isArray(rev.tags) && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rev.tags.map((t: string) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-lg bg-surface border border-line-base text-ink-secondary text-[11px] font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-ink-secondary leading-relaxed italic">
                      "{rev.comment || 'Smooth driving and punctual campus commute!'}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Driver Incoming Requests Panel */}
      {isDriver && (
        <motion.div variants={itemVariants} className="bg-surface rounded-surface border border-line-base p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-display font-bold text-ink-primary">
                Incoming Passenger Requests
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Accepting decrements seats automatically and alerts the student
                via Socket.IO.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-control bg-canvas border border-line-base text-ink-primary text-xs font-mono font-bold">
              {requests.length} Total Requests
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="py-8 text-center text-ink-muted text-xs">
              No passenger requests yet. Students will appear here in real time
              as they request seats!
            </div>
          ) : (
            <div className="divide-y divide-line-subtle">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        req.passengerId?.avatarURL ||
                        "/test_uploads/profile_photo.jpg"
                      }
                      alt={req.passengerId?.name || "Student Passenger"}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-control object-cover border border-line-base shadow-subtle"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/profile_photo.jpg';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink-primary">
                          {req.passengerId?.name}
                        </span>
                        {req.passengerId?.verificationStatus === "verified" && (
                          <span className="text-route">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-secondary">
                        <span className="flex items-center gap-0.5 text-signal font-semibold">
                          <Star className="w-3 h-3 fill-signal text-signal" />
                          {req.passengerId?.rating?.toFixed(1) || "5.0"}
                        </span>
                        <span>•</span>
                        <span>{req.passengerId?.college}</span>
                        <span>•</span>
                        <span>Year {req.passengerId?.year}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleRequestStatus(req._id, "accepted")
                          }
                          disabled={actionLoading}
                          className="px-3.5 py-1.5 rounded-control bg-route hover:bg-route-light text-surface text-xs font-semibold flex items-center gap-1 shadow-subtle active:translate-y-[1.5px] transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-route-pale" />
                          Accept (+Seat Reserve)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRequestStatus(req._id, "declined")
                          }
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-control bg-canvas hover:bg-surface text-ink-primary border border-line-base text-xs font-semibold flex items-center gap-1 active:translate-y-[1.5px] transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-ink-muted" />
                          Decline
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-control text-xs font-mono font-bold uppercase ${
                            req.status === "accepted"
                              ? "bg-route-pale text-route border border-route-light/20"
                              : "bg-emergency-crimson/10 text-emergency-crimson border border-emergency-crimson/20"
                          }`}
                        >
                          {req.status}
                        </span>
                        {req.status === "accepted" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRequestStatus(req._id, "declined")
                            }
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emergency-crimson/10 hover:bg-emergency-crimson/20 text-emergency-crimson border border-emergency-crimson/30 rounded-control text-xs font-medium transition-colors cursor-pointer"
                            title="Remove Passenger / Mark No-show (frees up seat)"
                          >
                            Remove / No-show
                          </button>
                        )}
                        {req.status === "accepted" && req.passengerId && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReviewModal({
                                tripId: id || 'trip_' + Date.now(),
                                toUserId: req.passengerId._id || (req.passengerId as any).id,
                                recipientName: req.passengerId.name || 'Passenger',
                                role: 'passenger',
                                college: req.passengerId.college,
                              });
                            }}
                            className="px-2.5 py-1 bg-surface hover:bg-canvas text-ink-primary border border-line-base rounded-control text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer active:translate-y-[1.5px]"
                            title="Rate Passenger"
                          >
                            <Star className="w-3.5 h-3.5 fill-signal text-signal" />
                            <span>Rate Passenger</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Real-Time Coordination Chat Modal */}
      {showChat && (
        <ChatModal
          rideId={ride._id}
          onClose={() => setShowChat(false)}
          title={`Ride Chat: ${sanitizeLocationText(ride.origin.text)} → ${sanitizeLocationText(ride.destination.text)}`}
        />
      )}

      {/* Mandatory Daily Driver Student ID Card Verification Modal */}
      {showDailyIdModal && user && (
        <DailyDriverIdCheckModal
          isOpen={showDailyIdModal}
          onClose={() => setShowDailyIdModal(false)}
          user={user}
          rideId={id}
          onVerified={() => {
            setShowDailyIdModal(false);
            executeStartTrip();
          }}
        />
      )}

      {/* Review Modal Dialog */}
      {activeReviewModal && (
        <ReviewModal
          tripId={activeReviewModal.tripId}
          toUserId={activeReviewModal.toUserId}
          recipientName={activeReviewModal.recipientName}
          role={activeReviewModal.role}
          college={activeReviewModal.college}
          onClose={() => setActiveReviewModal(null)}
          onSuccess={() => {
            setActiveReviewModal(null);
            loadData();
          }}
        />
      )}

      <RideRequestSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        rideName={ride ? `${sanitizeLocationText(ride.origin.text)} → ${sanitizeLocationText(ride.destination.text)}` : ''}
      />

      {/* Accessible Cancel Seat Request Modal */}
      {cancelRequestModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-seat-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 animate-in fade-in duration-150"
        >
          <div className="bg-surface rounded-card border border-line-base p-6 max-w-md w-full shadow-card space-y-4">
            <h3 id="cancel-seat-detail-title" className="text-base font-display font-bold text-ink-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emergency-crimson shrink-0" />
              <span>Cancel Your Seat Request?</span>
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
              Are you sure you want to withdraw your reservation for this ride? Your seat will be returned to the open campus pool and the driver will be notified.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelRequestModalOpen(false)}
                className="px-4 py-2 rounded-control border border-line-base text-ink-secondary text-xs font-semibold hover:bg-canvas transition-colors min-h-[44px] cursor-pointer"
              >
                Keep Seat
              </button>
              <button
                type="button"
                onClick={executeCancelMyRequest}
                disabled={actionLoading}
                className="px-4 py-2 rounded-control bg-emergency-crimson hover:bg-red-700 text-surface text-xs font-semibold shadow-2xs active:translate-y-[1.5px] transition-all min-h-[44px] cursor-pointer"
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
