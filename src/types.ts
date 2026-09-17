export type GameState =
  | "title"
  | "playing"
  | "dialogue"
  | "phone"
  | "diary"
  | "map"
  | "options"
  | "combat"
  | "limbo"
  | "credits";

export type Language = "es" | "en";

export type Direction = "up" | "down" | "left" | "right";

export type OutfitType =
  | "uniform"
  | "pajamas"
  | "casual"
  | "naked"
  | "towel"
  | "lingerie"
  | "lingerie_sexy"
  | "pajamas_silk"
  | "dress_gala"
  | "sport";

export interface SoulmateInfo {
  gender: "male" | "female" | "nonbinary";
  name: string;
  personality: "timido" | "rebelde" | "intelectual" | "carinoso" | "misterioso" | "protector";
  avatar?: string;
  hairColor?: string;
  eyeColor?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface CharacterStats {
  hambre: number; // 0 to 100%
  sed: number; // 0 to 100%
  perfume: number; // 0 to 100% (Mana)
  amor: number; // 0 to 100% (Twin bond)
  higiene: number; // 0 to 100%
  bateriaCelular: number; // 0 to 100% (Phone Battery)
  money?: number; // Pesos ($)
  speedBuff?: boolean; // Zapatillas de running
  perfumeBuff?: boolean; // Perfume francés Nuit Éthérée
  equippedAccessories?: string[]; // IDs of equipped gear
  level: number;
  xp: number;
  maxXp: number;
}

export interface AccessoryItem {
  id: string;
  nameEs: string;
  nameEn: string;
  descEs: string;
  descEn: string;
  icon: string;
  bonusEs: string;
  bonusEn: string;
  statBonus: {
    evasion?: number;
    critRate?: number;
    healBoost?: number;
    speed?: number;
    manaBoost?: number;
    damageBoost?: number;
  };
}

export interface EmoteBubble {
  id: string;
  x: number;
  y: number;
  type: "exclamation" | "question" | "heart" | "sweat" | "laugh" | "sparkle";
  duration: number; // ms remaining
}

export interface TurnCombatant {
  id: string;
  name: string;
  avatar: string;
  isPlayer: boolean;
  color: string;
}

export interface InventoryItem {
  id: string;
  nameEs: string;
  nameEn: string;
  descEs: string;
  descEn: string;
  icon: string;
  isKey: boolean;
  category: "backpack" | "pockets";
  usable?: boolean;
  price?: number;
  effect?: {
    type: "hambre" | "sed" | "perfume" | "amor" | "higiene" | "bateriaCelular" | "water_bottle" | "money" | "speed_buff" | "outfit";
    amount: number;
    outfit?: OutfitType;
  };
}

export interface CompanionPower {
  nameEs: string;
  nameEn: string;
  levelReq: number;
  descEs: string;
  descEn: string;
  unlocked: boolean;
}

export interface Companion {
  id: string;
  name: string;
  category: "gemelo" | "espiritu" | "humano_amigo" | "humano_enemigo";
  descriptionEs: string;
  descriptionEn: string;
  level: number;
  avatar: string;
  powers: CompanionPower[];
}

export interface PhonePhoto {
  id: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  date: string;
  category: "mom" | "selfie" | "school" | "adventure" | "other";
  icon: string;
  photoType?: "mom_first_day" | "mirror_selfie" | "generic";
  savedInGallery?: boolean;
}

export interface PhoneMessage {
  id: string;
  sender: string;
  textEs: string;
  textEn: string;
  timestamp: string;
  isPlayer?: boolean;
  photoAttachment?: PhonePhoto;
  savedInGallery?: boolean;
}

export interface PhoneReply {
  textEs: string;
  textEn: string;
  nextMessages: PhoneMessage[];
  nextReplies?: PhoneReply[];
  actionId?: string;
}

export interface PhoneChat {
  id: string;
  contactName: string;
  avatar: string;
  messages: PhoneMessage[];
  unread: boolean;
  replies?: PhoneReply[];
}

export interface DiaryEntry {
  id: string;
  titleEs: string;
  titleEn: string;
  date: string;
  textEs: string;
  textEn: string;
  unlocked: boolean;
}

export interface DialogSegment {
  speaker: string;
  textEs: string;
  textEn: string;
  avatar?: string;
  action?: string;
}

export interface GameNPC {
  id: string;
  name: string;
  x: number;
  y: number;
  sprite: string;
  facing: Direction;
  dialogEs: string[];
  dialogEn: string[];
  questTrigger?: string;
}

export interface PygameFile {
  name: string;
  path: string;
  content: string;
  description: string;
}

