/**
 * Location sanitization utility to ensure all routes, stations, and hubs
 * strictly reflect the localized Dehradun, Premnagar, Selaqui, and Uttarakhand university corridors.
 */

const REPLACEMENTS: [RegExp, string][] = [
  // City Metro Station variations
  [/City Metro Station\s*\(Blue Line\)/gi, 'Premnagar Chowk Market'],
  [/City Metro Station/gi, 'Premnagar Chowk Market'],
  [/City Metro/gi, 'Premnagar Chowk'],
  [/Metro Gate\s*\d+/gi, 'Premnagar Chowk Bus Bay'],
  [/Metro Transit Interchange/gi, 'Premnagar Chowk Transit Bay'],
  [/Metro Interchange/gi, 'Premnagar Transit Junction'],
  [/Metro Ring/gi, 'Premnagar Transit Hub'],
  [/\bMetro\b/gi, 'Chowk Transit Bay'],

  // Delhi localities & Tech parks
  [/North Campus Hostel Complex/gi, 'Suddhowala Student Hostel Corridor'],
  [/Cyber City Tech Park/gi, 'Selaqui Pharma & Industrial Hub'],
  [/Cyber City/gi, 'Selaqui Industrial Hub'],
  [/Central Railway Station/gi, 'Dehradun Railway Station'],
  [/IIT Delhi Main Gate\s*\(Hauz Khas\)/gi, 'Clock Tower (Ghanta Ghar / Paltan Bazaar)'],
  [/IIT Hauz Khas/gi, 'Clock Tower (Ghanta Ghar)'],
  [/IIT Delhi/gi, 'Graphic Era University Bell Road Gate'],
  [/Connaught Place Inner Circle/gi, 'Clock Tower (Ghanta Ghar / Paltan Bazaar)'],
  [/Connaught Place Central/gi, 'Clock Tower (Ghanta Ghar / Paltan Bazaar)'],
  [/Connaught Place/gi, 'Clock Tower (Ghanta Ghar)'],
  [/Indira Gandhi Technical Campus Gate/gi, 'Ballupur Chowk (Chakrata Road)'],
  [/Pitampura Metro Interchange/gi, 'Ballupur Chowk (Chakrata Road)'],
  [/Pitampura Metro/gi, 'Ballupur Chowk'],
  [/Pitampura/gi, 'Ballupur Chowk'],
  [/Airport Terminal 1/gi, 'Vikasnagar Bus Terminal'],
  [/Rohini Sector 14\s*\(Near Metro\)/gi, 'Premnagar Chowk Market'],
  [/Rohini Sector 14/gi, 'Premnagar Chowk Market'],
  [/Rohini Sector 15/gi, 'Suddhowala Chowk (Student PG Hub)'],
  [/Rohini Sec 14/gi, 'Premnagar Chowk'],
  [/Rohini/gi, 'Premnagar'],
  [/Janakpuri West District Centre/gi, 'Suddhowala Chowk (Student PG Hub)'],
  [/Janakpuri/gi, 'Suddhowala'],
  [/Dwarka Sector 10 Metro/gi, 'ISBT Dehradun Inter-State Terminal'],
  [/Dwarka Sector 10/gi, 'ISBT Dehradun Inter-State Terminal'],
  [/NSUT\s*\/\s*Dwarka/gi, 'Selaqui / Suddhowala'],
  [/Dwarka/gi, 'ISBT Dehradun'],
  [/Civil Lines Heritage Lane/gi, 'Ballupur Chowk (Chakrata Road)'],
  [/North Campus Faculty of Science/gi, 'UIT Engineering Portico'],

  // Delhi Universities & Acronyms
  [/Delhi Technological University\s*\(DTU\)/gi, 'Uttaranchal University (UU)'],
  [/Delhi Technological University/gi, 'Uttaranchal University'],
  [/Delhi University North Campus\s*\(Hansraj \/ SRCC \/ KMC\)/gi, 'Graphic Era University & UPES Hub'],
  [/Delhi University North Campus\s*\(Hansraj College\)/gi, 'Graphic Era Hill University'],
  [/Delhi University North Campus/gi, 'Graphic Era University Campus'],
  [/DU North Campus/gi, 'Graphic Era / UPES Hub'],
  [/DU North/gi, 'Graphic Era'],
  [/Delhi University/gi, 'Graphic Era University'],
  [/DTU Main Campus Gate 1/gi, 'Campus Gate 1 (Uttaranchal University Main Entrance)'],
  [/DTU Main Campus/gi, 'Uttaranchal University Main Campus'],
  [/DTU Gate 1/gi, 'UU Gate 1 (Premnagar Road)'],
  [/DTU Mech Portico/gi, 'UIT Engineering Portico'],
  [/DTU Campus Portico/gi, 'UIT Campus Portico'],
  [/DTU Campus/gi, 'Uttaranchal University Campus'],
  [/\bDTU\b/g, 'Uttaranchal University'],
  [/Indira Gandhi Delhi Technical University for Women/gi, 'Graphic Era Hill University'],
  [/Indira Gandhi Delhi Technical University\s*\(IGDTUW\)/gi, 'Graphic Era University (GEU)'],
  [/Indira Gandhi Delhi Tech University\s*\(IGDTUW\)/gi, 'Graphic Era University (GEU)'],
  [/IGDTUW \/ DTU Transit Corridor/gi, 'Uttaranchal University / UIT Transit Corridor'],
  [/IGDTUW & DTU Hub/gi, 'Uttaranchal University & UIT Hub'],
  [/\bIGDTUW\b/g, 'Graphic Era University'],
  [/Netaji Subhas University of Technology\s*\(NSUT\)/gi, 'UPES (University of Petroleum and Energy Studies)'],
  [/NSUT Main Administration Block/gi, 'UPES Main Administration Block'],
  [/\bNSUT\b/g, 'UPES'],

  // Regional Regional Labels
  [/Delhi-NCR/gi, 'Dehradun & Premnagar'],
  [/Delhi NCR/gi, 'Dehradun & Premnagar'],
  [/across Delhi/gi, 'across Dehradun & Premnagar'],
  [/West Delhi/gi, 'Premnagar and Selaqui'],
  [/North Delhi/gi, 'Premnagar Dehradun'],
  [/South Delhi/gi, 'Dehradun City'],
  [/\bDelhi\b/gi, 'Dehradun'],
  [/Bawana Road/gi, 'Premnagar Road'],
  [/Shahbad Daulatpur/gi, 'Premnagar'],
  [/Hauz Khas/gi, 'Clement Town'],
  [/Kashmere Gate/gi, 'Ballupur Chowk'],
];

export function sanitizeLocationText(text: string | undefined | null): string {
  if (!text) return text || '';
  let cleaned = String(text);
  for (const [pattern, replacement] of REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned;
}

export function sanitizeLocation(loc: any): any {
  if (!loc) return loc;
  if (typeof loc === 'string') return sanitizeLocationText(loc);
  if (typeof loc === 'object') {
    return {
      ...loc,
      text: sanitizeLocationText(loc.text || loc.address || loc.name),
      address: loc.address ? sanitizeLocationText(loc.address) : loc.address,
      name: loc.name ? sanitizeLocationText(loc.name) : loc.name,
    };
  }
  return loc;
}

export function sanitizeRide(ride: any): any {
  if (!ride || typeof ride !== 'object') return ride;
  const copy = { ...ride };
  if (copy.origin) copy.origin = sanitizeLocation(copy.origin);
  if (copy.destination) copy.destination = sanitizeLocation(copy.destination);
  if (Array.isArray(copy.waypoints)) {
    copy.waypoints = copy.waypoints.map(sanitizeLocation);
  }
  if (copy.creator && typeof copy.creator === 'object') {
    copy.creator = {
      ...copy.creator,
      college: sanitizeLocationText(copy.creator.college),
    };
  }
  return copy;
}

export function sanitizeRequest(req: any): any {
  if (!req || typeof req !== 'object') return req;
  const copy = { ...req };
  if (copy.pickupLocation) copy.pickupLocation = sanitizeLocation(copy.pickupLocation);
  if (copy.dropoffLocation) copy.dropoffLocation = sanitizeLocation(copy.dropoffLocation);
  if (copy.rideId && typeof copy.rideId === 'object') {
    copy.rideId = sanitizeRide(copy.rideId);
  }
  return copy;
}

export function sanitizeTrip(trip: any): any {
  if (!trip || typeof trip !== 'object') return trip;
  const copy = { ...trip };
  if (copy.origin) copy.origin = sanitizeLocation(copy.origin);
  if (copy.destination) copy.destination = sanitizeLocation(copy.destination);
  if (copy.pickupLocation) copy.pickupLocation = sanitizeLocation(copy.pickupLocation);
  if (copy.rideId && typeof copy.rideId === 'object') {
    copy.rideId = sanitizeRide(copy.rideId);
  }
  return copy;
}
