"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Heart, HeartCrack, X } from "lucide-react";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import { cn } from "@/lib/utils";

export type DemoCar = { id: string; title: string; trim: string | null; price: string; km: string; image: string | null };
type Dir = "like" | "pass";

// Mostly likes, with a pass mixed in so both reactions are seen early.
const PATTERN: Dir[] = ["like", "pass", "like", "like", "pass"];
const IDLE_MS = 1300; // card at rest, so each swipe reads as a separate decision
const LEAN_MS = 700; // card leans and the stamp appears
const BURST_MS = 700; // heart / cracked heart; ends well before the next lean

const EXIT_VARIANTS = {
  exit: (d: Dir) => ({
    x: d === "like" ? 520 : -520,
    rotate: d === "like" ? 24 : -24,
    opacity: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.6, 1] as const },
  }),
};

/** Decorative auto-playing swipe deck for the landing hero. */
export function HeroSwipeDemo({ cars }: { cars: DemoCar[] }) {
  const reduceMotion = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); // number of cards swiped so far
  const [lean, setLean] = useState<Dir | null>(null);
  const [burst, setBurst] = useState<{ dir: Dir; key: number } | null>(null);
  // Direction of the card currently flying out; `dir` has already moved on to the next swipe.
  const [exitDir, setExitDir] = useState<Dir>("like");
  const [visible, setVisible] = useState(true);

  // Only animate while the hero is on screen and the tab is in front.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting) && !document.hidden), { threshold: 0.3 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const dir = PATTERN[step % PATTERN.length]!;

  useEffect(() => {
    if (reduceMotion || !visible || cars.length < 2) return;
    // Each cycle starts right after the previous swipe, so it also clears that swipe's burst.
    const timers = [
      setTimeout(() => setBurst(null), BURST_MS),
      setTimeout(() => setLean(dir), IDLE_MS),
      setTimeout(() => {
        setBurst({ dir, key: step });
        setExitDir(dir);
        setLean(null);
        setStep((s) => s + 1);
      }, IDLE_MS + LEAN_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step, dir, reduceMotion, visible, cars.length]);

  if (!cars.length) return null;
  const visibleCars = [0, 1, 2].map((offset) => cars[(step + offset) % cars.length]!).filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  return (
    <div ref={root} className="relative mx-auto w-full max-w-sm lg:max-w-md" aria-hidden="true">
      <div className="relative aspect-[3/4]">
        <AnimatePresence initial={false} custom={exitDir}>
          {[...visibleCars].reverse().map((car) => {
            const depth = visibleCars.indexOf(car);
            const isTop = depth === 0;
            const leanX = isTop && lean ? (lean === "like" ? 36 : -36) : 0;
            return (
              <motion.div
                key={`${car.id}-${Math.floor((step + depth) / cars.length)}`}
                custom={exitDir}
                variants={EXIT_VARIANTS}
                exit="exit"
                className="absolute inset-0"
                style={{ zIndex: 10 - depth }}
                initial={{ scale: 0.88, y: 30, opacity: 0 }}
                animate={{
                  scale: 1 - depth * 0.05,
                  y: depth * 16,
                  rotate: isTop ? leanX / 6 : depth === 1 ? 3 : -3,
                  x: leanX,
                  opacity: 1,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              >
                <article className={cn("relative h-full overflow-hidden rounded-3xl border bg-card", isTop ? "shadow-float" : "shadow-card")}>
                  <VehicleImage src={car.image} alt="" sizes="(min-width: 1024px) 448px, 384px" priority={depth === 0} />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 pt-24 text-white">
                    <p className="text-2xl font-bold">{car.title}</p>
                    {car.trim && <p className="text-sm text-white/80">{car.trim}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xl font-semibold">{car.price}</span>
                      <span className="text-sm text-white/80">{car.km}</span>
                    </div>
                  </div>
                  {isTop && (
                    <>
                      <motion.span
                        animate={{ opacity: lean === "like" ? 1 : 0, scale: lean === "like" ? 1 : 0.8 }}
                        className="absolute top-6 left-6 -rotate-12 rounded-lg bg-brand-gradient px-3 py-1 text-xl font-extrabold tracking-wider text-white shadow-lg"
                      >
                        LIKE
                      </motion.span>
                      <motion.span
                        animate={{ opacity: lean === "pass" ? 1 : 0, scale: lean === "pass" ? 1 : 0.8 }}
                        className="absolute top-6 right-6 rotate-12 rounded-lg bg-zinc-900/85 px-3 py-1 text-xl font-extrabold tracking-wider text-white shadow-lg"
                      >
                        NOPE
                      </motion.span>
                    </>
                  )}
                </article>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {burst && (
            <motion.div
              key={burst.key}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              {burst.dir === "like" ? <HeartBurst /> : <PassBurst />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-30 mt-6 flex justify-center gap-5">
        <motion.span
          animate={lean === "pass" ? { scale: 1.15 } : { scale: 1 }}
          className={cn("flex size-14 items-center justify-center rounded-full border bg-surface text-foreground shadow-card transition-colors", lean === "pass" && "border-foreground/40")}
        >
          <X className="size-6" />
        </motion.span>
        <motion.span
          animate={lean === "like" ? { scale: 1.15 } : { scale: 1 }}
          className="flex size-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-float"
        >
          <Heart className="size-6 fill-white" />
        </motion.span>
      </div>
    </div>
  );
}

/** Big heart pop with small hearts drifting up. */
function HeartBurst() {
  const floaters = [
    { x: -70, y: -90, s: 0.5, d: 0.05 },
    { x: 60, y: -110, s: 0.4, d: 0.1 },
    { x: -20, y: -140, s: 0.35, d: 0.15 },
    { x: 95, y: -50, s: 0.3, d: 0.08 },
    { x: -100, y: -30, s: 0.3, d: 0.12 },
  ];
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: [0, 1.25, 1], rotate: 0 }}
        transition={{ duration: 0.5, times: [0, 0.6, 1], ease: "easeOut" }}
        className="flex size-28 items-center justify-center rounded-full bg-brand-gradient shadow-[0_12px_40px_-8px_rgb(217_84_154/0.6)]"
      >
        <Heart className="size-14 fill-white text-white" />
      </motion.div>
      {floaters.map((f, i) => (
        <motion.span
          key={i}
          className="absolute top-1/2 left-1/2"
          initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0 }}
          animate={{ x: `calc(-50% + ${f.x}px)`, y: `calc(-50% + ${f.y}px)`, opacity: [0, 1, 0], scale: f.s * 2 }}
          transition={{ duration: 0.9, delay: f.d, ease: "easeOut" }}
        >
          <Heart className="size-6 fill-brand-pink text-brand-pink" />
        </motion.span>
      ))}
    </div>
  );
}

/** Heart that cracks and drops: "not for me". */
function PassBurst() {
  return (
    <motion.div
      initial={{ scale: 0, y: 0 }}
      animate={{ scale: [0, 1.15, 1, 1], y: [0, 0, 0, 30], rotate: [0, 0, -6, -10] }}
      transition={{ duration: 0.85, times: [0, 0.35, 0.6, 1], ease: "easeOut" }}
      className="flex size-28 items-center justify-center rounded-full bg-zinc-900/90 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.5)] ring-4 ring-white/10"
    >
      <HeartCrack className="size-14 text-white" />
    </motion.div>
  );
}
