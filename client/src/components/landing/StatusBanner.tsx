import React from 'react';
import { ShieldCheck, MapPin, CheckCircle2, Lock, Key, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ACTIVE_CORRIDORS = [
  {
    name: 'Premnagar ↔ UIT Gate 1',
    route: 'Premnagar Market → Suddhowala PG → Law Block → UIT Quad',
    pickupPoints: 'Premnagar Chowk, Nanda Ki Chowki, Gate 1',
    typicalFare: '₹20 fuel split',
  },
  {
    name: 'Suddhowala ↔ UPES Bidholi',
    route: 'Suddhowala Junction → Bidholi Forest Rd → UPES Gate',
    pickupPoints: 'Suddhowala Chowk, PG Corridor, Bidholi Gate',
    typicalFare: '₹25 fuel split',
  },
  {
    name: 'Ballupur ↔ Graphic Era Quad',
    route: 'Ballupur Flyover → Clement Town → GEU Gate',
    pickupPoints: 'Ballupur Chowk, Subhash Nagar, Campus Gate',
    typicalFare: '₹15 fuel split',
  },
  {
    name: 'ISBT ↔ Selaqui Institutional Belt',
    route: 'ISBT Dehradun → Shimla Bypass → Selaqui Pharma Hub',
    pickupPoints: 'ISBT Terminal, Herbertpur Road, Selaqui Chowk',
    typicalFare: '₹30 fuel split',
  },
];

export const StatusBanner: React.FC = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <span className="text-xs font-mono text-plum font-bold bg-plum-light px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            CAMPUS TRANSIT DIRECTORY
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-display font-extrabold text-ink-primary tracking-tight">
            Active Dehradun Commute Corridors
          </h2>
          <p className="mt-1 text-sm text-ink-secondary max-w-xl">
            Key daily travel routes shared by enrolled students across colleges. Every ride is peer-coordinated and non-commercial.
          </p>
        </div>

        <Link
          to="/colleges"
          className="text-xs font-mono font-bold text-plum hover:underline flex items-center gap-1 self-start md:self-auto"
        >
          <span>View all campus stops →</span>
        </Link>
      </motion.div>

      {/* Corridor Cards Grid (Real Data Only) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {ACTIVE_CORRIDORS.map((corridor, idx) => (
          <div
            key={idx}
            className="bg-surface p-6 sm:p-7 rounded-card border border-line-base shadow-subtle flex flex-col justify-between space-y-3.5 h-full"
          >
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-route shrink-0" />
                <h3 className="font-display font-bold text-sm text-ink-primary">
                  {corridor.name}
                </h3>
              </div>
              <p className="mt-2 text-xs text-ink-secondary leading-relaxed">
                {corridor.route}
              </p>
            </div>

            <div className="pt-3 border-t border-line-subtle flex items-center justify-between text-xs font-mono mt-auto">
              <span className="text-ink-muted text-[11px] whitespace-nowrap shrink-0">
                {corridor.typicalFare}
              </span>
              <span className="text-route font-medium text-[11px] whitespace-nowrap shrink-0">
                Daily Peak
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Truthful Verification Safeguards (Rule R6/R7: Plain, calm, factual) */}
      <div className="mt-8 p-6 sm:p-7 bg-surface rounded-card border border-line-base shadow-subtle">
        <h3 className="text-sm font-display font-bold text-ink-primary mb-3">
          Institutional Safety &amp; Verification Protocol
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-ink-secondary items-stretch">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-control bg-route-pale text-route flex items-center justify-center shrink-0 font-mono font-bold">
              1
            </span>
            <div>
              <strong className="text-ink-primary block font-semibold">Institutional College ID</strong>
              <span>Verified college roll number and student ID prior to publishing or booking.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-control bg-route-pale text-route flex items-center justify-center shrink-0 font-mono font-bold">
              2
            </span>
            <div>
              <strong className="text-ink-primary block font-semibold">Driver Morning Check</strong>
              <span>Biometric facial liveness check confirms authorized vehicle driver before departure.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-control bg-route-pale text-route flex items-center justify-center shrink-0 font-mono font-bold">
              3
            </span>
            <div>
              <strong className="text-ink-primary block font-semibold">4-Digit In-Car OTP</strong>
              <span>Passenger gives 4-digit code to driver to confirm vehicle match before wheels roll.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LiveTelemetryBanner = StatusBanner;
