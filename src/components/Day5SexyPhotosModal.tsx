import React, { useState } from "react";
import { Camera, Sparkles, Heart, EyeOff, CheckCircle2, ChevronRight, X } from "lucide-react";
import { PhonePhoto } from "../types";

interface Day5SexyPhotosModalProps {
  language: "es" | "en";
  onSavePhoto: (photo: PhonePhoto) => void;
  onComplete: () => void;
  onClose: () => void;
  playSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export default function Day5SexyPhotosModal({
  language,
  onSavePhoto,
  onComplete,
  onClose,
  playSound,
}: Day5SexyPhotosModalProps) {
  const [currentPose, setCurrentPose] = useState<number>(0);
  const [photosTaken, setPhotosTaken] = useState<boolean[]>([false, false, false]);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [activeComment, setActiveComment] = useState<string | null>(null);

  const poses = [
    {
      id: "photo_lingerie_mirror",
      titleEs: "Sesión Sexy: Guiño Coqueto al Espejo",
      titleEn: "Sexy Shoot: Flirty Mirror Wink",
      descEs: "Foto en la habitación luciendo el conjunto de lencería roja de encaje exclusivo. Mirada pícara y hombro descubierto.",
      descEn: "Room photo rocking the exclusive crimson lace lingerie set. Sassy wink and bare shoulder pose.",
      icon: "👙✨",
      subtitleEs: "Pose 1: Frente al espejo con guiño y actitud de modelo",
      subtitleEn: "Pose 1: In front of the mirror with a wink & model attitude",
      angelaCommentEs: "¡¡Esooooo, rompela todita CKY!! ¡Mirada de femme fatale total! ¡Sos una diosa del olimpo!",
      angelaCommentEn: "YAAAS queen, slay it CKY!! Total femme fatale look! You're an absolute goddess!",
      wCommentEs: "¡P-Por los sellos sagrados...! Vuestro esplendor es digno de una soberana... mas debo mantener el recato.",
      wCommentEn: "B-By the sacred seals...! Your splendor is worthy of a sovereign... yet I must maintain modest composure.",
      previewBg: "from-rose-950 via-pink-900 to-slate-950",
      artEmoji: "💃👠✨"
    },
    {
      id: "photo_lingerie_bed",
      titleEs: "Sesión Sexy: Pose de Diva en la Cama",
      titleEn: "Sexy Shoot: Diva Pose on the Bed",
      descEs: "Pose estilizada y seductora recostada en la cama con el conjunto de encaje rojo pasión.",
      descEn: "Stylized and seductive pose lounging on the bed in crimson lace lingerie.",
      icon: "💋🛌",
      subtitleEs: "Pose 2: Recostada sobre la cama con mirada cautivadora",
      subtitleEn: "Pose 2: Lounging on the bed with a captivating gaze",
      angelaCommentEs: "¡¡Ufff qué lomo CKY!! ¡Ni las modelos de alta costura te hacen sombra! ¡Tremenda bomba!",
      angelaCommentEn: "Uff what a body CKY!! High-fashion models don't hold a candle to you! Absolute stunner!",
      wCommentEs: "¡Cielos eternos! ¡La energía telúrica en esta estancia se ha elevado a niveles astronómicos!",
      wCommentEn: "Eternal heavens! The telluric energy in this chamber has surged to astronomical heights!",
      previewBg: "from-red-950 via-rose-900 to-slate-950",
      artEmoji: "🌹🛌💄"
    },
    {
      id: "photo_lingerie_w_bashful",
      titleEs: "Sesión Sexy: W Avergonzado",
      titleEn: "Sexy Shoot: Bashful W",
      descEs: "Sonrisa pícara de CKY en lencería mientras W se manifiesta como esfera de luz dorada tapándose los ojos con sus halos.",
      descEn: "Cheeky smile in lingerie while W manifests as a glowing golden orb bashfully covering his eyes.",
      icon: "🙈🌟",
      subtitleEs: "Pose 3: Sonrisa divertida junto a W tapándose los ojos de la vergüenza",
      subtitleEn: "Pose 3: Fun smile next to W covering his eyes in cosmic embarrassment",
      angelaCommentEs: "¡JAJAJAJAJA! ¡Miralo a W que se puso rojo como un tomate celestial y se tapa con sus brumas! ¡Sos mortal!",
      angelaCommentEn: "HAHAHAHA! Look at W glowing red as a celestial tomato covering his eyes with his mists! Priceless!",
      wCommentEs: "¡¡Cierro mis percepciones visuales de inmediato!! ¡La castidad y el honor de la Heredera son intocables!",
      wCommentEn: "I close my visual perceptions at once!! The chastity and honor of the Heir remain sacred!",
      previewBg: "from-amber-950 via-rose-950 to-slate-950",
      artEmoji: "🙈✨👙"
    }
  ];

  const handleTakePhoto = () => {
    playSound(850, "sine", 0.15);
    setIsFlashing(true);

    const current = poses[currentPose];
    const newPhoto: PhonePhoto = {
      id: current.id,
      titleEs: current.titleEs,
      titleEn: current.titleEn,
      descEs: current.descEs,
      descEn: current.descEn,
      date: "24/07/2026",
      category: "selfie",
      icon: current.icon,
      savedInGallery: true
    };

    setTimeout(() => {
      setIsFlashing(false);
      playSound(600, "triangle", 0.3);
      onSavePhoto(newPhoto);

      const updated = [...photosTaken];
      updated[currentPose] = true;
      setPhotosTaken(updated);

      setActiveComment(
        language === "es"
          ? `${current.angelaCommentEs}\n\n🛡️ W: "${current.wCommentEs}"`
          : `${current.angelaCommentEn}\n\n🛡️ W: "${current.wCommentEn}"`
      );
    }, 200);
  };

  const allTaken = photosTaken.every(Boolean);

  return (
    <div id="day5_photo_modal" className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Flash Effect */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-60 animate-ping opacity-90 pointer-events-none" />
      )}

      <div className="bg-slate-900 border-2 border-rose-500/60 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 relative flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>{language === "es" ? "Sesión de Fotos en Lencería Sexy" : "Sexy Lingerie Photo Shoot"}</span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                {language === "es" ? "Conjunto exclusivo de encaje rojo • Álbum Privado" : "Exclusive Crimson Lace Set • Private Album"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pose Selection Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {poses.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                playSound(400, "sine", 0.1);
                setCurrentPose(idx);
                setActiveComment(null);
              }}
              className={`p-2 rounded-xl border text-center font-mono text-xs transition-all relative ${
                currentPose === idx
                  ? "bg-rose-600/30 border-rose-400 text-rose-200 font-bold shadow-lg"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-rose-500/40"
              }`}
            >
              <div className="text-xl mb-0.5">{p.icon}</div>
              <p className="text-[10px] truncate">{language === "es" ? `Pose ${idx + 1}` : `Pose ${idx + 1}`}</p>
              {photosTaken[idx] && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 p-0.5 rounded-full text-[8px] font-bold">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Viewfinder / Camera Screen */}
        <div className={`relative rounded-xl border-2 border-rose-500/40 bg-gradient-to-b ${poses[currentPose].previewBg} p-6 flex flex-col items-center justify-center min-h-[170px] shadow-inner text-center overflow-hidden`}>
          {/* Viewfinder HUD brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-rose-400/80" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-rose-400/80" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-rose-400/80" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-rose-400/80" />

          {/* Central Target Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-12 h-12 border border-rose-300 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-rose-400 rounded-full" />
            </div>
          </div>

          <div className="text-5xl mb-2 animate-bounce">{poses[currentPose].artEmoji}</div>
          <p className="text-xs font-bold font-mono text-rose-200">
            {language === "es" ? poses[currentPose].subtitleEs : poses[currentPose].subtitleEn}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-rose-300/80 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>{language === "es" ? "Lencería Roja de Encaje" : "Crimson Lace Lingerie"}</span>
          </div>
        </div>

        {/* Dialogue Comments */}
        {activeComment ? (
          <div className="bg-slate-950/80 border border-pink-500/40 rounded-xl p-3 text-xs font-mono text-pink-200 whitespace-pre-line animate-fade-in">
            <div className="flex items-center gap-1.5 text-pink-400 font-bold text-[11px] mb-1">
              <span>👻 Ángela:</span>
            </div>
            {activeComment}
          </div>
        ) : (
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center text-slate-400 text-xs font-mono">
            {language === "es"
              ? "Presioná 'Sacar Foto' para capturar esta pose y guardarla en tu celular."
              : "Press 'Take Photo' to capture this pose and save it to your phone gallery."}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleTakePhoto}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg border border-rose-400/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{photosTaken[currentPose] ? (language === "es" ? "📸 Repetir Foto" : "📸 Retake Photo") : (language === "es" ? "📸 Sacar Foto" : "📸 Take Photo")}</span>
          </button>

          {allTaken && (
            <button
              onClick={() => {
                playSound(950, "sine", 0.4);
                onComplete();
              }}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg border border-emerald-400/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === "es" ? "Completar Sesión (+100 XP)" : "Complete Shoot (+100 XP)"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
