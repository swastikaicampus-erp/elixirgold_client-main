import { useEffect, useRef, useState } from "react";

interface PriceCardProps {
  title: string;
  value: string;
  rawValue: number | null;
}

export function PriceCard({ title, value, rawValue }: PriceCardProps) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevValueRef = useRef(rawValue);

  useEffect(() => {
    if (rawValue === null || prevValueRef.current === null) {
      prevValueRef.current = rawValue;
      return;
    }

    if (rawValue !== prevValueRef.current) {
      // Reset animation by removing class first
      setFlash(null);
      
      // Use a microtask to ensure the DOM updates before re-applying
      queueMicrotask(() => {
        if (rawValue > prevValueRef.current!) {
          setFlash("up");
        } else if (rawValue < prevValueRef.current!) {
          setFlash("down");
        }
        prevValueRef.current = rawValue;
      });

      // Clear animation after it completes
      const timer = setTimeout(() => setFlash(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [rawValue]);

  return (
    <article
      className={`rounded-xl border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${
        flash === "up"
          ? "flash-up border-green-500/50"
          : flash === "down"
            ? "flash-down border-red-500/50"
            : "bg-[linear-gradient(140deg,#171717_0%,#0f0f0f_100%)] border-[#5a4a2b] transition-colors duration-500"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c7a966]">{title}</p>
      <p
        className={`mt-2 text-xl font-semibold sm:text-2xl ${
          flash === "up"
            ? "text-green-400 animate-pulse"
            : flash === "down"
              ? "text-red-400 animate-pulse"
              : "text-[#f5d993]"
        }`}
      >
        {value}
      </p>
    </article>
  );
}
