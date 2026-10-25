import { Compass, Flame, Heart, MessageCircle, PlusCircle, type LucideIcon } from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon; countKey?: "messages" };

export const PRIMARY_NAV: NavLink[] = [
  { href: "/swipe", label: "Swipe", icon: Flame },
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/saved", label: "Garage", icon: Heart },
  { href: "/messages", label: "Messages", icon: MessageCircle, countKey: "messages" },
];

export const SELL_LINK: NavLink = { href: "/sell", label: "Sell", icon: PlusCircle };

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
