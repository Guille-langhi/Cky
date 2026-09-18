import React, { useState, useEffect } from "react";
import { Smartphone, Wifi, BatteryCharging, Signal, Sparkles, Download, Info, Maximize2, Minimize2 } from "lucide-react";

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  language: "es" | "en";
  onOpenInstallModal: () => void;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  language,
  onOpenInstallModal,
}) => {
  const [time, setTime] = useState<string>("12:00");
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(true);
  const [forceFullscreenMode, setForceFullscreenMode] = useState<boolean>(false);
  const [isStandaloneOrAndroid, setIsStandaloneOrAndroid] = useState<boolean>(false);

  useEffect(() => {
    // Detect if running inside native Android App (Capacitor/WebView)
    const checkNativeOrStandalone = () => {
      const isStandalone = 
        document.referrer.includes("android-app://") ||
        window.location.href.includes("mode=app") ||
        (window as any).Capacitor !== undefined ||
        /Android/i.test(navigator.userAgent);
      
      setIsStandaloneOrAndroid(isStandalone);
    };
    checkNativeOrStandalone();

    // Update digital clock in Android status bar
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);

    // Detect screen width
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 1024 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  // When running inside Android APK native container, render completely borderless fullscreen without banners
  if (isStandaloneOrAndroid) {
    return <div className="w-full flex flex-col items-center">{children}</div>;
  }

  // If already on a real phone or tablet screen, or fullscreen toggle active, render standard clean mobile container
  if (isMobileScreen || forceFullscreenMode) {
    return (
      <div className="w-full flex flex-col items-center">
        {/* Top notice on web explaining it's an Android game */}
        <div className="w-full mb-3 px-3 py-2 bg-emerald-950/70 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {language === "es"
                ? "Juego optimizado exclusivamente para celulares Android."
                : "Game optimized exclusively for Android mobile phones."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isMobileScreen && (
              <button
                onClick={() => setForceFullscreenMode(false)}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
              >
                <Minimize2 className="w-3 h-3" />
                <span>{language === "es" ? "Ver Teléfono" : "Phone Frame"}</span>
              </button>
            )}
            <button
              onClick={onOpenInstallModal}
              className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 flex items-center gap-1 text-[11px] shadow-sm active:scale-95"
            >
              <Download className="w-3 h-3" />
              <span>{language === "es" ? "Instalar App" : "Install App"}</span>
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Desktop view: Render inside an authentic Android Smartphone Chassis
  return (
    <div className="w-full flex flex-col items-center py-2">
      {/* Top Banner explaining Android-Only status */}
      <div className="w-full max-w-4xl mb-4 px-4 py-2.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-200 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-emerald-400">
              {language === "es" ? "Juego Exclusivo para Android" : "Android Exclusive Game"}
            </p>
            <p className="text-[11px] text-slate-400">
              {language === "es"
                ? "En PC se ejecuta dentro del Simulador de Dispositivo Android. Instálalo en tu celular para jugarlo en pantalla completa."
                : "Running in Android Device Simulator mode. Install on your Android phone to play natively."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setForceFullscreenMode(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold transition"
            title={language === "es" ? "Expandir a pantalla completa" : "Expand to fullscreen"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{language === "es" ? "EXPANDIR" : "EXPAND"}</span>
          </button>
          <button
            onClick={onOpenInstallModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono rounded-xl flex items-center gap-1.5 text-xs transition shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === "es" ? "APK DE ANDROID" : "ANDROID APK"}</span>
          </button>
        </div>
      </div>

      {/* Android Smartphone Bezel Chassis */}
      <div className="relative w-full max-w-5xl rounded-[40px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl shadow-emerald-950/40 overflow-hidden ring-2 ring-slate-700">
        
        {/* Android Top Status Bar */}
        <div className="w-full bg-slate-950 px-6 py-2 border-b border-slate-900 flex items-center justify-between text-xs text-slate-400 font-mono select-none">
          {/* Left: Time & notification icon */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{time}</span>
            <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 bg-emerald-950 border border-emerald-500/30 rounded">
              CKY OS
            </span>
          </div>

          {/* Center: Camera Punch Hole */}
          <div className="w-4 h-4 rounded-full bg-black border-2 border-slate-800 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
          </div>

          {/* Right: Network, WiFi, Battery */}
          <div className="flex items-center gap-2 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-slate-400">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold">100%</span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="w-full p-2 sm:p-4 bg-slate-950 min-h-[600px]">
          {children}
        </div>

        {/* Android Bottom Navigation Bar (Gesture Pill) */}
        <div className="w-full bg-slate-950 py-2 border-t border-slate-900 flex items-center justify-center">
          <div className="w-32 h-1 rounded-full bg-slate-600"></div>
        </div>
      </div>
    </div>
  );
};
