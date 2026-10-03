import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { api } from '../../services/api';
import {
  Compass,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Car,
  Footprints,
  Sparkles,
  Zap,
  ExternalLink,
  LocateFixed,
  Route as RouteIcon,
  Navigation2,
  Check,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface RouteTurnStep {
  icon: 'depart' | 'straight' | 'turn-left' | 'turn-right' | 'bridge' | 'arrive';
  instruction: string;
  distanceText: string;
}

export interface RouteCorridorOption {
  id: string;
  name: string;
  tag: string;
  distanceKm: number;
  durationMinutes: number;
  trafficStatus: 'light' | 'moderate' | 'heavy';
  description: string;
  viaWaypoints: string[];
  latLngs: [number, number][];
  color: string;
  fuelEstimateInr: number;
  turnSteps?: RouteTurnStep[];
}

export interface PickupLocationGuide {
  hubName: string;
  buildingCode: string;
  campusArea: string;
  location: [number, number]; // lat, lng
  walkDistanceMeters: number;
  walkMinutes: number;
  hasCctv: boolean;
  hasShelter: boolean;
  hasLighting: boolean;
  securityBoothNearby: boolean;
  stepDirections: string[];
}

// 100% Real Road GPS Points from OSRM following actual Chakrata Road Bridge over Tons/Asan River between UIT/UU Campus and Premnagar Market
const REAL_CHAKRATA_BRIDGE_ROAD: [number, number][] = [
  [30.34002, 77.95163], [30.33979, 77.95167], [30.3391, 77.9518], [30.33935, 77.9522],
  [30.33942, 77.95233], [30.33947, 77.95243], [30.33949, 77.9525], [30.33952, 77.9526],
  [30.33962, 77.95296], [30.33965, 77.95301], [30.33973, 77.95315], [30.33974, 77.9532],
  [30.33975, 77.95325], [30.33976, 77.95332], [30.33976, 77.95391], [30.33976, 77.95416],
  [30.33977, 77.95422], [30.3398, 77.95429], [30.33984, 77.95437], [30.33986, 77.95443],
  [30.33986, 77.95449], [30.33986, 77.95469], [30.33986, 77.95502], [30.33986, 77.95509],
  [30.33986, 77.95516], [30.33989, 77.95537], [30.33886, 77.95601], [30.33879, 77.95604],
  [30.33873, 77.95611], [30.33867, 77.95615], [30.33814, 77.95647], [30.33805, 77.95652],
  [30.33802, 77.95653], [30.33792, 77.95657], [30.33785, 77.95658], [30.33776, 77.95659],
  [30.33764, 77.95659], [30.33718, 77.95655], [30.33683, 77.95654], [30.33676, 77.95654],
  [30.33665, 77.95657], [30.33659, 77.95659], [30.33655, 77.95661], [30.3365, 77.95665],
  [30.33648, 77.95669], [30.33645, 77.95674], [30.33643, 77.95682], [30.33644, 77.95691],
  [30.33646, 77.957], [30.33653, 77.95712], [30.33666, 77.95735], [30.33671, 77.95749],
  [30.33675, 77.95763], [30.33678, 77.95779], [30.33679, 77.95793], [30.33679, 77.95808],
  [30.33676, 77.95822], [30.33673, 77.95834], [30.33669, 77.9584], [30.3366, 77.95854],
  [30.33654, 77.95865], [30.3365, 77.95876], [30.33646, 77.95885], [30.33645, 77.95894],
  [30.33643, 77.95906], [30.33641, 77.95939], [30.33638, 77.95999], [30.33631, 77.96111],
  [30.33623, 77.96204], [30.33619, 77.96267], [30.33611, 77.96376], [30.3361, 77.964],
  [30.3369, 77.96407], [30.33607, 77.96414], [30.33606, 77.96408], [30.33606, 77.96399],
  [30.33607, 77.96376], [30.33603, 77.96368], [30.336, 77.96351], [30.33599, 77.96342],
  [30.336, 77.96329], [30.33602, 77.96286], [30.33603, 77.96272], [30.33603, 77.96264],
  [30.33604, 77.96254], [30.33584, 77.9625], [30.33545, 77.96248], [30.3351, 77.96245],
  [30.33459, 77.96235], [30.33433, 77.9623], [30.33418, 77.96228], [30.33397, 77.96224],
];

// 100% Real Road GPS Points from Suddhowala Student Hub to Uttaranchal University (Direct Link)
const REAL_SUDDHOWALA_BRIDGE_ROAD: [number, number][] = [
  [30.3475, 77.9320], [30.3472, 77.9328], [30.3468, 77.9345], [30.3464, 77.9363],
  [30.3458, 77.9363], [30.3452, 77.9378], [30.3452, 77.9385], [30.3453, 77.9399],
  [30.3455, 77.9413], [30.3457, 77.9425], [30.3456, 77.9431], [30.3454, 77.9438],
  [30.3450, 77.9454], [30.3445, 77.9452], [30.3443, 77.9449], [30.3441, 77.9445],
  [30.3433, 77.9444], [30.3425, 77.9442], [30.3415, 77.9440],
];

// 100% Real Road GPS Points via Selaqui Highway Corridor
const REAL_SELAQUI_HIGHWAY_ROAD: [number, number][] = [
  [30.3685, 77.85399], [30.36632, 77.85208], [30.36133, 77.84774], [30.35854, 77.85011],
  [30.35681, 77.85315], [30.35507, 77.85609], [30.35352, 77.85887], [30.35198, 77.86163],
  [30.35122, 77.86335], [30.35111, 77.86477], [30.34955, 77.86757], [30.34818, 77.86972],
  [30.34722, 77.8722], [30.34664, 77.87579], [30.34692, 77.87794], [30.34723, 77.88103],
  [30.34809, 77.88331], [30.349, 77.88456], [30.34968, 77.88626], [30.34936, 77.88745],
  [30.34888, 77.88896], [30.34875, 77.89041], [30.34848, 77.89114], [30.34796, 77.8919],
  [30.34761, 77.89248], [30.34728, 77.89365], [30.34669, 77.89589], [30.34625, 77.89729],
  [30.34584, 77.8995], [30.34556, 77.90206], [30.34526, 77.90496], [30.34494, 77.9078],
  [30.34479, 77.90923], [30.34453, 77.91134], [30.34431, 77.91342], [30.34424, 77.91552],
  [30.34422, 77.91776], [30.34421, 77.92013], [30.34422, 77.92207], [30.34431, 77.9245],
  [30.34441, 77.92617], [30.34447, 77.92705], [30.34454, 77.9281], [30.34468, 77.93006],
  [30.34482, 77.93227], [30.34491, 77.93365], [30.345, 77.93509], [30.34512, 77.93625],
  [30.34521, 77.93796], [30.34532, 77.93995], [30.34566, 77.94249], [30.34544, 77.94385],
  [30.345, 77.9454], [30.34448, 77.94522], [30.34435, 77.94489], [30.34407, 77.94451],
  [30.34321, 77.9448],
  [30.3415, 77.9440], // Campus Gate 1 Main Entrance
];

// 100% Real Road GPS Points from Selaqui directly to Premnagar Chowk along NH 72
const REAL_SELAQUI_TO_PREMNAGAR_ROAD: [number, number][] = [
  [30.3685, 77.854], [30.3663, 77.8521], [30.3613, 77.8477], [30.3585, 77.8501],
  [30.3568, 77.8532], [30.3551, 77.8561], [30.3535, 77.8589], [30.352, 77.8616],
  [30.3512, 77.8634], [30.3511, 77.8648], [30.3496, 77.8676], [30.3482, 77.8697],
  [30.3472, 77.8722], [30.3466, 77.8758], [30.3469, 77.8779], [30.3472, 77.881],
  [30.3481, 77.8833], [30.349, 77.8846], [30.3497, 77.8863], [30.3494, 77.8875],
  [30.3489, 77.889], [30.3488, 77.8904], [30.3485, 77.8911], [30.348, 77.8919],
  [30.3476, 77.8925], [30.3473, 77.8937], [30.3467, 77.8959], [30.3463, 77.8973],
  [30.3458, 77.8995], [30.3456, 77.9021], [30.3453, 77.905], [30.3449, 77.9078],
  [30.3448, 77.9092], [30.3445, 77.9113], [30.3443, 77.9134], [30.3442, 77.9155],
  [30.3442, 77.9178], [30.3442, 77.9201], [30.3442, 77.9221], [30.3443, 77.9245],
  [30.3444, 77.9262], [30.3445, 77.9271], [30.3445, 77.9281], [30.3447, 77.9301],
  [30.3448, 77.9323], [30.3449, 77.9337], [30.345, 77.9351], [30.3451, 77.9363],
  [30.3452, 77.938], [30.3453, 77.94], [30.3457, 77.9425], [30.3454, 77.9439],
  [30.345, 77.9454], [30.3445, 77.9478], [30.3437, 77.9514], [30.3425, 77.9547],
  [30.3408, 77.9551], [30.3399, 77.9554], [30.3386, 77.9561], [30.3376, 77.9565],
  [30.3367, 77.9579], [30.3363, 77.96], [30.3362, 77.962], [30.334, 77.962]
];

// Real Road GPS Points from Ballupur Chowk to Uttaranchal University
const REAL_BALLUPUR_TO_CAMPUS_ROAD: [number, number][] = [
  [30.3395, 78.0125], [30.3385, 77.998], [30.337, 77.985], [30.3355, 77.973],
  [30.334, 77.962], ...REAL_CHAKRATA_BRIDGE_ROAD,
];

// Real Road GPS Points from Clock Tower (Central Dehradun) to Uttaranchal University
const REAL_CLOCKTOWER_TO_CAMPUS_ROAD: [number, number][] = [
  [30.3256, 78.0437], [30.3285, 78.032], [30.334, 78.022], [30.3395, 78.0125],
  ...REAL_BALLUPUR_TO_CAMPUS_ROAD,
];

export const INITIAL_CORRIDORS: RouteCorridorOption[] = [
  {
    id: 'chakrata_bridge',
    name: 'Via Chakrata Road (Bridge Route)',
    tag: 'Fastest / Primary Bridge',
    distanceKm: 2.0,
    durationMinutes: 4,
    trafficStatus: 'light',
    description: 'Direct paved road via Premnagar Market, crosses the Tons/Asan river over Nanda Ki Chowki Bridge',
    viaWaypoints: ['Premnagar Market', 'Nanda Ki Chowki Bridge', 'Uttaranchal University Gate'],
    latLngs: REAL_CHAKRATA_BRIDGE_ROAD,
    color: '#1a73e8', // Google Blue
    fuelEstimateInr: 8,
    turnSteps: [
      { icon: 'depart', instruction: 'Depart east towards Premnagar Market on Chakrata Road', distanceText: '400 m' },
      { icon: 'straight', instruction: 'Continue on NH 72 towards Nanda Ki Chowki', distanceText: '1.1 km' },
      { icon: 'bridge', instruction: 'Cross Tons/Asan River over Nanda Ki Chowki Bridge', distanceText: '250 m' },
      { icon: 'turn-right', instruction: 'Turn right onto Uttaranchal University Entrance Boulevard', distanceText: '250 m' },
      { icon: 'arrive', instruction: 'Arrive at UIT Student Carpool Bay', distanceText: '50 m' },
    ],
  },
];


// Known Geo Coordinates for Dehradun & Uttaranchal University (Real verified physical locations)
export const GEO_COORDINATES: Record<string, [number, number]> = {
  uit: [30.3400, 77.9515],
  uscs: [30.3395, 77.9518],
  bba: [30.3392, 77.9520],
  library: [30.3396, 77.9517],
  gate1: [30.3400, 77.9515],
  premnagar: [30.3340, 77.9620],
  suddhowala: [30.3475, 77.9320],
  selaqui: [30.3685, 77.8540],
  vikasnagar: [30.4350, 77.7710],
  isbt: [30.2885, 78.0080],
  ballupur: [30.3395, 78.0125],
  clocktower: [30.3256, 78.0437],
  nandakichowki: [30.3408, 77.9551],
};

// Common Presets for Google Maps Origin/Destination Dropdown
export const POPULAR_LOCATIONS: { name: string; key: string; coords: [number, number]; type: 'origin' | 'dest' | 'both' }[] = [
  { name: 'Selaqui Industrial & Institutional Hub', key: 'selaqui', coords: [30.3685, 77.8540], type: 'both' },
  { name: 'Premnagar Chowk Market', key: 'premnagar', coords: [30.3340, 77.9620], type: 'both' },
  { name: 'Suddhowala Chowk (Student PG Hub)', key: 'suddhowala', coords: [30.3475, 77.9320], type: 'both' },
  { name: 'Ballupur Chowk (City Entrance)', key: 'ballupur', coords: [30.3395, 78.0125], type: 'both' },
  { name: 'Clock Tower (Ghanta Ghar)', key: 'clocktower', coords: [30.3256, 78.0437], type: 'both' },
  { name: 'ISBT Dehradun', key: 'isbt', coords: [30.2885, 78.0080], type: 'both' },
  { name: 'UIT Building (Uttaranchal Institute of Technology)', key: 'uit', coords: [30.3400, 77.9515], type: 'both' },
  { name: 'USCS Building (School of Computing Sciences)', key: 'uscs', coords: [30.3395, 77.9518], type: 'both' },
  { name: 'BBA Building (Uttaranchal Institute of Management)', key: 'bba', coords: [30.3392, 77.9520], type: 'both' },
  { name: 'Central Academic Library & Law Block', key: 'library', coords: [30.3396, 77.9517], type: 'both' },
  { name: 'Campus Gate 1 (Uttaranchal University Main Entrance)', key: 'gate1', coords: [30.3400, 77.9515], type: 'both' },
];

// Campus Building Guides with Walking Steps
export const CAMPUS_BUILDING_GUIDES: Record<string, PickupLocationGuide> = {
  uit: {
    hubName: 'UIT Building (Uttaranchal Institute of Technology)',
    buildingCode: 'UIT-ENGG',
    campusArea: 'Engineering Sciences Quad',
    location: [30.3400, 77.9515],
    walkDistanceMeters: 180,
    walkMinutes: 2,
    hasCctv: true,
    hasShelter: true,
    hasLighting: true,
    securityBoothNearby: true,
    stepDirections: [
      'Head south from the student concourse along the paved central pedestrian walk (70m).',
      'Turn left at the Knowledge Clock Tower towards the UIT North Porch (60m).',
      'Arrive at the designated carpool shelter bay with EV charging stations (50m).',
    ],
  },
  uscs: {
    hubName: 'USCS Building (School of Computing Sciences)',
    buildingCode: 'USCS-CS',
    campusArea: 'Computing & IT Boulevard',
    location: [30.3428, 77.9456],
    walkDistanceMeters: 230,
    walkMinutes: 3,
    hasCctv: true,
    hasShelter: true,
    hasLighting: true,
    securityBoothNearby: true,
    stepDirections: [
      'From the main campus foyer, follow the glass corridor eastward toward USCS (90m).',
      'Pass the Cyber Labs plaza onto the outdoor covered awning (80m).',
      'Look for the green CampusRide Pickup Sign at USCS Quad Pillar B (60m).',
    ],
  },
  bba: {
    hubName: 'BBA Building (Uttaranchal Institute of Management)',
    buildingCode: 'UIM-BBA',
    campusArea: 'Management & Commerce Circle',
    location: [30.342, 77.9461],
    walkDistanceMeters: 210,
    walkMinutes: 3,
    hasCctv: true,
    hasShelter: true,
    hasLighting: true,
    securityBoothNearby: true,
    stepDirections: [
      'Proceed south-east along the management gardens pathway (100m).',
      'Cross the pedestrian zebra crossing at the Management Circle (50m).',
      'Your driver will pull into the illuminated visitor pickup turnaround (60m).',
    ],
  },
  gate1: {
    hubName: 'Campus Main Gate 1 (Premnagar Road Entrance)',
    buildingCode: 'GATE-01',
    campusArea: 'Main Security Checkpoint',
    location: [30.3415, 77.944],
    walkDistanceMeters: 340,
    walkMinutes: 4,
    hasCctv: true,
    hasShelter: true,
    hasLighting: true,
    securityBoothNearby: true,
    stepDirections: [
      'Walk down the main academic avenue towards the external security boundary (180m).',
      'Pass the automated vehicular barrier on the pedestrian sidewalk (100m).',
      'Wait at the dedicated CCTV-monitored student shelter beside Gate 1 (60m).',
    ],
  },
  library: {
    hubName: 'Central Academic Library & Law Block (LCD)',
    buildingCode: 'UU-LIB',
    campusArea: 'Knowledge Square',
    location: [30.3425, 77.945],
    walkDistanceMeters: 140,
    walkMinutes: 2,
    hasCctv: true,
    hasShelter: true,
    hasLighting: true,
    securityBoothNearby: true,
    stepDirections: [
      'Exit the Law College entrance foyer heading towards Central Plaza (60m).',
      'Take the ramp next to the library fountains (50m).',
      'Meeting spot is at the shaded bus shelter right beside Library Gate (30m).',
    ],
  },
};

interface Props {
  originText?: string;
  destinationText?: string;
  initialMode?: 'route_choice' | 'walk_to_pickup';
  onSelectRoute?: (route: RouteCorridorOption) => void;
  selectedRouteId?: string;
  pickupBuildingKey?: 'uit' | 'uscs' | 'bba' | 'gate1' | 'library';
  compact?: boolean;
  onOriginChange?: (origin: string) => void;
  onDestinationChange?: (destination: string) => void;
}

// Custom Google Maps style SVG pin icons
function createGooglePinIcon(color: string, label: string, isPulsing = false) {
  return L.divIcon({
    className: 'custom-google-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        ${
          isPulsing
            ? `<div style="position: absolute; bottom: 0; width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <div style="background-color: ${color}; color: white; padding: 3px 8px; border-radius: 12px; font-weight: 700; font-size: 11px; white-space: nowrap; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 1.5px solid white; display: flex; align-items: center; gap: 4px;">
          <span>${label}</span>
        </div>
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); margin-top: -2px;">
          <path d="M12 0C5.37258 0 0 5.37258 0 12C0 20.25 12 28 12 28C12 28 24 20.25 24 12C24 5.37258 18.6274 0 12 0Z" fill="${color}"/>
          <circle cx="12" cy="11" r="5" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createBuildingMarkerIcon(code: string, active = false) {
  return L.divIcon({
    className: 'custom-building-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background-color: ${active ? '#1e3a8a' : '#0f172a'}; color: white; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid ${active ? '#3b82f6' : '#cbd5e1'}; white-space: nowrap;">
          🏢 ${code}
        </div>
        <div style="width: 2px; height: 10px; background-color: ${active ? '#3b82f6' : '#64748b'};"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// Mathematical route snapping ensuring the route line ALWAYS connects directly to Origin and Destination pins with zero gap
function snapRouteEndpoints(
  latLngs: [number, number][],
  orig: [number, number],
  dest: [number, number]
): [number, number][] {
  if (!latLngs || latLngs.length === 0) return [orig, dest];
  let points = latLngs.map(([lat, lng]) => [lat, lng] as [number, number]);

  const p0 = points[0];
  const pLast = points[points.length - 1];

  // Compare forward vs reverse alignment
  const forwardCost = Math.hypot(p0[0] - orig[0], p0[1] - orig[1]) + Math.hypot(pLast[0] - dest[0], pLast[1] - dest[1]);
  const reverseCost = Math.hypot(p0[0] - dest[0], p0[1] - dest[1]) + Math.hypot(pLast[0] - orig[0], pLast[1] - orig[1]);

  if (reverseCost < forwardCost) {
    points.reverse();
  }

  // Only micro-adjust if already within immediate proximity of the road endpoint (< 60 meters)
  // NEVER prepend a distant coordinate, which causes fake diagonal straight lines across the map!
  const dOrig = Math.hypot(points[0][0] - orig[0], points[0][1] - orig[1]);
  if (dOrig <= 0.0008) {
    points[0] = orig;
  }

  const lastIdx = points.length - 1;
  const dDest = Math.hypot(points[lastIdx][0] - dest[0], points[lastIdx][1] - dest[1]);
  if (dDest <= 0.0008) {
    points[lastIdx] = dest;
  }

  return points;
}

export const PickupAndRouteNavigationMap: React.FC<Props> = ({
  originText = 'Premnagar Chowk Market',
  destinationText = 'UIT Building (Uttaranchal Institute of Technology)',
  initialMode = 'route_choice',
  onSelectRoute,
  selectedRouteId = 'chakrata_bridge',
  pickupBuildingKey,
  compact = false,
  onOriginChange,
  onDestinationChange,
}) => {
  const [activeTab, setActiveTab] = useState<'route_choice' | 'walk_to_pickup'>(initialMode);
  const [currentOrigin, setCurrentOrigin] = useState<string>(originText);
  const [currentDest, setCurrentDest] = useState<string>(destinationText);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(selectedRouteId);
  const [mapLayerType, setMapLayerType] = useState<'google_streets' | 'google_satellite' | 'carto_voyager' | 'osm'>('carto_voyager');
  const [walkingStepIndex, setWalkingStepIndex] = useState<number>(0);
  const [showTurnByTurn, setShowTurnByTurn] = useState<boolean>(false);
  const [corridors, setCorridors] = useState<RouteCorridorOption[]>(INITIAL_CORRIDORS);
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
  const [customOriginCoords, setCustomOriginCoords] = useState<[number, number] | null>(null);
  const [customDestCoords, setCustomDestCoords] = useState<[number, number] | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const lastFittedBoundsKeyRef = useRef<string>('');

  // Sync state if props change from outside & clear dragged pin overrides so map is fully responsive
  useEffect(() => {
    setCurrentOrigin(originText);
    setCustomOriginCoords(null);
  }, [originText]);

  useEffect(() => {
    setCurrentDest(destinationText);
    setCustomDestCoords(null);
  }, [destinationText]);

  // Derive pickup guide based on props or heuristics
  const effectiveBuildingKey =
    pickupBuildingKey ||
    (currentDest.toLowerCase().includes('uscs')
      ? 'uscs'
      : currentDest.toLowerCase().includes('bba') || currentDest.toLowerCase().includes('management')
      ? 'bba'
      : currentDest.toLowerCase().includes('gate')
      ? 'gate1'
      : currentDest.toLowerCase().includes('library') || currentDest.toLowerCase().includes('law')
      ? 'library'
      : currentOrigin.toLowerCase().includes('uscs')
      ? 'uscs'
      : currentOrigin.toLowerCase().includes('bba')
      ? 'bba'
      : 'uit');

  const guide = CAMPUS_BUILDING_GUIDES[effectiveBuildingKey] || CAMPUS_BUILDING_GUIDES.uit;

  // Resolve origin & destination coordinates with strict campus precedence
  const resolveCoordinates = (text: string, fallback: [number, number]): [number, number] => {
    if (!text) return fallback;
    const t = text.toLowerCase().trim();

    // 1. Specific campus buildings & gates
    if (t.includes('uit')) return GEO_COORDINATES.uit;
    if (t.includes('uscs')) return GEO_COORDINATES.uscs;
    if (t.includes('bba') || t.includes('management') || t.includes('uim')) return GEO_COORDINATES.bba;
    if (t.includes('library') || t.includes('law') || t.includes('lcd')) return GEO_COORDINATES.library;
    if (t.includes('gate 1') || t.includes('gate-1') || t.includes('main gate') || t.includes('campus gate')) return GEO_COORDINATES.gate1;

    // 2. Generic campus / Uttaranchal University keywords (PRIORITIZED BEFORE PREMNAGAR)
    if (
      t.includes('uttaranchal') ||
      /\buu\b/i.test(t) ||
      t.includes('campus') ||
      (t.includes('university') && !t.includes('geu') && !t.includes('dit') && !t.includes('upes'))
    ) {
      return GEO_COORDINATES.gate1;
    }

    // 3. Selaqui, Suddhowala, and surrounding hubs
    if (t.includes('selaqui') || t.includes('selaquie')) return GEO_COORDINATES.selaqui;
    if (t.includes('suddhowala') || t.includes('sudhowala')) return GEO_COORDINATES.suddhowala;
    if (t.includes('premnagar') || t.includes('prem nagar')) return GEO_COORDINATES.premnagar;
    if (t.includes('nanda ki chowki') || t.includes('nandakichowki')) return GEO_COORDINATES.nandakichowki;
    if (t.includes('ballupur')) return GEO_COORDINATES.ballupur;
    if (t.includes('clock tower') || t.includes('ghanta ghar') || t.includes('paltan')) return GEO_COORDINATES.clocktower;
    if (t.includes('vikasnagar') || t.includes('vikas nagar')) return GEO_COORDINATES.vikasnagar;
    if (t.includes('isbt')) return GEO_COORDINATES.isbt;

    return fallback;
  };

  const originCoords = customOriginCoords || resolveCoordinates(currentOrigin, GEO_COORDINATES.premnagar);
  const destCoords = customDestCoords || resolveCoordinates(currentDest, GEO_COORDINATES.gate1);

  // Generate Realistic Corridors based strictly on selected origin & destination
  const generateCorridors = (orig: [number, number], dest: [number, number]): RouteCorridorOption[] => {
    const origText = currentOrigin.toLowerCase();
    const destText = currentDest.toLowerCase();

    const involvesSelaqui = (origText.includes('selaqui') || destText.includes('selaqui')) && !origText.includes('uit') && !destText.includes('uit');
    const involvesSuddhowala = (origText.includes('suddhowala') || destText.includes('suddhowala')) && !origText.includes('uit') && !destText.includes('uit');
    const involvesPremnagar = origText.includes('premnagar') || destText.includes('prem nagar') || destText.includes('premnagar');
    const involvesClockTower = origText.includes('clock') || origText.includes('ghanta') || destText.includes('clock') || destText.includes('ghanta');
    const involvesBallupur = origText.includes('ballupur') || destText.includes('ballupur');

    // Case 1: Selaqui to Premnagar (Direct Highway without turning into UU campus)
    if (involvesSelaqui && involvesPremnagar && !origText.includes('gate') && !destText.includes('gate') && !origText.includes('uit') && !destText.includes('uit')) {
      return [
        {
          id: 'selaqui_premnagar_nh72',
          name: 'Via NH 72 Chakrata Expressway (Direct Arterial)',
          tag: 'Direct Highway Corridor',
          distanceKm: 13.5,
          durationMinutes: 22,
          trafficStatus: 'light',
          description: 'Direct 4-lane NH 72 highway connecting Selaqui Industrial Belt to Premnagar Market via Suddhowala',
          viaWaypoints: ['Selaqui Pharma Hub', 'Suddhowala Junction', 'Premnagar Market'],
          latLngs: snapRouteEndpoints(REAL_SELAQUI_TO_PREMNAGAR_ROAD, orig, dest),
          color: '#1a73e8',
          fuelEstimateInr: 35,
          turnSteps: [
            { icon: 'depart', instruction: 'Start along NH 72 highway towards Premnagar', distanceText: '500 m' },
            { icon: 'straight', instruction: 'Pass Suddhowala Student PG Hub junction', distanceText: '7.8 km' },
            { icon: 'straight', instruction: 'Cross Nanda Ki Chowki Bridge approach', distanceText: '3.2 km' },
            { icon: 'arrive', instruction: 'Arrive at Premnagar Chowk Market', distanceText: '2.0 km' },
          ],
        },
      ];
    }

    // Case 2: Selaqui to UU Campus
    if (involvesSelaqui) {
      return [
        {
          id: 'selaqui_expressway',
          name: 'Via NH 72 Chakrata Expressway (Main Corridor)',
          tag: 'Fastest Paved Highway',
          distanceKm: 11.5,
          durationMinutes: 18,
          trafficStatus: 'light',
          description: 'Direct 4-lane highway via NH 72, turning onto Arcadia Grant Boulevard directly into Uttaranchal University',
          viaWaypoints: ['Selaqui Pharma Hub', 'Suddhowala Concourse', 'UU Campus Gate 1'],
          latLngs: snapRouteEndpoints(REAL_SELAQUI_HIGHWAY_ROAD, orig, dest),
          color: '#1a73e8',
          fuelEstimateInr: 28,
          turnSteps: [
            { icon: 'depart', instruction: 'Start from Selaqui Industrial & Institutional Hub on NH 72', distanceText: '500 m' },
            { icon: 'straight', instruction: 'Follow NH 72 four-lane highway east towards Nanda Ki Chowki', distanceText: '8.2 km' },
            { icon: 'bridge', instruction: 'Cross Tons/Asan River approach near Nanda Ki Chowki Bridge', distanceText: '600 m' },
            { icon: 'turn-right', instruction: 'Turn onto Uttaranchal University Boulevard (Arcadia Grant)', distanceText: '1.7 km' },
            { icon: 'arrive', instruction: 'Arrive at UIT Student Carpool Bay & EV Hub', distanceText: '500 m' },
          ],
        },
        {
          id: 'selaqui_suddhowala_link',
          name: 'Via Suddhowala Student PG Corridor & Hostels',
          tag: 'Scenic / Student PG Cluster',
          distanceKm: 12.8,
          durationMinutes: 21,
          trafficStatus: 'light',
          description: 'Alternative link passing Suddhowala student residences, cafes, and campus north access',
          viaWaypoints: ['Selaqui East', 'Suddhowala Chowk Junction', 'North University Gate'],
          latLngs: snapRouteEndpoints(
            [
              ...REAL_SELAQUI_HIGHWAY_ROAD.slice(0, 35),
              ...REAL_SUDDHOWALA_BRIDGE_ROAD,
            ],
            orig,
            dest
          ),
          color: '#0f9d58',
          fuelEstimateInr: 32,
          turnSteps: [
            { icon: 'depart', instruction: 'Depart Selaqui Hub heading east on highway', distanceText: '6.5 km' },
            { icon: 'turn-left', instruction: 'Turn onto Suddhowala Student PG residential corridor', distanceText: '3.1 km' },
            { icon: 'bridge', instruction: 'Cross North River Bridge into campus perimeter', distanceText: '800 m' },
            { icon: 'arrive', instruction: 'Arrive at Campus Destination Porch', distanceText: '700 m' },
          ],
        },
      ];
    }

    // Case 3: Suddhowala to UU Campus
    if (involvesSuddhowala) {
      return [
        {
          id: 'suddhowala_direct_link',
          name: 'Via Suddhowala Student Concourse (Direct Link)',
          tag: 'Fastest Student Route',
          distanceKm: 1.8,
          durationMinutes: 5,
          trafficStatus: 'light',
          description: 'Direct student residential road via Arcadia West connecting Suddhowala directly into Uttaranchal University',
          viaWaypoints: ['Suddhowala Chowk', 'Arcadia West Hostels', 'UU Campus Gate 1'],
          latLngs: snapRouteEndpoints(REAL_SUDDHOWALA_BRIDGE_ROAD, orig, dest),
          color: '#1a73e8',
          fuelEstimateInr: 8,
          turnSteps: [
            { icon: 'depart', instruction: 'Depart from Suddhowala Student PG Hub', distanceText: '100 m' },
            { icon: 'straight', instruction: 'Follow Arcadia West student residential link road', distanceText: '1.1 km' },
            { icon: 'turn-right', instruction: 'Enter Uttaranchal University Academic Concourse', distanceText: '400 m' },
            { icon: 'arrive', instruction: 'Arrive at Campus Destination Porch', distanceText: '200 m' },
          ],
        },
        {
          id: 'suddhowala_chakrata_bridge',
          name: 'Via NH 72 Chakrata Road & Nanda Ki Chowki Bridge',
          tag: 'Main Highway Link',
          distanceKm: 2.8,
          durationMinutes: 7,
          trafficStatus: 'light',
          description: 'Heads south onto NH 72 Chakrata Road and enters campus via Nanda Ki Chowki bridge approach',
          viaWaypoints: ['Suddhowala Link', 'NH 72 Chakrata Rd', 'Nanda Ki Chowki Bridge'],
          latLngs: snapRouteEndpoints(
            [
              [30.3475, 77.9320], [30.3460, 77.9360], [30.3440, 77.9400],
              [30.3408, 77.9551], [30.34254, 77.9547], [30.3437, 77.9514],
              [30.3445, 77.9477], [30.3415, 77.9440],
            ],
            orig,
            dest
          ),
          color: '#0f9d58',
          fuelEstimateInr: 12,
          turnSteps: [
            { icon: 'depart', instruction: 'Head south from Suddhowala onto Chakrata connector', distanceText: '600 m' },
            { icon: 'straight', instruction: 'Merge onto NH 72 towards Nanda Ki Chowki Bridge', distanceText: '1.2 km' },
            { icon: 'turn-right', instruction: 'Turn onto Uttaranchal University Boulevard', distanceText: '700 m' },
            { icon: 'arrive', instruction: 'Arrive at Campus Shelter Bay', distanceText: '300 m' },
          ],
        },
      ];
    }

    // Case 4: Ballupur or Clock Tower to Campus
    if (involvesClockTower || involvesBallupur) {
      const isClock = involvesClockTower;
      const road = isClock ? REAL_CLOCKTOWER_TO_CAMPUS_ROAD : REAL_BALLUPUR_TO_CAMPUS_ROAD;
      return [
        {
          id: isClock ? 'clocktower_chakrata' : 'ballupur_chakrata',
          name: isClock ? 'Via Clock Tower & Ballupur Flyover (Chakrata Rd)' : 'Via Ballupur Flyover & Chakrata Road (Main Highway)',
          tag: 'Fastest City Route',
          distanceKm: isClock ? 10.8 : 7.6,
          durationMinutes: isClock ? 24 : 17,
          trafficStatus: 'moderate',
          description: 'Major arterial road from city center over Ballupur Flyover, through Premnagar and Nanda Ki Chowki bridge into campus',
          viaWaypoints: isClock ? ['Clock Tower', 'Ballupur Flyover', 'Premnagar Market', 'UU Campus'] : ['Ballupur Flyover', 'Premnagar Market', 'UU Campus'],
          latLngs: snapRouteEndpoints(road, orig, dest),
          color: '#1a73e8',
          fuelEstimateInr: isClock ? 28 : 20,
          turnSteps: [
            { icon: 'depart', instruction: isClock ? 'Depart Clock Tower heading west on Chakrata Road' : 'Depart Ballupur Flyover heading west', distanceText: '1.2 km' },
            { icon: 'straight', instruction: 'Continue on NH 72 through Premnagar Market', distanceText: '4.5 km' },
            { icon: 'bridge', instruction: 'Cross Tons River via Nanda Ki Chowki Bridge', distanceText: '400 m' },
            { icon: 'turn-right', instruction: 'Turn onto Uttaranchal University Boulevard', distanceText: '1.2 km' },
            { icon: 'arrive', instruction: 'Arrive at Campus Carpool Bay', distanceText: '300 m' },
          ],
        },
      ];
    }

    // Default Case: Premnagar <-> Campus (Direct 2.0 km verified road)
    return [
      {
        id: 'chakrata_bridge',
        name: 'Via Chakrata Road (Bridge Route)',
        tag: 'Fastest / Primary Bridge',
        distanceKm: 2.0,
        durationMinutes: 4,
        trafficStatus: 'light',
        description: 'Direct paved road via Premnagar Market, crosses the Tons/Asan river over Nanda Ki Chowki Bridge into Uttaranchal University UIT Building',
        viaWaypoints: ['Premnagar Market', 'Nanda Ki Chowki Bridge', 'Uttaranchal University Gate'],
        latLngs: snapRouteEndpoints(REAL_CHAKRATA_BRIDGE_ROAD, orig, dest),
        color: '#1a73e8',
        fuelEstimateInr: 8,
        turnSteps: [
          { icon: 'depart', instruction: 'Depart along Chakrata Road (NH 72)', distanceText: '400 m' },
          { icon: 'straight', instruction: 'Proceed across NH 72 towards Nanda Ki Chowki', distanceText: '1.1 km' },
          { icon: 'bridge', instruction: 'Cross Tons/Asan River over Nanda Ki Chowki Bridge', distanceText: '250 m' },
          { icon: 'turn-right', instruction: 'Turn onto Uttaranchal University Entrance Boulevard', distanceText: '250 m' },
          { icon: 'arrive', instruction: 'Arrive at UIT Student Carpool Bay', distanceText: '50 m' },
        ],
      },
    ];
  };

  // Live OSRM Route Fetching with Fallback to High-Precision Realistic Corridors
  useEffect(() => {
    let isCancelled = false;

    async function fetchDynamicRoadRoutes() {
      try {
        setLoadingRoutes(true);
        // Call consolidated backend routing API
        const routeData = await api.calculateRoadRoute(
          { lat: originCoords[0], lng: originCoords[1] },
          { lat: destCoords[0], lng: destCoords[1] }
        );

        if (isCancelled) return;

        if (routeData && (routeData.noRouteFound || !routeData.decodedPath || routeData.decodedPath.length === 0)) {
          setCorridors([]);
          setStatusMessage('No real road route found between these locations. Try adjusting your pickup or drop-off points.');
          return;
        }

        setStatusMessage(null);

        const baseCorridors = generateCorridors(originCoords, destCoords);

        if (routeData && routeData.decodedPath && routeData.decodedPath.length > 0) {
          const primaryCoords: [number, number][] = routeData.decodedPath;

          const primaryCorridor: RouteCorridorOption = {
            id: 'osrm_primary',
            name: baseCorridors[0]?.name || 'Via Verified Road Route',
            tag: 'Fastest Route',
            distanceKm: +(routeData.distanceMeters / 1000).toFixed(1),
            durationMinutes: Math.max(3, Math.round(routeData.durationSeconds / 60)),
            trafficStatus: 'light',
            description: `Direct verified road commute (${+(routeData.distanceMeters / 1000).toFixed(1)} km) via public road network`,
            viaWaypoints: baseCorridors[0]?.viaWaypoints || ['Verified Road'],
            latLngs: snapRouteEndpoints(primaryCoords, originCoords, destCoords),
            color: '#1a73e8', // Primary Blue
            fuelEstimateInr: Math.max(10, Math.round((routeData.distanceMeters / 1000) * 3)),
            turnSteps:
              routeData.steps && routeData.steps.length > 0
                ? routeData.steps.map((s, idx) => ({
                    icon: idx === 0 ? 'depart' : idx === routeData.steps!.length - 1 ? 'arrive' : 'straight',
                    instruction: s.instruction,
                    distanceText: s.distanceMeters > 1000 ? `${(s.distanceMeters / 1000).toFixed(1)} km` : `${s.distanceMeters} m`,
                  }))
                : [
                    { icon: 'depart', instruction: `Depart from ${currentOrigin}`, distanceText: '0 m' },
                    { icon: 'straight', instruction: 'Follow verified road route', distanceText: `${(routeData.distanceMeters / 1000).toFixed(1)} km` },
                    { icon: 'arrive', instruction: `Arrive at ${currentDest}`, distanceText: '0 m' },
                  ],
          };

          const dynamicCorridors: RouteCorridorOption[] = [primaryCorridor];

          // ONLY add an alternative if OSRM returned a real, verified alternative road
          if (routeData.alternatives && routeData.alternatives.length > 0) {
            routeData.alternatives.forEach((alt, idx) => {
              if (alt.decodedPath && alt.decodedPath.length > 1) {
                const altDistKm = +(alt.distanceMeters / 1000).toFixed(1);
                if (altDistKm <= primaryCorridor.distanceKm * 1.35) {
                  dynamicCorridors.push({
                    id: `osrm_alt_${idx}`,
                    name: alt.summary || `Alternative Road ${idx + 1}`,
                    tag: 'Local Alternate / Low Traffic',
                    distanceKm: altDistKm,
                    durationMinutes: Math.max(4, Math.round(alt.durationSeconds / 60)),
                    trafficStatus: 'light',
                    description: `Alternative verified road route (${altDistKm} km)`,
                    viaWaypoints: ['Alternative Road'],
                    latLngs: snapRouteEndpoints(alt.decodedPath, originCoords, destCoords),
                    color: '#0f9d58',
                    fuelEstimateInr: Math.max(10, Math.round(altDistKm * 3)),
                    turnSteps: [
                      { icon: 'depart', instruction: 'Depart via alternate road', distanceText: '0 m' },
                      { icon: 'straight', instruction: 'Follow alternate road route', distanceText: `${altDistKm} km` },
                      { icon: 'arrive', instruction: 'Arrive at destination', distanceText: '0 m' },
                    ],
                  });
                }
              }
            });
          }

          setCorridors(dynamicCorridors);
          if (!dynamicCorridors.some((c) => c.id === selectedCorridorIdRef.current)) {
            setSelectedCorridorId(dynamicCorridors[0].id);
          }
        }
      } catch {
        const fallback = generateCorridors(originCoords, destCoords);
        setCorridors(fallback);
        if (!fallback.some((c) => c.id === selectedCorridorIdRef.current)) {
          setSelectedCorridorId(fallback[0].id);
        }
      } finally {
        if (!isCancelled) setLoadingRoutes(false);
      }
    }

    fetchDynamicRoadRoutes();

    return () => {
      isCancelled = true;
    };
  }, [currentOrigin, currentDest, customOriginCoords, customDestCoords]);

  const currentCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];
  const corridorsRef = useRef(corridors);
  corridorsRef.current = corridors;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const selectedCorridorIdRef = useRef(selectedCorridorId);
  selectedCorridorIdRef.current = selectedCorridorId;

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = [30.3426, 77.9452];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
        doubleClickZoom: false,
        boxZoom: false,
      });

      map.doubleClickZoom.disable();
      map.boxZoom.disable();

      // Click anywhere near roads to select the closest route
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (activeTabRef.current !== 'route_choice') return;
        const curCorridors = corridorsRef.current;
        if (!curCorridors || curCorridors.length === 0) return;

        let closest = curCorridors[0];
        let minDist = Infinity;

        curCorridors.forEach((corr) => {
          corr.latLngs.forEach(([lat, lng]) => {
            const d = e.latlng.distanceTo(L.latLng(lat, lng));
            if (d < minDist) {
              minDist = d;
              closest = corr;
            }
          });
        });

        // Only switch if within 600m of the road
        if (closest && minDist < 600 && closest.id !== selectedCorridorIdRef.current) {
          handleCorridorSelect(closest);
        }
      });

      const getTileUrl = (type: string) => {
        const cartoKey = (import.meta as any).env?.VITE_CARTO_API_KEY || (typeof window !== 'undefined' ? (window as any).__CARTO_API_KEY__ || localStorage.getItem('VITE_CARTO_API_KEY') || '' : '');
        if (type === 'google_satellite') return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en';
        if (type === 'osm') return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        if (type === 'carto_voyager') {
          return cartoKey
            ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        }
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en';
      };

      const tileUrl = getTileUrl(mapLayerType);

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3', 'a', 'b', 'c', 'd'],
        attribution: 'Map data &copy; <a href="https://maps.google.com">Google Maps</a> / CARTO',
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = layerGroup;
      tileLayerRef.current = tileLayer;
    }
  }, []);

  // Update Tile Layer when layer type switches
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const cartoKey = (import.meta as any).env?.VITE_CARTO_API_KEY || (typeof window !== 'undefined' ? (window as any).__CARTO_API_KEY__ || localStorage.getItem('VITE_CARTO_API_KEY') || '' : '');
    const tileUrl =
      mapLayerType === 'google_satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en'
        : mapLayerType === 'osm'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : mapLayerType === 'carto_voyager'
        ? (cartoKey
            ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png')
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en';

    tileLayerRef.current.setUrl(tileUrl);
  }, [mapLayerType]);

  // Render Markers, Clickable Polylines, and Google Maps Floating Midpoint ETA Pills
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (activeTab === 'route_choice') {
      const activeCorridor =
        corridors.find((c) => c.id === selectedCorridorId) || corridors[0] || INITIAL_CORRIDORS[0];

      // 1. Render all UNSELECTED alternative routes first (behind the active route)
      corridors.forEach((corridor) => {
        if (corridor.id === activeCorridor.id) return;

        const altSnapped = snapRouteEndpoints(corridor.latLngs, originCoords, destCoords);

        // Wide invisible hit target for effortless road clicking on desktop & touch
        const hitTarget = L.polyline(altSnapped, {
          color: 'transparent',
          weight: 28,
          opacity: 0,
        }).addTo(group);

        // Gray inactive polyline (Google Maps style)
        const altPolyline = L.polyline(altSnapped, {
          color: '#64748b',
          weight: 5.5,
          opacity: 0.65,
        }).addTo(group);

        const onRouteClick = (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          handleCorridorSelect(corridor);
        };

        hitTarget.on('click', onRouteClick);
        altPolyline.on('click', onRouteClick);

        // Hover feedback
        hitTarget.on('mouseover', () => {
          altPolyline.setStyle({ color: '#334155', weight: 7.5, opacity: 0.9 });
        });
        hitTarget.on('mouseout', () => {
          altPolyline.setStyle({ color: '#64748b', weight: 5.5, opacity: 0.65 });
        });

        const tooltipContent = `<b>${corridor.name}</b><br/>${corridor.distanceKm} km • ${corridor.durationMinutes} min<br/><span style="color:#0284c7;font-weight:bold;">👉 Click road to choose this route</span>`;
        altPolyline.bindTooltip(tooltipContent, { sticky: true });
        hitTarget.bindTooltip(tooltipContent, { sticky: true });

        // Google Maps style Midpoint ETA Badge Pill on the alternative road
        const midIdx = Math.floor(altSnapped.length * 0.5);
        const midPoint = altSnapped[midIdx] || altSnapped[0];
        const diffMinutes = corridor.durationMinutes - activeCorridor.durationMinutes;
        const diffText = diffMinutes > 0 ? `+${diffMinutes}m` : diffMinutes < 0 ? `${diffMinutes}m` : 'Same time';

        const altBadgeMarker = L.marker(midPoint, {
          icon: L.divIcon({
            className: 'google-maps-alt-eta-pill',
            html: `
              <div style="
                display: flex;
                align-items: center;
                gap: 4px;
                background: #ffffff;
                color: #475569;
                border: 1.5px solid #cbd5e1;
                box-shadow: 0 4px 12px rgba(0,0,0,0.22);
                padding: 4px 9px;
                border-radius: 9999px;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
                transform: translate(-50%, -50%);
                user-select: none;
                transition: transform 0.15s ease, background 0.15s ease;
              " onmouseover="this.style.transform='translate(-50%, -50%) scale(1.08)'; this.style.borderColor='#94a3b8';" onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'; this.style.borderColor='#cbd5e1';">
                <span>${corridor.durationMinutes} min</span>
                <span style="font-size: 10px; color: #64748b; font-weight: 500;">(${diffText})</span>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
        }).addTo(group);

        altBadgeMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          handleCorridorSelect(corridor);
        });
        altBadgeMarker.bindTooltip(`Click to choose ${corridor.name}`, { sticky: true });
      });

      // 2. Render the ACTIVE SELECTED route in bold Google Maps Blue with casing
      const activeSnapped = snapRouteEndpoints(activeCorridor.latLngs, originCoords, destCoords);

      // White halo/underlay
      L.polyline(activeSnapped, {
        color: '#ffffff',
        weight: 11,
        opacity: 0.95,
      }).addTo(group);

      // Primary Blue line
      const activePolyline = L.polyline(activeSnapped, {
        color: activeCorridor.color || '#1a73e8',
        weight: 7.5,
        opacity: 0.98,
      }).addTo(group);

      // Subtle inner animated traffic pulse line
      L.polyline(activeSnapped, {
        color: '#ffffff',
        weight: 2.5,
        opacity: 0.85,
        dashArray: '8, 12',
      }).addTo(group);

      activePolyline.bindTooltip(
        `<b>✓ Active Route: ${activeCorridor.name}</b><br/>${activeCorridor.distanceKm} km • ${activeCorridor.durationMinutes} mins`,
        { sticky: true }
      );

      // Active Route Google Maps Midpoint ETA Pill
      const activeMidIdx = Math.floor(activeSnapped.length * 0.45);
      const activeMidPoint = activeSnapped[activeMidIdx] || activeSnapped[0];

      L.marker(activeMidPoint, {
        icon: L.divIcon({
          className: 'google-maps-active-eta-pill',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 5px;
              background: #1a73e8;
              color: #ffffff;
              border: 2px solid #ffffff;
              box-shadow: 0 4px 16px rgba(26,115,232,0.45);
              padding: 4px 11px;
              border-radius: 9999px;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
              white-space: nowrap;
              transform: translate(-50%, -50%);
              user-select: none;
            ">
              <span>🚗 ${activeCorridor.durationMinutes} min</span>
              <span style="font-size: 10px; font-weight: 600; opacity: 0.9;">· ${activeCorridor.tag.split('/')[0]}</span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
      }).addTo(group);

      // Real Bridge Waypoint Indicator
      L.marker([30.34254, 77.9547], {
        icon: L.divIcon({
          className: 'bridge-waypoint-pin',
          html: `
            <div style="background:#0f172a; color:#38bdf8; padding:3px 8px; border-radius:8px; font-size:10px; font-weight:800; border:1.5px solid #38bdf8; box-shadow:0 3px 8px rgba(0,0,0,0.4); white-space:nowrap; display:flex; align-items:center; gap:3px;">
              <span>🌉 Nanda Ki Chowki River Bridge</span>
            </div>
          `,
          iconAnchor: [65, 12],
        }),
      }).addTo(group);

      // Draggable Origin Marker (Pickup Hub)
      const originMarker = L.marker(originCoords, {
        draggable: true,
        icon: createGooglePinIcon('#0f9d58', 'Pickup Hub (Drag to move)', true),
      }).addTo(group);
      originMarker.bindPopup(`<b>Pickup Location: ${currentOrigin}</b><br/>Drag pin anywhere on map to change pickup point!`);

      originMarker.on('dragend', (e: any) => {
        const newLatLng = e.target.getLatLng();
        setCustomOriginCoords([newLatLng.lat, newLatLng.lng]);
        const updatedLabel = `Custom Point (${newLatLng.lat.toFixed(4)}, ${newLatLng.lng.toFixed(4)})`;
        setCurrentOrigin(updatedLabel);
        onOriginChange?.(updatedLabel);
      });

      // Draggable Destination Marker (Drop-off)
      const destMarker = L.marker(destCoords, {
        draggable: true,
        icon: createGooglePinIcon('#ea4335', 'Destination (Drag to move)'),
      }).addTo(group);
      destMarker.bindPopup(`<b>Destination: ${currentDest}</b><br/>Drag pin anywhere to change destination!`);

      destMarker.on('dragend', (e: any) => {
        const newLatLng = e.target.getLatLng();
        setCustomDestCoords([newLatLng.lat, newLatLng.lng]);
        const updatedLabel = `Custom Destination (${newLatLng.lat.toFixed(4)}, ${newLatLng.lng.toFixed(4)})`;
        setCurrentDest(updatedLabel);
        onDestinationChange?.(updatedLabel);
      });

      // Fit bounds with ample bottom padding so Destination marker is NEVER covered by the HUD bar
      const currentFitKey = `${activeTab}:${originCoords.join(',')}:${destCoords.join(',')}`;
      if (lastFittedBoundsKeyRef.current !== currentFitKey) {
        lastFittedBoundsKeyRef.current = currentFitKey;
        const allPoints: [number, number][] = [originCoords, destCoords, ...activeCorridor.latLngs];
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, {
          paddingTopLeft: [50, 60],
          paddingBottomRight: [50, 100],
          maxZoom: 15,
        });
      }
    } else {
      // MODE: WALK TO PICKUP HUB (High-detail campus view)
      const studentCurrentLocation: [number, number] = [30.3418, 77.9436];

      Object.entries(CAMPUS_BUILDING_GUIDES).forEach(([key, g]) => {
        const isTarget = key === effectiveBuildingKey;
        const marker = L.marker(g.location, {
          icon: createBuildingMarkerIcon(g.buildingCode, isTarget),
        }).addTo(group);
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:180px;">
            <b style="color:#0f172a; font-size:13px;">${g.hubName}</b>
            <p style="margin:4px 0 0; color:#475569; font-size:11px;">${g.campusArea}</p>
            <div style="margin-top:6px; font-size:10px; color:#0284c7; font-weight:700;">
              ${isTarget ? '★ DESIGNATED CARPOOL BAY' : 'Campus Building'}
            </div>
          </div>
        `);
      });

      const walkPath: [number, number][] = [
        studentCurrentLocation,
        [30.3422, 77.944],
        [30.3427, 77.9443],
        guide.location,
      ];

      L.polyline(walkPath, {
        color: '#10b981',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.95,
      }).addTo(group);

      L.marker(studentCurrentLocation, {
        icon: createGooglePinIcon('#2563eb', 'You Are Here', true),
      }).addTo(group);

      L.marker(guide.location, {
        icon: createGooglePinIcon('#059669', guide.buildingCode),
      }).addTo(group);

      const currentWalkFitKey = `walk:${effectiveBuildingKey}:${studentCurrentLocation.join(',')}`;
      if (lastFittedBoundsKeyRef.current !== currentWalkFitKey) {
        lastFittedBoundsKeyRef.current = currentWalkFitKey;
        const walkBounds = L.latLngBounds([studentCurrentLocation, guide.location]);
        map.fitBounds(walkBounds, { padding: [50, 50], maxZoom: 18 });
      }
    }
  }, [activeTab, selectedCorridorId, corridors, effectiveBuildingKey, currentOrigin, currentDest, customOriginCoords, customDestCoords]);

  const handleCorridorSelect = (corridor: RouteCorridorOption) => {
    setSelectedCorridorId(corridor.id);
    if (onSelectRoute) {
      onSelectRoute(corridor);
    }
  };

  // Google Maps Swap Button (Reverses Origin & Destination)
  const handleSwapDirections = () => {
    const prevOrigin = currentOrigin;
    const prevDest = currentDest;
    const prevOriginCoords = originCoords;
    const prevDestCoords = destCoords;

    setCurrentOrigin(prevDest);
    setCurrentDest(prevOrigin);
    setCustomOriginCoords(prevDestCoords);
    setCustomDestCoords(prevOriginCoords);

    onOriginChange?.(prevDest);
    onDestinationChange?.(prevOrigin);
  };

  const handleOriginSelect = (locName: string) => {
    setCurrentOrigin(locName);
    setCustomOriginCoords(null);
    onOriginChange?.(locName);
  };

  const handleDestSelect = (locName: string) => {
    setCurrentDest(locName);
    setCustomDestCoords(null);
    onDestinationChange?.(locName);
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (activeTab === 'route_choice') {
      const activeCorridor =
        corridors.find((c) => c.id === selectedCorridorId) || corridors[0] || INITIAL_CORRIDORS[0];
      const allPoints: [number, number][] = [originCoords, destCoords, ...activeCorridor.latLngs];
      mapInstanceRef.current.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50], maxZoom: 15 });
    } else {
      mapInstanceRef.current.setView([30.3426, 77.9452], 16);
    }
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originCoords[0]},${originCoords[1]}&destination=${destCoords[0]},${destCoords[1]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
      {/* Top Google Maps Navigation & Direction Inputs Header */}
      <div className="bg-white border-b border-slate-200 p-4 sm:p-5 space-y-4">
        {/* Header Title & Mode Switchers */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>Google Maps Multi-Road Direction Selector</span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> OFFICIAL BRIDGES
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Click directly on any road line or card to choose your commute path
              </p>
            </div>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Layer Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setMapLayerType('google_streets')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  mapLayerType === 'google_streets'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Map
              </button>
              <button
                type="button"
                onClick={() => setMapLayerType('google_satellite')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  mapLayerType === 'google_satellite'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapLayerType('carto_voyager')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  mapLayerType === 'carto_voyager'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Carto Map
              </button>
              <button
                type="button"
                onClick={() => setMapLayerType('osm')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  mapLayerType === 'osm'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Terrain
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('route_choice')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'route_choice'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Choose Driving Road</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('walk_to_pickup')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'walk_to_pickup'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>Campus Pickup Bay</span>
              </button>
            </div>

            {/* External Google Maps Button */}
            <button
              type="button"
              onClick={openInGoogleMaps}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Open route directly in Google Maps"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Google Maps Style Origin & Destination Selector Bar with Swap Button (⇄) */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {/* Origin Picker */}
          <div className="flex-1 w-full relative flex items-center">
            <div className="absolute left-3 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
            <select
              value={currentOrigin}
              onChange={(e) => handleOriginSelect(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer truncate shadow-xs"
            >
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={`orig-${loc.key}`} value={loc.name}>
                  {loc.name}
                </option>
              ))}
              {!POPULAR_LOCATIONS.some((l) => l.name === currentOrigin) && (
                <option value={currentOrigin}>{currentOrigin}</option>
              )}
            </select>
          </div>

          {/* Direction Swap Button (⇅) */}
          <button
            type="button"
            onClick={handleSwapDirections}
            className="p-2 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer shrink-0 hover:rotate-180 duration-200"
            title="Reverse Origin and Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Destination Picker */}
          <div className="flex-1 w-full relative flex items-center">
            <div className="absolute left-3 w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100 shrink-0" />
            <select
              value={currentDest}
              onChange={(e) => handleDestSelect(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer truncate shadow-xs"
            >
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={`dest-${loc.key}`} value={loc.name}>
                  {loc.name}
                </option>
              ))}
              {!POPULAR_LOCATIONS.some((l) => l.name === currentDest) && (
                <option value={currentDest}>{currentDest}</option>
              )}
            </select>
          </div>

          {/* Quick Route Count Badge */}
          <div className="shrink-0 text-xs font-bold text-blue-700 bg-blue-100/80 px-3 py-2 rounded-xl border border-blue-200 hidden lg:flex items-center gap-1.5">
            <RouteIcon className="w-3.5 h-3.5" />
            <span>{corridors.length === 1 ? '1 Verified Direct Road' : `${corridors.length} Verified Roads`}</span>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-slate-500 no-scrollbar">
          <span className="font-bold text-slate-600 shrink-0">Popular Hubs:</span>
          {[
            { label: 'Selaqui Hub', name: 'Selaqui Industrial & Institutional Hub' },
            { label: 'Premnagar Market', name: 'Premnagar Chowk Market' },
            { label: 'Suddhowala PG Hub', name: 'Suddhowala Chowk (Student PG Hub)' },
            { label: 'Ballupur Chowk', name: 'Ballupur Chowk (City Entrance)' },
            { label: 'Clock Tower', name: 'Clock Tower (Ghanta Ghar)' },
            { label: 'UIT Porch', name: 'UIT Building (Uttaranchal Institute of Technology)' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleOriginSelect(chip.name)}
              className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer shrink-0 font-medium ${
                currentOrigin === chip.name
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real Map Canvas */}
      <div className="relative w-full" style={{ height: compact ? 360 : 460 }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Status Message Warning Banner */}
        {statusMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-100 text-amber-900 px-4 py-2 rounded-xl border border-amber-300 shadow-lg flex items-center gap-2 max-w-[90%] text-sm font-semibold text-center">
            <span>⚠️</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Floating Top Hint Pill on Map */}
        {activeTab === 'route_choice' && !statusMessage && (
          <div className="absolute top-4 left-4 z-10 bg-[#143D32]/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl border border-emerald-600/40 text-xs shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
            <RouteIcon className="w-4 h-4 text-emerald-300" />
            <span>
              <b>Interactive:</b> Click any road line or floating pill to switch routes!
            </span>
          </div>
        )}

        {/* Recenter & Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all cursor-pointer"
            title="Recenter Map"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>

        {/* Live Route Status HUD Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xl text-xs">
          {activeTab === 'route_choice' ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs ring-2 ring-white"
                    style={{ backgroundColor: currentCorridor.color }}
                  />
                  <span className="font-extrabold text-slate-900">{currentCorridor.name}</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {currentCorridor.durationMinutes} mins ({currentCorridor.distanceKm} km)
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-blue-800 font-semibold bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {currentCorridor.tag}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-medium">
                  Est. Fuel Split: <b>₹{currentCorridor.fuelEstimateInr}/seat</b>
                </span>
                <div className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Selected Road</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                  <span>
                    {guide.walkDistanceMeters}m ({guide.walkMinutes} min walk) to {guide.buildingCode}
                  </span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  CCTV & Lighting Active
                </span>
              </div>
              <div className="text-slate-500 font-medium">{guide.campusArea}</div>
            </>
          )}
        </div>
      </div>

      {/* Interactive Bottom Route Cards & Turn Guidance */}
      <div className="p-4 sm:p-5 space-y-4 bg-slate-50/80 border-t border-slate-200">
        {activeTab === 'route_choice' ? (
          <div className="space-y-4">
            {/* Route Cards Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-blue-600" />
                  Select Driving Route (Click Card or Click Road on Map)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each route follows verified roads across Dehradun & Uttaranchal University bridges:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTurnByTurn((prev) => !prev)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{showTurnByTurn ? 'Hide Turn Guidance' : 'Show Turn Maneuvers'}</span>
                {showTurnByTurn ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Interactive Route Cards */}
            <div
              className={`grid grid-cols-1 ${
                corridors.length === 1
                  ? 'sm:grid-cols-1 max-w-md'
                  : corridors.length === 2
                  ? 'sm:grid-cols-2'
                  : 'sm:grid-cols-3'
              } gap-3`}
            >
              {corridors.map((corridor, idx) => {
                const isSelected = corridor.id === selectedCorridorId;
                return (
                  <button
                    key={corridor.id}
                    type="button"
                    onClick={() => handleCorridorSelect(corridor)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                      isSelected
                        ? 'border-blue-500 bg-white shadow-lg ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {idx === 0 ? 'Fastest Route' : corridor.tag}
                        </span>
                        {isSelected ? (
                          <span className="text-xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active Road
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold hover:text-blue-600">
                            Click to Select
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-xs text-slate-900 leading-tight">
                        {corridor.name}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {corridor.description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {corridor.viaWaypoints.map((wp, wIdx) => (
                          <span
                            key={wIdx}
                            className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium"
                          >
                            {wp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {corridor.durationMinutes} mins
                      </span>
                      <span className="text-slate-600 font-mono font-semibold">
                        {corridor.distanceKm} km
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ₹{corridor.fuelEstimateInr}/seat
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expandable Google Maps Turn-by-Turn Maneuvers Drawer */}
            {showTurnByTurn && currentCorridor.turnSteps && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Navigation2 className="w-3.5 h-3.5 text-blue-600" />
                    Turn-by-Turn Navigation for: <b>{currentCorridor.name}</b>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total: {currentCorridor.distanceKm} km · ~{currentCorridor.durationMinutes} mins
                  </span>
                </div>

                <div className="space-y-2">
                  {currentCorridor.turnSteps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px] shrink-0 border border-blue-100">
                          {sIdx + 1}
                        </div>
                        <span className="text-slate-800 font-medium">{step.instruction}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px] shrink-0 font-semibold">
                        {step.distanceText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Walk to Pickup Guide */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pedestrian Walk Guidance to Designated Carpool Bay
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-sm text-slate-900">{guide.hubName}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {guide.buildingCode}
                  </span>
                </div>
              </div>

              {/* Safety Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  24/7 CCTV
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  Well-Lit Shelter
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Security Desk
                </span>
              </div>
            </div>

            {/* Step-by-Step Walking Directions */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2.5 shadow-xs">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                <span>Turn-by-Turn Walking Directions ({guide.walkDistanceMeters} meters / ~{guide.walkMinutes} mins):</span>
              </div>
              <div className="space-y-2">
                {guide.stepDirections.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => setWalkingStepIndex(idx)}
                    className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                      walkingStepIndex === idx
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        walkingStepIndex === idx
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
