import { PhoneChat } from "../types";

export const DEFAULT_PHONE_CHATS: PhoneChat[] = [
  {
    id: "chat_family_group",
    contactName: "Familia Los K 👪",
    avatar: "👨‍👩‍👧",
    unread: true,
    messages: [
      {
        id: "fam_1",
        sender: "Tía Pocha",
        textEs: "✨ Bendecido inicio de semana mis amores! 🌸 Les mando este Piolín con purpurina para que el arcángel Miguel limpie las malas vibras y la envidia de los vecinos. Cuidado con el té frío que enfría el hígado!",
        textEn: "✨ Blessed start of the week my darlings! 🌸 Sending this glitter Tweety so Archangel Michael clears negative vibes. Watch out for iced tea, it freezes the liver!",
        timestamp: "07:15",
        isPlayer: false,
      },
      {
        id: "fam_2",
        sender: "Mamá",
        textEs: "Pocha por favor dejá de mandar cadenas a las 7 de la mañana que suena el teléfono y me despierta. CKY, dejé media milanesa en la heladera tapada con el repasador celeste, si te la comés lavá el plato.",
        textEn: "Pocha please stop sending chain messages at 7am, it wakes me up. CKY, I left half a cutlet in the fridge covered with the blue cloth, if you eat it wash your plate.",
        timestamp: "07:22",
        isPlayer: false,
      },
      {
        id: "fam_3",
        sender: "Tío Cacho",
        textEs: "Che alguno tiene una llave francesa de 14 para prestarme? Se me falseó el flotante del inodoro y está tirando agua como las cataratas del Iguazú.",
        textEn: "Hey does anyone have a 14 wrench to lend me? The toilet float broke and it's gushing water like Niagara Falls.",
        timestamp: "07:30",
        isPlayer: false,
      },
    ],
    replies: [
      {
        textEs: "Tía Pocha, pasame el sticker de Piolín que está buenísimo",
        textEn: "Aunt Pocha, send me that Tweety sticker, it's hilarious",
        nextMessages: [
          {
            id: "fam_r1",
            sender: "Tía Pocha",
            textEs: "¡Ahí te lo mando corazón! 🐥✨ Que la luz de las 7 potencias te acompañe en la escuela. Y comete una manzana!",
            textEn: "Sending it sweetie! 🐥✨ May the cosmic light guide you at school. And eat an apple!",
            timestamp: "07:32",
            isPlayer: false,
          },
          {
            id: "fam_r2",
            sender: "Mamá",
            textEs: "CKY no te distraigas con el celular que vas a llegar tarde a la parada del colectivo.",
            textEn: "CKY don't get distracted on your phone or you'll miss the bus.",
            timestamp: "07:33",
            isPlayer: false,
          },
        ],
        nextReplies: [
          {
            textEs: "Ya salgo volando ma, tranqui!",
            textEn: "Flying out right now mom, don't worry!",
            nextMessages: [
              {
                id: "fam_r3",
                sender: "Mamá",
                textEs: "¡Y llevate abrigo que refresca a la tarde!",
                textEn: "And take a jacket, it gets chilly in the afternoon!",
                timestamp: "07:35",
                isPlayer: false,
              },
            ],
          },
        ],
      },
      {
        textEs: "Ma, el sándwich de salame de la heladera es intocable, es patrimonio cultural mío",
        textEn: "Mom, that salami sandwich in the fridge is untouchable, it's my personal treasure",
        nextMessages: [
          {
            id: "fam_r4",
            sender: "Mamá",
            textEs: "Bueno pero no te lo comas todo de un bocado que después te agarra dolor de panza en clase.",
            textEn: "Fine, but don't gulp it down in one bite or your tummy will hurt in class.",
            timestamp: "07:34",
            isPlayer: false,
          },
          {
            id: "fam_r5",
            sender: "Tío Cacho",
            textEs: "Si sobra salame guárdenme dos fetas para el mate de la tarde.",
            textEn: "If there's leftover salami save two slices for afternoon mate.",
            timestamp: "07:36",
            isPlayer: false,
          },
        ],
      },
    ],
  },
  {
    id: "chat_limbo_callcenter",
    contactName: "Call Center del Limbo 👻",
    avatar: "💀",
    unread: true,
    messages: [
      {
        id: "limbo_1",
        sender: "Operador Astral #404",
        textEs: "Buenas noches alma mortal. Le informamos que ha sido pre-adjudicada para un Plan de Ahorro Astral de 84 cuotas en el Inframundo. Incluye parcela premium con vista al río Estigio y libre de sombras rencorosas.",
        textEn: "Good evening mortal soul. You have been pre-approved for an 84-installment Underworld Savings Plan. Includes premium plot overlooking River Styx.",
        timestamp: "03:33",
        isPlayer: false,
      },
    ],
    replies: [
      {
        textEs: "Quiero hablar con el supervisor de las tinieblas ya mismo",
        textEn: "I want to speak with the supervisor of darkness immediately",
        actionId: "ach_troll_limbo",
        nextMessages: [
          {
            id: "limbo_r1",
            sender: "Operador Astral #404",
            textEs: "El Gran Jerarca del Abismo se encuentra en reunión de directorio tomando café de lava. Por favor permanezca en la línea mientras le transmitimos lamentos de condenados...",
            textEn: "The High Archon of the Abyss is in a board meeting drinking lava coffee. Please stay on the line while we stream damned wails...",
            timestamp: "03:34",
            isPlayer: false,
          },
          {
            id: "limbo_r2",
            sender: "Operador Astral #404",
            textEs: "🎶 *Música de espera: Marcha fúnebre en flauta desafinada* 🎶",
            textEn: "🎶 *Hold music: Funeral march on an out-of-tune recorder* 🎶",
            timestamp: "03:35",
            isPlayer: false,
          },
        ],
        nextReplies: [
          {
            textEs: "Cortá que me gastás los datos móviles espectrales!",
            textEn: "Hang up, you're eating my spectral mobile data!",
            nextMessages: [
              {
                id: "limbo_r3",
                sender: "Operador Astral #404",
                textEs: "Número bloqueado por solicitud del usuario. Tenga un condenado y próspero día.",
                textEn: "Number blocked at user request. Have a cursed and prosperous day.",
                timestamp: "03:36",
                isPlayer: false,
              },
            ],
          },
        ],
      },
      {
        textEs: "Se equivocaron de número, acá es la Rotisería 'El Pollo Astral'",
        textEn: "Wrong number, this is 'The Astral Chicken' rotisserie",
        actionId: "ach_troll_limbo",
        nextMessages: [
          {
            id: "limbo_r4",
            sender: "Operador Astral #404",
            textEs: "Ah mil disculpas doña. ¿A cuánto tienen la docena de empanadas de carne cortada a cuchillo espectral? ¿Hacen delivery al cuadrante 9 del Limbo?",
            textEn: "Oh apologies ma'am! How much is a dozen hand-cut beef empanadas? Do you deliver to Limbo sector 9?",
            timestamp: "03:34",
            isPlayer: false,
          },
        ],
        nextReplies: [
          {
            textEs: "No enviamos al Limbo porque las sombras se comen las aceitunas",
            textEn: "We don't deliver to Limbo because shadows steal all olives",
            nextMessages: [
              {
                id: "limbo_r5",
                sender: "Operador Astral #404",
                textEs: "Comprendido, malditas sombras del sindicato. Cancelando suscripción. Que tenga lindo día!",
                textEn: "Understood, cursed union shadows. Cancelling subscription. Have a nice day!",
                timestamp: "03:35",
                isPlayer: false,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "chat_school_buddies",
    contactName: "Escuela N° 87 - 3er C (Sin profes) 🎒",
    avatar: "🏫",
    unread: true,
    messages: [
      {
        id: "sch_1",
        sender: "Nico",
        textEs: "Gente alguien hizo el mapa de geografía con los ríos y mesetas? Me olvidé completamente y Montenegro nos va a degollar en vivo",
        textEn: "Guys did anyone do the geography map with rivers and plateaus? I totally forgot and Montenegro will crucify us alive",
        timestamp: "06:45",
        isPlayer: false,
      },
      {
        id: "sch_2",
        sender: "Jaz",
        textEs: "Nico te lo pedí ayer a las 8 y me dijiste 'tranqui que es para el viernes'... te merecés un 1 rotundo en el boletín 😂",
        textEn: "Nico I asked you yesterday and you said 'chill it's for Friday'... you deserve a straight F 😂",
        timestamp: "06:48",
        isPlayer: false,
      },
      {
        id: "sch_3",
        sender: "Mateo",
        textEs: "Olvidense de la geografía, hoy en el recreo hay revancha de fútbol. El que tenga miedo a los pelotazos que se quede mirando desde el buffet comiendo medialunas duras.",
        textEn: "Forget geography, today at recess there's a soccer rematch. Whoever fears getting blasted by the ball can watch from the cafeteria eating stale croissants.",
        timestamp: "06:55",
        isPlayer: false,
      },
    ],
    replies: [
      {
        textEs: "Mateo, tus penales no asustan ni a las palomas de la plaza",
        textEn: "Mateo, your penalty kicks wouldn't scare a pigeon in the park",
        nextMessages: [
          {
            id: "sch_r1",
            sender: "Mateo",
            textEs: "Ja! Ya vas a ver CKY, hoy le pego con comba galáctica y la clavo en el ángulo!",
            textEn: "Ha! You'll see CKY, today I'll curve it with galactic spin straight into the top corner!",
            timestamp: "06:58",
            isPlayer: false,
          },
          {
            id: "sch_r2",
            sender: "Jaz",
            textEs: "La última vez que le pegaste con comba rompiste la maceta de la vicedirectora Mateo jajajaja",
            textEn: "Last time you curved it you smashed the vice principal's flowerpot Mateo hahahaha",
            timestamp: "07:00",
            isPlayer: false,
          },
        ],
      },
      {
        textEs: "Nico, si me comprás un alfajor triple en el recreo te dejo copiarte el mapa",
        textEn: "Nico, if you buy me a triple alfajor at recess I'll let you copy the map",
        nextMessages: [
          {
            id: "sch_r3",
            sender: "Nico",
            textEs: "¡TRATO HECHO CKY! Sos mi salvadora, te compro el de chocolate blanco que te gusta!",
            textEn: "DEAL CKY! You're my savior, I'll buy you that white chocolate one you love!",
            timestamp: "06:57",
            isPlayer: false,
          },
        ],
      },
    ],
  },
  {
    id: "chat_10print_studios",
    contactName: "10Print_ Studios (VIP Oficial) 👾",
    avatar: "🎮",
    unread: true,
    messages: [
      {
        id: "10print_1",
        sender: "10Print_ Dev Team",
        textEs: "👾 ¡Hola CKY! Te escribimos directamente desde el cuartel general de 10Print_ Studios. Queríamos felicitarte por tu valentía enfrentando las sombras del Limbo y por bancarte las locuras de Ángela y W.",
        textEn: "👾 Hey CKY! We're texting you straight from 10Print_ Studios headquarters. Wanted to salute your bravery against Limbo shadows and enduring Angela and W's chaos.",
        timestamp: "07:45",
        isPlayer: false,
      },
      {
        id: "10print_2",
        sender: "10Print_ Dev Team",
        textEs: "¿Cómo va ese sándwich de salame? Recordá que en 10Print_ programamos cada rincón del pueblo con puro cariño indie y humor argento.",
        textEn: "How's that salami sandwich going? Remember at 10Print_ we coded every town corner with indie passion and classic humor.",
        timestamp: "07:46",
        isPlayer: false,
      },
    ],
    replies: [
      {
        textEs: "¡Hola 10Print_! ¡El juego está buenísimo pero las cucarachas del ropero eran gigantes! 😂",
        textEn: "Hey 10Print_! The game is awesome, but those wardrobe roaches were huge! 😂",
        nextMessages: [
          {
            id: "10print_r1",
            sender: "10Print_ Dev Team",
            textEs: "¡Jajaja! Esas cucarachas fueron modeladas a mano pixel por pixel. ¡Te dejamos activada una bendición especial de +15% de suerte cósmica! ¡Gracias por apoyar a 10Print_ Studios!",
            textEn: "Hahaha! Those roaches were hand-crafted pixel by pixel. We granted you a special +15% cosmic luck buff! Thanks for supporting 10Print_ Studios!",
            timestamp: "07:48",
            isPlayer: false,
          },
        ],
        nextReplies: [
          {
            textEs: "¡Aguante 10Print_! ¡Les dejo 5 estrellas de cabeza!",
            textEn: "Long live 10Print_! 5 stars review incoming for sure!",
            nextMessages: [
              {
                id: "10print_r2",
                sender: "10Print_ Dev Team",
                textEs: "¡Sos una genia CKY! ¡Que disfrutes la aventura y a romperla en la escuela y en el Limbo! 🚀✨",
                textEn: "You rock CKY! Enjoy the adventure and rock it at school and Limbo! 🚀✨",
                timestamp: "07:50",
                isPlayer: false,
              },
            ],
          },
        ],
      },
      {
        textEs: "Che gente de 10Print_, ¿pueden programar que el profesor Montenegro no tome prueba hoy?",
        textEn: "Hey 10Print_ devs, can you patch the matrix so Montenegro doesn't give a pop quiz today?",
        nextMessages: [
          {
            id: "10print_r3",
            sender: "10Print_ Dev Team",
            textEs: "Intentamos hackear la planilla de Montenegro pero su rigidez pedagógica tiene un firewall de 512 bits inexpugnable. ¡Vas a tener que estudiar o pedirle pistas astrales a Ángela! Jajaja.",
            textEn: "We tried hacking Montenegro's syllabus but his strictness has an impenetrable 512-bit firewall. You gotta study or ask Angela for astral tips! Hahaha.",
            timestamp: "07:49",
            isPlayer: false,
          },
        ],
      },
    ],
  },
];
