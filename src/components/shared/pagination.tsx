import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filtersToSearchParams, type VehicleFilters } from "@/features/vehicles/filters";

export function Pagination({ page, pageCount, filters, basePath }: { page: number; pageCount: number; filters: VehicleFilters; basePath: string }) {
  if (pageCount <= 1) return null;
  const href = (p: number) => {
    const qs = filtersToSearchParams({ ...filters, page: p > 1 ? p : undefined }).toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
      <Button asChild variant="outline" size="sm" className="rounded-full" disabled={page <= 1}>
        {page > 1 ? <Link href={href(page - 1)} rel="prev"><ChevronLeft /> Previous</Link> : <span><ChevronLeft /> Previous</span>}
      </Button>
      <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
      <Button asChild variant="outline" size="sm" className="rounded-full" disabled={page >= pageCount}>
        {page < pageCount ? <Link href={href(page + 1)} rel="next">Next <ChevronRight /></Link> : <span>Next <ChevronRight /></span>}
      </Button>
    </nav>
  );
}
