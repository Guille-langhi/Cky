import React, { useState } from "react";
import { Language, SoulmateInfo, Companion } from "../types";
import { Sparkles, Heart, Shield, Check, ArrowRight } from "lucide-react";

interface Day6AlanisCutsceneModalProps {
  language: Language;
  onFinish: (revealedSoulmateName: string) => void;
  playSound: (freq: number, type?: OscillatorType, duration?: number) => void;
  soulmateInfo?: SoulmateInfo | null;
}

export default function Day6AlanisCutsceneModal({
  language,
  onFinish,
  playSound,
  soulmateInfo
}: Day6AlanisCutsceneModalProps) {
  const [step, setStep] = useState<number>(1);

  const soulmateName = soulmateInfo?.name || "Kael";
  const soulmateAvatar = soulmateInfo?.avatar || "🧑‍🦱";
  const soulmateGender = soulmateInfo?.gender || "male";

  const nextStep = () => {
    playSound(720, "sine", 0.2);
    if (step < 5) {
      setStep((s) => s + 1);
    } else {
      playSound(880, "sine", 0.5);
      onFinish(soulmateName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-yellow-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 text-white font-mono">
        {/* Background Divine Golden Rays */}
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Indicator */}
        <div className="flex items-center justify-between border-b border-yellow-500/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-yellow-950/80 border border-yellow-500/40 rounded-xl text-lg">👑</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-display text-yellow-300 uppercase tracking-wider">
                {language === "es" ? "Intervención de Alanis: El Alma Gemela Híbrida" : "Alanis's Intervention: The Hybrid Soulmate"}
              </h2>
              <span className="text-[10px] text-yellow-500/80">
                {language === "es" ? "Revelación Cósmica • 06:00 AM" : "Cosmic Revelation • 06:00 AM"}
              </span>
            </div>
          </div>
          <div className="px-3 py-1 bg-yellow-950/80 border border-yellow-500/40 rounded-full text-xs font-bold text-yellow-300">
            {step} / 5
          </div>
        </div>

        {/* Scene Visualizer Stage */}
        <div className="h-48 bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-900 rounded-2xl border border-yellow-500/30 p-4 relative flex items-center justify-around overflow-hidden">
          {/* Alanis Divine Leader */}
          <div className="flex flex-col items-center gap-1 z-10 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-200 p-1 shadow-2xl relative">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-3xl">
                👑
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">✨</div>
            </div>
            <span className="text-[11px] font-bold text-yellow-300">Alanis (Líder Suprema)</span>
          </div>

          {/* Golden burst or Shroud Transition */}
          <div className="flex flex-col items-center gap-2 z-10">
            {step === 1 && (
              <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500 flex items-center justify-center text-2xl shadow-lg">
                👤
              </div>
            )}
            {step >= 2 && (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-sky-400 to-yellow-300 p-0.5 shadow-2xl relative animate-bounce">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-3xl">
                  {soulmateAvatar}
                </div>
                <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-purple-600 text-[8px] font-bold rounded-full border border-purple-300">
                  Híbrido
                </span>
              </div>
            )}
            <span className="text-[11px] font-bold text-purple-200">
              {step === 1 ? (language === "es" ? "Forma Oscura" : "Dark Form") : soulmateName}
            </span>
          </div>

          {/* CKY & Angela Team */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-pink-400/80 flex items-center justify-center text-[10px]">
                🌸
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-pink-500/50 flex items-center justify-center text-2xl">
                👱‍♀️
              </div>
              <div className="w-6 h-6 rounded-full bg-yellow-400/80 flex items-center justify-center text-[10px]">
                ✨
              </div>
            </div>
            <span className="text-[11px] font-bold text-pink-300">CKY & Equipo</span>
          </div>
        </div>

        {/* Narrative Dialog Box by Step */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-yellow-500/30 min-h-[110px] flex flex-col justify-center gap-2">
          {step === 1 && (
            <div>
              <div className="text-xs font-bold text-yellow-400 flex items-center gap-1.5 mb-1">
                <span>👑</span>
                <span>Alanis (Líder Suprema Astral):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                {language === "es"
                  ? "«¡¡ALTO, HEREDERA Y ESPÍRITUS!! ¡¡DETENGAN EL ATAQUE DE INMEDIATO!! Calma tus llamas, CKY. Esta silueta no es un enemigo ni un emisario de la oscuridad.»"
                  : "«HALT, LADY HEIR AND SPIRITS!! CEASE YOUR ATTACK IMMEDIATELY!! Calm your flames, CKY. This silhouette is not an enemy nor an envoy of darkness.»"}
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-xs font-bold text-yellow-400 flex items-center gap-1.5 mb-1">
                <span>✨</span>
                <span>Alanis (Disipando las sombras con resplandor dorado):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                {language === "es"
                  ? `«Él es ${soulmateName}, tu Alma Gemela predestinada. Su condición es única y sagrada en todo el cosmos: es MITAD HUMANO y MITAD ESPÍRITU (un híbrido astral). La coraza de sombra era únicamente su armadura para resistir el abrasador viaje por el Limbo hasta llegar a ti.»`
                  : `«He is ${soulmateName}, your destined Soulmate. His condition is unique and sacred across the cosmos: he is HALF HUMAN and HALF SPIRIT (an astral hybrid). The dark shadow was merely his protective shroud to endure the searing journey through Limbo to reach you.»`}
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-1">
                <span>{soulmateAvatar}</span>
                <span>{soulmateName} (Alma Gemela Híbrida):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                {language === "es"
                  ? `«¡Ufff, gracias Alanis, de la que me salvaste! ¡Che, casi me hacen puré antes de que pueda meter un 'hola'! Qué hacés CKY, ¿todo bien? Menos mal que aflojaron con los rayos porque casi no la cuento. Mi mitad humana ya sentía el bobazo y mi parte espíritu estaba a punto de evaporarse.»`
                  : `«Phew... thanks Alanis, you saved my life! Hey, you almost turned me into paste before I could even say hi! How's it going CKY, you good? Thank goodness you dialed back the blasts because I barely made it. My human half was about to have a heart attack and my spirit half was evaporating.»`}
              </p>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="text-xs font-bold text-pink-400 flex items-center gap-1.5 mb-1">
                <span>🌸</span>
                <span>Ángela (A las carcajadas):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                {language === "es"
                  ? `«¡¡JAJAJAJAJAJA CKY!! ¡¡Casi liquidás a tu propio novio cósmico a patadas un lunes a las seis de la mañana!! ¡¡Menos mal que Alanis frenó el tiro porque te quedabas soltera para siempre!! Mirá la facha que tiene el pibe híbrido, ¡bienvenido al team!»`
                  : `«HAHAHAHAHA CKY!! You almost vaporized your own cosmic boyfriend on Monday at six in the morning!! Good thing Alanis stopped that strike or you'd stay single forever!! Look at this handsome hybrid guy, welcome to the team!»`}
              </p>
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="text-xs font-bold text-yellow-300 flex items-center gap-1.5 mb-1">
                <span>✨</span>
                <span>W (Espíritu Guardián) & CKY:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                {language === "es"
                  ? `W: «Bienvenido seáis al Linaje, Joven Híbrido. Juntos seremos el baluarte inexpugnable.»\nCKY: «Bueno... perdón por los magiazos... ¡pero la próxima no aparezcas vestido de fantasma asesino! Ahora apurémonos que son las 06:30 AM y es lunes escolar.»`
                  : `W: «Welcome to the Bloodline, Young Hybrid. Together we shall stand unbreakable.»\nCKY: «Well... sorry for the magic blasts... but next time don't show up dressed like an assassin ghost! Now hurry, it's 06:30 AM and we have school today.»`}
              </p>
            </div>
          )}
        </div>

        {/* Footer Next / Finish Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-yellow-400/80">
            <Sparkles className="w-4 h-4" />
            <span>
              {language === "es"
                ? "✨ +150 XP • ¡Alma Gemela Híbrida se unió al equipo!"
                : "✨ +150 XP • Hybrid Soulmate joined the party!"}
            </span>
          </div>

          <button
            onClick={nextStep}
            className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95 text-xs font-mono"
          >
            <span>{step < 5 ? (language === "es" ? "Continuar" : "Continue") : (language === "es" ? "Comenzar Lunes Escolar" : "Start Monday Routine")}</span>
            {step < 5 ? <ArrowRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
