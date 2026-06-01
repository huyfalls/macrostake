import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/dashboard/AppSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <AppSidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
