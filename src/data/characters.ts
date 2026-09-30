import { CharacterInfo } from '../types/game';

// Image assets generated for Godhra City Life
import hemangImg from '../assets/images/char_hemang_portrait_1790763265451.jpg';
import vrajImg from '../assets/images/char_vraj_portrait_1790763278296.jpg';
import jdImg from '../assets/images/char_jd_portrait_1790763289591.jpg';

export const CHARACTERS: Record<string, CharacterInfo> = {
  hemang: {
    id: 'hemang',
    name: 'Hemang',
    role: 'The Planner',
    tagline: 'Strategy, vision, and enterprise mindset.',
    personality: 'Smart, calm, responsible, and calculating.',
    specialAbility: 'Business & Planning',
    bonusDescription: '+10% cash bonus on all commercial and delivery earnings.',
    preferredVehicles: 'Cars, SUVs, and Sedan cruisers.',
    portrait: hemangImg,
    color: 'from-amber-500 to-yellow-600',
    accentHex: 0xf59e0b,
    outfit: {
      top: 'Formal Crisp Oxford Shirt',
      bottom: 'Tailored Beige Chinos',
      shoes: 'Leather Loafers',
      accessory: 'Classic Wireframe Glasses',
      topColor: '#f8fafc',
      bottomColor: '#b45309',
    },
  },
  vraj: {
    id: 'vraj',
    name: 'Vraj',
    role: 'The Driver',
    tagline: 'Adrenaline, instincts, and open roads.',
    personality: 'Energetic, funny, daring, and master of wheels.',
    specialAbility: 'Speed & Drift Agility',
    bonusDescription: '+15% top acceleration and tighter cornering on all vehicles.',
    preferredVehicles: 'Street Bikes, Scooters, and Sports cars.',
    portrait: vrajImg,
    color: 'from-cyan-500 to-blue-600',
    accentHex: 0x06b6d4,
    outfit: {
      top: 'Varsity Racing Bomber Jacket',
      bottom: 'Raw Denim Moto Jeans',
      shoes: 'High-Top Red Runners',
      accessory: 'Aviator Dark Sunglasses',
      topColor: '#0284c7',
      bottomColor: '#1e293b',
    },
  },
  jd: {
    id: 'jd',
    name: 'JD',
    role: 'The Mechanic',
    tagline: 'Craftsmanship, engines, and street ingenuity.',
    personality: 'Friendly, creative, resourceful, and loyal.',
    specialAbility: 'Master Mechanic',
    bonusDescription: '10% discount on vehicle upgrades and instant garage repairs.',
    preferredVehicles: 'Modified bikes, tuned roadsters, and utility rides.',
    portrait: jdImg,
    color: 'from-emerald-500 to-teal-600',
    accentHex: 0x10b981,
    outfit: {
      top: 'Street Graphic Utility Tee',
      bottom: 'Cargo Pants with Wrench Holster',
      shoes: 'Heavy Grip Work Boots',
      accessory: 'Reversible Streetwear Snapback',
      topColor: '#15803d',
      bottomColor: '#334155',
    },
  },
};
