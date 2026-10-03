// Central CSV Dataset Engine for CampusRide
// Loads and parses datasets from CSV files: uttarakhand_universities.csv, rides.csv, users.csv, pickup_hubs.csv

export interface UniversityCSVRecord {
  location: string;
  name: string;
  established: string;
  specialization: string;
}

export interface RideCSVRecord {
  id: string;
  driverName: string;
  driverCollege: string;
  origin: string;
  destination: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  departureTime: string;
  fare: number;
  availableSeats: number;
  totalSeats: number;
  genderPref: 'all' | 'women_only';
  status: 'active' | 'full' | 'departing';
  vehicleModel: string;
  co2SavedKg: number;
}

export interface UserCSVRecord {
  id: string;
  name: string;
  email: string;
  role: 'driver' | 'passenger' | 'admin';
  college: string;
  department: string;
  batch: string;
  rating: number;
  totalRides: number;
  punctualityRate: number;
  verifiedEdu: boolean;
  vehicleModel?: string;
  vehicleNumber?: string;
  vehicleSeats?: number;
}

export interface HubCSVRecord {
  id: string;
  name: string;
  code: string;
  category: string;
  institution: string;
  lat: number;
  lng: number;
  features: string;
  safetyRating: number;
}

export const RAW_UNIVERSITIES_CSV = "Location,University name,Established,Specialization\n\"Srinagar, Uttarakhand\",H.N.B. Garhwal University,1973,General\nDehradun,Doon University,2005,General\nPantnagar,G.B. Pant University of Agriculture and Technology,1960,Agriculture and technology\nDehradun,H.N.B. Uttarakhand Medical Education University,2014,Medicine\nNainital & Bhimtal,Kumaun University (2 campuses),1973,General\n\"Almora, Bageshwar & Pithoragarh\",Soban Singh Jeena University,2020,General\nBadhshahithaul (Tehri),Sri Dev Suman Uttarakhand University,2012,General\nAlmora,Uttarakhand Aawasiya Vishwavidyalaya,2016,General\nDehradun,Uttarakhand Ayurveda University,2009,Ayurveda\nHaldwani,Uttarakhand Open University,2005,Distance learning\nHaridwar,Uttarakhand Sanskrit University,2005,Sanskrit\nHaldwani,Uttarakhand State Sports University,2025,Sports\nDehradun,Veer Madho Singh Bhandari Uttarakhand Technical University,2008,Technology\nBharsar (Pauri) and Ranichauri (Tehri),Veer Chandra Singh Garhwali Uttarakhand University of Horticulture and Forestry (2 campuses),2011,Horticulture and forestry\nDehradun,Forest Research Institute,1906,Forestry research\nHaridwar,Gurukula Kangri Vishwavidyalaya^,1902,\"Ancient Vedic, technology and management\"\nDehradun,Graphic Era University,1993,\"Engineering, Management, Humanities & Social Sciences, Commerce and Computer Applications\"\nHaldwani,Amrapali University,2024\nKotdwar,Bhagwant Global University,2016,Technology and management\nRoorkee,College of Engineering Roorkee,1998,Engineering\nDehradun,DBS Global University,2007\nDehradun,Dev Bhoomi Uttarakhand University,2005\nHaridwar,Dev Sanskriti Vishwavidyalaya,2002,\"Yoga, psychology, animation, and computer science\"\nDehradun,DIT University,2013,Technology and management\n\"Uregi, Pauri Garhwal\",Ethics University,2025\n\"Haldwani, Bhimtal & Dehradun\",Graphic Era Hill University (3 campuses),2011,Technology and management\nRoorkee,Haridwar University (formerly Roorkee College Of Engineering),2010\nDehradun,IMS Unison University,2013,\"Law, technology and management\"\nDehradun,Jigyasa University (formerly Himgiri Zee University),2003,\"Communication, technology and management\"\nPauri Garhwal district,Maharaja Agrasen Himalayan Garhwal University,2016\nDehradun,Maya Devi University,2010\nBhimtal,Mind Power University,2024\nRoorkee,Motherhood University (2 campuses),2015,\"Law, Pharmacy, Paramedical and Management\"\nRoorkee,Phonics University,2009\nRoorkee,Quantum University,2017,\"IR 4.0 Technologies, Management and Interdisciplinary Programs, Law and Arts\"\nDehradun,Ras Bihari Bose Subharti University,2016\nDehradun,Sardar Bhagwan Singh University,2018\nHaridwar,Shree Om University,2007\nDehradun,Shri Guru Ram Rai University,2017,\"Technology, Management and others\"\nUttarkashi,Smt. Manjira Devi University,2024\nDehradun,Sparsh Himalaya University,2019\nKichha,Surajmal University,2021\nDehradun,Swami Rama Himalayan University,1989,Medicine and technology\nDehradun,\"The ICFAI University, Dehradun\",2003,\"Law, Technology, Management, Education\"\nDehradun,The University of North West Himalayas,2005\nHaridwar,University of Patanjali,2006,Yoga\nDehradun,University of Petroleum and Energy Studies,2003,\"Computer Science, Petroleum and energy\"\nDehradun,Uttaranchal University,2013,\"Law, technology and management\"\n";
export const RAW_RIDES_CSV = "id,driverName,driverCollege,origin,destination,originLat,originLng,destLat,destLng,departureTime,fare,availableSeats,totalSeats,genderPref,status,vehicleModel,co2SavedKg\nride-ddn-101,Aditya Kumar,Uttaranchal University,Premnagar Chowk Market,UIT Building (Uttaranchal Institute of Technology),30.3340,77.9620,30.3400,77.9515,08:15 AM,30,3,4,all,active,Honda City i-VTEC,2.8\nride-ddn-102,Ananya Verma,Graphic Era University,Suddhowala Chowk (Student PG Hub),USCS Building (School of Computing Sciences),30.3475,77.9320,30.3395,77.9518,08:30 AM,25,2,3,women_only,active,Hyundai Venue SX,1.9\nride-ddn-103,Siddharth Nair,UPES,Ballupur Chowk (City Entrance),BBA Building (Uttaranchal Institute of Management),30.3395,78.0125,30.3392,77.9520,08:20 AM,45,3,4,all,active,Maruti Baleno Alpha,3.4\nride-ddn-104,Aditya Kumar,Uttaranchal University,ISBT Dehradun (Inter-State Bus Terminal),Central Academic Library & Law Block,30.2885,78.0080,30.3396,77.9517,07:45 AM,60,2,4,all,active,Honda City i-VTEC,5.1\nride-ddn-105,Ananya Verma,Graphic Era University,Clock Tower (Ghanta Ghar / Paltan Bazaar),\"Campus Gate 1 (Uttaranchal University Main Entrance)\",30.3256,78.0437,30.3400,77.9515,08:00 AM,50,2,3,all,active,Hyundai Venue SX,4.2\nride-ddn-106,Siddharth Nair,UPES,Selaqui Industrial & Institutional Hub,UIT Building (Uttaranchal Institute of Technology),30.3685,77.8540,30.3400,77.9515,08:40 AM,40,4,4,all,active,Maruti Baleno Alpha,3.9\nride-ddn-107,Aditya Kumar,Uttaranchal University,Vikasnagar Bus Terminal,\"Campus Gate 1 (Uttaranchal University Main Entrance)\",30.4350,77.7710,30.3400,77.9515,07:30 AM,75,3,4,all,active,Honda City i-VTEC,6.8\n";
export const RAW_USERS_CSV = "id,name,email,role,college,department,batch,rating,totalRides,punctualityRate,verifiedEdu,vehicleModel,vehicleNumber,vehicleSeats\nusr_aditya_1,Aditya Kumar,aditya@dtu.ac.in,driver,Uttaranchal University,B.Tech Mechanical Engineering,Class of 2025,4.8,48,98,true,Honda City i-VTEC,UK 07 AK 4920,4\nusr_rahul_1,Rahul Sharma,rahul.s@uudn.ac.in,passenger,Uttaranchal University,B.Tech CSE,Class of 2026,4.9,32,99,true,,,0\nusr_priya_1,Priya Sharma,priya.s@uudn.ac.in,passenger,Uttaranchal University,MBA Marketing,Class of 2025,5.0,19,100,true,,,0\nusr_ananya_2,Ananya Verma,ananya@geu.ac.in,driver,Graphic Era University,B.Tech Computer Science & AI,Class of 2024,4.9,62,99,true,Hyundai Venue SX,UK 07 BV 1042,3\nusr_siddharth_3,Siddharth Nair,siddharth@upes.ac.in,driver,University of Petroleum and Energy Studies,B.Tech Energy Engineering,Class of 2024,4.7,39,95,true,Maruti Baleno Alpha,UK 07 CA 8821,4\nusr_admin_1,Operations Admin,admin@campusride.internal,admin,CampusRide System Administration,Mobility & Safety Center,Staff,5.0,1240,100,true,,,0\n";
export const RAW_HUBS_CSV = "id,name,code,category,institution,lat,lng,features,safetyRating\nhub-uit,UIT Building (Uttaranchal Institute of Technology),UIT-BLDG,Campus Buildings,Uttaranchal University,30.3400,77.9515,EV Charging; 24/7 CCTV; Covered Passenger Waiting Shelter,4.9\nhub-uscs,USCS Building (School of Computing Sciences),USCS-BLDG,Campus Buildings,Uttaranchal University,30.3395,77.9518,Covered Shelter; Student Safety Help Point; High Lighting,4.8\nhub-bba,BBA Building (Uttaranchal Institute of Management),BBA-UIM,Campus Buildings,Uttaranchal University,30.3392,77.9520,Carpool Pickup Circle; Campus Security Desk; Shuttle Connection,4.9\nhub-lib,Central Academic Library & Law Block (LCD),LIB-LAW,Campus Buildings,Uttaranchal University,30.3396,77.9517,Knowledge Square Waiting Area; Pedestrian Zone; Guard Booth,4.8\nhub-gate1,\"Campus Gate 1 (Uttaranchal University Main Entrance)\",CAMPUS-G1,Campus Buildings,Uttaranchal University,30.3400,77.9515,Main Checkpost; Boom Barrier; Verified Student Lane; 24/7 CCTV,5.0\nhub-prem,Premnagar Chowk Market,DDN-PREM,Dehradun & Surrounding,Dehradun Regional,30.3340,77.9620,Bus Stand; Auto Stand; Commercial Bazaar; Street Lighting,4.6\nhub-suddh,Suddhowala Chowk (Student PG Hub),DDN-SUDDH,Dehradun & Surrounding,Dehradun Regional,30.3475,77.9320,High Student Density; Food Outlets; Verified Safe Zone,4.7\nhub-selaq,Selaqui Industrial & Institutional Hub,DDN-SELAQ,Dehradun & Surrounding,Dehradun Regional,30.3685,77.8540,Institutional Corridor; Pharma Hub; Highway Access,4.5\nhub-vikas,Vikasnagar Bus Terminal,DDN-VIKAS,Dehradun & Surrounding,Dehradun Regional,30.4350,77.7710,Regional Transit Terminal; Inter-City Buses; Well-Lit Waiting Hall,4.4\nhub-isbt,ISBT Dehradun (Inter-State Bus Terminal),DDN-ISBT,Dehradun & Surrounding,Dehradun Regional,30.2885,78.0080,Interstate Transport Hub; Police Booth; Prepaid Booth,4.8\nhub-ballu,Ballupur Chowk (City Entrance),DDN-BALLU,Dehradun & Surrounding,Dehradun Regional,30.3395,78.0125,Major Flyover Junction; Chakrata Road Corridor,4.6\nhub-clock,Clock Tower (Ghanta Ghar / Paltan Bazaar),DDN-CLOCK,Dehradun & Surrounding,Dehradun Regional,30.3256,78.0437,Historic City Center; Central Police Post; Paltan Bazaar Entrance,4.7\n";

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentLine.trim().length > 0) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  const parseRow = (rowStr: string): string[] => {
    const fields: string[] = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      const nc = rowStr[i + 1];
      if (c === '"') {
        if (inQ && nc === '"') {
          field += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (c === ',' && !inQ) {
        fields.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    fields.push(field.trim());
    return fields;
  };

  const headers = parseRow(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] || '';
    });
    records.push(record);
  }

  return records;
}

export const UTTARAKHAND_UNIVERSITIES: UniversityCSVRecord[] = parseCSV(RAW_UNIVERSITIES_CSV).map(r => ({
  location: r['Location'] || '',
  name: r['University name'] || '',
  established: r['Established'] || '',
  specialization: r['Specialization'] || 'General'
}));

export const CSV_RIDES: RideCSVRecord[] = parseCSV(RAW_RIDES_CSV).map(r => ({
  id: r['id'],
  driverName: r['driverName'],
  driverCollege: r['driverCollege'],
  origin: r['origin'],
  destination: r['destination'],
  originLat: parseFloat(r['originLat'] || '30.34'),
  originLng: parseFloat(r['originLng'] || '77.94'),
  destLat: parseFloat(r['destLat'] || '30.34'),
  destLng: parseFloat(r['destLng'] || '77.94'),
  departureTime: r['departureTime'],
  fare: parseFloat(r['fare'] || '20'),
  availableSeats: parseInt(r['availableSeats'] || '1', 10),
  totalSeats: parseInt(r['totalSeats'] || '4', 10),
  genderPref: (r['genderPref'] as any) || 'all',
  status: (r['status'] as any) || 'active',
  vehicleModel: r['vehicleModel'] || 'Honda City',
  co2SavedKg: parseFloat(r['co2SavedKg'] || '2.0')
}));

export const CSV_USERS: UserCSVRecord[] = parseCSV(RAW_USERS_CSV).map(r => ({
  id: r['id'],
  name: r['name'],
  email: r['email'],
  role: (r['role'] as any) || 'passenger',
  college: r['college'],
  department: r['department'],
  batch: r['batch'],
  rating: parseFloat(r['rating'] || '5.0'),
  totalRides: parseInt(r['totalRides'] || '0', 10),
  punctualityRate: parseInt(r['punctualityRate'] || '100', 10),
  verifiedEdu: r['verifiedEdu'] === 'true',
  vehicleModel: r['vehicleModel'] || undefined,
  vehicleNumber: r['vehicleNumber'] || undefined,
  vehicleSeats: r['vehicleSeats'] ? parseInt(r['vehicleSeats'], 10) : undefined
}));

export const CSV_HUBS: HubCSVRecord[] = parseCSV(RAW_HUBS_CSV).map(r => ({
  id: r['id'],
  name: r['name'],
  code: r['code'],
  category: r['category'],
  institution: r['institution'],
  lat: parseFloat(r['lat'] || '30.34'),
  lng: parseFloat(r['lng'] || '77.94'),
  features: r['features'],
  safetyRating: parseFloat(r['safetyRating'] || '4.8')
}));
