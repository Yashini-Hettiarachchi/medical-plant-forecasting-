"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import SriLankaMap from "@/components/sri-lanka-map";
import type { DashboardPayload } from "@/lib/dashboard";

type DashboardClientProps = {
  dashboard: DashboardPayload;
};

// District keyword mappings for filtering
const districtKeywords: Record<string, string[]> = {
  "Colombo": ["colombo", "western"],
  "Gampaha": ["gampaha", "western"],
  "Kalutara": ["kalutara", "western"],
  "Kandy": ["kandy", "central", "upcountry"],
  "Matara": ["matara", "southern", "south"],
  "Galle": ["galle", "southern", "south"],
  "Jaffna": ["jaffna", "northern"],
  "Mullaitivu": ["mullaitivu", "eastern"],
  "Trincomalee": ["trincomalee", "eastern"],
  "Batticaloa": ["batticaloa", "eastern"],
  "Ampara": ["ampara", "eastern"],
  "Anuradhapura": ["anuradhapura", "north central", "dry"],
  "Polonnaruwa": ["polonnaruwa", "north central", "dry"],
  "Kurunegala": ["kurunegala", "north western", "intermediate"],
  "Kegalle": ["kegalle", "central"],
  "Nuwara Eliya": ["nuwara eliya", "upcountry", "central"],
  "Badulla": ["badulla", "upcountry", "eastern"],
  "Monaragala": ["monaragala", "eastern", "dry"],
  "Ratnapura": ["ratnapura", "sabaragamuwa", "wet"],
  "Puttalam": ["puttalam", "north western", "dry"],
};

function getRowDistrict(habitat: string): string | null {
  const normalized = habitat.toLowerCase();
  for (const [district, keywords] of Object.entries(districtKeywords)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return district;
    }
  }
  return null;
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("suitable") && !normalized.includes("un")) {
    return "bg-emerald-400/15 text-emerald-200 border-emerald-300/20";
  }
  if (normalized.includes("stable")) {
    return "bg-cyan-400/15 text-cyan-200 border-cyan-300/20";
  }
  if (normalized.includes("likely")) {
    return "bg-amber-300/15 text-amber-100 border-amber-200/20";
  }
  if (normalized.includes("unsuitable") || normalized.includes("not")) {
    return "bg-rose-400/15 text-rose-100 border-rose-300/20";
  }
  return "bg-slate-400/15 text-slate-100 border-slate-300/20";
}

export default function DashboardClient({ dashboard }: DashboardClientProps) {
  const [plantQuery, setPlantQuery] = useState("");
  const [habitatFilter, setHabitatFilter] = useState("All habitats");
  const [statusFilter, setStatusFilter] = useState("All status groups");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const medicinalPlants = dashboard.medicinalPlants ?? dashboard.samplePlants.map((item) => ({
    scientificName: item.scientificName,
    sinhalaName: item.sinhalaName,
    habitats: [],
    habitatCount: item.habitatCount,
  }));

  const habitatOptions = useMemo(() => {
    const values = new Set<string>();
    medicinalPlants.forEach((plant) => {
      plant.habitats.forEach((habitat) => values.add(habitat));
    });
    return ["All habitats", ...Array.from(values).sort((left, right) => left.localeCompare(right))];
  }, [medicinalPlants]);

  const statusOptions = useMemo(
    () => ["All status groups", ...dashboard.suitabilitySummary.map((item) => item.status)],
    [dashboard.suitabilitySummary],
  );

  const filteredPlants = useMemo(() => {
    const query = plantQuery.trim().toLowerCase();

    return medicinalPlants.filter((plant) => {
      const matchesQuery =
        query.length === 0 ||
        plant.scientificName.toLowerCase().includes(query) ||
        plant.sinhalaName.toLowerCase().includes(query) ||
        plant.habitats.some((habitat) => habitat.toLowerCase().includes(query));

      const matchesHabitat =
        habitatFilter === "All habitats" || plant.habitats.includes(habitatFilter);

      const matchesDistrict =
        selectedDistrict === null ||
        plant.habitats.some((habitat) => getRowDistrict(habitat) === selectedDistrict);

      return matchesQuery && matchesHabitat && matchesDistrict;
    });
  }, [habitatFilter, medicinalPlants, plantQuery, selectedDistrict]);

  const filteredForecastRows = useMemo(() => {
    return dashboard.forecastRows.filter((row) => {
      const matchesStatus = statusFilter === "All status groups" || row.status === statusFilter;
      const matchesDistrict =
        selectedDistrict === null || getRowDistrict(row.habitatRegion) === selectedDistrict;
      return matchesStatus && matchesDistrict;
    });
  }, [dashboard.forecastRows, statusFilter, selectedDistrict]);

  const suitabilityTotal = dashboard.suitabilitySummary.reduce((sum, current) => sum + current.count, 0);

  return (
    <main className="dashboard-shell min-h-screen text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="glass-panel fade-in rounded-4xl p-8 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">HerbHeal Research</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Medicinal plant lookup with climate suitability guidance.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                Built for medical students and clinicians to quickly search plants, review Sinhala names,
                and understand where future climate conditions are favorable.
              </p>
            </div>
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

        <section className="glass-panel rounded-4xl p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.26em] text-cyan-200/70">How to read this dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Medical interpretation guide</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <h3 className="text-lg font-semibold text-white">Suitability rows</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Each row is one year-region forecast entry with precipitation and a climate fitness label.
                Total rows: {dashboard.forecastRows.length}.
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <h3 className="text-lg font-semibold text-white">Medicinal plants</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                The catalog includes all plants from the cleaned Sinhala medicinal dataset. Use scientific,
                Sinhala, or habitat keywords to search.
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <h3 className="text-lg font-semibold text-white">Status groups</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Grouped labels summarize climate favorability classes such as Suitable, Likely Suitable,
                Stable, or Unsuitable.
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <article className="glass-panel rounded-4xl p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-sky-200/70">Suitability</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Status group distribution</h2>
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
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusTone(habitat.status)}`}>
                      {habitat.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <div className="grid grid-cols-2 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-400 sm:grid-cols-4">
                <span>Status group</span>
                <span className="text-right sm:text-left">Rows</span>
                <span className="hidden sm:block">Share</span>
                <span className="hidden sm:block">Visual</span>
              </div>
              <div className="divide-y divide-white/10">
                {dashboard.suitabilitySummary.map((item) => {
                  const share = suitabilityTotal === 0 ? 0 : Math.round((item.count / suitabilityTotal) * 100);

                  return (
                    <div key={item.status} className="grid grid-cols-2 items-center gap-4 px-5 py-4 sm:grid-cols-4">
                      <span className="font-medium text-white">{item.status}</span>
                      <span className="text-right text-slate-200 sm:text-left">{item.count}</span>
                      <span className="hidden text-slate-300 sm:block">{share}%</span>
                      <span className="hidden sm:block">
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-linear-to-r from-cyan-300 to-emerald-300"
                            style={{ width: `${Math.max(share, 4)}%` }}
                          />
                        </div>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-4xl p-6 md:p-8">
            <p className="text-sm uppercase tracking-[0.26em] text-cyan-200/70">Forecast accuracy</p>
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
              Use status groups for prioritization: suitable classes highlight areas where plant availability
              is expected to remain stronger under projected climate conditions.
            </div>
          </article>
        </section>

        <section className="glass-panel rounded-4xl p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-sky-200/70">2030 geo view</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Sri Lanka medicinal plant forecast map</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Click a district to focus medicinal plants and suitability rows on that region. This map displays 
                the dominant 2030 climate suitability forecast for each district's forecasted medicinal plant growth conditions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDistrict(null)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
            >
              Clear selection
            </button>
          </div>

          <div className="mt-6">
            <SriLankaMap 
              dashboard={dashboard} 
              selectedZone={selectedDistrict} 
              onZoneSelect={setSelectedDistrict} 
            />
          </div>
        </section>

        <section className="glass-panel rounded-4xl p-6 md:p-8" id="forecast-table">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-sky-200/70">Medicinal plant catalog</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">All medicinal plants</h2>
            </div>
            <p className="text-sm text-slate-400">Showing {filteredPlants.length} of {medicinalPlants.length} plants</p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            <label className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Search plants</span>
              <input
                type="text"
                value={plantQuery}
                onChange={(event) => setPlantQuery(event.target.value)}
                placeholder="Scientific name, Sinhala name, or habitat"
                className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>

            <label className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Filter by habitat</span>
              <select
                value={habitatFilter}
                onChange={(event) => setHabitatFilter(event.target.value)}
                className="mt-2 w-full bg-transparent text-sm text-white outline-none"
              >
                {habitatOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900 text-white">
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Filter by district</span>
              <select
                value={selectedDistrict ?? "All"}
                onChange={(event) => setSelectedDistrict(event.target.value === "All" ? null : event.target.value)}
                className="mt-2 w-full bg-transparent text-sm text-white outline-none"
              >
                <option value="All" className="bg-slate-900 text-white">
                  All districts
                </option>
                {Object.keys(districtKeywords)
                  .sort()
                  .map((district) => (
                    <option key={district} value={district} className="bg-slate-900 text-white">
                      {district}
                    </option>
                  ))}
              </select>
            </label>

            <label className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Filter suitability rows</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 w-full bg-transparent text-sm text-white outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900 text-white">
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-12 gap-4 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="col-span-4">Scientific name</span>
              <span className="col-span-3">Sinhala name</span>
              <span className="col-span-3">Habitats</span>
              <span className="col-span-2 text-right">Count</span>
            </div>
            <div className="max-h-130 divide-y divide-white/10 overflow-auto">
              {filteredPlants.map((plant, index) => (
                <div key={`${plant.scientificName}-${plant.sinhalaName}-${plant.habitats.join(',')}-${index}`} className="grid grid-cols-12 gap-4 px-5 py-4 text-sm">
                  <span className="col-span-4 font-medium text-white">{plant.scientificName}</span>
                  <span className="col-span-3 text-slate-300">{plant.sinhalaName || "-"}</span>
                  <span className="col-span-3 text-slate-300">{plant.habitats.join(", ") || "-"}</span>
                  <span className="col-span-2 text-right text-slate-300">{plant.habitatCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-12 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="col-span-2">Year</span>
              <span className="col-span-4">Habitat region</span>
              <span className="col-span-2 text-right">Precip</span>
              <span className="col-span-2 text-right">Species</span>
              <span className="col-span-2 text-right">Status</span>
            </div>
            <div className="max-h-120 divide-y divide-white/10 overflow-auto">
              {filteredForecastRows.map((row, index) => (
                <div
                  key={`${row.year}-${row.habitatRegion}-${row.status}-${row.avgDailyPrecip}-${index}`}
                  className="grid grid-cols-12 gap-4 px-5 py-4 text-sm"
                >
                  <span className="col-span-2 font-medium text-white">{row.year}</span>
                  <span className="col-span-4 text-slate-300">{row.habitatRegion}</span>
                  <span className="col-span-2 text-right text-slate-300">{row.avgDailyPrecip}</span>
                  <span className="col-span-2 text-right text-slate-300">{row.plantSpeciesCount}</span>
                  <span className="col-span-2 text-right text-slate-200">{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
