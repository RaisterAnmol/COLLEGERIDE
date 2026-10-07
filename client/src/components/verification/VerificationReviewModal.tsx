import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Building,
  Car,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import { api } from "../../services/api";

interface VerificationReviewModalProps {
  request: any | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

type DocType = "idDocument" | "drivingLicense" | "selfie";

export const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<DocType>("idDocument");
  const [docBlobUrls, setDocBlobUrls] = useState<Record<string, string>>({});
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject reason state
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const STANDARD_REASONS = [
    "Student ID photo is blurry or unreadable",
    "Student ID is expired or academic session does not match",
    "Driving license expired, invalid, or name does not match",
    "Selfie image does not match student ID photo",
    "Name on ID card does not match student profile",
    "Incomplete institutional credentials provided",
  ];

  const user = request?.userId || {};
  const isDriver =
    request?.accountType === "DRIVER" ||
    request?.role === "driver" ||
    user?.role === "driver" ||
    !!request?.driverIdentifier;

  // Load protected document blob URLs securely
  useEffect(() => {
    if (!isOpen || !request?._id) return;
    let isMounted = true;
    setShowRejectForm(false);
    setRejectReason("");
    setSelectedTemplate("");
    setZoomScale(1);

    const loadDocuments = async () => {
      setLoadingDocs(true);
      const urls: Record<string, string> = {};

      const fetchDoc = async (type: DocType) => {
        try {
          if (type === "idDocument") {
            const directId = request.idDocumentStorageKey || request.documentStorageKey || user.enrolledIdCardUrl;
            if (directId && (directId.startsWith("data:") || directId.startsWith("http") || directId.startsWith("/"))) {
              urls[type] = directId;
              return;
            }
          } else if (type === "selfie") {
            const directSelfie = request.selfieStorageKey || user.avatarURL;
            if (directSelfie && (directSelfie.startsWith("data:") || directSelfie.startsWith("http") || directSelfie.startsWith("/"))) {
              urls[type] = directSelfie;
              return;
            }
          } else if (type === "drivingLicense") {
            const directDl = request.drivingLicenseStorageKey;
            if (directDl && (directDl.startsWith("data:") || directDl.startsWith("http") || directDl.startsWith("/"))) {
              urls[type] = directDl;
              return;
            }
          }

          const blobUrl = await api.getDocumentBlobUrl(request._id, type);
          urls[type] = blobUrl;
        } catch (_) {
          // Fallback to user profile assets
          if (type === "idDocument" && user.enrolledIdCardUrl) {
            urls[type] = user.enrolledIdCardUrl;
          } else if (type === "selfie" && user.avatarURL) {
            urls[type] = user.avatarURL;
          }
        }
      };

      await Promise.all([
        fetchDoc("idDocument"),
        isDriver ? fetchDoc("drivingLicense") : Promise.resolve(),
        fetchDoc("selfie"),
      ]);

      if (isMounted) {
        setDocBlobUrls(urls);
        setLoadingDocs(false);
      }
    };

    loadDocuments();

    return () => {
      isMounted = false;
      // Cleanup object URLs to prevent memory leaks
      Object.values(docBlobUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [isOpen, request?._id, isDriver]);

  if (!isOpen || !request) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(request._id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const finalReason = rejectReason || selectedTemplate;
    if (!finalReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(request._id, finalReason.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDocUrl = docBlobUrls[activeTab];

  return (
    <div className="fixed inset-0 z-50 bg-[#143D32]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-900 flex items-center justify-between bg-[#143D32] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Institutional Verification Review
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    request.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : request.status === "rejected"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Application #{request._id.slice(-8)} • Submitted{" "}
                {new Date(request.createdAt || request.submittedAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 2 Columns on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Applicant Credentials Details (5 cols) */}
          <div className="md:col-span-5 p-5 border-r border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[#143D32] font-bold text-lg">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "ST"}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{user.name || "Student Applicant"}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#143D32] border border-emerald-200 uppercase">
                    {request.accountType || (isDriver ? "DRIVER" : "PASSENGER")}
                  </span>
                  {user.phone && (
                    <span className="text-[11px] text-slate-500">{user.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  College / Campus:
                </span>
                <span className="font-semibold text-slate-900 truncate max-w-[160px]">
                  {user.college || "Uttaranchal University"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  Student Roll / ID:
                </span>
                <span className="font-semibold font-mono text-[#143D32]">
                  {request.studentIdentifier || "N/A"}
                </span>
              </div>

              {user.department && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-medium text-slate-700">{user.department}</span>
                </div>
              )}

              {user.course && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500">Course & Year:</span>
                  <span className="font-medium text-slate-700">
                    {user.course} {user.year ? `(Year ${user.year})` : ""}
                  </span>
                </div>
              )}

              {isDriver && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    Driving License No:
                  </span>
                  <span className="font-mono font-bold text-emerald-300">
                    {request.driverIdentifier || "DL Attached"}
                  </span>
                </div>
              )}
            </div>

            {/* Quality check summary */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
              <span className="font-semibold text-slate-300">Biometric Verification:</span>
              <div className="flex items-center justify-between text-slate-500">
                <span>Face Quality Score:</span>
                <span className="font-bold text-emerald-400">
                  {user.faceEnrollmentStatus === "ENROLLED" ? "Passed (100%)" : "Submitted"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Consent Given:</span>
                <span className="text-emerald-400 font-semibold">Yes (On-Device)</span>
              </div>
            </div>

            {request.rejectionReason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Prior Rejection Note:
                </span>
                <p className="text-slate-300 mt-1">{request.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Right Column: Protected Documents Previewer (7 cols) */}
          <div className="md:col-span-7 p-5 flex flex-col bg-white">
            {/* Document Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("idDocument");
                  setZoomScale(1);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "idDocument"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-600 hover:text-slate-900 bg-slate-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Student ID
              </button>

              {isDriver && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("drivingLicense");
                    setZoomScale(1);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "drivingLicense"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-600 hover:text-slate-900 bg-slate-100"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  Driving License
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab("selfie");
                  setZoomScale(1);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "selfie"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-600 hover:text-slate-900 bg-slate-100"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Enrolled Selfie
              </button>

              {/* Zoom controls */}
              {currentDocUrl && (
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setZoomScale((s) => Math.min(s + 0.25, 3))}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale((s) => Math.max(s - 0.25, 0.5))}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Document display viewport */}
            <div className="flex-1 min-h-[320px] bg-[#0B1E19] border border-slate-300 rounded-xl mt-3 p-4 flex items-center justify-center overflow-auto relative shadow-inner">
              {loadingDocs ? (
                <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  <span>Loading authenticated document...</span>
                </div>
              ) : currentDocUrl ? (
                <img
                  src={currentDocUrl}
                  alt={activeTab}
                  style={{
                    transform: `scale(${zoomScale})`,
                    transition: "transform 0.15s ease-out",
                  }}
                  className="max-w-full max-h-[50vh] object-contain rounded shadow-lg origin-center"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 text-xs text-center p-6">
                  <FileText className="w-10 h-10 text-slate-600" />
                  <p>Document not found or pending upload for this tab.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Decision Panel */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-3">
          {showRejectForm ? (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">
                  Select or Enter Institutional Rejection Reason:
                </span>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Standard templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {STANDARD_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(r);
                      setRejectReason(r);
                    }}
                    className={`text-left p-2 rounded-lg text-xs border transition-colors ${
                      selectedTemplate === r
                        ? "border-rose-500 bg-rose-500/10 text-rose-300 font-semibold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                placeholder="Custom explanation sent to student..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-200 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Reviewed under University Carpool Trust & Safety Guidelines
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isSubmitting || request.status === "rejected"}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Request
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting || request.status === "approved"}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl shadow-md bg-[#143D32] hover:bg-[#0E2C24] text-white transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Approve Verification
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
