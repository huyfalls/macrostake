"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",          label: "Today",       icon: "📊" },
  { href: "/dashboard/food",     label: "Log Food",    icon: "🍽️" },
  { href: "/dashboard/goals",    label: "Goals",       icon: "🎯" },
  { href: "/dashboard/penalties",label: "Penalties",   icon: "💸" },
  { href: "/dashboard/progress", label: "Progress",    icon: "📈" },
  { href: "/dashboard/settings", label: "Settings",    icon: "⚙️" },
];

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function AppSidebar({ user }: Props) {
  const path = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 border-r border-zinc-800 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 font-black text-white text-sm">
          M
        </div>
        <span className="font-black text-base">
          Macro<span className="text-red-500">Stake</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition mb-1",
              path === item.href
                ? "bg-zinc-800 text-white"
                : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-sm font-bold text-red-400 flex-shrink-0">
            {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">{user.name ?? "User"}</div>
            <div className="text-xs text-zinc-500 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full btn-ghost text-xs py-1.5"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
