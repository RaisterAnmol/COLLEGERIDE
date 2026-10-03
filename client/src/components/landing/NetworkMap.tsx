import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
  Car,
  Coins,
  ArrowLeftRight,
  ShieldCheck,
  Wifi,
  RotateCw,
  Plus,
  Minus,
  Activity,
  Navigation,
  Compass,
  Layers,
  Sparkles,
  ChevronRight,
  MapPin,
  Clock,
  Gauge,
  Users,
} from 'lucide-react';

interface ActiveVehicle {
  id: string;
  driver: string;
  avatar: string;
  department: string;
  college: string;
  car: string;
  plate: string;
  origin: string;
  route: string;
  eta: string;
  etaMinutes: number;
  speed: string;
  fare: string;
  seats: number;
  totalSeats: number;
  corridor: 'north' | 'west' | 'east';
  lat: number;
  lng: number;
  rating: number;
  verified: boolean;
  detour: string;
}

const VEHICLES: ActiveVehicle[] = [
  {
    id: 'v-1',
    driver: 'Aditya Kumar',
    avatar: '/test_uploads/profile_photo.jpg',
    department: 'UIT Mechanical · Sem 5',
    college: 'Uttaranchal University',
    car: 'Suzuki Swift',
    plate: 'UK 07 AK 4920',
    origin: 'Premnagar Chowk',
    route: 'Premnagar Chowk → UU Gate 1',
    eta: '6 mins to campus',
    etaMinutes: 6,
    speed: '42 km/h',
    fare: '₹25',
    seats: 3,
    totalSeats: 4,
    corridor: 'west',
    lat: 30.3364,
    lng: 77.9594,
    rating: 4.8,
    verified: true,
    detour: '1.2 mins',
  },
  {
    id: 'v-2',
    driver: 'Ananya Verma',
    avatar: '/test_uploads/driver_female_makima.jpg',
    department: 'USCS Computer Science · Sem 5',
    college: 'Uttaranchal University',
    car: 'Hyundai i20 Sportz',
    plate: 'UK 07 AV 8112',
    origin: 'Suddhowala PG Hub',
    route: 'Suddhowala PG Hub → UIT Campus',
    eta: '5 mins to campus',
    etaMinutes: 5,
    speed: '38 km/h',
    fare: '₹20',
    seats: 3,
    totalSeats: 4,
    corridor: 'north',
    lat: 30.3444,
    lng: 77.9262,
    rating: 4.9,
    verified: true,
    detour: '0.8 mins',
  },
  {
    id: 'v-3',
    driver: 'Siddharth Rao',
    avatar: '/test_uploads/driver_male_ichigo.jpg',
    department: 'UIM BBA Marketing · Sem 5',
    college: 'Uttaranchal University',
    car: 'Honda City i-VTEC',
    plate: 'UK 07 SR 7721',
    origin: 'Selaqui Industrial Hub',
    route: 'Selaqui Hub → UU Gate 1',
    eta: '14 mins to campus',
    etaMinutes: 14,
    speed: '48 km/h',
    fare: '₹40',
    seats: 4,
    totalSeats: 5,
    corridor: 'north',
    lat: 30.3551,
    lng: 77.8561,
    rating: 4.7,
    verified: true,
    detour: '2.1 mins',
  },
  {
    id: 'v-4',
    driver: 'Sneha Joshi',
    avatar: '/test_uploads/driver_female_mitsuha.jpg',
    department: 'Law College Dehradun · Sem 7',
    college: 'Uttaranchal University',
    car: 'Tata Nexon EV',
    plate: 'UK 07 SJ 5430',
    origin: 'Clock Tower Dehradun',
    route: 'Clock Tower Dehradun → UU Gate 1',
    eta: '18 mins to campus',
    etaMinutes: 18,
    speed: '40 km/h',
    fare: '₹45',
    seats: 4,
    totalSeats: 5,
    corridor: 'east',
    lat: 30.3370,
    lng: 77.9850,
    rating: 4.9,
    verified: true,
    detour: '2.5 mins',
  },
];

// Corridor 1: Selaqui & Suddhowala directly to Uttaranchal University (Real OSRM Road Geometry)
const NORTH_ROUTE: [number, number][] = [
  [30.3685, 77.8540], // Selaqui Hub
  [30.3613, 77.8477],
  [30.3551, 77.8561],
  [30.3496, 77.8676],
  [30.3472, 77.8722],
  [30.3469, 77.8779],
  [30.3481, 77.8833],
  [30.3497, 77.8863],
  [30.3488, 77.8904],
  [30.3467, 77.8959],
  [30.3456, 77.9021],
  [30.3449, 77.9078],
  [30.3443, 77.9134],
  [30.3442, 77.9201],
  [30.3444, 77.9262],
  [30.3475, 77.9320], // Suddhowala PG Hub
  [30.3468, 77.9345],
  [30.3458, 77.9363],
  [30.3453, 77.9399],
  [30.3457, 77.9425],
  [30.3450, 77.9454],
  [30.3445, 77.9478],
  [30.3437, 77.9514],
  [30.3425, 77.9547],
  [30.3414, 77.9547], // Nanda Ki Chowki Bridge
  [30.3412, 77.9540], // Gate 1 Approach
  [30.3405, 77.9520], // Campus Road
  [30.3400, 77.9515], // Uttaranchal University (UIT / Central Hub)
];

// Corridor 2: Premnagar Chowk directly to Uttaranchal University (Real OSRM Road Geometry)
const WEST_ROUTE: [number, number][] = [
  [30.3340, 77.9620], // Premnagar Chowk
  [30.3360, 77.9625],
  [30.3364, 77.9594],
  [30.3367, 77.9579],
  [30.3376, 77.9565],
  [30.3399, 77.9554],
  [30.3408, 77.9551],
  [30.3414, 77.9547], // Nanda Ki Chowki Bridge
  [30.3412, 77.9540], // Gate 1 Approach
  [30.3405, 77.9520], // Campus Road
  [30.3400, 77.9515], // Uttaranchal University (UIT / Central Hub)
];

// Corridor 3: Clock Tower Dehradun & Ballupur Chowk to Uttaranchal University (Real OSRM Road Geometry)
const EAST_ROUTE: [number, number][] = [
  [30.3256, 78.0437], // Clock Tower Dehradun
  [30.3285, 78.0320],
  [30.3340, 78.0220],
  [30.3395, 78.0125], // Ballupur Chowk
  [30.3385, 77.9980],
  [30.3370, 77.9850],
  [30.3355, 77.9730],
  [30.3340, 77.9620], // Premnagar Chowk
  [30.3360, 77.9625],
  [30.3367, 77.9579],
  [30.3376, 77.9565],
  [30.3408, 77.9551],
  [30.3414, 77.9547], // Nanda Ki Chowki Bridge
  [30.3412, 77.9540], // Gate 1 Approach
  [30.3405, 77.9520], // Campus Road
  [30.3400, 77.9515], // Uttaranchal University (UIT / Central Hub)
];

export const NetworkMap: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCorridor, setSelectedCorridor] = useState<'all' | 'north' | 'west' | 'east'>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [mapLayerType, setMapLayerType] = useState<'google' | 'satellite' | 'osm'>('google');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vehicleMarkersRef = useRef<Record<string, L.Marker>>({});

  // Dynamic live clock
  useEffect(() => {
    const updateStamp = () => {
      const d = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
      setCurrentTime(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${formattedHours}:${minutes} ${ampm}`);
    };
    updateStamp();
    const interval = setInterval(updateStamp, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTileUrl = (type: 'google' | 'satellite' | 'osm') => {

    if (type === 'satellite') {
      return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en';
    }
    if (type === 'osm') {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en';
  };

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30.3430, 77.9480],
        zoom: 12.4,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        dragging: true,
      });

      const tileLayer = L.tileLayer(getTileUrl(mapLayerType), {
        maxZoom: 19,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3', 'a', 'b', 'c', 'd'],
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = L.tileLayer(getTileUrl(mapLayerType), {
      maxZoom: 19,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3', 'a', 'b', 'c', 'd'],
    }).addTo(map);
  }, [mapLayerType]);

  // Focus a vehicle smoothly
  const handleSelectVehicle = (v: ActiveVehicle) => {
    setSelectedVehicleId(v.id);
    setSelectedCorridor(v.corridor);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([v.lat, v.lng], 14, { duration: 0.9 });
      setTimeout(() => {
        vehicleMarkersRef.current[v.id]?.openPopup();
      }, 400);
    }
  };

  const handleRecenter = () => {
    setSelectedVehicleId(null);
    setSelectedCorridor('all');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([30.3430, 77.9480], 12.4, { duration: 0.8 });
    }
  };

  // Render Routes, Waypoints, Live Vehicle Badges, and Popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    vehicleMarkersRef.current = {};

    const isAll = selectedCorridor === 'all';
    const isNorth = isAll || selectedCorridor === 'north';
    const isWest = isAll || selectedCorridor === 'west';
    const isEast = isAll || selectedCorridor === 'east';

    // 1. Polylines
    // North Corridor (Emerald)
    L.polyline(NORTH_ROUTE, {
      color: '#10B981',
      weight: selectedCorridor === 'north' ? 6 : 4.5,
      opacity: isNorth ? 0.95 : 0.2,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(group);

    // West Corridor (Indigo)
    L.polyline(WEST_ROUTE, {
      color: '#6366F1',
      weight: selectedCorridor === 'west' ? 6 : 4.5,
      opacity: isWest ? 0.95 : 0.2,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(group);

    // East Corridor (Teal/Emerald dark)
    L.polyline(EAST_ROUTE, {
      color: '#0D9488',
      weight: selectedCorridor === 'east' ? 6 : 4.5,
      opacity: isEast ? 0.95 : 0.2,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(group);

    // 2. Waypoint Markers (Clean circular pins with no text collision)
    // Selaqui Hub
    if (isNorth) {
      const selaquiIcon = L.divIcon({
        className: 'custom-waypoint',
        html: `
          <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-md border border-slate-200/90 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-105 transition-transform">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span class="text-xs font-bold text-slate-800">Selaqui Hub</span>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker([30.3685, 77.8540], { icon: selaquiIcon }).addTo(group);

      const suddhowalaIcon = L.divIcon({
        className: 'custom-waypoint',
        html: `
          <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-md border border-slate-200/90 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-105 transition-transform">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-200"></span>
            <span class="text-xs font-bold text-slate-800">Suddhowala Hub</span>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker([30.3475, 77.9320], { icon: suddhowalaIcon }).addTo(group);
    }

    // Premnagar Chowk
    if (isWest || isAll) {
      const premnagarIcon = L.divIcon({
        className: 'custom-waypoint',
        html: `
          <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-md border border-slate-200/90 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-105 transition-transform">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-200"></span>
            <span class="text-xs font-bold text-slate-800">Premnagar Chowk</span>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker([30.3340, 77.9620], { icon: premnagarIcon }).addTo(group);
    }

    // Ballupur Chowk & Clock Tower Dehradun
    if (isEast) {
      const ballupurIcon = L.divIcon({
        className: 'custom-waypoint',
        html: `
          <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-md border border-slate-200/90 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-105 transition-transform">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-600 ring-2 ring-cyan-200"></span>
            <span class="text-xs font-bold text-slate-800">Ballupur Chowk</span>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker([30.3395, 78.0125], { icon: ballupurIcon }).addTo(group);

      const clockTowerIcon = L.divIcon({
        className: 'custom-waypoint',
        html: `
          <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-md border border-slate-200/90 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-105 transition-transform">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span class="text-xs font-bold text-slate-800">Clock Tower</span>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker([30.3256, 78.0437], { icon: clockTowerIcon }).addTo(group);
    }

    // 3. Central Destination Hub: Uttaranchal University Campus Grounds
    const campusIcon = L.divIcon({
      className: 'custom-campus-hub',
      html: `
        <div class="flex flex-col items-center cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group">
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 rounded-full bg-emerald-500/30 animate-ping pointer-events-none"></div>
            <div class="w-10 h-10 rounded-full bg-[#143D32] text-white flex items-center justify-center border-2 border-white shadow-xl text-base group-hover:scale-110 transition-transform">
              🏛️
            </div>
          </div>
          <div class="mt-1 bg-[#143D32] text-white px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-tight shadow-md whitespace-nowrap border border-emerald-400/40">
            Uttaranchal University (UIT &amp; USCS)
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });
    const campusMarker = L.marker([30.3400, 77.9515], { icon: campusIcon }).addTo(group);
    campusMarker.on('click', () => {
      navigate('/colleges');
    });

    // 4. Live Interactive Vehicle Markers (Sleek Compact Pins - Zero Collision)
    VEHICLES.forEach((v) => {
      const isVisible = selectedCorridor === 'all' || selectedCorridor === v.corridor;
      if (!isVisible) return;

      const isFocused = selectedVehicleId === v.id;

      const vehicleIcon = L.divIcon({
        className: `vehicle-pulse-marker ${isFocused ? 'z-50' : 'z-30'}`,
        html: `
          <div class="group relative cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-115">
            <!-- Pulsing Radar Glow -->
            <span class="absolute -inset-1.5 rounded-full ${isFocused ? 'bg-indigo-500/40 animate-ping' : 'bg-emerald-500/30 animate-pulse'}"></span>
            
            <!-- Circular Driver Badge -->
            <div class="relative w-10 h-10 rounded-full border-2 ${isFocused ? 'border-indigo-600 ring-2 ring-indigo-400' : 'border-white ring-2 ring-emerald-500'} shadow-lg overflow-hidden bg-white">
              <img src="${v.avatar}" alt="${v.driver}" class="w-full h-full object-cover" />
              <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[7px] text-white font-bold">✓</span>
            </div>

            <!-- Compact Tag Under Marker -->
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap ${isFocused ? 'bg-indigo-900 text-white' : 'bg-slate-900/90 text-white'} px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-tight shadow-md flex items-center gap-1 border border-white/20">
              <span>🚗</span>
              <span>${v.driver.split(' ')[0]}</span>
              <span class="${isFocused ? 'text-indigo-200' : 'text-emerald-400'} font-semibold">• ${v.etaMinutes}m</span>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([v.lat, v.lng], { icon: vehicleIcon }).addTo(group);
      vehicleMarkersRef.current[v.id] = marker;

      // Popup with detailed driver telemetry
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 4px 2px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <img src="${v.avatar}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #10B981;" />
            <div>
              <div style="font-weight: 800; font-size: 13px; color: #0f172a; display: flex; align-items: center; gap: 4px;">
                <span>${v.driver}</span>
                <span style="color: #059669; font-size: 11px;">✓</span>
                <span style="margin-left: auto; color: #d97706; font-size: 11px; font-weight: 700;">★ ${v.rating}</span>
              </div>
              <div style="font-size: 10px; color: #64748b; font-weight: 500;">${v.department}</div>
            </div>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 6px 8px; border: 1px solid #e2e8f0; margin-bottom: 8px; font-size: 11px; line-height: 1.4;">
            <div style="color: #334155; font-weight: 600; display: flex; justify-content: space-between;">
              <span>🚗 ${v.car}</span>
              <span style="color: #059669; font-weight: 700;">${v.seats} seats free</span>
            </div>
            <div style="color: #64748b; font-size: 10px; margin-top: 2px;">
              Route: <strong>${v.route}</strong>
            </div>
            <div style="color: #475569; font-size: 10px; margin-top: 2px; display: flex; justify-content: space-between;">
              <span>⚡ ${v.speed}</span>
              <span>⏱️ ${v.eta}</span>
            </div>
          </div>

          <button id="book-btn-${v.id}" style="width: 100%; background: #143D32; color: #ffffff; border: none; padding: 6px 10px; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer; transition: background 0.15s;">
            Request Ride (${v.fare}) →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        offset: [0, -18],
        closeButton: true,
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`book-btn-${v.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/search?from=${encodeURIComponent(v.origin)}&to=Uttaranchal%20University`);
          };
        }
      });

      marker.on('click', () => {
        setSelectedVehicleId(v.id);
      });
    });
  }, [selectedCorridor, selectedVehicleId, navigate]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const activeVehiclesCount = VEHICLES.filter(
    (v) => selectedCorridor === 'all' || selectedCorridor === v.corridor,
  ).length;

  return (
    <section id="live-map" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold border border-emerald-200/80 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>24 STUDENTS EN ROUTE TO UTTARANCHAL UNIVERSITY</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight">
            Find Your People.
          </h2>
          <p className="mt-2 text-base text-slate-600 max-w-2xl leading-relaxed">
            Live transit mesh of active student carpools operating across primary Dehradun corridors heading directly to Uttaranchal University (UIT, USCS, Law &amp; Library Gate).
          </p>
        </div>

        {/* Corridor Selector Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-mono self-start md:self-auto">
          {(
            [
              { id: 'all', label: 'All Corridors', count: '4' },
              { id: 'north', label: 'Selaqui & Suddhowala', count: '2' },
              { id: 'west', label: 'Premnagar Chowk', count: '1' },
              { id: 'east', label: 'Clock Tower & Ballupur', count: '1' },
            ] as const
          ).map((corr) => (
            <button
              key={corr.id}
              onClick={() => {
                setSelectedCorridor(corr.id);
                setSelectedVehicleId(null);
              }}
              className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCorridor === corr.id
                  ? 'bg-[#143D32] text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
              }`}
            >
              <span>{corr.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  selectedCorridor === corr.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {corr.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Geographic Transit Map */}
      <div className="relative rounded-3xl border border-slate-200/90 shadow-md overflow-hidden bg-[#EBF3EF]">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="h-[520px] sm:h-[600px] w-full z-0" />

        {/* Floating Overlay Controls on Top of Map */}
        <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between z-10">
          {/* Top Bar Overlays */}
          <div className="flex items-start justify-between flex-wrap gap-2.5">
            {/* Top Left: Transit Mesh Title Pill */}
            <div className="flex items-center gap-2">
              <div className="pointer-events-auto bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-md text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-900 font-bold tracking-tight">TRANSIT MESH: DEHRADUN CAMPUS ARTERIES</span>
                <span className="text-slate-400">⇄</span>
                <span className="text-slate-600 font-semibold">{activeVehiclesCount} ACTIVE CHANNELS</span>
              </div>
            </div>

            {/* Top Right: Layer Switcher & Live GPS Telemetry */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="pointer-events-auto bg-emerald-50/95 backdrop-blur px-3 py-1.5 rounded-full border border-emerald-300/80 shadow-md text-xs font-mono text-[#143D32] font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>LIVE GPS TELEMETRY</span>
              </div>

              {/* 3-Way Layer Switcher */}
              <div className="pointer-events-auto bg-white/95 backdrop-blur p-0.5 rounded-full border border-slate-200/80 shadow-md text-xs font-mono flex items-center">
                <button
                  type="button"
                  onClick={() => setMapLayerType('google')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    mapLayerType === 'google' ? 'bg-[#143D32] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🗺️ Google Roads
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayerType('satellite')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    mapLayerType === 'satellite' ? 'bg-[#143D32] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🛰️ Satellite
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayerType('osm')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    mapLayerType === 'osm' ? 'bg-[#143D32] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌍 OpenStreetMap
                </button>
              </div>

              {/* Minimalist Legend */}
              <div className="hidden lg:flex pointer-events-auto bg-white/95 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200/80 shadow-md text-xs font-mono text-slate-700 items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Live Car
                </span>
                <span className="flex items-center gap-1">🏛️ Campus</span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Route
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Left Controls: Compass, Recenter & Zoom */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col items-start gap-2 pointer-events-auto">
              {/* Recenter View Button */}
              <button
                type="button"
                onClick={handleRecenter}
                title="Reset view to entire Dehradun transit corridor"
                className="w-8 h-8 rounded-full bg-white/95 backdrop-blur border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-[#143D32] hover:bg-emerald-50 cursor-pointer transition-colors"
              >
                <Compass className="w-4 h-4" />
              </button>

              {/* Zoom In/Out Buttons */}
              <div className="bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-md overflow-hidden flex flex-col divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* Scale Pill */}
              <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-md border border-slate-200 shadow-xs text-[10px] font-mono text-slate-600 flex items-center gap-1.5">
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
                <span>1 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Active Classmate Drivers Deck (Non-Colliding, Fully Interactive) */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
              ACTIVE CLASSMATE CARPOOLS EN ROUTE ({activeVehiclesCount})
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            Click any card to highlight route on map
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VEHICLES.filter((v) => selectedCorridor === 'all' || selectedCorridor === v.corridor).map((v) => {
            const isSelected = selectedVehicleId === v.id;

            return (
              <div
                key={v.id}
                onClick={() => handleSelectVehicle(v)}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                {/* Header: Avatar, Name, Rating */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={v.avatar}
                      alt={v.driver}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-slate-900 truncate">{v.driver}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        ★ {v.rating}
                      </span>
                      <span>•</span>
                      <span className="truncate">{v.department.split('·')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Route Details */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      {v.origin}
                    </span>
                    <span className="font-bold text-emerald-700 shrink-0 ml-1">{v.fare}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono">
                    <span className="truncate">🚗 {v.car}</span>
                    <span className="text-emerald-700 font-semibold shrink-0">{v.seats} seats open</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-slate-400" />
                      {v.speed}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {v.etaMinutes}m ETA
                    </span>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/search?from=${encodeURIComponent(v.origin)}&to=Uttaranchal%20University`);
                  }}
                  className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-50 group-hover:bg-[#143D32] group-hover:text-white text-slate-700 text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Book Seat</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom 6-Column Telemetry KPI Bar */}
      <div className="mt-6 bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* KPI 1: Live Carpools */}
        <div className="flex items-start gap-3 pt-3 md:pt-0">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              LIVE CARPOOLS
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">4</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </span>
          </div>
        </div>

        {/* KPI 2: Avg Fare */}
        <div className="flex items-start gap-3 pt-3 md:pt-0 md:pl-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-[#143D32]" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              AVG FARE (PER SEAT)
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">₹40</span>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">~ fuel split</span>
          </div>
        </div>

        {/* KPI 3: Median Detour */}
        <div className="flex items-start gap-3 pt-3 md:pt-0 md:pl-4">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              MEDIAN DETOUR
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">&lt; 2.5 mins</span>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">(Non-Commercial)</span>
          </div>
        </div>

        {/* KPI 4: Commission */}
        <div className="flex items-start gap-3 pt-3 md:pt-0 md:pl-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#143D32]" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              COMMISSION
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">₹0</span>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">(Non-Commercial)</span>
          </div>
        </div>

        {/* KPI 5: Network Status */}
        <div className="flex items-start gap-3 pt-3 md:pt-0 md:pl-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              NETWORK STATUS
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">Healthy</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              All systems operational
            </span>
          </div>
        </div>

        {/* KPI 6: Last Updated */}
        <div className="flex items-start gap-3 pt-3 md:pt-0 md:pl-4">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <RotateCw className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              TELEMETRY SYNC
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">Updated just now</span>
            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{currentTime}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Backwards-compatible alias
export const InteractiveNetworkMap = NetworkMap;
