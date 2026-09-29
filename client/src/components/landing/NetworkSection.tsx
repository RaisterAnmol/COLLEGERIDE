import React from 'react';
import { DEMO_COLLEGES } from '../../data/mockData';
import { ShieldCheck, Navigation } from 'lucide-react';

export const NetworkSection: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-[#101515] text-[#DDE1DE] border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Title */}
        <div className="max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#18A66A] font-semibold block mb-3">
            06 — INSTITUTIONAL MOBILITY NETWORK
          </span>
          <h2 className="text-heading-clamp font-black text-white uppercase tracking-tight">
            A Campus That<br />
            Moves Together.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#98A2B3] max-w-xl">
            A real-time transit mesh connecting student residences, transit corridors, and college departments into one unified mobility collective.
          </p>
        </div>

        {/* Large Schematic Network Diagram (SVG) */}
        <div className="mt-14 p-6 sm:p-10 rounded-2xl bg-white/[0.03] border border-white/10 relative min-h-[460px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-[#98A2B3] pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#18A66A] animate-pulse" />
              <span className="text-white font-bold">REGIONAL CAMPUS TOPOLOGY:</span>
              <span>DEHRADUN-PREMNAGAR INTERCONNECT</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span>LATENCY: 14MS</span>
              <span className="text-[#18A66A]">100% .EDU ENCLAVE</span>
            </div>
          </div>

          {/* SVG Network Schematic */}
          <div className="relative my-auto py-8">
            <svg className="w-full h-72 overflow-visible" viewBox="0 0 900 300" fill="none">
              {/* Regional Grid Connections */}
              <line x1="140" y1="150" x2="450" y2="150" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="450" y1="150" x2="760" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="450" y1="150" x2="760" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />

              {/* Active illuminated carpool tracks */}
              <path
                d="M 140 150 C 280 80, 360 220, 450 150"
                stroke="#1769FF"
                strokeWidth="3"
                strokeLinecap="round"
                className="route-dash-moving"
              />
              <path
                d="M 450 150 C 580 80, 680 80, 760 80"
                stroke="#18A66A"
                strokeWidth="3"
                strokeLinecap="round"
                className="route-dash-moving"
              />

              {/* Node 1: West Hub (Selaqui / Suddhowala) */}
              <g transform="translate(140, 150)">
                <circle r="22" fill="#101515" stroke="#1769FF" strokeWidth="2.5" />
                <circle r="8" fill="#1769FF" />
                <text x="0" y="-32" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
                  SELAQUI / SUDDHOWALA
                </text>
                <text x="0" y="38" textAnchor="middle" fill="#98A2B3" fontSize="10" fontFamily="monospace">
                  920 Active Commuters
                </text>
              </g>

              {/* Node 2: Central Premnagar Chowk Transit Hub */}
              <g transform="translate(450, 150)">
                <circle r="26" fill="#101515" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle r="10" fill="#FFFFFF" />
                <text x="0" y="-36" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800">
                  PREMNAGAR CHOWK TRANSIT HUB
                </text>
                <text x="0" y="42" textAnchor="middle" fill="#18A66A" fontSize="10" fontFamily="monospace">
                  18 Active Hub Convoys
                </text>
              </g>

              {/* Node 3: Uttaranchal University (UU) */}
              <g transform="translate(760, 80)">
                <circle r="24" fill="#101515" stroke="#18A66A" strokeWidth="2.5" />
                <circle r="9" fill="#18A66A" />
                <text x="0" y="-34" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
                  UTTARANCHAL UNIVERSITY
                </text>
                <text x="0" y="38" textAnchor="middle" fill="#98A2B3" fontSize="10" fontFamily="monospace">
                  1,850 Verified Students
                </text>
              </g>

              {/* Node 4: East Hub (Graphic Era / UPES) */}
              <g transform="translate(760, 220)">
                <circle r="20" fill="#101515" stroke="#1769FF" strokeWidth="2" />
                <circle r="7" fill="#1769FF" />
                <text x="0" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
                  GRAPHIC ERA / UPES HUB
                </text>
                <text x="0" y="-28" textAnchor="middle" fill="#98A2B3" fontSize="10" fontFamily="monospace">
                  1,420 Verified Students
                </text>
              </g>
            </svg>
          </div>

          {/* Regional College Tiles */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {DEMO_COLLEGES.map((c, i) => (
              <div key={i} className="p-3 bg-white/[0.02] rounded-xl border border-white/10">
                <span className="text-[#98A2B3] block text-[10px]">{c.hub}</span>
                <span className="text-white font-bold block mt-1 truncate">{c.name}</span>
                <span className="text-[#18A66A] text-[11px] block mt-0.5">{c.activeStudents} active peers</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const CampusNetworkSection = NetworkSection;

