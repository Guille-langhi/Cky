import React from "react";

export interface FloatingNumber {
  id: number;
  text: string;
  type: "damage" | "heal" | "critical" | "buff";
  x?: number;
  y?: number;
}

interface FloatingDamageTextProps {
  numbers: FloatingNumber[];
}

export default function FloatingDamageText({ numbers }: FloatingDamageTextProps) {
  if (numbers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
      {numbers.map((num) => {
        const colorClass =
          num.type === "heal"
            ? "text-emerald-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.8)]"
            : num.type === "critical"
            ? "text-yellow-300 scale-125 drop-shadow-[0_2px_12px_rgba(253,224,71,0.9)]"
            : num.type === "buff"
            ? "text-cyan-300 drop-shadow-[0_2px_10px_rgba(103,232,249,0.8)]"
            : "text-red-400 drop-shadow-[0_2px_10px_rgba(248,113,113,0.8)]";

        return (
          <div
            key={num.id}
            className={`font-black font-mono text-2xl sm:text-3xl animate-bounce tracking-wider select-none ${colorClass}`}
          >
            {num.text}
          </div>
        );
      })}
    </div>
  );
}
