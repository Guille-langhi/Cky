# CKY - Avances y Memoria del Proyecto

Este archivo documenta las reglas de juego, estado de desarrollo, tareas del Día 1 e interacciones implementadas para la aplicación CKY RPG / Life Sim.

---

## 🎒 Reglas del Inventario y Mochila
1. **Mochila (Mueble 1 de la Habitación de CKY)**:
   - Nombre: **Mochila** (No "mochila escolar").
   - Descripción: "Mochila de CKY para llevar porquerías."
   - Diálogo al recogerla: *"Ya tenemos la Mochila para llenarla de porquerías (+5 XP, +5 mins)."*
   - Categoría en inventario: **Acomodados / Mochila** (`category: "backpack"`).

2. **Libros y Cuadernos (Mueble 2)**:
   - Se requiere tener la Mochila en el inventario para poder guardarlos.

3. **Botella de Agua Favorita (Heladera de la Cocina)**:
   - Nombre: **Botella de Agua Favorita (Llena)**.
   - Efecto: Restaura **+30% de Sed** y **+10% de Hambre**.
   - Se puede guardar / tomar desde la Heladera de la Cocina o rellenar en la Pileta de la Cocina.

4. **Sándwich de Salame y Queso (Heladera de la Cocina)**:
   - Opción en la Heladera: **Tomar alimento**.
   - Cooldown: Se puede tomar 1 cada 6 horas reales/de juego.
   - Diálogo de CKY: *"mmmmm Mi favorito, sándwich de Salame y queso"*.
   - Se guarda en la Mochila y restaura **+40% de Hambre**.

5. **Habitación de la Madre (Peinador y Planta)**:
   - **Peinador de Mamá**: Se puede recoger el **Perfume Favorito** (restaura +50% de Perfume). CKY dice: *"Hija de p*** ¡acá esta mi perfume favorito!"*.
   - **Planta de Mamá**: Se puede recoger un **Billete de $500** escondido en la maceta. CKY dice: *"Gracias plantita"*.

---

## 📌 Tareas del Día 1 (Diario de Misiones)
1. **Ponerse el uniforme de la escuela** (👕): Ropero de la habitación (+5 XP, +5 min).
2. **Asearse en el baño** (🧼): Lavatorio o ducha (+10 XP, +10 min).
3. **Recoger la mochila** (🎒): Mueble 1 (+5 XP, +5 min).
4. **Recoger botella de agua** (🧴): Heladera de la cocina (+5 XP, +2 min).
5. **Recoger los libros de la escuela** (📚): Mueble 2 (+5 XP, +5 min).

---

## ⏰ Reloj e Interacción Temporal
- Todas las interacciones con objetos (camas, roperos, piletas, duchas, inodoros, estufas, ventanas, heladera, TV, mesas, etc.) avanzan el tiempo del reloj de forma consistente (`advanceTime(2..10 min)`).
- Acciones con cooldown de 6 horas (`checkAction6h` / `recordAction6h`):
  - Tomar alimento (sándwich de salame y queso)
  - Asearse en el baño / ducha
  - Limpiar cama / inodoro / shower
  - Rellenar botella

---

## 🦹‍♀️ Lore y Villana Principal: La Vecina
- **La Vecina** (identificada inicialmente como vecina cordial o vecina de al lado) es la **antagonista principal** y el cerebro detrás de todo lo sobrenatural y negativo que sucede en el mundo de CKY:
  - Mantiene una fachada amable o manipuladora frente a la comunidad, pero en secreto es quien abre las grietas hacia el Limbo, quien causó la tragedia de Ángela y quien invoca las sombras.
  - En el sistema de Vínculos y Compañeros aparece categorizada como **Enemiga Principal / Villana Oculta** (`category: "humano_enemigo"`).
  - Sus habilidades antagónicas incluyen manipulación mental, invocación de sombras y control del Limbo.

---

## 👥 Compañeros de CKY: Ángela y W
1. **Ángela (Espíritu Acompañante & Mejor Amiga)**:
   - Espíritu de la joven que habitaba la casa antes. Alegre, pícara, protectora y sarcástica.
   - Brinda apoyo táctico, pistas astrales y bromas constantes en situaciones cotidianas e íntimas.

2. **W (Espíritu Guardián Cambiaformas Ancestral)**:
   - Forjado en la era antigua para velar por la Heredera del Linaje (CKY).
   - Es sumamente solemne, formal, caballeroso y un poco ingenuo. Cambia de forma para estar cerca (adoptó la forma de toalla de baño en la silla).
   - Posee el conocimiento de los sellos arcanos y la ubicación del **Antiguo Tesoro Oculto** en las colinas/ruinas cercanas para financiar la renovación del guardarropa de CKY el sábado.

---

## 💎 Día 4: Ruinas Ancestrales, Tesoro, Shopping de Sábado y Revelación de Alanis
1. **Expedición Temprana al Valle de las Ruinas**:
   - Despertar a las 06:00 AM junto a Ángela y W en la habitación.
   - Viaje al mapa `ruins_valley` con pilares rúnicos, monolitos antiguos y el altar del Golem.
2. **Batalla contra el Golem Guardián**:
   - Coloso de roca que protege el sitio sagrado. Al ser derrotado libera el sello del tesoro ancestral (+120 XP).
3. **W se Transforma en Pala Sagrada**:
   - W adopta la forma de una pala dorada ancestral para excavar las duras raíces y desenterrar el cofre con **+$50.000**.
   - **Forma habitual de W**: Cuando no asume una forma específica de misión o toalla, se manifiesta permanentemente como una **bola de luz tenue** celestial con sutil brillo dorado y chispas orbitales flotando junto a CKY.
4. **Ducha con Guardia Estricta de W**:
   - Al regresar llenos de barro a la casa, CKY ordena a W hacer guardia mirando estrictamente a la pared del pasillo sin espiar.
5. **Tarde de Shopping y Guardarropa Completo**:
   - **Boutique de Moda**: Compra del **Piyama de Seda Fina** rosa y el **Vestido Elegante de Gala** de alta costura (+120 XP).
   - **Stand de Perfumería Francesa 'Nuit Éthérée'**: Compra del perfume de lujo francés (+80 XP, +100% Perfume).
   - **Tienda de Lencería Sexy**: Compra del **Conjunto de Lencería Sexy Roja de Encaje** (+120 XP).
   - Todos los atuendos quedan guardados y disponibles permanentemente en el ropero personal de la habitación.
6. **Noche y Revelación del Alma Gemela por Alanis**:
   - Al acostarse en la cama, se manifiesta **Alanis** con su halo supremo para anunciar que pronto conocerá a su alma gemela impuesta por el cosmos.
   - Se abre el modal interactivo de creación del Alma Gemela (elección de sexo/identidad, nombre, personalidad/arquetipo, avatar y color de cabello).
   - **Discusión entre CKY y Alanis**: CKY rechaza enfáticamente que los espíritus le impongan con quién compartir su vida y su corazón; Alanis le responde con firmeza que el hilo del destino ya está tejido y que sucederá inevitablemente.
   - Alanis se desvanece, se desbloquea la entrada en el diario íntimo (+150 XP) y finaliza el Día 4.

---

## 🧹 Día 5: "Limpieza Profunda" (Domingo)
1. **Despertar y Mandato Materno**:
   - Mamá despierta a CKY a los gritos exigiendo una limpieza total y exhaustiva de toda la casa y de los muebles.
2. **Misiones de Limpieza y Transformaciones de W**:
   - W se transforma en útiles arcanos de limpieza (Plumero celestial, Escoba dorada, Aspiradora arcana y Mopa purificadora).
   - **Batallas contra las alimañas**:
     - Cucarachas gigantes en el ropero/habitación.
     - Arañas de rincón en el baño/pasillo.
     - Rata escurridiza en la cocina/alacena.
   - Diálogos cómicos constantes entre CKY, Ángela y W.
3. **Tarde / Siesta de Trote y Carrera al Aeropuerto**:
   - CKY se viste con ropa deportiva (`sport`) y sale a trotar por la calle.
   - La vecina la intercepta y le propone una competencia: quien llegue primero al Aeropuerto se gana un pancho y una coca.
   - Durante el trayecto hacia el Aeropuerto ocurren batallas y obstáculos.
   - La vecina hace trampas mágicas oscuras y CKY pierde la carrera en la pista/terminal del Aeropuerto, debiendo pagar el pancho y la coca.
4. **Regreso Sudoroso y Ducha**:
   - CKY regresa a casa empapada en sudor; Ángela hace comentarios picantes y burlones sobre su aspecto y olor a tigre transpirado, exigiéndole que se bañe.
   - CKY se da una ducha refrescante.
5. **Prueba de Ropa y Sesión Cómica de Fotos Sexys**:
   - En la habitación, CKY se prueba las prendas nuevas compradas el sábado.
   - Ángela reta a CKY a ponerse la lencería roja de encaje sexy y posar para fotos en el celular.
   - Se genera una escena sumamente cómica donde W (como orbe celestial) se tapa los ojos de la vergüenza cósmica y las fotos quedan guardadas en la galería del celular.
   - CKY se pone el piyama de seda fina, se acuesta en la cama, se desbloquean las entradas del diario (+150 XP) y concluye el Día 5.

---

## ⚔️ Día 6: "La Forma Oscura, el Alma Gemela Híbrida y el Lunes Escolar"
1. **Aparición de la Forma Oscura y Batalla RPG**:
   - Al despertar en la madrugada del Lunes (05:45 AM), la habitación tiembla con niebla púrpura y surge una **Forma Oscura / Sombra Encapuchada**.
   - Se desata una batalla RPG donde el equipo (CKY, Ángela y W) derrota fácilmente a la sombra con ataques coordinados.
2. **Intervención Divina de Alanis y Revelación**:
   - Justo cuando CKY y Ángela van a asestar el golpe final para destruir a la figura, **Alanis** desciende con resplandor dorado y los detiene.
   - Alanis disipa las sombras y revela que la figura es el **Alma Gemela de CKY** (personalizado en el Día 4).
   - Explica su condición única: es **MITAD HUMANO y MITAD ESPÍRITU** (un híbrido astral capaz de cruzar dimensiones). La coraza de sombra era solo una protección del viaje interdimensional por el Limbo.
3. **Incorporación al Equipo de Compañeros**:
   - El Alma Gemela se une formalmente a los compañeros (`companions`) con habilidades híbridas de resonancia y defensa cósmica (+150 XP).
4. **Rutina Matutina para la Escuela y Comentarios Cómicos de Ángela**:
   - Son las 06:30 AM del Lunes y CKY debe prepararse para ir al colegio:
     - **Ropero (Uniforme)**: Cambiarse al uniforme escolar; Ángela bromea pidiéndole al alma gemela que no espie o que se sonroje su parte humana.
     - **Baño (Aseo)**: Lavarse la cara y dientes; Ángela bromea para que no salude a su amor con aliento de dragón.
     - **Mochila (Mueble 1)**: Recoger la mochila para llenar de cuadernos y cartas de amor.
     - **Heladera (Agua y Sándwich)**: Recoger la botella y sándwich de salame; bromas sobre alimentar la mitad humana del muchacho.
     - **Mueble 2 (Libros)**: Recoger los libros de clase.
     - **Mamá en el Living/Cocina**: Mamá nota a CKY radiante y bien arreglada un lunes temprano.
     - **Salida a la Calle**: Salida hacia la parada del colectivo con el equipo completo.

5. **Viaje Hostil en Colectivo y Escuela Afectada**:
   - Chofer y compañeros (Jaz, Nico, Juan, Abril y la Vecina) actúan agresivos y hostiles hacia CKY bajo influjo mental de la Vecina.
   - En la escuela, profesores y la preceptora muestran rechazo irracional.

6. **Cónclave en el Baño de Chicas y Alerta en el Patio**:
   - Reunión secreta del grupo (CKY, Alma Gemela, Ángela y W) en el Baño de Chicas donde descubren que las mentes escolares están directamente parasitadas por espíritus oscuros de la Vecina.
   - Por la ventana descubren que Mateo está totalmente poseído en la cancha de fútbol del patio tirando pelotazos con fuego sombrío (+90 XP).

7. **Batalla en el Patio contra Mateo Poseído (Duelo de Fútbol Sombrío)**:
   - CKY y su equipo van directamente al patio a rescatar a Mateo, quien lanza balones con fuego sombrío bajo posesión de la Vecina.
   - Gran batalla RPG por turnos con CKY, Ángela, W y el Alma Gemela.
   - Al vencerlo (+200 XP), la sombra que controlaba a Mateo es destruida y Mateo recupera la conciencia agradecido; sin embargo, el Alma Gemela advierte que el resto de los alumnos (Jaz, Nico, Juan, Abril) y docentes siguen parasitados por espíritus oscuros individuales de la Vecina.

8. **Tarde: La Confrontación con Alanis y la Cátedra de Besos de Ángela**:
   - Alanis se manifiesta a solas en la habitación y le exige a CKY ir a la casa de su gemelo a completar la comunión física con un beso en los labios para estabilizar su cuerpo.
   - Discusión acalorada entre CKY y Alanis; CKY cede por su pueblo.
   - Siesta reparadora hasta las 17:00, ducha rápida y carrera en cueros al olvidar la toalla por nervios.
   - En el ropero, CKY confiesa que jamás besó a nadie y Ángela le da una cómica cátedra de besos en 3 reglas.

9. **Visita a la Casa del Gemelo, Beso Tenso y Grimorio**:
   - Encuentro tenso y frío en la casa del Alma Gemela; se produce el beso de comunión cósmica (+100 XP).
   - En su habitación, CKY ve un portarretratos con la foto de él y la Vecina sonriendo y abrazados como viejos amigos.
   - El Alma Gemela le entrega el **Grimorio de las Sombras Escolares** con los nombres y debilidades elementales de todos los poseídos (+200 XP).

10. **Regreso a Casa, Confesión, Entrega del Grimorio a W y Noche**:
    - En su habitación, CKY confiesa a Ángela y W lo incómoda que se sintió y les revela la turbia foto con la Vecina.
    - CKY le entrega el Grimorio a W para que lo estudie y descifre con su sabiduría ancestral toda la noche.
    - CKY se pone el piyama de seda, se acuesta en su cama a descansar (+150 XP), se desbloquean los diarios y concluye triunfalmente el Día 6.

---

## ⚡ Día 7: "Injusticia, el Laberinto del Sótano y el Laboratorio Escolar" (Martes)
1. **Despertar y Estrategia del Grimorio Descifrado**:
   - Despertar a las 06:00 AM del Martes con W, Ángela y el Alma Gemela.
   - W anuncia que pasó toda la noche descifrando el Grimorio y que deben atacar a los poseídos en orden de menor a mayor para desmantelar la red de corrupción sin sobrecargarse.
   - Rutina matutina habitual de CKY (uniforme escolar, mochila, agua fresca, sándwich de salame y libros).
2. **La Injusticia en la Escuela (Expulsión por la Vecina)**:
   - Al llegar a la escuela, CKY va a la oficina de dirección (`director_office`).
   - El Director Don Héctor (con ojos púrpuras bajo hipnosis) le notifica formalmente a CKY su **expulsión** de la escuela por orden del "Comité Vecinal Especial" presidido por la Vecina (+50 XP).
   - Indignación total del grupo; descubren perturbaciones oscuras en el subsuelo.
3. **El Laberinto del Sótano Escolar (`school_basement`)**:
   - Acceso secreto desde el pasillo principal de la escuela.
   - **Misión 1**: Desactivar la válvula de vapor hirviente para habilitar el paso (+50 XP).
   - **Batalla RPG**: Espectro de las Calderas (derrotado con debilidades elementales reveladas por W, +120 XP).
   - **Misión 2**: Encontrar la Llave de Mantenimiento en la caja de herramientas (+50 XP).
   - **Misión 3**: Destrabar el portón enrejado con la llave de hierro (+50 XP).
   - **Batalla RPG**: Sombra de Discordia (derrotada con resonancia de luz y amor, +150 XP).
   - **Misión 4**: Desactivar y purificar el Generador Arcano del Limbo que alimentaba el campo de fuerza de la puerta del laboratorio (+80 XP).
4. **Laboratorio Escolar (`school_laboratory`), Batalla de Boss y Liberación**:
   - Infiltración en el laboratorio escolar donde el **Espíritu Alquimista Oscuro** tenía hipnotizados al Profesor Montenegro y a Abril sintetizando veneno sombrío para el agua escolar.
   - Gran batalla RPG contra el Alquimista Oscuro.
   - Victoria épica (+300 XP): el Profesor Montenegro y Abril son liberados de la posesión.
   - El profesor Montenegro se compromete a impugnar inmediatamente la expulsión falsa ante el Consejo Escolar para restituir a CKY con honores.

5. **Regreso a Casa y Nueva Discusión con Alanis (El Mandato de la Lencería Roja)**:
   - Al regresar a casa y entrar a la habitación, **Alanis** se materializa en un resplandor astral.
   - Discute acaloradamente con CKY y le impone una nueva exigencia innegociable: debe ir de inmediato a la casa de su gemelo, pero esta vez llevando consigo el **Conjunto de Lencería Sexy Roja de encaje**.
   - CKY se reúne con Ángela y W; Ángela lanza comentarios cómicos y fuera de lugar burlándose de la situación.
   - CKY debe asearse en la ducha del baño para quitarse el hollín del sótano (+50 XP, +10 min).
   - En el ropero, se pone la **ropa común** y guarda la **lencería roja en la mochila** (+50 XP).

6. **Visita a la Casa del Gemelo, Beso y Crítica Ácida**:
   - CKY va a la casa de su alma gemela (`soulmate_house`).
   - El gemelo la recibe y le pide un beso en los labios para sintonizar los circuitos de defensa astral.
   - CKY accede al beso, pero al separarse el gemelo suelta un comentario desubicado y arrogante criticando cómo besa (*"besás como una estatua de yeso o una heladera desenchufada"*).
   - Indignada, CKY amenaza con marcharse, pero el gemelo le suplica que se quede diciendo que interceptó información clasificada de la Vecina.

7. **El Chantaje del Desfile en Lencería Roja**:
   - El gemelo le revela que solo le contará la información si va al baño de su casa, se pone la lencería roja de encaje que trajo en la mochila y hace un desfile en el living.
   - CKY sube al baño (`soulmate_bathroom`), se cambia a la lencería roja y desfila con orgullo y furia en la sala.
   - El gemelo queda boquiabierto y fascinado; Ángela suelta carcajadas y comentarios desopilantes.

8. **Revelación del Gran Asalto Coordinado y Noche**:
   - El gemelo revela el plan maestro de la Vecina para el Miércoles (ataque simultáneo en 4 puntos neurálgicos: Plaza Principal, Hospital Municipal, Terminal de Ómnibus y Centro Comercial) (+100 XP).
   - CKY vuelve al baño del gemelo, se vuelve a poner su ropa común y regresa a su casa.
   - En su habitación se reúne con W y Ángela para trazar la estrategia defensiva (+100 XP).
   - CKY se acuesta en su cama con su piyama de seda a descansar (+150 XP), se completan los diarios del Día 7 y culmina la jornada.

---

## ⚔️ Día 8: "Ataque Final" (Miércoles • Fin del Capítulo 1)
1. **Despertar y Consejo de Guerra**:
   - CKY despierta con W y Ángela en la habitación a las 07:00 AM del Miércoles.
   - W advierte que la Vecina lanzó el ataque coordinado sobre 4 puntos neurálgicos de la ciudad: **Plaza Principal**, **Hospital Municipal**, **Terminal de Ómnibus** y **Centro Comercial**.
   - CKY no puede ir al colegio debido a la expulsión previa, por lo que debe vestirse con **ropa casual cómoda** en el ropero de la habitación.
2. **Salida a la Calle y Encuentro Turbio con el Gemelo**:
   - Al salir a la calle, el grupo se topa con el espíritu del Alma Gemela, quien actúa evasivo, frío y sumamente extraño, apurándolos a dividirse o ir a los focos de combate.
3. **Rastreador Táctico de Objetivos en la UI**:
   - Se activa el componente flotante interactivo `<Day8ObjectivesTracker />` en pantalla con libertad total para elegir el orden de defensa.
   - Permite desplazarse a cada mapa (`plaza_principal`, `hospital_municipal`, `bus_terminal`, `shopping_mall`).
4. **Batallas de Asedio en las 4 Locaciones**:
   - **Plaza Principal**: Enfrentamiento contra el **Coloso Sombrío del Parque** (+200 XP).
   - **Hospital Municipal**: Enfrentamiento contra el **Espectro de la Peste del Limbo** (+200 XP).
   - **Terminal de Ómnibus**: Enfrentamiento contra el **Leviatán del Asfalto** (+200 XP).
   - **Centro Comercial**: Enfrentamiento contra la **Gárgola de Cristal** (+200 XP).
5. **Confrontación en la Puerta de la Vecina y Gran Traición**:
   - Al derrotar al último jefe, W aconseja ir directamente a la casa de la vecina Paula en la calle.
   - Encuentran a la vecina en la puerta; W inicia el primer ataque astral, pero el **Alma Gemela interviene y destruye fulminantemente a W**.
   - Acto seguido, el gemelo **destruye a Ángela** entre risas despiadadas.
   - El gemelo confiesa que siempre fue un leal servidor de la Vecina, que solo estuvo con CKY por obligación y conveniencia táctica para debilitar sus defensas.
6. **Supernova Cósmica de CKY**:
   - Dominada por la furia y el dolor desgarrador por sus dos amigos perdidos, CKY canaliza el poder primordial de su linaje en una supernova dorada que **desintegra al gemelo traidor** y deja a la Vecina inconsciente con la casa destruida.
7. **La Renuncia ante Alanis y Vuelta a la Normalidad**:
   - En su habitación solitaria, desciende **Alanis** intentando convencer a CKY de continuar con el linaje celestial.
   - CKY rechaza de raíz el destino impuesto, renuncia a todo poder astral y elige volver a ser una chica normal de secundaria.
   - Alanis se desvanece; CKY llora a solas en su cama desahogando su dolor por Ángela y W.
8. **Cinemática de Fin del Capítulo 1 (Creado por 10print_)**:
   - Se despliega la cinemática interactiva de cierre con música nostálgica, créditos y epílogo que celebra la travesía desde el primer sándwich de salame hasta la batalla final.

---

## 📱 Conversión a Android y Exclusividad Móvil
1. **Juego Exclusivo para Android**:
   - Se eliminó toda la interfaz y pestañas de PC / Pygame workspace.
   - El juego está concebido y estructurado 100% para dispositivos Android.
   - En navegadores de escritorio (PC), se ejecuta encapsulado dentro de un **Simulador de Dispositivo Android (`AndroidDeviceFrame`)** con chasis de smartphone, barra de estado de Android (reloj en tiempo real, 5G, Wi-Fi, batería 100%), cámara punch-hole y barra de gestos, alertando que está optimizado para celulares e incluyendo código QR para abrir e instalar en el teléfono con la cámara.
   - En pantallas móviles reales o modo fullscreen se adapta automáticamente al 100% de la pantalla táctil con el Gamepad virtual activo.

2. **PWA Instalable (Progressive Web App)**:
   - Plugin `vite-plugin-pwa` configurado en `vite.config.ts` con Service Worker (`sw.js`) y precaching de assets para funcionamiento offline.
   - Manifiesto Web (`manifest.webmanifest`) con `display: "standalone"`, `orientation: "any"`, colores temáticos (`#1e1b4b` / `#0f172a`), y paquete de iconos en `public/` (192x192, 512x512, maskable y apple-touch-icon).
   - Hook de detección e instalación reactiva `usePWAInstall.ts`.
   - Botón interactivo **"ANDROID"** en la barra superior (`Header.tsx`) y código QR en el modal para abrir al instante en Android.

3. **Capacitor para APK Nativo**:
   - Archivo de configuración `capacitor.config.json` inicializado con App ID `com.cky.rpgcreator` y nombre `CKY - 8-Bit RPG Creator`.
   - Scripts agregados a `package.json`: `npm run cap:build` y `npm run cap:android`.
   - Permite compilar a APK tradicional de Android Studio o distribuir como paquete de Google Play Store.

4. **Controles Táctiles y Experiencia Móvil**:
   - Gamepad virtual completo (`VirtualGamepad.tsx`) con D-Pad, botón de acción, botón de menú/mochila y retroalimentación háptica suave (`navigator.vibrate`).
   - Viewport configurado para pantalla completa y bloqueo de zoom accidental (`viewport-fit=cover`, `user-scalable=no`).

5. **Modernización y Optimizaciones Nativas para Android**:
   - **Screen Wake Lock Activo**: Mantiene la pantalla encendida automáticamente mientras se juega o se leen diálogos para evitar que el teléfono se bloquee solo.
   - **Almacenamiento Persistente (`navigator.storage.persist`)**: Protege las partidas guardadas para que Android no las limpie por falta de espacio temporal.
   - **Ahorro de Batería en Segundo Plano**: Pausa automáticamente el bucle de renderizado y suspende el motor de audio WebAudio cuando la app se minimiza o la pantalla se apaga.
   - **Motor Háptico 2.0 (`androidMobileBridge.ts`)**: Vibración adaptativa diferenciada para pasos, botones A/B, recolección de objetos, avance de diálogo, subidas de nivel, impactos de combate y la supernova final.
   - **Tap-To-Move Táctil y Turbo Sprint**: Desplazamiento inteligente por toque en el mapa con pathfinding BFS y modo correr/turbo activable mediante botón o doble toque rápido.
   - **Avance Táctil de Diálogos e Intros**: Salto y avance fluido tocando cualquier sector de la pantalla sin depender de teclado.

