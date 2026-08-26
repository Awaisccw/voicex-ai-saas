"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

export const DashboardNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/dashboard" },
    { label: "AI Studio", href: "/#demo" },
    { label: "Billing & Plans", href: "/dashboard/settings" },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
              isActive
                ? "bg-secondary text-foreground font-semibold shadow-subtle"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ml-2"
      >
        Sign Out
      </button>
    </nav>
  );
};
