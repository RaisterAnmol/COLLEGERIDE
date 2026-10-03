import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  LocateFixed,
  Car,
  Layers,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Radio,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface AdminLiveMobilityMapProps {
  collegeScope?: string;
  ongoingRides?: any[];
  className?: string;
}

// Campus Hotspots in Dehradun centered on UIT
const CAMPUS_HUBS = [
  { name: 'UIT Uttaranchal University (Main Gate)', lat: 30.3400, lng: 77.9515, rides: 12, type: 'campus' },
  { name: 'Premnagar Market & Chowk', lat: 30.3340, lng: 77.9620, rides: 9, type: 'hotspot' },
  { name: 'Ballupur Chowk (Flyover)', lat: 30.3392, lng: 78.0125, rides: 6, type: 'hotspot' },
  { name: 'Clock Tower Dehradun', lat: 30.3244, lng: 78.0416, rides: 8, type: 'hotspot' },
  { name: 'ISBT Dehradun Hub', lat: 30.2885, lng: 78.0080, rides: 5, type: 'transit' },
];

// Typical transit route segments connecting UIT to town
const TRANSIT_CORRIDORS: [number, number][][] = [
  // UIT to Premnagar to Ballupur to Clock Tower
  [
    [30.3400, 77.9515],
    [30.3370, 77.9570],
    [30.3340, 77.9620],
    [30.3355, 77.9850],
    [30.3380, 78.0010],
    [30.3392, 78.0125],
    [30.3320, 78.0280],
    [30.3244, 78.0416],
  ],
  // Premnagar to ISBT
  [
    [30.3340, 77.9620],
    [30.3180, 77.9750],
    [30.3010, 77.9920],
    [30.2885, 78.0080],
  ]
];

export const AdminLiveMobilityMap: React.FC<AdminLiveMobilityMapProps> = ({
  collegeScope = 'Uttaranchal University',
  ongoingRides = [],
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'google_streets' | 'osm'>('google_streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedHub, setSelectedHub] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // UIT coordinates: [30.3400, 77.9515]
    const map = L.map(mapContainerRef.current, {
      center: [30.3370, 77.9850],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    const tileUrl =
      activeLayer === 'google_streets'
        ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const layer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
    tileLayerRef.current = layer;

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Draw Transit Corridors
    TRANSIT_CORRIDORS.forEach((coords, idx) => {
      L.polyline(coords, {
        color: idx === 0 ? '#10B981' : '#059669',
        weight: 4,
        opacity: 0.75,
        dashArray: '6, 8',
      }).addTo(markersGroup);
    });

    // Campus Geofence Circle around UIT
    L.circle([30.3400, 77.9515], {
      radius: 900,
      color: '#143D32',
      weight: 1.5,
      fillColor: '#10B981',
      fillOpacity: 0.12,
      dashArray: '4, 4',
    }).addTo(markersGroup);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl =
      activeLayer === 'google_streets'
        ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // Render Hubs and Active Ride Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const group = markersLayerRef.current;
    group.clearLayers();

    // Re-draw Transit Corridors
    TRANSIT_CORRIDORS.forEach((coords, idx) => {
      L.polyline(coords, {
        color: idx === 0 ? '#10B981' : '#059669',
        weight: 4,
        opacity: 0.75,
        dashArray: '6, 8',
      }).addTo(group);
    });

    // Campus Geofence Circle around UIT
    L.circle([30.3400, 77.9515], {
      radius: 900,
      color: '#143D32',
      weight: 1.5,
      fillColor: '#10B981',
      fillOpacity: 0.12,
      dashArray: '4, 4',
    }).addTo(group);

    // Add Hub Markers
    CAMPUS_HUBS.forEach((hub) => {
      const isCampus = hub.type === 'campus';
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${isCampus ? '#10B981' : '#0F766E'}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${isCampus ? '#143D32' : '#0F766E'}; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 800;">
            ${isCampus ? 'UIT' : '📍'}
          </div>
        </div>
      `;

      const hubIcon = L.divIcon({
        className: 'admin-hub-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([hub.lat, hub.lng], { icon: hubIcon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px;">
          <b style="color: #143D32; font-size: 13px;">${hub.name}</b><br/>
          <span style="color: #64748B;">Active Commuters: <b>${hub.rides}</b></span><br/>
          <span style="display: inline-block; margin-top: 4px; padding: 2px 6px; background-color: #ECFDF5; color: #047857; border-radius: 4px; font-size: 10px; font-weight: 700;">GEOFENCE VERIFIED</span>
        </div>
      `);
    });

    // Add Simulated/Ongoing Live Student Drivers
    const demoDrivers = [
      { name: 'Aarav Sharma', lat: 30.3375, lng: 77.9580, vehicle: 'Hero Splendor', seats: 1, route: 'UIT → Premnagar' },
      { name: 'Priya Verma', lat: 30.3360, lng: 77.9950, vehicle: 'Swift Dzire (EV)', seats: 3, route: 'Ballupur → UIT' },
      { name: 'Rohan Mehta', lat: 30.3280, lng: 78.0320, vehicle: 'TVS Jupiter', seats: 1, route: 'Clock Tower → UIT' },
      { name: 'Ananya Joshi', lat: 30.3010, lng: 77.9920, vehicle: 'Hyundai i20', seats: 2, route: 'ISBT → UIT' },
    ];

    const driverList = ongoingRides.length > 0
      ? ongoingRides.map((r, i) => ({
          name: r.driver?.name || `Driver #${i + 1}`,
          lat: r.origin?.coordinates?.[1] || 30.3375 + (i * 0.004),
          lng: r.origin?.coordinates?.[0] || 77.9580 + (i * 0.008),
          vehicle: r.vehicle?.model || 'Campus Ride',
          seats: r.seatsAvailable || 2,
          route: `${r.origin?.text || 'Pickup'} → ${r.destination?.text || 'UIT'}`,
        }))
      : demoDrivers;

    driverList.forEach((driver) => {
      const carHtml = `
        <div style="background-color: #143D32; border: 2px solid #10B981; width: 30px; height: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(20,61,50,0.35); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
      `;

      const carIcon = L.divIcon({
        className: 'admin-driver-marker',
        html: carHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([driver.lat, driver.lng], { icon: carIcon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #10B981;"></span>
            <b style="color: #0F172A; font-size: 13px;">${driver.name}</b>
          </div>
          <div style="color: #64748B; font-size: 11px;">Vehicle: <b>${driver.vehicle}</b></div>
          <div style="color: #64748B; font-size: 11px;">Route: <b>${driver.route}</b></div>
          <div style="color: #059669; font-weight: 700; margin-top: 4px; font-size: 11px;">${driver.seats} Seat(s) Available</div>
        </div>
      `);
    });
  }, [ongoingRides]);

  // Recenter to UIT Uttaranchal University
  const handleRecenterUIT = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([30.3400, 77.9515], 14, { duration: 1.2 });
    }
  };

  return (
    <div className={`relative rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden ${className}`}>
      {/* Map Header Card Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-emerald-50/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#143D32] text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Live Campus Mobility Map</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                LIVE GPS FEED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active student shuttles, carpools, and transit corridors across {collegeScope}
            </p>
          </div>
        </div>

        {/* Map Control Tools */}
        <div className="flex items-center gap-2">
          {/* Layer switcher */}
          <button
            type="button"
            onClick={() => setActiveLayer(l => l === 'google_streets' ? 'osm' : 'google_streets')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Toggle Map Style"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{activeLayer === 'google_streets' ? 'Google Roads' : 'OSM Tiles'}</span>
          </button>

          {/* Recenter button */}
          <button
            type="button"
            onClick={handleRecenterUIT}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Center on UIT Premnagar"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Center UIT</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className={`w-full bg-slate-100 transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[360px] sm:h-[400px]'
        }`}
      />

      {/* Map Footer Bar with Corridors & Hotspots status */}
      <div className="p-3 sm:p-4 bg-slate-50/90 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#143D32] border border-white shadow-2xs" />
            <span className="font-bold text-slate-800">UIT Campus Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#143D32] border border-emerald-400" />
            <span>Active Student Drivers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-emerald-500 rounded-full" />
            <span>Verified Arterial Road Corridors</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>OSRM Real Roads & Open Telemetry</span>
        </div>
      </div>
    </div>
  );
};
