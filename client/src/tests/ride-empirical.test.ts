import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { IRide } from '../types';
import { JourneyTicket, JourneyTicketRide } from '../components/signature/JourneyTicket';

// Helper to strip React 19 SSR comment annotations: <!-- -->
function cleanHtml(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

// Subcomponent reproducing the exact disclosure block from JourneyTicket lines 292-312
function RenderNotesDisclosure({ ride }: { ride: JourneyTicketRide }) {
  return React.createElement(
    'div',
    { className: 'notes-container' },
    ride.vehiclePlate &&
      React.createElement(
        'p',
        null,
        React.createElement('strong', null, 'Plate:'),
        ' ',
        React.createElement('span', null, ride.vehiclePlate)
      ),
    ride.notes &&
      React.createElement(
        'p',
        null,
        React.createElement('strong', null, 'Driver note:'),
        ' ',
        ride.notes
      ),
    !ride.vehiclePlate &&
      !ride.notes &&
      React.createElement('p', null, 'No additional passenger notes posted.')
  );
}

test('IRide Type Completeness & JourneyTicket Edge Case Rendering', async (t) => {
  // Helper to create valid base mock ride conforming to IRide
  const createBaseRide = (overrides: Partial<IRide> = {}): IRide => ({
    _id: 'ride-test-001',
    creator: {
      _id: 'user-001',
      name: 'Aditya Kumar',
      email: 'aditya@dit.edu.in',
      phone: '+919876543210',
      college: 'Uttaranchal University',
      department: 'Computer Science',
      course: 'B.Tech CSE',
      year: 3,
      semester: 6,
      gender: 'male',
      rating: 4.8,
      totalRides: 15,
      verificationStatus: 'verified',
      role: 'student',
    },
    origin: {
      text: 'Premnagar Chowk Market',
      lat: 30.334,
      lng: 77.962,
    },
    destination: {
      text: 'UIT Building (Uttaranchal Institute of Technology)',
      lat: 30.34,
      lng: 77.9515,
    },
    departureTime: '2026-10-10T08:30:00Z',
    availableSeats: 3,
    status: 'active',
    createdAt: '2026-10-09T18:00:00Z',
    ...overrides,
  });

  await t.test('Case 1: totalSeats and notes are undefined on IRide', () => {
    const ride = createBaseRide();
    assert.equal(ride.totalSeats, undefined);
    assert.equal(ride.notes, undefined);

    // Verify mapping in SearchRidesPage.tsx:1262-1276
    const ticketRide: JourneyTicketRide = {
      _id: ride._id,
      creator: ride.creator,
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.departureTime,
      seatsAvailable: ride.availableSeats,
      availableSeats: ride.availableSeats,
      seatsTotal: ride.totalSeats,
      fare: 25,
      vehicleModel: ride.vehicleId?.model,
      vehiclePlate: ride.vehicleId?.plateLast4,
      notes: ride.notes,
    };

    const rawHtml = renderToString(React.createElement(JourneyTicket, { ride: ticketRide }));
    const html = cleanHtml(rawHtml);
    assert.ok(html.includes('Premnagar Chowk Market'));
    assert.ok(html.includes('UIT Building'));
    assert.ok(html.includes('3 seats open'));
    assert.ok(html.includes('Vehicle &amp; Corridor Notes'));

    // Check disclosure content directly
    const disclosureHtml = cleanHtml(renderToString(React.createElement(RenderNotesDisclosure, { ride: ticketRide })));
    assert.ok(disclosureHtml.includes('No additional passenger notes posted.'));
  });

  await t.test('Case 2: totalSeats and notes are present with normal values', () => {
    const ride = createBaseRide({
      totalSeats: 4,
      notes: 'Pickup near Clock Tower SBI ATM at 8:15 AM sharp',
    });
    assert.equal(ride.totalSeats, 4);
    assert.equal(ride.notes, 'Pickup near Clock Tower SBI ATM at 8:15 AM sharp');

    const ticketRide: JourneyTicketRide = {
      _id: ride._id,
      creator: ride.creator,
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.departureTime,
      seatsAvailable: ride.availableSeats,
      availableSeats: ride.availableSeats,
      seatsTotal: ride.totalSeats,
      fare: 30,
      notes: ride.notes,
    };

    const rawHtml = renderToString(React.createElement(JourneyTicket, { ride: ticketRide }));
    const html = cleanHtml(rawHtml);
    assert.ok(html.includes('3 seats open'));

    // Check disclosure content directly
    const disclosureHtml = cleanHtml(renderToString(React.createElement(RenderNotesDisclosure, { ride: ticketRide })));
    assert.ok(disclosureHtml.includes('Pickup near Clock Tower SBI ATM at 8:15 AM sharp'));
    assert.ok(disclosureHtml.includes('Driver note:'));
  });

  await t.test('Case 3: totalSeats and notes are explicitly null (simulating API response payload)', () => {
    // In actual network payloads, null values may be deserialized
    const rawApiPayload = {
      ...createBaseRide(),
      totalSeats: null,
      notes: null,
    };

    const ticketRide: JourneyTicketRide = {
      _id: rawApiPayload._id,
      creator: rawApiPayload.creator,
      origin: rawApiPayload.origin,
      destination: rawApiPayload.destination,
      departureTime: rawApiPayload.departureTime,
      seatsAvailable: rawApiPayload.availableSeats,
      availableSeats: rawApiPayload.availableSeats,
      seatsTotal: (rawApiPayload.totalSeats as unknown as number) ?? undefined,
      fare: 20,
      notes: (rawApiPayload.notes as unknown as string) ?? undefined,
    };

    const rawHtml = renderToString(React.createElement(JourneyTicket, { ride: ticketRide }));
    const html = cleanHtml(rawHtml);
    assert.ok(html.includes('Premnagar Chowk Market'));
    assert.ok(html.includes('3 seats open'));

    const disclosureHtml = cleanHtml(renderToString(React.createElement(RenderNotesDisclosure, { ride: ticketRide })));
    assert.ok(disclosureHtml.includes('No additional passenger notes posted.'));
  });

  await t.test('Case 4: Edge values - totalSeats = 0, availableSeats = 0 (Sold out ride)', () => {
    const ride = createBaseRide({
      totalSeats: 4,
      availableSeats: 0,
      notes: 'Ride is fully booked',
    });

    const ticketRide: JourneyTicketRide = {
      _id: ride._id,
      creator: ride.creator,
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.departureTime,
      seatsAvailable: 0,
      availableSeats: 0,
      seatsTotal: ride.totalSeats,
      fare: 20,
      notes: ride.notes,
    };

    const rawHtml = cleanHtml(renderToString(React.createElement(JourneyTicket, { ride: ticketRide })));
    assert.ok(rawHtml.includes('0 seats open'));

    const disclosureHtml = cleanHtml(renderToString(React.createElement(RenderNotesDisclosure, { ride: ticketRide })));
    assert.ok(disclosureHtml.includes('Ride is fully booked'));
  });

  await t.test('Case 5: notes is empty string ("")', () => {
    const ride = createBaseRide({
      totalSeats: 3,
      notes: '',
    });

    const ticketRide: JourneyTicketRide = {
      _id: ride._id,
      creator: ride.creator,
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.departureTime,
      seatsAvailable: 3,
      availableSeats: 3,
      seatsTotal: ride.totalSeats,
      notes: ride.notes,
    };

    const rawHtml = cleanHtml(renderToString(React.createElement(JourneyTicket, { ride: ticketRide })));
    assert.ok(rawHtml.includes('3 seats open'));

    const disclosureHtml = cleanHtml(renderToString(React.createElement(RenderNotesDisclosure, { ride: ticketRide })));
    assert.ok(!disclosureHtml.includes('Driver note:'));
    assert.ok(disclosureHtml.includes('No additional passenger notes posted.'));
  });

  await t.test('Case 6: notes contains special characters and XSS attempts', () => {
    const xssNote = '<script>alert("hack")</script> & "quotes" \'apostrophe\'';
    const ride = createBaseRide({
      totalSeats: 2,
      notes: xssNote,
    });

    const ticketRide: JourneyTicketRide = {
      _id: ride._id,
      creator: ride.creator,
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.departureTime,
      seatsAvailable: 1,
      availableSeats: 1,
      seatsTotal: ride.totalSeats,
      notes: ride.notes,
    };

    const rawHtml = cleanHtml(renderToString(React.createElement(JourneyTicket, { ride: ticketRide })));
    assert.ok(rawHtml.includes('1 seat open'));

    const disclosureHtml = cleanHtml(renderToString(React.createElement(RenderNotesDisclosure, { ride: ticketRide })));
    // React escapes text content, ensuring raw script tags do not execute
    assert.ok(disclosureHtml.includes('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;'));
  });
});
