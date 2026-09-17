export interface Achievement {
  id: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  icon: string;
  category: "story" | "combat" | "secrets" | "lifestyle";
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  // Story & Essentials
  {
    id: "ach_backpack",
    titleEs: "Mochila para Porquerías",
    titleEn: "Backpack for Junk",
    descEs: "Recoger la mochila de CKY del mueble de la habitación.",
    descEn: "Pick up CKY's backpack from the bedroom furniture.",
    icon: "🎒",
    category: "story",
    rarity: "common",
    xpReward: 15,
  },
  {
    id: "ach_sandwich",
    titleEs: "Amante del Salame y Queso",
    titleEn: "Salami & Cheese Lover",
    descEs: "Rescatar el sándwich favorito de CKY de la heladera.",
    descEn: "Retrieve CKY's favorite sandwich from the kitchen fridge.",
    icon: "🥪",
    category: "lifestyle",
    rarity: "common",
    xpReward: 15,
  },
  {
    id: "ach_uniform",
    titleEs: "Alumna Ejemplar",
    titleEn: "Model Student",
    descEs: "Equipar el uniforme escolar en el ropero de la habitación.",
    descEn: "Equip the school uniform from the bedroom closet.",
    icon: "👕",
    category: "story",
    rarity: "common",
    xpReward: 15,
  },
  {
    id: "ach_plant_money",
    titleEs: "Ahorro Botánico ($500)",
    titleEn: "Botanical Savings ($500)",
    descEs: "Descubrir el billete escondido en la maceta de mamá.",
    descEn: "Discover the hidden banknote in mom's flowerpot.",
    icon: "🪴",
    category: "secrets",
    rarity: "rare",
    xpReward: 25,
  },
  {
    id: "ach_angela_friend",
    titleEs: "Una Amiga del Más Allá",
    titleEn: "A Friend from Beyond",
    descEs: "Conocer a Ángela y forjar un vínculo eterno con su espíritu pícaro.",
    descEn: "Meet Angela and forge an eternal bond with her playful spirit.",
    icon: "👻",
    category: "story",
    rarity: "rare",
    xpReward: 30,
  },
  {
    id: "ach_w_towel",
    titleEs: "El Guardián Toalla",
    titleEn: "The Towel Guardian",
    descEs: "Descubrir la verdadera forma de W durmiendo en la silla como toalla.",
    descEn: "Discover W's true celestial guardian form resting on the chair.",
    icon: "🛡️",
    category: "story",
    rarity: "rare",
    xpReward: 30,
  },
  {
    id: "ach_golem_slayer",
    titleEs: "Demoledora de Roca",
    titleEn: "Rock Demolisher",
    descEs: "Derrotar al colosal Golem Guardián en el Valle de las Ruinas.",
    descEn: "Defeat the colossal Guardian Golem in the Valley of Ruins.",
    icon: "🗿",
    category: "combat",
    rarity: "epic",
    xpReward: 50,
  },
  {
    id: "ach_shovel_treasure",
    titleEs: "Fiebre del Oro ($50.000)",
    titleEn: "Gold Rush ($50,000)",
    descEs: "Desenterrar el tesoro ancestral con W transformado en Pala Sagrada.",
    descEn: "Dig up the ancestral treasure chest with W transformed into Holy Shovel.",
    icon: "💰",
    category: "secrets",
    rarity: "epic",
    xpReward: 60,
  },
  {
    id: "ach_shopping_queen",
    titleEs: "Reina del Shopping",
    titleEn: "Shopping Queen",
    descEs: "Adquirir prendas de alta costura o lencería en el Centro Comercial.",
    descEn: "Purchase haute couture outfits or lingerie at the Shopping Mall.",
    icon: "👗",
    category: "lifestyle",
    rarity: "rare",
    xpReward: 35,
  },
  {
    id: "ach_french_perfume",
    titleEs: "Aura Francesa de Lujo",
    titleEn: "French Luxury Aura",
    descEs: "Comprar y colocarse el perfume exclusivo 'Nuit Éthérée'.",
    descEn: "Buy and apply the exclusive 'Nuit Éthérée' French perfume.",
    icon: "🌸",
    category: "lifestyle",
    rarity: "rare",
    xpReward: 35,
  },
  {
    id: "ach_soulmate_chosen",
    titleEs: "El Hilo del Destino",
    titleEn: "Thread of Destiny",
    descEs: "Encontrarse con Alanis y forjar el destino de tu Alma Gemela.",
    descEn: "Encounter Alanis and weave the destiny of your Soulmate.",
    icon: "💫",
    category: "story",
    rarity: "rare",
    xpReward: 40,
  },
  {
    id: "ach_clean_house",
    titleEs: "Tornado Doméstico",
    titleEn: "Domestic Whirlwind",
    descEs: "Erradicar las cucarachas, arañas y rata con W en el Domingo de Limpieza.",
    descEn: "Eradicate the roaches, spiders, and rat with W on Deep Cleaning Sunday.",
    icon: "🧹",
    category: "combat",
    rarity: "epic",
    xpReward: 50,
  },
  {
    id: "ach_sexy_photos",
    titleEs: "Sesión Prohibida",
    titleEn: "Forbidden Photoshoot",
    descEs: "Posar en lencería roja para la cámara con W tapándose los ojos.",
    descEn: "Pose in crimson lace lingerie while W modestly covers his eyes.",
    icon: "📸",
    category: "lifestyle",
    rarity: "epic",
    xpReward: 50,
  },
  {
    id: "ach_soccer_hero",
    titleEs: "Crack del Potrero",
    titleEn: "Soccer Star",
    descEs: "Liberar a Mateo de la posesión o ganar la tanda de penales en el patio.",
    descEn: "Free Mateo from possession or win the penalty shootout in the school courtyard.",
    icon: "⚽",
    category: "combat",
    rarity: "epic",
    xpReward: 50,
  },
  {
    id: "ach_basement_alchemist",
    titleEs: "Purificación del Laboratorio",
    titleEn: "Laboratory Purification",
    descEs: "Cruzar el laberinto del sótano y derrotar al Alquimista Oscuro.",
    descEn: "Navigate the basement labyrinth and defeat the Dark Alchemist.",
    icon: "🧪",
    category: "combat",
    rarity: "epic",
    xpReward: 60,
  },
  {
    id: "ach_lingerie_show",
    titleEs: "El Desfile de la Furia",
    titleEn: "The Runway of Fury",
    descEs: "Desfilar con lencería roja en casa del gemelo para arrancarle los secretos.",
    descEn: "Strut in crimson lingerie at the soulmate's house to pry open his secrets.",
    icon: "👠",
    category: "story",
    rarity: "epic",
    xpReward: 50,
  },
  {
    id: "ach_supernova_climax",
    titleEs: "Supernova Cósmica",
    titleEn: "Cosmic Supernova",
    descEs: "Desatar el poder absoluto del linaje ante la traición final en la calle.",
    descEn: "Unleash absolute lineage power against the final betrayal in the street.",
    icon: "💥",
    category: "combat",
    rarity: "legendary",
    xpReward: 100,
  },
  {
    id: "ach_normal_girl",
    titleEs: "Chica Normal y Libre",
    titleEn: "Normal & Free Girl",
    descEs: "Renunciar a la corona celestial ante Alanis y elegir tu propia vida.",
    descEn: "Renounce the celestial mantle before Alanis and choose your own path.",
    icon: "🕊️",
    category: "story",
    rarity: "legendary",
    xpReward: 100,
  },
  {
    id: "ach_master_chef",
    titleEs: "Chef Gourmet de CKY",
    titleEn: "CKY's Master Chef",
    descEs: "Preparar un sándwich perfecto con 3 estrellas en el Taller de la Cocina.",
    descEn: "Prepare a perfect 3-star sandwich at the Kitchen Crafting Station.",
    icon: "👨‍🍳",
    category: "lifestyle",
    rarity: "rare",
    xpReward: 40,
  },
  {
    id: "ach_peaceful_life",
    titleEs: "Vida Pacífica",
    titleEn: "Peaceful Life",
    descEs: "Disfrutar del Epílogo post-juego en el colegio y la ciudad sin sombras.",
    descEn: "Enjoy the post-game Free Roam epilogue across peaceful school & town.",
    icon: "🌅",
    category: "secrets",
    rarity: "legendary",
    xpReward: 80,
  },
  // Extra Comedy & Daily Life Antics Achievements
  {
    id: "ach_tv_turca",
    titleEs: "Adicción a las Novelas",
    titleEn: "Soap Opera Addict",
    descEs: "Engancharse con el drama interminable de la novela turca en la tele del living.",
    descEn: "Get hooked on the never-ending Turkish soap opera drama on the living room TV.",
    icon: "📺",
    category: "lifestyle",
    rarity: "common",
    xpReward: 20,
  },
  {
    id: "ach_limon_fosil",
    titleEs: "Arqueóloga de Heladera",
    titleEn: "Fridge Archaeologist",
    descEs: "Descubrir el medio limón prehistórico y el yogur mutante en la heladera de mamá.",
    descEn: "Discover the prehistoric dried lemon and mutant yogurt in mom's fridge.",
    icon: "🍋",
    category: "secrets",
    rarity: "common",
    xpReward: 20,
  },
  {
    id: "ach_filosofia_trono",
    titleEs: "El Pensador de Rodin",
    titleEn: "The Bathroom Thinker",
    descEs: "Tener una epifanía filosófica existencial sentado en la tapa del inodoro.",
    descEn: "Have an existential philosophical epiphany sitting on the toilet lid.",
    icon: "🚽",
    category: "lifestyle",
    rarity: "common",
    xpReward: 20,
  },
  {
    id: "ach_troll_limbo",
    titleEs: "Terror del Call Center",
    titleEn: "Call Center Terror",
    descEs: "Trolear al telemarketer del Limbo en el chat del celular.",
    descEn: "Troll the Limbo underworld telemarketer on phone chat.",
    icon: "📞",
    category: "secrets",
    rarity: "rare",
    xpReward: 25,
  },
  {
    id: "ach_familia_chat",
    titleEs: "Cadena de Bendiciones",
    titleEn: "Chain of Blessings",
    descEs: "Sobrevivir a los stickers y las cadenas de WhatsApp del grupo familiar.",
    descEn: "Survive the glitter stickers and WhatsApp chains in the family group.",
    icon: "👪",
    category: "lifestyle",
    rarity: "common",
    xpReward: 20,
  },
  {
    id: "ach_chachara_angela",
    titleEs: "Dúo Dinámico del Chusmerío",
    titleEn: "Banter Queens",
    descEs: "Escuchar las ocurrencias y bromas sin filtro de Ángela y W al explorar.",
    descEn: "Listen to Angela and W's hilarious unfiltered quips while exploring.",
    icon: "💬",
    category: "lifestyle",
    rarity: "common",
    xpReward: 25,
  },
  {
    id: "ach_sexshop_astral",
    titleEs: "Expedición Prohibida",
    titleEn: "Forbidden Expedition",
    descEs: "Acompañar a Ángela al sex shop y evitar que W rete a duelo a los maniquíes.",
    descEn: "Accompany Angela to the adult store and keep W from dueling mannequins.",
    icon: "🛍️",
    category: "secrets",
    rarity: "epic",
    xpReward: 50,
  },
  {
    id: "ach_pijama_party_red",
    titleEs: "Reina de la Lencería",
    titleEn: "Lingerie Queen",
    descEs: "Desfilar en lencería roja de encaje en la pijama party descontrolada.",
    descEn: "Strut in red lace lingerie during the chaotic girls sleepover.",
    icon: "👙",
    category: "lifestyle",
    rarity: "rare",
    xpReward: 40,
  },
  {
    id: "ach_alanis_dni",
    titleEs: "Diosa con Cédula",
    titleEn: "Goddess with ID",
    descEs: "Ayudar a la deidad cósmica Alanis a tramitar su DNI en el Registro Civil.",
    descEn: "Help cosmic deity Alanis obtain a human ID card at the Civil Registry.",
    icon: "📋",
    category: "secrets",
    rarity: "epic",
    xpReward: 50,
  },
  {
    id: "ach_pool_bikini_escape",
    titleEs: "Sirena en Apuros",
    titleEn: "Mermaid in Distress",
    descEs: "Sobrevivir al bikini rebelde en la pileta con el escudo protector de W.",
    descEn: "Survive the wardrobe malfunction at the pool with W's kickboard shield.",
    icon: "🏊‍♀️",
    category: "lifestyle",
    rarity: "rare",
    xpReward: 40,
  },
  {
    id: "ach_disco_devil_queen",
    titleEs: "Diablita del Boliche",
    titleEn: "Club Devil Queen",
    descEs: "Romper la pista de baile vestida de diablita y ganar el trofeo del concurso.",
    descEn: "Tear up the dance floor dressed as a spicy devil and win the trophy.",
    icon: "👠",
    category: "secrets",
    rarity: "legendary",
    xpReward: 60,
  },
  {
    id: "ach_selfie_panic_saved",
    titleEs: "Salvada por el Wi-Fi",
    titleEn: "Saved by the Wi-Fi",
    descEs: "Borrar la foto provocativa enviada por error al grupo escolar en tiempo récord.",
    descEn: "Delete the accidental spicy selfie from the school chat in record time.",
    icon: "📸",
    category: "secrets",
    rarity: "epic",
    xpReward: 50,
  },
];

const STORAGE_PREFIX = "cky_ach_";

export function getUnlockedAchievementIds(): Set<string> {
  const unlocked = new Set<string>();
  for (const ach of ACHIEVEMENTS_LIST) {
    if (localStorage.getItem(`${STORAGE_PREFIX}${ach.id}`) === "true") {
      unlocked.add(ach.id);
    }
  }

  // Retroactive automatic validation based on existing game flags
  if (localStorage.getItem("cky_backpack_taken") === "true") unlocked.add("ach_backpack");
  if (localStorage.getItem("cky_fridge_sandwich_taken") === "true" || localStorage.getItem("cky_stats_hambre")) unlocked.add("ach_sandwich");
  if (localStorage.getItem("cky_has_uniform_xp") === "true") unlocked.add("ach_uniform");
  if (localStorage.getItem("cky_mom_plant_money_taken") === "true") unlocked.add("ach_plant_money");
  if (localStorage.getItem("cky_angela_meeting_done") === "true" || localStorage.getItem("cky_day2_completed") === "true") unlocked.add("ach_angela_friend");
  if (localStorage.getItem("cky_w_meeting_done") === "true" || localStorage.getItem("cky_day3_completed") === "true") unlocked.add("ach_w_towel");
  if (localStorage.getItem("cky_day4_golem_defeated") === "true") unlocked.add("ach_golem_slayer");
  if (localStorage.getItem("cky_day4_treasure_dug") === "true") unlocked.add("ach_shovel_treasure");
  if (localStorage.getItem("cky_bought_lingerie_sexy") === "true" || localStorage.getItem("cky_bought_pajamas_silk") === "true" || localStorage.getItem("cky_bought_dress_gala") === "true") unlocked.add("ach_shopping_queen");
  if (localStorage.getItem("cky_bought_french_perfume") === "true") unlocked.add("ach_french_perfume");
  if (localStorage.getItem("cky_soulmate_created") === "true") unlocked.add("ach_soulmate_chosen");
  if (localStorage.getItem("cky_day5_cleaning_done") === "true") unlocked.add("ach_clean_house");
  if (localStorage.getItem("cky_day5_photos_taken") === "true") unlocked.add("ach_sexy_photos");
  if (localStorage.getItem("cky_day6_soccer_done") === "true") unlocked.add("ach_soccer_hero");
  if (localStorage.getItem("cky_day7_lab_boss_defeated") === "true") unlocked.add("ach_basement_alchemist");
  if (localStorage.getItem("cky_day7_lingerie_show_done") === "true") unlocked.add("ach_lingerie_show");
  if (localStorage.getItem("cky_day8_confrontation_done") === "true") unlocked.add("ach_supernova_climax");
  if (localStorage.getItem("cky_day8_alanis_bedroom_done") === "true") unlocked.add("ach_normal_girl");
  if (localStorage.getItem("cky_sandwich_master_cooked") === "true") unlocked.add("ach_master_chef");
  if (localStorage.getItem("cky_peaceful_free_roam") === "true") unlocked.add("ach_peaceful_life");

  return unlocked;
}

export function unlockAchievement(
  id: string,
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void,
  onAddXP?: (amount: number) => void
): boolean {
  const ach = ACHIEVEMENTS_LIST.find((a) => a.id === id);
  if (!ach) return false;

  const alreadyUnlocked = localStorage.getItem(`${STORAGE_PREFIX}${id}`) === "true";
  if (alreadyUnlocked) return false;

  localStorage.setItem(`${STORAGE_PREFIX}${id}`, "true");
  localStorage.setItem(`${STORAGE_PREFIX}${id}_date`, new Date().toISOString());

  if (onAddXP && ach.xpReward > 0) {
    onAddXP(ach.xpReward);
  }

  if (onShowNotification) {
    onShowNotification({
      icon: ach.icon,
      titleEs: `🏆 ¡LOGRO: ${ach.titleEs.toUpperCase()}!`,
      titleEn: `🏆 ACHIEVEMENT: ${ach.titleEn.toUpperCase()}!`,
      subEs: `${ach.descEs} (+${ach.xpReward} XP)`,
      subEn: `${ach.descEn} (+${ach.xpReward} XP)`,
      color: "amber",
    });
  }

  return true;
}
