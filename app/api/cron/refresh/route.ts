import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Hit daily by Vercel Cron (see vercel.json). Force-refreshes the cached pages
// that display live prices so the site is guaranteed current every morning,
// on top of the hourly ISR revalidation already set on those pages.
//
// Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` when
// CRON_SECRET is set in your project env, so nobody else can trigger this.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/deals");

  return NextResponse.json({
    revalidated: ["/", "/deals"],
    at: new Date().toISOString(),
  });
}
