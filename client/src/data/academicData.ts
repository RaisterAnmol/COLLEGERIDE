export interface AcademicOption {
  label: string;
  subtext?: string;
  category?: string;
  aliases?: string[];
}

export const POPULAR_COLLEGES: AcademicOption[] = [
  // Dehradun & Uttarakhand
  {
    label: "Uttaranchal University",
    subtext: "Premnagar, Dehradun",
    category: "Dehradun Campuses",
    aliases: ["UU", "UIT", "UIM", "USCS", "LCD", "Uttaranchal"],
  },
  {
    label: "Graphic Era University",
    subtext: "Clement Town, Dehradun",
    category: "Dehradun Campuses",
    aliases: ["GEU", "Graphic Era"],
  },
  {
    label: "Graphic Era Hill University",
    subtext: "Dehradun, Bhimtal & Haldwani",
    category: "Dehradun Campuses",
    aliases: ["GEHU", "Graphic Hill"],
  },
  {
    label: "University of Petroleum and Energy Studies (UPES)",
    subtext: "Bidholi & Kandoli, Dehradun",
    category: "Dehradun Campuses",
    aliases: ["UPES", "Petroleum"],
  },
  {
    label: "DIT University",
    subtext: "Mussoorie Diversion Road, Dehradun",
    category: "Dehradun Campuses",
    aliases: ["DIT", "Dehradun Institute of Technology"],
  },
  {
    label: "Doon University",
    subtext: "Kedarpur, Dehradun",
    category: "Dehradun Campuses",
    aliases: ["Doon"],
  },
  {
    label: "IMS Unison University",
    subtext: "Makkawala Greens, Dehradun",
    category: "Dehradun Campuses",
    aliases: ["IMS", "IUU"],
  },
  {
    label: "Dev Bhoomi Uttarakhand University",
    subtext: "Navgaon, Manduwala, Dehradun",
    category: "Dehradun Campuses",
    aliases: ["DBUU", "Dev Bhoomi"],
  },
  {
    label: "Swami Rama Himalayan University",
    subtext: "Jolly Grant, Dehradun",
    category: "Dehradun Campuses",
    aliases: ["SRHU", "Himalayan Hospital"],
  },
  {
    label: "HNB Garhwal University",
    subtext: "Srinagar & Tehri Garhwal",
    category: "Uttarakhand Central Universities",
    aliases: ["HNBGU", "Garhwal University"],
  },
  {
    label: "IIT Roorkee",
    subtext: "Roorkee, Haridwar",
    category: "Premier Institutes",
    aliases: ["IITR", "Roorkee"],
  },
  {
    label: "Tula's Institute",
    subtext: "Dhoolkot, Dehradun",
    category: "Dehradun Colleges",
    aliases: ["Tulas"],
  },
  {
    label: "GRD World School & College",
    subtext: "Rajpur Road, Dehradun",
    category: "Dehradun Colleges",
    aliases: ["GRD"],
  },
  {
    label: "BFIT Group of Institutions",
    subtext: "Sudhowala, Dehradun",
    category: "Dehradun Colleges",
    aliases: ["BFIT"],
  },
  {
    label: "Dolphin PG Institute",
    subtext: "Manduwala, Dehradun",
    category: "Dehradun Colleges",
    aliases: ["Dolphin"],
  },
  // Delhi NCR & Premier Hubs
  {
    label: "Delhi Technological University (DTU)",
    subtext: "Shahbad Daulatpur, Bawana Road, Delhi",
    category: "Delhi NCR Campuses",
    aliases: ["DTU", "DCE", "Delhi College of Engineering"],
  },
  {
    label: "Netaji Subhas University of Technology (NSUT)",
    subtext: "Dwarka, New Delhi",
    category: "Delhi NCR Campuses",
    aliases: ["NSUT", "NSIT"],
  },
  {
    label: "IIT Delhi",
    subtext: "Hauz Khas, New Delhi",
    category: "Premier Institutes",
    aliases: ["IITD"],
  },
  {
    label: "Indira Gandhi Delhi Technical University for Women",
    subtext: "Kashmere Gate, Delhi",
    category: "Delhi NCR Campuses",
    aliases: ["IGDTUW"],
  },
  {
    label: "Jamia Millia Islamia",
    subtext: "Jamia Nagar, New Delhi",
    category: "Delhi Central Universities",
    aliases: ["JMI"],
  },
  {
    label: "Amity University Noida",
    subtext: "Sector 125, Noida, UP",
    category: "Delhi NCR Campuses",
    aliases: ["Amity"],
  },
  {
    label: "Shiv Nadar University",
    subtext: "Greater Noida, UP",
    category: "Delhi NCR Campuses",
    aliases: ["SNU"],
  },
  {
    label: "Bennett University",
    subtext: "Greater Noida, UP",
    category: "Delhi NCR Campuses",
    aliases: ["Bennett"],
  },
];

export const POPULAR_DEPARTMENTS: AcademicOption[] = [
  {
    label: "Computer Science & Engineering",
    subtext: "Software, Systems, AI, Networks",
    category: "Engineering & Technology",
    aliases: ["CSE", "CS", "Computer Science"],
  },
  {
    label: "Information Technology",
    subtext: "Enterprise Networks, Web Systems, Cloud",
    category: "Engineering & Technology",
    aliases: ["IT"],
  },
  {
    label: "Artificial Intelligence & Machine Learning",
    subtext: "Deep Learning, NLP, Data Science",
    category: "Engineering & Technology",
    aliases: ["AIML", "AI", "ML", "AI & ML"],
  },
  {
    label: "Data Science & Big Data Analytics",
    subtext: "Data Mining, Predictive Modeling, Big Data",
    category: "Engineering & Technology",
    aliases: ["DS", "Data Science"],
  },
  {
    label: "Cyber Security & Digital Forensics",
    subtext: "Ethical Hacking, Cryptography, SecOps",
    category: "Engineering & Technology",
    aliases: ["Cyber", "InfoSec"],
  },
  {
    label: "Electronics & Communication Engineering",
    subtext: "Embedded Systems, VLSI, Telecom, IoT",
    category: "Engineering & Technology",
    aliases: ["ECE", "Electronics"],
  },
  {
    label: "Mechanical Engineering",
    subtext: "Thermodynamics, Robotics, CAD/CAM, Automotive",
    category: "Engineering & Technology",
    aliases: ["ME", "Mech", "Mechanical"],
  },
  {
    label: "Civil Engineering",
    subtext: "Structural, Environmental, Geotech, Surveying",
    category: "Engineering & Technology",
    aliases: ["CE", "Civil"],
  },
  {
    label: "Electrical & Electronics Engineering",
    subtext: "Power Systems, Smart Grid, Controls",
    category: "Engineering & Technology",
    aliases: ["EEE", "Electrical"],
  },
  {
    label: "Aerospace & Aeronautical Engineering",
    subtext: "Aerodynamics, Avionics, Propulsion",
    category: "Engineering & Technology",
    aliases: ["Aerospace", "Aero"],
  },
  {
    label: "Petroleum & Chemical Engineering",
    subtext: "Upstream Exploration, Refining, Petrochemicals",
    category: "Engineering & Technology",
    aliases: ["Petroleum", "Chemical"],
  },
  {
    label: "School of Management & Business Studies",
    subtext: "Marketing, Finance, HR, Operations, Analytics",
    category: "Management & Commerce",
    aliases: ["Management", "MBA", "BBA", "Business School"],
  },
  {
    label: "Commerce & Financial Accounting",
    subtext: "Banking, Taxation, Fintech, Audit",
    category: "Management & Commerce",
    aliases: ["Commerce", "B.Com", "Finance"],
  },
  {
    label: "Law College & Legal Studies",
    subtext: "Constitutional, Corporate, Criminal, Cyber Law",
    category: "Law & Humanities",
    aliases: ["Law", "Legal Studies", "LCD"],
  },
  {
    label: "Applied Sciences & Biotechnology",
    subtext: "Genetics, Microbiology, Bio-informatics",
    category: "Science & Healthcare",
    aliases: ["Biotech", "Life Sciences"],
  },
  {
    label: "Pharmaceutical Sciences",
    subtext: "Pharmacology, Clinical Research, Pharmaceutics",
    category: "Science & Healthcare",
    aliases: ["Pharmacy", "B.Pharm", "D.Pharm"],
  },
  {
    label: "Design, Animation & Fine Arts",
    subtext: "UI/UX, Product Design, Graphic Design, Media",
    category: "Design & Media",
    aliases: ["Design", "UI/UX", "Animation", "Fine Arts"],
  },
  {
    label: "Mass Communication & Journalism",
    subtext: "Broadcasting, Digital Media, PR, Advertising",
    category: "Design & Media",
    aliases: ["Mass Comm", "Journalism", "Media"],
  },
  {
    label: "Hotel Management & Tourism",
    subtext: "Culinary Arts, Hospitality Administration, Travel",
    category: "Hospitality & Tourism",
    aliases: ["HM", "Hotel Management", "Hospitality"],
  },
  {
    label: "School of Agriculture & Forestry",
    subtext: "Agronomy, Horticulture, Soil Sciences",
    category: "Science & Healthcare",
    aliases: ["Agriculture", "Agri", "B.Sc Agri"],
  },
];

export const POPULAR_BRANCHES_COURSES: AcademicOption[] = [
  // Undergraduate Engineering & Tech
  {
    label: "B.Tech - Computer Science & Engineering",
    subtext: "4-Year Bachelor of Technology in CSE",
    category: "Bachelor of Technology",
    aliases: ["B.Tech CSE", "BTech CSE", "CSE", "Computer Science"],
  },
  {
    label: "B.Tech - CSE (AI & Machine Learning)",
    subtext: "Specialized in Artificial Intelligence",
    category: "Bachelor of Technology",
    aliases: ["B.Tech AIML", "CSE AIML"],
  },
  {
    label: "B.Tech - CSE (Data Science)",
    subtext: "Specialized in Big Data & Analytics",
    category: "Bachelor of Technology",
    aliases: ["B.Tech DS", "CSE Data Science"],
  },
  {
    label: "B.Tech - CSE (Cyber Security)",
    subtext: "Specialized in Cloud Security & Forensics",
    category: "Bachelor of Technology",
    aliases: ["B.Tech Cyber Security", "CSE Cyber"],
  },
  {
    label: "B.Tech - Information Technology",
    subtext: "4-Year B.Tech in IT",
    category: "Bachelor of Technology",
    aliases: ["B.Tech IT", "BTech IT"],
  },
  {
    label: "B.Tech - Mechanical Engineering",
    subtext: "4-Year B.Tech in Mechanical",
    category: "Bachelor of Technology",
    aliases: ["B.Tech ME", "BTech Mech"],
  },
  {
    label: "B.Tech - Civil Engineering",
    subtext: "4-Year B.Tech in Civil Infrastructure",
    category: "Bachelor of Technology",
    aliases: ["B.Tech CE", "BTech Civil"],
  },
  {
    label: "B.Tech - Electronics & Communication",
    subtext: "4-Year B.Tech in ECE & VLSI",
    category: "Bachelor of Technology",
    aliases: ["B.Tech ECE", "BTech ECE"],
  },
  {
    label: "B.Tech - Electrical Engineering",
    subtext: "4-Year B.Tech in EE / Power Systems",
    category: "Bachelor of Technology",
    aliases: ["B.Tech EE", "BTech Electrical"],
  },
  {
    label: "B.Tech - Petroleum Engineering",
    subtext: "4-Year B.Tech in Oil & Gas Reserves",
    category: "Bachelor of Technology",
    aliases: ["B.Tech Petroleum", "Petroleum"],
  },
  // Computer Applications
  {
    label: "BCA - Bachelor of Computer Applications",
    subtext: "3-Year Degree in Application Development",
    category: "Computer Applications",
    aliases: ["BCA"],
  },
  {
    label: "BCA (Data Analytics / Cloud Computing)",
    subtext: "Specialized Computer Applications",
    category: "Computer Applications",
    aliases: ["BCA Analytics", "BCA Cloud"],
  },
  {
    label: "MCA - Master of Computer Applications",
    subtext: "2-Year Postgraduate in Computing & Architecture",
    category: "Postgraduate Tech",
    aliases: ["MCA"],
  },
  // Business & Commerce
  {
    label: "BBA - Bachelor of Business Administration",
    subtext: "3-Year Undergraduate in Management",
    category: "Business Administration",
    aliases: ["BBA"],
  },
  {
    label: "BBA (Digital Marketing / Business Analytics)",
    subtext: "Modern Commerce & Analytics",
    category: "Business Administration",
    aliases: ["BBA Analytics", "BBA Digital Marketing"],
  },
  {
    label: "MBA - Master of Business Administration",
    subtext: "2-Year Master of Business Administration",
    category: "Postgraduate Management",
    aliases: ["MBA"],
  },
  {
    label: "B.Com (Hons) - Bachelor of Commerce",
    subtext: "3-Year Degree in Accountancy & Taxation",
    category: "Commerce",
    aliases: ["B.Com", "BCom Hons"],
  },
  {
    label: "M.Com - Master of Commerce",
    subtext: "2-Year Postgraduate in Financial Systems",
    category: "Commerce",
    aliases: ["M.Com", "MCom"],
  },
  // Law
  {
    label: "BA. LL.B (Hons) - Integrated Law",
    subtext: "5-Year Integrated Bachelor of Arts & Law",
    category: "Law",
    aliases: ["BA LLB", "BALLB"],
  },
  {
    label: "BBA. LL.B (Hons) - Corporate Law",
    subtext: "5-Year Integrated Business Administration & Law",
    category: "Law",
    aliases: ["BBA LLB", "BBALLB"],
  },
  {
    label: "LL.B - 3-Year Bachelor of Law",
    subtext: "Graduate entry law degree",
    category: "Law",
    aliases: ["LLB"],
  },
  {
    label: "LL.M - Master of Laws",
    subtext: "1-2 Year Post-Graduate Law Specialization",
    category: "Law",
    aliases: ["LLM"],
  },
  // Pharmacy & Medical
  {
    label: "B.Pharm - Bachelor of Pharmacy",
    subtext: "4-Year Degree in Pharmaceutical Sciences",
    category: "Pharmacy",
    aliases: ["B.Pharm", "BPharm"],
  },
  {
    label: "D.Pharm - Diploma in Pharmacy",
    subtext: "2-Year Diploma Program",
    category: "Pharmacy",
    aliases: ["D.Pharm", "DPharm"],
  },
  {
    label: "M.Pharm - Master of Pharmacy",
    subtext: "2-Year Postgraduate in Pharmaceutics",
    category: "Pharmacy",
    aliases: ["M.Pharm", "MPharm"],
  },
  // Sciences & Others
  {
    label: "B.Sc (Hons) - Agriculture",
    subtext: "4-Year Degree in Agronomy & Crop Sciences",
    category: "Agricultural Sciences",
    aliases: ["B.Sc Agriculture", "BSc Agri"],
  },
  {
    label: "B.Sc - Information Technology",
    subtext: "3-Year Degree in IT Systems",
    category: "Science",
    aliases: ["B.Sc IT", "BSc IT"],
  },
  {
    label: "B.Sc (Hons) - Biotechnology",
    subtext: "3-Year Degree in Biological Research",
    category: "Science",
    aliases: ["B.Sc Biotech", "BSc Biotech"],
  },
  {
    label: "BHM - Bachelor of Hotel Management",
    subtext: "4-Year Hospitality & Culinary Operations",
    category: "Hospitality",
    aliases: ["BHM", "Hotel Management"],
  },
  {
    label: "B.Des - Bachelor of Design",
    subtext: "4-Year UI/UX & Industrial Product Design",
    category: "Design",
    aliases: ["B.Des", "BDes", "Design"],
  },
];
