import { NextResponse } from "next/server";
import { loadDashboardDataWithBackendFallback } from "@/lib/dashboardWithBackend";

export async function GET() {
  const payload = await loadDashboardDataWithBackendFallback();
  return NextResponse.json(payload);
}
