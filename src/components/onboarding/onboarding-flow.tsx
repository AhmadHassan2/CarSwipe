"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { savePreferencesAction, skipOnboardingAction } from "@/app/actions/preferences";
import { BODY_STYLES, BODY_STYLE_LABELS, MAKES } from "@/features/vehicles/constants";
import { CITIES, cityLabel } from "@/lib/locations";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const BUDGETS = [15000, 25000, 40000, 60000, 90000, 150000];

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected ? "border-primary bg-primary text-primary-foreground" : "bg-surface hover:border-foreground/30",
      )}
    >
      {selected && <Check className="size-3.5" />}
      {children}
    </button>
  );
}

export function OnboardingFlow({ name }: { name: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [bodyStyles, setBodyStyles] = useState<string[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [pending, start] = useTransition();
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const steps = [
    {
      title: "What's your budget?",
      hint: "We'll show cars up to this price first.",
      body: (
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => <Chip key={b} selected={maxPrice === b} onClick={() => setMaxPrice(maxPrice === b ? null : b)}>Up to {formatPrice(b)}</Chip>)}
          <Chip selected={maxPrice === null} onClick={() => setMaxPrice(null)}>No limit</Chip>
        </div>
      ),
    },
    {
      title: "What kind of car?",
      hint: "Pick as many as you like.",
      body: <div className="flex flex-wrap gap-2">{BODY_STYLES.map((b) => <Chip key={b} selected={bodyStyles.includes(b)} onClick={() => toggle(bodyStyles, setBodyStyles, b)}>{BODY_STYLE_LABELS[b]}</Chip>)}</div>,
    },
    {
      title: "Any favourite brands?",
      hint: "Optional. We'll still show you others.",
      body: <div className="flex flex-wrap gap-2">{MAKES.map((m) => <Chip key={m} selected={makes.includes(m)} onClick={() => toggle(makes, setMakes, m)}>{m}</Chip>)}</div>,
    },
    {
      title: "Where are you?",
      hint: "Cars closer to you rank higher.",
      body: <div className="flex flex-wrap gap-2">{CITIES.map((c) => <Chip key={c.name} selected={location === cityLabel(c)} onClick={() => setLocation(location === cityLabel(c) ? "" : cityLabel(c))}>{c.name}</Chip>)}</div>,
    },
  ];
  const last = step === steps.length - 1;
  const current = steps[step]!;

  const finish = () =>
    start(async () => {
      const res = await savePreferencesAction(
        { maxPrice, bodyStyles, preferredMakes: makes, location: location || null, radius: location ? 100 : null },
        { onboarding: true },
      );
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      router.push("/swipe");
    });

  const skip = () =>
    start(async () => {
      await skipOnboardingAction();
      router.push("/swipe");
    });

  return (
    <div>
      <p className="text-sm text-muted-foreground">Welcome{name ? `, ${name.split(" ")[0]}` : ""}. Step {step + 1} of {steps.length}</p>
      <Progress value={((step + 1) / steps.length) * 100} className="mt-2 mb-6 h-1.5" aria-label="Setup progress" />
      <h1 className="text-2xl font-bold tracking-tight">{current.title}</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">{current.hint}</p>
      {current.body}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={pending}><ArrowLeft /> Back</Button>
        ) : (
          <Button variant="ghost" onClick={skip} disabled={pending}>Skip for now</Button>
        )}
        <Button variant="brand" className="h-11 px-6" disabled={pending} onClick={() => (last ? finish() : setStep(step + 1))}>
          {last ? (pending ? "Saving…" : "Start swiping") : "Continue"}
        </Button>
      </div>
    </div>
  );
}
