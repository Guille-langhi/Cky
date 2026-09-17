import React, { useState, useEffect } from "react";
import { X, ChefHat, Sparkles, Star, Award, Check } from "lucide-react";
import { Language, InventoryItem } from "../types";
import { soundEngine } from "../lib/soundEngine";
import { unlockAchievement } from "../data/achievements";

interface KitchenSandwichMinigameProps {
  language: Language;
  onClose: () => void;
  onAddXP: (amount: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onRestoreHunger: (amount: number) => void;
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

export default function KitchenSandwichMinigame({
  language,
  onClose,
  onAddXP,
  onAddInventoryItem,
  onRestoreHunger,
  onShowNotification,
}: KitchenSandwichMinigameProps) {
  const isEs = language === "es";

  // Step 1: Pan, Step 2: Untable, Step 3: Fiambre, Step 4: Queso, Step 5: Extras, Step 6: Corte & Tostado timing, Step 7: Resultado
  const [step, setStep] = useState<number>(1);

  // Selected ingredients
  const [selectedBread, setSelectedBread] = useState<string>("baguette");
  const [selectedSpread, setSelectedSpread] = useState<string>("mayo");
  const [selectedMeat, setSelectedMeat] = useState<string>("salame_colonia");
  const [selectedCheese, setSelectedCheese] = useState<string>("queso_tybo");
  const [selectedToppings, setSelectedToppings] = useState<string[]>(["tomate", "lechuga"]);

  // Timing mini-game for Step 6
  const [timingVal, setTimingVal] = useState<number>(0);
  const [timingDir, setTimingDir] = useState<number>(2.4);
  const [timingLocked, setTimingLocked] = useState<boolean>(false);
  const [stars, setStars] = useState<number>(3);

  // Timing bar oscillation loop
  useEffect(() => {
    if (step !== 6 || timingLocked) return;
    let animId: number;

    const loop = () => {
      setTimingVal((prev) => {
        let next = prev + timingDir;
        if (next > 100) {
          next = 100;
          setTimingDir(-2.8);
        } else if (next < 0) {
          next = 0;
          setTimingDir(2.8);
        }
        return next;
      });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [step, timingLocked, timingDir]);

  const breads = [
    { id: "baguette", nameEs: "Baguette Crocante de Panadería", nameEn: "Crisp Bakery Baguette", icon: "🥖", bonus: 1 },
    { id: "miga", nameEs: "Pan de Miga Blanco Tostado", nameEn: "Toasted White Crumb Bread", icon: "🍞", bonus: 1 },
    { id: "campo", nameEs: "Pan Casero de Campo con Masa Madre", nameEn: "Sourdough Country Bread", icon: "🥯", bonus: 2 },
  ];

  const spreads = [
    { id: "mayo", nameEs: "Mayonesa Casera con Toque de Limón", nameEn: "Homemade Lemon Mayo", icon: "🍶" },
    { id: "mostaza", nameEs: "Mostaza Dulce a la Miel", nameEn: "Sweet Honey Mustard", icon: "🍯" },
    { id: "manteca", nameEs: "Manteca de Campo Pomada", nameEn: "Farm Cream Butter", icon: "🧈" },
    { id: "criolla", nameEs: "Salsa Criolla Suave", nameEn: "Mild Criolla Relish", icon: "🥗" },
  ];

  const meats = [
    { id: "salame_colonia", nameEs: "Salame de la Colonia Picado Fino (Favorito CKY)", nameEn: "Colonia Fine-Cut Salami (CKY's Fav)", icon: "🥓", bonus: 3 },
    { id: "salame_grueso", nameEs: "Salame Santafesino Picado Grueso", nameEn: "Coarse Country Salami", icon: "🍖", bonus: 2 },
    { id: "jamon", nameEs: "Jamón Cocido Natural Seleccionado", nameEn: "Selected Cooked Ham", icon: "🥩", bonus: 1 },
  ];

  const cheeses = [
    { id: "queso_tybo", nameEs: "Queso Tybo Cremoso Fundible", nameEn: "Melting Creamy Tybo Cheese", icon: "🧀", bonus: 2 },
    { id: "queso_gouda", nameEs: "Queso Gouda Estacionado", nameEn: "Aged Gouda Cheese", icon: "🧀", bonus: 2 },
    { id: "queso_provo", nameEs: "Provolone con Orégano", nameEn: "Herbed Provolone", icon: "🧀", bonus: 2 },
  ];

  const toppings = [
    { id: "tomate", nameEs: "Rodajas de Tomate Fresco", nameEn: "Fresh Sliced Tomato", icon: "🍅" },
    { id: "lechuga", nameEs: "Hojas de Lechuga Crocante", nameEn: "Crisp Lettuce Leaves", icon: "🥬" },
    { id: "huevo", nameEs: "Huevo Duro en Rodajas", nameEn: "Sliced Boiled Egg", icon: "🥚" },
    { id: "aceitunas", nameEs: "Aceitunas Negras Descarozadas", nameEn: "Pitted Black Olives", icon: "🫒" },
  ];

  const toggleTopping = (id: string) => {
    soundEngine.playSfx("menu_nav");
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleLockTiming = () => {
    setTimingLocked(true);
    soundEngine.playSfx("attack");

    // Ideal range: 65 to 88
    let awardedStars = 1;
    if (timingVal >= 65 && timingVal <= 88) {
      awardedStars = 3;
    } else if (timingVal >= 40 && timingVal <= 95) {
      awardedStars = 2;
    }
    setStars(awardedStars);

    setTimeout(() => {
      setStep(7); // Result screen
      soundEngine.playSfx("purchase");
      localStorage.setItem("cky_sandwich_master_cooked", "true");
      onAddXP(40);
      onRestoreHunger(50);

      // Create consumable custom item
      const customItem: InventoryItem = {
        id: `custom_gourmet_sandwich_${Date.now()}`,
        nameEs: awardedStars === 3 ? "Sándwich Supremo Legendario de CKY" : "Sándwich Gourmet de CKY",
        nameEn: awardedStars === 3 ? "CKY's Legendary Supreme Sandwich" : "CKY's Gourmet Sandwich",
        descEs: `Elaborado con amor por CKY en la cocina: ${selectedMeat === "salame_colonia" ? "Salame de la colonia" : "Fiambre especial"}, queso fundido y pan crocante. Restaura +80% Hambre y +30% Sed.`,
        descEn: "Crafted with passion in the kitchen by CKY with artisan salami, melted cheese, and crisp bread. Restores +80% Hunger and +30% Thirst.",
        icon: "🥪",
        isKey: false,
        usable: true,
        category: "backpack",
        effect: { type: "hambre", amount: 80 }
      };

      onAddInventoryItem(customItem);
      unlockAchievement("ach_master_chef", onShowNotification, onAddXP);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 font-mono select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-amber-400 uppercase tracking-wide">
                {isEs ? "Taller Gourmet de Sándwiches de CKY" : "CKY's Gourmet Sandwich Workshop"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isEs ? "Cocina de la Casa • Paso " + step + " de 6" : "Home Kitchen • Step " + step + " of 6"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex gap-1.5 justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
          {[
            { n: 1, label: isEs ? "Pan" : "Bread", icon: "🥖" },
            { n: 2, label: isEs ? "Untable" : "Spread", icon: "🍶" },
            { n: 3, label: isEs ? "Fiambre" : "Meat", icon: "🥓" },
            { n: 4, label: isEs ? "Queso" : "Cheese", icon: "🧀" },
            { n: 5, label: isEs ? "Toppings" : "Extras", icon: "🥗" },
            { n: 6, label: isEs ? "Corte" : "Craft", icon: "🔪" },
          ].map((s) => (
            <div
              key={s.n}
              className={`flex-1 text-center py-1 rounded-lg border text-[9px] font-bold ${
                step === s.n
                  ? "bg-amber-500/20 border-amber-400 text-amber-300"
                  : step > s.n
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline ml-1">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Step Content */}
        <div className="space-y-3">
          {/* STEP 1: BREAD */}
          {step === 1 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-yellow-300">
                {isEs ? "1. Elegí la base de pan crujiente:" : "1. Choose your crisp bread base:"}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {breads.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      soundEngine.playSfx("menu_nav");
                      setSelectedBread(b.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      selectedBread === b.id
                        ? "bg-amber-950/60 border-amber-400 text-amber-200 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{b.icon}</span>
                      <span className="text-xs font-bold">{isEs ? b.nameEs : b.nameEn}</span>
                    </div>
                    {selectedBread === b.id && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md border border-amber-400 transition cursor-pointer mt-2"
              >
                ➔ {isEs ? "Siguiente: Elegir Untable" : "Next: Choose Spread"}
              </button>
            </div>
          )}

          {/* STEP 2: SPREAD */}
          {step === 2 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-yellow-300">
                {isEs ? "2. Elegí el untable para humedecer la miga:" : "2. Choose spread to moisten bread:"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {spreads.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      soundEngine.playSfx("menu_nav");
                      setSelectedSpread(s.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      selectedSpread === s.id
                        ? "bg-amber-950/60 border-amber-400 text-amber-200 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-xs font-bold">{isEs ? s.nameEs : s.nameEn}</span>
                    </div>
                    {selectedSpread === s.id && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  {isEs ? "Atrás" : "Back"}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md border border-amber-400 transition cursor-pointer"
                >
                  ➔ {isEs ? "Siguiente: Elegir Fiambre" : "Next: Choose Meat"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MEAT */}
          {step === 3 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-yellow-300">
                {isEs ? "3. Elegí el corazón del sándwich (Fiambre):" : "3. Choose the meat heart of the sandwich:"}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {meats.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundEngine.playSfx("menu_nav");
                      setSelectedMeat(m.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      selectedMeat === m.id
                        ? "bg-amber-950/60 border-amber-400 text-amber-200 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <span className="text-xs font-bold block">{isEs ? m.nameEs : m.nameEn}</span>
                        {m.id === "salame_colonia" && (
                          <span className="text-[9px] text-amber-400 font-bold">★ Favorito indiscutido de CKY</span>
                        )}
                      </div>
                    </div>
                    {selectedMeat === m.id && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  {isEs ? "Atrás" : "Back"}
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md border border-amber-400 transition cursor-pointer"
                >
                  ➔ {isEs ? "Siguiente: Elegir Queso" : "Next: Choose Cheese"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CHEESE */}
          {step === 4 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-yellow-300">
                {isEs ? "4. Elegí el queso para fundir o maridar:" : "4. Choose cheese to melt and pair:"}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {cheeses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundEngine.playSfx("menu_nav");
                      setSelectedCheese(c.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      selectedCheese === c.id
                        ? "bg-amber-950/60 border-amber-400 text-amber-200 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.icon}</span>
                      <span className="text-xs font-bold">{isEs ? c.nameEs : c.nameEn}</span>
                    </div>
                    {selectedCheese === c.id && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  {isEs ? "Atrás" : "Back"}
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md border border-amber-400 transition cursor-pointer"
                >
                  ➔ {isEs ? "Siguiente: Agregar Toppings" : "Next: Add Toppings"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: TOPPINGS */}
          {step === 5 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-yellow-300">
                {isEs ? "5. Seleccioná los extras y vegetales (Opcional):" : "5. Select extras & fresh veggies:"}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {toppings.map((t) => {
                  const isChecked = selectedToppings.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTopping(t.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isChecked
                          ? "bg-amber-950/60 border-amber-400 text-amber-200 shadow-md"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.icon}</span>
                        <span className="text-xs font-bold">{isEs ? t.nameEs : t.nameEn}</span>
                      </div>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(4)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  {isEs ? "Atrás" : "Back"}
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md border border-amber-400 transition cursor-pointer"
                >
                  ➔ {isEs ? "Ir al Corte y Tostado" : "Go to Toast & Slice"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: TIMING GAME (CORTE Y TOSTADO MAESTRO) */}
          {step === 6 && (
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                  {isEs ? "¡Corte y Tostado Maestro!" : "Master Toast & Slice!"}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isEs
                    ? "Presioná el botón cuando la barra esté en la zona verde dorada (65% - 88%) para 3 estrellas."
                    : "Press the button when the bar enters the golden green zone (65% - 88%) for 3 stars."}
                </p>
              </div>

              {/* Timing Bar */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>FRÍO</span>
                  <span className="text-amber-400">PUNTO PERFECTO</span>
                  <span>QUEMADO</span>
                </div>
                <div className="w-full h-5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
                  <div
                    className="h-full transition-all duration-75"
                    style={{
                      width: `${timingVal}%`,
                      backgroundColor:
                        timingVal >= 65 && timingVal <= 88
                          ? "#22c55e"
                          : timingVal > 88
                          ? "#f43f5e"
                          : "#eab308",
                    }}
                  />
                  {/* Target Sweet Spot Highlight */}
                  <div className="absolute top-0 bottom-0 left-[65%] w-[23%] border-x-2 border-dashed border-white bg-emerald-500/25" />
                </div>
                <span className="text-xs font-bold text-white block pt-1">
                  {Math.round(timingVal)}%
                </span>
              </div>

              {!timingLocked ? (
                <button
                  onClick={handleLockTiming}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-amber-300 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isEs ? "¡TOCAR PARA CORTAR Y SERVIR!" : "TAP TO SLICE AND SERVE!"}</span>
                </button>
              ) : (
                <div className="py-3 text-xs text-amber-300 font-bold animate-pulse">
                  {isEs ? "¡Preparando la obra maestra gourmet...!" : "Plating your gourmet masterpiece...!"}
                </div>
              )}
            </div>
          )}

          {/* STEP 7: RESULT */}
          {step === 7 && (
            <div className="space-y-4 text-center animate-fade-in">
              <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-2">
                <span className="text-5xl block animate-bounce">🥪✨</span>
                <div className="flex justify-center gap-1 text-amber-400">
                  {[...Array(3)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < stars ? "fill-amber-400 text-amber-400" : "text-slate-700"}`}
                    />
                  ))}
                </div>
                <h4 className="text-sm font-black text-amber-300 uppercase">
                  {stars === 3
                    ? (isEs ? "¡SÁNDWICH SUPREMO DE CKY!" : "CKY'S SUPREME SANDWICH!")
                    : (isEs ? "¡SÁNDWICH GOURMET DELICIOSO!" : "DELICIOUS GOURMET SANDWICH!")}
                </h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  {isEs
                    ? "CKY: 'mmmmm Mi favorito, sándwich de Salame y queso con toque de chef'. ¡Quedó guardado en tu mochila!"
                    : "CKY: 'mmmmm My favorite, Salami and cheese sandwich with a chef's touch'. Saved in your backpack!"}
                </p>
                <div className="pt-2 flex justify-center gap-2 text-[10px] font-bold">
                  <span className="bg-emerald-950 px-2 py-1 rounded text-emerald-300 border border-emerald-500/40">
                    +80% Hambre
                  </span>
                  <span className="bg-sky-950 px-2 py-1 rounded text-sky-300 border border-sky-500/40">
                    +30% Sed
                  </span>
                  <span className="bg-amber-950 px-2 py-1 rounded text-amber-300 border border-amber-500/40">
                    +40 XP
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400 transition cursor-pointer"
              >
                {isEs ? "¡Disfrutar y Salir!" : "Enjoy & Exit!"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
