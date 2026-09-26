import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
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
  Star,
  ArrowRight,
  MessageSquare,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const RideDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState<IRide | null>(null);
  const [requests, setRequests] = useState<IRideRequest[]>([]);
  const [activeTrip, setActiveTrip] = useState<ITrip | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDailyIdModal, setShowDailyIdModal] = useState(false);

  const isDriver = ride?.creator?._id === user?._id;

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      let rideData = await api.getRideById(id);
      if (Array.isArray(rideData)) {
        rideData = rideData.length > 0 ? rideData[0] : null;
      }
      setRide(rideData);

      joinRideRoom(id);

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

  const handleRequestSeat = async () => {
    if (!id) return;
    setActionLoading(true);
    setError("");
    try {
      await api.requestRide(id);
      // Persist in localStorage directly for seamless Vercel / offline mode
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
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to request seat");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestStatus = async (
    reqId: string,
    status: "accepted" | "declined",
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
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading ride details...
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Alert Banners */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Ride Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                {ride.status}
              </span>
              <span className="text-xs text-slate-400">
                Created on {new Date(ride.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Campus Commute Details
            </h1>
          </div>

          {/* Chat Action */}
          <button
            type="button"
            onClick={() => setShowChat(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Ride Coordination Chat
          </button>
        </div>

        {/* Route Visual Section */}
        <div className="py-6 space-y-4">
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center pt-1">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-200" />
                <div className="w-0.5 h-12 bg-slate-300 my-1" />
                <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-200" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                    Departure Origin
                  </span>
                  <div className="text-base font-bold text-slate-900">
                    {ride.origin.text}
                  </div>
                  <div className="text-xs text-slate-500">
                    Coords: ({ride.origin.lat.toFixed(4)},{" "}
                    {ride.origin.lng.toFixed(4)})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                    Destination Arrival
                  </span>
                  <div className="text-base font-bold text-slate-900">
                    {ride.destination.text}
                  </div>
                  <div className="text-xs text-slate-500">
                    Coords: ({ride.destination.lat.toFixed(4)},{" "}
                    {ride.destination.lng.toFixed(4)})
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 text-emerald-600" /> Departure Time
              </div>
              <div className="text-sm font-bold text-slate-900">
                {new Date(ride.departureTime).toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                ,{" "}
                {new Date(ride.departureTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Users className="w-4 h-4 text-emerald-600" /> Capacity
              </div>
              <div className="text-sm font-bold text-slate-900">
                {ride.availableSeats} Seats Currently Free
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Car className="w-4 h-4 text-emerald-600" /> Vehicle
              </div>
              <div className="text-sm font-bold text-slate-900">
                {ride.vehicleId?.model || "Car"} (
                {ride.vehicleId?.plateLast4 || "N/A"})
              </div>
            </div>
          </div>

          {/* Interactive Google Maps Commute & Pickup Navigation Map */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span>🗺️ Verified Highway Route & Designated Campus Pickup Bay</span>
            </h3>
            <PickupAndRouteNavigationMap
              originText={ride.origin.text}
              destinationText={ride.destination.text}
            />
          </div>
        </div>

        {/* Driver Profile */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {ride.creator?.avatarURL ? (
              <img
                src={ride.creator.avatarURL}
                alt={ride.creator?.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#143D32] to-[#10b981] text-white font-black text-lg flex items-center justify-center uppercase ring-2 ring-emerald-500/20 select-none">
                {ride.creator?.name ? ride.creator.name.trim().charAt(0) : 'D'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {ride.creator?.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Verified Driver
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {ride.creator?.rating?.toFixed(1) || "5.0"}
                </span>
                <span>•</span>
                <span>{ride.creator?.college}</span>
                <span>•</span>
                <span>{ride.creator?.totalRides || 0} rides completed</span>
              </div>
            </div>
          </div>

          {/* Driver Actions (Start Trip or View Active Trip QR) */}
          {isDriver && (
            <div className="flex items-center gap-2">
              {activeTrip ? (
                <button
                  type="button"
                  onClick={() => navigate(`/trips/${activeTrip._id}`)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  View Trip & Pickup QR
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartTrip}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  Start Trip & Show Pickup QR
                </button>
              )}
            </div>
          )}

          {/* Passenger Actions (Request Seat or View QR / Boarding Pass) */}
          {!isDriver && (
            <div>
              {myRequest ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 ${
                      myRequest.status === "accepted"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : myRequest.status === "pending"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Request Sent ({myRequest.status})</span>
                  </span>
                  {myRequest.status === "accepted" && (
                    <button
                      onClick={() => {
                        if (activeTrip) {
                          navigate(`/trips/${activeTrip._id}`);
                        } else {
                          navigate("/dashboard");
                        }
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer shadow-sm"
                    >
                      {activeTrip ? "Scan Pickup QR →" : "View Dashboard →"}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestSeat}
                  disabled={actionLoading || ride.availableSeats <= 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Request Seat Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Walk-to-Pickup & Route Choice Navigation Map */}
      <PickupAndRouteNavigationMap
        originText={ride.origin.text}
        destinationText={ride.destination.text}
      />

      {/* Driver Incoming Requests Panel */}
      {isDriver && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Incoming Passenger Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accepting decrements seats automatically and alerts the student
                via Socket.IO.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              {requests.length} Total Requests
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No passenger requests yet. Students will appear here in real time
              as they request seats!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        req.passengerId?.avatarURL ||
                        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80"
                      }
                      alt={req.passengerId?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {req.passengerId?.name}
                        </span>
                        {req.passengerId?.verificationStatus === "verified" && (
                          <span className="text-emerald-600">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-500" />
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
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept (+Seat Reserve)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRequestStatus(req._id, "declined")
                          }
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          req.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Real-Time Coordination Chat Modal */}
      {showChat && (
        <ChatModal
          rideId={ride._id}
          onClose={() => setShowChat(false)}
          title={`Ride Chat: ${ride.origin.text} → ${ride.destination.text}`}
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
    </div>
  );
};
