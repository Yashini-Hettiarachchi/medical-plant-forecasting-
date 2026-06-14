import Link from "next/link";

import { loadDashboardDataWithBackendFallback } from "@/lib/dashboardWithBackend";

export default async function Home() {
  const dashboard = await loadDashboardDataWithBackendFallback();

  return (
    <main className="dashboard-shell min-h-screen text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="glass-panel fade-in rounded-[2rem] p-8 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">
                HerbHeal Research
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Climate forecasting and medicinal plant suitability in one dashboard.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                This Next.js frontend reads the forecasting outputs produced by the Python
                pipeline and can proxy to a live backend through a single API contract.
              </p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
              <div className="flex items-center justify-between gap-6">
                <span>Data source</span>
                <span className="font-medium text-emerald-300">{dashboard.source}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span>Backend</span>
                <span className="font-medium text-sky-300">
                  {dashboard.backendBaseUrl ?? "local fallback"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span>API route</span>
                <span className="font-medium text-white">/api/dashboard</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Forecast metrics
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Plant catalog
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Habitat suitability 2026-2030
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Backend-ready proxy
            </span>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((metric) => (
            <article key={metric.label} className="glass-panel rounded-3xl p-6 fade-in">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-200/70">{metric.label}</p>
              <div className="mt-3 text-4xl font-semibold text-white">{metric.value}</div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{metric.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <article className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-sky-200/70">Suitability</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Habitat outcome snapshot
                </h2>
              </div>
              <Link
                href="#forecast-table"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Jump to rows
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {dashboard.topHabitats.map((habitat) => (
                <div key={habitat.habitatRegion} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-sm text-slate-300">{habitat.habitatRegion}</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <span className="text-3xl font-semibold text-white">{habitat.count}</span>
                    <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
                      {habitat.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <div className="grid grid-cols-2 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-400 sm:grid-cols-4">
                <span>Status</span>
                <span className="text-right sm:text-left">Count</span>
                <span className="hidden sm:block">Share</span>
                <span className="hidden sm:block">Visual</span>
              </div>
              <div className="divide-y divide-white/10">
                {dashboard.suitabilitySummary.map((item, index) => {
                  const total = dashboard.suitabilitySummary.reduce((sum, current) => sum + current.count, 0);
                  const share = total === 0 ? 0 : Math.round((item.count / total) * 100);

                  return (
                    <div key={item.status} className="grid grid-cols-2 items-center gap-4 px-5 py-4 sm:grid-cols-4">
                      <span className="font-medium text-white">{item.status}</span>
                      <span className="text-right text-slate-200 sm:text-left">{item.count}</span>
                      <span className="hidden text-slate-300 sm:block">{share}%</span>
                      <span className="hidden sm:block">
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                            style={{ width: `${Math.max(share, index === 0 ? 20 : 8)}%` }}
                          />
                        </div>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-[2rem] p-6 md:p-8">
            <p className="text-sm uppercase tracking-[0.26em] text-cyan-200/70">
              Forecast accuracy
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Model signals</h2>
            <div className="mt-6 space-y-4">
              {dashboard.accuracySummary.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-sm text-slate-300">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-cyan-400/5 p-5 text-sm leading-7 text-slate-200">
              The app uses a proxy-friendly API shape. Point `BACKEND_BASE_URL` to your Python
              service once it exposes a JSON endpoint, and the UI will switch away from the
              local CSV fallback automatically.
            </div>
          </article>
        </section>

        <section className="glass-panel rounded-[2rem] p-6 md:p-8" id="forecast-table">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-sky-200/70">Plant catalog</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Sample medicinal plants</h2>
            </div>
            <p className="text-sm text-slate-400">First six records from the cleaned dataset</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-12 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="col-span-6">Scientific name</span>
              <span className="col-span-4">Sinhala name</span>
              <span className="col-span-2 text-right">Habitats</span>
            </div>
            <div className="divide-y divide-white/10">
              {dashboard.samplePlants.map((plant) => (
                <div key={plant.scientificName} className="grid grid-cols-12 gap-4 px-5 py-4 text-sm">
                  <span className="col-span-6 font-medium text-white">{plant.scientificName}</span>
                  <span className="col-span-4 text-slate-300">{plant.sinhalaName}</span>
                  <span className="col-span-2 text-right text-slate-300">{plant.habitatCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-12 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="col-span-2">Year</span>
              <span className="col-span-5">Habitat region</span>
              <span className="col-span-2 text-right">Precip</span>
              <span className="col-span-3 text-right">Status</span>
            </div>
            <div className="divide-y divide-white/10">
              {dashboard.forecastRows.map((row) => (
                <div key={`${row.year}-${row.habitatRegion}`} className="grid grid-cols-12 gap-4 px-5 py-4 text-sm">
                  <span className="col-span-2 font-medium text-white">{row.year}</span>
                  <span className="col-span-5 text-slate-300">{row.habitatRegion}</span>
                  <span className="col-span-2 text-right text-slate-300">{row.avgDailyPrecip}</span>
                  <span className="col-span-3 text-right text-slate-200">{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
