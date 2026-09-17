import React, { useState } from "react";
import { SoulmateInfo, Language } from "../types";
import { Heart, Sparkles, User, Wand2, Shield, Flame, BookOpen, Smile, Eye } from "lucide-react";

interface SoulmateCreationModalProps {
  language: Language;
  onConfirm: (soulmate: SoulmateInfo) => void;
  onClose?: () => void;
}

export default function SoulmateCreationModal({
  language,
  onConfirm,
}: SoulmateCreationModalProps) {
  const [gender, setGender] = useState<"male" | "female" | "nonbinary">("male");
  const [name, setName] = useState<string>("Leandro");
  const [personality, setPersonality] = useState<
    "timido" | "rebelde" | "intelectual" | "carinoso" | "misterioso" | "protector"
  >("protector");
  const [hairColor, setHairColor] = useState<string>("#1e293b");

  const nameSuggestions = {
    male: ["Leandro", "Matías", "Julián", "Lucas", "Tomás", "Gabriel", "Dante", "Valentín"],
    female: ["Sofía", "Camila", "Valentina", "Martina", "Lucía", "Elena", "Mía", "Zoe"],
    nonbinary: ["Alex", "Ariel", "Sam", "Ren", "Robin", "Cris", "Gael", "Morgan"],
  };

  const handleRandomizeName = () => {
    const list = nameSuggestions[gender];
    const randomName = list[Math.floor(Math.random() * list.length)];
    setName(randomName);
  };

  const personalities = [
    {
      id: "protector",
      nameEs: "Protector / Valiente",
      nameEn: "Protective / Brave",
      descEs: "Siempre cuidará de ti y se interpondrá ante cualquier peligro del Limbo.",
      descEn: "Will always watch over you and stand against any Limbo danger.",
      icon: Shield,
      color: "text-amber-400 border-amber-500/50 bg-amber-500/10",
    },
    {
      id: "rebelde",
      nameEs: "Rebelde / Apasionado",
      nameEn: "Rebellious / Passionate",
      descEs: "No sigue reglas, vive intensamente y desafiará todo por lo que siente.",
      descEn: "Follows no rules, lives passionately, and defies all for love.",
      icon: Flame,
      color: "text-rose-400 border-rose-500/50 bg-rose-500/10",
    },
    {
      id: "intelectual",
      nameEs: "Intelectual / Estratega",
      nameEn: "Intellectual / Strategist",
      descEs: "Mente brillante, comprende los misterios arcanos y la ciencia oculta.",
      descEn: "Brilliant mind, understands arcane mysteries and hidden science.",
      icon: BookOpen,
      color: "text-cyan-400 border-cyan-500/50 bg-cyan-500/10",
    },
    {
      id: "carinoso",
      nameEs: "Cariñoso / Empático",
      nameEn: "Sweet / Empathetic",
      descEs: "Dulzura absoluta, escucha atenta y consuelo en los momentos difíciles.",
      descEn: "Absolute sweetness, deep listening, and comfort in hard times.",
      icon: Smile,
      color: "text-pink-400 border-pink-500/50 bg-pink-500/10",
    },
    {
      id: "misterioso",
      nameEs: "Misterioso / Enigmático",
      nameEn: "Mysterious / Enigmatic",
      descEs: "Ojos profundos que guardan secretos astrales y una atracción magnética.",
      descEn: "Deep eyes holding astral secrets and an irresistible magnetic pull.",
      icon: Eye,
      color: "text-purple-400 border-purple-500/50 bg-purple-500/10",
    },
    {
      id: "timido",
      nameEs: "Tímido / Poeta",
      nameEn: "Shy / Poet",
      descEs: "Tierno, reservado, con una profunda sensibilidad y corazón puro.",
      descEn: "Gentle, reserved, with deep sensitivity and a pure heart.",
      icon: Sparkles,
      color: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10",
    },
  ];

  const getAvatarEmoji = () => {
    if (gender === "female") {
      if (personality === "rebelde") return "👩‍🎤";
      if (personality === "intelectual") return "👩‍🏫";
      if (personality === "protector") return "👩‍✈️";
      return "👧";
    }
    if (gender === "male") {
      if (personality === "rebelde") return "🧑‍🎤";
      if (personality === "intelectual") return "🧑‍🏫";
      if (personality === "protector") return "🧑‍✈️";
      return "👦";
    }
    return "🧑‍🦱";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onConfirm({
      gender,
      name: name.trim(),
      personality,
      avatar: getAvatarEmoji(),
      hairColor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/95 border-2 border-pink-500/60 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-pink-950/50 flex flex-col p-6 text-slate-100 relative">
        {/* Header decoration */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="p-3 bg-pink-500/20 rounded-2xl border border-pink-500/50 text-pink-400 shadow-inner">
            <Heart className="w-7 h-7 fill-pink-500 text-pink-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40">
                {language === "es" ? "Designio Celestial de Alanis" : "Alanis's Celestial Decree"}
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-300">
              {language === "es" ? "Creación de tu Alma Gemela" : "Soulmate Manifestation"}
            </h2>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-300 leading-relaxed mb-5 bg-slate-950/60 p-3.5 rounded-xl border border-purple-500/30">
          ✨ {language === "es"
            ? "Alanis ha convocado las corrientes astrales del destino. Define los rasgos de la persona predestinada a cruzarse en tu vida:"
            : "Alanis has channeled the astral currents of destiny. Define the traits of the one destined to cross your path:"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex items-center justify-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500/30 via-purple-600/30 to-indigo-500/30 border-2 border-pink-400/50 flex items-center justify-center text-5xl shadow-xl shadow-pink-900/30">
                {getAvatarEmoji()}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-pink-600 text-white rounded-full p-1 border-2 border-slate-900 shadow">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Gender selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {language === "es" ? "Sexo / Identidad" : "Gender / Identity"}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "male", labelEs: "Hombre (Él)", labelEn: "Male (He/Him)", icon: "👦" },
                { id: "female", labelEs: "Mujer (Ella)", labelEn: "Female (She/Her)", icon: "👧" },
                { id: "nonbinary", labelEs: "No Binario (Elle)", labelEn: "Non-Binary (They)", icon: "🧑" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGender(g.id as any);
                    if (nameSuggestions[g.id as keyof typeof nameSuggestions]) {
                      setName(nameSuggestions[g.id as keyof typeof nameSuggestions][0]);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl border font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gender === g.id
                      ? "bg-pink-600/30 border-pink-500 text-pink-200 font-bold shadow-lg shadow-pink-950/50"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50"
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{language === "es" ? g.labelEs : g.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono text-pink-300 uppercase tracking-wider">
                {language === "es" ? "Nombre de tu Alma Gemela" : "Soulmate Name"}
              </label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className="text-[11px] font-mono text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-950/60 border border-purple-700/50 px-2 py-0.5 rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                <Wand2 className="w-3 h-3" />
                {language === "es" ? "Aleatorio" : "Randomize"}
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              required
              className="w-full bg-slate-950/80 border border-pink-500/40 rounded-xl px-4 py-2.5 text-sm font-mono text-pink-100 placeholder-pink-500/40 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-all"
              placeholder={language === "es" ? "Escribe un nombre..." : "Enter a name..."}
            />
          </div>

          {/* Personality Archetype */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-pink-300 uppercase tracking-wider">
              {language === "es" ? "Personalidad y Esencia" : "Personality & Essence"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {personalities.map((p) => {
                const IconComponent = p.icon;
                const isSelected = personality === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersonality(p.id as any)}
                    className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? `${p.color} font-bold shadow-md shadow-slate-950`
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200">
                        {language === "es" ? p.nameEs : p.nameEn}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                        {language === "es" ? p.descEs : p.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hair color accent */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-pink-300 uppercase tracking-wider">
              {language === "es" ? "Color de Cabello / Tonalidad" : "Hair Tone / Style"}
            </label>
            <div className="flex items-center gap-3">
              {[
                { label: "Negro", color: "#0f172a" },
                { label: "Castaño", color: "#542810" },
                { label: "Rubio", color: "#facc15" },
                { label: "Pelirrojo", color: "#ea580c" },
                { label: "Plata", color: "#94a3b8" },
                { label: "Cian Arcano", color: "#06b6d4" },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setHairColor(c.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    hairColor === c.color ? "scale-125 border-pink-400 ring-2 ring-pink-500/50 shadow-lg" : "border-slate-700 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold font-mono text-sm tracking-wide shadow-xl shadow-pink-950/60 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-pink-400/50"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{language === "es" ? "Establecer Vínculo del Destino" : "Bind Celestial Destiny"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
