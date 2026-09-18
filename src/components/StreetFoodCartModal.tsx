import React from "react";
import { X, Sparkles, Heart, Utensils, Award } from "lucide-react";
import { Language, InventoryItem } from "../types";
import { soundEngine } from "../lib/soundEngine";

interface StreetFoodCartModalProps {
  language: Language;
  onClose: () => void;
  money: number;
  onDeductMoney: (amount: number) => void;
  onAddXP: (amount: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onRestoreStats: (hungerDelta: number, thirstDelta: number) => void;
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

interface CartProduct {
  id: string;
  nameEs: string;
  nameEn: string;
  price: number;
  icon: string;
  descEs: string;
  descEn: string;
  hungerRestore: number;
  thirstRestore: number;
  phraseEs: string;
  phraseEn: string;
}

const MENU_ITEMS: CartProduct[] = [
  {
    id: "pancho_don_pepe_clasico",
    nameEs: "Pancho con Lluvia de Papas Pay",
    nameEn: "Classic Hot Dog with Crispy Straw Potatoes",
    price: 150,
    icon: "🌭",
    descEs: "Pancho gigante al vapor con mayonesa casera y abundante lluvia de papas pay.",
    descEn: "Steamed hot dog with homemade mayo and crispy straw potatoes.",
    hungerRestore: 50,
    thirstRestore: 0,
    phraseEs: "¡Marcha un pancho completísimo para la piba! ¡Con mucha lluvia de papas!",
    phraseEn: "One loaded hot dog coming right up with extra crispy potatoes!"
  },
  {
    id: "coca_vidrio_fresca",
    nameEs: "Coquita de Vidrio Bien Fría",
    nameEn: "Ice-Cold Glass Bottle Soda",
    price: 100,
    icon: "🥤",
    descEs: "La clásica botellita de vidrio sacada del freezer con hielo molido.",
    descEn: "The classic ice-cold glass bottle straight from the freezer.",
    hungerRestore: 0,
    thirstRestore: 45,
    phraseEs: "¡Destapada con el abridor de chapa! ¡Hace 'tsss' de lo fría que está!",
    phraseEn: "Popped with the metal bottle opener! So cold it hisses!"
  },
  {
    id: "alfajor_santafesino_artesanal",
    nameEs: "Alfajor Santafesino Artesanal",
    nameEn: "Artisan Dulce de Leche Alfajor",
    price: 80,
    icon: "🍫",
    descEs: "Capas de masa crocante con dulce de leche repostero y baño de glasé.",
    descEn: "Crispy layers packed with dulce de leche and sweet white glaze.",
    hungerRestore: 25,
    thirstRestore: 0,
    phraseEs: "¡Mmm dulce de leche posta! ¡Para endulzar la tarde después de la escuela!",
    phraseEn: "Real dulce de leche! Sweet treat for after school!"
  },
  {
    id: "combo_supremo_don_pepe",
    nameEs: "Super Combo Campeón de Don Pepe",
    nameEn: "Don Pepe's Champion Super Combo",
    price: 300,
    icon: "⭐",
    descEs: "El Pancho Completo + Coquita de Vidrio + Alfajor. ¡Comida de reyes!",
    descEn: "Full Hot Dog + Cold Glass Soda + Alfajor. Meal of champions!",
    hungerRestore: 80,
    thirstRestore: 50,
    phraseEs: "¡EL COMBO DE LOS CAMPEONES! ¡Vas a quedar con la panza llena hasta el jueves!",
    phraseEn: "THE CHAMPION COMBO! Your belly will be full until Thursday!"
  },
  {
    id: "combo_10print_dev_special",
    nameEs: "Promo Dev 10Print_ Studios 👾",
    nameEn: "10Print_ Studios Dev Special 👾",
    price: 350,
    icon: "🎮",
    descEs: "Pancho Doble con lluvia de papas pay, chimichurri especial y coquita helada. ¡El combustible oficial de los creadores de 10Print_!",
    descEn: "Double hot dog with crispy potato sticks, special chimichurri and ice cold soda. The official fuel of 10Print_ devs!",
    hungerRestore: 95,
    thirstRestore: 60,
    phraseEs: "¡EL COMBO 10PRINT_! ¡Con esto programás toda la noche o le ganás a tres sombras del Limbo juntas!",
    phraseEn: "THE 10PRINT_ COMBO! Fuel up to code all night or smash three Limbo shadows in a row!"
  }
];

export default function StreetFoodCartModal({
  language,
  onClose,
  money,
  onDeductMoney,
  onAddXP,
  onAddInventoryItem,
  onRestoreStats,
  onShowNotification
}: StreetFoodCartModalProps) {
  const [dialogueLine, setDialogueLine] = React.useState<string>(
    language === "es"
      ? "¡Buenas tardes, piba! ¿Qué te preparamos hoy en el puesto de Don Pepe? ¡Todo fresco!"
      : "Good afternoon, girl! What can we cook for you today at Don Pepe's cart? All fresh!"
  );

  const handleBuy = (item: CartProduct) => {
    if (money < item.price) {
      soundEngine.playSfx("hit");
      setDialogueLine(
        language === "es"
          ? "¡Uyy te faltan unos manguitos! No te preocupes, volvé cuando tengas."
          : "Oops, you're a few bucks short! Don't worry, come back when you have it."
      );
      return;
    }

    onDeductMoney(item.price);
    soundEngine.playSfx("purchase");
    onRestoreStats(item.hungerRestore, item.thirstRestore);
    onAddXP(15);
    setDialogueLine(language === "es" ? item.phraseEs : item.phraseEn);

    // Add item to inventory
    const invItem: InventoryItem = {
      id: `${item.id}_${Date.now()}`,
      nameEs: item.nameEs,
      nameEn: item.nameEn,
      descEs: item.descEs,
      descEn: item.descEn,
      icon: item.icon,
      isKey: false,
      category: "backpack",
      usable: true,
      effect: {
        type: item.hungerRestore > 0 ? "hambre" : "sed",
        amount: Math.max(item.hungerRestore, item.thirstRestore)
      }
    };
    onAddInventoryItem(invItem);

    if (onShowNotification) {
      onShowNotification({
        icon: item.icon,
        titleEs: `¡Compraste ${item.nameEs}!`,
        titleEn: `Bought ${item.nameEn}!`,
        subEs: `Restauró +${item.hungerRestore}% Hambre / +${item.thirstRestore}% Sed (+15 XP).`,
        subEn: `Restored +${item.hungerRestore}% Hunger / +${item.thirstRestore}% Thirst (+15 XP).`,
        color: "emerald"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 font-mono select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40 text-2xl">
              🌭
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                {language === "es" ? "Puesto de Panchos 'Don Pepe'" : "Don Pepe's Hot Dog Cart"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === "es" ? "Comida callejera tradicional del pueblo" : "Traditional street food cart"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Don Pepe Dialogue Speech Bubble */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-start gap-3 shadow-inner">
          <div className="text-3xl">👨‍🍳</div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
              Don Pepe
            </span>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
              "{dialogueLine}"
            </p>
          </div>
        </div>

        {/* Money status */}
        <div className="flex justify-between items-center text-xs text-slate-300 px-1">
          <span>{language === "es" ? "Tu billetera:" : "Your wallet:"}</span>
          <strong className="text-emerald-400 font-bold text-sm">${money}</strong>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
          {MENU_ITEMS.map((item) => {
            const canAfford = money >= item.price;
            return (
              <button
                key={item.id}
                onClick={() => handleBuy(item)}
                disabled={!canAfford}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  canAfford
                    ? "bg-slate-950/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 cursor-pointer"
                    : "bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      {language === "es" ? item.nameEs : item.nameEn}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {language === "es" ? item.descEs : item.descEn}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-emerald-400 font-bold">
                      {item.hungerRestore > 0 && <span>+{item.hungerRestore}% Hambre</span>}
                      {item.thirstRestore > 0 && <span>+{item.thirstRestore}% Sed</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400">
                    ${item.price}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase transition-colors cursor-pointer"
          >
            {language === "es" ? "Listo, ¡muchas gracias Don Pepe!" : "Done, thanks Don Pepe!"}
          </button>
          <div className="text-[9px] text-center text-slate-500 flex items-center justify-center gap-1">
            <span>👾</span>
            <span>{language === "es" ? "Puesto de comida auspiciado con cariño por 10Print_ Studios" : "Street cart lovingly sponsored by 10Print_ Studios"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
