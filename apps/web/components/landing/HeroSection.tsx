"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const TICKER_ITEMS = [
  { name: "Alex M.", penalty: "$20", reason: "550 cal over" },
  { name: "Sarah K.", penalty: "$10", reason: "Missed protein" },
  { name: "Jordan R.", earned: "$30", reason: "7-day streak!" },
  { name: "Mike T.", penalty: "$20", reason: "Daily miss" },
  { name: "Emma L.", earned: "$20", reason: "14-day streak!" },
];

export function HeroSection() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TICKER_ITEMS.length), 2500);
    return () => clearInterval(t);
  }, []);

  const current = TICKER_ITEMS[idx];

  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[600px] bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute right-0 top-1/4 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-36">
        <div className="text-center">
          {/* Live ticker */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-1.5 text-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-zinc-400">Live —</span>
            <span className="font-medium">
              {current.name}{" "}
              {current.penalty ? (
                <span className="text-red-400">lost {current.penalty}</span>
              ) : (
                <span className="text-green-400">earned back {current.earned}</span>
              )}
              {" "}· {current.reason}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            Put Your Money
            <br />
            <span className="text-red-500">Where Your Mouth Is.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-zinc-400 mb-10">
            MacroStake charges you real money when you miss your macro goals.
            Hit your streak and earn it all back. Reach your yearly goal or face the consequences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/onboarding" className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
              Start staking for free
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
              See how it works
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
            {[
              { label: "Foods in database",    value: "300,000+" },
              { label: "Avg. compliance rate", value: "89%" },
              { label: "Total earned back",    value: "$1.2M+" },
              { label: "Active users",         value: "12,400" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
