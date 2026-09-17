export interface BanterStep {
  speaker: string;
  textEs: string;
  textEn: string;
}

export function getRandomBanter(
  mapId: string,
  outfit: string,
  _stats?: { hambre?: number; sed?: number; higiene?: number; perfume?: number }
): BanterStep[] {
  const specificPool: BanterStep[][] = [];

  // Outfit specific jokes
  if (outfit === "naked") {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "¡Epa CKY! Estás en cueros totales caminando por la casa. Si entra mamá vas a tener que inventar que es un ritual de ventilación astral.",
        textEn: "Whoa CKY! You're completely naked walking around. If mom walks in you'll have to claim it's an astral ventilation ritual.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "*Flotando de espaldas mirando fijamente una mota de polvo* ¡Por los doce sellos del Olimpo! Mantengo mi mirada consagrada a 180 grados de pudor absoluto.",
        textEn: "*Floating backwards staring at a dust speck* By the twelve seals! I maintain my gaze at 180 degrees of absolute modesty.",
      },
      {
        speaker: "CKY",
        textEs: "¡Bueno che, me olvidé la toalla, no es para tanto drama cósmico!",
        textEn: "Hey, I just forgot the towel, it's not a cosmic tragedy!",
      },
    ]);
  }

  if (outfit === "towel") {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "Esa toalla te queda como poncho de indio CKY. Caminá despacito que con un estornudo quedás en cadena nacional.",
        textEn: "That towel looks like a makeshift poncho CKY. Walk gently, one sneeze and you're on prime time news.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "Debo admitir con orgullo que en mi encarnación textil poseo una absorción de humedad de grado celestial inigualable.",
        textEn: "I must proudly admit that in my textile incarnation I possess unmatched celestial moisture absorption.",
      },
      {
        speaker: "CKY",
        textEs: "W, por favor no me recuerdes que sos vos el que me estaba secando la espalda.",
        textEn: "W, please don't remind me that you were the one drying my back.",
      },
    ]);
  }

  if (outfit === "lingerie_sexy" || outfit === "lingerie") {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "¡Fuego total nena! Ese encaje rojo tiene más peligro que una curva sin frenos. Si te cruzás con la vecina le da un síncope de envidia pura.",
        textEn: "Total fire girl! That red lace is more dangerous than a brake-less curve. If you run into the neighbor she'll faint from pure envy.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "*Temblando con chispas doradas* La densidad de la tela parece insuficiente para mitigar un impacto de lanza o un hechizo de hielo...",
        textEn: "*Trembling with golden sparks* The fabric density appears insufficient to withstand a spear thrust or frost hex...",
      },
      {
        speaker: "CKY",
        textEs: "¡W, es lencería de moda francesa, no una cota de malla medieval!",
        textEn: "W, it's French fashion lingerie, not medieval chainmail!",
      },
    ]);
  }

  if (outfit === "pajamas" && (mapId.includes("street") || mapId.includes("school") || mapId.includes("plaza"))) {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "Saliste a la calle en piyama de ositos CKY... Si viene una horda del Limbo no van a atacarte, te van a convidar con chocolatada caliente.",
        textEn: "You went outside in teddy bear pajamas CKY... If a Limbo horde shows up they won't attack, they'll offer you hot cocoa.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "Los ositos bordados en vuestro pecho desprenden una inocencia que confunde los radares de las sombras abisales.",
        textEn: "The embroidered bears upon your chest radiate an innocence that baffles the abyssal shadow radars.",
      },
      {
        speaker: "CKY",
        textEs: "Se llama moda descontracturada chicos, no entienden nada de alta costura.",
        textEn: "It's called casual lifestyle fashion guys, you know nothing about haute couture.",
      },
    ]);
  }

  // Location based jokes
  if (mapId.includes("kitchen")) {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "Ese olorcito a tuco que quedó en la olla... Si yo estuviera viva ya le habría metido el dedo dos veces sin pedir permiso.",
        textEn: "That pasta sauce smell left in the pot... If I were alive I'd have dipped my finger in it twice without asking.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "El artefacto congelador emite vibraciones crípticas. Sospecho que el frasco de mayonesa del fondo albergaba civilizaciones pre-diluvianas.",
        textEn: "The freezing apparatus emits cryptic hums. I suspect the mayonnaise jar in the back housed pre-flood civilizations.",
      },
      {
        speaker: "CKY",
        textEs: "Esa mayonesa la compró papá cuando ganó Argentina en Qatar, ni se les ocurra abrirla.",
        textEn: "Dad bought that mayo during the World Cup, don't even think about opening it.",
      },
    ]);
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "¿Te fijaste la alacena? Tu mamá tiene 34 potes de dulce de leche de plástico vacíos. ¿Para qué los guarda? ¿Va a fundar un museo del plástico?",
        textEn: "Did you check the cupboard? Your mom has 34 empty dulce de leche tubs. What for? Is she opening a plastic museum?",
      },
      {
        speaker: "CKY",
        textEs: "'Por las dudas', dice ella. Si hay una guerra nuclear sobrevivimos nosotros y los potes vacíos de La Serenísima.",
        textEn: "'Just in case', she says. If nuclear war breaks out, only us and empty yogurt tubs will survive.",
      },
    ]);
  }

  if (mapId.includes("bathroom")) {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "CKY, tardás más en desenredarte el flequillo que el gobierno en arreglar los baches de la avenida principal.",
        textEn: "CKY, you take longer untangling your bangs than the city council fixing potholes on the avenue.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "Vuestro cabello desafía la ley de gravitación astral. Sugiero emplear el ungüento de lavanda con moderación épica.",
        textEn: "Your hair defies astral gravity laws. I suggest applying the lavender ointment with epic moderation.",
      },
      {
        speaker: "CKY",
        textEs: "¡Tienen envidia de mi melena leonina, cállense los dos!",
        textEn: "You're both jealous of my majestic mane, zip it!",
      },
    ]);
  }

  if (mapId.includes("bedroom")) {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "Esa pila de ropa sobre la silla ya tiene forma de humano sentado. Si la mirás de reojo de noche te va a pedir un mate.",
        textEn: "That pile of clothes on the chair looks like a seated person. Stare at it at night and it'll ask for a sip of mate.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "Al principio creí que era un golem textil centinela custodiando la alcoba real...",
        textEn: "At first I genuinely believed it was a textile sentinel golem guarding the royal chamber...",
      },
      {
        speaker: "CKY",
        textEs: "Es ropa que está 'demasiado limpia para el canasto pero demasiado sucia para el ropero'. ¡Es un limbo textil!",
        textEn: "It's clothes 'too clean for the laundry but too worn for the closet'. It's a textile limbo!",
      },
    ]);
  }

  if (mapId.includes("street") || mapId.includes("plaza")) {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "¡Mirala a la vecina espiando detrás de la persiana! Tiene el ojo pegado al vidrio como una ventosa de acuario.",
        textEn: "Look at the neighbor peeking through the blinds! Her eye is stuck to the glass like an aquarium suction cup.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "He calculado el ángulo de su mirada malévola. Sugiero desviar la trayectoria 4 pasos hacia el cantero municipal.",
        textEn: "I calculated her malevolent gaze angle. I suggest diverting trajectory 4 paces toward the flowerbed.",
      },
      {
        speaker: "CKY",
        textEs: "Si la saludo con la mano seguro finge que estaba regando un cactus de plástico.",
        textEn: "If I wave at her she'll pretend she was watering a plastic cactus.",
      },
    ]);
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "Cuidado con el caniche blanco de la esquina CKY. Mide 15 centímetros pero tiene la furia acumulada de Satanás en ayunas.",
        textEn: "Watch out for the white toy poodle on the corner CKY. It's 6 inches tall but holds the fury of fasting Satan.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "Aquel cánido miniatura ladra a una frecuencia ultrasónica capaz de desintegrar portales arcanos menores.",
        textEn: "That miniature hound barks at an ultrasonic frequency capable of shattering lesser portals.",
      },
      {
        speaker: "CKY",
        textEs: "Lo peor es que si lo pisás sin querer, el que va preso sos vos por atentar contra la fauna.",
        textEn: "Worst part is if you step on it by accident, you're the one going to jail for animal cruelty.",
      },
    ]);
  }

  if (mapId.includes("school") || mapId.includes("classroom") || mapId.includes("hallway")) {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "¿Viste las empanadas del buffet escolar? Tienen una masa tan dura que si te tiran una en la cabeza te bajan 50 puntos de HP.",
        textEn: "Did you see the school cafeteria empanadas? The dough is so rock-hard getting hit by one deals 50 HP damage.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "Corroboro la hipótesis. Aquel alimento fosilizado podría resistir un asedio orco durante tres lunas consecutivas.",
        textEn: "Hypothesis confirmed. That fossilized pastry could withstand an orc siege for three consecutive moons.",
      },
      {
        speaker: "CKY",
        textEs: "Y te las cobran como si tuvieran polvo de estrellas adentro los ladrones del buffet.",
        textEn: "And cafeteria thieves charge for them like they're sprinkled with star dust.",
      },
    ]);
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "Miralo a Mateo haciéndose el galán con la pelota... después patea un tiro libre y le emboca al vidrio de la preceptora.",
        textEn: "Look at Mateo acting like a heartthrob with the ball... then he kicks a free kick straight into the proctor's window.",
      },
      {
        speaker: "CKY",
        textEs: "Y encima le echa la culpa al viento o al césped que está 'desnivelado'. Clásico de delantero de potrero.",
        textEn: "And then blames the wind or the 'uneven grass'. Classic street soccer striker.",
      },
    ]);
  }

  if (mapId.includes("cemetery") || mapId.includes("ruins") || mapId.includes("limbo")) {
    specificPool.push([
      {
        speaker: "Ángela (Espíritu)",
        textEs: "Ahhh, el olor a cripta fresca y humedad eterna... ¡Hogar dulce hogar! Aunque la verdad le vendría bien un desodorante de ambientes Glade lavanda.",
        textEn: "Ahhh, the scent of fresh crypt and eternal moisture... Home sweet home! Though it really needs a lavender Glade air freshener.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "Los espíritus errantes de esta necrópolis son sumamente descorteses. Ninguno saluda al cruzarse por el sendero astral.",
        textEn: "The wandering spirits of this necropolis are exceedingly impolite. None offer greetings along the astral trail.",
      },
      {
        speaker: "CKY",
        textEs: "W, están muertos hace doscientos años, no van a pedirte permiso con reverencia.",
        textEn: "W, they've been dead for two centuries, they won't bow and say pardon me.",
      },
    ]);
  }

  // General banter pool fallback
  const generalPool: BanterStep[][] = [
    [
      {
        speaker: "Ángela (Espíritu)",
        textEs: "¿Sabés qué me encanta de vos CKY? Que podés estar salvando al multiverso de la destrucción cósmica y al mismo tiempo preocupándote por si dejaste la planchita prendida.",
        textEn: "Know what I love about you CKY? You can be saving the multiverse from cosmic doom while stressing over whether you left the hair straightener on.",
      },
      {
        speaker: "CKY",
        textEs: "¡Es que quema la madera del mueble Ángela! ¡Mamá me mata más rápido que la Vecina y el Limbo juntos!",
        textEn: "Because it scorches the dresser Angela! Mom would kill me faster than the Neighbor and Limbo combined!",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "Doy fe de la ferocidad de Doña Madre. Su chancletazo curvo posee propiedades balísticas que desafían la física cuántica.",
        textEn: "I attest to the ferocity of Lady Mother. Her curved flip-flop throw possesses ballistic properties defying quantum physics.",
      },
    ],
    [
      {
        speaker: "Ángela (Espíritu)",
        textEs: "Che W, si sos un espíritu cambiaformas ancestral... ¿te podés transformar en una pizza de muzzarella con faina caliente?",
        textEn: "Hey W, if you're an ancient shapeshifting spirit... can you turn into a piping hot cheese pizza with faina?",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "¡Una herejía culinaria inadmisible! Mis formas están consagradas a la heráldica de guerra: escudos, toallas y palas doradas. Jamás a los carbohidratos.",
        textEn: "An impermissible culinary heresy! My forms are consecrated to war heraldry: shields, towels, golden shovels. Never carbohydrates.",
      },
      {
        speaker: "CKY",
        textEs: "Una lástima W, con el hambre que tengo te habríamos comido en dos bocados.",
        textEn: "A shame W, as hungry as I am we would have devoured you in two bites.",
      },
    ],
    [
      {
        speaker: "Ángela (Espíritu)",
        textEs: "CKY, ¿alguna vez pensaste en cobrarle peaje a las sombras del Limbo? Con la cantidad que derrotamos por día ya nos comprábamos un auto cero kilómetro.",
        textEn: "CKY, ever thought about charging toll fees to Limbo shadows? With how many we beat daily we could buy a brand new car.",
      },
      {
        speaker: "W (Espíritu Guardián)",
        textEs: "El fisco del inframundo es implacable con las declaraciones juradas arcanas. No recomiendo la evasión impositiva espectral.",
        textEn: "The underworld tax agency is ruthless with arcane filings. I do not recommend spectral tax evasion.",
      },
      {
        speaker: "CKY",
        textEs: "Hasta en el más allá hay AFIP, no se puede creer...",
        textEn: "Even in the afterlife there's IRS, unbelievable...",
      },
    ],
  ];

  const pool = specificPool.length > 0 ? specificPool : generalPool;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
