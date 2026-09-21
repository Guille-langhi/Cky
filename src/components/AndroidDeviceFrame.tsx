import React from "react";

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  language: "es" | "en";
  onOpenInstallModal: () => void;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center flex-1 overflow-hidden select-none">
      {children}
    </div>
  );
};
