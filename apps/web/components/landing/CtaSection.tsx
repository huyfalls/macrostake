import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-24 border-t border-zinc-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-red-500/20 via-zinc-900 to-zinc-900 border border-red-500/30 p-12 md:p-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Ready to stop<br />
            <span className="text-red-500">lying to yourself?</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
            Set up in 5 minutes. Log your first meal today.
            If you don&apos;t hit your macros tonight, you owe $10.
            Simple as that.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="btn-primary text-base px-10 py-4 w-full sm:w-auto">
              Start staking — it&apos;s free to try
            </Link>
            <Link href="/dashboard" className="btn-ghost text-base w-full sm:w-auto">
              See the dashboard →
            </Link>
          </div>
          <p className="mt-6 text-xs text-zinc-600">
            No credit card required for free plan. Real money penalties only on Committed plan.
          </p>
        </div>
      </div>
    </section>
  );
}
