import React, { useState } from "react";
import { Zap, Sparkles, Skull, Flame, HeartCrack, Swords, ArrowRight, ShieldAlert } from "lucide-react";
import { Language, SoulmateInfo } from "../types";
import RetroCinematicModal from "./RetroCinematicModal";

interface Day8NeighborClimaxModalProps {
  language: Language;
  soulmateInfo: SoulmateInfo | null;
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
  onComplete: () => void;
}

export default function Day8NeighborClimaxModal({
  language,
  soulmateInfo,
  playSound,
  onComplete,
}: Day8NeighborClimaxModalProps) {
  const isEs = language === "es";
  const soulmateName = soulmateInfo?.name || "Kael";

  // Step 1: Neighbor confrontation
  // Step 2: W prepares attack
  // Step 3: Soulmate betrays & destroys W
  // Step 4: Soulmate destroys Angela
  // Step 5: Soulmate confession
  // Step 6: CKY's ultimate wrath
  // Step 7: Aftermath & return home
  const [step, setStep] = useState<number>(1);
  const [isSupernovaAnimating, setIsSupernovaAnimating] = useState<boolean>(false);
  const [showSupernovaCinematic, setShowSupernovaCinematic] = useState<boolean>(false);

  const advanceStep = () => {
    playSound?.(550, "sine", 0.15);
    setStep((s) => s + 1);
  };

  const handleWAttack = () => {
    playSound?.(440, "triangle", 0.3);
    setStep(3); // leads directly to betrayal cutscene
    setTimeout(() => {
      playSound?.(150, "sawtooth", 0.6); // heavy strike sound
    }, 400);
  };

  const handleAngelaRetaliation = () => {
    playSound?.(750, "sine", 0.3);
    setStep(4);
    setTimeout(() => {
      playSound?.(180, "sawtooth", 0.5); // tragic slash sound
    }, 400);
  };

  const handleSupernovaBlast = () => {
    setIsSupernovaAnimating(true);
    playSound?.(880, "square", 0.8);
    setTimeout(() => {
      playSound?.(100, "sawtooth", 1.2); // explosion
      setShowSupernovaCinematic(true);
    }, 600);
  };

  const handleFinishSupernovaCinematic = () => {
    setShowSupernovaCinematic(false);
    setIsSupernovaAnimating(false);
    setStep(7);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in font-mono select-none">
      <div className="bg-slate-900 border-2 border-red-500/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-purple-950 to-slate-950 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-950 border border-red-500/60 rounded-lg text-red-400">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-red-300 tracking-wider uppercase">
                {isEs ? "CLÍMAX • LA PUERTA DE LA VECINA" : "CLIMAX • THE NEIGHBOR'S DOOR"}
              </h2>
              <span className="text-[10px] text-slate-400">
                {isEs ? "Confrontación Final de la Ciudad" : "Final City Confrontation"}
              </span>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-bold">Paso {step}/7</span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col justify-center">
          {/* STEP 1: Front of Neighbor's Door */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2">🦹‍♀️</div>
              <h3 className="text-lg font-bold text-red-300">
                {isEs ? "Paula (La Vecina) te espera en la puerta" : "Paula (The Neighbor) waits at the door"}
              </h3>
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-red-400 font-bold">
                  🦹‍♀️ Paula:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«Miren quién llegó... la pequeña CKY con sus dos fantasmitas patéticos. ¿Creyeron que derrotar a mis heraldos en la plaza o en el hospital iba a detener el ritual? La brecha con el Limbo ya está abierta.»"
                      : "«Look who arrived... little CKY with her two pathetic ghosts. Did you think defeating my heralds would stop the ritual? The Limbo rift is already wide open.»"}
                  </span>
                </p>
                <p className="text-purple-400 font-bold">
                  👧 CKY:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«¡Se te terminó la farsa, Paula! Causaste la muerte de Ángela, hipnotizaste a la escuela y abriste el Limbo. ¡Vas a pagar por todo lo que hiciste!»"
                      : "«Your farce is over, Paula! You caused Angela's death, hypnotized the school and opened the Limbo. You're going to pay for everything!»"}
                  </span>
                </p>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-900/40 active:scale-95"
              >
                <span>{isEs ? "W DA UN PASO AL FRENTE" : "W STEPS FORWARD"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: W prepares attack */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2 animate-bounce">🛡️✨</div>
              <h3 className="text-lg font-bold text-amber-300">
                {isEs ? "W Despliega el Poder Celestial Ancestral" : "W Unfurls Ancient Celestial Power"}
              </h3>
              <div className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-amber-400 font-bold">
                  🛡️ W:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«¡Por el honor del Linaje Antiguo de mi Señora Heredera! ¡No permitiré que sigáis envenenando este mundo con vuestra hechicería oscura, Paula! ¡Recibid el Rayo Purificador de los Ancestros!»"
                      : "«By the honor of my Lady's Ancient Lineage! I shall not permit you to continue poisoning this realm, Paula! Receive the Purifying Ray of the Ancients!»"}
                  </span>
                </p>
                <p className="text-slate-400 italic">
                  {isEs
                    ? "W concentra todas sus partículas de luz dorada en un orbe resplandeciente frente a Paula..."
                    : "W focuses all his golden light particles into a shining orb facing Paula..."}
                </p>
              </div>

              <button
                onClick={handleWAttack}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>{isEs ? "LANZAR EL RAYO PURIFICADOR" : "UNLEASH PURIFYING RAY"}</span>
              </button>
            </div>
          )}

          {/* STEP 3: Soulmate Betrayal & Destruction of W */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2 animate-pulse text-red-500">💔💥</div>
              <h3 className="text-lg font-black text-red-500 uppercase tracking-wider">
                {isEs ? "¡¡TRAICIÓN!! ¡W ES DESTRUIDO!" : "BETRAYAL!! W IS DESTROYED!"}
              </h3>
              <div className="p-4 bg-red-950/60 border border-red-500/60 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-red-300 font-bold">
                  🌑 ¡Un tajo de energía del vacío surge desde las sombras a espaldas de W!
                </p>
                <p className="text-slate-100">
                  {isEs
                    ? `¡El espíritu de ${soulmateName} (el alma gemela) aparece de repente con ojos negros como la noche y clava una lanza de sombras atravesando el núcleo celestial de W!`
                    : `${soulmateName} (your soulmate) suddenly appears from behind with pitch-black eyes, driving a shadow lance right through W's celestial core!`}
                </p>
                <p className="text-amber-300 font-bold italic">
                  🛡️ W:{" "}
                  <span className="font-normal text-amber-200">
                    {isEs
                      ? "«¡¡Aaaaaagh!!... Señora... CKY... perdonadme... proteged... vuestro... corazón...»"
                      : "«Aaaaaagh!!... Lady... CKY... forgive me... protect... your... heart...»"}
                  </span>
                </p>
                <p className="text-slate-400 italic">
                  {isEs
                    ? "El orbe dorado de W se quiebra en mil fragmentos brillantes que se desvanecen en el aire como ceniza estelar... W ha muerto."
                    : "W's golden orb shatters into a thousand fading sparks... W is dead."}
                </p>
              </div>

              <button
                onClick={handleAngelaRetaliation}
                className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950 active:scale-95"
              >
                <span>{isEs ? "¡¡ÁNGELA SE LANZA AL ATAQUE!!" : "ANGELA RUSHES TO ATTACK!!"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4: Destruction of Angela */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2 text-purple-400">👻💨</div>
              <h3 className="text-lg font-black text-purple-400 uppercase tracking-wider">
                {isEs ? "¡¡ÁNGELA ES DESTRUIDA!!" : "ANGELA IS DESTROYED!!"}
              </h3>
              <div className="p-4 bg-purple-950/60 border border-purple-500/60 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-pink-300 font-bold">
                  👻 Ángela:{" "}
                  <span className="text-pink-200 font-normal">
                    {isEs
                      ? `«¡¡HIJO DE P***!! ¡¡TRAIDOR ASQUEROSO, MATASTE A W!! ¡¡TE VOY A MATAR!!»`
                      : `«YOU BASTARD!! YOU TRAITOR, YOU KILLED W!! I'LL TEAR YOU APART!!»`}
                  </span>
                </p>
                <p className="text-slate-300">
                  {isEs
                    ? `Ángela se abalanza con sus garras astrales sobre ${soulmateName}. Pero ${soulmateName} levanta la mano fríamente y desata una guadaña oscura que corta a Ángela en el aire.`
                    : `Angela lunges at ${soulmateName} with astral claws. But ${soulmateName} coldly raises his hand, unleashing a dark scythe cleaving Angela in midair.`}
                </p>
                <p className="text-pink-300 font-bold italic">
                  👻 Ángela:{" "}
                  <span className="font-normal text-pink-200">
                    {isEs
                      ? "«¡¡Aaaah!!... CKY... fue... fue re lindo ser tu amiga... gracias por el sándwich en el cementerio... y por las risas... cuidate... mucho...»"
                      : "«Aaaah!!... CKY... it was... so beautiful being your friend... thanks for the cemetery sandwich... and the laughs... take care...»"}
                  </span>
                </p>
                <p className="text-slate-400 italic">
                  {isEs
                    ? "La forma etérea de Ángela se disuelve en una niebla violeta que desaparece para siempre... Ángela ha muerto."
                    : "Angela's ethereal form dissolves into violet mist, vanishing forever... Angela is gone."}
                </p>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-3 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950 active:scale-95"
              >
                <span>{isEs ? "CKY EN SHOCK MIRA AL GEMELO" : "CKY IN SHOCK LOOKS AT SOULMATE"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 5: Soulmate's Cold Confession */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2">👤🖤</div>
              <h3 className="text-lg font-black text-slate-100">
                {isEs ? `La Confesión Cruel de ${soulmateName}` : `${soulmateName}'s Cruel Confession`}
              </h3>
              <div className="p-4 bg-slate-950/90 border border-slate-700 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-amber-400 font-bold">
                  👧 CKY:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? `«¿Por qué...? ¡Eras mi alma gemela! ¡Alanis me prometió que estábamos unidos por el hilo del destino! ¡Los mataste a los dos!»`
                      : `«Why...? You were my soulmate! Alanis promised we were tied by the thread of fate! You killed them both!»`}
                  </span>
                </p>
                <p className="text-indigo-400 font-bold">
                  👤 {soulmateName}:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«Qué ingenua sos, CKY. Siempre estuve del lado de Paula. Toda esa farsa del alma gemela, el beso torpe, la visita a mi casa, el desfile en lencería roja... todo fue una comedia barata para que te confiaras y no interfirieras mientras preparábamos el asalto coordinado de hoy. Solo estuve con vos por pura obligación y mandato de Paula. Para mí no sos absolutamente nada.»"
                      : "«How naive you are, CKY. I was always on Paula's side. That entire soulmate farce, the awkward kiss, the visit, the runway in red lingerie... all a cheap comedy to keep you distracted while we prepared today's siege. I was only with you out of obligation to Paula. You are nothing to me.»"}
                  </span>
                </p>
                <p className="text-red-400 font-bold">
                  🦹‍♀️ Paula:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«Bien hecho, muchacho. Ahora deshagámonos de esta molestia de una vez por todas.»"
                      : "«Well done, boy. Now let's dispose of this nuisance once and for all.»"}
                  </span>
                </p>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950 active:scale-95 animate-pulse"
              >
                <Flame className="w-4 h-4" />
                <span>{isEs ? "LA FURIA DE CKY ESTALLA" : "CKY'S WRATH ERUPTS"}</span>
              </button>
            </div>
          )}

          {/* STEP 6: CKY's Wrath & Supernova Blast */}
          {step === 6 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-7xl mb-2 animate-bounce">⚡🔥💥</div>
              <h3 className="text-xl font-black text-yellow-400 uppercase tracking-widest animate-pulse">
                {isEs ? "¡¡LA FURIA ASTRAL DEFINITIVA!!" : "ULTIMATE ASTRAL WRATH!!"}
              </h3>
              <div className="p-4 bg-gradient-to-b from-red-950 via-slate-950 to-purple-950 border-2 border-yellow-400/80 rounded-2xl text-xs text-slate-100 text-left space-y-3 leading-relaxed">
                <p className="text-yellow-300 font-black text-sm">
                  👧 CKY:{" "}
                  <span className="text-white font-bold">
                    {isEs
                      ? "«Mataron a W que dio su vida por mí... Mataron a Ángela que era mi única amiga real... Y se burlaron de mis sentimientos...»"
                      : "«You killed W who gave his life for me... You killed Angela who was my only real friend... And you mocked my feelings...»"}
                  </span>
                </p>
                <p className="text-red-400 font-extrabold text-base tracking-wide text-center uppercase">
                  {isEs ? "«¡¡¡NO SE LOS VOY A PERDONAR NUNCA EN MI VIDA!!!»" : "«I WILL NEVER FORGIVE YOU IN MY LIFE!!!»"}
                </p>
                <p className="text-slate-300 text-center italic text-[11px]">
                  {isEs
                    ? "Las lágrimas de CKY se convierten en llamaradas cósmicas. Un resplandor cegador de supernova estalla desde su pecho..."
                    : "CKY's tears ignite into cosmic flames. A blinding supernova erupts from her chest..."}
                </p>
              </div>

              <button
                onClick={handleSupernovaBlast}
                disabled={isSupernovaAnimating}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 via-red-600 to-purple-600 hover:from-yellow-400 hover:to-purple-500 text-slate-950 font-black rounded-2xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-red-500/30 active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>
                  {isSupernovaAnimating
                    ? (isEs ? "DESINTEGRANDO AL TRAIDOR..." : "DISINTEGRATING TRAITOR...")
                    : (isEs ? "¡DESATAR SUPERNOVA Y DESTRUIR AL TRAIDOR!" : "UNLEASH SUPERNOVA & DESTROY TRAITOR!")}
                </span>
              </button>
            </div>
          )}

          {/* STEP 7: Aftermath & Return Home */}
          {step === 7 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2">🌫️🏚️</div>
              <h3 className="text-lg font-bold text-slate-200">
                {isEs ? "El Silencio de la Calle Vacía" : "The Silence of the Empty Street"}
              </h3>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 text-left space-y-3 leading-relaxed">
                <p className="text-emerald-400 font-bold">
                  ✨ La explosión astral de CKY desintegró a {soulmateName} por completo en una nube de ceniza cósmica.
                </p>
                <p className="text-slate-300">
                  {isEs
                    ? "La onda expansiva estrelló a Paula contra la pared de su casa, dejándola inconsciente en el suelo y sellando la grieta del Limbo."
                    : "The shockwave slammed Paula against her door, knocking her unconscious on the pavement and sealing the Limbo rift."}
                </p>
                <p className="text-slate-400 italic">
                  {isEs
                    ? "La calle queda en un silencio sepulcral. No está W. No está Ángela. Solo el viento frío agitando el cabello de CKY."
                    : "The street falls dead silent. W is gone. Angela is gone. Only the cold wind blowing CKY's hair."}
                </p>
                <p className="text-purple-300 font-bold">
                  👧 CKY:{" "}
                  <span className="text-slate-300 font-normal">
                    {isEs
                      ? "«Tengo que... volver a casa... a mi cuarto...»"
                      : "«I have to... go home... to my room...»"}
                  </span>
                </p>
              </div>

              <button
                onClick={onComplete}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <span>{isEs ? "REGRESAR A LA HABITACIÓN" : "RETURN TO BEDROOM"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showSupernovaCinematic && (
        <RetroCinematicModal
          type="day8_supernova"
          language={language}
          soulmateInfo={soulmateInfo}
          onClose={handleFinishSupernovaCinematic}
          onFinish={handleFinishSupernovaCinematic}
        />
      )}
    </div>
  );
}
