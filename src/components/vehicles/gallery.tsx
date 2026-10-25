"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VehicleImage } from "./vehicle-image";
import { cn } from "@/lib/utils";

export function Gallery({ images, title }: { images: { id: string; imageUrl: string; alt: string | null }[]; title: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted sm:aspect-[16/10]">
        <VehicleImage src={images[index]?.imageUrl} alt={images[index]?.alt ?? title} sizes="(min-width: 1024px) 800px, 100vw" priority />
        {count > 1 && (
          <>
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                onClick={() => go(d)}
                aria-label={d < 0 ? "Previous photo" : "Next photo"}
                className={cn("absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-card hover:bg-white", d < 0 ? "left-3" : "right-3")}
              >
                {d < 0 ? <ChevronLeft /> : <ChevronRight />}
              </button>
            ))}
            <span className="absolute right-3 bottom-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-white">{index + 1} / {count}</span>
          </>
        )}
      </div>
      {count > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn("relative block h-16 w-24 overflow-hidden rounded-lg border-2 border-transparent", i === index ? "border-foreground" : "opacity-70 hover:opacity-100")}
              >
                <VehicleImage src={img.imageUrl} alt="" sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
