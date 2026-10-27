import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5"
      aria-label="Belajar Mandiri"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-neutral-950">
        Belajar<span className="text-orange-600">Mandiri</span>
      </span>
    </Link>
  );
}
