import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, ArrowRight, Clock, Users } from 'lucide-react';
import { DEMO_STUDENTS } from '../../data/mockData';
import { PageHeroBanner } from '../common/PageHeroBanner';
import { AvatarFrame } from '../signature/AvatarFrame';
import { StudentArchetype } from '../signature/StudentAvatar';
import { TactileStudentBadge } from '../signature/TactileStudentBadge';

// Authentic Photorealistic Campus Students Community Banner
const communityImg = '/dashboard-students-real.jpg';

export const CommunitySection: React.FC = () => {
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);
  const studentsList = Object.values(DEMO_STUDENTS);

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
      {/* High-Impact Real University Student Community Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden border-2 border-white shadow-[0_16px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] mb-10 group bg-slate-900"
      >
        <img
          src={communityImg}
          alt="Authentic Indian college students laughing and sharing a carpool on university campus"
          className="w-full h-64 sm:h-80 md:h-96 object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

        {/* Floating Top Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-md text-slate-900 text-xs font-mono font-black">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>CAMPUS PEER COMMUNITY</span>
        </div>

        {/* Bottom Banner Content */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between text-white gap-3 z-10">
          <div>
            <span className="text-xs font-mono text-emerald-300 font-extrabold uppercase tracking-wider block mb-1">
              CAMPUS SOCIAL FABRIC
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-white leading-tight drop-shadow-md">
              Classmates Commuting On Your Corridor.
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl font-normal drop-shadow">
              Meet fellow engineering, design, and management students heading your way. Share fuel costs, conversations, and daily schedules.
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-slate-900 font-mono font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition-all self-start sm:self-auto shrink-0 border border-white hover:scale-105"
          >
            <span>JOIN YOUR CORRIDOR</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </Link>
        </div>
      </motion.div>

      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-5xl"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-900 bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-full font-black mb-3 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-purple-700" />
            Verified Corridor Profiles
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Connect With Daily Commuters.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl font-medium leading-relaxed">
            Real peers commuting from your campus neighborhood. Check their daily route trajectory and connect to share the ride.
          </p>
        </div>

        <Link
          to="/search"
          className="text-xs font-mono font-black text-white bg-purple-800 hover:bg-purple-900 px-6 py-3.5 rounded-full flex items-center gap-2 self-start md:self-auto transition-all shadow-md neu-btn cursor-pointer shrink-0"
        >
          <span>EXPLORE ALL RIDERS</span>
          <ArrowRight className="w-4 h-4 text-purple-200" />
        </Link>
      </motion.div>

      {/* Grid of Micro-Interaction Student Passes */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentsList.slice(0, 4).map((student, idx) => {
          const arch: StudentArchetype =
            student.name.toLowerCase().includes('aditya') ? 'aditya'
            : student.name.toLowerCase().includes('ananya') ? 'kavita'
            : student.name.toLowerCase().includes('rahul') ? 'rohan'
            : student.name.toLowerCase().includes('priya') ? 'priya'
            : 'aarav';

          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="ticket-wrapper group transition-all duration-200"
            >
              <article
                className="ticket-silhouette bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl relative shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all flex flex-col justify-between h-full"
                role="region"
                aria-label={`Student corridor ticket: ${student.name}`}
              >
                <div>
                  {/* Header: Departure & Fare */}
                  <div className="flex items-center justify-between pb-3 border-b border-line-subtle font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-ink-primary font-bold">
                      <Clock className="w-3.5 h-3.5 text-route" />
                      <span>{student.commuteRoute.departureTime}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-route">₹{student.commuteRoute.fare}</span>
                      <span className="text-[10px] text-ink-muted ml-1 font-sans">split</span>
                    </div>
                  </div>

                  {/* Stitched Papercraft Student Identity Badge */}
                  <div className="mt-3.5">
                    <TactileStudentBadge
                      name={student.name}
                      collegeShort={student.collegeShort}
                      role={student.role}
                      archetype={arch}
                      isVerified={true}
                      className="w-full justify-between"
                    />
                  </div>

                  {/* Perforated Divider Line */}
                  <div className="border-t border-dashed border-line-base my-3.5 relative -mx-5 sm:-mx-6" />

                  {/* Commute Route Corridor */}
                  <div>
                    <div className="text-xs font-semibold text-ink-primary flex items-center justify-between">
                      <span className="truncate">{student.commuteRoute.origin.split('(')[0]}</span>
                      <span className="text-route ml-1 shrink-0 font-mono text-[11px] font-bold">→ Campus</span>
                    </div>

                    {/* Route Progress Bar */}
                    <div className="mt-2 h-1.5 w-full bg-canvas rounded-full overflow-hidden border border-line-base">
                      <div className="h-full bg-route rounded-full w-2/3" />
                    </div>
                  </div>

                  {/* Student Bio Quote */}
                  <div className="mt-3 text-xs text-ink-secondary leading-relaxed line-clamp-2 italic">
                    "{student.bio}"
                  </div>
                </div>

                {/* Perforated Divider Line */}
                <div className="border-t border-dashed border-line-base my-3 relative -mx-5 sm:-mx-6" />

                {/* Footer: Rating, Punctuality & Link */}
                <div className="pt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 font-bold text-ink-primary">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {student.rating.toFixed(1)}
                    </span>
                    <span className="text-line-strong">•</span>
                    <span className="text-route font-semibold">{student.punctualityRate}% on-time</span>
                  </div>

                  <Link
                    to="/search"
                    className="inline-flex items-center gap-1 text-xs font-bold text-route hover:text-route-light transition-colors"
                  >
                    <span>Ride</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

// Backwards-compatible alias
export const FindYourPeople = CommunitySection;
