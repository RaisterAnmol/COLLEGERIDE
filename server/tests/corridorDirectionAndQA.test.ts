import {
  calculateMatchScore,
  haversineDistanceKm,
  DriverRideInput,
  PassengerQueryInput,
} from '../src/services/matchingEngine';

describe('Senior QA Logic Review: Corridor, Directionality & Academic Affinity', () => {
  const baseTime = new Date('2026-10-04T09:00:00.000Z');

  // Dehradun Test Coordinates
  const uitCampus = { lat: 30.3400, lng: 77.9515 };
  const uscsCampus = { lat: 30.3396, lng: 77.9510 };
  const bbaCampus = { lat: 30.3392, lng: 77.9505 };
  const premnagarMarket = { lat: 30.3340, lng: 77.9620 };
  const suddhowalaHub = { lat: 30.3475, lng: 77.9320 };
  const ballupurChowk = { lat: 30.3395, lng: 78.0125 };
  const clockTower = { lat: 30.3256, lng: 78.0437 };

  describe('1. Directional Alignment & Reverse Route Elimination', () => {
    test('PASS: Direct forward route (UIT -> Premnagar) matches passenger query (UIT -> Premnagar)', () => {
      const driverRide: DriverRideInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        availableSeats: 3,
        driverGender: 'male',
      };
      const passengerQuery: PassengerQueryInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        requestedSeats: 1,
      };

      const result = calculateMatchScore(driverRide, passengerQuery);
      expect(result.isMatch).toBe(true);
      expect(result.percentage).toBeGreaterThanOrEqual(95);
      expect(result.breakdown.pickupDistanceKm).toBeLessThanOrEqual(0.1);
    });

    test('FAIL / DISQUALIFIED: Reverse route (Premnagar -> BBA/Campus) is strictly rejected when searching UIT -> Premnagar', () => {
      // Driver is traveling Premnagar -> BBA (Heading North-West towards campus)
      const reverseDriverRide: DriverRideInput = {
        origin: premnagarMarket,
        destination: bbaCampus,
        departureTime: baseTime,
        availableSeats: 3,
        driverGender: 'female',
      };
      // Passenger wants to leave campus (Heading South-East to Premnagar)
      const passengerQuery: PassengerQueryInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        requestedSeats: 1,
      };

      const result = calculateMatchScore(reverseDriverRide, passengerQuery);
      expect(result.isMatch).toBe(false);
      expect(result.percentage).toBe(0);
      expect(result.disqualificationReason).toMatch(/opposite|divergent|do not match/i);
    });
  });

  describe('2. Campus Proximity vs Out-of-Bounds Hubs', () => {
    test('PASS: Adjacent campus building pickup (USCS -> Premnagar, ~80m from UIT) matches UIT search', () => {
      const uscsDriverRide: DriverRideInput = {
        origin: uscsCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        availableSeats: 3,
        driverGender: 'male',
      };
      const passengerQuery: PassengerQueryInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        requestedSeats: 1,
      };

      const result = calculateMatchScore(uscsDriverRide, passengerQuery);
      expect(result.isMatch).toBe(true);
      expect(result.percentage).toBeGreaterThanOrEqual(90);
      expect(result.breakdown.pickupDistanceKm).toBeLessThanOrEqual(0.15);
    });

    test('FAIL / DISQUALIFIED: Suddhowala pickup (>2km away) is strictly rejected when searching UIT', () => {
      const suddhowalaDriverRide: DriverRideInput = {
        origin: suddhowalaHub,
        destination: premnagarMarket,
        departureTime: baseTime,
        availableSeats: 3,
        driverGender: 'male',
      };
      const passengerQuery: PassengerQueryInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        requestedSeats: 1,
      };

      const result = calculateMatchScore(suddhowalaDriverRide, passengerQuery);
      expect(result.isMatch).toBe(false);
      expect(result.percentage).toBe(0);
      expect(result.disqualificationReason).toMatch(/pickup is 2.*km away|do not match/i);
    });
  });

  describe('3. Academic Affinity Ranking Tier Hierarchy', () => {
    test('Rank 1 Classmate (Same Course & Sem) receives highest academic bonus', () => {
      const driverRide: DriverRideInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        availableSeats: 3,
        driverGender: 'male',
        academicProfile: {
          college: 'Uttaranchal University',
          department: 'CSE',
          course: 'B.Tech',
          semester: 5,
        },
      };
      const passengerQuery: PassengerQueryInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        requestedSeats: 1,
        academicProfile: {
          college: 'Uttaranchal University',
          department: 'CSE',
          course: 'B.Tech',
          semester: 5,
        },
      };

      const result = calculateMatchScore(driverRide, passengerQuery);
      expect(result.isMatch).toBe(true);
      expect(result.breakdown.sameCourseAndSemester).toBe(true);
      expect(result.breakdown.academicPriorityRank).toBe(1);
      expect(result.breakdown.academicBonus).toBe(0.12);
    });

    test('Rank 2 Same Department receives tier 2 bonus', () => {
      const driverRide: DriverRideInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        availableSeats: 3,
        driverGender: 'male',
        academicProfile: {
          college: 'Uttaranchal University',
          department: 'CSE',
          course: 'B.Tech',
          semester: 7, // different sem
        },
      };
      const passengerQuery: PassengerQueryInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        requestedSeats: 1,
        academicProfile: {
          college: 'Uttaranchal University',
          department: 'CSE',
          course: 'B.Tech',
          semester: 5,
        },
      };

      const result = calculateMatchScore(driverRide, passengerQuery);
      expect(result.isMatch).toBe(true);
      expect(result.breakdown.sameCourseAndSemester).toBe(false);
      expect(result.breakdown.sameDepartment).toBe(true);
      expect(result.breakdown.academicPriorityRank).toBe(2);
      expect(result.breakdown.academicBonus).toBe(0.08);
    });
  });

  describe('4. Hard Gate Filters', () => {
    test('Women-only filter strictly rejects male driver regardless of match percentage', () => {
      const driverRide: DriverRideInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        availableSeats: 3,
        driverGender: 'male',
      };
      const passengerQuery: PassengerQueryInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        requestedSeats: 1,
        preferences: { womenOnlyDriver: true },
      };

      const result = calculateMatchScore(driverRide, passengerQuery);
      expect(result.isMatch).toBe(false);
      expect(result.percentage).toBe(0);
      expect(result.disqualificationReason).toMatch(/women-only/i);
    });

    test('Insufficient seats strictly disqualifies ride', () => {
      const driverRide: DriverRideInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        availableSeats: 1,
        driverGender: 'male',
      };
      const passengerQuery: PassengerQueryInput = {
        origin: uitCampus,
        destination: premnagarMarket,
        departureTime: baseTime,
        requestedSeats: 3,
      };

      const result = calculateMatchScore(driverRide, passengerQuery);
      expect(result.isMatch).toBe(false);
      expect(result.percentage).toBe(0);
      expect(result.disqualificationReason).toMatch(/insufficient seats/i);
    });
  });
});

