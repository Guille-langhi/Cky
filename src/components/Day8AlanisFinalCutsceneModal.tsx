import React, { useState } from "react";
import { Sparkles, HeartCrack, ArrowRight, UserMinus, Moon } from "lucide-react";
import { Language } from "../types";

interface Day8AlanisFinalCutsceneModalProps {
  language: Language;
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
  onComplete: () => void;
}

export default function Day8AlanisFinalCutsceneModal({
  language,
  playSound,
  onComplete,
}: Day8AlanisFinalCutsceneModalProps) {
  const isEs = language === "es";

  // Step 1: Alanis appears praising CKY
  // Step 2: CKY confronts Alanis about W, Angela & Soulmate
  // Step 3: CKY renounces everything
  // Step 4: Alanis tries to persuade her
  // Step 5: Alanis yields & declares CKY normal
  // Step 6: CKY weeps alone in her room
  const [step, setStep] = useState<number>(1);

  const advanceStep = () => {
    playSound?.(520, "sine", 0.2);
    setStep((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in font-mono select-none">
      <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-purple-950 to-slate-950 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-950 border border-amber-500/60 rounded-lg text-amber-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-300 tracking-wider uppercase">
                {isEs ? "ESCENA FINAL • LA HABITACIÓN DE CKY" : "FINAL SCENE • CKY'S BEDROOM"}
              </h2>
              <span className="text-[10px] text-slate-400">
                {isEs ? "El Descenso de Alanis y la Renuncia al Linaje" : "Alanis's Descent & Renunciation"}
              </span>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-bold">{step}/6</span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col justify-center">
          {/* STEP 1: Alanis Manifests */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2 filter drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse">
                👑✨
              </div>
              <h3 className="text-lg font-bold text-amber-300">
                {isEs ? "Alanis se Materializa en la Habitación" : "Alanis Materializes in the Bedroom"}
              </h3>
              <div className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-amber-400 font-bold">
                  👑 Alanis (Soberana Astral):{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«CKY... has cumplido tu destino cósmico con un poder inigualable. Has erradicado la amenaza de la traición y sellado la grieta del Limbo. Tu nombre quedará grabado con fuego dorado en los anales del cosmos...»"
                      : "«CKY... you have fulfilled your cosmic destiny with unparalleled power. You eradicated the threat and sealed the Limbo rift. Your name shall be engraved in golden fire across cosmic annals...»"}
                  </span>
                </p>
                <p className="text-slate-400 italic">
                  {isEs
                    ? "CKY permanece de pie junto a su cama, con la mirada perdida y lágrimas corriendo en silencio por sus mejillas..."
                    : "CKY stands beside her bed, gaze lost, silent tears streaming down her cheeks..."}
                </p>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <span>{isEs ? "RESPONDER A ALANIS" : "RESPOND TO ALANIS"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: CKY confronts Alanis */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2 text-red-400">👧💔</div>
              <h3 className="text-lg font-bold text-red-300">
                {isEs ? "El Dolor y la Verdad de CKY" : "CKY's Pain and Truth"}
              </h3>
              <div className="p-4 bg-slate-950/90 border border-red-500/30 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-purple-400 font-bold">
                  👧 CKY:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«¿Hazaña? ¿Nombre grabado en el cosmos? ¡Perdí a W! El único que me cuidaba de verdad se convirtió en ceniza frente a mis ojos. ¡Perdí a Ángela! Mi única amiga real, la que me hacía reír... la destrozaron por mi culpa.»"
                      : "«Achievement? Name in the cosmos? I lost W! The only one who truly watched over me turned to ash before my eyes. I lost Angela! My only real friend, who made me laugh... shattered because of me.»"}
                  </span>
                </p>
                <p className="text-purple-400 font-bold">
                  👧 CKY:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«¡Y el tipo que me impusiste como mi 'alma gemela predestinada' era un asesino traidor que siempre estuvo del lado de la Vecina y solo me usó por obligación! Todo esto pasó por tu culpa y por este estúpido linaje que jamás pedí tener.»"
                      : "«And the person you forced as my 'predestined soulmate' was a traitorous killer who was always on the Neighbor's side and only used me out of obligation! All of this happened because of you and this stupid lineage I never asked for.»"}
                  </span>
                </p>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <span>{isEs ? "LA RENUNCIA TOTAL" : "TOTAL RENUNCIATION"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: CKY renounces everything */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2 text-yellow-400">⚡🚫</div>
              <h3 className="text-xl font-black text-yellow-400 tracking-wider uppercase">
                {isEs ? "«RENUNCIO A TODO»" : "«I RENOUNCE EVERYTHING»"}
              </h3>
              <div className="p-4 bg-slate-950/90 border-2 border-yellow-500/50 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-yellow-300 font-extrabold text-sm">
                  👧 CKY:{" "}
                  <span className="text-white font-bold">
                    {isEs
                      ? "«RENUNCIO A TODO. No quiero ser la elegida. No quiero tus espíritus, no quiero magia, no quiero batallas, ni profecías, ni destinos cósmicos. Llevate tus poderes ancestrales. No los quiero.»"
                      : "«I RENOUNCE EVERYTHING. I don't want to be the chosen one. I don't want your spirits, I don't want magic, battles, prophecies, or cosmic fates. Take away your ancestral powers. I don't want them.»"}
                  </span>
                </p>
                <p className="text-slate-400 italic">
                  {isEs
                    ? "CKY aprieta los puños temblando de rabia y dolor, cortando internamente los lazos que la unían al plano espiritual."
                    : "CKY clenches her fists trembling with rage and grief, severing the ties that bound her to the spiritual plane."}
                </p>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <span>{isEs ? "ALANIS INTENTA DISUADIRLA" : "ALANIS TRIES TO DISSUADE HER"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4: Alanis tries to persuade her */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2 text-amber-400">👑🕊️</div>
              <h3 className="text-lg font-bold text-amber-300">
                {isEs ? "La Advertencia de Alanis" : "Alanis's Warning"}
              </h3>
              <div className="p-4 bg-slate-950/90 border border-amber-500/40 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-amber-400 font-bold">
                  👑 Alanis:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«¡CKY, detén tu juicio por un instante! Eres la última descendiente viva del linaje sagrado. Si renuncias a tu herencia, el velo astral se cerrará para ti de forma irreversible. Ya no podrás percibir la energía cósmica ni comunicarte con el más allá. Serás vulnerable... serás una simple mortal desprotegida.»"
                      : "«CKY, pause your judgment for a moment! You are the last living descendant of the sacred lineage. If you renounce your inheritance, the astral veil will close irreversibly. You will never again sense cosmic energy or speak with the beyond. You will be vulnerable... a mere unprotected mortal.»"}
                  </span>
                </p>
                <p className="text-purple-400 font-bold">
                  👧 CKY:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«¡Eso es exactamente lo que quiero! Quiero ser normal. Quiero tomar mate con mi mamá, ir a la escuela, y llorar a mis amigos como cualquier chica común. ¡NO HAY FORMA DE QUE CAMBIE DE OPINIÓN!»"
                      : "«That is exactly what I want! I want to be normal. I want to drink mate with my mom, go to school, and grieve my friends like any ordinary girl. THERE IS NO WAY I'LL CHANGE MY MIND!»"}
                  </span>
                </p>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <span>{isEs ? "LA SENTENCIA DE ALANIS" : "ALANIS'S DECREE"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 5: Alanis Yields and Departs */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-6xl mb-2 text-slate-400">✨🌫️</div>
              <h3 className="text-lg font-bold text-slate-200">
                {isEs ? "El Adiós de Alanis: Ahora Eres Normal" : "Alanis's Farewell: Now You Are Normal"}
              </h3>
              <div className="p-4 bg-slate-950/90 border border-slate-700 rounded-2xl text-xs text-slate-200 text-left space-y-3 leading-relaxed">
                <p className="text-amber-400 font-bold">
                  👑 Alanis:{" "}
                  <span className="text-slate-200 font-normal">
                    {isEs
                      ? "«Que tu voluntad sea cumplida, CKY. El hilo del cosmos se corta aquí por propia elección. Ya no hay magia. Ya no hay guardianes. Ya no hay linaje... A partir de este segundo, eres una persona normal. Adiós.»"
                      : "«Let your will be fulfilled, CKY. The cosmic thread is severed here by your own choice. No more magic. No more guardians. No more lineage... From this second on, you are a normal person. Farewell.»"}
                  </span>
                </p>
                <p className="text-slate-400 italic">
                  {isEs
                    ? "El resplandor dorado de Alanis se disuelve lentamente en diminutas chispas que se apagan una a una, hasta dejar la habitación en absoluta penumbra."
                    : "Alanis's golden radiance slowly dissolves into tiny fading sparks, leaving the bedroom in quiet shadows."}
                </p>
              </div>

              <button
                onClick={advanceStep}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <UserMinus className="w-4 h-4 text-slate-400" />
                <span>{isEs ? "EL LLANTO DE CKY" : "CKY'S TEARS"}</span>
              </button>
            </div>
          )}

          {/* STEP 6: CKY Weeps Alone */}
          {step === 6 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-7xl mb-2 text-blue-400">😭🛏️</div>
              <h3 className="text-xl font-black text-slate-100">
                {isEs ? "Lágrimas en la Soledad de la Habitación" : "Tears in the Solitude of the Bedroom"}
              </h3>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 text-left space-y-3 leading-relaxed">
                <p className="text-slate-200">
                  {isEs
                    ? "CKY se desploma sobre su cama y rompe en un llanto profundo y desgarrador. No hay luces mágicas. No hay consejos caballerosos de W. No hay risas sarcásticas de Ángela pidiéndole sándwiches."
                    : "CKY collapses onto her bed, breaking into deep, heartbreaking sobs. No magic lights. No gentlemanly advice from W. No sarcastic laughs from Angela asking for sandwiches."}
                </p>
                <p className="text-slate-400 italic">
                  {isEs
                    ? "Solo el viejo reloj de la pared haciendo tictac, el piyama de seda comprado el sábado, y el silencio de una chica normal que salvó la ciudad al precio más alto."
                    : "Only the old wall clock ticking, the silk pajamas bought on Saturday, and the silence of a normal girl who saved the city at the highest cost."}
                </p>
              </div>

              <button
                onClick={onComplete}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black rounded-2xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-900/40 active:scale-95 animate-pulse"
              >
                <Sparkles className="w-5 h-5 fill-current" />
                <span>{isEs ? "VER CINEMÁTICA DE FIN DEL CAPÍTULO 1" : "WATCH CHAPTER 1 ENDING CINEMATIC"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
