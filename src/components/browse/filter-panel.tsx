"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BODY_STYLES, BODY_STYLE_LABELS, CONDITIONS, CONDITION_LABELS, DRIVETRAINS, DRIVETRAIN_LABELS,
  FUEL_TYPES, FUEL_TYPE_LABELS, MILEAGE_CEILING, PRICE_CEILING, TRANSMISSIONS, TRANSMISSION_LABELS,
} from "@/features/vehicles/constants";
import { CITIES, cityLabel } from "@/lib/locations";
import { formatKm, formatPrice } from "@/lib/format";
import type { VehicleFilters } from "@/features/vehicles/filters";

type Props = {
  filters: VehicleFilters;
  makes: { make: string; count: number }[];
  onChange: (patch: Partial<VehicleFilters>) => void;
  onClear: () => void;
};

function toggle<T>(list: T[] | undefined, value: T): T[] | undefined {
  const next = list?.includes(value) ? list.filter((v) => v !== value) : [...(list ?? []), value];
  return next.length ? next : undefined;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-b py-5 first:pt-0 last:border-0">
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckList<T extends string>({ values, labels, selected, onToggle }: { values: readonly T[]; labels: Record<T, string>; selected?: T[]; onToggle: (v: T) => void }) {
  return (
    <div className="grid gap-2">
      {values.map((v) => (
        <Label key={v} className="flex cursor-pointer items-center gap-2.5 font-normal">
          <Checkbox checked={selected?.includes(v) ?? false} onCheckedChange={() => onToggle(v)} />
          {labels[v]}
        </Label>
      ))}
    </div>
  );
}

export function FilterPanel({ filters, makes, onChange, onClear }: Props) {
  const priceRange: [number, number] = [filters.minPrice ?? 0, filters.maxPrice ?? PRICE_CEILING];
  const mileMax = filters.maxMileage ?? MILEAGE_CEILING;
  const years = useMemo(() => Array.from({ length: new Date().getFullYear() - 1989 + 1 }, (_, i) => new Date().getFullYear() + 1 - i), []);

  return (
    <div>
      <Section title="Price">
        <Slider min={0} max={PRICE_CEILING} step={1000} value={priceRange} onValueChange={(v) => onChange({
          minPrice: v[0] ? v[0] : undefined,
          maxPrice: v[1] < PRICE_CEILING ? v[1] : undefined,
        })} aria-label="Price range" />
        <p className="text-sm text-muted-foreground">
          {formatPrice(priceRange[0])} – {priceRange[1] >= PRICE_CEILING ? `${formatPrice(PRICE_CEILING)}+` : formatPrice(priceRange[1])}
        </p>
      </Section>

      <Section title="Make">
        <div className="grid max-h-56 gap-2 overflow-y-auto pr-1">
          {makes.map(({ make, count }) => (
            <Label key={make} className="flex cursor-pointer items-center gap-2.5 font-normal">
              <Checkbox checked={filters.makes?.includes(make) ?? false} onCheckedChange={() => onChange({ makes: toggle(filters.makes, make), models: undefined })} />
              <span className="flex-1">{make}</span>
              <span className="text-xs text-muted-foreground">{count}</span>
            </Label>
          ))}
        </div>
      </Section>

      <Section title="Body style">
        <CheckList values={BODY_STYLES} labels={BODY_STYLE_LABELS} selected={filters.bodyStyles} onToggle={(v) => onChange({ bodyStyles: toggle(filters.bodyStyles, v) })} />
      </Section>

      <Section title="Year">
        <div className="grid grid-cols-2 gap-2">
          {(["minYear", "maxYear"] as const).map((key) => (
            <Select key={key} value={filters[key] ? String(filters[key]) : "any"} onValueChange={(v) => onChange({ [key]: v === "any" ? undefined : Number(v) })}>
              <SelectTrigger aria-label={key === "minYear" ? "From year" : "To year"}><SelectValue placeholder={key === "minYear" ? "From" : "To"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{key === "minYear" ? "Any from" : "Any to"}</SelectItem>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
        </div>
      </Section>

      <Section title="Mileage">
        <Slider min={0} max={MILEAGE_CEILING} step={5000} value={[mileMax]} onValueChange={(v) => onChange({ maxMileage: v[0]! < MILEAGE_CEILING ? v[0] : undefined })} aria-label="Maximum mileage" />
        <p className="text-sm text-muted-foreground">Up to {mileMax >= MILEAGE_CEILING ? "any" : formatKm(mileMax)}</p>
      </Section>

      <Section title="Transmission">
        <CheckList values={TRANSMISSIONS} labels={TRANSMISSION_LABELS} selected={filters.transmissions} onToggle={(v) => onChange({ transmissions: toggle(filters.transmissions, v) })} />
      </Section>
      <Section title="Fuel type">
        <CheckList values={FUEL_TYPES} labels={FUEL_TYPE_LABELS} selected={filters.fuelTypes} onToggle={(v) => onChange({ fuelTypes: toggle(filters.fuelTypes, v) })} />
      </Section>
      <Section title="Drivetrain">
        <CheckList values={DRIVETRAINS} labels={DRIVETRAIN_LABELS} selected={filters.drivetrains} onToggle={(v) => onChange({ drivetrains: toggle(filters.drivetrains, v) })} />
      </Section>
      <Section title="Condition">
        <CheckList values={CONDITIONS} labels={CONDITION_LABELS} selected={filters.conditions} onToggle={(v) => onChange({ conditions: toggle(filters.conditions, v) })} />
      </Section>

      <Section title="Seller">
        <Select value={filters.sellerType ?? "any"} onValueChange={(v) => onChange({ sellerType: v === "any" ? undefined : v })}>
          <SelectTrigger aria-label="Seller type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Dealers and private</SelectItem>
            <SelectItem value="DEALER">Dealers only</SelectItem>
            <SelectItem value="PRIVATE">Private sellers only</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      <Section title="Location">
        <Select value={filters.location ?? "any"} onValueChange={(v) => onChange({ location: v === "any" ? undefined : v, radius: v === "any" ? undefined : (filters.radius ?? 50) })}>
          <SelectTrigger aria-label="City"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Anywhere</SelectItem>
            {CITIES.map((c) => <SelectItem key={c.name} value={cityLabel(c)}>{cityLabel(c)}</SelectItem>)}
          </SelectContent>
        </Select>
        {filters.location && (
          <div className="space-y-2">
            <Slider min={10} max={250} step={10} value={[filters.radius ?? 50]} onValueChange={(v) => onChange({ radius: v[0] })} aria-label="Search radius" />
            <p className="text-sm text-muted-foreground">Within {filters.radius ?? 50} km</p>
          </div>
        )}
      </Section>

      <Button variant="outline" className="mt-2 w-full" onClick={onClear}>Clear all filters</Button>
    </div>
  );
}
