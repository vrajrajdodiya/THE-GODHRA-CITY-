export type CharacterId = 'hemang' | 'vraj' | 'jd';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  role: string;
  tagline: string;
  personality: string;
  specialAbility: string;
  bonusDescription: string;
  preferredVehicles: string;
  portrait: string;
  color: string;
  accentHex: number;
  outfit: {
    top: string;
    bottom: string;
    shoes: string;
    accessory: string;
    topColor: string;
    bottomColor: string;
  };
}

export type VehicleType = 'bicycle' | 'scooter' | 'motorcycle' | 'car' | 'autorickshaw';

export interface VehicleStats {
  id: string;
  type: VehicleType;
  name: string;
  unlocked: boolean;
  topSpeed: number; // units/sec
  acceleration: number;
  handling: number;
  health: number; // 0 - 100
  maxHealth: number;
  color: string;
  colorHex: number;
  upgradeEngine: number; // 0 to 3
  upgradeBrakes: number; // 0 to 3
  upgradeTires: number; // 0 to 3
  price: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type WeatherType = 'sunny' | 'cloudy' | 'rain';

export interface MissionStep {
  id: string;
  instruction: string;
  targetPosition: [number, number, number]; // x, y, z
  targetRadius: number;
  targetName: string;
  actionRequired?: 'reach' | 'interact' | 'deliver' | 'drive';
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  characterRequired?: CharacterId;
  description: string;
  steps: MissionStep[];
  currentStepIndex: number;
  rewardMoney: number;
  rewardXp: number;
  rewardReputation: number;
  completed: boolean;
  unlocked: boolean;
}

export interface Landmark {
  id: string;
  name: string;
  gujaratiName?: string;
  category: 'home' | 'market' | 'food' | 'garage' | 'fuel' | 'park' | 'college' | 'business' | 'center' | 'highway';
  position: [number, number, number];
  color: string;
}

export interface GameState {
  money: number;
  xp: number;
  level: number;
  reputation: number;
  health: number;
  stamina: number;
  activeCharacter: CharacterId;
  characterSwitchUnlocked: boolean;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  activeMissionId: string | null;
  missions: Mission[];
  vehicles: VehicleStats[];
  activeVehicleId: string | null;
  isDriving: boolean;
  hasSeenIntro: boolean;
}
