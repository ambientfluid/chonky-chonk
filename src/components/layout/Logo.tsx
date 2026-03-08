import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const sizeMap = {
  sm: { width: 100, height: 100 },
  md: { width: 150, height: 150 },
  lg: { width: 200, height: 200 },
} as const;

export type LogoSize = keyof typeof sizeMap;

export interface LogoProps {
  size?: LogoSize;
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const dimensions = sizeMap[size];

  return (
    <Image
      src="/images/chonky-chonk.png"
      alt="Chonky Chonk Game Bonk"
      width={dimensions.width}
      height={dimensions.height}
      className={cn("object-contain max-w-full h-auto", className)}
      priority
    />
  );
}
