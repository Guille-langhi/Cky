import React from "react";
import { Language, InventoryItem, OutfitType } from "../types";
import { soundEngine } from "../lib/soundEngine";
import { ShoppingBag, Sparkles, X, Coffee, Utensils, Heart, Check, DollarSign } from "lucide-react";

export type ShopType = "boutique" | "lingerie" | "perfume" | "cafe" | "don_pepe" | "fountain";

interface ShopCatalogModalProps {
  shopType: ShopType;
  language: Language;
  currentMoney: number;
  onBuyItem: (item: InventoryItem, price: number) => void;
  onThrowCoin?: () => void;
  onClose: () => void;
  inventory: InventoryItem[];
  onEquipOutfit?: (outfit: OutfitType) => void;
  currentOutfit?: OutfitType;
}

interface ShopProduct {
  id: string;
  nameEs: string;
  nameEn: string;
  descEs: string;
  descEn: string;
  angelaCommentEs: string;
  angelaCommentEn: string;
  icon: string;
  price: number;
  category: "backpack" | "pockets";
  isKey: boolean;
  usable: boolean;
  effect: {
    type: "hambre" | "sed" | "perfume" | "amor" | "higiene" | "bateriaCelular" | "water_bottle" | "money" | "speed_buff" | "outfit";
    amount: number;
    outfit?: OutfitType;
  };
  isOutfit?: boolean;
  outfitType?: OutfitType;
}

export const SHOP_CATALOGS: Record<ShopType, {
  titleEs: string;
  titleEn: string;
  subtitleEs: string;
  subtitleEn: string;
  accentColor: string;
  headerIcon: string;
  vendorName: string;
  products: ShopProduct[];
}> = {
  boutique: {
    titleEs: "Boutique de Moda 'Maison Chic'",
    titleEn: "Fashion Boutique 'Maison Chic'",
    subtitleEs: "Alta costura, pijamas de seda y conjuntos casuales para renovar tu guardarropa.",
    subtitleEn: "Haute couture, silk pajamas and casual outfits to refresh your wardrobe.",
    accentColor: "from-pink-900/90 to-rose-950/90 border-pink-500/50 text-pink-300",
    headerIcon: "👗",
    vendorName: "Madame Sophie",
    products: [
      {
        id: "pajamas_silk_item",
        nameEs: "Piyama de Seda Fina Rosa",
        nameEn: "Fine Pink Silk Pajamas",
        descEs: "Piyama de seda pura importada, suave como una caricia. CKY duerme como una reina.",
        descEn: "Pure imported silk pajamas, soft as a gentle touch. CKY sleeps like royalty.",
        angelaCommentEs: "¡¡Compralo ya CKY!! ¡Dormir con esa seda te deja la piel como un durazno!",
        angelaCommentEn: "Buy it now CKY!! Sleeping in that silk leaves your skin like a peach!",
        icon: "🎀",
        price: 6000,
        category: "backpack",
        isKey: true,
        usable: true,
        isOutfit: true,
        outfitType: "pajamas_silk",
        effect: { type: "outfit", amount: 20, outfit: "pajamas_silk" }
      },
      {
        id: "dress_gala_item",
        nameEs: "Vestido Elegante de Gala",
        nameEn: "Elegant Evening Gala Dress",
        descEs: "Vestido negro entallado de alta costura con escote en V y finas aplicaciones brillantes.",
        descEn: "Tailored black haute couture evening dress with plunging V-neck and sparkling accents.",
        angelaCommentEs: "¡¡POR DIOS CKY!! ¡Con este vestido dejás a todos con la mandíbula en el piso!",
        angelaCommentEn: "OMG CKY!! With this dress you'll drop everyone's jaw to the floor!",
        icon: "💃",
        price: 12000,
        category: "backpack",
        isKey: true,
        usable: true,
        isOutfit: true,
        outfitType: "dress_gala",
        effect: { type: "outfit", amount: 30, outfit: "dress_gala" }
      },
      {
        id: "urban_outfit_item",
        nameEs: "Conjunto Urbano Extra (Denim & Crop Top)",
        nameEn: "Extra Urban Outfit (Denim & Crop Top)",
        descEs: "Jean gastado corte mom, remera crop canchera y campera de jean oversized.",
        descEn: "Distressed mom jeans, trendy crop top, and oversized denim jacket.",
        angelaCommentEs: "Un look de calle re canchero para pasear por la plaza sin que te reconozcan.",
        angelaCommentEn: "A super trendy streetwear look to stroll the square unrecognized.",
        icon: "👖",
        price: 4500,
        category: "backpack",
        isKey: true,
        usable: true,
        isOutfit: true,
        outfitType: "casual",
        effect: { type: "outfit", amount: 15, outfit: "casual" }
      },
      {
        id: "pro_running_sneakers",
        nameEs: "Zapatillas de Running Pro",
        nameEn: "Pro Running Sneakers",
        descEs: "Zapatillas ultralivianas con suela de espuma reactiva. ¡Aumentan tu velocidad de desplazamiento!",
        descEn: "Ultra-lightweight sneakers with reactive foam soles. Boosts your movement speed!",
        angelaCommentEs: "¡Con estas zapatillas no te gana la vecina ni usando sus portales tramposos!",
        angelaCommentEn: "With these sneakers that neighbor won't beat you even with her cheat portals!",
        icon: "👟",
        price: 5000,
        category: "pockets",
        isKey: true,
        usable: true,
        effect: { type: "speed_buff", amount: 1 }
      }
    ]
  },
  lingerie: {
    titleEs: "Boutique de Lencería Fina 'Secret Rose'",
    titleEn: "Fine Lingerie Boutique 'Secret Rose'",
    subtitleEs: "Prendas íntimas seductoras, encajes importados y conjuntos atrevidos.",
    subtitleEn: "Seductive intimate wear, imported lace, and bold lingerie sets.",
    accentColor: "from-rose-950/90 to-red-950/90 border-rose-500/50 text-rose-300",
    headerIcon: "👙",
    vendorName: "Valentina (Especialista en Lencería)",
    products: [
      {
        id: "lingerie_sexy_item",
        nameEs: "Conjunto de Lencería Sexy Roja de Encaje",
        nameEn: "Sexy Red Lace Lingerie Set",
        descEs: "Conjunto escarlata de dos piezas con encaje bordado a mano y lazos de satén. ¡Requisito para el Día 7!",
        descEn: "Two-piece scarlet set with hand-embroidered lace and satin ribbons. Day 7 requirement!",
        angelaCommentEs: "¡¡ESTE ES EL QUE DIJO ALANIS!! ¡¡Te queda pintado CKY, sos una bomba atómica!!",
        angelaCommentEn: "THIS IS THE ONE ALANIS DEMANDED!! Fits you like a glove CKY, you're an atomic bomb!!",
        icon: "🌹",
        price: 8000,
        category: "backpack",
        isKey: true,
        usable: true,
        isOutfit: true,
        outfitType: "lingerie_sexy",
        effect: { type: "outfit", amount: 40, outfit: "lingerie_sexy" }
      },
      {
        id: "lingerie_black_lace",
        nameEs: "Conjunto de Encaje Negro Nocturno",
        nameEn: "Nightfall Black Lace Set",
        descEs: "Lencería gótica nocturna elegante con transparencias geométricas y detalles metálicos.",
        descEn: "Elegant night gothic lingerie with geometric transparencies and metallic accents.",
        angelaCommentEs: "Oscuro, misterioso y sensual. W se va a tapar los ojos de nuevo del susto jaja.",
        angelaCommentEn: "Dark, mysterious and sensual. W is going to cover his eyes in shock again haha.",
        icon: "🖤",
        price: 7500,
        category: "backpack",
        isKey: false,
        usable: true,
        isOutfit: true,
        outfitType: "lingerie",
        effect: { type: "outfit", amount: 30, outfit: "lingerie" }
      },
      {
        id: "silk_robe_translucent",
        nameEs: "Bata de Seda Traslúcida",
        nameEn: "Translucent Silk Robe",
        descEs: "Bata liviana vaporosa para usar sobre la lencería. Comodidad y elegancia en la habitación.",
        descEn: "Light airy robe to wear over lingerie. Comfort and elegance in your bedroom.",
        angelaCommentEs: "Re cómoda para andar por la casa cuando mamá no está mirando.",
        angelaCommentEn: "Super comfy to walk around the house when mom isn't looking.",
        icon: "👘",
        price: 6000,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "higiene", amount: 25 }
      }
    ]
  },
  perfume: {
    titleEs: "Stand de Alta Perfumería 'Nuit Éthérée'",
    titleEn: "Haute Perfumery Stand 'Nuit Éthérée'",
    subtitleEs: "Extractos franceses botánicos puros, elixires aromáticos y brumas celestiales.",
    subtitleEn: "Pure French botanical extracts, aromatic elixirs, and celestial mists.",
    accentColor: "from-indigo-950/90 to-purple-950/90 border-indigo-500/50 text-indigo-300",
    headerIcon: "✨",
    vendorName: "Monsieur Laurent",
    products: [
      {
        id: "french_perfume_luxury",
        nameEs: "Perfume de Lujo Francés 'Nuit Éthérée'",
        nameEn: "French Luxury Perfume 'Nuit Éthérée'",
        descEs: "Jazmín nocturno, vainilla de Madagascar y polvo astral. Restaura +100% de Perfume y otorga Carisma Cósmico.",
        descEn: "Night jasmine, Madagascar vanilla and astral dust. Restores +100% Perfume and grants Cosmic Charisma.",
        angelaCommentEs: "¡¡HUELE A DIOSA OLÍMPICA!! ¡Rociate un poco y las sombras van a quedar aturdidas de la hermosura!",
        angelaCommentEn: "SMELLS LIKE AN OLYMPIC GODDESS!! Spray a bit and shadows will be dazed by sheer beauty!",
        icon: "💎",
        price: 10000,
        category: "pockets",
        isKey: true,
        usable: true,
        effect: { type: "perfume", amount: 100 }
      },
      {
        id: "rosewater_mist_celestial",
        nameEs: "Bruma de Agua de Rosas Celestial",
        nameEn: "Celestial Rosewater Mist",
        descEs: "Frasco atomizador de agua de rosas destilada. Restaura +45% de perfume y refresca los sentidos.",
        descEn: "Atomizer bottle of distilled rose water. Restores +45% perfume and refreshes senses.",
        angelaCommentEs: "Un toque fresco para la cartera o la mochila. Te saca el cansancio de un plumazo.",
        angelaCommentEn: "A fresh touch for your purse or backpack. Wipes away fatigue in an instant.",
        icon: "🌹",
        price: 3000,
        category: "pockets",
        isKey: false,
        usable: true,
        effect: { type: "perfume", amount: 45 }
      },
      {
        id: "glowing_body_lotion",
        nameEs: "Loción Corporal con Brillo Dorado",
        nameEn: "Golden Shimmer Body Lotion",
        descEs: "Crema hidratante con microdestellos dorados que nutre la piel y resalta el aura espiritual.",
        descEn: "Moisturizing lotion with golden shimmer that nourishes skin and illuminates spiritual aura.",
        angelaCommentEs: "¡Quedás brillante como una estrella fugaz! Ideal para antes de ver al gemelo.",
        angelaCommentEn: "You sparkle like a shooting star! Perfect for before seeing your soulmate.",
        icon: "🧴",
        price: 4000,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "higiene", amount: 35 }
      }
    ]
  },
  cafe: {
    titleEs: "Café del Paseo Comercial",
    titleEn: "Mall Promenade Café",
    subtitleEs: "Bebidas heladas, frappés artesanales, licuados y repostería recién horneada.",
    subtitleEn: "Iced drinks, artisan frappés, fruit smoothies, and freshly baked pastries.",
    accentColor: "from-amber-950/90 to-yellow-950/90 border-amber-500/50 text-amber-300",
    headerIcon: "☕",
    vendorName: "Marcos (Barista)",
    products: [
      {
        id: "frappe_caramel_ice",
        nameEs: "Café Frappé Helado con Caramelo",
        nameEn: "Iced Caramel Frappé Coffee",
        descEs: "Café batido con hielo picado, crema chantilly abundante y salsa de caramelo. Restaura +45% Sed y +25% Energía.",
        descEn: "Blended coffee with crushed ice, rich whipped cream and caramel drizzle. Restores +45% Thirst and +25% Energy.",
        angelaCommentEs: "¡¡Ufff qué rico!! ¡El golpe de azúcar y cafeína que necesitabas para no dormirte!",
        angelaCommentEn: "Mmmm so good!! The sugar and caffeine hit you needed to stay awake!",
        icon: "🧋",
        price: 1200,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "sed", amount: 45 }
      },
      {
        id: "smoothie_strawberry_banana",
        nameEs: "Licuado de Frutilla y Banana",
        nameEn: "Strawberry Banana Smoothie",
        descEs: "Fruta natural batida con leche cremosa bien fría. Restaura +35% Sed y +25% Hambre.",
        descEn: "Fresh fruit blended with ice-cold creamy milk. Restores +35% Thirst and +25% Hunger.",
        angelaCommentEs: "Sano, rico y refrescante. CKY, tomate todo hasta el fondo.",
        angelaCommentEn: "Healthy, tasty and refreshing. CKY, drink every last drop.",
        icon: "🥤",
        price: 1000,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "sed", amount: 35 }
      },
      {
        id: "dulce_de_leche_croissants",
        nameEs: "Medialunas Calientes con Dulce de Leche",
        nameEn: "Warm Dulce de Leche Croissants",
        descEs: "Dos medialunas de manteca recién salidas del horno rellenas de dulce de leche colonial. Restaura +40% Hambre.",
        descEn: "Two freshly baked butter croissants stuffed with rich dulce de leche. Restores +40% Hunger.",
        angelaCommentEs: "¡¡Llenas de dulce de leche!! ¡Si mamá se entera de que comiste esto se vuelve loca!",
        angelaCommentEn: "Packed with dulce de leche!! If mom finds out you ate this she'll freak out!",
        icon: "🥐",
        price: 900,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "hambre", amount: 40 }
      },
      {
        id: "toasted_ham_cheese",
        nameEs: "Tostado de Miga Especial (Jamón y Queso)",
        nameEn: "Special Toasted Ham & Cheese Sandwich",
        descEs: "Clásico tostado argentino de pan de miga extra crocante con queso fundido. Restaura +50% Hambre.",
        descEn: "Classic toasted sandwich on extra crisp crumb bread with molten cheese. Restores +50% Hunger.",
        angelaCommentEs: "El tostado de miga no falla nunca. Te llena la panza al instante.",
        angelaCommentEn: "Toasted sandwich never fails. Fills your belly instantly.",
        icon: "🥪",
        price: 1500,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "hambre", amount: 50 }
      }
    ]
  },
  don_pepe: {
    titleEs: "Panchería Don Pepe (El Rey del Súper Pancho)",
    titleEn: "Don Pepe's Hot Dog Stand (The Super Hot Dog King)",
    subtitleEs: "Los mejores súper panchos con lluvia de papas pay crocantes y Coca helada.",
    subtitleEn: "Best super hot dogs with crispy potato sticks and ice-cold Coca-Cola.",
    accentColor: "from-orange-950/90 to-amber-950/90 border-orange-500/50 text-orange-300",
    headerIcon: "🌭",
    vendorName: "Don Pepe",
    products: [
      {
        id: "super_pancho_papas_pay",
        nameEs: "Súper Pancho con Lluvia de Papas Pay",
        nameEn: "Super Hot Dog with Crispy Potato Sticks",
        descEs: "Salchicha gigante tierna, pan caliente esponjoso y una montaña de papas pay con mayonesa casera. Restaura +55% Hambre.",
        descEn: "Giant tender sausage, warm fluffy bun, and a mountain of crispy potato sticks with homemade mayo. Restores +55% Hunger.",
        angelaCommentEs: "¡El favorito del barrio! Mirá la cantidad de papas pay que le pone Don Pepe.",
        angelaCommentEn: "Neighborhood favorite! Look at the mountain of potato sticks Don Pepe piles on.",
        icon: "🌭",
        price: 1200,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "hambre", amount: 55 }
      },
      {
        id: "coca_cola_glass_ice",
        nameEs: "Coca-Cola de Vidrio Bien Helada",
        nameEn: "Ice-Cold Glass Bottle Coca-Cola",
        descEs: "Botellita de Coca-Cola de vidrio a punto nieve con burbujas intensas. Restaura +45% Sed y +20% Energía.",
        descEn: "Glass bottle Coke chilled to perfection with intense fizz. Restores +45% Thirst and +20% Energy.",
        angelaCommentEs: "No hay nada en el universo que supere una Coca de vidrio bien fría.",
        angelaCommentEn: "Nothing in the universe beats an ice-cold glass bottle Coke.",
        icon: "🥤",
        price: 800,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "sed", amount: 45 }
      },
      {
        id: "combo_campeon_don_pepe",
        nameEs: "Combo Campeón: Súper Pancho + Coca + Papas",
        nameEn: "Champion Combo: Super Hot Dog + Coke + Chips",
        descEs: "El combo legendario completo. Restaura +65% Hambre, +45% Sed y +30% Energía.",
        descEn: "The legendary full combo. Restores +65% Hunger, +45% Thirst, and +30% Energy.",
        angelaCommentEs: "¡¡EL COMBO DE LA DERROTA DE LA VECINA!! Aunque perdimos la carrera, comemos como campeonas.",
        angelaCommentEn: "THE NEIGHBOR DEFEAT COMBO!! Even if we lost the race, we eat like champions.",
        icon: "🏆",
        price: 1800,
        category: "backpack",
        isKey: false,
        usable: true,
        effect: { type: "hambre", amount: 65 }
      }
    ]
  },
  fountain: {
    titleEs: "Fuente Central de los Deseos",
    titleEn: "Central Wishing Fountain",
    subtitleEs: "Aguas cristalinas que reflejan el domo vidriado. Dicen que arrojar una moneda otorga bendiciones espirituales.",
    subtitleEn: "Crystal clear waters reflecting the glass dome. Rumor has it tossing a coin grants spiritual blessings.",
    accentColor: "from-cyan-950/90 to-blue-950/90 border-cyan-500/50 text-cyan-300",
    headerIcon: "⛲",
    vendorName: "Espíritu de la Fuente",
    products: []
  }
};

export const ShopCatalogModal: React.FC<ShopCatalogModalProps> = ({
  shopType,
  language,
  currentMoney,
  onBuyItem,
  onThrowCoin,
  onClose,
  inventory,
  onEquipOutfit,
  currentOutfit
}) => {
  const shopData = SHOP_CATALOGS[shopType];

  const hasItem = (itemId: string) => {
    return inventory.some(i => i.id === itemId);
  };

  const handleBuy = (product: ShopProduct) => {
    if (currentMoney < product.price) {
      soundEngine.playTone(200, "sawtooth", 0.2);
      return;
    }
    soundEngine.playSfx("purchase");
    const newItem: InventoryItem = {
      id: product.id,
      nameEs: product.nameEs,
      nameEn: product.nameEn,
      descEs: product.descEs,
      descEn: product.descEn,
      icon: product.icon,
      isKey: product.isKey,
      category: product.category,
      usable: product.usable,
      price: product.price,
      effect: product.effect
    };
    onBuyItem(newItem, product.price);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in font-mono">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-950 border-2 rounded-2xl shadow-2xl overflow-hidden border-slate-700">
        
        {/* Header banner */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${shopData.accentColor} border-b flex items-start justify-between relative`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-3xl shadow-inner">
              {shopData.headerIcon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white flex items-center gap-2">
                {language === "es" ? shopData.titleEs : shopData.titleEn}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-md">
                {language === "es" ? shopData.subtitleEs : shopData.subtitleEn}
              </p>
              <div className="text-[11px] font-bold text-yellow-300 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === "es" ? "Atiende:" : "Attendant:"} {shopData.vendorName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => {
                soundEngine.playTone(350, "sine", 0.08);
                onClose();
              }}
              className="w-8 h-8 rounded-lg bg-black/40 hover:bg-rose-600/80 text-white flex items-center justify-center border border-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Money badge */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-yellow-500/40 text-yellow-400 font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <DollarSign className="w-3.5 h-3.5 text-yellow-400" />
              <span>${currentMoney.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Fountain special view */}
        {shopType === "fountain" ? (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="text-6xl animate-bounce">⛲</div>
            <h3 className="text-base font-bold text-cyan-300">
              {language === "es" ? "Pide un Deseo en la Fuente" : "Make a Wish in the Fountain"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {language === "es"
                ? "El agua murmura ecos celestiales de tiempos antiguos. Arrojar una moneda de $10 pesos otorga +15% de Ánimo, +20 de XP y una sutil bendición de buena suerte."
                : "The water murmurs celestial echoes of ancient times. Tossing a $10 coin grants +15% Spirit, +20 XP, and a subtle good luck blessing."}
            </p>
            <button
              onClick={() => {
                if (currentMoney >= 10 && onThrowCoin) {
                  soundEngine.playSfx("coin");
                  onThrowCoin();
                } else {
                  soundEngine.playTone(200, "sawtooth", 0.2);
                }
              }}
              disabled={currentMoney < 10}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>🪙</span>
              <span>{language === "es" ? "Arrojar Moneda ($10)" : "Toss Coin ($10)"}</span>
            </button>
          </div>
        ) : (
          /* Products List */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {shopData.products.map((prod) => {
                const alreadyOwned = prod.isOutfit && hasItem(prod.id);
                const isEquipped = prod.outfitType && currentOutfit === prod.outfitType;
                const canAfford = currentMoney >= prod.price;

                return (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-2 rounded-lg bg-black/40 border border-slate-800">
                            {prod.icon}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-yellow-300 transition-colors">
                              {language === "es" ? prod.nameEs : prod.nameEn}
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              ${prod.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {alreadyOwned && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            {language === "es" ? "Comprado" : "Owned"}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {language === "es" ? prod.descEs : prod.descEn}
                      </p>

                      {/* Angela Comment */}
                      <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-300 flex items-start gap-1.5">
                        <span className="text-xs">👻</span>
                        <span className="italic leading-snug">
                          {language === "es" ? prod.angelaCommentEs : prod.angelaCommentEn}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        {prod.effect.type === "outfit" && (
                          <span className="text-pink-400">👗 {language === "es" ? "Atuendo Ropero" : "Wardrobe Outfit"}</span>
                        )}
                        {prod.effect.type === "hambre" && (
                          <span className="text-orange-400">🍗 +{prod.effect.amount}% {language === "es" ? "Hambre" : "Hunger"}</span>
                        )}
                        {prod.effect.type === "sed" && (
                          <span className="text-blue-400">🥤 +{prod.effect.amount}% {language === "es" ? "Sed" : "Thirst"}</span>
                        )}
                        {prod.effect.type === "perfume" && (
                          <span className="text-purple-400">✨ +{prod.effect.amount}% {language === "es" ? "Perfume" : "Perfume"}</span>
                        )}
                        {prod.effect.type === "speed_buff" && (
                          <span className="text-emerald-400">⚡ +Velocidad</span>
                        )}
                      </div>

                      {alreadyOwned && prod.outfitType && onEquipOutfit ? (
                        <button
                          onClick={() => {
                            soundEngine.playSfx("dialogue");
                            if (prod.outfitType) onEquipOutfit(prod.outfitType);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isEquipped
                              ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default"
                              : "bg-pink-600 hover:bg-pink-500 text-white shadow"
                          }`}
                        >
                          {isEquipped
                            ? (language === "es" ? "Equipado" : "Equipped")
                            : (language === "es" ? "Vestir Ahora" : "Wear Now")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(prod)}
                          disabled={!canAfford || alreadyOwned}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            alreadyOwned
                              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                              : canAfford
                              ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md active:scale-95"
                              : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>
                            {alreadyOwned
                              ? (language === "es" ? "En Guardarropa" : "In Wardrobe")
                              : canAfford
                              ? (language === "es" ? "Comprar" : "Buy")
                              : (language === "es" ? "Sin Fondos" : "No Funds")}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>{language === "es" ? "Las compras se guardan automáticamente en tu inventario o guardarropa." : "Purchases are automatically saved in your inventory or wardrobe."}</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playTone(350, "sine", 0.08);
              onClose();
            }}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-bold"
          >
            {language === "es" ? "Volver" : "Back"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShopCatalogModal;
