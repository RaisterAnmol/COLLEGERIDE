import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, FileText, CheckCircle2, AlertTriangle, ExternalLink, Printer } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-paper rounded-3xl border border-line-base shadow-2xl flex flex-col overflow-hidden text-ink-primary"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-line-subtle flex items-center justify-between bg-canvas/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-route/10 border border-route/20 text-route flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 id="terms-title" className="font-display font-extrabold text-base sm:text-lg text-ink-primary">
                  CampusRide Terms of Transit & Community Guidelines
                </h3>
                <p className="text-[11px] font-mono text-ink-muted">
                  Official Uttarakhand University Transit Framework • Effective Academic Year 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line-base text-xs font-mono text-ink-muted hover:text-ink-primary hover:bg-canvas transition-colors cursor-pointer"
                title="Print Terms"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-canvas transition-colors cursor-pointer"
                aria-label="Close Terms Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs sm:text-sm leading-relaxed text-ink-muted font-sans custom-scrollbar">
            {/* Quick Summary Callout */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-display font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Executive Summary for Students & Faculty</span>
              </div>
              <p className="text-xs leading-relaxed font-sans text-emerald-800">
                CampusRide is an institutional, peer-to-peer university carpooling network designed exclusively for verified college students, professors, and staff. 
                All rides operate strictly under <strong>non-commercial, peer fuel-cost sharing</strong> rules compliant with Section 66/67 of the Motor Vehicles Act. Commercial fare charging, unauthorized non-students, and misconduct are strictly prohibited.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-2">
              <h4 className="font-display font-bold text-ink-primary text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-route-pale text-route text-[11px] font-mono font-bold flex items-center justify-center">1</span>
                <span>Institutional Eligibility & Verification Standards</span>
              </h4>
              <p>
                To maintain an uncompromised trust perimeter across university campuses, registration and participation requires:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>An active, institutional email address issued by an accredited university (e.g. <code>.edu</code>, <code>.ac.in</code>).</li>
                <li>Digital biometric face verification and physical student/faculty photo ID card submission.</li>
                <li>For vehicle owners: A valid Government of India Driving License, valid vehicle registration certificate (RC), active third-party insurance, and Pollution Under Control (PUC) certificate.</li>
                <li>Immediate de-activation upon student graduation, withdrawal, or academic suspension.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h4 className="font-display font-bold text-ink-primary text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-route-pale text-route text-[11px] font-mono font-bold flex items-center justify-center">2</span>
                <span>Non-Commercial Fuel Cost-Sharing Policy (MVA Compliance)</span>
              </h4>
              <p>
                CampusRide is NOT a commercial taxi, cab aggregator, or for-profit transportation service. Under the <strong>Motor Vehicles Act (1988)</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Drivers may only seek reimbursement to offset reasonable, actual fuel and toll expenses incurred during legitimate campus commutes.</li>
                <li>The platform enforces a mandatory system cap on cost-sharing rates (₹10 minimum, up to transparent Dehradun regional corridor limits).</li>
                <li>Drivers are strictly forbidden from operating vehicles on commercial profit margins, or soliciting cash surcharges beyond the agreed app cost share.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h4 className="font-display font-bold text-ink-primary text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-route-pale text-route text-[11px] font-mono font-bold flex items-center justify-center">3</span>
                <span>Campus Safety, Zero-Tolerance Harassment & Women-Only Corridors</span>
              </h4>
              <p>
                Safety is the foundational pillar of the campus transit network:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Anti-Harassment Policy:</strong> Zero tolerance for verbal, physical, sexual harassment, stalking, bullying, discrimination, or ragging in violation of UGC regulations. Violations result in immediate permanent expulsion and formal police reporting.</li>
                <li><strong>Women-Only Filter:</strong> Female drivers and passengers have the absolute right to designate and select verified female-only commutes.</li>
                <li><strong>Mandatory 4-Digit In-Car OTP:</strong> Passenger boarding is cryptographically sealed via a unique 4-digit code generated per booking. Drivers may not depart until the code is verified in the app.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h4 className="font-display font-bold text-ink-primary text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-route-pale text-route text-[11px] font-mono font-bold flex items-center justify-center">4</span>
                <span>Real-Time Telemetry & Emergency SOS 112 Protocol</span>
              </h4>
              <p>
                During an active trip, the CampusRide system records timestamped GPS coordinate updates along the corridor:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Triggering the SOS emergency button instantly alerts campus security dispatch, transmits active vehicle coordinates, and bridges directly to <strong>National Emergency Helpline 112</strong>.</li>
                <li>Registered emergency contacts (parents/guardians) receive automated WhatsApp/SMS route alerts during safety events.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h4 className="font-display font-bold text-ink-primary text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-route-pale text-route text-[11px] font-mono font-bold flex items-center justify-center">5</span>
                <span>Punctuality, Corridor Courtesy & Cancellations</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Drivers and passengers must adhere to agreed pickup times with a maximum courtesy waiting window of 5 minutes at campus checkposts.</li>
                <li>Cancellations should be made at least 45 minutes prior to departure to allow peers to arrange alternative campus transit. Frequent late cancellations incur trust score deductions.</li>
                <li>No smoking, vaping, consumption of alcohol, or transport of hazardous substances is permitted in any vehicle at any time.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h4 className="font-display font-bold text-ink-primary text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-route-pale text-route text-[11px] font-mono font-bold flex items-center justify-center">6</span>
                <span>Privacy, DPDP Act Compliance & Data Security</span>
              </h4>
              <p>
                In compliance with the <strong>Digital Personal Data Protection (DPDP) Act</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Student identity documents and vehicle papers are encrypted at rest with AES-256 and accessible strictly to authorized campus administrative review officers.</li>
                <li>Personal phone numbers are masked or protected through in-app verified communication channels.</li>
                <li>We do not sell, rent, or monetize student demographic or location records to commercial advertisers.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-2">
              <h4 className="font-display font-bold text-ink-primary text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-route-pale text-route text-[11px] font-mono font-bold flex items-center justify-center">7</span>
                <span>Limitation of Liability & Insurance Disclaimer</span>
              </h4>
              <p className="text-xs text-ink-faint leading-relaxed">
                CampusRide provides matching software and verification infrastructure between verified academic peers. Drivers are independent car owners and are not employees, agents, or contractors of CampusRide or affiliated universities. Vehicle owners must maintain valid comprehensive motor insurance covering passengers as required under Indian law.
              </p>
            </section>
          </div>

          {/* Footer Action */}
          <div className="px-6 py-4 border-t border-line-subtle bg-canvas/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>By registering, you acknowledge reading and adhering to these standards.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-line-base bg-surface hover:bg-canvas text-xs font-mono font-bold text-ink-primary transition-colors cursor-pointer"
              >
                Close
              </button>

              {onAccept && (
                <button
                  type="button"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-route text-white text-xs font-mono font-bold hover:bg-route-light transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>I Accept These Terms</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

