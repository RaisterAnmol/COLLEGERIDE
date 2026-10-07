import React, { useState, useMemo } from 'react';
import { Building2, BarChart3, ShieldCheck, Leaf, ArrowRight, CheckCircle2, Search, Download, MapPin, School, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UTTARAKHAND_UNIVERSITIES } from '../data/csvDataLoader';
import { useAuth } from '../context/AuthContext';
import { PageHeroBanner } from '../components/common/PageHeroBanner';
import campusesHeroImg from '../assets/illustrations/campuses-hero.webp';

export const CollegesPage: React.FC = () => {
  const { activePersona } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');

  // Extract distinct locations/cities
  const cities = useMemo(() => {
    const set = new Set<string>();
    UTTARAKHAND_UNIVERSITIES.forEach(u => {
      const city = u.location.split(',')[0].trim();
      if (city) set.add(city);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, []);

  // Filtered universities list from CSV
  const filteredUniversities = useMemo(() => {
    return UTTARAKHAND_UNIVERSITIES.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'ALL' || u.location.toLowerCase().includes(selectedCity.toLowerCase());
      return matchesSearch && matchesCity;
    });
  }, [searchQuery, selectedCity]);

  const handleDownloadCSV = () => {
    window.open('/data/uttarakhand_universities.csv', '_blank');
  };

  return (
    <div className="min-h-screen text-[#111111] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Editorial Header + Illustrated Hero Card Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-[#DDE1DE] shadow-xs">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#143D32] font-semibold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              CSV DATASET POWERED
            </span>
            <span className="text-xs font-mono text-slate-500">
              uttarakhand_universities.csv ({UTTARAKHAND_UNIVERSITIES.length} institutions)
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight leading-[1.1]">
            Uttarakhand Higher Education<br />
            <span className="text-[#143D32]">Carpool Network.</span>
          </h1>
          <p className="text-base text-[#646A67] leading-relaxed">
            Connecting students and faculty across all 48 accredited universities in Uttarakhand, from Uttaranchal University and Graphic Era in Dehradun to Roorkee, Pantnagar, and Srinagar campuses.
          </p>
          <div className="pt-2">
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
              title="Download the source CSV file"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Download Universities CSV</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-2xl overflow-hidden border border-[#DDE1DE] shadow-md group">
            <img
              src={campusesHeroImg}
              alt="Aerial view of an Indian university campus with CampusRide car on ring road"
              className="w-full h-56 sm:h-64 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#143D32]/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-[#143D32]/85 backdrop-blur-sm border border-emerald-400/30 text-emerald-50">
                48 CAMPUSES
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-semibold">
                ACTIVE CORRIDORS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1769FF] flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">1. Gate Transit Analytics</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Monitor real-time arrival peaks across campus gates to optimize security guard staffing, shuttle feeder buses, and traffic lights.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#18A66A] flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">2. Quantifiable ESG / NAAC Metrics</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Generate verifiable carbon-offset reports detailing total vehicular emissions averted for institutional rankings and sustainability audits.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#F5F6F3] text-[#111111] flex items-center justify-center border border-[#DDE1DE]">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">3. 30%+ Parking Relief</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Consolidating single-occupant commuter cars into 3–4 student carpools reduces campus lot crowding without expanding asphalt parking lots.
          </p>
        </div>
      </div>

      {/* Uttarakhand Universities CSV Directory */}
      <div className="bg-[#FFFFFF] p-6 sm:p-10 rounded-3xl border border-[#DDE1DE] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2.5">
              <School className="w-6 h-6 text-[#143D32]" />
              <span>Accredited Universities Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Source: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono">uttarakhand_universities.csv</code> · Showing {filteredUniversities.length} of {UTTARAKHAND_UNIVERSITIES.length} institutions
            </p>
          </div>

          {/* Search & Location Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search university or field..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#143D32]/20 w-48 sm:w-64"
              />
            </div>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700 font-medium"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === 'ALL' ? 'All Locations' : city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* University Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUniversities.map((uni, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {uni.location}
                  </span>
                  {uni.established && (
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Est. {uni.established}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-[#111111] text-base mt-3 group-hover:text-[#143D32] transition-colors leading-snug">
                  {uni.name}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  <Award className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                  {uni.specialization || 'General / Multi-Disciplinary Studies'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold text-[11px] font-mono">
                  Active Carpool Zone
                </span>
                {activePersona === 'driver' ? (
                  <Link
                    to="/post"
                    className="font-medium text-[#143D32] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Post Ride</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    to="/search"
                    className="font-medium text-[#143D32] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Find Rides</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


