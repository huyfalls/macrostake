"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export function Navbar({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 font-black text-white text-lg">
              M
            </div>
            <span className="text-xl font-black tracking-tight">
              Macro<span className="text-red-500">Stake</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition">
              How It Works
            </Link>
            <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-secondary py-2 text-sm">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="btn-ghost text-sm">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => signIn()} className="btn-ghost text-sm">
                  Sign in
                </button>
                <Link href="/onboarding" className="btn-primary py-2 text-sm">
                  Start staking
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
