/**
 * =============================================================================
 * API ENDPOINT - /api/dashboard
 * =============================================================================
 * 
 * What this file does:
 * This creates a web API endpoint that other websites or apps can call to get
 * the dashboard data in JSON format (structured, machine-readable data).
 * 
 * When someone visits http://yoursite.com/api/dashboard, this code runs and
 * returns all the dashboard data (metrics, plants, forecasts) as JSON.
 * 
 * This is useful for:
 * - Mobile apps that want to display the data
 * - Other websites that want to show this data
 * - Scripts or programs that need the data programmatically
 */

import { NextResponse } from "next/server";  // Import NextResponse to send HTTP responses
import { loadDashboardDataWithBackendFallback } from "@/lib/dashboardWithBackend";  // Import function that loads dashboard data

/**
 * GET handler - Responds to HTTP GET requests (when someone accesses the API)
 * 
 * What it does:
 * 1. Loads all dashboard data (plants, forecasts, metrics)
 * 2. Converts it to JSON format
 * 3. Sends it back to whoever called this API
 */
export async function GET() {
  // Load the dashboard data (either from backend or local CSV files as fallback)
  const payload = await loadDashboardDataWithBackendFallback();
  
  // Convert to JSON and send as HTTP response
  return NextResponse.json(payload);
}
