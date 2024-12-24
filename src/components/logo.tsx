import { cn } from "@/lib/utils";
import { DynamicImage } from "./dynamic-image";
import Link from "next/link";

export default function Logo({ width = 100, height = width, className }: { width?: number, height?: number, className?: string }) {
    return (
        <DynamicImage
            lightSrc="/letter.svg"
            darkSrc="/letter_w.svg"
            alt="Logo"
            width={width}
            height={height}
            className={cn("select-none", className)}
        />
    )
}

interface BrandProps {
  className?: string;
}

export function Brand({ className }: BrandProps) {
  return (
    <Link href="/" className={className}>
      <div className="flex items-center gap-2">
        <Logo width={32} />
        <span className="font-bold text-x select-none">Neur</span>
      </div>
    </Link>
  );
}