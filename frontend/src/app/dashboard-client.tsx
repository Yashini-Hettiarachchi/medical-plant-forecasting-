"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { DashboardPayload } from "@/lib/dashboard";

type DashboardClientProps = {
  dashboard: DashboardPayload;
};

type ZoneKey = "wet" | "intermediate" | "dry" | "upcountry" | "coastal" | "arid";

type ZoneDefinition = {
  key: ZoneKey;
  label: string;
  keywords: string[];
  lon: number;
  lat: number;
};

type Ring = Array<[number, number]>;

type SriLankaGeoJson = {
  features: Array<{
    geometry: {
      type: "Polygon" | "MultiPolygon";
      coordinates: number[][][] | number[][][][];
    };
  }>;
};

const zoneDefinitions: ZoneDefinition[] = [
  { key: "upcountry", label: "Upcountry", keywords: ["upcountry", "montane", "highland"], lon: 80.7, lat: 7.2 },
  { key: "wet", label: "Wet", keywords: ["wet", "rainforest", "marsh", "lowland"], lon: 79.95, lat: 6.95 },
  { key: "intermediate", label: "Intermediate", keywords: ["intermediate"], lon: 80.45, lat: 7.55 },
  { key: "dry", label: "Dry", keywords: ["dry", "tank", "scrub", "grassland"], lon: 80.75, lat: 8.25 },
  { key: "coastal", label: "Coastal", keywords: ["coastal", "lagoon", "mangrove", "estuar", "saline"], lon: 80.4, lat: 6.1 },
  { key: "arid", label: "Arid", keywords: ["arid"], lon: 79.95, lat: 8.95 },
];

function extractRings(geo: SriLankaGeoJson): Ring[] {
  const rings: Ring[] = [];

  geo.features.forEach((feature) => {
    const geometry = feature.geometry;

    if (geometry.type === "Polygon") {
      const polygonRings = geometry.coordinates as number[][][];
      polygonRings.forEach((ring) => {
        rings.push(ring.map((point) => [point[0], point[1]] as [number, number]));
      });
      return;
    }

    const multipolygon = geometry.coordinates as number[][][][];
    multipolygon.forEach((polygon) => {
      polygon.forEach((ring) => {
        rings.push(ring.map((point) => [point[0], point[1]] as [number, number]));
      });
    });
  });

  return rings;
}

function getRowZone(habitat: string): ZoneKey | null {
  const normalized = habitat.toLowerCase();
  const zone = zoneDefinitions.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return zone?.key ?? null;
}

function statusFill(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("suitable") && !normalized.includes("un")) {
    return "#10b981";
  }
  if (normalized.includes("stable")) {
    return "#06b6d4";
  }
  if (normalized.includes("likely")) {
    return "#f59e0b";
  }
  if (normalized.includes("unsuitable") || normalized.includes("not")) {
    return "#f43f5e";
  }
  return "#94a3b8";
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
  const [zoneFilter, setZoneFilter] = useState<ZoneKey | "all">("all");
  const [mapRings, setMapRings] = useState<Ring[]>([]);

  useEffect(() => {
    let active = true;

    async function loadMap() {
      try {
        const response = await fetch("/maps/sri-lanka.geo.json", { cache: "force-cache" });
        if (!response.ok) {
          return;
        }

        const geo = (await response.json()) as SriLankaGeoJson;
        if (active) {
          setMapRings(extractRings(geo));
        }
      } catch {
        // Fallback is handled by using empty ring data.
      }
    }

    loadMap();

    return () => {
      active = false;
    };
  }, []);

  const mapViewBox = { width: 260, height: 320, padding: 12 };

  const mapBounds = useMemo(() => {
    if (mapRings.length === 0) {
      return null;
    }

    const points = mapRings.flat();
    const longitudes = points.map((point) => point[0]);
    const latitudes = points.map((point) => point[1]);

    return {
      minLon: Math.min(...longitudes),
      maxLon: Math.max(...longitudes),
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
    };
  }, [mapRings]);

  const projectPoint = (lon: number, lat: number) => {
    if (!mapBounds) {
      return { x: mapViewBox.width / 2, y: mapViewBox.height / 2 };
    }

    const innerWidth = mapViewBox.width - mapViewBox.padding * 2;
    const innerHeight = mapViewBox.height - mapViewBox.padding * 2;
    const x =
      mapViewBox.padding +
      ((lon - mapBounds.minLon) / Math.max(mapBounds.maxLon - mapBounds.minLon, 0.001)) * innerWidth;
    const y =
      mapViewBox.padding +
      (1 - (lat - mapBounds.minLat) / Math.max(mapBounds.maxLat - mapBounds.minLat, 0.001)) * innerHeight;

    return { x, y };
  };

  const mapPaths = useMemo(() => {
    return mapRings.map((ring) => {
      const commands = ring.map((point, index) => {
        const projected = projectPoint(point[0], point[1]);
        return `${index === 0 ? "M" : "L"} ${projected.x.toFixed(2)} ${projected.y.toFixed(2)}`;
      });
      return `${commands.join(" ")} Z`;
    });
  }, [mapRings, mapBounds]);

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

  const rows2030 = useMemo(
    () => dashboard.forecastRows.filter((row) => row.year === 2030),
    [dashboard.forecastRows],
  );

  const mapZones = useMemo(() => {
    const summaries = zoneDefinitions.map((zone) => {
      const matchingRows = rows2030.filter((row) => getRowZone(row.habitatRegion) === zone.key);
      const rowCount = matchingRows.length;
      const speciesCount = matchingRows.reduce((sum, row) => sum + row.plantSpeciesCount, 0);
      const statusCount = matchingRows.reduce<Record<string, number>>((accumulator, row) => {
        accumulator[row.status] = (accumulator[row.status] ?? 0) + 1;
        return accumulator;
      }, {});
      const dominantStatus = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No data";

      return {
        ...zone,
        rowCount,
        speciesCount,
        dominantStatus,
      };
    });

    return summaries;
  }, [rows2030]);

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

      const matchesZone =
        zoneFilter === "all" ||
        plant.habitats.some((habitat) => getRowZone(habitat) === zoneFilter);

      return matchesQuery && matchesHabitat && matchesZone;
    });
  }, [habitatFilter, medicinalPlants, plantQuery, zoneFilter]);

  const filteredForecastRows = useMemo(() => {
    return dashboard.forecastRows.filter((row) => {
      const matchesStatus = statusFilter === "All status groups" || row.status === statusFilter;
      const matchesZone = zoneFilter === "all" || getRowZone(row.habitatRegion) === zoneFilter;
      return matchesStatus && matchesZone;
    });
  }, [dashboard.forecastRows, statusFilter, zoneFilter]);

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
              <h2 className="mt-2 text-2xl font-semibold text-white">Sri Lanka prediction map</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Click a zone to focus plant and suitability tables on that geography. This map summarizes
                forecasted 2030 climate suitability by dominant status and plant species signals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setZoneFilter("all")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
            >
              Show all zones
            </button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
              <svg
                viewBox={`0 0 ${mapViewBox.width} ${mapViewBox.height}`}
                role="img"
                aria-label="Sri Lanka suitability map for 2030"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient id="islandTone" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#155e75" />
                    <stop offset="100%" stopColor="#083344" />
                  </linearGradient>
                </defs>
                {mapPaths.map((pathValue, index) => (
                  <path
                    key={`lka-shape-${index}`}
                    d={pathValue}
                    fill="url(#islandTone)"
                    stroke="#67e8f9"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                  />
                ))}
                {mapZones.map((zone) => (
                  <g key={zone.key}>
                    {(() => {
                      const projected = projectPoint(zone.lon, zone.lat);
                      return (
                    <circle
                      cx={projected.x}
                      cy={projected.y}
                      r={zoneFilter === zone.key ? 22 : 18}
                      fill={statusFill(zone.dominantStatus)}
                      fillOpacity={zoneFilter === zone.key ? 0.95 : 0.8}
                      stroke="#e0f2fe"
                      strokeOpacity="0.6"
                      strokeWidth="1.5"
                      className="cursor-pointer transition"
                      onClick={() => setZoneFilter(zone.key)}
                    />
                      );
                    })()}
                    {(() => {
                      const projected = projectPoint(zone.lon, zone.lat);
                      return (
                    <text
                      x={projected.x}
                      y={projected.y + 4}
                      textAnchor="middle"
                      fill="#ecfeff"
                      fontSize="8"
                      className="pointer-events-none"
                    >
                      {zone.label}
                    </text>
                      );
                    })()}
                  </g>
                ))}
              </svg>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {mapZones.map((zone) => (
                <button
                  type="button"
                  key={zone.key}
                  onClick={() => setZoneFilter(zone.key)}
                  className={`rounded-3xl border p-4 text-left transition hover:bg-white/10 ${
                    zoneFilter === zone.key ? "border-cyan-200/60 bg-cyan-300/10" : "border-white/10 bg-slate-950/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-white">{zone.label}</p>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusTone(zone.dominantStatus)}`}>
                      {zone.dominantStatus}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">2030 suitability rows: {zone.rowCount}</p>
                  <p className="mt-1 text-sm text-slate-300">Species signal count: {zone.speciesCount}</p>
                </button>
              ))}
            </div>
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
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Map zone focus</span>
              <select
                value={zoneFilter}
                onChange={(event) => setZoneFilter(event.target.value as ZoneKey | "all")}
                className="mt-2 w-full bg-transparent text-sm text-white outline-none"
              >
                <option value="all" className="bg-slate-900 text-white">
                  All zones
                </option>
                {mapZones.map((zone) => (
                  <option key={zone.key} value={zone.key} className="bg-slate-900 text-white">
                    {zone.label}
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
              {filteredPlants.map((plant) => (
                <div key={`${plant.scientificName}-${plant.sinhalaName}`} className="grid grid-cols-12 gap-4 px-5 py-4 text-sm">
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
