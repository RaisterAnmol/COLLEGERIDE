import React from '../../client/node_modules/react/index.js';
import { renderToStaticMarkup } from '../../client/node_modules/react-dom/server.node.js';

export { React, renderToStaticMarkup };

/**
 * Render a React component to static HTML string.
 */
export function renderComponent(element: React.ReactElement): string {
  return renderToStaticMarkup(element);
}

/**
 * Standard test fixtures representing authentic Dehradun university commute data.
 */
export const FIXTURES = {
  driverVerified: {
    _id: 'user-drv-01',
    name: 'Aarav Sharma',
    college: 'Uttaranchal University (UIT)',
    department: 'Computer Science & Engineering',
    course: 'B.Tech',
    semester: 6,
    gender: 'male' as const,
    rating: 4.9,
    verificationStatus: 'verified' as const,
    avatarURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120',
  },
  driverUnverified: {
    _id: 'user-drv-02',
    name: 'Rohan Verma',
    college: 'DIT University',
    department: 'Mechanical Engineering',
    course: 'B.Tech',
    semester: 4,
    gender: 'male' as const,
    rating: 4.5,
    verificationStatus: 'unverified' as const,
  },
  driverPending: {
    _id: 'user-drv-03',
    name: 'Priya Nautiyal',
    college: 'Graphic Era University',
    department: 'Information Technology',
    course: 'MCA',
    semester: 2,
    gender: 'female' as const,
    rating: 4.8,
    verificationStatus: 'pending' as const,
  },
  ridePremnagarToUIT: {
    _id: 'ride-prem-uit-101',
    creator: {
      _id: 'user-drv-01',
      name: 'Aarav Sharma',
      college: 'Uttaranchal University (UIT)',
      department: 'Computer Science & Engineering',
      course: 'B.Tech',
      semester: 6,
      gender: 'male',
      rating: 4.9,
      verificationStatus: 'verified',
    },
    origin: {
      text: 'Premnagar Chowk',
      lat: 30.3342,
      lng: 77.9615,
    },
    destination: {
      text: 'Uttaranchal University Gate 1',
      lat: 30.3415,
      lng: 77.9540,
    },
    departureTime: '2026-10-10T08:30:00.000Z',
    availableSeats: 3,
    seatsAvailable: 3,
    seatsTotal: 4,
    fare: 20,
    pricePerSeat: 20,
    vehicleModel: 'Maruti Suzuki Swift (White)',
    vehiclePlate: 'UK 07 AK 4821',
    notes: 'Departing sharply at 8:30 AM from outside the police booth.',
    isWomenOnly: false,
  },
  corridorStops: [
    { name: 'Premnagar Chowk', landmark: 'Market Junction', timeEstimate: 'Start' },
    { name: 'Suddhowala Hub', landmark: 'Student PG Quad', timeEstimate: '+6 min' },
    { name: 'Nanda Ki Chowki', landmark: 'Campus Outer Gate', timeEstimate: '+12 min' },
    { name: 'UIT & USCS Gate 1', landmark: 'Main Academic Quad', timeEstimate: 'Arrival' },
  ],
};
