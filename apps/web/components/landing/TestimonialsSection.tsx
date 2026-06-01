const TESTIMONIALS = [
  {
    name: "Alex Morrison",
    handle: "@alexm_lifts",
    avatar: "AM",
    text: "Lost 23 lbs in 4 months. The $10/day penalty isn't much but knowing it's coming makes me think twice before the 11pm snack. Already earned $140 back from my streaks.",
    stats: "Lost $80 in penalties, earned back $140",
  },
  {
    name: "Sarah Kwon",
    handle: "@sarahkwon_fit",
    avatar: "SK",
    text: "I've tried every tracking app. Nothing worked until real money was on the line. Now I'm obsessed with hitting my protein goal every single day.",
    stats: "87-day streak, $0 in penalties last 3 months",
  },
  {
    name: "Jordan Rivera",
    handle: "@jrivera_athlete",
    avatar: "JR",
    text: "Used the crypto staking with USDC on Base. The whole system is slick. Missed 3 days in January, lost $30, haven't missed since. Worth every penny.",
    stats: "Staked 50 USDC, earned back 30 USDC",
  },
  {
    name: "Mike Thompson",
    handle: "@mikethompson_pd",
    avatar: "MT",
    text: "Set a 200lb goal by December. MacroStake has me dialed in on protein every week. The yearly goal chart showing 71% progress is genuinely motivating.",
    stats: "On track for yearly goal, down 18 lbs",
  },
  {
    name: "Emma Larsson",
    handle: "@emmalarsson_rd",
    avatar: "EL",
    text: "As a registered dietitian I was skeptical but the USDA food data is rock solid. My clients who use this are seeing real behavioral change.",
    stats: "Registered Dietitian, 15+ clients using MacroStake",
  },
  {
    name: "Tyler Chen",
    handle: "@tylerchen_bb",
    avatar: "TC",
    text: "Bulking season just hit different when every calorie matters financially. I'm actually eating enough protein for once in my life.",
    stats: "Gained 8 lbs lean mass in 12 weeks",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 border-t border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">People Who Paid to Prove It</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            When your wallet is involved, you stop lying to yourself.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card break-inside-avoid">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-sm flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-zinc-500 text-xs">{t.handle}</div>
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-3">{t.stats}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
