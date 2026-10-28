"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

function BackLinkIndicator() {
  const { pending } = useLinkStatus();
  return pending ? (
    <LoaderCircle className="size-4 shrink-0 animate-spin" />
  ) : (
    <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
  );
}

export function BackLink({
  href,
  children,
  accent = "orange",
  className = "",
}: {
  href: string;
  children: ReactNode;
  accent?: "orange" | "blue";
  className?: string;
}) {
  const hoverColor =
    accent === "blue" ? "hover:text-blue-700" : "hover:text-orange-600";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors ${hoverColor} ${className}`}
    >
      <BackLinkIndicator />
      <span>{children}</span>
    </Link>
  );
}
