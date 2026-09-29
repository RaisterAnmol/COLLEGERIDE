import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#EAECF0] mt-24">
      {/* Editorial CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-b border-[#EAECF0]">
        <span className="text-xs font-mono uppercase tracking-widest text-[#667085] block mb-4">
          CAMPUSRIDE COMMUTE TRANSIT
        </span>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#101828] uppercase tracking-tight max-w-3xl mx-auto leading-tight">
          Where Are You Going?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#667085] max-w-xl mx-auto">
          Skip crowded public transit and erratic auto surge pricing. Connect directly with university peers on your route today.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/search"
            className="px-8 py-3.5 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-base shadow-sm transition-all hover:shadow hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span>Find your next ride</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/post"
            className="px-8 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#101828] font-semibold text-base border border-[#D0D5DD] transition-all flex items-center gap-2"
          >
            <Car className="w-4 h-4 text-[#143D32]" />
            <span>Offer your empty seats</span>
          </Link>
        </div>
      </div>

      {/* Directory Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-[#101828] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#143D32]" />
            <span>CampusRide</span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            The verified peer-to-peer carpool and mobility network built specifically for college campuses and university students.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase font-bold text-[#101828] tracking-wider mb-4">Product</h4>
          <ul className="space-y-2.5 text-xs text-[#667085]">
            <li>
              <Link to="/search" className="hover:text-[#101828] transition-colors">Find a ride</Link>
            </li>
            <li>
              <Link to="/post" className="hover:text-[#101828] transition-colors">Offer a ride</Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-[#101828] transition-colors">My trips & requests</Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-[#101828] transition-colors">Campus analytics</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase font-bold text-[#101828] tracking-wider mb-4">Colleges & Safety</h4>
          <ul className="space-y-2.5 text-xs text-[#667085]">
            <li>
              <a href="#trust" className="hover:text-[#101828] transition-colors">Verification standards</a>
            </li>
            <li>
              <a href="#trust" className="hover:text-[#101828] transition-colors">6-Digit Trip OTP & QR Code</a>
            </li>
            <li>
              <span className="hover:text-[#101828] transition-colors cursor-pointer">Women-Only carpools</span>
            </li>
            <li>
              <span className="hover:text-[#101828] transition-colors cursor-pointer">Community guidelines</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono uppercase font-bold text-[#101828] tracking-wider mb-4">Universities</h4>
          <ul className="space-y-2.5 text-xs font-mono text-[#667085]">
            <li>Uttaranchal University (UU Main Campus)</li>
            <li>Uttaranchal Institute of Technology (UIT)</li>
            <li>School of Computing Sciences (USCS)</li>
            <li>Uttaranchal Institute of Management (UIM)</li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Mission Line */}
      <div className="border-t border-[#EAECF0] py-8 text-center text-xs text-[#667085] max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 CampusRide. Built for campus communities.</p>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>COST-SPLIT ONLY</span>
          <span>•</span>
          <span>100% VERIFIED .EDU</span>
          <span>•</span>
          <span>REAL-TIME SAFETY</span>
        </div>
      </div>
    </footer>
  );
};

// Backwards-compatible alias
export const ArchitecturalFooter = Footer;
