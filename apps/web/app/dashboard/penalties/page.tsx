import { requireAuth } from "@/lib/auth";
import { prisma } from "@macrostake/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Penalties" };

const STATUS_STYLES: Record<string, string> = {
  PENDING:     "bg-yellow-500/10 text-yellow-400",
  CHARGED:     "bg-red-500/10 text-red-400",
  EARNED_BACK: "bg-green-500/10 text-green-400",
  WAIVED:      "bg-zinc-500/10 text-zinc-400",
  REFUNDED:    "bg-blue-500/10 text-blue-400",
};

export default async function PenaltiesPage() {
  const user = await requireAuth();

  const [penalties, stats] = await Promise.all([
    prisma.penalty.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: "desc" },
      take:    100,
    }),
    prisma.penalty.groupBy({
      by:    ["status"],
      where: { userId: user.id },
      _sum:  { amount: true },
      _count: true,
    }),
  ]);

  const totalCharged   = stats.find((s) => s.status === "CHARGED")   ?._sum.amount ?? 0;
  const totalEarnedBack = stats.find((s) => s.status === "EARNED_BACK")?._sum.amount ?? 0;
  const totalPending   = stats.find((s) => s.status === "PENDING")   ?._sum.amount ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Penalty History</h1>
        <p className="text-zinc-500 text-sm mt-1">Every time your macros cost you money.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total charged",    value: formatCurrency(totalCharged),    color: "text-red-400" },
          { label: "Earned back",      value: formatCurrency(totalEarnedBack), color: "text-green-400" },
          { label: "Pending",          value: formatCurrency(totalPending),    color: "text-yellow-400" },
          { label: "Net cost",         value: formatCurrency(totalCharged - totalEarnedBack), color: "text-white" },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        {penalties.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-medium">No penalties yet.</p>
            <p className="text-sm mt-1">Keep it up — you&apos;re doing great.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Reason</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-right pb-3 font-medium">Amount</th>
                  <th className="text-right pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {penalties.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/20 transition">
                    <td className="py-3 pr-4 text-zinc-400">
                      {p.triggerDate ? formatDate(p.triggerDate) : formatDate(p.createdAt)}
                    </td>
                    <td className="py-3 pr-4 max-w-xs">
                      <span className="truncate block">{p.reason}</span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 text-xs">
                      {p.type.replace("_", " ")}
                    </td>
                    <td className="py-3 text-right font-bold text-red-400">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[p.status] ?? ""}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
