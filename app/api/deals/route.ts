import { NextRequest, NextResponse } from "next/server";
import { searchDeals } from "@/lib/cheapshark";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? undefined;
  const upperPriceParam = searchParams.get("upperPrice");

  try {
    const deals = await searchDeals({
      title,
      pageSize: 20,
      upperPrice: upperPriceParam ? Number(upperPriceParam) : undefined,
    });
    return NextResponse.json({ deals });
  } catch (err) {
    console.error("Failed to fetch CheapShark deals:", err);
    return NextResponse.json({ error: "Failed to fetch deals right now." }, { status: 502 });
  }
}
