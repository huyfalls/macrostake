const STEPS = [
  {
    step: "01",
    title: "Set your macros & yearly goal",
    desc: "Enter your targets for calories, protein, carbs, and fat. Set a year-end goal — weight, body comp, performance, whatever drives you.",
    color: "text-red-500",
  },
  {
    step: "02",
    title: "Stake your money",
    desc: "Link a credit card or crypto wallet. Choose your punishment: $10/day flat, $10 per 200 calories over, or both. You control the stakes.",
    color: "text-orange-500",
  },
  {
    step: "03",
    title: "Log every meal",
    desc: "Search 300,000+ foods from the USDA database. Track every gram. We calculate your macros in real time and warn you before you go over.",
    color: "text-yellow-500",
  },
  {
    step: "04",
    title: "Miss a goal, pay the price",
    desc: "Day ends and you missed? Your card gets charged automatically. No mercy. No excuses. That's the whole point.",
    color: "text-red-400",
  },
  {
    step: "05",
    title: "Hit your streak, earn it back",
    desc: "Stay on track for 7 or 14 days straight and every dollar gets refunded. Perfect compliance = full earn-back. The money was never lost, just held hostage.",
    color: "text-green-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-t border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">How It Works</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Simple enough to start today. Painful enough to make you stick with it.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            {STEPS.map((step, i) => (
              <div
                key={step.step}
                className={`flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="md:w-1/2 flex justify-end md:justify-start">
                  {i % 2 === 0 ? (
                    <div className="card max-w-md">
                      <span className={`text-4xl font-black ${step.color}`}>{step.step}</span>
                      <h3 className="text-xl font-bold mt-2 mb-2">{step.title}</h3>
                      <p className="text-zinc-400">{step.desc}</p>
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}
                </div>

                {/* Center dot */}
                <div className="hidden md:flex w-4 h-4 rounded-full bg-red-500 ring-4 ring-zinc-950 flex-shrink-0 z-10" />

                <div className="md:w-1/2">
                  {i % 2 === 1 ? (
                    <div className="card max-w-md">
                      <span className={`text-4xl font-black ${step.color}`}>{step.step}</span>
                      <h3 className="text-xl font-bold mt-2 mb-2">{step.title}</h3>
                      <p className="text-zinc-400">{step.desc}</p>
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
