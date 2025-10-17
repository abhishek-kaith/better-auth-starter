"use client";

import Image from "next/image";
import Link from "next/link";
import UserActions from "@/components/layout/user-actions";
import { siteConfig } from "@/lib/config";
import { PATHS } from "@/lib/path";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href={PATHS.home} className="flex items-center gap-2 mr-6">
          <Image
            src={siteConfig.logo}
            height={32}
            width={32}
            className="h-8 w-8"
            alt={siteConfig.name}
          />
          <span className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <UserActions />
        </div>
      </div>
    </header>
  );
}
