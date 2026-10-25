import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UserAvatar({ name, image, className }: { name: string | null | undefined; image?: string | null; className?: string }) {
  return (
    <Avatar className={cn("size-9", className)}>
      {image && <AvatarImage src={image} alt="" />}
      <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
