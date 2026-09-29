import {
  calculateMatchScore,
  haversineDistanceKm,
  DriverRideInput,
  PassengerQueryInput,
} from '../src/services/matchingEngine';

describe('Section 8.1 Matching Engine Unit Tests (Senior QA Gatekeeper)', () => {
  const baseTime = new Date('2026-09-20T09:00:00.000Z');

  // Campus Gate (Origin) & Premnagar Chowk (Destination)
  const campusOrigin = { lat: 30.3415, lng: 77.9440 };
  const premnagarDest = { lat: 30.3340, lng: 77.9620 };

  const defaultDriverRide: DriverRideInput = {
    origin: campusOrigin,
    destination: premnagarDest,
    departureTime: baseTime,
    availableSeats: 3,
    driverGender: 'male',
    preferences: {
      musicAllowed: true,
      smokingAllowed: false,
    },
  };

  test('1. Same route, same time -> score ≈ 1.0 (within rounding)', () => {
    const passengerQuery: PassengerQueryInput = {
      origin: { ...campusOrigin },
      destination: { ...premnagarDest },
      departureTime: new Date(baseTime.getTime()),
      requestedSeats: 1,
    };

    const result = calculateMatchScore(defaultDriverRide, passengerQuery);

    expect(result.isMatch).toBe(true);
    expect(result.matchScore).toBeCloseTo(1.0, 2);
    expect(result.percentage).toBeGreaterThanOrEqual(98);
    expect(result.breakdown.routeOverlap).toBe(1.0);
    expect(result.breakdown.timeMatch).toBe(1.0);
    expect(result.breakdown.pickupProximity).toBe(1.0);
    expect(result.breakdown.seatBonus).toBe(1.0);
  });

  test('2. Completely divergent routes -> score near 0 and not surfaced', () => {
    // Passenger is 50 km away in completely opposite direction
    const divergentOrigin = { lat: 28.100, lng: 76.800 };
    const divergentDest = { lat: 28.050, lng: 76.750 };

    const passengerQuery: PassengerQueryInput = {
      origin: divergentOrigin,
      destination: divergentDest,
      departureTime: baseTime,
      requestedSeats: 1,
    };

    const result = calculateMatchScore(defaultDriverRide, passengerQuery);

    expect(result.isMatch).toBe(false); // not surfaced (< 0.25)
    expect(result.matchScore).toBeLessThan(0.25);
    expect(result.breakdown.pickupProximity).toBe(0);
  });

  test('3. Time gap > MaxWaitMinutes (15 min) -> TimeMatch clamps to 0 and does not go negative', () => {
    // 30 minutes after driver departure
    const delayedTime = new Date(baseTime.getTime() + 30 * 60 * 1000);

    const passengerQuery: PassengerQueryInput = {
      origin: { ...campusOrigin },
      destination: { ...premnagarDest },
      departureTime: delayedTime,
      requestedSeats: 1,
    };

    const result = calculateMatchScore(defaultDriverRide, passengerQuery);

    expect(result.breakdown.timeMatch).toBe(0);
    expect(result.breakdown.timeMatch).toBeGreaterThanOrEqual(0);
    // Because route is identical, routeOverlap and pickup proximity still count, but total score is penalized by 0.3
    expect(result.matchScore).toBeLessThanOrEqual(0.7);
  });

  test('4. Seats available < seats requested -> disqualified regardless of other scores', () => {
    const passengerQuery: PassengerQueryInput = {
      origin: { ...campusOrigin },
      destination: { ...premnagarDest },
      departureTime: baseTime,
      requestedSeats: 4, // driver only has 3
    };

    const result = calculateMatchScore(defaultDriverRide, passengerQuery);

    expect(result.isMatch).toBe(false);
    expect(result.matchScore).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.disqualificationReason).toMatch(/insufficient seats/i);
  });

  test('5. Preference filter mismatch -> disqualified even with perfect route/time', () => {
    // Priya requests a women-only driver, but Aditya is male
    const passengerQuery: PassengerQueryInput = {
      origin: { ...campusOrigin },
      destination: { ...premnagarDest },
      departureTime: baseTime,
      requestedSeats: 1,
      preferences: {
        womenOnlyDriver: true,
      },
    };

    const result = calculateMatchScore(defaultDriverRide, passengerQuery);

    expect(result.isMatch).toBe(false);
    expect(result.matchScore).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.disqualificationReason).toMatch(/women-only/i);
  });

  test('Haversine distance calculation is accurate', () => {
    const p1 = { lat: 28.545, lng: 77.192 };
    const p2 = { lat: 28.567, lng: 77.208 };
    const dist = haversineDistanceKm(p1, p2);
    expect(dist).toBeGreaterThan(2);
    expect(dist).toBeLessThan(4);
  });
});
