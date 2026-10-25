"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploader, type Photo } from "./photo-uploader";
import { listingSchema } from "@/features/vehicles/listing-schema";
import {
  BODY_STYLES, BODY_STYLE_LABELS, CONDITIONS, CONDITION_LABELS, DRIVETRAINS, DRIVETRAIN_LABELS,
  FUEL_TYPES, FUEL_TYPE_LABELS, MAKES, TRANSMISSIONS, TRANSMISSION_LABELS,
} from "@/features/vehicles/constants";
import { CITIES, cityLabel } from "@/lib/locations";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

export type ListingFormValues = {
  make: string; model: string; year: string; trim: string; price: string; mileage: string;
  condition: string; bodyStyle: string; transmission: string; fuelType: string; drivetrain: string;
  engine: string; horsepower: string; exteriorColour: string; interiorColour: string; owners: string; vin: string;
  location: string; description: string; history: string; features: string[]; images: Photo[];
};

export const EMPTY_LISTING: ListingFormValues = {
  make: "", model: "", year: "", trim: "", price: "", mileage: "", condition: "USED", bodyStyle: "", transmission: "", fuelType: "",
  drivetrain: "", engine: "", horsepower: "", exteriorColour: "", interiorColour: "", owners: "", vin: "", location: "",
  description: "", history: "", features: [], images: [],
};

const FEATURE_SUGGESTIONS = ["Heated seats", "Apple CarPlay", "Android Auto", "Sunroof", "Backup camera", "Blind-spot monitoring", "Adaptive cruise", "Remote start", "Leather seats", "Winter tires included", "Navigation", "Heated steering wheel"];

const selectClass = "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30";

function Field({ name, label, hint, error, className, children }: { name: string; label: string; hint?: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? <p id={`${name}-error`} role="alert" className="text-sm text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ListingForm({ vehicleId, initial, status }: { vehicleId?: string; initial: ListingFormValues; status?: string }) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<ListingFormValues>({ defaultValues: initial });
  const [featureDraft, setFeatureDraft] = useState("");
  const isDraft = !vehicleId || status === "DRAFT";

  const reg = (name: keyof ListingFormValues) => ({
    id: name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    ...register(name),
  });
  const err = (name: keyof ListingFormValues) => errors[name]?.message as string | undefined;

  const submit = (publish: boolean) =>
    handleSubmit(async (values) => {
      clearErrors();
      const parsed = listingSchema.safeParse({ ...values, publish });
      if (!parsed.success) {
        let first: string | null = null;
        const flagged = new Set<string>();
        for (const issue of parsed.error.issues) {
          const field = String(issue.path[0]) as keyof ListingFormValues;
          if (flagged.has(field)) continue;
          flagged.add(field);
          setError(field, { message: issue.message });
          first ??= field;
        }
        if (first) document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "center" });
        toast.error("Please fix the highlighted fields");
        return;
      }
      if (publish && !parsed.data.images.length) {
        setError("images", { message: "Add at least one photo to publish" });
        document.getElementById("images")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      try {
        const res = vehicleId
          ? await api<{ id: string; status: string }>(`/api/listings/${vehicleId}`, { method: "PUT", json: parsed.data })
          : await api<{ id: string; status: string }>("/api/listings", { method: "POST", json: parsed.data });
        toast.success(res.status === "ACTIVE" ? (isDraft ? "Your listing is live" : "Listing updated") : "Draft saved");
        router.push(res.status === "DRAFT" ? "/dashboard" : `/vehicles/${res.id}`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save your listing");
      }
    })();

  return (
    <form onSubmit={(e) => { e.preventDefault(); void submit(true); }} noValidate className="space-y-6">
      <Section title="Photos" description="The first photo is your cover. Bright, outdoor shots from all four corners get the most likes.">
        <div id="images" tabIndex={-1}>
          <Controller control={control} name="images" render={({ field }) => <PhotoUploader value={field.value} onChange={(v) => { field.onChange(v); clearErrors("images"); }} error={err("images")} />} />
        </div>
      </Section>

      <Section title="The car">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="make" label="Make" error={err("make")}>
            <Input {...reg("make")} list="make-options" autoComplete="off" placeholder="e.g. Toyota" />
            <datalist id="make-options">{MAKES.map((m) => <option key={m} value={m} />)}</datalist>
          </Field>
          <Field name="model" label="Model" error={err("model")}><Input {...reg("model")} placeholder="e.g. RAV4" /></Field>
          <Field name="year" label="Year" error={err("year")}><Input {...reg("year")} inputMode="numeric" placeholder="2021" /></Field>
          <Field name="trim" label="Trim" hint="Optional" error={err("trim")}><Input {...reg("trim")} placeholder="e.g. XLE AWD" /></Field>
          <Field name="bodyStyle" label="Body style" error={err("bodyStyle")}>
            <select {...reg("bodyStyle")} className={selectClass}>
              <option value="">Choose…</option>
              {BODY_STYLES.map((b) => <option key={b} value={b}>{BODY_STYLE_LABELS[b]}</option>)}
            </select>
          </Field>
          <Field name="condition" label="Condition" error={err("condition")}>
            <select {...reg("condition")} className={selectClass}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Price and mileage">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="price" label="Asking price (CAD)" error={err("price")}>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input {...reg("price")} inputMode="numeric" className="pl-6" placeholder="24,900" />
            </div>
          </Field>
          <Field name="mileage" label="Odometer (km)" error={err("mileage")}><Input {...reg("mileage")} inputMode="numeric" placeholder="65,000" /></Field>
          <Field name="location" label="Location" error={err("location")} className="sm:col-span-2">
            <select {...reg("location")} className={selectClass}>
              <option value="">Choose a city…</option>
              {CITIES.map((c) => <option key={c.name} value={cityLabel(c)}>{cityLabel(c)}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Specs" description="Buyers filter on these, so filling them in gets your car seen more.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field name="transmission" label="Transmission" error={err("transmission")}>
            <select {...reg("transmission")} className={selectClass}>
              <option value="">Choose…</option>
              {TRANSMISSIONS.map((t) => <option key={t} value={t}>{TRANSMISSION_LABELS[t]}</option>)}
            </select>
          </Field>
          <Field name="fuelType" label="Fuel type" error={err("fuelType")}>
            <select {...reg("fuelType")} className={selectClass}>
              <option value="">Choose…</option>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{FUEL_TYPE_LABELS[f]}</option>)}
            </select>
          </Field>
          <Field name="drivetrain" label="Drivetrain" hint="Optional" error={err("drivetrain")}>
            <select {...reg("drivetrain")} className={selectClass}>
              <option value="">Not specified</option>
              {DRIVETRAINS.map((d) => <option key={d} value={d}>{DRIVETRAIN_LABELS[d]}</option>)}
            </select>
          </Field>
          <Field name="engine" label="Engine" hint="Optional" error={err("engine")}><Input {...reg("engine")} placeholder="2.5L inline-4" /></Field>
          <Field name="horsepower" label="Horsepower" hint="Optional" error={err("horsepower")}><Input {...reg("horsepower")} inputMode="numeric" /></Field>
          <Field name="owners" label="Previous owners" hint="Optional" error={err("owners")}><Input {...reg("owners")} inputMode="numeric" /></Field>
          <Field name="exteriorColour" label="Exterior colour" hint="Optional" error={err("exteriorColour")}><Input {...reg("exteriorColour")} /></Field>
          <Field name="interiorColour" label="Interior colour" hint="Optional" error={err("interiorColour")}><Input {...reg("interiorColour")} /></Field>
          <Field name="vin" label="VIN" hint="Optional · not shown publicly" error={err("vin")}><Input {...reg("vin")} autoCapitalize="characters" maxLength={17} className="font-mono uppercase" /></Field>
        </div>
      </Section>

      <Section title="Description">
        <div className="space-y-4">
          <Field name="description" label="About this car" hint="Condition, maintenance, why you're selling, what's included." error={err("description")}>
            <Textarea {...reg("description")} rows={6} maxLength={5000} />
          </Field>
          <Field name="history" label="Accident and service history" hint="Optional" error={err("history")}>
            <Textarea {...reg("history")} rows={3} maxLength={2000} />
          </Field>
          <Controller
            control={control}
            name="features"
            render={({ field }) => {
              const add = (f: string) => {
                const v = f.trim().slice(0, 60);
                if (v && !field.value.some((x) => x.toLowerCase() === v.toLowerCase()) && field.value.length < 30) field.onChange([...field.value, v]);
                setFeatureDraft("");
              };
              return (
                <Field name="features-input" label="Features" hint="Press Enter to add">
                  <div className="flex gap-2">
                    <Input id="features-input" value={featureDraft} onChange={(e) => setFeatureDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(featureDraft); } }} placeholder="e.g. Heated seats" />
                    <Button type="button" variant="outline" onClick={() => add(featureDraft)} disabled={!featureDraft.trim()} aria-label="Add feature"><Plus /></Button>
                  </div>
                  {field.value.length > 0 && (
                    <ul className="flex flex-wrap gap-2 pt-2">
                      {field.value.map((f) => (
                        <li key={f} className="flex items-center gap-1 rounded-full border bg-muted py-1 pr-1.5 pl-3 text-sm">
                          {f}
                          <button type="button" onClick={() => field.onChange(field.value.filter((x) => x !== f))} aria-label={`Remove ${f}`} className="rounded-full p-0.5 hover:bg-background"><X className="size-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {FEATURE_SUGGESTIONS.filter((s) => !field.value.includes(s)).slice(0, 8).map((s) => (
                      <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground">+ {s}</button>
                    ))}
                  </div>
                </Field>
              );
            }}
          />
        </div>
      </Section>

      <div className="sticky bottom-16 z-10 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:bottom-0 sm:mx-0 sm:rounded-2xl sm:border">
        {isDraft && (
          <Button type="button" variant="outline" className="h-11" disabled={isSubmitting} onClick={() => void submit(false)}>
            Save draft
          </Button>
        )}
        <Button type="submit" variant="brand" className="h-11 px-6" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} {isDraft ? "Publish listing" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
