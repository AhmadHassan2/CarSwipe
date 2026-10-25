"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { MAX_PHOTOS } from "@/features/vehicles/listing-schema";
import { cn } from "@/lib/utils";

export type Photo = { url: string; key?: string | null };
type Pending = { id: string; name: string; preview: string };

const MAX_BYTES = 10 * 1024 * 1024;

async function upload(file: File): Promise<Photo> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return { url: data.url, key: data.key };
}

export function PhotoUploader({ value, onChange, error }: { value: Photo[]; onChange: (photos: Photo[]) => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  // addFiles awaits uploads, so it reads the latest photos through a ref rather than a stale closure.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const addFiles = async (files: FileList | File[]) => {
    const room = MAX_PHOTOS - latest.current.length - pending.length;
    const list = [...files].filter((f) => {
      if (!f.type.startsWith("image/") && !/\.(heic|heif)$/i.test(f.name)) {
        toast.error(`${f.name} isn't an image`);
        return false;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is over 10 MB`);
        return false;
      }
      return true;
    });
    if (list.length > room) toast.error(`You can add ${Math.max(0, room)} more photo${room === 1 ? "" : "s"}`);
    const batch = list.slice(0, Math.max(0, room)).map((file) => ({ file, id: crypto.randomUUID(), preview: URL.createObjectURL(file) }));
    setPending((p) => [...p, ...batch.map(({ id, file, preview }) => ({ id, name: file.name, preview }))]);

    // Upload two at a time; keep the order the seller picked.
    const results: (Photo | null)[] = new Array(batch.length).fill(null);
    let next = 0;
    const worker = async () => {
      while (next < batch.length) {
        const i = next++;
        const item = batch[i]!;
        try {
          results[i] = await upload(item.file);
        } catch (err) {
          toast.error(`${item.file.name}: ${err instanceof Error ? err.message : "upload failed"}`);
        } finally {
          URL.revokeObjectURL(item.preview);
          setPending((p) => p.filter((x) => x.id !== item.id));
        }
      }
    };
    await Promise.all([worker(), worker()]);
    const added = results.filter((r): r is Photo => r !== null);
    if (added.length) onChange([...latest.current, ...added]);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files); }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-primary bg-muted" : "border-border",
          error && "border-destructive",
        )}
      >
        <ImagePlus className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Drag photos here, or</p>
        <button type="button" onClick={() => input.current?.click()} className="rounded-full border bg-surface px-4 py-1.5 text-sm font-medium hover:bg-muted">
          Choose photos
        </button>
        <p className="text-xs text-muted-foreground">Up to {MAX_PHOTOS} photos · JPEG, PNG, WebP or HEIC · 10 MB each. Location data is removed.</p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          className="sr-only"
          aria-label="Upload photos"
          onChange={(e) => { if (e.target.files?.length) void addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}

      {(value.length > 0 || pending.length > 0) && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Listing photos">
          {value.map((photo, i) => (
            <li key={photo.url} className="group relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
              <Image src={photo.url} alt={`Photo ${i + 1}`} fill sizes="240px" className="object-cover" />
              {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-zinc-900/85 px-2 py-0.5 text-[11px] font-semibold text-white">Cover</span>}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`} className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-card hover:bg-white">
                <X className="size-4" />
              </button>
              <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-100 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} className="flex size-7 items-center justify-center rounded-full bg-white/90 text-zinc-900 disabled:opacity-40">
                  <ArrowLeft className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label={`Move photo ${i + 1} later`} className="flex size-7 items-center justify-center rounded-full bg-white/90 text-zinc-900 disabled:opacity-40">
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={p.preview} alt="" className="size-full object-cover opacity-50" />
              <span className="absolute inset-0 flex items-center justify-center"><Loader2 className="size-6 animate-spin" /><span className="sr-only">Uploading {p.name}</span></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
