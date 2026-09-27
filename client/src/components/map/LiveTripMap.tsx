import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Navigation,
  LocateFixed,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Compass,
  Car,
  Maximize2,
} from 'lucide-react';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';

interface LatLngPoint {
  lat: number;
  lng: number;
}

interface LiveTripMapProps {
  tripId: string;
  isDriver: boolean;
  origin: { text: string; lat: number; lng: number };
  destination: { text: string; lat: number; lng: number };
  initialRoutePolyline?: [number, number][];
  currentLocation?: LatLngPoint | null;
  onDeviationChange?: (deviation: { distanceMeters: number; isDeviated: boolean } | null) => void;
}

export const LiveTripMap: React.FC<LiveTripMapProps> = ({
  tripId,
  isDriver,
  origin,
  destination,
  initialRoutePolyline,
  currentLocation,
  onDeviationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [routePoints, setRoutePoints] = useState<[number, number][]>(initialRoutePolyline || []);
  const [driverPos, setDriverPos] = useState<LatLngPoint>(
    currentLocation || { lat: origin.lat, lng: origin.lng }
  );
  const [isLiveGpsActive, setIsLiveGpsActive] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [deviationMeters, setDeviationMeters] = useState<number>(0);
  const [isDeviated, setIsDeviated] = useState(false);

  // Compute point-to-polyline distance (meters)
  const computePointToRouteDistance = useCallback(
    (point: LatLngPoint, path: [number, number][]): number => {
      if (!path || path.length < 2) return 0;
      let minDistance = Infinity;

      for (let i = 0; i < path.length - 1; i++) {
        const p1 = { lat: path[i][0], lng: path[i][1] };
        const p2 = { lat: path[i + 1][0], lng: path[i + 1][1] };

        // Distance from point to segment in meters
        const R = 6371000;
        const x1 = (p1.lng * Math.PI) / 180;
        const y1 = (p1.lat * Math.PI) / 180;
        const x2 = (p2.lng * Math.PI) / 180;
        const y2 = (p2.lat * Math.PI) / 180;
        const xp = (point.lng * Math.PI) / 180;
        const yp = (point.lat * Math.PI) / 180;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;

        let t = 0;
        if (lenSq > 0) {
          t = Math.max(0, Math.min(1, ((xp - x1) * dx + (yp - y1) * dy) / lenSq));
        }

        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        const dLat = yp - projY;
        const dLng = xp - projX;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(projY) * Math.cos(yp) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const dist = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        if (dist < minDistance) {
          minDistance = dist;
        }
      }
      return Math.round(minDistance);
    },
    []
  );

  // Fetch or calculate road route if not provided
  useEffect(() => {
    let isCancelled = false;

    async function loadRoadRoute() {
      if (initialRoutePolyline && initialRoutePolyline.length > 1) {
        setRoutePoints(initialRoutePolyline);
        return;
      }

      try {
        const res = await api.calculateRoadRoute(
          { lat: origin.lat, lng: origin.lng },
          { lat: destination.lat, lng: destination.lng }
        );
        if (!isCancelled && res.decodedPath && res.decodedPath.length > 0) {
          setRoutePoints(res.decodedPath);
        }
      } catch (err) {
        console.warn('[LiveTripMap] Fallback direct route:', err);
        if (!isCancelled) {
          setRoutePoints([
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ]);
        }
      }
    }

    loadRoadRoute();

    return () => {
      isCancelled = true;
    };
  }, [origin, destination, initialRoutePolyline]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([origin.lat, origin.lng], 14);

    // Google Maps Styled Roads Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Custom Origin Pin
    const originIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
          P
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Custom Destination Pin
    const destIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
          D
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Driver Vehicle Icon
    const carIcon = L.divIcon({
      className: 'custom-vehicle-marker',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background-color: rgba(16, 185, 129, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background-color: #047857; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 6px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; z-index: 10;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    L.marker([origin.lat, origin.lng], { icon: originIcon })
      .bindPopup(`<b>Pickup:</b> ${origin.text}`)
      .addTo(map);

    L.marker([destination.lat, destination.lng], { icon: destIcon })
      .bindPopup(`<b>Drop-off:</b> ${destination.text}`)
      .addTo(map);

    const driverMarker = L.marker([driverPos.lat, driverPos.lng], {
      icon: carIcon,
      zIndexOffset: 1000,
    })
      .bindPopup('<b>Driver Live Position</b>')
      .addTo(map);

    driverMarkerRef.current = driverMarker;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polyline on Map
  useEffect(() => {
    if (!mapInstanceRef.current || routePoints.length === 0) return;
    const map = mapInstanceRef.current;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    const polyline = L.polyline(routePoints, {
      color: '#10b981',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    routePolylineRef.current = polyline;

    // Fit map bounds to show full route
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  }, [routePoints]);

  // Update driver marker position and check route deviation
  useEffect(() => {
    if (currentLocation) {
      setDriverPos(currentLocation);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng]);
    }

    if (routePoints.length > 1) {
      const dist = computePointToRouteDistance(driverPos, routePoints);
      setDeviationMeters(dist);
      const deviated = dist > 150; // Alert if > 150 meters off corridor
      setIsDeviated(deviated);

      if (onDeviationChange) {
        onDeviationChange({ distanceMeters: dist, isDeviated: deviated });
      }
    }
  }, [driverPos, routePoints, computePointToRouteDistance, onDeviationChange]);

  // Real Browser watchPosition Geolocation for Driver
  const toggleLiveGps = () => {
    if (isLiveGpsActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLiveGpsActive(false);
      setGpsAccuracy(null);
    } else {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos: LatLngPoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setDriverPos(newPos);
          setGpsAccuracy(Math.round(pos.coords.accuracy));

          // Broadcast via Socket.IO
          const socket = getSocket();
          socket.emit('trip:location', {
            tripId,
            latitude: newPos.lat,
            longitude: newPos.lng,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed || 0,
            heading: pos.coords.heading || 0,
          });
        },
        (err) => {
          console.warn('[LiveTripMap] Geolocation error:', err);
          setIsLiveGpsActive(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      );

      watchIdRef.current = id;
      setIsLiveGpsActive(true);
    }
  };

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const centerOnVehicle = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([driverPos.lat, driverPos.lng], 16, {
        animate: true,
      });
    }
  };

  const fitFullRoute = () => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), {
        padding: [30, 30],
        animate: true,
      });
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Live Status Pill */}
        <div className="pointer-events-auto bg-[#143D32]/95 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl shadow-lg border border-emerald-600/40 flex items-center gap-2 text-xs">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-bold">Live Route Transit</span>
          {gpsAccuracy && (
            <span className="text-[10px] text-emerald-200 font-mono">
              (±{gpsAccuracy}m)
            </span>
          )}
        </div>

        {/* Deviation alert badge */}
        {isDeviated ? (
          <div className="pointer-events-auto bg-rose-600/95 text-white px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Off Route ({deviationMeters}m deviation)</span>
          </div>
        ) : (
          <div className="pointer-events-auto bg-emerald-600/90 text-white px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Safe Corridor Verified</span>
          </div>
        )}

        {/* Quick controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-md">
          <button
            type="button"
            onClick={centerOnVehicle}
            className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors"
            title="Center on Driver"
          >
            <LocateFixed className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            type="button"
            onClick={fitFullRoute}
            className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors"
            title="Fit Entire Route"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-[360px] sm:h-[420px]" />

      {/* Bottom Driver Controls Bar */}
      {isDriver && (
        <div className="p-3.5 bg-[#143D32] border-t border-emerald-800 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Driver Telemetry Hub:</span>
            <span className="text-emerald-200/80 hidden sm:inline">
              {isLiveGpsActive ? 'Broadcasting live coordinates' : 'GPS sharing idle'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLiveGps}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 ${
                isLiveGpsActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              {isLiveGpsActive ? 'Stop Live GPS Sharing' : 'Start Live GPS Broadcast'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
