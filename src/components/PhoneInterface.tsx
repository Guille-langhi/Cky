import React, { useState, useEffect } from "react";
import { PhoneChat, PhonePhoto, Language, PhoneMessage, CharacterStats } from "../types";
import { 
  SAVE_SLOTS, 
  saveToSlot, 
  getAllSaveSlots, 
  SaveSlotData 
} from "../lib/saveSystem";
import { 
  Smartphone, 
  MessageSquare, 
  Image as ImageIcon, 
  Gamepad2, 
  Sparkles, 
  Trash2, 
  Download, 
  CheckCircle2, 
  X, 
  Eye, 
  Award,
  AlertCircle,
  Save,
  HardDrive,
  Camera,
  Aperture,
  RotateCcw,
  Heart,
  Filter,
  Music,
  Share2,
  Play,
  Pause,
  SkipForward,
  Volume2,
  ThumbsUp,
  MessageCircle
} from "lucide-react";
import PhotoViewerModal from "./PhotoViewerModal";
import { soundEngine } from "../lib/soundEngine";
import { androidBridge } from "../lib/androidMobileBridge";

interface PhoneInterfaceProps {
  language: Language;
  phoneChats: PhoneChat[];
  phonePhotos: PhonePhoto[];
  onSelectReply: (chatId: string, replyIndex: number) => void;
  onSavePhotoToGallery: (photo: PhonePhoto) => void;
  onDeletePhotoMessage?: (chatId: string, msgId: string) => void;
  onDeletePhotoFromGallery?: (photoId: string) => void;
  onClose: () => void;
  onOpenSaveLoadModal?: (mode: "save" | "load") => void;
  onAddXP?: (amount: number) => void;
  stats?: CharacterStats;
  getCurrentSavePayload?: () => any;
  onLoadGame?: (saveData: any) => void;
  onMarkChatRead?: (chatId: string) => void;
}

export default function PhoneInterface({
  language,
  phoneChats,
  phonePhotos,
  onSelectReply,
  onSavePhotoToGallery,
  onDeletePhotoMessage,
  onDeletePhotoFromGallery,
  onClose,
  onOpenSaveLoadModal,
  onAddXP,
  stats,
  getCurrentSavePayload,
  onLoadGame,
  onMarkChatRead,
}: PhoneInterfaceProps) {
  const [activeApp, setActiveApp] = useState<"messages" | "camera" | "gallery" | "games" | "save" | "music" | "instacky">("messages");
  const [selectedChatId, setSelectedChatId] = useState<string>(phoneChats[0]?.id || "");
  const [selectedPhoto, setSelectedPhoto] = useState<PhonePhoto | null>(null);
  const [galleryCategory, setGalleryCategory] = useState<"all" | "favorites" | "mom" | "selfie" | "adventure">("all");
  const [favoritePhotoIds, setFavoritePhotoIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("cky_photo_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Music Player State
  const [currentBgmTrack, setCurrentBgmTrack] = useState<string>("house");
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.35);

  // Haptics state in phone
  const [phoneHapticsOn, setPhoneHapticsOn] = useState<boolean>(() => androidBridge.isHapticsEnabled());

  // InstaCKY Social Feed State
  const [instaPosts, setInstaPosts] = useState<Array<{
    id: string;
    author: string;
    avatar: string;
    time: string;
    caption: string;
    icon: string;
    likes: number;
    userLiked: boolean;
    comments: Array<{ author: string; text: string }>;
  }>>(() => {
    try {
      const stored = localStorage.getItem("cky_instacky_posts");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: "post_1",
        author: "Mamá",
        avatar: "👩",
        time: "Hace 2 horas",
        caption: "¡Domingo de limpieza profunda en la casa! 🧹 CKY levantate ya a ordenar el ropero que se caen las cosas.",
        icon: "🧹",
        likes: 12,
        userLiked: false,
        comments: [
          { author: "Vecina Paula", text: "¡Qué aplicada, vecina! Mis felicitaciones..." },
          { author: "CKY", text: "Ya voy maaaa cinco minutitos más..." }
        ]
      },
      {
        id: "post_2",
        author: "Mateo",
        avatar: "⚽",
        time: "Hace 4 horas",
        caption: "Entrenando penales después de clase en el patio ⚽ ¡El que me meta 3 goles se gana un alfajor!",
        icon: "🥅",
        likes: 38,
        userLiked: false,
        comments: [
          { author: "Nico", text: "Yo te clavo 5 al ángulo fácil hermano" },
          { author: "CKY", text: "Prepará el alfajor porque te gano seguro" }
        ]
      },
      {
        id: "post_3",
        author: "Profesor Montenegro",
        avatar: "👨‍🏫",
        time: "Ayer",
        caption: "Recordatorio a todo el curso: repasar el mapa de las provincias argentinas para la prueba sorpresa.",
        icon: "📚",
        likes: 9,
        userLiked: false,
        comments: [
          { author: "Jaz", text: "Profe por favor tenga piedad con las preguntas 😭" }
        ]
      },
      {
        id: "post_4",
        author: "Tía Pocha",
        avatar: "👵",
        time: "Hace 1 hora",
        caption: "Desayuno de campeones: mate amargo con tortas fritas con grasa de pella ☕✨ Si la vecina te mira con envidia, le tirás tres granos de sal gruesa en el cordón y santo remedio.",
        icon: "🧉",
        likes: 54,
        userLiked: false,
        comments: [
          { author: "CKY", text: "¡Tía no tires sal que se me enoja la doña!" },
          { author: "Vecina Paula", text: "Estoy leyendo esto, doña Pocha." },
          { author: "Tía Pocha", text: "Para vos también hay luz y bendiciones corazón." }
        ]
      },
      {
        id: "post_5",
        author: "Vecina Paula",
        avatar: "🦹‍♀️",
        time: "Hace 3 horas",
        caption: "Contemplando la paz del barrio mientras riego mis begonias... 🌸 Una vecina ejemplar jamás albergaría rencor ni abriría fisuras dimensionales en el patio. #Zen #VecinaDelAño",
        icon: "🪴",
        likes: 15,
        userLiked: false,
        comments: [
          { author: "Ángela", text: "Se le está quemando la pava en la cocina señora." },
          { author: "CKY", text: "Dejá de espiar por la persiana que te vemos la frente pegada al vidrio." }
        ]
      },
      {
        id: "post_6",
        author: "Chofer Colectivo 87",
        avatar: "🚌",
        time: "Hace 5 horas",
        caption: "Aviso a los pibes de la Escuela 87: El bondi no es boliche ni cancha de papi fútbol. El que vuelva a tirar un bollito de papel mojado al techo se baja a mitad de la avenida y camina bajo la lluvia.",
        icon: "🚦",
        likes: 88,
        userLiked: false,
        comments: [
          { author: "Mateo", text: "Fue Nico chofer, yo vi todo con mis propios ojos." },
          { author: "Nico", text: "¡Qué botón ortiva que sos Mateo! Te voy a meter un caño en el recreo." }
        ]
      },
      {
        id: "post_7",
        author: "Bobby (Caniche Blanco)",
        avatar: "🐩",
        time: "Hace 10 min",
        caption: "GRRRRRRR GUAU GUAU GUAU GUAU WOF WOF WOF (Traducción canina: Si pisás la baldosa floja de mi vereda te arranco los cordones de las zapatillas).",
        icon: "🦴",
        likes: 104,
        userLiked: false,
        comments: [
          { author: "CKY", text: "Tranquilo Bobby que te soplo y salís volando como un barrilete." },
          { author: "Ángela", text: "Tiene más maldad concentrada que el rey de los abismos cósmicos." }
        ]
      },
      {
        id: "post_8_postgame_teaser",
        author: "Chusmerío Barrio CKY (Oficial)",
        avatar: "🔥",
        time: "Recién",
        caption: "📢 ¡ALERTA BARRIAL! Se rumorea que al terminar la historia principal (Día 8: Ataque Final), se desbloquea el MODO LIBRE con 15+ Misiones Locas y Picantes: Ángela llevando al grupo al sex shop, pijama party en lencería roja, W en el gimnasio desafiando pesistas y yoga para brujas. ¡A terminar el juego para desbloquear!",
        icon: "✨",
        likes: 240,
        userLiked: false,
        comments: [
          { author: "Ángela", text: "¡Siiii! ¡Tengo una lista de travesuras que van a escandalizar al barrio entero!" },
          { author: "W (Guardián)", text: "¡Mi honor ancestral vigilará que la decencia no perezca ante el desmadre!" },
          { author: "CKY", text: "¡No me quemen que Mamá lee este muro!" }
        ]
      },
      {
        id: "post_10print_official",
        author: "10Print_ Studios (Oficial) 👾",
        avatar: "🎮",
        time: "Hace 5 min",
        caption: "🚀 ¡Gracias a todos los jugadores por acompañarnos en CKY RPG para Android! Desarrollado con pasión, café y sándwiches de salame. ¿Ya descubrieron todos los secretos del pueblo? Dejen su reseña y compartan con amigos. #10Print_ #IndieDev #CKYRPG #PixelArt",
        icon: "🌟",
        likes: 1250,
        userLiked: false,
        comments: [
          { author: "CKY", text: "¡El mejor juego de todos! Pero aflojen con las tareas escolares jaja 💖" },
          { author: "Ángela", text: "¡Pónganme más facha en la próxima actualización, desarrolladores de 10Print_!" },
          { author: "W (Guardián)", text: "Doy mi bendición sagrada a las líneas de código de 10Print_ Studios." },
          { author: "Mateo", text: "10Print_ agreguen un modo torneo de penales por favor crackss!" }
        ]
      }
    ];
  });

  const [selectedUploadPhotoId, setSelectedUploadPhotoId] = useState<string>("");
  const [uploadCaption, setUploadCaption] = useState<string>("");

  // Camera Filters & Poses
  const [cameraFilter, setCameraFilter] = useState<"none" | "cat" | "astral" | "sunglasses" | "hearts" | "retro">("none");
  const [cameraPose, setCameraPose] = useState<"peace" | "wink" | "furious" | "sandwich">("peace");

  const handleToggleFavorite = (photoId: string) => {
    setFavoritePhotoIds((prev) => {
      const next = prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId];
      try {
        localStorage.setItem("cky_photo_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-select unread chat or fallback to first chat if selection is invalid
  useEffect(() => {
    if (!selectedChatId && phoneChats.length > 0) {
      const unreadChat = phoneChats.find((c) => c.unread);
      setSelectedChatId(unreadChat ? unreadChat.id : phoneChats[0].id);
    } else if (selectedChatId && !phoneChats.some((c) => c.id === selectedChatId) && phoneChats.length > 0) {
      setSelectedChatId(phoneChats[0].id);
    } else {
      const unreadChat = phoneChats.find((c) => c.unread);
      if (unreadChat && unreadChat.id !== selectedChatId) {
        setSelectedChatId(unreadChat.id);
      }
    }
  }, [phoneChats, selectedChatId]);

  // Mark chat read ONLY if currently selected chat is unread
  const activeChat = phoneChats.find((c) => c.id === selectedChatId);
  useEffect(() => {
    if (activeChat && activeChat.unread && onMarkChatRead) {
      onMarkChatRead(activeChat.id);
    }
  }, [activeChat, onMarkChatRead]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatId, activeChat?.messages?.length, activeChat?.replies?.length]);

  // Camera App State
  const [cameraMode, setCameraMode] = useState<"selfie" | "environment" | "filter">("selfie");
  const [cameraCaption, setCameraCaption] = useState<string>("");
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [cameraToast, setCameraToast] = useState<string | null>(null);

  const handleTakeCameraPhoto = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    let icon = "👧";
    let titleEs = "Selfie de CKY";
    let titleEn = "CKY Selfie";
    let descEs = "Foto selfie tomada con la cámara del celular CKY OS.";
    let descEn = "Selfie taken with CKY OS smartphone camera.";

    // Pose adjustments
    const poseIcons: Record<string, string> = {
      peace: "✌️",
      wink: "😉",
      furious: "😤",
      sandwich: "🥪"
    };
    const poseIcon = poseIcons[cameraPose] || "✌️";

    // Filter adjustments
    if (cameraFilter === "cat") {
      icon = `🐱${poseIcon}`;
      titleEs = "Selfie Gatito Michi";
      titleEn = "Kitty Cat Selfie";
    } else if (cameraFilter === "astral") {
      icon = `✨${poseIcon}🌌`;
      titleEs = "Selfie Astral Cósmica";
      titleEn = "Cosmic Astral Selfie";
    } else if (cameraFilter === "sunglasses") {
      icon = `😎${poseIcon}`;
      titleEs = "Selfie Canchera";
      titleEn = "Cool Sunglasses Selfie";
    } else if (cameraFilter === "hearts") {
      icon = `💖${poseIcon}`;
      titleEs = "Selfie Corazoncitos Kawaii";
      titleEn = "Kawaii Hearts Selfie";
    } else if (cameraFilter === "retro") {
      icon = `📺${poseIcon}`;
      titleEs = "Selfie Retro 90s";
      titleEn = "90s Retro Selfie";
    } else if (cameraMode === "environment") {
      icon = "🏡";
      titleEs = "Foto del Entorno";
      titleEn = "Environment Photo";
      descEs = "Fotografía de los alrededores tomada por CKY.";
      descEn = "Surroundings photo taken by CKY.";
    } else {
      icon = `👧${poseIcon}`;
    }

    if (cameraCaption.trim()) {
      titleEs = cameraCaption.trim();
      titleEn = cameraCaption.trim();
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString();

    const newPhoto: PhonePhoto = {
      id: `cam_${Date.now()}`,
      titleEs,
      titleEn,
      descEs: `${descEs} (${timeStr})`,
      descEn: `${descEn} (${timeStr})`,
      date: `${dateStr} ${timeStr}`,
      category: cameraMode === "environment" ? "other" : "selfie",
      icon,
      savedInGallery: true
    };

    onSavePhotoToGallery(newPhoto);
    if (onAddXP) onAddXP(5);

    setCameraToast(
      language === "es" 
        ? "📸 ¡Foto tomada y guardada en la Galería! (+5 XP)" 
        : "📸 Photo taken and saved to Gallery! (+5 XP)"
    );
    setTimeout(() => setCameraToast(null), 3000);
    setCameraCaption("");
  };

  // Music handlers
  const handlePlayTrack = (trackId: string) => {
    setCurrentBgmTrack(trackId);
    setIsMusicPlaying(true);
    soundEngine.playBgm(trackId as any);
  };

  const handleTogglePlayMusic = () => {
    if (isMusicPlaying) {
      soundEngine.stopBgm();
      setIsMusicPlaying(false);
    } else {
      soundEngine.playBgm(currentBgmTrack as any);
      setIsMusicPlaying(true);
    }
  };

  // InstaCKY handlers
  const handleToggleLikePost = (postId: string) => {
    setInstaPosts(prev => {
      const next = prev.map(p => {
        if (p.id === postId) {
          soundEngine.playSfx(p.userLiked ? "dialogue" : "purchase");
          return {
            ...p,
            userLiked: !p.userLiked,
            likes: p.userLiked ? p.likes - 1 : p.likes + 1
          };
        }
        return p;
      });
      try {
        localStorage.setItem("cky_instacky_posts", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handlePostPhotoToFeed = () => {
    if (!selectedUploadPhotoId) return;
    const photoToPost = phonePhotos.find(p => p.id === selectedUploadPhotoId);
    if (!photoToPost) return;

    const newPost = {
      id: `post_${Date.now()}`,
      author: "CKY",
      avatar: "👧",
      time: "Recién",
      caption: uploadCaption.trim() || (language === "es" ? photoToPost.titleEs : photoToPost.titleEn),
      icon: photoToPost.icon,
      likes: 1,
      userLiked: true,
      comments: [
        { author: "Mamá", text: "¡Qué linda saliste hijita! No te olvides de ordenar el cuarto." },
        { author: "Mateo", text: "Buena foto crack 🔥" }
      ]
    };

    setInstaPosts(prev => {
      const next = [newPost, ...prev];
      try {
        localStorage.setItem("cky_instacky_posts", JSON.stringify(next));
      } catch {}
      return next;
    });

    soundEngine.playSfx("fanfare");
    if (onAddXP) onAddXP(15);
    setSelectedUploadPhotoId("");
    setUploadCaption("");
  };

  // Phone Save System State
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);
  const [slotsData, setSlotsData] = useState<Record<string, SaveSlotData | null>>({});

  const reloadSlotsData = () => {
    setSlotsData(getAllSaveSlots());
  };

  useEffect(() => {
    reloadSlotsData();
  }, []);

  const handlePhoneQuickSave = (slotId: string = "slot_1") => {
    if (!getCurrentSavePayload) {
      if (onOpenSaveLoadModal) onOpenSaveLoadModal("save");
      return;
    }
    const payload = getCurrentSavePayload();
    const success = saveToSlot(slotId, payload);
    if (success) {
      const slotDef = SAVE_SLOTS.find((s) => s.id === slotId);
      const name = slotDef ? (language === "es" ? slotDef.nameEs : slotDef.nameEn) : slotId;
      setSaveStatusMsg(
        language === "es"
          ? `¡Partida guardada exitosamente en ${name}!`
          : `Game saved successfully in ${name}!`
      );
      reloadSlotsData();
      setTimeout(() => setSaveStatusMsg(null), 3500);
    } else {
      setSaveStatusMsg(
        language === "es" ? "❌ Error al guardar la partida" : "❌ Error saving game"
      );
      setTimeout(() => setSaveStatusMsg(null), 3500);
    }
  };

  // Mini-game state (Cucaracha Tap 8-bit)
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(15);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [bugs, setBugs] = useState<{ id: number; x: number; y: number }[]>([]);

  // Start mini game
  const startGame = () => {
    setGameScore(0);
    setGameTimeLeft(15);
    setIsGameActive(true);
    spawnBugs();
  };

  const spawnBugs = () => {
    const newBugs = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 70) + 15,
    }));
    setBugs(newBugs);
  };

  const squishBug = (id: number) => {
    setGameScore((prev) => prev + 10);
    if (onAddXP) {
      onAddXP(10);
    }
    setBugs((prev) => prev.filter((b) => b.id !== id));
    if (bugs.length <= 1) {
      spawnBugs();
    }
  };

  return (
    <div className="flex flex-col h-[560px] max-h-full bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full">
      
      {/* Phone Header Status Bar */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
          <Smartphone className="w-3.5 h-3.5 text-green-400 animate-pulse" />
          <span className="font-bold tracking-wider text-green-400">CKY OS v2.0</span>
        </div>

        {/* App Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveApp("messages")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              activeApp === "messages"
                ? "bg-yellow-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>{language === "es" ? "Mensajes" : "Messages"}</span>
          </button>

          <button
            onClick={() => setActiveApp("camera")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              activeApp === "camera"
                ? "bg-rose-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>{language === "es" ? "Cámara" : "Camera"}</span>
          </button>

          <button
            onClick={() => setActiveApp("gallery")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              activeApp === "gallery"
                ? "bg-blue-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>{language === "es" ? "Galería" : "Gallery"}</span>
            {phonePhotos.length > 0 && (
              <span className="ml-1 bg-blue-900 text-blue-200 text-[8px] px-1 rounded-full">
                {phonePhotos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveApp("instacky")}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              activeApp === "instacky"
                ? "bg-pink-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span>InstaCKY</span>
          </button>

          <button
            onClick={() => setActiveApp("music")}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              activeApp === "music"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Music className="w-3 h-3" />
            <span>{language === "es" ? "Música" : "Music"}</span>
          </button>

          <button
            onClick={() => setActiveApp("games")}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              activeApp === "games"
                ? "bg-purple-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Gamepad2 className="w-3 h-3" />
            <span>{language === "es" ? "Juegos" : "Games"}</span>
          </button>

          <button
            onClick={() => setActiveApp("save")}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              activeApp === "save"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Save className="w-3 h-3" />
            <span>{language === "es" ? "Partida" : "Save"}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <span>5:15 AM</span>
        </div>
      </div>

      {/* APP BODY AREA */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 1. APP: MESSAGES */}
        {activeApp === "messages" && (
          <div className="flex flex-1 overflow-hidden">
            
            {/* Contact List sidebar */}
            <div className="w-1/3 border-r border-slate-800 bg-slate-900 overflow-y-auto">
              <div className="p-2.5 text-[10px] font-mono font-bold tracking-wider text-slate-500 border-b border-slate-800 flex items-center justify-between">
                <span>{language === "es" ? "CONTACTOS" : "CONTACTS"}</span>
                <span className="text-yellow-400 font-normal">{phoneChats.length}</span>
              </div>
              {phoneChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full flex items-center gap-2.5 p-3 text-left transition-all border-b border-slate-900/60 ${
                    selectedChatId === chat.id
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-900/50 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="relative">
                    <span className="text-xl">{chat.avatar}</span>
                    {chat.unread && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold font-mono truncate">{chat.contactName}</p>
                    <p className="text-[9px] text-slate-500 font-mono truncate">
                      {chat.messages[chat.messages.length - 1] 
                        ? (language === "es" 
                            ? chat.messages[chat.messages.length - 1].textEs 
                            : chat.messages[chat.messages.length - 1].textEn)
                        : (language === "es" ? "Sin mensajes" : "No messages")}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Messaging Box Panel */}
            <div className="flex-1 flex flex-col bg-slate-950">
              {activeChat ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                    <span className="text-xl">{activeChat.avatar}</span>
                    <div>
                      <h3 className="text-xs font-bold font-mono text-white">{activeChat.contactName}</h3>
                      <p className="text-[9px] text-green-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        {language === "es" ? "Conectado" : "Connected"}
                      </p>
                    </div>
                  </div>

                  {/* Chat Timeline */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
                    {activeChat.messages.length > 0 ? (
                      activeChat.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[88%] ${
                            msg.isPlayer ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div className="text-[8px] font-mono text-slate-500 mb-1">
                            {msg.isPlayer ? "CKY" : msg.sender} • {msg.timestamp}
                          </div>

                          <div
                            className={`p-3 rounded-xl text-xs font-mono break-words shadow-md space-y-2 ${
                              msg.isPlayer
                                ? "bg-yellow-500 text-slate-950 rounded-tr-none"
                                : "bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800"
                            }`}
                          >
                            <p>{language === "es" ? msg.textEs : msg.textEn}</p>

                            {/* Photo Attachment Card */}
                            {msg.photoAttachment && (
                              <div className="mt-2 p-2.5 bg-slate-950/80 rounded-xl border border-yellow-500/30 text-slate-200 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{msg.photoAttachment.icon}</span>
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-bold text-xs text-yellow-300 truncate">
                                      {language === "es" ? msg.photoAttachment.titleEs : msg.photoAttachment.titleEn}
                                    </p>
                                    <p className="text-[9px] text-slate-400 line-clamp-2">
                                      {language === "es" ? msg.photoAttachment.descEs : msg.photoAttachment.descEn}
                                    </p>
                                  </div>
                                </div>

                                {/* Photo Action Buttons: Guardar o Eliminar */}
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                                  {msg.savedInGallery || phonePhotos.some(p => p.id === msg.photoAttachment?.id) ? (
                                    <div className="flex-1 py-1 px-2 rounded bg-green-950/60 border border-green-500/40 text-green-300 text-[10px] font-bold flex items-center justify-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                                      <span>{language === "es" ? "Guardada en Galería" : "Saved to Gallery"}</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => onSavePhotoToGallery(msg.photoAttachment!)}
                                      className="flex-1 py-1.5 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>{language === "es" ? "Guardar en galería" : "Save to gallery"}</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => onDeletePhotoMessage?.(activeChat.id, msg.id)}
                                    className="py-1.5 px-2.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                                    title={language === "es" ? "Eliminar mensaje" : "Delete message"}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>{language === "es" ? "Eliminar" : "Delete"}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="m-auto flex flex-col items-center justify-center text-slate-500 font-mono text-xs p-6 text-center">
                        <MessageSquare className="w-10 h-10 mb-2 text-yellow-500/40" />
                        <p className="font-bold text-yellow-400">
                          {language === "es" ? "Sin mensajes" : "No messages"}
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Options */}
                  {activeChat.replies && activeChat.replies.length > 0 && (
                    <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                        <span>{language === "es" ? "Elige tu respuesta:" : "Choose reply:"}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {activeChat.replies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onSelectReply(activeChat.id, idx);
                              setTimeout(() => {
                                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                              }, 100);
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-yellow-500/30 bg-slate-950 text-xs font-mono text-slate-100 hover:text-yellow-300 hover:border-yellow-400/60 hover:bg-slate-900 transition-all flex items-start gap-2 cursor-pointer active:scale-98 shadow-sm"
                          >
                            <span className="text-yellow-400 font-bold">✦</span>
                            <span className="flex-1">{language === "es" ? reply.textEs : reply.textEn}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-25" />
                  <span>{language === "es" ? "Ningún chat activo" : "No active chat"}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. APP: CAMERA */}
        {activeApp === "camera" && (
          <div className="flex-1 flex flex-col bg-slate-950 p-4 relative overflow-hidden font-mono">
            {/* Flash Screen Animation */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-pulse" />
            )}

            {/* Top Bar / Mode Selector */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === "es" ? "CÁMARA CKY OS" : "CKY OS CAMERA"}
                </span>
              </div>

              {/* Mode Buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
                <button
                  onClick={() => setCameraMode("selfie")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    cameraMode === "selfie" ? "bg-rose-500 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  👧 {language === "es" ? "Selfie" : "Selfie"}
                </button>
                <button
                  onClick={() => setCameraMode("environment")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    cameraMode === "environment" ? "bg-rose-500 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🏡 {language === "es" ? "Lugar" : "Place"}
                </button>
                <button
                  onClick={() => setCameraMode("filter")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    cameraMode === "filter" ? "bg-rose-500 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ✨ {language === "es" ? "Filtro 8-Bit" : "8-Bit Filter"}
                </button>
              </div>
            </div>

            {/* Filter & Pose Quick Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-1 mb-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-[10px]">
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-bold text-[9px] mr-1">FILTRO:</span>
                {[
                  { id: "none", label: "Normal" },
                  { id: "cat", label: "🐱 Michi" },
                  { id: "astral", label: "✨ Astral" },
                  { id: "sunglasses", label: "😎 Lentes" },
                  { id: "hearts", label: "💖 Kawaii" },
                  { id: "retro", label: "📺 90s" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCameraFilter(f.id as any);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] transition-all ${
                      cameraFilter === f.id
                        ? "bg-rose-500 text-white font-bold shadow"
                        : "text-slate-400 hover:text-slate-200 bg-slate-950"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-bold text-[9px] mr-1">POSE:</span>
                {[
                  { id: "peace", label: "✌️ Paz" },
                  { id: "wink", label: "😉 Guiño" },
                  { id: "furious", label: "😤 Furia" },
                  { id: "sandwich", label: "🥪 Sándwich" }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCameraPose(p.id as any);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] transition-all ${
                      cameraPose === p.id
                        ? "bg-amber-500 text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-slate-200 bg-slate-950"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Viewfinder Screen */}
            <div 
              onClick={handleTakeCameraPhoto}
              className="flex-1 bg-slate-900 border-2 border-slate-800 hover:border-rose-500/60 transition-all rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4 cursor-pointer group shadow-inner"
            >
              {/* Camera Frame Crosshairs / Grid */}
              <div className="absolute inset-2 border border-slate-700/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>[ ISO 400 ]</span>
                  <span>1080p • 60FPS</span>
                </div>
                <div className="self-center text-slate-500/60 text-lg font-light group-hover:scale-125 transition-transform">✦</div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>CKY-CAM</span>
                  <span>🔋 98%</span>
                </div>
              </div>

              {/* Click to snap hint on hover */}
              <div className="absolute top-3 bg-black/70 px-3 py-1 rounded-full text-[10px] text-rose-300 font-bold border border-rose-500/30 opacity-80 group-hover:opacity-100 transition-opacity">
                📸 {language === "es" ? "Toca el visor o el botón de abajo para sacar foto" : "Tap view or button below to take photo"}
              </div>

              {/* Camera Subject Graphic Preview */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-2 text-center my-auto">
                <div className="relative">
                  <div className="text-6xl p-4 bg-slate-950/80 border-2 border-rose-500/40 rounded-2xl shadow-xl animate-pulse group-hover:scale-105 transition-transform">
                    {cameraMode === "selfie" ? "👧" : cameraMode === "environment" ? "🏡" : "✨👧🕶️"}
                  </div>
                  {cameraMode === "filter" && (
                    <span className="absolute -top-2 -right-2 text-xl animate-bounce">💖</span>
                  )}
                  {cameraMode === "selfie" && (
                    <span className="absolute -bottom-1 -right-1 text-sm bg-rose-950 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded-full font-bold">
                      📸 CKY
                    </span>
                  )}
                </div>

                <div className="max-w-xs">
                  <p className="text-xs font-bold text-rose-300">
                    {cameraMode === "selfie"
                      ? (language === "es" ? "Modo Selfie CKY" : "CKY Selfie Mode")
                      : cameraMode === "environment"
                      ? (language === "es" ? "Capturando el Entorno" : "Capturing Environment")
                      : (language === "es" ? "Modo Filtro Neon 8-Bit" : "8-Bit Neon Filter Mode")}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {language === "es" 
                      ? "¡Presiona el botón rojo abajo para guardar la foto en la galería!" 
                      : "Press the red button below to save photo to gallery!"}
                  </p>
                </div>
              </div>

              {/* Toast message overlay if photo was taken */}
              {cameraToast && (
                <div className="absolute top-12 left-3 right-3 z-30 bg-rose-950/95 border border-rose-500 text-rose-200 text-xs font-bold p-3 rounded-xl shadow-2xl flex items-center justify-between animate-bounce">
                  <span>{cameraToast}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveApp("gallery");
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] uppercase font-mono shadow"
                  >
                    {language === "es" ? "Ir a Galería" : "Go to Gallery"}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Controls: Caption Input + Big Shutter Button */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cameraCaption}
                  onChange={(e) => setCameraCaption(e.target.value)}
                  placeholder={language === "es" ? "Escribe un título/nota para la foto (opcional)..." : "Write a photo title/note (optional)..."}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Prominent Circular Shutter Button */}
              <div className="flex flex-col items-center justify-center py-1">
                <button
                  onClick={handleTakeCameraPhoto}
                  className="group flex flex-col items-center gap-1 focus:outline-none"
                  title={language === "es" ? "Sacar foto ahora" : "Take photo now"}
                >
                  <div className="w-16 h-16 rounded-full border-4 border-rose-500 bg-slate-950 p-1 flex items-center justify-center shadow-xl shadow-rose-500/20 group-hover:scale-110 group-active:scale-95 transition-all">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-inner">
                      <Camera className="w-7 h-7 text-white drop-shadow" />
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-rose-300 tracking-wider uppercase group-hover:text-white transition-colors">
                    📸 {language === "es" ? "SACAR FOTO" : "TAKE PHOTO"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. APP: GALLERY */}
        {activeApp === "gallery" && (() => {
          const filteredPhotos = phonePhotos.filter((p) => {
            if (galleryCategory === "all") return true;
            if (galleryCategory === "favorites") return favoritePhotoIds.includes(p.id);
            if (galleryCategory === "mom") return p.category === "mom" || p.photoType === "mom_first_day";
            if (galleryCategory === "selfie") return p.category === "selfie" || p.photoType === "mirror_selfie";
            if (galleryCategory === "adventure") return p.category === "adventure" || p.id.includes("ruins") || p.id.includes("treasure") || p.id.includes("soccer");
            return true;
          });

          return (
            <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                    {language === "es" ? "Álbum de Recuerdos CKY" : "CKY Memory Album"}
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {filteredPhotos.length} / {phonePhotos.length} {language === "es" ? "fotos" : "photos"}
                </span>
              </div>

              {/* Gallery Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 text-[9px] font-mono font-bold">
                {[
                  { id: "all", labelEs: "Todas", labelEn: "All", icon: "🖼️" },
                  { id: "favorites", labelEs: "Favoritas", labelEn: "Favorites", icon: "❤️" },
                  { id: "mom", labelEs: "Mamá & Hogar", labelEn: "Mom & Home", icon: "👩" },
                  { id: "selfie", labelEs: "Selfies & Moda", labelEn: "Selfies & Outfits", icon: "👗" },
                  { id: "adventure", labelEs: "Aventuras", labelEn: "Adventures", icon: "🗡️" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setGalleryCategory(c.id as any)}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                      galleryCategory === c.id
                        ? "bg-blue-950/80 border-blue-400 text-blue-300 shadow"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{language === "es" ? c.labelEs : c.labelEn}</span>
                  </button>
                ))}
              </div>

              {filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredPhotos.map((photo) => {
                    const isFav = favoritePhotoIds.includes(photo.id);
                    return (
                      <div
                        key={photo.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-blue-500/50 transition-all group relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-3xl group-hover:scale-110 transition-transform">{photo.icon}</span>
                          <div className="flex items-center gap-1">
                            {isFav && <span className="text-rose-400 text-xs">❤️</span>}
                            <span className="text-[8px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                              {photo.date}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="font-bold text-xs text-blue-300 font-mono truncate">
                            {language === "es" ? photo.titleEs : photo.titleEn}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono line-clamp-2 mt-0.5">
                            {language === "es" ? photo.descEs : photo.descEn}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 pt-2 border-t border-slate-800/80">
                          <button
                            onClick={() => setSelectedPhoto(photo)}
                            className="flex-1 py-1 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 text-[9px] font-mono font-bold rounded flex items-center justify-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3 text-blue-400" />
                            <span>{language === "es" ? "Abrir" : "Open"}</span>
                          </button>
                          <button
                            onClick={() => handleToggleFavorite(photo.id)}
                            className={`p-1 rounded transition ${
                              isFav
                                ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                            title={language === "es" ? "Favorita" : "Favorite"}
                          >
                            <Heart className={`w-3 h-3 ${isFav ? "fill-rose-400 text-rose-400" : ""}`} />
                          </button>
                          <button
                            onClick={() => onDeletePhotoFromGallery?.(photo.id)}
                            className="p-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded"
                            title={language === "es" ? "Eliminar de la galería" : "Delete"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="m-auto flex flex-col items-center justify-center text-slate-500 font-mono text-xs p-8 text-center space-y-2">
                  <ImageIcon className="w-12 h-12 text-blue-500/30" />
                  <p className="font-bold text-blue-400">
                    {language === "es" ? "No hay fotos en esta categoría" : "No photos in this category"}
                  </p>
                  <p className="text-[10px] text-slate-500 max-w-xs">
                    {language === "es"
                      ? "Usa la Cámara del cel, sácate selfies frente al espejo o explora la historia."
                      : "Use Phone Camera, take mirror selfies or explore the story."}
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* 3. APP: RETRO GAMES */}
        {activeApp === "games" && (
          <div className="flex-1 flex flex-col bg-slate-950 p-4 items-center justify-center relative overflow-hidden">
            <div className="text-center space-y-1 mb-3">
              <h2 className="text-xs font-bold font-mono text-purple-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-purple-400 animate-bounce" />
                <span>{language === "es" ? "8-BIT CUCARACHA TAP" : "8-BIT BUG SQUISH"}</span>
              </h2>
              <p className="text-[9px] font-mono text-slate-400">
                {language === "es" ? "¡Toca las cucarachas de la pantalla antes de que huyan!" : "Tap bugs on screen before time runs out!"}
              </p>
            </div>

            {/* Game Canvas Box */}
            <div className="w-full max-w-xs h-64 bg-slate-900 border-2 border-purple-500/40 rounded-2xl relative overflow-hidden shadow-inner flex flex-col items-center justify-center">
              {isGameActive ? (
                <>
                  <div className="absolute top-2 left-3 right-3 flex justify-between text-[10px] font-mono font-bold text-purple-300 z-10">
                    <span>SCORE: {gameScore}</span>
                    <span>BUGS LEFT: {bugs.length}</span>
                  </div>

                  {bugs.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => squishBug(b.id)}
                      style={{ left: `${b.x}%`, top: `${b.y}%` }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 text-2xl hover:scale-125 active:scale-95 transition-transform animate-pulse cursor-pointer"
                    >
                      🪳
                    </button>
                  ))}
                </>
              ) : (
                <div className="text-center p-4 space-y-3">
                  <span className="text-4xl">🪳💥</span>
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-white">
                      {gameScore > 0 ? `HIGH SCORE: ${gameScore} PTS!` : "RETRO ARCADE 1998"}
                    </p>
                    <p className="text-[9px] text-purple-300 font-mono">
                      {language === "es" ? "+10 XP por cada cucaracha aplastada" : "+10 XP for each squished bug"}
                    </p>
                  </div>

                  <button
                    onClick={startGame}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg border border-purple-400 active:scale-95 transition-transform"
                  >
                    ▶ {language === "es" ? "JUGAR AHORA" : "PLAY NOW"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. APP: SAVE & LOAD SYSTEM */}
        {activeApp === "save" && (
          <div className="flex-1 flex flex-col bg-slate-950 p-4 sm:p-5 overflow-y-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                <HardDrive className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest">
                  {language === "es" ? "GUARDADO EN CELULAR" : "PHONE MEMORY & SAVES"}
                </h2>
                <p className="text-[10px] font-mono text-slate-400">
                  {language === "es" 
                    ? "Almacenamiento Local (LocalStorage) Activo" 
                    : "LocalStorage Active"}
                </p>
              </div>
            </div>

            {/* Status Toast Banner */}
            {saveStatusMsg && (
              <div className="px-3.5 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fade-in shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveStatusMsg}</span>
              </div>
            )}

            {/* Quick Save Hero Banner */}
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {language === "es" ? "GUARDADO RÁPIDO DÍA 1" : "DAY 1 QUICK SAVE"}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  {language === "es" 
                    ? "Guarda al instante en Ranura 1 desde tu celular" 
                    : "Save instantly to Slot 1 from your phone"}
                </p>
              </div>

              <button
                onClick={() => handlePhoneQuickSave("slot_1")}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow border border-emerald-300 active:scale-95 transition-transform flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>{language === "es" ? "GUARDAR AHORA" : "SAVE NOW"}</span>
              </button>
            </div>

            {/* Character Summary & 12h Autosave indicator */}
            {stats && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-base">👧</span>
                  <div>
                    <span className="text-yellow-400 font-bold">CKY (Nivel {stats.level})</span>
                    <p className="text-[9px] text-slate-400">XP: {stats.xp} / {stats.maxXp}</p>
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded-lg">
                  ⏱️ 12h Autosave ON
                </div>
              </div>
            )}

            {/* Direct Slots List inside the Phone */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span className="font-bold text-slate-300 uppercase tracking-wider">
                  {language === "es" ? "RANURAS DISPONIBLES" : "AVAILABLE SLOTS"}
                </span>
                <button
                  onClick={() => onOpenSaveLoadModal?.("save")}
                  className="text-[10px] text-yellow-400 hover:underline flex items-center gap-1"
                >
                  <span>{language === "es" ? "Ver Gestor Completo ↗" : "Full Manager ↗"}</span>
                </button>
              </div>

              {SAVE_SLOTS.map((slot) => {
                const slotData = slotsData[slot.id];
                const isOccupied = !!slotData;
                const isAutosave = slot.isAutosave;

                return (
                  <div
                    key={slot.id}
                    className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isAutosave 
                            ? "bg-sky-950 border-sky-500/50 text-sky-400" 
                            : "bg-slate-800 border-slate-700 text-yellow-400"
                        }`}>
                          {language === "es" ? slot.nameEs : slot.nameEn}
                        </span>
                        {slotData && (
                          <span className="text-[9px] font-mono text-slate-400 truncate">
                            {slotData.dateString}
                          </span>
                        )}
                      </div>

                      {isOccupied && slotData ? (
                        <p className="text-[11px] font-mono text-slate-300 truncate">
                          📍 {language === "es" ? slotData.mapNameEs : slotData.mapNameEn} • Niv. {slotData.playerLevel}
                        </p>
                      ) : (
                        <p className="text-[10px] font-mono text-slate-500 italic">
                          {language === "es" ? "Sin datos guardados" : "Empty slot"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isAutosave && (
                        <button
                          onClick={() => handlePhoneQuickSave(slot.id)}
                          className="p-2 bg-emerald-600/30 hover:bg-emerald-500/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-mono font-bold active:scale-95 transition flex items-center gap-1 cursor-pointer"
                          title={language === "es" ? "Guardar en esta ranura" : "Save to slot"}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{language === "es" ? "Guardar" : "Save"}</span>
                        </button>
                      )}

                      {isOccupied && slotData && (
                        <button
                          onClick={() => {
                            if (onLoadGame) {
                              onLoadGame(slotData);
                              onClose();
                            } else if (onOpenSaveLoadModal) {
                              onOpenSaveLoadModal("load");
                            }
                          }}
                          className="p-2 bg-sky-600/30 hover:bg-sky-500/50 text-sky-300 border border-sky-500/40 rounded-lg text-[10px] font-mono font-bold active:scale-95 transition flex items-center gap-1 cursor-pointer"
                          title={language === "es" ? "Cargar esta partida" : "Load slot"}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{language === "es" ? "Cargar" : "Load"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[9px] font-mono text-slate-500 text-center pt-2">
              {language === "es" 
                ? "💡 El juego también guarda automáticamente cada 12 horas en tiempo de juego." 
                : "💡 The game also auto-saves every 12 in-game hours."}
            </div>
          </div>
        )}

        {/* 5. APP: MUSIC (WALKMAN / MP3 PLAYER) */}
        {activeApp === "music" && (
          <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-4 font-mono">
            {/* Player Header */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
                  <Music className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    CKY WALKMAN MP3
                  </h3>
                  <p className="text-[9px] text-slate-400">
                    {language === "es" ? "Reproductor Chiptune 16-Bit" : "16-Bit Chiptune Player"}
                  </p>
                </div>
              </div>
              <span className="text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800 font-bold">
                STEREO
              </span>
            </div>

            {/* Now Playing Cassette / Equalizer Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 shadow-lg flex flex-col items-center space-y-3">
              {/* Animated Equalizer */}
              <div className="flex items-end justify-center gap-1.5 h-14 w-full px-8">
                {[40, 75, 100, 60, 90, 45, 80, 55, 95, 70].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-150 ${
                      isMusicPlaying
                        ? "bg-gradient-to-t from-amber-600 to-amber-300 animate-pulse"
                        : "bg-slate-800"
                    }`}
                    style={{
                      height: isMusicPlaying ? `${h}%` : "15%"
                    }}
                  />
                ))}
              </div>

              {/* Track Title */}
              <div className="text-center">
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  {currentBgmTrack === "house" && (language === "es" ? "Amanecer en la Habitación (Lo-fi)" : "Dawn in Bedroom (Lo-fi)")}
                  {currentBgmTrack === "street" && (language === "es" ? "Paseo por el Pueblo (Chiptune)" : "Town Stroll (Chiptune)")}
                  {currentBgmTrack === "school" && (language === "es" ? "Pasillos y Aulas del Colegio" : "School Hallways & Classes")}
                  {currentBgmTrack === "mystery" && (language === "es" ? "Suspiros del Limbo y Ruinas" : "Limbo & Ruins Whispers")}
                  {currentBgmTrack === "battle" && (language === "es" ? "Duelo RPG 16-Bit (Combate)" : "16-Bit RPG Battle Theme")}
                  {currentBgmTrack === "ending" && (language === "es" ? "Balada Melancólica del Epílogo" : "Melancholic Epilogue Ballad")}
                </p>
                <span className="text-[10px] text-amber-400/80">
                  {isMusicPlaying ? (language === "es" ? "▶ Reproduciendo en bucle" : "▶ Playing on loop") : (language === "es" ? "⏸ En pausa" : "⏸ Paused")}
                </span>
              </div>

              {/* Main Playback Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePlayMusic}
                  className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title={isMusicPlaying ? "Pausar" : "Reproducir"}
                >
                  {isMusicPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="w-full flex items-center gap-2 pt-1 text-slate-400 text-xs px-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setMusicVolume(val);
                    soundEngine.setBgmVolume(val);
                  }}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>

            {/* Tracklist Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {language === "es" ? "Seleccionar Canción:" : "Select Track:"}
              </span>
              {[
                { id: "house", nameEs: "🏡 Amanecer en la Habitación", nameEn: "🏡 Bedroom Dawn", style: "Lo-Fi Suave" },
                { id: "street", nameEs: "🏙️ Paseo por el Pueblo", nameEn: "🏙️ Town Stroll", style: "Chiptune Alegre" },
                { id: "school", nameEs: "🏫 Pasillos del Colegio", nameEn: "🏫 School Hallways", style: "Energético" },
                { id: "mystery", nameEs: "🌌 Suspiros del Limbo", nameEn: "🌌 Limbo Whispers", style: "Misterioso" },
                { id: "battle", nameEs: "⚔️ Duelo RPG 16-Bit", nameEn: "⚔️ 16-Bit RPG Battle", style: "Combate Épico" },
                { id: "ending", nameEs: "🌅 Balada del Epílogo", nameEn: "🌅 Epilogue Ballad", style: "Nostálgico" },
              ].map((track) => (
                <button
                  key={track.id}
                  onClick={() => handlePlayTrack(track.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    currentBgmTrack === track.id && isMusicPlaying
                      ? "bg-amber-950/60 border-amber-500 text-amber-300 font-bold shadow"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{currentBgmTrack === track.id && isMusicPlaying ? "🔊" : "🎵"}</span>
                    <span className="text-xs">{language === "es" ? track.nameEs : track.nameEn}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">{track.style}</span>
                </button>
              ))}
            </div>

            {/* Haptic Vibration Control within Phone */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === "es" ? "Vibración Háptica Android" : "Android Haptics"}</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {language === "es"
                    ? "Desactivada por defecto. Toca para activar o desactivar la respuesta física."
                    : "Disabled by default. Tap to toggle physical vibration."}
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !phoneHapticsOn;
                  setPhoneHapticsOn(next);
                  androidBridge.setHapticsEnabled(next);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                  phoneHapticsOn
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                {phoneHapticsOn ? (language === "es" ? "Activada" : "Enabled") : (language === "es" ? "Desactivada" : "Disabled")}
              </button>
            </div>
          </div>
        )}

        {/* 6. APP: INSTACKY (RED SOCIAL ESCOLAR) */}
        {activeApp === "instacky" && (
          <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-4 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/40">
                  <Share2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest">
                    InstaCKY
                  </h3>
                  <p className="text-[9px] text-slate-400">
                    {language === "es" ? "Muro Social y Fotos del Pueblo" : "Town Social Feed & Photos"}
                  </p>
                </div>
              </div>
            </div>

            {/* Post creator from Gallery */}
            <div className="bg-slate-900/80 border border-pink-500/30 rounded-2xl p-3 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                  <span>📸</span> {language === "es" ? "Publicar en InstaCKY (+15 XP):" : "Post to InstaCKY (+15 XP):"}
                </span>
                <span className="text-[9px] text-slate-400">
                  {phonePhotos.length} {language === "es" ? "fotos en galería" : "photos in gallery"}
                </span>
              </div>

              {phonePhotos.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={selectedUploadPhotoId}
                    onChange={(e) => setSelectedUploadPhotoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  >
                    <option value="">{language === "es" ? "--- Selecciona una foto de la galería ---" : "--- Select a photo from gallery ---"}</option>
                    {phonePhotos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {language === "es" ? p.titleEs : p.titleEn} ({p.date})
                      </option>
                    ))}
                  </select>

                  {selectedUploadPhotoId && (
                    <div className="space-y-2 animate-fade-in">
                      <input
                        type="text"
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder={language === "es" ? "Escribe un pie de foto divertido..." : "Write a funny caption..."}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                      <button
                        onClick={handlePostPhotoToFeed}
                        className="w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
                      >
                        {language === "es" ? "Subir Foto al Muro 🚀" : "Publish Photo to Feed 🚀"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic">
                  {language === "es" ? "Aún no tienes fotos en la galería. ¡Saca una foto con la cámara primero!" : "No photos in gallery yet. Take a photo with the camera first!"}
                </p>
              )}
            </div>

            {/* Social Posts Feed */}
            <div className="space-y-3">
              {instaPosts.map((post) => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  {/* Author bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{post.avatar}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{post.author}</h4>
                        <span className="text-[9px] text-slate-500">{post.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Icon / Image Card */}
                  <div className="w-full h-24 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-4xl shadow-inner">
                    {post.icon}
                  </div>

                  {/* Caption */}
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {post.caption}
                  </p>

                  {/* Actions bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => handleToggleLikePost(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                        post.userLiked ? "text-pink-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.userLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                      <span>{post.likes}</span>
                    </button>
                    <span className="text-[10px] text-slate-500">
                      {post.comments.length} {language === "es" ? "comentarios" : "comments"}
                    </span>
                  </div>

                  {/* Comments Thread */}
                  {post.comments.length > 0 && (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
                      {post.comments.map((c, ci) => (
                        <div key={ci} className="leading-snug">
                          <strong className="text-pink-300 mr-1.5">{c.author}:</strong>
                          <span className="text-slate-300">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 10Print_ Studios Community Sponsor Banner */}
            <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-pink-950/60 border border-purple-500/40 rounded-2xl p-3 text-center space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <span>👾</span> 10Print_ Studios Gaming Network
              </p>
              <p className="text-[9px] text-slate-400">
                {language === "es"
                  ? "Auspiciante oficial de InstaCKY. ¡Pasión por los videojuegos retro, humor independiente y aventuras épicas!"
                  : "Official sponsor of InstaCKY. Passion for retro gaming, indie humor, and epic adventures!"}
              </p>
            </div>
          </div>
        )}

        {/* FULL PHOTO VIEW MODAL */}
        {selectedPhoto && (
          <PhotoViewerModal
            photo={selectedPhoto}
            language={language}
            onClose={() => setSelectedPhoto(null)}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favoritePhotoIds.includes(selectedPhoto.id)}
          />
        )}

      </div>

      {/* Close Phone button */}
      <button
        onClick={onClose}
        className="w-full bg-slate-900 text-slate-400 hover:text-white border-t border-slate-800 hover:bg-slate-800 text-xs font-mono font-bold py-2.5 transition-colors"
      >
        {language === "es" ? "GUARDAR CELULAR" : "PUT PHONE AWAY"}
      </button>

    </div>
  );
}
