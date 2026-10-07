import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, Mail, ArrowRight, Zap, Sparkles } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error" | "input">(
    token ? "loading" : "input"
  );
  const [message, setMessage] = useState<string>("");
  const [manualToken, setManualToken] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [devVerifying, setDevVerifying] = useState(false);

  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  const handleDevQuickVerify = async () => {
    setDevVerifying(true);
    try {
      const res = await api.devVerifyEmail(user?.email || undefined, user?._id || undefined);
      setStatus("success");
      setMessage(res.message || "Account email verified instantly in Dev Mode!");
      if (refreshUser) {
        refreshUser().catch(() => {});
      }
    } catch (err: any) {
      alert(`Dev verify failed: ${err.message || 'Make sure you are logged in'}`);
    } finally {
      setDevVerifying(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (tok: string) => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await api.verifyEmail(tok.trim());
      setStatus("success");
      setMessage(res.message || "Your institutional email has been verified successfully!");
      if (refreshUser) {
        refreshUser().catch(() => {});
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Verification token is invalid or has expired.");
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    try {
      const res = await api.sendEmailVerification();
      setResendMsg(res.message || "New verification email sent!");
    } catch (err: any) {
      setResendMsg(err.message || "Please log in to request a new verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-slate-200 shadow-xl text-center"
      >
        {status === "loading" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verifying Email...</h1>
            <p className="text-sm text-slate-600">
              Validating your cryptographic verification token against the university transit directory.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold text-[#143D32]">Email Verified!</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl w-full text-xs text-emerald-800 flex items-center justify-center gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Your account status is now <strong>ACTIVE</strong>.</span>
            </div>

            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="mt-4 w-full py-3 px-4 bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{user ? "Continue to Dashboard" : "Proceed to Log In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
              <AlertCircle className="w-9 h-9" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verification Link Expired</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {message}
            </p>

            <div className="w-full flex flex-col gap-2.5 mt-3">
              {user ? (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full py-2.5 px-4 bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{resending ? "Dispatching..." : "Resend Verification Email"}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 text-center"
                >
                  <span>Log in to Resend Link</span>
                </Link>
              )}

              {resendMsg && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {resendMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {status === "input" && (
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Enter Verification Code</h1>
            <p className="text-sm text-slate-600">
              Paste the verification token received in your institutional inbox:
            </p>

            <div className="w-full flex flex-col gap-3 mt-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="e.g. 8f9b2c34..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#143D32]/20 focus:border-[#143D32]"
              />

              <button
                onClick={() => manualToken && handleVerify(manualToken)}
                disabled={!manualToken.trim()}
                className="w-full py-2.5 bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-sm rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Verify Token
              </button>
            </div>
          </div>
        )}

        {/* Dev Mode One-Click Verification Bypass (Localhost Only) */}
        {isDev && (status === "input" || status === "error") && (
          <div className="mt-6 pt-5 border-t border-slate-200/80 text-left">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  DEV MODE: QUICK VERIFY
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-mono px-2 py-0.5 rounded-full font-bold">
                  LOCALHOST
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Skip waiting for verification emails or token copy-pasting. Instantly activate your account in one click.
              </p>
              <button
                type="button"
                onClick={handleDevQuickVerify}
                disabled={devVerifying}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{devVerifying ? "Activating Account..." : "⚡ Instantly Verify Email (Dev Mode)"}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

