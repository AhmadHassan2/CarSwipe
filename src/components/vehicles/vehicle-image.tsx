"use client";

import Image from "next/image";
import { useState } from "react";
import { CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

/** next/image with a branded placeholder when the photo is missing or fails to load. */
export function VehicleImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground", className)}>
        <CarFront className="size-10 opacity-60" />
        <span className="text-xs">Photo unavailable</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
