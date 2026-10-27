import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({
  href = "/",
  tone = "dark",
  className,
}: {
  href?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        className,
      )}
      aria-label="Belajar Mandiri"
    >
      <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white shadow-lg shadow-orange-500/20 ring-1 ring-orange-200/80 transition duration-300 group-hover:scale-105 group-hover:shadow-orange-500/30">
        <Image
          src="/belajar-mandiri-logo.png"
          alt=""
          fill
          sizes="44px"
          className="object-cover"
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          "text-lg font-extrabold tracking-tight",
          tone === "light" ? "text-white" : "text-neutral-950",
        )}
      >
        Belajar<span className="text-orange-600">Mandiri</span>
      </span>
    </Link>
  );
}
