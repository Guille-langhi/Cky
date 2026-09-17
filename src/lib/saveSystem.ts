import { GameState, Language, OutfitType, CharacterStats, InventoryItem, PhoneChat, PhonePhoto, DiaryEntry, Companion, Position, SoulmateInfo } from "../types";

export interface SaveSlotData {
  id: string; // 'autosave', 'slot_1', 'slot_2', 'slot_3', 'slot_4'
  slotName: string;
  timestamp: number;
  dateString: string;
  playtimeString: string;
  mapId: string;
  mapNameEs: string;
  mapNameEn: string;
  playerLevel: number;
  
  // Player state
  gameState: GameState;
  currentMap: string;
  playerPos: Position;
  facing: "up" | "down" | "left" | "right";
  gameTime: { hour: number; minute: number };
  totalGameMinutes: number;
  currentDay?: number;
  stats: CharacterStats;
  inventory: InventoryItem[];
  hasBackpack: boolean;
  hasPhone: boolean;
  currentOutfit: OutfitType;
  hasGroomed: boolean;
  
  // Custom names & story progress
  twinName: string;
  pauName: string;
  neighborName: string;
  hasNeighborBoardedBus: boolean;
  classStep: number;
  hasPassengersBoarded: boolean;
  hasFirstClassFinished: boolean;
  hasKickedBallXP: boolean;
  
  // House & interaction flags
  hasVisitedHallway: boolean;
  hasSeenMomKitchenIntro: boolean;
  momInteractionCount: number;
  hasTakenMomsPerfume: boolean;
  hasTakenMomsPlantMoney: boolean;
  hasTriggeredMomPhotoEvent: boolean;
  isPhoneCharging: boolean;
  hasSearchedStreetTrash: boolean;
  hasTalkedToMomAfterSchool: boolean;
  siestaTaken: boolean;
  showerTakenAfterSiesta: boolean;
  hasReceivedUnknownPhoneCall: boolean;
  actionCooldowns: Record<string, number>;
  
  // Lists
  phoneChats: PhoneChat[];
  phonePhotos: PhonePhoto[];
  diaryEntries: DiaryEntry[];
  companions: Companion[];
  soulmateInfo?: SoulmateInfo;
  day4GolemDefeated?: boolean;
  day4TreasureDug?: boolean;
  day4BoutiqueDressBought?: boolean;
  day4LingerieBought?: boolean;
  day4PerfumeBought?: boolean;
  day4SilkPajamasBought?: boolean;
  day4GalaDressBought?: boolean;
  day5CleanedBedroom?: boolean;
  day5CleanedBathroom?: boolean;
  day5CleanedLiving?: boolean;
  day5CleanedKitchen?: boolean;
  day5CleaningFinished?: boolean;
  day5PaidAirportBet?: boolean;
  day5ShowerDone?: boolean;
  day5SexyPhotosTaken?: boolean;
  day6DarkFormDefeated?: boolean;
  day6AlanisInterventionDone?: boolean;
  day6SoulmateJoined?: boolean;
  day6MorningRoutineComplete?: boolean;
  day6BusRidePossessedSeen?: boolean;
  day6BathroomDiscussionDone?: boolean;
  day6Investigation1Classroom?: boolean;
  day6Investigation2Teachers?: boolean;
  day6Investigation3Hallway?: boolean;
  day6PossessedSoccerDefeated?: boolean;
  day7GrimoireStrategyExplained?: boolean;
  day7DirectorExpulsionDone?: boolean;
  day7BasementDiscovered?: boolean;
  day7BasementValveTurned?: boolean;
  day7BasementMinion1Defeated?: boolean;
  day7BasementKeyFound?: boolean;
  day7BasementGateUnlocked?: boolean;
  day7BasementMinion2Defeated?: boolean;
  day7BasementGeneratorDisabled?: boolean;
  day7LaboratoryBossDefeated?: boolean;
  day7ProfessorLiberated?: boolean;
  day7AlanisBedroomArgumentDone?: boolean;
  day7ShowerDone?: boolean;
  day7LingeriePacked?: boolean;
  day7SoulmateKissDone?: boolean;
  day7SoulmateChangedToLingerie?: boolean;
  day7SoulmateRunwayDone?: boolean;
  day7SoulmateIntelDone?: boolean;
  day7SoulmateChangedBack?: boolean;
  day7ReturnedHomeReportDone?: boolean;
  day7Completed?: boolean;
  day8MorningTalkDone?: boolean;
  day8OutfitReady?: boolean;
  day8StreetSoulmateMet?: boolean;
  day8PlazaDefended?: boolean;
  day8HospitalDefended?: boolean;
  day8TerminalDefended?: boolean;
  day8MallDefended?: boolean;
  day8AllDefendedReportDone?: boolean;
  day8NeighborConfrontationDone?: boolean;
  day8AlanisBedroomDone?: boolean;
  day8Chapter1Ended?: boolean;
}

export const SAVE_SLOTS = [
  { id: "autosave", nameEs: "Autoguardado", nameEn: "Autosave", isAutosave: true },
  { id: "slot_1", nameEs: "Ranura 1", nameEn: "Slot 1", isAutosave: false },
  { id: "slot_2", nameEs: "Ranura 2", nameEn: "Slot 2", isAutosave: false },
  { id: "slot_3", nameEs: "Ranura 3", nameEn: "Slot 3", isAutosave: false },
  { id: "slot_4", nameEs: "Ranura 4", nameEn: "Slot 4", isAutosave: false },
];

const STORAGE_PREFIX = "cky_save_";

export function getMapName(mapId: string, lang: Language = "es"): string {
  const mapNames: Record<string, { es: string; en: string }> = {
    bedroom: { es: "Habitación de CKY", en: "CKY's Bedroom" },
    hallway: { es: "Pasillo de la Casa", en: "House Hallway" },
    house: { es: "Cocina y Comedor", en: "Kitchen & Dining" },
    moms_room: { es: "Habitación de Mamá", en: "Mom's Bedroom" },
    sisters_room: { es: "Habitación de la Hermana", en: "Sister's Bedroom" },
    empty_room: { es: "Habitación Vacía", en: "Empty Room" },
    bathroom: { es: "Baño de la Casa", en: "Bathroom" },
    street: { es: "Frente de Casa y Calle", en: "Street & Front Yard" },
    cemetery: { es: "Cementerio Municipal", en: "Municipal Cemetery" },
    bus_interior: { es: "Colectivo Escolar", en: "School Bus" },
    school_courtyard: { es: "Patio Escuela N° 87", en: "School Courtyard" },
    school_hallway: { es: "Pasillo de la Escuela", en: "School Hallway" },
    classroom_1: { es: "Aula de Matemática", en: "Math Classroom" },
    classroom_2: { es: "Aula de Biología", en: "Biology Classroom" },
    classroom_3: { es: "Aula de Historia", en: "History Classroom" },
    classroom_4: { es: "Aula de Lengua", en: "Language Classroom" },
    classroom_5: { es: "Aula de Arte", en: "Art Classroom" },
    director_office: { es: "Dirección Escolar", en: "Principal's Office" },
    bathroom_girls: { es: "Baño de Chicas", en: "Girls' Bathroom" },
    bathroom_boys: { es: "Baño de Chicos", en: "Boys' Bathroom" },
    limbo: { es: "El Limbo Espiritual", en: "Spiritual Limbo" },
    ruins_valley: { es: "Valle de las Ruinas Ancestrales", en: "Valley of Ancient Ruins" },
    shopping_mall: { es: "Centro Comercial de la Ciudad", en: "City Shopping Mall" },
    airport_terminal: { es: "Aeropuerto Internacional y Pistas", en: "International Airport & Runway" },
    school_basement: { es: "Sótano de la Escuela N° 87", en: "School No. 87 Basement" },
    school_laboratory: { es: "Aula Laboratorio Subterránea", en: "Underground Chemistry Lab" },
    plaza_principal: { es: "Plaza Principal de la Ciudad", en: "City Main Plaza" },
    hospital_municipal: { es: "Hospital Municipal de Urgencias", en: "Municipal Emergency Hospital" },
    bus_terminal: { es: "Terminal de Ómnibus de la Ciudad", en: "City Bus Terminal" },
  };

  const nameObj = mapNames[mapId];
  if (nameObj) {
    return nameObj[lang];
  }
  return mapId;
}

export function saveToSlot(slotId: string, data: Omit<SaveSlotData, "id" | "slotName" | "timestamp" | "dateString" | "playtimeString" | "mapNameEs" | "mapNameEn">): boolean {
  try {
    const slotDef = SAVE_SLOTS.find(s => s.id === slotId);
    const now = new Date();
    const dateString = now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const formattedHour = String(data.gameTime.hour).padStart(2, '0');
    const formattedMin = String(data.gameTime.minute).padStart(2, '0');
    const playtimeString = `Día 1 • ${formattedHour}:${formattedMin} HS`;

    const fullSaveData: SaveSlotData = {
      ...data,
      id: slotId,
      slotName: slotDef ? slotDef.nameEs : slotId,
      timestamp: Date.now(),
      dateString,
      playtimeString,
      mapNameEs: getMapName(data.currentMap, "es"),
      mapNameEn: getMapName(data.currentMap, "en"),
      playerLevel: data.stats.level || 1,
    };

    localStorage.setItem(STORAGE_PREFIX + slotId, JSON.stringify(fullSaveData));
    return true;
  } catch (err) {
    console.error("Error saving game slot:", err);
    return false;
  }
}

export function loadFromSlot(slotId: string): SaveSlotData | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slotId);
    if (!raw) return null;
    return JSON.parse(raw) as SaveSlotData;
  } catch (err) {
    console.error("Error loading save slot:", err);
    return null;
  }
}

export function getAllSaveSlots(): Record<string, SaveSlotData | null> {
  const result: Record<string, SaveSlotData | null> = {};
  for (const slot of SAVE_SLOTS) {
    result[slot.id] = loadFromSlot(slot.id);
  }
  return result;
}

export function deleteSaveSlot(slotId: string): boolean {
  try {
    localStorage.removeItem(STORAGE_PREFIX + slotId);
    return true;
  } catch (err) {
    console.error("Error deleting save slot:", err);
    return false;
  }
}

export function getLatestSave(): SaveSlotData | null {
  const slots = getAllSaveSlots();
  let latest: SaveSlotData | null = null;
  for (const key in slots) {
    const slot = slots[key];
    if (slot && (!latest || slot.timestamp > latest.timestamp)) {
      latest = slot;
    }
  }
  return latest;
}
