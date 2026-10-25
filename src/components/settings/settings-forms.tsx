"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Check, Loader2, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  changePasswordAction, deleteAccountAction, updateNotificationsAction, updateProfileAction, updateThemeAction,
} from "@/app/actions/account";
import { savePreferencesAction } from "@/app/actions/preferences";
import {
  BODY_STYLES, BODY_STYLE_LABELS, FUEL_TYPES, FUEL_TYPE_LABELS, MAKES, TRANSMISSIONS, TRANSMISSION_LABELS,
} from "@/features/vehicles/constants";
import { CITIES, cityLabel } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

type Res = { ok: true } | { ok: false; error: string };

function useSave() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const save = (fn: () => Promise<Res>, success: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(success);
        router.refresh();
      } else toast.error(res.error);
    });
  return { pending, save };
}

export function SettingsCard({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border bg-card p-5 shadow-card sm:p-6" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const selectClass = "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ProfileForm({ initial }: { initial: { name: string; phone: string; sellerType: "PRIVATE" | "DEALER"; dealerName: string; email: string } }) {
  const [v, setV] = useState(initial);
  const { pending, save } = useSave();
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(() => updateProfileAction({ ...v, phone: v.phone || null, dealerName: v.dealerName || null }), "Profile saved"); }} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoComplete="name" required /></div>
      <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" value={v.email} disabled /></div>
      <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} autoComplete="tel" inputMode="tel" placeholder="Optional · never shown publicly" /></div>
      <div className="space-y-1.5">
        <Label htmlFor="sellerType">I sell as</Label>
        <select id="sellerType" className={selectClass} value={v.sellerType} onChange={(e) => setV({ ...v, sellerType: e.target.value as "PRIVATE" | "DEALER" })}>
          <option value="PRIVATE">A private seller</option>
          <option value="DEALER">A dealership</option>
        </select>
      </div>
      {v.sellerType === "DEALER" && (
        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="dealerName">Dealership name</Label><Input id="dealerName" value={v.dealerName} onChange={(e) => setV({ ...v, dealerName: e.target.value })} required /></div>
      )}
      <div className="sm:col-span-2"><Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save profile</Button></div>
    </form>
  );
}

type Prefs = {
  minPrice: number | null; maxPrice: number | null; minYear: number | null; maxYear: number | null; maxMileage: number | null;
  preferredMakes: string[]; bodyStyles: string[]; transmissions: string[]; fuelTypes: string[]; location: string | null; radius: number | null;
};

function Chips({ options, labels, value, onChange }: { options: readonly string[]; labels?: Record<string, string>; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={cn("flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm", on ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground/30")}>
            {on && <Check className="size-3.5" />}{labels?.[o] ?? o}
          </button>
        );
      })}
    </div>
  );
}

export function PreferencesForm({ initial }: { initial: Prefs }) {
  const [v, setV] = useState(initial);
  const { pending, save } = useSave();
  const num = (s: string) => (s.trim() === "" ? null : Math.max(0, Math.round(Number(s.replace(/[,$\s]/g, "")))) || null);
  const field = (key: keyof Prefs, label: string, placeholder: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} inputMode="numeric" placeholder={placeholder} value={(v[key] as number | null) ?? ""} onChange={(e) => setV({ ...v, [key]: num(e.target.value) })} />
    </div>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(() => savePreferencesAction(v), "Preferences saved"); }} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {field("minPrice", "Min price", "$0")}
        {field("maxPrice", "Max price", "No limit")}
        {field("maxMileage", "Max mileage (km)", "Any")}
        {field("minYear", "From year", "Any")}
        {field("maxYear", "To year", "Any")}
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <select id="location" className={selectClass} value={v.location ?? ""} onChange={(e) => setV({ ...v, location: e.target.value || null, radius: e.target.value ? (v.radius ?? 100) : null })}>
            <option value="">Anywhere</option>
            {CITIES.map((c) => <option key={c.name} value={cityLabel(c)}>{cityLabel(c)}</option>)}
          </select>
        </div>
      </div>
      {v.location && (
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="radius">Within</Label>
          <select id="radius" className={selectClass} value={v.radius ?? 100} onChange={(e) => setV({ ...v, radius: Number(e.target.value) })}>
            {[25, 50, 100, 200, 400].map((r) => <option key={r} value={r}>{r} km</option>)}
          </select>
        </div>
      )}
      <div className="space-y-2"><p className="text-sm font-medium">Body styles</p><Chips options={BODY_STYLES} labels={BODY_STYLE_LABELS} value={v.bodyStyles} onChange={(x) => setV({ ...v, bodyStyles: x })} /></div>
      <div className="space-y-2"><p className="text-sm font-medium">Brands</p><Chips options={MAKES} value={v.preferredMakes} onChange={(x) => setV({ ...v, preferredMakes: x })} /></div>
      <div className="space-y-2"><p className="text-sm font-medium">Transmission</p><Chips options={TRANSMISSIONS} labels={TRANSMISSION_LABELS} value={v.transmissions} onChange={(x) => setV({ ...v, transmissions: x })} /></div>
      <div className="space-y-2"><p className="text-sm font-medium">Fuel</p><Chips options={FUEL_TYPES} labels={FUEL_TYPE_LABELS} value={v.fuelTypes} onChange={(x) => setV({ ...v, fuelTypes: x })} /></div>
      <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save preferences</Button>
    </form>
  );
}

export function NotificationsForm({ initial }: { initial: { notifyMessages: boolean; notifyInquiries: boolean } }) {
  const [v, setV] = useState(initial);
  const { save } = useSave();
  const set = (patch: Partial<typeof v>) => {
    const next = { ...v, ...patch };
    setV(next);
    save(() => updateNotificationsAction(next), "Notification settings saved");
  };
  return (
    <div className="space-y-4">
      <Label className="flex items-center justify-between gap-4 font-normal">
        <span><span className="block font-medium">New messages</span><span className="text-sm text-muted-foreground">When someone replies in a conversation</span></span>
        <Switch checked={v.notifyMessages} onCheckedChange={(c) => set({ notifyMessages: c })} />
      </Label>
      <Label className="flex items-center justify-between gap-4 font-normal">
        <span><span className="block font-medium">Inquiries on my listings</span><span className="text-sm text-muted-foreground">When a buyer messages you about a car you’re selling</span></span>
        <Switch checked={v.notifyInquiries} onCheckedChange={(c) => set({ notifyInquiries: c })} />
      </Label>
    </div>
  );
}

export function ThemeForm() {
  const { theme: rawTheme, setTheme } = useTheme();
  // The theme lives in localStorage, so it's unknown during SSR; select nothing until mounted.
  const theme = useMounted() ? rawTheme : undefined;
  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3">
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={theme === o.value} type="button"
          onClick={() => { setTheme(o.value); void updateThemeAction(o.value.toUpperCase()); }}
          className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium", theme === o.value ? "border-primary ring-2 ring-primary/30" : "hover:border-foreground/30")}>
          <o.icon className="size-5" />{o.label}
        </button>
      ))}
    </div>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [v, setV] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await changePasswordAction(v);
          if (res.ok) {
            toast.success("Password updated");
            setV({ currentPassword: "", newPassword: "", confirmPassword: "" });
          } else toast.error(res.error);
        });
      }}
      className="grid max-w-md gap-4"
    >
      {hasPassword && <div className="space-y-1.5"><Label htmlFor="currentPassword">Current password</Label><Input id="currentPassword" type="password" autoComplete="current-password" value={v.currentPassword} onChange={(e) => setV({ ...v, currentPassword: e.target.value })} required /></div>}
      <div className="space-y-1.5"><Label htmlFor="newPassword">New password</Label><Input id="newPassword" type="password" autoComplete="new-password" value={v.newPassword} onChange={(e) => setV({ ...v, newPassword: e.target.value })} required /><p className="text-xs text-muted-foreground">At least 8 characters with a letter and a number.</p></div>
      <div className="space-y-1.5"><Label htmlFor="confirmPassword">Confirm new password</Label><Input id="confirmPassword" type="password" autoComplete="new-password" value={v.confirmPassword} onChange={(e) => setV({ ...v, confirmPassword: e.target.value })} required /></div>
      <div><Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} {hasPassword ? "Change password" : "Set password"}</Button></div>
    </form>
  );
}

export function DeleteAccount({ hasPassword }: { hasPassword: boolean }) {
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="destructive">Delete my account</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>This permanently deletes your profile, saved cars, listings, reviews and messages. It can’t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        {hasPassword && (
          <div className="space-y-1.5"><Label htmlFor="delete-password">Enter your password to confirm</Label><Input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my account</AlertDialogCancel>
          <Button variant="destructive" disabled={pending || (hasPassword && !password)} onClick={() => start(async () => {
            const res = await deleteAccountAction(password);
            if (res && !res.ok) toast.error(res.error);
          })}>
            {pending && <Loader2 className="animate-spin" />} Delete permanently
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
