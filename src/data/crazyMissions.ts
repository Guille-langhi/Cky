// src/data/crazyMissions.ts
// Catálogo completo de Misiones Locas y Picantes del Modo Libre (Post-Game)

export interface CrazyMissionDialogueStep {
  speaker: string;
  avatar: string;
  textEs: string;
  textEn: string;
}

export interface CrazyMission {
  id: string;
  character: string; // "angela", "w", "mama", "vecina", "alanis", "bobby", "colectivero", "escuela", "grupo"
  characterNameEs: string;
  characterNameEn: string;
  characterAvatar: string;
  titleEs: string;
  titleEn: string;
  badgeEs: string;
  badgeEn: string;
  category: "picante" | "comedia" | "sobrenatural" | "barrial";
  icon: string;
  summaryEs: string;
  summaryEn: string;
  stepsEs: string[];
  stepsEn: string[];
  dialoguePreview: CrazyMissionDialogueStep[];
  rewardXP: number;
  rewardMoney: number;
  achievementId?: string;
}

export const CRAZY_MISSIONS: CrazyMission[] = [
  // ===================== ÁNGELA =====================
  {
    id: "m_angela_sexshop",
    character: "angela",
    characterNameEs: "Ángela (Espíritu)",
    characterNameEn: "Angela (Spirit)",
    characterAvatar: "👻",
    titleEs: "Expedición al Sex Shop 'La Cueva del Placer Astral'",
    titleEn: "Expedition to 'Astral Pleasure' Sex Shop",
    badgeEs: "🔥 Misión Picante",
    badgeEn: "🔥 Spicy Mission",
    category: "picante",
    icon: "🛍️",
    summaryEs: "Ángela insiste en que CKY necesita expandir sus horizontes y arrastra al grupo a una tienda para adultos oculta en la galería céntrica. W confunde las esposas de peluche con artefactos de tortura medieval.",
    summaryEn: "Angela drags the group to an adult boutique in the downtown arcade. W mistakes plush handcuffs for medieval interrogation torture relics.",
    stepsEs: [
      "Hablar con Ángela en la galería céntrica para planear la infiltración.",
      "Entrar al sex shop mientras CKY se pone roja como un tomate.",
      "Impedir que W rete a duelo al maniquí con lencería de cuero.",
      "Elegir un accesorio a control remoto para trolear a los vecinos a distancia."
    ],
    stepsEn: [
      "Talk to Angela at the downtown gallery to plan entry.",
      "Enter the adult boutique as CKY blushes bright red.",
      "Stop W from dueling the leather lingerie mannequin.",
      "Pick a remote-control gadget to prank neighbors from afar."
    ],
    dialoguePreview: [
      {
        speaker: "Ángela",
        avatar: "👻",
        textEs: "¡Dale CKY, no seas monja de clausura! Mirá esa vidriera... ¡necesitamos comprar algo que vibre y haga luces de neón!",
        textEn: "Come on CKY, don't be a cloistered nun! Look at that window... we need something that vibrates and flashes neon lights!"
      },
      {
        speaker: "CKY",
        avatar: "👧",
        textEs: "¡Ángela bajá la voz por el amor de Dios! La cajera nos está mirando y W se puso a rezar en latín contra una fusta de terciopelo...",
        textEn: "Angela lower your voice for the love of God! The cashier is staring and W is reciting Latin prayers at a velvet crop..."
      },
      {
        speaker: "W (Guardián)",
        avatar: "🛡️",
        textEs: "¡Alerta sagrada! Estos artefactos eróticos contienen una densidad mágica prohibida por el Concilio Astral de las Sombras...",
        textEn: "Sacred alert! These erotic contraptions harbor magical densities forbidden by the Astral Council of Shadows..."
      }
    ],
    rewardXP: 350,
    rewardMoney: 1500,
    achievementId: "ach_sexshop_astral"
  },
  {
    id: "m_angela_kissing_class",
    character: "angela",
    characterNameEs: "Ángela (Espíritu)",
    characterNameEn: "Angela (Spirit)",
    characterAvatar: "👻",
    titleEs: "El Taller Clandestino de Besos de Ángela (Nivel Avanzado)",
    titleEn: "Angela's Underground Kissing Workshop (Master Class)",
    badgeEs: "💋 Picante & Cómico",
    badgeEn: "💋 Spicy & Funny",
    category: "picante",
    icon: "💋",
    summaryEs: "Para que nadie vuelva a criticar cómo besa CKY, Ángela arma un entrenamiento intensivo con frutas exóticas y crema. Mamá entra de golpe a la pieza y encuentra a su hija en pleno simulacro apasionado con un durazno.",
    summaryEn: "Angela sets up an intensive training course with fruits and cream. Mom bursts in finding CKY passionately making out with a peach.",
    stepsEs: [
      "Comprar 1 manzana, 1 ciruela jugosa y un durazno en la verdulería.",
      "Cerrar la puerta con traba en la habitación de CKY.",
      "Practicar ritmo de labios, presión y mordisquito suave con la fruta.",
      "Explicarle a Mamá por qué hay fruta mordisqueada y crema en el espejo."
    ],
    stepsEn: [
      "Buy apples, juicy plums and a peach at the greengrocer.",
      "Lock CKY's bedroom door tight.",
      "Practice lip rhythm, pressure, and gentle nibbles with fruit.",
      "Explain to Mom why there's bitten fruit and cream on the mirror."
    ],
    dialoguePreview: [
      {
        speaker: "Ángela",
        avatar: "👻",
        textEs: "¡Menos diente y más lengua, CKY! Un beso apasionado es una sinfonía, ¡no una licuadora de pastelería!",
        textEn: "Less teeth, more tongue CKY! A passionate kiss is a symphony, not a pastry blender!"
      },
      {
        speaker: "Mamá",
        avatar: "👩",
        textEs: "¡¿Pero qué carancho hacés besando ese durazno con los ojos cerrados?! ¡Por la Virgen del Valle, me da un síncope!",
        textEn: "What on earth are you doing kissing that peach with your eyes shut?! Holy Virgin, I'm having a stroke!"
      }
    ],
    rewardXP: 300,
    rewardMoney: 1200
  },
  {
    id: "m_angela_lingerie_party",
    character: "angela",
    characterNameEs: "Ángela (Espíritu)",
    characterNameEn: "Angela (Spirit)",
    characterAvatar: "👻",
    titleEs: "Pijama Party Descontrolada: Verdad, Consecuencia y Lencería",
    titleEn: "Wild Sleepover: Truth, Dare and Lingerie",
    badgeEs: "🔥 Desmadre Femenino",
    badgeEn: "🔥 Girl Chaos",
    category: "picante",
    icon: "👙",
    summaryEs: "Noche de chicas en la habitación de CKY con Jaz y Abril. Ángela controla la botella de Verdad o Consecuencia y CKY debe desfilar en lencería roja sexy con tacones justo cuando llega la pizza.",
    summaryEn: "Girls sleepover with Jaz and Abril. Angela rigs the Truth or Dare bottle forcing CKY to model sexy red lingerie right as pizza arrives.",
    stepsEs: [
      "Reunir a las chicas en la habitación y poner música bailable.",
      "Girar la botella espectral de Ángela para las preguntas indiscretas.",
      "Ponerse la lencería roja de encaje y desfilar por el pasillo.",
      "Atender al repartidor de pizzas antes de que se entere todo el barrio."
    ],
    stepsEn: [
      "Gather girls in the bedroom and play dance tunes.",
      "Spin Angela's spectral bottle for intrusive questions.",
      "Don the red lace lingerie and strut the hallway.",
      "Answer the pizza delivery guy before the block finds out."
    ],
    dialoguePreview: [
      {
        speaker: "Jaz",
        avatar: "👧",
        textEs: "¡CKY te juro que con ese conjunto de encaje te desmayás a media escuela secundaria!",
        textEn: "CKY I swear in that lace set you'd knock out half the high school!"
      },
      {
        speaker: "W (Guardián)",
        avatar: "🛡️",
        textEs: "¡Mis ojos celestiales arden! ¡Solicito a las Pléyades una venda de castidad inmediata!",
        textEn: "My celestial eyes burn! I plead the Pleiades for an immediate blindfold of chastity!"
      }
    ],
    rewardXP: 400,
    rewardMoney: 2000,
    achievementId: "ach_pijama_party_red"
  },

  // ===================== W (EL GUARDIÁN) =====================
  {
    id: "m_w_library",
    character: "w",
    characterNameEs: "W (Guardián Ancestral)",
    characterNameEn: "W (Ancestral Guardian)",
    characterAvatar: "🛡️",
    titleEs: "El Templo Prohibido de Alejandría... o sea, la Biblioteca Municipal",
    titleEn: "The Forbidden Temple of Alexandria... aka City Library",
    badgeEs: "📚 Erudición Absurda",
    badgeEn: "📚 Absurd Erudition",
    category: "comedia",
    icon: "📖",
    summaryEs: "W siente que la juventud mortal ha perdido el intelecto y lleva al grupo a la biblioteca del pueblo. Se desespera con los grafitis en los libros escolares e intenta retar a duelo a un chico que masca chicle haciendo globos ruidosos.",
    summaryEn: "W feels modern youth lacks intellect and escorts the group to the city library. He is horrified by desk graffiti and challenges a bubblegum-chewing kid to a duel.",
    stepsEs: [
      "Entrar a la Biblioteca Municipal en estricto silencio militar.",
      "Ayudar a W a buscar el Tomo V de Geometría Cuántica de 1974.",
      "Evitar que W desenvaine su espada astral contra el que masca chicle.",
      "Firmar el carnet de socia con la bibliotecaria de anteojos."
    ],
    stepsEn: [
      "Enter the City Library in strict military stealth.",
      "Help W locate the 1974 Quantum Geometry Volume V.",
      "Prevent W from drawing an astral blade on the chewing-gum kid.",
      "Sign the library card with the spectacles librarian."
    ],
    dialoguePreview: [
      {
        speaker: "W (Guardián)",
        avatar: "🛡️",
        textEs: "¡Callad, villano del látex masticable! ¡Vuestra estruendosa pompa de goma profana el templo del saber!",
        textEn: "Silence, scoundrel of chewable latex! Thy thunderous bubble profanes this temple of wisdom!"
      },
      {
        speaker: "CKY",
        avatar: "👧",
        textEs: "¡W por favor guardá la espada que nos va a echar la señora con el matamoscas!",
        textEn: "W please put away the blade or the lady with the flyswatter is gonna kick us out!"
      }
    ],
    rewardXP: 320,
    rewardMoney: 800
  },
  {
    id: "m_w_gym",
    character: "w",
    characterNameEs: "W (Guardián Ancestral)",
    characterNameEn: "W (Ancestral Guardian)",
    characterAvatar: "🛡️",
    titleEs: "El Ritual del Guerrero en el Gimnasio 'Puro Músculo'",
    titleEn: "Warrior's Ritual at 'Pure Muscle' Barrio Gym",
    badgeEs: "🏋️‍♂️ Fuerza Absurda",
    badgeEn: "🏋️‍♂️ Absurd Strength",
    category: "comedia",
    icon: "💪",
    summaryEs: "W decide que CKY y sus amigos necesitan entrenamiento marcial romano. Se transforma en una mancuerna dorada celestial que nadie en el gimnasio puede levantar.",
    summaryEn: "W decides CKY needs Roman military conditioning. He shapeshifts into a golden celestial dumbbell that no bodybuilder can budge.",
    stepsEs: [
      "Ponerse la ropa deportiva en el vestuario del gimnasio.",
      "Subirse a la cinta de correr a velocidad máxima sin salir volando.",
      "Dejar que W se transforme en la mancuerna dorada en la zona de pesas.",
      "Ver cómo los fisicoculturistas se dislocan el orgullo intentando mover a W."
    ],
    stepsEn: [
      "Change into athletic wear in the gym locker room.",
      "Hop on the treadmill at max speed without flying off.",
      "Let W shapeshift into the golden dumbbell by the free weights.",
      "Watch bodybuilders dislocate their pride trying to budge W."
    ],
    dialoguePreview: [
      {
        speaker: "W (Guardián)",
        avatar: "🛡️",
        textEs: "¡He calibrado mi densidad en 400 quintales celestiales! ¡Aquel mortal de camiseta musculosa no posee fibra heroica!",
        textEn: "I have calibrated my mass to 400 celestial quintals! Yonder mortal in a tank-top lacks heroic fiber!"
      }
    ],
    rewardXP: 350,
    rewardMoney: 1000
  },
  {
    id: "m_w_supermarket",
    character: "w",
    characterNameEs: "W (Guardián Ancestral)",
    characterNameEn: "W (Ancestral Guardian)",
    characterAvatar: "🛡️",
    titleEs: "La Gran Cruzada del Supermercado Mayorista",
    titleEn: "The Grand Crusade of the Wholesale Supermarket",
    badgeEs: "🛒 Batalla de Ofertas",
    badgeEn: "🛒 Bargain Warfare",
    category: "comedia",
    icon: "🛒",
    summaryEs: "W escolta a CKY a hacer las compras del mes en el supermercado mayorista, tratando al changuito como una cuadriga de guerra y entrando en pánico ante los desodorantes en aerosol creyendo que son armas químicas.",
    summaryEn: "W escorts CKY on monthly grocery shopping, treating the cart like a chariot and panicking over aerosol cans thinking they are alchemical weapons.",
    stepsEs: [
      "Montar la cuadriga (changuito con una rueda que gira sola).",
      "Esquivar señoras expertas en la góndola de fideos en oferta.",
      "Neutralizar el susto de W en el pasillo de aerosoles y perfumería.",
      "Pasar por la caja 3 y conseguir caramelos de vuelto en vez de monedas."
    ],
    stepsEn: [
      "Mount the chariot (shopping cart with a wonky wheel).",
      "Dodge veteran grandmas in the pasta discount aisle.",
      "Calm W's panic in the aerosol deodorants department.",
      "Pass checkout line 3 and receive hard candy as change."
    ],
    dialoguePreview: [
      {
        speaker: "W (Guardián)",
        avatar: "🛡️",
        textEs: "¡A cubierto Señora CKY! ¡Esa lata cilíndrica de desodorante emite niebla venenosa con aroma a lavanda salvaje!",
        textEn: "Take cover Lady CKY! That cylindrical canister unleashes toxic vapor scented with wild lavender!"
      }
    ],
    rewardXP: 310,
    rewardMoney: 1100
  },

  // ===================== MAMÁ =====================
  {
    id: "m_mama_bank_queue",
    character: "mama",
    characterNameEs: "Mamá (Jefa Suprema)",
    characterNameEn: "Mom (Supreme Boss)",
    characterAvatar: "👩",
    titleEs: "La Fila del Banco de las 6:00 AM y los Jubilados Ninja",
    titleEn: "The 6:00 AM Bank Queue and Ninja Seniors",
    badgeEs: "☕ Sufrimiento Matutino",
    badgeEn: "☕ Morning Ordeal",
    category: "barrial",
    icon: "🏦",
    summaryEs: "Mamá manda a CKY a hacer la cola del banco con una carpeta llena de boletas arrugadas antes de que amanezca. Hay que evitar que los jubilados se cuelen con excusas milenarias.",
    summaryEn: "Mom dispatches CKY to hold a spot in the early morning bank queue with wrinkled utility bills, evading queue-cutting grandpas.",
    stepsEs: [
      "Llegar al banco con frío polar y termo de café con leche.",
      "Defender el puesto 4 de la fila ante la señora que 'guardaba lugar para el nieto'.",
      "Dejar que Ángela desacomode los números del dispenser de turnos.",
      "Pagar las facturas de gas y luz y volver con el sello de pagado."
    ],
    stepsEn: [
      "Arrive at the bank in freezing mist with a coffee thermos.",
      "Defend spot #4 against the granny 'holding a spot for her grandson'.",
      "Let Angela shuffle the ticket dispenser numbers.",
      "Pay gas and electric bills and bring back stamped receipts."
    ],
    dialoguePreview: [
      {
        speaker: "Mamá",
        avatar: "👩",
        textEs: "¡Si te descuidás dos segundos esa señora de tapado te pasa por arriba con el andador! ¡Firmeza CKY!",
        textEn: "If you blink for two seconds that lady in the trench coat will run you over with her walker! Stand firm CKY!"
      }
    ],
    rewardXP: 300,
    rewardMoney: 1500
  },
  {
    id: "m_mama_tupper_party",
    character: "mama",
    characterNameEs: "Mamá (Jefa Suprema)",
    characterNameEn: "Mom (Supreme Boss)",
    characterAvatar: "👩",
    titleEs: "Tarde de Tupper-Sex y Cremas Antiarrugas en el Living",
    titleEn: "Tupper-Sex & Anti-Aging Creams Afternoon in the Parlor",
    badgeEs: "🔥 Chusmerío Total",
    badgeEn: "🔥 Pure Gossip",
    category: "picante",
    icon: "🧴",
    summaryEs: "Mamá organiza una reunión de cosméticos y productos íntimos con las tías del barrio. W se camufla como agarradera y casi lo usan para sacar una empanada hirviendo del horno.",
    summaryEn: "Mom hosts a cosmetics and intimate novelty party for barrio aunts. W camouflages as a potholder and is nearly scorched grabbing hot pies.",
    stepsEs: [
      "Preparar la mesa ratona con masitas secas y té de boldo.",
      "Evitar que Ángela le meta pimienta y canela al té de las señoras.",
      "Salvar a W de las manos de Tía Pocha antes de que lo use de servilleta.",
      "Sobrevivir a los intentos de las señoras de buscarle novio a CKY."
    ],
    stepsEn: [
      "Set the coffee table with butter cookies and boldo tea.",
      "Stop Angela from spiking the tea with hot pepper.",
      "Rescue W from Aunt Pocha before he's used as a napkin.",
      "Survive aunts relentlessly trying to set CKY up with their nephews."
    ],
    dialoguePreview: [
      {
        speaker: "Tía Pocha",
        avatar: "👵",
        textEs: "¡Ay nena, mirá este catálogo! ¡Con esta crema reductora quedás hecha una vedette de teatro de revistas!",
        textEn: "Oh dear look at this catalog! With this slimming cream you'll look like a revue theater showgirl!"
      }
    ],
    rewardXP: 380,
    rewardMoney: 1800
  },

  // ===================== LA VECINA =====================
  {
    id: "m_vecina_gossip_truce",
    character: "vecina",
    characterNameEs: "Vecina Paula (Ex-Villana)",
    characterNameEn: "Neighbor Paula (Ex-Villain)",
    characterAvatar: "🦹‍♀️",
    titleEs: "La Tregua del Chisme Vecinal con Prismáticos",
    titleEn: "The Barrio Gossip Truce with Binoculars",
    badgeEs: "👀 Espionaje Suburbano",
    badgeEn: "👀 Suburban Recon",
    category: "barrial",
    icon: "🪴",
    summaryEs: "La Vecina propone una tregua para usar sus poderes menores y prismáticos de teatro para investigar qué esconde el carnicero de la esquina en el freezer secreto.",
    summaryEn: "The Neighbor calls a temporary truce, using minor hexes and opera glasses to investigate what the butcher hides in his secret freezer.",
    stepsEs: [
      "Asomarse al ligustro con la Vecina sin que los perros ladren.",
      "Usar los prismáticos para espiar el patio del carnicero.",
      "Descubrir que solo estaba escondiendo una caja de helado de dulce de leche.",
      "Compartir una taza de café con la Vecina admitiendo que como espías son un desastre."
    ],
    stepsEn: [
      "Peer through the hedge with the Neighbor without barking dogs.",
      "Use opera binoculars to scan the butcher's yard.",
      "Discover he was merely hiding a secret tub of caramel ice cream.",
      "Share a cup of coffee with Paula admitting you make terrible spies."
    ],
    dialoguePreview: [
      {
        speaker: "Vecina Paula",
        avatar: "🦹‍♀️",
        textEs: "Seré una bruja del Limbo retirada, CKY, pero el instinto de chusma de barrio no me lo quita ni una supernova cósmica.",
        textEn: "I may be a retired Limbo sorceress CKY, but not even a cosmic supernova can strip my barrio gossip instincts."
      }
    ],
    rewardXP: 340,
    rewardMoney: 1200
  },
  {
    id: "m_vecina_yoga_rage",
    character: "vecina",
    characterNameEs: "Vecina Paula (Ex-Villana)",
    characterNameEn: "Neighbor Paula (Ex-Villain)",
    characterAvatar: "🦹‍♀️",
    titleEs: "Terapia de Manejo de la Ira para Brujas del Suburbio",
    titleEn: "Anger Management Yoga for Suburban Witches",
    badgeEs: "🧘‍♀️ Paz Imposible",
    badgeEn: "🧘‍♀️ Impossible Peace",
    category: "comedia",
    icon: "🧘‍♀️",
    summaryEs: "Para que no vuelva a abrir grietas oscuras cada vez que se estresa con los impuestos, CKY y Ángela la llevan a una clase de yoga en la plaza. Cada vez que el instructor dice 'suelten el rencor', a la vecina le salen chispas moradas.",
    summaryEn: "To stop her from ripping rifts over tax bills, CKY and Angela enroll Paula in park yoga. Every time the instructor says 'let go of resentment', purple sparks fly.",
    stepsEs: [
      "Extender la colchoneta de yoga en el pasto de la plaza.",
      "Contener a la Vecina en la postura del 'Guerrero Celestial'.",
      "Apagar las chispas oscuras cuando Bobby el caniche se acerca a mearle la esterilla.",
      "Aceptar que la única relajación de la Vecina es tejer bufandas escuchando radio."
    ],
    stepsEn: [
      "Unroll the yoga mat on the park lawn.",
      "Keep Paula stable during the 'Warrior' pose.",
      "Douse dark embers when Bobby the dog approaches her mat.",
      "Accept Paula's true relaxation is knitting scarves to AM radio."
    ],
    dialoguePreview: [
      {
        speaker: "Instructor Yoga",
        avatar: "🧘",
        textEs: "Inhalen luz y paz... exhalen el odio... ¡Señora, por qué su aura está prendiendo fuego las margaritas!",
        textEn: "Inhale light and calm... exhale hatred... Ma'am, why is your aura setting the daisies on fire?!"
      }
    ],
    rewardXP: 360,
    rewardMoney: 1300
  },

  // ===================== ALANIS =====================
  {
    id: "m_alanis_dni_bureaucracy",
    character: "alanis",
    characterNameEs: "Alanis (Entidad Suprema)",
    characterNameEn: "Alanis (Supreme Deity)",
    characterAvatar: "🕊️",
    titleEs: "Alanis Descubre el Trámite del DNI y la Burocracia Mortal",
    titleEn: "Alanis Discovers ID Bureaucracy and Mortal Paperwork",
    badgeEs: "🏛️ Divinidad en Trámites",
    badgeEn: "🏛️ Divine Paperwork",
    category: "sobrenatural",
    icon: "📋",
    summaryEs: "Alanis quiere una cédula de identidad civil humana para comprender la condición terrenal. Su resplandor celestial quema tres cámaras web y no entiende por qué los dioses deben sacar número en la ventanilla 4.",
    summaryEn: "Alanis seeks human civil papers. Her radiant celestial glow fries three webcams and she struggles with waiting for ticket #4.",
    stepsEs: [
      "Sacar número en el tótem táctil del Registro Civil municipal.",
      "Atenuar el halo sagrado de Alanis con un paraguas para la foto digital.",
      "Explicarle que no puede poner 'Inmortal Omnipresente' en estado civil.",
      "Celebrar el DNI humano provisorio con dos alfajores de maicena."
    ],
    stepsEn: [
      "Pull a queue ticket at the civil registry kiosk.",
      "Dim Alanis's divine halo using an umbrella for the camera.",
      "Explain she cannot write 'Omnipresent Immortal' as marital status.",
      "Celebrate her interim ID card with two cornstarch alfajores."
    ],
    dialoguePreview: [
      {
        speaker: "Alanis",
        avatar: "🕊️",
        textEs: "¿Cómo osa este empleado municipal exigir mi huella dactilar cuando he modelado las galaxias con el soplo primordial?",
        textEn: "How dares this city clerk demand my thumbprint when I shaped galaxies with primordial breath?"
      },
      {
        speaker: "CKY",
        avatar: "👧",
        textEs: "Poné el dedo en el vidriito Alanis, que si no te botan de la cola y tenemos que volver el lunes a las siete.",
        textEn: "Put your finger on the glass Alanis, or we lose our spot and have to return Monday at dawn."
      }
    ],
    rewardXP: 420,
    rewardMoney: 2500,
    achievementId: "ach_alanis_dni"
  },
  {
    id: "m_alanis_asado",
    character: "alanis",
    characterNameEs: "Alanis (Entidad Suprema)",
    characterNameEn: "Alanis (Supreme Deity)",
    characterAvatar: "🕊️",
    titleEs: "La Degustación del Asado de Domingo y el Mate Amargo",
    titleEn: "Sunday Barbecue Tasting and Bitter Mate",
    badgeEs: "🥩 Revelación Culinaria",
    badgeEn: "🥩 Culinary Epiphany",
    category: "barrial",
    icon: "🧉",
    summaryEs: "Alanis insiste en degustar la gastronomía mortal. Prueba un mate hirviendo y casi pierde el plano astral, mientras W toma notas sobre la crocancia del pan con chimichurri considerándolo elixir de vitalidad.",
    summaryEn: "Alanis samples mortal gastronomy. A scorching sip of bitter mate nearly dislodges her astral form while W analyzes chimichurri.",
    stepsEs: [
      "Armar el mate con yerba y montañita para la deidad cósmica.",
      "Servirle un choripán con chimichurri casero bien picante.",
      "Ver a Alanis levitar 30 centímetros por el ardor del ají molido.",
      "Anotar en el diario que los dioses son débiles ante las achuras bien doradas."
    ],
    stepsEn: [
      "Prep the mate gourd with yerba for the cosmic deity.",
      "Serve her a chorizo sandwich with spicy chimichurri.",
      "Watch Alanis levitate 30 centimeters from the spicy chili heat.",
      "Log in journal that gods possess low tolerance for spicy offal."
    ],
    dialoguePreview: [
      {
        speaker: "Alanis",
        avatar: "🕊️",
        textEs: "¡Siento fuego estelar devorando mi tráquea divina! ¿Qué clase de alquimia infernal contiene esta hierba amarga?",
        textEn: "I perceive stellar fire ravaging my divine trachea! What manner of infernal alchemy resides in this bitter herb?!"
      }
    ],
    rewardXP: 380,
    rewardMoney: 1600
  },

  // ===================== GRUPO / PICANTES ADOLESCENTES =====================
  {
    id: "m_group_pool_bikini",
    character: "grupo",
    characterNameEs: "Grupo CKY & Amigos",
    characterNameEn: "CKY & Friends Squad",
    characterAvatar: "✨",
    titleEs: "Tarde de Sol en la Pileta: El Bikini Rebelde",
    titleEn: "Sunny Afternoon at the Pool: The Rebel Bikini",
    badgeEs: "👙 Picante Acuático",
    badgeEn: "👙 Aquatic Spicy",
    category: "picante",
    icon: "🏊‍♀️",
    summaryEs: "Tarde de pileta municipal a 38 grados. CKY estrena un micro-bikini diminuto; una ola de Mateo le desacomoda el corpiño y W se transforma en tabla de flotación gigante para cubrirle el escote como un guardaespaldas.",
    summaryEn: "Scorching afternoon at the municipal pool. CKY rocks a tiny bikini; Mateo's splash unties her top and W transforms into a floating kickboard.",
    stepsEs: [
      "Llegar al club con toallones, protector solar y bikini nuevo.",
      "Tomar sol en el borde mientras Ángela desata los nudos para emparejar el bronceado.",
      "Sobrevivir al chapuzón bomba de Mateo que suelta el corpiño.",
      "Refugiarse detrás del escudo flotante dorado de W nadando a los vestuarios."
    ],
    stepsEn: [
      "Arrive at the club with towels, sunscreen, and new bikini.",
      "Sunbathe while Angela unties back straps for an even tan.",
      "Survive Mateo's cannonball wave that dislodges the halter.",
      "Duck behind W's golden kickboard shield swimming to the showers."
    ],
    dialoguePreview: [
      {
        speaker: "CKY",
        avatar: "👧",
        textEs: "¡W tapame que se me soltó el nudo y Mateo viene nadando con antiparras!",
        textEn: "W cover me, my knot slipped and Mateo is swimming over with goggles!"
      },
      {
        speaker: "Ángela",
        avatar: "👻",
        textEs: "¡Ja ja ja! ¡La próxima te ponemos cinta aisladora en la espalda nena!",
        textEn: "Hahaha! Next time we're duct taping your back girl!"
      }
    ],
    rewardXP: 450,
    rewardMoney: 2200,
    achievementId: "ach_pool_bikini_escape"
  },
  {
    id: "m_group_blind_date",
    character: "grupo",
    characterNameEs: "Grupo CKY & Amigos",
    characterNameEn: "CKY & Friends Squad",
    characterAvatar: "✨",
    titleEs: "Cita a Ciegas con el Seductor del Barrio: Apoyo Táctico Desastroso",
    titleEn: "Blind Date with Neighborhood Heartthrob: Catastrophic Ear-Piece",
    badgeEs: "💘 Comedia Romántica",
    badgeEn: "💘 Romantic Comedy",
    category: "picante",
    icon: "☕",
    summaryEs: "Cita a ciegas en el café de la plaza. Ángela y W le soplan frases al oído a CKY por telepatía: Ángela sugiere piropos atrevidos y de doble sentido, mientras W dicta códigos de castidad medieval, volviendo loco al pretendiente.",
    summaryEn: "Blind date at the plaza cafe. Angela and W whisper telepathic advice: Angela prompts brazen innuendos while W insists on medieval chastity.",
    stepsEs: [
      "Llegar al café vestida con el vestido elegante de gala.",
      "Sentarse frente al chico canchero de la escuela técnica.",
      "Repetir sin querer las frases picantes que sopla Ángela.",
      "Ver cómo el chico se atora con el submarino con churros y sale confundido pero fascinado."
    ],
    stepsEn: [
      "Arrive at the cafe wearing the elegant gala dress.",
      "Sit across from the tech school heartthrob.",
      "Accidentally blurt out Angela's unfiltered innuendos.",
      "Watch the boy choke on hot chocolate, baffled yet thoroughly enchanted."
    ],
    dialoguePreview: [
      {
        speaker: "CKY",
        avatar: "👧",
        textEs: "Ehh... dice Ángela... digo, digo yo, que si te gusta el asado jugoso... ¡W cállate que no soy una doncella feudal!",
        textEn: "Uhh... Angela says... I mean I say, if you like juicy barbecue... W shut up I'm not a feudal damsel!"
      }
    ],
    rewardXP: 400,
    rewardMoney: 1900
  },
  {
    id: "m_group_disco_costume",
    character: "grupo",
    characterNameEs: "Grupo CKY & Amigos",
    characterNameEn: "CKY & Friends Squad",
    characterAvatar: "✨",
    titleEs: "El Desfile de Disfraces del Boliche: La Diablita y el Ángel",
    titleEn: "Club Costume Party: Devil Girl & Celestial Specter",
    badgeEs: "💃 Noche Descontrolada",
    badgeEn: "💃 Wild Nightclub",
    category: "picante",
    icon: "👠",
    summaryEs: "Fiesta de disfraces en la matinée/boliche del centro con premio al mejor atuendo. CKY va de diablita con un conjunto ultra pegado; Ángela agrega humo espectral y W cuida que nadie se desubique en la pista.",
    summaryEn: "Costume contest at the downtown dance club. CKY dresses as a spicy devil; Angela casts spectral fog and W guards the dance floor with honor.",
    stepsEs: [
      "Ponerse el atuendo de diablita con cuernitos rojos en el ropero.",
      "Pasar por la puerta del boliche sin pagar entrada por tener el mejor disfraz.",
      "Subirse a la tarima de baile con Ángela animando a la multitud.",
      "Ganar el trofeo de cristal y los $5.000 del concurso."
    ],
    stepsEn: [
      "Don the devil horns and crimson outfit at the wardrobe.",
      "Bypass the velvet rope with the club's finest costume.",
      "Dance on the podium as Angela pumps up the crowd.",
      "Claim the crystal trophy and the $5,000 cash prize."
    ],
    dialoguePreview: [
      {
        speaker: "Nico",
        avatar: "👦",
        textEs: "¡Chabón! ¡CKY está rompiendo la pista de baile! ¡Parece una estrella de videoclip de reggaetón!",
        textEn: "Dude! CKY is tearing up the dance floor! She looks like a reggaeton music video star!"
      }
    ],
    rewardXP: 500,
    rewardMoney: 5000,
    achievementId: "ach_disco_devil_queen"
  },
  {
    id: "m_group_wrong_photo",
    character: "grupo",
    characterNameEs: "Grupo CKY & Amigos",
    characterNameEn: "CKY & Friends Squad",
    characterAvatar: "✨",
    titleEs: "La Foto Sexy Equivocada en el Grupo de WhatsApp Escolar",
    titleEn: "The Accidental Spicy Selfie Sent to the Class Group",
    badgeEs: "📱 Pánico Total",
    badgeEn: "📱 Pure Panic",
    category: "picante",
    icon: "📸",
    summaryEs: "Una foto en el espejo del ropero en lencería roja se envía por accidente al grupo oficial del curso. Misión contrarreloj para distraer al Profesor Montenegro y a los chicos antes de que abran el chat.",
    summaryEn: "A mirror selfie in red lingerie is mistakenly sent to the official class WhatsApp. High-stakes race to distract Montenegro before anyone opens the chat.",
    stepsEs: [
      "Entrar en pánico total al ver el doble tilde azul en el celular.",
      "Correr a la escuela para provocar una distracción masiva en el patio.",
      "Hacer que W bloquee la señal Wi-Fi de la escuela con un pulso electromagnético astral.",
      "Eliminar el mensaje 'para todos' en los últimos 30 segundos disponibles."
    ],
    stepsEn: [
      "Panic upon seeing double blue checkmarks on the phone.",
      "Sprint to school and stage a massive courtyard distraction.",
      "Have W disrupt the school Wi-Fi with an astral electromagnetic pulse.",
      "Hit 'Delete for Everyone' with 30 seconds to spare."
    ],
    dialoguePreview: [
      {
        speaker: "CKY",
        avatar: "👧",
        textEs: "¡ÁNGELA APRETÉ ENVIAR AL GRUPO DONDE ESTÁ EL DIRECTOR DON HÉCTOR! ¡ME VOY A TENER QUE MUDAR A LA ANTÁRTIDA!",
        textEn: "ANGELA I HIT SEND TO THE GROUP WITH PRINCIPAL DON HECTOR! I'M MOVING TO ANTARCTICA!"
      },
      {
        speaker: "Ángela",
        avatar: "👻",
        textEs: "¡Tranquila que saliste bárbara! ¡Pero corré como gacela antes de que descarguen la imagen!",
        textEn: "Chill you look fantastic! But run like a gazelle before they download it!"
      }
    ],
    rewardXP: 450,
    rewardMoney: 2000,
    achievementId: "ach_selfie_panic_saved"
  }
];
