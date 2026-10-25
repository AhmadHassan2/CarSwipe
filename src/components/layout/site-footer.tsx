import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  { title: "Discover", links: [["Swipe cars", "/swipe"], ["Browse listings", "/browse"], ["Compare", "/compare"], ["My Garage", "/saved"]] },
  { title: "Sell", links: [["List your car", "/sell"], ["Seller dashboard", "/dashboard"]] },
  { title: "Account", links: [["Sign in", "/login"], ["Create account", "/signup"], ["Settings", "/settings"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-surface pb-20 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">Find your next ride, one swipe at a time. Built for car buyers and sellers in Ontario.</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-semibold">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} CarSwipe. Demo listings use representative stock photos from Unsplash.
        </p>
      </div>
    </footer>
  );
}
