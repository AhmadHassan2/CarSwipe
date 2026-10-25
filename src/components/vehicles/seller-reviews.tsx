"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Stars } from "@/components/shared/star-rating";
import { UserAvatar } from "@/components/shared/user-avatar";
import { api } from "@/lib/fetcher";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

type Review = { id: string; rating: number; comment: string | null; createdAt: string | Date; reviewer: { name: string | null; image: string | null } };

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Rating" className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(Math.min(5, (value || 0) + 1)); }
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(Math.max(1, (value || 2) - 1)); }
            }}
            tabIndex={value ? (value === n ? 0 : -1) : n === 1 ? 0 : -1}
            className="p-0.5"
          >
            <Star className={cn("size-7 transition-colors", n <= shown ? "fill-foreground text-foreground" : "fill-transparent text-muted-foreground/50")} />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{LABELS[shown]}</span>
    </div>
  );
}

export function SellerReviews({
  sellerId,
  sellerName,
  summary,
  reviews,
  canReview,
  existing,
  signedIn,
}: {
  sellerId: string;
  sellerName: string;
  summary: { average: number; count: number };
  reviews: Review[];
  canReview: boolean;
  existing: { rating: number; comment: string | null } | null;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      try {
        await api(`/api/sellers/${sellerId}/reviews`, { method: "PUT", json: { rating, comment: comment.trim() || undefined } });
        toast.success(existing ? "Review updated" : "Thanks for your review");
        setEditing(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't save your review");
      }
    });

  return (
    <section aria-labelledby="reviews-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="reviews-heading" className="text-xl font-semibold">Seller reviews</h2>
          {summary.count > 0 ? (
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Stars value={summary.average} />
              <span className="font-semibold">{summary.average.toFixed(1)}</span>
              <span className="text-muted-foreground">from {summary.count} {summary.count === 1 ? "buyer" : "buyers"}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{sellerName} hasn't been reviewed yet.</p>
          )}
        </div>
        {canReview && !editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>{existing ? "Edit your review" : "Write a review"}</Button>
        )}
      </div>

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); if (rating) submit(); }} className="mb-6 space-y-3 rounded-2xl border bg-card p-4">
          <p className="text-sm font-medium">How was your experience with {sellerName}?</p>
          <StarInput value={rating} onChange={setRating} />
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={3} placeholder="Optional: what went well, or what could be better?" aria-label="Review comment" />
          <div className="flex gap-2">
            <Button type="submit" disabled={!rating || pending}>{pending ? "Saving…" : existing ? "Update review" : "Post review"}</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {reviews.length > 0 ? (
        <ul className="divide-y rounded-2xl border bg-card">
          {reviews.map((r) => (
            <li key={r.id} className="flex gap-3 p-4">
              <UserAvatar name={r.reviewer.name} image={r.reviewer.image} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium">{r.reviewer.name ?? "CarSwipe buyer"}</span>
                  <Stars value={r.rating} size="size-3.5" />
                  <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {signedIn && !canReview && (
        <p className="mt-3 text-xs text-muted-foreground">You can review this seller after you've messaged them about a listing.</p>
      )}
    </section>
  );
}
