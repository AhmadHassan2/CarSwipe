"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BODY_STYLES, BODY_STYLE_LABELS } from "@/features/vehicles/constants";
import { useDebouncedValue } from "@/hooks/use-debounce";

const SORTS = { saved_desc: "Recently saved", price_asc: "Lowest price", price_desc: "Highest price", year_desc: "Newest model year" };

export function SavedToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const debounced = useDebouncedValue(q, 300);

  const set = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if ((new URLSearchParams(window.location.search).get("q") ?? "") !== debounced.trim()) set("q", debounced.trim() || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <div className="relative min-w-52 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your garage" className="h-10 rounded-full pl-9" aria-label="Search saved cars" />
      </div>
      <Select value={params.get("bodyStyle") ?? "all"} onValueChange={(v) => set("bodyStyle", v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40 rounded-full" aria-label="Body style"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All body styles</SelectItem>
          {BODY_STYLES.map((b) => <SelectItem key={b} value={b}>{BODY_STYLE_LABELS[b]}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={params.get("sort") ?? "saved_desc"} onValueChange={(v) => set("sort", v === "saved_desc" ? undefined : v)}>
        <SelectTrigger className="w-44 rounded-full" aria-label="Sort"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.entries(SORTS).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
