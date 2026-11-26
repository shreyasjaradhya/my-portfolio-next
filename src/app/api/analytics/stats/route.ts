import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/supabase/adminAuth";
import { getAnalyticsDashboardData } from "@/lib/supabase/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Authenticate admin
    await requireAdminAuth();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const safeDays = Math.min(Math.max(isNaN(days) ? 30 : days, 7), 90);

    const data = await getAnalyticsDashboardData(safeDays);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 401 });
  }
}
