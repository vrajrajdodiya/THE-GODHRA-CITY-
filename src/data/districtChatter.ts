export interface DistrictData {
  id: string;
  name: string;
  gujaratiName: string;
  ambientSoundTitle: string;
  soundType: string;
  center: [number, number]; // x, z
  radius: number;
  chatterLines: string[];
}

export const DISTRICTS: DistrictData[] = [
  {
    id: 'market',
    name: 'Main Bazaar',
    gujaratiName: 'મુખ્ય બજાર',
    ambientSoundTitle: 'Bustling Market Murmur & Vendor Calls',
    soundType: 'market',
    center: [45, -30],
    radius: 35,
    chatterLines: [
      'Aavo bapa aavo! Taaza cotton sarees and Gujarati bandhani!',
      'Bolo seth, 50 rupya kilo pure groundnut oil!',
      'Bhav ma thodu adjust karo ne, regular customer chu!',
      'Finest cumin and coriander seeds direct from Unjha!',
      'Shree Krishna Textiles has fresh seasonal stock today.',
      'Check the quality yourself, purest spices in Godhra!',
    ],
  },
  {
    id: 'college',
    name: 'Godhra Arts & Commerce College',
    gujaratiName: 'કોલેજ કેમ્પસ',
    ambientSoundTitle: 'Campus Chatter, Laughter & Lecture Bell',
    soundType: 'college',
    center: [60, -70],
    radius: 36,
    chatterLines: [
      'Did you finish the financial accounting assignment for Prof Patel?',
      'Inter-college cricket tournament starts this Thursday at the campus ground!',
      'Let’s grab cutting chai near the gate before next lecture.',
      'Exam schedule is out on the notice board, 5 subjects in 10 days!',
      'Hemang used to top the business commerce class here.',
      'Library has new management books in the reading room.',
    ],
  },
  {
    id: 'food',
    name: 'Food Street (Khavdra Gali)',
    gujaratiName: 'ખાઉધરા ગલી (નાસ્તા બજાર)',
    ambientSoundTitle: 'Sizzling Wok Oil & Bubbling Tea Samovar',
    soundType: 'food',
    center: [35, 35],
    radius: 30,
    chatterLines: [
      'Garam garam Fafda ane Jalebi nikli gaya che!',
      'Ek plate Sev Khamani with extra sev ane fried green chillies!',
      'Adrak wali cutting chai kadak banavjo bhai!',
      'Ambika stall makes the softest Nylon Khaman in all of Panchmahal.',
      'Butter Pav Bhaji smelling irresistible from across the street!',
      'Eat fresh, eat warm! Gujarati breakfast at its best.',
    ],
  },
  {
    id: 'garage',
    name: 'JD Auto Garage',
    gujaratiName: 'જેડી ઓટો ગેરેજ',
    ambientSoundTitle: 'Pneumatic Tools, Ratchets & Engine Tuning',
    soundType: 'garage',
    center: [-60, 35],
    radius: 30,
    chatterLines: [
      'JD bhai, this 350 cruiser has a slight tappet sound.',
      'Pass me the 14mm ring spanner from the workbench.',
      'Clean the carburetor jets with compressed air.',
      'Tire pressure checked and disc brake pads tightened.',
      'JD can diagnose an engine fault just by listening to the idle rumble!',
      'High-performance engine oil filled, she is ready to race.',
    ],
  },
  {
    id: 'park',
    name: 'Shanti Baug (City Park)',
    gujaratiName: 'શાંતિ બાગ',
    ambientSoundTitle: 'Fountain Water & Singing Songbirds',
    soundType: 'park',
    center: [-40, -10],
    radius: 28,
    chatterLines: [
      'The morning breeze under these banyan trees is so calming.',
      'Look at the green parrots near the top branches.',
      'Elderly uncles discussing politics around the garden fountain.',
      'Fresh air is the best cure for city stress.',
      'Hemang and Vraj used to sit on this bench planning their dreams.',
    ],
  },
  {
    id: 'center',
    name: 'Clock Tower Roundabout (Tower Chowk)',
    gujaratiName: 'ટાવર ચોક',
    ambientSoundTitle: 'Historic Clock Chimes & Roundabout Traffic',
    soundType: 'center',
    center: [0, 0],
    radius: 35,
    chatterLines: [
      'Tower clock has kept accurate time for more than fifty years.',
      'Watch out for the state transport bus turning into the roundabout!',
      'Meet me at the tricolor flag monument near the fountain.',
      'Central traffic hub connects all four corners of Godhra.',
    ],
  },
  {
    id: 'highway',
    name: 'Godhra Express Highway',
    gujaratiName: 'હાઇવે',
    ambientSoundTitle: 'High-Speed Vehicle Whoosh & Road Wind',
    soundType: 'highway',
    center: [0, 95],
    radius: 40,
    chatterLines: [
      'Express corridor opens up towards Vadodara and Ahmedabad.',
      'Trucks hauling goods from Dahod and Indore pass through day and night.',
      'Maintain steady lane discipline, speed limit 80 km/h.',
    ],
  },
  {
    id: 'home',
    name: "Friends' Home & Porch",
    gujaratiName: 'મિત્રોનું ઘર',
    ambientSoundTitle: 'Cozy Residential Acoustic & Gentle Neighborhood Tone',
    soundType: 'home',
    center: [-55, -45],
    radius: 25,
    chatterLines: [
      'Hemang: Every rupee earned takes us closer to our enterprise.',
      'Vraj: The road is calling! Let’s tune the wheels and explore.',
      'JD: Hot tea is boiling on the stove, drink before you head out.',
    ],
  },
];
