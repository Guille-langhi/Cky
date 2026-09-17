import React, { useState } from "react";
import { Smartphone, Download, CheckCircle, Sparkles, RefreshCw, X, Copy, ExternalLink } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface AndroidExportModalProps {
  language: "es" | "en";
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({
  language,
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-4 border-emerald-500/80 bg-slate-950 p-6 text-white shadow-2xl shadow-emerald-500/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/30">
            <Smartphone className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide text-emerald-400">
              {language === "es" ? "🤖 CKY RPG - Versión para Android" : "🤖 CKY RPG - Android Edition"}
            </h2>
            <p className="text-xs text-slate-400">
              {language === "es"
                ? "Capítulo 1 Completo listo para instalar en celular o compilar como APK nativo"
                : "Chapter 1 Complete ready to install on phones or compile as native APK"}
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="mt-6 space-y-6">
          {/* Method 1: Instant Install PWA */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {language === "es" ? "Método 1: Instalación Inmediata en Celular (1 Clic)" : "Method 1: Instant Phone Install (1 Click)"}
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                {language === "es" ? "Recomendado" : "Recommended"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {language === "es"
                ? "El juego ya está configurado como aplicación web progresiva (PWA). Al abrir el enlace del juego desde Chrome o cualquier navegador en tu celular Android, puedes instalarlo como una app nativa con su icono, pantalla completa y controles táctiles."
                : "The game is fully configured as a Progressive Web App (PWA). Opening the game URL in mobile Chrome allows you to install it directly with its custom icon, fullscreen mode, and touch controls."}
            </p>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-emerald-500/30">
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(window.location.href)}`}
                  alt="QR Code"
                  className="w-28 h-28 rounded-xl border-2 border-emerald-500/50 bg-white p-1 shadow-md"
                  loading="lazy"
                />
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {language === "es" ? "Escanear con Android" : "Scan with Android"}
                </span>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <p className="text-slate-200 font-medium">
                  {language === "es"
                    ? "Apunta la cámara de tu celular Android a este código QR para abrir el juego al instante en Chrome e instalarlo."
                    : "Point your Android phone camera at this QR code to open the game immediately in Chrome and install it."}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {isInstalled ? (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      {language === "es" ? "¡Ya está instalada en tu dispositivo!" : "Already installed on this device!"}
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={install}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-teal-500 active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {language === "es" ? "Instalar ahora en este celular" : "Install now on this phone"}
                    </button>
                  ) : (
                    <button
                      onClick={() => copyToClipboard(window.location.href, "url")}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700 transition"
                    >
                      {copiedStep === "url" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedStep === "url" ? (language === "es" ? "¡Enlace copiado!" : "Link copied!") : (language === "es" ? "Copiar enlace para WhatsApp" : "Copy link for WhatsApp")}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Method 2: Capacitor APK compilation */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">
                {language === "es" ? "Método 2: Compilar APK Nativo con Capacitor" : "Method 2: Compile Native APK with Capacitor"}
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {language === "es"
                ? "Ya creamos el archivo `capacitor.config.json` con el identificador `com.cky.rpgcreator`. Para generar el proyecto de Android Studio o un archivo `.apk` autónomo:"
                : "The `capacitor.config.json` is configured with app ID `com.cky.rpgcreator`. To generate an Android Studio project or standalone `.apk`:"}
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800 flex items-center justify-between">
                <span>npm run build && npx cap add android && npx cap sync</span>
                <button
                  onClick={() => copyToClipboard("npm run build && npx cap add android && npx cap sync", "step1")}
                  className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {copiedStep === "step1" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800 flex items-center justify-between">
                <span>npx cap open android</span>
                <button
                  onClick={() => copyToClipboard("npx cap open android", "step2")}
                  className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {copiedStep === "step2" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {language === "es"
                ? "En Android Studio simplemente seleccionas 'Build > Build APK(s)' y tendrás el archivo listo para enviar por WhatsApp o instalar."
                : "In Android Studio simply select 'Build > Build APK(s)' to generate your installable APK."}
            </p>
          </div>

          {/* How updates work */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-5">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">
                {language === "es" ? "¿Cómo se aplican cambios y actualizaciones?" : "How do updates work?"}
              </h3>
            </div>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>
                  <strong>{language === "es" ? "Actualizaciones instantáneas (PWA):" : "Instant updates (PWA):"}</strong>{" "}
                  {language === "es"
                    ? "Cualquier mejora que hagamos aquí en el código se actualiza automáticamente en el celular de los jugadores la próxima vez que abran el juego, sin tener que reinstalar."
                    : "Any improvements made here update automatically on players' phones the next time they launch the game, without needing reinstallation."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>
                  <strong>{language === "es" ? "Partidas guardadas:" : "Saved games:"}</strong>{" "}
                  {language === "es"
                    ? "Los datos de guardado se mantienen intactos en la memoria del celular aunque el juego se actualice."
                    : "Save data remains safe in device storage even when new updates are pushed."}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {language === "es" ? "Cerrar" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
