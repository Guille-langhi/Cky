import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  Direction, 
  Position, 
  GameNPC, 
  Language, 
  GameState, 
  InventoryItem, 
  PhoneChat, 
  PhonePhoto,
  DiaryEntry,
  CharacterStats,
  OutfitType,
  SoulmateInfo
} from "../types";
import SoulmateCreationModal from "./SoulmateCreationModal";
import Day5SexyPhotosModal from "./Day5SexyPhotosModal";
import Day6DarkFormBattleModal from "./Day6DarkFormBattleModal";
import Day6AlanisCutsceneModal from "./Day6AlanisCutsceneModal";
import Day6PossessedSoccerBattleModal from "./Day6PossessedSoccerBattleModal";
import Day7BasementMinionBattleModal from "./Day7BasementMinionBattleModal";
import Day7LabBossBattleModal from "./Day7LabBossBattleModal";
import Day8ObjectivesTracker from "./Day8ObjectivesTracker";
import Day8InvasionBattleModal, { Day8Location } from "./Day8InvasionBattleModal";
import Day8NeighborClimaxModal from "./Day8NeighborClimaxModal";
import Day8AlanisFinalCutsceneModal from "./Day8AlanisFinalCutsceneModal";
import Day8Chapter1EndingModal from "./Day8Chapter1EndingModal";
import SoccerPenaltyMinigame from "./SoccerPenaltyMinigame";
import KitchenSandwichMinigame from "./KitchenSandwichMinigame";
import SchoolTriviaMinigame from "./SchoolTriviaMinigame";
import ClawMachineMinigame from "./ClawMachineMinigame";
import BicycleRaceMinigame from "./BicycleRaceMinigame";
import StreetFoodCartModal from "./StreetFoodCartModal";
import TownNoticeBoardModal from "./TownNoticeBoardModal";
import RoomCustomizationModal from "./RoomCustomizationModal";
import { PetSystemModal } from "./PetSystemModal";
import CrazyMissionsModal from "./CrazyMissionsModal";
import { unlockAchievement } from "../data/achievements";
import { getRandomBanter } from "../data/spiritBanter";
import RetroCinematicModal, { CinematicType } from "./RetroCinematicModal";
import ShopCatalogModal, { ShopType } from "./ShopCatalogModal";
import VirtualGamepad from "./VirtualGamepad";
import AudioControlsModal from "./AudioControlsModal";
import { soundEngine } from "../lib/soundEngine";
import { androidBridge } from "../lib/androidMobileBridge";
import { SaveSlotData } from "../lib/saveSystem";
import {
  GraphicsConfig,
  loadGraphicsConfig,
  ParticleEngine,
  MotionInterpolator,
  getTimeOfDayAtmosphere,
  drawSoftShadow,
  drawVolumetricGodRay,
  drawPointLightBloom,
  applyPostProcessing,
} from "../lib/graphicsEngine";
import { 
  Tv, 
  Bed, 
  DoorClosed, 
  MapPin, 
  BookOpen, 
  ShieldAlert, 
  Volume2, 
  Moon, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  RefreshCw,
  Award,
  Briefcase,
  X,
  Smartphone,
  Users,
  Map,
  Sliders
} from "lucide-react";

interface GameCanvasProps {
  language: Language;
  onStateChange: (state: GameState) => void;
  onOpenPhone: () => void;
  onOpenDiary: () => void;
  onOpenMap: () => void;
  onTriggerDialogue: (speaker: string, textEs: string, textEn: string, onDone?: () => void) => void;
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem?: (itemId: string) => void;
  diaryEntries: DiaryEntry[];
  unlockDiaryEntry: (id: string) => void;
  phoneChats: PhoneChat[];
  triggerNewPhoneMessage: (chatId: string, textEs: string, textEn: string, photoAttachment?: PhonePhoto) => void;
  triggerAlanisPhoneChat?: () => void;
  triggerAngelaPhoneChat?: () => void;
  gameState: GameState;
  resetGame: () => void;
  resetKey?: number;
  customKeys: { up: string; down: string; left: string; right: string };
  isSilent: boolean;
  onNotifySpirit: () => void;
  hasBackpack: boolean;
  setHasBackpack: React.Dispatch<React.SetStateAction<boolean>>;
  hasPhone: boolean;
  setHasPhone: React.Dispatch<React.SetStateAction<boolean>>;
  currentOutfit?: OutfitType;
  setCurrentOutfit?: React.Dispatch<React.SetStateAction<OutfitType>>;
  hasGroomed?: boolean;
  setHasGroomed?: React.Dispatch<React.SetStateAction<boolean>>;
  addXP: (amount: number) => void;
  stats?: CharacterStats;
  setStats: React.Dispatch<React.SetStateAction<CharacterStats>>;
  phonePhotos?: PhonePhoto[];
  addPhotoToGallery?: (photo: PhonePhoto) => void;
  onUpdateCanvasState?: (data: any) => void;
  onAutosave?: () => void;
  onOpenSaveLoadModal?: (mode: "save" | "load") => void;
  loadData?: SaveSlotData | null;
  currentDay?: number;
  onSetCurrentDay?: (day: number) => void;
  graphicsConfig?: GraphicsConfig;
  onOpenGraphicsSettings?: () => void;
  soulmateInfo?: SoulmateInfo | null;
  setSoulmateInfo?: React.Dispatch<React.SetStateAction<SoulmateInfo | null>>;
  onOpenDevDaySelect?: () => void;
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

// Map grid structures (1 = Wall/Solid, 0 = walkable, 2 = DoorToHouse, 3 = DoorToStreet, 4 = Bed with two pillows, 5 = ShadowPortal, 10 = Mesa de luz, 11 = Ventana, 12 = Espejo normal, 13 = Ropero, 14 = Mueble útiles, 15 = Silla con ropa, 16 = Puerta Baño)
const BedroomGrid = [
  [1, 1, 1, 1, 11, 11, 1, 1, 1, 1],
  [1, 0, 12, 0, 0, 0, 15, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 13, 0, 0, 0, 0, 0, 4, 4, 1],
  [1, 13, 0, 0, 0, 0, 0, 4, 4, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 14, 14, 0, 0, 10, 1],
  [1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
];

// Habitación de Mamá basada en la de CKY (10x8)
// 20 = Planta decorativa de Mamá
const MomsRoomGrid = [
  [1, 1, 1, 1, 11, 11, 1, 1, 1, 1],
  [1, 0, 12, 0, 0, 0, 15, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 13, 0, 0, 0, 0, 0, 4, 4, 1],
  [1, 13, 0, 0, 0, 0, 0, 4, 4, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 10, 1],
  [1, 0, 0, 0, 20, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 2, 1, 1, 1, 1], // Puerta de salida en (5,7) hacia el pasillo
];

// Baño (Habitación 6) - 8x6
// 34 = Puerta salida a Sala de Estar (Fila 0, Col 3)
// 41 = Inodoro (Fila 1, Col 1)
// 42 = Lavamanos y Espejo (Fila 1, Col 2)
// 43 = Bañera / Ducha (Fila 1, Col 6; Fila 2, Col 6)
// 25 = Cesto de Ropa Sucia (Fila 4, Col 1)
// 44 = Toallero / Mueble de baño (Fila 4, Col 6)
const BathroomGrid = [
  [1, 1, 1, 34, 1, 1, 1, 1],
  [1, 41, 42, 0, 0, 0, 43, 1],
  [1, 0, 0, 0, 0, 0, 43, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 25, 0, 0, 0, 0, 44, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

// Sala de Estar (Habitación 4) - 10x8
// 3 = Puerta a la calle (4,0)
// 36 = Ventana (0,3)
// 27 = Puerta a la habitación de la hermana (1,7)
// 28 = Puerta al baño (7,7)
// 26 = Puerta al pasillo (9,3)
// 37 = Mesa (3,3; 4,3; 3,4; 4,4)
// 38 = Chimenea (8,1)
// 39 = Bibliotecas (1,1; 2,1)
// 40 = Mueble (6,6)
const EmptyRoomGrid = [
  [1, 1, 1, 1, 3, 1, 1, 1, 1, 1],
  [1, 39, 39, 0, 0, 0, 0, 0, 38, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [36, 0, 0, 37, 37, 0, 0, 0, 0, 26],
  [1, 0, 0, 37, 37, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 40, 0, 0, 1],
  [1, 27, 1, 1, 1, 1, 1, 28, 1, 1],
];

// Habitación de la Hermana (8x6) - Room 5
// 29 = Puerta salida a Sala de Estar (Fila 0, Col 3)
// 30 = Cama de la Hermana Girada Horizontal (Fila 1, Col 5 y Col 6)
// 31 = Escritorio de la Hermana (Fila 1, Col 1)
// 32 = Ropero de la Hermana (Fila 3, Col 1)
// 33 = Estantería de Libros / Peluches (Fila 4, Col 6)
// 36 = Ventana (Fila 2, Col 0)
const SistersRoomGrid = [
  [1, 1, 1, 29, 1, 1, 1, 1],
  [1, 31, 0, 0, 0, 30, 30, 1],
  [36, 0, 0, 0, 0, 0, 0, 1],
  [1, 32, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 33, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

// Pasillo de 5 filas (0..4) y 10 columnas (0..9)
// 17 = Puerta habitación CKY (Fila 0, Col 3)
// 18 = Puerta a la Ante-Sala / Habitación Vacía (Fila 2, Col 0)
// 19 = Puerta habitación de Mamá (Fila 4, Col 5)
// 3 = Puerta a la Cocina (Fila 2, Col 9)
const HallwayGrid = [
  [1, 1, 1, 17, 1, 1, 1, 1, 1, 1], // Fila 0: Paredes, Puerta CKY en Col 3
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  // Fila 1: Pasillo caminable
  [18, 0, 0, 0, 0, 0, 0, 0, 0, 3], // Fila 2: Col 0 = Puerta Ante-Sala, Col 9 = Puerta Cocina
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  // Fila 3: Pasillo caminable
  [1, 1, 1, 1, 1, 19, 1, 1, 1, 1], // Fila 4: Paredes, Puerta Mamá en Col 5
];

// Habitación 8: Cocina (12x12)
// Paredes en columna 9 y en fila 7.
// 2 = Puerta al pasillo en (0, 3) [Col 0, Row 3]
// 36 = Ventana con cortina en (5, 0) [Col 5, Row 0]
// 37 = Mesa central con sillas (4,3; 5,3; 4,4; 5,4)
// 47 = Heladera en (8, 6)
// 48 = Cocina en (7, 6)
// 49 = Pileta para lavar platos en (2, 6)
// 50 = Alacena para almacenar alimentos (3,6; 4,6; 5,6)
// 38 = Chimenea (7,1; 8,1)
// 51 = TV en (3, 1)
// 52 = Mueble para guardar cubiertos (1,1; 1,2; 2,1)
const HouseGrid = [
  [1, 1, 1, 1, 1, 36, 1, 1, 1, 1, 1, 1], // Fila 0: Ventana con cortina en Col 5
  [1, 52, 52, 51, 0, 0, 0, 38, 38, 1, 1, 1], // Fila 1: Mueble(1,1; 2,1), TV(3,1), Chimenea(7,1; 8,1)
  [1, 52, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], // Fila 2: Mueble(1,2)
  [2, 0, 0, 0, 37, 37, 0, 0, 1, 1, 1, 1], // Fila 3: Puerta Pasillo(0,3), Mesa(4,3; 5,3)
  [1, 0, 0, 0, 37, 37, 0, 0, 0, 1, 1, 1], // Fila 4: Mesa(4,4; 5,4)
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], // Fila 5: Caminable (sin puerta en 1,5)
  [1, 0, 49, 50, 50, 50, 0, 48, 47, 1, 1, 1], // Fila 6: Pileta(2,6), Alacena(3,6; 4,6; 5,6), Cocina(7,6), Heladera(8,6)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 7: Paredes en la fila 7
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Calle de la Ciudad - Frente a la Casa de CKY (20x10)
// 1 = Pared / Fachada / Reja
// 0 = Vereda / Calle caminable
// 3 = Puerta de Entrada a la Casa de CKY (Col 4, Row 3)
// 5 = Portal al Limbo (Col 18, Row 5)
// 60 = Cartel de Parada de Colectivo (Col 14, Row 5)
// 61 = Banco de la Parada (Col 15, Row 5)
// 62 = Farolas de luz (Col 8, Row 5 y Col 17, Row 5)
// 63 = Árboles frondosos de la vereda (Col 1, Row 5 y Col 11, Row 5)
// Calle de la Ciudad - Frente a la Casa de CKY y Vecindario (20x10)
// 1 = Pared / Fachada / Reja
// 0 = Vereda / Calle caminable
// 3 = Puerta de Entrada a la Casa de CKY (Col 4, Row 3) - Escribe "CASA"
// 31 = Puerta de Entrada Casa Vecina (Col 10, Row 3) - Escribe "VECINA"
// 32 = Puerta de Entrada Otra Casa (Col 16, Row 3) - Sin texto
// 5 = Portal al Limbo (Col 18, Row 5)
// 62 = Farolas de luz (Col 8, Row 5 y Col 17, Row 5)
// 63 = Árboles frondosos de la vereda (Col 1, Row 5 y Col 11, Row 5)
// 64 = Cesto de basura (Col 6, Row 5)
const StreetGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 0: Techos de las 3 casas (2-6: CKY, 8-12: Vecina, 14-18: Otra)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 1: Paredes y Ventanas
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 2: Paredes inferiores
  [1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 31, 1, 1, 1, 1, 1, 32, 1, 1, 1], // Fila 3: Rejas y Puertas (Col 4: CASA, Col 10: VECINA, Col 16: Otra)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Fila 4: Caminitos y vereda frontal
  [0, 63, 0, 0, 0, 0, 64, 0, 62, 0, 0, 63, 0, 0, 65, 0, 0, 62, 5, 0], // Fila 5: Vereda, Cesto (6,5), Farolas (8,5 y 17,5), Parada Línea 4 (14,5)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Fila 6: Borde de la vereda con césped
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Fila 7: Calle de asfalto (Carril superior)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Fila 8: Calle de asfalto (Carril inferior)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 9: Cerco / Borde inferior
];

// Cementerio Municipal - Tumba Rosa de Ángela, tumbas de piedra, cipreses y Parada Línea 4 (20x10)
// 1 = Muro perimetral
// 0 = Caminito del cementerio / Asfalto
// 65 = Parada de la Línea 4 (Col 3, Row 8)
// 70 = Tumba Rosa de Ángela (Col 14, Row 4)
// 71 = Tumba de piedra antigua
// 72 = Cruz de piedra tallada
// 73 = Estatua de Ángel de mármol
// 74 = Ciprés del cementerio
// 75 = Mausoleo
// 76 = Portón de Hierro
const CemeteryGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 76, 76, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 74, 71, 72, 74, 71, 72, 0, 0, 0, 0, 74, 71, 72, 74, 71, 72, 74, 1, 1],
  [1, 71, 0, 0, 0, 0, 72, 0, 0, 0, 0, 72, 0, 0, 0, 0, 71, 74, 1, 1],
  [1, 72, 0, 73, 0, 0, 71, 0, 0, 0, 0, 71, 0, 73, 0, 0, 72, 71, 1, 1],
  [1, 74, 0, 0, 0, 0, 72, 0, 0, 0, 0, 72, 0, 0, 70, 75, 71, 74, 1, 1],
  [1, 71, 0, 71, 72, 0, 0, 0, 0, 0, 0, 0, 0, 72, 71, 0, 72, 71, 1, 1],
  [1, 72, 0, 0, 0, 0, 74, 71, 72, 74, 71, 72, 0, 0, 0, 0, 71, 72, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 76, 76, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const LimboGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 5, 5, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Interior del Colectivo Escolar (5x7)
// 1 = Pared/Ventana/Estructura del Bus
// 0 = Pasillo caminable del colectivo
// 70 = Asiento y Volante del Chofer (Col 1, Row 1)
// 71 = Asiento 1 (Col 1, Row 2) - Vecina
// 72 = Asiento 2 (Col 3, Row 2)
// 73 = Asiento 3 (Col 1, Row 3)
// 74 = Asiento 4 (Col 3, Row 3)
// 75 = Asiento 5 (Col 1, Row 4)
// 76 = Asiento 6 (Col 3, Row 4) - Asiento de CKY
// 77 = Puerta de Salida del Colectivo (Col 2, Row 6)
const BusInteriorGrid = [
  [1, 1, 1, 1, 1],
  [1, 70, 0, 1, 1],
  [1, 71, 0, 72, 1],
  [1, 73, 0, 74, 1],
  [1, 75, 0, 76, 1],
  [1, 1, 0, 1, 1],
  [1, 1, 77, 1, 1],
];

// Patio de la Escuela con Cancha de Fútbol (16x10)
// 80 = Puerta Salida al Patio
// 81 = Puerta Salida al Pasillo Principal
// 98 = Arco Izquierdo, 99 = Arco Derecho, 100 = Pelota de Fútbol, 104 = Bancos
const SchoolCourtyardGrid = [
  [1, 1, 1, 1, 1, 1, 1, 81, 81, 1, 1, 1, 1, 1, 1, 1],
  [1, 77, 77, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 77, 77, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 98, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 0, 1],
  [1, 98, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 99, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 104, 104, 0, 0, 0, 0, 0, 0, 104, 104, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Pasillo / Gran Galería Principal de la Escuela (18x8)
// 82..86 = Puertas Aulas 1-5, 87 = Oficina Director, 88 = Sala Maestros, 89 = Baño Mujeres, 90 = Baño Varones, 80 = Patio
// 101 = Lockers, 102 = Cartelera de Avisos, 140 = Puerta Secreta al Sótano
const SchoolHallwayGrid = [
  [1, 82, 1, 1, 83, 1, 1, 84, 1, 1, 85, 1, 1, 86, 1, 1, 87, 1],
  [1, 0, 101, 0, 0, 101, 0, 0, 102, 0, 101, 0, 0, 101, 0, 0, 140, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 101, 0, 0, 0, 1],
  [1, 1, 1, 88, 1, 1, 1, 89, 1, 1, 1, 90, 1, 1, 1, 80, 1, 1],
];

// Aulas de 1er a 5to Año (10x8)
// 93 = Pizarrón, 92 = Escritorio Profesor, 91 = Pupitres Dobles (8 pupitres por aula)
const Classroom1Grid = [
  [1, 1, 1, 93, 93, 93, 93, 1, 1, 1],
  [1, 0, 92, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 81, 1, 1, 1, 1, 1],
];
const Classroom2Grid = [
  [1, 1, 1, 93, 93, 93, 93, 1, 1, 1],
  [1, 0, 92, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 81, 1, 1, 1, 1, 1],
];
const Classroom3Grid = [
  [1, 1, 1, 93, 93, 93, 93, 1, 1, 1],
  [1, 0, 92, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 81, 1, 1, 1, 1, 1],
];
const Classroom4Grid = [
  [1, 1, 1, 93, 93, 93, 93, 1, 1, 1],
  [1, 0, 92, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 81, 1, 1, 1, 1, 1],
];
const Classroom5Grid = [
  [1, 1, 1, 93, 93, 93, 93, 1, 1, 1],
  [1, 0, 92, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 91, 91, 0, 0, 91, 91, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 81, 1, 1, 1, 1, 1],
];

// Oficina del Director (10x8)
// 95 = Biblioteca/Trofeos, 94 = Escritorio Director, 104 = Sillas
const DirectorOfficeGrid = [
  [1, 1, 95, 95, 95, 95, 95, 95, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 94, 94, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 104, 0, 0, 104, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 81, 1, 1, 1, 1, 1],
];

// Sala de Maestros (10x8)
// 97 = Estación de Café/Mate, 96 = Mesa de Conferencia
const TeachersRoomGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 97, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 96, 96, 96, 96, 0, 0, 1],
  [1, 0, 0, 96, 96, 96, 96, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 81, 1, 1, 1, 1, 1],
];

// Baño de Mujeres (8x6)
const BathroomGirlsGrid = [
  [1, 42, 42, 1, 41, 41, 41, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 44, 1],
  [1, 1, 1, 81, 1, 1, 1, 1],
];

// Baño de Varones (8x6)
// 103 = Mingitorios
const BathroomBoysGrid = [
  [1, 42, 42, 1, 103, 103, 103, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 41, 1],
  [1, 1, 1, 81, 1, 1, 1, 1],
];

// Valle de las Ruinas Ancestrales (18x10) - Día 4 Expedición
// 1 = Paredes de Roca / Montañas
// 0 = Suelo de piedra milenaria y hierba mística
// 110 = Pilar Rúnico Ancestral
// 111 = Altar del Sello / Plataforma del Golem Guardián (Col 9, Row 3)
// 112 = Sitio del Antiguo Tesoro Enterrado (Col 14, Row 4)
// 113 = Sendero de Salida hacia la Ciudad (Col 1, Row 8)
// 114 = Monolito con Inscripciones Arcanas (Col 4, Row 1 & Col 13, Row 1)
// 115 = Arco de Piedra Antigua (Col 1, Row 7)
const RuinsValleyGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 110, 0, 0, 114, 0, 0, 110, 0, 0, 110, 0, 0, 114, 0, 110, 110, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 110, 0, 0, 0, 0, 111, 111, 0, 0, 0, 0, 110, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 111, 111, 0, 0, 0, 0, 112, 112, 0, 1],
  [1, 0, 0, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 112, 112, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 115, 0, 0, 110, 0, 0, 0, 0, 0, 0, 0, 0, 110, 0, 0, 0, 1],
  [1, 113, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Centro Comercial de la Ciudad (18x10) - Día 4 Tarde de Compras
// 1 = Paredes de Cristal y Estructura del Mall
// 0 = Piso de mármol pulido caminable
// 120 = Boutique de Moda (Percheros y Maniquíes)
// 121 = Tienda Exclusiva de Lencería Sexy (Encaje Rojo)
// 122 = Probador con Espejo
// 123 = Cafetería & Helados del Mall
// 124 = Gran Fuente Central de Agua
// 125 = Puerta de Salida a la Ciudad
// 126 = Bancos con Palmeras Ornamentales
// 127 = Stand de Perfumería Francesa de Lujo
const ShoppingMallGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 120, 120, 120, 122, 1, 1, 0, 0, 0, 1, 1, 121, 121, 121, 122, 1, 1],
  [1, 120, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 121, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 126, 0, 0, 126, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 124, 124, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 124, 124, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 126, 0, 0, 126, 0, 0, 0, 0, 0, 0, 1],
  [1, 123, 123, 123, 0, 0, 0, 0, 0, 0, 0, 0, 127, 127, 127, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 125, 125, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Terminal del Aeropuerto Internacional (18x10) - Día 5 Carrera al Aeropuerto
// 1 = Paredes de Cristal y Estructura del Aeropuerto
// 0 = Piso de mármol pulido caminable
// 130 = Mostrador de Check-in y Pantalla LED de Salidas
// 131 = Puesto de Panchos y Bebidas Don Pepe (Súper Pancho con Papas Pay y Coca Helada)
// 132 = Gran Ventanal a la Pista de Aterrizaje y Aviones
// 133 = Bancos de Espera de la Terminal
// 134 = Cinta de Equipajes (Baggage Carousel)
// 135 = Puertas Automáticas de Salida a la Ciudad
const AirportTerminalGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 132, 132, 132, 132, 132, 132, 132, 132, 132, 132, 132, 132, 132, 132, 132, 132, 1],
  [1, 130, 130, 130, 0, 0, 0, 130, 130, 130, 0, 0, 0, 134, 134, 134, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 134, 0, 134, 0, 1],
  [1, 0, 0, 133, 0, 0, 133, 0, 0, 133, 0, 0, 0, 134, 134, 134, 0, 1],
  [1, 0, 0, 133, 0, 0, 133, 0, 0, 133, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 131, 131, 131, 0, 0, 0, 0, 0, 0, 0, 0, 0, 133, 0, 0, 0, 1],
  [1, 131, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 133, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 135, 135, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Casa del Alma Gemela (Living Room) - 10x8
// 1 = Paredes índigo / azul oscuro
// 0 = Suelo de parquet pulido
// 2 = Puerta de salida a la Calle (Col 4, Row 7) -> street (16,4)
// 29 = Puerta hacia la Habitación del Gemelo (Col 8, Row 0) -> soulmate_bedroom (2,6)
// 6 = Sofá azul oscuro (Col 2-3, Row 3)
// 7 = Mesa de centro / Televisor (Col 2, Row 5)
// 20 = Planta de interior (Col 1, Row 1)
// 15 = Lámpara de pie (Col 8, Row 4)
// 32 = Puerta al Baño (Col 3, Row 0)
const SoulmateHouseGrid = [
  [1, 1, 1, 32, 1, 1, 1, 1, 29, 1],
  [1, 20, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 6, 6, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 15, 1],
  [1, 7, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
];

// Habitación del Alma Gemela - 10x8
// 1 = Paredes
// 0 = Suelo de madera
// 2 = Puerta de salida al Living (Col 2, Row 7) -> soulmate_house (8,1)
// 4 = Cama (Col 7-8, Row 3-4)
// 13 = Ropero / Placard (Col 1, Row 3-4)
// 33 = Estantería con el Grimorio de las Sombras (Col 4, Row 1)
// 35 = Mesita de noche con Foto Enmarcada de Él y la Vecina (Col 6, Row 1)
// 11 = Ventana con cortinas (Col 4-5, Row 0)
const SoulmateBedroomGrid = [
  [1, 1, 1, 1, 11, 11, 1, 1, 1, 1],
  [1, 0, 0, 0, 33, 0, 35, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 13, 0, 0, 0, 0, 0, 4, 4, 1],
  [1, 13, 0, 0, 0, 0, 0, 4, 4, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
];

// Sótano Prohibido de la Escuela - Laberinto Subterráneo (18x10) - Día 7
// 1 = Paredes de piedra mohosa y cañerías oxidadas
// 0 = Suelo de adoquines húmedos
// 140 = Escaleras de subida al Pasillo Escolar (Col 1, Row 1)
// 141 = Válvula de Vapor Sombrío (Col 2, Row 8)
// 142 = Tuberías con Vapor Hirviente bloqueante (Col 6, Row 4)
// 143 = Caja de Herramientas Antigua con Llave (Col 10, Row 1)
// 144 = Portón Metálico Enrejado (Col 12, Row 5)
// 145 = Generador Arcano del Limbo (Col 16, Row 2)
// 146 = Puerta Blindada al Aula Laboratorio (Col 16, Row 7)
// 147 = Charcos de Ectoplasma Brillante
// 148 = Caldera Antigua con runas púrpuras
// 149 = Telarañas y Escombros
const SchoolBasementGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 140, 0, 0, 1, 0, 0, 0, 1, 0, 143, 0, 1, 0, 0, 0, 148, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 145, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 142, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 144, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 147, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 146, 1],
  [1, 0, 141, 0, 1, 0, 1, 149, 0, 1, 0, 0, 0, 0, 147, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Aula Laboratorio de Química Oculta (12x10) - Día 7
// 1 = Paredes de azulejos con manchas oscuras
// 0 = Suelo de laboratorio
// 146 = Puerta de salida al sótano (Col 5-6, Row 9)
// 151 = Círculo Alquímico Oscuro central
// 152 = Mesas de laboratorio con matraces y mecheros
// 153 = Pizarrón con fórmulas de transmutación del Limbo
// 154 = Estantes de reactivos químicos y frascos de veneno
// 155 = Campana extractora de humo
const SchoolLaboratoryGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 154, 0, 0, 153, 153, 0, 0, 0, 154, 154, 1],
  [1, 0, 152, 152, 0, 0, 0, 0, 152, 152, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 154, 0, 0, 151, 151, 151, 0, 0, 0, 154, 1],
  [1, 0, 0, 0, 151, 151, 151, 0, 0, 0, 0, 1],
  [1, 0, 152, 152, 0, 0, 0, 0, 152, 152, 0, 1],
  [1, 155, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 146, 146, 1, 1, 1, 1, 1],
];

// Plaza Principal de la Ciudad (18x10) - Día 8 Invasión
// 1 = Rejas perimetrales y arboledas densas
// 0 = Caminos adoquinados y césped
// 160 = Gran Fuente Central de la Plaza (Foco del Coloso Sombrío)
// 161 = Estatua y Monumento Conmemorativo
// 162 = Puesto de Flores y Diarios
// 163 = Bancos de Plaza de Madera
// 164 = Farolas Coloniales de Hierro
// 165 = Portón de Salida a la Ciudad
const PlazaPrincipalGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 164, 0, 0, 163, 0, 0, 161, 161, 0, 0, 163, 0, 0, 164, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 162, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 162, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 160, 160, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 160, 160, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 163, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 163, 0, 1],
  [1, 164, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 164, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 165, 165, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Hospital Municipal de la Ciudad (18x10) - Día 8 Invasión
// 1 = Paredes y ventanales hospitalarios
// 0 = Piso esterilizado de baldosas sanitarias
// 170 = Mostrador de Guardia y Triaje (Foco del Espectro de la Peste)
// 171 = Camillas de Urgencia y Monitores Cardíacos
// 172 = Vitrinas de Medicamentos y Sueros
// 173 = Sillas Metálicas de la Sala de Espera
// 174 = Puertas Automáticas de Urgencias / Salida
const HospitalMunicipalGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 172, 172, 0, 171, 171, 0, 171, 171, 0, 171, 171, 0, 172, 172, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 173, 173, 0, 0, 0, 170, 170, 0, 0, 0, 173, 173, 0, 0, 0, 1],
  [1, 0, 173, 173, 0, 0, 0, 170, 170, 0, 0, 0, 173, 173, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 171, 171, 0, 0, 0, 0, 0, 0, 0, 0, 0, 171, 171, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 174, 174, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Terminal de Ómnibus de la Ciudad (18x10) - Día 8 Invasión
// 1 = Paredes y estructuras de dársena
// 0 = Asfalto y andén techado
// 180 = Dársena Central de Colectivos (Foco del Leviatán del Asfalto)
// 181 = Boleterías y Venta de Pasajes
// 182 = Kiosco de Café, Facturas y Diarios
// 183 = Bancos de Andén
// 184 = Cartel Electrónico de Salidas y Destinos
// 185 = Salida a la Vía Pública
const BusTerminalGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 184, 184, 184, 184, 184, 184, 184, 184, 184, 184, 184, 184, 184, 184, 184, 184, 1],
  [1, 181, 181, 0, 0, 181, 181, 0, 0, 181, 181, 0, 0, 182, 182, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 183, 0, 0, 0, 180, 180, 180, 180, 0, 0, 0, 183, 0, 0, 0, 1],
  [1, 0, 183, 0, 0, 0, 180, 180, 180, 180, 0, 0, 0, 183, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 183, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 183, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 185, 185, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const TILE_SIZE = 40;

export default function GameCanvas({
  language,
  onStateChange,
  onOpenPhone,
  onOpenDiary,
  onOpenMap,
  onTriggerDialogue,
  inventory,
  addInventoryItem,
  removeInventoryItem,
  diaryEntries,
  unlockDiaryEntry,
  phoneChats,
  triggerNewPhoneMessage,
  triggerAlanisPhoneChat,
  triggerAngelaPhoneChat,
  gameState,
  resetGame,
  resetKey,
  customKeys,
  isSilent,
  onNotifySpirit,
  hasBackpack,
  setHasBackpack,
  hasPhone,
  setHasPhone,
  currentOutfit: propOutfit,
  setCurrentOutfit: propSetOutfit,
  hasGroomed: propGroomed,
  setHasGroomed: propSetGroomed,
  addXP,
  stats: propStats,
  setStats,
  phonePhotos,
  addPhotoToGallery,
  onUpdateCanvasState,
  onAutosave,
  onOpenSaveLoadModal,
  loadData,
  currentDay: propCurrentDay,
  onSetCurrentDay,
  graphicsConfig: propGraphicsConfig,
  onOpenGraphicsSettings,
  soulmateInfo,
  setSoulmateInfo,
  onOpenDevDaySelect,
  onShowNotification,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Next-Gen Graphics Engine references and dynamic active config
  const activeGraphicsConfig = propGraphicsConfig || loadGraphicsConfig();
  const particleEngineRef = useRef<ParticleEngine>(new ParticleEngine());
  const motionInterpolatorRef = useRef<MotionInterpolator>(new MotionInterpolator(3, 3));
  const lastFrameTimeRef = useRef<number>(Date.now());

  // Character status
  const [currentMap, setCurrentMap] = useState<
    | "bedroom"
    | "hallway"
    | "house"
    | "street"
    | "cemetery"
    | "limbo"
    | "moms_room"
    | "bathroom"
    | "empty_room"
    | "sisters_room"
    | "bus_interior"
    | "school_courtyard"
    | "school_hallway"
    | "classroom_1"
    | "classroom_2"
    | "classroom_3"
    | "classroom_4"
    | "classroom_5"
    | "director_office"
    | "teachers_room"
    | "bathroom_girls"
    | "bathroom_boys"
    | "ruins_valley"
    | "shopping_mall"
    | "airport_terminal"
    | "soulmate_house"
    | "soulmate_bedroom"
    | "school_basement"
    | "school_laboratory"
    | "plaza_principal"
    | "hospital_municipal"
    | "bus_terminal"
  >("bedroom");
  const [playerPos, setPlayerPos] = useState<Position>({ x: 3, y: 3 });
  const [facing, setFacing] = useState<Direction>("down");
  const [fadeOpacity, setFadeOpacity] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [chapterStep, setChapterStep] = useState<number>(0); // 0 = awake, 1 = talk to mom, 2 = explore outside street, 3 = echo warning, 4 = confront spirit
  const [spiritDefeated, setSpiritDefeated] = useState<boolean>(false);
  
  const [localGroomed, setLocalGroomed] = useState<boolean>(false);
  const hasGroomed = propGroomed ?? localGroomed;
  const setHasGroomed = propSetGroomed ?? setLocalGroomed;

  // Intro states, outfits and bed modals
  const isContinued = diaryEntries.some(e => e.id === "chapter_01_mom" && e.unlocked);
  const [introStep, setIntroStep] = useState<number>(isContinued ? -1 : 0);
  
  const [localOutfit, setLocalOutfit] = useState<"pajamas" | "uniform" | "casual">("pajamas");
  const currentOutfit = propOutfit ?? localOutfit;
  const setCurrentOutfit = propSetOutfit ?? setLocalOutfit;
  const [hasUniformXP, setHasUniformXP] = useState<boolean>(false);
  const [hasCleanedToilet, setHasCleanedToilet] = useState<boolean>(false);
  const [hasCleanedShower, setHasCleanedShower] = useState<boolean>(false);
  const [hasWashedDishes, setHasWashedDishes] = useState<boolean>(false);
  const [showWardrobeModal, setShowWardrobeModal] = useState<boolean>(false);
  const [showBedModal, setShowBedModal] = useState<boolean>(false);
  const [bedArranged, setBedArranged] = useState<boolean>(false);
  const [anxietyTriggered, setAnxietyTriggered] = useState<boolean>(false);
  const [isOverslept, setIsOverslept] = useState<boolean>(false);
  const [showDPad, setShowDPad] = useState<boolean>(true);
  const [showAudioModal, setShowAudioModal] = useState<boolean>(false);

  // Interactive object states & modals
  const [livingFireplaceLit, setLivingFireplaceLit] = useState<boolean>(false);
  const [kitchenFireplaceLit, setKitchenFireplaceLit] = useState<boolean>(true);
  const [livingCurtainsOpen, setLivingCurtainsOpen] = useState<boolean>(false);
  const [kitchenWindowOpen, setKitchenWindowOpen] = useState<boolean>(true);
  const [hasTowel, setHasTowel] = useState<boolean>(false);
  const [hasBathed, setHasBathed] = useState<boolean>(false);

  // Interactive Modals
  const [showJacketModal, setShowJacketModal] = useState<boolean>(false);
  const [showOrganizerModal1, setShowOrganizerModal1] = useState<boolean>(false);
  const [showOrganizerModal2, setShowOrganizerModal2] = useState<boolean>(false);
  const [pendingBooksWalkCheck, setPendingBooksWalkCheck] = useState<boolean>(false);
  const [booksWalkSteps, setBooksWalkSteps] = useState<number>(0);
  const [hasWaterBottleFromFridge, setHasWaterBottleFromFridge] = useState<boolean>(false);
  const [showFridgeModal, setShowFridgeModal] = useState<boolean>(false);
  const [hasVisitedHallway, setHasVisitedHallway] = useState<boolean>(false);
  const [hasSeenMomKitchenIntro, setHasSeenMomKitchenIntro] = useState<boolean>(false);
  const [momInteractionCount, setMomInteractionCount] = useState<number>(0);
  const [hasTakenMomsPerfume, setHasTakenMomsPerfume] = useState<boolean>(false);
  const [hasTakenMomsPlantMoney, setHasTakenMomsPlantMoney] = useState<boolean>(false);
  const [showNakedSelfieModal, setShowNakedSelfieModal] = useState<boolean>(false);
  const [hasTriggeredMomPhotoEvent, setHasTriggeredMomPhotoEvent] = useState<boolean>(false);
  const [showNightstandModal, setShowNightstandModal] = useState<boolean>(false);
  const [isPhoneCharging, setIsPhoneCharging] = useState<boolean>(false);
  const [showSinkModal, setShowSinkModal] = useState<boolean>(false);
  const [showToiletModal, setShowToiletModal] = useState<boolean>(false);
  const [showShowerModal, setShowShowerModal] = useState<boolean>(false);
  const [showTowelModal, setShowTowelModal] = useState<boolean>(false);
  const [showFireplaceModal, setShowFireplaceModal] = useState<boolean>(false);
  const [showLivingWindowModal, setShowLivingWindowModal] = useState<boolean>(false);
  const [showKitchenTvModal, setShowKitchenTvModal] = useState<boolean>(false);
  const [showKitchenTableModal, setShowKitchenTableModal] = useState<boolean>(false);
  const [showKitchenWindowModal, setShowKitchenWindowModal] = useState<boolean>(false);
  const [showKitchenFireplaceModal, setShowKitchenFireplaceModal] = useState<boolean>(false);
  const [showKitchenSinkModal, setShowKitchenSinkModal] = useState<boolean>(false);
  const [showBusStopModal, setShowBusStopModal] = useState<boolean>(false);
  const [showExitHouseChoiceModal, setShowExitHouseChoiceModal] = useState<boolean>(false);
  const [showSchoolBusArrivalModal, setShowSchoolBusArrivalModal] = useState<boolean>(false);
  const [uniformErrorMsg, setUniformErrorMsg] = useState<string | null>(null);
  const [hasSearchedStreetTrash, setHasSearchedStreetTrash] = useState<boolean>(false);

  // Post-School & Afternoon Sequence States
  const [hasTalkedToMomAfterSchool, setHasTalkedToMomAfterSchool] = useState<boolean>(false);
  const [siestaTaken, setSiestaTaken] = useState<boolean>(false);
  const [showerTakenAfterSiesta, setShowerTakenAfterSiesta] = useState<boolean>(false);
  const [hasReceivedUnknownPhoneCall, setHasReceivedUnknownPhoneCall] = useState<boolean>(false);
  const [showUnknownPhoneModal, setShowUnknownPhoneModal] = useState<boolean>(false);
  const [isDay2Intro, setIsDay2Intro] = useState<boolean>(false);
  const [day2IntroStep, setDay2IntroStep] = useState<number>(1);
  const [isDay3Intro, setIsDay3Intro] = useState<boolean>(false);
  const [day3IntroStep, setDay3IntroStep] = useState<number>(1);
  const [hasDay2WalkDialogueTriggered, setHasDay2WalkDialogueTriggered] = useState<boolean>(false);
  const [day2ShowerCompleted, setDay2ShowerCompleted] = useState<boolean>(false);
  const [day2TowelMissing, setDay2TowelMissing] = useState<boolean>(false);
  const [day2TowelFoundOnChair, setDay2TowelFoundOnChair] = useState<boolean>(false);

  // Day 3 Narrative & Disappearance States
  const [day3SuppliesFoundInMomRoom, setDay3SuppliesFoundInMomRoom] = useState<boolean>(false);
  const [day3BreakfastDisappeared, setDay3BreakfastDisappeared] = useState<boolean>(false);
  const [day3BreakfastFoundLiving, setDay3BreakfastFoundLiving] = useState<boolean>(false);
  const [day3SchoolThiefDefeated, setDay3SchoolThiefDefeated] = useState<boolean>(false);
  const [day3RiftGuardianDefeated, setDay3RiftGuardianDefeated] = useState<boolean>(false);
  const [day3ShowerCheckedTowelFirst, setDay3ShowerCheckedTowelFirst] = useState<boolean>(false);
  const [day3ShowerCompleted, setDay3ShowerCompleted] = useState<boolean>(false);
  const [day3TowelMissingAgain, setDay3TowelMissingAgain] = useState<boolean>(false);
  const [day3RevealedSpiritW, setDay3RevealedSpiritW] = useState<boolean>(false);
  const [day3DinnerEaten, setDay3DinnerEaten] = useState<boolean>(false);
  const [day3BedtimeTreasureDiscussed, setDay3BedtimeTreasureDiscussed] = useState<boolean>(false);

  // Day 4 Narrative: Sábado - Ancient Ruins, W Shovel, Golem Battle, Shower & Sexy Lingerie
  const [isDay4Intro, setIsDay4Intro] = useState<boolean>(false);
  const [day4IntroStep, setDay4IntroStep] = useState<number>(1);
  const [day4GolemDefeated, setDay4GolemDefeated] = useState<boolean>(false);
  const [day4WShovelTransform, setDay4WShovelTransform] = useState<boolean>(false);
  const [day4TreasureDug, setDay4TreasureDug] = useState<boolean>(false);
  const [day4ShowerWithWGuard, setDay4ShowerWithWGuard] = useState<boolean>(false);
  const [day4LingerieBought, setDay4LingerieBought] = useState<boolean>(false);
  const [day4PerfumeBought, setDay4PerfumeBought] = useState<boolean>(false);
  const [day4SilkPajamasBought, setDay4SilkPajamasBought] = useState<boolean>(false);
  const [day4GalaDressBought, setDay4GalaDressBought] = useState<boolean>(false);
  const [showSoulmateModal, setShowSoulmateModal] = useState<boolean>(false);
  const [day4NightDisputeDone, setDay4NightDisputeDone] = useState<boolean>(false);
  const [activeCinematicType, setActiveCinematicType] = useState<CinematicType | null>(null);
  const [activeShopType, setActiveShopType] = useState<ShopType | null>(null);

  // Day 5 Narrative: Domingo - Limpieza Profunda, Carrera al Aeropuerto, Ducha & Fotos Sexys
  const [isDay5Intro, setIsDay5Intro] = useState<boolean>(false);
  const [day5IntroStep, setDay5IntroStep] = useState<number>(1);
  const [day5CleanedBedroom, setDay5CleanedBedroom] = useState<boolean>(false);
  const [day5CleanedBathroom, setDay5CleanedBathroom] = useState<boolean>(false);
  const [day5CleanedLiving, setDay5CleanedLiving] = useState<boolean>(false);
  const [day5CleanedKitchen, setDay5CleanedKitchen] = useState<boolean>(false);
  const [day5RoachesDefeated, setDay5RoachesDefeated] = useState<boolean>(false);
  const [day5SpidersDefeated, setDay5SpidersDefeated] = useState<boolean>(false);
  const [day5RatDefeated, setDay5RatDefeated] = useState<boolean>(false);
  const [day5WTransformTool, setDay5WTransformTool] = useState<"light" | "duster" | "mop" | "vacuum" | "broom">("light");
  const [day5CleaningFinished, setDay5CleaningFinished] = useState<boolean>(false);
  const [day5NeighborRaceChallenge, setDay5NeighborRaceChallenge] = useState<boolean>(false);
  const [day5NeighborRaceLost, setDay5NeighborRaceLost] = useState<boolean>(false);
  const [day5PaidAirportBet, setDay5PaidAirportBet] = useState<boolean>(false);
  const [day5ShowerDone, setDay5ShowerDone] = useState<boolean>(false);
  const [showDay5PhotoModal, setShowDay5PhotoModal] = useState<boolean>(false);
  const [day5SexyPhotosTaken, setDay5SexyPhotosTaken] = useState<boolean>(false);

  // Day 6 Narrative: Lunes - Forma Oscura, Alma Gemela Híbrida y Rutina Escolar
  const [isDay6Intro, setIsDay6Intro] = useState<boolean>(false);
  const [day6IntroStep, setDay6IntroStep] = useState<number>(1);
  const [day6DarkFormDefeated, setDay6DarkFormDefeated] = useState<boolean>(false);
  const [day6AlanisInterventionDone, setDay6AlanisInterventionDone] = useState<boolean>(false);
  const [day6SoulmateJoined, setDay6SoulmateJoined] = useState<boolean>(false);
  const [showDay6BattleModal, setShowDay6BattleModal] = useState<boolean>(false);
  const [showDay6AlanisCutscene, setShowDay6AlanisCutscene] = useState<boolean>(false);
  const [day6WardrobeUniformDone, setDay6WardrobeUniformDone] = useState<boolean>(false);
  const [day6BathroomGroomed, setDay6BathroomGroomed] = useState<boolean>(false);
  const [day6BackpackCollected, setDay6BackpackCollected] = useState<boolean>(false);
  const [day6WaterAndSandwichCollected, setDay6WaterAndSandwichCollected] = useState<boolean>(false);
  const [day6BooksCollected, setDay6BooksCollected] = useState<boolean>(false);
  const [day6MomTalkDone, setDay6MomTalkDone] = useState<boolean>(false);
  const [day6BusRidePossessedSeen, setDay6BusRidePossessedSeen] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_bus_possessed") === "true";
  });
  const [day6BathroomDiscussionDone, setDay6BathroomDiscussionDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_bathroom_done") === "true";
  });
  const [day6Investigation1Classroom, setDay6Investigation1Classroom] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_inv1_done") === "true";
  });
  const [day6Investigation2Teachers, setDay6Investigation2Teachers] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_inv2_done") === "true";
  });
  const [day6Investigation3Hallway, setDay6Investigation3Hallway] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_inv3_done") === "true";
  });
  const [day6PossessedSoccerDefeated, setDay6PossessedSoccerDefeated] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_soccer_boss_defeated") === "true";
  });
  const [showDay6PossessedSoccerModal, setShowDay6PossessedSoccerModal] = useState<boolean>(false);
  const [day6AlanisBedroomArgumentDone, setDay6AlanisBedroomArgumentDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_alanis_arg_done") === "true";
  });
  const [day6DebateDone, setDay6DebateDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_debate_done") === "true";
  });
  const [day6SiestaDone, setDay6SiestaDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_siesta_done") === "true";
  });
  const [day6ShowerDone, setDay6ShowerDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_shower_done") === "true";
  });
  const [day6ForgotTowel, setDay6ForgotTowel] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_forgot_towel") === "true";
  });
  const [day6DressedAfterShower, setDay6DressedAfterShower] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_dressed_shower") === "true";
  });
  const [day6KissLessonDone, setDay6KissLessonDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_kiss_lesson_done") === "true";
  });
  const [day6SoulmateKissDone, setDay6SoulmateKissDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_soulmate_kiss_done") === "true";
  });
  const [day6PhotoVecinaExamined, setDay6PhotoVecinaExamined] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_photo_vecina_seen") === "true";
  });
  const [day6GrimoireObtained, setDay6GrimoireObtained] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_grimoire_obtained") === "true";
  });
  const [day6ConfessionDone, setDay6ConfessionDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_confession_done") === "true";
  });
  const [day6Completed, setDay6Completed] = useState<boolean>(() => {
    return localStorage.getItem("cky_day6_completed") === "true";
  });

  // Day 7 Narrative: "Injusticia" - Estrategia del Grimorio, Expulsión de la Vecina y Laberinto del Sótano
  const [isDay7Intro, setIsDay7Intro] = useState<boolean>(false);
  const [day7IntroStep, setDay7IntroStep] = useState<number>(1);
  const [day7GrimoireStrategyExplained, setDay7GrimoireStrategyExplained] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_grimoire_strat") === "true";
  });
  const [day7WardrobeUniformDone, setDay7WardrobeUniformDone] = useState<boolean>(false);
  const [day7BathroomGroomed, setDay7BathroomGroomed] = useState<boolean>(false);
  const [day7BackpackCollected, setDay7BackpackCollected] = useState<boolean>(false);
  const [day7WaterAndSandwichCollected, setDay7WaterAndSandwichCollected] = useState<boolean>(false);
  const [day7BooksCollected, setDay7BooksCollected] = useState<boolean>(false);
  const [day7DirectorExpulsionDone, setDay7DirectorExpulsionDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_expulsion_done") === "true";
  });
  const [day7BasementDiscovered, setDay7BasementDiscovered] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_basement_discovered") === "true";
  });
  const [day7BasementValveTurned, setDay7BasementValveTurned] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_valve_turned") === "true";
  });
  const [day7BasementMinion1Defeated, setDay7BasementMinion1Defeated] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_minion1_defeated") === "true";
  });
  const [day7BasementKeyFound, setDay7BasementKeyFound] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_key_found") === "true";
  });
  const [day7BasementGateUnlocked, setDay7BasementGateUnlocked] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_gate_unlocked") === "true";
  });
  const [day7BasementMinion2Defeated, setDay7BasementMinion2Defeated] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_minion2_defeated") === "true";
  });
  const [day7BasementGeneratorDisabled, setDay7BasementGeneratorDisabled] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_generator_disabled") === "true";
  });
  const [day7LaboratoryBossDefeated, setDay7LaboratoryBossDefeated] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_lab_boss_defeated") === "true";
  });
  const [day7ProfessorLiberated, setDay7ProfessorLiberated] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_prof_liberated") === "true";
  });
  const [day7Completed, setDay7Completed] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_completed") === "true";
  });
  const [day7AlanisBedroomArgumentDone, setDay7AlanisBedroomArgumentDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_alanis_arg_done") === "true";
  });
  const [day7ShowerDone, setDay7ShowerDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_shower_done") === "true";
  });
  const [day7LingeriePacked, setDay7LingeriePacked] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_lingerie_packed") === "true";
  });
  const [day7SoulmateKissDone, setDay7SoulmateKissDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_soulmate_kiss_done") === "true";
  });
  const [day7SoulmateChangedToLingerie, setDay7SoulmateChangedToLingerie] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_soulmate_lingerie_changed") === "true";
  });
  const [day7SoulmateRunwayDone, setDay7SoulmateRunwayDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_soulmate_runway_done") === "true";
  });
  const [day7SoulmateIntelDone, setDay7SoulmateIntelDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_soulmate_intel_done") === "true";
  });
  const [day7SoulmateChangedBack, setDay7SoulmateChangedBack] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_soulmate_changed_back") === "true";
  });
  const [day7ReturnedHomeReportDone, setDay7ReturnedHomeReportDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day7_report_done") === "true";
  });
  const [showDay7Minion1BattleModal, setShowDay7Minion1BattleModal] = useState<boolean>(false);
  const [showDay7Minion2BattleModal, setShowDay7Minion2BattleModal] = useState<boolean>(false);
  const [showDay7LabBossBattleModal, setShowDay7LabBossBattleModal] = useState<boolean>(false);

  // Day 8 States: Ataque Final (Wednesday - Final Siege)
  const [isDay8Intro, setIsDay8Intro] = useState<boolean>(false);
  const [day8IntroStep, setDay8IntroStep] = useState<number>(1);
  const [day8MorningTalkDone, setDay8MorningTalkDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_morning_talk_done") === "true";
  });
  const [day8OutfitReady, setDay8OutfitReady] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_outfit_ready") === "true";
  });
  const [day8StreetSoulmateMet, setDay8StreetSoulmateMet] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_street_soulmate_met") === "true";
  });
  const [day8PlazaDefended, setDay8PlazaDefended] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_plaza_defended") === "true";
  });
  const [day8HospitalDefended, setDay8HospitalDefended] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_hospital_defended") === "true";
  });
  const [day8TerminalDefended, setDay8TerminalDefended] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_terminal_defended") === "true";
  });
  const [day8MallDefended, setDay8MallDefended] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_mall_defended") === "true";
  });
  const [day8AllDefendedReportDone, setDay8AllDefendedReportDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_all_defended_report") === "true";
  });
  const [day8NeighborConfrontationDone, setDay8NeighborConfrontationDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_neighbor_confrontation_done") === "true";
  });
  const [day8AlanisBedroomDone, setDay8AlanisBedroomDone] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_alanis_bedroom_done") === "true";
  });
  const [day8Chapter1Ended, setDay8Chapter1Ended] = useState<boolean>(() => {
    return localStorage.getItem("cky_day8_chapter1_ended") === "true";
  });

  // Day 8 Modals
  const [activeDay8Battle, setActiveDay8Battle] = useState<"plaza" | "hospital" | "terminal" | "mall" | null>(null);
  const [showDay8NeighborClimaxModal, setShowDay8NeighborClimaxModal] = useState<boolean>(false);
  const [showDay8AlanisModal, setShowDay8AlanisModal] = useState<boolean>(false);
  const [showDay8EndingModal, setShowDay8EndingModal] = useState<boolean>(false);
  const [showSandwichMinigame, setShowSandwichMinigame] = useState<boolean>(false);
  const [showTriviaMinigame, setShowTriviaMinigame] = useState<boolean>(false);
  const [showClawMachine, setShowClawMachine] = useState<boolean>(false);
  const [showBicycleRace, setShowBicycleRace] = useState<boolean>(false);
  const [showStreetFoodCart, setShowStreetFoodCart] = useState<boolean>(false);
  const [showNoticeBoard, setShowNoticeBoard] = useState<boolean>(false);
  const [showRoomCustomization, setShowRoomCustomization] = useState<boolean>(false);
  const [showPetModal, setShowPetModal] = useState<boolean>(false);
  const [showCrazyMissionsModal, setShowCrazyMissionsModal] = useState<boolean>(false);
  const [freeRoamActive, setFreeRoamActive] = useState<boolean>(() => {
    return localStorage.getItem("cky_free_roam_active") === "true";
  });

  const [localCurrentDay, setLocalCurrentDay] = useState<number>(1);
  const currentDay = propCurrentDay ?? localCurrentDay;
  const setCurrentDay = useCallback((day: number | ((prev: number) => number)) => {
    setLocalCurrentDay(prev => {
      const nextDay = typeof day === "function" ? day(prev) : day;
      if (onSetCurrentDay) onSetCurrentDay(nextDay);
      return nextDay;
    });
  }, [onSetCurrentDay]);

  const [showGreenBusModal, setShowGreenBusModal] = useState<boolean>(false);
  const [isGreenBusWaiting, setIsGreenBusWaiting] = useState<boolean>(false);
  const [hasDeliveredAngelaSandwich, setHasDeliveredAngelaSandwich] = useState<boolean>(false);
  const [showShowerChoiceModal, setShowShowerChoiceModal] = useState<boolean>(false);
  const [hasTalkedToAlanis, setHasTalkedToAlanis] = useState<boolean>(false);
  const [hasTalkedToAngela, setHasTalkedToAngela] = useState<boolean>(false);

  const startDay2Intro = useCallback(() => {
    setIntroStep(-1);
    setDay2IntroStep(1);
    setIsDay2Intro(true);
    setCurrentDay(2);
  }, [setCurrentDay]);

  const startDay3Intro = useCallback(() => {
    setIntroStep(-1);
    setIsDay2Intro(false);
    setDay3IntroStep(1);
    setIsDay3Intro(true);
    setCurrentDay(3);
  }, [setCurrentDay]);

  const startDay4Intro = useCallback(() => {
    setIntroStep(-1);
    setIsDay2Intro(false);
    setIsDay3Intro(false);
    setDay4IntroStep(1);
    setIsDay4Intro(true);
    setCurrentDay(4);
  }, [setCurrentDay]);

  const startDay5Intro = useCallback(() => {
    setIntroStep(-1);
    setIsDay2Intro(false);
    setIsDay3Intro(false);
    setIsDay4Intro(false);
    setIsDay6Intro(false);
    setDay5IntroStep(1);
    setIsDay5Intro(true);
    setCurrentDay(5);
  }, [setCurrentDay]);

  const startDay6Intro = useCallback(() => {
    setIntroStep(-1);
    setIsDay2Intro(false);
    setIsDay3Intro(false);
    setIsDay4Intro(false);
    setIsDay5Intro(false);
    setIsDay7Intro(false);
    setDay6IntroStep(1);
    setIsDay6Intro(true);
    setCurrentDay(6);
  }, [setCurrentDay]);

  const startDay7Intro = useCallback(() => {
    setIntroStep(-1);
    setIsDay2Intro(false);
    setIsDay3Intro(false);
    setIsDay4Intro(false);
    setIsDay5Intro(false);
    setIsDay6Intro(false);
    setDay7IntroStep(1);
    setIsDay7Intro(true);
    setCurrentDay(7);
  }, [setCurrentDay]);

  const startAngelaDialogueChain = () => {
    playSound(600, "sine", 0.3);
    if (setHasPhone) setHasPhone(true);
    if (triggerAngelaPhoneChat) {
      triggerAngelaPhoneChat();
    }
    onTriggerDialogue(
      "Celular de CKY",
      "📱 ¡Tiiiin! Sientes una helada presencia espiritual y tu celular vibra con un nuevo mensaje de Ángela. Vamos a responderle.",
      "📱 You feel an icy spiritual presence and your phone vibrates with a new message from Angela. Let's reply.",
      () => {
        onOpenPhone();
      }
    );
  };

  const startAlanisDialogueChain = () => {
    setShowUnknownPhoneModal(false);
    playSound(600, "sine", 0.3);

    const enemyName = neighborName || "Vanesa";

    const msg1Es = "Soy la Líder Suprema de todo lo conocido. Un espíritu que gobierna todas las realidades.";
    const msg1En = "I am the Supreme Leader of all that is known. A spirit that rules all realities.";
    triggerNewPhoneMessage("Alanis", msg1Es, msg1En);

    onTriggerDialogue(
      "Alanis",
      msg1Es,
      msg1En,
      () => {
        const msg2Es = "CKY: Te felicito. ¿Y yo qué culpa tengo?";
        const msg2En = "CKY: Congratulations. And how is that my fault?";
        triggerNewPhoneMessage("Alanis", msg2Es, msg2En);

        onTriggerDialogue(
          "CKY",
          "Te felicito. ¿Y yo qué culpa tengo?",
          "Congratulations. And how is that my fault?",
          () => {
            const msg3Es = "Tú eres la heredera de este poder, mi reinado está llegando a su fin...";
            const msg3En = "You are the heir to this power, my reign is coming to an end...";
            triggerNewPhoneMessage("Alanis", msg3Es, msg3En);

            onTriggerDialogue(
              "Alanis",
              msg3Es,
              msg3En,
              () => {
                const msg4Es = "CKY: ¿Y esa herencia de cuánta plata es?";
                const msg4En = "CKY: And how much money is that inheritance?";
                triggerNewPhoneMessage("Alanis", msg4Es, msg4En);

                onTriggerDialogue(
                  "CKY",
                  "¿Y esa herencia de cuánta plata es?",
                  "And how much money is that inheritance?",
                  () => {
                    const msg5Es = "¡Poder... Niña estúpida!";
                    const msg5En = "Power... Stupid girl!";
                    triggerNewPhoneMessage("Alanis", msg5Es, msg5En);

                    onTriggerDialogue(
                      "Alanis",
                      msg5Es,
                      msg5En,
                      () => {
                        const msg6Es = "Ahora tienes el poder de hablar con espíritus...";
                        const msg6En = "Now you have the power to speak with spirits...";
                        triggerNewPhoneMessage("Alanis", msg6Es, msg6En);

                        onTriggerDialogue(
                          "Alanis",
                          msg6Es,
                          msg6En,
                          () => {
                            const msg7Es = `Pero debes tener cuidado, ${enemyName} también tiene poderes y quiere mi lugar... va a intentar destruirte.`;
                            const msg7En = `But you must be careful, ${enemyName} also has powers and wants my place... she will try to destroy you.`;
                            triggerNewPhoneMessage("Alanis", msg7Es, msg7En);

                            onTriggerDialogue(
                              "Alanis",
                              msg7Es,
                              msg7En,
                              () => {
                                const msg8Es = "CKY: ¿Y qué tengo que hacer?";
                                const msg8En = "CKY: And what do I have to do?";
                                triggerNewPhoneMessage("Alanis", msg8Es, msg8En);

                                onTriggerDialogue(
                                  "CKY",
                                  "¿Y qué tengo que hacer?",
                                  "And what do I have to do?",
                                  () => {
                                    const msg9Es = "Por ahora intenta hablar con un espíritu. Luego veremos. Adiós.";
                                    const msg9En = "For now try to speak with a spirit. We will see later. Goodbye.";
                                    triggerNewPhoneMessage("Alanis", msg9Es, msg9En);

                                    onTriggerDialogue(
                                      "Alanis",
                                      msg9Es,
                                      msg9En,
                                      () => {
                                        setHasTalkedToAlanis(true);

                                        if (currentMap === "bedroom") {
                                          setPlayerPos({ x: 7, y: 4 });
                                          setFacing("up");
                                        }

                                        onTriggerDialogue(
                                          "CKY",
                                          "¡Esa llamada de Alanis estuvo rarísima! Quedó guardada en los mensajes de mi celular. Ahora puedo seguir recorriendo la casa con libertad y cuando me acueste a dormir en mi cama terminaré el día.",
                                          "That call from Alanis was weird! It was saved in my phone messages. Now I can freely explore the house and when I go to bed I will end the day."
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  // Blonde Neighbor & School Bus states
  const [neighborPos, setNeighborPos] = useState<Position>({ x: 10, y: 4 });
  const [hasNeighborBoardedBus, setHasNeighborBoardedBus] = useState<boolean>(() => {
    const name = localStorage.getItem("cky_neighbor_name") || "";
    const boarded = localStorage.getItem("cky_neighbor_boarded") === "true";
    return boarded && name.length > 0;
  });
  const [neighborName, setNeighborName] = useState<string>(() => {
    return localStorage.getItem("cky_neighbor_name") || "";
  });
  const [showNameNeighborModal, setShowNameNeighborModal] = useState<boolean>(false);
  const [inputNeighborName, setInputNeighborName] = useState<string>("");
  const [isCutsceneActive, setIsCutsceneActive] = useState<boolean>(false);
  const [isBusWaitingAtDoor, setIsBusWaitingAtDoor] = useState<boolean>(false);
  const [hasSatInBusSeat, setHasSatInBusSeat] = useState<boolean>(false);
  const [hasPassengersBoarded, setHasPassengersBoarded] = useState<boolean>(
    () => localStorage.getItem("cky_bus_passengers") === "true"
  );
  const [hasFirstClassFinished, setHasFirstClassFinished] = useState<boolean>(
    () => localStorage.getItem("cky_class_finished") === "true"
  );

  // School Day Classes Progression (0: Historia, 1: Recreo+Fútbol, 2: Matemática, 3: Biología, 4: Ed. Física, 5: Salida, 6: Casa)
  const [classStep, setClassStep] = useState<number>(() => {
    const saved = localStorage.getItem("cky_class_step");
    if (saved !== null) return parseInt(saved, 10);
    return localStorage.getItem("cky_class_finished") === "true" ? 1 : 0;
  });

  const [hasKickedBallXP, setHasKickedBallXP] = useState<boolean>(() => {
    return localStorage.getItem("cky_kicked_ball_xp") === "true";
  });

  const advanceClassStep = (nextStep: number) => {
    setClassStep(nextStep);
    localStorage.setItem("cky_class_step", nextStep.toString());
    if (nextStep >= 1) {
      setHasFirstClassFinished(true);
      localStorage.setItem("cky_class_finished", "true");
    }
  };

  // Trigger Alanis phone call/message immediately after taking a shower post-siesta
  useEffect(() => {
    if (showerTakenAfterSiesta && !hasReceivedUnknownPhoneCall) {
      setHasReceivedUnknownPhoneCall(true);
      if (setHasPhone) setHasPhone(true);

      // GUARANTEED: Execute triggerAlanisPhoneChat immediately so chat is added to state
      if (triggerAlanisPhoneChat) {
        triggerAlanisPhoneChat();
      }

      const timer = setTimeout(() => {
        playSound(900, "sine", 0.5);
        setTimeout(() => playSound(1200, "sine", 0.5), 200);

        onTriggerDialogue(
          "Celular de CKY",
          "📱 ¡Tiiiin! Tienes un nuevo mensaje de Alanis (Líder Suprema) en tu celular. Abre el celular (botón 📱 o tecla P) para leerlo y responder.",
          "📱 You have a new message from Alanis (Supreme Leader) on your phone. Open your phone (button 📱 or P key) to read and reply."
        );
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [showerTakenAfterSiesta, hasReceivedUnknownPhoneCall, triggerAlanisPhoneChat, setHasPhone, onTriggerDialogue]);

  const handleOpenPhone = () => {
    if (showerTakenAfterSiesta && !hasReceivedUnknownPhoneCall) {
      setHasReceivedUnknownPhoneCall(true);
      if (setHasPhone) setHasPhone(true);
      if (triggerAlanisPhoneChat) {
        triggerAlanisPhoneChat();
      }
    }
    playSound(400, "sine", 0.15);
    onOpenPhone();
  };

  // Background Music (BGM) synchronizer
  useEffect(() => {
    if (gameState !== "playing") {
      soundEngine.stopBgm();
      return;
    }

    if (showDay8EndingModal) {
      soundEngine.playBgm("ending");
    } else if (showDay8AlanisModal || showDay8NeighborClimaxModal) {
      soundEngine.playBgm("climax");
    } else if (activeDay8Battle !== null) {
      soundEngine.playBgm("boss");
    } else if (currentMap === "limbo" || currentMap === "cemetery" || currentMap === "ruins_valley") {
      soundEngine.playBgm("mystery");
    } else if (
      currentMap === "school_hallway" ||
      currentMap === "classroom_3" ||
      currentMap === "school_courtyard" ||
      currentMap === "bathroom_girls" ||
      currentMap === "bathroom_boys" ||
      currentMap === "teachers_room" ||
      currentMap === "director_office" ||
      currentMap === "school_laboratory" ||
      currentMap === "school_basement"
    ) {
      soundEngine.playBgm("school");
    } else if (
      currentMap === "street" ||
      currentMap === "plaza_principal" ||
      currentMap === "bus_terminal" ||
      currentMap === "shopping_mall" ||
      currentMap === "airport_terminal" ||
      currentMap === "bus_interior"
    ) {
      soundEngine.playBgm("street");
    } else {
      soundEngine.playBgm("house");
    }
  }, [
    currentMap,
    gameState,
    showDay8EndingModal,
    showDay8AlanisModal,
    showDay8NeighborClimaxModal,
    activeDay8Battle,
  ]);

  // Soccer Minigame State
  const [showSoccerMinigame, setShowSoccerMinigame] = useState<boolean>(false);
  const [soccerScore, setSoccerScore] = useState<number>(0);
  const [soccerAttempts, setSoccerAttempts] = useState<number>(5);
  const [soccerAim, setSoccerAim] = useState<number>(0); // -45 to 45
  const [soccerAimDir, setSoccerAimDir] = useState<number>(1);
  const [soccerPower, setSoccerPower] = useState<number>(0);
  const [soccerState, setSoccerState] = useState<"aiming" | "power" | "shooting" | "result">("aiming");
  const [soccerResultMsg, setSoccerResultMsg] = useState<string>("¡Apunta con la flecha y presiona FIJAR DIRECCIÓN!");
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 150, y: 220 });
  const [keeperX, setKeeperX] = useState<number>(150);
  const keeperDirRef = useRef<number>(1);
  const soccerAimDirRef = useRef<number>(1);

  // Math & Biology Quiz Modals
  const [showMathQuizModal, setShowMathQuizModal] = useState<boolean>(false);
  const [showBiologyQuizModal, setShowBiologyQuizModal] = useState<boolean>(false);

  // Soccer Minigame Animation Loop
  useEffect(() => {
    if (!showSoccerMinigame) return;
    let animId: number;
    const loop = () => {
      // 1. Move Goalkeeper back and forth (-40 to +40 relative to center)
      setKeeperX((prev) => {
        let next = prev + keeperDirRef.current * 1.5;
        if (next > 40) { next = 40; keeperDirRef.current = -1; }
        if (next < -40) { next = -40; keeperDirRef.current = 1; }
        return next;
      });

      // 2. Aim indicator oscillation (-45 to +45)
      if (soccerState === "aiming") {
        setSoccerAim((prev) => {
          let next = prev + soccerAimDirRef.current * 2;
          if (next > 45) { next = 45; soccerAimDirRef.current = -1; }
          if (next < -45) { next = -45; soccerAimDirRef.current = 1; }
          return next;
        });
      }

      // 3. Power meter oscillation
      if (soccerState === "power") {
        setSoccerPower((prev) => {
          let next = prev + 3;
          if (next > 100) next = 0;
          return next;
        });
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [showSoccerMinigame, soccerState]);

  useEffect(() => {
    if (resetKey && resetKey > 0) {
      setCurrentMap("bedroom");
      setPlayerPos({ x: 3, y: 3 });
      setFacing("down");
      setFadeOpacity(0);
      setIsTransitioning(false);
      setChapterStep(0);
      setSpiritDefeated(false);
      setLocalGroomed(false);
      setIntroStep(0);
      setLocalOutfit("pajamas");
      setHasUniformXP(false);
      setHasCleanedToilet(false);
      setHasCleanedShower(false);
      setHasWashedDishes(false);
      setShowWardrobeModal(false);
      setShowBedModal(false);
      setBedArranged(false);
      setAnxietyTriggered(false);
      setIsOverslept(false);
      setNeighborPos({ x: 10, y: 4 });
      setHasNeighborBoardedBus(false);
      setNeighborName("");
      setShowNameNeighborModal(false);
      setInputNeighborName("");
      setIsCutsceneActive(false);
      setHasVisitedHallway(false);
      setHasSeenMomKitchenIntro(false);
      setMomInteractionCount(0);
      setHasTakenMomsPerfume(false);
      setHasTakenMomsPlantMoney(false);
      setHasWaterBottleFromFridge(false);
      setHasSearchedStreetTrash(false);
      setIsBusWaitingAtDoor(false);
      setHasSatInBusSeat(false);
      localStorage.removeItem("cky_bus_passengers");
      setHasPassengersBoarded(false);
      localStorage.removeItem("cky_class_finished");
      setHasFirstClassFinished(false);
      localStorage.removeItem("cky_class_step");
      localStorage.removeItem("cky_kicked_ball_xp");
      setClassStep(0);
      setHasKickedBallXP(false);
      setShowSoccerMinigame(false);
      setShowMathQuizModal(false);
      setShowBiologyQuizModal(false);
    }
  }, [resetKey]);

  const handleConfirmNeighborName = () => {
    const finalName = inputNeighborName.trim() || "Sol";
    setNeighborName(finalName);
    localStorage.setItem("cky_neighbor_name", finalName);
    setShowNameNeighborModal(false);

    // Vecina boards bus
    setNeighborPos({ x: 4, y: 5 });
    setHasNeighborBoardedBus(true);
    localStorage.setItem("cky_neighbor_boarded", "true");

    playSound(420, "triangle", 0.3);
    onTriggerDialogue(
      "CKY",
      `Ella es ${finalName}, mi vecina... crecimos juntas y fuimos mejores amigas, pero algo cambió hace un año y ahora es mí enemiga. Ya la van a conocer`,
      `She is ${finalName}, my neighbor... we grew up together and were best friends, but something changed a year ago and now she is my enemy. You'll get to know her soon`,
      () => {
        setIsCutsceneActive(false);
      }
    );
  };

  const boardSchoolBusFinal = (name: string) => {
    playSound(520, "triangle", 0.4);
    setHasNeighborBoardedBus(true);
    setHasPassengersBoarded(true);
    localStorage.setItem("cky_neighbor_boarded", "true");
    
    // Transition map into bus interior at x: 2, y: 5 (aisle at bottom of bus facing UP)
    setCurrentMap("bus_interior");
    setPlayerPos({ x: 2, y: 5 });
    setFacing("up");
    
    setTimeout(() => {
      if (currentDay === 6) {
        playSound(240, "sawtooth", 0.4);
        onTriggerDialogue(
          "Chofer Don Carlos (Ojos Púrpuras Sombríos)",
          "¡Subí rápido CKY y no molestes! ¡Qué insoportable tener que frenar por vos todos los días!",
          "Get in fast CKY and don't bother! So annoying having to stop for you every single day!",
          () => {
            onTriggerDialogue(
              "Vecina (Mirada Maliciosa)",
              "Miren quién subió... la rarita del barrio. Nadie te quiere acá CKY, ¿por qué no te bajás y vas caminando sola?",
              "Look who boarded... the neighborhood weirdo. Nobody wants you here CKY, why don't you get off and walk alone?",
              () => {
                onTriggerDialogue(
                  "Jaz (Voz Fría y Ojos Desenfocados)",
                  "Ni se te ocurra sentarte a mi lado, CKY. Me das vergüenza ajena. Ya no somos amigas.",
                  "Don't even think about sitting next to me, CKY. You embarrass me. We are not friends anymore.",
                  () => {
                    onTriggerDialogue(
                      "Nico y Juan",
                      "¡Jajaja mirale la cara de boba que tiene! ¡Ojalá te caigas del colectivo!",
                      "Hahaha look at her dumb face! Hope you fall off the bus!",
                      () => {
                        onTriggerDialogue(
                          soulmateInfo?.name || "Alma Gemela",
                          "Che CKY... hay una vibra re pesada acá. Tienen como una niebla violeta pegada en el aura... los están manejando mentalmente a todos.",
                          "Hey CKY... there's a super heavy vibe here. They've got like a purple mist clinging to their auras... everyone's being mentally puppeted.",
                          () => {
                            onTriggerDialogue(
                              "Ángela (Espíritu)",
                              "¡¿Pero qué les pasa a estos mocosos?! ¡Jaz jamás te hablaría así! ¡Están todos recontra poseídos y agresivos por culpa de esa bruja de la vecina! ¡Aguantá CKY, lleguemos a la escuela y armamos un plan!",
                              "What's wrong with these brats?! Jaz would never talk to you like that! They are all possessed and aggressive because of the neighbor witch! Hold on CKY, let's reach school and make a plan!",
                              () => {
                                setDay6BusRidePossessedSeen(true);
                                localStorage.setItem("cky_day6_bus_possessed", "true");
                                unlockDiaryEntry("chapter_06_possessed_bus_and_school");
                                addXP(40);
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
        return;
      }
      if (!hasGroomed) {
        onTriggerDialogue(
          "Chofer Don Carlos",
          `¡Llegó CKY!... Pero... ¡JAJAJAJA CKY! 🤣 ¡Mira esa cara llena de sueño y ese nido de pajaritos despeinado en la cabeza! Viniste sin lavarte la cara ni peinarte jajaja. ¡Suban chicos!`,
          `CKY has arrived!... But... HAHAHAHA CKY! 🤣 Look at that bedhead and unwashed face! You came to school without grooming or combing your hair! Get in kids!`,
          () => {
            onTriggerDialogue(
              "Jaz (Tu Mejor Amiga)",
              "👧 ¡Amigaaaa! Te quiero mucho pero... ¡¿qué te pasó en el pelo?! Jajaja ¡parece que te agarró un huracán dormida! ¡Tomá, te presto mi cepillo!",
              "👧 Bestieee! I love you but... what happened to your hair?! Hahaha like a hurricane hit you while sleeping! Take my brush!",
              () => {
                onTriggerDialogue(
                  "Nico",
                  "👦 ¡JAJAJA CKY! ¿Se peleó tu peine con la almohada? Jaja ¡tenés un nido de pajaritos despeinado en la cabeza!",
                  "👦 HAHAHA CKY! Did your comb fight with your pillow? You have a bird nest on your head!",
                  () => {
                    onTriggerDialogue(
                      "Juan",
                      "🧑 Según mis cálculos cinemáticos y capilares, no te peinaste ni te lavaste la cara hoy... ¡Tus pelos desafían la gravedad!",
                      "🧑 According to my hair kinematics, you didn't comb or wash today... Your hair defies gravity!",
                      () => {
                        onTriggerDialogue(
                          "Abril",
                          "👩‍🦰 ¡Miren todos a CKY! Vino al colegio sin peinarse ni lavarse la cara... Jajaja ¡qué papelón!",
                          "👩‍🦰 Look at CKY everyone! Came to school uncombed with unwashed face... What a mess! Hahaha"
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      } else {
        onTriggerDialogue(
          "Chofer Don Carlos",
          `Hola CKY... ¿Lista para ir a la escuela?... Subiste justo a tiempo con ${name}. Podés sentarte en cualquier asiento.`,
          `Hello CKY... Ready for school?... You made it just in time with ${name}. You can sit in any seat.`
        );
      }
    }, 300);
  };

  const triggerStreetExitCutscene = () => {
    if (hasNeighborBoardedBus) return;

    if (currentMap !== "street") {
      setCurrentMap("street");
    }
    setPlayerPos({ x: 4, y: 5 });
    setFacing("down");
    setNeighborPos({ x: 10, y: 4 });
    setWalkPath([]);
    setIsCutsceneActive(true);

    const neighborSteps: Position[] = [
      { x: 9, y: 4 },
      { x: 8, y: 4 },
      { x: 7, y: 4 },
      { x: 6, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 4 }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < neighborSteps.length) {
        setNeighborPos(neighborSteps[stepIndex]);
        triggerBeep(240);
        stepIndex++;
      } else {
        clearInterval(interval);

        playSound(400, "sine", 0.3);
        onTriggerDialogue(
          "CKY",
          "Esa Rubia es mí peor enemiga y su nombre es? Cómo se llama?",
          "That blonde is my worst enemy and her name is? What is her name?",
          () => {
            setInputNeighborName(neighborName || "Sol");
            setShowNameNeighborModal(true);
          }
        );
      }
    }, 140);
  };

  const triggerSchoolBusSequence = () => {
    if (currentOutfit !== "uniform") {
      playSound(180, "sawtooth", 0.3);
      onTriggerDialogue(
        "Chofer del Colectivo Escolar",
        "⚠️ Chofer: '¡Pará la mano, CKY! No podés subir al colectivo escolar sin el uniforme puesto. Volvé a tu casa y ponete el uniforme escolar en el ropero de tu habitación.'",
        "⚠️ Bus Driver: 'Hold on, CKY! You cannot board the school bus without wearing your school uniform. Go back inside and equip it from your wardrobe.'"
      );
      return;
    }

    if (!hasNeighborBoardedBus) {
      triggerStreetExitCutscene();
    } else {
      setShowSchoolBusArrivalModal(true);
    }
  };

  // Cockroach event & Giant Cockroach RPG Combat states
  const [hasEncounteredCockroachToday, setHasEncounteredCockroachToday] = useState<boolean>(false);
  const [showCockroachCombatModal, setShowCockroachCombatModal] = useState<boolean>(false);
  const [cockroachLog, setCockroachLog] = useState<string>("");
  const [cockroachSpeech, setCockroachSpeech] = useState<string>("");
  const [giantFootFalling, setGiantFootFalling] = useState<boolean>(false);
  const [cockroachSquished, setCockroachSquished] = useState<boolean>(false);
  const [postCombatMomPos, setPostCombatMomPos] = useState<Position | null>(null);

  const handleCockroachAction = (actionType: "attack" | "special" | "block" | "flee") => {
    playSound(300, "sawtooth", 0.3);

    if (actionType === "attack") {
      setCockroachLog("CKY realizó un ataque normal...");
      setCockroachSpeech("¡Inténtalo de nuevo!");
    } else if (actionType === "special") {
      setCockroachLog("CKY usó su ataque Especial...");
      setCockroachSpeech("¡HAHAHAHA! ¿Eso es todo? ¡Ja, ja, ja!");
    } else if (actionType === "block") {
      setCockroachLog("CKY se cubrió a la defensiva...");
      setCockroachSpeech("¡Tus defensas no me hacen nada!");
    } else if (actionType === "flee") {
      setCockroachLog("CKY intentó huir desesperadamente...");
      setCockroachSpeech("¡JAMÁS!");
    }

    // Giant Foot falls and squishes the cockroach
    setTimeout(() => {
      setGiantFootFalling(true);
      playSound(100, "sawtooth", 0.8);

      setTimeout(() => {
        setGiantFootFalling(false);
        setCockroachSquished(true);
        setCockroachSpeech("");
        setCockroachLog("¡Un PIE GIGANTE cayó del cielo y aplastó por completo a la cucaracha!");
        playSound(120, "triangle", 0.5);
      }, 1000);
    }, 1100);
  };

  const finishCockroachCombat = () => {
    setShowCockroachCombatModal(false);
    setCockroachSquished(false);
    setCockroachSpeech("");
    setCockroachLog("");
    advanceTime(10);

    // Position Mother right next to CKY in empty_room at { x: 8, y: 6 }
    setPostCombatMomPos({ x: 8, y: 6 });

    setTimeout(() => {
      onTriggerDialogue(
        "Madre",
        "No seas pelotu**, era solo una cucaracha.",
        "Don't be silly, it was just a cockroach.",
        () => {
          // Smooth path for Mom walking back to the Kitchen door at { x: 4, y: 0 }
          const momPath: Position[] = [
            { x: 8, y: 6 },
            { x: 7, y: 6 },
            { x: 6, y: 6 },
            { x: 5, y: 6 },
            { x: 4, y: 6 },
            { x: 4, y: 5 },
            { x: 4, y: 4 },
            { x: 4, y: 3 },
            { x: 4, y: 2 },
            { x: 4, y: 1 },
            { x: 4, y: 0 }
          ];

          let stepIndex = 0;
          const interval = setInterval(() => {
            stepIndex++;
            if (stepIndex < momPath.length) {
              setPostCombatMomPos(momPath[stepIndex]);
            } else {
              clearInterval(interval);
              setPostCombatMomPos(null);

              setTimeout(() => {
                onTriggerDialogue(
                  "CKY",
                  "¡Pero VOLABA!!!! ¡qué miedo!",
                  "But IT WAS FLYING!!!! So scary!"
                );
              }, 300);
            }
          }, 180);
        }
      );
    }, 250);
  };

  const handleBathroomExit = () => {
    playSound(300, "sine", 0.3);
    transitionToMap("empty_room", { x: 7, y: 6 });
    if (currentDay === 6 && day6ForgotTowel && !day6DressedAfterShower) {
      setTimeout(() => {
        playSound(450, "sine", 0.3);
        onTriggerDialogue(
          "CKY",
          "¡¡Brrrrr!! ¡El piso helado y yo corriendo en cueros por la sala y el pasillo! ¡Qué vergüenza monumental si alguien me llega a ver!",
          "Brrrrr!! The floor is freezing and I'm sprinting naked across the living room and hallway! What monumental shame if someone sees me!",
          () => {
            onTriggerDialogue(
              "Ángela (Espíritu)",
              "¡Jajajajaja! ¡Corré CKY, corré como el viento! ¡A vestirse en el ropero antes de que te dé una pulmonía!",
              "Hahahahaha! Run CKY, run like the wind! Get dressed at the wardrobe before you catch pneumonia!"
            );
          }
        );
      }, 300);
      return;
    }

    if (currentDay === 3 && day3TowelMissingAgain && !day3RevealedSpiritW) {
      setTimeout(() => {
        playSound(450, "sine", 0.3);
        onTriggerDialogue(
          "CKY",
          "¡Ay ay ay, de nuevo en cueros cruzando la casa! ¡El piso de parquet está helado! ¡Esta vez estoy segura de que vi la toalla antes de bañarme!",
          "Oh no no, naked crossing the house again! The parquet floor is freezing! This time I'm positive I saw the towel before showering!",
          () => {
            onTriggerDialogue(
              "Ángela (Espíritu)",
              "¡Jajajajaja! ¡Es el misterio del siglo, CKY! ¡Corré a tu cuarto antes de que se te aparezca otro bicho volador o un espectro chusma!",
              "Hahahahaha! Mystery of the century, CKY! Run to your room before another bug or peeping ghost shows up!"
            );
          }
        );
      }, 300);
      return;
    }

    if (currentDay === 2 && day2TowelMissing && !day2TowelFoundOnChair) {
      setTimeout(() => {
        playSound(450, "sine", 0.3);
        onTriggerDialogue(
          "CKY",
          "¡Brrrr! ¡Qué frío está el piso! Cruzo apurada en cueros por la sala y el pasillo hacia mi pieza... ¡Espero que nadie me esté mirando por la ventana!",
          "Brrrr! The floor is so cold! Hurrying naked through the living room and hallway to my bedroom... Hope nobody is looking through the window!",
          () => {
            onTriggerDialogue(
              "Ángela (Espíritu)",
              "¡Jajajajaja! ¡Mirá ese pique al trotecito! ¡Apurate antes de que se te congelen las ideas! Dale que tu toalla tiene que estar arriba de la silla en tu habitación.",
              "Hahahahaha! Look at that sprint! Hurry up before you freeze! Go on, your towel must be on the chair in your bedroom."
            );
          }
        );
      }, 300);
      return;
    }

    if (!hasEncounteredCockroachToday) {
      setHasEncounteredCockroachToday(true);
      setTimeout(() => {
        playSound(700, "sawtooth", 0.4);
        onTriggerDialogue(
          "CKY",
          "¡Ahhhhhhhh! ¡UNA CUCARACHA VOLADORA GIGANTE EN LA HABITACIÓN!",
          "¡Ahhhhhhhh! A GIANT FLYING COCKROACH IN THE ROOM!",
          () => {
            setShowCockroachCombatModal(true);
          }
        );
      }, 350);
    }
  };

  // Curtains and Clock system states (Starts precisely at 5:00 AM = 300 total minutes)
  const [curtainsOpen, setCurtainsOpen] = useState<boolean>(false);
  const totalGameMinutesRef = useRef<number>(300);
  const last12hAutosaveMinutesRef = useRef<number>(300);
  const [totalGameMinutes, setTotalGameMinutes] = useState<number>(300);
  const [gameTime, setGameTime] = useState<{ hour: number; minute: number }>({ hour: 5, minute: 0 });
  const [actionCooldowns, setActionCooldowns] = useState<Record<string, number>>({});

  const check12hAutosave = (currentMins: number) => {
    if (currentMins - last12hAutosaveMinutesRef.current >= 720) {
      last12hAutosaveMinutesRef.current = currentMins;
      if (onAutosave) {
        onAutosave();
      }
      setSoundFeedback(
        language === "es"
          ? "💾 ¡Autoguardado de 12 Horas realizado!"
          : "💾 12-Hour Autosave performed!"
      );
    }
  };

  const advanceTime = (minutes: number) => {
    totalGameMinutesRef.current += minutes;
    const nextMinutes = totalGameMinutesRef.current;
    setTotalGameMinutes(nextMinutes);
    const h = Math.floor(nextMinutes / 60) % 24;
    const m = nextMinutes % 60;
    setGameTime({ hour: h, minute: m });

    if (minutes > 0) {
      setStats((prev) => ({
        ...prev,
        hambre: Math.max(0, prev.hambre - minutes * 0.05),
        sed: Math.max(0, prev.sed - minutes * 0.1),
        higiene: Math.max(0, (prev.higiene ?? 100) - minutes * 0.15),
        bateriaCelular: Math.max(0, (prev.bateriaCelular ?? 100) - minutes * 0.05),
      }));
    }

    check12hAutosave(nextMinutes);
  };

  const setGameTimeTo = (hour: number, minute: number) => {
    const totalMins = hour * 60 + minute;
    totalGameMinutesRef.current = totalMins;
    setTotalGameMinutes(totalMins);
    setGameTime({ hour, minute });
    check12hAutosave(totalMins);
  };

  const checkAction6h = (actionId: string): { allowed: boolean; remainingHours: number; remainingMins: number } => {
    const lastTime = actionCooldowns[actionId];
    if (lastTime === undefined) {
      return { allowed: true, remainingHours: 0, remainingMins: 0 };
    }
    const currentMins = totalGameMinutesRef.current;
    const diff = currentMins - lastTime;
    if (diff >= 360) {
      return { allowed: true, remainingHours: 0, remainingMins: 0 };
    }
    const rem = 360 - diff;
    const remH = Math.floor(rem / 60);
    const remM = rem % 60;
    return { allowed: false, remainingHours: remH, remainingMins: remM };
  };

  const recordAction6h = (actionId: string) => {
    setActionCooldowns((prev) => ({ ...prev, [actionId]: totalGameMinutesRef.current }));
  };

  // Mouse click pathfinding states
  const [walkPath, setWalkPath] = useState<Position[]>([]);
  const [pendingInteraction, setPendingInteraction] = useState<{ x: number; y: number; face: Direction } | null>(null);
  const [clickTarget, setClickTarget] = useState<{ x: number; y: number; time: number } | null>(null);
  const [showInventoryOverlay, setShowInventoryOverlay] = useState<boolean>(false);

  // Android Mobile Mobility: Turbo Sprint & Double-tap Run
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const lastTapTimeRef = useRef<number>(0);

  // Walking trigger after picking up books
  const lastPosRef = useRef<Position>(playerPos);
  useEffect(() => {
    if (lastPosRef.current.x === playerPos.x && lastPosRef.current.y === playerPos.y) {
      return;
    }
    lastPosRef.current = playerPos;

    if (pendingBooksWalkCheck && gameState === "playing") {
      setBooksWalkSteps((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          setPendingBooksWalkCheck(false);
          setTimeout(() => {
            onTriggerDialogue(
              "CKY",
              "Por las dudas voy a revisar que tenga todo.",
              "Just in case, I'll double check if I have everything.",
              () => {
                onTriggerDialogue(
                  "CKY",
                  "Solo me falta mi botella de agua favorita que esta en la Heladera.",
                  "I'm only missing my favorite water bottle, which is in the Fridge."
                );
              }
            );
          }, 120);
        }
        return next;
      });
    }
  }, [playerPos, pendingBooksWalkCheck, gameState, onTriggerDialogue]);

  // Trigger Day 2 walking dialogue after CKY takes her first steps
  useEffect(() => {
    if (
      currentDay === 2 &&
      !hasDay2WalkDialogueTriggered &&
      gameState === "playing" &&
      !isDay2Intro &&
      introStep === -1 &&
      (playerPos.x !== 8 || playerPos.y !== 3)
    ) {
      setHasDay2WalkDialogueTriggered(true);
      onTriggerDialogue(
        "CKY",
        "Pero mami no me va  a dejar ir!. Debo actuar como si voy a la escuela pero me tomo el 4!",
        "But Mom won't let me go! I must act like I'm going to school, but take bus Line 4!"
      );
    }
  }, [playerPos, currentDay, hasDay2WalkDialogueTriggered, gameState, isDay2Intro, introStep, onTriggerDialogue]);

  // Audio simulation (using standard visual audio feedback)
  const [soundFeedback, setSoundFeedback] = useState<string>("");

  // Sync canvas state to parent for save system
  useEffect(() => {
    if (onUpdateCanvasState) {
      onUpdateCanvasState({
        currentMap,
        playerPos,
        facing,
        gameTime,
        totalGameMinutes,
        actionCooldowns,
        classStep,
        neighborName,
        hasNeighborBoardedBus,
        hasPassengersBoarded,
        hasFirstClassFinished,
        hasKickedBallXP,
        hasVisitedHallway,
        hasSeenMomKitchenIntro,
        momInteractionCount,
        hasTakenMomsPerfume,
        hasTakenMomsPlantMoney,
        hasTriggeredMomPhotoEvent,
        isPhoneCharging,
        hasSearchedStreetTrash,
        hasTalkedToMomAfterSchool,
        siestaTaken,
        showerTakenAfterSiesta,
        hasReceivedUnknownPhoneCall,
        hasTalkedToAlanis,
        hasTalkedToAngela,
        currentDay,
        setHasTalkedToAlanis: (val: boolean) => setHasTalkedToAlanis(val),
        setHasTalkedToAngela: (val: boolean) => setHasTalkedToAngela(val),
        startDay2Intro: startDay2Intro
      });
    }
  }, [
    currentMap, playerPos, facing, gameTime, totalGameMinutes, actionCooldowns,
    classStep, neighborName, hasNeighborBoardedBus, hasPassengersBoarded,
    hasFirstClassFinished, hasKickedBallXP, hasVisitedHallway, hasSeenMomKitchenIntro,
    momInteractionCount, hasTakenMomsPerfume, hasTakenMomsPlantMoney,
    hasTriggeredMomPhotoEvent, isPhoneCharging, hasSearchedStreetTrash,
    hasTalkedToMomAfterSchool, siestaTaken, showerTakenAfterSiesta,
    hasReceivedUnknownPhoneCall, hasTalkedToAlanis, hasTalkedToAngela,
    currentDay, startDay2Intro
  ]);

  // Restore state when loading a save slot
  useEffect(() => {
    if (loadData) {
      if (loadData.currentMap) setCurrentMap(loadData.currentMap as any);
      if (loadData.playerPos) setPlayerPos(loadData.playerPos);
      if (loadData.facing) setFacing(loadData.facing);
      if (loadData.gameTime) setGameTime(loadData.gameTime);
      if (loadData.totalGameMinutes !== undefined) {
        setTotalGameMinutes(loadData.totalGameMinutes);
        totalGameMinutesRef.current = loadData.totalGameMinutes;
        last12hAutosaveMinutesRef.current = loadData.totalGameMinutes;
      }
      if (loadData.actionCooldowns) setActionCooldowns(loadData.actionCooldowns);
      if (loadData.classStep !== undefined) setClassStep(loadData.classStep);
      if (loadData.neighborName !== undefined) setNeighborName(loadData.neighborName);
      if (loadData.hasNeighborBoardedBus !== undefined) setHasNeighborBoardedBus(loadData.hasNeighborBoardedBus);
      if (loadData.hasPassengersBoarded !== undefined) setHasPassengersBoarded(loadData.hasPassengersBoarded);
      if (loadData.hasFirstClassFinished !== undefined) setHasFirstClassFinished(loadData.hasFirstClassFinished);
      if (loadData.hasKickedBallXP !== undefined) setHasKickedBallXP(loadData.hasKickedBallXP);
      if (loadData.hasVisitedHallway !== undefined) setHasVisitedHallway(loadData.hasVisitedHallway);
      if (loadData.hasSeenMomKitchenIntro !== undefined) setHasSeenMomKitchenIntro(loadData.hasSeenMomKitchenIntro);
      if (loadData.momInteractionCount !== undefined) setMomInteractionCount(loadData.momInteractionCount);
      if (loadData.hasTakenMomsPerfume !== undefined) setHasTakenMomsPerfume(loadData.hasTakenMomsPerfume);
      if (loadData.hasTakenMomsPlantMoney !== undefined) setHasTakenMomsPlantMoney(loadData.hasTakenMomsPlantMoney);
      if (loadData.hasTriggeredMomPhotoEvent !== undefined) setHasTriggeredMomPhotoEvent(loadData.hasTriggeredMomPhotoEvent);
      if (loadData.isPhoneCharging !== undefined) setIsPhoneCharging(loadData.isPhoneCharging);
      if (loadData.hasSearchedStreetTrash !== undefined) setHasSearchedStreetTrash(loadData.hasSearchedStreetTrash);
      if (loadData.hasTalkedToMomAfterSchool !== undefined) setHasTalkedToMomAfterSchool(loadData.hasTalkedToMomAfterSchool);
      if (loadData.siestaTaken !== undefined) setSiestaTaken(loadData.siestaTaken);
      if (loadData.showerTakenAfterSiesta !== undefined) setShowerTakenAfterSiesta(loadData.showerTakenAfterSiesta);
      if (loadData.hasReceivedUnknownPhoneCall !== undefined) setHasReceivedUnknownPhoneCall(loadData.hasReceivedUnknownPhoneCall);
      if (loadData.currentDay !== undefined) setCurrentDay(loadData.currentDay);

      if (loadData.currentDay === 2 || loadData.id === "dev_day_2") {
        setIsDay2Intro(true);
        setDay2IntroStep(1);
        setHasDay2WalkDialogueTriggered(false);
        setCurrentOutfit("pajamas");
        setHasBackpack(false);
        setHasPhone(false);
        setIsPhoneCharging(false);
        setHasGroomed(false);
        removeInventoryItem?.("pocket_phone");
        removeInventoryItem?.("mission_diary");
        removeInventoryItem?.("backpack_bag");
        removeInventoryItem?.("backpack_notebook");
        removeInventoryItem?.("backpack_mochila");
      } else {
        setIsDay2Intro(false);
      }

      if (loadData.currentDay === 8 || loadData.id === "dev_day_8") {
        setIsDay8Intro(true);
        setDay8IntroStep(1);
        setCurrentDay(8);
        setCurrentOutfit("pajamas_silk");
        setCurrentMap("bedroom");
        setPlayerPos({ x: 3, y: 4 });
      } else {
        setIsDay8Intro(false);
      }

      setIntroStep(-1);
    }
  }, [loadData]);

  // Sound generator
  const playSound = (freq: number, type: OscillatorType = "sine", duration = 0.1) => {
    if (isSilent) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.log("Audio API failed or blocked", e);
    }
  };

  // Sound trigger effects helper
  const triggerBeep = (freq: number) => {
    playSound(freq, "square", 0.08);
  };

  // Intro sequence helper controller
  const advanceIntro = () => {
    if (introStep === 0) {
      setIntroStep(1);
      triggerBeep(600);
    } else if (introStep === 1) {
      setIntroStep(2); // Día 1 screen
      triggerBeep(600);
    } else if (introStep === 2) {
      setIntroStep(3); // Phone Alarm 05:00 AM screen
      totalGameMinutesRef.current = 300;
      setTotalGameMinutes(300);
      setGameTime({ hour: 5, minute: 0 }); // Son las 5:00 AM!
      setActionCooldowns({});
      playSound(750, "square", 0.35);
    } else if (introStep === 3) {
      setIntroStep(4); // CKY intro greeting message screen
      triggerBeep(600);
    } else if (introStep === 4) {
      setIntroStep(5); // Waking up in bedroom
      setPlayerPos({ x: 8, y: 3 });
      setFacing("down");
      playSound(330, "sine", 0.4);
    } else if (introStep === 5) {
      setIntroStep(-1);
      playSound(880, "sine", 0.2);
    }
  };

  // Cinematic Intro Step 0
  const drawIntroStep0 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Glowing background aura
    const pulse = Math.sin(Date.now() / 200) * 0.15 + 0.85;
    const glowRadius = 160 * pulse;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 15, 10, width / 2, height / 2 - 15, glowRadius);
    glow.addColorStop(0, "rgba(234, 179, 8, 0.4)");
    glow.addColorStop(0.6, "rgba(234, 179, 8, 0.1)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 15, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Main striking title
    ctx.font = "bold 20px 'Press Start 2P', system-ui, sans-serif";
    ctx.fillStyle = "#eab308";
    ctx.shadowColor = "#fef08a";
    ctx.shadowBlur = 12;
    ctx.fillText("CKY: Heredera del poder supremo", width / 2, height / 2 - 15);
    ctx.shadowBlur = 0;

    // Prompt
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    const promptText = language === "es" ? "[ PRESIONA ENTER / ESPACIO / CLICK ]" : "[ PRESS ENTER / SPACE / CLICK ]";
    ctx.globalAlpha = pulse;
    ctx.fillText(promptText, width / 2, height - 40);
    ctx.globalAlpha = 1.0;
  };

  // Cinematic Intro Step 1
  const drawIntroStep1 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Chapter 1 heading in bright yellow
    ctx.fillStyle = "#eab308";
    ctx.font = "bold 24px 'Press Start 2P', system-ui, sans-serif";
    ctx.fillText(language === "es" ? "Capítulo 1" : "Chapter 1", width / 2, height / 2 - 30);

    // Subtitle
    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.fillText(language === "es" ? "Origen y Descubrimiento" : "Origin & Discovery", width / 2, height / 2 + 20);

    // Prompt
    const pulse = Math.sin(Date.now() / 250) * 0.2 + 0.8;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    const promptText = language === "es" ? "[ PRESIONA ENTER / ESPACIO / CLICK ]" : "[ PRESS ENTER / SPACE / CLICK ]";
    ctx.globalAlpha = pulse;
    ctx.fillText(promptText, width / 2, height - 40);
    ctx.globalAlpha = 1.0;
  };

  // Cinematic Intro Step 2: Día 1 (Fondo negro y letras amarillas que se esfumen)
  const drawIntroStepDia1 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Animated fade effect for "letras amarillas que se esfumen"
    const time = Date.now() / 450;
    const fadeOpacity = Math.sin(time) * 0.35 + 0.65; // Oscillates smoothly between 0.3 and 1.0

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    // Glowing yellow aura behind title
    const glowRadius = 140 * fadeOpacity;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 10, 10, width / 2, height / 2 - 10, glowRadius);
    glow.addColorStop(0, "rgba(234, 179, 8, 0.35)");
    glow.addColorStop(0.7, "rgba(234, 179, 8, 0.08)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Main title: Día 1
    ctx.font = "bold 28px 'Press Start 2P', system-ui, sans-serif";
    ctx.fillStyle = "#eab308";
    ctx.shadowColor = "#fef08a";
    ctx.shadowBlur = 16 * fadeOpacity;
    ctx.fillText(language === "es" ? "Día 1" : "Day 1", width / 2, height / 2 - 15);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillText(language === "es" ? "El Primer Día de Escuela" : "The First Day of School", width / 2, height / 2 + 25);
    ctx.restore();

    // Bottom prompt
    const pulse = Math.sin(Date.now() / 250) * 0.2 + 0.8;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    const promptText = language === "es" ? "[ PRESIONA ENTER / ESPACIO / CLICK ]" : "[ PRESS ENTER / SPACE / CLICK ]";
    ctx.globalAlpha = pulse;
    ctx.fillText(promptText, width / 2, height - 35);
    ctx.globalAlpha = 1.0;
  };

  // Cinematic Intro Step 3: Celular y Alarma 5:00 AM
  const drawIntroStepAlarm = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Centered smartphone / alarm frame
    const boxX = 30;
    const boxY = 40;
    const boxW = width - 60;
    const boxH = height - 80;

    // Outer phone body card
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // Glowing vibrating stroke border
    const vibe = Math.sin(Date.now() / 60) * 3;
    ctx.strokeStyle = "#38bdf8"; // Sky blue electric glow
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX + vibe * 0.3, boxY, boxW, boxH);

    // Pulsing alarm glow
    const pulse = Math.sin(Date.now() / 150) * 0.2 + 0.8;
    const glow = ctx.createRadialGradient(width / 2, boxY + 60, 10, width / 2, boxY + 60, 120 * pulse);
    glow.addColorStop(0, "rgba(56, 189, 248, 0.25)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, boxY + 60, 120 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Smartphone alarm icon
    ctx.font = "28px sans-serif";
    ctx.fillText("📱", width / 2, boxY + 22);

    // Digital time display: 05:00 AM
    ctx.font = "bold 26px 'Press Start 2P', system-ui, sans-serif";
    ctx.fillStyle = "#22c55e"; // Glowing digital alarm green
    ctx.shadowColor = "#4ade80";
    ctx.shadowBlur = 12 * pulse;
    ctx.fillText("05:00 AM", width / 2, boxY + 65);
    ctx.shadowBlur = 0;

    // Alarm sound label / status
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("⏰ ¡BZZZ! ¡BZZZ! ¡ALARMA!", width / 2, boxY + 112);

    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(
      language === "es" ? "El teléfono celular suena fuertemente." : "The cell phone alarm rings loudly.",
      width / 2,
      boxY + 138
    );
    ctx.fillText(
      language === "es" ? "¡Es hora de despertarse!" : "It's time to wake up!",
      width / 2,
      boxY + 156
    );

    // Bottom prompt
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#eab308";
    const promptText = language === "es" ? "[ PRESIONA ENTER / ESPACIO / CLICK ]" : "[ PRESS ENTER / SPACE / CLICK ]";
    ctx.globalAlpha = pulse;
    ctx.fillText(promptText, width / 2, boxY + boxH - 22);
    ctx.globalAlpha = 1.0;
  };

  // Cinematic Intro Step 4: Message from CKY
  const drawIntroStepMsg = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Centered dialogue container box
    const boxX = 20;
    const boxY = 35;
    const boxW = width - 40;
    const boxH = height - 70;

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Header label
    ctx.fillStyle = "#eab308";
    ctx.font = "bold 12px 'Press Start 2P', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("👩 CKY", width / 2, boxY + 16);

    // Gold accent divider line
    ctx.strokeStyle = "rgba(234, 179, 8, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + 24, boxY + 38);
    ctx.lineTo(boxX + boxW - 24, boxY + 38);
    ctx.stroke();

    // Narrative text
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const lines = [
      "¡Hola!",
      "Mi nombre es CKY, soy una chica normal",
      "de 15 años y te invito a conocer mi historia.",
      "",
      "Hoy es el primer día de Escuela del año ¿Vamos?"
    ];

    let startY = boxY + 52;
    for (const line of lines) {
      if (line === "") {
        startY += 8;
        continue;
      }
      if (line.includes("¿Vamos?")) {
        ctx.fillStyle = "#fde047"; // Bright gold accent
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
      } else if (line.startsWith("¡Hola!")) {
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 12px 'JetBrains Mono', monospace";
      } else {
        ctx.fillStyle = "#f8fafc";
        ctx.font = "11px 'JetBrains Mono', monospace";
      }
      ctx.fillText(line, width / 2, startY);
      startY += 20;
    }

    // Bottom prompt
    const pulse = Math.sin(Date.now() / 250) * 0.2 + 0.8;
    ctx.fillStyle = "#eab308";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    const promptText = language === "es" ? "[ PRESIONA ENTER / ESPACIO / CLICK ]" : "[ PRESS ENTER / SPACE / CLICK ]";
    ctx.globalAlpha = pulse;
    ctx.fillText(promptText, width / 2, boxY + boxH - 22);
    ctx.globalAlpha = 1.0;
  };

  // Cinematic dialogue box renderer
  const drawIntroDialogueBox = (ctx: CanvasRenderingContext2D, speaker: string, textEs: string, textEn: string, width: number, height: number) => {
    const boxX = 15;
    const boxY = height - 105;
    const boxW = width - 30;
    const boxH = 90;

    ctx.fillStyle = "rgb(15, 23, 42)";
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#eab308";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(speaker, boxX + 12, boxY + 12);

    ctx.fillStyle = "#ffffff";
    ctx.font = "10px 'JetBrains Mono', monospace";

    const text = language === "es" ? textEs : textEn;
    const words = text.split(" ");
    let line = "";
    let lines = [];
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > boxW - 24 && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    for (let i = 0; i < lines.length && i < 3; i++) {
      ctx.fillText(lines[i], boxX + 12, boxY + 28 + i * 14);
    }

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "bold 7px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    const prompt = language === "es" ? "[ ESPACIO/CLICK ]" : "[ SPACE/CLICK ]";
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    ctx.globalAlpha = pulse;
    ctx.fillText(prompt, boxX + boxW - 12, boxY + boxH - 18);
    ctx.globalAlpha = 1.0;
  };

  // Cinematic Intro Step: Día 2 "Una nueva amiga"
  const drawIntroStepDia2 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const time = Date.now() / 450;
    const fadeOpacity = Math.sin(time) * 0.35 + 0.65;

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    const glowRadius = 140 * fadeOpacity;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 10, 10, width / 2, height / 2 - 10, glowRadius);
    glow.addColorStop(0, "rgba(244, 114, 182, 0.35)");
    glow.addColorStop(0.7, "rgba(234, 179, 8, 0.12)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Title: Día 2
    ctx.font = "bold 28px 'Press Start 2P', system-ui, sans-serif";
    ctx.fillStyle = "#f472b6";
    ctx.shadowColor = "#fbcfe8";
    ctx.shadowBlur = 16 * fadeOpacity;
    ctx.fillText(language === "es" ? "Día 2" : "Day 2", width / 2, height / 2 - 15);
    ctx.shadowBlur = 0;

    // Subtitle: Una nueva amiga
    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    ctx.fillText(language === "es" ? "Una nueva amiga" : "A New Friend", width / 2, height / 2 + 25);
    ctx.restore();

    // Bottom prompt
    const pulse = Math.sin(Date.now() / 250) * 0.2 + 0.8;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    const promptText = language === "es" ? "[ PRESIONA ENTER / ESPACIO / CLICK ]" : "[ PRESS ENTER / SPACE / CLICK ]";
    ctx.globalAlpha = pulse;
    ctx.fillText(promptText, width / 2, height - 35);
    ctx.globalAlpha = 1.0;
  };

  const advanceDay2Intro = () => {
    if (day2IntroStep === 1) {
      setDay2IntroStep(2);
      totalGameMinutesRef.current = 1440 + 300;
      setTotalGameMinutes(1440 + 300);
      setGameTime({ hour: 5, minute: 0 });
      triggerBeep(600);
    } else {
      finishDay2Intro();
    }
  };

  const finishDay2Intro = () => {
    setIsDay2Intro(false);
    setDay2IntroStep(1);
    setCurrentDay(2);
    totalGameMinutesRef.current = 1440 + 300; // Day 2 05:00 AM
    setTotalGameMinutes(1440 + 300);
    setGameTime({ hour: 5, minute: 0 });
    setCurrentMap("bedroom");
    setPlayerPos({ x: 8, y: 3 });
    setFacing("down");
    setCurrentOutfit("pajamas");
    setHasBackpack(false);
    setHasPhone(true);
    setIsPhoneCharging(false);
    setHasGroomed(false);
    setHasDay2WalkDialogueTriggered(false);

    removeInventoryItem?.("pocket_phone");
    removeInventoryItem?.("mission_diary");
    removeInventoryItem?.("backpack_bag");
    removeInventoryItem?.("backpack_notebook");
    removeInventoryItem?.("backpack_mochila");

    playSound(750, "square", 0.35);

    onTriggerDialogue(
      "CKY",
      "Que emoción!!! tengo una misión importante",
      "How exciting! I have an important mission!"
    );
  };

  // Cinematic Intro Step: Día 3 "Viernes - El Despertar"
  const drawIntroStepDia3 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const time = Date.now() / 450;
    const fadeOpacity = Math.sin(time) * 0.35 + 0.65;

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    const glowRadius = 140 * fadeOpacity;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 10, 10, width / 2, height / 2 - 10, glowRadius);
    glow.addColorStop(0, "rgba(234, 179, 8, 0.35)");
    glow.addColorStop(0.7, "rgba(168, 85, 247, 0.15)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Title: Día 3
    ctx.font = "bold 28px 'Press Start 2P', system-ui, sans-serif";
    ctx.fillStyle = "#facc15";
    ctx.shadowColor = "#fef08a";
    ctx.shadowBlur = 16 * fadeOpacity;
    ctx.fillText(language === "es" ? "Día 3" : "Day 3", width / 2, height / 2 - 15);
    ctx.shadowBlur = 0;

    // Subtitle: Viernes y tu cuerpo lo sabe
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    ctx.fillText(language === "es" ? "Viernes y tu cuerpo lo sabe" : "Friday and your body knows it", width / 2, height / 2 + 25);
    ctx.restore();

    // Bottom prompt
    const pulse = Math.sin(Date.now() / 250) * 0.2 + 0.8;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    const promptText = language === "es" ? "[ PRESIONA ENTER / ESPACIO / CLICK ]" : "[ PRESS ENTER / SPACE / CLICK ]";
    ctx.globalAlpha = pulse;
    ctx.fillText(promptText, width / 2, height - 35);
    ctx.globalAlpha = 1.0;
  };

  const advanceDay3Intro = () => {
    if (day3IntroStep === 1) {
      setDay3IntroStep(2);
      totalGameMinutesRef.current = 2880 + 390; // 06:30 AM Day 3
      setTotalGameMinutes(2880 + 390);
      setGameTime({ hour: 6, minute: 30 });
      triggerBeep(600);
    } else {
      finishDay3Intro();
    }
  };

  const finishDay3Intro = () => {
    setIsDay3Intro(false);
    setDay3IntroStep(1);
    setCurrentDay(3);
    totalGameMinutesRef.current = 2880 + 390; // Day 3 06:30 AM
    setTotalGameMinutes(2880 + 390);
    setGameTime({ hour: 6, minute: 30 });
    setCurrentMap("bedroom");
    setPlayerPos({ x: 8, y: 3 });
    setFacing("down");
    setCurrentOutfit("pajamas");
    setHasGroomed(false);

    playSound(750, "square", 0.35);

    onTriggerDialogue(
      "Ángela (Espíritu)",
      "¡Viernes y tu cuerpo lo sabe, CKY! ¡Arriba dormilona! Hoy vamos a desenmascarar a esa vecina bruja y pasarla genial.",
      "Friday and your body knows it, CKY! Rise and shine, sleepyhead! Today we'll unmask that witch neighbor and have a blast.",
      () => {
        onTriggerDialogue(
          "CKY",
          "¡Jajajaja hola Ángela! ¡Totalmente, por fin viernes! Qué lindo despertar con energía. Me voy a preparar.",
          "Hahahaha good morning Angela! Totally, finally Friday! How wonderful waking up energized. Let me get ready."
        );
      }
    );
  };

  // Cinematic Intro Step: Día 4 "Sábado - El Tesoro y las Compras"
  const drawIntroStepDia4 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const time = Date.now() / 450;
    const fadeOpacity = Math.sin(time) * 0.35 + 0.65;

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    const glowRadius = 150 * fadeOpacity;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 10, 10, width / 2, height / 2 - 10, glowRadius);
    glow.addColorStop(0, "rgba(251, 191, 36, 0.45)");
    glow.addColorStop(0.5, "rgba(244, 63, 94, 0.25)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Title: Día 4
    ctx.font = "bold 28px 'Press Start 2P', system-ui, sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.shadowColor = "#fde047";
    ctx.shadowBlur = 18 * fadeOpacity;
    ctx.fillText(language === "es" ? "Día 4" : "Day 4", width / 2, height / 2 - 18);
    ctx.shadowBlur = 0;

    // Subtitle: Sábado - Tesoro, Compras y Diversión
    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillText(
      language === "es" ? "Sábado: Ruinas, Tesoro y Lencería Sexy" : "Saturday: Ruins, Treasure & Sexy Lingerie",
      width / 2,
      height / 2 + 22
    );
    ctx.restore();

    // Bottom prompt
    const pulse = Math.sin(Date.now() / 250) * 0.2 + 0.8;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    const promptText = language === "es" ? "[ PRESIONA ENTER / ESPACIO / CLICK ]" : "[ PRESS ENTER / SPACE / CLICK ]";
    ctx.globalAlpha = pulse;
    ctx.fillText(promptText, width / 2, height - 35);
    ctx.globalAlpha = 1.0;
  };

  const advanceDay4Intro = () => {
    if (day4IntroStep === 1) {
      setDay4IntroStep(2);
      totalGameMinutesRef.current = 4320 + 360; // 06:00 AM Day 4 (Saturday)
      setTotalGameMinutes(4320 + 360);
      setGameTime({ hour: 6, minute: 0 });
      triggerBeep(600);
    } else {
      finishDay4Intro();
    }
  };

  const finishDay4Intro = () => {
    setIsDay4Intro(false);
    setDay4IntroStep(1);
    setCurrentDay(4);
    totalGameMinutesRef.current = 4320 + 360; // Day 4 06:00 AM
    setTotalGameMinutes(4320 + 360);
    setGameTime({ hour: 6, minute: 0 });
    setCurrentMap("bedroom");
    setPlayerPos({ x: 8, y: 3 });
    setFacing("down");
    setCurrentOutfit("pajamas");
    setHasGroomed(false);

    playSound(750, "square", 0.35);

    onTriggerDialogue(
      "Ángela (Espíritu)",
      "¡¡CKY, CKY, ARRIBA!! ¡Hoy es sábado de gloria! W dice que las colinas del Valle de las Ruinas están despejadas para buscar el antiguo tesoro.",
      "CKY, CKY, WAKE UP!! Today is a glorious Saturday! W says the Valley of the Ruins is clear to seek the ancient treasure.",
      () => {
        onTriggerDialogue(
          "W (Espíritu Guardián)",
          "Saludos matutinos, Señora Heredera. Confirmo que el sello de las reliquias ancestrales aguarda nuestra presencia en las ruinas colindantes.",
          "Morning greetings, Lady Heir. I confirm the ancient relic seal awaits our presence in the adjacent ruins.",
          () => {
            onTriggerDialogue(
              "CKY",
              "¡Buenísimo equipo! Nos vestimos, salimos a la calle y tomamos el colectivo hacia el Valle de las Ruinas. ¡A buscar ese tesoro!",
              "Awesome team! Let's get dressed, head outside and take the bus to the Valley of the Ruins. Let's find that treasure!"
            );
          }
        );
      }
    );
  };

  // Cinematic Intro Step: Día 5 "Domingo - Limpieza Profunda"
  const drawIntroStepDia5 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const time = Date.now() / 450;
    const fadeOpacity = Math.sin(time) * 0.35 + 0.65;

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    const glowRadius = 150 * fadeOpacity;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 10, 10, width / 2, height / 2 - 10, glowRadius);
    glow.addColorStop(0, "rgba(59, 130, 246, 0.45)");
    glow.addColorStop(0.5, "rgba(16, 185, 129, 0.25)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#60a5fa";
    ctx.font = "900 36px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText(language === "es" ? "DÍA 5" : "DAY 5", width / 2, height / 2 - 32);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 16px 'JetBrains Mono', monospace, sans-serif";
    ctx.fillText(
      language === "es" ? "DOMINGO: LIMPIEZA PROFUNDA Y CARRERA" : "SUNDAY: DEEP CLEANING & RACE",
      width / 2,
      height / 2 + 10
    );

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px 'JetBrains Mono', monospace, sans-serif";
    ctx.fillText(
      language === "es"
        ? "¡Mamá ordena limpiar la casa! W se transforma en útiles arcanos contra alimañas."
        : "Mom orders deep house cleaning! W transforms into tools against pests.",
      width / 2,
      height / 2 + 38
    );
    ctx.restore();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'JetBrains Mono', monospace, sans-serif";
    const promptText =
      language === "es"
        ? "Presiona [ESPACIO] o [ENTER] o haz clic para despertar"
        : "Press [SPACE] or [ENTER] or click to wake up";
    ctx.fillText(promptText, width / 2, height - 35);
    ctx.globalAlpha = 1.0;
  };

  const advanceDay5Intro = () => {
    if (day5IntroStep === 1) {
      setDay5IntroStep(2);
      totalGameMinutesRef.current = 5760 + 450; // 07:30 AM Day 5 (Sunday)
      setTotalGameMinutes(5760 + 450);
      setGameTime({ hour: 7, minute: 30 });
      triggerBeep(600);
    } else {
      finishDay5Intro();
    }
  };

  const finishDay5Intro = () => {
    setIsDay5Intro(false);
    setDay5IntroStep(1);
    setCurrentDay(5);
    totalGameMinutesRef.current = 5760 + 450; // Day 5 07:30 AM
    setTotalGameMinutes(5760 + 450);
    setGameTime({ hour: 7, minute: 30 });
    setCurrentMap("bedroom");
    setPlayerPos({ x: 8, y: 3 });
    setFacing("down");
    setCurrentOutfit("pajamas");
    setHasGroomed(false);
    playSound(750, "square", 0.35);
    onTriggerDialogue(
      "Mamá (Grito Matutino)",
      "¡¡CKY!! ¡¡LEVÁNTATE YA MISMO!! ¡Hoy es domingo de LIMPIEZA PROFUNDA! ¡Quiero toda la casa brillando de punta a punta: tu habitación, el baño, el living y la cocina! ¡Y no te olvides de sacar las arañas y bichos de los rincones!",
      "CKY!! GET UP RIGHT NOW!! Today is DEEP CLEANING Sunday! I want the whole house sparkling: your bedroom, bathroom, living room, and kitchen! And clear out all the spiders and dust pests!",
      () => {
        onTriggerDialogue(
          "W (Espíritu Guardián)",
          "Señora Heredera, no os preocupéis. Mis facultades astrales de metamorfosis están a vuestra total disposición: puedo transfigurarme en Plumero Celestial, Mopa Purificadora, Escoba Sagrada o Aspiradora Arcana para exterminar toda alimaña.",
          "Lady Heir, fret not. My astral metamorphic faculties are at your service: I can transfigure into Celestial Duster, Purifying Mop, Sacred Broom, or Arcane Vacuum to exterminate all vermin.",
          () => {
            onTriggerDialogue(
              "Ángela (Espíritu)",
              "¡¡Jajajaja pobre CKY, te despertaron con la sirena de bomberos de tu vieja!! ¡Dale, pongamos a W a trabajar como plumero mágico que hoy dejamos la casa reluciente!",
              "HAHAHA poor CKY, woken up by your mom's fire alarm voice!! Let's put W to work as a magic feather duster, let's leave this house sparkling!"
            );
          }
        );
      }
    );
  };

  // Cinematic Intro Step: Día 6 "Lunes - La Forma Oscura y el Alma Gemela Híbrida"
  const drawIntroStepDia6 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const time = Date.now() / 400;
    const fadeOpacity = Math.sin(time) * 0.35 + 0.65;

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    const glowRadius = 160 * fadeOpacity;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 10, 10, width / 2, height / 2 - 10, glowRadius);
    glow.addColorStop(0, "rgba(147, 51, 234, 0.5)");
    glow.addColorStop(0.5, "rgba(245, 158, 11, 0.3)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c084fc";
    ctx.font = "900 36px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText(language === "es" ? "DÍA 6" : "DAY 6", width / 2, height / 2 - 32);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 15px 'JetBrains Mono', monospace, sans-serif";
    ctx.fillText(
      language === "es" ? "LUNES: LA FORMA OSCURA Y EL ALMA GEMELA" : "MONDAY: DARK FORM & HYBRID SOULMATE",
      width / 2,
      height / 2 + 10
    );

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px 'JetBrains Mono', monospace, sans-serif";
    ctx.fillText(
      language === "es"
        ? "Amanecer a las 05:45 AM. ¡Una figura misteriosa del Limbo invade la habitación!"
        : "Dawn at 05:45 AM. A mysterious figure from Limbo invades the bedroom!",
      width / 2,
      height / 2 + 38
    );
    ctx.restore();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'JetBrains Mono', monospace, sans-serif";
    const promptText =
      language === "es"
        ? "Presiona [ESPACIO] o [ENTER] o haz clic para despertar"
        : "Press [SPACE] or [ENTER] or click to wake up";
    ctx.fillText(promptText, width / 2, height - 35);
    ctx.globalAlpha = 1.0;
  };

  const advanceDay6Intro = () => {
    if (day6IntroStep === 1) {
      setDay6IntroStep(2);
      totalGameMinutesRef.current = 1440 * 5 + 345; // 05:45 AM Day 6 (Monday)
      setTotalGameMinutes(1440 * 5 + 345);
      setGameTime({ hour: 5, minute: 45 });
      triggerBeep(600);
    } else {
      finishDay6Intro();
    }
  };

  const finishDay6Intro = () => {
    setIsDay6Intro(false);
    setDay6IntroStep(1);
    setCurrentDay(6);
    totalGameMinutesRef.current = 1440 * 5 + 345; // Day 6 05:45 AM (Monday)
    setTotalGameMinutes(1440 * 5 + 345);
    setGameTime({ hour: 5, minute: 45 });
    setCurrentMap("bedroom");
    setPlayerPos({ x: 3, y: 4 });
    setFacing("right");
    setCurrentOutfit("pajamas_silk");
    setHasGroomed(false);
    playSound(580, "sawtooth", 0.4);
    onTriggerDialogue(
      "CKY",
      "¡¡Uff!! ¿Qué es ese frío polar y esa niebla púrpura en la pieza a las 5:45 AM...? ¡¡Hay una figura oscura encapuchada parada frente a mí!!",
      "Phew!! What is that freezing cold and purple mist in the room at 5:45 AM...? There's a hooded dark figure standing right in front of me!!",
      () => {
        onTriggerDialogue(
          "Ángela (Espíritu)",
          "¡Ojo CKY! ¡Tiene energía del Limbo! ¡W, armá el escudo sagrado y nosotras lo reventamos a magiazos!",
          "Watch out CKY! It has Limbo energy! W, raise the sacred shield and we'll blast it with magic!"
        );
      }
    );
  };

  // Day 7 Intro Screen: "DÍA 7 - INJUSTICIA"
  const drawIntroStepDia7 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    const glowRadius = 170 * fadeOpacity;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 10, 10, width / 2, height / 2 - 10, glowRadius);
    glow.addColorStop(0, "rgba(239, 68, 68, 0.4)");
    glow.addColorStop(0.5, "rgba(147, 51, 234, 0.3)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f87171";
    ctx.font = "900 36px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText(language === "es" ? "DÍA 7" : "DAY 7", width / 2, height / 2 - 32);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 15px 'JetBrains Mono', monospace, sans-serif";
    ctx.fillText(
      language === "es" ? "MARTES: INJUSTICIA Y EL LABERINTO DEL SÓTANO" : "TUESDAY: INJUSTICE & THE BASEMENT MAZE",
      width / 2,
      height / 2 + 10
    );

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px 'JetBrains Mono', monospace, sans-serif";
    ctx.fillText(
      language === "es"
        ? "W descifró el Grimorio. Pero una orden corrupta de la Vecina desatará el caos en la escuela."
        : "W deciphered the Grimoire. But a corrupt order from the Neighbor will unleash chaos at school.",
      width / 2,
      height / 2 + 38
    );
    ctx.restore();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'JetBrains Mono', monospace, sans-serif";
    const promptText =
      language === "es"
        ? "Presiona [ESPACIO] o [ENTER] o haz clic para despertar"
        : "Press [SPACE] or [ENTER] or click to wake up";
    ctx.fillText(promptText, width / 2, height - 35);
    ctx.globalAlpha = 1.0;
  };

  const advanceDay7Intro = () => {
    if (day7IntroStep === 1) {
      setDay7IntroStep(2);
      totalGameMinutesRef.current = 1440 * 6 + 360; // 06:00 AM Day 7 (Tuesday)
      setTotalGameMinutes(1440 * 6 + 360);
      setGameTime({ hour: 6, minute: 0 });
      triggerBeep(600);
    } else {
      finishDay7Intro();
    }
  };

  const finishDay7Intro = () => {
    setIsDay7Intro(false);
    setDay7IntroStep(1);
    setCurrentDay(7);
    totalGameMinutesRef.current = 1440 * 6 + 360; // Day 7 06:00 AM (Tuesday)
    setTotalGameMinutes(1440 * 6 + 360);
    setGameTime({ hour: 6, minute: 0 });
    setCurrentMap("bedroom");
    setPlayerPos({ x: 3, y: 4 });
    setFacing("right");
    setCurrentOutfit("pajamas_silk");
    setHasGroomed(false);
    playSound(650, "sine", 0.4);
    onTriggerDialogue(
      "W (Guardián Celestial Ancestral)",
      "¡Mi señora CKY! He pasado la noche entera estudiando cada runa del 'Grimorio de las Sombras Escolares'. He detectado los núcleos oscuros y las debilidades elementales de cada poseído por la Vecina.",
      "My lady CKY! I have spent the whole night studying the runes of the Grimoire. I detected the exact weaknesses of each possessed victim.",
      () => {
        onTriggerDialogue(
          "W (Estrategia Táctica)",
          "Nuestra táctica debe ser estricta: debemos luchar del más débil al más fuerte. Al quebrar los núcleos menores primero, debilitaremos la red de corrupción que alimenta a los espíritus mayores sin sobrecargar nuestra energía.",
          "Our tactic must be strict: fight from weakest to strongest. Breaking the lesser cores first weakens the greater corruption network.",
          () => {
            onTriggerDialogue(
              `${soulmateInfo?.name || "Alma Gemela"}`,
              "Posta, W tiene toda la razón. Si nos mandamos de una contra los más pesados nos van a hacer percha. Hay que ir limpiando a los poseídos en orden. Preparémonos y salgamos para el colegio.",
              "For real, W is totally right. If we go straight against the heavy hitters they'll wreck us. Let's get ready and head to school.",
              () => {
                onTriggerDialogue(
                  "Ángela (Espíritu)",
                  "¡Totalmente de acuerdo! Ya sabés la rutina de campeona: uniforme escolar del ropero, la mochila para llenarla de porquerías, agua fresca de la heladera, el sándwich de salame y los libros. ¡Hoy hacemos justicia!",
                  "Totally agree! You know the champion routine: school uniform, backpack, fresh water, salami sandwich and school books. Today we bring justice!",
                  () => {
                    setDay7GrimoireStrategyExplained(true);
                    localStorage.setItem("cky_day7_grimoire_strat", "true");
                    addXP(20);
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  // Day 8 Intro: "DÍA 8 - ATAQUE FINAL"
  const startDay8Intro = () => {
    setIsDay8Intro(true);
    setDay8IntroStep(1);
    setFadeOpacity(1);
    playSound(700, "sine", 0.5);
  };

  const drawIntroStepDia8 = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    const glowRadius = 180 * fadeOpacity;
    const glow = ctx.createRadialGradient(width / 2, height / 2 - 10, 10, width / 2, height / 2 - 10, glowRadius);
    glow.addColorStop(0, "rgba(220, 38, 38, 0.45)");
    glow.addColorStop(0.5, "rgba(147, 51, 234, 0.35)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ef4444";
    ctx.font = "900 36px 'Press Start 2P', monospace, sans-serif";
    ctx.fillText(language === "es" ? "DÍA 8" : "DAY 8", width / 2, height / 2 - 32);

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 15px 'JetBrains Mono', monospace, sans-serif";
    ctx.fillText(
      language === "es" ? "MIÉRCOLES: ATAQUE FINAL A LA CIUDAD" : "WEDNESDAY: FINAL ATTACK ON THE CITY",
      width / 2,
      height / 2 + 10
    );

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px 'JetBrains Mono', monospace, sans-serif";
    ctx.fillText(
      language === "es"
        ? "El asedio simultáneo ha comenzado. W y Ángela alertan los 4 puntos de asalto."
        : "The simultaneous siege has begun. W and Ángela alert the 4 assault targets.",
      width / 2,
      height / 2 + 38
    );
    ctx.restore();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'JetBrains Mono', monospace, sans-serif";
    const promptText =
      language === "es"
        ? "Presiona [ESPACIO] o [ENTER] o haz clic para despertar"
        : "Press [SPACE] or [ENTER] or click to wake up";
    ctx.fillText(promptText, width / 2, height - 35);
    ctx.globalAlpha = 1.0;
  };

  const advanceDay8Intro = () => {
    if (day8IntroStep === 1) {
      setDay8IntroStep(2);
      totalGameMinutesRef.current = 1440 * 7 + 360; // 06:00 AM Day 8 (Wednesday)
      setTotalGameMinutes(1440 * 7 + 360);
      setGameTime({ hour: 6, minute: 0 });
      triggerBeep(600);
    } else {
      finishDay8Intro();
    }
  };

  const finishDay8Intro = () => {
    setIsDay8Intro(false);
    setDay8IntroStep(1);
    setCurrentDay(8);
    totalGameMinutesRef.current = 1440 * 7 + 360; // Day 8 06:00 AM (Wednesday)
    setTotalGameMinutes(1440 * 7 + 360);
    setGameTime({ hour: 6, minute: 0 });
    setCurrentMap("bedroom");
    setPlayerPos({ x: 3, y: 4 });
    setFacing("right");
    setCurrentOutfit("pajamas_silk");
    setHasGroomed(false);
    playSound(650, "sine", 0.4);
    unlockDiaryEntry("chapter_08_day8_wake_up_alarm");

    onTriggerDialogue(
      "W (Espíritu Guardián Ancestral - Alerta Roja)",
      "¡Señora CKY! ¡Despierte con premura! Mis sensores astrales están al borde del colapso. La Vecina ha lanzado el Gran Asalto Coordinado que predijo el grimorio.",
      "Lady CKY! Wake up at once! My astral sensors are on the brink of collapse. The Neighbor has launched the Grand Coordinated Assault predicted by the grimoire.",
      () => {
        onTriggerDialogue(
          "W (Puntos de Invasión)",
          "Hay cuatro focos neurálgicos siendo arrasados por poderosos espíritus del Limbo: la Plaza Principal, el Hospital Municipal, la Terminal de Ómnibus y el Centro Comercial. ¡Debemos destruir a cada uno de esos cuatro espíritus para salvar a la gente!",
          "There are four critical hotspots being ravaged by powerful Limbo spirits: the Main Plaza, Municipal Hospital, Bus Terminal, and Shopping Mall. We must destroy each of those four spirits to save everyone!",
          () => {
            onTriggerDialogue(
              "Ángela (Espíritu)",
              "¡Olvidate del colegio hoy CKY! ¡Ni en pedo vas con uniforme! Ponete ropa común y zapatillas de batalla en el ropero. ¡Hoy nos jugamos el pellejo en las calles!",
              "Forget school today CKY! No way you're going in uniform! Put on casual clothes and battle sneakers from the wardrobe. Today our necks are on the line in the streets!",
              () => {
                onTriggerDialogue(
                  "CKY (Determinada)",
                  "Entendido. Hoy no hay clases... ¡hay guerra contra las sombras! Me pongo ropa casual cómoda en el ropero y salimos ya mismo.",
                  "Understood. No classes today... it's war against the shadows! I'll put on comfortable casual clothes in the wardrobe and we head out right away.",
                  () => {
                    setDay8MorningTalkDone(true);
                    localStorage.setItem("cky_day8_morning_talk_done", "true");
                    addXP(25);
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  const triggerDay8StreetSoulmateCutscene = () => {
    playSound(400, "sawtooth", 0.5);
    onTriggerDialogue(
      `${soulmateInfo?.name || "Kael"} (Alma Gemela Híbrida)`,
      "Ah... hola, CKY. Veo que ya te enteraste de la conmoción y el caos que azotan la ciudad. Qué lástima. Yo tengo... otros asuntos urgentes que atender por mi cuenta. Les deseo mucha suerte lidiando con los espíritus. Van a necesitarla.",
      "Ah... hello, CKY. I see you're aware of the turmoil and chaos plaguing the city. What a pity. I have... other urgent matters to attend to on my own. I wish you the best of luck dealing with the spirits. You'll need it.",
      () => {
        onTriggerDialogue(
          "CKY (Descolocada)",
          "¿Otros asuntos por tu cuenta? ¿De qué hablás? ¡Se suponía que éramos un equipo de almas gemelas destinadas a salvar el pueblo juntos!",
          "Other matters on your own? What are you talking about? We're supposed to be a team of soulmates destined to save the town together!",
          () => {
            onTriggerDialogue(
              `${soulmateInfo?.name || "Kael"} (Sonrisa Forzada y Mirada Fría)`,
              "Las cosas cambian rápido, CKY. Mis lealtades y mis prioridades son más elevadas de lo que creés. No se distraigan... o la ciudad no durará ni hasta el mediodía. (Se desvanece entre sombras hacia el final de la calle)",
              "Things change quickly, CKY. My loyalties and priorities are higher than you think. Don't get distracted... or this city won't last until noon. (Fades into shadows toward the end of the street)",
              () => {
                onTriggerDialogue(
                  "Ángela (Espíritu)",
                  "¿¿Pero qué bicho le picó a este pibe?? ¡Actúa más raro que perro verde! Tiene una vibra helada y turbia que no me gusta un pelo... W, ¿vos qué decís?",
                  "What on earth got into this guy?? Acting weirder than a green dog! He's got an icy, murky vibe I don't trust one bit... W, what do you say?",
                  () => {
                    onTriggerDialogue(
                      "W (Espíritu Guardián)",
                      "Sus hebras de éter estaban distorsionadas y teñidas de oscuridad. No podemos fiarnos ciegamente de él, Señora CKY. Mantengamos la guardia en alto. Nuestra prioridad absoluta es defender los cuatro sectores invadidos: la Plaza, el Hospital, la Terminal y el Centro Comercial.",
                      "His etheric threads were warped and stained with darkness. We cannot place blind faith in him, Lady CKY. Keep your guard up. Our absolute priority is defending the four besieged sectors: the Plaza, Hospital, Terminal, and Mall.",
                      () => {
                        setDay8StreetSoulmateMet(true);
                        localStorage.setItem("cky_day8_street_soulmate_met", "true");
                        unlockDiaryEntry("chapter_08_street_soulmate_suspicion");
                        playSound(650, "sine", 0.4);
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  const checkDay8AllDefended = (
    plaza: boolean,
    hospital: boolean,
    terminal: boolean,
    mall: boolean
  ) => {
    if (plaza && hospital && terminal && mall && !day8AllDefendedReportDone) {
      setTimeout(() => {
        playSound(880, "sine", 0.6);
        onTriggerDialogue(
          "W (Espíritu Guardián Ancestral)",
          "¡Victoria colosal, Señora CKY! Los cuatro focos de asedio del Limbo han sido totalmente purificados. Los habitantes y la ciudad están a salvo del asalto. Sin embargo...",
          "Colossal victory, Lady CKY! The four Limbo siege points have been completely purified. The citizens and the town are safe from the assault. However...",
          () => {
            playSound(350, "sawtooth", 0.5);
            onTriggerDialogue(
              "W (Detección de la Fuente)",
              "Siento una concentración inimaginable de malicia y miasma espectral convergiendo en un único punto en nuestra calle... ¡La casa de Paula, la Vecina! Ella es la causa raíz de todo. Debemos ir a su puerta de inmediato para poner fin a esta pesadilla.",
              "I sense an unimaginable concentration of malice and spectral miasma converging on a single point on our street... The house of Paula, the Neighbor! She is the root cause of everything. We must go to her door immediately to end this nightmare.",
              () => {
                onTriggerDialogue(
                  "CKY (Determinación de Acero)",
                  "Ya me cansé de sus trucos, de sus mentiras y de que intente arruinarle la vida a todo el mundo. ¡Vamos a la casa de la vecina ahora mismo!",
                  "I'm sick of her tricks, her lies, and her ruining everyone's lives. Let's head to the neighbor's house right now!",
                  () => {
                    onTriggerDialogue(
                      "Ángela (Espíritu)",
                      "¡Totalmente! Le voy a despeinar ese flequillo de bruja de un solo soplido astral. ¡A la casa de la vecina!",
                      "Totally! I'll blow off her witchy hairdo with a single astral gust. To the neighbor's house!",
                      () => {
                        setDay8AllDefendedReportDone(true);
                        localStorage.setItem("cky_day8_all_defended_report", "true");
                        transitionToMap("street", { x: 16, y: 5 });
                        setFacing("up");
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }, 500);
    }
  };

  const handleDay8BattleVictory = (loc: Day8Location) => {
    let p = day8PlazaDefended;
    let h = day8HospitalDefended;
    let t = day8TerminalDefended;
    let m = day8MallDefended;

    if (loc === "plaza") {
      p = true;
      setDay8PlazaDefended(true);
      localStorage.setItem("cky_day8_plaza_defended", "true");
      unlockDiaryEntry("chapter_08_plaza_cleared");
    } else if (loc === "hospital") {
      h = true;
      setDay8HospitalDefended(true);
      localStorage.setItem("cky_day8_hospital_defended", "true");
      unlockDiaryEntry("chapter_08_hospital_cleared");
    } else if (loc === "terminal") {
      t = true;
      setDay8TerminalDefended(true);
      localStorage.setItem("cky_day8_terminal_defended", "true");
      unlockDiaryEntry("chapter_08_terminal_cleared");
    } else if (loc === "mall") {
      m = true;
      setDay8MallDefended(true);
      localStorage.setItem("cky_day8_mall_defended", "true");
      unlockDiaryEntry("chapter_08_mall_cleared");
    }

    addXP(200);
    setActiveDay8Battle(null);

    const allNowDefended = p && h && t && m;
    if (allNowDefended) {
      unlockDiaryEntry("chapter_08_all_locations_defended");
      playSound(900, "sine", 0.5);
      onTriggerDialogue(
        "W (Espíritu Guardián)",
        "¡Victoria absoluta, Señora CKY! Todos los focos de asedio en la Plaza, el Hospital, la Terminal y el Shopping han sido purificados. La fuente de energía oscura proviene directamente de la casa de la Vecina Paula. ¡Debemos ir de inmediato a su puerta a enfrentarla!",
        "Absolute victory, Lady CKY! All siege points in the Plaza, Hospital, Terminal, and Mall have been purified. The source of dark energy leads directly to Neighbor Paula's house. We must go straight to her front door to confront her!",
        () => {
          onTriggerDialogue(
            "CKY (Determinación de Fuego)",
            "¡Exacto W! ¡Vamos a terminar con esto de una vez por todas! ¡Esa bruja va a pagar por todo lo que le hizo al pueblo!",
            "Exactly, W! Let's finish this once and for all! That witch is going to pay for everything she's done to this town!",
            () => {
              transitionToMap("street", { x: 10, y: 5 });
            }
          );
        }
      );
    } else {
      playSound(780, "triangle", 0.4);
      onTriggerDialogue(
        "W (Espíritu Guardián)",
        "¡Excelente combate! Este sector ha sido purificado. Consulte el Rastreador de Asedio para marchar hacia el siguiente objetivo.",
        "Excellent combat! This sector has been purified. Check the Siege Tracker to march toward the next objective."
      );
    }
  };

  const handleNeighborClimaxComplete = () => {
    setShowDay8NeighborClimaxModal(false);
    setDay8NeighborConfrontationDone(true);
    localStorage.setItem("cky_day8_neighbor_confrontation_done", "true");
    unlockDiaryEntry("chapter_08_neighbor_door_confrontation_and_betrayal");
    unlockDiaryEntry("chapter_08_ckys_fury_and_supernova");
    unlockAchievement("ach_supernova_climax", onShowNotification, addXP);

    // Transport CKY to her bedroom, grieving, sitting on bed
    transitionToMap("bedroom", { x: 3, y: 4 });
    setFacing("down");

    // Trigger Alanis bedroom cutscene modal
    setTimeout(() => {
      setShowDay8AlanisModal(true);
    }, 400);
  };

  const handleAlanisFinalCutsceneComplete = () => {
    setShowDay8AlanisModal(false);
    setDay8AlanisBedroomDone(true);
    localStorage.setItem("cky_day8_alanis_bedroom_done", "true");
    unlockDiaryEntry("chapter_08_renunciation_and_normal_girl");
    unlockAchievement("ach_normal_girl", onShowNotification, addXP);

    // Trigger Chapter 1 Grand Finale Epilogue & Credits
    setTimeout(() => {
      setShowDay8EndingModal(true);
      setDay8Chapter1Ended(true);
      localStorage.setItem("cky_day8_chapter1_ended", "true");
    }, 400);
  };

  const handleCinematicFinish = () => {
    const currentType = activeCinematicType;
    setActiveCinematicType(null);

    if (currentType === "day4_ruins_treasure") {
      setDay4TreasureDug(true);
      setDay4WShovelTransform(true);
      localStorage.setItem("cky_day4_treasure_dug", "true");
      setStats(prev => ({ ...prev, money: (prev.money ?? 0) + 50000 }));
      addInventoryItem({
        id: "ancient_treasure_50k",
        nameEs: "Cofre de $50.000 (Tesoro Ancestral)",
        nameEn: "$50,000 Chest (Ancient Treasure)",
        descEs: "El legendario cofre desenterrado por W Pala en las Ruinas. Contiene $50.000 pesos contantes y sonantes para renovar el ropero.",
        descEn: "The legendary chest dug up by W Shovel in the Ruins. Contains $50,000 cash for wardrobe renovation.",
        icon: "💎",
        isKey: true,
        category: "backpack"
      });
      addXP(150);
      unlockAchievement("ach_shovel_treasure", onShowNotification, addXP);
      soundEngine.playSfx("fanfare");
      unlockDiaryEntry("chapter_04_w_shovel_and_treasure");
      onTriggerDialogue(
        "Ángela (Espíritu)",
        "¡¡$50.000 PESITOS!! ¡¡SOMOS RICAS!! ¡W sos un genio como pala de oro! CKY, nos vamos volando al centro comercial a comprar lencería sexy, perfumes caros y vestidos de fiesta.",
        "$50,000 PESOS!! WE'RE RICH!! W you're a genius as a golden shovel! CKY, let's fly to the mall right now for sexy lingerie, luxury perfume and dresses."
      );
    } else if (currentType === "day5_airport_race") {
      setDay5PaidAirportBet(true);
      setDay5NeighborRaceLost(true);
      localStorage.setItem("cky_day5_paid_bet", "true");
      setStats(prev => ({ ...prev, money: Math.max(0, (prev.money ?? 0) - 1000) }));
      addXP(80);
      soundEngine.playSfx("dialogue");
      unlockDiaryEntry("chapter_05_airport_race_lost");
      onTriggerDialogue(
        "CKY (Indignada)",
        "Hija de p***... ¡Esa vecina hizo una trampa dimensional de acá a la China! Apareció en dos segundos. Tomá tu pancho y tu coca Don Pepe... me voy a mi casa.",
        "What a cheat... That neighbor used a dimensional shortcut! She appeared in two seconds. Here's your hot dog and Coke... I'm going home.",
        () => {
          onTriggerDialogue(
            "Ángela (Espíritu)",
            "¡¡JAJAJAJA CKY mirate!! ¡Estás empapada en sudor, colorada como un tomate y tenés un olor a tigre transpirado que espanta hasta a los aviones! ¡Volvamos a casa ya mismo a que te des una ducha fría!",
            "HAHAHAHA CKY look at yourself!! You're drenched in sweat, red as a tomato, and smell like a sweaty tiger! Let's get home right now for a cold shower!"
          );
        }
      );
    } else if (currentType === "day6_soulmate_kiss") {
      soundEngine.playSfx("dialogue");
    }
  };

  const handleBuyShopItem = (item: InventoryItem, price: number) => {
    soundEngine.playSfx("purchase");
    setStats(prev => {
      const newMoney = Math.max(0, (prev.money ?? 0) - price);
      localStorage.setItem("cky_stats_money", String(newMoney));
      return {
        ...prev,
        money: newMoney,
        speedBuff: item.effect?.type === "speed_buff" ? true : prev.speedBuff,
        perfumeBuff: (item.effect?.type === "perfume" && item.id === "french_perfume_luxury") ? true : prev.perfumeBuff,
        hambre: item.effect?.type === "hambre" ? Math.min(100, prev.hambre + item.effect.amount) : prev.hambre,
        sed: item.effect?.type === "sed" ? Math.min(100, prev.sed + item.effect.amount) : prev.sed,
        perfume: item.effect?.type === "perfume" ? Math.min(100, prev.perfume + item.effect.amount) : prev.perfume,
      };
    });

    addInventoryItem(item);
    addXP(30);

    if (item.id === "pajamas_silk_item") {
      setDay4SilkPajamasBought(true);
      localStorage.setItem("cky_bought_pajamas_silk", "true");
      unlockAchievement("ach_shopping_queen", onShowNotification, addXP);
    }
    if (item.id === "dress_gala_item") {
      setDay4GalaDressBought(true);
      localStorage.setItem("cky_bought_dress_gala", "true");
      unlockAchievement("ach_shopping_queen", onShowNotification, addXP);
    }
    if (item.id === "lingerie_sexy_item") {
      setDay4LingerieBought(true);
      localStorage.setItem("cky_bought_lingerie_sexy", "true");
      unlockAchievement("ach_shopping_queen", onShowNotification, addXP);
    }
    if (item.id === "french_perfume_luxury") {
      setDay4PerfumeBought(true);
      localStorage.setItem("cky_bought_french_perfume", "true");
      unlockDiaryEntry("chapter_04_shopping_lingerie");
      unlockAchievement("ach_french_perfume", onShowNotification, addXP);
    }
    if (item.id === "pro_running_sneakers") {
      localStorage.setItem("cky_speed_buff", "true");
    }
  };

  const handleSpendMoney = (amount: number): boolean => {
    const currentMoney = propStats?.money ?? 0;
    if (currentMoney < amount) {
      soundEngine.playSfx("hit");
      return false;
    }
    setStats(prev => {
      const newMoney = Math.max(0, (prev.money ?? 0) - amount);
      localStorage.setItem("cky_stats_money", String(newMoney));
      return { ...prev, money: newMoney };
    });
    return true;
  };

  const handleEarnMoney = (amount: number) => {
    soundEngine.playSfx("purchase");
    setStats(prev => {
      const newMoney = (prev.money ?? 0) + amount;
      localStorage.setItem("cky_stats_money", String(newMoney));
      return { ...prev, money: newMoney };
    });
  };

  const handleThrowFountainCoin = () => {
    soundEngine.playSfx("coin");
    setStats(prev => {
      const newMoney = Math.max(0, (prev.money ?? 0) - 10);
      localStorage.setItem("cky_stats_money", String(newMoney));
      return {
        ...prev,
        money: newMoney,
        amor: Math.min(100, prev.amor + 15)
      };
    });
    addXP(20);
    onTriggerDialogue(
      "Fuente Central de los Deseos",
      "🪙 ¡Plop! La moneda se sumerge en las aguas cristalinas bajo el domo del shopping. Una suave brisa dorada acaricia a CKY (+15% Amor, +20 XP).",
      "🪙 Plop! The coin sinks into crystal waters under the mall's glass dome. A warm golden breeze caresses CKY (+15% Love, +20 XP)."
    );
  };

  // Define maps configuration
  const getGrid = (mapId: typeof currentMap) => {
    switch (mapId) {
      case "bedroom": return BedroomGrid;
      case "hallway": return HallwayGrid;
      case "house": return HouseGrid;
      case "street": return StreetGrid;
      case "cemetery": return CemeteryGrid;
      case "limbo": return LimboGrid;
      case "moms_room": return MomsRoomGrid;
      case "bathroom": return BathroomGrid;
      case "empty_room": return EmptyRoomGrid;
      case "sisters_room": return SistersRoomGrid;
      case "bus_interior": return BusInteriorGrid;
      case "school_courtyard": return SchoolCourtyardGrid;
      case "school_hallway": return SchoolHallwayGrid;
      case "classroom_1": return Classroom1Grid;
      case "classroom_2": return Classroom2Grid;
      case "classroom_3": return Classroom3Grid;
      case "classroom_4": return Classroom4Grid;
      case "classroom_5": return Classroom5Grid;
      case "director_office": return DirectorOfficeGrid;
      case "teachers_room": return TeachersRoomGrid;
      case "bathroom_girls": return BathroomGirlsGrid;
      case "bathroom_boys": return BathroomBoysGrid;
      case "ruins_valley": return RuinsValleyGrid;
      case "shopping_mall": return ShoppingMallGrid;
      case "airport_terminal": return AirportTerminalGrid;
      case "soulmate_house": return SoulmateHouseGrid;
      case "soulmate_bedroom": return SoulmateBedroomGrid;
      case "school_basement": return SchoolBasementGrid;
      case "school_laboratory": return SchoolLaboratoryGrid;
      case "plaza_principal": return PlazaPrincipalGrid;
      case "hospital_municipal": return HospitalMunicipalGrid;
      case "bus_terminal": return BusTerminalGrid;
    }
  };

  // NPCs on maps
  const getNPCs = (): GameNPC[] => {
    const list: GameNPC[] = [];
    if (currentMap === "house") {
      list.push({
        id: "mom",
        name: language === "es" ? "Mamá" : "Mom",
        x: 6,
        y: 3,
        sprite: "👩",
        facing: "left",
        dialogEs: [
          "¡Hola CKY! Espero que ya hayas ordenado tu habitación.",
          "¿Has visto las noticias? Dicen que hay comportamientos extraños en el vecindario.",
          "Por favor, no regreses tarde si decides salir a caminar por la calle."
        ],
        dialogEn: [
          "Hello CKY! I hope you already cleaned your bedroom.",
          "Have you seen the news? They say there's strange behavior in the neighborhood.",
          "Please don't come home late if you decide to go out for a walk."
        ]
      });
    } else if (currentMap === "bathroom_girls") {
      if (currentDay === 6 && !day6BathroomDiscussionDone) {
        list.push({
          id: "day6_soulmate_cabal",
          name: `${soulmateInfo?.name || (language === "es" ? "Alma Gemela" : "Soulmate")} (Mitad Humano / Mitad Espíritu)`,
          x: 2,
          y: 3,
          sprite: "💖",
          facing: "right",
          dialogEs: [
            "CKY, cerremos bien la puerta. Debemos planear cómo purificar los 3 focos de sombras en la escuela."
          ],
          dialogEn: [
            "CKY, lock the door. We must plan how to purify the 3 shadow anchors in school."
          ]
        });
        list.push({
          id: "day6_angela_cabal",
          name: "Ángela (Espíritu)",
          x: 3,
          y: 2,
          sprite: "👻",
          facing: "down",
          dialogEs: [
            "¡Esa vecina bruja no se va a salir con la suya! ¡Vamos al patio a salvar a Mateo de esa posesión!"
          ],
          dialogEn: [
            "That witch neighbor won't get away with this! Let's go to the courtyard to save Mateo from that possession!"
          ]
        });
        list.push({
          id: "day6_w_cabal",
          name: "W (Orbe Guardián)",
          x: 4,
          y: 3,
          sprite: "🛡️",
          facing: "left",
          dialogEs: [
            "Señora Heredera, debemos intervenir con cautela. La energía de Mateo en la cancha de fútbol es sumamente inestable y agresiva."
          ],
          dialogEn: [
            "Lady Heir, we must intervene with caution. Mateo's energy on the soccer pitch is extremely unstable and aggressive."
          ]
        });
      }
    } else if (currentMap === "director_office") {
      list.push({
        id: "school_director",
        name: language === "es" ? "Director Don Héctor" : "Principal Mr. Héctor",
        x: 4,
        y: 2,
        sprite: "👨‍💼",
        facing: "down",
        dialogEs: [
          "¡Buenos días, CKY! Bienvenidos al ciclo lectivo.",
          "Espero que este año mantengas la disciplina y excelentes calificaciones.",
          "Si ves algún problema en los pasillos o en las aulas, hacémelo saber de inmediato."
        ],
        dialogEn: [
          "Good morning, CKY! Welcome to the new school year.",
          "I expect good discipline and excellent grades from you this year.",
          "If you notice any trouble in the hallways or classrooms, report it to me immediately."
        ]
      });
    } else if (currentMap === "teachers_room") {
      
      list.push({
        id: "teacher_math",
        name: language === "es" ? "Profesor de Matemática (Prof. Gómez)" : "Math Teacher",
        x: 3,
        y: 3,
        sprite: "👨‍🏫",
        facing: "right",
        dialogEs: [
          currentDay === 6 && !day6PossessedSoccerDefeated
            ? "¡CKY! ¡¿Qué hacés acá molestando?! ¡Volvé a tu aula o te repruebo el trimestre!"
            : "Preparando los exámenes sorpresa para 3er año... ¡No le digas a nadie, CKY!"
        ],
        dialogEn: [
          currentDay === 6 && !day6PossessedSoccerDefeated
            ? "CKY! What are you doing bothering here?! Go back to class!"
            : "Preparing pop quizzes for 3rd year... Don't tell anyone, CKY!"
        ]
      });
      list.push({
        id: "teacher_english",
        name: language === "es" ? "Profesora de Inglés (Prof. Laura)" : "English Teacher",
        x: 6,
        y: 3,
        sprite: "👩‍🏫",
        facing: "left",
        dialogEs: [
          currentDay === 6 && !day6PossessedSoccerDefeated
            ? "¡Qué insoportable esta alumna! Ni un mate en paz se puede tomar..."
            : "Tomando un rico mate calentito antes del primer timbre. ¡Good morning, CKY!"
        ],
        dialogEn: [
          currentDay === 6 && !day6PossessedSoccerDefeated
            ? "So unbearable! Can't even drink mate in peace..."
            : "Having hot mate before the bell rings. Good morning, CKY!"
        ]
      });
      list.push({
        id: "teacher_biology",
        name: language === "es" ? "Profesora de Biología (Prof. Marcela)" : "Biology Teacher",
        x: 4,
        y: 5,
        sprite: "👩‍🔬",
        facing: "up",
        dialogEs: [
          currentDay === 6 && !day6PossessedSoccerDefeated
            ? "Detecto niveles anormales de irritabilidad en el ambiente... ¡Fuera de acá CKY!"
            : "Revisando los microscopios para la clase de laboratorio de ciencias."
        ],
        dialogEn: [
          currentDay === 6 && !day6PossessedSoccerDefeated
            ? "I detect abnormal irritability levels... Get out CKY!"
            : "Checking microscopes for science lab class."
        ]
      });
    } else if (currentMap === "school_hallway") {
      if (currentDay === 3 && !day3SchoolThiefDefeated) {
        list.push({
          id: "day3_school_thief_shadow",
          name: language === "es" ? "Sombra Hurtadora del Limbo" : "Limbo Thief Shadow",
          x: 4,
          y: 2,
          sprite: "👤",
          facing: "down",
          dialogEs: [
            "¡Ssssshh! ¡Tus recuerdos escolares y los de tus compañeros alimentan el poder de la Ama!"
          ],
          dialogEn: [
            "Ssshh! Your school memories feed the Mistress's power!"
          ]
        });
      }
      
      list.push({
        id: "preceptora",
        name: language === "es" ? "Preceptora Graciela" : "Counselor Graciela",
        x: 8,
        y: 4,
        sprite: currentDay === 6 && !day6PossessedSoccerDefeated ? "👿👩‍💼" : "👩‍💼",
        facing: "down",
        dialogEs: [
          currentDay === 6 && !day6PossessedSoccerDefeated
            ? "¡CKY! ¡Dejá de deambular por los pasillos con esa cara o te mando a la Dirección ya mismo! ¡Qué insoportable sos!"
            : "¡Hola CKY! El aula de 3er año es la tercera puerta desde la izquierda (Aula 3). ¡Apúrate a entrar!"
        ],
        dialogEn: [
          currentDay === 6 && !day6PossessedSoccerDefeated
            ? "CKY! Stop wandering the halls or go to Principal's office right now!"
            : "Hi CKY! 3rd year classroom is the 3rd door from the left (Classroom 3). Hurry inside!"
        ]
      });
    } else if (currentMap === "school_courtyard") {
      if (currentDay === 6) {
        const isPossessed = !day6PossessedSoccerDefeated;
        list.push({
          id: "mateo_soccer",
          name: isPossessed
            ? (language === "es" ? "Mateo (Poseído por la Discordia)" : "Mateo (Possessed Discord)")
            : (language === "es" ? "Mateo (Liberado)" : "Mateo (Freed)"),
          x: 8,
          y: 5,
          sprite: isPossessed ? "👿⚽" : "🧑‍⚽",
          facing: "left",
          dialogEs: isPossessed
            ? ["¡¡¡GRRRRRRRR... CKY!!! ¡Vas a pagar por meterte con mi Ama la Vecina! ¡Te reto a un duelo a muerte en esta cancha de fútbol!"]
            : ["¡¡CKY!! ¡Muchísimas gracias por salvarme del espíritu de la vecina! ¡Sos una capa total! ¡Cuando quieras pateamos unos penales!"],
          dialogEn: isPossessed
            ? ["GRRRRRRRR... CKY!!! You will pay for crossing my Mistress the Neighbor! Duel me on this soccer pitch!"]
            : ["CKY!! Thank you so much for saving me from the neighbor's spirit! You're awesome! Let's kick penalties anytime!"]
        });
      } else if (hasFirstClassFinished) {
        // Recess in courtyard
        list.push({
          id: "mateo_soccer",
          name: language === "es" ? "Mateo (Compañero de Escuela)" : "Mateo",
          x: 8,
          y: 5,
          sprite: "🧑‍⚽",
          facing: "left",
          dialogEs: [
            "¡Pateá la pelota de fútbol, CKY! Tirale un bombazo al arco a ver si metés un golazo."
          ],
          dialogEn: [
            "Kick the soccer ball CKY! Take a shot at the goal."
          ]
        });
        list.push({
          id: "class_jaz",
          name: "Jaz",
          x: 4,
          y: 6,
          sprite: "👧",
          facing: "right",
          dialogEs: [
            "¡Qué linda estuvo la primera clase de Historia, CKY! Me encanta estar al aire libre en el patio."
          ],
          dialogEn: [
            "History class was awesome CKY! I love being out in the courtyard."
          ]
        });
        list.push({
          id: "class_nico",
          name: "Nico",
          x: 11,
          y: 5,
          sprite: "👦",
          facing: "left",
          dialogEs: [
            "¡Recreooo! Le apuesto $100 a Juan a que meto un gol de chilena."
          ],
          dialogEn: [
            "Recess! I bet Juan $100 I score a bicycle kick goal."
          ]
        });
        list.push({
          id: "class_juan",
          name: "Juan",
          x: 3,
          y: 4,
          sprite: "🧑",
          facing: "down",
          dialogEs: [
            "En la próxima hora nos toca Matemática con el Prof. Gómez. ¡Tengo la tarea lista!"
          ],
          dialogEn: [
            "Next class is Math with Prof. Gomez. Homework is ready!"
          ]
        });
        list.push({
          id: "class_abril",
          name: "Abril",
          x: 12,
          y: 7,
          sprite: "👩‍🦰",
          facing: "up",
          dialogEs: [
            "Amo tomar sol en los bancos del patio durante el recreo."
          ],
          dialogEn: [
            "I love sunbathing on the benches during recess."
          ]
        });
        if (neighborName) {
          list.push({
            id: "bus_neighbor",
            name: neighborName,
            x: 5,
            y: 7,
            sprite: "👱‍♀️",
            facing: "right",
            dialogEs: [
              `¡Hola CKY! El patio del colegio es enorme.`
            ],
            dialogEn: [
              `Hi CKY! The school yard is huge.`
            ]
          });
        }
        list.push({
          id: "preceptora",
          name: language === "es" ? "Preceptora Graciela" : "Counselor Graciela",
          x: 7,
          y: 2,
          sprite: "👩‍💼",
          facing: "down",
          dialogEs: [
            "¡Chicos, no corran por las galerías ni tiren la pelota contra las ventanas!"
          ],
          dialogEn: [
            "Don't run in hallways or kick balls at windows kids!"
          ]
        });
        list.push({
          id: "teacher_pe",
          name: language === "es" ? "Profesor de Ed. Física (Prof. Marcos)" : "PE Teacher",
          x: 13,
          y: 2,
          sprite: "🏃‍♂️",
          facing: "down",
          dialogEs: [
            "¡Hola CKY! A estirar las piernas y tomar aire fresco en el recreo."
          ],
          dialogEn: [
            "Hi CKY! Stretch your legs and take fresh air during recess."
          ]
        });
      } else {
        // Before class finished
        list.push({
          id: "mateo_soccer",
          name: language === "es" ? "Mateo (Compañero de Escuela)" : "Mateo",
          x: 8,
          y: 5,
          sprite: "🧑‍⚽",
          facing: "left",
          dialogEs: [
            "¡Hola CKY! Apúrate a entrar al aula de 3er año (Aula 3) que la preceptora Graciela va a tomar asistencia."
          ],
          dialogEn: [
            "Hi CKY! Hurry into 3rd year classroom, Counselor Graciela is calling roll."
          ]
        });
        list.push({
          id: "preceptora",
          name: language === "es" ? "Preceptora Graciela" : "Counselor Graciela",
          x: 2,
          y: 2,
          sprite: "👩‍💼",
          facing: "down",
          dialogEs: [
            "¡Entren al aula chicos! Va a comenzar la primera clase de Historia."
          ],
          dialogEn: [
            "Get into class kids! First period History is starting."
          ]
        });
      }
    } else if (currentMap === "classroom_3") {
      
      // 3rd year classroom: CKY's friends & Subject Teachers per step
      if (classStep === 0 || classStep === 1) {
        list.push({
          id: "teacher_history",
          name: language === "es" ? "Profesor de Historia (Prof. Silva)" : "History Teacher",
          x: 2,
          y: 1,
          sprite: "👨‍🏫",
          facing: "down",
          dialogEs: [
            classStep === 0
              ? "¡Silencio en la clase! Abran los libros de Historia en la página 45."
              : "Disfruten del recreo chicos, guarden sus libros."
          ],
          dialogEn: [
            classStep === 0 ? "Quiet in class! Open history books to page 45." : "Enjoy recess kids."
          ]
        });
      } else if (classStep === 2) {
        list.push({
          id: "teacher_math",
          name: language === "es" ? "Profesor de Matemática (Prof. Gómez)" : "Math Teacher",
          x: 2,
          y: 1,
          sprite: "👨‍🏫",
          facing: "down",
          dialogEs: [
            "¡Atención 3er Año! Es hora de la Clase de Matemática y el examen sorpresa. CKY, sentate en tu pupitre para rendir."
          ],
          dialogEn: [
            "Attention 3rd Year! Time for Math pop quiz. CKY, sit at your desk."
          ]
        });
      } else if (classStep === 3) {
        list.push({
          id: "teacher_biology",
          name: language === "es" ? "Profesora de Biología (Prof. Marcela)" : "Biology Teacher",
          x: 2,
          y: 1,
          sprite: "👩‍🏫",
          facing: "down",
          dialogEs: [
            "¡Hola 3er Año! Hoy estudiaremos la célula vegetal. CKY, sentate en tu pupitre para la observación al microscopio."
          ],
          dialogEn: [
            "Hi 3rd Year! Today we study plant cells. CKY, sit at your desk."
          ]
        });
      }

      // Classmates are ALWAYS present in 3rd year classroom during class steps
      if (classStep < 5) {
        list.push({
          id: "class_jaz",
          name: "Jaz",
          x: 2,
          y: 3,
          sprite: "👧",
          facing: "right",
          dialogEs: [
            !hasGroomed
              ? "¡Amigaaaa! Te quiero mucho pero... ¡¿qué le pasó a tu pelo?! Jajaja ¡parece que te agarró un huracán dormida! ¡Tomá, te presto mi cepillo!"
              : classStep === 0 ? "¡Sentate al lado mío en el pupitre, CKY! Sos mi mejor amiga del mundo mundial." :
              classStep === 1 ? "¡Qué lindo el recreo CKY! Salgamos al patio a tomar un jugo o a jugar al fútbol." :
              classStep === 2 ? "¡Ay, viene el examen de Matemática con el Profe Gómez! Menos mal que estudiaste CKY." :
              classStep === 3 ? "¡Me encanta la clase de Biología con la Prof. Marcela! Mirá el microscopio." :
              "¡Terminaron las clases en el aula! Vamos al patio para Educación Física."
          ],
          dialogEn: [
            !hasGroomed
              ? "Bestieee! I love you but... what happened to your hair?! Hahaha like a hurricane hit you while sleeping! Take my brush!"
              : "Best friend in the whole world, sit next to me!"
          ]
        });
        list.push({
          id: "class_juan",
          name: "Juan",
          x: 6,
          y: 3,
          sprite: "🧑",
          facing: "down",
          dialogEs: [
            !hasGroomed
              ? "Según mis cálculos físicos y estadísticos, no te peinaste ni te lavaste la cara hoy... ¡Tus pelos desafían la gravedad!"
              : classStep === 0 ? "Ya leí todo el libro de Historia. Si querés te paso las respuestas del examen." :
              classStep === 1 ? "Me voy a comprar un alfajor al kiosco del patio." :
              classStep === 2 ? "7x8 es 56... -6 es 50... ¡no te olvides CKY!" :
              classStep === 3 ? "Las células vegetales tienen cloroplastos. Eso seguro entra en el examen." :
              "¡A correr en Educación Física!"
          ],
          dialogEn: [
            !hasGroomed
              ? "According to my hair kinematics, you didn't comb or wash today... Your hair defies gravity!"
              : "I study hard for all exams."
          ]
        });
        list.push({
          id: "class_nico",
          name: "Nico",
          x: 2,
          y: 5,
          sprite: "👦",
          facing: "up",
          dialogEs: [
            !hasGroomed
              ? "¡JAJAJA CKY! ¿Se peleó tu peine con la almohada? Jaja ¡tenés un nido de pajaritos despeinado en la cabeza!"
              : classStep === 0 ? "Hola CKY, ¿estuvo bueno el viaje en colectivo?" :
              classStep === 1 ? "¡Mateo quiere jugar un partido de penales en la cancha del patio!" :
              classStep === 2 ? "Me encanta la clase de Matemática con el Profe Gómez." :
              classStep === 3 ? "La Biología es mi materia favorita. Las organelas celulares son fascinantes." :
              "¡Vamos a hacer carreras en el patio!"
          ],
          dialogEn: [
            !hasGroomed
              ? "HAHAHA CKY! Did your comb fight with your pillow? You have a bird nest on your head!"
              : "Hi CKY! School is fun today."
          ]
        });
        list.push({
          id: "class_mateo",
          name: "Mateo",
          x: 4,
          y: 5,
          sprite: "🧑",
          facing: "up",
          dialogEs: [
            !hasGroomed
              ? "¡Epa CKY! Pensé que traías un casco transparente para jugar al fútbol ¡por lo parado que tenés el pelo! Jajaja"
              : classStep === 0 ? "¡Hola CKY! Traje la pelota para jugar al fútbol en el recreo en cuanto termine esta clase." :
              classStep === 1 ? "¡CKY! ¿Jugamos unos penales en la cancha de fútbol del patio?" :
              classStep === 2 ? "Uf, Matemática... espero sacarme un 10 igual que vos CKY." :
              classStep === 3 ? "Biología es interesante, pero prefiero el fútbol." :
              "¡Por fin Educación Física! Vamos a la cancha del patio."
          ],
          dialogEn: [
            !hasGroomed
              ? "Whoa CKY! Thought you wore a helmet for soccer because of how spiky your uncombed hair is! Hahaha"
              : "Let's play soccer during recess!"
          ]
        });
        list.push({
          id: "class_abril",
          name: "Abril",
          x: 6,
          y: 5,
          sprite: "👩‍🦰",
          facing: "left",
          dialogEs: [
            !hasGroomed
              ? "¡Miren a CKY! Vino con los pelos parados y cara de dormida... ¡Qué papelón jajaja!"
              : classStep === 0 ? "Ayer escuché el chisme más grande de toda la escuela... ¿Querés que te cuente?" :
              classStep === 1 ? "En el recreo te cuento todo el chisme de 4to año CKY." :
              classStep === 2 ? "Shhh, ya vino el Profe Gómez a tomar el examen de Matemática..." :
              classStep === 3 ? "Qué lindo dibujo de la célula vegetal hizo la profe Marcela en el pizarrón." :
              "¡A cambiarse las zapatillas para gimnasia!"
          ],
          dialogEn: [
            !hasGroomed
              ? "Look at CKY! Came with bedhead and sleepy face... What a funny mess! Hahaha"
              : "So much gossip in school today!"
          ]
        });
      }
    } else if (currentMap.startsWith("classroom_")) {
      list.push({
        id: "generic_teacher",
        name: language === "es" ? "Docente de Clase" : "Class Teacher",
        x: 2,
        y: 1,
        sprite: "👩‍🏫",
        facing: "down",
        dialogEs: [
          "Por favor tomen asiento en sus pupitres para comenzar la clase."
        ],
        dialogEn: [
          "Please take your seats to begin class."
        ]
      });
    } else if (currentMap === "bus_interior") {
      const isReturnTrip = classStep >= 5;

      // Chofer NPC in Driver Seat (Col 1, Row 1)
      list.push({
        id: "bus_driver",
        name: language === "es" ? "Chofer Don Carlos" : "Bus Driver",
        x: 1,
        y: 1,
        sprite: "👨‍✈️",
        facing: "down",
        dialogEs: [
          isReturnTrip
            ? "¡Hola CKY! Acomodate en tu asiento o tocá la puerta para avisarme cuando quieras bajar en la parada del barrio."
            : "Hola CKY... ¿Lista para ir a la escuela?... Tu asiento es el 6"
        ],
        dialogEn: [
          isReturnTrip
            ? "Hi CKY! Take a seat or interact with the door to arrive at your neighborhood stop."
            : "Hello CKY... Ready to go to school?... Your seat is number 6"
        ]
      });

      // Blonde Neighbor NPC in Asiento 1 (Col 1, Row 2)
      list.push({
        id: "bus_neighbor",
        name: neighborName || (language === "es" ? "Vecina" : "Neighbor"),
        x: 1,
        y: 2,
        sprite: "👱‍♀️",
        facing: "right",
        dialogEs: [
          isReturnTrip
            ? "Uff... qué cansadora la escuela. Ya quiero llegar a mi casa."
            : "Que miras? anda pa lla"
        ],
        dialogEn: [
          isReturnTrip
            ? "Phew... school was exhausting. I just want to get home."
            : "What are you looking at? Go away"
        ]
      });

      if (hasPassengersBoarded || isReturnTrip) {
        // Nico - Seat 2 (Col 3, Row 2)
        list.push({
          id: "bus_nico",
          name: "Nico",
          x: 3,
          y: 2,
          sprite: "👦",
          facing: "down",
          dialogEs: [
            !hasGroomed
              ? "¡JAJAJA CKY! ¿Se peleó tu peine con la almohada? Jaja ¡tenés un nido de pajaritos despeinado en la cabeza!"
              : isReturnTrip
              ? "¡Al fin terminamos! Qué cansancio la clase de Educación Física."
              : "Hola CKY, me encanta viajar en el colectivo a la escuela."
          ],
          dialogEn: [
            !hasGroomed
              ? "HAHAHA CKY! Did your comb fight with your pillow? You have a bird nest on your head!"
              : isReturnTrip
              ? "Finally finished! PE class was exhausting."
              : "Hi CKY, I love riding the bus to school."
          ]
        });

        // Juan - Seat 3 (Col 1, Row 3)
        list.push({
          id: "bus_juan",
          name: "Juan",
          x: 1,
          y: 3,
          sprite: "🧑",
          facing: "down",
          dialogEs: [
            !hasGroomed
              ? "Según mis cálculos cinemáticos y capilares, no te peinaste ni te lavaste la cara hoy... ¡Tus pelos desafían la gravedad!"
              : isReturnTrip
              ? "Por fin volvemos. Voy a aprovechar para repasar en casa."
              : "El inteligente del Aula, sabe todo."
          ],
          dialogEn: [
            !hasGroomed
              ? "According to my hair kinematics, you didn't comb or wash today... Your hair defies gravity!"
              : isReturnTrip
              ? "Finally heading back. I'll review my notes at home."
              : "The smart one in class, knows everything."
          ]
        });

        // Jaz - Seat 4 (Col 3, Row 3)
        list.push({
          id: "bus_jaz",
          name: "Jaz",
          x: 3,
          y: 3,
          sprite: "👧",
          facing: "down",
          dialogEs: [
            !hasGroomed
              ? "¡Amigaaaa! Te quiero mucho pero... ¡¿qué te pasó en el pelo?! Jajaja ¡parece que te agarró un huracán dormida! ¡Tomá, te presto mi cepillo!"
              : isReturnTrip
              ? "¡Fue un re lindo primer día de clases CKY! Nos vemos mañana."
              : "Es mi mejor amiga del mundo mundial."
          ],
          dialogEn: [
            !hasGroomed
              ? "Bestieee! I love you but... what happened to your hair?! Hahaha like a hurricane hit you while sleeping! Take my brush!"
              : isReturnTrip
              ? "It was a really nice first day of school CKY! See you tomorrow."
              : "She is my best friend in the whole world."
          ]
        });

        // Abril - Seat 5 (Col 1, Row 4)
        list.push({
          id: "bus_abril",
          name: "Abril",
          x: 1,
          y: 4,
          sprite: "👩‍🦰",
          facing: "down",
          dialogEs: [
            !hasGroomed
              ? "¡Miren todos a CKY! Vino al colegio sin peinarse ni lavarse la cara... Jajaja ¡mañana sale en las noticias del curso!"
              : isReturnTrip
              ? "¡Chau CKY! Mañana en el recreo seguimos hablando."
              : "Mejor amiga de mi enemiga, la chusma de la clase, sabe todo de todos."
          ],
          dialogEn: [
            !hasGroomed
              ? "Look at CKY everyone! Came to school uncombed with unwashed face... Hahaha headline gossip tomorrow!"
              : isReturnTrip
              ? "Bye CKY! Tomorrow at recess we'll chat more."
              : "Best friend of my enemy, class gossip, knows everything about everyone."
          ]
        });
      }
    } else if (currentMap === "street") {
      if (currentDay === 5 && !day5PaidAirportBet) {
        list.push({
          id: "day5_neighbor_runner",
          name: neighborName || (language === "es" ? "Vecina Corredora" : "Runner Neighbor"),
          x: 10,
          y: 5,
          sprite: "👱‍♀️",
          facing: "left",
          dialogEs: day5NeighborRaceChallenge
            ? [
                "¡A ver si me alcanzás CKY! ¡Corré hacia el este rumbo al Aeropuerto!",
                "¡El que pierde paga el pancho con papas pay y la coca helada!"
              ]
            : [
                "¡Epa CKY! ¿Saliste a trotar un rato? Te propongo una competencia...",
                "¡La que llegue primero a la terminal del Aeropuerto se gana un súper pancho y una coca helada! ¿Te animás?"
              ],
          dialogEn: day5NeighborRaceChallenge
            ? [
                "Let's see if you can catch me CKY! Run east towards the Airport!",
                "Loser pays for the hot dog with fries and iced Coke!"
              ]
            : [
                "Hey CKY! Out for a jog? I challenge you to a race...",
                "First one to reach the Airport terminal wins a hot dog and cold Coke! Up for it?"
              ]
        });
      }
      if (currentDay === 3 && !day3RiftGuardianDefeated) {
        list.push({
          id: "day3_rift_guardian_npc",
          name: language === "es" ? "Guardián de la Grieta (Devorador de Recuerdos)" : "Rift Guardian (Memory Devourer)",
          x: 6,
          y: 2,
          sprite: "👾",
          facing: "left",
          dialogEs: [
            "¡GROOOAAAR! ¡La grieta de la vecina consumirá la luz de este mundo!"
          ],
          dialogEn: [
            "GROOOAAAR! The neighbor's rift will consume this world's light!"
          ]
        });
      }

      // Blonde Neighbor Classmate NPC (Chica Rubia Vecina)
      if (!hasNeighborBoardedBus && isBusWaitingAtDoor) {
        list.push({
          id: "blonde_neighbor",
          name: neighborName || (language === "es" ? "Chica Rubia (Vecina)" : "Blonde Neighbor"),
          x: neighborPos.x,
          y: neighborPos.y,
          sprite: "👱‍♀️",
          facing: "down",
          dialogEs: [
            "¡Hola CKY! Apúrate que el colectivo escolar amarillo ya está estacionado en la puerta.",
            "Yo ya me puse el uniforme escolar. ¿Vos ya te lo pusiste?",
            "Si no tenés puesto el uniforme escolar, el chofer no te va a dejar subir al colectivo."
          ],
          dialogEn: [
            "Hi CKY! Hurry up, the yellow school bus is already parked outside.",
            "I'm wearing my school uniform. Did you put yours on?",
            "If you aren't wearing your school uniform, the bus driver won't let you board."
          ]
        });
      }

      // Shadow Spirit visible only under spiritual conditions (Chapter step >= 3)
      if (chapterStep >= 3) {
        list.push({
          id: "shadow_spirit",
          name: language === "es" ? "Espíritu Oscuro" : "Dark Spirit",
          x: 13,
          y: 4,
          sprite: "👻",
          facing: "down",
          dialogEs: [
            "¡HEREDERA DEL MÁXIMO PODER! Tu alma pertenecerá a las sombras...",
            "¡El destino inevitable del limbo te aguarda!"
          ],
          dialogEn: [
            "HEIRESS OF THE SUPREME POWER! Your soul shall belong to the shadows...",
            "The inevitable destiny of limbo awaits you!"
          ],
          questTrigger: "spirit_combat"
        });
      }
    } else if (currentMap === "limbo") {
      list.push({
        id: "hermes",
        name: "Hermes (Espíritu Guía)",
        x: 5,
        y: 2,
        sprite: "🔮",
        facing: "down",
        dialogEs: [
          "Bienvenida al Limbo, CKY. No temas, la muerte espiritual es solo un portal de regreso.",
          "Para derrotar al Espíritu Oscuro, debes ESCUCHAR su debilidad.",
          "Usa tu poder 'Ver lo Invisible' pulsando ESPACIO en el combate para revelar su núcleo oscuro y ataca.",
          "¡Cruza el portal azul cuando estés lista para volver a intentarlo!"
        ],
        dialogEn: [
          "Welcome to Limbo, CKY. Fear not, spiritual death is just a portal back.",
          "To defeat the Dark Spirit, you must LISTEN to its weakness.",
          "Use your power 'Ver lo Invisible' by pressing SPACE in combat to reveal its dark core and attack.",
          "Cross the blue portal when you are ready to try again!"
        ]
      });
    } else if (currentMap === "cemetery") {
      list.push({
        id: "angela_spirit",
        name: "Ángela (Espíritu)",
        x: 13,
        y: 4,
        sprite: "👻",
        facing: "down",
        dialogEs: [
          hasDeliveredAngelaSandwich
            ? "¡Hola CKY! Muchas gracias por el sándwich de salame y queso. Siempre seré tu amiga y guardiana espiritual."
            : "Hola CKY... estoy esperando el sándwich de salame y queso que me prometiste. Mi tumba es la rosa.",
        ],
        dialogEn: [
          hasDeliveredAngelaSandwich
            ? "Hi CKY! Thank you so much for the salami and cheese sandwich. I will always be your spiritual friend and guardian."
            : "Hi CKY... I'm waiting for the salami and cheese sandwich you promised me. My grave is the pink one.",
        ]
      });
    } else if (currentMap === "ruins_valley") {
      if (!day4GolemDefeated) {
        list.push({
          id: "ruins_golem_boss",
          name: language === "es" ? "Golem Guardián Ancestral" : "Ancient Golem Guardian",
          x: 9,
          y: 2,
          sprite: "🗿",
          facing: "down",
          dialogEs: [
            "¡¡GRRRROOOOOAAAR!! ¡LOS INTRUSOS NO CRUZARÁN EL SELLO DE LA CORONA!"
          ],
          dialogEn: [
            "GRRRROOOOOAAAR!! INTRUDERS SHALL NOT PASS THE CROWN SEAL!"
          ]
        });
      }
      list.push({
        id: "ruins_w_guardian",
        name: "W (Espíritu Guardián)",
        x: 3,
        y: 6,
        sprite: "🛡️",
        facing: "right",
        dialogEs: [
          day4TreasureDug
            ? "¡Excelente labor, Señora Heredera! Los $50.000 del tesoro están en vuestra posesión. Podemos regresar a la ciudad."
            : day4GolemDefeated
            ? "¡El Golem ha caído! Acérquese al sitio del cofre (Col 14, Row 4) y permítame transfigurarme en Pala Dorada para desenterrarlo."
            : "Señora Heredera, el Golem de Piedra protege el camino al tesoro. Debemos derrotarlo con vuestra resonancia espiritual."
        ],
        dialogEn: [
          day4TreasureDug
            ? "Splendid work, Lady Heir! The $50,000 treasure is in your possession. We may return to the city."
            : day4GolemDefeated
            ? "The Golem has fallen! Approach the chest excavation site (Col 14, Row 4) and let me transfigure into the Golden Shovel."
            : "Lady Heir, the Stone Golem protects the path to the treasure. We must defeat it with spiritual resonance."
        ]
      });
      list.push({
        id: "ruins_angela",
        name: "Ángela (Espíritu)",
        x: 5,
        y: 6,
        sprite: "👻",
        facing: "left",
        dialogEs: [
          day4TreasureDug
            ? "¡¡$50.000 PESITOS!! ¡Nos vamos volando al centro comercial a comprar lencería y pilchas de fiesta!"
            : day4GolemDefeated
            ? "¡¡Le diste una paliza tremenda al golem!! ¡Dale W, transformate en pala y cavemos ya!"
            : "¡CKY, mirá el tamaño de ese bicho de piedra! ¡Demostrale quién manda!"
        ],
        dialogEn: [
          day4TreasureDug
            ? "$50,000 PESOS!! We're heading straight to the shopping mall for lingerie and fashionable clothes!"
            : day4GolemDefeated
            ? "You crushed that golem!! Come on W, turn into a shovel and let's dig!"
            : "CKY, look at that giant rock creature! Show him who's boss!"
        ]
      });
    } else if (currentMap === "shopping_mall") {
      list.push({
        id: "mall_boutique_seller",
        name: language === "es" ? "Vendedora de Moda" : "Fashion Boutique Seller",
        x: 3,
        y: 2,
        sprite: "👗",
        facing: "down",
        dialogEs: [
          "¡Bienvenida al Centro Comercial! Tenemos las últimas tendencias de ropa casual y de fiesta."
        ],
        dialogEn: [
          "Welcome to the Shopping Mall! We have the latest casual and trendy fashion."
        ]
      });
      list.push({
        id: "mall_lingerie_seller",
        name: language === "es" ? "Atendedora de Lencería Sexy" : "Sexy Lingerie Specialist",
        x: 13,
        y: 2,
        sprite: "👙",
        facing: "down",
        dialogEs: [
          day4LingerieBought
            ? "¡Ese conjunto de lencería roja te queda espectacular! Ya está guardado en tu ropero personal."
            : "¡Tenemos en vitrina un conjunto de lencería de encaje rojo súper sexy! Puedes probártelo y comprarlo aquí mismo."
        ],
        dialogEn: [
          day4LingerieBought
            ? "That red lingerie set looks amazing on you! It's safely saved in your wardrobe."
            : "We have an ultra-sexy red lace lingerie set on display! You can try it and buy it right here."
        ]
      });
      list.push({
        id: "mall_cafe_barista",
        name: language === "es" ? "Barista del Café" : "Mall Cafe Barista",
        x: 2,
        y: 8,
        sprite: "☕",
        facing: "right",
        dialogEs: [
          "¡Café frappé helado, licuados y medialunas recién horneadas para las compradoras!"
        ],
        dialogEn: [
          "Iced frappés, fruit smoothies and fresh croissants for our shoppers!"
        ]
      });
      list.push({
        id: "mall_angela",
        name: "Ángela (Espíritu)",
        x: 8,
        y: 3,
        sprite: "👻",
        facing: "down",
        dialogEs: [
          day4LingerieBought
            ? "¡¡CKY ESTÁS HECHA UNA BOMBA CON ESA LENCERÍA ROJA!! ¡Me muero de amor! ¡Cuando lleguemos a casa tenés que probártela en el espejo del ropero!"
            : "¡CKY! ¡Mirá ese local de lencería a la derecha! ¡Con los cincuenta mil del tesoro nos alcanza para comprarte el conjunto más sexy del mundo!"
        ],
        dialogEn: [
          day4LingerieBought
            ? "CKY YOU LOOK LIKE A TOTAL KNOCKOUT IN THAT RED LINGERIE!! When we get home you must try it in front of the wardrobe mirror!"
            : "CKY! Look at that lingerie store to the right! With the fifty grand from the treasure we can get the sexiest outfit in the world!"
        ]
      });
    } else if (currentMap === "soulmate_house") {
      list.push({
        id: "soulmate_physical",
        name: `${soulmateInfo?.name || (language === "es" ? "Alma Gemela" : "Soulmate")} (Cuerpo Físico)`,
        x: 5,
        y: 3,
        sprite: "🧍‍♂️",
        facing: "down",
        dialogEs: day6SoulmateKissDone
          ? [
              "El beso ha sellado la comunión física. Acompáñame a mi habitación (puerta superior derecha); hay algo crucial que debo entregarte."
            ]
          : [
              "Hola, CKY. Alanis me avisó que vendrías. A mí tampoco me agrada que los entes celestiales decidan por nosotros, pero debemos completar el rito del beso para estabilizar mi cuerpo."
            ],
        dialogEn: day6SoulmateKissDone
          ? [
              "The kiss has sealed the physical communion. Follow me to my bedroom (upper right door); there is something crucial I must give you."
            ]
          : [
              "Hello, CKY. Alanis informed me you were coming. I don't like celestial entities ruling our lives either, but we must complete the kiss ritual to stabilize my body."
            ]
      });
    } else if (currentMap === "soulmate_bedroom") {
      list.push({
        id: "soulmate_bedroom_npc",
        name: `${soulmateInfo?.name || (language === "es" ? "Alma Gemela" : "Soulmate")}`,
        x: 5,
        y: 4,
        sprite: "🧍‍♂️",
        facing: "up",
        dialogEs: day6GrimoireObtained
          ? [
              "Estudia bien el Grimorio de las Sombras Escolares en tu mochila. La batalla contra los espíritus de la Vecina será intensa."
            ]
          : [
              "En esa estantería tengo el 'Grimorio de las Sombras Escolares'. Tómalo; allí están detalladas las debilidades de cada espíritu que la Vecina metió en tus compañeros."
            ],
        dialogEn: day6GrimoireObtained
          ? [
              "Study the Grimoire of School Shadows in your backpack well. The battle against the Neighbor's spirits will be intense."
            ]
          : [
              "On that shelf I keep the 'Grimoire of School Shadows'. Take it; all the weaknesses of each spirit the Neighbor implanted in your classmates are detailed inside."
            ]
      });
    } else if (currentMap === "airport_terminal") {
      list.push({
        id: "airport_pepe",
        name: language === "es" ? "Don Pepe (Panchería del Aeropuerto)" : "Don Pepe (Airport Hot Dog Stand)",
        x: 3,
        y: 6,
        sprite: "👨‍🍳",
        facing: "down",
        dialogEs: [
          "¡Bienvenidos a Don Pepe! Los mejores súper panchos con lluvia de papas pay crocantes, mayonesa casera y Coca-Cola bien helada de toda la terminal."
        ],
        dialogEn: [
          "Welcome to Don Pepe's! Best super hot dogs with crispy potato sticks, homemade mayo, and ice-cold Coca-Cola in the whole terminal."
        ]
      });
      list.push({
        id: "airport_attendant",
        name: language === "es" ? "Azafata de Vuelo" : "Flight Attendant",
        x: 8,
        y: 2,
        sprite: "👩‍✈️",
        facing: "down",
        dialogEs: [
          "Vuelo 404 con destino a Cancún y Bariloche abordando por Puerta 3. Por favor tengan listos sus pases de abordar."
        ],
        dialogEn: [
          "Flight 404 to Cancun and Bariloche now boarding at Gate 3. Please have your boarding passes ready."
        ]
      });
      if (day5NeighborRaceChallenge) {
        list.push({
          id: "airport_neighbor_winner",
          name: neighborName || (language === "es" ? "Vecina (Ganadora de la Carrera)" : "Neighbor (Race Winner)"),
          x: 4,
          y: 6,
          sprite: "👱‍♀️",
          facing: "left",
          dialogEs: day5PaidAirportBet
            ? [
                "¡Mmmmm qué delicia de súper pancho! ¡Gracias por pagar la apuesta CKY!",
                "Sos rápida corriendo, pero mi 'atajo mágico secreto' nunca falla jaja. ¡Nos vemos en el barrio!"
              ]
            : [
                "¡JAJAJA llegué primera con tiempo récord! ¡Misteriosamente aparecí aquí en dos segundos!",
                "¡Aceptá tu derrota CKY! Hablá con Don Pepe o conmigo para pagarme el súper pancho y la coca como habíamos apostado."
              ],
          dialogEn: day5PaidAirportBet
            ? [
                "Mmmmm delicious hot dog! Thanks for paying the bet CKY!",
                "You're fast, but my 'secret shortcut' never fails haha. See you back in the neighborhood!"
              ]
            : [
                "HAHAHA I arrived first with record time! Mysteriously appeared here in two seconds!",
                "Accept defeat CKY! Talk to Don Pepe or me to pay for my hot dog and Coke like we bet."
              ]
        });
      }
      list.push({
        id: "airport_angela",
        name: "Ángela (Espíritu)",
        x: 9,
        y: 6,
        sprite: "👻",
        facing: "left",
        dialogEs: [
          day5PaidAirportBet
            ? "¡Esa vecina hizo una trampa dimensional descarada CKY! ¡Vi claramente cómo usó un portal de sombra para teletransportarse! Pero bueno, ahora volvamos a casa que estás re chivada y necesitás una ducha urgente."
            : "¡¡CKY, esa bruja hizo trampa segurísimo!! ¡No hay forma humana de correr tan rápido sin volar! Pagale el pancho así no jode y volvamos a casa."
        ],
        dialogEn: [
          day5PaidAirportBet
            ? "That neighbor blatantly used dimensional cheating CKY! I saw her shadow portal! But anyway, let's head home, you're soaked in sweat and need a shower ASAP."
            : "CKY, that witch definitely cheated!! There is no human way to run that fast without flying! Pay her the hot dog and let's go home."
        ]
      });
    }
    return list;
  };

  // Canvas drawing routine with high-quality real-time animation loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      // Battery & GPU saver on Android when app is in background
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Crisp pixel-art on AMOLED high-density displays
      ctx.imageSmoothingEnabled = false;

      // Clear and draw grid layout
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (introStep === 0) {
        drawIntroStep0(ctx, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }
      if (introStep === 1) {
        drawIntroStep1(ctx, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }
      if (introStep === 2) {
        drawIntroStepDia1(ctx, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }
      if (introStep === 3) {
        drawIntroStepAlarm(ctx, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }
      if (introStep === 4) {
        drawIntroStepMsg(ctx, canvas.width, canvas.height);
        animId = requestAnimationFrame(render);
        return;
      }
      if (isDay2Intro) {
        if (day2IntroStep === 1) {
          drawIntroStepDia2(ctx, canvas.width, canvas.height);
        } else if (day2IntroStep === 2) {
          drawIntroStepAlarm(ctx, canvas.width, canvas.height);
        }
        animId = requestAnimationFrame(render);
        return;
      }
      if (isDay3Intro) {
        if (day3IntroStep === 1) {
          drawIntroStepDia3(ctx, canvas.width, canvas.height);
        } else if (day3IntroStep === 2) {
          drawIntroStepAlarm(ctx, canvas.width, canvas.height);
        }
        animId = requestAnimationFrame(render);
        return;
      }
      if (isDay4Intro) {
        if (day4IntroStep === 1) {
          drawIntroStepDia4(ctx, canvas.width, canvas.height);
        } else if (day4IntroStep === 2) {
          drawIntroStepAlarm(ctx, canvas.width, canvas.height);
        }
        animId = requestAnimationFrame(render);
        return;
      }
      if (isDay5Intro) {
        if (day5IntroStep === 1) {
          drawIntroStepDia5(ctx, canvas.width, canvas.height);
        } else if (day5IntroStep === 2) {
          drawIntroStepAlarm(ctx, canvas.width, canvas.height);
        }
        animId = requestAnimationFrame(render);
        return;
      }
      if (isDay6Intro) {
        if (day6IntroStep === 1) {
          drawIntroStepDia6(ctx, canvas.width, canvas.height);
        } else if (day6IntroStep === 2) {
          drawIntroStepAlarm(ctx, canvas.width, canvas.height);
        }
        animId = requestAnimationFrame(render);
        return;
      }
      if (isDay7Intro) {
        if (day7IntroStep === 1) {
          drawIntroStepDia7(ctx, canvas.width, canvas.height);
        } else if (day7IntroStep === 2) {
          drawIntroStepAlarm(ctx, canvas.width, canvas.height);
        }
        animId = requestAnimationFrame(render);
        return;
      }
      if (isDay8Intro) {
        if (day8IntroStep === 1) {
          drawIntroStepDia8(ctx, canvas.width, canvas.height);
        } else if (day8IntroStep === 2) {
          drawIntroStepAlarm(ctx, canvas.width, canvas.height);
        }
        animId = requestAnimationFrame(render);
        return;
      }

      const grid = getGrid(currentMap);
      const npcs = getNPCs();

      // Delta time calculation for graphics engine
      const now = Date.now();
      const dt = Math.min(100, Math.max(1, now - lastFrameTimeRef.current));
      lastFrameTimeRef.current = now;

      // 60 FPS Sub-pixel Motion Interpolation
      motionInterpolatorRef.current.setTarget(playerPos.x, playerPos.y);
      const motionData = activeGraphicsConfig.smoothSubpixelMotion
        ? motionInterpolatorRef.current.update()
        : { x: playerPos.x, y: playerPos.y, justStepped: false };

      // Spawn subtle footstep particles when stepping
      if (motionData.justStepped && activeGraphicsConfig.weatherAndParticles) {
        particleEngineRef.current.spawnFootstep(
          motionData.x * TILE_SIZE + TILE_SIZE / 2,
          motionData.y * TILE_SIZE + TILE_SIZE / 2,
          currentMap === "bathroom"
        );
      }

      // Camera Offset Calculation (Center player dynamically on wider/taller maps with subpixel smoothness)
      const gridWidth = grid[0].length * TILE_SIZE;
      const gridHeight = grid.length * TILE_SIZE;

      // Update particle physics simulation
      if (activeGraphicsConfig.weatherAndParticles) {
        particleEngineRef.current.update(
          dt,
          gridWidth,
          gridHeight,
          currentMap,
          activeGraphicsConfig.particleDensity
        );
      }

      let cameraX = 0;
      let cameraY = 0;

      if (gridWidth > canvas.width) {
        const playerCenterX = motionData.x * TILE_SIZE + TILE_SIZE / 2;
        cameraX = Math.max(0, Math.min(playerCenterX - canvas.width / 2, gridWidth - canvas.width));
      } else {
        cameraX = -(canvas.width - gridWidth) / 2;
      }
      if (gridHeight > canvas.height) {
        const playerCenterY = motionData.y * TILE_SIZE + TILE_SIZE / 2;
        cameraY = Math.max(0, Math.min(playerCenterY - canvas.height / 2, gridHeight - canvas.height));
      } else {
        cameraY = -(canvas.height - gridHeight) / 2;
      }

      ctx.save();
      ctx.translate(-Math.floor(cameraX), -Math.floor(cameraY));

      // 1. Draw tilemap layout
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          const tile = grid[row][col];
          const x = col * TILE_SIZE;
          const y = row * TILE_SIZE;

          // Custom pixel art rendering
          if (tile === 1) {
            // Wall / Obstacle
            if (currentMap === "bedroom") {
              ctx.fillStyle = "#9eece5"; // Light aqua green (verde agua claro)
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#5fa19b"; // Soft dark-teal/aqua border
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              
              // Brick design lines
              ctx.fillStyle = "#7dbab3"; // Highlighted aqua bricks
              ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, 4);
              ctx.fillRect(x + 8, y + 20, TILE_SIZE - 16, 4);
            } else if (currentMap === "hallway") {
              // Light orange walls (naranja claro) for hallway
              ctx.fillStyle = "#fed7aa"; // Light orange fill
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#ea580c"; // Warm dark orange border
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              
              // Brick design lines
              ctx.fillStyle = "#fb923c"; // Light orange brick highlight
              ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, 4);
              ctx.fillRect(x + 8, y + 20, TILE_SIZE - 16, 4);

              // Cold / dark atmosphere tint on wall
              ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap === "moms_room") {
              ctx.fillStyle = "#fbcfe8"; // Soft warm pink wallpaper
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#f472b6"; // Warm pink border
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              
              ctx.fillStyle = "#f472b6";
              ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, 3);
              ctx.fillRect(x + 8, y + 20, TILE_SIZE - 16, 3);
            } else if (currentMap === "empty_room" || currentMap === "sisters_room" || currentMap === "bathroom" || currentMap === "house") {
              // Paredes del mismo color que la pieza de CKY (Verde agua claro)
              ctx.fillStyle = "#9eece5";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#5fa19b";
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              
              // Brick design lines
              ctx.fillStyle = "#7dbab3";
              ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, 4);
              ctx.fillRect(x + 8, y + 20, TILE_SIZE - 16, 4);
            } else if (currentMap === "soulmate_house") {
              ctx.fillStyle = "#1e1b4b"; // Deep indigo/navy walls
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#312e81";
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap === "soulmate_bedroom") {
              ctx.fillStyle = "#0f172a"; // Slate navy walls
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#1e293b";
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.fillStyle = currentMap === "limbo" ? "#0f172a" : "#1e293b";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = currentMap === "limbo" ? "#06b6d4" : "#475569";
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              
              // Brick design lines
              ctx.fillStyle = currentMap === "limbo" ? "#1e293b" : "#334155";
              ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, 4);
              ctx.fillRect(x + 8, y + 20, TILE_SIZE - 16, 4);
            }

            if (currentMap === "bedroom") {
              // High realism bedroom wall decorations
              if (row === 0) {
                if (col === 1 || col === 2 || col === 7 || col === 8) {
                  // Draw a cute hanging string of fairy lights
                  ctx.strokeStyle = "#4b5563";
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.arc(x + TILE_SIZE / 2, y + 6, 14, 0.2 * Math.PI, 0.8 * Math.PI);
                  ctx.stroke();

                  // Animated blinking fairy light bulbs
                  const pulse = Math.sin(Date.now() / 400 + col * 2) * 0.35 + 0.65;
                  ctx.fillStyle = `rgba(253, 224, 71, ${pulse})`; // Glowing yellow bulb
                  ctx.beginPath();
                  ctx.arc(x + 10, y + 16, 3, 0, Math.PI * 2);
                  ctx.fill();

                  ctx.fillStyle = `rgba(244, 114, 182, ${pulse})`; // Glowing pink bulb
                  ctx.beginPath();
                  ctx.arc(x + 20, y + 18, 3, 0, Math.PI * 2);
                  ctx.fill();

                  ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`; // Glowing cyan bulb
                  ctx.beginPath();
                  ctx.arc(x + 30, y + 16, 3, 0, Math.PI * 2);
                  ctx.fill();
                } else if (col === 3) {
                  // Draw a cute anime poster
                  ctx.fillStyle = "#fbcfe8"; // Poster background
                  ctx.fillRect(x + 6, y + 8, TILE_SIZE - 12, TILE_SIZE - 12);
                  ctx.strokeStyle = "#db2777"; // Poster frame
                  ctx.lineWidth = 1.5;
                  ctx.strokeRect(x + 6, y + 8, TILE_SIZE - 12, TILE_SIZE - 12);

                  // Poster artwork (character silhouette)
                  ctx.fillStyle = "#818cf8";
                  ctx.beginPath();
                  ctx.arc(x + TILE_SIZE / 2, y + 20, 5, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.fillRect(x + TILE_SIZE / 2 - 4, y + 24, 8, 8);

                  ctx.fillStyle = "#facc15"; // gold star
                  ctx.fillRect(x + 10, y + 12, 3, 3);
                } else if (col === 6) {
                  // Draw polaroid photos
                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(x + 6, y + 10, 11, 15);
                  ctx.fillStyle = "#1e293b";
                  ctx.fillRect(x + 8, y + 12, 7, 9);

                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(x + 22, y + 12, 11, 15);
                  ctx.fillStyle = "#1e293b";
                  ctx.fillRect(x + 24, y + 14, 7, 9);

                  // Cozy tape
                  ctx.fillStyle = "rgba(253, 224, 71, 0.4)";
                  ctx.fillRect(x + 9, y + 8, 5, 3);
                  ctx.fillRect(x + 25, y + 10, 5, 3);
                }
              }
            }
          } else {
            // Walkable Floor
            if (currentMap === "bedroom") {
              // Warm wood flooring base
              ctx.fillStyle = "#854d0e"; // Warm golden brown wood base
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              
              // Horizontal joint lines (plank stripes)
              ctx.strokeStyle = "#451a03"; // Darker joint lines
              ctx.lineWidth = 1.5;
              for (let offset = 0; offset < TILE_SIZE; offset += 10) {
                ctx.beginPath();
                ctx.moveTo(x, y + offset);
                ctx.lineTo(x + TILE_SIZE, y + offset);
                ctx.stroke();
              }
              
              // Vertical staggered plank seams for realistic parquet wood pattern
              ctx.strokeStyle = "#451a03";
              ctx.lineWidth = 1;
              ctx.beginPath();
              if (row % 2 === 0) {
                // Alternating seams in even rows
                ctx.moveTo(x + 12, y);
                ctx.lineTo(x + 12, y + 10);
                ctx.moveTo(x + 28, y + 10);
                ctx.lineTo(x + 28, y + 20);
                ctx.moveTo(x + 16, y + 20);
                ctx.lineTo(x + 16, y + 30);
                ctx.moveTo(x + 32, y + 30);
                ctx.lineTo(x + 32, y + 40);
              } else {
                // Alternating seams in odd rows
                ctx.moveTo(x + 24, y);
                ctx.lineTo(x + 24, y + 10);
                ctx.moveTo(x + 8, y + 10);
                ctx.lineTo(x + 8, y + 20);
                ctx.moveTo(x + 32, y + 20);
                ctx.lineTo(x + 32, y + 30);
                ctx.moveTo(x + 12, y + 30);
                ctx.lineTo(x + 12, y + 40);
              }
              ctx.stroke();
              
              // Subtle wood grain accent lines for ultra high realism
              ctx.strokeStyle = "rgba(251, 191, 36, 0.08)"; // lighter amber highlights
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x + 4, y + 5);
              ctx.lineTo(x + 16, y + 5);
              ctx.moveTo(x + 18, y + 14);
              ctx.lineTo(x + 34, y + 14);
              ctx.moveTo(x + 10, y + 26);
              ctx.lineTo(x + 24, y + 26);
              ctx.stroke();

              // Draw a large cozy circular pink rug in the center of the bedroom floor
              // Center coordinates of the bedroom floor rug: col 4.5, row 3.0
              const rx = 4 * TILE_SIZE + TILE_SIZE / 2;
              const ry = 3 * TILE_SIZE + TILE_SIZE / 2;
              
              ctx.save();
              ctx.beginPath();
              ctx.rect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.clip(); // Mask rendering to only the current floor tile boundaries

              // Rug body
              ctx.beginPath();
              ctx.arc(rx, ry, TILE_SIZE * 1.6, 0, Math.PI * 2);
              ctx.fillStyle = "#fbcfe8"; // Soft pastel pink base
              ctx.fill();

              // Concentric decorative border
              ctx.strokeStyle = "#f472b6"; // Darker pink circle
              ctx.lineWidth = 2.5;
              ctx.stroke();

              // Inner pattern line
              ctx.beginPath();
              ctx.arc(rx, ry, TILE_SIZE * 1.1, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(219, 39, 119, 0.3)";
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Small decorative stars on rug center
              ctx.fillStyle = "#ffffff";
              ctx.beginPath();
              ctx.arc(rx - 15, ry - 10, 3, 0, Math.PI * 2);
              ctx.arc(rx + 20, ry + 15, 3, 0, Math.PI * 2);
              ctx.arc(rx - 5, ry + 25, 2, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();
            } else if (currentMap === "hallway") {
              // Slate gray floor base (piso gris)
              ctx.fillStyle = "#1e293b";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

              // Cold / dark atmosphere tint
              ctx.fillStyle = "rgba(2, 6, 23, 0.5)";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap === "moms_room") {
              // Warm parquet wood floor
              ctx.fillStyle = "#92400e";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "rgba(120, 53, 15, 0.3)";
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

              // Center gold rug
              const rx = 4.5 * TILE_SIZE;
              const ry = 3.5 * TILE_SIZE;
              ctx.save();
              ctx.beginPath();
              ctx.rect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.clip();
              ctx.beginPath();
              ctx.arc(rx, ry, TILE_SIZE * 1.5, 0, Math.PI * 2);
              ctx.fillStyle = "#fde047";
              ctx.fill();
              ctx.strokeStyle = "#ca8a04";
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.restore();
            } else if (currentMap === "empty_room") {
              // Piso gris claro para la sala de estar
              ctx.fillStyle = "#cbd5e1";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = "#e2e8f0";
              ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (currentMap === "sisters_room") {
              // Piso de madera para la habitación de la hermana
              ctx.fillStyle = "#92400e";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#78350f";
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              
              // Plank seams
              ctx.strokeStyle = "#451a03";
              ctx.beginPath();
              ctx.moveTo(x, y + 10); ctx.lineTo(x + TILE_SIZE, y + 10);
              ctx.moveTo(x, y + 20); ctx.lineTo(x + TILE_SIZE, y + 20);
              ctx.moveTo(x, y + 30); ctx.lineTo(x + TILE_SIZE, y + 30);
              ctx.stroke();

              // Center lilac/pink rug
              const rx = 3.5 * TILE_SIZE;
              const ry = 2.5 * TILE_SIZE;
              ctx.save();
              ctx.beginPath();
              ctx.rect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.clip();
              ctx.beginPath();
              ctx.arc(rx, ry, TILE_SIZE * 1.5, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(244, 114, 182, 0.35)";
              ctx.fill();
              ctx.strokeStyle = "#f472b6";
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.restore();
            } else if (currentMap === "bathroom") {
              // Floor for Bathroom (azulejos celestes limpios)
              ctx.fillStyle = "#f0f9ff";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#bae6fd";
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = "rgba(224, 242, 254, 0.4)";
              ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (currentMap === "house") {
              // Piso cuadriculado blanco y negro para la cocina
              const isWhiteTile = (col + row) % 2 === 0;
              ctx.fillStyle = isWhiteTile ? "#f8fafc" : "#1e293b";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = isWhiteTile ? "#cbd5e1" : "#0f172a";
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = isWhiteTile ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.05)";
              ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            } else if (currentMap === "street") {
              // Vereda, Calle y Fachada de las 3 Casas del Vecindario
              if (row <= 2) {
                // Filas 0, 1, 2: Techo y Fachada de las 3 Casas
                if (col >= 2 && col <= 6) {
                  // Casa 1: Casa de CKY (Techo Terracota, Ladrillos Cálidos)
                  ctx.fillStyle = row === 0 ? "#9a3412" : "#78350f";
                  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                } else if (col >= 8 && col <= 12) {
                  // Casa 2: Casa Vecina (Techo Azul Cobalto, Pared Tostada)
                  ctx.fillStyle = row === 0 ? "#1e3a8a" : "#b45309";
                  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                } else if (col >= 14 && col <= 18) {
                  // Casa 3: Otra Casa (Techo Verde Oscuro, Pared Piedra Gris)
                  ctx.fillStyle = row === 0 ? "#0f766e" : "#334155";
                  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                } else {
                  ctx.fillStyle = "#0f172a";
                  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                }
              } else if (row === 3) {
                // Fila 3: Jardín Frontal y Porches de Entrada
                if ((col >= 2 && col <= 6) || (col >= 8 && col <= 12) || (col >= 14 && col <= 18)) {
                  if (col === 4 || col === 10 || col === 16) {
                    // Porche de Entrada bajo la puerta
                    ctx.fillStyle = col === 4 ? "#854d0e" : col === 10 ? "#7c2d12" : "#1e293b";
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    ctx.strokeStyle = "#451a03";
                    ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                  } else {
                    // Jardín Frontal Verde
                    ctx.fillStyle = "#15803d";
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                  }
                } else {
                  ctx.fillStyle = "#334155";
                  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                }
              } else if (row <= 6) {
                // Vereda (Sidewalk)
                ctx.fillStyle = (col + row) % 2 === 0 ? "#334155" : "#475569";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#1e293b";
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
                ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

                // Caminitos conectando las 3 puertas a la vereda en fila 4
                if (row === 4 && (col === 4 || col === 10 || col === 16)) {
                  ctx.fillStyle = col === 4 ? "#a16207" : col === 10 ? "#d97706" : "#475569";
                  ctx.fillRect(x + 8, y, 16, TILE_SIZE);
                  ctx.strokeStyle = "#facc15";
                  ctx.strokeRect(x + 8, y, 16, TILE_SIZE);
                }

                // Grass edge at sidewalk curb (row 6)
                if (row === 6) {
                  ctx.fillStyle = "#15803d";
                  ctx.fillRect(x, y + TILE_SIZE - 3, TILE_SIZE, 3);
                }
              } else if (row === 7 || row === 8) {
                // Asfalto / Dark textured asphalt road
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#1e293b";
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

                // Yellow road line divider at row 7
                if (row === 7) {
                  if (col % 2 === 0) {
                    ctx.fillStyle = "#facc15";
                    ctx.fillRect(x + 4, y + TILE_SIZE - 2, TILE_SIZE - 8, 4);
                  }
                }

                // Pedestrian Crosswalk (Senda Peatonal) at columns 13, 14, 15
                if (col >= 13 && col <= 15) {
                  ctx.fillStyle = "#f8fafc";
                  ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                }
              } else {
                // Fila 9: Cerco verde
                ctx.fillStyle = "#14532d";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              }
            } else if (currentMap === "bus_interior") {
              // Piso del colectivo (rubber bus floor mat with yellow aisle guide line)
              ctx.fillStyle = "#0f172a";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

              if (col === 2) {
                ctx.fillStyle = "rgba(250, 204, 21, 0.35)";
                ctx.fillRect(x + 18, y, 4, TILE_SIZE);
              }
            } else if (currentMap === "school_courtyard") {
              // Lawn grass floor with soccer pitch chalk lines
              ctx.fillStyle = "#15803d"; // Lawn green
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

              // Soccer Pitch White Lines (Row 3 to 7, Col 1 to 14)
              ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
              ctx.lineWidth = 2;

              if (row === 3 && col >= 1 && col <= 14) { ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; ctx.fillRect(x, y + 2, TILE_SIZE, 2); }
              if (row === 7 && col >= 1 && col <= 14) { ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 2); }
              if (col === 1 && row >= 3 && row <= 7) { ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; ctx.fillRect(x + 2, y, 2, TILE_SIZE); }
              if (col === 14 && row >= 3 && row <= 7) { ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; ctx.fillRect(x + TILE_SIZE - 4, y, 2, TILE_SIZE); }

              // Center line at col 7
              if (col === 7 && row >= 3 && row <= 7) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.fillRect(x + TILE_SIZE / 2 - 1, y, 2, TILE_SIZE);
              }
              // Center circle at col 7, row 5
              if (col === 7 && row === 5) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 20, 0, Math.PI * 2);
                ctx.stroke();
              }
            } else if (currentMap === "school_hallway") {
              // Polished marble/granite school corridor floor
              ctx.fillStyle = (col + row) % 2 === 0 ? "#e2e8f0" : "#cbd5e1";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap.startsWith("classroom_")) {
              // Polished wooden parquet classroom floor
              ctx.fillStyle = (col + row) % 2 === 0 ? "#b45309" : "#d97706";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#78350f";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap === "director_office") {
              // Luxurious dark mahogany parquet floor
              ctx.fillStyle = (col + row) % 2 === 0 ? "#451a03" : "#78350f";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#292524";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap === "teachers_room") {
              // Warm beige ceramic tiles
              ctx.fillStyle = (col + row) % 2 === 0 ? "#fef3c7" : "#fde68a";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#d97706";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap === "bathroom_girls") {
              // Pink ceramic tiles
              ctx.fillStyle = (col + row) % 2 === 0 ? "#fbcfe8" : "#f472b6";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#db2777";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap === "bathroom_boys") {
              // Light blue ceramic tiles
              ctx.fillStyle = (col + row) % 2 === 0 ? "#bae6fd" : "#38bdf8";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "#0284c7";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (currentMap === "ruins_valley") {
              // Ancient stone slab floor with moss and mystical ambient runes
              ctx.fillStyle = (col + row) % 2 === 0 ? "#334155" : "#1e293b";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

              // Ancient grass tufts
              if ((col * 3 + row * 7) % 5 === 0) {
                ctx.fillStyle = "#15803d";
                ctx.fillRect(x + 10, y + 25, 4, 8);
                ctx.fillRect(x + 22, y + 12, 3, 6);
              }
            } else if (currentMap === "shopping_mall") {
              // Shiny polished white marble and luxury mall plaza tiles
              ctx.fillStyle = (col + row) % 2 === 0 ? "#ffffff" : "#f1f5f9";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.strokeStyle = "rgba(203, 213, 225, 0.6)";
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

              // Boutique carpet at boutique zone (Cols 1 to 4, Row 1)
              if (col >= 1 && col <= 4 && row <= 2) {
                ctx.fillStyle = "rgba(244, 114, 182, 0.15)";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              }
              // Lingerie boutique carpet (Cols 12 to 16, Row 1 to 2)
              if (col >= 12 && col <= 16 && row <= 2) {
                ctx.fillStyle = "rgba(225, 29, 72, 0.18)";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              }
            } else {
              // Limbo animated spirit abyss floor
              ctx.fillStyle = "#0c4a6e";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              const pulse = Math.sin(Date.now() / 300 + (x + y) * 0.1) * 0.2 + 0.8;
              ctx.fillStyle = `rgba(6, 182, 212, ${pulse * 0.15})`;
              ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
          }

          // Specific Tile Graphics
          if (tile === 1 && currentMap === "bus_interior") {
            if (row === 0) {
              // Bus front windshield and roof header
              ctx.fillStyle = "#f59e0b"; // Yellow bus body
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              
              if (col >= 1 && col <= 3) {
                ctx.fillStyle = "#38bdf8";
                ctx.fillRect(x + 2, y + 8, TILE_SIZE - 4, TILE_SIZE - 12);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x + 2, y + 8, TILE_SIZE - 4, TILE_SIZE - 12);
              }
            } else if (col === 0 || col === 4 || col >= 5) {
              // Bus side wall and large glass windows
              ctx.fillStyle = "#d97706";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

              ctx.fillStyle = "#38bdf8";
              ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 1;
              ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);

              // Animated passing trees outside window
              const treeOffset = (Date.now() / 40) % TILE_SIZE;
              ctx.fillStyle = "#15803d";
              ctx.beginPath();
              ctx.arc(x + ((col * 10 + treeOffset) % (TILE_SIZE - 10)) + 5, y + TILE_SIZE / 2, 6, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (tile === 1 && currentMap === "street") {
            // Fachadas de las 3 Casas
            if (col >= 2 && col <= 6) {
              // Casa 1: Casa de CKY
              if (row === 0) {
                // Teja de terracota y chimenea en col 3
                ctx.fillStyle = "#c2410c";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE - 4);
                ctx.fillStyle = "#7f1d1d";
                ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
                
                if (col === 3) {
                  ctx.fillStyle = "#991b1b";
                  ctx.fillRect(x + 10, y, 12, TILE_SIZE);
                  ctx.strokeStyle = "#451a03";
                  ctx.strokeRect(x + 10, y, 12, TILE_SIZE);
                  ctx.fillStyle = "rgba(226, 232, 240, 0.6)";
                  ctx.beginPath();
                  ctx.arc(x + 16, y - 4, 4, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else if (row === 1) {
                // Pared de ladrillos (Sin cartel en la pared)
                ctx.fillStyle = "#78350f";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                // Ventanas en col 2 y col 6
                if (col === 2 || col === 6) {
                  ctx.fillStyle = "#38bdf8";
                  ctx.fillRect(x + 6, y + 4, 20, 16);
                  ctx.strokeStyle = "#ffffff";
                  ctx.lineWidth = 1.5;
                  ctx.strokeRect(x + 6, y + 4, 20, 16);
                  ctx.fillStyle = "#f472b6";
                  ctx.fillRect(x + 4, y + 20, 24, 6);
                }
              } else if (row === 2) {
                ctx.fillStyle = "#78350f";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#451a03";
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              } else if (row === 3) {
                // Reja de jardín blanca sobre césped
                ctx.fillStyle = "#15803d";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#f8fafc";
                for (let p = 2; p < TILE_SIZE; p += 6) {
                  ctx.fillRect(x + p, y + 8, 3, TILE_SIZE - 8);
                }
                ctx.fillRect(x, y + 12, TILE_SIZE, 3);
                ctx.fillRect(x, y + 22, TILE_SIZE, 3);
              }
            } else if (col >= 8 && col <= 12) {
              // Casa 2: Casa Vecina
              if (row === 0) {
                ctx.fillStyle = "#1e3a8a";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE - 4);
                ctx.fillStyle = "#1e1b4b";
                ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
              } else if (row === 1) {
                ctx.fillStyle = "#b45309";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                if (col === 8 || col === 12) {
                  ctx.fillStyle = "#fef08a";
                  ctx.fillRect(x + 6, y + 4, 20, 16);
                  ctx.strokeStyle = "#ffffff";
                  ctx.lineWidth = 1.5;
                  ctx.strokeRect(x + 6, y + 4, 20, 16);
                }
              } else if (row === 2) {
                ctx.fillStyle = "#b45309";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#78350f";
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              } else if (row === 3) {
                ctx.fillStyle = "#15803d";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#f8fafc";
                for (let p = 2; p < TILE_SIZE; p += 6) {
                  ctx.fillRect(x + p, y + 8, 3, TILE_SIZE - 8);
                }
                ctx.fillRect(x, y + 12, TILE_SIZE, 3);
              }
            } else if (col >= 14 && col <= 18) {
              // Casa 3: Otra Casa
              if (row === 0) {
                ctx.fillStyle = "#0f766e";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE - 4);
                ctx.fillStyle = "#134e4a";
                ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
              } else if (row === 1) {
                ctx.fillStyle = "#334155";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                if (col === 14 || col === 18) {
                  ctx.fillStyle = "#e2e8f0";
                  ctx.fillRect(x + 6, y + 4, 20, 16);
                  ctx.strokeStyle = "#0f172a";
                  ctx.lineWidth = 1.5;
                  ctx.strokeRect(x + 6, y + 4, 20, 16);
                }
              } else if (row === 2) {
                ctx.fillStyle = "#334155";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#1e293b";
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              } else if (row === 3) {
                ctx.fillStyle = "#15803d";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#f8fafc";
                for (let p = 2; p < TILE_SIZE; p += 6) {
                  ctx.fillRect(x + p, y + 8, 3, TILE_SIZE - 8);
                }
                ctx.fillRect(x, y + 12, TILE_SIZE, 3);
              }
            } else {
              ctx.fillStyle = "#1e293b";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
          } else if (tile === 33) {
            // Grimoire Shelf (Glowing purple arcane tome)
            ctx.fillStyle = "#451a03";
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.fillStyle = "#7e22ce"; // Purple book
            ctx.fillRect(x + 10, y + 8, TILE_SIZE - 20, TILE_SIZE - 16);
            ctx.fillStyle = "#fbbf24"; // Arcane seal
            ctx.fillRect(x + 16, y + 14, TILE_SIZE - 32, TILE_SIZE - 28);
          } else if (tile === 35) {
            // Nightstand with Framed Photo of Him & the Neighbor
            ctx.fillStyle = "#78350f"; // Nightstand table
            ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
            ctx.fillStyle = "#f59e0b"; // Gold frame
            ctx.fillRect(x + 12, y + 8, TILE_SIZE - 24, TILE_SIZE - 20);
            ctx.fillStyle = "#38bdf8"; // Canvas
            ctx.fillRect(x + 15, y + 11, TILE_SIZE - 30, TILE_SIZE - 26);
            // Two figures in photo
            ctx.fillStyle = "#e0e7ff";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2 - 4, y + 18, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#c084fc";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2 + 4, y + 18, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 2) {
            // Bedroom Door
            ctx.fillStyle = "#854d0e"; // Wooden door
            ctx.fillRect(x + 6, y, TILE_SIZE - 12, TILE_SIZE);
            ctx.fillStyle = "#facc15"; // Golden handle
            ctx.fillRect(x + TILE_SIZE - 12, y + 16, 3, 4);
          } else if (tile === 3 || tile === 31 || tile === 32) {
            if (currentMap === "street") {
              // Puertas Principales en la Calle
              const doorColor = tile === 3 ? "#78350f" : tile === 31 ? "#2563eb" : "#475569";
              const frameColor = tile === 3 ? "#451a03" : tile === 31 ? "#1e3a8a" : "#1e293b";

              // Marco de madera / estructura
              ctx.fillStyle = frameColor;
              ctx.fillRect(x + 2, y, TILE_SIZE - 4, TILE_SIZE);
              
              // Hoja de la puerta
              ctx.fillStyle = doorColor;
              ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 2);
              ctx.strokeStyle = "#facc15";
              ctx.lineWidth = 1;
              ctx.strokeRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 2);

              // Picaporte dorado
              ctx.fillStyle = "#facc15";
              ctx.fillRect(x + TILE_SIZE - 8, y + 18, 3, 5);

              // Placa con texto escrito en la puerta
              if (tile === 3) {
                // Escribe "CASA"
                ctx.fillStyle = "#451a03";
                ctx.fillRect(x + 5, y + 6, TILE_SIZE - 10, 11);
                ctx.strokeStyle = "#facc15";
                ctx.strokeRect(x + 5, y + 6, TILE_SIZE - 10, 11);

                ctx.fillStyle = "#fef08a";
                ctx.font = "bold 8px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("CASA", x + TILE_SIZE / 2, y + 15);
              } else if (tile === 31) {
                // Escribe "VECINA"
                ctx.fillStyle = "#1e3a8a";
                ctx.fillRect(x + 4, y + 6, TILE_SIZE - 8, 11);
                ctx.strokeStyle = "#93c5fd";
                ctx.strokeRect(x + 4, y + 6, TILE_SIZE - 8, 11);

                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 7px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("VECINA", x + TILE_SIZE / 2, y + 15);
              }
              // Si tile === 32, no escribe nada (puerta lisa sin cartel)
            } else {
              // Main Door inside
              ctx.fillStyle = "#b45309";
              ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
            }
          } else if (tile === 4) {
            // Bed with two pillows (soft pink girl's bed, oriented horizontally with headboard on the right wall)
            if (currentMap === "bedroom" && row === 4) {
              // Draw realistic drop shadow under the bed onto the floor below
              ctx.fillStyle = "rgba(15, 12, 30, 0.35)";
              ctx.fillRect(x, y + TILE_SIZE, TILE_SIZE, 6);
            }

            ctx.fillStyle = "#fbcfe8"; // Cute pink sheets
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            
            // Draw wooden edges
            ctx.fillStyle = "#7c2d12"; // Wood frame color
            if (col === 8) {
              ctx.fillRect(x + TILE_SIZE - 6, y, 6, TILE_SIZE); // Headboard on the right
            }
            if (col === 7) {
              ctx.fillRect(x, y, 6, TILE_SIZE); // Footboard on the left
            }
            if (row === 3) {
              ctx.fillRect(x, y, TILE_SIZE, 4); // Top side-rail
            }
            if (row === 4) {
              ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4); // Bottom side-rail
            }

            // Blanket/Quilt on the left side (covering col 7, spilling slightly into col 8)
            if (col === 7) {
              ctx.fillStyle = "#f472b6"; // Darker pink blanket/quilt
              ctx.fillRect(x + 6, y + 4, TILE_SIZE - 6, TILE_SIZE - 8);
              
              // Decorative stars / patterns on blanket
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(x + 16, y + 16, 4, 4);
              ctx.fillRect(x + 28, y + 24, 4, 4);
            } else if (col === 8) {
              // Pillow drawing on the head side (col 8, row 3 and row 4)
              ctx.fillStyle = "#ffffff";
              ctx.strokeStyle = "#db2777";
              ctx.lineWidth = 1.5;
              
              // Draw pillow rectangle
              ctx.fillRect(x + 6, y + 8, TILE_SIZE - 20, TILE_SIZE - 16);
              ctx.strokeRect(x + 6, y + 8, TILE_SIZE - 20, TILE_SIZE - 16);
              
              // Pillow detail/stripe
              ctx.fillStyle = "#f472b6";
              ctx.fillRect(x + 12, y + 12, 4, TILE_SIZE - 24);
            }
          } else if (tile === 5) {
            // Spirit Rift Portal
            const wave = Math.sin(Date.now() / 200) * 4;
            const grad = ctx.createRadialGradient(x + 20, y + 20, 2, x + 20, y + 20, 16 + wave);
            grad.addColorStop(0, "#06b6d4");
            grad.addColorStop(0.5, "#8b5cf6");
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(x - 5, y - 5, TILE_SIZE + 10, TILE_SIZE + 10);
          } else if (tile === 10) {
            // Mesa de luz (Bedside table)
            if (currentMap === "bedroom") {
              // Soft drop shadow
              ctx.fillStyle = "rgba(15, 12, 30, 0.4)";
              ctx.beginPath();
              ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE - 1, 14, 5, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.fillStyle = "#b45309"; // Warm brown wood
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            
            // Drawer lines
            ctx.fillStyle = "#78350f";
            ctx.fillRect(x + 6, y + 14, TILE_SIZE - 12, 3);
            ctx.fillRect(x + 6, y + 26, TILE_SIZE - 12, 3);
            
            // Drawer knobs
            ctx.fillStyle = "#facc15"; // gold knob
            ctx.fillRect(x + TILE_SIZE / 2 - 2, y + 10, 4, 4);
            ctx.fillRect(x + TILE_SIZE / 2 - 2, y + 22, 4, 4);
            
            // Smartphone on top
            ctx.fillStyle = "#1e293b"; // glass screen
            ctx.fillRect(x + 12, y + 6, 8, 12);
            ctx.fillStyle = "#22c55e"; // glowing power LED indicator
            ctx.fillRect(x + 15, y + 8, 2, 2);
          } else if (tile === 11) {
            // First, draw wall background
            ctx.fillStyle = currentMap === "limbo" ? "#0f172a" : "#1e293b";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            
            // Window glass pane (blue sky at night)
            ctx.fillStyle = "#0f172a"; // Deep night blue
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            
            // Soft curtain frame (Crimson Red Curtains)
            ctx.fillStyle = "#b91c1c"; // Red curtains
            if (!curtainsOpen) {
              // Curtains CLOSED
              if (col === 4) {
                // Left curtain fully closed
                ctx.fillRect(x + 4, y + 4, TILE_SIZE - 4, TILE_SIZE - 8);
                // Draw folds/creases
                ctx.fillStyle = "#991b1b"; // Darker red crease folds
                ctx.fillRect(x + 10, y + 4, 3, TILE_SIZE - 8);
                ctx.fillRect(x + 24, y + 4, 3, TILE_SIZE - 8);
              }
              if (col === 5) {
                // Right curtain fully closed
                ctx.fillRect(x, y + 4, TILE_SIZE - 4, TILE_SIZE - 8);
                // Draw folds/creases
                ctx.fillStyle = "#991b1b"; // Darker red crease folds
                ctx.fillRect(x + 10, y + 4, 3, TILE_SIZE - 8);
                ctx.fillRect(x + 24, y + 4, 3, TILE_SIZE - 8);
              }
            } else {
              // Curtains OPEN (pulled back)
              if (col === 4) {
                // Left curtain pulled back
                ctx.beginPath();
                ctx.moveTo(x + 4, y + 4);
                ctx.lineTo(x + 18, y + 4);
                ctx.lineTo(x + 10, y + TILE_SIZE - 4);
                ctx.lineTo(x + 4, y + TILE_SIZE - 4);
                ctx.closePath();
                ctx.fill();
              }
              if (col === 5) {
                // Right curtain pulled back
                ctx.beginPath();
                ctx.moveTo(x + TILE_SIZE - 4, y + 4);
                ctx.lineTo(x + TILE_SIZE - 18, y + 4);
                ctx.lineTo(x + TILE_SIZE - 10, y + TILE_SIZE - 4);
                ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE - 4);
                ctx.closePath();
                ctx.fill();
              }
            }
            
            // Window panes / grid
            ctx.strokeStyle = "#94a3b8"; // light gray frame
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE / 2, y + 4);
            ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE - 4);
            ctx.moveTo(x + 4, y + TILE_SIZE / 2);
            ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE / 2);
            ctx.stroke();
          } else if (tile === 12) {
            // Wooden Frame for Mirror
            ctx.fillStyle = "#a16207"; // Brown frame
            ctx.fillRect(x + 6, y + 2, TILE_SIZE - 12, TILE_SIZE - 4);
            
            // Glass mirror surface
            ctx.fillStyle = "#bae6fd"; // Light sky blue reflective glass
            ctx.fillRect(x + 10, y + 6, TILE_SIZE - 20, TILE_SIZE - 12);
            
            // Reflection shine lines
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + 14, y + 10);
            ctx.lineTo(x + TILE_SIZE - 14, y + TILE_SIZE - 10);
            ctx.stroke();
          } else if (tile === 13) {
            // Ropero / Closet
            if (currentMap === "bedroom" && row === 4) {
              // Draw realistic drop shadow under the closet
              ctx.fillStyle = "rgba(15, 12, 30, 0.35)";
              ctx.fillRect(x + 4, y + TILE_SIZE, TILE_SIZE - 8, 6);
            }

            ctx.fillStyle = "#854d0e"; // Warm wood
            ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            
            // Draw closet details
            if (row === 3) {
              // Top cabinet arch/crown
              ctx.fillStyle = "#451a03";
              ctx.fillRect(x + 2, y, TILE_SIZE - 4, 6);
            }
            if (row === 4) {
              // Bottom drawer line
              ctx.fillStyle = "#451a03";
              ctx.fillRect(x + 4, y + TILE_SIZE - 12, TILE_SIZE - 8, 3);
            }
            
            // Vertical split of doors
            ctx.strokeStyle = "#451a03";
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE / 2, y);
            ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE);
            ctx.stroke();
            
            // Handles (Golden)
            ctx.fillStyle = "#facc15";
            if (row === 3) {
              ctx.fillRect(x + TILE_SIZE / 2 - 4, y + 24, 2, 6);
              ctx.fillRect(x + TILE_SIZE / 2 + 2, y + 24, 2, 6);
            }
          } else if (tile === 14) {
            // Mueble útiles & mochila (Horizontal alignment in col 4 and col 5 of row 6)
            if (currentMap === "bedroom") {
              // Soft drop shadow on floor below
              ctx.fillStyle = "rgba(15, 12, 30, 0.35)";
              ctx.fillRect(x + 4, y + TILE_SIZE - 2, TILE_SIZE - 8, 4);
            }

            ctx.fillStyle = "#b45309"; // Desk wood
            ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            
            if (col === 4) {
              // Top shelves with school supplies
              // Drawing tiny books
              ctx.fillStyle = "#ef4444"; ctx.fillRect(x + 8, y + 6, 4, 12);
              ctx.fillStyle = "#3b82f6"; ctx.fillRect(x + 13, y + 8, 3, 10);
              ctx.fillStyle = "#10b981"; ctx.fillRect(x + 17, y + 4, 4, 14);
              
              // Draw pencil holder cup
              ctx.fillStyle = "#facc15";
              ctx.fillRect(x + 24, y + 10, 6, 8);
              ctx.fillStyle = "#64748b"; // tiny pencil tips
              ctx.fillRect(x + 25, y + 6, 1, 4);
              ctx.fillRect(x + 28, y + 5, 1, 5);
            }
            
            if (col === 5) {
              // Lower shelf containing a backpack
              ctx.fillStyle = "#3b82f6"; // Blue backpack
              ctx.fillRect(x + 8, y + 10, TILE_SIZE - 16, TILE_SIZE - 16);
              // Straps
              ctx.strokeStyle = "#1d4ed8";
              ctx.lineWidth = 2;
              ctx.strokeRect(x + 10, y + 12, TILE_SIZE - 20, TILE_SIZE - 20);
              // Backpack hanging loop
              ctx.fillStyle = "#1d4ed8";
              ctx.fillRect(x + TILE_SIZE / 2 - 3, y + 6, 6, 4);
            }
          } else if (tile === 15) {
            // Silla con ropa (Chair with messy clothes piled on)
            if (currentMap === "bedroom") {
              // Soft drop shadows under the legs of the chair
              ctx.fillStyle = "rgba(15, 12, 30, 0.4)";
              ctx.beginPath();
              ctx.ellipse(x + 9, y + TILE_SIZE - 2, 4, 2, 0, 0, Math.PI * 2);
              ctx.ellipse(x + TILE_SIZE - 9, y + TILE_SIZE - 2, 4, 2, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            // Wood chair legs
            ctx.strokeStyle = "#7c2d12";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 8, y + TILE_SIZE - 4);
            ctx.lineTo(x + 8, y + 16);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE - 8, y + TILE_SIZE - 4);
            ctx.lineTo(x + TILE_SIZE - 8, y + 16);
            ctx.stroke();
            
            // Chair Seat (wooden base)
            ctx.fillStyle = "#a16207"; // Brown seat
            ctx.fillRect(x + 6, y + 14, TILE_SIZE - 12, 6);
            
            // Backrest
            ctx.fillRect(x + 6, y + 2, 4, 12);
            ctx.fillRect(x + TILE_SIZE - 10, y + 2, 4, 12);
            ctx.fillRect(x + 6, y + 2, TILE_SIZE - 12, 4);
            
            // Colorful messy clothes draped on it
            ctx.fillStyle = "#3b82f6"; // Blue shirt
            ctx.fillRect(x + 10, y + 6, TILE_SIZE - 20, 10);
            ctx.fillStyle = "#ef4444"; // Red socks/sleeves hanging down
            ctx.fillRect(x + 12, y + 12, 4, 12);
            ctx.fillRect(x + TILE_SIZE - 16, y + 12, 4, 10);
            
            // Folder texture
            ctx.fillStyle = "#1d4ed8";
            ctx.fillRect(x + 14, y + 8, 8, 3);
          } else if (tile === 17) {
            // Door to CKY's bedroom (Puerta de ingreso a la habitación de CKY con su nombre en amarillo)
            ctx.fillStyle = "#854d0e"; // Wooden door base
            ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.fillStyle = "#facc15"; // Golden handle
            ctx.fillRect(x + TILE_SIZE - 10, y + 18, 3, 4);

            // Written in yellow: CKY name
            ctx.fillStyle = "#fde047"; // Yellow font
            ctx.font = "bold 10px 'JetBrains Mono', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("CKY", x + TILE_SIZE / 2, y + 12);
          } else if (tile === 18) {
            // Door to Next Room / Bathroom (Col 0, Fila 2) - Puerta de madera
            ctx.fillStyle = "#78350f"; // Wooden door base
            ctx.fillRect(x, y + 4, TILE_SIZE, TILE_SIZE - 8);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y + 4, TILE_SIZE, TILE_SIZE - 8);

            // Wood panel recessed details
            ctx.fillStyle = "#92400e";
            ctx.fillRect(x + 4, y + 8, 12, TILE_SIZE - 16);
            ctx.fillRect(x + 20, y + 8, 12, TILE_SIZE - 16);

            // Metallic brass door handle
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + 26, y + TILE_SIZE / 2 - 2, 4, 4);
            ctx.fillStyle = "#ca8a04";
            ctx.fillRect(x + 24, y + TILE_SIZE / 2 - 1, 2, 2);
          } else if (tile === 19) {
            // Door to Mom's bedroom (Fila 4, Col 5)
            ctx.fillStyle = "#9a3412"; // Terracotta wooden door
            ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.strokeStyle = "#7c2d12";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.fillStyle = "#facc15"; // Golden handle
            ctx.fillRect(x + TILE_SIZE - 10, y + 18, 3, 4);

            // Label for Mom's room
            ctx.fillStyle = "#fbcfe8"; // Pink label text
            ctx.font = "bold 8px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("MAMÁ", x + TILE_SIZE / 2, y + 12);
          } else if (tile === 20) {
            // Mom's Plant / Flower Pot
            ctx.fillStyle = "#b45309"; // Terracotta pot
            ctx.fillRect(x + 12, y + 20, 16, 16);
            ctx.fillStyle = "#15803d"; // Lush green leaves
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + 14, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f43f5e"; // Pink flowers
            ctx.fillRect(x + 16, y + 10, 4, 4);
            ctx.fillRect(x + 22, y + 14, 4, 4);
          } else if (tile === 21) {
            // High detail Toilet
            // Drop shadow
            ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
            ctx.beginPath();
            ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE - 2, 12, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tank base & lid
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 10, y + 4, 20, 12);
            ctx.fillStyle = "#e2e8f0"; // Tank side shadow
            ctx.fillRect(x + 26, y + 4, 4, 12);
            ctx.fillStyle = "#f1f5f9"; // Tank lid top
            ctx.fillRect(x + 9, y + 3, 22, 3);
            ctx.fillStyle = "#94a3b8"; // Flush button
            ctx.fillRect(x + 18, y + 4, 4, 2);

            // Bowl base & seat
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(x + TILE_SIZE / 2, y + 24, 10, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Water inside
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.ellipse(x + TILE_SIZE / 2, y + 25, 6, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#7dd3fc"; // Water shine
            ctx.fillRect(x + TILE_SIZE / 2 - 2, y + 22, 3, 2);
          } else if (tile === 22) {
            // High detail Sink & Vanity Mirror
            // Drop shadow
            ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
            ctx.fillRect(x + 6, y + TILE_SIZE - 3, TILE_SIZE - 12, 4);

            // Wooden Mirror Frame
            ctx.fillStyle = "#92400e";
            ctx.fillRect(x + 8, y + 1, 24, 15);
            ctx.fillStyle = "#78350f";
            ctx.strokeRect(x + 8, y + 1, 24, 15);

            // Mirror Glass & Diagonal Glare
            ctx.fillStyle = "#bae6fd";
            ctx.fillRect(x + 10, y + 3, 20, 11);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(x + 12, y + 3);
            ctx.lineTo(x + 22, y + 3);
            ctx.lineTo(x + 12, y + 13);
            ctx.closePath();
            ctx.fill();

            // Porcelain Basin Cabinet
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(x + 6, y + 18, 28, 18);
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(x + 30, y + 18, 4, 18); // Cabinet shadow edge

            // Sink Bowl
            ctx.fillStyle = "#cbd5e1";
            ctx.beginPath();
            ctx.ellipse(x + TILE_SIZE / 2, y + 25, 9, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(x + TILE_SIZE / 2 - 2, y + 24, 4, 2);

            // Chrome Faucet & Handles
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(x + TILE_SIZE / 2 - 2, y + 15, 4, 5);
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(x + TILE_SIZE / 2 - 1, y + 15, 2, 2);
          } else if (tile === 23) {
            // High detail Bathtub / Glass Shower
            ctx.fillStyle = "#e0f2fe"; // Tiled shower base
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#38bdf8";
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

            // Water tub interior
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);

            // Water reflections / ripples
            const ripple = Math.sin(Date.now() / 350) * 2;
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(x + 8, y + 10 + ripple, 12, 2);
            ctx.fillRect(x + 16, y + 22 - ripple, 14, 2);

            // Chrome Showerhead (top corner)
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(x + 6, y + 4, 8, 3);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x + 10, y + 8, 4, 0, Math.PI * 2);
            ctx.fill();

            // Water droplets spraying
            ctx.fillStyle = "#7dd3fc";
            ctx.fillRect(x + 8, y + 14, 2, 2);
            ctx.fillRect(x + 12, y + 16, 2, 2);
          } else if (tile === 24) {
            // Towel Rack
            ctx.fillStyle = "#94a3b8"; // Metal wall supports
            ctx.fillRect(x + 4, y + 6, 2, 4);
            ctx.fillRect(x + TILE_SIZE - 6, y + 6, 2, 4);
            ctx.fillRect(x + 4, y + 7, TILE_SIZE - 8, 2);

            // Fluffy hanging towels with fringe folds
            // Towel 1: Coral pink
            ctx.fillStyle = "#f472b6";
            ctx.fillRect(x + 7, y + 9, 11, 24);
            ctx.fillStyle = "#db2777";
            ctx.fillRect(x + 16, y + 9, 2, 24); // Fold crease

            // Towel 2: Turquoise cyan
            ctx.fillStyle = "#22d3ee";
            ctx.fillRect(x + 20, y + 9, 11, 21);
            ctx.fillStyle = "#0891b2";
            ctx.fillRect(x + 29, y + 9, 2, 21);
          } else if (tile === 25) {
            // High detail Woven Laundry Hamper
            // Drop shadow
            ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
            ctx.beginPath();
            ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE - 2, 12, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wicker body base
            ctx.fillStyle = "#d97706";
            ctx.fillRect(x + 8, y + 10, 24, 26);
            ctx.strokeStyle = "#92400e";
            ctx.strokeRect(x + 8, y + 10, 24, 26);

            // Cross-hatch wicker weave pattern
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 1;
            for (let i = 14; i < 34; i += 5) {
              ctx.beginPath();
              ctx.moveTo(x + 8, y + i);
              ctx.lineTo(x + 32, y + i);
              ctx.stroke();
            }

            // Piled overflowing clothes at top
            ctx.fillStyle = "#fbcfe8"; // Pink hoodie
            ctx.beginPath();
            ctx.arc(x + 14, y + 8, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#60a5fa"; // Blue jeans
            ctx.beginPath();
            ctx.arc(x + 25, y + 7, 7, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 26 || tile === 29 || tile === 34) {
            // General Exit Door
            ctx.fillStyle = "#78350f";
            ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + TILE_SIZE - 10, y + 18, 3, 4);
          } else if (tile === 27) {
            // Sister's Room Door
            ctx.fillStyle = "#a855f7"; // Lilac wooden door
            ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.strokeStyle = "#7e22ce";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + TILE_SIZE - 10, y + 18, 3, 4);
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 8px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("HERMANA", x + TILE_SIZE / 2, y + 12);
          } else if (tile === 28) {
            // Bathroom Door in Empty Room
            ctx.fillStyle = "#0284c7"; // Blue door
            ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.strokeStyle = "#0369a1";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + TILE_SIZE - 10, y + 18, 3, 4);
            ctx.fillStyle = "#f0f9ff";
            ctx.font = "bold 8px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("BAÑO", x + TILE_SIZE / 2, y + 12);
          } else if (tile === 30) {
            // Sister's Bed (Horizontal single bed)
            ctx.fillStyle = "#9333ea"; // Purple bed frame
            ctx.fillRect(x, y + 4, TILE_SIZE, TILE_SIZE - 8);

            // Mattress
            ctx.fillStyle = "#faf5ff";
            ctx.fillRect(x + 2, y + 6, TILE_SIZE - 4, TILE_SIZE - 12);

            // White pillow on left
            ctx.fillStyle = "#f3e8ff";
            ctx.fillRect(x + 4, y + 8, 10, TILE_SIZE - 16);
            ctx.strokeStyle = "#c084fc";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 4, y + 8, 10, TILE_SIZE - 16);

            // Lilac blanket on right
            ctx.fillStyle = "#d8b4fe";
            ctx.fillRect(x + 16, y + 6, TILE_SIZE - 16, TILE_SIZE - 12);

            // Blanket seam line
            ctx.fillStyle = "#c084fc";
            ctx.fillRect(x + 16, y + 6, 2, TILE_SIZE - 12);

            // Cute plushie on bed
            ctx.fillStyle = "#f43f5e";
            ctx.beginPath();
            ctx.arc(x + 24, y + TILE_SIZE / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 22, y + TILE_SIZE / 2 - 4, 2, 0, Math.PI * 2);
            ctx.arc(x + 26, y + TILE_SIZE / 2 - 4, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 31) {
            // Sister's Desk & Laptop
            ctx.fillStyle = "#a855f7"; // Desk wood
            ctx.fillRect(x + 4, y + 10, TILE_SIZE - 8, TILE_SIZE - 12);
            ctx.fillStyle = "#cbd5e1"; // Laptop base
            ctx.fillRect(x + 10, y + 16, 12, 6);
            ctx.fillStyle = "#38bdf8"; // Laptop screen glow
            ctx.fillRect(x + 11, y + 8, 10, 7);
          } else if (tile === 32) {
            // Sister's Ropero / Closet
            ctx.fillStyle = "#854d0e"; // Warm wood wardrobe
            ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 4);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 4);
            // Double door split line
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE / 2, y + 2);
            ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE - 2);
            ctx.stroke();
            // Golden door handles
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + TILE_SIZE / 2 - 3, y + 16, 2, 5);
            ctx.fillRect(x + TILE_SIZE / 2 + 1, y + 16, 2, 5);
            // Decorative mirror panel on left door
            ctx.fillStyle = "#e0f2fe";
            ctx.fillRect(x + 7, y + 6, 9, 20);
            ctx.strokeStyle = "#93c5fd";
            ctx.strokeRect(x + 7, y + 6, 9, 20);
          } else if (tile === 33) {
            // Sister's Bookshelf / Plushies
            ctx.fillStyle = "#a855f7";
            ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 4);
            ctx.fillStyle = "#fb7185"; // Pink books
            ctx.fillRect(x + 8, y + 6, 4, 10);
            ctx.fillStyle = "#38bdf8"; // Blue book
            ctx.fillRect(x + 14, y + 8, 4, 8);
            ctx.fillStyle = "#fbbf24"; // Teddy bear plushie
            ctx.beginPath();
            ctx.arc(x + 22, y + 12, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 36) {
            // Ventana con cortinas
            ctx.fillStyle = "#bae6fd";
            ctx.fillRect(x + 4, y + 6, TILE_SIZE - 8, TILE_SIZE - 12);
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y + 6, TILE_SIZE - 8, TILE_SIZE - 12);
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE / 2, y + 6);
            ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE - 6);
            ctx.moveTo(x + 4, y + TILE_SIZE / 2);
            ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE / 2);
            ctx.stroke();
            // Window glare
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.beginPath();
            ctx.moveTo(x + 6, y + 8);
            ctx.lineTo(x + 18, y + 8);
            ctx.lineTo(x + 6, y + 20);
            ctx.closePath();
            ctx.fill();

            // Cortinas rosadas en los laterales de la ventana
            const isOpen = currentMap === "empty_room" ? livingCurtainsOpen : currentMap === "house" ? kitchenWindowOpen : curtainsOpen;
            ctx.fillStyle = "#f43f5e"; // Rose pink curtains
            if (isOpen) {
              // Tied back tightly to open window
              ctx.fillRect(x, y + 2, 4, TILE_SIZE - 4);
              ctx.fillRect(x + TILE_SIZE - 4, y + 2, 4, TILE_SIZE - 4);

              // If open kitchen window, draw morning sunlight beam
              if (currentMap === "house") {
                ctx.fillStyle = "rgba(254, 240, 138, 0.25)";
                ctx.beginPath();
                ctx.moveTo(x + 4, y + TILE_SIZE);
                ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE);
                ctx.lineTo(x + TILE_SIZE + 16, y + TILE_SIZE + 32);
                ctx.lineTo(x - 16, y + TILE_SIZE + 32);
                ctx.closePath();
                ctx.fill();
              }
            } else {
              // Closed / partially draped
              ctx.beginPath();
              ctx.moveTo(x, y + 2);
              ctx.lineTo(x + 10, y + 2);
              ctx.lineTo(x + 6, y + TILE_SIZE - 2);
              ctx.lineTo(x, y + TILE_SIZE - 2);
              ctx.closePath();
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(x + TILE_SIZE, y + 2);
              ctx.lineTo(x + TILE_SIZE - 10, y + 2);
              ctx.lineTo(x + TILE_SIZE - 6, y + TILE_SIZE - 2);
              ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE - 2);
              ctx.closePath();
              ctx.fill();
            }

            // Barral dorado superior
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x, y + 2, TILE_SIZE, 3);
          } else if (tile === 37) {
            // Mesa (3,3; 4,3; 3,4; 4,4)
            ctx.fillStyle = "#78350f"; // Wood top
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.fillStyle = "#92400e";
            ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
            ctx.fillStyle = "#fef3c7"; // Tablecloth detail
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 38) {
            // Chimenea (8,1)
            ctx.fillStyle = "#7f1d1d"; // Dark brick red
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#450a0a";
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.fillStyle = "#18181b"; // Arch cavity
            ctx.fillRect(x + 8, y + 12, TILE_SIZE - 16, TILE_SIZE - 14);
            // Fireplace animation (Lit or Unlit)
            const isLit = currentMap === "house" ? kitchenFireplaceLit : livingFireplaceLit;
            if (isLit) {
              const flicker = Math.sin(Date.now() / 120) * 3 + 7;
              ctx.fillStyle = "#ef4444";
              ctx.beginPath();
              ctx.arc(x + TILE_SIZE / 2, y + 25, flicker + 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#f97316";
              ctx.beginPath();
              ctx.arc(x + TILE_SIZE / 2, y + 26, flicker, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#facc15";
              ctx.beginPath();
              ctx.arc(x + TILE_SIZE / 2, y + 27, flicker * 0.6, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Dim embers
              ctx.fillStyle = "#7f1d1d";
              ctx.beginPath();
              ctx.arc(x + TILE_SIZE / 2, y + 28, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (tile === 39) {
            // Bibliotecas (1,1; 2,1)
            ctx.fillStyle = "#92400e";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#78350f";
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            const bookColors = ["#ef4444", "#3b82f6", "#10b981", "#eab308", "#a855f7"];
            for (let i = 0; i < 5; i++) {
              ctx.fillStyle = bookColors[i % bookColors.length];
              ctx.fillRect(x + 6 + i * 6, y + 8, 4, 22);
            }
          } else if (tile === 40) {
            // Mueble (6,6)
            ctx.fillStyle = "#b45309";
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.strokeStyle = "#78350f";
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + 12, y + 18, 3, 3);
            ctx.fillRect(x + 24, y + 18, 3, 3);
          } else if (tile === 41) {
            // Inodoro (Toilet)
            ctx.fillStyle = "#f8fafc"; // Ceramic white tank
            ctx.fillRect(x + 10, y + 4, TILE_SIZE - 20, 12);
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 10, y + 4, TILE_SIZE - 20, 12);
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + 25, 11, 0, Math.PI * 2); // Bowl
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#38bdf8"; // Water inside bowl
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + 25, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 42) {
            // Lavamanos y Espejo (Sink & Mirror)
            ctx.fillStyle = "#38bdf8"; // Mirror border
            ctx.fillRect(x + 10, y + 2, 20, 14);
            ctx.fillStyle = "#e0f2fe"; // Glass mirror
            ctx.fillRect(x + 12, y + 4, 16, 10);
            ctx.fillStyle = "#ffffff"; // Basin
            ctx.fillRect(x + 6, y + 18, TILE_SIZE - 12, 18);
            ctx.strokeStyle = "#cbd5e1";
            ctx.strokeRect(x + 6, y + 18, TILE_SIZE - 12, 18);
            ctx.fillStyle = "#64748b"; // Faucet
            ctx.fillRect(x + TILE_SIZE / 2 - 2, y + 16, 4, 5);
          } else if (tile === 43) {
            // Bañera / Ducha (Bathtub / Shower)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.fillStyle = "#38bdf8"; // Water
            ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
            ctx.fillStyle = "#e0f2fe"; // Foam / Bubbles
            ctx.beginPath();
            ctx.arc(x + 12, y + 12, 3, 0, Math.PI * 2);
            ctx.arc(x + 22, y + 22, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 44) {
            // Toallero / Mueble de baño (Towel Rack & Cabinet)
            ctx.fillStyle = "#0284c7"; // Blue cabinet
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.strokeStyle = "#0369a1";
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.fillStyle = "#f43f5e"; // Fluffy pink towel
            ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, 6);
            ctx.fillStyle = "#ffffff"; // White towel
            ctx.fillRect(x + 8, y + 18, TILE_SIZE - 16, 6);
          } else if (tile === 25) {
            // Cesto de ropa sucia (Laundry hamper)
            ctx.fillStyle = "#d97706"; // Wicker hamper
            ctx.fillRect(x + 5, y + 6, TILE_SIZE - 10, TILE_SIZE - 10);
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 5, y + 6, TILE_SIZE - 10, TILE_SIZE - 10);
            // Wicker texture lines
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 14); ctx.lineTo(x + TILE_SIZE - 5, y + 14);
            ctx.moveTo(x + 5, y + 22); ctx.lineTo(x + TILE_SIZE - 5, y + 22);
            ctx.stroke();
            // Clothes sticking out top
            ctx.fillStyle = "#a855f7"; ctx.fillRect(x + 8, y + 2, 7, 5); // Purple shirt
            ctx.fillStyle = "#3b82f6"; ctx.fillRect(x + 18, y + 3, 9, 4); // Blue jeans
            ctx.fillStyle = "#f43f5e"; ctx.fillRect(x + 12, y + 1, 6, 4); // Pink towel
          } else if (tile === 47) {
            // Heladera (Refrigerator en 8,6)
            ctx.fillStyle = "#e2e8f0"; // White / Stainless steel
            ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, TILE_SIZE - 4);
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 3, y + 2, TILE_SIZE - 6, TILE_SIZE - 4);
            // Door split line
            ctx.beginPath();
            ctx.moveTo(x + 3, y + 14);
            ctx.lineTo(x + TILE_SIZE - 3, y + 14);
            ctx.stroke();
            // Door handles
            ctx.fillStyle = "#475569";
            ctx.fillRect(x + 6, y + 5, 2, 6);
            ctx.fillRect(x + 6, y + 17, 2, 8);
            // Cute fridge magnets
            ctx.fillStyle = "#ef4444"; ctx.fillRect(x + 16, y + 6, 3, 3);
            ctx.fillStyle = "#3b82f6"; ctx.fillRect(x + 22, y + 8, 3, 3);
            ctx.fillStyle = "#22c55e"; ctx.fillRect(x + 26, y + 20, 3, 4);
          } else if (tile === 48) {
            // Cocina / Estufa (Stovetop & Oven en 7,6)
            ctx.fillStyle = "#334155"; // Dark metallic stove
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // 4 Burners
            ctx.fillStyle = "#020617";
            ctx.beginPath();
            ctx.arc(x + 11, y + 10, 4, 0, Math.PI * 2);
            ctx.arc(x + TILE_SIZE - 11, y + 10, 4, 0, Math.PI * 2);
            ctx.arc(x + 11, y + TILE_SIZE - 10, 4, 0, Math.PI * 2);
            ctx.arc(x + TILE_SIZE - 11, y + TILE_SIZE - 10, 4, 0, Math.PI * 2);
            ctx.fill();
            // Hot burner glow ring
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x + 11, y + 10, 2.5, 0, Math.PI * 2);
            ctx.stroke();
            // Knobs
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(x + 8, y + TILE_SIZE - 4, 3, 2);
            ctx.fillRect(x + 16, y + TILE_SIZE - 4, 3, 2);
            ctx.fillRect(x + 24, y + TILE_SIZE - 4, 3, 2);
          } else if (tile === 49) {
            // Pileta para lavar platos (Sink en 2,6)
            ctx.fillStyle = "#cbd5e1"; // Stainless steel counter
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Sink basin
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            ctx.strokeStyle = "#475569";
            ctx.strokeRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            // Faucet
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(x + TILE_SIZE / 2 - 2, y + 4, 4, 7);
            ctx.fillRect(x + TILE_SIZE / 2 - 4, y + 8, 8, 3);
            // Water drop
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + 18, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 50) {
            // Alacena para almacenar alimentos (Pantry en 3,6; 4,6; 5,6)
            ctx.fillStyle = "#78350f"; // Rich oak cabinet
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Glass doors
            ctx.fillStyle = "rgba(224, 242, 254, 0.4)";
            ctx.fillRect(x + 5, y + 5, TILE_SIZE / 2 - 6, TILE_SIZE - 10);
            ctx.fillRect(x + TILE_SIZE / 2 + 1, y + 5, TILE_SIZE / 2 - 6, TILE_SIZE - 10);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 5, y + 5, TILE_SIZE / 2 - 6, TILE_SIZE - 10);
            ctx.strokeRect(x + TILE_SIZE / 2 + 1, y + 5, TILE_SIZE / 2 - 6, TILE_SIZE - 10);
            // Food jars inside
            ctx.fillStyle = "#ef4444"; ctx.fillRect(x + 7, y + 10, 4, 6);
            ctx.fillStyle = "#eab308"; ctx.fillRect(x + 13, y + 12, 4, 8);
            ctx.fillStyle = "#22c55e"; ctx.fillRect(x + 23, y + 9, 5, 7);
          } else if (tile === 51) {
            // TV de la cocina (en 3,1)
            ctx.fillStyle = "#78350f"; // Stand
            ctx.fillRect(x + 4, y + TILE_SIZE - 10, TILE_SIZE - 8, 8);
            // Frame
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 14);
            // Screen (News broadcast)
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 18);
            ctx.fillStyle = "#dc2626"; // News bar
            ctx.fillRect(x + 6, y + TILE_SIZE - 16, TILE_SIZE - 12, 4);
            // Screen glare
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.beginPath();
            ctx.moveTo(x + 7, y + 7); ctx.lineTo(x + 16, y + 7); ctx.lineTo(x + 7, y + 16);
            ctx.fill();
          } else if (tile === 52) {
            // Mueble para guardar cubiertos y utensilios (en 1,1; 1,2; 2,1)
            ctx.fillStyle = "#b45309"; // Mahogany sideboard
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Drawers
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 2, y + 14); ctx.lineTo(x + TILE_SIZE - 2, y + 14);
            ctx.moveTo(x + 2, y + 26); ctx.lineTo(x + TILE_SIZE - 2, y + 26);
            ctx.stroke();
            // Handles
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + TILE_SIZE / 2 - 4, y + 8, 8, 2);
            ctx.fillRect(x + TILE_SIZE / 2 - 4, y + 20, 8, 2);
            ctx.fillRect(x + TILE_SIZE / 2 - 4, y + 31, 8, 2);
          } else if (tile === 60) {
            // Parada de Colectivo Escolar
            ctx.fillStyle = "#64748b"; // Pole
            ctx.fillRect(x + 14, y + 8, 4, TILE_SIZE - 8);
            
            // Sign board at top
            ctx.fillStyle = "#0284c7"; // Blue header
            ctx.fillRect(x + 4, y + 2, 24, 16);
            ctx.strokeStyle = "#38bdf8";
            ctx.strokeRect(x + 4, y + 2, 24, 16);
            
            // Yellow badge for BUS
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + 6, y + 4, 20, 8);
            
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("BUS", x + 16, y + 11);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 5px sans-serif";
            ctx.fillText("PARADA", x + 16, y + 16);
          } else if (tile === 61) {
            // Banco de Madera de la Parada
            ctx.fillStyle = "#7c2d12"; // Wood seat
            ctx.fillRect(x + 2, y + 10, TILE_SIZE - 4, 12);
            ctx.fillStyle = "#451a03";
            ctx.fillRect(x + 2, y + 14, TILE_SIZE - 4, 2);
            ctx.fillStyle = "#1e293b"; // Iron legs
            ctx.fillRect(x + 4, y + 22, 3, 6);
            ctx.fillRect(x + TILE_SIZE - 7, y + 22, 3, 6);
          } else if (tile === 62) {
            // Farola de Luz de la Vereda
            ctx.fillStyle = "#475569";
            ctx.fillRect(x + 14, y + 8, 4, TILE_SIZE - 8);
            // Lamp head glowing
            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.arc(x + 16, y + 8, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(253, 224, 71, 0.25)";
            ctx.beginPath();
            ctx.arc(x + 16, y + 8, 12, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 63) {
            // Árbol Frondoso de la Vereda
            ctx.fillStyle = "#78350f"; // Trunk
            ctx.fillRect(x + 13, y + 16, 6, 16);
            // Leaf canopy
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.arc(x + 16, y + 12, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(x + 13, y + 9, 9, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 64) {
            // Cesto de Basura de Calle
            ctx.fillStyle = "#334155";
            ctx.fillRect(x + 14, y + 14, 4, 18);
            ctx.fillStyle = "#166534";
            ctx.fillRect(x + 8, y + 8, 16, 14);
            ctx.strokeStyle = "#15803d";
            ctx.strokeRect(x + 8, y + 8, 16, 14);
          } else if (tile === 65) {
            // Refugio / Garita de Colectivo
            ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 4);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("ESCOLAR", x + 16, y + 18);
          } else if (tile === 70) {
            // Asiento y Volante del Chofer
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.strokeStyle = "#cbd5e1";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#f59e0b";
            ctx.fillRect(x + 6, y + 2, TILE_SIZE - 12, 6);
            ctx.fillStyle = "#000000";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("BUS", x + TILE_SIZE / 2, y + 7);
          } else if (tile >= 71 && tile <= 76) {
            // Bus Passenger Seats 1 to 6
            const seatNum = tile - 70;
            const isCkySeat = seatNum === 6;
            const isVecinaSeat = seatNum === 1;

            ctx.fillStyle = isCkySeat ? "#1e3a8a" : "#1e40af";
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            
            ctx.strokeStyle = isCkySeat ? "#facc15" : "#eab308";
            ctx.lineWidth = isCkySeat ? 2 : 1.5;
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);

            if (isCkySeat) {
              const pulse = Math.abs(Math.sin(Date.now() / 300)) * 0.4 + 0.6;
              ctx.strokeStyle = `rgba(250, 204, 21, ${pulse})`;
              ctx.lineWidth = 2;
              ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }

            // Headrest with Seat Number Badge
            ctx.fillStyle = isCkySeat ? "#facc15" : "#ffffff";
            ctx.fillRect(x + TILE_SIZE / 2 - 8, y + 6, 16, 12);
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.fillText(`${seatNum}`, x + TILE_SIZE / 2, y + 15);

            if (isCkySeat) {
              ctx.fillStyle = "#facc15";
              ctx.font = "10px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("⭐", x + TILE_SIZE / 2, y + 32);
            }
          } else if (tile === 77) {
            // Puerta de Salida del Colectivo
            ctx.fillStyle = "#334155";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#22c55e";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.fillStyle = "#22c55e";
            ctx.font = "bold 7px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🚪 SALIDA", x + TILE_SIZE / 2, y + 24);
          } else if (tile >= 80 && tile <= 90) {
            // Doors for School (80..90)
            ctx.fillStyle = "#78350f";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

            ctx.fillStyle = "#93c5fd";
            ctx.fillRect(x + 8, y + 6, 16, 10);
            ctx.strokeStyle = "#1e3a8a";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 8, y + 6, 16, 10);

            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(x + 26, y + 20, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            let label = "AULA";
            if (tile === 82) label = "1º AÑO";
            if (tile === 83) label = "2º AÑO";
            if (tile === 84) label = "3º AÑO";
            if (tile === 85) label = "4º AÑO";
            if (tile === 86) label = "5º AÑO";
            if (tile === 87) label = "DIR";
            if (tile === 88) label = "PROF";
            if (tile === 89) label = "MUJ";
            if (tile === 90) label = "VAR";
            if (tile === 80) label = "PATIO";
            ctx.fillText(label, x + TILE_SIZE / 2, y + 13);
          } else if (tile === 91) {
            // Double School Desk
            ctx.fillStyle = "#d97706";
            ctx.fillRect(x + 2, y + 8, TILE_SIZE - 4, 16);
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 8, TILE_SIZE - 4, 16);

            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(x + 5, y + 10, 8, 10);
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(x + 18, y + 11, 10, 7);

            ctx.fillStyle = "#92400e";
            ctx.fillRect(x + 4, y + 1, 10, 5);
            ctx.fillRect(x + 18, y + 1, 10, 5);
          } else if (tile === 92) {
            // Teacher's Desk
            ctx.fillStyle = "#92400e";
            ctx.fillRect(x + 2, y + 6, TILE_SIZE - 4, 22);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 6, TILE_SIZE - 4, 22);

            ctx.fillStyle = "#3b82f6";
            ctx.beginPath();
            ctx.arc(x + 8, y + 14, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 16, y + 10, 10, 12);

            ctx.fillStyle = "#dc2626";
            ctx.beginPath();
            ctx.arc(x + 26, y + 18, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 93) {
            // Blackboard
            ctx.fillStyle = "#064e3b";
            ctx.fillRect(x, y + 2, TILE_SIZE, TILE_SIZE - 4);
            ctx.strokeStyle = "#d1d5db";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y + 2, TILE_SIZE, TILE_SIZE - 4);

            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.font = "bold 7px monospace";
            ctx.textAlign = "center";
            ctx.fillText("ESCUELA", x + TILE_SIZE / 2, y + 14);
            ctx.fillText("PIZARRÓN", x + TILE_SIZE / 2, y + 24);
          } else if (tile === 94) {
            // Director Desk
            ctx.fillStyle = "#451a03";
            ctx.fillRect(x + 2, y + 4, TILE_SIZE - 4, 24);
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 4, TILE_SIZE - 4, 24);

            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + 8, y + 14, 16, 5);
            ctx.fillStyle = "#000000";
            ctx.font = "bold 4px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("DIRECTOR", x + 16, y + 18);
          } else if (tile === 95) {
            // Director Bookshelf & Trophies
            ctx.fillStyle = "#78350f";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#451a03";
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + 10, y + 8, 12, 12);
            ctx.beginPath();
            ctx.arc(x + 16, y + 8, 5, 0, Math.PI, true);
            ctx.fill();
          } else if (tile === 96) {
            // Teachers Conference Table
            ctx.fillStyle = "#d97706";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 6, y + 6, 12, 16);
          } else if (tile === 97) {
            // Coffee/Mate Station
            ctx.fillStyle = "#f1f5f9";
            ctx.fillRect(x + 2, y + 6, TILE_SIZE - 4, 22);
            ctx.strokeStyle = "#94a3b8";
            ctx.strokeRect(x + 2, y + 6, TILE_SIZE - 4, 22);

            ctx.fillStyle = "#ef4444";
            ctx.fillRect(x + 6, y + 10, 6, 12);

            ctx.fillStyle = "#78350f";
            ctx.beginPath();
            ctx.arc(x + 18, y + 18, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 98 || tile === 99) {
            // Soccer Goal
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1;
            for (let i = 6; i < TILE_SIZE - 2; i += 6) {
              ctx.beginPath();
              ctx.moveTo(x + i, y + 2);
              ctx.lineTo(x + i, y + TILE_SIZE - 2);
              ctx.stroke();
            }
          } else if (tile === 100) {
            // Soccer Ball
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 101) {
            // Lockers
            ctx.fillStyle = "#475569";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 6, y + 6, 20, 2);
            ctx.fillRect(x + 6, y + 12, 20, 2);
            ctx.fillRect(x + 6, y + 18, 20, 2);
          } else if (tile === 102) {
            // Bulletin Board
            ctx.fillStyle = "#b45309";
            ctx.fillRect(x + 2, y + 4, TILE_SIZE - 4, TILE_SIZE - 8);
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 4, TILE_SIZE - 4, TILE_SIZE - 8);

            ctx.fillStyle = "#fef08a";
            ctx.fillRect(x + 5, y + 7, 8, 10);
            ctx.fillStyle = "#f472b6";
            ctx.fillRect(x + 18, y + 10, 9, 8);
          } else if (tile === 103) {
            // Urinal
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 8, y + 4, 16, 22);
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 8, y + 4, 16, 22);
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(x + 11, y + 18, 10, 5);
          } else if (tile === 104) {
            // Courtyard Bench
            ctx.fillStyle = "#78350f";
            ctx.fillRect(x + 2, y + 10, TILE_SIZE - 4, 12);
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 10, TILE_SIZE - 4, 12);

            ctx.fillStyle = "#1e293b";
            ctx.fillRect(x + 4, y + 22, 3, 6);
            ctx.fillRect(x + TILE_SIZE - 7, y + 22, 3, 6);
          } else if (tile === 65) {
            // Parada de la Línea 4 (Bus stop sign)
            ctx.fillStyle = "#64748b";
            ctx.fillRect(x + 18, y + 8, 4, 28);
            
            ctx.fillStyle = "#10b981";
            ctx.beginPath();
            ctx.arc(x + 20, y + 10, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 11px 'Press Start 2P', monospace";
            ctx.textAlign = "center";
            ctx.fillText("4", x + 20, y + 14);

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 8, y + 21, 24, 7);
            ctx.fillStyle = "#34d399";
            ctx.font = "bold 6px sans-serif";
            ctx.fillText("LÍNEA 4", x + 20, y + 26);
          } else if (tile === 70) {
            // Tumba Rosa de Ángela
            ctx.fillStyle = "#fbcfe8";
            ctx.fillRect(x + 4, y + 18, TILE_SIZE - 8, 18);
            ctx.strokeStyle = "#f472b6";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y + 18, TILE_SIZE - 8, 18);

            ctx.fillStyle = "#f472b6";
            ctx.fillRect(x + 8, y + 2, TILE_SIZE - 16, 18);
            ctx.strokeStyle = "#db2777";
            ctx.strokeRect(x + 8, y + 2, TILE_SIZE - 16, 18);

            ctx.fillStyle = "#fef08a";
            ctx.fillRect(x + 18, y + 5, 4, 8);
            ctx.fillRect(x + 16, y + 7, 8, 3);

            ctx.fillStyle = "#ec4899";
            ctx.beginPath();
            ctx.arc(x + 6, y + 32, 3, 0, Math.PI * 2);
            ctx.arc(x + 14, y + 34, 3, 0, Math.PI * 2);
            ctx.arc(x + 28, y + 32, 3, 0, Math.PI * 2);
            ctx.fill();

            if (hasDeliveredAngelaSandwich) {
              ctx.fillStyle = "#f59e0b";
              ctx.fillRect(x + 14, y + 22, 12, 6);
              ctx.fillStyle = "#dc2626";
              ctx.fillRect(x + 16, y + 24, 8, 2);
            }
          } else if (tile === 71) {
            // Gothic Stone Tombstone
            ctx.fillStyle = "#64748b";
            ctx.fillRect(x + 8, y + 6, TILE_SIZE - 16, 26);
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 8, y + 6, TILE_SIZE - 16, 26);

            ctx.fillStyle = "#94a3b8";
            ctx.font = "bold 7px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("R.I.P.", x + TILE_SIZE / 2, y + 18);
          } else if (tile === 72) {
            // Carved Stone Cross Grave
            ctx.fillStyle = "#475569";
            ctx.fillRect(x + 16, y + 4, 8, 28);
            ctx.fillRect(x + 8, y + 10, 24, 7);
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 16, y + 4, 8, 28);
            ctx.strokeRect(x + 8, y + 10, 24, 7);
          } else if (tile === 73) {
            // Angel Statue
            ctx.fillStyle = "#f8fafc";
            ctx.beginPath();
            ctx.arc(x + 20, y + 10, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x + 14, y + 16, 12, 16);

            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.arc(x + 8, y + 18, 8, 0, Math.PI * 2);
            ctx.arc(x + 32, y + 18, 8, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 74) {
            // Cypress Tree
            ctx.fillStyle = "#064e3b";
            ctx.beginPath();
            ctx.moveTo(x + 20, y + 2);
            ctx.lineTo(x + 6, y + 32);
            ctx.lineTo(x + 34, y + 32);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#451a03";
            ctx.fillRect(x + 17, y + 32, 6, 6);
          } else if (tile === 75) {
            // Mausoleum
            ctx.fillStyle = "#334155";
            ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, 26);
            ctx.strokeStyle = "#0f172a";
            ctx.strokeRect(x + 4, y + 8, TILE_SIZE - 8, 26);

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 14, y + 16, 12, 18);
          } else if (tile === 76) {
            // Iron Gate Arch
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 2, y + 2, 6, 36);
            ctx.fillRect(x + 32, y + 2, 6, 36);
            ctx.fillRect(x + 2, y + 4, 36, 4);
          } else if (tile === 110) {
            // Ancient Rune Pillar
            ctx.fillStyle = "#475569";
            ctx.fillRect(x + 6, y + 4, TILE_SIZE - 12, 32);
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 6, y + 4, TILE_SIZE - 12, 32);

            // Glowing Rune Glyph
            const runePulse = Math.sin(Date.now() / 350 + x) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(56, 189, 248, ${runePulse})`;
            ctx.fillRect(x + 14, y + 10, 12, 3);
            ctx.fillRect(x + 18, y + 13, 4, 12);
            ctx.fillRect(x + 12, y + 20, 16, 3);
          } else if (tile === 111) {
            // Golem Altar / Sello
            ctx.fillStyle = "#334155";
            ctx.fillRect(x + 2, y + 8, TILE_SIZE - 4, 24);
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 8, TILE_SIZE - 4, 24);

            const sealPulse = Math.sin(Date.now() / 400) * 0.3 + 0.7;
            ctx.strokeStyle = day4GolemDefeated ? "rgba(74, 222, 128, 0.6)" : `rgba(239, 68, 68, ${sealPulse})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + 20, 12, 0, Math.PI * 2);
            ctx.stroke();
          } else if (tile === 112) {
            // Sitio del Antiguo Tesoro Enterrado
            if (day4TreasureDug) {
              // Open Golden Chest brimming with gold and gems
              ctx.fillStyle = "#b45309";
              ctx.fillRect(x + 6, y + 12, 28, 20);
              ctx.strokeStyle = "#78350f";
              ctx.strokeRect(x + 6, y + 12, 28, 20);

              // Overflowing Gold & Rubies
              ctx.fillStyle = "#facc15";
              ctx.beginPath();
              ctx.arc(x + 14, y + 12, 5, 0, Math.PI * 2);
              ctx.arc(x + 22, y + 10, 6, 0, Math.PI * 2);
              ctx.arc(x + 28, y + 13, 4, 0, Math.PI * 2);
              ctx.fill();

              // Sparkle
              const spPulse = Math.sin(Date.now() / 200) * 0.4 + 0.6;
              ctx.fillStyle = `rgba(254, 240, 138, ${spPulse})`;
              ctx.fillRect(x + 19, y + 6, 4, 4);
            } else {
              // Buried Ground with glowing ancient rune mark
              ctx.fillStyle = "#1e293b";
              ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, 24);
              ctx.strokeStyle = "#f59e0b";
              ctx.lineWidth = 1.5;
              ctx.strokeRect(x + 4, y + 8, TILE_SIZE - 8, 24);

              // Golden shovel prompt or mystery mark
              ctx.fillStyle = "#fbbf24";
              ctx.font = "bold 10px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("💰 $", x + TILE_SIZE / 2, y + 24);
            }
          } else if (tile === 113) {
            // Exit Trail Sign
            ctx.fillStyle = "#64748b";
            ctx.fillRect(x + 18, y + 10, 4, 26);
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x + 6, y + 6, 28, 14);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 7px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("CIUDAD", x + 20, y + 16);
          } else if (tile === 114) {
            // Monolito Arcano
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(x + 10, y + 2, 20, 36);
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 10, y + 2, 20, 36);

            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(x + 16, y + 8, 8, 4);
            ctx.fillRect(x + 16, y + 16, 8, 4);
            ctx.fillRect(x + 16, y + 24, 8, 4);
          } else if (tile === 115) {
            // Stone Arch
            ctx.fillStyle = "#475569";
            ctx.fillRect(x + 4, y + 2, 8, 36);
            ctx.fillRect(x + 28, y + 2, 8, 36);
            ctx.fillRect(x + 4, y + 2, 32, 8);
          } else if (tile === 120) {
            // Boutique Mannequin & Clothes Rack
            ctx.fillStyle = "#f43f5e";
            ctx.fillRect(x + 8, y + 6, 24, 26);
            ctx.strokeStyle = "#be123c";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 8, y + 6, 24, 26);

            ctx.fillStyle = "#fde047";
            ctx.fillRect(x + 14, y + 12, 12, 16);
            ctx.fillStyle = "#64748b";
            ctx.fillRect(x + 6, y + 32, 28, 4);
          } else if (tile === 121) {
            // Sexy Crimson Lingerie Boutique Display
            ctx.fillStyle = "#881337";
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, 32);
            ctx.strokeStyle = "#fb7185";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, 32);

            // Crimson Lace Bra & Panties Display
            ctx.fillStyle = "#e11d48";
            ctx.beginPath();
            ctx.arc(x + 15, y + 14, 5, 0, Math.PI * 2);
            ctx.arc(x + 25, y + 14, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x + 14, y + 22, 12, 8);

            // Sparkle heart
            ctx.fillStyle = "#f43f5e";
            ctx.font = "bold 8px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("♥", x + 20, y + 10);
          } else if (tile === 122) {
            // Probador con Cortinas y Espejo
            ctx.fillStyle = "#be185d";
            ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, 36);
            ctx.fillStyle = "#fbcfe8";
            ctx.fillRect(x + 10, y + 6, 20, 28);
            ctx.strokeStyle = "#db2777";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 10, y + 6, 20, 28);
          } else if (tile === 123) {
            // Cafetería Counter & Pastries
            ctx.fillStyle = "#78350f";
            ctx.fillRect(x + 2, y + 8, TILE_SIZE - 4, 24);
            ctx.fillStyle = "#fef3c7";
            ctx.fillRect(x + 6, y + 10, 12, 8);
            ctx.fillStyle = "#ea580c";
            ctx.fillRect(x + 22, y + 10, 12, 8);
          } else if (tile === 124) {
            // Mall Sparkling Fountain
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Water Ripple
            const fPulse = Math.sin(Date.now() / 300) * 4 + 8;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, fPulse, 0, Math.PI * 2);
            ctx.stroke();
          } else if (tile === 125) {
            // Automatic Mall Exit Sliding Doors
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 36);
            ctx.fillStyle = "#e0f2fe";
            ctx.fillRect(x + 6, y + 6, 12, 28);
            ctx.fillRect(x + 22, y + 6, 12, 28);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("SALIDA", x + TILE_SIZE / 2, y + 12);
          } else if (tile === 126) {
            // Mall Bench & Potted Palm Tree
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(x + 4, y + 14, 32, 12);
            ctx.strokeStyle = "#cbd5e1";
            ctx.strokeRect(x + 4, y + 14, 32, 12);

            // Planter & Palm Leaves
            ctx.fillStyle = "#92400e";
            ctx.fillRect(x + 14, y + 24, 12, 12);
            ctx.fillStyle = "#16a34a";
            ctx.beginPath();
            ctx.arc(x + 20, y + 14, 10, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 127) {
            // Luxury French Perfume Stand ("Nuit Éthérée")
            ctx.fillStyle = "#4c0519";
            ctx.fillRect(x + 2, y + 6, TILE_SIZE - 4, 28);
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 6, TILE_SIZE - 4, 28);

            // Crystal Perfume Bottle with Golden Sprayer
            ctx.fillStyle = "#fb7185";
            ctx.beginPath();
            ctx.arc(x + 20, y + 18, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + 18, y + 9, 4, 4);

            // Fragrance sparkles
            const perfSpark = Math.sin(Date.now() / 250 + x) * 0.4 + 0.6;
            ctx.fillStyle = `rgba(253, 224, 71, ${perfSpark})`;
            ctx.fillRect(x + 13, y + 10, 2, 2);
            ctx.fillRect(x + 25, y + 12, 2, 2);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("PARFUM", x + TILE_SIZE / 2, y + 31);
          } else if (tile === 130) {
            // Airport Check-in Counter & Flight Departure LED Screen
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(x + 2, y + 4, TILE_SIZE - 4, 32);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 4, TILE_SIZE - 4, 32);
            // LED Screen
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 6, y + 8, TILE_SIZE - 12, 14);
            ctx.fillStyle = "#22c55e";
            ctx.font = "bold 6px monospace";
            ctx.textAlign = "center";
            ctx.fillText("✈ FLIGHTS", x + TILE_SIZE / 2, y + 18);
          } else if (tile === 131) {
            // Airport Hot Dog Stand "Don Pepe" (Súper Pancho con Papas Pay y Coca Helada)
            ctx.fillStyle = "#dc2626";
            ctx.fillRect(x + 2, y + 4, TILE_SIZE - 4, 32);
            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 4, TILE_SIZE - 4, 32);
            // Hot dog icon & banner
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + 4, y + 6, TILE_SIZE - 8, 10);
            ctx.fillStyle = "#991b1b";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🌭 DON PEPE", x + TILE_SIZE / 2, y + 14);
            // Soda bottles on display
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(x + 6, y + 20, 6, 12);
            ctx.fillStyle = "#ea580c";
            ctx.fillRect(x + 16, y + 20, 6, 12);
          } else if (tile === 132) {
            // Airport Giant Glass Window to Runway & Planes
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Window frame
            ctx.strokeStyle = "#0369a1";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Airplane silhouette in sky
            ctx.fillStyle = "#ffffff";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("✈", x + TILE_SIZE / 2, y + 24);
          } else if (tile === 133) {
            // Airport Waiting Benches
            ctx.fillStyle = "#475569";
            ctx.fillRect(x + 4, y + 12, 32, 14);
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 4, y + 12, 32, 14);
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 8, y + 26, 4, 8);
            ctx.fillRect(x + 28, y + 26, 4, 8);
          } else if (tile === 134) {
            // Baggage Carousel
            ctx.fillStyle = "#334155";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            // Suitcase
            ctx.fillStyle = "#e11d48";
            ctx.fillRect(x + 8, y + 10, 24, 16);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(x + 18, y + 6, 4, 4);
          } else if (tile === 135) {
            // Airport Exit Glass Doors to City
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 36);
            ctx.fillStyle = "#e0f2fe";
            ctx.fillRect(x + 6, y + 6, 12, 28);
            ctx.fillRect(x + 22, y + 6, 12, 28);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("SALIDA", x + TILE_SIZE / 2, y + 12);
          }

          // End tile drawing
        }
      }

      // Render Yellow School Bus on street map in front of CKY's house
      if (currentMap === "street" && isBusWaitingAtDoor) {
        const startX = 2 * TILE_SIZE; // Col 2
        const startY = 7 * TILE_SIZE - 8; // Row 7
        const busWidth = 5 * TILE_SIZE; // 160px wide (Cols 2 to 6)
        const busHeight = 1.8 * TILE_SIZE; // ~58px tall

        ctx.save();
        // Shadow on asphalt
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(startX + busWidth / 2, startY + busHeight - 2, busWidth / 2 + 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Yellow Bus Body
        ctx.fillStyle = "#facc15"; // Bright yellow
        ctx.fillRect(startX, startY, busWidth, busHeight - 10);
        ctx.strokeStyle = "#ca8a04";
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, busWidth, busHeight - 10);

        // Black side stripe
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(startX, startY + 28, busWidth, 5);

        // Painted text on the side: "COLECTIVO ESCOLAR"
        ctx.fillStyle = "#0f172a";
        ctx.font = "900 9px 'JetBrains Mono', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🚌 COLECTIVO ESCOLAR 🚌", startX + busWidth / 2 - 8, startY + 24);

        // Front engine hood (on the right at Col 6)
        ctx.fillStyle = "#eab308";
        ctx.fillRect(startX + busWidth - 12, startY + 10, 12, busHeight - 20);
        ctx.fillStyle = "#fef08a"; // Headlight
        ctx.beginPath();
        ctx.arc(startX + busWidth - 2, startY + 20, 3, 0, Math.PI * 2);
        ctx.fill();

        // Wheels
        const wheelY = startY + busHeight - 12;
        ctx.fillStyle = "#0f172a"; // Tire
        ctx.beginPath();
        ctx.arc(startX + 28, wheelY, 8, 0, Math.PI * 2);
        ctx.arc(startX + busWidth - 36, wheelY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#94a3b8"; // Hubcap
        ctx.beginPath();
        ctx.arc(startX + 28, wheelY, 4, 0, Math.PI * 2);
        ctx.arc(startX + busWidth - 36, wheelY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Bus Windows with student silhouettes inside
        const windowY = startY + 6;
        const windowW = 18;
        const windowH = 14;
        for (let w = 0; w < 5; w++) {
          const wx = startX + 10 + w * 26;
          ctx.fillStyle = "#38bdf8"; // Tinted glass
          ctx.fillRect(wx, windowY, windowW, windowH);
          ctx.strokeStyle = "#0284c7";
          ctx.lineWidth = 1;
          ctx.strokeRect(wx, windowY, windowW, windowH);

          // Student head silhouettes
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.arc(wx + 9, windowY + 9, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Open Pneumatic Door (Col 4)
        const doorX = startX + 2 * TILE_SIZE + 4;
        ctx.fillStyle = "#0284c7"; // Glass door
        ctx.fillRect(doorX, startY + 6, 16, busHeight - 16);
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(doorX, startY + 6, 16, busHeight - 16);

        // Flashing red school bus lights on roof top
        const lightBlink = Math.floor(Date.now() / 300) % 2 === 0;
        ctx.fillStyle = lightBlink ? "#ef4444" : "#991b1b";
        ctx.fillRect(startX + 12, startY - 4, 6, 4);
        ctx.fillRect(startX + busWidth - 24, startY - 4, 6, 4);

        ctx.restore();
      }

      // Render Green Bus (Colectivo Verde - Línea 4) on street or cemetery map
      if (isGreenBusWaiting && (currentMap === "street" || currentMap === "cemetery")) {
        let busCol = 12;
        let busRow = 7;
        if (currentMap === "cemetery") {
          busCol = 1;
          busRow = 8;
        } else if (currentMap === "street") {
          busCol = 12;
          busRow = 7;
        }

        const startX = busCol * TILE_SIZE;
        const startY = busRow * TILE_SIZE - 8;
        const busWidth = 5 * TILE_SIZE;
        const busHeight = 1.8 * TILE_SIZE;

        ctx.save();
        // Shadow on asphalt
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(startX + busWidth / 2, startY + busHeight - 2, busWidth / 2 + 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Green Bus Body
        ctx.fillStyle = "#16a34a"; // Metallic emerald green
        ctx.fillRect(startX, startY, busWidth, busHeight - 10);
        ctx.strokeStyle = "#14532d";
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, busWidth, busHeight - 10);

        // White roof stripe & bottom stripe
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(startX, startY, busWidth, 4);
        ctx.fillRect(startX, startY + 30, busWidth, 3);

        // Route banner on front/top: "LÍNEA 4"
        ctx.fillStyle = "#022c22";
        ctx.fillRect(startX + 10, startY + 5, busWidth - 20, 10);
        ctx.fillStyle = "#4ade80"; // Glowing neon green
        ctx.font = "bold 8px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText("LÍNEA 4", startX + busWidth / 2, startY + 13);

        // Windows
        for (let i = 0; i < 4; i++) {
          const wx = startX + 16 + i * 36;
          ctx.fillStyle = "#38bdf8"; // Sky blue glass
          ctx.fillRect(wx, startY + 17, 28, 11);
          ctx.strokeStyle = "#0284c7";
          ctx.strokeRect(wx, startY + 17, 28, 11);
          // Glare reflection
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath();
          ctx.moveTo(wx + 4, startY + 27);
          ctx.lineTo(wx + 16, startY + 18);
          ctx.lineTo(wx + 20, startY + 18);
          ctx.lineTo(wx + 8, startY + 27);
          ctx.fill();
        }

        // Headlight at front (right side)
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(startX + busWidth - 2, startY + 22, 4, 0, Math.PI * 2);
        ctx.fill();

        // Wheels
        const wheelY = startY + busHeight - 12;
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(startX + 28, wheelY, 8, 0, Math.PI * 2);
        ctx.arc(startX + busWidth - 36, wheelY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e2e8f0"; // Hubcaps
        ctx.beginPath();
        ctx.arc(startX + 28, wheelY, 3, 0, Math.PI * 2);
        ctx.arc(startX + busWidth - 36, wheelY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Render Big Room Number Watermark & Label in the center of the room floor
      let roomNum = "";
      let roomName = "";
      let roomCenterX = (grid[0].length * TILE_SIZE) / 2;
      let roomCenterY = (grid.length * TILE_SIZE) / 2;

      if (currentMap === "bedroom") {
        roomNum = "1";
        roomName = "HABITACIÓN CKY";
      } else if (currentMap === "hallway") {
        roomNum = "2";
        roomName = "PASILLO";
      } else if (currentMap === "empty_room") {
        roomNum = "4";
        roomName = "SALA DE ESTAR";
      } else if (currentMap === "sisters_room") {
        roomNum = "5";
        roomName = "HABITACIÓN HERMANA";
      } else if (currentMap === "bathroom") {
        roomNum = "6";
        roomName = "BAÑO";
      } else if (currentMap === "moms_room") {
        roomNum = "7";
        roomName = "HABITACIÓN MAMÁ";
      } else if (currentMap === "house") {
        roomNum = "8";
        roomName = "COCINA";
      } else if (currentMap === "street") {
        roomNum = "9";
        roomName = "CALLE";
      } else if (currentMap === "soulmate_house") {
        roomNum = "14";
        roomName = "CASA ALMA GEMELA";
      } else if (currentMap === "soulmate_bedroom") {
        roomNum = "15";
        roomName = "HABITACIÓN GEMELO";
      }

      if (roomNum) {
        ctx.save();
        // Giant Room Number in floor center
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.font = "900 84px 'JetBrains Mono', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(roomNum, roomCenterX, roomCenterY - 10);

        // Room Banner Badge below giant number
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.5;
        const badgeText = `${roomNum}. ${roomName}`;
        ctx.font = "bold 12px 'JetBrains Mono', sans-serif";
        const textWidth = ctx.measureText(badgeText).width;
        const badgeW = textWidth + 24;
        const badgeH = 24;
        const badgeX = roomCenterX - badgeW / 2;
        const badgeY = roomCenterY + 28;

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.fillText(badgeText, roomCenterX, badgeY + badgeH / 2);
        ctx.restore();
      }

      // Helper function to draw Mom as a detailed human pixel-art character
      const drawMomCharacter = (px: number, py: number) => {
        const bobY = Math.floor(Math.sin(Date.now() / 350) * 0.8 + 0.2);

        // Draw wooden chair if seated in house map (kitchen)
        if (currentMap === "house") {
          ctx.fillStyle = "#78350f";
          ctx.fillRect(px - 10, py - 4, 4, 18); // Chair backrest
          ctx.fillStyle = "#a16207";
          ctx.fillRect(px - 10, py + 6, 18, 4); // Seat cushion
          ctx.fillStyle = "#451a03";
          ctx.fillRect(px - 9, py + 10, 3, 8); // Legs
          ctx.fillRect(px + 4, py + 10, 3, 8);
        }

        // 1. Hair back layer
        ctx.fillStyle = "#4a1d0d";
        ctx.fillRect(px - 10, py - 18 + bobY, 20, 16);

        // 2. Head / Skin
        ctx.fillStyle = "#ffd8b3"; // Peach skin tone
        ctx.fillRect(px - 8, py - 19 + bobY, 16, 12);

        // 3. Hair front (Auburn styled hair with bun & side sweep)
        ctx.fillStyle = "#652b19";
        ctx.fillRect(px - 9, py - 22 + bobY, 18, 6);
        ctx.fillRect(px - 10, py - 17 + bobY, 4, 12);
        ctx.fillRect(px + 6, py - 17 + bobY, 4, 12);

        // Hair bun at top
        ctx.fillStyle = "#853118";
        ctx.fillRect(px - 4, py - 24 + bobY, 8, 4);

        // 4. Eyes & Expression
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(px - 5, py - 13 + bobY, 3, 4);
        ctx.fillRect(px + 2, py - 13 + bobY, 3, 4);

        // Eye shine highlights
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px - 4, py - 13 + bobY, 1, 1);
        ctx.fillRect(px + 3, py - 13 + bobY, 1, 1);

        // Rose blush & smile
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(px - 7, py - 9 + bobY, 2, 2);
        ctx.fillRect(px + 5, py - 9 + bobY, 2, 2);

        ctx.fillStyle = "#be123c";
        ctx.fillRect(px - 2, py - 8 + bobY, 4, 2);

        // 5. Torso: Rose Red Sweater
        ctx.fillStyle = "#9f1239";
        ctx.fillRect(px - 8, py - 7, 16, 15);

        // 6. White Kitchen Apron
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(px - 6, py - 3, 12, 13);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 6, py - 3, 12, 13);

        // Apron pocket
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(px - 4, py + 3, 8, 5);
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(px - 1, py + 5, 2, 1);

        // Hands (Peach skin)
        ctx.fillStyle = "#ffd8b3";
        ctx.fillRect(px - 10, py + 3, 3, 4);
        ctx.fillRect(px + 7, py + 3, 3, 4);

        // Smartphone / Celular en la mano de Mamá
        ctx.fillStyle = "#0284c7"; // Blue sleek smartphone body
        ctx.fillRect(px + 6, py - 3, 6, 11);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 6, py - 3, 6, 11);

        // Glowing smartphone screen
        ctx.fillStyle = "#e0f2fe"; // Glowing screen
        ctx.fillRect(px + 7, py - 2, 4, 8);

        // App notification on screen
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(px + 8, py, 2, 2);

        // Soft screen light glow onto Mom's face
        ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
        ctx.beginPath();
        ctx.arc(px + 5, py - 2, 7, 0, Math.PI * 2);
        ctx.fill();

        // 7. Navy Skirt
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(px - 7, py + 8, 14, 6);

        // Shoes
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px - 6, py + 14, 5, 2);
        ctx.fillRect(px + 1, py + 14, 5, 2);
      };

      // Helper function to draw Preceptora Graciela with full pixel art body
      const drawPreceptoraCharacter = (px: number, py: number) => {
        const bobY = Math.floor(Math.sin(Date.now() / 350) * 0.8);

        // 1. Dark professional hair with neat top bun
        ctx.fillStyle = "#1e1b4b"; // Dark navy/black hair
        ctx.fillRect(px - 9, py - 20 + bobY, 18, 16);
        ctx.fillRect(px - 4, py - 24 + bobY, 8, 5); // Hair bun on top

        // 2. Peach skin face
        ctx.fillStyle = "#ffd8b3";
        ctx.fillRect(px - 7, py - 18 + bobY, 14, 12);

        // 3. Gold glasses frame & lenses
        ctx.fillStyle = "#d97706"; // Gold glasses frame
        ctx.fillRect(px - 6, py - 14 + bobY, 5, 4);
        ctx.fillRect(px + 1, py - 14 + bobY, 5, 4);
        ctx.fillRect(px - 1, py - 13 + bobY, 2, 1);
        ctx.fillStyle = "#e0f2fe"; // Lens shine
        ctx.fillRect(px - 5, py - 13 + bobY, 3, 2);
        ctx.fillRect(px + 2, py - 13 + bobY, 3, 2);

        // Eyes behind glasses
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px - 4, py - 12 + bobY, 2, 2);
        ctx.fillRect(px + 3, py - 12 + bobY, 2, 2);

        // Friendly smile
        ctx.fillStyle = "#be123c";
        ctx.fillRect(px - 2, py - 8 + bobY, 4, 1.5);

        // 4. Torso: Elegant Maroon / Burgundy Blazer suit jacket
        ctx.fillStyle = "#881337"; // Maroon blazer
        ctx.fillRect(px - 8, py - 6, 16, 14);

        // White formal blouse collar & cyan necktie/scarf
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(px - 3, py - 6, 6, 5);
        ctx.fillStyle = "#0284c7"; // Silk scarf
        ctx.fillRect(px - 1, py - 3, 2, 4);

        // Hands & Clipboard (holding attendance sheet)
        ctx.fillStyle = "#ffd8b3";
        ctx.fillRect(px - 10, py + 1, 3, 4);
        ctx.fillRect(px + 7, py + 1, 3, 4);

        // Brown wooden clipboard in hand
        ctx.fillStyle = "#78350f"; // Wood clipboard
        ctx.fillRect(px + 5, py - 4, 7, 12);
        ctx.fillStyle = "#ffffff"; // White paper on clipboard
        ctx.fillRect(px + 6, py - 2, 5, 9);
        ctx.fillStyle = "#0f172a"; // Attendance lines
        ctx.fillRect(px + 7, py, 3, 1);
        ctx.fillRect(px + 7, py + 2, 3, 1);
        ctx.fillRect(px + 7, py + 4, 3, 1);

        // 5. Navy Skirt & Black heels
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(px - 7, py + 8, 14, 6);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px - 6, py + 14, 5, 2);
        ctx.fillRect(px + 1, py + 14, 5, 2);
      };

      // Helper function to draw school teachers with pixel art bodies
      const drawTeacherCharacter = (px: number, py: number, teacherId: string) => {
        const bobY = Math.floor(Math.sin(Date.now() / 350) * 0.8);

        if (teacherId === "teacher_biology") {
          // Female biology teacher with white lab coat (Prof. Marcela)
          ctx.fillStyle = "#334155"; // Dark hair
          ctx.fillRect(px - 8, py - 19 + bobY, 16, 14);
          ctx.fillStyle = "#ffe4c4"; // Skin
          ctx.fillRect(px - 6, py - 17 + bobY, 12, 11);
          // Eyes
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(px - 4, py - 12 + bobY, 2, 2);
          ctx.fillRect(px + 2, py - 12 + bobY, 2, 2);
          // White Lab Coat
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(px - 8, py - 6, 16, 15);
          ctx.fillStyle = "#0284c7"; // Cyan blouse underneath
          ctx.fillRect(px - 3, py - 6, 6, 6);
          // Trousers & shoes
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(px - 6, py + 9, 12, 5);
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(px - 6, py + 14, 5, 2);
          ctx.fillRect(px + 1, py + 14, 5, 2);
          return;
        }

        if (teacherId === "teacher_pe") {
          // PE Teacher (Prof. Marcos) in tracksuit with whistle
          ctx.fillStyle = "#78350f"; // Brown hair
          ctx.fillRect(px - 7, py - 20 + bobY, 14, 8);
          ctx.fillStyle = "#ffe4c4"; // Skin
          ctx.fillRect(px - 6, py - 15 + bobY, 12, 10);
          // Eyes
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(px - 4, py - 11 + bobY, 2, 2);
          ctx.fillRect(px + 2, py - 11 + bobY, 2, 2);
          // Whistle around neck
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(px - 1, py - 2, 2, 3);
          // Red Tracksuit Jacket with white stripes
          ctx.fillStyle = "#dc2626";
          ctx.fillRect(px - 8, py - 5, 16, 14);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px - 7, py - 5, 2, 14);
          ctx.fillRect(px + 5, py - 5, 2, 14);
          // Pants & white sneakers
          ctx.fillStyle = "#991b1b";
          ctx.fillRect(px - 6, py + 9, 12, 5);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px - 6, py + 14, 5, 2);
          ctx.fillRect(px + 1, py + 14, 5, 2);
          return;
        }

        // Default / History / Math Teacher (Prof. Silva / Prof. Gómez)
        ctx.fillStyle = "#451a03"; // Brown hair
        ctx.fillRect(px - 8, py - 20 + bobY, 16, 8);
        ctx.fillStyle = "#f5d0a9"; // Face skin
        ctx.fillRect(px - 6, py - 15 + bobY, 12, 10);

        // Glasses
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(px - 5, py - 12 + bobY, 4, 3);
        ctx.fillRect(px + 1, py - 12 + bobY, 4, 3);

        // Mustache
        ctx.fillStyle = "#451a03";
        ctx.fillRect(px - 4, py - 7 + bobY, 8, 2);

        // Formal Grey Suit Jacket
        ctx.fillStyle = "#475569";
        ctx.fillRect(px - 8, py - 5, 16, 14);
        ctx.fillStyle = "#ffffff"; // White shirt collar
        ctx.fillRect(px - 3, py - 5, 6, 4);
        ctx.fillStyle = "#b91c1c"; // Red tie
        ctx.fillRect(px - 1, py - 3, 2, 5);

        // Pants & Shoes
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(px - 6, py + 9, 12, 5);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px - 6, py + 14, 5, 2);
        ctx.fillRect(px + 1, py + 14, 5, 2);
      };

      const drawBlondeNeighborCharacter = (px: number, py: number, facingUp = false) => {
        const bobY = Math.sin(Date.now() / 250) * 1.5;

        if (facingUp || currentMap === "bus_interior") {
          // Long Golden Blonde Hair cascading down back
          ctx.fillStyle = "#facc15"; // Bright golden hair back
          ctx.fillRect(px - 10, py - 21 + bobY, 20, 24);
          ctx.fillStyle = "#eab308"; // Hair highlights/shadows
          ctx.fillRect(px - 10, py - 14 + bobY, 3, 14);
          ctx.fillRect(px + 7, py - 14 + bobY, 3, 14);

          // Neck / Collar
          ctx.fillStyle = "#ffffff"; // White collar back
          ctx.fillRect(px - 4, py - 5, 8, 2);

          // Green School Uniform Sweater Back
          ctx.fillStyle = "#15803d";
          ctx.fillRect(px - 7, py - 3, 14, 11);

          // Navy Skirt Back
          ctx.fillStyle = "#1e1b4b";
          ctx.fillRect(px - 7, py + 8, 14, 6);

          // White socks & shoes
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(px - 5, py + 14, 3, 3);
          ctx.fillRect(px + 2, py + 14, 3, 3);
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(px - 6, py + 16, 4, 2);
          ctx.fillRect(px + 2, py + 16, 4, 2);
          return;
        }

        // 1. Long Blonde Hair (behind head & sides)
        ctx.fillStyle = "#facc15"; // Bright golden blonde hair
        ctx.fillRect(px - 10, py - 20 + bobY, 20, 22);

        // 2. Face (Peach skin tone)
        ctx.fillStyle = "#ffe4c4";
        ctx.fillRect(px - 7, py - 16 + bobY, 14, 12);

        // Blonde bangs & side locks
        ctx.fillStyle = "#eab308";
        ctx.fillRect(px - 8, py - 21 + bobY, 16, 6);
        ctx.fillRect(px - 9, py - 16 + bobY, 3, 14);
        ctx.fillRect(px + 6, py - 16 + bobY, 3, 14);

        // Eyes & Smile
        ctx.fillStyle = "#0284c7"; // Blue eyes
        ctx.fillRect(px - 5, py - 12 + bobY, 3, 3);
        ctx.fillRect(px + 2, py - 12 + bobY, 3, 3);

        // Rosy cheeks
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(px - 6, py - 8 + bobY, 2, 2);
        ctx.fillRect(px + 4, py - 8 + bobY, 2, 2);

        // Smile
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(px - 2, py - 7 + bobY, 4, 1.5);

        // 3. School Uniform (Same as CKY: Green Sweater + White Collar + Navy Skirt)
        ctx.fillStyle = "#15803d"; // Green school sweater
        ctx.fillRect(px - 7, py - 4, 14, 12);

        // White shirt collar
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(px - 4, py - 4);
        ctx.lineTo(px, py);
        ctx.lineTo(px + 4, py - 4);
        ctx.fill();

        // Red school tie
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(px - 1, py - 1, 2, 4);

        // Hands
        ctx.fillStyle = "#ffe4c4";
        ctx.fillRect(px - 9, py + 2, 3, 4);
        ctx.fillRect(px + 6, py + 2, 3, 4);

        // Navy Skirt
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(px - 7, py + 8, 14, 6);

        // White socks & Dark Shoes
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(px - 5, py + 14, 3, 3);
        ctx.fillRect(px + 2, py + 14, 3, 3);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px - 6, py + 16, 4, 2);
        ctx.fillRect(px + 2, py + 16, 4, 2);
      };

      const drawBusDriverCharacter = (px: number, py: number, facingUp = false) => {
        const bobY = Math.floor(Math.sin(Date.now() / 400) * 0.8);

        if (facingUp || currentMap === "bus_interior") {
          // Steering Wheel in front (above driver towards windshield at Row 0)
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(px, py - 12, 9, 0, Math.PI * 2);
          ctx.stroke();

          // Driver Cap Back
          ctx.fillStyle = "#0f172a"; // Navy dark cap back
          ctx.fillRect(px - 10, py - 23 + bobY, 20, 8);
          ctx.fillStyle = "#ca8a04"; // Gold band at back of cap
          ctx.fillRect(px - 10, py - 18 + bobY, 20, 2);

          // Back of Head / Hair
          ctx.fillStyle = "#27272a"; // Dark hair back
          ctx.fillRect(px - 8, py - 16 + bobY, 16, 10);

          // Royal Blue Driver Uniform Back & Epaulets
          ctx.fillStyle = "#1d4ed8";
          ctx.fillRect(px - 9, py - 6, 18, 14);
          ctx.fillStyle = "#ca8a04"; // Gold epaulets on shoulders
          ctx.fillRect(px - 9, py - 6, 4, 2);
          ctx.fillRect(px + 5, py - 6, 4, 2);

          // Hands on Steering Wheel
          ctx.fillStyle = "#f5d0a9";
          ctx.fillRect(px - 8, py - 14, 4, 4);
          ctx.fillRect(px + 4, py - 14, 4, 4);
          return;
        }

        // 1. Driver Cap
        ctx.fillStyle = "#0f172a"; // Navy dark cap
        ctx.fillRect(px - 10, py - 24 + bobY, 20, 7);
        ctx.fillStyle = "#ca8a04"; // Gold visor peak
        ctx.fillRect(px - 11, py - 18 + bobY, 22, 3);
        ctx.fillStyle = "#facc15"; // Gold driver emblem
        ctx.fillRect(px - 3, py - 23 + bobY, 6, 4);

        // 2. Face / Skin (Tan tone)
        ctx.fillStyle = "#f5d0a9";
        ctx.fillRect(px - 8, py - 17 + bobY, 16, 12);

        // Dark Hair & Moustache
        ctx.fillStyle = "#27272a";
        ctx.fillRect(px - 9, py - 17 + bobY, 3, 10);
        ctx.fillRect(px + 6, py - 17 + bobY, 3, 10);
        ctx.fillRect(px - 5, py - 8 + bobY, 10, 3); // Moustache

        // Eyes
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px - 5, py - 13 + bobY, 3, 3);
        ctx.fillRect(px + 2, py - 13 + bobY, 3, 3);

        // 3. Blue Uniform Shirt & Epaulets
        ctx.fillStyle = "#1d4ed8"; // Royal blue driver shirt
        ctx.fillRect(px - 9, py - 5, 18, 14);

        // Collar & Tie
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px - 4, py - 5, 8, 3);
        ctx.fillStyle = "#0f172a"; // Black tie
        ctx.fillRect(px - 1, py - 3, 2, 8);

        // Gold Driver Badge on chest
        ctx.fillStyle = "#facc15";
        ctx.fillRect(px - 7, py - 1, 3, 3);

        // Hands holding Steering Wheel
        ctx.fillStyle = "#f5d0a9";
        ctx.fillRect(px - 11, py + 2, 4, 5);
        ctx.fillRect(px + 7, py + 2, 4, 5);

        // Steering Wheel
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py + 5, 9, 0, Math.PI * 2);
        ctx.stroke();
      };

      const drawPassengerCharacter = (px: number, py: number, npcId: string) => {
        const bobY = Math.floor(Math.sin(Date.now() / 350) * 0.8);

        // Green School Uniform Jacket / Front of Body (facing DOWN towards rear of bus)
        ctx.fillStyle = "#15803d"; // Green school jacket
        ctx.fillRect(px - 8, py - 4, 16, 12);
        ctx.fillStyle = "#ffffff"; // White shirt collar
        ctx.fillRect(px - 3, py - 4, 6, 3);
        ctx.fillStyle = "#dc2626"; // Red tie
        ctx.fillRect(px - 1, py - 1, 2, 4);

        if (npcId === "bus_nico" || npcId === "class_nico") {
          // Nico: Brown hair, cool guy face facing DOWN
          ctx.fillStyle = "#ffe4c4"; // Face skin
          ctx.fillRect(px - 6, py - 14 + bobY, 12, 10);

          // Eyes looking towards rear
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(px - 4, py - 11 + bobY, 2, 3);
          ctx.fillRect(px + 2, py - 11 + bobY, 2, 3);

          // Cool smile
          ctx.fillStyle = "#9a3412";
          ctx.fillRect(px - 2, py - 6 + bobY, 4, 1.5);

          // Brown hair (styled bangs on top and sides)
          ctx.fillStyle = "#78350f";
          ctx.fillRect(px - 8, py - 20 + bobY, 16, 8);
          ctx.fillStyle = "#92400e";
          ctx.fillRect(px - 8, py - 17 + bobY, 3, 6);
          ctx.fillRect(px + 5, py - 17 + bobY, 3, 6);
        } else if (npcId === "bus_juan" || npcId === "class_juan") {
          // Juan: Black hair, glasses facing DOWN
          ctx.fillStyle = "#f5d0a9"; // Face skin
          ctx.fillRect(px - 6, py - 14 + bobY, 12, 10);

          // Black hair
          ctx.fillStyle = "#18181b";
          ctx.fillRect(px - 8, py - 20 + bobY, 16, 8);
          ctx.fillRect(px - 8, py - 17 + bobY, 3, 5);
          ctx.fillRect(px + 5, py - 17 + bobY, 3, 5);

          // Glasses frame
          ctx.strokeStyle = "#09090b";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px - 5, py - 12 + bobY, 4, 4);
          ctx.strokeRect(px + 1, py - 12 + bobY, 4, 4);
          ctx.fillStyle = "#09090b";
          ctx.fillRect(px - 1, py - 10 + bobY, 2, 1.5);

          // Eyes behind glasses
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(px - 4, py - 11 + bobY, 2, 2);
          ctx.fillRect(px + 2, py - 11 + bobY, 2, 2);
        } else if (npcId === "bus_jaz" || npcId === "class_jaz") {
          // Jaz: Brunette hair, rosy cheeks facing DOWN
          ctx.fillStyle = "#451a03"; // Brunette hair background framing face
          ctx.fillRect(px - 8, py - 20 + bobY, 16, 16);

          ctx.fillStyle = "#ffe4c4"; // Face skin
          ctx.fillRect(px - 6, py - 14 + bobY, 12, 10);

          // Brunette bangs
          ctx.fillStyle = "#451a03";
          ctx.fillRect(px - 7, py - 20 + bobY, 14, 7);

          // Eyes
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(px - 4, py - 11 + bobY, 2, 3);
          ctx.fillRect(px + 2, py - 11 + bobY, 2, 3);

          // Rosy cheeks
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(px - 5, py - 8 + bobY, 2, 1.5);
          ctx.fillRect(px + 3, py - 8 + bobY, 2, 1.5);

          // Cute smile
          ctx.fillStyle = "#be123c";
          ctx.fillRect(px - 2, py - 6 + bobY, 4, 1.5);
        } else if (npcId === "bus_abril" || npcId === "class_abril") {
          // Abril: Reddish hair facing DOWN
          ctx.fillStyle = "#b91c1c"; // Reddish hair background framing face
          ctx.fillRect(px - 8, py - 20 + bobY, 16, 16);

          ctx.fillStyle = "#fff1f2"; // Face skin
          ctx.fillRect(px - 6, py - 14 + bobY, 12, 10);

          // Red bangs
          ctx.fillStyle = "#dc2626";
          ctx.fillRect(px - 7, py - 20 + bobY, 14, 7);

          // Emerald eyes
          ctx.fillStyle = "#16a34a";
          ctx.fillRect(px - 4, py - 11 + bobY, 2, 3);
          ctx.fillRect(px + 2, py - 11 + bobY, 2, 3);

          // Smirk / smile
          ctx.fillStyle = "#9f1239";
          ctx.fillRect(px - 2, py - 6 + bobY, 4, 1.5);
        } else if (npcId === "class_mateo" || npcId === "mateo_soccer") {
          // Mateo: Light brown spiky hair, energetic face facing DOWN
          ctx.fillStyle = "#ffe4c4"; // Face skin
          ctx.fillRect(px - 6, py - 14 + bobY, 12, 10);

          // Eyes
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(px - 4, py - 11 + bobY, 2, 3);
          ctx.fillRect(px + 2, py - 11 + bobY, 2, 3);

          // Big energetic smile
          ctx.fillStyle = "#b91c1c";
          ctx.fillRect(px - 3, py - 6 + bobY, 6, 2);

          // Spiky hair (gold/amber)
          ctx.fillStyle = "#d97706";
          ctx.fillRect(px - 8, py - 20 + bobY, 16, 7);
          ctx.fillRect(px - 5, py - 22 + bobY, 4, 3);
          ctx.fillRect(px + 1, py - 22 + bobY, 4, 3);
        }
      };

      // 2. Render NPCs
      npcs.forEach((npc) => {
        const npcX = npc.x * TILE_SIZE + TILE_SIZE / 2;
        const npcY = npc.y * TILE_SIZE + TILE_SIZE / 2;
        
        // Draw dynamic retro shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(npcX, npcY + 12, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (npc.id === "mom") {
          drawMomCharacter(npcX, npcY);
        } else if (npc.id === "blonde_neighbor" || npc.id === "bus_neighbor") {
          drawBlondeNeighborCharacter(npcX, npcY, currentMap === "bus_interior");
        } else if (npc.id === "bus_driver") {
          drawBusDriverCharacter(npcX, npcY, currentMap === "bus_interior");
        } else if (npc.id === "preceptora") {
          drawPreceptoraCharacter(npcX, npcY);
        } else if (npc.id.startsWith("teacher_") || npc.id === "generic_teacher") {
          drawTeacherCharacter(npcX, npcY, npc.id);
        } else if (
          npc.id === "bus_nico" || npc.id === "class_nico" ||
          npc.id === "bus_juan" || npc.id === "class_juan" ||
          npc.id === "bus_jaz" || npc.id === "class_jaz" ||
          npc.id === "bus_abril" || npc.id === "class_abril" ||
          npc.id === "class_mateo" || npc.id === "mateo_soccer"
        ) {
          drawPassengerCharacter(npcX, npcY, npc.id);
        } else {
          // Emoji/Sprite rendering for other NPCs
          ctx.font = "24px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(npc.sprite, npcX, npcY - 4);
        }

        // Name overhead tag
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px 'JetBrains Mono'";
        ctx.fillText(npc.name, npcX, npcY - 20);
      });

      // Draw Walk Path Target Indicator (Pulsing holographic circle)
      if (walkPath.length > 0) {
        const targetTile = walkPath[walkPath.length - 1];
        const tx = targetTile.x * TILE_SIZE + TILE_SIZE / 2;
        const ty = targetTile.y * TILE_SIZE + TILE_SIZE / 2;
        const pulseRadius = 6 + Math.abs(Math.sin(Date.now() / 220)) * 6;
        
        ctx.strokeStyle = "#06b6d4"; // Cyan glow
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(tx, ty, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(6, 182, 212, 0.2)";
        ctx.beginPath();
        ctx.arc(tx, ty, pulseRadius - 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (pendingInteraction) {
        const tx = pendingInteraction.x * TILE_SIZE + TILE_SIZE / 2;
        const ty = pendingInteraction.y * TILE_SIZE + TILE_SIZE / 2;
        const pulseRadius = 6 + Math.abs(Math.sin(Date.now() / 220)) * 6;
        
        ctx.strokeStyle = "#eab308"; // Gold yellow
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(tx, ty, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(234, 179, 8, 0.2)";
        ctx.beginPath();
        ctx.arc(tx, ty, pulseRadius - 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Render Player (CKY) with subpixel precision
      const px = motionData.x * TILE_SIZE + TILE_SIZE / 2;
      const py = motionData.y * TILE_SIZE + TILE_SIZE / 2;

      if (introStep === 2) {
        // Draw CKY lying in bed resting sideways on pillow (col 8, row 3)
        const bx = 8 * TILE_SIZE + TILE_SIZE / 2;
        const by = 3 * TILE_SIZE + TILE_SIZE / 2;

        ctx.fillStyle = "#ffd8b3"; // Peach skin
        ctx.fillRect(bx - 6, by - 6, 12, 12);

        ctx.fillStyle = "#783c1d"; // Chestnut brown hair
        ctx.fillRect(bx - 9, by - 9, 18, 4);
        ctx.fillRect(bx - 9, by - 5, 3, 10);
        ctx.fillRect(bx + 6, by - 5, 3, 10);

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx - 4, by - 1);
        ctx.lineTo(bx - 1, by - 1);
        ctx.moveTo(bx + 1, by - 1);
        ctx.lineTo(bx + 4, by - 1);
        ctx.stroke();

        ctx.fillStyle = "#f43f5e"; // blush
        ctx.fillRect(bx - 5, by + 2, 2, 2);
        ctx.fillRect(bx + 3, by + 2, 2, 2);
      } else {
        // Dynamic Soft Realistic Shadow
        if (activeGraphicsConfig.dynamicLighting) {
          drawSoftShadow(ctx, px, py + 14, 14, 7, activeGraphicsConfig.shadowQuality);
        } else {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.beginPath();
          ctx.ellipse(px, py + 14, 14, 7, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Render beautiful detailed human character (CKY)
        // Body breathing bobbing offset for pixel-art animation (0 or 1 pixel)
        const bobY = Math.floor(Math.sin(Date.now() / 350) * 0.8 + 0.2);

        // Clothes styling color schemes
        const isLingerie = currentOutfit === "lingerie" || currentOutfit === "lingerie_sexy";
        const bodyColor = 
          currentOutfit === "naked"
            ? "#ffd8b3"
            : currentOutfit === "towel"
            ? "#ffffff"
            : isLingerie
            ? "#e11d48" // Crimson lace lingerie
            : currentOutfit === "pajamas" 
            ? "#93c5fd" 
            : currentOutfit === "uniform" 
            ? "#22c55e" // Green school shirt (Remera verde de la escuela)
            : "#7c3aed"; // Violet Hoodie (Casual)

        const bodyShadowColor = 
          currentOutfit === "naked"
            ? "#fed7aa"
            : currentOutfit === "towel"
            ? "#e2e8f0"
            : isLingerie
            ? "#be123c"
            : currentOutfit === "pajamas" 
            ? "#60a5fa" 
            : currentOutfit === "uniform" 
            ? "#15803d" // Dark green shadow
            : "#6d28d9";

        const legsColor = 
          currentOutfit === "naked" || currentOutfit === "towel" || isLingerie
            ? "#ffd8b3"
            : currentOutfit === "pajamas" 
            ? "#93c5fd" 
            : currentOutfit === "uniform" 
            ? "#1d4ed8" // Royal Blue Jeans
            : "#3b82f6"; // Blue Jeans

        const legsShadowColor = 
          currentOutfit === "naked" || currentOutfit === "towel" || isLingerie
            ? "#fed7aa"
            : currentOutfit === "pajamas" 
            ? "#60a5fa" 
            : currentOutfit === "uniform" 
            ? "#1e40af" 
            : "#1d4ed8";

        const shoesColor = 
          currentOutfit === "naked" || currentOutfit === "towel"
            ? "#ffd8b3"
            : isLingerie
            ? "#e11d48"
            : currentOutfit === "pajamas" 
            ? "#fbcfe8" // Pink slippers
            : currentOutfit === "uniform" 
            ? "#1e293b" // Dark school shoes
            : "#ef4444"; // Red sneakers

        const shoesShadowColor = 
          currentOutfit === "naked" || currentOutfit === "towel"
            ? "#fed7aa"
            : isLingerie
            ? "#9f1239"
            : currentOutfit === "pajamas" 
            ? "#f472b6" 
            : currentOutfit === "uniform" 
            ? "#0f172a" 
            : "#991b1b";

        if (facing === "down") {
          // 1. Long hair back layer
          ctx.fillStyle = "#542810"; // Chestnut brown (shadow/darker)
          ctx.fillRect(px - 10, py - 16 + bobY, 20, 14);

          // 2. Head / Skin
          ctx.fillStyle = "#ffd8b3"; // Cozy peach skin tone
          ctx.fillRect(px - 8, py - 18 + bobY, 16, 12);

          // 3. Hair front layer (Bangs + Chestnut locks)
          ctx.fillStyle = "#783c1d"; // Chestnut brown bangs on top
          ctx.fillRect(px - 9, py - 21 + bobY, 18, 6);
          ctx.fillStyle = "#783c1d"; // Chestnut brown locks on the sides
          ctx.fillRect(px - 10, py - 15 + bobY, 3, 11);
          ctx.fillRect(px + 7, py - 15 + bobY, 3, 11);

          // 4. Cute Anime Eyes
          ctx.fillStyle = "#111827"; // Dark eyes
          ctx.fillRect(px - 5, py - 12 + bobY, 3, 4);
          ctx.fillRect(px + 2, py - 12 + bobY, 3, 4);
          // Eye sparkle (shining highlight)
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px - 4, py - 12 + bobY, 1, 1);
          ctx.fillRect(px + 3, py - 12 + bobY, 1, 1);

          // 5. Blush & Cute smile
          ctx.fillStyle = "#f43f5e"; // Rose cheeks
          ctx.fillRect(px - 7, py - 8 + bobY, 2, 2);
          ctx.fillRect(px + 5, py - 8 + bobY, 2, 2);
          ctx.fillStyle = "#b91c1c"; // Small smile
          ctx.fillRect(px - 1, py - 7 + bobY, 2, 1);

          // 6. Torso Details
          ctx.fillStyle = bodyColor;
          ctx.fillRect(px - 8, py - 6, 16, 14);

          if (currentOutfit === "towel") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(px - 8, py - 6, 16, 14);
            ctx.fillStyle = "#f472b6"; // Pink towel top band
            ctx.fillRect(px - 8, py - 6, 16, 2);
            ctx.fillStyle = "#e2e8f0"; // Vertical fold line
            ctx.fillRect(px - 1, py - 4, 2, 12);
          } else if (currentOutfit === "pajamas") {
            // Cute pajama white buttons
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(px - 1, py - 2, 2, 2);
            ctx.fillRect(px - 1, py + 3, 2, 2);
          } else if (currentOutfit === "uniform") {
            // White school collar & golden emblem
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(px - 3, py - 6, 6, 2);
            ctx.fillRect(px - 1, py - 4, 2, 2);
            ctx.fillStyle = "#facc15"; // Gold CKY school insignia
            ctx.fillRect(px - 4, py - 2, 3, 3);
          } else {
            // Casual: White hood drawstring details
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(px - 2, py - 3, 1, 5);
            ctx.fillRect(px + 1, py - 3, 1, 5);
          }

          // Hands (Peach skin)
          ctx.fillStyle = "#ffd8b3";
          ctx.fillRect(px - 10, py + 4, 3, 3);
          ctx.fillRect(px + 7, py + 4, 3, 3);

          // 7. Legs & Shoes
          ctx.fillStyle = legsColor;
          ctx.fillRect(px - 6, py + 8, 12, 5);
          ctx.fillStyle = legsShadowColor;
          ctx.fillRect(px - 1, py + 8, 2, 5);

          // Left Shoe
          ctx.fillStyle = shoesColor;
          ctx.fillRect(px - 8, py + 12, 5, 2);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px - 8, py + 14, 5, 1);

          // Right Shoe
          ctx.fillStyle = shoesColor;
          ctx.fillRect(px + 3, py + 12, 5, 2);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px + 3, py + 14, 5, 1);

          // Phone in hand (Only when dressed)
          if (currentOutfit !== "pajamas") {
            ctx.fillStyle = "#22c55e"; // Glowing green pixel phone
            ctx.fillRect(px + 7, py + 1, 4, 6);
            ctx.fillStyle = "#86efac"; // Screen
            ctx.fillRect(px + 8, py + 2, 2, 4);
          }

        } else if (facing === "up") {
          // 1. Long hair covering the whole back of the head (Chestnut brown)
          ctx.fillStyle = "#783c1d"; // Chestnut brown hair
          ctx.fillRect(px - 10, py - 21 + bobY, 20, 26);
          // Darker shadow locks cascading down the back (no pink)
          ctx.fillStyle = "#542810";
          ctx.fillRect(px - 10, py - 14 + bobY, 3, 14);
          ctx.fillRect(px + 7, py - 14 + bobY, 3, 14);
          // skin bit of neck
          ctx.fillStyle = "#ffd8b3";
          ctx.fillRect(px - 3, py - 5, 6, 2);

          // 2. Torso - Pajamas vs Hoodie
          ctx.fillStyle = bodyColor;
          ctx.fillRect(px - 8, py - 6, 16, 14);

          if (currentOutfit !== "pajamas") {
            // Darker hood triangle hanging down
            ctx.fillStyle = bodyShadowColor;
            ctx.beginPath();
            ctx.moveTo(px - 6, py - 6);
            ctx.lineTo(px + 6, py - 6);
            ctx.lineTo(px, py + 1);
            ctx.closePath();
            ctx.fill();
          }

          // 3. Legs & Shoes
          ctx.fillStyle = legsColor;
          ctx.fillRect(px - 6, py + 8, 12, 5);
          ctx.fillStyle = legsShadowColor;
          ctx.fillRect(px - 1, py + 8, 2, 5);

          // Left shoe
          ctx.fillStyle = shoesColor;
          ctx.fillRect(px - 8, py + 12, 5, 2);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px - 8, py + 14, 5, 1);

          // Right shoe
          ctx.fillStyle = shoesColor;
          ctx.fillRect(px + 3, py + 12, 5, 2);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px + 3, py + 14, 5, 1);

        } else if (facing === "left") {
          // 1. Head / Skin profile
          ctx.fillStyle = "#ffd8b3"; // skin profile
          ctx.fillRect(px - 7, py - 18 + bobY, 12, 12);

          // 2. Hair on top and back of the head (Chestnut brown)
          ctx.fillStyle = "#783c1d"; // Chestnut brown hair
          ctx.fillRect(px - 4, py - 21 + bobY, 11, 16);
          ctx.fillRect(px + 3, py - 12 + bobY, 4, 11); // hair strand
          // Chestnut brown side lock shadow
          ctx.fillStyle = "#542810";
          ctx.fillRect(px - 1, py - 16 + bobY, 3, 13);

          // 3. Eye profile (Left side)
          ctx.fillStyle = "#111827";
          ctx.fillRect(px - 5, py - 12 + bobY, 2, 4);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px - 4, py - 12 + bobY, 1, 1);
          ctx.fillStyle = "#f43f5e"; // cheek blush
          ctx.fillRect(px - 6, py - 8 + bobY, 2, 2);

          // 4. Torso
          ctx.fillStyle = bodyColor;
          ctx.fillRect(px - 7, py - 6, 14, 14);
          // Sleeve overlap outline
          ctx.fillStyle = bodyShadowColor;
          ctx.fillRect(px - 3, py - 4, 4, 10);
          // Hand
          ctx.fillStyle = "#ffd8b3";
          ctx.fillRect(px - 4, py + 5, 3, 3);

          // 5. Legs & Shoes
          ctx.fillStyle = legsColor;
          ctx.fillRect(px - 5, py + 8, 10, 5);

          // Left shoe pointing left
          ctx.fillStyle = shoesColor;
          ctx.fillRect(px - 8, py + 12, 6, 2);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px - 8, py + 14, 6, 1);

          // Right shoe behind
          ctx.fillStyle = shoesShadowColor;
          ctx.fillRect(px - 2, py + 12, 4, 2);
          ctx.fillStyle = "#cbd5e1";
          ctx.fillRect(px - 2, py + 14, 4, 1);

          // Phone in left hand (Only when dressed)
          if (currentOutfit !== "pajamas") {
            ctx.fillStyle = "#22c55e"; // Glowing green pixel phone
            ctx.fillRect(px - 10, py + 1, 4, 6);
            ctx.fillStyle = "#86efac"; // Screen
            ctx.fillRect(px - 9, py + 2, 2, 4);
          }

        } else if (facing === "right") {
          // 1. Head / Skin profile
          ctx.fillStyle = "#ffd8b3"; // skin profile
          ctx.fillRect(px - 5, py - 18 + bobY, 12, 12);

          // 2. Hair on top and back of the head (Chestnut brown)
          ctx.fillStyle = "#783c1d"; // Chestnut brown hair
          ctx.fillRect(px - 7, py - 21 + bobY, 11, 16);
          ctx.fillRect(px - 7, py - 12 + bobY, 4, 11); // hair strand
          // Chestnut brown side lock shadow
          ctx.fillStyle = "#542810";
          ctx.fillRect(px - 2, py - 16 + bobY, 3, 13);

          // 3. Eye profile (Right side)
          ctx.fillStyle = "#111827";
          ctx.fillRect(px + 3, py - 12 + bobY, 2, 4);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px + 3, py - 12 + bobY, 1, 1);
          ctx.fillStyle = "#f43f5e"; // cheek blush
          ctx.fillRect(px + 4, py - 8 + bobY, 2, 2);

          // 4. Torso
          ctx.fillStyle = bodyColor;
          ctx.fillRect(px - 7, py - 6, 14, 14);
          // Sleeve overlap outline
          ctx.fillStyle = bodyShadowColor;
          ctx.fillRect(px - 1, py - 4, 4, 10);
          // Hand
          ctx.fillStyle = "#ffd8b3";
          ctx.fillRect(px + 1, py + 5, 3, 3);

          // 5. Legs & Shoes
          ctx.fillStyle = legsColor;
          ctx.fillRect(px - 5, py + 8, 10, 5);

          // Right shoe pointing right
          ctx.fillStyle = shoesColor;
          ctx.fillRect(px + 2, py + 12, 6, 2);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px + 2, py + 14, 6, 1);

          // Left shoe behind
          ctx.fillStyle = shoesShadowColor;
          ctx.fillRect(px - 2, py + 12, 4, 2);
          ctx.fillStyle = "#cbd5e1";
          ctx.fillRect(px - 2, py + 14, 4, 1);

          // Phone in right hand (Only when dressed)
          if (currentOutfit !== "pajamas") {
            ctx.fillStyle = "#22c55e"; // Glowing green pixel phone
            ctx.fillRect(px + 6, py + 1, 4, 6);
            ctx.fillStyle = "#86efac"; // Screen
            ctx.fillRect(px + 7, py + 2, 2, 4);
          }
        }
      }

      if (currentOutfit === "naked") {
        ctx.save();
        const mosaicSize = 3;
        for (let mx = px - 11; mx <= px + 11; mx += mosaicSize) {
          for (let my = py - 7; my <= py + 14; my += mosaicSize) {
            const alpha = 0.65 + Math.sin(mx * 5 + my * 7 + Date.now() / 150) * 0.25;
            ctx.fillStyle = `rgba(254, 215, 170, ${alpha})`;
            ctx.fillRect(mx, my, mosaicSize, mosaicSize);
            ctx.strokeStyle = `rgba(251, 146, 60, 0.35)`;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(mx, my, mosaicSize, mosaicSize);
          }
        }
        ctx.restore();
      }

      // 6. Accompanying Spiritual Companions (Ángela & W)
      // Ángela: Playful pink ethereal wisp floating nearby
      if (hasTalkedToAngela || currentDay >= 2) {
        const angBob = Math.sin(Date.now() / 240) * 4;
        const angX = px + (facing === "left" ? 18 : -18);
        const angY = py - 14 + angBob;

        ctx.save();
        // Ethereal Outer Glow
        const angGlow = ctx.createRadialGradient(angX, angY, 1, angX, angY, 14);
        angGlow.addColorStop(0, "rgba(244, 114, 182, 0.7)");
        angGlow.addColorStop(0.5, "rgba(236, 72, 153, 0.3)");
        angGlow.addColorStop(1, "rgba(236, 72, 153, 0)");
        ctx.fillStyle = angGlow;
        ctx.beginPath();
        ctx.arc(angX, angY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Spirit core
        ctx.fillStyle = "#fdf2f8";
        ctx.beginPath();
        ctx.arc(angX, angY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pink playful eyes
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(angX - 2, angY - 1, 1.5, 1.5);
        ctx.fillRect(angX + 1, angY - 1, 1.5, 1.5);

        // Orbiting ethereal sparkles
        const angSparkle = (Date.now() / 300);
        const sp1X = angX + Math.cos(angSparkle) * 8;
        const sp1Y = angY + Math.sin(angSparkle) * 6;
        ctx.fillStyle = "rgba(251, 207, 232, 0.9)";
        ctx.fillRect(sp1X - 0.5, sp1Y - 0.5, 1.5, 1.5);
        ctx.restore();
      }

      // W (Espíritu Guardián): Bola de luz tenue por defecto, o pala sagrada en ruinas
      if (day3RevealedSpiritW || currentDay >= 4) {
        const wBob = Math.cos(Date.now() / 260) * 4;
        const wX = px + (facing === "left" ? -20 : 20);
        const wY = py - 16 + wBob;

        ctx.save();
        if (day4WShovelTransform && currentMap === "ruins_valley" && !day4TreasureDug) {
          // Sacred Golden Astral Shovel form
          ctx.fillStyle = "#facc15";
          ctx.fillRect(wX - 2, wY - 8, 4, 16);
          ctx.fillStyle = "#eab308";
          ctx.fillRect(wX - 4, wY + 6, 8, 4);
          ctx.fillStyle = "#fef08a";
          ctx.fillRect(wX - 3, wY - 10, 6, 3);
        } else if (day5WTransformTool === "duster") {
          // W Celestial Feather Duster (Plumero Celestial)
          ctx.fillStyle = "#d97706";
          ctx.fillRect(wX - 1, wY + 2, 3, 14); // Golden stick handle
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.ellipse(wX, wY - 4, 8, 10, 0, 0, Math.PI * 2); // Fluffy glowing feathers
          ctx.fill();
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (day5WTransformTool === "mop") {
          // W Purifying Astral Mop (Mopa Purificadora)
          ctx.fillStyle = "#0284c7";
          ctx.fillRect(wX - 1, wY - 8, 3, 18); // Handle
          ctx.fillStyle = "#e0f2fe";
          ctx.fillRect(wX - 6, wY + 8, 14, 6); // Sponge head
          // Glowing bubbles
          ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
          ctx.beginPath();
          ctx.arc(wX - 8, wY + 4, 3, 0, Math.PI * 2);
          ctx.arc(wX + 8, wY + 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (day5WTransformTool === "vacuum") {
          // W Arcane Vacuum (Aspiradora Arcana)
          ctx.fillStyle = "#6366f1";
          ctx.fillRect(wX - 5, wY - 2, 10, 12); // Main body
          ctx.fillStyle = "#a855f7";
          ctx.fillRect(wX - 2, wY + 8, 4, 6); // Suction tube
          // Suction cone light
          ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
          ctx.beginPath();
          ctx.moveTo(wX, wY + 12);
          ctx.lineTo(wX - 10, wY + 22);
          ctx.lineTo(wX + 10, wY + 22);
          ctx.closePath();
          ctx.fill();
        } else if (day5WTransformTool === "broom") {
          // W Golden Broom (Escoba Dorada)
          ctx.fillStyle = "#b45309";
          ctx.fillRect(wX - 1, wY - 8, 3, 16);
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.moveTo(wX, wY + 6);
          ctx.lineTo(wX - 7, wY + 16);
          ctx.lineTo(wX + 7, wY + 16);
          ctx.closePath();
          ctx.fill();
        } else {
          // Default form: Bola de luz tenue (gentle luminous celestial orb)
          const wGlow = ctx.createRadialGradient(wX, wY, 1, wX, wY, 13);
          wGlow.addColorStop(0, "rgba(254, 240, 138, 0.85)");
          wGlow.addColorStop(0.4, "rgba(250, 204, 21, 0.4)");
          wGlow.addColorStop(1, "rgba(234, 179, 8, 0)");
          ctx.fillStyle = wGlow;
          ctx.beginPath();
          ctx.arc(wX, wY, 13, 0, Math.PI * 2);
          ctx.fill();

          // Luminous soft celestial core
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(wX, wY, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Guardian aura micro-sparks
          const wSparkle = (Date.now() / 350);
          const wSp1X = wX + Math.cos(-wSparkle) * 7;
          const wSp1Y = wY + Math.sin(-wSparkle) * 5;
          ctx.fillStyle = "rgba(254, 249, 195, 0.85)";
          ctx.fillRect(wSp1X - 0.5, wSp1Y - 0.5, 1.5, 1.5);
        }
        ctx.restore();
      }

      // Alma Gemela Híbrido follower (Mitad Humano, Mitad Espíritu)
      if (day6SoulmateJoined || (soulmateInfo && currentDay >= 6)) {
        const smBob = Math.sin(Date.now() / 280) * 3;
        const smX = px + (facing === "left" ? 34 : -34);
        const smY = py - 8 + smBob;

        ctx.save();
        // Ethereal hybrid aura (violet & cyan)
        const smGlow = ctx.createRadialGradient(smX, smY, 1, smX, smY, 16);
        smGlow.addColorStop(0, "rgba(168, 85, 247, 0.6)");
        smGlow.addColorStop(0.5, "rgba(56, 189, 248, 0.35)");
        smGlow.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.fillStyle = smGlow;
        ctx.beginPath();
        ctx.arc(smX, smY, 16, 0, Math.PI * 2);
        ctx.fill();

        // Avatar / Mini sprite
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(soulmateInfo?.avatar || "🧑‍🦱", smX, smY);

        // Mini label
        ctx.fillStyle = "#e0e7ff";
        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.fillText(soulmateInfo?.name || "Kael", smX, smY - 12);
        ctx.restore();
      }

      // Day 6: Forma Oscura Encapuchada en la habitación
      if (currentDay === 6 && !day6DarkFormDefeated && currentMap === "bedroom") {
        const darkX = 6 * TILE_SIZE + TILE_SIZE / 2;
        const darkY = 3 * TILE_SIZE + TILE_SIZE / 2;
        const darkBob = Math.sin(Date.now() / 200) * 3;

        ctx.save();
        // Shadow aura / Limbo purple mist
        const shadowGlow = ctx.createRadialGradient(darkX, darkY + darkBob, 2, darkX, darkY + darkBob, 32);
        shadowGlow.addColorStop(0, "rgba(88, 28, 135, 0.9)");
        shadowGlow.addColorStop(0.5, "rgba(147, 51, 234, 0.4)");
        shadowGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = shadowGlow;
        ctx.beginPath();
        ctx.arc(darkX, darkY + darkBob, 32, 0, Math.PI * 2);
        ctx.fill();

        // Dark Hooded Silhouette
        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.moveTo(darkX - 12, darkY + 16 + darkBob);
        ctx.lineTo(darkX, darkY - 16 + darkBob);
        ctx.lineTo(darkX + 12, darkY + 16 + darkBob);
        ctx.closePath();
        ctx.fill();

        // Glowing Eyes
        ctx.fillStyle = "#c084fc";
        ctx.fillRect(darkX - 5, darkY - 4 + darkBob, 3, 2);
        ctx.fillRect(darkX + 2, darkY - 4 + darkBob, 3, 2);

        // Name / Tag
        ctx.fillStyle = "#e9d5ff";
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("🌑 Forma Oscura (Tocar para combatir)", darkX, darkY - 20 + darkBob);
        ctx.restore();
      }

      if (postCombatMomPos) {
        const momX = postCombatMomPos.x * TILE_SIZE + TILE_SIZE / 2;
        const momY = postCombatMomPos.y * TILE_SIZE + TILE_SIZE / 2;
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(momX, momY + 12, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        drawMomCharacter(momX, momY);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("Madre", momX, momY - 20);
      }

      // Click target visual feedback indicator
      if (clickTarget) {
        const elapsed = Date.now() - clickTarget.time;
        if (elapsed < 600) {
          const progress = elapsed / 600; // 0 to 1
          const alpha = 1 - progress;
          
          // Expanding ripple
          const ringRadius = (TILE_SIZE / 2) * (0.2 + progress * 1.5);
          const cx = clickTarget.x * TILE_SIZE + TILE_SIZE / 2;
          const cy = clickTarget.y * TILE_SIZE + TILE_SIZE / 2;
          
          ctx.save();
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`; // Cyan neon ripple
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          
          // Contracting square reticle corner marks
          const size = TILE_SIZE * (1.2 - progress * 0.4);
          ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`; // Pink neon corner marks
          ctx.lineWidth = 1.5;
          
          // Draw 4 small corner bracket marks
          const half = size / 2;
          const len = 6;
          
          // Top-left corner
          ctx.beginPath();
          ctx.moveTo(cx - half, cy - half + len);
          ctx.lineTo(cx - half, cy - half);
          ctx.lineTo(cx - half + len, cy - half);
          ctx.stroke();
          
          // Top-right corner
          ctx.beginPath();
          ctx.moveTo(cx + half, cy - half + len);
          ctx.lineTo(cx + half, cy - half);
          ctx.lineTo(cx + half - len, cy - half);
          ctx.stroke();
          
          // Bottom-left corner
          ctx.beginPath();
          ctx.moveTo(cx - half, cy + half - len);
          ctx.lineTo(cx - half, cy + half);
          ctx.lineTo(cx - half + len, cy + half);
          ctx.stroke();
          
          // Bottom-right corner
          ctx.beginPath();
          ctx.moveTo(cx + half, cy + half - len);
          ctx.lineTo(cx + half, cy + half);
          ctx.lineTo(cx + half - len, cy + half);
          ctx.stroke();
          
          ctx.restore();
        }
      }

      // Interactive action target helper
      const target = getActionTarget();
      if (target) {
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 2;
        ctx.strokeRect(target.tx * TILE_SIZE, target.ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Action tooltip
        ctx.fillStyle = "#eab308";
        ctx.font = "bold 10px 'JetBrains Mono'";
        const text = language === "es" ? "[ESPACIO] Interactuar" : "[SPACE] Interact";
        ctx.fillText(text, px, py - 32);
      }

      // 4. Realistic Volumetric Ambient Lighting Overlay (Only in Bedroom)
      if (currentMap === "bedroom") {
        ctx.save();
        // A soft midnight violet-blue shadow overlay across the room (except where lit)
        const darknessOpacity = introStep === 4 ? 0.88 : introStep === 5 ? 0.0 : 0.35;
        ctx.fillStyle = `rgba(15, 12, 30, ${darknessOpacity})`; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Use "screen" composition to make light blooms glow naturally over elements
        ctx.globalCompositeOperation = "screen";
        
        // Dynamic pulse factor for warm lamp & cold moonlight
        const breath = Math.sin(Date.now() / 800) * 0.08 + 1.0;
        const moonBreath = Math.sin(Date.now() / 1200) * 0.05 + 0.95;
        
        // A: Warm lamp glow from the bedside table (tile 10 is at col 8, row 6)
        const lampX = 8 * TILE_SIZE + TILE_SIZE / 2;
        const lampY = 6 * TILE_SIZE + TILE_SIZE / 2 - 8; // slightly above the table surface
        const lampRadius = (introStep === 2 ? 110 : 80) * breath;
        const lampGlow = ctx.createRadialGradient(lampX, lampY, 3, lampX, lampY, lampRadius);
        lampGlow.addColorStop(0, "rgba(253, 224, 71, 0.55)"); // Soft warm yellow
        lampGlow.addColorStop(0.3, "rgba(234, 179, 8, 0.18)");
        lampGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(lampX, lampY, lampRadius, 0, Math.PI * 2);
        ctx.fill();

        // B: Cool pale moonlight casting downward from the top windows (col 4 & 5, row 0) (disabled in introStep 2 & 3, or when curtains are closed)
        if (introStep !== 2 && introStep !== 3 && curtainsOpen) {
          const moonLeftX = 4 * TILE_SIZE + TILE_SIZE / 2;
          const moonRightX = 5 * TILE_SIZE + TILE_SIZE / 2;
          const moonY = 0 * TILE_SIZE + 4;
          
          const moonGlow = ctx.createLinearGradient(0, moonY, 0, moonY + 180 * moonBreath);
          moonGlow.addColorStop(0, `rgba(186, 230, 253, ${0.3 * moonBreath})`); // Soft light blue-white near window
          moonGlow.addColorStop(0.5, `rgba(186, 230, 253, ${0.12 * moonBreath})`);
          moonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          
          ctx.fillStyle = moonGlow;
          ctx.beginPath();
          // Light cone spreading outward slightly as it travels down
          ctx.moveTo(moonLeftX - 15, moonY);
          ctx.lineTo(moonRightX + 15, moonY);
          ctx.lineTo(moonRightX + 45 * moonBreath, moonY + 180 * moonBreath);
          ctx.lineTo(moonLeftX - 45 * moonBreath, moonY + 180 * moonBreath);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // 4b. Realistic Eerie Low-Light & Creepy Shadow Overlay (Hallway)
      if (currentMap === "hallway") {
        ctx.save();
        
        // Deep pitch dark shadow shroud across the hallway canvas
        ctx.fillStyle = "rgba(2, 6, 23, 0.88)"; // Near pitch dark deep slate/indigo
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Faint dim spotlight radius around player (CKY)
        ctx.globalCompositeOperation = "destination-out";
        
        const px = playerPos.x * TILE_SIZE + TILE_SIZE / 2;
        const py = playerPos.y * TILE_SIZE + TILE_SIZE / 2;
        
        // Subtle eerie pulse / flickering breath in the dim light
        const flicker = Math.sin(Date.now() / 200) * 0.05 + 0.95;
        const lightRadius = 80 * flicker; // Slightly wider & brighter light around CKY
        
        const lightGlow = ctx.createRadialGradient(px, py, 6, px, py, lightRadius);
        lightGlow.addColorStop(0, "rgba(0, 0, 0, 1)"); // Fully clear center around CKY
        lightGlow.addColorStop(0.6, "rgba(0, 0, 0, 0.7)");
        lightGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = lightGlow;
        ctx.beginPath();
        ctx.arc(px, py, lightRadius, 0, Math.PI * 2);
        ctx.fill();

        // Very faint crack of warm light leaking under CKY's room door (col 3, row 0)
        const ckyX = 3 * TILE_SIZE + TILE_SIZE / 2;
        const ckyY = 0 * TILE_SIZE + TILE_SIZE;
        const ckyLeak = ctx.createRadialGradient(ckyX, ckyY, 2, ckyX, ckyY, 32);
        ckyLeak.addColorStop(0, "rgba(0, 0, 0, 0.5)");
        ckyLeak.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = ckyLeak;
        ctx.beginPath();
        ctx.arc(ckyX, ckyY, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Dim warm flickering aura overlay on top of player's vision cone
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const aura = ctx.createRadialGradient(px, py, 4, px, py, lightRadius);
        aura.addColorStop(0, "rgba(253, 224, 71, 0.18)"); // Slightly warmer beam around CKY
        aura.addColorStop(0.65, "rgba(180, 83, 9, 0.05)");
        aura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(px, py, lightRadius, 0, Math.PI * 2);
        ctx.fill();

        // Vignette darkness in the corners
        const cornerGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 80, canvas.width / 2, canvas.height / 2, 220);
        cornerGrad.addColorStop(0, "rgba(0,0,0,0)");
        cornerGrad.addColorStop(1, "rgba(0,0,0,0.6)");
        ctx.fillStyle = cornerGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.restore();
      }

      // 4c. Room Ambient Lighting Overlays (Bathroom, Sister's Room, Mom's Room, Limbo)
      if (currentMap === "sisters_room") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const pulse = Math.sin(Date.now() / 600) * 0.05 + 0.95;
        // Laptop screen light bloom at (5,3)
        const lx = 5 * TILE_SIZE + TILE_SIZE / 2;
        const ly = 3 * TILE_SIZE + TILE_SIZE / 2;
        const laptopGlow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 60 * pulse);
        laptopGlow.addColorStop(0, "rgba(56, 189, 248, 0.4)");
        laptopGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = laptopGlow;
        ctx.beginPath();
        ctx.arc(lx, ly, 60 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (currentMap === "moms_room") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const pulse = Math.sin(Date.now() / 900) * 0.05 + 0.95;
        const mx = 8 * TILE_SIZE + TILE_SIZE / 2;
        const my = 5 * TILE_SIZE + TILE_SIZE / 2;
        const momGlow = ctx.createRadialGradient(mx, my, 2, mx, my, 80 * pulse);
        momGlow.addColorStop(0, "rgba(251, 146, 60, 0.35)");
        momGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = momGlow;
        ctx.beginPath();
        ctx.arc(mx, my, 80 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (currentMap === "bathroom") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        // Light fixture glow at top center
        const bx = 4 * TILE_SIZE + TILE_SIZE / 2;
        const by = 1 * TILE_SIZE;
        const bathGlow = ctx.createRadialGradient(bx, by, 2, bx, by, 100);
        bathGlow.addColorStop(0, "rgba(240, 249, 255, 0.25)");
        bathGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bathGlow;
        ctx.beginPath();
        ctx.arc(bx, by, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (currentMap === "limbo") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        // Floating spirit particles
        const time = Date.now() / 1000;
        ctx.fillStyle = "rgba(6, 182, 212, 0.6)";
        for (let i = 0; i < 8; i++) {
          const px = ((Math.sin(time + i * 1.5) + 1) / 2) * canvas.width;
          const py = ((Math.cos(time * 0.8 + i * 2.1) + 1) / 2) * canvas.height;
          ctx.beginPath();
          ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Dynamic Day/Night Atmosphere Color Grading
      if (activeGraphicsConfig.dayNightAtmosphere && (currentMap === "street" || currentMap === "cemetery" || currentMap === "school_courtyard")) {
        const atmos = getTimeOfDayAtmosphere(gameTime.hour, gameTime.minute);
        ctx.save();
        ctx.fillStyle = atmos.ambientColor;
        ctx.fillRect(0, 0, gridWidth, gridHeight);
        ctx.restore();

        // Streetlamp glow when dim or evening
        if (atmos.sunlightIntensity < 0.8 && currentMap === "street") {
          drawPointLightBloom(ctx, 3 * TILE_SIZE, 2 * TILE_SIZE, 90, "rgba(253, 224, 71, 0.45)", 0.6, true);
          drawPointLightBloom(ctx, 11 * TILE_SIZE, 2 * TILE_SIZE, 90, "rgba(253, 224, 71, 0.45)", 0.6, true);
        }
      }

      // Volumetric Window God Rays (Bedroom & Classrooms)
      if (activeGraphicsConfig.volumetricGodRays) {
        if (currentMap === "bedroom" && curtainsOpen && introStep !== 2 && introStep !== 3) {
          const winLeft = 4 * TILE_SIZE;
          const winRight = 6 * TILE_SIZE;
          drawVolumetricGodRay(
            ctx,
            winLeft,
            winRight,
            4,
            winLeft - 35,
            winRight + 35,
            190,
            "rgba(254, 240, 138, 0.18)"
          );
        } else if (currentMap.startsWith("classroom_")) {
          drawVolumetricGodRay(
            ctx,
            1 * TILE_SIZE,
            4 * TILE_SIZE,
            4,
            1 * TILE_SIZE - 20,
            4 * TILE_SIZE + 40,
            160,
            "rgba(254, 240, 138, 0.15)"
          );
        }
      }

      // Render Active World Particles System (Leaves, dust motes, footprints, water ripples)
      if (activeGraphicsConfig.weatherAndParticles) {
        particleEngineRef.current.render(ctx);
      }

      // End World space drawing (Restore camera translate)
      ctx.restore();

      // Next-Gen Post-Processing Pipeline (Scanlines, Vignette, CRT Filter)
      applyPostProcessing(ctx, canvas.width, canvas.height, activeGraphicsConfig);

      // 5. Draw dialogue boxes for introStep 5
      if (introStep === 5) {
        drawIntroDialogueBox(
          ctx,
          "CKY",
          "Debo prepararme y juntar todo lo que necesito para ir a la escuela.",
          "I need to get ready and gather everything I need for school.",
          canvas.width,
          canvas.height
        );
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [playerPos, facing, currentMap, language, chapterStep, walkPath, pendingInteraction, introStep, isDay2Intro, day2IntroStep, currentDay, currentOutfit, clickTarget, postCombatMomPos, activeGraphicsConfig, gameTime]);

  // Determine block/NPC tile directly ahead of CKY to trigger actions
  const getActionTarget = (pos: Position = playerPos, face: Direction = facing) => {
    let tx = pos.x;
    let ty = pos.y;
    if (face === "up") ty -= 1;
    if (face === "down") ty += 1;
    if (face === "left") tx -= 1;
    if (face === "right") tx += 1;

    // Check boundary
    const grid = getGrid(currentMap);
    if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) return null;

    // Check NPC
    const npcs = getNPCs();
    const targetedNpc = npcs.find(n => n.x === tx && n.y === ty);

    // Or check interactable tiles like Bed, PC desk, Bookshelf, Closet, Mirror
    const tileVal = grid[ty][tx];
    if (targetedNpc) {
      return { type: "npc", npc: targetedNpc, tx, ty };
    }
    if (currentMap === "bedroom") {
      if (tileVal === 4) {
        return { type: "bed", tx, ty };
      }
      if (tileVal === 10) {
        return { type: "bedside_table", tx, ty };
      }
      if (tileVal === 11) {
        return { type: "window", tx, ty };
      }
      if (tileVal === 12) {
        return { type: "mirror", tx, ty };
      }
      if (tileVal === 13) {
        return { type: "closet", tx, ty };
      }
      if (tileVal === 14) {
        if (tx === 4) return { type: "mueble_utiles_1", tx, ty };
        return { type: "mueble_utiles_2", tx, ty };
      }
      if (tileVal === 15) {
        return { type: "chair_with_clothes", tx, ty };
      }
    }
    if (currentMap === "hallway") {
      if (tileVal === 17) return { type: "cky_room_door", tx, ty };
      if (tileVal === 18) return { type: "living_room_door", tx, ty };
      if (tileVal === 19) return { type: "moms_room_door", tx, ty };
      if (tileVal === 3) return { type: "kitchen_door", tx, ty };
    }
    if (currentMap === "empty_room") {
      if (tileVal === 26) return { type: "living_hallway_door", tx, ty };
      if (tileVal === 27) return { type: "sisters_room_door", tx, ty };
      if (tileVal === 28) return { type: "bathroom_door", tx, ty };
      if (tileVal === 36) return { type: "living_window", tx, ty };
      if (tileVal === 37) return { type: "living_table", tx, ty };
      if (tileVal === 38) return { type: "living_fireplace", tx, ty };
      if (tileVal === 39) return { type: "living_bookshelf", tx, ty };
      if (tileVal === 40) return { type: "living_cabinet", tx, ty };
      if (tileVal === 3) return { type: "street_door", tx, ty };
    }
    if (currentMap === "sisters_room") {
      if (tileVal === 29) return { type: "sisters_room_exit_door", tx, ty };
      if (tileVal === 30) return { type: "sisters_bed", tx, ty };
      if (tileVal === 31) return { type: "sisters_desk", tx, ty };
      if (tileVal === 32) return { type: "sisters_closet", tx, ty };
      if (tileVal === 33) return { type: "sisters_bookshelf", tx, ty };
      if (tileVal === 36) return { type: "sisters_window", tx, ty };
    }
    if (currentMap === "house") {
      if (tileVal === 2) return { type: "hallway_door", tx, ty };
      if (tileVal === 36) return { type: "kitchen_window", tx, ty };
      if (tileVal === 37) return { type: "kitchen_table", tx, ty };
      if (tileVal === 38) return { type: "kitchen_fireplace", tx, ty };
      if (tileVal === 47) return { type: "kitchen_fridge", tx, ty };
      if (tileVal === 48) return { type: "kitchen_stove", tx, ty };
      if (tileVal === 49) return { type: "kitchen_sink", tx, ty };
      if (tileVal === 50) return { type: "kitchen_pantry", tx, ty };
      if (tileVal === 51) return { type: "kitchen_tv", tx, ty };
      if (tileVal === 52) return { type: "kitchen_cutlery_cabinet", tx, ty };
    }
    if (currentMap === "moms_room") {
      if (tileVal === 4) return { type: "moms_bed", tx, ty };
      if (tileVal === 10) return { type: "moms_table", tx, ty };
      if (tileVal === 11) return { type: "moms_window", tx, ty };
      if (tileVal === 12) return { type: "moms_vanity", tx, ty };
      if (tileVal === 13) return { type: "moms_closet", tx, ty };
      if (tileVal === 15) return { type: "moms_chair", tx, ty };
      if (tileVal === 20) return { type: "moms_plant", tx, ty };
      if (tileVal === 2) return { type: "moms_room_exit_door", tx, ty };
    }
    if (currentMap === "bathroom") {
      if (tileVal === 41 || tileVal === 21) return { type: "toilet", tx, ty };
      if (tileVal === 42 || tileVal === 22) return { type: "sink", tx, ty };
      if (tileVal === 43 || tileVal === 23) return { type: "shower", tx, ty };
      if (tileVal === 44 || tileVal === 24) return { type: "towel_rack", tx, ty };
      if (tileVal === 25) return { type: "laundry_hamper", tx, ty };
      if (tileVal === 34 || tileVal === 2) return { type: "bathroom_exit_door", tx, ty };
    }
    if (currentMap === "street") {
      if (isBusWaitingAtDoor && tx >= 2 && tx <= 6 && ty >= 6 && ty <= 8) return { type: "school_bus", tx, ty };
      if (tileVal === 65) return { type: "bus_stop_line_4", tx, ty };
      if (tileVal === 62) return { type: "street_lamp", tx, ty };
      if (tileVal === 63) return { type: "street_tree", tx, ty };
      if (tileVal === 64) return { type: "street_trash_can", tx, ty };
      if (tileVal === 3) return { type: "house_front_door", tx, ty };
      if (tileVal === 31) return { type: "neighbor_door_1", tx, ty };
      if (tileVal === 32) return { type: "neighbor_door_2", tx, ty };
    }
    if (currentMap === "cemetery") {
      if (tileVal === 65) return { type: "bus_stop_line_4", tx, ty };
      if (tileVal === 70) return { type: "angela_pink_tomb", tx, ty };
      if (tileVal === 71 || tileVal === 72) return { type: "generic_tomb", tx, ty };
      if (tileVal === 73) return { type: "angel_statue", tx, ty };
      if (tileVal === 74) return { type: "cypress_tree", tx, ty };
      if (tileVal === 75) return { type: "mausoleum", tx, ty };
    }
    if (currentMap === "bus_interior") {
      if (tileVal === 70) return { type: "bus_driver_seat", tx, ty };
      if (tileVal === 71) return { type: "bus_seat_1", tx, ty };
      if (tileVal === 72) return { type: "bus_seat_2", tx, ty };
      if (tileVal === 73) return { type: "bus_seat_3", tx, ty };
      if (tileVal === 74) return { type: "bus_seat_4", tx, ty };
      if (tileVal === 75) return { type: "bus_seat_5", tx, ty };
      if (tileVal === 76) return { type: "bus_seat_6", tx, ty };
      if (tileVal === 77) return { type: "bus_exit_door", tx, ty };
    }
    if (currentMap === "ruins_valley") {
      if (tileVal === 110) return { type: "ruins_rune_pillar", tx, ty };
      if (tileVal === 111) return { type: "ruins_golem_altar", tx, ty };
      if (tileVal === 112) return { type: "ruins_buried_chest", tx, ty };
      if (tileVal === 113) return { type: "ruins_exit_trail", tx, ty };
      if (tileVal === 114) return { type: "ruins_monolith", tx, ty };
      if (tileVal === 115) return { type: "ruins_stone_arch", tx, ty };
    }
    if (currentMap === "shopping_mall") {
      if (tileVal === 120) return { type: "mall_boutique", tx, ty };
      if (tileVal === 121) return { type: "mall_lingerie_shop", tx, ty };
      if (tileVal === 122) return { type: "mall_fitting_mirror", tx, ty };
      if (tileVal === 123) return { type: "mall_cafe", tx, ty };
      if (tileVal === 124) return { type: "mall_fountain", tx, ty };
      if (tileVal === 125) return { type: "mall_exit_doors", tx, ty };
      if (tileVal === 126) return { type: "mall_bench", tx, ty };
      if (tileVal === 127) return { type: "mall_perfume_stand", tx, ty };
    }
    if (currentMap === "airport_terminal") {
      if (tileVal === 130) return { type: "airport_checkin", tx, ty };
      if (tileVal === 131) return { type: "airport_hotdog_stand", tx, ty };
      if (tileVal === 132) return { type: "airport_runway_window", tx, ty };
      if (tileVal === 133) return { type: "airport_seats", tx, ty };
      if (tileVal === 134) return { type: "airport_baggage", tx, ty };
      if (tileVal === 135) return { type: "airport_exit_doors", tx, ty };
    }
    if (tileVal === 91) return { type: "school_desk", tx, ty };
    if (tileVal === 92) return { type: "teacher_desk", tx, ty };
    if (tileVal === 93) return { type: "blackboard", tx, ty };
    if (tileVal === 94) return { type: "director_desk", tx, ty };
    if (tileVal === 95) return { type: "director_bookshelf", tx, ty };
    if (tileVal === 96) return { type: "teachers_table", tx, ty };
    if (tileVal === 97) return { type: "teachers_coffee", tx, ty };
    if (tileVal === 98 || tileVal === 99) return { type: "soccer_goal", tx, ty };
    if (tileVal === 100) return { type: "soccer_ball", tx, ty };
    if (tileVal === 101) return { type: "school_lockers", tx, ty };
    if (tileVal === 102) return { type: "bulletin_board", tx, ty };
    if (tileVal === 103) return { type: "urinal", tx, ty };
    if (tileVal === 104) return { type: "courtyard_bench", tx, ty };
    if (tileVal === 33) return { type: "grimoire_shelf", tx, ty };
    if (tileVal === 35) return { type: "photo_vecina", tx, ty };
    if (currentMap === "soulmate_house" && tileVal === 32) return { type: "soulmate_bathroom", tx, ty };
    if (currentMap === "plaza_principal") {
      if (tileVal === 160 || (tx >= 6 && tx <= 9 && ty >= 3 && ty <= 6)) return { type: "plaza_fountain_boss", tx, ty };
      if (tileVal === 165) return { type: "plaza_exit", tx, ty };
    }
    if (currentMap === "hospital_municipal") {
      if (tileVal === 170 || (tx >= 6 && tx <= 9 && ty >= 2 && ty <= 5)) return { type: "hospital_triage_boss", tx, ty };
      if (tileVal === 174) return { type: "hospital_exit", tx, ty };
    }
    if (currentMap === "bus_terminal") {
      if (tileVal === 180 || (tx >= 5 && tx <= 10 && ty >= 3 && ty <= 6)) return { type: "terminal_platform_boss", tx, ty };
      if (tileVal === 185) return { type: "terminal_exit", tx, ty };
    }
    // 10 Features Action Targets
    if (currentMap === "street" && ((tx >= 1 && tx <= 4 && ty >= 4 && ty <= 6) || tileVal === 66)) {
      return { type: "street_bicycle", tx, ty };
    }
    if ((currentMap === "plaza_principal" || currentMap === "street" || currentMap === "bus_terminal") && (tileVal === 131 || (tx >= 2 && tx <= 4 && ty >= 3 && ty <= 5))) {
      return { type: "street_food_cart", tx, ty };
    }
    if (currentMap === "shopping_mall" && ((tx >= 14 && tx <= 16 && ty >= 6 && ty <= 8) || tileVal === 126)) {
      return { type: "mall_claw_machine", tx, ty };
    }
    if (currentMap === "plaza_principal" && ((tx >= 11 && tx <= 14 && ty >= 2 && ty <= 4) || tileVal === 102)) {
      return { type: "plaza_notice_board", tx, ty };
    }
    if ((currentMap === "empty_room" || currentMap === "house") && ((tx >= 6 && tx <= 8 && ty >= 5 && ty <= 7) || tileVal === 21)) {
      return { type: "pet_bed", tx, ty };
    }
    if (currentMap === "bedroom" && (tx >= 4 && tx <= 7 && ty <= 2)) {
      return { type: "room_decor", tx, ty };
    }
    return null;
  };

  // Keyboard controls handler
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (targetTag === "INPUT" || targetTag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      
      // If we are in the Day 2 intro sequence, intercept keys
      if (isDay2Intro) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown" || key === "d" || key === "s") {
          e.preventDefault();
          advanceDay2Intro();
        }
        return;
      }

      // If we are in the Day 3 intro sequence, intercept keys
      if (isDay3Intro) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown" || key === "d" || key === "s") {
          e.preventDefault();
          advanceDay3Intro();
        }
        return;
      }

      // If we are in the Day 4 intro sequence, intercept keys
      if (isDay4Intro) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown" || key === "d" || key === "s") {
          e.preventDefault();
          advanceDay4Intro();
        }
        return;
      }

      // If we are in the Day 5 intro sequence, intercept keys
      if (isDay5Intro) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown" || key === "d" || key === "s") {
          e.preventDefault();
          advanceDay5Intro();
        }
        return;
      }

      // If we are in the Day 6 intro sequence, intercept keys
      if (isDay6Intro) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown" || key === "d" || key === "s") {
          e.preventDefault();
          advanceDay6Intro();
        }
        return;
      }

      // If we are in the Day 7 intro sequence, intercept keys
      if (isDay7Intro) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown" || key === "d" || key === "s") {
          e.preventDefault();
          advanceDay7Intro();
        }
        return;
      }

      // If we are in the Day 8 intro sequence, intercept keys
      if (isDay8Intro) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown" || key === "d" || key === "s") {
          e.preventDefault();
          advanceDay8Intro();
        }
        return;
      }

      // If we are in the intro sequence, intercept keys
      if (introStep !== -1) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown" || key === "d" || key === "s") {
          e.preventDefault();
          advanceIntro();
        }
        return;
      }

      // Check if any internal modal is currently open
      const anyModalOpen =
        showWardrobeModal ||
        showBedModal ||
        showOrganizerModal1 ||
        showOrganizerModal2 ||
        showNightstandModal ||
        showJacketModal ||
        showSinkModal ||
        showToiletModal ||
        showShowerModal ||
        showTowelModal ||
        showFireplaceModal ||
        showLivingWindowModal ||
        showKitchenTvModal ||
        showKitchenTableModal ||
        showKitchenWindowModal ||
        showKitchenFireplaceModal ||
        showKitchenSinkModal ||
        showFridgeModal ||
        showNakedSelfieModal ||
        showBusStopModal ||
        showExitHouseChoiceModal ||
        showSchoolBusArrivalModal ||
        showNameNeighborModal ||
        showUnknownPhoneModal ||
        showShowerChoiceModal ||
        activeDay8Battle !== null ||
        showDay8NeighborClimaxModal ||
        showDay8AlanisModal ||
        showDay8EndingModal ||
        showSoccerMinigame ||
        showSandwichMinigame ||
        showTriviaMinigame ||
        showClawMachine ||
        showBicycleRace ||
        showStreetFoodCart ||
        showNoticeBoard ||
        showRoomCustomization ||
        showPetModal;

      if (e.key === "Escape" || e.key === "Esc") {
        if (anyModalOpen) {
          e.preventDefault();
          setShowSoccerMinigame(false);
          setShowSandwichMinigame(false);
          setShowTriviaMinigame(false);
          setShowClawMachine(false);
          setShowBicycleRace(false);
          setShowStreetFoodCart(false);
          setShowNoticeBoard(false);
          setShowRoomCustomization(false);
          setShowPetModal(false);
          setShowWardrobeModal(false);
          setShowBedModal(false);
          setShowOrganizerModal1(false);
          setShowOrganizerModal2(false);
          setShowJacketModal(false);
          setShowSinkModal(false);
          setShowToiletModal(false);
          setShowShowerModal(false);
          setShowTowelModal(false);
          setShowFireplaceModal(false);
          setShowLivingWindowModal(false);
          setShowKitchenTvModal(false);
          setShowKitchenTableModal(false);
          setShowKitchenWindowModal(false);
          setShowKitchenFireplaceModal(false);
          setShowKitchenSinkModal(false);
          setShowFridgeModal(false);
          setShowNakedSelfieModal(false);
          setShowBusStopModal(false);
          setShowExitHouseChoiceModal(false);
          setShowSchoolBusArrivalModal(false);
          setShowNameNeighborModal(false);
          playSound(250, "sine", 0.1);
          return;
        }
      }

      if (anyModalOpen) {
        return;
      }

      // RPG Hotkeys: P = Celular, M = Mapa, C = Compañeros, I/J = Inventario & Diario
      if (key === "p") {
        handleOpenPhone();
        return;
      }
      if (key === "m") {
        onOpenMap();
        playSound(350, "sine", 0.15);
        return;
      }
      if (key === "c") {
        onOpenDiary();
        playSound(300, "sine", 0.15);
        return;
      }
      if (key === "i" || key === "j") {
        onOpenDiary();
        playSound(300, "sine", 0.15);
        return;
      }

      // If inventory overlay is open, ignore other inputs
      if (showInventoryOverlay) {
        return;
      }

      // Check action key (Space, Enter, or E)
      if (e.key === " " || e.key === "Enter" || key === "e") {
        e.preventDefault();
        performInteraction();
        return;
      }

      // Check Direction movements mapped to WASD, Arrows or Custom Config
      let dx = 0;
      let dy = 0;
      let nextFace: Direction = facing;

      if (key === customKeys.up.toLowerCase() || e.key === "ArrowUp") {
        dy = -1;
        nextFace = "up";
      } else if (key === customKeys.down.toLowerCase() || e.key === "ArrowDown") {
        dy = 1;
        nextFace = "down";
      } else if (key === customKeys.left.toLowerCase() || e.key === "ArrowLeft") {
        dx = -1;
        nextFace = "left";
      } else if (key === customKeys.right.toLowerCase() || e.key === "ArrowRight") {
        dx = 1;
        nextFace = "right";
      }

      if (dx !== 0 || dy !== 0) {
        // Clear mouse-walking when keyboard overrides it
        setWalkPath([]);
        setPendingInteraction(null);
        setFacing(nextFace);
        movePlayer(dx, dy, nextFace);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    playerPos, facing, currentMap, chapterStep, gameState, language, customKeys, showInventoryOverlay, introStep,
    isDay2Intro, day2IntroStep, isDay3Intro, day3IntroStep, currentDay,
    showWardrobeModal, showBedModal, showOrganizerModal1, showOrganizerModal2, showNightstandModal, showJacketModal, showSinkModal, showToiletModal,
    showShowerModal, showTowelModal, showFireplaceModal, showLivingWindowModal, showKitchenTvModal,
    showKitchenTableModal, showKitchenWindowModal, showKitchenFireplaceModal, showKitchenSinkModal, showFridgeModal, showNameNeighborModal
  ]);

  // Mom photo event trigger on kitchen exit with school uniform & water bottle
  const checkMomFirstDayPhotoEvent = (): boolean => {
    const hasWater = hasWaterBottleFromFridge || inventory.some(i => i.id === "water_bottle_full" || i.id === "water_bottle_empty" || i.id === "water_bottle");
    if (!hasTriggeredMomPhotoEvent && currentOutfit === "uniform" && hasWater) {
      setHasTriggeredMomPhotoEvent(true);
      playSound(800, "sine", 0.3);
      onTriggerDialogue(
        "Mamá",
        "¡Alto!!! te vas a ir sin que te saque la foto del primer día?",
        "Stop!!! are you going to leave without me taking your first day photo?",
        () => {
          onTriggerDialogue(
            "CKY",
            "Mándame la foto",
            "Send me the photo",
            () => {
              playSound(880, "sine", 0.4);
              const momPhoto: PhonePhoto = {
                id: "mom_first_day_photo",
                titleEs: "Foto Primer Día de Escuela",
                titleEn: "First Day of School Photo",
                descEs: "Foto tomada por Mamá en la cocina antes de salir hacia la escuela con el uniforme y la botella de agua.",
                descEn: "Photo taken by Mom in the kitchen before leaving for school with the uniform and water bottle.",
                date: "5:15 AM",
                category: "mom",
                icon: "🎒📸",
                photoType: "mom_first_day"
              };
              
              triggerNewPhoneMessage(
                "mom",
                "¡Acá tenés la foto del primer día de clases, mi amor! 📸 Saliste hermosa. ¡Avisame cuando llegues a la escuela!",
                "Here's your first day of school photo, my love! 📸 You look beautiful. Let me know when you arrive at school!",
                momPhoto
              );
              
              setTimeout(() => {
                onTriggerDialogue(
                  "Celular de CKY",
                  "🔔 ¡Mensaje nuevo de Mamá con foto adjunta! Abre tu celular para ver la conversación y guardar la foto en la Galería.",
                  "🔔 New message from Mom with photo attached! Open your phone to check it."
                );
              }, 300);
            }
          );
        }
      );
      return true;
    }
    return false;
  };

  // Actual player motion logic with collision grid checks
  const movePlayer = (dx: number, dy: number, nextFace: Direction) => {
    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;
    const grid = getGrid(currentMap);

    // Bound check
    if (nextY < 0 || nextY >= grid.length || nextX < 0 || nextX >= grid[0].length) return;

    // Solid wall or obstacle block check
    const tile = grid[nextY][nextX];
    let isSolid = false;
    if (currentMap === "bedroom") {
      if (tile !== 0 && tile !== 2) {
        isSolid = true;
      }
    } else if (currentMap === "hallway") {
      if (tile !== 0 && tile !== 17 && tile !== 18 && tile !== 19 && tile !== 3) {
        isSolid = true;
      }
    } else if (currentMap === "empty_room") {
      if (tile !== 0 && tile !== 3 && tile !== 26 && tile !== 27 && tile !== 28) {
        isSolid = true;
      }
    } else if (currentMap === "house") {
      if (tile !== 0 && tile !== 2 && tile !== 3 && tile !== 27 && tile !== 28) {
        isSolid = true;
      }
    } else if (currentMap === "bathroom") {
      if (tile !== 0 && tile !== 2 && tile !== 34) {
        isSolid = true;
      }
    } else if (currentMap === "sisters_room") {
      if (tile !== 0 && tile !== 29) {
        isSolid = true;
      }
    } else if (currentMap === "airport_terminal") {
      if (tile !== 0 && tile !== 135) {
        isSolid = true;
      }
    } else if (currentMap === "soulmate_house") {
      if (tile !== 0 && tile !== 2 && tile !== 29 && tile !== 32) {
        isSolid = true;
      }
    } else if (currentMap === "soulmate_bedroom") {
      if (tile !== 0 && tile !== 2) {
        isSolid = true;
      }
    } else {
      if (tile === 1 || tile === 6 || tile === 7 || tile === 8 || tile === 9 || tile === 60 || tile === 61 || tile === 62 || tile === 63 || tile === 64 || tile === 65) {
        isSolid = true;
      }
    }

    if (isSolid) {
      triggerBeep(120); // Collide thump sound
      return;
    }

    // Check NPC collision
    const npcs = getNPCs();
    const collisionNpc = npcs.find(n => n.x === nextX && n.y === nextY);
    if (collisionNpc) {
      triggerBeep(120);
      return;
    }

    // Perform the motion
    setPlayerPos({ x: nextX, y: nextY });
    triggerBeep(260); // Footstep beep

    // Day 8: Boss vicinity combat triggers
    if (currentDay === 8 && activeDay8Battle === null) {
      if (currentMap === "plaza_principal" && !day8PlazaDefended && nextX >= 7 && nextX <= 8 && nextY >= 4 && nextY <= 5) {
        setActiveDay8Battle("plaza");
        return;
      }
      if (currentMap === "hospital_municipal" && !day8HospitalDefended && nextX >= 7 && nextX <= 8 && nextY >= 3 && nextY <= 4) {
        setActiveDay8Battle("hospital");
        return;
      }
      if (currentMap === "bus_terminal" && !day8TerminalDefended && nextX >= 6 && nextX <= 9 && nextY >= 4 && nextY <= 5) {
        setActiveDay8Battle("terminal");
        return;
      }
      if (currentMap === "shopping_mall" && !day8MallDefended && nextX >= 8 && nextX <= 9 && nextY >= 4 && nextY <= 5) {
        setActiveDay8Battle("mall");
        return;
      }
    }

    // Check map transition triggers
    if (currentMap === "soulmate_house") {
      if (tile === 2) {
        if (currentDay === 7 && day7SoulmateChangedToLingerie && !day7SoulmateChangedBack) {
          onTriggerDialogue(
            "CKY (¡Pudor Total!)",
            "¡No puedo salir a la calle en ropa interior roja! Tengo que ir al baño de arriba a ponerme mi ropa común primero.",
            "I can't go out into the street in red lingerie! I must go to the bathroom up there to put on my casual clothes first."
          );
          return;
        }
        transitionToMap("street", { x: 16, y: 4 });
        return;
      } else if (tile === 32) {
        handleSoulmateBathroomAction();
        return;
      } else if (tile === 29) {
        if (!day6SoulmateKissDone) {
          onTriggerDialogue(
            "CKY",
            "La puerta de su habitación está cerrada. Primero debo hablar con él en el living.",
            "His bedroom door is closed. I must speak with him in the living room first."
          );
        } else {
          transitionToMap("soulmate_bedroom", { x: 2, y: 6 });
        }
        return;
      }
    } else if (currentMap === "soulmate_bedroom") {
      if (tile === 2) {
        transitionToMap("soulmate_house", { x: 8, y: 1 });
        return;
      }
    } else if (currentMap === "street" && (tile === 32 || (nextX === 16 && nextY === 3))) {
      if (currentDay === 6 && day6KissLessonDone) {
        transitionToMap("soulmate_house", { x: 4, y: 6 });
      } else if (currentDay === 6 && day6AlanisBedroomArgumentDone) {
        onTriggerDialogue(
          "CKY",
          "Es la casa de mi alma gemela... pero todavía estoy alterada por la discusión con Alanis, despeinada y sin preparar. ¡Necesito dormir la siesta, ducharme y alistarme primero!",
          "It's my soulmate's house... but I'm still shaken by the argument with Alanis, messy and unprepared. I need a nap, a shower and to get ready first!"
        );
      } else if (currentDay === 7 && day7LingeriePacked) {
        transitionToMap("soulmate_house", { x: 4, y: 6 });
      } else if (currentDay === 7 && day7AlanisBedroomArgumentDone && !day7ShowerDone) {
        onTriggerDialogue(
          "CKY",
          "¡No puedo entrar a la casa de mi gemelo llena de hollín y olor a azufre del sótano! Primero me tengo que bañar en casa.",
          "I can't enter my soulmate's house covered in soot and sulfur from the basement! I need to shower at home first."
        );
      } else if (currentDay === 7 && day7AlanisBedroomArgumentDone && !day7LingeriePacked) {
        onTriggerDialogue(
          "CKY",
          "Tengo que ir a mi habitación a ponerme ropa común y guardar el conjunto de lencería roja en la mochila.",
          "I need to go to my room to put on casual clothes and pack the red lingerie set into my backpack."
        );
      } else if (currentDay === 7 && !day7AlanisBedroomArgumentDone) {
        onTriggerDialogue(
          "CKY",
          "Todavía no tengo motivos para ir a la casa de mi gemelo. Tengo que volver a casa primero.",
          "I have no reason to visit my soulmate yet. I should return home first."
        );
      } else {
        onTriggerDialogue(
          "CKY",
          "Es la casa de al lado. La puerta principal está cerrada con llave.",
          "It's the house next door. The front door is locked."
        );
      }
      return;
    }
    if (tile === 2 && currentMap === "bedroom") {
      transitionToMap("hallway", { x: 3, y: 1 });
    } else if (tile === 17 && currentMap === "hallway") {
      transitionToMap("bedroom", { x: 2, y: 6 });
    } else if (tile === 3 && currentMap === "hallway") {
      transitionToMap("house", { x: 1, y: 3 });
    } else if (tile === 18 && currentMap === "hallway") {
      transitionToMap("empty_room", { x: 8, y: 3 });
    } else if (tile === 19 && currentMap === "hallway") {
      onTriggerDialogue(
        "Habitación de Mamá",
        "Puerta a la habitación de la madre. 'Mamá está en la cocina preparando el desayuno', piensas.",
        "Mom's room. 'She's in the kitchen', you think."
      );
    } else if (tile === 26 && currentMap === "empty_room") {
      // Puerta al pasillo en (9, 3)
      transitionToMap("hallway", { x: 1, y: 2 });
    } else if (tile === 27 && (currentMap === "empty_room" || currentMap === "house")) {
      // Puerta a la habitación de la hermana
      transitionToMap("sisters_room", { x: 3, y: 1 });
    } else if (tile === 28 && (currentMap === "empty_room" || currentMap === "house")) {
      // Entrada al baño
      transitionToMap("bathroom", { x: 3, y: 1 });
    } else if ((tile === 34 || tile === 2) && currentMap === "bathroom") {
      // Salida del baño a la habitación principal
      handleBathroomExit();
    } else if (tile === 29 && currentMap === "sisters_room") {
      // Salida de la habitación de la hermana a la habitación principal
      transitionToMap("empty_room", { x: 1, y: 6 });
    } else if (tile === 2 && currentMap === "house") {
      // Puerta al pasillo en (5, 10)
      if (checkMomFirstDayPhotoEvent()) {
        setPlayerPos(playerPos);
      } else {
        transitionToMap("hallway", { x: 8, y: 2 });
      }
    } else if (tile === 3 && (currentMap === "empty_room" || currentMap === "house")) {
      if (currentMap === "house" && checkMomFirstDayPhotoEvent()) {
        setPlayerPos(playerPos);
      } else if (currentDay === 8) {
        if (currentOutfit !== "casual") {
          onTriggerDialogue(
            "CKY",
            "Tengo que ponerme ropa casual cómoda en el ropero de mi habitación antes de salir a la calle a pelear.",
            "I must put on comfortable casual clothes in my bedroom wardrobe before heading out to fight."
          );
        } else {
          transitionToMap("street", { x: 4, y: 4 });
          if (!day8StreetSoulmateMet) {
            setTimeout(() => {
              triggerDay8StreetSoulmateCutscene();
            }, 300);
          }
        }
      } else {
        setUniformErrorMsg(null);
        setShowExitHouseChoiceModal(true);
      }
    } else if (tile === 3 && currentMap === "street") {
      transitionToMap("empty_room", { x: 4, y: 1 });
    } else if (tile === 5 && currentMap === "street") {
      if (chapterStep === 3) {
        startCombatState();
      }
    } else if (tile === 5 && currentMap === "limbo") {
      transitionToMap("street", { x: 12, y: 5 });
    } else if (currentMap === "airport_terminal" && tile === 135) {
      // Exit airport terminal back to street
      transitionToMap("street", { x: 14, y: 6 });
      return;
    } else if (currentMap === "plaza_principal" && (tile === 165 || nextY >= 9)) {
      transitionToMap("street", { x: 14, y: 5 });
      return;
    } else if (currentMap === "hospital_municipal" && (tile === 174 || nextY >= 9)) {
      transitionToMap("street", { x: 14, y: 5 });
      return;
    } else if (currentMap === "bus_terminal" && (tile === 185 || nextY >= 9)) {
      transitionToMap("street", { x: 14, y: 5 });
      return;
    } else if (currentMap === "shopping_mall" && (tile === 125 || nextY >= 9)) {
      transitionToMap("street", { x: 14, y: 5 });
      return;
    } else if (currentMap === "street" && nextX >= 15 && currentDay === 5 && day5NeighborRaceChallenge) {
      // Running to Airport during race!
      transitionToMap("airport_terminal", { x: 9, y: 8 });
      onTriggerDialogue(
        "CKY (Llegando al Aeropuerto)",
        "¡¡Uff, llegué al Aeropuerto corriendo a todo vapor!! ¡Qué cansancio! Vamos a buscar a la vecina en el puesto de panchos de Don Pepe.",
        "Phew, arrived at the Airport running full steam!! So exhausted! Let's find the neighbor at Don Pepe's hot dog stand."
      );
      return;
    } else {
      checkSchoolMapTransitions(tile, currentMap);
    }
  };

  const handleGamepadMove = (dir: Direction) => {
    soundEngine.unlockAudio();
    setWalkPath([]);
    setPendingInteraction(null);
    let dx = 0;
    let dy = 0;
    if (dir === "up") dy = -1;
    if (dir === "down") dy = 1;
    if (dir === "left") dx = -1;
    if (dir === "right") dx = 1;
    setFacing(dir);
    movePlayer(dx, dy, dir);
  };

  const handleGamepadAction = () => {
    soundEngine.unlockAudio();
    performInteraction();
  };

  const handleGamepadCancelOrBackpack = () => {
    soundEngine.unlockAudio();
    if (onOpenDiary) {
      playSound(300, "sine", 0.15);
      onOpenDiary();
    }
  };

  const handleTriggerSpiritBanter = useCallback(() => {
    soundEngine.unlockAudio();
    soundEngine.playSfx("sparkle");
    unlockAchievement("ach_chachara_angela", onShowNotification, addXP);
    const steps = getRandomBanter(currentMap, currentOutfit, propStats);
    if (!steps || steps.length === 0) return;

    let idx = 0;
    const playNext = () => {
      if (idx >= steps.length) return;
      const cur = steps[idx];
      idx++;
      onTriggerDialogue(cur.speaker, cur.textEs, cur.textEn, playNext);
    };
    playNext();
  }, [currentMap, currentOutfit, propStats, onShowNotification, addXP, onTriggerDialogue]);

  const checkSchoolMapTransitions = (tile: number, map: string) => {
    if (map === "school_courtyard") {
      if (tile === 81) {
        transitionToMap("school_hallway", { x: 2, y: 7 });
      } else if (tile === 77 || playerPos.y >= 8) {
        transitionToMap("street", { x: 3, y: 7 });
        onTriggerDialogue(
          "Regreso a la Calle",
          "Salís de la escuela y regresás a la calle principal de tu casa.",
          "You leave school and head back to the main street outside your house."
        );
      }
    } else if (map === "school_hallway") {
      if (tile === 81) {
        transitionToMap("school_courtyard", { x: 7, y: 1 });
      } else if (tile === 82) {
        transitionToMap("classroom_1", { x: 4, y: 6 });
      } else if (tile === 83) {
        transitionToMap("classroom_2", { x: 4, y: 6 });
      } else if (tile === 84) {
        transitionToMap("classroom_3", { x: 4, y: 6 });
      } else if (tile === 85) {
        transitionToMap("classroom_4", { x: 4, y: 6 });
      } else if (tile === 86) {
        transitionToMap("classroom_5", { x: 4, y: 6 });
      } else if (tile === 87) {
        transitionToMap("director_office", { x: 4, y: 6 });
      } else if (tile === 88) {
        transitionToMap("teachers_room", { x: 4, y: 6 });
      } else if (tile === 89) {
        transitionToMap("bathroom_girls", { x: 3, y: 4 });
      } else if (tile === 90) {
        transitionToMap("bathroom_boys", { x: 3, y: 4 });
      } else if (tile === 140) {
        transitionToMap("school_basement", { x: 2, y: 1 });
      }
    } else if (map === "school_basement") {
      if (tile === 140) {
        transitionToMap("school_hallway", { x: 16, y: 2 });
      } else if (tile === 146) {
        if (day7BasementGeneratorDisabled) {
          transitionToMap("school_laboratory", { x: 6, y: 8 });
        } else {
          playSound(250, "sawtooth", 0.4);
          onTriggerDialogue(
            "Puerta Blindada del Laboratorio",
            "La puerta de acero está sellada por un campo de fuerza violeta alimentado por el Generador Arcano del Limbo al final del sótano.",
            "The steel door is sealed by a violet forcefield powered by the Arcane Limbo Generator at the end of the basement."
          );
        }
      }
    } else if (map === "school_laboratory") {
      if (tile === 146) {
        transitionToMap("school_basement", { x: 16, y: 6 });
      }
    } else if (
      map === "classroom_1" ||
      map === "classroom_2" ||
      map === "classroom_3" ||
      map === "classroom_4" ||
      map === "classroom_5" ||
      map === "director_office" ||
      map === "teachers_room" ||
      map === "bathroom_girls" ||
      map === "bathroom_boys"
    ) {
      if (tile === 81) {
        let returnX = 2;
        if (map === "classroom_1") returnX = 1;
        else if (map === "classroom_2") returnX = 4;
        else if (map === "classroom_3") returnX = 7;
        else if (map === "classroom_4") returnX = 10;
        else if (map === "classroom_5") returnX = 13;
        else if (map === "director_office") returnX = 16;
        else if (map === "teachers_room") returnX = 17;
        else if (map === "bathroom_girls") returnX = 2;
        else if (map === "bathroom_boys") returnX = 8;
        transitionToMap("school_hallway", { x: returnX, y: 1 });
      }
    }
  };

  const startHistoryClassSequence = () => {
    playSound(587.33, "sine", 0.6); // Bell chime 🔔
    setPlayerPos({ x: 3, y: 3 }); // Sit at desk right next to Jaz (Jaz is at x: 2, y: 3)
    setFacing("up");

    const hasBag = hasBackpack || inventory.some((i) => i.id === "backpack_bag");
    const hasNotebook = inventory.some((i) => i.id === "backpack_notebook");

    if (!hasBag || !hasNotebook) {
      playSound(200, "sawtooth", 0.5);
      const missingReason = !hasBag
        ? "¡No trajiste la Mochila al colegio!"
        : "¡Te olvidaste los Libros y Cuadernos de estudio!";

      onTriggerDialogue(
        "Profesor de Historia (Prof. Silva)",
        `¡Un momento CKY! ${missingReason} ¡Es una falta grave presentarse a clase sin tus materiales! Marchando inmediatamente a la Oficina del Director.`,
        `Hold on CKY! ${missingReason} You can't attend class without your study materials! Go to the Principal's Office immediately.`,
        () => {
          transitionToMap("director_office", { x: 4, y: 3 });
          setFacing("up");
          playSound(300, "triangle", 0.5);

          setTimeout(() => {
            onTriggerDialogue(
              "Director de la Escuela (Prof. Quiroga)",
              "CKY, venir al colegio sin la mochila o sin los libros es inaceptable. Por hoy quedás suspendida y perdés todo el día de clases. Te vas derecho para tu casa a buscar tus cosas.",
              "CKY, coming to school without your backpack or books is unacceptable. You are suspended for today and lose the school day. Go straight home.",
              () => {
                advanceTime(360); // Advance 6 hours - lose the day!
                advanceClassStep(6); // Step 6 = back home
                transitionToMap("house", { x: 3, y: 5 });
                onTriggerDialogue(
                  "Mamá",
                  "¡CKY! ¿Qué hacés en casa a esta hora? Me llamaron de la escuela porque fuiste sin la mochila/libros y perdiste todo el día de clases. ¡Mañana acordate de llevar todo antes de salir!",
                  "CKY! Why are you home? The school called because you forgot your backpack/books and lost the day! Don't forget tomorrow!"
                );
              }
            );
          }, 300);
        }
      );
      return;
    }

    onTriggerDialogue(
      "Jaz",
      "¡Ay qué bueno que te sentaste a mi lado CKY! Sos mi mejor amiga del mundo mundial. Sacá el cuaderno de Historia.",
      "So glad you sat next to me CKY! You're my best friend in the whole world. Get your History notebook out.",
      () => {
        playSound(350, "triangle", 0.3);
        onTriggerDialogue(
          "Profesor de Historia (Prof. Silva)",
          "¡Silencio en el aula todos! Abran el libro de Historia Argentina en la página 45. Hoy estudiaremos la Revolución de Mayo de 1810.",
          "Quiet in class everyone! Open History books to page 45. Today we study the May Revolution of 1810.",
          () => {
            onTriggerDialogue(
              "Juan",
              "Profesor, ¿los sucesos de la Semana de Mayo entran en el examen trimestral?",
              "Teacher, are the May Week events on the quarterly exam?",
              () => {
                onTriggerDialogue(
                  "Nico (susurrando)",
                  "(pssss... CKY, mirá la caricatura que le hice al profe Silva en mi borrador...)",
                  "(pssss... CKY, look at this caricature of prof Silva I drew in my draft...)",
                  () => {
                    onTriggerDialogue(
                      "Mateo",
                      "¡Ojalá la clase pase rápido para salir al patio a jugar al fútbol con la pelota!",
                      "Hope class goes fast so we can go out to the yard to play soccer with the ball!",
                      () => {
                        // Fast forward time
                        playSound(440, "sine", 0.5);
                        advanceTime(45);
                        addXP(20);
                        onTriggerDialogue(
                          "Reloj del Aula",
                          "⏳ Transcurren 45 minutos de explicaciones de Historia, apuntes, preguntas de Juan y risas disimuladas... (+45 min, +20 XP)",
                          "⏳ 45 minutes of history explanations, notes, questions and covert laughter pass by... (+45 min, +20 XP)",
                          () => {
                            playSound(880, "sine", 0.8); // School recess bell! 🔔
                            onTriggerDialogue(
                              "Timbre Escolar",
                              "🔔 ¡RINNNNNGGGGGG! ¡Suena el timbre fuerte que anuncia el final de la primera clase y el comienzo del RECREO!",
                              "🔔 RINNNNNGGGGGG! The loud school bell rings signaling the end of class and start of RECESS!",
                              () => {
                                onTriggerDialogue(
                                  "Profesor de Historia (Prof. Silva)",
                                  "Bueno chicos, dejamos acá por hoy. Guarden sus cosas y salgan al patio a disfrutar del recreo.",
                                  "Well class, we stop here for today. Pack your things and head out to the yard for recess.",
                                  () => {
                                    onTriggerDialogue(
                                      "Jaz",
                                      "¡Vamos volando al patio CKY! Todos nuestros amigos están afuera.",
                                      "Let's hurry to the courtyard CKY! All our friends are outside.",
                                      () => {
                                        advanceClassStep(1);
                                        transitionToMap("school_courtyard", { x: 7, y: 7 });
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  // Perform dialog triggers, bed sleeping, or search checks
    const triggerDay6BathroomCabalSequence = () => {
    if (day6BathroomDiscussionDone) return;
    playSound(450, "sine", 0.4);
    onTriggerDialogue(
      "CKY",
      "¡Uff, cerremos la puerta con traba! ¡No se puede respirar ahí afuera! ¡Compañeros, profesores y la preceptora me trataron con un odio tremendo y parecían marionetas agresivas! ¿Qué está pasando?!",
      "Phew, lock the door! You can't breathe out there! Classmates, teachers, and proctor treated me with terrible hatred and looked like aggressive puppets! What's happening?!",
      () => {
        onTriggerDialogue(
          soulmateInfo?.name || "Alma Gemela",
          "Che, estuve chequeando la energía del colegio... Los chicos y los profes no tienen la culpa, posta. Tienen un bicho oscuro pegado en la nuca que les maneja la cabeza como si fueran marionetas. Los están controlando desde afuera.",
          "Hey, I checked out the school's energy... The kids and teachers aren't to blame, for real. They have a dark parasite stuck to their neck running their brains like puppets. They're being controlled from outside.",
          () => {
            onTriggerDialogue(
              "W (Orbe Guardián)",
              "Confirmo la firma espectral oscura: pertenece inequívocamente a la Señora Vecina. Ha sembrado espíritus parásitos en cada alumno y docente de la institución educativa para amplificar el odio y la hostilidad contra la Heredera.",
              "I confirm the dark spectral signature: it unequivocally belongs to the Neighbor. She planted parasitic spirits in each student and teacher to amplify hatred and hostility against the Heiress.",
              () => {
                onTriggerDialogue(
                  "Ángela (Espíritu)",
                  "¡Esa vieja amargada nos la quiere pudrir usando a todo el colegio de títeres! Pero no se va a salir con la suya. ¡Miren por la ventana hacia el patio!",
                  "That bitter old witch wants to ruin us using the whole school as puppets! But she won't get away with it. Look out the window towards the courtyard!",
                  () => {
                    onTriggerDialogue(
                      soulmateInfo?.name || "Alma Gemela",
                      "¡Uff, miren a Mateo en la cancha de fútbol! Está re poseído, tirando pelotazos con fuego negro y los ojos prendidos fuego. Hay que ir a frenarlo ya.",
                      "Whoa, look at Mateo on the soccer pitch! He's totally possessed, blasting balls with black fire and flaming eyes. We gotta stop him right now.",
                      () => {
                        onTriggerDialogue(
                          "CKY",
                          "¡Vamos al patio al toque a rescatar a Mateo y cortar esa energía oscura!",
                          "Let's head straight to the courtyard to rescue Mateo and cut off that dark energy!",
                          () => {
                            setDay6BathroomDiscussionDone(true);
                            localStorage.setItem("cky_day6_bathroom_done", "true");
                            unlockDiaryEntry("chapter_06_girls_bathroom_cabal");
                            addXP(90);
                            playSound(660, "triangle", 0.5);
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  const checkDay6InvestigationsComplete = (
    inv1 = day6Investigation1Classroom,
    inv2 = day6Investigation2Teachers,
    inv3 = day6Investigation3Hallway
  ) => {
    if (inv1 && inv2 && inv3) {
      setTimeout(() => {
        playSound(880, "sine", 0.6);
        onTriggerDialogue(
          soulmateInfo?.name || "Alma Gemela",
          "¡CKY! ¡Viste que limpiamos los tres focos turbios de la escuela?! ¡Toda la mugre oscura del Limbo salió rajando del edificio y se fue directo al patio!",
          "CKY! See how we cleaned the three murky spots at school?! All that dark Limbo grime bolted out of the building and headed straight for the courtyard!",
          () => {
            onTriggerDialogue(
              "Ángela (Espíritu)",
              "¡Está poseyendo a Mateo en la cancha de fútbol del patio (school_courtyard)! ¡El pibe está pateando balones de fuego negro y gritando como poseído! ¡Vamos ya mismo al patio a salvarlo!",
              "It's possessing Mateo on the soccer pitch in the courtyard! He's kicking black flame balls and screaming like possessed! Let's go to the courtyard right now to save him!",
              () => {
                onTriggerDialogue(
                  "W (Orbe Guardián)",
                  "Preparad vuestras tácticas sagradas. Es el espíritu de combate más violento enviado por la Vecina. Derrotarlo liberará a Mateo y aniquilará la plaga por completo.",
                  "Prepare your sacred tactics. It's the Neighbor's most violent combat spirit. Defeating it will free Mateo and annihilate the plague completely.",
                  () => {
                    unlockDiaryEntry("chapter_06_three_school_investigations");
                    addXP(150);
                  }
                );
              }
            );
          }
        );
      }, 500);
    }
  };

  // Day 6: Alanis Bedroom Forced Kiss Argument Cutscene
  const triggerDay6ReturnHomeConfession = () => {
    playSound(450, "sine", 0.4);
    onTriggerDialogue(
      "CKY (Entrando a su Habitación - Desahogo Sincero)",
      "Uff... por fin de vuelta en casa. Chicos, no doy más. Necesitaba estar acá con ustedes para hablar... La verdad, no me siento nada bien con mi 'alma gemela'.",
      "Phew... finally back home. Guys, I can't take it anymore. I needed to be here with you to talk... Honestly, I don't feel good at all with my 'soulmate'.",
      () => {
        onTriggerDialogue(
          "Ángela (Espíritu - Flotando Intrigada)",
          "¡¿Qué pasó CKY?! ¡Contá todo con lujo de detalles! ¿Qué onda el beso? ¿Se te trabaron los dientes o el pibe besa como un freezer cósmico?",
          "What happened CKY?! Spill all the juicy details! How was the kiss? Did your teeth bump or does the guy kiss like a cosmic freezer?",
          () => {
            onTriggerDialogue(
              "CKY (Sentándose en la Cama - Confesión Emocional)",
              "Fue horrible la sensación de tener a Alanis y al cosmos obligándonos. Él estuvo frío, distante y súper seco. Dijo que no le gusta que decidan por nuestras vidas y que solo lo hacía por el pacto. El beso fue tenso, cargado de energía rara... No hay ninguna química, solo una presión insoportable impuesta por el destino.",
              "It was horrible feeling Alanis and the cosmos forcing us. He was cold, distant, and completely dry. He said he hates having our lives decided for us and only did it for the pact. The kiss was tense, charged with weird energy... There is no chemistry, just unbearable pressure imposed by destiny.",
              () => {
                onTriggerDialogue(
                  "CKY (Voz Baja y Mirada Inquieta - Revelación de la Foto)",
                  "Pero eso no es lo más turbio... En la mesita de noche de su habitación vi un portarretratos reluciente. ¡Había una foto de ÉL y la VECINA sonriendo y abrazados como viejos amigos inseparables en el pasado!",
                  "But that's not the creepiest part... On his nightstand I saw a shiny frame. There was a photo of HIM and the NEIGHBOR smiling and embracing like inseparable old friends in the past!",
                  () => {
                    playSound(320, "sawtooth", 0.5);
                    onTriggerDialogue(
                      "Ángela (Espíritu - Shock Total y Gestos Exagerados)",
                      "¡¡¡PARÁ, PARÁ, PARÁ UN CAMIÓN DE BOMBEROS!!! 🚒 ¡¿Una foto abrazado y sonriendo de oreja a oreja con la vieja chusma y siniestra de la Vecina?! ¡¡Mirá vos al santito del Limbo!! ¡¿Qué onda?! ¿Eran novios? ¿Eran cómplices? ¡Esto huele a gato encerrado interdimensional! ¡No podemos confiar ciegamente en nadie, CKY!",
                      "HOLD ON, HOLD THE PHONE!!! 🚒 A photo embracing and smiling ear-to-ear with the creepy gossiping Neighbor?! Look at Mr. Holy Limbo!! What's the deal?! Were they dating? Were they accomplices? This smells like a cosmic setup! We can't blindly trust anyone, CKY!",
                      () => {
                        playSound(520, "sine", 0.4);
                        onTriggerDialogue(
                          "W (Orbe Celestial - Tono Solemne y Analítico)",
                          "Calma, nobles amigas. En las crónicas cósmicas de las Eras Antiguas, los hilos de luz y sombra compartieron origen antes de la gran escisión. Es posible que el Alma Gemela y la entidad de la Vecina hayan pertenecido al mismo círculo celestial antes de que ella fuera corrompida por la oscuridad del Limbo. No obstante, la precaución es ahora nuestra mayor virtud.",
                          "Peace, noble companions. In the ancient cosmic chronicles, threads of light and shadow shared origins before the great schism. It is possible the Soulmate and the Neighbor entity belonged to the same celestial circle before she was corrupted by Limbo's dark ambition. Nevertheless, caution is now our greatest virtue.",
                          () => {
                            playSound(650, "sine", 0.5);
                            onTriggerDialogue(
                              "CKY (Entregándole el Grimorio a W)",
                              "Tenés razón W. Miren, antes de irme él me dio esto: es el 'Grimorio de las Sombras Escolares'. Dice que acá están todas las debilidades y nombres de los espíritus que tienen poseídos a Jaz, Nico, Juan, Abril y a los profesores. W, vos que tenés la sabiduría de los sellos ancestrales... ¿te podés quedar con el libro para investigarlo y descifrarlo a fondo esta noche?",
                              "You're right W. Look, before leaving he gave me this: it's the 'Grimoire of School Shadows'. He said all the weaknesses and names of the spirits possessing Jaz, Nico, Juan, Abril, and the teachers are in here. W, since you possess the wisdom of ancient seals... can you keep the book to investigate and decipher it thoroughly tonight?",
                              () => {
                                playSound(800, "sine", 0.6);
                                onTriggerDialogue(
                                  "W (Envuelto en un Resplandor Dorado de Lealtad)",
                                  "Será mi más alto honor y sagrada tarea, noble Heredera CKY. Durante todas las horas nocturnas canalizaré el fuego astral para desentrañar cada runa, cada debilidad elemental y cada fórmula de exorcismo oculta en sus páginas. Para cuando despierte el sol, tendremos un mapa táctico perfecto para salvar la escuela.",
                                  "It shall be my highest honor and sacred duty, noble Heiress CKY. Throughout the nocturnal hours I shall channel astral fire to unravel every rune, elemental weakness, and exorcism formula hidden within its pages. By sunrise, we shall possess a flawless tactical blueprint to save the school.",
                                  () => {
                                    onTriggerDialogue(
                                      "Ángela (Espíritu - Sonrisa Cálida y Protectora)",
                                      "¡Bien ahí, equipo de elite! Que la toalla sabia trabaje el intelecto mientras nosotras descansamos. CKY, te bancaste de todo hoy: la sombra del cuarto, el viaje en el bondi maldito, el duelo contra Mateo poseído y una cita obligada por los dioses. ¡A ponerse el piyama de seda y a dormir que te lo ganaste con creces!",
                                      "Nice one, elite squad! Let the wise towel work the intellect while we rest up. CKY, you braved everything today: the bedroom shadow, the cursed bus ride, the duel against possessed Mateo, and a god-imposed date. Put on your silk pajamas and sleep—you earned it ten times over!",
                                      () => {
                                        setDay6ConfessionDone(true);
                                        localStorage.setItem("cky_day6_confession_done", "true");
                                        addXP(100);
                                        playSound(700, "sine", 0.4);
                                        onTriggerDialogue(
                                          "CKY",
                                          "¡Listo! Le entregué el Grimorio a W para que lo investigue. Ahora a cambiarme al piyama de seda e ir a mi cama a descansar.",
                                          "Done! I gave the Grimoire to W to research. Now to change into silk pajamas and head to my bed to rest."
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  const triggerDay6AlanisBedroomCutscene = () => {
    playSound(680, "sine", 0.5);
    onTriggerDialogue(
      "Alanis (Manifestación Divina)",
      "Ángela, W, retírense al plano etéreo. Debo hablar a solas con la Heredera.",
      "Angela, W, withdraw to the ethereal plane. I must speak alone with the Lady Heir.",
      () => {
        onTriggerDialogue(
          "Ángela (Espíritu)",
          "¡Apa! Se pudrió todo con la jefa celestial... Bueno CKY, te dejamos a solas con la rubia misteriosa. ¡No dejes que te prepotee!",
          "Whoa! Things got serious with the celestial boss... Alright CKY, leaving you alone with the mystery blonde. Don't let her boss you around!",
          () => {
            onTriggerDialogue(
              "Alanis (Mirada Severa e Inflexible)",
              "CKY, escucha con atención. La red de la Vecina es más profunda de lo que imaginas. Has liberado a Mateo, pero el resto de los alumnos, docentes y el pueblo siguen bajo su posesión oscura. Debes dirigirte de inmediato a la casa de tu Alma Gemela y despertar su cuerpo físico sellando la comunión del linaje mediante un beso en los labios.",
              "CKY, listen carefully. The Neighbor's web is deeper than you imagine. You freed Mateo, but the rest of the students, teachers, and town remain under dark possession. You must go immediately to your Soulmate's house and awaken his physical body by sealing the lineage communion with a kiss on the lips.",
              () => {
                onTriggerDialogue(
                  "CKY (Discusión Furia)",
                  "¡¿Quéee?! ¡¿Estás loca de la cabeza, Alanis?! ¡¿Quién te creés que sos para obligarme a chapar con alguien que ni conozco y que recién apareció hoy?! ¡Ni en pedo, yo elijo a quién besar y cuándo! ¡Mi primer beso no es un trámite para tus profecías cósmicas!",
                  "Whaaat?! Are you insane, Alanis?! Who do you think you are to force me to kiss someone I don't even know and who just showed up today?! No way in hell, I choose who to kiss and when! My first kiss isn't paperwork for your cosmic prophecies!",
                  () => {
                    onTriggerDialogue(
                      "Alanis (Resplandor Celestial Inflexible)",
                      "No es una opción ni un debate mundano, Heredera. Su cuerpo físico yace en letargo dimensional; sin el beso de comunión del linaje, su alma colapsará en el Limbo y las sombras de la Vecina consumirán este pueblo. Harás lo que el destino manda.",
                      "This is neither an option nor a mundane debate, Lady Heir. His physical body lies in dimensional slumber; without the lineage communion kiss, his soul will collapse in Limbo and the Neighbor's shadows will consume this town. You will do what destiny commands.",
                      () => {
                        onTriggerDialogue(
                          "CKY (Resignada con Bronca)",
                          "¡Sos una tirana cósmica insoportable! Odio que me manejes la vida... voy a ir porque no voy a dejar morir a un pibe inocente ni al pueblo, ¡pero que te quede claro que lo hago por la gente, no por tus órdenes!",
                          "You're an unbearable cosmic tyrant! I hate having my life dictated... I'll go because I won't let an innocent guy or the town die, but make no mistake: I do this for the people, not your orders!",
                          () => {
                            setDay6AlanisBedroomArgumentDone(true);
                            localStorage.setItem("cky_day6_alanis_arg_done", "true");
                            unlockDiaryEntry("chapter_06_alanis_forced_kiss_argument");
                            playSound(440, "triangle", 0.4);
                            
                            // W and Angela re-enter
                            setTimeout(() => {
                              onTriggerDialogue(
                                "W (Orbe Guardián)",
                                "Hemos regresado, Señora Heredera. Percibimos una intensa perturbación astral en la habitación.",
                                "We have returned, Lady Heir. We perceived an intense astral disturbance in the room.",
                                () => {
                                  onTriggerDialogue(
                                    "CKY",
                                    "¡No van a creer la locura que me acaba de exigir! ¡Me obligó a ir a la casa del gemelo a darle un beso en la boca para despertar su cuerpo físico!",
                                    "You won't believe the madness she demanded! She forced me to go to the soulmate's house to kiss him on the mouth to wake his physical body!",
                                    () => {
                                      onTriggerDialogue(
                                        "Ángela (Espíritu - Risa y Comentario Picante)",
                                        "¡¡JAJAJAJAJAJA!! ¡¿Te mandaron a chaparte a tu gemelo por orden divina?! ¡Pará CKY, el pibe es un bombón cósmico, no te hagas la víctima que te sacaste la lotería! ¡Ojalá a mí un ser celestial me obligara a comerle la boca a un pibe lindo en vez de flotar como un fantasma!",
                                        "HAHAHAHAHA!! You got ordered by divine decree to make out with your soulmate?! Hold on CKY, the guy is cosmic eye candy, don't play the victim, you hit the jackpot! I wish a celestial being ordered me to make out with a handsome guy instead of floating like a ghost!",
                                        () => {
                                          onTriggerDialogue(
                                            "CKY",
                                            "¡Basta, me explota la cabeza! Estoy saturada de estrés y emociones. Antes de hacer cualquier locura me voy a dormir una siesta en mi cama. Después veo cómo encaro esto.",
                                            "Enough, my head is exploding! I'm overloaded with stress and emotions. Before doing anything crazy I'm taking a nap in my bed. I'll figure this out after.",
                                            () => {
                                              setDay6DebateDone(true);
                                              localStorage.setItem("cky_day6_debate_done", "true");
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }, 300);
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  const triggerDay7AlanisBedroomCutscene = () => {
    playSound(520, "sine", 0.6);
    onTriggerDialogue(
      "Resplandor Sagrado de Alanis",
      "⚡ Un destello dorado celestial inunda la habitación. Los vientos del cosmos giran y la figura suprema de Alanis se materializa ante vos con su mirada severa e imponente.",
      "⚡ A celestial golden flare fills the room. Cosmic winds swirl and Alanis manifests before you with an imposing gaze.",
      () => {
        onTriggerDialogue(
          "Alanis (Espíritu Guía Supremo)",
          "Heredera CKY. Has frustrado el experimento venenoso del laboratorio subterráneo, pero la amenaza de la Vecina se encuentra en su cúspide más peligrosa. Debes regresar de inmediato a la morada de tu alma gemela.",
          "Heir CKY. You thwarted the poisonous experiment, but the Neighbor's threat is at its peak. You must immediately return to your soulmate's dwelling.",
          () => {
            onTriggerDialogue(
              "Alanis (Mandato Ineludible)",
              "Y esta vez no irás con el uniforme escolar. Debes asearte, vestir tu ropa común y llevar en el fondo de tu mochila el Conjunto de Lencería Sexy Roja de encaje que adquiriste el sábado.",
              "And this time you shall not go in uniform. You must cleanse yourself, put on casual clothes, and pack the Sexy Red Lace Lingerie set you bought on Saturday into your backpack.",
              () => {
                onTriggerDialogue(
                  "CKY (Indignación Total)",
                  "¡¿QUÉ?! ¡¿Otra vez vos con tus órdenes delirantes?! ¡Apenas salí viva de un sótano infectado de sombras y ahora me exigís que vaya a la casa de mi gemelo con un conjunto de ropa interior roja en la mochila! ¡¿Qué te pensás que soy, una muñeca de pasarela cósmica?!",
                  "WHAT?! You again with your delirious orders?! I barely escaped a monster-infested basement and now you demand I go to my twin's house with red lingerie in my backpack?! What do you think I am, a cosmic runway doll?!",
                  () => {
                    onTriggerDialogue(
                      "Alanis (Firmeza Inquebrantable)",
                      "El hilo primordial no entiende de pudores mundanos ni de quejas infantiles, CKY. La mitad humana de tu gemelo requiere un estímulo de resonancia pasional pura para desbloquear la clarividencia de las sombras. Lleva la lencería roja en tu mochila. No tienes otra opción si deseas salvar tu ciudad.",
                      "The primordial thread understands neither mundane modesty nor childish complaints, CKY. Your twin's human half requires pure passionate resonance to unlock shadow clairvoyance. Pack the red lingerie. You have no choice if you wish to save your city.",
                      () => {
                        playSound(330, "triangle", 0.4);
                        onTriggerDialogue(
                          "CKY (Resignación y Bronca)",
                          "¡Aggghhh! ¡Está bien, maldita sea! Lo hago porque no quiero que la Vecina destruya a mis amigos y a mi escuela, ¡pero no me pidas que me guste ni un poco!",
                          "Aggghhh! Fine, damn it! I'll do it because I don't want the Neighbor to destroy my friends and school, but don't ask me to like it one bit!",
                          () => {
                            setDay7AlanisBedroomArgumentDone(true);
                            localStorage.setItem("cky_day7_alanis_arg_done", "true");
                            unlockDiaryEntry("chapter_07_alanis_red_lingerie_mandate");
                            addXP(50);
                            playSound(660, "sine", 0.4);

                            // Angela and W step in
                            setTimeout(() => {
                              onTriggerDialogue(
                                "Ángela (Espíritu - Comentario Desubicado)",
                                "¡¡EPAAAAA CKY!! ¡La virgen de la pasarela ataca de nuevo! ¡¿Te mandaron con el encaje rojo furioso a la casa del galán?! ¡Por favor, decime que te vas a acordar de respirar y no vas a salir corriendo en patitas! ¡Esto se pone picante, papaaaa!",
                                "WHOAAA CKY!! The runway maiden strikes again! Ordered with fiery red lace to the heartthrob's house?! Please tell me you'll remember to breathe and won't run away! This is getting spicy!",
                                () => {
                                  onTriggerDialogue(
                                    "W (Guardián Ancestral)",
                                    "Mi Señora CKY, las directrices de la entidad suprema, por desconcertantes que resulten, responden a los arcanos mayores. Le sugiero que tome una ducha higiénica en el baño para purificar el hollín del sótano, vista sus ropas habituales y guarde la prenda indicada en su mochila.",
                                    "My Lady CKY, the supreme entity's directives, however disconcerting, follow higher arcanes. I suggest taking a hygienic shower to wash away basement soot, wearing casual clothes, and packing the indicated garment.",
                                    () => {
                                      onTriggerDialogue(
                                        "CKY",
                                        "Tienen razón... Primero me voy a dar una buena ducha al baño para sacarme este olor a veneno y rata vieja. Después vengo a mi habitación a ponerme ropa común y guardar el conjunto rojo en la mochila.",
                                        "You're right... First I'll take a good shower in the bathroom to get rid of this toxic smell. Then I'll come back to my room to put on casual clothes and pack the red set in my backpack."
                                      );
                                    }
                                  );
                                }
                              );
                            }, 350);
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  const handleSoulmateBathroomAction = () => {
    if (!day7LingeriePacked) {
      playSound(200, "triangle", 0.2);
      onTriggerDialogue(
        "Baño de la Casa del Gemelo",
        "La puerta del baño está entornada. No tienes motivos para entrar en este momento.",
        "The bathroom door is ajar. You have no reason to enter right now."
      );
      return;
    }
    if (!day7SoulmateKissDone) {
      playSound(200, "triangle", 0.2);
      onTriggerDialogue(
        "CKY",
        "Primero debo hablar con mi gemelo en el living antes de usar su baño.",
        "I must talk to my soulmate in the living room before using his bathroom."
      );
      return;
    }
    if (day7SoulmateKissDone && !day7SoulmateChangedToLingerie) {
      // Change into red lingerie
      playSound(620, "sine", 0.4);
      onTriggerDialogue(
        "Baño de la Casa del Gemelo (Cambiador Improvisto)",
        "Entrás al baño con el corazón latiéndote a mil por hora. Sacás el conjunto de lencería sexy roja de encaje de la mochila, te sacás la ropa común temblando y te ponés el conjunto... Al mirarte al espejo te ponés roja como un tomate.",
        "You step into the bathroom with your heart pounding. You take out the sexy red lace lingerie set from your backpack, take off your casual clothes, and put on the set... Looking in the mirror you blush bright red.",
        () => {
          onTriggerDialogue(
            "Ángela (Espíritu - Comentario Picante Fuera de Lugar)",
            "¡¡MAMITA QUERIDA!! ¡Mirá lo que es ese bombonazo con encaje carmesí! ¡Si ese pibe no se derrite en el piso como manteca al sol, es porque es ciego o de plástico! ¡Salí al living y desfilá como una diosa del Olimpo, no arrugues ahora!",
            "HOLY MOLY!! Look at that bombshell in crimson lace! If that guy doesn't melt on the floor like butter in the sun, he's blind or plastic! Step out to the living room and strut like an Olympus goddess, don't back down now!",
            () => {
              if (setCurrentOutfit) {
                setCurrentOutfit("lingerie_sexy");
              }
              setDay7SoulmateChangedToLingerie(true);
              localStorage.setItem("cky_day7_soulmate_lingerie", "true");
              playSound(880, "sine", 0.4);
              onTriggerDialogue(
                "CKY (Determinada pero Avergonzada)",
                "¡Ufff, qué vergüenza descomunal! Bueno, ya está hecho. Voy al living a hablar con él y exigirle la información.",
                "Whew, absolute embarrassment! Well, it's done. I'll go to the living room to talk to him and demand the intel."
              );
            }
          );
        }
      );
      return;
    }
    if (day7SoulmateIntelDone && !day7SoulmateChangedBack) {
      // Change back into casual clothes
      playSound(520, "sine", 0.4);
      onTriggerDialogue(
        "Baño de la Casa del Gemelo (Alivio Total)",
        "Entrás al baño a toda velocidad, te sacás la lencería roja con alivio absoluto, la doblás y la guardás en el fondo de la mochila, y te vestís con tu ropa casual común.",
        "You dash into the bathroom, take off the red lingerie with immense relief, fold it deep into your backpack, and put on your casual clothes.",
        () => {
          onTriggerDialogue(
            "Ángela (Espíritu - Burlona)",
            "¡Aguafiestas! Con lo bomba que te quedaba ese encaje... Pero bueno, ¡ahora volemos a casa a contarles todo a W antes de que amanezca!",
            "Party pooper! You looked so smoking hot in that lace... But fine, let's fly home to report everything to W before dawn!",
            () => {
              if (setCurrentOutfit) {
                setCurrentOutfit("casual");
              }
              setDay7SoulmateChangedBack(true);
              localStorage.setItem("cky_day7_changed_back", "true");
              playSound(740, "sine", 0.4);
              onTriggerDialogue(
                "CKY",
                "¡Qué alivio inmenso tener mi ropa puesta de nuevo! Ahora salgo por la puerta principal y vuelvo urgente a casa.",
                "What huge relief to have my clothes back on! Now I'll exit through the front door and rush home."
              );
            }
          );
        }
      );
      return;
    }
    if (day7SoulmateChangedBack) {
      onTriggerDialogue(
        "CKY",
        "Ya me cambié y tengo mi ropa común puesta. Debo salir por la puerta principal de regreso a mi casa.",
        "I've already changed back into casual clothes. I must exit through the front door back home."
      );
      return;
    }
    onTriggerDialogue(
      "Baño de la Casa del Gemelo",
      "El baño se encuentra en orden.",
      "The bathroom is in order."
    );
  };

  const triggerDay7ReturnHomeReport = () => {
    playSound(600, "sine", 0.5);
    onTriggerDialogue(
      "Reunión de Emergencia en Casa de CKY",
      "Entrás a tu habitación y te reunís de inmediato con W y Ángela para informarles lo sucedido en la casa del gemelo.",
      "You enter your room and immediately meet with W and Angela to report what happened at the soulmate's house.",
      () => {
        onTriggerDialogue(
          "CKY (Agotada pero Firme)",
          "Chicos, vengo de la casa del gemelo... Tuve que pasar por la situación más vergonzosa e insólita de mi vida desfilándole en ropa interior roja para sacarle la información, ¡pero conseguí los detalles del plan de la Vecina!",
          "Guys, I just came from my soulmate's house... I had to endure the most embarrassing ordeal of my life modeling in red lingerie, but I got the full details of the Neighbor's plan!",
          () => {
            onTriggerDialogue(
              "Ángela (Espíritu - Risa Desatada y Comentarios)",
              "¡¡JAJAJAJAJA!! ¡¡No te la puedo creer!! ¡¿Desfilaste en portaligas y encaje carmesí?! ¡Pará que me meo de la risa aunque sea un fantasma! ¡¿Y al gemelito se le cayó la baba o se le recalentó el procesador astral?! ¡Sos una genia del modelaje bélico, CKY!",
              "HAHAHAHAHA!! I can't believe it!! You strutted in crimson lace?! I'm dying of laughter even though I'm a ghost! Did the soulmate drool or overheat his astral engine?! You're a tactical modeling queen, CKY!",
              () => {
                onTriggerDialogue(
                  "CKY (Seriedad Absoluta)",
                  "¡Basta Ángela, esto es grave! Mañana Miércoles la Vecina desatará el Gran Asalto Coordinado. Todos los infectados atacarán en simultáneo en cuatro puntos: la Plaza Principal, el Hospital, la Terminal y el Centro Comercial para quebrar la ciudad.",
                  "Enough Angela, this is serious! Tomorrow Wednesday the Neighbor will unleash the Grand Coordinated Assault across four spots simultaneously: the Main Square, Hospital, Terminal, and Mall to break the city.",
                  () => {
                    onTriggerDialogue(
                      "W (Guardián Solemne)",
                      "¡Por las estrellas del linaje ancestral! Es una maniobra de asedio de orden catastrófico. No temas, mi Señora CKY. Pasaré toda la noche en vigilia analizando las líneas telúricas y grabando runas de defensa para los cuatro enclaves.",
                      "By the stars of the ancestral lineage! It is a siege maneuver of catastrophic scale. Fear not, Lady CKY. I shall keep vigil all night analyzing leylines and etching defensive runes for all four sites.",
                      () => {
                        onTriggerDialogue(
                          "W (Consejo Protector)",
                          "Tu cuerpo y tu mente han tolerado una presión descomunal hoy. Te encomiendo que vistas tu fino piyama de seda y descanses profundamente en tu lecho. Mañana la batalla será decisiva.",
                          "Your body and mind endured immense strain today. I commend you to put on your fine silk pajamas and rest deeply in your bed. Tomorrow the battle will be decisive.",
                          () => {
                            setDay7ReturnedHomeReportDone(true);
                            localStorage.setItem("cky_day7_report_done", "true");
                            addXP(100);
                            playSound(880, "sine", 0.5);
                            onTriggerDialogue(
                              "CKY",
                              "Tenes razón, W. Voy al ropero a ponerme el piyama de seda y me acuesto en mi cama a descansar.",
                              "You're right, W. I'll go to the wardrobe to put on the silk pajamas and lie down in bed to rest."
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  };

  const performInteraction = (pos: Position = playerPos, face: Direction = facing) => {
    const target = getActionTarget(pos, face);
    if (!target) return;

    // Day 6: Interaction with Dark Form in bedroom
    if (currentDay === 6 && !day6DarkFormDefeated && currentMap === "bedroom" && (Math.abs(pos.x - 6) <= 2 && Math.abs(pos.y - 3) <= 2)) {
      setShowDay6BattleModal(true);
      return;
    }

    // Day 7: Soulmate Bathroom interaction
    if (target.type === "soulmate_bathroom") {
      handleSoulmateBathroomAction();
      return;
    }

    // Day 7: Soulmate Encounter, Kiss & Critique, Red Lingerie Condition & Intel
    if (currentDay === 7 && currentMap === "soulmate_house" && (target.type === "npc" || (pos.x >= 3 && pos.x <= 7 && pos.y <= 5))) {
      if (!day7SoulmateKissDone) {
        playSound(600, "sine", 0.4);
        onTriggerDialogue(
          `${soulmateInfo?.name || "Alma Gemela"}`,
          "Hola CKY. Sentí tu energía desde que doblaste en la esquina. Te noto con las pulsaciones aceleradas y las mejillas calientes. Para reconectar el circuito de comunión y sintonizar la defensa, necesito que me des un beso en los labios.",
          "Hello CKY. I sensed your energy as soon as you turned the corner. Your pulse is racing. To reconnect the communion loop and tune defenses, I need you to give me a kiss on the lips.",
          () => {
            onTriggerDialogue(
              "CKY (Resignada y Tensa)",
              "Bueno... Alanis me advirtió esto. Pero que sea rápido y nada de comentarios de galancito, ¿estamos?",
              "Fine... Alanis warned me. But make it quick and no playboy remarks, got it?",
              () => {
                playSound(700, "sine", 0.5);
                setActiveCinematicType("day6_soulmate_kiss");
                onTriggerDialogue(
                  "El Beso de Comunión Cósmica",
                  "✨ CKY se acerca tiesa y le da un beso directo en los labios al gemelo. Una chispa violeta y dorada cruza entre ambos. CKY se aparta de inmediato con la respiración entrecortada.",
                  "✨ CKY stiffly steps forward and kisses her soulmate directly on the lips. A violet and golden spark zaps between them. CKY steps back breathless.",
                  () => {
                    playSound(320, "triangle", 0.4);
                    onTriggerDialogue(
                      `${soulmateInfo?.name || "Alma Gemela"} (Crítica Desubicada y Seca)`,
                      "El gemelo se limpia la comisura con el pulgar, arruga la nariz y te mira con desconcierto: 'Mmmm... La verdad que besás bastante mal, CKY. Besás como una estatua de yeso o una heladera desenchufada... ¿Nunca antes habías besado a nadie?'",
                      "The soulmate wipes his lip corner, wrinkles his nose, and looks at you puzzled: 'Mmmm... Honestly you kiss pretty badly, CKY. You kiss like a plaster statue or an unplugged fridge... Have you never kissed anyone before?'",
                      () => {
                        onTriggerDialogue(
                          "CKY (¡Furia e Indignación Monumental!)",
                          "¡¡¿QUÉ?!! ¡¿Cómo te atrevés a criticarme la forma de besar, atrevido engreído?! ¡¿Sabés qué?! ¡Me voy a la mierda! ¡Arreglate solo con tus espíritus, con Alanis y con la Vecina!",
                          "WHAT?!! How dare you criticize how I kiss, you smug jerk?! You know what?! I'm getting the hell out of here! Deal with your spirits, Alanis, and the Neighbor yourself!",
                          () => {
                            playSound(480, "sine", 0.4);
                            onTriggerDialogue(
                              `${soulmateInfo?.name || "Alma Gemela"} (Urgencia y Arrepentimiento)`,
                              "¡Pará, pará CKY! ¡No te vayas! Perdoname, soy mitad espíritu y a veces digo las cosas crudas y sin anestesia... Pero posta, te necesito acá. Tengo información ultra clasificada de los planes de la Vecina que conseguí interceptando las sombras del Limbo.",
                              "Wait, wait CKY! Don't leave! Forgive me, I'm half spirit and sometimes speak bluntly without filter... But seriously, I need you here. I got ultra-classified intel on the Neighbor's plans that I intercepted from the Limbo shadows.",
                              () => {
                                onTriggerDialogue(
                                  "CKY (Brazos Cruzados y Ceño Fruncido)",
                                  "A ver... hablá rápido y contame todo antes de que te reviente la mochila por la cabeza.",
                                  "Alright... speak fast and tell me everything before I smash my backpack over your head.",
                                  () => {
                                    playSound(640, "sine", 0.5);
                                    onTriggerDialogue(
                                      `${soulmateInfo?.name || "Alma Gemela"} (La Condición Inesperada)`,
                                      "Te lo cuento todo con lujo de detalles... pero con una condición. Alanis me avisó que en el fondo de esa mochila trajiste el Conjunto de Lencería Sexy Roja de encaje que compraste en el shopping el sábado. Solo te revelo los planes si vas a mi baño de arriba, te ponés la lencería roja y me hacés un desfile acá en el medio del living.",
                                      "I'll tell you every single detail... but on one condition. Alanis told me you brought the Sexy Red Lace Lingerie set you bought at the mall in your backpack. I will only reveal the plans if you go to my upstairs bathroom, put on the red lingerie, and do a runway walk for me here in the living room.",
                                      () => {
                                        onTriggerDialogue(
                                          "CKY (Boquiabierta y Escandalizada)",
                                          "¡¡¡¿¿¿QUÉEEEE???!!! ¡¿Vos y Alanis están completamente de la nuca?! ¡¿Qué clase de chantaje perverso es este?! ¡Sos un degenerado cósmico!",
                                          "WHAAAATTT?!! Are you and Alanis totally out of your minds?! What kind of twisted blackmail is this?! You're a cosmic pervert!",
                                          () => {
                                            onTriggerDialogue(
                                              `${soulmateInfo?.name || "Alma Gemela"}`,
                                              "Es la única condición, CKY. La vibración de atracción romántica desvergonzada es lo que termina de estabilizar mi tercer ojo psíquico para decodificar los puntos exactos del ataque. Andá al baño del pasillo a cambiarte... O mañana la ciudad entera cae en la oscuridad.",
                                              "It's the only condition, CKY. Shameless romantic attraction vibration is what finishes stabilizing my third psychic eye to decode the exact attack coordinates. Go to the bathroom to change... Or tomorrow the entire city falls into darkness.",
                                              () => {
                                                onTriggerDialogue(
                                                  "CKY (Resignación Furia)",
                                                  "¡Agggghhh! ¡Los odio a todos! Voy al baño a cambiarme... ¡pero no te acostumbres ni pienses que esto te da ningún derecho!",
                                                  "Agggghhh! I hate you all! I'm going to the bathroom to change... but don't get used to it or think this gives you any rights!",
                                                  () => {
                                                    setDay7SoulmateKissDone(true);
                                                    localStorage.setItem("cky_day7_soulmate_kiss_done", "true");
                                                    unlockDiaryEntry("chapter_07_soulmate_awkward_kiss_critique");
                                                    addXP(50);
                                                    playSound(750, "sine", 0.4);
                                                  }
                                                );
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
        return;
      }

      if (day7SoulmateKissDone && !day7SoulmateChangedToLingerie) {
        onTriggerDialogue(
          `${soulmateInfo?.name || "Alma Gemela"}`,
          "El trato es claro, CKY: andá al baño de arriba, ponete la lencería roja que tenés en la mochila y vení a desfilar al living. Recién ahí te revelo la información.",
          "The deal is clear, CKY: go to the bathroom upstairs, put on the red lingerie in your backpack and come runway in the living room. Only then will I reveal the intel."
        );
        return;
      }

      if (day7SoulmateChangedToLingerie && !day7SoulmateRunwayDone) {
        // Runway scene in the living room!
        playSound(840, "sine", 0.6);
        onTriggerDialogue(
          "El Desfile en Lencería Roja",
          `✨ CKY sale del baño vistiendo el Conjunto de Lencería Sexy Roja de encaje. Con pasos decididos y altaneros, camina por la alfombra del living como una auténtica modelo de alta costura, clavándole la mirada fulminante al gemelo.`,
          `✨ CKY steps into the living room wearing the Sexy Red Lace Lingerie. With haughty, decisive steps, she struts across the living room carpet like a high-fashion runway model, glaring at her soulmate.`,
          () => {
            playSound(400, "triangle", 0.5);
            onTriggerDialogue(
              `${soulmateInfo?.name || "Alma Gemela"} (Boca Abierta y Atónito)`,
              `El gemelo queda petrificado en su asiento. Se le abren los ojos de par en par, se pone colorado hasta las orejas y traga saliva con evidente dificultad: "G-guau... CKY... Estás... Estás increíblemente hermosa... Se me borraron todas las palabras de la cabeza... Tu aura astral es una locura..."`,
              `The soulmate freezes in his seat. His eyes widen, blushing intensely to his ears, swallowing with difficulty: "W-wow... CKY... You're... You're incredibly gorgeous... All words just vanished from my head... Your astral aura is insane..."`,
              () => {
                onTriggerDialogue(
                  "Ángela (Espíritu - Carcajadas Desubicadas)",
                  "¡¡JAJAJAJAJA!! ¡Mirá la cara de zonzo que puso el galán! ¡Se le cayeron los calzones astrales! ¡Te dije CKY que con esa lencería roja lo dejabas turulato! ¡Exigile los datos antes de que se desmaye de la taquicardia!",
                  "HAHAHAHAHA!! Look at the goofy face on the heartthrob! His astral pants dropped! Told you CKY that red lace would knock him out! Demand the data before he faints from tachycardia!",
                  () => {
                    onTriggerDialogue(
                      "CKY (Brazos Cruzados en Lencería)",
                      "Listo. Ya me viste y ya cumplí con tu estúpido desfile caprichoso. Ahora escupí la información completa de la Vecina antes de que me vaya a vestir.",
                      "Done. You saw me and I fulfilled your silly runway. Now spit out the full Neighbor intel before I go get dressed.",
                      () => {
                        playSound(780, "sine", 0.6);
                        onTriggerDialogue(
                          `${soulmateInfo?.name || "Alma Gemela"} (Revelación del Gran Ataque)`,
                          "Tenés razón... Disculpame, me descolocaste por completo. Escuchá bien: Mañana Miércoles la Vecina ejecutará el Gran Asalto Coordinado. Todos los infectados y poseídos atacarán en simultáneo en cuatro puntos neurálgicos de la ciudad:\n\n1. 📍 La Plaza Principal (Nico y sombras sembrarán terror).\n2. 🏥 El Hospital Municipal (intentarán cortar suministros y poseer a los internados).\n3. 🚌 La Terminal de Ómnibus (para aislar a toda la ciudad).\n4. 🛍️ El Centro Comercial (donde la Vecina concentra un depósito masivo de energía oscura del Limbo).\n\nDeben preparar la estrategia con W y Ángela hoy mismo.",
                          "You're right... Excuse me, you threw me completely off balance. Listen closely: Tomorrow Wednesday the Neighbor will execute the Grand Coordinated Assault. All infected and possessed will attack simultaneously across four city strongholds:\n\n1. 📍 Main Square\n2. 🏥 Municipal Hospital\n3. 🚌 Bus Terminal\n4. 🛍️ Shopping Mall\n\nYou must prepare tonight's strategy with W and Angela.",
                          () => {
                            setDay7SoulmateRunwayDone(true);
                            setDay7SoulmateIntelDone(true);
                            localStorage.setItem("cky_day7_soulmate_runway", "true");
                            localStorage.setItem("cky_day7_soulmate_intel", "true");
                            unlockDiaryEntry("chapter_07_red_lingerie_runway_intel");
                            addXP(100);
                            playSound(920, "sine", 0.5);
                            onTriggerDialogue(
                              "CKY",
                              "Dios mío... Es un plan despiadado. Ahora voy al baño a ponerme mi ropa común de inmediato y me vuelvo corriendo a casa a preparar las defensas con W y Ángela.",
                              "My god... It's a ruthless plan. Now I'm going to the bathroom to change back into my casual clothes immediately and run home to prepare defenses with W and Angela."
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
        return;
      }

      if (day7SoulmateIntelDone && !day7SoulmateChangedBack) {
        onTriggerDialogue(
          `${soulmateInfo?.name || "Alma Gemela"}`,
          "Andá al baño a ponerte tu ropa común, CKY. Tenés que volver a tu casa a coordinar las defensas con W.",
          "Go to the bathroom to put on your casual clothes, CKY. You need to head back home to coordinate defenses with W."
        );
        return;
      }

      if (day7SoulmateChangedBack) {
        onTriggerDialogue(
          `${soulmateInfo?.name || "Alma Gemela"}`,
          "CKY, no perdamos tiempo. Volvé a tu casa y mostrale los cuatro puntos del ataque a W para que trace las líneas defensivas.",
          "CKY, let's not waste time. Return home and show the four attack points to W so he can trace defensive lines."
        );
        return;
      }
    }

    // Interactive house furniture & objects
    if (target.type === "closet") { setShowWardrobeModal(true); return; }
    if (target.type === "bed") { setShowBedModal(true); return; }
    if (target.type === "shower") { setShowShowerModal(true); return; }
    if (target.type === "toilet") { setShowToiletModal(true); return; }
    if (target.type === "sink") { setShowSinkModal(true); return; }
    if (target.type === "kitchen_fridge") { setShowFridgeModal(true); return; }
    if (target.type === "kitchen_sink") { setShowKitchenSinkModal(true); return; }
    if (target.type === "mueble_utiles_1") { setShowOrganizerModal1(true); return; }
    if (target.type === "mueble_utiles_2") { setShowOrganizerModal2(true); return; }
    if (target.type === "bedside_table") { setShowNightstandModal(true); return; }
    if (target.type === "chair_with_clothes") { setShowJacketModal(true); return; }
    if (target.type === "moms_vanity") {
      if (!hasTakenMomsPerfume) {
        setHasTakenMomsPerfume(true);
        setStats(prev => ({ ...prev, perfume: Math.min(100, (prev.perfume ?? 0) + 50) }));
        addXP(20);
        advanceTime(3);
        playSound(850, "sine", 0.4);
        unlockAchievement("ach_french_perfume", onShowNotification, addXP);
        onTriggerDialogue(
          "Peinador de Mamá",
          "Hija de p*** ¡acá esta mi perfume favorito! (+50% Perfume, +20 XP).",
          "There it is! Here's my favorite perfume! (+50% Perfume, +20 XP)."
        );
      } else {
        onTriggerDialogue(
          "Peinador de Mamá",
          "Ya tomaste tu perfume favorito del peinador. Está lleno de cosméticos de mamá.",
          "You already took your favorite perfume from the vanity."
        );
      }
      return;
    }
    if (target.type === "moms_plant") {
      if (!hasTakenMomsPlantMoney) {
        setHasTakenMomsPlantMoney(true);
        addInventoryItem({
          id: "moms_plant_money_500",
          nameEs: "Billete de $500",
          nameEn: "$500 Bill",
          descEs: "Un billete de $500 que encontraste escondido en la maceta de la planta de mamá.",
          descEn: "A $500 bill found hidden in mom's plant pot.",
          icon: "💵",
          isKey: false,
          category: "pockets"
        });
        addXP(20);
        advanceTime(3);
        playSound(850, "sine", 0.4);
        unlockAchievement("ach_plant_money", onShowNotification, addXP);
        onTriggerDialogue(
          "Planta de Mamá",
          "¡Encontraste un billete de $500 escondido en la maceta! CKY sonríe: 'Gracias plantita' (+$500 guardado en inventario, +20 XP).",
          "You found a $500 bill hidden in the flowerpot! CKY smiles: 'Thanks little plant' (+$500 saved in inventory, +20 XP)."
        );
      } else {
        onTriggerDialogue(
          "Planta de Mamá",
          "La planta de mamá está verde y reluciente. Ya revisaste la maceta.",
          "Mom's plant is green and shiny. You already checked the pot."
        );
      }
      return;
    }
    if (target.type === "kitchen_tv") { setShowKitchenTvModal(true); return; }
    if (target.type === "kitchen_table") { setShowKitchenTableModal(true); return; }
    if (target.type === "kitchen_window") { setShowKitchenWindowModal(true); return; }
    if (target.type === "kitchen_fireplace") { setShowKitchenFireplaceModal(true); return; }

    // 10 Features Interaction Handlers
    if (target.type === "blackboard" || target.type === "teacher_desk") {
      soundEngine.playSfx("dialogue");
      onTriggerDialogue(
        "Pizarrón Escolar",
        "📚 ¿Querés poner a prueba tus conocimientos en la Trivia Escolar de Preguntas y Respuestas (+XP y Recompensas)?",
        "📚 Do you want to test your knowledge in the School Trivia Quiz (+XP and Rewards)?",
        () => {
          setShowTriviaMinigame(true);
        }
      );
      return;
    }

    if (target.type === "bulletin_board" || target.type === "plaza_notice_board") {
      soundEngine.playSfx("dialogue");
      setShowNoticeBoard(true);
      return;
    }

    if (target.type === "mall_claw_machine") {
      soundEngine.playSfx("dialogue");
      onTriggerDialogue(
        "🕹️ Máquina Cazapeluches Galáctica",
        "¡Una máquina arcade brillante repleta de peluches adorables! ¿Querés jugar un intento por $50?",
        "A shiny arcade machine full of adorable plushies! Do you want to play a try for $50?",
        () => {
          setShowClawMachine(true);
        }
      );
      return;
    }

    if (target.type === "street_bicycle") {
      soundEngine.playSfx("dialogue");
      onTriggerDialogue(
        "🚲 Bicicleta Todoterreno de CKY",
        "¡Tu bici todoterreno! ¿Querés salir a toda velocidad en una carrera de obstáculos por la calle esquivando baches y autos (+XP, +Premios en efectivo)?",
        "Your off-road bicycle! Do you want to sprint in an obstacle race down the street dodging potholes and cars (+XP, +Cash prizes)?",
        () => {
          setShowBicycleRace(true);
        }
      );
      return;
    }

    if (target.type === "street_food_cart") {
      soundEngine.playSfx("dialogue");
      setShowStreetFoodCart(true);
      return;
    }

    if (target.type === "room_decor") {
      soundEngine.playSfx("dialogue");
      onTriggerDialogue(
        "Decoración de la Habitación",
        "🎨 ¿Querés personalizar los pósters de la pared, el acolchado de tu cama o las luces de hadas de tu habitación?",
        "🎨 Do you want to customize your room posters, bedspread, or ambient fairy lights?",
        () => {
          setShowRoomCustomization(true);
        }
      );
      return;
    }

    if (target.type === "pet_bed") {
      soundEngine.playSfx("dialogue");
      setShowPetModal(true);
      return;
    }

    // Day 6: Soulmate Physical Encounter & Tense Kiss in soulmate_house
    if (currentDay === 6 && currentMap === "soulmate_house" && (target.type === "npc" || (pos.x >= 3 && pos.x <= 7 && pos.y <= 5))) {
      if (!day6SoulmateKissDone) {
        playSound(600, "sine", 0.4);
        onTriggerDialogue(
          `${soulmateInfo?.name || "Alma Gemela"} (Cuerpo Físico - Distante)`,
          "Hola CKY, ¿cómo va? Pasá, sentate si querés en el sillón. Alanis me avisó que venías.",
          "Hey CKY, how's it going? Come in, take a seat on the couch if you want. Alanis let me know you were coming.",
          () => {
            onTriggerDialogue(
              "CKY (Incomodidad)",
              "Vine porque Alanis me obligó... la verdad me siento súper presionada e incómoda con todo esto.",
              "I came because Alanis forced me... honestly I feel super pressured and uncomfortable with all of this.",
              () => {
                onTriggerDialogue(
                  `${soulmateInfo?.name || "Alma Gemela"} (Mirada Distante)`,
                  "A mí tampoco me cabe ni un poco que estas entidades del cielo nos vengan a mandar y decidan con quién tenemos que estar. Es un bajón total. Pero posta que si no hacemos esto de la comunión, mi cuerpo físico no se la banca con la energía del Limbo y la Vecina nos va a pasar por arriba a todos. Mejor hagámoslo rápido y nos sacamos la presión de encima.",
                  "I don't dig celestial entities bossing us around and deciding who we gotta be with either. It's a total drag. But for real, if we don't do this communion thing, my physical body won't handle the Limbo energy and the Neighbor will run all over us. Better to do it quick and get the pressure off our backs.",
                  () => {
                    playSound(720, "sine", 0.6);
                    setActiveCinematicType("day6_soulmate_kiss");
                    onTriggerDialogue(
                      "Beso Cósmico de Comunión",
                      `✨ ${soulmateInfo?.name || "El Alma Gemela"} da un paso al frente y toma suavemente el rostro de CKY. CKY recuerda los consejos de Ángela (labios suaves, cabeza inclinada). Sus labios se encuentran en un beso tenso, electrizante y cargado de poder ancestral. Una onda de choque dorada y violeta recorre la sala, estabilizando sus auras físicas y espirituales.`,
                      `✨ ${soulmateInfo?.name || "The Soulmate"} steps forward and gently holds CKY's face. CKY remembers Angela's advice (soft lips, tilted head). Their lips meet in a tense, electrifying kiss brimming with ancestral power. A golden and violet shockwave ripples through the room, stabilizing their physical and spiritual auras.`,
                      () => {
                        setDay6SoulmateKissDone(true);
                        localStorage.setItem("cky_day6_soulmate_kiss_done", "true");
                        addXP(100);
                        playSound(880, "sine", 0.5);
                        onTriggerDialogue(
                          "CKY (Sonrojada y Agitada)",
                          "Bueno... ya está cumplido el mandato de Alanis. Se hizo tarde, me tengo que volver a mi casa...",
                          "Well... Alanis's mandate is fulfilled. It got late, I should head back home...",
                          () => {
                            onTriggerDialogue(
                              `${soulmateInfo?.name || "Alma Gemela"}`,
                              "Pará, CKY, bancá un segundo antes de irte... Vení a mi pieza, hay algo clave que te tengo que dar.",
                              "Hold on, CKY, wait a second before you go... Come to my room, there's something crucial I gotta give you.",
                              () => {
                                transitionToMap("soulmate_bedroom", { x: 2, y: 6 });
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
        return;
      }
    }

    // Day 6: Nightstand with Framed Photo of Him and the Neighbor in soulmate_bedroom
    if (currentMap === "soulmate_bedroom" && (target.type === "photo_vecina" || (pos.x >= 5 && pos.x <= 7 && pos.y <= 2))) {
      playSound(400, "triangle", 0.4);
      onTriggerDialogue(
        "CKY (Observando el Portarretratos)",
        "En la mesita hay un portarretratos dorado reluciente... ¡¡Es una foto de ÉL y la VECINA sonriendo juntos y abrazados en el pasado!! 📸\n\n(CKY se queda helada por dentro: '¿Una foto con la Vecina sonriendo juntos como viejos amigos...? ¡¿Qué clase de vínculo tenían antes de que todo esto empezara?! Mejor me guardo esto por ahora...')",
        "On the nightstand sits a gleaming golden picture frame... It's a photo of HIM and the NEIGHBOR smiling together and embracing in the past!! 📸\n\n(CKY freezes inside: 'A photo with the Neighbor smiling together like old friends...? What kind of connection did they have before all this started?! I better keep quiet about this for now...')",
        () => {
          setDay6PhotoVecinaExamined(true);
          localStorage.setItem("cky_day6_photo_vecina_seen", "true");
        }
      );
      return;
    }

    // Day 6: Grimoire Bookshelf in soulmate_bedroom
    if (currentMap === "soulmate_bedroom" && (target.type === "grimoire_shelf" || target.npc?.id === "soulmate_bedroom_npc" || (pos.x >= 3 && pos.x <= 5 && pos.y <= 2))) {
      if (!day6GrimoireObtained) {
        playSound(750, "sine", 0.5);
        onTriggerDialogue(
          `${soulmateInfo?.name || "Alma Gemela"} (Tomando un Libro Antiguo)`,
          "Tomá CKY, agarrá este libro. Es el 'Grimorio de las Sombras Escolares'.",
          "Take this CKY, grab this book. It's the 'Grimoire of School Shadows'.",
          () => {
            onTriggerDialogue(
              `${soulmateInfo?.name || "Alma Gemela"} (Revelación Crucial)`,
              "Anoté acá toda la data posta sobre cada uno de los bichos oscuros que la Vecina les metió en la cabeza a los pibes (Jaz, Nico, Juan, Abril) y a los profesores. Te dejé anotadas todas las debilidades exactas para darles donde más les duele. Si queremos salvar a la escuela, hay que encararlos uno por uno. Llevátelo, es tuyo.",
              "I wrote down all the real data here about every dark critter the Neighbor shoved into the kids' heads (Jaz, Nico, Juan, Abril) and the teachers. I noted down their exact weaknesses to hit them where it hurts most. If we wanna save the school, we gotta face them one by one. Take it, it's yours.",
              () => {
                setDay6GrimoireObtained(true);
                localStorage.setItem("cky_day6_grimoire_obtained", "true");
                addInventoryItem({
                  id: "shadow_grimoire",
                  nameEs: "Grimorio de las Sombras Escolares",
                  nameEn: "Grimoire of School Shadows",
                  descEs: "Grimorio ancestral con el registro y debilidades de los espíritus que poseen a compañeros y profesores.",
                  descEn: "Ancient grimoire with the record and weaknesses of the spirits possessing classmates and teachers.",
                  icon: "📖",
                  category: "backpack",
                  isKey: true
                });
                addXP(200);
                playSound(900, "sine", 0.6);
                unlockDiaryEntry("chapter_06_soulmate_kiss_and_grimoire");
                onTriggerDialogue(
                  "CKY",
                  "¡Grimorio obtenido! Con este libro podré descubrir cómo vencer y liberar a cada compañero poseído de la escuela. Gracias...",
                  "Grimoire obtained! With this book I'll be able to learn how to defeat and free each possessed classmate at school. Thank you..."
                );
              }
            );
          }
        );
      } else {
        onTriggerDialogue(
          `${soulmateInfo?.name || "Alma Gemela"}`,
          "Mirá bien la data del Grimorio en tu mochila. La Vecina no va a aflojar, pero con estas debilidades les vamos a dar con todo.",
          "Check out the Grimoire data in your backpack well. The Neighbor isn't gonna ease up, but with these weaknesses we'll hit them with everything."
        );
      }
      return;
    }

    // Day 6: Bathroom Cabal Meeting
    if (currentDay === 6 && currentMap === "bathroom_girls" && !day6BathroomDiscussionDone) {
      triggerDay6BathroomCabalSequence();
      return;
    }

    // Day 6: Courtyard Possessed Soccer Battle with Mateo
    if (
      currentDay === 6 &&
      !day6PossessedSoccerDefeated &&
      currentMap === "school_courtyard" &&
      (target.type === "soccer_ball" || (target.type === "npc" && (target.npc.id === "mateo_soccer" || target.npc.id === "class_mateo")))
    ) {
      if (!day6BathroomDiscussionDone) {
        playSound(240, "sawtooth", 0.4);
        onTriggerDialogue(
          "Mateo (Mirada Sombría y Aura Violeta)",
          "¡¡GRRRRRRRR...!! ¡No te acerques CKY! ¡Tengo una furia oscura dentro que me quema las tripas! ¡Dejame en paz o te reviento de un pelotazo!",
          "GRRRRRRR...!! Don't come near CKY! I have a dark fury burning inside me! Leave me alone or I'll smash you with the ball!",
          () => {
            onTriggerDialogue(
              "Ángela (Espíritu)",
              "¡CKY, está recontra poseído por las sombras de la vecina! Primero vayamos al baño de chicas a armar un plan seguro antes de encararlo.",
              "CKY, he's totally possessed by the neighbor's shadows! Let's go to the girls' bathroom first to come up with a safe plan before facing him."
            );
          }
        );
        return;
      }

      // Bathroom cabal done! Ready for Soccer Boss Battle!
      playSound(180, "sawtooth", 0.5);
      onTriggerDialogue(
        "Mateo (Poseído por Espíritu de Combate de la Vecina)",
        "¡¡¡JAJAJAJA CKY!!! ¿Creíste que podías meterte con los planes de mi Ama la Vecina? ¡Probá el poder de mi Fuego Sombrío!",
        "HAHAHAHA CKY!!! Did you think you could mess with my Mistress the Neighbor's plans? Taste the power of my Shadow Flame!",
        () => {
          onTriggerDialogue(
            "CKY",
            "¡Dejá en paz a mi compañero, espíritu asqueroso! ¡Equipo, a la formación de combate!",
            "Leave my friend alone, filthy spirit! Team, to battle formation!",
            () => {
              setShowDay6PossessedSoccerModal(true);
            }
          );
        }
      );
      return;
    }

    // Courtyard Soccer Minigame (Penalties with Mateo / Ball / Goal)
    if (
      currentMap === "school_courtyard" &&
      (target.type === "soccer_ball" || target.type === "soccer_goal" || (target.type === "npc" && (target.npc.id === "mateo_soccer" || target.npc.id === "class_mateo")))
    ) {
      playSound(320, "sine", 0.2);
      onTriggerDialogue(
        "Mateo (Compañero de Escuela)",
        "¡Ey CKY! ¿Querés patear unos penales? ¡A ver si me clavás un bombazo al ángulo o te atajo todo!",
        "Hey CKY! Want to kick some penalties? Let's see if you can nail a screamer in the top corner or if I save everything!",
        () => {
          setShowSoccerMinigame(true);
        }
      );
      return;
    }

    // ==========================================
    // DAY 7 INTERACTION HANDLERS: INJUSTICIA & SÓTANO
    // ==========================================

    // Day 7: Director's Office - Expulsion by the Neighbor
    if (currentDay === 7 && currentMap === "director_office") {
      if (!day7DirectorExpulsionDone) {
        playSound(220, "sawtooth", 0.5);
        onTriggerDialogue(
          "Director Don Héctor (Ojos Púrpuras Sombríos)",
          "Señorita CKY... tome asiento. Por disposición irrevocable del Comité Vecinal Especial presidido por la distinguida Señora Vecina, queda formalmente EXPULSADA de esta institución escolar por 'conductas perturbadoras del orden'.",
          "Miss CKY... take a seat. By irrevocable order of the Special Neighborhood Committee presided by our distinguished Neighbor, you are formally EXPELLED from this school for 'disruptive behavior'.",
          () => {
            onTriggerDialogue(
              "CKY (Indignación Total)",
              "¡¿QUÉEE?! ¡¡Esto es una injusticia total!! ¡La Vecina no tiene ninguna autoridad sobre la escuela! ¡Está usando magia negra del Limbo para lavarles el cerebro a todos ustedes!",
              "WHAAAT?! This is complete injustice!! The Neighbor has no authority over this school! She's using Limbo black magic to brainwash all of you!",
              () => {
                onTriggerDialogue(
                  soulmateInfo?.name || "Alma Gemela",
                  "Che, director, aflojá un poco. Es cualquiera esto. Se nota a leguas que te metieron un parásito en la cabeza para sacarse a CKY de encima.",
                  "Hey, principal, back off. This is total nonsense. It's blatantly obvious they planted a parasite in your head to get rid of CKY.",
                  () => {
                    onTriggerDialogue(
                      "Director Don Héctor",
                      "¡Silencio! No toleraré insolencias. La resolución es definitiva. Retírense de inmediato del establecimiento escolar o llamaré a la policía.",
                      "Silence! I will not tolerate insolence. The ruling is final. Leave the school premises immediately or I will call the police.",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu)",
                          "¡Vamos a salir de acá ya mismo CKY! Siento una turbulencia brutal en el edificio... ¡algo muy podrido se está cociendo en la parte de abajo de la escuela!",
                          "Let's get out of here right now CKY! I feel a brutal turbulence in the building... something rotten is brewing in the basement!",
                          () => {
                            setDay7DirectorExpulsionDone(true);
                            setDay7BasementDiscovered(true);
                            localStorage.setItem("cky_day7_director_expulsion_done", "true");
                            localStorage.setItem("cky_day7_basement_discovered", "true");
                            addXP(50);
                            playSound(600, "sine", 0.4);
                            unlockDiaryEntry("chapter_07_injustice");
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
        return;
      } else {
        onTriggerDialogue(
          "Director Don Héctor (Bajo Posesión)",
          "¡Ya le he notificado su expulsión! Retírese del establecimiento escolar.",
          "I have already notified you of your expulsion! Leave the school premises."
        );
        return;
      }
    }

    // Day 7: Basement Maze - Steam Valve (Mission 1)
    if (currentMap === "school_basement" && ((pos.x <= 3 && pos.y >= 7) || target.type === "valve")) {
      if (!day7BasementValveTurned) {
        playSound(450, "triangle", 0.4);
        onTriggerDialogue(
          "Válvula de Presión de las Calderas",
          "🔩 Tomas la pesada rueda de hierro oxidado y la giras con todas tus fuerzas. Con un fuerte silbido de descompresión, ¡el vapor hirviente que bloqueaba el pasillo se disipa por completo! (+50 XP)",
          "🔩 You grab the heavy rusted iron wheel and turn it with all your strength. With a loud hiss of decompression, the scalding steam blocking the corridor dissipates! (+50 XP)",
          () => {
            setDay7BasementValveTurned(true);
            localStorage.setItem("cky_day7_valve_turned", "true");
            addXP(50);
            playSound(780, "sine", 0.4);
          }
        );
      } else {
        onTriggerDialogue(
          "Válvula de Presión",
          "La válvula ya está cerrada y la presión de vapor controlada.",
          "The valve is already shut and steam pressure is controlled."
        );
      }
      return;
    }

    // Day 7: Basement Maze - Minion 1 Battle (Espectro de las Calderas)
    if (
      currentMap === "school_basement" &&
      !day7BasementMinion1Defeated &&
      (Math.abs(pos.x - 6) <= 1 && Math.abs(pos.y - 5) <= 1)
    ) {
      playSound(200, "sawtooth", 0.5);
      onTriggerDialogue(
        "Espectro de las Calderas (Guardián del Limbo)",
        "¡¡Fsshhhhh...!! ¡Nadie pasará al sector de mantenimiento! ¡La Señora Vecina nos encomendó resguardar el corazón oscuro de la escuela!",
        "Fsshhhhh...!! None shall pass to the maintenance sector! The Lady Neighbor ordered us to guard the school's dark heart!",
        () => {
          onTriggerDialogue(
            soulmateInfo?.name || "Alma Gemela",
            "W nos dijo que este bicho es débil a los ataques de viento y luz astral. ¡Metele con todo, CKY!",
            "W told us this creep is weak to wind and astral light attacks. Hit it with everything, CKY!",
            () => {
              setShowDay7Minion1BattleModal(true);
            }
          );
        }
      );
      return;
    }

    // Day 7: Basement Maze - Maintenance Key in Toolbox (Mission 2)
    if (currentMap === "school_basement" && (pos.x >= 9 && pos.x <= 11 && pos.y <= 2)) {
      if (!day7BasementKeyFound) {
        playSound(520, "sine", 0.4);
        onTriggerDialogue(
          "Caja de Herramientas de Mantenimiento",
          "🔑 Revisas el viejo baúl de herramientas enmohecido y encuentras la 'Llave de Mantenimiento de Hierro Pesado'. Te servirá para abrir el portón enrejado. (+50 XP)",
          "🔑 You search the old rusty toolbox and find the 'Heavy Iron Maintenance Key'. It will open the barred gate. (+50 XP)",
          () => {
            setDay7BasementKeyFound(true);
            localStorage.setItem("cky_day7_key_found", "true");
            addInventoryItem({
              id: "backpack_key_maintenance",
              nameEs: "Llave de Mantenimiento del Sótano",
              nameEn: "Basement Maintenance Key",
              descEs: "Pesada llave de hierro oxidado para abrir el portón enrejado del sótano escolar.",
              descEn: "Heavy rusted iron key to unlock the barred gate in the school basement.",
              icon: "🔑",
              category: "backpack",
              isKey: true
            });
            addXP(50);
            playSound(880, "sine", 0.5);
          }
        );
      } else {
        onTriggerDialogue(
          "Caja de Herramientas",
          "La caja de herramientas ya está vacía.",
          "The toolbox is already empty."
        );
      }
      return;
    }

    // Day 7: Basement Maze - Iron Gate (Mission 3)
    if (currentMap === "school_basement" && (pos.x >= 11 && pos.x <= 13 && pos.y >= 4 && pos.y <= 6)) {
      if (!day7BasementGateUnlocked) {
        if (day7BasementKeyFound || inventory.some((i) => i.id === "backpack_key_maintenance")) {
          playSound(600, "triangle", 0.4);
          onTriggerDialogue(
            "Portón Enrejado de Hierro",
            "🔓 Introduces la Llave de Mantenimiento en el candado oxidado. Con un crujido metálico resonante, ¡el pesado portón se abre de par en par! (+50 XP)",
            "🔓 You insert the Maintenance Key into the rusted padlock. With a resonant metallic screech, the heavy gate swings open! (+50 XP)",
            () => {
              setDay7BasementGateUnlocked(true);
              localStorage.setItem("cky_day7_gate_unlocked", "true");
              addXP(50);
              playSound(740, "sine", 0.5);
            }
          );
        } else {
          playSound(250, "sawtooth", 0.4);
          onTriggerDialogue(
            "Portón Enrejado de Hierro",
            "🔒 El portón de gruesas barras de hierro está cerrado con un candado pesado. Necesitas encontrar la Llave de Mantenimiento en alguna caja del sótano.",
            "🔒 The heavy iron barred gate is locked with a sturdy padlock. You need to find the Maintenance Key in a basement toolbox."
          );
        }
      } else {
        onTriggerDialogue(
          "Portón Enrejado",
          "El portón de rejas está abierto y el paso habilitado.",
          "The barred gate is open and passable."
        );
      }
      return;
    }

    // Day 7: Basement Maze - Minion 2 Battle (Sombra de Discordia)
    if (
      currentMap === "school_basement" &&
      !day7BasementMinion2Defeated &&
      (Math.abs(pos.x - 14) <= 1 && Math.abs(pos.y - 4) <= 1)
    ) {
      playSound(200, "sawtooth", 0.5);
      onTriggerDialogue(
        "Sombra de Discordia (Minion del Limbo)",
        "¡¡Krrrkkkk!! ¡Tontos humanos! ¡No dejaré que destruyan el Generador del Limbo! ¡La Vecina dominará cada mente en esta ciudad!",
        "Krrrkkkk!! Foolish humans! I won't let you destroy the Limbo Generator! The Neighbor will dominate every mind in this town!",
        () => {
          onTriggerDialogue(
            "Ángela (Espíritu)",
            "¡A este bicho le encanta sembrar veneno mental! ¡Vamos a darle con la resonancia de amor y luz celestial!",
            "This creep loves spreading mental poison! Let's blast it with love resonance and celestial light!",
            () => {
              setShowDay7Minion2BattleModal(true);
            }
          );
        }
      );
      return;
    }

    // Day 7: Basement Maze - Limbo Arcane Generator (Mission 4)
    if (currentMap === "school_basement" && (pos.x >= 15 && pos.y <= 3)) {
      if (!day7BasementGeneratorDisabled) {
        playSound(680, "sine", 0.5);
        onTriggerDialogue(
          "Generador Arcano del Limbo",
          "⚡ Una máquina biomecánica palpitante con cristales violetas alimenta el sello dimensional del laboratorio escolar.",
          "⚡ A pulsating biomechanical engine with violet crystals powers the dimensional seal of the school laboratory.",
          () => {
            onTriggerDialogue(
              "W (Guardián Celestial)",
              "¡Permítame intervenir, mi señora CKY! Canalizaré el fulgor purificador de los antiguos guardianes sobre el núcleo de poder.",
              "Allow me to intervene, my lady CKY! I shall channel the purifying glow of ancient guardians onto the power core.",
              () => {
                playSound(880, "sine", 0.6);
                onTriggerDialogue(
                  "Purificación del Generador",
                  "✨ W emite un destello dorado cegador. Los cristales violetas estallan en chispas inofensivas y el generador colapsa. ¡La barrera que sellaba la puerta del Laboratorio ha sido completamente destruida! (+80 XP)",
                  "✨ W emits a blinding golden glow. The violet crystals burst into harmless sparks and the generator collapses. The barrier sealing the Laboratory door is destroyed! (+80 XP)",
                  () => {
                    setDay7BasementGeneratorDisabled(true);
                    localStorage.setItem("cky_day7_generator_disabled", "true");
                    addXP(80);
                    playSound(960, "sine", 0.5);
                  }
                );
              }
            );
          }
        );
      } else {
        onTriggerDialogue(
          "Generador Arcano del Limbo",
          "El generador yace purificado y apagado. El camino al Laboratorio escolar está despejado.",
          "The generator lies purified and shutdown. The path to the school Laboratory is clear."
        );
      }
      return;
    }

    // Day 7: School Laboratory - Boss Battle & Liberation
    if (currentMap === "school_laboratory") {
      if (!day7LaboratoryBossDefeated) {
        playSound(180, "sawtooth", 0.6);
        onTriggerDialogue(
          "Espíritu Alquimista Oscuro (Boss del Limbo)",
          "¡¡JAJAJAJA!! ¡Llegan tarde, mocosos insolentes! ¡El Profesor Montenegro y su alumna Abril ya casi terminan de sintetizar el brebaje sombrío para envenenar el agua de toda la escuela por orden de mi Ama la Vecina!",
          "HAHAHAHA!! You're too late, insolent brats! Professor Montenegro and student Abril have almost finished synthesizing the shadow brew to poison the entire school's water by order of my Mistress the Neighbor!",
          () => {
            onTriggerDialogue(
              "CKY (Determinación de Acero)",
              "¡Soltá al profesor y a Abril ahora mismo, bicho asqueroso! ¡No vamos a permitir que le hagan daño a nadie más!",
              "Release the professor and Abril right now, you filthy monster! We won't let you hurt anyone else!",
              () => {
                onTriggerDialogue(
                  soulmateInfo?.name || "Alma Gemela",
                  "Preparate que te vamos a dar una paliza épica con todo lo que W estudió en el Grimorio.",
                  "Get ready because we're gonna give you an epic beatdown with everything W studied in the Grimoire.",
                  () => {
                    setShowDay7LabBossBattleModal(true);
                  }
                );
              }
            );
          }
        );
        return;
      } else {
        // Boss already defeated - interact with liberated Professor and Abril
        playSound(550, "sine", 0.4);
        onTriggerDialogue(
          "Profesor Montenegro (Profesor de Química - Liberado)",
          "¡CKY! ¡Nos salvaron la vida y la cordura! Esa entidad sombría nos tenía hipnotizados obligándonos a trabajar. Me enteré de la supuesta expulsión que tramó la Vecina con el director poseído... ¡Es un atropello infame! Como delegado docente presentaré una impugnación urgente ante el Consejo Escolar para anularla.",
          "CKY! You saved our lives and sanity! That shadow entity had us hypnotized. I heard about the fake expulsion framed by the Neighbor... It is an infamous outrage! As teacher representative, I will file an urgent appeal to annul it.",
          () => {
            onTriggerDialogue(
              "Abril (Compañera de Clase - Liberada)",
              "¡Muchísimas gracias CKY! ¡Y gracias a tu equipo! Pensé que no íbamos a salir jamás de esta pesadilla subterránea. ¡Sos nuestra heroína!",
              "Thank you so much CKY! And thanks to your team! I thought we would never escape this underground nightmare. You are our hero!",
              () => {
                onTriggerDialogue(
                  "Ángela (Espíritu)",
                  "¡Tomaaaa! ¡Liberamos el laboratorio, rescatamos al profe y a Abril, y la farsa de la Vecina se cae a pedazos!",
                  "Take that! We liberated the lab, saved the teacher and Abril, and the Neighbor's farce is falling apart!"
                );
              }
            );
          }
        );
        return;
      }
    }

    // Day 8: Bus stop guidance in Street
    if (currentDay === 8 && currentMap === "street" && (target.type === "bus_stop_line_4" || target.type === "school_bus")) {
      onTriggerDialogue(
        "W (Espíritu Guardián)",
        "Señora CKY, use el Rastreador Táctico de Asedio en la esquina superior para desplazarse de inmediato a la Plaza, al Hospital, a la Terminal o al Shopping.",
        "Lady CKY, use the Tactical Siege Tracker in the top corner to move immediately to the Plaza, Hospital, Terminal, or Mall."
      );
      return;
    }

    // Day 8: Boss Interactions in 4 locations
    if (currentDay === 8 && currentMap === "plaza_principal" && (target.type === "plaza_fountain_boss" || (pos.x >= 6 && pos.x <= 9 && pos.y >= 3 && pos.y <= 6))) {
      if (!day8PlazaDefended) {
        setActiveDay8Battle("plaza");
      } else {
        onTriggerDialogue(
          "Fuente de la Plaza Principal",
          "El agua fluye pura y cristalina. El Coloso Sombrío del Parque fue destruido y la plaza está a salvo.",
          "The water flows pure and crystal clear. The Shadow Park Colossus was destroyed and the plaza is safe."
        );
      }
      return;
    }

    if (currentDay === 8 && currentMap === "hospital_municipal" && (target.type === "hospital_triage_boss" || (pos.x >= 6 && pos.x <= 9 && pos.y >= 2 && pos.y <= 5))) {
      if (!day8HospitalDefended) {
        setActiveDay8Battle("hospital");
      } else {
        onTriggerDialogue(
          "Guardia del Hospital Municipal",
          "La sala de emergencias está segura y el Espectro de la Peste fue purificado por la luz ancestral.",
          "The emergency room is secure and the Plague Specter was purified by ancestral light."
        );
      }
      return;
    }

    if (currentDay === 8 && currentMap === "bus_terminal" && (target.type === "terminal_platform_boss" || (pos.x >= 5 && pos.x <= 10 && pos.y >= 3 && pos.y <= 6))) {
      if (!day8TerminalDefended) {
        setActiveDay8Battle("terminal");
      } else {
        onTriggerDialogue(
          "Andenes de la Terminal",
          "Los andenes están despejados y el Leviatán del Asfalto fue erradicado.",
          "The platforms are clear and the Asphalt Leviathan was eradicated."
        );
      }
      return;
    }

    if (currentDay === 8 && currentMap === "shopping_mall" && (target.type === "mall_rotunda_boss" || (pos.x >= 7 && pos.x <= 10 && pos.y >= 3 && pos.y <= 6))) {
      if (!day8MallDefended) {
        setActiveDay8Battle("mall");
      } else {
        onTriggerDialogue(
          "Rotonda del Shopping",
          "Las tiendas y pasillos relucen en paz. El Vórtice de Sombras fue erradicado.",
          "The shops and corridors shine in peace. The Shadow Vortex was eradicated."
        );
      }
      return;
    }

    // Day 4: Golem Boss at Ruins Valley
    if (currentDay === 4 && currentMap === "ruins_valley" && (target.type === "ruins_golem_altar" || target.npc?.id === "ruins_golem_boss" || (pos.x >= 7 && pos.x <= 11 && pos.y <= 4))) {
      if (!day4GolemDefeated) {
        playSound(240, "sawtooth", 0.5);
        onTriggerDialogue(
          "Golem Guardián Ancestral",
          "¡¡GRRRROOOOOAAAR!! ¡LOS INTRUSOS NO CRUZARÁN EL SELLO DE LA CORONA!",
          "GRRRROOOOOAAAR!! INTRUDERS SHALL NOT PASS THE CROWN SEAL!",
          () => {
            onTriggerDialogue(
              "W (Espíritu Guardián)",
              "¡Señora Heredera CKY! El coloso rúnico canaliza la dureza de la montaña. ¡Combine mi escudo sagrado con las burlas de Ángela y su resonancia de heredera para fracturar su núcleo!",
              "Lady Heir CKY! The runic colossus channels the mountain's hardness. Combine my sacred shield with Angela's taunts and your heir resonance to shatter its core!",
              () => {
                soundEngine.playSfx("critical");
                setDay4GolemDefeated(true);
                localStorage.setItem("cky_day4_golem_defeated", "true");
                addXP(120);
                unlockDiaryEntry("chapter_04_ancient_ruins_golem");
                onTriggerDialogue(
                  "¡Victoria contra el Golem Guardián!",
                  "¡CRASHHH! Las runas del coloso colapsan en una lluvia de esquirlas de roca brillante. El altar sagrado queda liberado. W se inclina: '¡Magnífica sincronía, Señora CKY! Acérquese ahora al sitio del cofre enterrado al este (Col 14, Row 4) para desenterrar el tesoro.'",
                  "CRASHHH! The colossus's runes collapse into glowing rock shards. The altar is freed. W bows: 'Magnificent synergy, Lady CKY! Approach the buried chest site to the east (Col 14, Row 4) to unearth the treasure.'"
                );
              }
            );
          }
        );
      } else {
        onTriggerDialogue(
          "Altar del Golem",
          "Los restos del Golem Guardián descansan en paz, convertidos en gravilla rúnica purificada.",
          "The Guardian Golem's remains rest in peace as purified runic gravel."
        );
      }
      return;
    }

    // Day 4: Buried Treasure Excavation with W Shovel
    if (currentDay === 4 && currentMap === "ruins_valley" && (target.type === "ruins_buried_chest" || (pos.x >= 12 && pos.x <= 15 && pos.y >= 3 && pos.y <= 5))) {
      if (!day4GolemDefeated) {
        onTriggerDialogue(
          "Tierra Sellada",
          "Unas raíces petrificadas y un sello mágico de piedra impiden cavar aquí. Debes derrotar al Golem primero.",
          "Petrified roots and a magic seal prevent digging here. You must defeat the Golem first."
        );
      } else if (!day4TreasureDug) {
        onTriggerDialogue(
          "W (Espíritu Guardián)",
          "¡Ha llegado el momento, Señora Heredera! ¡Permítame transfigurarme en la Pala Sagrada Dorada para desenterrar el Antiguo Tesoro Oculto!",
          "The time has come, Lady Heir! Allow me to transfigure into the Golden Sacred Shovel to dig up the Ancient Hidden Treasure!",
          () => {
            setActiveCinematicType("day4_ruins_treasure");
          }
        );
      } else {
        onTriggerDialogue(
          "Cofre Desenterrado",
          "Ya excavaron el legendario cofre con W Pala. Los $50.000 están a salvo en tu mochila.",
          "You already dug up the legendary chest with W Shovel. The $50,000 are safe in your backpack."
        );
      }
      return;
    }

    // Day 5: Airport Hot Dog & Bet Payment with Neighbor
    if (currentDay === 5 && currentMap === "airport_terminal" && (target.type === "airport_hotdog_stand" || target.npc?.id === "airport_neighbor_winner" || target.npc?.id === "don_pepe_hotdogs" || (pos.x >= 2 && pos.x <= 6 && pos.y >= 5 && pos.y <= 7))) {
      if (!day5PaidAirportBet) {
        onTriggerDialogue(
          "Vecina (Ganadora Tramposa)",
          "¡JAJAJAJA llegué primera con tiempo récord! ¿Viste mi velocidad CKY? ¡Misteriosamente aparecí en la terminal en dos segundos!",
          "HAHAHAHA I arrived first with record time! Did you see my speed CKY? Mysteriously appeared at the terminal in two seconds!",
          () => {
            onTriggerDialogue(
              "Vecina (Cobrando la Apuesta)",
              "¡Aceptá tu derrota! Hablá con Don Pepe y pagame el súper pancho con lluvia de papas pay y la Coca-Cola bien helada como habíamos apostado.",
              "Accept defeat! Talk to Don Pepe and buy me the super hot dog with crispy potato sticks and ice-cold Coke as we bet.",
              () => {
                setActiveCinematicType("day5_airport_race");
              }
            );
          }
        );
      } else {
        onTriggerDialogue(
          "Panchería Don Pepe",
          "La vecina degusta felizmente su súper pancho crocante. Ya pagaste la apuesta. ¡Hora de volver a casa a bañarse!",
          "The neighbor is happily enjoying her hot dog. You already paid the bet. Time to head home for a shower!"
        );
      }
      return;
    }

    // Shopping Mall: Boutique, Lingerie, Perfume, Cafe, Fountain & Fitting Mirror
    if (currentMap === "shopping_mall") {
      if (target.type === "mall_boutique" || target.npc?.id === "mall_boutique_seller" || (pos.x >= 1 && pos.x <= 5 && pos.y <= 3)) {
        soundEngine.playSfx("dialogue");
        setActiveShopType("boutique");
        return;
      }
      if (target.type === "mall_lingerie_shop" || target.npc?.id === "mall_lingerie_seller" || (pos.x >= 11 && pos.x <= 16 && pos.y <= 3)) {
        soundEngine.playSfx("dialogue");
        setActiveShopType("lingerie");
        return;
      }
      if (target.type === "mall_perfume_stand" || target.npc?.id === "mall_perfume_seller" || (pos.x >= 6 && pos.x <= 10 && pos.y >= 5 && pos.y <= 7)) {
        soundEngine.playSfx("dialogue");
        setActiveShopType("perfume");
        return;
      }
      if (target.type === "mall_cafe" || target.npc?.id === "mall_cafe_barista" || (pos.x >= 1 && pos.x <= 4 && pos.y >= 7 && pos.y <= 9)) {
        soundEngine.playSfx("dialogue");
        setActiveShopType("cafe");
        return;
      }
      if (target.type === "mall_fountain" || (pos.x >= 7 && pos.x <= 9 && pos.y >= 3 && pos.y <= 5)) {
        setActiveShopType("fountain");
        return;
      }
      if (target.type === "mall_fitting_mirror") {
        setShowWardrobeModal(true);
        return;
      }
    }

    // Airport Terminal: Panchería Don Pepe (When race bet is not pending)
    if (currentMap === "airport_terminal" && (target.type === "airport_hotdog_stand" || target.npc?.id === "don_pepe_hotdogs" || (pos.x >= 2 && pos.x <= 6 && pos.y >= 5 && pos.y <= 7))) {
      soundEngine.playSfx("dialogue");
      setActiveShopType("don_pepe");
      return;
    }

    // Day 8: Neighbor Door Confrontation
    if (currentDay === 8 && currentMap === "street" && (target.type === "neighbor_door_1" || (pos.x >= 9 && pos.x <= 11 && pos.y <= 4))) {
      const allDefended = day8PlazaDefended && day8HospitalDefended && day8TerminalDefended && day8MallDefended;
      if (!allDefended) {
        onTriggerDialogue(
          "W (Espíritu Guardián)",
          "¡Aún no, Señora CKY! No podemos asaltar la casa de Paula mientras los cuatro sectores de la ciudad sigan bajo ataque sombrío. Debemos purificar la Plaza, el Hospital, la Terminal y el Shopping primero.",
          "Not yet, Lady CKY! We cannot assault Paula's house while the four city sectors remain under shadow attack. We must purify the Plaza, Hospital, Terminal, and Mall first."
        );
      } else if (!day8NeighborConfrontationDone) {
        setShowDay8NeighborClimaxModal(true);
      } else {
        onTriggerDialogue(
          "Puerta de la Vecina",
          "La casa de la vecina yace en ruinas y sellada por la supernova cósmica. La vecina escapó jurando venganza.",
          "The neighbor's house lies in ruins and sealed by cosmic supernova. The neighbor escaped swearing revenge."
        );
      }
      return;
    }
  };

  const isTileWalkable = (tile: number, map: string): boolean => {
    if (tile === 0) return true;
    if (map === "bedroom" && tile === 2) return true;
    if (map === "hallway" && (tile === 17 || tile === 18 || tile === 19 || tile === 3 || (tile >= 81 && tile <= 90))) return true;
    if (map === "empty_room" && (tile === 3 || tile === 26 || tile === 27 || tile === 28)) return true;
    if (map === "house" && (tile === 2 || tile === 3 || tile === 27 || tile === 28)) return true;
    if (map === "bathroom" && (tile === 2 || tile === 34)) return true;
    if (map === "sisters_room" && tile === 29) return true;
    if (map === "street" && (tile === 3 || tile === 5 || tile === 32 || tile === 135)) return true;
    if (map === "limbo" && tile === 5) return true;
    if (map === "ruins_valley" && (tile === 110 || tile === 111)) return true;
    if (map === "shopping_mall" && (tile >= 120 && tile <= 124)) return true;
    if (map === "airport_terminal" && tile === 135) return true;
    if (map === "soulmate_house" && (tile === 29 || tile === 32 || tile === 2)) return true;
    if (map === "soulmate_bedroom" && tile === 29) return true;
    if (map.startsWith("classroom_") && tile === 81) return true;
    if (map === "school_courtyard" && (tile === 81 || tile === 77)) return true;
    if (map === "school_hallway" && ((tile >= 81 && tile <= 90) || tile === 140)) return true;
    if ((map === "director_office" || map === "teachers_room" || map === "bathroom_girls" || map === "bathroom_boys") && tile === 81) return true;
    if (map === "school_basement") {
      if (tile === 140 || tile === 147 || tile === 149) return true;
      if (tile === 142 && day7BasementValveTurned) return true;
      if (tile === 144 && day7BasementGateUnlocked) return true;
      if (tile === 146 && day7BasementGeneratorDisabled) return true;
    }
    if (map === "school_laboratory" && (tile === 146 || tile === 151)) return true;
    if (map === "plaza_principal" && (tile === 165 || tile === 160)) return true;
    if (map === "hospital_municipal" && (tile === 174 || tile === 170)) return true;
    if (map === "bus_terminal" && (tile === 185 || tile === 180)) return true;
    return false;
  };

  const findPath = (
    start: Position,
    goal: Position,
    grid: number[][],
    map: string
  ): Position[] | null => {
    if (start.x === goal.x && start.y === goal.y) return [];
    const queue: Position[] = [start];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);
    const parent = new Map<string, Position>();

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.x === goal.x && curr.y === goal.y) {
        const path: Position[] = [];
        let step = curr;
        while (step.x !== start.x || step.y !== start.y) {
          path.unshift(step);
          const key = `${step.x},${step.y}`;
          step = parent.get(key)!;
        }
        return path;
      }

      const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];

      for (const d of dirs) {
        const nx = curr.x + d.x;
        const ny = curr.y + d.y;
        const key = `${nx},${ny}`;
        if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length && !visited.has(key)) {
          const tile = grid[ny][nx];
          const walkable = isTileWalkable(tile, map) || (nx === goal.x && ny === goal.y);
          if (walkable) {
            visited.add(key);
            parent.set(key, curr);
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }
    return null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    soundEngine.unlockAudio();

    // Handle intro screen advances on mobile tap
    if (introStep !== -1) {
      androidBridge.hapticDialogue();
      advanceIntro();
      return;
    }
    if (isDay2Intro) {
      androidBridge.hapticDialogue();
      advanceDay2Intro();
      return;
    }
    if (isDay3Intro) {
      androidBridge.hapticDialogue();
      advanceDay3Intro();
      return;
    }
    if (isDay4Intro) {
      androidBridge.hapticDialogue();
      advanceDay4Intro();
      return;
    }
    if (isDay5Intro) {
      androidBridge.hapticDialogue();
      advanceDay5Intro();
      return;
    }

    // Double-tap on canvas to toggle turbo run
    const now = Date.now();
    if (lastTapTimeRef.current && now - lastTapTimeRef.current < 320) {
      setIsSprinting((prev) => !prev);
      androidBridge.hapticAction();
    }
    lastTapTimeRef.current = now;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(clickX / TILE_SIZE);
    const row = Math.floor(clickY / TILE_SIZE);

    const grid = getGrid(currentMap);
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return;

    // Check if there is an NPC at this tile
    const npcs = getNPCs();
    const clickedNpc = npcs.find(n => n.x === col && n.y === row);

    const tile = grid[row][col];
    const isSolid = !isTileWalkable(tile, currentMap);
    const isObstacle = isSolid || !!clickedNpc;

    if (isObstacle) {
      // Find adjacent walkable neighbors to stand on to interact with this obstacle
      const neighbors = [
        { x: col, y: row - 1, face: "down" as Direction }, // Stand above, look down
        { x: col, y: row + 1, face: "up" as Direction },   // Stand below, look up
        { x: col - 1, y: row, face: "right" as Direction }, // Stand left, look right
        { x: col + 1, y: row, face: "left" as Direction }   // Stand right, look left
      ];

      let bestPath: Position[] | null = null;
      let bestFace: Direction = "down";

      for (const n of neighbors) {
        if (n.y < 0 || n.y >= grid.length || n.x < 0 || n.x >= grid[0].length) continue;
        
        // Is neighbor walkable?
        const nTile = grid[n.y][n.x];
        const nSolid = !isTileWalkable(nTile, currentMap);
        
        const nNpc = npcs.find(npc => npc.x === n.x && npc.y === n.y);
        if (nSolid || nNpc) continue;

        // Already adjacent? Just turn and interact!
        if (playerPos.x === n.x && playerPos.y === n.y) {
          setFacing(n.face);
          setWalkPath([]);
          setPendingInteraction(null);
          androidBridge.hapticAction();
          
          const targetFace = n.face;
          const currentPos = { ...playerPos };
          setTimeout(() => {
            performInteraction(currentPos, targetFace);
          }, 80);
          return;
        }

        const path = findPath(playerPos, { x: n.x, y: n.y }, grid, currentMap);
        if (path) {
          if (!bestPath || path.length < bestPath.length) {
            bestPath = path;
            bestFace = n.face;
          }
        }
      }

      if (bestPath) {
        androidBridge.hapticTap();
        setWalkPath(bestPath);
        setPendingInteraction({ x: col, y: row, face: bestFace });
      } else {
        triggerBeep(120); // obstacle thump error beep
      }
    } else {
      // Simple floor walk
      if (playerPos.x === col && playerPos.y === row) return; // already here

      const path = findPath(playerPos, { x: col, y: row }, grid, currentMap);
      if (path) {
        androidBridge.hapticTap();
        setWalkPath(path);
        setPendingInteraction(null);
      } else {
        triggerBeep(120); // unroutable block beep
      }
    }
  };

  // Stepper effect for Tap-to-Move along path
  useEffect(() => {
    if (walkPath.length === 0) {
      if (pendingInteraction) {
        const { face } = pendingInteraction;
        setFacing(face);
        setPendingInteraction(null);
        setTimeout(() => {
          androidBridge.hapticAction();
          performInteraction();
        }, 60);
      }
      return;
    }

    const nextStep = walkPath[0];
    const dx = nextStep.x - playerPos.x;
    const dy = nextStep.y - playerPos.y;

    let nextFace: Direction = facing;
    if (dx > 0) nextFace = "right";
    else if (dx < 0) nextFace = "left";
    else if (dy > 0) nextFace = "down";
    else if (dy < 0) nextFace = "up";

    const stepDelay = isSprinting ? 95 : 160;
    const timer = window.setTimeout(() => {
      setFacing(nextFace);
      movePlayer(dx, dy, nextFace);
      setWalkPath((prev) => prev.slice(1));
    }, stepDelay);

    return () => clearTimeout(timer);
  }, [walkPath, playerPos, isSprinting, pendingInteraction, facing]);

  // Switch level animation and state loader
  const transitionToMap = (mapId: typeof currentMap, newPos: Position) => {
    playSound(200, "triangle", 0.3);
    setIsTransitioning(true);
    setFadeOpacity(1);
    
    setTimeout(() => {
      setCurrentMap(mapId);
      setPlayerPos(newPos);
      motionInterpolatorRef.current.teleport(newPos.x, newPos.y);
      particleEngineRef.current.clear();
      setFadeOpacity(0);
      setIsTransitioning(false);

      if (onAutosave) {
        onAutosave();
      }

      if ((mapId === "bedroom" || mapId === "empty_room" || mapId === "house") && currentDay === 7 && day7LaboratoryBossDefeated && !day7AlanisBedroomArgumentDone) {
        setTimeout(() => {
          triggerDay7AlanisBedroomCutscene();
        }, 300);
      }
      if ((mapId === "bedroom" || mapId === "empty_room" || mapId === "house") && currentDay === 7 && day7SoulmateIntelDone && !day7ReturnedHomeReportDone) {
        setTimeout(() => {
          triggerDay7ReturnHomeReport();
        }, 300);
      }

      if (mapId === "bedroom" && currentDay === 6 && day6PossessedSoccerDefeated && !day6AlanisBedroomArgumentDone) {
        setTimeout(() => {
          triggerDay6AlanisBedroomCutscene();
        }, 300);
      }
      if (mapId === "bedroom" && currentDay === 6 && day6GrimoireObtained && !day6ConfessionDone) {
        setTimeout(() => {
          triggerDay6ReturnHomeConfession();
        }, 300);
      }
      if (mapId === "bedroom" && currentDay === 6 && day6ForgotTowel && !day6DressedAfterShower) {
        setTimeout(() => {
          onTriggerDialogue(
            "CKY",
            "¡¡Uff, llegué a mi habitación a salvo en cueros!! ¡A buscar ropa rápido en el ropero antes de que alguien me vea!",
            "Phew, made it to my room safely naked!! Quick, get clothes from the wardrobe before anyone sees me!"
          );
        }, 300);
      }
      if (mapId === "hallway" && !hasVisitedHallway) {
        setHasVisitedHallway(true);
        setTimeout(() => {
          onTriggerDialogue(
            "CKY",
            "Este pasillo SIEMPRE esta OSCURO y hace mucho frio. Se siente como si alguien me observa.",
            "This hallway is ALWAYS DARK and very cold. It feels like someone is watching me."
          );
        }, 300);
      }

      if (mapId === "house" && !hasSeenMomKitchenIntro) {
        setHasSeenMomKitchenIntro(true);
        setTimeout(() => {
          onTriggerDialogue(
            "CKY",
            "Esa que ven ahí es mi madre. Me ama como nadie y es una madre modelo... solo en las redes sociales, porque en la realidad es mmmmm... ya lo van a descubrir.",
            "That's my mother over there. She loves me like no one else and is a model mother... only on social media, because in reality she is mmmmm... you'll find out soon enough."
          );
        }, 300);
      }

      if (mapId === "house" && classStep >= 5) {
        setGameTimeTo(13, 0);
      }
    }, 400);
  };

  // Spiritual Combat Module launch
  const startCombatState = () => {
    playSound(100, "sawtooth", 0.8);
    onStateChange("combat");
  };

  return (
    <div className="flex flex-col items-center bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-2xl max-w-full w-full">
      
      {/* Top Banner Status Bar */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-pink-500 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
            {currentMap === "bedroom" && (language === "es" ? "Habitación CKY" : "CKY Bedroom")}
            {currentMap === "moms_room" && (language === "es" ? "Habitación de Mamá" : "Mom's Bedroom")}
            {currentMap === "bathroom" && (language === "es" ? "Baño" : "Bathroom")}
            {currentMap === "hallway" && (language === "es" ? "Pasillo" : "Hallway")}
            {currentMap === "house" && (language === "es" ? "Casa de CKY" : "CKY House")}
            {currentMap === "street" && (language === "es" ? "Calle de la Ciudad" : "City Street")}
            {currentMap === "bus_interior" && (language === "es" ? "Colectivo Escolar (Interior)" : "School Bus (Interior)")}
            {currentMap === "limbo" && (language === "es" ? "El Limbo (Espíritus)" : "The Limbo")}
          </span>
        </div>

        {/* Story progress badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-mono text-cyan-400">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-spin-slow" />
          <span>
            {language === "es" ? "Fase 1: Cap 1" : "Phase 1: Cap 1"}
          </span>
        </div>
      </div>

      {/* Screen Frame Container with responsive scale wrapper */}
      <div className="relative border-4 border-slate-800 bg-black rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl aspect-[4/3] sm:h-[460px] touch-none select-none overscroll-none">
        <canvas
          ref={canvasRef}
          width={400}
          height={320}
          onClick={handleCanvasClick}
          className="w-full h-full block image-render-pixelated cursor-pointer bg-black touch-none select-none"
        />

        {/* HUD Clock & Map Badge - Top Left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 select-none pointer-events-none">
          <div 
            className="border px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-lg flex items-center gap-1.5"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", borderColor: "#e2e8f0", color: "#f8fafc" }}
          >
            <span className="animate-pulse">⏰</span>
            <span className="tracking-wider">
              {currentMap === "limbo" ? "??:??" : `${String(gameTime.hour).padStart(2, '0')}:${String(gameTime.minute).padStart(2, '0')} AM`}
            </span>
          </div>

          {/* Wallet Cash Badge */}
          <div 
            className="border px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-lg flex items-center gap-1 bg-slate-950/85 border-amber-500/50 text-amber-300"
          >
            <span>💵</span>
            <span>${(propStats?.money ?? 500).toLocaleString()}</span>
          </div>

          {/* Active Buffs Badges */}
          {propStats?.speedBuff && (
            <div 
              className="border px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-lg bg-emerald-950/85 border-emerald-500/50 text-emerald-300 animate-pulse" 
              title="Velocidad Pro Activa"
            >
              👟
            </div>
          )}
          {propStats?.perfumeBuff && (
            <div 
              className="border px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-lg bg-purple-950/85 border-purple-500/50 text-purple-300 animate-pulse" 
              title="Aura Francesa Nuit Éthérée"
            >
              🌸
            </div>
          )}
        </div>

        {/* Custom Fade Screen Transition overlay */}
        <div 
          className="absolute inset-0 bg-slate-950 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: fadeOpacity }}
        />

        {/* Cinematic Scanline Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-20" />

        {/* Diablo-Style Top Right RPG Action Bar Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          
          {/* 📱 Celular Button [P] */}
          <button
            onClick={() => {
              handleOpenPhone();
            }}
            className="relative border p-2 rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center bg-slate-900/90 border-slate-700 text-green-400 hover:border-green-400 hover:bg-slate-800"
            title={language === "es" ? "Abrir Celular Espiritual [Tecla P]" : "Open Spiritual Cellphone [P]"}
          >
            <Smartphone className="w-4 h-4 text-green-400" />
            {phoneChats.some(c => c.unread) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-ping" />
            )}
            {phoneChats.some(c => c.unread) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950" />
            )}
          </button>

          {/* 🎒 Mochila & Diario Button [I] */}
          <button
            onClick={() => {
              playSound(300, "sine", 0.15);
              onOpenDiary();
            }}
            className="border p-2 rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center bg-slate-900/90 border-slate-700 text-yellow-400 hover:border-yellow-400 hover:bg-slate-800"
            title={language === "es" ? "Mochila y Diario de Reflexión [Tecla I]" : "Backpack & Reflections [I]"}
          >
            <Briefcase className="w-4 h-4 text-yellow-400" />
          </button>

          {/* ♊ Compañeros Button [C] */}
          <button
            onClick={() => {
              playSound(300, "sine", 0.15);
              onOpenDiary();
            }}
            className="border p-2 rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center bg-slate-900/90 border-slate-700 text-cyan-400 hover:border-cyan-400 hover:bg-slate-800"
            title={language === "es" ? "Compañeros y Vínculos [Tecla C]" : "Companions & Stats [C]"}
          >
            <Users className="w-4 h-4 text-cyan-400" />
          </button>

          {/* 🗺️ Mapa Button [M] */}
          <button
            onClick={() => {
              playSound(350, "sine", 0.15);
              onOpenMap();
            }}
            className="border p-2 rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center bg-slate-900/90 border-slate-700 text-pink-400 hover:border-pink-400 hover:bg-slate-800 cursor-pointer"
            title={language === "es" ? "Mapa y Misiones [Tecla M]" : "Map & Quests [M]"}
          >
            <Map className="w-4 h-4 text-pink-400" />
          </button>

          {/* ⚡ Motor Gráfico HD Button [G] */}
          {onOpenGraphicsSettings && (
            <button
              onClick={() => {
                playSound(400, "sine", 0.15);
                onOpenGraphicsSettings();
              }}
              className="border p-2 rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center bg-slate-900/90 border-cyan-500/50 text-cyan-400 hover:border-cyan-300 hover:bg-cyan-950/60 cursor-pointer"
              title={language === "es" ? "Motor Gráfico HD [Tecla G]" : "HD Graphics Engine [G]"}
            >
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </button>
          )}

          {/* 🔊 Audio / Música BGM Settings Button */}
          <button
            onClick={() => {
              soundEngine.unlockAudio();
              setShowAudioModal(true);
            }}
            className="border p-2 rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center bg-slate-900/90 border-slate-700 text-purple-400 hover:border-purple-400 hover:bg-slate-800 cursor-pointer"
            title={language === "es" ? "Música y Sonido Retro" : "Music & Audio"}
          >
            <Volume2 className="w-4 h-4 text-purple-400" />
          </button>

        </div>

      </div>

      {/* Wardrobe Modal Selection */}
      {showWardrobeModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">👗</div>
            <h3 className="text-lg font-bold font-display text-yellow-400 uppercase tracking-wide">
              {language === "es" ? "Ropero - Elegir Vestimenta" : "Closet - Choose Outfit"}
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {language === "es" 
                ? "Elige qué ropa ponerte para salir de tu habitación hoy:" 
                : "Choose what clothes to put on today:"}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  advanceTime(5);
                  const status = checkAction6h("bedroom_uniform_change");
                  if (status.allowed) {
                    addXP(5);
                    recordAction6h("bedroom_uniform_change");
                    onTriggerDialogue(
                      "CKY",
                      "¡Te pusiste el uniforme de la escuela (+5 XP, +5 min)! Remera verde y jean azul. ¡Lista para el colegio!",
                      "You put on the school uniform (+5 XP, +5 min)!"
                    );
                  } else {
                    onTriggerDialogue(
                      "CKY",
                      "Te pusiste el uniforme de la escuela (+5 min). Remera verde y jean azul.",
                      "You put on the school uniform (+5 min)."
                    );
                  }
                  setCurrentOutfit("uniform");
                  setShowWardrobeModal(false);
                  playSound(450, "triangle", 0.3);
                  unlockAchievement("ach_uniform", onShowNotification, addXP);
                  if (currentDay === 6 && !day6WardrobeUniformDone) {
                    setDay6WardrobeUniformDone(true);
                    addXP(10);
                    advanceTime(5);
                    onTriggerDialogue(
                      soulmateInfo?.name || "Kael",
                      "¡Uy, perdón! ¡Me doy vuelta ya mismo así te cambiás tranquila! (Se re sonroja)",
                      "Whoops, sorry! Turning around right now so you can change in peace! (Blushes hard)",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu)",
                          "¡Jajajajaja mirá cómo se pone colorado el híbrido! ¡Menos mal que su mitad humana todavía tiene vergüenza! Dale CKY, te queda pintado el uniforme escolar.",
                          "HAHAHAHA look how red the hybrid gets! Good thing his human half still gets shy! Come on CKY, that school uniform looks sharp on you."
                        );
                      }
                    );
                  }
                }}
                className={`w-full py-2.5 px-4 rounded-xl border text-left font-mono text-xs flex items-center justify-between transition-all ${
                  currentOutfit === "uniform"
                    ? "bg-green-500/20 border-green-500 text-green-300 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-green-500/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🎒</span>
                  <div>
                    <p className="font-bold">Uniforme de la Escuela (+5 XP, +5 min)</p>
                    <p className="text-[10px] text-slate-400">Remera verde y jean azul (Correcto)</p>
                  </div>
                </div>
                {currentOutfit === "uniform" && <span className="text-green-400">✓</span>}
              </button>

              <button
                onClick={() => {
                  advanceTime(5);
                  setCurrentOutfit("pajamas");
                  setShowWardrobeModal(false);
                  playSound(450, "triangle", 0.3);
                  onTriggerDialogue(
                    "CKY",
                    "Te cambiaste al piyama celeste (+5 min).",
                    "You changed into your light-blue pajamas (+5 min)."
                  );
                }}
                className={`w-full py-2.5 px-4 rounded-xl border text-left font-mono text-xs flex items-center justify-between transition-all ${
                  currentOutfit === "pajamas"
                    ? "bg-blue-500/20 border-blue-500 text-blue-300 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🛌</span>
                  <div>
                    <p className="font-bold">Piyama Celeste (+5 min)</p>
                    <p className="text-[10px] text-slate-400">Ropa cómoda de dormir</p>
                  </div>
                </div>
                {currentOutfit === "pajamas" && <span className="text-blue-400">✓</span>}
              </button>

              {currentDay === 7 && day7ShowerDone && !day7LingeriePacked && (
                <button
                  onClick={() => {
                    advanceTime(5);
                    setCurrentOutfit("casual");
                    setShowWardrobeModal(false);
                    setDay7LingeriePacked(true);
                    localStorage.setItem("cky_day7_lingerie_packed", "true");
                    addXP(50);
                    playSound(880, "sine", 0.4);
                    onTriggerDialogue(
                      "CKY (Ropa Común & Mochila Preparada)",
                      "Te pusiste tu ropa común cómoda, tomaste el Conjunto de Lencería Sexy Roja de encaje del ropero, lo doblaste con cuidado y lo guardaste en el fondo de tu mochila (+50 XP).",
                      "You put on your comfortable casual clothes, took the Sexy Red Lace Lingerie set from the wardrobe, folded it carefully, and packed it into your backpack (+50 XP).",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu - Risitas Desubicadas)",
                          "¡¡Esaaa, qué pícara!! ¡Llevás el contrabando de alto voltaje escondido en la mochila! ¡Imaginate si tu mamá te revisa los útiles y encuentra ese encaje salvaje al lado del cuaderno de Historia! ¡Le da un infarto en cuotas! ¡Ahora rajá para la casa del galán!",
                          "Ooooh, so cheeky!! Smuggling high-voltage contraband in your backpack! Imagine if your mom checks your notebooks and finds that wild lace! Heart attack on arrival! Now hurry to the heartthrob's house!"
                        );
                      }
                    );
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-rose-500 bg-rose-950/40 text-rose-300 font-mono font-bold text-xs flex items-center justify-between hover:bg-rose-900/60 transition-all cursor-pointer animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎒</span>
                    <div>
                      <p className="font-bold text-rose-300">Vestir Ropa Común y Guardar Lencería Roja (+50 XP)</p>
                      <p className="text-[10px] text-rose-400">Ropa común puesta y lencería en la mochila</p>
                    </div>
                  </div>
                  <span className="text-rose-400 font-bold">➔</span>
                </button>
              )}

              <button
                onClick={() => {
                  advanceTime(5);
                  setCurrentOutfit("casual");
                  setShowWardrobeModal(false);
                  playSound(450, "triangle", 0.3);
                  if (currentDay === 7 && day7ShowerDone && !day7LingeriePacked) {
                    setDay7LingeriePacked(true);
                    localStorage.setItem("cky_day7_lingerie_packed", "true");
                    addXP(50);
                    playSound(880, "sine", 0.4);
                    onTriggerDialogue(
                      "CKY (Ropa Común & Mochila Preparada)",
                      "Te pusiste tu ropa común cómoda, tomaste el Conjunto de Lencería Sexy Roja de encaje del ropero, lo doblaste con cuidado y lo guardaste en el fondo de tu mochila (+50 XP).",
                      "You put on your comfortable casual clothes, took the Sexy Red Lace Lingerie set from the wardrobe, folded it carefully, and packed it into your backpack (+50 XP).",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu - Risitas Desubicadas)",
                          "¡¡Esaaa, qué pícara!! ¡Llevás el contrabando de alto voltaje escondido en la mochila! ¡Imaginate si tu mamá te revisa los útiles y encuentra ese encaje salvaje al lado del cuaderno de Historia! ¡Le da un infarto en cuotas! ¡Ahora rajá para la casa del galán!",
                          "Ooooh, so cheeky!! Smuggling high-voltage contraband in your backpack! Imagine if your mom checks your notebooks and finds that wild lace! Heart attack on arrival! Now hurry to the heartthrob's house!"
                        );
                      }
                    );
                  } else if (currentDay === 8) {
                    setDay8OutfitReady(true);
                    localStorage.setItem("cky_day8_outfit_ready", "true");
                    addXP(25);
                    onTriggerDialogue(
                      "CKY (Ropa Casual para la Batalla)",
                      "Te pusiste tu ropa casual cómoda (buzo violeta y zapatillas). Ya estás lista para salir a la calle a defender la ciudad (+25 XP).",
                      "You put on your comfortable casual clothes (violet hoodie and sneakers). You're ready to head outside to defend the town (+25 XP)."
                    );
                  } else {
                    onTriggerDialogue(
                      "CKY",
                      "Te pusiste tu ropa casual preferida: buzo violeta (+5 min).",
                      "You put on your favorite casual clothes: violet hoodie (+5 min)."
                    );
                  }
                }}
                className={`w-full py-2.5 px-4 rounded-xl border text-left font-mono text-xs flex items-center justify-between transition-all ${
                  currentOutfit === "casual"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-purple-500/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>👚</span>
                  <div>
                    <p className="font-bold">Ropa Casual (+5 min)</p>
                    <p className="text-[10px] text-slate-400">Buzo violeta y pantalón cómodo</p>
                  </div>
                </div>
                {currentOutfit === "casual" && <span className="text-purple-400">✓</span>}
              </button>
              <button
                onClick={() => {
                  advanceTime(5);
                  setCurrentOutfit("sport");
                  setShowWardrobeModal(false);
                  playSound(600, "triangle", 0.3);
                  onTriggerDialogue(
                    "CKY (Ropa Deportiva)",
                    "Te pusiste el conjunto deportivo de running: top atlético, calzas y zapatillas livianas (+5 min).",
                    "You equipped your running sportswear: athletic top, leggings and running shoes (+5 min)."
                  );
                }}
                className={`w-full py-2.5 px-4 rounded-xl border text-left font-mono text-xs flex items-center justify-between transition-all ${
                  currentOutfit === "sport"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🏃‍♀️</span>
                  <div>
                    <p className="font-bold">Ropa Deportiva de Running (+5 min)</p>
                    <p className="text-[10px] text-slate-400">Top atlético y calzas livianas</p>
                  </div>
                </div>
                {currentOutfit === "sport" && <span className="text-emerald-400">✓</span>}
              </button>

              {currentDay === 5 && !day5CleanedBedroom && (
                <button
                  onClick={() => {
                    setShowWardrobeModal(false);
                    setDay5WTransformTool("duster");
                    playSound(650, "sine", 0.4);
                    onTriggerDialogue(
                      "CKY",
                      "¡¡¡PARÁ W, HAY CUCARACHAS GIGANTES VOLADORAS ATRÁS DEL ROPERO!!!",
                      "WAIT W, THERE ARE GIANT FLYING COCKROACHES BEHIND THE WARDROBE!!!",
                      () => {
                        onTriggerDialogue(
                          "W (Plumero Celestial)",
                          "¡¡Transfiguración en Plumero Celestial! ¡Ráfaga de plumas doradas purificadoras exterminadoras de cucarachas!",
                          "Celestial Duster transfiguration! Blast of purifying golden feathers exterminating cockroaches!",
                          () => {
                            setDay5CleanedBedroom(true);
                            setDay5RoachesDefeated(true);
                            setDay5WTransformTool("light");
                            addXP(40);
                            advanceTime(15);
                            playSound(880, "sine", 0.5);
                            onTriggerDialogue(
                              "Ángela (Espíritu)",
                              "¡¡Esooooo CKY, la hiciste puré con la ojota y W la terminó de barrer!! ¡La habitación quedó impecable!",
                              "YAAAS CKY, squashed with the flip-flop and W swept it away!! Bedroom is spotless!"
                            );
                          }
                        );
                      }
                    );
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-yellow-500 bg-yellow-950/40 text-yellow-300 font-mono font-bold text-xs flex items-center justify-between hover:bg-yellow-900/60 transition-all cursor-pointer animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <span>🧹</span>
                    <div>
                      <p className="font-bold">Limpiar Habitación con W (Batalla Cucarachas)</p>
                      <p className="text-[10px] text-yellow-400">Plumero Celestial + Ojotazo Purificador</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-bold">➔</span>
                </button>
              )}

              {currentDay === 5 && day5ShowerDone && !day5SexyPhotosTaken && (
                <button
                  onClick={() => {
                    setShowWardrobeModal(false);
                    setCurrentOutfit("lingerie_sexy");
                    setShowDay5PhotoModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-rose-500 bg-rose-950/40 text-rose-300 font-mono font-bold text-xs flex items-center justify-between hover:bg-rose-900/60 transition-all cursor-pointer animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <span>📸</span>
                    <div>
                      <p className="font-bold">Sesión de Fotos Sexy en Lencería</p>
                      <p className="text-[10px] text-rose-400">Poses, flashes y comentarios con Ángela y W</p>
                    </div>
                  </div>
                  <span className="text-rose-400 font-bold">➔</span>
                </button>
              )}

              {(day4LingerieBought || inventory.some(i => i.id === "lingerie_sexy_item")) && (
                <button
                  onClick={() => {
                    advanceTime(5);
                    setCurrentOutfit("lingerie_sexy");
                    setShowWardrobeModal(false);
                    playSound(650, "triangle", 0.4);
                    onTriggerDialogue(
                      "CKY (Lencería Sexy)",
                      "Te probaste el conjunto exclusivo de encaje rojo comprado en el shopping. ¡Luces verdaderamente despampanante y sexy (+5 min)!",
                      "You put on the exclusive crimson lace lingerie set. You look breathtakingly sexy (+5 min)!",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu)",
                          "¡¡DIOSA TOTAL CKY!! ¡Mirate en el espejo, ese color rojo pasión y el encaje te quedan perfectos!",
                          "TOTAL GODDESS CKY!! Look at you in the mirror, crimson passion fits you flawlessly!"
                        );
                      }
                    );
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl border text-left font-mono text-xs flex items-center justify-between transition-all ${
                    currentOutfit === "lingerie_sexy" || currentOutfit === "lingerie"
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 font-bold"
                      : "bg-slate-950/80 border-rose-900/50 text-rose-300 hover:border-rose-500 hover:bg-rose-950/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>👙</span>
                    <div>
                      <p className="font-bold text-rose-400">Lencería Sexy Roja (+5 min)</p>
                      <p className="text-[10px] text-rose-300/70">Conjunto exclusivo de encaje fino</p>
                    </div>
                  </div>
                  {(currentOutfit === "lingerie_sexy" || currentOutfit === "lingerie") && <span className="text-rose-400">✓</span>}
                </button>
              )}

              {(day4SilkPajamasBought || inventory.some(i => i.id === "pajamas_silk_item")) && (
                <button
                  onClick={() => {
                    advanceTime(5);
                    setCurrentOutfit("pajamas_silk");
                    setShowWardrobeModal(false);
                    playSound(650, "triangle", 0.4);
                    onTriggerDialogue(
                      "CKY (Piyama de Seda)",
                      "Te pusiste tu nuevo piyama de seda fina rosa comprado en la boutique. ¡Es suave como las nubes y súper glamoroso (+5 min)!",
                      "You changed into your new pink silk pajamas from the boutique. Soft as clouds and super glamorous (+5 min)!"
                    );
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl border text-left font-mono text-xs flex items-center justify-between transition-all ${
                    currentOutfit === "pajamas_silk"
                      ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold"
                      : "bg-slate-950/80 border-pink-900/50 text-pink-300 hover:border-pink-500 hover:bg-pink-950/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>✨👘</span>
                    <div>
                      <p className="font-bold text-pink-400">Piyama de Seda Fina (+5 min)</p>
                      <p className="text-[10px] text-pink-300/70">Seda rosada de alta costura</p>
                    </div>
                  </div>
                  {currentOutfit === "pajamas_silk" && <span className="text-pink-400">✓</span>}
                </button>
              )}

              {(day4GalaDressBought || inventory.some(i => i.id === "dress_gala_item")) && (
                <button
                  onClick={() => {
                    advanceTime(5);
                    setCurrentOutfit("dress_gala");
                    setShowWardrobeModal(false);
                    playSound(650, "triangle", 0.4);
                    onTriggerDialogue(
                      "CKY (Vestido de Gala)",
                      "Te probaste el vestido de gala elegante de alta costura con escote estilizado. ¡Pareces una celebridad de pasarela (+5 min)!",
                      "You put on the elegant high-fashion gala dress. You look like a runway celebrity (+5 min)!"
                    );
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl border text-left font-mono text-xs flex items-center justify-between transition-all ${
                    currentOutfit === "dress_gala"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                      : "bg-slate-950/80 border-amber-900/50 text-amber-300 hover:border-amber-500 hover:bg-amber-950/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>👗</span>
                    <div>
                      <p className="font-bold text-amber-400">Vestido Elegante de Gala (+5 min)</p>
                      <p className="text-[10px] text-amber-300/70">Vestido de noche de alta costura</p>
                    </div>
                  </div>
                  {currentOutfit === "dress_gala" && <span className="text-amber-400">✓</span>}
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowWardrobeModal(false);
                  setShowRoomCustomization(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-pink-500/40 bg-pink-950/40 hover:bg-pink-900/60 text-pink-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🎨</span>
                  <div>
                    <p className="font-bold">{language === "es" ? "Decorar Habitación" : "Customize Room"}</p>
                    <p className="text-[10px] text-pink-300/80">{language === "es" ? "Pósters de pared, acolchados y luces" : "Wall posters, bedspreads & lights"}</p>
                  </div>
                </div>
                <span className="text-pink-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowWardrobeModal(false)}
              className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Bed Interaction Choice Modal */}
      {showBedModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🛏️</div>
            <h3 className="text-lg font-bold font-display text-yellow-400 uppercase tracking-wide">
              {language === "es" ? "Cama de CKY" : "CKY's Bed"}
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {language === "es" 
                ? "Son las 5:10 AM. ¿Qué deseas hacer con tu cama?" 
                : "It is 5:10 AM. What do you want to do with your bed?"}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowBedModal(false);
                  if (currentDay === 7) {
                    if (!day7ReturnedHomeReportDone) {
                      onTriggerDialogue(
                        "CKY",
                        "Todavía no puedo acostarme. Tengo que cumplir la misión con mi gemelo e informarles a W y Ángela.",
                        "I can't sleep yet. I need to complete the mission with my soulmate and report to W and Angela."
                      );
                      return;
                    }
                    setDay7Completed(true);
                    localStorage.setItem("cky_day7_completed", "true");
                    unlockDiaryEntry("chapter_07_night_preparations_and_sleep");
                    addXP(150);
                    playSound(900, "sine", 0.6);
                    onTriggerDialogue(
                      "Noche de Descanso y Preparación Espiritual (Día 7)",
                      "Te acostás en tu cama con el piyama de seda fina. W flota en el centro de la habitación emitiendo un fulgor protector áureo que te resguarda de toda pesadilla. Ángela cuida desde arriba con sus bromas de siempre. Mañana Miércoles será el enfrentamiento decisivo en los cuatro puntos de la ciudad contra el Gran Asalto de la Vecina. Zzz 🌙 (+150 XP)",
                      "You lie down in bed in your fine silk pajamas. W hovers in the room radiating a protective golden aura shielding you from all nightmares. Angela watches from above. Tomorrow Wednesday will be the decisive showdown across four city points against the Neighbor's Grand Assault. Zzz 🌙 (+150 XP)"
                    );
                    return;
                  }
                  if (currentDay === 2) {
                    onTriggerDialogue(
                      "CKY",
                      "Me acuesto en mi camita a descansar profundamente... ¡Qué día tan intenso vivimos con Ángela! Mañana viernes será un gran día. Zzz 🌙",
                      "I lie down in my bed to rest deeply... What an intense day with Angela! Tomorrow Friday will be a big day. Zzz 🌙",
                      () => {
                        playSound(900, "sine", 0.5);
                        setTimeout(() => {
                          startDay3Intro();
                        }, 600);
                      }
                    );
                  } else if (!hasTalkedToAngela) {
                    onTriggerDialogue(
                      "CKY",
                      "Me acuesto en la cama a dormir... ¡Qué día tan largo!",
                      "I lie down on the bed to sleep... What a long day!",
                      () => {
                        playSound(900, "sine", 0.5);
                        setTimeout(() => {
                          startAngelaDialogueChain();
                        }, 600);
                      }
                    );
                  } else {
                    onTriggerDialogue(
                      "CKY",
                      "Me acuesto a dormir profundamente hasta el día siguiente... Zzz 🌙",
                      "I fall deeply asleep until the next day... Zzz 🌙",
                      () => {
                        playSound(900, "sine", 0.5);
                        setTimeout(() => {
                          startDay2Intro();
                        }, 600);
                      }
                    );
                  }
                }}
                className="w-full py-3 px-4 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-mono text-xs text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌙</span>
                  <div>
                    <p className="font-bold text-purple-300 group-hover:text-purple-200">
                      {currentDay === 2 ? "Dormir por la noche (Terminar Día 2)" : "Dormir por la noche (Terminar Día 1)"}
                    </p>
                    <p className="text-[10px] text-purple-400/80">
                      {currentDay === 2 ? "Descansar para despertar el Viernes (Día 3)" : "Termina el día y desencadena el mensaje de Ángela"}
                    </p>
                  </div>
                </div>
                <span className="text-purple-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowBedModal(false);
                  setIsOverslept(true);
                  totalGameMinutesRef.current = 380;
                  setTotalGameMinutes(380); // 6:20 AM
                  setGameTime({ hour: 6, minute: 20 });
                  setCurrentOutfit("pajamas");
                  playSound(600, "sawtooth", 0.4);
                  onTriggerDialogue(
                    "Mamá",
                    "¡¡CKY LEVÁNTATE VAS A PERDER EL COLECTIVO!! Te dormiste profundamente y son las 6:20 AM. Sigues en piyama celeste y no tienes tiempo para desayunar ni ir al baño.",
                    "CKY WAKE UP YOU WILL MISS THE BUS!! You slept until 6:20 AM. You are still in pajamas and have no time for breakfast or getting ready!"
                  );
                }}
                className="w-full py-3 px-4 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-200 font-mono text-xs text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">😴</span>
                  <div>
                    <p className="font-bold text-red-300 group-hover:text-red-200">Volver a acostarse</p>
                    <p className="text-[10px] text-red-400/80">El reloj avanza a 6:20 AM y mamá viene gritando</p>
                  </div>
                </div>
                <span className="text-red-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowBedModal(false);
                  const status = checkAction6h("bedroom_make_bed");
                  if (status.allowed) {
                    recordAction6h("bedroom_make_bed");
                    setBedArranged(true);
                    addXP(20);
                    advanceTime(5);
                    onTriggerDialogue(
                      "CKY",
                      "¡Acomodaste prolijamente la cama con sus dos almohadas (+20 XP, +5 min)! Te sientes satisfecha y organizada.",
                      "You neatly made your bed (+20 XP, +5 min)!"
                    );
                  } else {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "CKY",
                      `La cama ya está acomodada. Debes esperar ${timeStr} antes de volver a hacerla (+20 XP).`,
                      `The bed is already arranged. Wait ${timeStr} before doing it again.`
                    );
                  }
                }}
                className="w-full py-3 px-4 rounded-xl border border-yellow-500/40 bg-yellow-950/30 hover:bg-yellow-900/50 text-yellow-200 font-mono text-xs text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div>
                    <p className="font-bold text-yellow-300 group-hover:text-yellow-200">Acomodar la cama</p>
                    <p className="text-[10px] text-yellow-400/80">Ordena las sábanas y gana +20 XP</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">+20 XP</span>
              </button>
            </div>

            <button
              onClick={() => setShowBedModal(false)}
              className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* School Jacket Interaction Modal */}
      {showJacketModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🧥</div>
            <h3 className="text-lg font-bold font-display text-purple-400 uppercase tracking-wide">
              {language === "es" ? "Campera de la Escuela" : "School Jacket"}
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {language === "es" 
                ? "Encontraste la campera verde de la escuela. ¿Qué deseas hacer?" 
                : "You found the green school jacket. What do you want to do?"}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowJacketModal(false);
                  setCurrentOutfit("uniform");
                  const hasJacket = inventory.some(i => i.id === "green_jacket");
                  if (!hasJacket) {
                    addInventoryItem({
                      id: "green_jacket",
                      nameEs: "Campera Verde de la Escuela",
                      nameEn: "Green School Jacket",
                      descEs: "Abrigo escolar verde de CKY.",
                      descEn: "CKY's green school jacket.",
                      icon: "🧥",
                      isKey: false,
                      category: "pockets"
                    });
                  }
                  playSound(450, "triangle", 0.3);
                  onTriggerDialogue(
                    "CKY",
                    "Te pusiste la campera verde de la escuela sobre la remera verde y jean azul. ¡Luces lista para la escuela!",
                    "You put on the green school jacket over your green shirt and blue jeans!"
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🧥</span>
                  <div>
                    <p className="font-bold">Ponértela ahora</p>
                    <p className="text-[10px] text-purple-300/80">Cambias a uniforme completo</p>
                  </div>
                </div>
                <span className="text-purple-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowJacketModal(false);
                  const hasJacket = inventory.some(i => i.id === "green_jacket");
                  if (!hasJacket) {
                    addInventoryItem({
                      id: "green_jacket",
                      nameEs: "Campera Verde de la Escuela",
                      nameEn: "Green School Jacket",
                      descEs: "Abrigo escolar verde de CKY.",
                      descEn: "CKY's green school jacket.",
                      icon: "🧥",
                      isKey: false,
                      category: "pockets"
                    });
                  }
                  playSound(350, "triangle", 0.3);
                  onTriggerDialogue(
                    "CKY",
                    "Guardaste la campera verde de la escuela en tu mochila para usarla más tarde si refresca.",
                    "You saved the green school jacket in your backpack for later."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🎒</span>
                  <div>
                    <p className="font-bold">Guardarla para más tarde</p>
                    <p className="text-[10px] text-slate-400">Guardas la campera en el inventario</p>
                  </div>
                </div>
                <span className="text-slate-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowJacketModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* School Organizer Modal 1 - Mochila */}
      {showOrganizerModal1 && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🎒</div>
            <h3 className="text-lg font-bold font-display text-cyan-400 uppercase tracking-wide">
              {language === "es" ? "Mueble 1 - Mochila" : "Furniture 1 - Backpack"}
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {language === "es" 
                ? "En este mueble guardas tu mochila. Tener la mochila te permite guardar tus útiles, libros y porquerías." 
                : "Your backpack is stored in this furniture piece."}
            </p>

            <div className="space-y-2.5 pt-2">
              {!hasBackpack ? (
                <button
                  onClick={() => {
                    setShowOrganizerModal1(false);
                    setHasBackpack(true);
                    addInventoryItem({
                      id: "backpack_bag",
                      nameEs: "Mochila",
                      nameEn: "Backpack",
                      descEs: "Mochila de CKY para llevar porquerías.",
                      descEn: "CKY's backpack.",
                      icon: "🎒",
                      isKey: true,
                      category: "pockets"
                    });
                    advanceTime(5);
                    addXP(5);
                    playSound(400, "triangle", 0.3);
                    unlockAchievement("ach_backpack", onShowNotification, addXP);
                    if (currentDay === 6 && !day6BackpackCollected) {
                      setDay6BackpackCollected(true);
                      onTriggerDialogue(
                        "CKY",
                        "Ya tenemos la Mochila para llenarla de porquerías (+5 XP, +5 mins).",
                        "We now have the Backpack to fill it with stuff (+5 XP, +5 min)!",
                        () => {
                          onTriggerDialogue(
                            "Ángela (Espíritu)",
                            "¡Mochila lista para llenar de porquerías! Guardá los cuadernos y dejá espacio para las cartitas de amor que le vas a pasar a tu novio cósmico en clase.",
                            "Backpack ready to fill with junk! Store your notebooks and leave space for the love notes you'll pass to your cosmic boyfriend in class."
                          );
                        }
                      );
                    } else {
                      onTriggerDialogue(
                        "CKY",
                        "Ya tenemos la Mochila para llenarla de porquerías (+5x, +5 mins).",
                        "We now have the Backpack to fill it with stuff (+5 XP, +5 min)!"
                      );
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 font-mono text-xs text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span>🎒</span>
                    <div>
                      <p className="font-bold">Tomar Mochila (+5 XP, +5 min)</p>
                      <p className="text-[10px] text-cyan-300/80">Equipa tu mochila para llevar porquerías</p>
                    </div>
                  </div>
                  <span className="text-cyan-400 font-bold">➔</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowOrganizerModal1(false);
                    setHasBackpack(false);
                    removeInventoryItem?.("backpack_bag");
                    advanceTime(2);
                    playSound(350, "triangle", 0.3);
                    onTriggerDialogue(
                      "CKY",
                      "Dejaste la mochila guardada en Mueble 1 (+2 min).",
                      "You left the backpack stored in Furniture 1 (+2 min)."
                    );
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-mono text-xs text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span>🎒</span>
                    <div>
                      <p className="font-bold">Dejar Mochila (+2 min)</p>
                      <p className="text-[10px] text-amber-300/80">Guarda la mochila en Mueble 1</p>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold">➔</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowOrganizerModal1(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* School Organizer Modal 2 - Libros, Cuadernos y Cartuchera */}
      {showOrganizerModal2 && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-blue-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">📚</div>
            <h3 className="text-lg font-bold font-display text-blue-400 uppercase tracking-wide">
              {language === "es" ? "Mueble 2 - Libros y Cartuchera" : "Furniture 2 - Books & Pencil Case"}
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {language === "es" 
                ? "Aquí están guardados tus libros de estudio, cuadernos y cartuchera escolar." 
                : "Your school books, notebooks, and pencil case are stored here."}
            </p>

            <div className="space-y-2.5 pt-2">
              {!hasBackpack ? (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-mono text-left space-y-1">
                  <p className="font-bold text-amber-400">⚠️ Mochila requerida</p>
                  <p className="text-[11px] leading-relaxed text-amber-200/90">
                    No puedes tomar tus libros ni útiles todavía. Primero debes ir al Mueble 1 y recoger tu mochila escolar.
                  </p>
                </div>
              ) : (
                (() => {
                  const hasBooks = inventory.some(i => i.id === "backpack_notebook");
                  return !hasBooks ? (
                    <button
                      onClick={() => {
                        setShowOrganizerModal2(false);
                        addInventoryItem({
                          id: "backpack_notebook",
                          nameEs: "Libros, Cuadernos y Cartuchera",
                          nameEn: "Books, Notebooks & Pencil Case",
                          descEs: "Libros de estudio, cuadernos y cartuchera para el colegio.",
                          descEn: "School books, study notebooks, and pencil case.",
                          icon: "📚",
                          isKey: true,
                          category: "backpack"
                        });
                        lastPosRef.current = playerPos;
                        setBooksWalkSteps(0);
                        setPendingBooksWalkCheck(true);
                        advanceTime(5);
                        addXP(5);
                        playSound(400, "triangle", 0.3);
                        onTriggerDialogue(
                          "CKY",
                          "¡Recogiste tus libros, cuadernos y cartuchera escolar (+5 XP, +5 min)!",
                          "You picked up your school books, notebooks, and pencil case (+5 XP, +5 min)!"
                        );
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 font-mono text-xs text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>📚</span>
                        <div>
                          <p className="font-bold">Tomar Libros, Cuadernos y Cartuchera (+5 XP, +5 min)</p>
                          <p className="text-[10px] text-blue-300/80">Guarda los útiles en tu mochila</p>
                        </div>
                      </div>
                      <span className="text-blue-400 font-bold">➔</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowOrganizerModal2(false);
                        removeInventoryItem?.("backpack_notebook");
                        setPendingBooksWalkCheck(false);
                        advanceTime(2);
                        playSound(350, "triangle", 0.3);
                        onTriggerDialogue(
                          "CKY",
                          "Dejaste los libros, cuadernos y la cartuchera guardados en Mueble 2 (+2 min).",
                          "You left the books, notebooks, and pencil case stored in Furniture 2 (+2 min)."
                        );
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-mono text-xs text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>📚</span>
                        <div>
                          <p className="font-bold">Dejar Libros, Cuadernos y Cartuchera (+2 min)</p>
                          <p className="text-[10px] text-amber-300/80">Guarda los libros de vuelta en Mueble 2</p>
                        </div>
                      </div>
                      <span className="text-amber-400 font-bold">➔</span>
                    </button>
                  );
                })()
              )}
            </div>

            <button
              onClick={() => setShowOrganizerModal2(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Nightstand Modal (Mesa de luz) */}
      {showNightstandModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">{isPhoneCharging ? "⚡📱" : "🛏️"}</div>
            <h3 className="text-lg font-bold font-display text-yellow-400 uppercase tracking-wide">
              {language === "es" ? "Mesa de Luz de CKY" : "CKY's Nightstand"}
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {isPhoneCharging
                ? (language === "es"
                    ? "Tu celular se encuentra sobre el cargador en la mesa de luz. La pantalla indica carga activa."
                    : "Your phone is resting on the charger on the nightstand.")
                : (language === "es"
                    ? "Una mesa de luz con un velador retro y un cargador de pared. ¿Qué deseas hacer?"
                    : "A bedside table with a retro lamp and wall charger. What do you want to do?")
              }
            </p>

            <div className="space-y-2.5 pt-2">
              {isPhoneCharging ? (
                <button
                  onClick={() => {
                    setShowNightstandModal(false);
                    setIsPhoneCharging(false);
                    setHasPhone(true);
                    setStats((prev) => ({ ...prev, bateriaCelular: 100 }));
                    advanceTime(10);
                    addInventoryItem({
                      id: "pocket_phone",
                      nameEs: "Celular Smartphone",
                      nameEn: "Smartphone",
                      descEs: "Tu teléfono móvil. Al abrirlo dice 'Sin mensajes nuevos'. Te sirve para comunicarte con tus amigos.",
                      descEn: "Your phone. Displays 'No new messages'. Used to communicate with friends.",
                      icon: "📱",
                      isKey: true,
                      category: "pockets"
                    });
                    playSound(520, "sine", 0.3);
                    onTriggerDialogue(
                      "CKY",
                      "¡Guardaste el celular en tu bolsillo! Carga completamente el celular (+100% Batería, +10 min).",
                      "You stored the smartphone in your pocket fully charged (+100% Battery, +10 min)!"
                    );
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-lime-500/40 bg-lime-950/40 hover:bg-lime-900/60 text-lime-200 font-mono text-xs text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span>🔋</span>
                    <div>
                      <p className="font-bold">Guardar el celular (+10 min)</p>
                      <p className="text-[10px] text-lime-300/80">Carga completamente el celular y lo guarda en el inventario</p>
                    </div>
                  </div>
                  <span className="text-lime-400 font-bold">➔</span>
                </button>
              ) : (
                hasPhone && (
                  <button
                    onClick={() => {
                      setShowNightstandModal(false);
                      setIsPhoneCharging(true);
                      setHasPhone(false);
                      removeInventoryItem?.("pocket_phone");
                      playSound(400, "triangle", 0.3);
                      onTriggerDialogue(
                        "Mesa de Luz",
                        "Dejaste el celular cargando sobre la mesa de luz. La pantalla muestra el rayo de carga.",
                        "You left the phone charging on the nightstand."
                      );
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-yellow-500/40 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-200 font-mono text-xs text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span>⚡</span>
                      <div>
                        <p className="font-bold">Dejar cargando el celular</p>
                        <p className="text-[10px] text-yellow-300/80">Conecta el teléfono al cargador de la mesa de luz</p>
                      </div>
                    </div>
                    <span className="text-yellow-400 font-bold">➔</span>
                  </button>
                )
              )}

              <button
                onClick={() => {
                  setShowNightstandModal(false);
                  setShowRoomCustomization(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-pink-500/40 bg-pink-950/40 hover:bg-pink-900/60 text-pink-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🎨</span>
                  <div>
                    <p className="font-bold">{language === "es" ? "Decorar Habitación" : "Customize Room"}</p>
                    <p className="text-[10px] text-pink-300/80">{language === "es" ? "Pósters, acolchados y luces de ambiente" : "Posters, bedspread & fairy lights"}</p>
                  </div>
                </div>
                <span className="text-pink-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowNightstandModal(false);
                  onTriggerDialogue(
                    "Mesa de Luz",
                    "Mesa de luz de CKY. Un espacio ordenado con un cargador y velador.",
                    "CKY's bedside table with a charger and lamp."
                  );
                }}
                className="w-full py-2 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sink Modal */}
      {/* Bathroom Sink Modal */}
      {showSinkModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🚰</div>
            <h3 className="text-lg font-bold font-display text-cyan-400 uppercase tracking-wide">
              Lavabo del Baño
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              ¿Qué deseas hacer en el lavatorio?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowSinkModal(false);
                  const status = checkAction6h("bathroom_sink_wash");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Lavabo del Baño",
                      `Ya te aseaste hace poco. Debes esperar ${timeStr} antes de volver a asearte (+20 Higiene, +10 XP).`,
                      `You already washed up recently. Wait ${timeStr} before doing it again.`
                    );
                  } else {
                    recordAction6h("bathroom_sink_wash");
                    setStats(prev => ({ ...prev, higiene: Math.min(100, (prev.higiene ?? 100) + 20) }));
                    setHasGroomed(true);
                    addXP(10);
                    advanceTime(10);
                    if (currentDay === 6 && !day6BathroomGroomed) {
                      setDay6BathroomGroomed(true);
                      onTriggerDialogue(
                        "Lavabo del Baño",
                        "Te lavaste la cara y los dientes con agua fresca (+20 Higiene, +10 XP, +10 min). ¡Quedaste impecable para el colegio!",
                        "You washed your face and brushed your teeth (+20 Hygiene, +10 XP, +10 min)! Ready for school!",
                        () => {
                          onTriggerDialogue(
                            "Ángela (Espíritu)",
                            "¡Bien ahí CKY! ¡Lavate bien esos dientes que no podés hablarle a tu alma gemela con aliento de dragón un lunes a la mañana!",
                            "Nice one CKY! Brush those teeth well, can't talk to your soulmate with dragon breath on a Monday morning!"
                          );
                        }
                      );
                    } else {
                      onTriggerDialogue(
                        "Lavabo del Baño",
                        "Te aseaste en el baño y te lavaste la cara con agua fresca (+20 Higiene, +10 XP, +10 min). ¡Quedaste limpia y fresca para ir a la escuela!",
                        "You washed up in the bathroom (+20 Hygiene, +10 XP, +10 min)! Ready for school!"
                      );
                    }
                  }
                  playSound(600, "sine", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>💦</span>
                  <div>
                    <p className="font-bold">Asearse en el baño (+20 Higiene)</p>
                    <p className="text-[10px] text-cyan-300/80">Lávate la cara en el lavatorio (+10 XP)</p>
                  </div>
                </div>
                <span className="text-cyan-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowSinkModal(false);
                  playSound(500, "triangle", 0.3);
                  if (currentOutfit === "naked") {
                    onTriggerDialogue(
                      "CKY",
                      "Soy tan sexy, desearía poder mostrarle a alguien todo esto!",
                      "I'm so sexy, I wish I could show someone all of this!",
                      () => setShowNakedSelfieModal(true)
                    );
                  } else {
                    onTriggerDialogue(
                      "Espejo del Baño",
                      "Te miraste al espejo. Luces con la mirada despierta, el cabello peinado y lista para afrontar tus tareas.",
                      "You looked in the mirror. You look ready for the day!"
                    );
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🪞</span>
                  <div>
                    <p className="font-bold">Mirarte al espejo</p>
                    <p className="text-[10px] text-blue-300/80">Contemplas tu reflejo radiante</p>
                  </div>
                </div>
                <span className="text-blue-400 font-bold">➔</span>
              </button>

              {/* Opción cómica secreta */}
              <button
                onClick={() => {
                  setShowSinkModal(false);
                  soundEngine.playSfx("fanfare");
                  onTriggerDialogue(
                    "CKY",
                    "¡Ja! ¡Pónganse de pie ante la Gran Hechicera del Linaje Astral! *Hace una pose dramática levantando la ceja y señalando al espejo*",
                    "Behold the Great Sorceress of the Astral Bloodline! *Strikes a dramatic pose in front of the mirror*",
                    () => {
                      onTriggerDialogue(
                        "Ángela",
                        "Dejá de hacer puchero y caras raras frente al vidrio CKY, parecés una tostadora queriendo pelear con un gato siamés.",
                        "Stop making weird faces at the glass CKY, you look like a toaster trying to fight a cat."
                      );
                    }
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <div>
                    <p className="font-bold text-purple-300">Practicar pose de heroína (Cómico)</p>
                    <p className="text-[10px] text-purple-300/80">Haces muecas y poses épicas ante el vidrio</p>
                  </div>
                </div>
                <span className="text-purple-400 font-bold">★</span>
              </button>
            </div>

            <button
              onClick={() => setShowSinkModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              No hacer nada
            </button>
          </div>
        </div>
      )}

      {/* Toilet Modal */}
      {showToiletModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🚽</div>
            <h3 className="text-lg font-bold font-display text-slate-200 uppercase tracking-wide">
              Inodoro del Baño
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              ¿Qué deseas hacer en el inodoro?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowToiletModal(false);
                  const status = checkAction6h("bathroom_toilet_use");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Inodoro",
                      `Usaste el inodoro hace poco. Debes esperar ${timeStr} antes de volver a usarlo (+5 Higiene).`,
                      `You used the toilet recently. Wait ${timeStr} before using it again.`
                    );
                  } else {
                    recordAction6h("bathroom_toilet_use");
                    setStats(prev => ({ ...prev, higiene: Math.min(100, (prev.higiene ?? 100) + 5) }));
                    advanceTime(2);
                    onTriggerDialogue(
                      "Inodoro",
                      "Usaste el inodoro y luego tiraste de la cadena (+5 Higiene, +2 min).",
                      "You used the toilet and flushed (+5 Hygiene, +2 min)!"
                    );
                  }
                  playSound(300, "square", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🚽</span>
                  <div>
                    <p className="font-bold">Usarlo (+5 Higiene, +2 min)</p>
                    <p className="text-[10px] text-slate-400">Usas el baño y tiras la cadena</p>
                  </div>
                </div>
                <span className="text-slate-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowToiletModal(false);
                  const status = checkAction6h("bathroom_toilet_clean");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Inodoro",
                      `El inodoro ya fue desinfectado. Debes esperar ${timeStr} antes de volver a limpiarlo (+15 XP).`,
                      `The toilet was already cleaned. Wait ${timeStr} before cleaning again.`
                    );
                  } else {
                    recordAction6h("bathroom_toilet_clean");
                    addXP(15);
                    advanceTime(5);
                    onTriggerDialogue(
                      "Inodoro",
                      "Limpiaste y desinfectaste la tapa y la taza con desinfectante de lavanda (+15 XP, +5 min).",
                      "You cleaned and disinfected the toilet (+15 XP, +5 min)!"
                    );
                  }
                  playSound(450, "sine", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🧼</span>
                  <div>
                    <p className="font-bold">Limpiarlo</p>
                    <p className="text-[10px] text-emerald-300/80">
                      {hasCleanedToilet ? "Ya desinfectado" : "Desinfectas e higienizas (+15 XP, +5 min)"}
                    </p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">➔</span>
              </button>

              {/* Opción Cómica: Reflexión Filosófica en el Trono */}
              <button
                onClick={() => {
                  setShowToiletModal(false);
                  advanceTime(5);
                  addXP(20);
                  soundEngine.playSfx("sparkle");
                  unlockAchievement("ach_filosofia_trono", onShowNotification, addXP);
                  onTriggerDialogue(
                    "CKY (Reflexión Trascendental)",
                    "Te sientas con la tapa baja a contemplar el vacío cósmico... ¿Por qué las sombras tienen sed? ¿Por qué la toalla de W no tiene suavizante? El gorgoteo de la cañería suena como un réquiem acuático.",
                    "You sit on the closed lid contemplating the cosmic void... Why do shadows thirst? Why lacks W's towel fabric softener? The pipe gurgle sounds like an aquatic requiem.",
                    () => {
                      onTriggerDialogue(
                        "Ángela (Espíritu)",
                        "¡Nena, llevás 5 minutos con la mirada perdida mirando el azulejo! ¿Vas a fundar una escuela filosófica en el inodoro o salimos a patear monstruos?",
                        "Girl, you've been staring blankly at the wall tile for 5 minutes! Are you founding a philosophical academy on the toilet or are we kicking monsters?"
                      );
                    }
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🤔</span>
                  <div>
                    <p className="font-bold text-purple-300">Reflexión Filosófica en el Trono</p>
                    <p className="text-[10px] text-purple-300/80">Meditar sobre los misterios de la vida (+20 XP)</p>
                  </div>
                </div>
                <span className="text-purple-400 font-bold">✨</span>
              </button>
            </div>

            <button
              onClick={() => setShowToiletModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              No hacer nada
            </button>
          </div>
        </div>
      )}

      {/* Shower Modal */}
      {showShowerModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-sky-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🚿</div>
            <h3 className="text-lg font-bold font-display text-sky-400 uppercase tracking-wide">
              Ducha del Baño
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              ¿Qué deseas hacer en la ducha?
            </p>

            <div className="space-y-2.5 pt-2">
              {currentDay === 7 && day7AlanisBedroomArgumentDone && !day7ShowerDone && (
                <button
                  onClick={() => {
                    setShowShowerModal(false);
                    setDay7ShowerDone(true);
                    localStorage.setItem("cky_day7_shower_done", "true");
                    addXP(50);
                    advanceTime(10);
                    setStats(prev => ({ ...prev, higiene: 100 }));
                    playSound(880, "sine", 0.4);
                    onTriggerDialogue(
                      "Ducha Revitalizante de CKY",
                      "Te diste una ducha tibia exhaustiva, sacándote todo el hollín, polvo y energía residual del sótano escolar. Salís impecable y perfumada (+35 Higiene, +50 XP). Ahora debés ir a tu habitación a vestirte con ropa común y guardar el conjunto de lencería roja en la mochila.",
                      "You took an exhaustive warm shower, washing away all soot, dust, and residual energy from the school basement (+35 Hygiene, +50 XP). Now go to your room to put on casual clothes and pack the red lingerie set in your backpack.",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu - Comentario Desubicado y Burlón)",
                          "¡Uuuuuy qué limpia que quedó la nena! ¡Menos mal porque tenías olor a zorrino asustado y a rata de cañería! Ahora a ponerse la ropa común y a preparar la lencería roja... ¡A ver si no te da un síncope de los nervios!",
                          "Whew, look how clean she is! Good thing because you smelled like a scared skunk and a sewer rat! Now put on casual clothes and pack the red lingerie... try not to pass out from nervousness!"
                        );
                      }
                    );
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-sky-400 bg-sky-950/60 hover:bg-sky-900/80 text-sky-200 font-mono text-xs text-left flex items-center justify-between animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚿</span>
                    <div>
                      <p className="font-bold text-sky-300">Ducha Purificadora (Día 7) (+50 XP)</p>
                      <p className="text-[10px] text-sky-400">Limpiar hollín del sótano antes de vestirte</p>
                    </div>
                  </div>
                  <span className="text-sky-400 font-bold">➔</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowShowerModal(false);
                  if (currentDay === 7 && day7AlanisBedroomArgumentDone && !day7ShowerDone) {
                    setDay7ShowerDone(true);
                    localStorage.setItem("cky_day7_shower_done", "true");
                    addXP(50);
                    advanceTime(10);
                    setStats(prev => ({ ...prev, higiene: 100 }));
                    playSound(880, "sine", 0.4);
                    onTriggerDialogue(
                      "Ducha Revitalizante de CKY",
                      "Te diste una ducha tibia exhaustiva, sacándote todo el hollín, polvo y energía residual del sótano escolar. Salís impecable y perfumada (+35 Higiene, +50 XP). Ahora debés ir a tu habitación a vestirte con ropa común y guardar el conjunto de lencería roja en la mochila.",
                      "You took an exhaustive warm shower, washing away all soot, dust, and residual energy from the school basement (+35 Hygiene, +50 XP). Now go to your room to put on casual clothes and pack the red lingerie set in your backpack.",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu - Comentario Desubicado y Burlón)",
                          "¡Uuuuuy qué limpia que quedó la nena! ¡Menos mal porque tenías olor a zorrino asustado y a rata de cañería! Ahora a ponerse la ropa común y a preparar la lencería roja... ¡A ver si no te da un síncope de los nervios!",
                          "Whew, look how clean she is! Good thing because you smelled like a scared skunk and a sewer rat! Now put on casual clothes and pack the red lingerie... try not to pass out from nervousness!"
                        );
                      }
                    );
                    return;
                  }
                  const status = checkAction6h("bathroom_shower_use");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Ducha",
                      `Te diste una ducha hace poco. Debes esperar ${timeStr} antes de volver a ducharte (+35 Higiene, +10 XP).`,
                      `You took a shower recently. Wait ${timeStr} before showering again.`
                    );
                  } else {
                    recordAction6h("bathroom_shower_use");
                    setStats(prev => ({ ...prev, higiene: Math.min(100, (prev.higiene ?? 100) + 35) }));
                    setHasGroomed(true);
                    addXP(10);
                    advanceTime(10);
                    if (setCurrentOutfit) {
                      setCurrentOutfit("naked");
                    }
                    onTriggerDialogue(
                      "Ducha",
                      "Te diste una ducha tibia (+35 Higiene, +10 XP, +10 min). ¡Saliste de la ducha desnuda y blureada! Toma una toalla o ve a cambiarte al ropero.",
                      "You showered (+35 Hygiene, +10 XP, +10 min). You are now naked and blurred!"
                    );
                  }
                  playSound(650, "sine", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🛁</span>
                  <div>
                    <p className="font-bold">Asearse con Ducha (+35 Higiene)</p>
                    <p className="text-[10px] text-sky-300/80">Ducha revitalizante en el baño</p>
                  </div>
                </div>
                <span className="text-sky-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowShowerModal(false);
                  const status = checkAction6h("bathroom_shower_clean");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Ducha",
                      `La ducha ya está reluciente. Debes esperar ${timeStr} antes de volver a limpiarla (+15 XP).`,
                      `The shower is already clean. Wait ${timeStr} before cleaning again.`
                    );
                  } else {
                    recordAction6h("bathroom_shower_clean");
                    addXP(15);
                    advanceTime(8);
                    onTriggerDialogue(
                      "Ducha",
                      "Enjuagaste los azulejos y limpiaste la mampara de la ducha (+15 XP, +8 min). ¡Quedó brillante!",
                      "You cleaned the shower tiles and curtain (+15 XP, +8 min)!"
                    );
                  }
                  playSound(420, "sine", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-teal-500/40 bg-teal-950/40 hover:bg-teal-900/60 text-teal-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🧹</span>
                  <div>
                    <p className="font-bold">Limpiar la ducha</p>
                    <p className="text-[10px] text-teal-300/80">
                      {hasCleanedShower ? "Ya limpia" : "Deja reluciente la mampara (+15 XP, +8 min)"}
                    </p>
                  </div>
                </div>
                <span className="text-teal-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowShowerModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              No hacer nada
            </button>
          </div>
        </div>
      )}

      {/* Kitchen Sink Modal */}
      {showKitchenSinkModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🚰</div>
            <h3 className="text-lg font-bold font-display text-cyan-300 uppercase tracking-wide">
              Pileta de la Cocina
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              ¿Qué deseas hacer en la pileta de la cocina?
            </p>

            <div className="space-y-2.5 pt-2">
              {/* Option 1: Rellenar la botella de agua */}
              <button
                onClick={() => {
                  setShowKitchenSinkModal(false);
                  const status = checkAction6h("kitchen_sink_refill");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Pileta de la Cocina",
                      `Ya rellenaste tu botella recientemente. Debes esperar ${timeStr} antes de volver a rellenarla.`,
                      `You refilled your water bottle recently. Wait ${timeStr} before refilling again.`
                    );
                  } else {
                    recordAction6h("kitchen_sink_refill");
                    advanceTime(5);
                    removeInventoryItem?.("water_bottle_empty");
                    addInventoryItem({
                      id: "water_bottle_full",
                      nameEs: "Botella de Agua Favorita (Llena)",
                      nameEn: "Favorite Water Bottle (Full)",
                      descEs: "Tu botella de agua favorita de CKY. Restaura +30% de Sed y +10% de Hambre.",
                      descEn: "CKY's favorite water bottle. Restores +30% Thirst and +10% Hunger.",
                      icon: "🧴",
                      isKey: true,
                      category: "backpack",
                      usable: true,
                      effect: { type: "water_bottle", amount: 30 }
                    });
                    onTriggerDialogue(
                      "Pileta de la Cocina",
                      "Rellenaste tu botella de agua favorita con agua fresca de la canilla (+5 min). ¡Quedó lista en tu mochila!",
                      "You refilled your favorite water bottle with fresh water (+5 min)!"
                    );
                  }
                  playSound(520, "sine", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🧴</span>
                  <div>
                    <p className="font-bold">Rellenar la botella de agua (+5 min)</p>
                    <p className="text-[10px] text-sky-300/80">Recarga tu botella en la mochila (+30 Sed, +10 Hambre)</p>
                  </div>
                </div>
                <span className="text-sky-400 font-bold">➔</span>
              </button>

              {/* Option 2: Lavar los platos */}
              <button
                onClick={() => {
                  setShowKitchenSinkModal(false);
                  const status = checkAction6h("kitchen_sink_wash_dishes");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Pileta de la Cocina",
                      `Los platos ya están lavados. Debes esperar ${timeStr} antes de volver a lavar los platos (+5 XP).`,
                      `The dishes are already washed. Wait ${timeStr} before washing again.`
                    );
                  } else {
                    recordAction6h("kitchen_sink_wash_dishes");
                    addXP(5);
                    advanceTime(10);
                    onTriggerDialogue(
                      "Pileta de la Cocina",
                      "Lavaste y secaste todos los platos, vasos y cubiertos de la cocina (+5 XP, +10 min). ¡Dejaste la mesada impecable!",
                      "You washed and dried all dishes and cutlery (+5 XP, +10 min)!"
                    );
                  }
                  playSound(480, "sine", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-yellow-500/40 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🍽️</span>
                  <div>
                    <p className="font-bold">Lavar los platos</p>
                    <p className="text-[10px] text-yellow-300/80">Lavas y secas la vajilla (+5 XP, +10 min)</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">➔</span>
              </button>

              {/* Option 3: Lavarse las manos */}
              <button
                onClick={() => {
                  setShowKitchenSinkModal(false);
                  const status = checkAction6h("kitchen_sink_wash_hands");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Pileta de la Cocina",
                      `Te lavaste las manos hace poco. Debes esperar ${timeStr} antes de volver a lavarte las manos (+5 Higiene).`,
                      `You washed your hands recently. Wait ${timeStr} before washing again.`
                    );
                  } else {
                    recordAction6h("kitchen_sink_wash_hands");
                    setStats(prev => ({ ...prev, higiene: Math.min(100, (prev.higiene ?? 100) + 5) }));
                    advanceTime(5);
                    onTriggerDialogue(
                      "Pileta de la Cocina",
                      "Te lavaste las manos con abundante agua y jabón en la pileta de la cocina (+5 Higiene, +5 min).",
                      "You washed your hands with water and soap at the sink (+5 Hygiene, +5 min)."
                    );
                  }
                  playSound(600, "sine", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🧼</span>
                  <div>
                    <p className="font-bold">Lavarse las manos (+5 Higiene, +5 min)</p>
                    <p className="text-[10px] text-emerald-300/80">Te higienizas las manos con jabón</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowKitchenSinkModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              No hacer nada
            </button>
          </div>
        </div>
      )}

      {/* Fridge Modal */}
      {showFridgeModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🧊</div>
            <h3 className="text-lg font-bold font-display text-cyan-400 uppercase tracking-wide">
              {language === "es" ? "Heladera de la Cocina" : "Kitchen Refrigerator"}
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {language === "es"
                ? "Heladera limpia e impecable con imanes en la puerta. ¿Qué deseas hacer?"
                : "Spotless refrigerator with door magnets. What would you like to do?"}
            </p>

            <div className="space-y-2.5 pt-2">
              {/* Option 1: Take or Store Water Bottle */}
              {(() => {
                const hasFullBottle = inventory.some(i => i.id === "water_bottle_full");
                const hasEmptyBottle = inventory.some(i => i.id === "water_bottle_empty");
                const hasBottle = hasFullBottle || hasEmptyBottle;

                if (hasBottle) {
                  return (
                    <button
                      onClick={() => {
                        setShowFridgeModal(false);
                        removeInventoryItem?.("water_bottle_full");
                        removeInventoryItem?.("water_bottle_empty");
                        setHasWaterBottleFromFridge(false);
                        advanceTime(2);
                        playSound(350, "triangle", 0.3);
                        onTriggerDialogue(
                          "CKY",
                          "Guardaste tu botella de agua favorita en la heladera (+2 min).",
                          "You stored your favorite water bottle in the fridge (+2 min)."
                        );
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 font-mono text-xs text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>🧴</span>
                        <div>
                          <p className="font-bold">Guardar Botella de Agua en la heladera (+2 min)</p>
                          <p className="text-[10px] text-cyan-300/80">Guarda la botella para tenerla fría y protegida</p>
                        </div>
                      </div>
                      <span className="text-cyan-400 font-bold">➔</span>
                    </button>
                  );
                } else {
                  return (
                    <button
                      onClick={() => {
                        setShowFridgeModal(false);
                        setHasWaterBottleFromFridge(true);
                        addInventoryItem({
                          id: "water_bottle_full",
                          nameEs: "Botella de Agua Favorita (Llena)",
                          nameEn: "Favorite Water Bottle (Full)",
                          descEs: "Tu botella de agua favorita de CKY. Restaura +30% de Sed y +10% de Hambre.",
                          descEn: "CKY's favorite water bottle. Restores +30% Thirst and +10% Hunger.",
                          icon: "🧴",
                          isKey: true,
                          usable: true,
                          effect: { type: "water_bottle", amount: 30 },
                          category: "backpack"
                        });
                        advanceTime(2);
                        addXP(5);
                        playSound(400, "triangle", 0.3);
                        onTriggerDialogue(
                          "CKY",
                          "Tomaste tu botella de agua favorita de la heladera (+5 XP, +2 min). Quedó guardada en tu mochila.",
                          "You took your favorite water bottle from the fridge (+5 XP, +2 min)!"
                        );
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 font-mono text-xs text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>🧴</span>
                        <div>
                          <p className="font-bold">Recoger Botella de Agua Favorita (+5 XP, +2 min)</p>
                          <p className="text-[10px] text-cyan-300/80">Guarda la botella llena en tu mochila</p>
                        </div>
                      </div>
                      <span className="text-cyan-400 font-bold">➔</span>
                    </button>
                  );
                }
              })()}

              {/* Option 2: Tomar alimento (Sándwich de Salame y Queso) */}
              <button
                onClick={() => {
                  setShowFridgeModal(false);
                  if (currentDay === 3 && day3RevealedSpiritW && !day3DinnerEaten) {
                    setDay3DinnerEaten(true);
                    setStats(prev => ({ ...prev, hambre: 100, sed: 100 }));
                    advanceTime(10);
                    addXP(25);
                    playSound(650, "sine", 0.4);
                    onTriggerDialogue(
                      "CKY",
                      "mmmmm Mi favorito, sándwich de Salame y queso... ¡Qué delicia! Ya tengo la panza llena y las energías recuperadas (+40% Hambre, +30% Sed, +25 XP).",
                      "mmmm My favorite, salami and cheese sandwich... Delicious! Full stomach and restored energy (+40% Hunger, +30% Thirst, +25 XP).",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu)",
                          "¡Bien ahí CKY! Ahora que tenés la pancita llena y estás en pijama, ¡vamos a la pieza a acostarnos que fue un día larguísimo!",
                          "Nice one CKY! Now that your belly is full and you're in pajamas, let's head to the bedroom to sleep after such a long day!",
                          () => {
                            onTriggerDialogue(
                              "W (Espíritu Guardián)",
                              "Secundo la moción de la entidad astral. El reposo en vuestra recámara optimizará la regeneración celular y la sintonía espiritual de la Señora Heredera.",
                              "I second the astral entity's motion. Resting in your chamber will optimize cellular regeneration and spiritual attunement of the Lady Heir."
                            );
                          }
                        );
                      }
                    );
                    return;
                  }

                  const status = checkAction6h("fridge_take_food");
                  if (!status.allowed) {
                    const timeStr = status.remainingHours > 0 ? `${status.remainingHours}h ${status.remainingMins}m` : `${status.remainingMins}m`;
                    onTriggerDialogue(
                      "Heladera",
                      `Ya preparaste alimento hace poco. Debes esperar ${timeStr} antes de volver a tomar alimento.`,
                      `You took food recently. Wait ${timeStr} before taking food again.`
                    );
                  } else {
                    recordAction6h("fridge_take_food");
                    addInventoryItem({
                      id: "sandwich_salame_queso",
                      nameEs: "Sándwich de Salame y Queso",
                      nameEn: "Salami & Cheese Sandwich",
                      descEs: "Sándwich de salame y queso de la heladera. Restaura +40% de Hambre.",
                      descEn: "Salami and cheese sandwich from the fridge. Restores +40% Hunger.",
                      icon: "🥪",
                      isKey: false,
                      category: "backpack",
                      usable: true,
                      effect: { type: "hambre", amount: 40 }
                    });
                    advanceTime(5);
                    addXP(5);
                    unlockAchievement("ach_sandwich", onShowNotification, addXP);
                    if (currentDay === 6 && !day6WaterAndSandwichCollected) {
                      setDay6WaterAndSandwichCollected(true);
                      onTriggerDialogue(
                        "CKY",
                        "mmmmm Mi favorito, sándwich de Salame y queso y la botella bien fresca para llevar al colegio.",
                        "mmmm My favorite, salami and cheese sandwich and cold water bottle for school.",
                        () => {
                          onTriggerDialogue(
                            "Ángela (Espíritu)",
                            "¡Ese sanguchito cotiza en bolsa! Guardale una mordida para alimentar la mitad humana del pibe antes de que le ruja la panza en geografía.",
                            "That sandwich is worth its weight in gold! Save a bite to feed the guy's human half before his stomach growls in geography class."
                          );
                        }
                      );
                    } else {
                      onTriggerDialogue(
                        "CKY",
                        "mmmmm Mi favorito, sándwich de Salame y queso",
                        "mmmm My favorite, salami and cheese sandwich"
                      );
                    }
                  }
                  playSound(500, "sine", 0.3);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🥪</span>
                  <div>
                    <p className="font-bold">Tomar alimento (Sándwich en Mochila, c/6h)</p>
                    <p className="text-[10px] text-emerald-300/80">Guarda un sándwich de salame y queso en tu mochila (+40 Hambre)</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">➔</span>
              </button>

              {/* Option 3: Minijuego Taller Gourmet de Sándwiches */}
              <button
                onClick={() => {
                  setShowFridgeModal(false);
                  setShowSandwichMinigame(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-mono text-xs text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👨‍🍳</span>
                  <div>
                    <p className="font-bold">{language === "es" ? "Taller Gourmet de Sándwiches (Minijuego)" : "Gourmet Sandwich Workshop (Minigame)"}</p>
                    <p className="text-[10px] text-amber-300/80">{language === "es" ? "Armá tu sándwich artesanal, perfeccioná el corte y desbloqueá logros" : "Craft your custom sandwich, time the slice and unlock achievements"}</p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold">➔</span>
              </button>

              {/* Opción Cómica: Arqueología de Heladera */}
              <button
                onClick={() => {
                  setShowFridgeModal(false);
                  advanceTime(4);
                  addXP(20);
                  soundEngine.playSfx("sparkle");
                  unlockAchievement("ach_limon_fosil", onShowNotification, addXP);
                  onTriggerDialogue(
                    "CKY (Arqueología de Heladera)",
                    "Revisas el fondo del cajón: encuentras un medio limón petrificado del 2018 que ya califica como tesoro arqueológico, y un pote de yogur sospechoso que te mira fijamente.",
                    "You inspect the drawer: a petrified half-lemon from 2018 that qualifies as an archaeological relic, and a suspicious yogurt staring back.",
                    () => {
                      onTriggerDialogue(
                        "W (Espíritu Guardián)",
                        "¡Alerta máxima Señora Heredera! Aquella cepa bacteriana ha desarrollado un sistema de gobierno representativo y planea invadir el estante de los quesos.",
                        "Code Red Lady Heir! That bacterial culture has formed a representative democracy and plans to invade the cheese shelf."
                      );
                    }
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-yellow-500/40 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-200 font-mono text-xs text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🍋</span>
                  <div>
                    <p className="font-bold text-yellow-300">Arqueología en la Heladera (Cómico)</p>
                    <p className="text-[10px] text-yellow-300/80">Inspeccionar los especímenes fósiles del fondo (+20 XP)</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">🔍</span>
              </button>
            </div>

            <button
              onClick={() => setShowFridgeModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Shower Exit Choice Modal */}
      {showShowerChoiceModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-sky-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🧼</div>
            <h3 className="text-lg font-bold font-display text-sky-300 uppercase tracking-wide">
              Salida de la Ducha
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Saliste de la ducha. ¿Cómo deseas andar por el baño o la casa?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowShowerChoiceModal(false);
                  if (setCurrentOutfit) {
                    setCurrentOutfit("naked");
                  }
                  playSound(420, "sine", 0.3);
                  onTriggerDialogue(
                    "CKY",
                    "¡Saliste de la ducha desnuda y blureada! Puedes andar por la casa al natural o buscar una toalla / vestirte en tu ropero cuando quieras.",
                    "You walked out naked and blurred!"
                  );
                }}
                className="w-full py-3 px-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-mono text-xs text-left flex items-center justify-between transition group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div>
                    <p className="font-bold text-amber-300 group-hover:text-amber-200">Andar desnuda (blureada)</p>
                    <p className="text-[10px] text-amber-400/80">Efecto visual de censura pixelada</p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowShowerChoiceModal(false);
                  if (setCurrentOutfit) {
                    setCurrentOutfit("towel");
                  }
                  setHasTowel(true);
                  playSound(420, "sine", 0.3);
                  onTriggerDialogue(
                    "CKY",
                    "Te envolviste en una toalla suave de felpa. Ahora puedes ir a tu habitación a cambiarte en el ropero.",
                    "You wrapped yourself in a soft towel."
                  );
                }}
                className="w-full py-3 px-4 rounded-xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 font-mono text-xs text-left flex items-center justify-between transition group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧣</span>
                  <div>
                    <p className="font-bold text-rose-300 group-hover:text-rose-200">Tomar una toalla</p>
                    <p className="text-[10px] text-rose-400/80">Te envuelve en una toalla limpia</p>
                  </div>
                </div>
                <span className="text-rose-400 font-bold">➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Towel Rack Modal */}
      {showTowelModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🧺</div>
            <h3 className="text-lg font-bold font-display text-rose-400 uppercase tracking-wide">
              Toallero del Baño
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              ¿Qué deseas hacer en el toallero?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowTowelModal(false);
                  setHasTowel(true);
                  if (setCurrentOutfit) {
                    setCurrentOutfit("towel");
                  }
                  playSound(420, "sine", 0.3);
                  onTriggerDialogue(
                    "Toallero",
                    "Tomaste una toalla suave y te envolviste en ella. Estarás envuelta en toalla hasta vestirte en el ropero de tu habitación.",
                    "You took a soft towel to wrap yourself comfortably."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 font-mono text-xs text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🧣</span>
                  <div>
                    <p className="font-bold">Tomar toalla para secarte y envolverte</p>
                    <p className="text-[10px] text-rose-300/80">Toalla de felpa reconfortante</p>
                  </div>
                </div>
                <span className="text-rose-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowTowelModal(false);
                  if (setCurrentOutfit) {
                    setCurrentOutfit("naked");
                  }
                  playSound(420, "sine", 0.3);
                  onTriggerDialogue(
                    "Toallero",
                    "Dejaste la toalla en el toallero y saliste a andar desnuda (blureada).",
                    "You put down the towel and walked around naked (blurred)."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-mono text-xs text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <div>
                    <p className="font-bold">Andar desnuda (blureada)</p>
                    <p className="text-[10px] text-amber-300/80">Quitarse la toalla y andar al natural</p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowTowelModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Living Room Fireplace Modal */}
      {showFireplaceModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🔥</div>
            <h3 className="text-lg font-bold font-display text-amber-400 uppercase tracking-wide">
              Chimenea de la Sala
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {livingFireplaceLit ? "La chimenea está encendida y crepita cálidamente." : "La chimenea está apagada con brasas templadas."}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowFireplaceModal(false);
                  setLivingFireplaceLit(!livingFireplaceLit);
                  playSound(livingFireplaceLit ? 250 : 550, "sawtooth", 0.3);
                  onTriggerDialogue(
                    "Chimenea",
                    !livingFireplaceLit ? "¡Encendiste la chimenea! Unas llamas brillantes calientan acogedoramente la sala." : "Apagaste el fuego de la chimenea de manera segura.",
                    !livingFireplaceLit ? "You lit the fireplace! Warm flames glow in the living room." : "You put out the fireplace safely."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{livingFireplaceLit ? "❄️" : "🔥"}</span>
                  <div>
                    <p className="font-bold">{livingFireplaceLit ? "Apagar fuego" : "Prender chimenea"}</p>
                    <p className="text-[10px] text-amber-300/80">{livingFireplaceLit ? "Extingue las llamas" : "Enciende llamas cálidas"}</p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowFireplaceModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Living Window Curtains Modal */}
      {showLivingWindowModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-pink-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🪟</div>
            <h3 className="text-lg font-bold font-display text-pink-400 uppercase tracking-wide">
              Ventana de la Sala
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {livingCurtainsOpen ? "Las cortinas están abiertas dejando entrar la luz del sol." : "Las cortinas están cerradas matizando la luz."}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowLivingWindowModal(false);
                  setLivingCurtainsOpen(!livingCurtainsOpen);
                  playSound(420, "triangle", 0.3);
                  onTriggerDialogue(
                    "Ventana de la Sala",
                    !livingCurtainsOpen ? "Abriste las cortinas. ¡La luz brillante del sol ilumina toda la sala de estar!" : "Cerraste las cortinas suavemente.",
                    !livingCurtainsOpen ? "You opened the curtains! Bright sunlight floods the living room." : "You closed the curtains."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-pink-500/40 bg-pink-950/40 hover:bg-pink-900/60 text-pink-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{livingCurtainsOpen ? "🙈" : "☀️"}</span>
                  <div>
                    <p className="font-bold">{livingCurtainsOpen ? "Cerrar cortina" : "Abrir cortina"}</p>
                    <p className="text-[10px] text-pink-300/80">{livingCurtainsOpen ? "Drapea las cortinas" : "Deja entrar el sol brillante"}</p>
                  </div>
                </div>
                <span className="text-pink-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowLivingWindowModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Kitchen TV Modal */}
      {showKitchenTvModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-sky-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">📺</div>
            <h3 className="text-lg font-bold font-display text-sky-400 uppercase tracking-wide">
              Televisor de la Cocina
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Elige qué canal deseas sintonizar:
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowKitchenTvModal(false);
                  soundEngine.playSfx("select");
                  const newsMsgs = [
                    "📺 [Crónica TV - Placa Roja]: '¡URGENTE: CANICHE DEL VECINO LADRA EN LATÍN ANTIGUO A LAS 3 AM! El párroco del barrio intentó tirarle agua bendita pero el caniche se la tomó con bombilla.'",
                    "📺 [Crónica TV - Placa Roja]: '¡EXCLUSIVO: VECINA FUE VISTA REGANDO UN CACTUS DE PLÁSTICO DURANTE CUATRO HORAS SEGUIDAS! Afirma que esperaba que florezca.'",
                    "📺 [Crónica TV - Placa Roja]: '¡IMPACTO: CAEN 3 EMPANADAS DEL CIELO EN LA CANCHA DE LA ESCUELA! Testigos afirman que todavía estaban tibias.'",
                    "📺 [Crónica TV - Placa Roja]: '¡ALERTA METEOROLÓGICA: PRONOSTICAN LLUVIA DE HUMEDAD PESADA, CHANCLETAZOS VOLADORES Y MATE CON BISCOCHITOS!'"
                  ];
                  const msg = newsMsgs[Math.floor(Math.random() * newsMsgs.length)];
                  onTriggerDialogue("Televisor - Crónica TV (Placas Rojas)", msg, msg);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🔴</span>
                  <div>
                    <p className="font-bold text-red-300">Canal 1: Crónica TV (Placas Rojas)</p>
                    <p className="text-[10px] text-red-300/80">Urgentes insólitos y bizarros del conurbano</p>
                  </div>
                </div>
                <span className="text-red-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowKitchenTvModal(false);
                  advanceTime(10);
                  addXP(20);
                  soundEngine.playSfx("sparkle");
                  unlockAchievement("ach_tv_turca", onShowNotification, addXP);
                  const novelMsgs = [
                    "📺 [Novela Turca - 'El Destino Prohibido de Mustafá']: Mustafá mira a Bahar con cara de misterio absoluto durante 25 minutos seguidos mientras un violín desgarrador hace llorar hasta a las tazas de la cocina. CKY se queda con la boca abierta (+20 XP, Desbloquea Logro).",
                    "📺 [Novela Turca - 'Las Lágrimas de Kerem']: Kerem se toma un té turco mientras mira por la ventana de su mansión pensando en la traición de su primo segundo. Pasan 40 comerciales de jabón en polvo.",
                    "📺 [Novela Turca - 'Secretos del Bósforo']: Una lágrima solitaria cae por la mejilla de la protagonista en cámara ultralenta... Ángela comenta: '¡Dale que termine el capítulo que me da taquicardia!'."
                  ];
                  const msg = novelMsgs[Math.floor(Math.random() * novelMsgs.length)];
                  onTriggerDialogue("Televisor - Novela Turca Dramática", msg, msg);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🎭</span>
                  <div>
                    <p className="font-bold text-purple-300">Canal 2: Novela Turca Interminable</p>
                    <p className="text-[10px] text-purple-300/80">Miradas fijas de 45 minutos y violines dramáticos (+20 XP)</p>
                  </div>
                </div>
                <span className="text-purple-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowKitchenTvModal(false);
                  soundEngine.playSfx("select");
                  const salesMsgs = [
                    "📺 [Televentas - ¡Llame Ya!]: '¡La Faja Sauna Astral 3000! Confeccionada con nanofibras de cuarzo y ortiga silvestre. Adelgaza 10 kilos mientras duerme y ahuyenta malos espíritus con iones de litio.'",
                    "📺 [Televentas - ¡Llame Ya!]: '¡El Cuchillo Cósmico Ginsu! Corta latas de pintura, zapatos de cuero, portales del Limbo y sigue rebanando tomates como si fueran manteca. ¡Ordene ya y reciba un juego de repasadores!'",
                    "📺 [Televentas - ¡Llame Ya!]: '¡Almohada Ortopédica Cuántica! Diseñada por ingenieros de la NASA y chamanes andinos para alinear su columna y sus vidas pasadas al mismo tiempo.'"
                  ];
                  const msg = salesMsgs[Math.floor(Math.random() * salesMsgs.length)];
                  onTriggerDialogue("Televisor - Televentas de Madrugada", msg, msg);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🛍️</span>
                  <div>
                    <p className="font-bold text-emerald-300">Canal 3: Televentas de Madrugada</p>
                    <p className="text-[10px] text-emerald-300/80">Productos milagrosos en 120 cuotas sin interés</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">➔</span>
              </button>

              {/* Canal Secreto Cómico */}
              <button
                onClick={() => {
                  setShowKitchenTvModal(false);
                  soundEngine.playSfx("portal");
                  const secretMsgs = [
                    "📺 [Canal 66 - Frecuencia Secreta]: '...pshh... Vecina Paula fue vista comprando 20 frascos de veneno para sapos y una túnica negra... pshhh... Ángela susurra: ¡Esa vieja chusma no tiene paz!'",
                    "📺 [Canal 66 - Frecuencia Secreta]: '...kzzzt... Reporte extraterrestre: Un platillo volador con forma de empanada tucumana fue detectado orbitando la panadería.'",
                    "📺 [Canal 66 - Frecuencia Secreta]: '...pshh... Audio interceptado de Alanis: *Niña estúpida, deja de mirar la tele y busca los libros de matemática*... W comenta: Qué gran sabiduría cósmica.'"
                  ];
                  const msg = secretMsgs[Math.floor(Math.random() * secretMsgs.length)];
                  onTriggerDialogue("Canal Secreto 66", msg, msg);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>📻</span>
                  <div>
                    <p className="font-bold text-amber-300">Canal 66: Frecuencia Oculta (Secreto)</p>
                    <p className="text-[10px] text-amber-300/80">Interferencias extrañas y chismes del Limbo</p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold">★</span>
              </button>
            </div>

            <button
              onClick={() => setShowKitchenTvModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Kitchen Table & Chair Modal */}
      {showKitchenTableModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🪑</div>
            <h3 className="text-lg font-bold font-display text-amber-400 uppercase tracking-wide">
              Mesa y Sillas de la Cocina
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Una mesa acogedora de madera central con sillas cómodas para la familia.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowKitchenTableModal(false);
                  playSound(350, "sine", 0.3);
                  advanceTime(3);
                  addXP(5);
                  onTriggerDialogue(
                    "Mesa de la Cocina",
                    "Te sentaste cómodamente en la silla de la mesa. Disfrutas de un momento de descanso rodeada del cálido aroma del desayuno (+5 XP).",
                    "You sat down comfortably in the kitchen chair (+5 XP)."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🪑</span>
                  <div>
                    <p className="font-bold">Sentarse en la silla</p>
                    <p className="text-[10px] text-amber-300/80">Descansa 3 minutos a la mesa (+5 XP)</p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold">➔</span>
              </button>

              <button
                onClick={() => {
                  setShowKitchenTableModal(false);
                  playSound(400, "sine", 0.3);
                  onTriggerDialogue(
                    "Mesa de la Cocina",
                    "Mesa central de madera firme con manteles limpios, servilleteros y platos servidos.",
                    "Central kitchen wooden table with clean tablecloths and napkins."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>🔍</span>
                  <div>
                    <p className="font-bold">Examinar la mesa</p>
                    <p className="text-[10px] text-slate-400">Ver los detalles de la mesa</p>
                  </div>
                </div>
                <span className="text-slate-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowKitchenTableModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Kitchen Window Modal */}
      {showKitchenWindowModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-sky-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🪟</div>
            <h3 className="text-lg font-bold font-display text-sky-400 uppercase tracking-wide">
              Ventana de la Cocina
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {kitchenWindowOpen ? "La ventana está abierta. Una brisa fresca y brillante luz matutina entra a la cocina." : "La ventana está cerrada matizando la temperatura de la cocina."}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowKitchenWindowModal(false);
                  setKitchenWindowOpen(!kitchenWindowOpen);
                  playSound(300, "triangle", 0.3);
                  onTriggerDialogue(
                    "Ventana de la Cocina",
                    !kitchenWindowOpen ? "Abriste la ventana de la cocina. ¡Entra aire fresco y brillante luz solar de la mañana!" : "Cerraste la ventana de la cocina resguardando la calidez del hogar.",
                    !kitchenWindowOpen ? "You opened the kitchen window! Fresh morning air and sunlight stream in." : "You closed the kitchen window."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{kitchenWindowOpen ? "🔒" : "☀️"}</span>
                  <div>
                    <p className="font-bold">{kitchenWindowOpen ? "Cerrar ventana" : "Abrir ventana"}</p>
                    <p className="text-[10px] text-sky-300/80">{kitchenWindowOpen ? "Cierra la ventana de la cocina" : "Abre la ventana para dejar entrar la brisa y luz solar"}</p>
                  </div>
                </div>
                <span className="text-sky-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowKitchenWindowModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Kitchen Fireplace Modal */}
      {showKitchenFireplaceModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border-2 border-orange-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-3xl">🔥</div>
            <h3 className="text-lg font-bold font-display text-orange-400 uppercase tracking-wide">
              Chimenea de la Cocina
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {kitchenFireplaceLit ? "La chimenea de la cocina está encendida y crepita con calidez." : "La chimenea de la cocina está apagada."}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setShowKitchenFireplaceModal(false);
                  setKitchenFireplaceLit(!kitchenFireplaceLit);
                  playSound(kitchenFireplaceLit ? 250 : 550, "sawtooth", 0.3);
                  onTriggerDialogue(
                    "Chimenea de la Cocina",
                    !kitchenFireplaceLit ? "¡Encendiste la chimenea de la cocina! Un fuego acogedor crepita junto a la mesa del desayuno." : "Apagaste la chimenea de la cocina de manera segura.",
                    !kitchenFireplaceLit ? "You lit the kitchen fireplace! Warm flames crackle." : "You put out the kitchen fireplace safely."
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-orange-500/40 bg-orange-950/40 hover:bg-orange-900/60 text-orange-200 font-mono text-xs text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{kitchenFireplaceLit ? "❄️" : "🔥"}</span>
                  <div>
                    <p className="font-bold">{kitchenFireplaceLit ? "Apagar chimenea" : "Prender chimenea"}</p>
                    <p className="text-[10px] text-orange-300/80">{kitchenFireplaceLit ? "Extingue el fuego de la cocina" : "Enciende fuego reconfortante"}</p>
                  </div>
                </div>
                <span className="text-orange-400 font-bold">➔</span>
              </button>
            </div>

            <button
              onClick={() => setShowKitchenFireplaceModal(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Giant Cockroach RPG Combat Modal HD */}
      {showCockroachCombatModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-lg z-50 flex flex-col items-center justify-between p-4 text-center animate-fade-in border-4 border-red-600/80 shadow-[0_0_80px_rgba(220,38,38,0.5)]">
          {/* Header Bar */}
          <div className="w-full max-w-xl bg-slate-900/90 border-2 border-red-500/70 rounded-2xl p-3 shadow-2xl flex items-center justify-between backdrop-blur-md">
            <span className="text-red-500 font-black font-display text-sm tracking-widest uppercase flex items-center gap-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
              <span className="animate-pulse text-base">⚔️</span> BATALLA RPG - CUCARACHA GIGANTE HD
            </span>
            <span className="text-xs font-mono font-bold text-red-300 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse">
              LVL 999 BOSS
            </span>
          </div>

          {/* Arena View */}
          <div className="relative w-full max-w-xl h-64 bg-slate-950 border-2 border-slate-800 rounded-3xl flex items-center justify-around overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] my-2">
            
            {/* Background grid effect + Laser Scan */}
            <div className="absolute inset-0 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-50" />

            {/* Giant Foot Falling Animation Overlay */}
            {giantFootFalling && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-sm animate-bounce">
                <svg className="w-56 h-56 drop-shadow-[0_20px_40px_rgba(0,0,0,1)] text-amber-950 filter" viewBox="0 0 100 100" fill="currentColor">
                  {/* Giant Leg/Foot */}
                  <rect x="35" y="0" width="30" height="60" fill="#78350f" rx="4" />
                  <ellipse cx="50" cy="70" rx="38" ry="20" fill="#451a03" />
                  <ellipse cx="22" cy="72" rx="12" ry="9" fill="#451a03" />
                  {/* Shoe sole / treads */}
                  <path d="M 12 75 Q 50 92 88 75 Q 88 84 50 88 Q 12 84 12 75 Z" fill="#09090b" />
                  <line x1="20" y1="80" x2="80" y2="80" stroke="#27272a" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                <div className="text-red-300 font-black text-xl uppercase tracking-widest bg-black/95 px-6 py-2 rounded-full border-2 border-red-500 mt-2 shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse">
                  ¡¡¡PIE GIGANTE CAYENDO!!!
                </div>
              </div>
            )}

            {/* CKY Hero Side */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="bg-slate-900/90 border border-cyan-500/70 px-3 py-1 rounded-xl text-xs font-mono text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] backdrop-blur-md">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" /> CKY
                </div>
                <div className="w-28 bg-slate-950 h-2.5 rounded-full overflow-hidden mt-1 border border-cyan-500/40 p-0.5">
                  <div className="bg-gradient-to-r from-cyan-400 to-sky-300 h-full w-full rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                </div>
                <span className="text-[10px] text-slate-300 font-bold">HP: 100/100</span>
              </div>

              {/* Custom SVG Avatar for CKY */}
              <div className="relative w-28 h-36 flex flex-col items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                <svg className="w-full h-full" viewBox="0 0 100 120">
                  {/* Hair back tails */}
                  <path d="M 20 30 Q 10 50 15 65 Q 25 60 25 35 Z" fill="#582f0e" />
                  <path d="M 80 30 Q 90 50 85 65 Q 75 60 75 35 Z" fill="#582f0e" />

                  {/* Body / Outfit */}
                  {currentOutfit === "naked" ? (
                    <g>
                      <rect x="35" y="45" width="30" height="40" fill="#ffd8b3" rx="4" />
                      <g opacity="0.9">
                        <rect x="30" y="50" width="40" height="35" fill="#fdba74" />
                        <rect x="32" y="52" width="12" height="12" fill="#fb923c" />
                        <rect x="48" y="52" width="18" height="12" fill="#fdba74" />
                        <rect x="32" y="66" width="16" height="16" fill="#f97316" />
                        <rect x="50" y="66" width="16" height="16" fill="#fb923c" />
                        <rect x="36" y="72" width="28" height="10" fill="#ea580c" opacity="0.8" />
                      </g>
                    </g>
                  ) : currentOutfit === "towel" ? (
                    <g>
                      <rect x="32" y="45" width="36" height="42" fill="#ffffff" rx="6" />
                      <rect x="32" y="45" width="36" height="6" fill="#f472b6" rx="2" />
                      <line x1="50" y1="51" x2="50" y2="85" stroke="#cbd5e1" strokeWidth="2" />
                    </g>
                  ) : currentOutfit === "uniform" ? (
                    <g>
                      <rect x="32" y="45" width="36" height="22" fill="#22c55e" rx="4" />
                      <rect x="34" y="67" width="32" height="22" fill="#1d4ed8" rx="2" />
                    </g>
                  ) : currentOutfit === "sport" ? (
                    <g>
                      <rect x="32" y="45" width="36" height="20" fill="#f97316" rx="4" />
                      <rect x="34" y="65" width="32" height="16" fill="#18181b" rx="2" />
                    </g>
                  ) : currentOutfit === "silk_pajamas" ? (
                    <g>
                      <rect x="32" y="45" width="36" height="42" fill="#f472b6" rx="6" />
                      <line x1="50" y1="45" x2="50" y2="87" stroke="#fbcfe8" strokeWidth="1.5" />
                    </g>
                  ) : currentOutfit === "lingerie" ? (
                    <g>
                      <rect x="35" y="45" width="30" height="40" fill="#ffd8b3" rx="4" />
                      <rect x="34" y="50" width="32" height="12" fill="#dc2626" rx="2" />
                      <rect x="38" y="70" width="24" height="12" fill="#dc2626" rx="2" />
                    </g>
                  ) : currentOutfit === "gala_dress" ? (
                    <g>
                      <path d="M 32 45 L 68 45 L 78 88 L 22 88 Z" fill="#09090b" />
                      <path d="M 32 45 Q 50 55 68 45 L 60 70 Q 50 65 40 70 Z" fill="#eab308" />
                    </g>
                  ) : (
                    <g>
                      {/* Violet hoodie default/casual */}
                      <rect x="32" y="45" width="36" height="24" fill="#8b5cf6" rx="4" />
                      <rect x="34" y="69" width="32" height="20" fill="#3b82f6" rx="2" />
                    </g>
                  )}

                  {/* Head & Face */}
                  <circle cx="50" cy="30" r="16" fill="#ffd8b3" />
                  <circle cx="44" cy="28" r="2.5" fill="#1e293b" />
                  <circle cx="56" cy="28" r="2.5" fill="#1e293b" />
                  <path d="M 46 36 Q 50 40 54 36" stroke="#e11d48" strokeWidth="2" fill="none" />
                  {/* Front hair / bangs */}
                  <path d="M 34 22 Q 50 14 66 22 Q 50 28 34 22 Z" fill="#582f0e" />
                </svg>
              </div>
            </div>

            {/* VS Divider */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-2xl font-black text-red-500 italic drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse">
                VS
              </span>
            </div>

            {/* Cockroach Boss Side */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="bg-slate-900/90 border border-red-500/70 px-3 py-1 rounded-xl text-xs font-mono text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)] backdrop-blur-md">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  🪳 CUCARACHA TITÁN
                </div>
                <div className="w-28 bg-slate-950 h-2.5 rounded-full overflow-hidden mt-1 border border-red-500/40 p-0.5">
                  <div className={`h-full rounded-full transition-all duration-500 ${cockroachSquished ? "w-0 bg-slate-700" : "w-full bg-gradient-to-r from-red-600 to-amber-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`} />
                </div>
                <span className="text-[10px] text-red-300 font-bold">
                  {cockroachSquished ? "HP: 0/999999 (APLASTADA)" : "HP: 999999/999999"}
                </span>
              </div>

              {/* Boss Sprite Render */}
              <div className={`relative w-28 h-36 flex flex-col items-center justify-center filter drop-shadow-[0_10px_25px_rgba(220,38,38,0.7)] transition-all duration-300 ${cockroachSquished ? "scale-y-25 opacity-70 translate-y-8" : "animate-pulse"}`}>
                <div className="text-6xl select-none">🪳</div>
                {cockroachSpeech && (
                  <div className="absolute -top-10 bg-red-950 border border-red-500 text-red-200 text-[10px] font-mono px-2 py-1 rounded-lg whitespace-nowrap shadow-lg animate-bounce">
                    {cockroachSpeech}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Combat Log & Description */}
          <div className="w-full max-w-xl bg-slate-900/90 border border-slate-700 rounded-2xl p-3 shadow-lg min-h-[60px] flex items-center justify-center">
            <p className="text-xs font-mono text-amber-300 leading-relaxed">
              {cockroachLog || "¡Una CUCARACHA GIGANTE bloquea tu camino con una fuerza cósmica inconmensurable! ¿Qué harás?"}
            </p>
          </div>

          {/* Action Buttons / Controls */}
          <div className="w-full max-w-xl grid grid-cols-2 gap-2 mt-2">
            {!cockroachSquished ? (
              <>
                <button
                  onClick={() => handleCockroachAction("attack")}
                  className="py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold font-mono text-xs rounded-xl shadow-lg border border-red-400 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  ⚔️ ATAQUE NORMAL
                </button>
                <button
                  onClick={() => handleCockroachAction("special")}
                  className="py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold font-mono text-xs rounded-xl shadow-lg border border-purple-400 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  ✨ ATAQUE ESPECIAL
                </button>
                <button
                  onClick={() => handleCockroachAction("block")}
                  className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600 text-white font-bold font-mono text-xs rounded-xl shadow-lg border border-blue-400 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  🛡️ DEFENDERSE
                </button>
                <button
                  onClick={() => handleCockroachAction("flee")}
                  className="py-2.5 px-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-200 font-bold font-mono text-xs rounded-xl shadow-lg border border-slate-600 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  🏃 HUIR
                </button>
              </>
            ) : (
              <button
                onClick={finishCockroachCombat}
                className="col-span-2 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black font-display text-sm tracking-wider uppercase rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.6)] border-2 border-emerald-400 active:scale-95 transition-all animate-pulse"
              >
                🎉 CONTINUAR AVENTURA (VICTORIA)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Day 5: Sexy Photoshoot Modal */}
      {showDay5PhotoModal && (
        <Day5SexyPhotosModal
          language={language}
          playSound={(freq, type, dur) => playSound(freq, type, dur)}
          onClose={() => setShowDay5PhotoModal(false)}
          onSavePhoto={(photo) => {
            if (addPhotoToGallery) addPhotoToGallery(photo);
          }}
          onComplete={() => {
            setShowDay5PhotoModal(false);
            setDay5SexyPhotosTaken(true);
            localStorage.setItem("cky_day5_photos_taken", "true");
            addXP(100);
            unlockDiaryEntry("chapter_05_sexy_photoshoot");
          }}
        />
      )}

      {/* Day 6: Dark Form Battle Modal */}
      {showDay6BattleModal && (
        <Day6DarkFormBattleModal
          language={language}
          soulmateInfo={soulmateInfo}
          playSound={playSound}
          onVictory={() => {
            setShowDay6BattleModal(false);
            setDay6DarkFormDefeated(true);
            localStorage.setItem("cky_day6_dark_form_defeated", "true");
            setShowDay6AlanisCutscene(true);
          }}
        />
      )}

      {/* Day 6: Alanis Cutscene Modal */}
      {showDay6AlanisCutscene && (
        <Day6AlanisCutsceneModal
          language={language}
          soulmateInfo={soulmateInfo}
          playSound={playSound}
          onFinish={() => {
            setShowDay6AlanisCutscene(false);
            setDay6AlanisInterventionDone(true);
            localStorage.setItem("cky_day6_alanis_done", "true");
            addXP(150);
            unlockDiaryEntry("chapter_06_dark_form_revealed");
            onTriggerDialogue(
              "CKY",
              `¡El aura sombría se disipó! Es ${soulmateInfo?.name || "tu Alma Gemela"}, mitad humano y mitad espíritu. Ahora podemos prepararnos juntos para ir a la escuela.`,
              `The shadow aura dissipated! It's ${soulmateInfo?.name || "your Soulmate"}, half human and half spirit. Now we can prepare together to go to school.`
            );
          }}
        />
      )}

      {/* Day 6: Possessed Soccer Battle Modal (Mateo) */}
      {showDay6PossessedSoccerModal && (
        <Day6PossessedSoccerBattleModal
          language={language}
          soulmateInfo={soulmateInfo}
          playSound={playSound}
          onVictory={() => {
            setShowDay6PossessedSoccerModal(false);
            setDay6PossessedSoccerDefeated(true);
            localStorage.setItem("cky_day6_soccer_boss_defeated", "true");
            addXP(200);
            unlockDiaryEntry("chapter_06_mateo_liberated");
            onTriggerDialogue(
              "Mateo (Libre de la Posesión)",
              "¡¡Ufffff...!! ¡¿CKY?! ¡¿Qué me pasó?! Sentía un calor negro quemándome la cabeza y no podía controlar mis piernas... ¡Gracias por salvarme!",
              "Phew...!! CKY?! What happened to me?! I felt a black heat burning inside my head and couldn't control my legs... Thank you for saving me!"
            );
          }}
        />
      )}

      {/* Day 7: Minion 1 Battle (Espectro de las Calderas) */}
      {showDay7Minion1BattleModal && (
        <Day7BasementMinionBattleModal
          language={language}
          soulmateInfo={soulmateInfo}
          minionType="steam_specter"
          playSound={playSound}
          onVictory={() => {
            setShowDay7Minion1BattleModal(false);
            setDay7BasementMinion1Defeated(true);
            localStorage.setItem("cky_day7_minion1_defeated", "true");
            addXP(120);
            playSound(880, "sine", 0.5);
            onTriggerDialogue(
              "Ángela (Espíritu)",
              "¡Bien hecho CKY! El espectro de vapor se evaporó. Ahora busquemos la llave en alguna caja para abrir las rejas.",
              "Well done CKY! The steam specter evaporated. Now let's look for the key in a toolbox to open the gate."
            );
          }}
        />
      )}

      {/* Day 7: Minion 2 Battle (Sombra de Discordia) */}
      {showDay7Minion2BattleModal && (
        <Day7BasementMinionBattleModal
          language={language}
          soulmateInfo={soulmateInfo}
          minionType="discord_shadow"
          playSound={playSound}
          onVictory={() => {
            setShowDay7Minion2BattleModal(false);
            setDay7BasementMinion2Defeated(true);
            localStorage.setItem("cky_day7_minion2_defeated", "true");
            addXP(150);
            playSound(880, "sine", 0.5);
            onTriggerDialogue(
              soulmateInfo?.name || "Alma Gemela",
              "¡Buena esa! Esa sombra de discordia quedó echa polvo. Desactivemos el generador violeta al toque.",
              "Great job! That discord shadow was turned to dust. Let's disable the violet generator right away."
            );
          }}
        />
      )}

      {/* Day 7: Laboratory Boss Battle Modal (Liberation of Prof. Montenegro & Abril) */}
      {showDay7LabBossBattleModal && (
        <Day7LabBossBattleModal
          language={language}
          soulmateInfo={soulmateInfo}
          playSound={playSound}
          onVictory={() => {
            setShowDay7LabBossBattleModal(false);
            setDay7LaboratoryBossDefeated(true);
            setDay7ProfessorLiberated(true);
            localStorage.setItem("cky_day7_lab_boss_defeated", "true");
            localStorage.setItem("cky_day7_prof_liberated", "true");
            addXP(300);
            unlockDiaryEntry("chapter_07_laboratory_boss_and_liberation");
            playSound(980, "sine", 0.6);
            onTriggerDialogue(
              "Profesor Montenegro (Profesor de Química - Liberado)",
              "¡CKY! ¡Nos salvaron la vida y la cordura! Esa entidad sombría nos tenía hipnotizados obligándonos a sintetizar veneno oscuro. Me enteré de la supuesta expulsión que tramó la Vecina con el director poseído... ¡Es un atropello infame! Como delegado docente presentaré una impugnación urgente ante el Consejo Escolar para anularla y reintegrarte con honores.",
              "CKY! You saved our lives and sanity! That shadow entity had us hypnotized. I heard about the fake expulsion framed by the Neighbor... It is an infamous outrage! As teacher representative, I will file an urgent appeal to annul it.",
              () => {
                onTriggerDialogue(
                  "Abril (Compañera de Clase - Liberada)",
                  "¡Muchísimas gracias CKY! ¡Y gracias a tu equipo! Pensé que no íbamos a salir jamás de esta pesadilla subterránea. ¡Sos nuestra heroína!",
                  "Thank you so much CKY! And thanks to your team! I thought we would never escape this underground nightmare. You are our hero!",
                  () => {
                    onTriggerDialogue(
                      "CKY (Aliviada pero Agotada)",
                      "¡Menos mal que llegamos a tiempo! Ahora salgamos rápido del sótano y volvamos a casa a asearnos y descansar.",
                      "Good thing we arrived in time! Now let's quickly get out of the basement and head home to clean up and rest.",
                      () => {
                        onTriggerDialogue(
                          "Ángela (Espíritu - Festejo y Apuro)",
                          "¡¡SIIII!! ¡Salgamos volando de este pozo con olor a azufre y rata frita! ¡Vamos a casa CKY!",
                          "YESSS!! Let's fly out of this hole smelling like sulfur and fried rat! Let's go home CKY!"
                        );
                      }
                    );
                  }
                );
              }
            );
          }}
        />
      )}

      {/* Day 8 Objectives Tracker */}
      {currentDay === 8 && gameState === "playing" && !isDay8Intro && (
        <Day8ObjectivesTracker
          language={language}
          plazaDefended={day8PlazaDefended}
          hospitalDefended={day8HospitalDefended}
          terminalDefended={day8TerminalDefended}
          mallDefended={day8MallDefended}
          currentMap={currentMap}
          onTravelTo={(targetMap) => {
            playSound(450, "sine", 0.2);
            if (targetMap === "plaza_principal") {
              transitionToMap("plaza_principal", { x: 7, y: 7 });
            } else if (targetMap === "hospital_municipal") {
              transitionToMap("hospital_municipal", { x: 7, y: 7 });
            } else if (targetMap === "bus_terminal") {
              transitionToMap("bus_terminal", { x: 7, y: 7 });
            } else if (targetMap === "shopping_mall") {
              transitionToMap("shopping_mall", { x: 8, y: 7 });
            } else {
              transitionToMap("street", { x: 14, y: 5 });
            }
          }}
          playSound={playSound}
        />
      )}

      {/* Day 8 Invasion Boss Battle */}
      {activeDay8Battle !== null && (
        <Day8InvasionBattleModal
          language={language}
          location={activeDay8Battle}
          playSound={playSound}
          onVictory={() => {
            handleDay8BattleVictory(activeDay8Battle);
          }}
        />
      )}

      {/* Day 8 Neighbor Door Confrontation Climax */}
      {showDay8NeighborClimaxModal && (
        <Day8NeighborClimaxModal
          language={language}
          soulmateInfo={soulmateInfo}
          playSound={playSound}
          onComplete={handleNeighborClimaxComplete}
        />
      )}

      {/* Day 8 Alanis Final Cutscene & Lineage Renunciation */}
      {showDay8AlanisModal && (
        <Day8AlanisFinalCutsceneModal
          language={language}
          playSound={playSound}
          onComplete={handleAlanisFinalCutsceneComplete}
        />
      )}

      {/* Day 8 Chapter 1 Grand Finale & Epilogue */}
      {showDay8EndingModal && (
        <Day8Chapter1EndingModal
          language={language}
          onOpenJournal={() => {
            onOpenDiary?.();
          }}
          onReturnToTitle={() => {
            resetGame();
          }}
          onOpenDevDaySelect={() => {
            setShowDay8EndingModal(false);
            onOpenDevDaySelect?.();
          }}
          onContinueFreeRoam={() => {
            setShowDay8EndingModal(false);
            setFreeRoamActive(true);
            localStorage.setItem("cky_free_roam_active", "true");
            soundEngine.playSfx("purchase");
            unlockAchievement("ach_peaceful_life", onShowNotification, addXP);
            if (onShowNotification) {
              onShowNotification({
                icon: "🌟",
                titleEs: "¡Modo Epílogo / Exploración Libre Activo!",
                titleEn: "Epilogue / Free Roam Mode Active!",
                subEs: "Explorá libremente, jugá con Mateo al fútbol, cociná sándwiches y desbloqueá todos los logros.",
                subEn: "Explore freely, play soccer with Mateo, cook sandwiches and unlock all achievements.",
                color: "amber"
              });
            }
          }}
          playSound={playSound}
        />
      )}

      {/* Soccer Penalty Shootout Minigame */}
      {showSoccerMinigame && (
        <SoccerPenaltyMinigame
          language={language}
          onClose={() => setShowSoccerMinigame(false)}
          onAddXP={addXP}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Gourmet Sandwich Minigame */}
      {showSandwichMinigame && (
        <KitchenSandwichMinigame
          language={language}
          onClose={() => setShowSandwichMinigame(false)}
          onAddXP={addXP}
          onAddInventoryItem={addInventoryItem}
          onRestoreHunger={(amount) => {
            setStats(prev => ({
              ...prev,
              hambre: Math.min(100, (prev.hambre || 0) + amount)
            }));
          }}
          onShowNotification={onShowNotification}
        />
      )}

      {/* School Trivia Quiz Minigame */}
      {showTriviaMinigame && (
        <SchoolTriviaMinigame
          language={language}
          onClose={() => setShowTriviaMinigame(false)}
          onAddXP={addXP}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Claw Machine Arcade Minigame */}
      {showClawMachine && (
        <ClawMachineMinigame
          language={language}
          money={propStats?.money ?? 500}
          onClose={() => setShowClawMachine(false)}
          onDeductMoney={(amount) => {
            handleSpendMoney(amount);
          }}
          onAddInventoryItem={addInventoryItem}
          onAddXP={addXP}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Bicycle Obstacle Race Minigame */}
      {showBicycleRace && (
        <BicycleRaceMinigame
          language={language}
          onClose={() => setShowBicycleRace(false)}
          onAddXP={addXP}
          onEarnMoney={handleEarnMoney}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Street Food Cart Modal */}
      {showStreetFoodCart && (
        <StreetFoodCartModal
          language={language}
          money={propStats?.money ?? 500}
          onClose={() => setShowStreetFoodCart(false)}
          onDeductMoney={(amount) => {
            handleSpendMoney(amount);
          }}
          onAddXP={addXP}
          onAddInventoryItem={addInventoryItem}
          onRestoreStats={(hungerDelta, thirstDelta) => {
            setStats(prev => ({
              ...prev,
              hambre: Math.min(100, (prev.hambre || 0) + hungerDelta),
              sed: Math.min(100, (prev.sed || 0) + thirstDelta)
            }));
          }}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Town & School Notice Board Modal */}
      {showNoticeBoard && (
        <TownNoticeBoardModal
          language={language}
          onClose={() => setShowNoticeBoard(false)}
          onAddXP={addXP}
          onAddMoney={handleEarnMoney}
          inventory={inventory}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Room Customization Modal */}
      {showRoomCustomization && (
        <RoomCustomizationModal
          language={language}
          onClose={() => setShowRoomCustomization(false)}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Pet Care System Modal */}
      {showPetModal && (
        <PetSystemModal
          language={language}
          onClose={() => setShowPetModal(false)}
          onAddXP={addXP}
          onShowNotification={onShowNotification}
        />
      )}

      {/* Free Roam Crazy & Spicy Missions Modal */}
      {showCrazyMissionsModal && (
        <CrazyMissionsModal
          language={language}
          onClose={() => setShowCrazyMissionsModal(false)}
          onShowNotification={onShowNotification}
          addXP={addXP}
          onAddMoney={(amount) => {
            setStats(prev => ({
              ...prev,
              dinero: (prev.dinero || 0) + amount
            }));
          }}
          onTriggerDialogue={(speaker, textEs, textEn, onDone) => {
            onTriggerDialogue(speaker, textEs, textEn, onDone);
          }}
        />
      )}

      {/* Floating Free Roam Crazy Missions Button (Visible in Free Roam or after Day 8 completion) */}
      {freeRoamActive && gameState === "playing" && introStep === -1 && activeDay8Battle === null && !showDay8NeighborClimaxModal && !showDay8AlanisModal && !showDay8EndingModal && !showCrazyMissionsModal && (
        <button
          onClick={() => {
            soundEngine.unlockAudio();
            soundEngine.playSfx("select");
            setShowCrazyMissionsModal(true);
          }}
          className="absolute top-14 left-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-900/95 via-pink-900/95 to-rose-900/95 hover:from-purple-800 hover:to-rose-800 border-2 border-pink-400 shadow-xl text-white text-xs font-mono transition-all transform active:scale-95 cursor-pointer backdrop-blur-md animate-pulse"
          title={language === "es" ? "Misiones Locas y Picantes del Modo Libre" : "Free Roam Crazy & Spicy Missions"}
        >
          <span className="text-sm">🔥</span>
          <span className="font-black text-[11px] text-yellow-300">{language === "es" ? "MISIONES LOCAS" : "CRAZY MISSIONS"}</span>
          <span className="text-[9px] bg-pink-500/40 text-pink-200 px-1 rounded-full font-bold">15+</span>
        </button>
      )}

      {/* Floating Comedy Banter Button (Ocurrencias de Ángela y W) */}
      {gameState === "playing" && introStep === -1 && !isDay2Intro && !isDay3Intro && !isDay4Intro && !isDay5Intro && activeDay8Battle === null && !showDay8NeighborClimaxModal && !showDay8AlanisModal && !showDay8EndingModal && !showSoccerMinigame && !showSandwichMinigame && !showTriviaMinigame && !showClawMachine && !showBicycleRace && !showStreetFoodCart && !showNoticeBoard && !showRoomCustomization && !showPetModal && !showCrazyMissionsModal && (
        <button
          onClick={handleTriggerSpiritBanter}
          className="absolute top-14 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-purple-500/60 shadow-lg text-purple-200 text-xs font-mono transition-all transform active:scale-95 cursor-pointer backdrop-blur-sm"
          title={language === "es" ? "Ocurrencias y bromas de Ángela y W" : "Angela and W humorous banter"}
        >
          <span className="text-sm">👻</span>
          <span className="font-bold text-[11px] text-purple-300">{language === "es" ? "Cháchara" : "Banter"}</span>
          <span className="text-[10px] text-amber-400">✨</span>
        </button>
      )}

      {/* Virtual Gamepad for Android & Touch Screens */}
      {gameState === "playing" && introStep === -1 && !isDay2Intro && !isDay3Intro && !isDay4Intro && !isDay5Intro && activeDay8Battle === null && !showDay8NeighborClimaxModal && !showDay8AlanisModal && !showDay8EndingModal && !showSoccerMinigame && !showSandwichMinigame && !showTriviaMinigame && !showClawMachine && !showBicycleRace && !showStreetFoodCart && !showNoticeBoard && !showRoomCustomization && !showPetModal && (
        <VirtualGamepad
          onMove={handleGamepadMove}
          onAction={handleGamepadAction}
          onCancelOrBackpack={handleGamepadCancelOrBackpack}
          visible={showDPad}
          onToggleVisible={() => setShowDPad(prev => !prev)}
          isSprinting={isSprinting}
          onToggleSprint={() => setIsSprinting(prev => !prev)}
          controlMode={activeGraphicsConfig.gamepadControlMode || "dpad"}
          opacity={activeGraphicsConfig.gamepadOpacity ?? 85}
          leftHanded={activeGraphicsConfig.gamepadLeftHanded ?? false}
          onOpenPhone={onOpenPhone}
          onOpenJournal={onOpenDiary}
        />
      )}

      {/* Audio & Music Settings Modal */}
      {showAudioModal && (
        <AudioControlsModal
          language={language}
          onClose={() => setShowAudioModal(false)}
        />
      )}

      {/* Retro Illustrated Cinematic Cutscenes */}
      {activeCinematicType && (
        <RetroCinematicModal
          type={activeCinematicType}
          language={language}
          soulmateInfo={soulmateInfo}
          onClose={() => setActiveCinematicType(null)}
          onFinish={handleCinematicFinish}
        />
      )}

      {/* Shopping Mall & Airport Store Catalogs */}
      {activeShopType && (
        <ShopCatalogModal
          shopType={activeShopType}
          language={language}
          currentMoney={propStats?.money ?? 500}
          onClose={() => setActiveShopType(null)}
          onBuyItem={handleBuyShopItem}
          onEquipOutfit={(outfit) => {
            if (propSetOutfit) propSetOutfit(outfit);
          }}
          onThrowFountainCoin={handleThrowFountainCoin}
          purchasedItemIds={inventory.map(i => i.id)}
        />
      )}
    </div>
  );
};

