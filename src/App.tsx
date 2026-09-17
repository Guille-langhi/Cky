import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  GameState, 
  Language, 
  InventoryItem, 
  PhoneChat, 
  PhoneReply, 
  PhonePhoto,
  DiaryEntry,
  DialogSegment,
  CharacterStats,
  Companion,
  OutfitType,
  SoulmateInfo
} from "./types";
import Header from "./components/Header";
import GameCanvas from "./components/GameCanvas";
import PhoneInterface from "./components/PhoneInterface";
import CombatSimulator from "./components/CombatSimulator";
import { AndroidDeviceFrame } from "./components/AndroidDeviceFrame";
import JournalAndInventory from "./components/JournalAndInventory";
import SaveLoadModal from "./components/SaveLoadModal";
import DevDaySelectModal from "./components/DevDaySelectModal";
import GraphicsSettingsModal from "./components/GraphicsSettingsModal";
import { AndroidExportModal } from "./components/AndroidExportModal";
import { SaveSlotData, saveToSlot, getLatestSave } from "./lib/saveSystem";
import { GraphicsConfig, loadGraphicsConfig, saveGraphicsConfig } from "./lib/graphicsEngine";
import { androidBridge } from "./lib/androidMobileBridge";
import { soundEngine } from "./lib/soundEngine";
import { DEFAULT_PHONE_CHATS } from "./data/defaultChats";
import { unlockAchievement } from "./data/achievements";
import { 
  Gamepad2, 
  Terminal, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  PhoneCall, 
  RefreshCw,
  Send,
  HelpCircle,
  Smartphone,
  Save,
  Download
} from "lucide-react";

export default function App() {
  const [gameState, setGameState] = useState<GameState>("title");
  const [language, setLanguage] = useState<Language>("es");
  const [isSilent, setIsSilent] = useState<boolean>(true); // Bible recommends silent world, let's keep it silent default!

  // Development Mode state
  const [showDevModal, setShowDevModal] = useState<boolean>(false);

  // Graphics Engine Next-Gen State
  const [graphicsConfig, setGraphicsConfig] = useState<GraphicsConfig>(loadGraphicsConfig);
  const [showGraphicsModal, setShowGraphicsModal] = useState<boolean>(false);

  // Android Export / PWA Modal state
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);

  // Save/Load System state
  const [saveLoadModalState, setSaveLoadModalState] = useState<{ isOpen: boolean; mode: "save" | "load" } | null>(null);
  const [loadedSaveData, setLoadedSaveData] = useState<SaveSlotData | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const canvasStateRef = useRef<any>({});

  // Dialogue overlay state
  const [dialogSpeaker, setDialogSpeaker] = useState<string>("");
  const [dialogText, setDialogText] = useState<string>("");
  const [dialogOnDone, setDialogOnDone] = useState<(() => void) | null>(null);

  // Keyboard customization state
  const [customKeys, setCustomKeys] = useState({
    up: "w",
    down: "s",
    left: "a",
    right: "d",
  });

  // Android Systems: Screen Wake Lock, Storage Persistence & Background Battery Optimizer
  useEffect(() => {
    // 1. Keep screen active while playing
    const cleanupWakeLock = androidBridge.initAutoWakeLock();

    // 2. Request persistent storage for saved games
    androidBridge.requestPersistentStorage();

    // 3. Audio & Battery saver when user switches apps / locks screen
    const handleVisibilityChange = () => {
      if (document.hidden) {
        soundEngine.suspendAudio();
      } else {
        soundEngine.resumeAudio();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cleanupWakeLock();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Sound generator helper
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
      console.log("Web Audio blocked", e);
    }
  };

  // Character Stats state
  const [stats, setStats] = useState<CharacterStats>(() => {
    const savedMoney = localStorage.getItem("cky_stats_money");
    return {
      hambre: 100,
      sed: 100,
      perfume: 100,
      amor: 50,
      higiene: 100,
      bateriaCelular: 100,
      money: savedMoney ? Number(savedMoney) : 500,
      speedBuff: localStorage.getItem("cky_speed_buff") === "true",
      perfumeBuff: localStorage.getItem("cky_perfume_buff") === "true",
      level: 1,
      xp: 0,
      maxXp: 100,
    };
  });

  // Twin & Pau names
  const [twinName, setTwinName] = useState<string>("");
  const [pauName, setPauName] = useState<string>("");
  const [soulmateInfo, setSoulmateInfo] = useState<SoulmateInfo | null>(null);

  // Game canvas reset signal key
  const [resetKey, setResetKey] = useState<number>(0);

  // Backpack, Phone, Outfit and Grooming state
  const [hasBackpack, setHasBackpack] = useState<boolean>(false);
  const [hasPhone, setHasPhone] = useState<boolean>(false);
  const [currentOutfit, setCurrentOutfit] = useState<OutfitType>("pajamas");
  const [hasGroomed, setHasGroomed] = useState<boolean>(false);

  // Companions state (Gemelo, Espíritus, Humanos: Amigos y Enemigos)
  const [companions, setCompanions] = useState<Companion[]>([
    {
      id: "gemelo",
      nameEs: "Gemelo (Espíritu Cónyuge)",
      nameEn: "Twin (Spiritual Partner)",
      category: "gemelo",
      relationEs: "Vínculo de alma compartido",
      relationEn: "Shared soul link",
      descEs: "Un híbrido entre espíritu y humano. Comparte estadísticas y daño con CKY como una sola persona.",
      descEn: "A hybrid between spirit and human. Shares stats and damage with CKY as one person.",
      icon: "♊",
      bondLevel: 50,
      powers: [
        {
          id: "p1",
          nameEs: "Resonancia Espiritual",
          nameEn: "Spiritual Resonance",
          descEs: "Incrementa el daño espiritual compartido y fortalece el lazo de Amor.",
          descEn: "Increases shared spiritual damage and strengthens the Love bond.",
          unlocked: true,
          cost: 20
        }
      ]
    },
    {
      id: "hermes",
      nameEs: "Hermes (Espíritu Guía)",
      nameEn: "Hermes (Guide Spirit)",
      category: "espíritus",
      relationEs: "Guía del Limbo",
      relationEn: "Guide of Limbo",
      descEs: "Mensajero de los vientos que le enseña a CKY a revelar secretos invisibles.",
      descEn: "Messenger of the winds who teaches CKY to reveal invisible secrets.",
      icon: "🔮",
      bondLevel: 80,
      powers: [
        {
          id: "p2",
          nameEs: "Ver lo Invisible",
          nameEn: "See the Invisible",
          descEs: "Revela portales y auras oscuras ocultas.",
          descEn: "Reveals hidden dark portals and auras.",
          unlocked: true,
          cost: 15
        }
      ]
    },
    {
      id: "mom",
      nameEs: "Mamá",
      nameEn: "Mom",
      category: "humanos",
      relationEs: "Familia / Amigo",
      relationEn: "Family / Friend",
      descEs: "Madre cariñosa. Debe ser protegida del mundo oculto.",
      descEn: "Loving mother. Must be kept safe from the hidden world.",
      icon: "👩",
      bondLevel: 100,
      powers: []
    },
    {
      id: "pau",
      nameEs: "Pau",
      nameEn: "Pau",
      category: "humanos",
      relationEs: "Rival / Enemigo",
      relationEn: "Rival / Enemy",
      descEs: "Compañera de clase observadora que sospecha de la doble vida espiritual de CKY.",
      descEn: "Observant classmate who suspects CKY's double spiritual life.",
      icon: "👩‍🎤",
      bondLevel: 30,
      powers: []
    },
    {
      id: "angela",
      nameEs: "Ángela (Espíritu Pícaro)",
      nameEn: "Angela (Playful Spirit)",
      category: "espíritus",
      relationEs: "Amiga del Alma / Compañera Pícara",
      relationEn: "Soul Friend / Playful Companion",
      descEs: "Espíritu alegre, extrovertida y sin filtro de 15 años que descansa en la tumba rosa. Le encanta hacer chistes con doble sentido, mimar a CKY y ayudarla en combate contra las sombras.",
      descEn: "Cheerful, outgoing, unfiltered 15-year-old spirit resting in the pink tomb. Loves making innuendo jokes, spoiling CKY, and helping in spirit battles.",
      icon: "👻",
      bondLevel: 100,
      powers: [
        {
          id: "p_angela_1",
          nameEs: "Distracción Picante",
          nameEn: "Spicy Innuendo Taunt",
          descEs: "Lanza una broma de doble sentido que confunde y desconcentra al espíritu enemigo, reduciendo su defensa un 50%.",
          descEn: "Drops a saucy innuendo joke that confuses the enemy spirit, cutting its defense by 50%.",
          unlocked: true,
          cost: 15
        },
        {
          id: "p_angela_2",
          nameEs: "Beso Espectral",
          nameEn: "Spectral Kiss",
          descEs: "Ángela le da un piquito cariñoso a CKY, restaurando +45 HP y +30 MP con un guiño picante.",
          descEn: "Angela gives CKY a playful spectral kiss, restoring +45 HP and +30 MP with a wink.",
          unlocked: true,
          cost: 20
        },
        {
          id: "p_angela_3",
          nameEs: "Furia del Más Allá",
          nameEn: "Fury of the Beyond",
          descEs: "Ataque combinado de ectoplasma y salame que inflige daño devastador a las sombras del Limbo.",
          descEn: "Combo attack of ectoplasm and spiritual energy dealing massive damage to Limbo shadows.",
          unlocked: true,
          cost: 35
        }
      ]
    },
    {
      id: "w_guardian",
      nameEs: "W (Espíritu Guardián Cambiaformas)",
      nameEn: "W (Shapeshifting Guardian Spirit)",
      category: "espíritus",
      relationEs: "Protector Ancestral / Aliado Leal",
      relationEn: "Ancient Protector / Loyal Ally",
      descEs: "Antiguo espíritu creado para velar por la Heredera. En su estado natural es una bola de luz tenue celestial que flota apaciblemente a su lado, y adopta formas de objetos cotidianos o herramientas sagradas (como toalla o pala) cuando la misión lo requiere.",
      descEn: "Ancient spirit forged to watch over the Heir. In its natural state, it is a gentle sphere of celestial light floating by her side, adopting forms like towels or holy shovels when needed.",
      icon: "🛡️",
      bondLevel: 90,
      powers: [
        {
          id: "p_w_1",
          nameEs: "Metamorfosis Defensiva",
          nameEn: "Defensive Metamorphosis",
          descEs: "W se transforma en un escudo astral impenetrable que bloquea el siguiente ataque enemigo y absorbe daño.",
          descEn: "W transforms into an astral shield that blocks the next enemy strike.",
          unlocked: true,
          cost: 15
        },
        {
          id: "p_w_2",
          nameEs: "Impacto de Pala Sagrada",
          nameEn: "Holy Shovel Strike",
          descEs: "W adopta la forma de una pala dorada ancestral y golpea contundentemente a los enemigos del Limbo aturdiéndolos.",
          descEn: "W becomes a golden holy shovel, striking Limbo foes and stunning them.",
          unlocked: true,
          cost: 25
        },
        {
          id: "p_w_3",
          nameEs: "Aura de Guardia Inquebrantable",
          nameEn: "Unshakable Guard Aura",
          descEs: "Otorga regeneración de HP y aumento masivo de defensa a todo el equipo.",
          descEn: "Grants HP regeneration and massive defense boost to the whole party.",
          unlocked: true,
          cost: 35
        }
      ]
    },
    {
      id: "vecina",
      nameEs: "La Vecina (Mente Maestra Oculta)",
      nameEn: "The Neighbor (Hidden Mastermind)",
      category: "humanos",
      relationEs: "Antagonista Principal / Villana Oculta",
      relationEn: "Main Antagonist / Hidden Villain",
      descEs: "Aparenta ser una vecina cordial y común, pero en secreto es la mente maestra detrás de las grietas del Limbo, las sombras y la tragedia de Ángela.",
      descEn: "Appears to be a cordial and ordinary neighbor, but is secretly the mastermind behind the Limbo rifts, the shadow beasts, and Angela's tragedy.",
      icon: "🦹‍♀️",
      bondLevel: 0,
      powers: [
        {
          id: "p_vecina_1",
          nameEs: "Manipulación de Sombras",
          nameEn: "Shadow Manipulation",
          descEs: "Invoca sombras y pesadillas desde el Limbo para atormentar a CKY y su familia.",
          descEn: "Summons shadows and nightmares from Limbo to torment CKY and her family.",
          unlocked: true,
          cost: 50
        },
        {
          id: "p_vecina_2",
          nameEs: "Fachada Hipnótica",
          nameEn: "Hypnotic Facade",
          descEs: "Engaña al pueblo fingiendo inocencia mientras teje su red de oscuridad.",
          descEn: "Deceives the town feigning innocence while weaving her web of darkness.",
          unlocked: true,
          cost: 30
        }
      ]
    }
  ]);

  // Inventory list (Starts EMPTY as requested by the user)
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Toast Notifications Overlay State for receiving items/XP/messages
  const [toastNotifications, setToastNotifications] = useState<{
    id: string;
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }[]>([]);

  const showNotification = (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { ...toast, id };

    playSound(880, "sine", 0.35);
    setTimeout(() => playSound(1100, "sine", 0.3), 100);

    setToastNotifications(prev => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToastNotifications(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToastNotifications(prev => prev.filter(t => t.id !== id));
  };

  // Level Up Modal state
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    titleEs: string;
    titleEn: string;
    bonuses: string[];
  } | null>(null);

  const addXP = (amount: number) => {
    let didLevelUp = false;
    let finalLevel = stats.level;

    setStats((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(newMaxXp * 1.5);
        didLevelUp = true;
      }

      if (didLevelUp) {
        finalLevel = newLevel;
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          maxXp: newMaxXp,
          hambre: 100,
          sed: 100,
          higiene: 100,
          perfume: 100,
          bateriaCelular: 100,
        };
      }
      return { ...prev, xp: newXp };
    });

    if (didLevelUp) {
      playSound(880, "triangle", 0.4);
      setTimeout(() => playSound(1100, "sine", 0.5), 150);

      const levelTitles: Record<number, { es: string; en: string }> = {
        2: { es: "Estudiante Atenta", en: "Attentive Student" },
        3: { es: "Iniciada Espiritual", en: "Spiritual Initiate" },
        4: { es: "Protectora del Vínculo", en: "Protector of the Bond" },
        5: { es: "Heredera del Máximo Poder", en: "Heiress of Supreme Power" },
      };

      const titleInfo = levelTitles[finalLevel] || {
        es: `Luchadora Espiritual Nivel ${finalLevel}`,
        en: `Spiritual Fighter Level ${finalLevel}`,
      };

      setLevelUpData({
        level: finalLevel,
        titleEs: titleInfo.es,
        titleEn: titleInfo.en,
        bonuses: [
          language === "es" ? "✨ Salud, Hambre y Sed 100% Restaurados" : "✨ Health, Hunger & Thirst 100% Restored",
          language === "es" ? "🌸 Perfume Espiritual Restaurado al Máximo" : "🌸 Spiritual Perfume Fully Restored",
          language === "es" ? "🔋 Batería del Teléfono al 100%" : "🔋 Phone Battery at 100%",
          language === "es" ? "⚡ Vínculo de Compañeras Fortalecido" : "⚡ Companion Bond Strengthened",
        ],
      });
      androidBridge.hapticLevelUp();
    } else {
      playSound(700, "sine", 0.2);
    }

    showNotification({
      icon: "⭐",
      titleEs: `¡RECIBISTE +${amount} XP!`,
      titleEn: `RECEIVED +${amount} XP!`,
      subEs: "Experiencia acumulada",
      subEn: "Experience accumulated",
      color: "amber"
    });
  };

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });

    androidBridge.hapticItemPickup();

    showNotification({
      icon: item.icon || "🎒",
      titleEs: `¡RECIBISTE: ${item.nameEs}!`,
      titleEn: `RECEIVED: ${item.nameEn}!`,
      subEs: "Guardado en tu inventario",
      subEn: "Saved in your inventory",
      color: "emerald"
    });
  };

  const removeInventoryItem = (itemId: string) => {
    setInventory(prev => prev.filter(i => i.id !== itemId));
  };

  const handleUseItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || !item.usable || !item.effect) return;

    if (itemId === "water_bottle_full" || item.effect?.type === "water_bottle") {
      setStats(prev => ({
        ...prev,
        sed: Math.min(100, prev.sed + 30),
        hambre: Math.min(100, prev.hambre + 10)
      }));
      setInventory(prev => prev.map(i => {
        if (i.id === itemId) {
          return {
            id: "water_bottle_empty",
            nameEs: "Botella de Agua Favorita (Vacía)",
            nameEn: "Favorite Water Bottle (Empty)",
            descEs: "Tu botella de agua favorita de CKY. Está vacía. Puedes recargarla en la pileta o en la heladera.",
            descEn: "CKY's favorite water bottle. It's empty. You can refill it at a sink or fridge.",
            icon: "🧴",
            isKey: true,
            usable: false,
            category: "backpack"
          };
        }
        return i;
      }));
      playSound(520, "sine", 0.2);
      return;
    }

    if (item.effect?.type === "outfit" && item.effect.outfit) {
      setCurrentOutfit(item.effect.outfit);
      playSound(650, "triangle", 0.3);
      showNotification({
        icon: item.icon || "👗",
        titleEs: `¡ATUENDO EQUIPADO!`,
        titleEn: `OUTFIT EQUIPPED!`,
        subEs: `Te pusiste: ${item.nameEs}`,
        subEn: `Equipped: ${item.nameEn}`,
        color: "purple"
      });
      return;
    }

    setStats(prev => {
      const newStats = { ...prev };
      if (item.effect?.type === "hambre") {
        newStats.hambre = Math.min(100, newStats.hambre + item.effect.amount);
      } else if (item.effect?.type === "sed") {
        newStats.sed = Math.min(100, newStats.sed + item.effect.amount);
      } else if (item.effect?.type === "perfume") {
        newStats.perfume = Math.min(100, newStats.perfume + item.effect.amount);
        if (item.id === "french_perfume_luxury") {
          newStats.perfumeBuff = true;
          localStorage.setItem("cky_perfume_buff", "true");
        }
      } else if (item.effect?.type === "amor") {
        newStats.amor = Math.min(100, newStats.amor + item.effect.amount);
      } else if (item.effect?.type === "higiene") {
        newStats.higiene = Math.min(100, (newStats.higiene ?? 100) + item.effect.amount);
      } else if (item.effect?.type === "money") {
        newStats.money = (newStats.money ?? 0) + item.effect.amount;
        localStorage.setItem("cky_stats_money", String(newStats.money));
      } else if (item.effect?.type === "speed_buff") {
        newStats.speedBuff = true;
        localStorage.setItem("cky_speed_buff", "true");
      }
      return newStats;
    });

    if (item.effect?.type !== "outfit") {
      setInventory(prev => prev.filter(i => i.id !== itemId));
    }
    playSound(520, "sine", 0.2);
  };

  // Cell phone messages simulation database (Preloaded with hilarious group chats and contacts)
  const [phoneChats, setPhoneChats] = useState<PhoneChat[]>(DEFAULT_PHONE_CHATS);

  // Diary reflections log
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([
    {
      id: "chapter_01_mom",
      titleEs: "La Advertencia de Mamá",
      titleEn: "Mom's Warning",
      date: "20/07/2026",
      textEs: "Mi madre no sabe nada de mi vida espiritual y debe quedarse al margen SIEMPRE. Ella me advirtió sobre cosas raras en la calle. Quizás el peligro es real.",
      textEn: "My mother knows nothing about my spiritual life and she must ALWAYS stay out of it. She warned me about weird things in the street. Maybe the danger is real.",
      unlocked: false
    },
    {
      id: "chapter_01_defeat",
      titleEs: "Lecciones del Limbo",
      titleEn: "Lessons of Limbo",
      date: "20/07/2026",
      textEs: "Fui derrotada físicamente pero mi espíritu despertó en el Limbo. Hermes me enseñó que la muerte no es el fin, sino una lección. Debo usar mi habilidad 'Ver lo Invisible'.",
      textEn: "I was physically defeated but my spirit woke up in Limbo. Hermes taught me that death is not the end, but a lesson. I must use my 'See the Invisible' ability.",
      unlocked: false
    },
    {
      id: "chapter_01_bus",
      titleEs: "Camino a la Escuela - Colectivo Escolar",
      titleEn: "On the Way to School - School Bus",
      date: "20/07/2026",
      textEs: "Me puse el uniforme escolar y me subí al colectivo escolar rumbo a la Escuela N° 87.",
      textEn: "I put on my school uniform and got on the school bus heading to School No. 87.",
      unlocked: false
    },
    {
      id: "chapter_01_angela_tomb",
      titleEs: "El Pedido de Ángela (Tumba Rosa)",
      titleEn: "Angela's Request (Pink Grave)",
      date: "20/07/2026",
      textEs: "El espíritu de Ángela me pidió que le lleve un sándwich de salame y queso a su tumba rosa para ser mi amiga. Debo conseguir el sándwich de la heladera de casa e ir al cementerio.",
      textEn: "Angela's spirit asked me to bring a salami and cheese sandwich to her pink grave to be my friend. I must get the sandwich from the fridge and go to the cemetery.",
      unlocked: false
    },
    {
      id: "chapter_02_angela_friend",
      titleEs: "Amistad Espiritual con Ángela",
      titleEn: "Spiritual Friendship with Angela",
      date: "21/07/2026",
      textEs: "Le entregué el sándwich de salame y queso a Ángela en su tumba rosa del cementerio. Cumplí mi promesa y ahora Ángela es mi amiga espiritual.",
      textEn: "I gave the salami and cheese sandwich to Angela at her pink tomb in the cemetery. I kept my promise and now Angela is my spiritual friend.",
      unlocked: false
    },
    {
      id: "chapter_02_shadow_battle",
      titleEs: "Batalla contra la Sombra del Limbo",
      titleEn: "Battle against the Limbo Shadow",
      date: "21/07/2026",
      textEs: "Una sombra rencorosa invocada por la vecina emergió de las criptas. Junto a los chistes y poderes espectrales de Ángela, logramos purificarla y salvar el cementerio.",
      textEn: "A resentful shadow summoned by the neighbor emerged from the crypts. Together with Angela's innuendos and spectral powers, we purified it and saved the cemetery.",
      unlocked: false
    },
    {
      id: "chapter_02_neighbor_conspiracy",
      titleEs: "La Hipocresía de la Vecina",
      titleEn: "The Neighbor's Hypocrisy",
      date: "21/07/2026",
      textEs: "La vecina finge ser amable regando sus plantas, pero Ángela me advirtió que es ella quien abre las grietas hacia el Limbo y controla las sombras.",
      textEn: "The neighbor acts friendly watering her plants, but Angela warned me she is the one opening the Limbo rifts and controlling shadows.",
      unlocked: false
    },
    {
      id: "chapter_02_shower_mystery",
      titleEs: "La Ducha y el Misterio de la Toalla",
      titleEn: "The Shower & Towel Mystery",
      date: "21/07/2026",
      textEs: "Al volver del cementerio me di una ducha llena de ocurrencias con Ángela. Al salir no estaba la toalla y tuve que caminar desnuda al cuarto... ¡la toalla estaba en la silla! Ángela dice que descansemos porque mañana viernes se viene con todo.",
      textEn: "Returning from the cemetery I took a shower full of banter with Angela. When I got out the towel was gone and I had to walk naked to my bedroom... the towel was on the chair! Angela says we should sleep because tomorrow Friday will be intense.",
      unlocked: false
    },
    {
      id: "chapter_03_morning_disappearances",
      titleEs: "Viernes y Cosas que se Esfuman",
      titleEn: "Friday & Vanishing Items",
      date: "22/07/2026",
      textEs: "¡Por fin viernes! Pero las cosas en mi casa se mueven solas: los útiles y el desayuno desaparecieron de donde estaba 100% segura de haberlos dejado. Ángela detecta travesuras espectrales.",
      textEn: "Finally Friday! But things in my house are vanishing on their own: my school supplies and breakfast disappeared from where I was 100% sure I left them. Angela senses spectral mischief.",
      unlocked: false
    },
    {
      id: "chapter_03_school_shadow",
      titleEs: "Emboscada en el Depósito Escolar",
      titleEn: "Ambush in the School Storage",
      date: "22/07/2026",
      textEs: "En la Escuela N° 87 una Sombra Hurtadora del Limbo nos emboscó en el depósito. Junto a Ángela y sus bromas logramos derrotarla y recuperar los objetos robados.",
      textEn: "At School No. 87 a Limbo Thief Shadow ambushed us in the storage room. Together with Angela and her jokes we defeated it and recovered the stolen items.",
      unlocked: false
    },
    {
      id: "chapter_03_rift_guardian",
      titleEs: "El Guardián de la Grieta de la Vecina",
      titleEn: "The Neighbor's Rift Guardian",
      date: "22/07/2026",
      textEs: "Rastreamos el éter oscuro cerca de la casa de la vecina y destruimos al Devorador de Recuerdos que alimentaba la grieta del Limbo.",
      textEn: "We tracked the dark ether near the neighbor's house and destroyed the Memory Devourer powering the Limbo rift.",
      unlocked: false
    },
    {
      id: "chapter_03_towel_spirit_w",
      titleEs: "W: El Espíritu Cambiaformas Protector",
      titleEn: "W: The Shapeshifting Guardian Spirit",
      date: "22/07/2026",
      textEs: "Nos aseguramos con Ángela de que la toalla estuviera en el toallero antes de bañarme, pero volvió a desaparecer. Al regresar desnuda a la pieza, la toalla cobró vida: ¡es W, un antiguo espíritu cambiaformas creado para protegerme como heredera! Es serio, un poco ingenuo y presa fácil de los chistes de Ángela.",
      textEn: "We made sure with Angela the towel was on the rack before showering, but it vanished again. Returning naked to my bedroom, the towel came alive: it's W, an ancient shapeshifting spirit created to protect me as the heir! He is serious, slightly naive, and an easy target for Angela's teasing.",
      unlocked: false
    },
    {
      id: "chapter_03_treasure_plan",
      titleEs: "El Antiguo Tesoro y Planes del Sábado",
      titleEn: "The Ancient Treasure & Saturday Plans",
      date: "22/07/2026",
      textEs: "Tras la cena, Ángela me dijo que mi ropa está súper vieja y necesita recambio urgente. Al decirle que no tengo un peso, W reveló que los Guardianes protegieron un tesoro ancestral en las colinas cercanas. ¡Acordamos ir los tres a buscarlo mañana sábado!",
      textEn: "After dinner, Angela pointed out my clothes are super old and worn out. When I told her I'm broke, W revealed the Guardians sealed an ancient treasure in nearby hills. We agreed all three of us will search for it tomorrow Saturday!",
      unlocked: false
    },
    {
      id: "chapter_04_ancient_ruins_treasure",
      titleEs: "El Valle de las Ruinas Ancestrales",
      titleEn: "Valley of the Ancient Ruins",
      date: "23/07/2026",
      textEs: "Nos despertamos temprano con Ángela y W rumbo al Valle de las Ruinas. Enfrentamos y derrotamos al colosal Golem Guardián que custodiaba el sello del cofre.",
      textEn: "We woke up early with Angela and W heading to the Valley of the Ruins. We faced and defeated the colossal Guardian Golem guarding the chest's seal.",
      unlocked: false
    },
    {
      id: "chapter_04_w_shovel_and_treasure",
      titleEs: "W la Pala y el Tesoro Desenterrado",
      titleEn: "W the Shovel & Unearthed Treasure",
      date: "23/07/2026",
      textEs: "¡No teníamos pala para cavar! Pero W hizo gala de sus poderes y se convirtió en una pala dorada ancestral. Desenterramos el cofre repleto de oro y joyas (+$50.000). Quedamos llenas de barro y acordamos volver a casa a bañarnos.",
      textEn: "We had no shovel to dig! But W used his powers and turned into an ancient golden shovel. We unearthed the chest full of gold and jewels (+$50,000). Covered in mud, we agreed to return home for a bath.",
      unlocked: false
    },
    {
      id: "chapter_04_shower_and_w_rule",
      titleEs: "Ducha Relajante y la Guardia Estricta de W",
      titleEn: "Relaxing Shower & W's Strict Guard Duty",
      date: "23/07/2026",
      textEs: "Al llegar a casa le ordenamos a W que se quede afuera del baño y de la pieza sin mirar hasta que esté completamente vestida. Me di una ducha deliciosa que me dejó reluciente y limpia.",
      textEn: "Upon returning home we ordered W to stay outside the bathroom and room without looking until I was fully dressed. I took a refreshing shower that left me sparkling clean.",
      unlocked: false
    },
    {
      id: "chapter_04_shopping_and_lingerie",
      titleEs: "Tarde de Compras y Lencería Sexy",
      titleEn: "Shopping Afternoon & Sexy Lingerie",
      date: "23/07/2026",
      textEs: "Fuimos al Centro Comercial a gastar el dinero del tesoro. En la boutique de lencería, Ángela me convenció de comprar un conjunto de lencería de encaje rojo súper sexy. ¡Me quedó espectacular y ya lo tengo listo en el ropero!",
      textEn: "We went to the Shopping Mall to spend our treasure money. In the lingerie boutique, Angela convinced me to buy a super sexy red lace lingerie set. It looks amazing on me and is now ready in my wardrobe!",
      unlocked: false
    },
    {
      id: "chapter_04_shopping_all_outfits",
      titleEs: "Guardarropa de Lujo: Perfume, Piyama de Seda y Gala",
      titleEn: "Luxury Wardrobe: Perfume, Silk Pajamas & Gala Dress",
      date: "23/07/2026",
      textEs: "Completamos el shopping comprando perfume francés exclusivo, un delicado piyama de seda fina y un vestido de gala deslumbrante. ¡Ahora mi ropero está lleno de opciones fabulosas!",
      textEn: "We completed shopping by getting exclusive French perfume, fine silk pajamas, and a stunning gala dress. My wardrobe is now full of fabulous choices!",
      unlocked: false
    },
    {
      id: "chapter_04_alanis_soulmate_revelation",
      titleEs: "La Revelación de Alanis y la Discusión del Destino",
      titleEn: "Alanis's Revelation & Dispute Over Destiny",
      date: "23/07/2026",
      textEs: "Por la noche, Alanis se manifestó en mi habitación para anunciarme que pronto conoceré a mi alma gemela y me mostró sus rasgos astrales. Tuvimos una fuerte discusión porque me niego rotundamente a que los espíritus decidan sobre mis sentimientos. Pero Alanis sentenció que el destino es ineludible.",
      textEn: "At night, Alanis manifested in my room to announce I will soon meet my soulmate. We had a heated dispute because I refuse to let spirits dictate my love life, but Alanis stated destiny is inevitable.",
      unlocked: false
    },
    {
      id: "chapter_05_deep_cleaning_mission",
      titleEs: "Domingo de Limpieza Profunda y Bestias del Polvo",
      titleEn: "Sunday Deep Cleaning & Dust Beasts",
      date: "24/07/2026",
      textEs: "Mamá me despertó a los gritos para hacer limpieza profunda dominical. Con W transformado en plumero, escoba y aspiradora arcana, exterminamos a las cucarachas gigantes del ropero, a las arañas de rincón y a la rata escurridiza de la alacena. ¡La casa quedó impecable!",
      textEn: "Mom woke me up shouting for Sunday deep cleaning. With W transformed into a feather duster, golden broom, and arcane vacuum, we exterminated giant wardrobe cockroaches, corner spiders, and the sneaky pantry rat. The house is sparkling clean!",
      unlocked: false
    },
    {
      id: "chapter_05_airport_race_neighbor",
      titleEs: "La Carrera al Aeropuerto por un Pancho y una Coca",
      titleEn: "Race to the Airport for a Hot Dog & Coke",
      date: "24/07/2026",
      textEs: "Salí a trotar y la vecina me desafió a una carrera hacia el Aeropuerto apostando un pancho con papas y una coca fría. A pesar de esquivar sombras y perros rabiosos, la vecina usó magia tramposa para llegar antes y tuve que pagarle el pancho.",
      textEn: "I went for a jog and the neighbor challenged me to a race to the Airport betting a hot dog with potato sticks and a cold Coke. Despite dodging shadows and angry dogs, the neighbor cheated with magic to win and I had to pay for her hot dog.",
      unlocked: false
    },
    {
      id: "chapter_05_sweat_shower_and_lingerie_photos",
      titleEs: "Transpiración, Ducha y la Sesión de Fotos en Lencería Sexy",
      titleEn: "Sweat, Shower & Sexy Lingerie Photo Shoot",
      date: "24/07/2026",
      textEs: "Llegué empapada en sudor y Ángela me volvió loca con sus bromas sobre mi olor a tigre. Tras una ducha refrescante, nos divertimos probando la ropa del shopping y Ángela me retó a ponerme la lencería roja sexy para una sesión de fotos hilarante mientras W se tapaba los ojos como esfera avergonzada. ¡Día completado!",
      textEn: "I returned soaked in sweat and Angela teased me endlessly about smelling like a tiger. After a refreshing shower, we tried on our shopping clothes and Angela dared me to put on the sexy red lingerie for a hilarious photo shoot while W covered his eyes as an embarrassed glowing orb. Day completed!",
      unlocked: false
    },
    {
      id: "chapter_06_dark_form_battle",
      titleEs: "La Aparición de la Forma Oscura y la Batalla en la Habitación",
      titleEn: "Apparition of the Dark Form & Battle in the Bedroom",
      date: "25/07/2026",
      textEs: "Al despertar el lunes a la madrugada, la habitación fue envuelta en un vórtice de niebla y surgió una forma oscura amenazante. Con el apoyo de Ángela y el escudo astral de W, combatimos en equipo y la dejamos fuera de combate en cuestión de instantes.",
      textEn: "Waking up early Monday, the room was engulfed in a fog vortex and a menacing dark form appeared. With Angela's support and W's astral shield, we fought as a team and knocked it out in moments.",
      unlocked: false
    },
    {
      id: "chapter_06_soulmate_revelation_hybrid",
      titleEs: "La Intervención de Alanis y la Verdad del Alma Gemela Híbrida",
      titleEn: "Alanis's Intervention & Truth of the Hybrid Soulmate",
      date: "25/07/2026",
      textEs: "Cuando íbamos a darle el golpe de gracia, Alanis descendió con luz divina para detenernos. Disipó la sombra y reveló a mi Alma Gemela: un prodigio cósmico mitad humano y mitad espíritu. La oscuridad era solo una coraza de viaje. Se unió a nuestro equipo como compañero predestinado.",
      textEn: "As we prepared the final blow, Alanis descended with divine light to halt us. She dispersed the shadows to reveal my Soulmate: a cosmic hybrid, half-human and half-spirit. The darkness was merely a travel shell. He joined our team as a destined partner.",
      unlocked: false
    },
    {
      id: "chapter_06_monday_school_routine",
      titleEs: "Lunes de Escuela, Preparativos y las Bromas sin Filtro de Ángela",
      titleEn: "Monday School, Preparation & Angela's Unfiltered Banter",
      date: "25/07/2026",
      textEs: "Comenzó la mañana de escuela. Me vestí con el uniforme mientras mi alma gemela se daba vuelta avergonzado y Ángela se burlaba sin parar. Me lavé los dientes, agarré la mochila, los libros y la botella con sándwich de salame para alimentar la mitad humana de mi chico antes de salir rumbo al colegio.",
      textEn: "School morning began. I got into uniform while my soulmate turned away embarrassed and Angela mocked endlessly. I brushed my teeth, grabbed backpack, books, and water with a salami sandwich to feed his human half before heading to school.",
      unlocked: false
    },
    {
      id: "chapter_06_possessed_bus_and_school",
      titleEs: "Viaje Hostil en Colectivo y la Escuela Bajo Ataque Oscuro",
      titleEn: "Hostile Bus Ride & The School Under Dark Attack",
      date: "25/07/2026",
      textEs: "Durante el viaje en colectivo, todos mis compañeros se comportaban agresivos y de forma extraña, burlándose y maltratándome. Al llegar a la escuela, los profesores y alumnos tenían miradas perturbadas y ojos brillantes de odio dirigidos hacia mí.",
      textEn: "During the bus ride, all my classmates acted aggressive and bizarre, mocking and mistreating me. Upon reaching school, teachers and students had eerie glares and glowering hatred aimed at me.",
      unlocked: false
    },
    {
      id: "chapter_06_girls_bathroom_cabal",
      titleEs: "Cónclave en el Baño de Chicas: La Red de Posesión de la Vecina",
      titleEn: "Girls' Bathroom Council: The Neighbor's Possession Web",
      date: "25/07/2026",
      textEs: "Nos refugiamos en el baño de chicas con Ángela, W y mi Alma Gemela. Analizamos las firmas astrales y descubrimos la verdad: todos están poseídos por parásitos espirituales enviados por la Vecina para quebrar mi espíritu y apoderarse de la escuela.",
      textEn: "We took refuge in the girls' bathroom with Angela, W, and my Soulmate. We analyzed astral signatures and discovered the truth: everyone is possessed by spiritual parasites sent by the Neighbor to break my spirit and take over the school.",
      unlocked: false
    },
    {
      id: "chapter_06_possessed_soccer_battle_victory",
      titleEs: "Duelo en el Patio de Fútbol: Derrota de la Sombra y Rescate de Mateo",
      titleEn: "Courtyard Soccer Duel: Shadow Defeat & Rescue of Mateo",
      date: "25/07/2026",
      textEs: "Mateo estaba poseído en la cancha de fútbol lanzando balones con fuego sombrío bajo el control de la Vecina. Con ataques combinados de ráfagas astrales, la resonancia de mi Alma Gemela y la protección de W y Ángela, destruimos a la sombra de la discordia. Mateo recuperó la conciencia y me entregó su pelota purificada.",
      textEn: "Mateo was possessed on the soccer pitch throwing shadow flame balls under the Neighbor's control. With combined astral bursts, my Soulmate's resonance, and protection from W and Angela, we destroyed the discord shadow. Mateo regained consciousness and gave me his purified soccer ball.",
      unlocked: false
    },
    {
      id: "chapter_06_unresolved_school_curse",
      titleEs: "Mateo Liberado, pero la Escuela Sigue Poseída por la Vecina",
      titleEn: "Mateo Freed, but the School Remains Possessed by the Neighbor",
      date: "25/07/2026",
      textEs: "Aunque salvamos a Mateo, descubrimos con horror que el resto de los compañeros (Jaz, Nico, Juan, Abril), profesores y la preceptora siguen bajo el control mental de la Vecina. El gemelo nos advirtió que su cuerpo físico sigue durmiendo inconsciente en su casa.",
      textEn: "Although we saved Mateo, we discovered with horror that all other classmates, teachers and counselor remain under the Neighbor's mind control. The soulmate warned us his physical body is still sleeping unconscious at his house.",
      unlocked: false
    },
    {
      id: "chapter_06_alanis_forced_kiss_argument",
      titleEs: "La Furia de Alanis y la Discusión por el Beso Obligatorio",
      titleEn: "Alanis's Fury & Heated Argument over the Mandatory Kiss",
      date: "25/07/2026",
      textEs: "Al entrar a mi pieza, Alanis me acorraló a solas exigiéndome que vaya a besar a mi gemelo en los labios para despertar su cuerpo físico. Tuvimos una discusión a los gritos porque me niego a que me impongan con quién chapar, pero tuve que aceptar para salvarlo a él y al pueblo.",
      textEn: "Upon entering my bedroom, Alanis confronted me alone demanding I go kiss my soulmate on the lips to awaken his physical body. We had a shouting match because I refuse forced romance, but I had to accept to save him and the town.",
      unlocked: false
    },
    {
      id: "chapter_06_siesta_and_shower_naked_run",
      titleEs: "Siesta Reparadora, Baño con Comentarios Picantes y Carrera en Cueros",
      titleEn: "Restful Siesta, Bath with Spicy Remarks & Naked Dash",
      date: "25/07/2026",
      textEs: "Dormí una siesta para bajar el estrés. Al despertar, Ángela me mandó a ducharme tirando chistes desubicados sobre lo que podría pasar en la cita. ¡Estaba tan nerviosa que me olvidé la toalla y tuve que correr desnuda por la casa!",
      textEn: "Took a siesta to calm down. Upon waking, Angela sent me to shower cracking out-of-place jokes about the date. I got so flustered I forgot my towel and had to dash naked across the house!",
      unlocked: false
    },
    {
      id: "chapter_06_angela_kiss_masterclass",
      titleEs: "La Cátedra de Besos de Ángela: Preparativos para el Encuentro",
      titleEn: "Angela's Kissing Masterclass: Preparation for the Encounter",
      date: "25/07/2026",
      textEs: "Le confesé a Ángela muerta de vergüenza que nunca besé a nadie en mi vida. Me dio una clase magistral delirante con sus reglas de oro para no hacer el ridículo.",
      textEn: "Embarrassed, I confessed to Angela I've never kissed anyone in my life. She gave me a hilarious masterclass with golden rules so I wouldn't mess up.",
      unlocked: false
    },
    {
      id: "chapter_06_soulmate_kiss_and_grimoire",
      titleEs: "El Beso Tenso, la Foto con la Vecina y el Grimorio de las Sombras",
      titleEn: "The Tense Kiss, Photo with the Neighbor & Shadow Grimoire",
      date: "25/07/2026",
      textEs: "Fui a su casa. El encuentro fue frío y distante por la imposición cósmica, pero nos besamos para sellar el pacto cósmico. Luego en su habitación vi en shock una foto de él con la Vecina, aunque me callé. Me regaló el Grimorio con todas las debilidades de los espíritus escolares.",
      textEn: "Went to his house. The encounter was cold and stiff due to cosmic pressure, but we kissed to seal the cosmic pact. In his room I was shocked to see a framed photo of him with the Neighbor, though I kept quiet. He gifted me the Grimoire with all school spirits' weaknesses.",
      unlocked: false
    },
    {
      id: "chapter_06_confession_photo_and_night",
      titleEs: "El Regreso a Casa, la Revelación de la Foto y el Grimorio en Manos de W",
      titleEn: "Return Home, Revelation of the Photo & Grimoire in W's Hands",
      date: "25/07/2026",
      textEs: "De vuelta en mi habitación, me desahogué con Ángela y con W: les confesé que me sentí súper incómoda y fría con mi gemelo. Les revelé el shock de ver la foto de él abrazado y sonriendo con la Vecina. Le entregué el Grimorio a W para que lo investigue con su sabiduría ancestral toda la noche. Me acosté a dormir en piyama de seda lista para defender la escuela.",
      textEn: "Back in my bedroom, I vented to Angela and W: I confessed how uncomfortable and chilly I felt with my soulmate. I revealed the shock of seeing the photo of him embracing and smiling with the Neighbor. I handed the Grimoire over to W to study it with his ancient wisdom all night. I went to bed in silk pajamas ready to defend the school.",
      unlocked: false
    },
    {
      id: "chapter_07_wake_and_grimoire_strategy",
      titleEs: "Día 7: W Descifra el Grimorio y la Estrategia de los Poseídos",
      titleEn: "Day 7: W Decodes the Grimoire & Strategy Against the Possessed",
      date: "26/07/2026",
      textEs: "Al despertar el martes por la mañana, W me esperaba emocionado como una esfera de luz flotante: ¡leyó todo el Grimorio de las Sombras durante la noche! Descubrió las debilidades elementales de cada poseído de la escuela y nos reveló la estrategia ancestral: luchar del más débil al más fuerte para desarmar la red de la Vecina sin provocar una catástrofe.",
      textEn: "Waking up Tuesday morning, W was floating as a beam of light, excitedly waiting: he read the entire Grimoire of Shadows overnight! He identified the elemental weaknesses of every possessed person at school and revealed the ancestral strategy: fight from weakest to strongest to dismantle the Neighbor's network.",
      unlocked: false
    },
    {
      id: "chapter_07_tuesday_morning_prep",
      titleEs: "Preparación Matutina y Rumbo al Colegio",
      titleEn: "Tuesday Morning Prep & Heading to School",
      date: "26/07/2026",
      textEs: "Me puse el uniforme escolar, me aseé en el baño, guardé los libros en la mochila y recogí la botella de agua y el sándwich de salame de la heladera. Subí al colectivo con el equipo completo listo para el contraataque.",
      textEn: "I put on the school uniform, freshened up in the bathroom, packed my books, and grabbed the water bottle and salami sandwich from the fridge. I boarded the bus with the full team ready for the counterattack.",
      unlocked: false
    },
    {
      id: "chapter_07_director_unjust_expulsion",
      titleEs: "La Gran Injusticia: Expulsada de la Escuela por la Vecina",
      titleEn: "The Great Injustice: Expelled from School by the Neighbor",
      date: "26/07/2026",
      textEs: "Al llegar a la escuela fui llamada a la Dirección. Con mirada fría y nublada por la manipulación de la Vecina, el Director Quiroga me notificó que quedaba formalmente expulsada de la institución por una supuesta denuncia de la 'respetable vecina'. ¡Una injusticia absoluta y descarada!",
      textEn: "Upon arriving at school, I was called to the Principal's Office. With eyes clouded by the Neighbor's manipulation, Principal Quiroga notified me that I was formally expelled due to a complaint filed by the 'respectable neighbor'. An absolute and shameless injustice!",
      unlocked: false
    },
    {
      id: "chapter_07_basement_discovery_and_labyrinth",
      titleEs: "El Secreto del Sótano Subterráneo y los Acertijos del Laberinto",
      titleEn: "The Secret of the Underground Basement & Labyrinth Riddles",
      date: "26/07/2026",
      textEs: "Indignados por la expulsión, sentimos vibraciones siniestras en el pasillo y descubrimos una puerta de servicio que desciende al Sótano de las Calderas. El lugar era un laberinto de vapor, tuberías y sombras. Desactivamos la válvula de vapor sombrío, encontramos la llave de mantenimiento oxidada y derrotamos a los espectros guardianes de la Vecina.",
      textEn: "Outraged by the expulsion, we felt ominous vibrations in the hallway and discovered a service door leading down to the Boiler Basement. It was a labyrinth of steam, pipes, and shadows. We shut off the dark steam valve, found the rusty maintenance key, and defeated the Neighbor's guardian specters.",
      unlocked: false
    },
    {
      id: "chapter_07_laboratory_boss_and_liberation",
      titleEs: "Batalla en el Aula Laboratorio: La Liberación del Profesor y de mi Compañera",
      titleEn: "Battle in the Chemistry Lab: Liberation of the Professor & Classmate",
      date: "26/07/2026",
      textEs: "Al atravesar la puerta blindada encontramos el Aula Laboratorio Oculta. El Profesor de Química y mi compañera estaban atrapados en un círculo alquímico, obligados por el temible Espíritu Alquimista Oscuro a sintetizar un veneno de sumisión mental. Tras una batalla RPG épica coordinada con W, Ángela y mi Alma Gemela, destruimos al espectro. El Profesor y mi compañera recuperaron la conciencia, nos agradecieron emocionados y prometieron elevar un reclamo ante el Ministerio para anular mi expulsión y hacer justicia.",
      textEn: "Past the reinforced door we found the Hidden Chemistry Lab. The Chemistry Professor and my classmate were trapped in an alchemical circle, forced by the fearsome Dark Alchemist Spirit to synthesize a mind-submission venom. After an epic RPG battle coordinated with W, Angela, and my Soulmate, we destroyed the specter. The Professor and my classmate regained consciousness, thanked us deeply, and promised to appeal to the Ministry to overturn my unjust expulsion.",
      unlocked: false
    },
    {
      id: "chapter_07_alanis_red_lingerie_mandate",
      titleEs: "Día 7: La Exigencia de Alanis y la Lencería Roja",
      titleEn: "Day 7: Alanis's Mandate & The Red Lingerie",
      date: "26/07/2026",
      textEs: "Al volver a casa tras salvar el laboratorio, Alanis se materializó para darme una orden insólita: ir de nuevo a la casa de mi gemelo, pero llevando el conjunto de lencería sexy roja de encaje en la mochila. Discutí furiosa con ella por tratarme como un objeto de pasarela cósmica, pero no me dejó otra opción ante el peligro inminente.",
      textEn: "Returning home after saving the lab, Alanis manifested to issue an unusual order: return to my soulmate's house carrying the sexy red lace lingerie set in my backpack. I fiercely argued with her, but she left me no choice given the imminent danger.",
      unlocked: false
    },
    {
      id: "chapter_07_soulmate_awkward_kiss_critique",
      titleEs: "El Beso Torpe y la Crítica Desubicada",
      titleEn: "The Awkward Kiss & The Unfiltered Critique",
      date: "26/07/2026",
      textEs: "Fui a la casa de mi gemelo con la lencería en la mochila. Al recibirme me pidió un beso de comunión... ¡y al terminar me criticó diciendo que beso duro como estatua de yeso! Estuve a punto de irme indignada de su casa.",
      textEn: "I went to my soulmate's house with the lingerie in my backpack. He asked for a communion kiss... and immediately afterward criticized me saying I kiss stiff like a plaster statue! I was about to storm out in fury.",
      unlocked: false
    },
    {
      id: "chapter_07_red_lingerie_runway_intel",
      titleEs: "Desfile en Lencería Roja y la Revelación del Gran Ataque",
      titleEn: "Red Lingerie Runway & The Grand Attack Revealed",
      date: "26/07/2026",
      textEs: "Para darme información crucial sobre la Vecina, me puso como condición desfilarle en lencería roja. Fui al baño, me cambié y le modelé el conjunto. Con la boca abierta y sonrojado, me reveló que mañana todos los infectados atacarán en simultáneo en la Plaza, el Hospital, la Terminal y el Centro Comercial.",
      textEn: "To give me crucial intel on the Neighbor, he conditioned it on me modeling the red lingerie for him. I changed in the bathroom and strutted before him. Flustered, he revealed tomorrow's coordinated attack across the Square, Hospital, Terminal, and Mall.",
      unlocked: false
    },
    {
      id: "chapter_07_night_preparations_and_sleep",
      titleEs: "Consejo Nocturno, Risas de Ángela y Preparativos Finales",
      titleEn: "Night Council, Angela's Jests & Final Preparations",
      date: "26/07/2026",
      textEs: "Regresé a mi habitación y les conté todo a W y a Ángela. Ángela estalló de la risa burlándose de mi pasarela hot, mientras que W prometió investigar las líneas místicas toda la noche para preparar barreras. Me puse el piyama de seda y me acosté a dormir lista para la batalla.",
      textEn: "I returned to my room and told W and Angela everything. Angela burst into laughter teasing my spicy runway, while W pledged to investigate astral leylines all night to prepare wards. I put on my silk pajamas and went to sleep ready for battle.",
      unlocked: false
    },
    {
      id: "chapter_08_waking_and_invasion_intel",
      titleEs: "Miércoles: El Despertar del Asedio Final",
      titleEn: "Wednesday: Awakening to the Final Siege",
      date: "27/07/2026",
      textEs: "Nos despertamos temprano con W y Ángela. Tal como reveló la información de anoche, cuatro poderosos espíritus del Limbo tomaron la Plaza Principal, el Hospital Municipal, la Terminal de Ómnibus y el Centro Comercial. Me puse mi ropa casual favorita ya que no puedo ir a la escuela.",
      textEn: "We woke up early with W and Angela. As revealed last night, four powerful Limbo spirits seized the Main Plaza, Municipal Hospital, Bus Terminal, and Shopping Mall. I dressed in my favorite casual clothes since I cannot attend school.",
      unlocked: false
    },
    {
      id: "chapter_08_street_soulmate_suspicion",
      titleEs: "El Encuentro Turbio con el Alma Gemela",
      titleEn: "The Murky Encounter with the Soulmate",
      date: "27/07/2026",
      textEs: "Al salir a la calle nos topamos con el espíritu del gemelo. Actuaba sumamente extraño, con ojos fríos y una sonrisa falsa, diciendo que tenía 'otras prioridades' y deseándonos suerte irónicamente. Ángela sospechó de inmediato que algo turbio ocultaba.",
      textEn: "Stepping outside we ran into the soulmate's spirit. He acted extremely weird, with cold eyes and a fake smirk, saying he had 'other priorities' and ironically wishing us luck. Angela immediately suspected something foul was afoot.",
      unlocked: false
    },
    {
      id: "chapter_08_plaza_liberation",
      titleEs: "La Purificación de la Plaza Principal",
      titleEn: "Purification of the Main Plaza",
      date: "27/07/2026",
      textEs: "Derrotamos al Coloso Sombrío del Parque que profanaba la fuente de la Plaza Principal. El agua cristalina volvió a fluir y el parque quedó libre de sombras.",
      textEn: "We defeated the Shadow Park Colossus profaning the Main Plaza fountain. Crystalline water flowed once more and the park was freed of shadows.",
      unlocked: false
    },
    {
      id: "chapter_08_hospital_liberation",
      titleEs: "La Salvación del Hospital Municipal",
      titleEn: "Salvation of the Municipal Hospital",
      date: "27/07/2026",
      textEs: "Neutralizamos al Espectro de la Peste en la sala de guardia del Hospital Municipal, liberando a los médicos y pacientes del veneno astral del Limbo.",
      textEn: "We neutralized the Plague Specter in the Municipal Hospital emergency room, freeing doctors and patients from Limbo's astral poison.",
      unlocked: false
    },
    {
      id: "chapter_08_terminal_liberation",
      titleEs: "El Desbloqueo de la Terminal de Ómnibus",
      titleEn: "Unblocking of the Bus Terminal",
      date: "27/07/2026",
      textEs: "Destruimos al Leviatán del Asfalto que bloqueaba las dársenas y andenes de la Terminal de Ómnibus. Los colectivos y pasajeros vuelven a transitar seguros.",
      textEn: "We destroyed the Asphalt Leviathan blocking platforms and gates at the Bus Terminal. Buses and passengers travel safely once again.",
      unlocked: false
    },
    {
      id: "chapter_08_mall_liberation",
      titleEs: "El Rescate del Centro Comercial",
      titleEn: "Rescue of the Shopping Mall",
      date: "27/07/2026",
      textEs: "Desintegramos a la Gárgola de Cristal y Pesadillas sobre la fuente del shopping, salvando los locales y quebrando el último foco de asedio.",
      textEn: "We disintegrated the Crystal & Nightmare Gargoyle above the mall fountain, saving storefronts and breaking the last siege point.",
      unlocked: false
    },
    {
      id: "chapter_08_neighbor_door_confrontation_and_betrayal",
      titleEs: "La Puerta de la Vecina, Traición y Muerte de W y Ángela",
      titleEn: "Neighbor's Door, Betrayal & Death of W and Angela",
      date: "27/07/2026",
      textEs: "Fuimos a enfrentar a Paula a su casa. Cuando W iba a lanzar su ataque purificador, el gemelo lo apuñaló por la espalda desintegrándolo en polvo dorado. Ángela se lanzó furiosa y fue rebanada sin piedad. El gemelo confesó con desprecio que siempre estuvo con Paula y que solo estuvo conmigo por obligación.",
      textEn: "We went to confront Paula at her home. As W prepared his purifying attack, the soulmate backstabbed him, disintegrating him into golden dust. Angela lunged in fury and was mercilessly cut down. The soulmate confessed with contempt he was always with Paula and only stayed with me out of obligation.",
      unlocked: false
    },
    {
      id: "chapter_08_ckys_fury_and_supernova",
      titleEs: "La Furia Suprema de CKY y la Caída de Paula",
      titleEn: "CKY's Ultimate Wrath & Paula's Fall",
      date: "27/07/2026",
      textEs: "Ciega de dolor por la muerte de mis dos verdaderos amigos, desaté una onda astral cósmica devastadora que desintegró al traidor y noqueó a Paula contra la pared, sellando la grieta para siempre.",
      textEn: "Blinded by grief over my two true friends' deaths, I unleashed a devastating cosmic shockwave disintegrating the traitor and knocking Paula out against the wall, sealing the rift forever.",
      unlocked: false
    },
    {
      id: "chapter_08_renunciation_and_normal_girl",
      titleEs: "Renuncia Total, Despedida de Alanis y Fin del Capítulo 1",
      titleEn: "Total Renunciation, Alanis's Farewell & End of Chapter 1",
      date: "27/07/2026",
      textEs: "En mi habitación, Alanis intentó alabarme, pero renuncié a todo: al linaje, a los poderes y a los espíritus. Alanis intentó disuadirme, pero al ver mi determinación me declaró una persona normal y se marchó. Lloré desconsoladamente en mi cama. Fin del Capítulo 1.",
      textEn: "In my room, Alanis tried praising me, but I renounced everything: the lineage, powers and spirits. Alanis tried to dissuade me, but seeing my resolve declared me a normal person and departed. I wept inconsolably on my bed. End of Chapter 1.",
      unlocked: false
    }
  ]);

  const unlockDiaryEntry = (id: string) => {
    setDiaryEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry && !entry.unlocked) {
        showNotification({
          icon: "📓",
          titleEs: `¡NUEVA MISIÓN DESBLOQUEADA!`,
          titleEn: `NEW MISSION UNLOCKED!`,
          subEs: entry.titleEs,
          subEn: entry.titleEn,
          color: "purple"
        });
      }
      return prev.map(e => (e.id === id ? { ...e, unlocked: true } : e));
    });
  };

  // Phone photo gallery state
  const [phonePhotos, setPhonePhotos] = useState<PhonePhoto[]>([]);

  const addPhotoToGallery = (photo: PhonePhoto) => {
    setPhonePhotos(prev => {
      if (prev.some(p => p.id === photo.id)) return prev;
      return [photo, ...prev];
    });
    playSound(780, "sine", 0.2);
  };

  const deletePhotoFromGallery = (photoId: string) => {
    setPhonePhotos(prev => prev.filter(p => p.id !== photoId));
    playSound(300, "triangle", 0.2);
  };

  const deletePhotoMessage = (chatId: string, msgId: string) => {
    setPhoneChats(prev =>
      prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: c.messages.filter(m => m.id !== msgId)
          };
        }
        return c;
      })
    );
    playSound(300, "triangle", 0.2);
  };

  // Push new incoming message and notify player with sound/blink
  const triggerNewPhoneMessage = (
    chatId: string,
    textEs: string,
    textEn: string,
    photoAttachment?: PhonePhoto,
    initialReplies?: PhoneReply[]
  ) => {
    const senderName = 
      chatId === "mom" 
        ? "Mamá" 
        : chatId === "Alanis" || chatId.includes("Alanis") || chatId.includes("Desconocido")
        ? "Alanis (Líder Suprema)" 
        : chatId === "Ángela" || chatId === "Angela"
        ? "Ángela" 
        : chatId;

    showNotification({
      icon: "📱",
      titleEs: `¡NUEVO MENSAJE DE ${senderName.toUpperCase()}!`,
      titleEn: `NEW MESSAGE FROM ${senderName.toUpperCase()}!`,
      subEs: textEs,
      subEn: textEn,
      color: "sky"
    });

    setPhoneChats(prev => {
      const targetId = (chatId.includes("Alanis") || chatId.includes("Desconocido")) ? "Alanis" : chatId;
      const exists = prev.some(c => c.id === targetId || c.id === chatId);
      const newMsg = {
        id: `msg_${Date.now()}`,
        sender: senderName,
        textEs,
        textEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        photoAttachment,
      };

      if (!exists) {
        let avatar = "💬";
        if (chatId === "mom") avatar = "👩";
        else if (targetId === "Alanis") avatar = "👑";
        else if (chatId === "Ángela" || chatId === "Angela") avatar = "👻";

        return [
          ...prev,
          {
            id: targetId,
            contactName: senderName,
            avatar,
            unread: true,
            messages: [newMsg],
            replies: initialReplies
          }
        ];
      }

      return prev.map(chat => {
        if (chat.id === targetId || chat.id === chatId) {
          return {
            ...chat,
            contactName: senderName,
            unread: true,
            messages: [...chat.messages, newMsg],
            replies: initialReplies || chat.replies
          };
        }
        return chat;
      });
    });
  };

  const triggerAlanisPhoneChat = () => {
    if (phoneChats.some(c => c.id === "Alanis" || c.contactName.includes("Alanis"))) {
      return;
    }

    const initialMessageEs = "Soy la Líder Suprema de todo lo conocido. Un espíritu que gobierna todas las realidades.";
    const initialMessageEn = "I am the Supreme Leader of all that is known. A spirit that rules all realities.";

    const enemyName = canvasStateRef.current?.neighborName || "Vanesa";

    const alanisReplies: PhoneReply[] = [
      {
        textEs: "CKY: Te felicito. ¿Y yo qué culpa tengo?",
        textEn: "CKY: Congratulations. And how is that my fault?",
        nextMessages: [
          {
            id: `alanis_${Date.now()}_1`,
            sender: "Alanis (Líder Suprema)",
            textEs: "Tú eres la heredera de este poder, mi reinado está llegando a su fin...",
            textEn: "You are the heir to this power, my reign is coming to an end...",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        nextReplies: [
          {
            textEs: "CKY: ¿Y esa herencia de cuánta plata es?",
            textEn: "CKY: And how much money is that inheritance?",
            nextMessages: [
              {
                id: `alanis_${Date.now()}_2`,
                sender: "Alanis (Líder Suprema)",
                textEs: "¡Poder... Niña estúpida! Ahora tienes el poder de hablar con espíritus...",
                textEn: "Power... Stupid girl! Now you have the power to speak with spirits...",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
              {
                id: `alanis_${Date.now()}_3`,
                sender: "Alanis (Líder Suprema)",
                textEs: `Pero debes tener cuidado, ${enemyName} también tiene poderes y quiere mi lugar... va a intentar destruirte.`,
                textEn: `But you must be careful, ${enemyName} also has powers and wants my place... she will try to destroy you.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ],
            nextReplies: [
              {
                textEs: "CKY: ¿Y qué tengo que hacer?",
                textEn: "CKY: And what do I have to do?",
                nextMessages: [
                  {
                    id: `alanis_${Date.now()}_4`,
                    sender: "Alanis (Líder Suprema)",
                    textEs: "Por ahora intenta hablar con un espíritu. Luego veremos. Adiós.",
                    textEn: "For now try to speak with a spirit. We will see later. Goodbye.",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ],
                actionId: "finish_alanis_start_angela"
              }
            ]
          }
        ]
      }
    ];

    triggerNewPhoneMessage("Alanis", initialMessageEs, initialMessageEn, undefined, alanisReplies);
  };

  const triggerAngelaPhoneChat = () => {
    if (phoneChats.some(c => c.id === "Ángela" || c.id === "Angela" || c.contactName.includes("Ángela"))) {
      return;
    }

    const initialMessageEs = "Hola... ¿hay alguien ahí?";
    const initialMessageEn = "Hello... is anyone there?";

    const angelaReplies: PhoneReply[] = [
      {
        textEs: "CKY: Hola soy CKY, ¿vos?",
        textEn: "CKY: Hi I'm CKY, and you?",
        nextMessages: [
          {
            id: `angela_${Date.now()}_1`,
            sender: "Ángela",
            textEs: "Hola, mi nombre es Ángela y tengo 15 años.",
            textEn: "Hi, my name is Angela and I am 15 years old.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        nextReplies: [
          {
            textEs: "CKY: Hola Ángela, ¿y qué quieres?",
            textEn: "CKY: Hi Angela, and what do you want?",
            nextMessages: [
              {
                id: `angela_${Date.now()}_2`,
                sender: "Ángela",
                textEs: "Hola, si puedes llevarme un sándwich de salame y queso a mi tumba... seré tu amiga. Tumba rosa...",
                textEn: "Hi, if you can bring a salami and cheese sandwich to my grave... I will be your friend. Pink grave...",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ],
            nextReplies: [
              {
                textEs: "CKY: Está bien... mañana lo haré.",
                textEn: "CKY: Alright... I'll do it tomorrow.",
                nextMessages: [
                  {
                    id: `angela_${Date.now()}_3`,
                    sender: "Ángela",
                    textEs: "Tumba rosa... adiós.",
                    textEn: "Pink grave... goodbye.",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ],
                actionId: "finish_angela_quest"
              }
            ]
          }
        ]
      }
    ];

    triggerNewPhoneMessage("Ángela", initialMessageEs, initialMessageEn, undefined, angelaReplies);
  };

  // Select reply to spirit or contact
  const handleSelectReply = (chatId: string, replyIndex: number) => {
    const chat = phoneChats.find(c => c.id === chatId);
    if (!chat || !chat.replies) return;

    const selectedReply = chat.replies[replyIndex];

    // Push player's response
    const playerMsg = {
      id: `pmsg_${Date.now()}`,
      sender: "CKY",
      textEs: selectedReply.textEs,
      textEn: selectedReply.textEn,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPlayer: true
    };

    playSound(500, "sine", 0.15);

    // Update messages chain and clean selected replies
    setPhoneChats(prev =>
      prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, playerMsg],
            replies: [] // Clear after reply is chosen
          };
        }
        return c;
      })
    );

    // Simulate contact typing response after a brief delay
    setTimeout(() => {
      setPhoneChats(prev =>
        prev.map(c => {
          if (c.id === chatId) {
            playSound(800, "sine", 0.3);
            return {
              ...c,
              unread: true,
              messages: [...c.messages, ...selectedReply.nextMessages],
              replies: selectedReply.nextReplies || []
            };
          }
          return c;
        })
      );

      // Handle custom actionId triggers
      if (selectedReply.actionId === "ach_troll_limbo") {
        unlockAchievement("ach_troll_limbo", showNotification, addXP);
      } else if (chatId === "chat_family_group") {
        unlockAchievement("ach_familia_chat", showNotification, addXP);
      }

      if (selectedReply.actionId === "finish_alanis_start_angela" || selectedReply.actionId === "finish_alanis") {
        if (canvasStateRef.current) {
          canvasStateRef.current.hasTalkedToAlanis = true;
          if (canvasStateRef.current.setHasTalkedToAlanis) {
            canvasStateRef.current.setHasTalkedToAlanis(true);
          }
        }
        addXP(10);
      } else if (selectedReply.actionId === "finish_angela_quest") {
        if (canvasStateRef.current) {
          canvasStateRef.current.hasTalkedToAngela = true;
          if (canvasStateRef.current.setHasTalkedToAngela) {
            canvasStateRef.current.setHasTalkedToAngela(true);
          }
        }
        addXP(10);
        unlockDiaryEntry("chapter_01_angela_tomb");

        // Close phone interface modal and return gameState to playing
        setGameState("playing");

        setTimeout(() => {
          handleTriggerDialogue(
            "Día 1 Finalizado",
            "Terminaste la conversación con Ángela. CKY se queda profundamente dormida pensando en la tumba rosa... 🌙",
            "You finished the conversation with Angela. CKY falls deeply asleep thinking about the pink tomb... 🌙",
            () => {
              if (canvasStateRef.current?.startDay2Intro) {
                canvasStateRef.current.startDay2Intro();
              }
            }
          );
        }, 300);
      }
    }, 1200);
  };

  const handleMarkChatRead = useCallback((chatId: string) => {
    setPhoneChats(prev => {
      const target = prev.find(c => c.id === chatId);
      if (!target || !target.unread) return prev;
      return prev.map(c => (c.id === chatId ? { ...c, unread: false } : c));
    });
  }, []);

  // Dialogue overlay advance controller
  const handleTriggerDialogue = (speaker: string, textEs: string, textEn: string, onDone?: () => void) => {
    setDialogSpeaker(speaker);
    const text = language === "es" ? textEs : textEn;
    setDialogText(text);
    setDialogOnDone(() => onDone || null);
    setGameState("dialogue");
    playSound(450, "sine", 0.05);
  };

  const handleCloseDialogue = () => {
    setGameState("playing");
    if (dialogOnDone) {
      dialogOnDone();
    }
  };

  // Global Keyboard listener for dialogs, phone, diary/inventory, map (Escape key support)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (targetTag === "INPUT" || targetTag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === "Escape" || e.key === "Esc") {
        if (gameState === "dialogue") {
          e.preventDefault();
          handleCloseDialogue();
        } else if (gameState === "phone" || gameState === "diary" || gameState === "map") {
          e.preventDefault();
          setGameState("playing");
        }
      } else if (gameState === "dialogue") {
        if (e.key === "Enter" || e.key === " " || e.key === "NumpadEnter") {
          e.preventDefault();
          handleCloseDialogue();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, dialogOnDone]);

  // Save / Load System handlers
  const getCurrentSavePayload = () => {
    const canvasData = canvasStateRef.current || {};
    const mapId = canvasData.currentMap || "bedroom";
    return {
      gameState: gameState === "title" ? "playing" : gameState,
      mapId,
      currentMap: mapId,
      playerPos: canvasData.playerPos || { x: 3, y: 3 },
      facing: canvasData.facing || "down",
      gameTime: canvasData.gameTime || { hour: 5, minute: 0 },
      totalGameMinutes: canvasData.totalGameMinutes || 300,
      currentDay: currentDay || canvasData.currentDay || 1,
      playerLevel: stats.level || 1,
      stats,
      inventory,
      hasBackpack,
      hasPhone,
      currentOutfit,
      hasGroomed,
      twinName,
      pauName,
      neighborName: canvasData.neighborName || "",
      hasNeighborBoardedBus: canvasData.hasNeighborBoardedBus || false,
      classStep: canvasData.classStep || 0,
      hasPassengersBoarded: canvasData.hasPassengersBoarded || false,
      hasFirstClassFinished: canvasData.hasFirstClassFinished || false,
      hasKickedBallXP: canvasData.hasKickedBallXP || false,
      hasVisitedHallway: canvasData.hasVisitedHallway || false,
      hasSeenMomKitchenIntro: canvasData.hasSeenMomKitchenIntro || false,
      momInteractionCount: canvasData.momInteractionCount || 0,
      hasTakenMomsPerfume: canvasData.hasTakenMomsPerfume || false,
      hasTakenMomsPlantMoney: canvasData.hasTakenMomsPlantMoney || false,
      hasTriggeredMomPhotoEvent: canvasData.hasTriggeredMomPhotoEvent || false,
      isPhoneCharging: canvasData.isPhoneCharging || false,
      hasSearchedStreetTrash: canvasData.hasSearchedStreetTrash || false,
      hasTalkedToMomAfterSchool: canvasData.hasTalkedToMomAfterSchool || false,
      siestaTaken: canvasData.siestaTaken || false,
      showerTakenAfterSiesta: canvasData.showerTakenAfterSiesta || false,
      hasReceivedUnknownPhoneCall: canvasData.hasReceivedUnknownPhoneCall || false,
      actionCooldowns: canvasData.actionCooldowns || {},
      phoneChats,
      phonePhotos,
      diaryEntries,
      companions,
      soulmateInfo: soulmateInfo || undefined,
    };
  };

  const handleLoadGame = (saveData: SaveSlotData) => {
    if (saveData.stats) setStats(saveData.stats);
    if (saveData.inventory) setInventory(saveData.inventory);
    if (saveData.hasBackpack !== undefined) setHasBackpack(saveData.hasBackpack);
    if (saveData.hasPhone !== undefined) setHasPhone(saveData.hasPhone);
    if (saveData.currentOutfit) setCurrentOutfit(saveData.currentOutfit);
    if (saveData.hasGroomed !== undefined) setHasGroomed(saveData.hasGroomed);
    if (saveData.twinName) setTwinName(saveData.twinName);
    if (saveData.pauName) setPauName(saveData.pauName);
    if (saveData.soulmateInfo) setSoulmateInfo(saveData.soulmateInfo);
    if (saveData.companions) setCompanions(saveData.companions);
    if (saveData.phoneChats) setPhoneChats(saveData.phoneChats);
    if (saveData.phonePhotos) setPhonePhotos(saveData.phonePhotos);
    if (saveData.diaryEntries) setDiaryEntries(saveData.diaryEntries);
    if (saveData.currentDay !== undefined) {
      setCurrentDay(saveData.currentDay);
    } else {
      setCurrentDay(1);
    }

    setLoadedSaveData(saveData);
    setGameState("playing");
    playSound(660, "sine", 0.3);
  };

  const handleAutosave = () => {
    const payload = getCurrentSavePayload();
    saveToSlot("autosave", payload);
  };

  const handleContinueLatestSave = () => {
    const latest = getLatestSave();
    if (latest) {
      handleLoadGame(latest);
    } else {
      handleStartNewGame();
    }
  };

  // Triggering new spiritual alert
  const [spiritNotifier, setSpiritNotifier] = useState<boolean>(false);

  const triggerSpiritNotifier = () => {
    setSpiritNotifier(true);
    playSound(880, "square", 0.4);
  };

  // Reset progress start clean
  const handleResetGame = () => {
    localStorage.removeItem("cky_neighbor_name");
    localStorage.removeItem("cky_neighbor_boarded");
    localStorage.removeItem("cky_twin_name");
    localStorage.removeItem("cky_pau_name");
    setTwinName("");
    setPauName("");
    setInventory([]);
    setHasBackpack(false);
    setHasPhone(false);
    setCurrentOutfit("pajamas");
    setHasGroomed(false);
    setStats({
      salud: 100,
      maxSalud: 100,
      energia: 100,
      maxEnergia: 100,
      hambre: 100,
      maxHambre: 100,
      sed: 100,
      maxSed: 100,
      perfume: 100,
      maxPerfume: 100,
      amor: 50,
      higiene: 100,
      bateriaCelular: 100,
      level: 1,
      xp: 0,
      maxXp: 100,
    });
    setDiaryEntries(prev => prev.map((e, idx) => ({ ...e, unlocked: idx === 0 })));
    setCurrentDay(1);
    setResetKey(prev => prev + 1);
    setGameState("title");
    playSound(200, "sawtooth", 0.4);
  };

  const handleStartNewGame = () => {
    localStorage.removeItem("cky_neighbor_name");
    localStorage.removeItem("cky_neighbor_boarded");
    localStorage.removeItem("cky_twin_name");
    localStorage.removeItem("cky_pau_name");
    setTwinName("");
    setPauName("");
    setInventory([]);
    setHasBackpack(false);
    setHasPhone(false);
    setCurrentOutfit("pajamas");
    setHasGroomed(false);
    setStats({
      salud: 100,
      maxSalud: 100,
      energia: 100,
      maxEnergia: 100,
      hambre: 100,
      maxHambre: 100,
      sed: 100,
      maxSed: 100,
      perfume: 100,
      maxPerfume: 100,
      amor: 50,
      higiene: 100,
      bateriaCelular: 100,
      level: 1,
      xp: 0,
      maxXp: 100,
    });
    setDiaryEntries(prev => prev.map((e, idx) => ({ ...e, unlocked: idx === 0 })));
    setCurrentDay(1);
    setResetKey(prev => prev + 1);
    setGameState("playing");
    playSound(660, "sine", 0.3);
  };

  const handleStartDevDay = (dayNumber: number) => {
    setShowDevModal(false);
    playSound(660, "sine", 0.3);
    setCurrentDay(dayNumber);

    if (dayNumber === 1) {
      handleStartNewGame();
      return;
    }

    if (dayNumber === 2) {
      const day2Save: SaveSlotData = {
        id: "dev_day_2",
        slotName: "Día 2",
        timestamp: Date.now(),
        dateString: "Día 2 - 05:00 AM",
        playtimeString: "0m",
        mapId: "bedroom",
        mapNameEs: "Habitación de CKY",
        mapNameEn: "CKY's Bedroom",
        playerLevel: 2,
        gameState: "playing",
        currentMap: "bedroom",
        playerPos: { x: 8, y: 3 },
        facing: "down",
        gameTime: { hour: 5, minute: 0 },
        totalGameMinutes: 1740,
        currentDay: 2,
        stats: {
          hambre: 100,
          sed: 100,
          perfume: 100,
          amor: 65,
          higiene: 100,
          bateriaCelular: 100,
          level: 2,
          xp: 45,
          maxXp: 150
        },
        inventory: [],
        hasBackpack: false,
        hasPhone: false,
        currentOutfit: "pajamas",
        hasGroomed: false,
        twinName: "Gemelo",
        pauName: "Pau",
        neighborName: "Nico",
        hasNeighborBoardedBus: true,
        classStep: 5,
        hasPassengersBoarded: true,
        hasFirstClassFinished: true,
        hasKickedBallXP: true,
        hasVisitedHallway: true,
        hasSeenMomKitchenIntro: true,
        momInteractionCount: 2,
        hasTakenMomsPerfume: true,
        hasTakenMomsPlantMoney: true,
        hasTriggeredMomPhotoEvent: true,
        isPhoneCharging: false,
        hasSearchedStreetTrash: true,
        hasTalkedToMomAfterSchool: true,
        siestaTaken: true,
        showerTakenAfterSiesta: true,
        hasReceivedUnknownPhoneCall: true,
        actionCooldowns: {},
        phoneChats: [],
        phonePhotos: [],
        diaryEntries: diaryEntries.map((e, idx) => ({ ...e, unlocked: idx <= 3 })),
        companions: companions
      };

      handleLoadGame(day2Save);
      return;
    }

    if (dayNumber === 3) {
      const day3Save: SaveSlotData = {
        id: `dev_day_${dayNumber}`,
        slotName: `Día ${dayNumber}`,
        timestamp: Date.now(),
        dateString: `Día 3 - 07:00 AM`,
        playtimeString: "0m",
        mapId: "bedroom",
        mapNameEs: "Habitación de CKY",
        mapNameEn: "CKY's Bedroom",
        playerLevel: 3,
        gameState: "playing",
        currentMap: "bedroom",
        playerPos: { x: 3, y: 3 },
        facing: "down",
        gameTime: { hour: 7, minute: 0 },
        totalGameMinutes: 1440 * 2 + 420,
        currentDay: 3,
        stats: {
          hambre: 100,
          sed: 100,
          perfume: 100,
          amor: 75,
          higiene: 100,
          bateriaCelular: 100,
          level: 3,
          xp: 80,
          maxXp: 200
        },
        inventory: [],
        hasBackpack: true,
        hasPhone: true,
        currentOutfit: "casual",
        hasGroomed: true,
        twinName: "Gemelo",
        pauName: "Pau",
        neighborName: "Nico",
        hasNeighborBoardedBus: true,
        classStep: 5,
        hasPassengersBoarded: true,
        hasFirstClassFinished: true,
        hasKickedBallXP: true,
        hasVisitedHallway: true,
        hasSeenMomKitchenIntro: true,
        momInteractionCount: 2,
        hasTakenMomsPerfume: true,
        hasTakenMomsPlantMoney: true,
        hasTriggeredMomPhotoEvent: true,
        isPhoneCharging: false,
        hasSearchedStreetTrash: true,
        hasTalkedToMomAfterSchool: true,
        siestaTaken: true,
        showerTakenAfterSiesta: true,
        hasReceivedUnknownPhoneCall: true,
        actionCooldowns: {},
        phoneChats: [],
        phonePhotos: [],
        diaryEntries: diaryEntries.map((e) => ({ ...e, unlocked: true })),
        companions: companions
      };

      handleLoadGame(day3Save);
      return;
    }

    if (dayNumber === 4) {
      const day4Save: SaveSlotData = {
        id: "dev_day_4",
        slotName: "Día 4",
        timestamp: Date.now(),
        dateString: "Día 4 - 06:00 AM (Sábado)",
        playtimeString: "0m",
        mapId: "bedroom",
        mapNameEs: "Habitación de CKY",
        mapNameEn: "CKY's Bedroom",
        playerLevel: 4,
        gameState: "playing",
        currentMap: "bedroom",
        playerPos: { x: 3, y: 3 },
        facing: "down",
        gameTime: { hour: 6, minute: 0 },
        totalGameMinutes: 1440 * 3 + 360,
        currentDay: 4,
        stats: {
          hambre: 100,
          sed: 100,
          perfume: 100,
          amor: 85,
          higiene: 100,
          bateriaCelular: 100,
          level: 4,
          xp: 120,
          maxXp: 300
        },
        inventory: [],
        hasBackpack: true,
        hasPhone: true,
        currentOutfit: "casual",
        hasGroomed: true,
        twinName: "Gemelo",
        pauName: "Pau",
        neighborName: "Nico",
        hasNeighborBoardedBus: true,
        classStep: 5,
        hasPassengersBoarded: true,
        hasFirstClassFinished: true,
        hasKickedBallXP: true,
        hasVisitedHallway: true,
        hasSeenMomKitchenIntro: true,
        momInteractionCount: 2,
        hasTakenMomsPerfume: true,
        hasTakenMomsPlantMoney: true,
        hasTriggeredMomPhotoEvent: true,
        isPhoneCharging: false,
        hasSearchedStreetTrash: true,
        hasTalkedToMomAfterSchool: true,
        siestaTaken: true,
        showerTakenAfterSiesta: true,
        hasReceivedUnknownPhoneCall: true,
        actionCooldowns: {},
        phoneChats: [],
        phonePhotos: [],
        diaryEntries: diaryEntries.map((e) => ({ ...e, unlocked: true })),
        companions: companions
      };

      handleLoadGame(day4Save);
      return;
    }

    if (dayNumber === 5) {
      const day5Save: SaveSlotData = {
        id: `dev_day_5`,
        slotName: `Día 5`,
        timestamp: Date.now(),
        dateString: "Día 5 - 07:30 AM (Domingo)",
        playtimeString: "0m",
        mapId: "bedroom",
        mapNameEs: "Habitación de CKY",
        mapNameEn: "CKY's Bedroom",
        playerLevel: 5,
        gameState: "playing",
        currentMap: "bedroom",
        playerPos: { x: 3, y: 3 },
        facing: "down",
        gameTime: { hour: 7, minute: 30 },
        totalGameMinutes: 1440 * 4 + 450,
        currentDay: 5,
        stats: {
          hambre: 100,
          sed: 100,
          perfume: 100,
          amor: 90,
          higiene: 100,
          bateriaCelular: 100,
          level: 5,
          xp: 200,
          maxXp: 400
        },
        inventory: [],
        hasBackpack: true,
        hasPhone: true,
        currentOutfit: "pajamas",
        hasGroomed: true,
        day4GolemDefeated: true,
        day4TreasureDug: true,
        day4BoutiqueDressBought: true,
        day4SilkPajamasBought: true,
        day4GalaDressBought: true,
        day4PerfumeBought: true,
        day4LingerieBought: true,
        twinName: "Gemelo",
        pauName: "Pau",
        neighborName: "Nico",
        hasNeighborBoardedBus: true,
        classStep: 5,
        hasPassengersBoarded: true,
        hasFirstClassFinished: true,
        hasKickedBallXP: true,
        hasVisitedHallway: true,
        hasSeenMomKitchenIntro: true,
        momInteractionCount: 3,
        hasTakenMomsPerfume: true,
        hasTakenMomsPlantMoney: true,
        hasTriggeredMomPhotoEvent: true,
        isPhoneCharging: false,
        hasSearchedStreetTrash: true,
        hasTalkedToMomAfterSchool: true,
        siestaTaken: true,
        showerTakenAfterSiesta: true,
        hasReceivedUnknownPhoneCall: true,
        actionCooldowns: {},
        phoneChats: [],
        phonePhotos: [],
        diaryEntries: diaryEntries.map((e) => ({ ...e, unlocked: true })),
        companions: companions
      };

      handleLoadGame(day5Save);
      return;
    }

    if (dayNumber === 6) {
      const day6Save: SaveSlotData = {
        id: `dev_day_${dayNumber}`,
        slotName: `Día ${dayNumber}`,
        timestamp: Date.now(),
        dateString: "Día 6 - 05:45 AM (Lunes)",
        playtimeString: "0m",
        mapId: "bedroom",
        mapNameEs: "Habitación de CKY",
        mapNameEn: "CKY's Bedroom",
        playerLevel: 6,
        gameState: "playing",
        currentMap: "bedroom",
        playerPos: { x: 3, y: 3 },
        facing: "down",
        gameTime: { hour: 5, minute: 45 },
        totalGameMinutes: 1440 * 5 + 345,
        currentDay: 6,
        stats: {
          hambre: 85,
          sed: 80,
          perfume: 100,
          amor: 100,
          higiene: 70,
          bateriaCelular: 100,
          level: 6,
          xp: 300,
          maxXp: 500
        },
        inventory: [],
        hasBackpack: false,
        hasPhone: true,
        currentOutfit: "pajamas_silk",
        hasGroomed: false,
        day4GolemDefeated: true,
        day4TreasureDug: true,
        day4BoutiqueDressBought: true,
        day4SilkPajamasBought: true,
        day4GalaDressBought: true,
        day4PerfumeBought: true,
        day4LingerieBought: true,
        day5CleanedBedroom: true,
        day5CleanedBathroom: true,
        day5CleanedLiving: true,
        day5CleanedKitchen: true,
        day5CleaningFinished: true,
        day5PaidAirportBet: true,
        day5ShowerDone: true,
        day5SexyPhotosTaken: true,
        day6DarkFormDefeated: false,
        day6AlanisInterventionDone: false,
        day6SoulmateJoined: false,
        day6MorningRoutineComplete: false,
        twinName: soulmateInfo?.name || "Kael",
        pauName: "Pau",
        neighborName: "Nico",
        hasNeighborBoardedBus: true,
        classStep: 5,
        hasPassengersBoarded: true,
        hasFirstClassFinished: true,
        hasKickedBallXP: true,
        hasVisitedHallway: true,
        hasSeenMomKitchenIntro: true,
        momInteractionCount: 3,
        hasTakenMomsPerfume: true,
        hasTakenMomsPlantMoney: true,
        hasTriggeredMomPhotoEvent: true,
        isPhoneCharging: false,
        hasSearchedStreetTrash: true,
        hasTalkedToMomAfterSchool: true,
        siestaTaken: true,
        showerTakenAfterSiesta: true,
        hasReceivedUnknownPhoneCall: true,
        actionCooldowns: {},
        phoneChats: [],
        phonePhotos: [],
        diaryEntries: diaryEntries.map((e) => ({ ...e, unlocked: true })),
        companions: companions
      };

      handleLoadGame(day6Save);
      return;
    }

    if (dayNumber === 7) {
      const day7Save: SaveSlotData = {
        id: `dev_day_${dayNumber}`,
        slotName: `Día ${dayNumber}`,
        timestamp: Date.now(),
        dateString: "Día 7 - 06:45 AM (Martes)",
        playtimeString: "0m",
        mapId: "bedroom",
        mapNameEs: "Habitación de CKY",
        mapNameEn: "CKY's Bedroom",
        playerLevel: 7,
        gameState: "playing",
        currentMap: "bedroom",
        playerPos: { x: 3, y: 3 },
        facing: "down",
        gameTime: { hour: 6, minute: 45 },
        totalGameMinutes: 1440 * 6 + 405,
        currentDay: 7,
        stats: {
          hambre: 90,
          sed: 85,
          perfume: 100,
          amor: 100,
          higiene: 75,
          bateriaCelular: 100,
          level: 7,
          xp: 450,
          maxXp: 600
        },
        inventory: [],
        hasBackpack: false,
        hasPhone: true,
        currentOutfit: "pajamas_silk",
        hasGroomed: false,
        day4GolemDefeated: true,
        day4TreasureDug: true,
        day4BoutiqueDressBought: true,
        day4SilkPajamasBought: true,
        day4GalaDressBought: true,
        day4PerfumeBought: true,
        day4LingerieBought: true,
        day5CleanedBedroom: true,
        day5CleanedBathroom: true,
        day5CleanedLiving: true,
        day5CleanedKitchen: true,
        day5CleaningFinished: true,
        day5PaidAirportBet: true,
        day5ShowerDone: true,
        day5SexyPhotosTaken: true,
        day6DarkFormDefeated: true,
        day6AlanisInterventionDone: true,
        day6SoulmateJoined: true,
        day6MorningRoutineComplete: true,
        day6PossessedSoccerDefeated: true,
        day7GrimoireStrategyExplained: false,
        day7DirectorExpulsionDone: false,
        day7BasementDiscovered: false,
        day7BasementValveTurned: false,
        day7BasementMinion1Defeated: false,
        day7BasementKeyFound: false,
        day7BasementGateUnlocked: false,
        day7BasementMinion2Defeated: false,
        day7BasementGeneratorDisabled: false,
        day7LaboratoryBossDefeated: false,
        day7ProfessorLiberated: false,
        day7AlanisBedroomArgumentDone: false,
        day7ShowerDone: false,
        day7LingeriePacked: false,
        day7SoulmateKissDone: false,
        day7SoulmateChangedToLingerie: false,
        day7SoulmateRunwayDone: false,
        day7SoulmateIntelDone: false,
        day7SoulmateChangedBack: false,
        day7ReturnedHomeReportDone: false,
        day7Completed: false,
        twinName: soulmateInfo?.name || "Kael",
        pauName: "Pau",
        neighborName: "Nico",
        hasNeighborBoardedBus: true,
        classStep: 5,
        hasPassengersBoarded: true,
        hasFirstClassFinished: true,
        hasKickedBallXP: true,
        hasVisitedHallway: true,
        hasSeenMomKitchenIntro: true,
        momInteractionCount: 3,
        hasTakenMomsPerfume: true,
        hasTakenMomsPlantMoney: true,
        hasTriggeredMomPhotoEvent: true,
        isPhoneCharging: false,
        hasSearchedStreetTrash: true,
        hasTalkedToMomAfterSchool: true,
        siestaTaken: true,
        showerTakenAfterSiesta: true,
        hasReceivedUnknownPhoneCall: true,
        actionCooldowns: {},
        phoneChats: [],
        phonePhotos: [],
        diaryEntries: diaryEntries.map((e) => ({ ...e, unlocked: true })),
        companions: companions
      };

      handleLoadGame(day7Save);
      return;
    }

    if (dayNumber >= 8) {
      const day8Save: SaveSlotData = {
        id: `dev_day_${dayNumber}`,
        slotName: `Día ${dayNumber}`,
        timestamp: Date.now(),
        dateString: "Día 8 - 07:00 AM (Miércoles)",
        playtimeString: "0m",
        mapId: "bedroom",
        mapNameEs: "Habitación de CKY",
        mapNameEn: "CKY's Bedroom",
        playerLevel: 8,
        gameState: "playing",
        currentMap: "bedroom",
        playerPos: { x: 3, y: 3 },
        facing: "down",
        gameTime: { hour: 7, minute: 0 },
        totalGameMinutes: 1440 * 7 + 420,
        currentDay: 8,
        stats: {
          hambre: 95,
          sed: 90,
          perfume: 100,
          amor: 100,
          higiene: 85,
          bateriaCelular: 100,
          level: 8,
          xp: 550,
          maxXp: 750
        },
        inventory: [],
        hasBackpack: true,
        hasPhone: true,
        currentOutfit: "pajamas_silk",
        hasGroomed: false,
        day4GolemDefeated: true,
        day4TreasureDug: true,
        day4BoutiqueDressBought: true,
        day4SilkPajamasBought: true,
        day4GalaDressBought: true,
        day4PerfumeBought: true,
        day4LingerieBought: true,
        day5CleanedBedroom: true,
        day5CleanedBathroom: true,
        day5CleanedLiving: true,
        day5CleanedKitchen: true,
        day5CleaningFinished: true,
        day5PaidAirportBet: true,
        day5ShowerDone: true,
        day5SexyPhotosTaken: true,
        day6DarkFormDefeated: true,
        day6AlanisInterventionDone: true,
        day6SoulmateJoined: true,
        day6MorningRoutineComplete: true,
        day6PossessedSoccerDefeated: true,
        day7Completed: true,
        day8MorningTalkDone: false,
        day8OutfitReady: false,
        day8StreetSoulmateMet: false,
        day8PlazaDefended: false,
        day8HospitalDefended: false,
        day8TerminalDefended: false,
        day8MallDefended: false,
        day8AllDefendedReportDone: false,
        day8NeighborConfrontationDone: false,
        day8AlanisBedroomDone: false,
        day8Chapter1Ended: false,
        twinName: soulmateInfo?.name || "Kael",
        pauName: "Pau",
        neighborName: "Nico",
        hasNeighborBoardedBus: true,
        classStep: 5,
        hasPassengersBoarded: true,
        hasFirstClassFinished: true,
        hasKickedBallXP: true,
        hasVisitedHallway: true,
        hasSeenMomKitchenIntro: true,
        momInteractionCount: 3,
        hasTakenMomsPerfume: true,
        hasTakenMomsPlantMoney: true,
        hasTriggeredMomPhotoEvent: true,
        isPhoneCharging: false,
        hasSearchedStreetTrash: true,
        hasTalkedToMomAfterSchool: true,
        siestaTaken: true,
        showerTakenAfterSiesta: true,
        hasReceivedUnknownPhoneCall: true,
        actionCooldowns: {},
        phoneChats: [],
        phonePhotos: [],
        diaryEntries: diaryEntries.map((e) => ({ ...e, unlocked: true })),
        companions: companions
      };

      handleLoadGame(day8Save);
      return;
    }

    if (dayNumber === 99) {
      // Free Roam Post-Game Mode with all crazy missions unlocked
      localStorage.setItem("cky_free_roam_active", "true");
      setStats(prev => ({
        ...prev,
        dinero: (prev.dinero || 0) + 15000,
        perfume: 100,
        hambre: 100,
        sed: 100,
        higiene: 100
      }));

      const freeRoamSave: SaveSlotData = {
        id: `dev_freeroam`,
        slotName: `Modo Libre`,
        timestamp: Date.now(),
        dateString: "Modo Libre - 16:30 PM (Sin límite)",
        playtimeString: "10h",
        mapId: "bedroom",
        mapNameEs: "Habitación de CKY",
        mapNameEn: "CKY's Bedroom",
        playerLevel: 10,
        gameState: "playing",
        currentMap: "bedroom",
        playerPos: { x: 3, y: 3 },
        facing: "down",
        gameTime: { hour: 16, minute: 30 },
        totalGameMinutes: 1440 * 8 + 990,
        currentDay: 8,
        stats: {
          hambre: 100,
          sed: 100,
          perfume: 100,
          amor: 100,
          higiene: 100,
          bateriaCelular: 100,
          level: 10,
          xp: 999,
          maxXp: 1000
        },
        inventory: [],
        hasBackpack: true,
        hasPhone: true,
        currentOutfit: "casual",
        hasGroomed: true,
        day4GolemDefeated: true,
        day4TreasureDug: true,
        day4BoutiqueDressBought: true,
        day4SilkPajamasBought: true,
        day4GalaDressBought: true,
        day4PerfumeBought: true,
        day4LingerieBought: true,
        day5CleanedBedroom: true,
        day5CleanedBathroom: true,
        day5CleanedLiving: true,
        day5CleanedKitchen: true,
        day5CleaningFinished: true,
        day5PaidAirportBet: true,
        day5ShowerDone: true,
        day5SexyPhotosTaken: true,
        day6DarkFormDefeated: true,
        day6AlanisInterventionDone: true,
        day6SoulmateJoined: true,
        day6MorningRoutineComplete: true,
        day6PossessedSoccerDefeated: true,
        day7Completed: true,
        day8MorningTalkDone: true,
        day8OutfitReady: true,
        day8StreetSoulmateMet: true,
        day8PlazaDefended: true,
        day8HospitalDefended: true,
        day8TerminalDefended: true,
        day8MallDefended: true,
        day8AllDefendedReportDone: true,
        day8NeighborConfrontationDone: true,
        day8AlanisBedroomDone: true,
        day8Chapter1Ended: true,
        twinName: soulmateInfo?.name || "Kael",
        pauName: "Pau",
        neighborName: "Nico",
        hasNeighborBoardedBus: true,
        classStep: 5,
        hasPassengersBoarded: true,
        hasFirstClassFinished: true,
        hasKickedBallXP: true,
        hasVisitedHallway: true,
        hasSeenMomKitchenIntro: true,
        momInteractionCount: 3,
        hasTakenMomsPerfume: true,
        hasTakenMomsPlantMoney: true,
        hasTriggeredMomPhotoEvent: true,
        isPhoneCharging: false,
        hasSearchedStreetTrash: true,
        hasTalkedToMomAfterSchool: true,
        siestaTaken: true,
        showerTakenAfterSiesta: true,
        hasReceivedUnknownPhoneCall: true,
        actionCooldowns: {},
        phoneChats: [],
        phonePhotos: [],
        diaryEntries: diaryEntries.map((e) => ({ ...e, unlocked: true })),
        companions: companions
      };

      handleLoadGame(freeRoamSave);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-yellow-500 selection:text-slate-950">
      
      {/* Central custom header switcher */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        isSilent={isSilent}
        onToggleSound={() => {
          setIsSilent(!isSilent);
          // Play note feedback if turning sound on
          if (isSilent) {
            setTimeout(() => playSound(520, "sine", 0.2), 50);
          }
        }}
        onOpenSaveLoadModal={(mode) => setSaveLoadModalState({ isOpen: true, mode })}
        onOpenGraphicsSettings={() => setShowGraphicsModal(true)}
        onOpenAndroidModal={() => setShowAndroidModal(true)}
      />

      {/* Main Android Game Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col gap-4">
        <AndroidDeviceFrame language={language} onOpenInstallModal={() => setShowAndroidModal(true)}>
          <div className="flex flex-col items-center w-full relative">
            
            {/* Title Screen */}
            {gameState === "title" && (
              <div className="flex flex-col items-center justify-center bg-black/90 border-2 border-slate-800 rounded-3xl p-8 py-16 text-center shadow-2xl relative overflow-hidden h-[480px] w-full max-w-3xl my-4">
                <div className="absolute inset-0 bg-radial-glow opacity-25 pointer-events-none" />
                
                <h1 className="text-7xl sm:text-8xl font-extrabold tracking-widest text-yellow-500 font-display animate-pulse select-none drop-shadow-md">
                  CKY
                </h1>
                <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mt-3">
                  {language === "es" ? "RPG NARRATIVO 8-BIT • LA HEREDERA DEL MÁXIMO PODER" : "8-BIT NARRATIVE RPG • HEIRESS OF THE SUPREME POWER"}
                </p>

                <div className="mt-8 flex flex-col gap-3.5 w-72">
                  <button
                    onClick={handleStartNewGame}
                    className="w-full py-3.5 px-6 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-display font-bold rounded-xl shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all text-sm tracking-wider uppercase cursor-pointer"
                  >
                    {language === "es" ? "NUEVO JUEGO" : "NEW GAME"}
                  </button>
                  
                  <button
                    onClick={handleContinueLatestSave}
                    className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl transition-all active:scale-95 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-yellow-500" />
                    {language === "es" ? "CONTINUAR PARTIDA" : "CONTINUE GAME"}
                  </button>

                  <button
                    onClick={() => {
                      setShowDevModal(true);
                      playSound(500, "sine", 0.2);
                    }}
                    className="w-full py-3 px-6 bg-purple-950/90 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-500/60 rounded-xl transition-all active:scale-95 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 text-purple-400" />
                    {language === "es" ? "DESARROLLO (SELECCIÓN DE DÍA)" : "DEVELOPMENT (DAY SELECT)"}
                  </button>

                  <button
                    onClick={() => setSaveLoadModalState({ isOpen: true, mode: "load" })}
                    className="w-full py-2.5 px-6 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-all active:scale-95 text-xs font-mono flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    {language === "es" ? "CARGAR / RANURAS" : "LOAD / SLOTS"}
                  </button>
                </div>

                <div className="mt-8 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  {language === "es" ? "Basado en La Biblia del Proyecto CKY v1.0" : "Based on CKY Project Bible v1.0"}
                </div>
              </div>
            )}

            {/* Main Playing View (Maintains Game Canvas mounted in playing, phone, diary, map & dialogue states) */}
            {(gameState === "playing" || gameState === "dialogue" || gameState === "phone" || gameState === "diary" || gameState === "map") && (
              <div className="w-full flex flex-col items-center relative">
                <GameCanvas
                  language={language}
                  onStateChange={setGameState}
                  onOpenPhone={() => setGameState("phone")}
                  onOpenDiary={() => setGameState("diary")}
                  onOpenMap={() => setGameState("map")}
                  onTriggerDialogue={handleTriggerDialogue}
                  inventory={inventory}
                  addInventoryItem={addInventoryItem}
                  removeInventoryItem={removeInventoryItem}
                  diaryEntries={diaryEntries}
                  unlockDiaryEntry={unlockDiaryEntry}
                  phoneChats={phoneChats}
                  triggerNewPhoneMessage={triggerNewPhoneMessage}
                  triggerAlanisPhoneChat={triggerAlanisPhoneChat}
                  triggerAngelaPhoneChat={triggerAngelaPhoneChat}
                  gameState={gameState}
                  resetGame={handleResetGame}
                  resetKey={resetKey}
                  customKeys={customKeys}
                  isSilent={isSilent}
                  onNotifySpirit={triggerSpiritNotifier}
                  hasBackpack={hasBackpack}
                  setHasBackpack={setHasBackpack}
                  hasPhone={hasPhone}
                  setHasPhone={setHasPhone}
                  currentOutfit={currentOutfit}
                  setCurrentOutfit={setCurrentOutfit}
                  hasGroomed={hasGroomed}
                  setHasGroomed={setHasGroomed}
                  addXP={addXP}
                  stats={stats}
                  setStats={setStats}
                  phonePhotos={phonePhotos}
                  addPhotoToGallery={addPhotoToGallery}
                  currentDay={currentDay}
                  onSetCurrentDay={setCurrentDay}
                  onUpdateCanvasState={(data) => {
                    canvasStateRef.current = data;
                    if (data?.currentDay !== undefined && data.currentDay !== currentDay) {
                      setCurrentDay(data.currentDay);
                    }
                  }}
                  onAutosave={handleAutosave}
                  onOpenSaveLoadModal={(mode) => setSaveLoadModalState({ isOpen: true, mode })}
                  loadData={loadedSaveData}
                  graphicsConfig={graphicsConfig}
                  onOpenGraphicsSettings={() => setShowGraphicsModal(true)}
                  soulmateInfo={soulmateInfo}
                  setSoulmateInfo={setSoulmateInfo}
                  onOpenDevDaySelect={() => setShowDevModal(true)}
                  onShowNotification={showNotification}
                />

                {/* OVERLAY MODAL 1: Phone Interface (Diablo/Classic RPG Modal Overlay) */}
                {gameState === "phone" && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[90vh] shadow-2xl relative">
                      <PhoneInterface
                        language={language}
                        phoneChats={phoneChats}
                        phonePhotos={phonePhotos}
                        onSelectReply={handleSelectReply}
                        onSavePhotoToGallery={addPhotoToGallery}
                        onDeletePhotoMessage={deletePhotoMessage}
                        onDeletePhotoFromGallery={deletePhotoFromGallery}
                        onClose={() => setGameState("playing")}
                        onOpenSaveLoadModal={(mode) => setSaveLoadModalState({ isOpen: true, mode })}
                        onAddXP={addXP}
                        stats={stats}
                        getCurrentSavePayload={getCurrentSavePayload}
                        onLoadGame={handleLoadGame}
                        onMarkChatRead={handleMarkChatRead}
                      />
                    </div>
                  </div>
                )}

                {/* OVERLAY MODAL 2: Journal, Inventory, Stats & Options (Diablo RPG Modal Overlay) */}
                {(gameState === "diary" || gameState === "map") && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative bg-slate-950 border-2 border-yellow-500/40 rounded-2xl">
                      <div className="p-2 flex justify-end border-b border-slate-800 bg-slate-900">
                        <button
                          onClick={() => setGameState("playing")}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded border border-slate-700 transition-all active:scale-95"
                        >
                          ✕ {language === "es" ? "CERRAR (ESC)" : "CLOSE (ESC)"}
                        </button>
                      </div>
                      <JournalAndInventory
                        language={language}
                        inventory={inventory}
                        diaryEntries={diaryEntries}
                        currentMapId={gameState}
                        isSilent={isSilent}
                        onToggleSound={() => setIsSilent(!isSilent)}
                        customKeys={customKeys}
                        onUpdateKeys={setCustomKeys}
                        onResetGame={handleResetGame}
                        stats={stats}
                        companions={companions}
                        twinName={twinName}
                        onSetTwinName={setTwinName}
                        pauName={pauName}
                        onSetPauName={setPauName}
                        onUseItem={handleUseItem}
                        hasBackpack={hasBackpack}
                        currentOutfit={currentOutfit}
                        hasGroomed={hasGroomed}
                        onToggleBackpack={() => setHasBackpack((prev) => !prev)}
                        onOpenPhone={() => setGameState("phone")}
                        onOpenSaveLoadModal={(mode) => setSaveLoadModalState({ isOpen: true, mode })}
                        onOpenDevModal={() => setShowDevModal(true)}
                        currentDay={currentDay}
                      />
                    </div>
                  </div>
                )}

                {/* OVERLAY MODAL 4: Dialogue Box Overlay */}
                {gameState === "dialogue" && (
                  <div 
                    onClick={() => {
                      androidBridge.hapticDialogue();
                      handleCloseDialogue();
                    }}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in cursor-pointer select-none"
                  >
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        androidBridge.hapticDialogue();
                        handleCloseDialogue();
                      }}
                      className="w-full max-w-lg bg-slate-950 border-2 border-emerald-500/80 rounded-3xl p-6 shadow-2xl relative text-center ring-4 ring-emerald-500/10 active:scale-[0.99] transition-transform"
                    >
                      <div className="text-5xl mb-3 animate-bounce">
                        {dialogSpeaker === "CKY" ? "👩" 
                          : dialogSpeaker === "Mamá" || dialogSpeaker === "Mom" ? "👩‍🦱" 
                          : dialogSpeaker === "Ángela" || dialogSpeaker === "Angela" ? "👻" 
                          : dialogSpeaker === "W" || dialogSpeaker === "Espíritu W" ? "🛡️"
                          : dialogSpeaker === "Alanis" ? "✨"
                          : dialogSpeaker.includes("Vecina") ? "🦹‍♀️"
                          : dialogSpeaker.includes("Mateo") ? "⚽"
                          : dialogSpeaker === "Pau" ? "👩‍🎤" 
                          : "💬"}
                      </div>
                      <span className="inline-block px-3 py-1 bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded-full uppercase tracking-widest mb-3 shadow-md">
                        {dialogSpeaker}
                      </span>
                      <p className="text-slate-100 font-mono text-sm leading-relaxed mb-6">
                        {dialogText}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          androidBridge.hapticDialogue();
                          handleCloseDialogue();
                        }}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-mono font-bold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        {language === "es" ? "👉 TOCAR PARA CONTINUAR" : "👉 TAP TO CONTINUE"}
                      </button>
                    </div>
                  </div>
                )}

                {/* OVERLAY MODAL 5: Level Up Celebration Overlay */}
                {levelUpData && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-md bg-slate-950 border-2 border-yellow-500 rounded-3xl p-6 shadow-2xl relative text-center space-y-4">
                      <div className="inline-flex p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-full text-yellow-400 text-4xl animate-bounce">
                        🌟
                      </div>
                      <div>
                        <h2 className="text-2xl font-black font-display text-yellow-400 tracking-wider uppercase">
                          {language === "es" ? "¡NIVEL AUMENTADO!" : "LEVEL UP!"}
                        </h2>
                        <p className="text-sm font-bold font-mono text-white mt-1">
                          {language === "es" ? `Nivel ${levelUpData.level} • ${levelUpData.titleEs}` : `Level ${levelUpData.level} • ${levelUpData.titleEn}`}
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
                        <p className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-wider">
                          {language === "es" ? "Atributos y Bonificaciones:" : "Attributes & Bonuses:"}
                        </p>
                        <ul className="space-y-1.5 text-xs font-mono text-slate-200">
                          {levelUpData.bonuses.map((bonus, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span>{bonus}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => setLevelUpData(null)}
                        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-display font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95 uppercase tracking-wider cursor-pointer"
                      >
                        {language === "es" ? "¡CONTINUAR ADELANTE!" : "CONTINUE FORWARD!"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Boss Confrontation Combat State */}
            {gameState === "combat" && (
              <div className="w-full max-w-3xl my-4">
                <CombatSimulator
                  language={language}
                  inventory={inventory}
                  onWin={() => {
                    setGameState("credits");
                    playSound(900, "sine", 0.5);
                  }}
                  onLose={() => {
                    setGameState("playing");
                    addInventoryItem({
                      id: "limbo_key",
                      nameEs: "Llave del Limbo",
                      nameEn: "Limbo Key",
                      descEs: "Una misteriosa llave antigua otorgada por Hermes en el Limbo. Desbloquea secretos.",
                      descEn: "A mysterious ancient key granted by Hermes in Limbo. Unlocks secrets.",
                      icon: "🔑",
                      isKey: true,
                      category: "pockets"
                    });
                    unlockDiaryEntry("chapter_01_defeat");
                  }}
                  isSilent={isSilent}
                />
              </div>
            )}

            {/* Game Cleared Credits Screen */}
            {gameState === "credits" && (
              <div className="flex flex-col items-center justify-center bg-black border-2 border-yellow-500/50 rounded-3xl p-8 py-12 text-center h-[460px] w-full max-w-3xl overflow-hidden relative shadow-2xl my-4">
                <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
                <div className="p-3 bg-yellow-500 rounded-2xl mb-4 text-slate-950">
                  <Sparkles className="w-6 h-6 animate-spin-slow" />
                </div>
                <h1 className="text-3xl font-extrabold text-yellow-500 font-display tracking-wide uppercase">
                  {language === "es" ? "¡CAPÍTULO 1 COMPLETADO!" : "CHAPTER 1 COMPLETED!"}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-2">
                  {language === "es" ? "Has heredado el máximo poder con éxito." : "You have inherited the maximum power successfully."}
                </p>
                <div className="mt-8 space-y-2 text-center max-h-36 overflow-y-auto w-64 pr-1 text-slate-400 font-mono text-[10px] leading-relaxed">
                  <p className="font-bold text-white text-xs">{language === "es" ? "CRÉDITOS DEL CAPÍTULO" : "CHAPTER CREDITS"}</p>
                  <p>• Director / Creador: CKY</p>
                  <p>• Escritor de Historia: CKY Life Sim</p>
                  <p>• Programador de Motor: Python + Pygame Engine</p>
                  <p>• Paleta Visual: 8-Bit Pixel Art</p>
                  <p>• Banda Sonora: Mundo Silencioso</p>
                </div>
                <button
                  onClick={() => {
                    setGameState("title");
                    playSound(400, "sine", 0.2);
                  }}
                  className="mt-8 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-display font-bold rounded-xl text-xs tracking-wider transition-all"
                >
                  {language === "es" ? "REGRESAR AL MENÚ" : "RETURN TO MENU"}
                </button>
              </div>
            )}

            {/* OVERLAY MODAL: Save / Load System Modal */}
            {saveLoadModalState?.isOpen && (
              <SaveLoadModal
                language={language}
                mode={saveLoadModalState.mode}
                onClose={() => setSaveLoadModalState(null)}
                onLoadGame={handleLoadGame}
                getCurrentSavePayload={getCurrentSavePayload}
                isSilent={isSilent}
              />
            )}

            {/* OVERLAY MODAL: Dev Day Select Modal */}
            {showDevModal && (
              <DevDaySelectModal
                language={language}
                onClose={() => setShowDevModal(false)}
                onSelectDay={handleStartDevDay}
              />
            )}

            {/* OVERLAY MODAL: Next-Gen Graphics Engine Settings */}
            <GraphicsSettingsModal
              isOpen={showGraphicsModal}
              onClose={() => setShowGraphicsModal(false)}
              config={graphicsConfig}
              onChangeConfig={(newCfg) => setGraphicsConfig(newCfg)}
              language={language}
            />

            {/* OVERLAY MODAL: Android Edition & Native Install / Export */}
            <AndroidExportModal
              isOpen={showAndroidModal}
              onClose={() => setShowAndroidModal(false)}
              language={language}
            />

          </div>
        </AndroidDeviceFrame>

      </main>

      {/* Floating Toast Notifications Container */}
      {toastNotifications.length > 0 && (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {toastNotifications.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl border-2 shadow-2xl backdrop-blur-md transition-all duration-300 text-left animate-slide-in ${
                toast.color === "amber"
                  ? "bg-amber-950/95 border-amber-500 text-amber-200 shadow-amber-500/30"
                  : toast.color === "sky"
                  ? "bg-sky-950/95 border-sky-500 text-sky-200 shadow-sky-500/30"
                  : toast.color === "purple"
                  ? "bg-purple-950/95 border-purple-500 text-purple-200 shadow-purple-500/30"
                  : toast.color === "rose"
                  ? "bg-rose-950/95 border-rose-500 text-rose-200 shadow-rose-500/30"
                  : "bg-emerald-950/95 border-emerald-500 text-emerald-200 shadow-emerald-500/30"
              }`}
            >
              <div className="text-2xl p-2 bg-black/60 rounded-xl border border-white/20 shrink-0 animate-bounce">
                {toast.icon}
              </div>
              <div className="flex-1 min-w-0 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current animate-ping shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wide truncate text-white">
                    {language === "es" ? toast.titleEs : toast.titleEn}
                  </h4>
                </div>
                {(toast.subEs || toast.subEn) && (
                  <p className="text-[10px] text-slate-200/90 mt-0.5 truncate leading-tight">
                    {language === "es" ? toast.subEs : toast.subEn}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 text-xs font-mono shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Retro aesthetic margin lines info footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-4 text-center font-mono text-[9px] text-slate-500 uppercase tracking-widest px-4 flex flex-col items-center gap-1">
        <p className="text-emerald-500/80 font-bold">
          {language === "es" ? "🤖 CKY RPG • EXCLUSIVO PARA ANDROID (APK & PWA)" : "🤖 CKY RPG • EXCLUSIVE FOR ANDROID (APK & PWA)"}
        </p>
        <p className="text-slate-600">
          {language === "es" ? "Capítulo 1 Completo • Optimizado para Pantallas Táctiles y Controles Móviles" : "Chapter 1 Complete • Optimized for Touchscreens and Mobile Gamepads"}
        </p>
      </footer>

    </div>
  );
}
