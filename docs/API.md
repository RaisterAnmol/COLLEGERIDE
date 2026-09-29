# CampusRide REST API Reference

All requests to the CampusRide API should include `Content-Type: application/json`.
Protected endpoints require an `Authorization: Bearer <jwt_token>` header.

---

## 1. Authentication & User Profile (`/api/auth`)

### `POST /api/auth/register`
Creates a new verified student account.
- **Auth**: Public
- **Rate Limit**: 10 requests / 15 minutes
- **Body**:
  ```json
  {
    "name": "Aditya Kumar",
    "email": "aditya.kumar@college.edu",
    "password": "SecurePassword123!",
    "college": "Uttaranchal University",
    "year": 3,
    "gender": "male",
    "phone": "+91 98765 43210",
    "vehicle": {
      "type": "car",
      "model": "Honda City",
      "capacity": 4,
      "plateLast4": "1234"
    }
  }
  ```
- **Responses**: `201 Created`, `400 Bad Request`, `409 Conflict`

### `POST /api/auth/login`
Authenticates user and returns JWT session token.
- **Auth**: Public
- **Rate Limit**: 10 requests / 15 minutes
- **Body**:
  ```json
  {
    "email": "aditya.kumar@college.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Responses**: `200 OK` (`{ token, user }`), `401 Unauthorized`

### `GET /api/auth/me`
Retrieves authenticated user profile and registered vehicle.
- **Auth**: Bearer Token
- **Responses**: `200 OK` (`{ user, vehicle }`), `401 Unauthorized`

### `PATCH /api/auth/preferences`
Updates rider/driver preferences (e.g. women-only driver filter).
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "womenOnlyDriver": true,
    "musicAllowed": true,
    "smokingAllowed": false,
    "petsAllowed": false
  }
  ```
- **Responses**: `200 OK`, `400 Bad Request`

### `PATCH /api/auth/emergency-contact`
Updates student In Case of Emergency (ICE) contact.
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "name": "Ramesh Kumar",
    "phone": "+91 98111 22233",
    "relation": "Father"
  }
  ```
- **Responses**: `200 OK`, `400 Bad Request`

---

## 2. Rides & Commute Offers (`/api/rides`)

### `GET /api/rides`
Searches available campus carpools with spatial and temporal matching.
- **Auth**: Bearer Token
- **Query Parameters**:
  - `originLat`, `originLng`: Passenger origin coordinates
  - `destLat`, `destLng`: Passenger destination coordinates
  - `date`: Commute date (`YYYY-MM-DD`)
  - `seats`: Number of seats requested (default: 1)
  - `womenOnlyDriver`: Boolean filter
- **Responses**: `200 OK` (Array of rides annotated with `matchScore` and `breakdown`)

### `POST /api/rides`
Posts a new student driver commute offer.
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "origin": { "address": "Premnagar Chowk Market", "lat": 30.3340, "lng": 77.9620 },
    "destination": { "address": "Campus Gate 1 (Premnagar Road)", "lat": 30.3415, "lng": 77.9440 },
    "departureTime": "2026-09-22T08:30:00.000Z",
    "totalSeats": 3,
    "costPerSeat": 25,
    "notes": "Leaving promptly at 8:30 AM"
  }
  ```
- **Responses**: `201 Created`, `400 Bad Request`

### `GET /api/rides/:id`
Retrieves full details and route path for a specific ride offer.
- **Auth**: Bearer Token
- **Responses**: `200 OK`, `404 Not Found`

### `PATCH /api/rides/:id/cancel`
Cancels a ride offer. Only allowed by the ride creator.
- **Auth**: Bearer Token (Driver only)
- **Responses**: `200 OK`, `403 Forbidden`

---

## 3. Seat Requests & Booking (`/api/requests`)

### `POST /api/rides/:id/request`
Passenger requests a seat on an active ride offer.
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "pickupLocation": { "address": "Suddhowala Chowk", "lat": 30.3475, "lng": 77.9320 },
    "dropoffLocation": { "address": "UIT Building Portico", "lat": 30.3432, "lng": 77.9448 },
    "seatsRequested": 1
  }
  ```
- **Responses**: `201 Created`, `400 Bad Request`, `409 Duplicate Request`

### `PATCH /api/requests/:reqId/accept`
Driver accepts a seat request. Atomically reserves seat and creates a `Trip`.
- **Auth**: Bearer Token (Driver only)
- **Responses**: `200 OK`, `400 Full Capacity`, `403 Forbidden`

### `PATCH /api/requests/:reqId/reject`
Driver rejects a seat request.
- **Auth**: Bearer Token (Driver only)
- **Responses**: `200 OK`, `403 Forbidden`

---

## 4. Live Trip Tracking & Verification (`/api/trips`)

### `GET /api/trips/:tripId`
Retrieves live trip status, cryptographic OTP state, and route geometry.
- **Auth**: Bearer Token (Trip driver or passenger)
- **Responses**: `200 OK`, `403 Forbidden`

### `POST /api/trips/:tripId/start`
Driver starts the trip. Generates 6-digit CSPRNG OTP given to driver.
- **Auth**: Bearer Token (Driver only)
- **Responses**: `200 OK`, `403 Forbidden`

### `POST /api/trips/:tripId/verify-otp`
Passenger inputs driver's OTP or scans QR code to verify secure pickup.
- **Auth**: Bearer Token (Passenger or Driver)
- **Body**:
  ```json
  { "otp": "482910" }
  ```
- **Responses**: `200 OK`, `400 Invalid OTP / Locked`, `403 Forbidden`

### `POST /api/trips/:tripId/complete`
Marks the trip completed upon safe arrival at campus.
- **Auth**: Bearer Token (Driver only)
- **Responses**: `200 OK`, `403 Forbidden`

---

## 5. Peer Chat & Messaging (`/api/conversations`)

### `GET /api/conversations`
Lists all active chat threads where user is a participant.
- **Auth**: Bearer Token
- **Responses**: `200 OK`

### `GET /api/conversations/:id/messages`
Retrieves chat history for a specific conversation.
- **Auth**: Bearer Token (Participant only)
- **Responses**: `200 OK`, `403 Forbidden`

### `POST /api/conversations/:id/messages`
Sends a message into the conversation and emits real-time Socket.IO event.
- **Auth**: Bearer Token (Participant only)
- **Body**:
  ```json
  { "content": "I am standing near the Gate 1 security booth." }
  ```
- **Responses**: `201 Created`, `403 Forbidden`

---

## 6. Emergency & Security Operations (`/api/emergency`)

### `POST /api/emergency/sos`
Triggers an emergency incident, notifies campus security, and sends SMS to ICE contacts.
- **Auth**: Bearer Token
- **Rate Limit**: 10 requests / 10 minutes
- **Body**:
  ```json
  {
    "tripId": "650c1f2e9b1d8a001c8e4567",
    "location": { "lat": 28.7495, "lng": 77.1165 },
    "reason": "Route deviation alert"
  }
  ```
- **Responses**: `201 Created`

### `GET /api/emergency/active`
Lists active safety incidents for campus security monitors.
- **Auth**: Bearer Token (`moderator` or `campus_admin` only)
- **Responses**: `200 OK`, `403 Forbidden`

---

## 7. System Health & Readiness

### `GET /api/health`
Returns process liveness.
- **Auth**: Public
- **Response**: `200 OK` (`{ status: "ok", service: "CampusRide API" }`)

### `GET /api/ready`
Verifies database connectivity and ready state.
- **Auth**: Public
- **Response**: `200 OK` (`{ status: "ready", database: "connected" }`), `503 Service Unavailable`

