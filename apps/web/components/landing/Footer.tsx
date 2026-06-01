import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 font-black text-white">
                M
              </div>
              <span className="text-lg font-black">
                Macro<span className="text-red-500">Stake</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs">
              The only fitness app that charges you for failing. Food data powered by USDA FoodData Central.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-semibold mb-3 text-zinc-400">Product</div>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-zinc-500 hover:text-white transition">Dashboard</Link>
                <Link href="#features" className="block text-zinc-500 hover:text-white transition">Features</Link>
                <Link href="#pricing" className="block text-zinc-500 hover:text-white transition">Pricing</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-3 text-zinc-400">Legal</div>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-zinc-500 hover:text-white transition">Privacy</Link>
                <Link href="/terms" className="block text-zinc-500 hover:text-white transition">Terms</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-3 text-zinc-400">Support</div>
              <div className="space-y-2">
                <a href="mailto:support@macrostake.app" className="block text-zinc-500 hover:text-white transition">Contact</a>
                <Link href="/faq" className="block text-zinc-500 hover:text-white transition">FAQ</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} MacroStake. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Food data from{" "}
            <a href="https://fdc.nal.usda.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-400">
              USDA FoodData Central
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
