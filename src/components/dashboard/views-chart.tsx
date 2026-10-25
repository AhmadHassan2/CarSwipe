"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";

type Point = { date: string; count: number };

const fmtDay = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-card">
      <p className="text-muted-foreground">{fmtDay(p.date)}</p>
      <p className="font-semibold text-foreground">{p.count} {p.count === 1 ? "view" : "views"}</p>
    </div>
  );
}

export function ViewsChart({ data }: { data: Point[] }) {
  const [asTable, setAsTable] = useState(false);
  const total = data.reduce((a, b) => a + b.count, 0);
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card" aria-labelledby="views-title">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="views-title" className="font-semibold">Listing views</h2>
          <p className="text-sm text-muted-foreground">Last 14 days · {total} total</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAsTable((t) => !t)} aria-pressed={asTable}>
          {asTable ? "Show chart" : "Show table"}
        </Button>
      </div>
      {asTable ? (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="py-1.5 font-medium">Date</th><th className="py-1.5 text-right font-medium">Views</th></tr></thead>
            <tbody>{data.map((d) => <tr key={d.date} className="border-t"><td className="py-1.5">{fmtDay(d.date)}</td><td className="py-1.5 text-right tabular-nums">{d.count}</td></tr>)}</tbody>
          </table>
        </div>
      ) : total === 0 ? (
        <p className="flex h-56 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">No views yet. Published listings start collecting views right away.</p>
      ) : (
        <div className="h-56" role="img" aria-label={`Bar chart of daily listing views over the last 14 days, ${total} in total`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap={2}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" tickFormatter={fmtDay} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} minTickGap={16} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={44} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
