import React, { useState } from "react";
import { X, Heart, MessageCircle, Calendar, Sparkles, SlidersHorizontal, Share2 } from "lucide-react";
import { Language, PhonePhoto } from "../types";
import { soundEngine } from "../lib/soundEngine";

interface PhotoViewerModalProps {
  photo: PhonePhoto;
  language: Language;
  onClose: () => void;
  onToggleFavorite?: (photoId: string) => void;
  isFavorite?: boolean;
}

export default function PhotoViewerModal({
  photo,
  language,
  onClose,
  onToggleFavorite,
  isFavorite: initialFavorite = false,
}: PhotoViewerModalProps) {
  const isEs = language === "es";
  const [favorite, setFavorite] = useState<boolean>(initialFavorite);
  const [activeFilter, setActiveFilter] = useState<"normal" | "sepia" | "vaporwave" | "noir">("normal");
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const toggleFav = () => {
    soundEngine.playSfx("menu_nav");
    const next = !favorite;
    setFavorite(next);
    if (onToggleFavorite) onToggleFavorite(photo.id);
  };

  const handleShare = () => {
    soundEngine.playSfx("purchase");
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Generate dynamic contextual comments for the photo
  const getComments = () => {
    if (photo.category === "mom" || photo.photoType === "mom_first_day") {
      return [
        { author: "Mamá 👩", text: isEs ? "¡Qué hermosa mi nena lista para el primer día! No te olvides de comer el sándwich." : "So gorgeous my sweet girl ready for day one! Don't forget your sandwich." },
        { author: "CKY 👧", text: isEs ? "¡Gracias ma! La mochila pesa un kilo pero va con todo." : "Thanks mom! Backpack is heavy but ready." },
      ];
    }
    if (photo.category === "selfie" || photo.photoType === "mirror_selfie") {
      return [
        { author: "Ángela 👻", text: isEs ? "¡Upaaa! ¡Mirá lo que es esa producción! W se está tapando los ojos de la vergüenza jaja." : "Ooh! Look at that look! W is hiding his celestial eyes in shame haha." },
        { author: "W 🛡️", text: isEs ? "Mantengo mi vista fija con estricta devoción marcial en la dirección contraria." : "I maintain my strict martial gaze in the opposite direction." },
        { author: "CKY 👧", text: isEs ? "¡Jajaja basta Ángela, me hacés reír en plena selfie!" : "Haha stop it Angela, you're making me laugh during my selfie!" },
      ];
    }
    if (photo.id.includes("ruins") || photo.id.includes("treasure")) {
      return [
        { author: "W (Pala Sagrada) 🛡️", text: isEs ? "El oro del tesoro ancestral está a salvo bajo su custodia, Señora." : "The ancestral treasure gold is safe in your custody, My Lady." },
        { author: "Ángela 👻", text: isEs ? "¡$50.000 pesitos en mano! ¡Directo al shopping a comprar pilchas finas!" : "$50,000 pesos in hand! Straight to the mall for fine clothes!" },
      ];
    }
    if (photo.id.includes("soccer") || photo.id.includes("mateo")) {
      return [
        { author: "Mateo 🧑‍⚽", text: isEs ? "¡Ese pelotazo al ángulo fue inatajable! ¡Qué jugadora sos CKY!" : "That top corner shot was impossible to save! What a player CKY!" },
        { author: "CKY 👧", text: isEs ? "¡Avisame cuando quieras la revancha en el potrero!" : "Let me know when you want a rematch!" },
      ];
    }
    return [
      { author: "Ángela 👻", text: isEs ? "¡Fotaza para el recuerdo de nuestra travesía!" : "Great photo to remember our epic journey!" },
      { author: "CKY 👧", text: isEs ? "Guardada en el celular para siempre." : "Saved in my phone forever." },
    ];
  };

  const comments = getComments();

  // Filter CSS styles
  const filterStyles = {
    normal: "",
    sepia: "sepia(75%) contrast(110%)",
    vaporwave: "hue-rotate(270deg) contrast(125%) saturate(150%)",
    noir: "grayscale(100%) contrast(140%)",
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] flex flex-col justify-between">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <div>
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider truncate max-w-[200px]">
                {isEs ? photo.titleEs : photo.titleEn}
              </h3>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{photo.date}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleFav}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                favorite
                  ? "bg-rose-950/80 border-rose-500 text-rose-400 shadow-md"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
              title={isEs ? "Marcar como Favorita" : "Favorite"}
            >
              <Heart className={`w-4 h-4 ${favorite ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Polaroid Card Frame */}
        <div
          className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center space-y-3 transition-all"
          style={{ filter: filterStyles[activeFilter] }}
        >
          {/* Main Visual Photo Icon / Illustration */}
          <div className="w-full h-44 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/60 rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-md">
            <div className="text-6xl animate-pulse drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              {photo.icon || "📸"}
            </div>
            {/* Timestamp Watermark */}
            <div className="absolute bottom-2 right-3 text-[8px] font-mono text-amber-400/80 tracking-widest">
              CKY • {photo.date}
            </div>
          </div>

          <div className="text-center space-y-1 w-full">
            <p className="text-xs font-bold text-slate-200">
              {isEs ? photo.titleEs : photo.titleEn}
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              {isEs ? photo.descEs : photo.descEn}
            </p>
          </div>
        </div>

        {/* Filter Selection Bar */}
        <div className="flex items-center justify-between gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 text-[9px] font-bold">
          <span className="text-slate-400 flex items-center gap-1 pl-1">
            <SlidersHorizontal className="w-3 h-3 text-blue-400" />
            {isEs ? "Filtro:" : "Filter:"}
          </span>
          {[
            { id: "normal", label: "Normal" },
            { id: "sepia", label: "Sepia" },
            { id: "vaporwave", label: "Neón" },
            { id: "noir", label: "Noir" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundEngine.playSfx("menu_nav");
                setActiveFilter(f.id as any);
              }}
              className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                activeFilter === f.id
                  ? "bg-blue-600 text-white border-blue-400 shadow-sm"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Comments Feed */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 max-h-32 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 border-b border-slate-800 pb-1">
            <MessageCircle className="w-3 h-3 text-blue-400" />
            <span>{isEs ? "Comentarios del Celular" : "Phone Comments"}</span>
          </div>
          {comments.map((c, i) => (
            <div key={i} className="text-[9px] font-mono leading-tight space-y-0.5">
              <span className="font-bold text-blue-300 block">{c.author}</span>
              <p className="text-slate-300 font-sans">{c.text}</p>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {copiedShare
                ? (isEs ? "¡Foto Guardada!" : "Photo Saved!")
                : (isEs ? "Compartir / Guardar" : "Share / Save")}
            </span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl border border-blue-400 transition cursor-pointer"
          >
            {isEs ? "Volver a Galería" : "Back to Gallery"}
          </button>
        </div>
      </div>
    </div>
  );
}
