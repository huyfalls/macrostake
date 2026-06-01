import { NextRequest, NextResponse } from "next/server";

// This route is called by Vercel Cron at midnight UTC every day.
// It proxies to /api/penalties with the cron secret.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/penalties`,
    {
      method:  "POST",
      headers: { "x-cron-secret": process.env.CRON_SECRET! },
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
