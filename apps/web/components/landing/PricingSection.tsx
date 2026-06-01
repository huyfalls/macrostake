import Link from "next/link";

const PLANS = [
  {
    name: "Lightweight",
    price: "$0",
    period: "/month",
    highlight: false,
    description: "For people who want accountability without real money.",
    features: [
      "Full food database (300k+ foods)",
      "Macro & calorie tracking",
      "Streak tracking",
      "Yearly goal setting",
      "Mobile app access",
      "Virtual penalty coins (no real money)",
    ],
    cta: "Start free",
    href: "/onboarding?plan=free",
  },
  {
    name: "Committed",
    price: "$4.99",
    period: "/month",
    highlight: true,
    description: "The full experience. Real money. Real consequences. Real results.",
    features: [
      "Everything in Lightweight",
      "Real money penalties (Stripe)",
      "Crypto staking (ETH, USDC, USDT)",
      "Automatic midnight charges",
      "Instant earn-back refunds",
      "Custom penalty amounts",
      "7 or 14-day earn-back windows",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start staking",
    href: "/onboarding?plan=committed",
  },
  {
    name: "Beast Mode",
    price: "$12.99",
    period: "/month",
    highlight: false,
    description: "For competitive athletes and serious body recomposition.",
    features: [
      "Everything in Committed",
      "Unlimited custom macros per meal",
      "Coach portal (share progress)",
      "Team challenges",
      "Group staking pools",
      "API access",
      "White-glove onboarding",
    ],
    cta: "Go beast mode",
    href: "/onboarding?plan=beast",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 border-t border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Simple Pricing</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            The subscription is cheap. The penalties are what keep you honest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlight
                  ? "bg-red-500/10 border-red-500 ring-1 ring-red-500"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              {plan.highlight && (
                <span className="inline-block mb-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white w-fit">
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-zinc-400">{plan.period}</span>
                </div>
                <p className="text-zinc-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-zinc-300">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={plan.highlight ? "btn-primary" : "btn-secondary"}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
