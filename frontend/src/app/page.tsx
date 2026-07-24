import DashboardClient from "@/app/dashboard-client";
import { loadDashboardDataWithBackendFallback } from "@/lib/dashboardWithBackend";

export default async function Home() {
  const dashboard = await loadDashboardDataWithBackendFallback();

  return <DashboardClient dashboard={dashboard} />;
}

