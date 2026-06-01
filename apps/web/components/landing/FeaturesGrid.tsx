const FEATURES = [
  {
    icon: "🥩",
    title: "300,000+ Foods",
    desc: "Complete USDA FoodData Central database. Every brand, every ingredient. Search by name, barcode, or category.",
  },
  {
    icon: "📊",
    title: "Full Macro Breakdown",
    desc: "Calories, protein, carbs, fat, fiber, sodium, sugar, vitamins — every logged food shows the complete picture.",
  },
  {
    icon: "💳",
    title: "Stripe Payments",
    desc: "Secure card payments via Stripe. Penalties are charged automatically at midnight. Refunds are instant when you earn back.",
  },
  {
    icon: "🔗",
    title: "Crypto Staking",
    desc: "Prefer crypto? Connect your wallet and stake USDC, USDT, or ETH on Ethereum, Polygon, or Base.",
  },
  {
    icon: "🔥",
    title: "Streak System",
    desc: "7 or 14 consecutive on-track days earns back your most recent penalty. Choose your earn-back window.",
  },
  {
    icon: "🎯",
    title: "Yearly Goals",
    desc: "Set a body transformation goal for the year. Track progress monthly. The app calculates if you're on pace.",
  },
  {
    icon: "⚡",
    title: "Real-Time Warnings",
    desc: "As you log meals, we show how much buffer you have left before triggering a penalty. Never be surprised.",
  },
  {
    icon: "📱",
    title: "iOS & Android App",
    desc: "Full-featured mobile app for logging on the go. Scan barcodes, voice log, quick-add recent foods.",
  },
  {
    icon: "📅",
    title: "Calendar View",
    desc: "Green days = on track. Red days = penalty. See your month at a glance and spot patterns in your compliance.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 border-t border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Everything You Need</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Built for people who are serious about results, not people who want another streak-counter app.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card hover:border-zinc-600 transition-colors group cursor-default"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-red-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
