import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/server/auth";
import { getSavedIds } from "@/server/services/saved";
import { AppProviders } from "@/components/providers/app-providers";
import type { Viewer } from "@/types/viewer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CarSwipe — Find your next ride, one swipe at a time", template: "%s · CarSwipe" },
  description: "Swipe through cars for sale near you. Save the ones you love, compare them side by side and message sellers directly.",
  applicationName: "CarSwipe",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0b10" },
  ],
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const user = session?.user;
  const viewer: Viewer | null = user?.id
    ? { id: user.id, name: user.name ?? null, email: user.email ?? null, image: user.image ?? null }
    : null;
  const savedIds = viewer ? await getSavedIds(viewer.id) : [];

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card">
          Skip to content
        </a>
        <AppProviders viewer={viewer} savedIds={savedIds}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
