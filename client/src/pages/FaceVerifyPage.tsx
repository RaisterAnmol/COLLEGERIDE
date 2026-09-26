import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { api } from "../services/api";

// ─── Cosine similarity helper (client-side matching) ─────────────────────────
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── Face quality feedback ────────────────────────────────────────────────────
type FaceStatus = "IDLE" | "NO_FACE" | "MULTIPLE" | "TOO_FAR" | "GOOD" | "PROCESSING";

const STATUS_CONFIG: Record<FaceStatus, { label: string; color: string; ring: string }> = {
  IDLE:       { label: "Open camera to begin",               color: "text-slate-500 bg-slate-50 border-slate-200",   ring: "border-slate-300" },
  NO_FACE:    { label: "No face detected — look at camera",   color: "text-slate-600 bg-slate-50 border-slate-200",   ring: "border-slate-300" },
  MULTIPLE:   { label: "Only 1 person in frame",             color: "text-amber-700 bg-amber-50 border-amber-200",   ring: "border-amber-400" },
  TOO_FAR:    { label: "Move a little closer",               color: "text-amber-700 bg-amber-50 border-amber-200",   ring: "border-amber-400" },
  GOOD:       { label: "Face aligned — ready to verify",     color: "text-emerald-700 bg-emerald-50 border-emerald-200", ring: "border-emerald-500" },
  PROCESSING: { label: "Analysing face…",                    color: "text-[#143D32] bg-emerald-50 border-emerald-200", ring: "border-[#143D32]" },
};

// ─── Main page ────────────────────────────────────────────────────────────────
export const FaceVerifyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const humanRef  = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);

  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady]     = useState(false);
  const [cameraOn, setCameraOn]         = useState(false);
  const [cameraError, setCameraError]   = useState<string | null>(null);

  const [faceStatus, setFaceStatus]   = useState<FaceStatus>("IDLE");
  const [liveDescriptor, setLiveDescriptor] = useState<number[] | null>(null);

  const [verifying, setVerifying]     = useState(false);
  const [result, setResult]           = useState<{
    matched: boolean;
    score: number;
    message: string;
  } | null>(null);

  const [noEnrollment, setNoEnrollment] = useState(false);

  // Synchronous callback ref for mounting video stream
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    const stream = streamRef.current;
    if (node && stream) {
      if (node.srcObject !== stream) {
        node.srcObject = stream;
      }
      node.play().catch((err) => {
        console.warn("[FaceVerify] Video play in callback ref:", err);
      });
    }
  }, []);

  const handleQuickDemoVerify = async () => {
    setVerifying(true);
    setCameraError(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setResult({
        matched: true,
        score: 96,
        message: "Match verified successfully! Identity confirmed (Score: 96%).",
      });
    } finally {
      setVerifying(false);
    }
  };

  // ── Load @vladmandic/human model ─────────────────────────────────────────
  const loadModel = useCallback(async () => {
    if (humanRef.current) return humanRef.current;
    setModelLoading(true);
    try {
      const humanModule = await import("@vladmandic/human");
      const HumanClass = humanModule.default || (humanModule as any).Human;
      const human = new HumanClass({
        backend: "webgl",
        modelBasePath: "https://vladmandic.github.io/human-models/models/",
        face: {
          enabled: true,
          detector:    { enabled: true, rotation: true },
          description: { enabled: true },
          iris:    { enabled: false },
          emotion: { enabled: false },
          gear:    { enabled: false },
          antispoof: { enabled: false },
          liveness:  { enabled: false },
        },
        body:    { enabled: false },
        hand:    { enabled: false },
        object:  { enabled: false },
        gesture: { enabled: false },
      });
      await human.load();
      humanRef.current = human;
      setModelReady(true);
      return human;
    } catch (err) {
      console.warn("[FaceVerify] Human load error:", err);
      setModelReady(false);
      return null;
    } finally {
      setModelLoading(false);
    }
  }, []);

  // ── Detection loop ─────────────────────────────────────────────────────────
  const runDetectionLoop = useCallback(() => {
    const video = videoRef.current;
    const human = humanRef.current;
    if (!video || !human || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    human.detect(video).then((res: any) => {
      if (!res) { rafRef.current = requestAnimationFrame(runDetectionLoop); return; }
      const faces = res.face || [];
      if (faces.length === 0) {
        setFaceStatus("NO_FACE");
        setLiveDescriptor(null);
      } else if (faces.length > 1) {
        setFaceStatus("MULTIPLE");
        setLiveDescriptor(null);
      } else {
        const face = faces[0];
        const score = face.score ?? 0;
        const boxArea = (face.box?.[2] ?? 0) * (face.box?.[3] ?? 0);
        const minArea = (video.videoWidth * video.videoHeight) * 0.04;
        if (boxArea < minArea || score < 0.6) {
          setFaceStatus("TOO_FAR");
          setLiveDescriptor(null);
        } else {
          setFaceStatus("GOOD");
          if (face.embedding && Array.isArray(face.embedding)) {
            setLiveDescriptor(Array.from(face.embedding));
          }
        }
      }
      rafRef.current = requestAnimationFrame(runDetectionLoop);
    }).catch(() => {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
    });
  }, []);

  // ── Start camera ───────────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError(null);
    setResult(null);
    setFaceStatus("NO_FACE");

    const human = await loadModel();
    if (!human) {
      setCameraError("Could not load face detection model. Please refresh and try again.");
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
      } catch (e) {
        console.warn("[FaceVerify] facingMode user failed, falling back to basic video:", e);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }
      streamRef.current = stream;
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn(err));
      }
      rafRef.current = requestAnimationFrame(runDetectionLoop);
    } catch (err: any) {
      setCameraError("Camera access denied. Please allow camera in browser settings or use Quick Test.");
    }
  };

  // ── Stop camera ────────────────────────────────────────────────────────────
  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setFaceStatus("IDLE");
    setLiveDescriptor(null);
  };

  // Cleanup on unmount
  useEffect(() => () => { stopCamera(); }, []);

  // ── Get enrolled descriptor from localStorage or API ───────────────────────
  const getEnrolledDescriptor = (): number[] | null => {
    const key = "campusride_face_embedding_" + (user?.email || user?._id || "");
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length >= 64 ? parsed : null;
    } catch {
      return null;
    }
  };

  // ── Verify ─────────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!liveDescriptor || faceStatus !== "GOOD") return;
    setVerifying(true);
    setFaceStatus("PROCESSING");
    cancelAnimationFrame(rafRef.current);

    try {
      // 1. Try backend first (works when logged in + enrolled via /api/face/enroll)
      try {
        const backendResult = await api.verifyFace(liveDescriptor);
        setResult({
          matched: backendResult.verified,
          score: Math.round((backendResult.confidence ?? 0) * 100),
          message: backendResult.message,
        });
        stopCamera();
        return;
      } catch (backendErr: any) {
        // If backend says NOT_ENROLLED or no server, fall through to client-side
        const errMsg = backendErr?.message || "";
        if (!errMsg.includes("FACE_NOT_ENROLLED") && !errMsg.includes("not active") && !errMsg.includes("Failed to fetch") && !errMsg.includes("NetworkError")) {
          // Real backend error (wrong face, retries, etc.) — show it
          setResult({
            matched: false,
            score: 0,
            message: backendErr?.message || "Verification failed.",
          });
          stopCamera();
          return;
        }
      }

      // 2. Client-side fallback: compare against localStorage embedding
      const enrolled = getEnrolledDescriptor();
      if (!enrolled) {
        setNoEnrollment(true);
        setFaceStatus("IDLE");
        stopCamera();
        return;
      }

      const similarity = cosineSimilarity(liveDescriptor, enrolled);
      const threshold = 0.60;
      const matched = similarity >= threshold;

      setResult({
        matched,
        score: Math.round(similarity * 100),
        message: matched
          ? "Identity confirmed — face matched your enrolled profile."
          : "Face did not match. Ensure good lighting and look straight at the camera.",
      });
      stopCamera();
    } finally {
      setVerifying(false);
    }
  };

  // ── Retry ──────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    setResult(null);
    setNoEnrollment(false);
    startCamera();
  };

  const statusCfg = STATUS_CONFIG[faceStatus];
  const isDriver = user?.role === "driver" || user?.accountType === "DRIVER";

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-14 h-14 text-[#143D32] mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Sign in Required</h2>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
          Face verification is only available for registered drivers.
        </p>
        <Link
          to="/auth"
          className="px-6 py-2.5 bg-[#143D32] text-white rounded-xl text-sm font-semibold shadow transition-all hover:bg-[#0d2820]"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link to="/verification" className="hover:text-slate-900 transition-colors">Verification</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900 font-medium">Face Verify</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Live Face Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Confirm your identity by matching your live face against your enrolled photo.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#143D32]/10 border border-[#143D32]/20 text-xs font-semibold text-[#143D32]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Driver Verification</span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Info card — how it works */}
        {!cameraOn && !result && !noEnrollment && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-3">
              <Info className="w-4 h-4 text-[#143D32]" />
              How face verification works
            </div>
            <ol className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#143D32] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Click <strong>Open Camera</strong> — allow browser camera access when prompted.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#143D32] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Center your face in the oval. Wait for <strong>"Face aligned — ready"</strong> status.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#143D32] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Click <strong>Verify Now</strong>. Your face is compared against your registration selfie.</span>
              </li>
            </ol>

            {!isDriver && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Face verification is required for driver accounts. Passengers do not need it.</span>
              </div>
            )}
          </div>
        )}

        {/* No enrollment banner */}
        {noEnrollment && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Face Profile Not Enrolled
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              You haven't enrolled a face profile yet. During registration, drivers must take a selfie
              which becomes the verification baseline. Go to your verification page to re-submit with
              a selfie, or re-register as a driver.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/verification"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#143D32] text-white text-xs font-semibold rounded-xl hover:bg-[#0d2820] transition-colors shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Go to Verification
              </Link>
              <button
                type="button"
                onClick={() => setNoEnrollment(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* ── Result Card ── */}
        {result && (
          <div className={`rounded-2xl p-6 border ${result.matched
            ? "bg-emerald-50 border-emerald-200"
            : "bg-rose-50 border-rose-200"
          }`}>
            <div className="flex flex-col items-center text-center gap-4">
              {result.matched ? (
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-rose-600" />
                </div>
              )}

              <div>
                <h2 className={`text-lg font-bold ${result.matched ? "text-emerald-900" : "text-rose-900"}`}>
                  {result.matched ? "Identity Confirmed ✓" : "Face Not Matched"}
                </h2>
                <p className={`text-xs mt-1 ${result.matched ? "text-emerald-700" : "text-rose-700"}`}>
                  {result.message}
                </p>
              </div>

              {/* Match score bar */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-500">Match score</span>
                  <span className={result.matched ? "text-emerald-700" : "text-rose-700"}>
                    {result.score}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.matched ? "bg-emerald-500" : result.score > 45 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, result.score)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Threshold: 60% · Your score: {result.score}%
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#143D32] text-white text-xs font-semibold rounded-xl hover:bg-[#0d2820] transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
                {result.matched && (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Camera Box ── */}
        {(cameraOn || (!result && !noEnrollment)) && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Camera header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Camera className="w-4 h-4 text-[#143D32]" />
                Live Camera
              </div>
              {cameraOn && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <div className="p-5 flex flex-col items-center gap-4">
              {/* Oval viewfinder */}
              <div className="relative">
                <div
                  className={`w-56 h-64 rounded-full overflow-hidden border-4 transition-all duration-300 bg-slate-100 flex items-center justify-center ${statusCfg.ring}`}
                >
                  {cameraOn ? (
                    <video
                      ref={setVideoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        v.play().catch((err) => console.warn("[FaceVerify] onLoadedMetadata play:", err));
                      }}
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Camera className="w-10 h-10" />
                      <span className="text-xs font-medium">Camera off</span>
                    </div>
                  )}
                </div>

                {/* Pulse ring when GOOD */}
                {faceStatus === "GOOD" && (
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping pointer-events-none" />
                )}
              </div>

              {/* Status pill */}
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold ${statusCfg.color}`}>
                {faceStatus === "GOOD" && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                {(faceStatus === "NO_FACE" || faceStatus === "IDLE") && <Camera className="w-3.5 h-3.5" />}
                {(faceStatus === "TOO_FAR" || faceStatus === "MULTIPLE") && <AlertCircle className="w-3.5 h-3.5" />}
                {faceStatus === "PROCESSING" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {statusCfg.label}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {!cameraOn ? (
                  <>
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={modelLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#143D32] text-white text-sm font-semibold rounded-xl hover:bg-[#0d2820] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {modelLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading model…
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          Open Camera
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickDemoVerify}
                      disabled={verifying}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-xl border border-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer"
                      title="1-click demo verification without camera"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Quick Test (Demo)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={faceStatus !== "GOOD" || verifying}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#143D32] text-white text-sm font-semibold rounded-xl hover:bg-[#0d2820] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {verifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Verify Now
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              {/* Tip */}
              <p className="text-[11px] text-slate-400 text-center max-w-xs">
                Ensure good lighting, look straight at the camera, and remove sunglasses.
              </p>
            </div>
          </div>
        )}

        {/* Hidden canvas for future snapshot use */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Back link */}
        <div className="pt-2 text-center">
          <Link
            to="/verification"
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            ← Back to Verification
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaceVerifyPage;
