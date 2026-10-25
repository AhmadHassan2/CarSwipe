"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Search, Shapes } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { BODY_STYLES, BODY_STYLE_LABELS, MAKES } from "@/features/vehicles/constants";

export function SearchCommand({ variant = "bar" }: { variant?: "bar" | "icon" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {variant === "bar" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-56 items-center gap-2 rounded-full border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search cars</span>
          <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
        </button>
      ) : (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Search cars">
          <Search className="size-5" />
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen} title="Search cars" description="Search by make, model, year or city">
        <Command>
          <CommandInput
            placeholder="Try “BMW M4”, “2021 SUV” or “Oakville”"
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim() && !document.querySelector("[cmdk-item][data-selected=true]")) {
                go(`/browse?q=${encodeURIComponent(query.trim())}`);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>Press Enter to search all listings.</CommandEmpty>
            {query.trim() && (
              <CommandGroup heading="Search">
                <CommandItem value={`search ${query}`} onSelect={() => go(`/browse?q=${encodeURIComponent(query.trim())}`)}>
                  <Search /> Search for “{query.trim()}”
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Makes">
              {MAKES.map((make) => (
                <CommandItem key={make} value={`make ${make}`} onSelect={() => go(`/browse?makes=${encodeURIComponent(make)}`)}>
                  <Car /> {make}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Body styles">
              {BODY_STYLES.map((b) => (
                <CommandItem key={b} value={`body ${BODY_STYLE_LABELS[b]}`} onSelect={() => go(`/browse?bodyStyles=${b}`)}>
                  <Shapes /> {BODY_STYLE_LABELS[b]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

