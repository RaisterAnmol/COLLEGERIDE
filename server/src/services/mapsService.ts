import {
  MOCK_PLACES,
  MOCK_ROUTES,
  getMockRoadDistanceAndDuration,
  MockPlace,
} from "../fixtures/mockMapsData";
import { logger } from "../utils/logger";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteAlternative {
  summary: string;
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
  decodedPath: Array<[number, number]>;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  mode: "LIVE" | "MOCK_DEV";
  provider: "OSRM" | "GOOGLE" | "OPENROUTESERVICE" | "MOCK" | "NONE";
  calculatedAt: string;
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
  decodedPath: Array<[number, number]>; // [lat, lng]
  alternatives: RouteAlternative[];
  steps?: RouteStep[];
  warnings?: string[];
  noRouteFound?: boolean;
}

export interface PlaceSearchResult {
  mode: "LIVE" | "MOCK_DEV";
  places: Array<{
    placeId: string;
    name: string;
    formattedAddress: string;
    location: LatLng;
  }>;
}

export class MapsService {
  private static apiKey: string | undefined = process.env.GOOGLE_MAPS_API_KEY;

  public static isGoogleLiveMode(): boolean {
    return Boolean(this.apiKey && process.env.MAPS_MODE === "live");
  }

  public static isFreeLiveMode(): boolean {
    return process.env.MAPS_MODE === "free" || (!this.apiKey && process.env.MAPS_MODE !== "mock");
  }

  public static isLiveMode(): boolean {
    return this.isGoogleLiveMode() || this.isFreeLiveMode();
  }

  public static getMapMode(): "LIVE_GOOGLE" | "LIVE_FREE_OSM" | "MOCK_DEV" {
    if (this.isGoogleLiveMode()) return "LIVE_GOOGLE";
    if (this.isFreeLiveMode()) return "LIVE_FREE_OSM";
    return "MOCK_DEV";
  }

  /**
   * Search places via Google Places, Free OpenStreetMap (Nominatim), or deterministic fixtures
   */
  public static async searchPlaces(query: string): Promise<PlaceSearchResult> {
    if (!query || query.trim().length === 0) {
      return { mode: this.isLiveMode() ? "LIVE" : "MOCK_DEV", places: [] };
    }

    // 1. Google Places (if API key configured and mode is 'live')
    if (this.isGoogleLiveMode()) {
      try {
        const url = "https://places.googleapis.com/v1/places:autocomplete";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": this.apiKey!,
          },
          body: JSON.stringify({ input: query }),
        });

        if (response.ok) {
          const data: any = await response.json();
          // For each suggestion, fetch details to get accurate lat/lng rather than campus default
          const suggestions = await Promise.all(
            (data.suggestions || []).slice(0, 5).map(async (s: any) => {
              const pred = s.placePrediction;
              const placeId = pred.placeId;
              let loc: LatLng = { lat: 30.3415, lng: 77.944 };
              try {
                const detailRes = await fetch(
                  `https://places.googleapis.com/v1/places/${placeId}?fields=location,displayName,formattedAddress`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "X-Goog-Api-Key": MapsService.apiKey!,
                    },
                  },
                );
                if (detailRes.ok) {
                  const detail: any = await detailRes.json();
                  if (detail.location) {
                    loc = { lat: detail.location.latitude, lng: detail.location.longitude };
                  }
                }
              } catch (_) {}

              return {
                placeId,
                name: pred.structuredFormat?.mainText?.text || pred.text?.text,
                formattedAddress: pred.text?.text || "",
                location: loc,
              };
            }),
          );
          return { mode: "LIVE", places: suggestions };
        }
      } catch (err) {
        logger.warn({ err }, "[MapsService] Google Places search failed, falling back to OSM / Mock");
      }
    }

    // 2. Free OpenStreetMap (Nominatim) - 100% Free, no credit card/billing required
    if (this.isFreeLiveMode()) {
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6`;
        const response = await fetch(osmUrl, {
          headers: {
            "User-Agent": "CampusRide-StudentCarpool/1.0",
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data: any = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const places = data.map((item: any) => ({
              placeId: `osm-${item.place_id}`,
              name: item.name || item.display_name.split(",")[0],
              formattedAddress: item.display_name,
              location: {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
              },
            }));
            return { mode: "LIVE", places };
          }
        }
      } catch (err) {
        logger.warn({ err }, "[MapsService] Free OSM Nominatim lookup failed, falling back to fixtures");
      }
    }

    // 3. Deterministic Mock Provider
    const q = query.toLowerCase().trim();
    const matches = MOCK_PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.formattedAddress.toLowerCase().includes(q) ||
        p.types.some((t) => t.includes(q)),
    );

    return {
      mode: "MOCK_DEV",
      places: (matches.length > 0 ? matches : MOCK_PLACES.slice(0, 5)).map(
        (p) => ({
          placeId: p.placeId,
          name: p.name,
          formattedAddress: p.formattedAddress,
          location: p.location,
        }),
      ),
    };
  }

  /**
   * Compute Road Route with Routes API v2, OSRM, or deterministic fixtures
   */
  public static async computeRoadRoute(
    origin: LatLng,
    destination: LatLng,
    intermediates: LatLng[] = [],
  ): Promise<RouteResult> {
    const calculatedAt = new Date().toISOString();

    // 1. Google Routes API (if API key configured and mode is 'live')
    if (this.isGoogleLiveMode()) {
      try {
        const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
        const body: any = {
          origin: {
            location: {
              latLng: { latitude: origin.lat, longitude: origin.lng },
            },
          },
          destination: {
            location: {
              latLng: { latitude: destination.lat, longitude: destination.lng },
            },
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          computeAlternativeRoutes: true,
        };

        if (intermediates.length > 0) {
          body.intermediates = intermediates.map((w) => ({
            location: { latLng: { latitude: w.lat, longitude: w.lng } },
          }));
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": this.apiKey!,
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.description",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.routes && data.routes.length > 0) {
            const primary = data.routes[0];
            const polyline = primary.polyline?.encodedPolyline || "";
            const durationSec = parseInt(
              primary.duration?.replace("s", "") || "600",
              10,
            );

            const alternatives: RouteAlternative[] = data.routes.slice(1).map((r: any, idx: number) => ({
              summary: r.description || `Alternative Route ${idx + 1}`,
              distanceMeters: r.distanceMeters || 1000,
              durationSeconds: parseInt(r.duration?.replace("s", "") || "600", 10),
              encodedPolyline: r.polyline?.encodedPolyline || "",
              decodedPath: MapsService.decodePolyline(r.polyline?.encodedPolyline || ""),
            }));

            return {
              mode: "LIVE",
              provider: "GOOGLE",
              calculatedAt,
              distanceMeters: primary.distanceMeters || 1000,
              durationSeconds: durationSec,
              encodedPolyline: polyline,
              decodedPath: this.decodePolyline(polyline),
              alternatives,
            };
          }
        }
      } catch (err) {
        logger.warn(
          { err },
          "[MapsService] Google Routes API failed, falling back to OSRM / Mock",
        );
      }
    }

    // 2. Free OpenStreetMap OSRM Road Routing (100% Free, no credit card/billing required)
    if (this.isFreeLiveMode()) {
      try {
        const coords = [
          `${origin.lng},${origin.lat}`,
          ...intermediates.map((i) => `${i.lng},${i.lat}`),
          `${destination.lng},${destination.lat}`,
        ].join(";");
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline&alternatives=true&steps=true`;
        const response = await fetch(osrmUrl, {
          headers: {
            "User-Agent": "CampusRide-StudentCarpool/1.0",
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.routes && data.routes.length > 0) {
            const primary = data.routes[0];
            const polyline = primary.geometry;
            const primarySteps: RouteStep[] = (primary.legs || []).flatMap((leg: any) =>
              (leg.steps || []).map((s: any) => ({
                instruction: `${s.maneuver?.type || "proceed"}${s.maneuver?.modifier ? ` ${s.maneuver.modifier}` : ""}${s.name ? ` on ${s.name}` : ""}`,
                distanceMeters: Math.round(s.distance || 0),
                durationSeconds: Math.round(s.duration || 0),
              })),
            );

            const alternatives: RouteAlternative[] = data.routes.slice(1).map((alt: any, idx: number) => ({
              summary: alt.legs?.[0]?.summary || `Alternative via Route ${idx + 1}`,
              distanceMeters: Math.round(alt.distance),
              durationSeconds: Math.round(alt.duration),
              encodedPolyline: alt.geometry,
              decodedPath: MapsService.decodePolyline(alt.geometry),
            }));

            return {
              mode: "LIVE",
              provider: "OSRM",
              calculatedAt,
              distanceMeters: Math.round(primary.distance),
              durationSeconds: Math.round(primary.duration),
              encodedPolyline: polyline,
              decodedPath: this.decodePolyline(polyline),
              alternatives,
              steps: primarySteps,
            };
          }
        }
      } catch (err) {
        logger.warn(
          { err },
          "[MapsService] Free OSRM road routing failed, trying OpenRouteService fallback",
        );
      }

      // Secondary Fallback: OpenRouteService API (if configured or public endpoint)
      try {
        const orsKey = process.env.OPENROUTESERVICE_API_KEY;
        if (orsKey) {
          const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsKey}&start=${origin.lng},${origin.lat}&end=${destination.lng},${destination.lat}`;
          const orsRes = await fetch(orsUrl, {
            headers: { Accept: "application/json, application/geo+json" },
          });
          if (orsRes.ok) {
            const orsData: any = await orsRes.json();
            const feature = orsData.features?.[0];
            if (feature?.geometry?.coordinates) {
              const coords: Array<[number, number]> = feature.geometry.coordinates.map(
                (c: [number, number]) => [c[1], c[0]],
              );
              const summary = feature.properties?.summary || {};
              const polyline = this.encodePolyline(coords);
              return {
                mode: "LIVE",
                provider: "OPENROUTESERVICE",
                calculatedAt,
                distanceMeters: Math.round(summary.distance || 1000),
                durationSeconds: Math.round(summary.duration || 600),
                encodedPolyline: polyline,
                decodedPath: coords,
                alternatives: [],
              };
            }
          }
        }
      } catch (orsErr) {
        logger.warn({ orsErr }, "[MapsService] OpenRouteService fallback also failed");
      }

      // Live mode without available routing: NEVER synthesize fake roads
      if (process.env.MAPS_MODE !== "mock") {
        return {
          mode: "LIVE",
          provider: "NONE",
          calculatedAt,
          distanceMeters: 0,
          durationSeconds: 0,
          encodedPolyline: "",
          decodedPath: [],
          alternatives: [],
          steps: [],
          noRouteFound: true,
          warnings: [
            "Live road geometry is temporarily unavailable from both routing providers. Pickup & destination locations remain accurate.",
          ],
        };
      }
    }

    // 3. Deterministic Mock Provider (used ONLY during offline unit tests when MAPS_MODE=mock)
    const mock = getMockRoadDistanceAndDuration(origin, destination);
    const path = this.generateSyntheticRoadPath(origin, destination);
    const polyline = this.encodePolyline(path);

    const altPath: Array<[number, number]> = path.map(([lat, lng], i) => [
      Number((lat + (i > 0 && i < path.length - 1 ? 0.001 : 0)).toFixed(6)),
      Number((lng + (i > 0 && i < path.length - 1 ? 0.0015 : 0)).toFixed(6)),
    ]);
    const altPolyline = this.encodePolyline(altPath);

    return {
      mode: "MOCK_DEV",
      provider: "MOCK",
      calculatedAt,
      distanceMeters: mock.distanceMeters,
      durationSeconds: mock.durationSeconds,
      encodedPolyline: polyline,
      decodedPath: path,
      alternatives: [
        {
          summary: "Alternative Campus Link Road",
          distanceMeters: Math.round(mock.distanceMeters * 1.15),
          durationSeconds: Math.round(mock.durationSeconds * 1.2),
          encodedPolyline: altPolyline,
          decodedPath: altPath,
        },
      ],
      steps: [
        { instruction: "Head towards main campus road", distanceMeters: 400, durationSeconds: 60 },
        { instruction: "Continue onto connecting corridor", distanceMeters: mock.distanceMeters - 800, durationSeconds: mock.durationSeconds - 120 },
        { instruction: "Arrive at designated drop hub", distanceMeters: 400, durationSeconds: 60 },
      ],
    };
  }

  /**
   * Decode Google Encoded Polyline into [latitude, longitude][]
   */
  public static decodePolyline(encoded: string): Array<[number, number]> {
    if (!encoded) return [];
    const points: Array<[number, number]> = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  }

  /**
   * Encode [latitude, longitude][] into Google Encoded Polyline
   */
  public static encodePolyline(points: Array<[number, number]>): string {
    let plat = 0;
    let plng = 0;
    let str = "";

    for (const [lat, lng] of points) {
      const late5 = Math.round(lat * 1e5);
      const lnge5 = Math.round(lng * 1e5);
      str += this.encodeSignedNumber(late5 - plat);
      str += this.encodeSignedNumber(lnge5 - plng);
      plat = late5;
      plng = lnge5;
    }
    return str;
  }

  private static encodeSignedNumber(num: number): string {
    let sgn_num = num << 1;
    if (num < 0) {
      sgn_num = ~sgn_num;
    }
    let encodeString = "";
    while (sgn_num >= 0x20) {
      encodeString += String.fromCharCode((0x20 | (sgn_num & 0x1f)) + 63);
      sgn_num >>= 5;
    }
    encodeString += String.fromCharCode(sgn_num + 63);
    return encodeString;
  }

  /**
   * Generate realistic intermediate points along road curves between origin and destination
   */
  public static generateSyntheticRoadPath(
    origin: LatLng,
    destination: LatLng,
  ): Array<[number, number]> {
    const steps = 8;
    const path: Array<[number, number]> = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Slight road curvature offset
      const curve = Math.sin(t * Math.PI) * 0.0012;
      const lat = origin.lat + (destination.lat - origin.lat) * t + curve;
      const lng = origin.lng + (destination.lng - origin.lng) * t - curve * 0.8;
      path.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
    }
    return path;
  }

  /**
   * Distance from GPS point to nearest point on road polyline in meters
   */
  public static computePointToRouteDistanceMeters(
    point: LatLng,
    polylinePath: Array<[number, number]>,
  ): number {
    if (!polylinePath || polylinePath.length === 0) return 0;
    if (polylinePath.length === 1) {
      return this.haversineMeters(point, {
        lat: polylinePath[0][0],
        lng: polylinePath[0][1],
      });
    }

    let minDistance = Infinity;
    for (let i = 0; i < polylinePath.length - 1; i++) {
      const p1 = { lat: polylinePath[i][0], lng: polylinePath[i][1] };
      const p2 = { lat: polylinePath[i + 1][0], lng: polylinePath[i + 1][1] };
      const dist = this.pointToSegmentDistanceMeters(point, p1, p2);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
    return Math.round(minDistance);
  }

  private static pointToSegmentDistanceMeters(
    p: LatLng,
    v: LatLng,
    w: LatLng,
  ): number {
    // Project point p onto segment vw
    const l2 =
      (w.lat - v.lat) * (w.lat - v.lat) + (w.lng - v.lng) * (w.lng - v.lng);
    if (l2 === 0) return this.haversineMeters(p, v);

    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.lat - v.lat) * (w.lat - v.lat) +
          (p.lng - v.lng) * (w.lng - v.lng)) /
          l2,
      ),
    );
    const projection = {
      lat: v.lat + t * (w.lat - v.lat),
      lng: v.lng + t * (w.lng - v.lng),
    };
    return this.haversineMeters(p, projection);
  }

  public static haversineMeters(p1: LatLng, p2: LatLng): number {
    const R = 6371000;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
