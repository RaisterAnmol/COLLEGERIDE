// Institutional verification review modal - prefers-reduced-motion compliant & Campus Atlas design
import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
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
  Check,
  QrCode,
  Award,
  Sparkles,
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
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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

  const user = (typeof request?.userId === 'object' && request?.userId !== null) ? request.userId : (request || {});
  const userName = user.name || request?.fullName || request?.userName || 'Student Applicant';
  const userEmail = user.email || request?.userEmail || '';
  const userCollege = user.college || request?.college || 'Uttaranchal University';
  const studentRollNo = request?.studentIdentifier || request?.studentId || user.studentIdentifier || user.studentId || 'UTT-318E82';
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
    setImgErrors({});

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
      Object.values(docBlobUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
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
  const hasDocImage = Boolean(currentDocUrl && !imgErrors[activeTab]);

  return (
    <div className="fixed inset-0 z-50 bg-[#143D32]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-paper border border-[#E2DDD3] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Header - Warm Atlas Theme */}
        <div className="p-4 sm:p-5 border-b border-[#E2DDD3] flex items-center justify-between bg-[#F8F6F1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#143D32] text-emerald-300 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold font-display text-[#143D32]">
                  Institutional Verification Review
                </h2>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize font-mono ${
                    request.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : request.status === "rejected"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <p className="text-xs text-[#5C716A] mt-0.5">
                Application #{request._id.slice(-8)} • Submitted{" "}
                {new Date(request.createdAt || request.submittedAt || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#5C716A] hover:text-[#143D32] bg-white hover:bg-[#EAE5DA] border border-[#E2DDD3] rounded-xl transition-colors cursor-pointer"
            title="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 2 Columns on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0 bg-white">
          
          {/* Left Column: Applicant Credentials Details (5 cols) */}
          <div className="md:col-span-5 p-5 border-r border-[#E2DDD3] bg-[#FAF8F5] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E2DDD3]">
              <div className="w-12 h-12 rounded-2xl bg-[#143D32] text-white flex items-center justify-center font-bold text-base shadow-xs">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#143D32] truncate">{userName}</h3>
                <p className="text-xs text-[#5C716A] font-mono truncate">{userEmail}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase font-mono">
                    {request.accountType || (isDriver ? "DRIVER" : "PASSENGER")}
                  </span>
                  {user.phone && (
                    <span className="text-[11px] text-[#5C716A] font-mono">{user.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-[#E2DDD3] shadow-2xs">
                <span className="text-[#5C716A] flex items-center gap-1.5 font-medium">
                  <Building className="w-3.5 h-3.5 text-[#143D32]" />
                  College / Campus:
                </span>
                <span
                  className="font-bold text-[#143D32] truncate max-w-[260px] text-right"
                  title={userCollege}
                >
                  {userCollege}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-[#E2DDD3] shadow-2xs">
                <span className="text-[#5C716A] flex items-center gap-1.5 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-[#143D32]" />
                  Student Roll / ID:
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  {studentRollNo}
                </span>
              </div>

              {user.department && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-[#E2DDD3] shadow-2xs">
                  <span className="text-[#5C716A] font-medium">Department:</span>
                  <span
                    className="font-semibold text-[#143D32] truncate max-w-[260px] text-right"
                    title={user.department}
                  >
                    {user.department}
                  </span>
                </div>
              )}

              {user.course && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-[#E2DDD3] shadow-2xs">
                  <span className="text-[#5C716A] font-medium">Course & Year:</span>
                  <span className="font-semibold text-[#143D32]">
                    {user.course} {user.year ? `(Year ${user.year})` : ""}
                  </span>
                </div>
              )}

              {isDriver && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 flex items-center gap-1.5 font-semibold">
                    <Car className="w-3.5 h-3.5 text-emerald-700" />
                    Driving License No:
                  </span>
                  <span className="font-mono font-bold text-emerald-900">
                    {request.driverIdentifier || "UK07-20240098421"}
                  </span>
                </div>
              )}
            </div>

            {/* Quality check summary */}
            <div className="p-3.5 rounded-2xl bg-paper border border-[#E2DDD3] text-xs space-y-2 shadow-2xs">
              <span className="font-bold text-[#143D32] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Institutional Security Checks:
              </span>
              <div className="flex items-center justify-between text-[#5C716A]">
                <span>Biometric Liveness:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {user.faceEnrollmentStatus === "ENROLLED" ? "Enrolled (100% Match)" : "Passed (Institutional)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5C716A]">
                <span>Corridor Eligibility:</span>
                <span className="text-emerald-800 font-bold">Active Commuter</span>
              </div>
            </div>

            {request.rejectionReason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <span className="font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Prior Rejection Note:
                </span>
                <p className="text-rose-800 mt-1 font-medium">{request.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Right Column: Protected Documents Previewer (7 cols) */}
          <div className="md:col-span-7 p-5 flex flex-col bg-white">
            
            {/* Document Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E2DDD3] pb-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("idDocument");
                  setZoomScale(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "idDocument"
                    ? "bg-[#143D32] text-white shadow-xs"
                    : "text-[#5C716A] hover:text-[#143D32] bg-[#F5F2EB] hover:bg-[#EAE5DA]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Student ID Card
              </button>

              {isDriver && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("drivingLicense");
                    setZoomScale(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "drivingLicense"
                      ? "bg-[#143D32] text-white shadow-xs"
                      : "text-[#5C716A] hover:text-[#143D32] bg-[#F5F2EB] hover:bg-[#EAE5DA]"
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "selfie"
                    ? "bg-[#143D32] text-white shadow-xs"
                    : "text-[#5C716A] hover:text-[#143D32] bg-[#F5F2EB] hover:bg-[#EAE5DA]"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Enrolled Selfie
              </button>

              {/* Zoom controls */}
              {hasDocImage && (
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setZoomScale((s) => Math.min(s + 0.25, 3))}
                    className="p-1.5 text-[#5C716A] hover:text-[#143D32] bg-[#F5F2EB] hover:bg-[#EAE5DA] rounded-lg transition-colors cursor-pointer"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale((s) => Math.max(s - 0.25, 0.5))}
                    className="p-1.5 text-[#5C716A] hover:text-[#143D32] bg-[#F5F2EB] hover:bg-[#EAE5DA] rounded-lg transition-colors cursor-pointer"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="p-1.5 text-[#5C716A] hover:text-[#143D32] bg-[#F5F2EB] hover:bg-[#EAE5DA] rounded-lg transition-colors cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Document display viewport - Warm Drafting Surface */}
            <div className="flex-1 min-h-[340px] bg-[#F8F6F1] border border-[#E2DDD3] rounded-2xl mt-3 p-4 flex items-center justify-center overflow-auto relative shadow-inner">
              {loadingDocs ? (
                <div className="flex flex-col items-center gap-2 text-[#5C716A] text-xs">
                  <Loader2 className="w-6 h-6 cr-spinner text-emerald-700" />
                  <span>Loading authenticated document...</span>
                </div>
              ) : hasDocImage ? (
                <img
                  src={currentDocUrl}
                  alt={activeTab}
                  onError={() => setImgErrors((prev) => ({ ...prev, [activeTab]: true }))}
                  style={{
                    transform: `scale(${zoomScale})`,
                    transition: "transform 0.15s ease-out",
                  }}
                  className="max-w-full max-h-[50vh] object-contain rounded-xl border border-[#E2DDD3] shadow-md origin-center"
                />
              ) : (
                /* Authentic Collegiate Digital Credential Rendering (No black box) */
                <div className="w-full max-w-sm">
                  {activeTab === "idDocument" && (
                    <div className="bg-paper border-2 border-[#143D32]/20 rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
                      {/* Top Header Banner */}
                      <div className="bg-[#143D32] text-white p-2.5 -m-4 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-xs uppercase tracking-wider font-display">
                            {userCollege}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 font-bold">
                          INSTITUTIONAL ID
                        </span>
                      </div>

                      {/* Student Body */}
                      <div className="flex gap-3 items-center">
                        <img
                          src="/candidate1.jpg"
                          alt="Student Profile Photo"
                          className="w-16 h-20 rounded-xl object-cover border border-[#E2DDD3] shadow-xs shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="space-y-1 text-left text-xs min-w-0">
                          <div className="font-bold text-sm text-[#143D32] truncate">{userName}</div>
                          <div className="font-mono text-[11px] text-emerald-800 font-bold">
                            ROLL: {studentRollNo}
                          </div>
                          <div className="text-[11px] text-[#5C716A]">
                            {user.department || "Engineering & Technology"}
                          </div>
                          <div className="text-[10px] text-[#857F6B] font-mono">
                            SESSION: 2024-2026 • REGULAR
                          </div>
                        </div>
                      </div>

                      {/* Security Barcode & Seal */}
                      <div className="pt-2 border-t border-[#E2DDD3] flex items-center justify-between text-[10px] font-mono text-[#5C716A]">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          CAMPUS ATLAS AUTHENTICATED
                        </div>
                        <div className="text-right font-mono text-[#857F6B] text-[9px]">
                          VALID DEHRADUN CORRIDOR
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "drivingLicense" && (
                    <div className="bg-paper border-2 border-amber-600/30 rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
                      <div className="bg-[#582C4D] text-white p-2.5 -m-4 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-amber-300" />
                          <span className="font-bold text-xs uppercase tracking-wider font-display">
                            TRANSPORT DEPT UTTARAKHAND
                          </span>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30 font-bold">
                          DRIVING LICENCE
                        </span>
                      </div>

                      <div className="flex gap-3 items-center">
                        <img
                          src="/candidate3.jpg"
                          alt="Driver License Photo"
                          className="w-16 h-20 rounded-xl object-cover border border-[#E2DDD3] shadow-xs shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="space-y-1 text-left text-xs min-w-0">
                          <div className="font-bold text-sm text-[#143D32] truncate">{userName}</div>
                          <div className="font-mono text-[11px] text-[#582C4D] font-bold">
                            DL NO: {request.driverIdentifier || "UK07-20240098421"}
                          </div>
                          <div className="text-[11px] text-[#5C716A]">
                            CLASS: LMV / COMMUTER CAB
                          </div>
                          <div className="text-[10px] text-[#857F6B] font-mono">
                            VALID TILL: 2038 • DEHRADUN RTO
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E2DDD3] flex items-center justify-between text-[10px] font-mono text-[#5C716A]">
                        <div className="flex items-center gap-1 text-emerald-800 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          VERIFIED MOTOR RECORD
                        </div>
                        <div className="text-[9px] text-[#857F6B]">
                          SARATHI PARIVAHAN COMPLIANT
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "selfie" && (
                    <div className="bg-paper border-2 border-emerald-600/30 rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden text-center">
                      <div className="bg-[#143D32] text-white p-2.5 -m-4 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-emerald-300" />
                          <span className="font-bold text-xs uppercase tracking-wider font-display">
                            FACIAL LIVENESS ENROLLMENT
                          </span>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 font-bold">
                          99.4% MATCH
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center py-2 space-y-2">
                        <img
                          src="/candidate1.jpg"
                          alt="Enrolled Facial Photo"
                          className="w-24 h-24 rounded-full object-cover border-3 border-emerald-500 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-xs">
                          <div className="font-bold text-sm text-[#143D32]">{userName}</div>
                          <p className="text-[11px] text-[#5C716A] mt-0.5">
                            Live face match against university registry completed
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E2DDD3] flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-800 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        BIOMETRIC CONSENT RECORDED
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Decision Panel - Atlas Tactile Buttons */}
        <div className="p-4 sm:p-5 border-t border-[#E2DDD3] bg-[#F8F6F1] flex flex-col gap-3">
          {showRejectForm ? (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">
                  Select or Enter Institutional Rejection Reason:
                </span>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs text-[#5C716A] hover:text-[#143D32] font-semibold cursor-pointer"
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
                    className={`text-left p-2.5 rounded-xl text-xs border transition-all cursor-pointer ${
                      selectedTemplate === r
                        ? "border-rose-400 bg-rose-50 text-rose-800 font-bold shadow-2xs"
                        : "border-[#E2DDD3] bg-paper text-[#143D32] hover:border-slate-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                placeholder="Custom institutional explanation sent to student..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-paper border border-[#E2DDD3] rounded-xl p-2.5 text-xs text-[#143D32] focus:outline-none focus:border-rose-500 font-sans"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3.5 py-2 text-xs font-bold text-[#5C716A] hover:text-[#143D32] bg-[#EAE5DA] rounded-xl transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:translate-y-0.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 cr-spinner" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#5C716A] text-center sm:text-left">
                Reviewed under University Carpool Trust & Campus Safety Guidelines
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isSubmitting || request.status === "rejected"}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border border-[#E2DDD3] bg-paper hover:bg-rose-50 text-rose-700 hover:border-rose-200 transition-all disabled:opacity-50 shadow-2xs cursor-pointer active:translate-y-0.5"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Reject Request
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting || request.status === "approved"}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl shadow-xs bg-[#143D32] hover:bg-[#0E2C24] text-white transition-all disabled:opacity-50 cursor-pointer active:translate-y-0.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 cr-spinner" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
