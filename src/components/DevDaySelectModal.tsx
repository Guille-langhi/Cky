import React from "react";
import { Language } from "../types";
import { Terminal, Sparkles, Calendar, ArrowRight, Play, CheckCircle2, ShieldAlert } from "lucide-react";

interface DevDaySelectModalProps {
  language: Language;
  onClose: () => void;
  onSelectDay: (dayNumber: number) => void;
}

export default function DevDaySelectModal({
  language,
  onClose,
  onSelectDay,
}: DevDaySelectModalProps) {
  const isEs = language === "es";

  const daysList = [
    {
      day: 1,
      titleEs: "Día 1: El Primer Día de Escuela",
      titleEn: "Day 1: First Day of School",
      tagEs: "Inicio • Casa & Escuela N° 87",
      tagEn: "Start • House & School No. 87",
      badgeColor: "bg-emerald-950/80 text-emerald-400 border-emerald-500/40",
      icon: "🎒",
      descEs: "Comienzo de la historia. Levantarse a las 07:00 AM, vestirse con el uniforme, recoger la mochila, libros, agua y tomar el colectivo escolar.",
      descEn: "Start of story. Wake up at 07:00 AM, wear school uniform, grab backpack, books, water, and catch school bus.",
      featuresEs: [
        "👕 Uniforme escolar & Ropero",
        "🧼 Aseo en baño / ducha",
        "🎒 Mochila y libros escolares",
        "🧴 Botella de agua en la heladera",
        "🚌 Colectivo escolar & Escuela N° 87"
      ],
      featuresEn: [
        "👕 School uniform & Wardrobe",
        "🧼 Bathroom / shower grooming",
        "🎒 Backpack & school books",
        "🧴 Water bottle from fridge",
        "🚌 School bus & School No. 87"
      ]
    },
    {
      day: 2,
      titleEs: "Día 2: Una Nueva Amiga (Cementerio Municipal)",
      titleEn: "Day 2: A New Friend (Municipal Cemetery)",
      tagEs: "Espíritu de Ángela • Colectivo Verde Línea 4",
      tagEn: "Angela's Spirit • Line 4 Green Bus",
      badgeColor: "bg-purple-950/80 text-purple-300 border-purple-500/40",
      icon: "🪦",
      descEs: "Tras la llamada misteriosa de Ángela, tomar el sándwich de salame y queso de la heladera de la cocina y viajar en el colectivo verde de la Línea 4 al Cementerio Municipal.",
      descEn: "After Angela's mysterious call, grab the salami & cheese sandwich from the kitchen fridge and travel on Line 4 green bus to Municipal Cemetery.",
      featuresEs: [
        "📱 Responder la llamada de Ángela (Espíritu)",
        "🥪 Tomar sándwich de salame y queso de la heladera",
        "🚌 Parada de la Línea 4 y Colectivo Verde",
        "🪦 Cementerio Municipal y Tumba Rosa",
        "👻 Entregar el sándwich y alianza espiritual (+50 XP)"
      ],
      featuresEn: [
        "📱 Answer Angela's spirit phone call",
        "🥪 Take salami & cheese sandwich from fridge",
        "🚌 Line 4 Bus Stop & Green Bus ride",
        "🪦 Municipal Cemetery & Pink Tomb",
        "👻 Deliver sandwich & forge spirit alliance (+50 XP)"
      ]
    },
    {
      day: 3,
      titleEs: "Día 3: Viernes y tu cuerpo lo sabe",
      titleEn: "Day 3: Friday and your body knows it",
      tagEs: "Viernes • Despertar & Escuela",
      tagEn: "Friday • Awakening & School",
      badgeColor: "bg-amber-950/80 text-amber-300 border-amber-500/40",
      icon: "🔮",
      descEs: "Llegó el viernes. Tras la divertida noche de la ducha y el misterio de la toalla, CKY y Ángela inician el día con nuevos retos y poderes espirituales.",
      descEn: "Friday has arrived. After the fun shower night and towel mystery, CKY and Angela start the day with new challenges and spiritual powers.",
      featuresEs: [
        "🌅 Despertar del Viernes a las 07:00 AM",
        "👻 Consejos matutinos y chistes de Ángela",
        "🔮 Revelación del Limbo y Hermes",
        "⚡ Desbloqueo de Habilidades de Combate"
      ],
      featuresEn: [
        "🌅 Friday Wake-up at 07:00 AM",
        "👻 Angela's morning advice & jokes",
        "🔮 Limbo & Hermes revelation",
        "⚡ Combat skills unlock"
      ],
      isDevSlot: false
    },
    {
      day: 4,
      titleEs: "Día 4: Tesoro, compras y diversión (Sábado)",
      titleEn: "Day 4: Treasure, Shopping & Fun (Saturday)",
      tagEs: "Sábado • Ruinas Ancestrales & Centro Comercial",
      tagEn: "Saturday • Ancient Ruins & Shopping Mall",
      badgeColor: "bg-rose-950/80 text-rose-300 border-rose-500/40",
      icon: "💎",
      descEs: "Sábado temprano: viaje al Valle de las Ruinas, batalla contra el Guardián, W transformado en pala para desenterrar el tesoro, baño con W de guardia y tarde de shopping con lencería sexy.",
      descEn: "Early Saturday: expedition to Ancient Ruins, battle vs Guardian, W turns into shovel to dig treasure, shower with W on guard duty, and mall shopping with sexy lingerie.",
      featuresEs: [
        "🌅 Despertar temprano (06:00 AM) con Ángela y W",
        "⚔️ Batalla ATB contra el Golem Guardián del Tesoro",
        "⛏️ W se convierte en pala para desenterrar el cofre (+$50.000)",
        "🚿 Ducha en casa: orden estricta a W de esperar afuera",
        "🛍️ Centro Comercial: Boutique de Moda y Tienda de Lencería Sexy",
        "👙 Conjunto de Lencería Sexy disponible en el Ropero"
      ],
      featuresEn: [
        "🌅 Early 06:00 AM wake-up with Angela and W",
        "⚔️ ATB battle vs Ancient Treasure Guardian",
        "⛏️ W transforms into shovel to unearth the chest (+$50,000)",
        "🚿 Shower at home: strict orders for W to wait outside",
        "🛍️ Shopping Mall: Fashion Boutique & Sexy Lingerie Shop",
        "👙 Sexy Lingerie outfit available in Bedroom Wardrobe"
      ],
      isDevSlot: false
    },
    {
      day: 5,
      titleEs: "Día 5: Limpieza profunda (Domingo)",
      titleEn: "Day 5: Deep Cleaning (Sunday)",
      tagEs: "Domingo • Limpieza de la Casa & Carrera al Aeropuerto",
      tagEn: "Sunday • House Cleaning & Airport Race",
      badgeColor: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40",
      icon: "🧹",
      descEs: "Domingo de limpieza: mamá exige limpiar todo. W se convierte en plumero, escoba y aspiradora contra cucarachas, arañas y ratas. A la siesta, carrera al Aeropuerto contra la vecina por un pancho y una coca, ducha y divertida sesión de fotos en lencería sexy.",
      descEn: "Sunday deep cleaning: mom demands full house cleaning. W turns into duster, broom & vacuum vs roaches, spiders & rats. Afternoon airport race vs neighbor for a hot dog & Coke, shower and funny sexy lingerie photo shoot.",
      featuresEs: [
        "🧹 Mamá ordena la limpieza profunda dominical",
        "✨ W se transforma en útiles arcanos (Plumero, Escoba, Aspiradora, Mopa)",
        "🪳 Batallas cómicas contra cucarachas gigantes, arañas y ratas",
        "🏃‍♀️ Salida a trotar & Desafío de carrera al Aeropuerto por un Pancho y una Coca",
        "✈️ Nuevo mapa del Aeropuerto, trampas de la vecina y derrota en la meta",
        "🚿 Regreso transpirada, bromas picantes de Ángela y ducha reparadora",
        "📸 Sesión cómica de fotos sexys en lencería roja para el celular (+XP)"
      ],
      featuresEn: [
        "🧹 Mom orders Sunday deep cleaning",
        "✨ W transforms into arcane tools (Duster, Broom, Vacuum, Mop)",
        "🪳 Funny battles against giant roaches, spiders, and rats",
        "🏃‍♀️ Jogging & Airport race challenge for a Hot Dog and Coke",
        "✈️ New Airport map, neighbor cheats and CKY pays bet",
        "🚿 Return sweaty, Angela's spicy banter & refreshing shower",
        "📸 Hilarious sexy red lingerie photo shoot for the phone (+XP)"
      ],
      isDevSlot: false
    },
    {
      day: 6,
      titleEs: "Día 6: Posesión Escolar, 3 Investigaciones & Batalla de Fútbol",
      titleEn: "Day 6: School Possession, 3 Investigations & Soccer Duel",
      tagEs: "Lunes • Batalla Sombra, Colectivo Hostil & Cancha de Fútbol",
      tagEn: "Monday • Shadow Battle, Hostile Bus & Soccer Pitch",
      badgeColor: "bg-indigo-950/80 text-indigo-300 border-indigo-500/40",
      icon: "⚡",
      descEs: "Lunes de misterio y combates: derrota la Forma Oscura y descubre a tu Alma Gemela híbrida. Tras la rutina, en el colectivo y en la escuela todos están agresivos y poseídos por espíritus de la Vecina. Reúnete en el baño de chicas, realiza 3 investigaciones (pizarrón, sala de profesores y casilleros) y libra una épica batalla en la cancha de fútbol contra Mateo poseído para purificarlo.",
      descEn: "Monday mystery & battles: defeat Dark Form and reveal your hybrid Soulmate. After routine, on bus and at school everyone is aggressive and possessed by the Neighbor's spirits. Meet in girls' bathroom, complete 3 investigations (blackboard, lounge & lockers), and fight an epic courtyard soccer battle against possessed Mateo to purify him.",
      featuresEs: [
        "🌑 Aparición de la Forma Oscura & Alma Gemela revelada por Alanis",
        "💖 Incorporación oficial del Alma Gemela al equipo (+150 XP)",
        "👕 Rutina matutina: ropero, baño, mochila y sándwich de salame",
        "🚌 Colectivo hostil: compañeros y chofer agresivos bajo influjo sombrío",
        "🏫 Escuela N° 87 en conmoción: profesores y alumnos poseídos por la Vecina",
        "🧼 Cónclave secreto en el Baño de Chicas con Ángela, W y tu Alma Gemela",
        "🔍 3 Investigaciones Escolares: Pizarrón del Aula, Cafetera de Profesores y Tótem del Pasillo",
        "⚽ Gran Batalla en el Patio contra Mateo Poseído: muerte del espíritu y purificación (+200 XP)"
      ],
      featuresEn: [
        "🌑 Dark Form Apparition & Soulmate revealed by Alanis",
        "💖 Soulmate officially joins the team (+150 XP)",
        "👕 Morning routine: wardrobe, bathroom, backpack & salami sandwich",
        "🚌 Hostile bus ride: aggressive classmates & driver under shadow influence",
        "🏫 School No. 87 in turmoil: teachers and students possessed by the Neighbor",
        "🧼 Secret Council in Girls' Bathroom with Angela, W & your Soulmate",
        "🔍 3 School Investigations: Classroom Blackboard, Teachers' Coffee & Hallway Totem",
        "⚽ Epic Courtyard Boss Battle vs Possessed Mateo: spirit destroyed & purified (+200 XP)"
      ],
      isDevSlot: false
    },
    {
      day: 7,
      titleEs: "Día 7: Injusticia (Sótano & Aula Laboratorio)",
      titleEn: "Day 7: Injustice (Basement & Chemistry Lab)",
      tagEs: "Martes • Expulsión Injusta, Laberinto & Rescate",
      tagEn: "Tuesday • Unjust Expulsion, Labyrinth & Rescue",
      badgeColor: "bg-red-950/80 text-red-300 border-red-500/40",
      icon: "🧪",
      descEs: "W descifra el Grimorio y revela la estrategia de atacar del más débil al más fuerte. Tras salvar el laboratorio escolar y al Profesor, Alanis exige a CKY ir a la casa del gemelo con la lencería roja en la mochila. Siguen comentarios desubicados de Ángela, el beso torpe con la crítica del gemelo, la pasarela en ropa interior roja para sacarle la revelación del ataque masivo de mañana, el regreso a casa con W y el descanso nocturno en piyama de seda.",
      descEn: "W decodes the Grimoire and reveals the strategy. After saving the school lab and Professor, Alanis demands CKY visit her soulmate carrying the red lingerie in her backpack. Features Angela's shameless jests, the awkward kiss and critique, the red lingerie runway to unlock the intel of tomorrow's simultaneous city attack, and night rest in silk pajamas.",
      featuresEs: [
        "📖 Estrategia del Grimorio por W y rescate del Laboratorio Escolar",
        "⚡ Exigencia de Alanis: discusión y mandato de llevar la lencería roja",
        "🚿 Aseo en la ducha, ropa común y lencería guardada en la mochila",
        "💋 Visita al gemelo: el beso torpe y la cómica crítica ('estatua de yeso')",
        "👙 Pasarela en lencería roja de encaje en el living y comentarios de Ángela",
        "💥 Revelación del Gran Ataque simultáneo de la Vecina en 4 puntos de la ciudad",
        "🌙 Consejo nocturno con W canalizando leylines y descanso en piyama de seda"
      ],
      featuresEn: [
        "📖 Grimoire strategy by W and School Chemistry Lab rescue",
        "⚡ Alanis's mandate: fierce argument and order to pack red lingerie",
        "🚿 Shower grooming, casual clothes and red lingerie packed in backpack",
        "💋 Soulmate house visit: the awkward kiss and critique ('plaster statue')",
        "👙 Red lace lingerie runway in living room with Angela's hilarious jests",
        "💥 Reveal of the Neighbor's coordinated attack across 4 city spots",
        "🌙 Night briefing with W channeling leylines and silk pajamas rest"
      ],
      isDevSlot: false
    },
    {
      day: 8,
      titleEs: "Día 8: Ataque Final (Fin del Capítulo 1)",
      titleEn: "Day 8: Final Assault (End of Chapter 1)",
      tagEs: "Miércoles • Asedio Coordinado & Clímax Definitivo",
      tagEn: "Wednesday • Coordinated Siege & Final Climax",
      badgeColor: "bg-red-950/90 text-red-300 border-red-500/60",
      icon: "⚔️",
      descEs: "Miércoles decisivo: CKY se prepara con ropa casual. Al salir a la calle el gemelo actúa raro. Rastreador de objetivos en UI para defender en cualquier orden la Plaza, el Hospital, la Terminal y el Mall. Tras vencer al último, W propone ir a la casa de la vecina. En la puerta, el gemelo traiciona y destruye a W y Ángela. CKY enfurecida desata su supernova desintegrando al gemelo y noqueando a Paula. En su cuarto, CKY renuncia al linaje frente a Alanis, llora en soledad y se desata la cinemática de Fin del Capítulo 1 creada por 10print_.",
      descEn: "Decisive Wednesday: CKY dresses casual. Soulmate acts strangely on the street. UI objective tracker to defend Plaza, Hospital, Terminal and Mall in any order. After last battle, W suggests confronting the Neighbor. At her door, the soulmate betrays and destroys W and Angela. CKY's ultimate wrath disintegrates the traitor and knocks out Paula. In her bedroom, CKY renounces her lineage to Alanis, becoming a normal girl with tears and Chapter 1 ending cinematic created by 10print_.",
      featuresEs: [
        "🎯 Rastreador de Objetivos en UI con libertad de orden de defensa",
        "⛲ Plaza Principal: Batalla contra el Coloso Sombrío del Parque",
        "🏥 Hospital Municipal: Batalla contra el Espectro de la Peste",
        "🚌 Terminal de Ómnibus: Batalla contra el Leviatán del Asfalto",
        "🛍️ Centro Comercial: Batalla contra la Gárgola de Cristal",
        "💔 Confrontación en la puerta de la Vecina y traición del gemelo",
        "🛡️👻 Destrucción heroica y dolorosa de W y Ángela",
        "⚡ Supernova Cósmica de CKY: destrucción del gemelo y Paula inconsciente",
        "🕊️ Renuncia total frente a Alanis: CKY vuelve a ser una chica normal",
        "🎬 Gran Cinemática de Fin del Capítulo 1 • Creado por 10print_"
      ],
      featuresEn: [
        "🎯 UI Objective Tracker allowing custom defense order",
        "⛲ Main Plaza: Boss battle vs Shadow Park Colossus",
        "🏥 Municipal Hospital: Boss battle vs Limbo Plague Specter",
        "🚌 Bus Terminal: Boss battle vs Asphalt Leviathan",
        "🛍️ Shopping Mall: Boss battle vs Crystal Gargoyle",
        "💔 Confrontation at Neighbor's door and soulmate betrayal",
        "🛡️👻 Tragic, heroic destruction of W and Angela",
        "⚡ CKY's Cosmic Supernova: traitor disintegrated and Paula knocked out",
        "🕊️ Total renunciation to Alanis: CKY becomes a normal girl once more",
        "🎬 Grand Chapter 1 Ending Cinematic • Created by 10print_",
        "🔥 UNLOCKS: Free Roam Epilogue Mode with 15+ Crazy & Spicy Missions!"
      ],
      isDevSlot: false
    },
    {
      day: 99,
      titleEs: "Modo Libre: Misiones Locas & Picantes (Post-Game)",
      titleEn: "Free Roam Mode: Crazy & Spicy Missions (Post-Game)",
      tagEs: "Epílogo • Sex Shop, Pijamada Sexy, Gym con W & Risas",
      tagEn: "Epilogue • Adult Store, Sexy Sleepover, Gym with W & Laughs",
      badgeColor: "bg-pink-950/90 text-pink-300 border-pink-500/60",
      icon: "🔥",
      descEs: "Modo desbloqueable tras terminar el juego normal: CKY y sus amigos viven las situaciones más cómicas, absurdas y picantes sin filtro cósmico. ¡Incluye compras con Ángela en el sex shop, desfile en lencería, desafíos absurdos de gimnasio con W, tregua vecinal con prismáticos y más!",
      descEn: "Unlockable mode after beating the main story: CKY and friends embark on the funniest, absurd, and spiciest missions without cosmic filter. Includes adult store shopping with Angela, lingerie catwalk, absurd gym challenges with W, neighborhood binocular gossip, and more!",
      featuresEs: [
        "🛍️ Ángela: Expedición al Sex Shop 'La Cueva del Placer Astral'",
        "💋 Ángela: Taller clandestino intensivo de besos con frutas",
        "👙 Ángela: Pijama party descontrolada y desfile en lencería roja",
        "📖 W: El templo del saber en la Biblioteca Municipal y duelo al masticador de chicle",
        "💪 W: Ritual de los 400 quintales en el gimnasio 'Puro Músculo'",
        "🛒 W: Cruzada de ofertas y terror a los aerosoles en el supermercado",
        "👩 Mamá: La cola del banco a las 6:00 AM y los jubilados ninja",
        "🧴 Mamá: Tarde de cosméticos íntimos, chusmerío y té en el living",
        "👀 Vecina Paula: Tregua de chusmas con prismáticos hacia la carnicería",
        "🧘‍♀️ Vecina Paula: Terapia de manejo de la ira y yoga con chispas",
        "🕊️ Alanis: Burocracia municipal y trámite del DNI humano",
        "🧉 Alanis: Asado dominguero, mate amargo ardiente y chimichurri",
        "🏊‍♀️ Grupo: Tarde de pileta a 38° y el escape del micro-bikini rebelde",
        "💘 Grupo: Cita a ciegas con el canchero y apoyo táctico desastroso",
        "👠 Grupo: Desfile de disfraces en el boliche y concurso de diablitas",
        "📸 Grupo: Pánico masivo por la foto sexy enviada por error al grupo escolar"
      ],
      featuresEn: [
        "🛍️ Angela: Expedition to the 'Astral Pleasure' adult boutique",
        "💋 Angela: Underground fruit kissing workshop masterclass",
        "👙 Angela: Wild sleepover with red lace lingerie catwalk",
        "📖 W: The temple of wisdom at City Library and bubblegum duel",
        "💪 W: 400 quintals celestial dumbbell ritual at the local gym",
        "🛒 W: Supermarket discount crusade and aerosol panic",
        "👩 Mom: 6:00 AM bank queue vs ninja seniors",
        "🧴 Mom: Intimate cosmetic parlor party, boldo tea and barrio gossip",
        "👀 Neighbor Paula: Barrio spy truce with opera glasses on butcher",
        "🧘‍♀️ Neighbor Paula: Anger management park yoga with dark sparks",
        "🕊️ Alanis: Civil registry bureaucracy & human ID card",
        "🧉 Alanis: Sunday barbecue, fiery bitter mate and chimichurri",
        "🏊‍♀️ Squad: 38°C pool afternoon & the rebel micro-bikini escape",
        "💘 Squad: Blind date with heartthrob & chaotic telepathic ear-piece",
        "👠 Squad: Nightclub costume contest and devil girl triumph",
        "📸 Squad: Mass panic over the accidental spicy photo sent to class group"
      ],
      isDevSlot: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-950 border border-purple-500/50 rounded-2xl text-purple-400">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-display text-purple-300 tracking-wider uppercase flex items-center gap-2">
                {isEs ? "MODO DESARROLLO • SELECTOR DE DÍA" : "DEV MODE • DAY SELECTOR"}
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {isEs ? "Elige el día que deseas probar para realizar cambios o testear funciones" : "Select the day you want to load for testing or making changes"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer font-mono text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center gap-3 text-xs font-mono text-purple-200">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              {isEs 
                ? "Cada nuevo día que creamos en el juego se agrega automáticamente a esta lista."
                : "Every new day created in the game is automatically added to this list."}
            </span>
          </div>

          <div className="space-y-4">
            {daysList.map((item) => (
              <div
                key={item.day}
                className={`p-5 rounded-2xl border transition-all ${
                  item.isDevSlot
                    ? "bg-slate-950/50 border-slate-800 opacity-75"
                    : "bg-slate-950/90 border-slate-800 hover:border-purple-500/60 shadow-lg"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                        {isEs ? item.titleEs : item.titleEn}
                      </h3>
                      <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-md border mt-1 font-semibold ${item.badgeColor}`}>
                        {isEs ? item.tagEs : item.tagEn}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectDay(item.day)}
                    className={`py-2.5 px-5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 ${
                      item.isDevSlot
                        ? "bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300"
                        : "bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {item.isDevSlot
                      ? (isEs ? "PROBAR BASE DÍA 3" : "TEST DAY 3 BASE")
                      : (isEs ? `JUGAR DÍA ${item.day}` : `PLAY DAY ${item.day}`)}
                  </button>
                </div>

                <p className="text-xs text-slate-300 font-mono leading-relaxed mb-3">
                  {isEs ? item.descEs : item.descEn}
                </p>

                {/* Features checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80">
                  {(isEs ? item.featuresEs : item.featuresEn).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>{isEs ? "CKY RPG • Herramientas de Desarrollo" : "CKY RPG • Developer Tools"}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
          >
            {isEs ? "Cerrar" : "Close"}
          </button>
        </div>

      </div>
    </div>
  );
}
