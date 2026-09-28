export interface MockPlace {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
}

export interface MockRoute {
  originPlaceId?: string;
  destinationPlaceId?: string;
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
  steps: Array<{
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
  }>;
}

// Deterministic Campus & Surrounding Places (Dehradun & Uttaranchal University Corridor + National Hubs)
export const MOCK_PLACES: MockPlace[] = [
  // Uttaranchal University Campus Buildings
  {
    placeId: "place_uu_uit",
    name: "UIT Building (Uttaranchal Institute of Technology)",
    formattedAddress: "Engineering & Technology Block, Uttaranchal University, Premnagar, Dehradun 248007",
    location: { lat: 30.3432, lng: 77.9448 },
    types: ["university_building", "point_of_interest", "pickup_hub"],
  },
  {
    placeId: "place_uu_uscs",
    name: "USCS Building (School of Computing Sciences)",
    formattedAddress: "Computing Sciences Quad, Uttaranchal University, Premnagar, Dehradun 248007",
    location: { lat: 30.3428, lng: 77.9456 },
    types: ["university_building", "point_of_interest", "pickup_hub"],
  },
  {
    placeId: "place_uu_bba",
    name: "BBA Building (Uttaranchal Institute of Management)",
    formattedAddress: "Management & Commerce Block, Uttaranchal University, Premnagar, Dehradun 248007",
    location: { lat: 30.3420, lng: 77.9461 },
    types: ["university_building", "point_of_interest", "pickup_hub"],
  },
  {
    placeId: "place_uu_library",
    name: "Central Academic Library & Law Block",
    formattedAddress: "Central Knowledge Complex, Uttaranchal University, Premnagar, Dehradun 248007",
    location: { lat: 30.3425, lng: 77.9450 },
    types: ["library", "point_of_interest", "pickup_hub"],
  },
  {
    placeId: "place_uu_gate1",
    name: "Campus Gate 1 (Main Entrance, Premnagar Road)",
    formattedAddress: "Arcadia Grant, P.O. Chandanwari, Premnagar, Dehradun 248007",
    location: { lat: 30.3415, lng: 77.9440 },
    types: ["campus_gate", "transit_station", "pickup_hub"],
  },

  // Dehradun Regional Transit & Student Hubs
  {
    placeId: "place_premnagar",
    name: "Premnagar Chowk Market",
    formattedAddress: "Premnagar Main Bazaar, Chakrata Road, Dehradun 248007",
    location: { lat: 30.3340, lng: 77.9620 },
    types: ["neighborhood", "transit_station"],
  },
  {
    placeId: "place_suddhowala",
    name: "Suddhowala Chowk (Student PG Hub)",
    formattedAddress: "Suddhowala, Chakrata Road, Dehradun 248007",
    location: { lat: 30.3475, lng: 77.9320 },
    types: ["neighborhood", "transit_station"],
  },
  {
    placeId: "place_selaqui",
    name: "Selaqui Industrial & Institutional Hub",
    formattedAddress: "Selaqui Industrial Area, Chakrata Highway, Dehradun 248011",
    location: { lat: 30.3685, lng: 77.8540 },
    types: ["neighborhood", "transit_station"],
  },
  {
    placeId: "place_vikasnagar",
    name: "Vikasnagar Bus Terminal",
    formattedAddress: "Main Bus Stand, Vikasnagar, Uttarakhand 248198",
    location: { lat: 30.4350, lng: 77.7710 },
    types: ["bus_station", "transit_station"],
  },
  {
    placeId: "place_isbt_dehradun",
    name: "ISBT Dehradun (Inter-State Bus Terminal)",
    formattedAddress: "Haridwar Bypass Road, Transport Nagar, Dehradun 248002",
    location: { lat: 30.2885, lng: 78.0080 },
    types: ["bus_station", "transit_station"],
  },
  {
    placeId: "place_nanda_ki_chowki",
    name: "Nanda Ki Chowki Junction",
    formattedAddress: "Chakrata Road, Kolhupani, Dehradun 248007",
    location: { lat: 30.3400, lng: 77.9530 },
    types: ["transit_station", "point_of_interest"],
  },
  {
    placeId: "place_ballupur",
    name: "Ballupur Chowk (City Entrance)",
    formattedAddress: "Ballupur Road, Dehradun 248001",
    location: { lat: 30.3395, lng: 78.0125 },
    types: ["transit_station", "neighborhood"],
  },
  {
    placeId: "place_clock_tower",
    name: "Clock Tower (Ghanta Ghar / Paltan Bazaar)",
    formattedAddress: "Rajpur Road, Central Dehradun 248001",
    location: { lat: 30.3256, lng: 78.0437 },
    types: ["point_of_interest", "neighborhood"],
  },

  // Regional Transit Connectors
  {
    placeId: "place_paltan_bazaar",
    name: "Paltan Bazaar Market Hub",
    formattedAddress: "Paltan Bazaar, Clock Tower Area, Dehradun 248001",
    location: { lat: 30.3240, lng: 78.0410 },
    types: ["point_of_interest", "neighborhood"],
  },
  {
    placeId: "place_chandanwari",
    name: "Chandanwari Residential Colony",
    formattedAddress: "Chandanwari, Near Premnagar, Dehradun 248007",
    location: { lat: 30.3380, lng: 77.9570 },
    types: ["neighborhood"],
  },
  {
    placeId: "place_arcadia_grant",
    name: "Arcadia Grant Campus Entrance",
    formattedAddress: "Arcadia Grant, P.O. Chandanwari, Premnagar, Dehradun 248007",
    location: { lat: 30.3415, lng: 77.9440 },
    types: ["transit_station", "point_of_interest"],
  },
];

// Route Alternatives for Multi-Route Choice
export interface MultiRouteChoice {
  id: string;
  name: string;
  description: string;
  tag: string;
  distanceKm: number;
  durationMinutes: number;
  viaWaypoints: string[];
  trafficStatus: 'light' | 'moderate' | 'heavy';
}

export const DEHRADUN_CORRIDORS: MultiRouteChoice[] = [
  {
    id: "corridor_chakrata",
    name: "Via Chakrata Road (Main Highway)",
    description: "Direct 4-lane arterial road passing Premnagar Market and Nanda Ki Chowki",
    tag: "Fastest Route",
    distanceKm: 6.4,
    durationMinutes: 14,
    viaWaypoints: ["Premnagar Chowk", "Nanda Ki Chowki", "University Approach Rd"],
    trafficStatus: "moderate",
  },
  {
    id: "corridor_suddhowala",
    name: "Via Suddhowala Student Link",
    description: "Quiet link road through student residences, bypasses highway signals",
    tag: "Scenic / Less Congestion",
    distanceKm: 5.9,
    durationMinutes: 17,
    viaWaypoints: ["Suddhowala Chowk", "Arcadia West Lane", "Gate 1 Porch"],
    trafficStatus: "light",
  },
  {
    id: "corridor_selaqui_express",
    name: "Via Selaqui Outer Bypass",
    description: "Wide express highway connecting western industrial belt and Vikasnagar corridor",
    tag: "Express Highway",
    distanceKm: 8.2,
    durationMinutes: 16,
    viaWaypoints: ["Selaqui Pharma Zone", "Central Highway", "Premnagar Flyover"],
    trafficStatus: "light",
  },
];

// Encoded Polyline algorithm produces Google Maps standard polylines
export const MOCK_ROUTES: Record<string, MockRoute> = {
  "default": {
    distanceMeters: 4200,
    durationSeconds: 720,
    encodedPolyline: "_{peAi}wbMe@e@_@m@g@y@w@oAg@i@y@_Ao@w@q@{@u@oAc@m@w@mAg@u@_AcAc@m@_@k@e@m@g@q@q@oAg@oAc@m@u@mAg@y@q@{@q@_Ao@_Au@oAg@y@e@m@",
    steps: [
      { instruction: "Proceed along Chakrata Road (NH 72) towards Uttaranchal University", distanceMeters: 1200, durationSeconds: 180 },
      { instruction: "Cross Tons River approach at Nanda Ki Chowki Bridge", distanceMeters: 600, durationSeconds: 90 },
      { instruction: "Turn onto Arcadia Grant Campus Boulevard", distanceMeters: 800, durationSeconds: 120 },
      { instruction: "Arrive at Uttaranchal University Student Carpool Hub", distanceMeters: 400, durationSeconds: 60 },
    ],
  },
  "premnagar_to_uit": {
    distanceMeters: 2800,
    durationSeconds: 480,
    encodedPolyline: "_{peAi}wbMe@e@_@m@g@y@w@oAg@i@y@_Ao@w@q@{@u@oAc@m@w@mAg@u@_AcAc@m@_@k@e@m@g@q@q@oAg@oAc@m@u@mAg@y@q@{@q@_Ao@_Au@oAg@y@e@m@",
    steps: [
      { instruction: "Start from Premnagar Chowk heading west on Chakrata Road", distanceMeters: 800, durationSeconds: 120 },
      { instruction: "Turn right at Nanda Ki Chowki towards Uttaranchal University Road", distanceMeters: 1100, durationSeconds: 180 },
      { instruction: "Enter through Campus Main Gate 1 security checkpoint", distanceMeters: 400, durationSeconds: 90 },
      { instruction: "Proceed to UIT Building North Porch Carpool Bay", distanceMeters: 500, durationSeconds: 90 },
    ],
  },
  "selaqui_to_uscs": {
    distanceMeters: 7400,
    durationSeconds: 900,
    encodedPolyline: "_{peAi}wbMe@e@_@m@g@y@w@oAg@i@y@_Ao@w@q@{@u@oAc@m@w@mAg@u@_AcAc@m@_@k@e@m@g@q@q@oAg@oAc@m@u@mAg@y@q@{@q@_Ao@_Au@oAg@y@e@m@",
    steps: [
      { instruction: "Depart Selaqui Industrial Area eastwards on NH 72", distanceMeters: 4200, durationSeconds: 480 },
      { instruction: "Pass through Suddhowala Chowk junction", distanceMeters: 1600, durationSeconds: 210 },
      { instruction: "Turn left onto Arcadia Grant Campus boulevard", distanceMeters: 1100, durationSeconds: 130 },
      { instruction: "Arrive at USCS Building Computing Quad drop point", distanceMeters: 500, durationSeconds: 80 },
    ],
  },
};

// Deterministic distance matrix between key fixtures (in meters and seconds)
export function getMockRoadDistanceAndDuration(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): { distanceMeters: number; durationSeconds: number; encodedPolyline: string } {
  // Haversine distance base
  const R = 6371000; // meters
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineMeters = R * c;

  // Realistic road circuity factor (1.28x - 1.35x of euclidean distance for campus/city roads)
  const roadDistanceMeters = Math.round(Math.max(300, straightLineMeters * 1.32));
  // Average urban speed ~ 25 km/h = 6.94 m/s + 60s traffic buffer
  const durationSeconds = Math.round(roadDistanceMeters / 6.94 + 60);

  return {
    distanceMeters: roadDistanceMeters,
    durationSeconds,
    encodedPolyline: MOCK_ROUTES["default"].encodedPolyline,
  };
}

