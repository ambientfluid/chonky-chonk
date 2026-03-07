import { cn } from "@/lib/utils/cn";

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
} as const;

const dotSizeMap = {
  sm: "h-2 w-2 border",
  md: "h-2.5 w-2.5 border-2",
  lg: "h-3 w-3 border-2",
  xl: "h-4 w-4 border-2",
} as const;

export type AvatarSize = keyof typeof sizeMap;

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  online,
  className,
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-full object-cover ring-2 ring-white",
            sizeMap[size],
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-bold text-white",
            "bg-gradient-to-br from-bubblegum-400 via-grape-400 to-lime-400",
            "ring-2 ring-white",
            sizeMap[size],
          )}
          aria-label={name}
        >
          {initials}
        </div>
      )}

      {online != null && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-white",
            online ? "bg-lime-400" : "bg-gray-300",
            dotSizeMap[size],
          )}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
