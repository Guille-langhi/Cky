import React, { useState } from "react";
import { Smartphone, Download, CheckCircle, X, Copy, Terminal, Layers, FileCode } from "lucide-react";

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
              {language === "es" ? "🤖 CKY RPG - APK Nativo para Android" : "🤖 CKY RPG - Android Native APK"}
            </h2>
            <p className="text-xs text-slate-400">
              {language === "es"
                ? "Compilación directa a archivo instalable .APK con Capacitor y Android Studio"
                : "Direct compilation to installable .APK file with Capacitor and Android Studio"}
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="mt-6 space-y-6">
          {/* Method: GitHub Actions Automated Build */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {language === "es" ? "Descargar APK Directo (GitHub Actions)" : "Download APK Directly (GitHub Actions)"}
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                {language === "es" ? "Automatizado" : "Automated"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {language === "es"
                ? "El repositorio incluye el flujo de trabajo automatizado en `.github/workflows/build-apk.yml`. Al hacer push o exportar a GitHub, compila automáticamente el archivo `CKY-RPG-Android.apk` listo para descargar e instalar en tu celular."
                : "The repository includes an automated workflow in `.github/workflows/build-apk.yml`. On GitHub push, it compiles the `CKY-RPG-Android.apk` artifact ready to install on your phone."}
            </p>
          </div>

          {/* Method: Local Android Studio / CLI build */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">
                {language === "es" ? "Compilar APK Localmente con Android Studio" : "Compile APK Locally with Android Studio"}
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {language === "es"
                ? "El proyecto nativo de Android ya está generado en la carpeta `android/` con el package `com.cky.rpgcreator`:"
                : "The native Android project is generated in the `android/` folder with package `com.cky.rpgcreator`:"}
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800 flex items-center justify-between">
                <span>npm run cap:build</span>
                <button
                  onClick={() => copyToClipboard("npm run cap:build", "step1")}
                  className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {copiedStep === "step1" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800 flex items-center justify-between">
                <span>cd android && ./gradlew assembleDebug</span>
                <button
                  onClick={() => copyToClipboard("cd android && ./gradlew assembleDebug", "step2")}
                  className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {copiedStep === "step2" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {language === "es"
                ? "El archivo APK compilado se genera en: `android/app/build/outputs/apk/debug/app-debug.apk`."
                : "The compiled APK is placed at: `android/app/build/outputs/apk/debug/app-debug.apk`."}
            </p>
          </div>

          {/* Configuration Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-xs text-slate-400 space-y-1">
            <p>
              <strong className="text-slate-300">Package ID:</strong> <span className="font-mono text-emerald-400">com.cky.rpgcreator</span>
            </p>
            <p>
              <strong className="text-slate-300">Min SDK:</strong> Android 22 (Android 5.1+) | <strong className="text-slate-300">Target SDK:</strong> Android 34
            </p>
            <p>
              <strong className="text-slate-300">Salida:</strong> Archivo binario autónomo <span className="font-mono text-yellow-400">.apk</span> instalable.
            </p>
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
