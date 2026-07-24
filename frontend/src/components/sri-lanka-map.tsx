"use client";

import { useMemo } from "react";
import type { DashboardPayload } from "@/lib/dashboard";

type SriLankaMapProps = {
  dashboard: DashboardPayload;
  selectedZone: string | null;
  onZoneSelect: (zone: string) => void;
};

type DistrictMapping = {
  keywords: string[];
  displayName: string;
  bounds: { x: number; y: number; width: number; height: number };
};

// District locations and bounds on the map (approximate viewport coordinates)
const districtMap: Record<string, DistrictMapping> = {
  "Colombo": { keywords: ["colombo", "western"], displayName: "Colombo", bounds: { x: 420, y: 340, width: 60, height: 50 } },
  "Gampaha": { keywords: ["gampaha", "western"], displayName: "Gampaha", bounds: { x: 390, y: 310, width: 70, height: 40 } },
  "Kalutara": { keywords: ["kalutara", "western"], displayName: "Kalutara", bounds: { x: 420, y: 380, width: 60, height: 50 } },
  "Kandy": { keywords: ["kandy", "central", "upcountry"], displayName: "Kandy", bounds: { x: 480, y: 280, width: 70, height: 70 } },
  "Matara": { keywords: ["matara", "southern", "south"], displayName: "Matara", bounds: { x: 430, y: 450, width: 60, height: 50 } },
  "Galle": { keywords: ["galle", "southern", "south"], displayName: "Galle", bounds: { x: 380, y: 420, width: 60, height: 50 } },
  "Jaffna": { keywords: ["jaffna", "northern"], displayName: "Jaffna", bounds: { x: 460, y: 120, width: 50, height: 70 } },
  "Mullaitivu": { keywords: ["mullaitivu", "eastern"], displayName: "Mullaitivu", bounds: { x: 560, y: 240, width: 60, height: 60 } },
  "Trincomalee": { keywords: ["trincomalee", "eastern"], displayName: "Trincomalee", bounds: { x: 550, y: 200, width: 70, height: 50 } },
  "Batticaloa": { keywords: ["batticaloa", "eastern"], displayName: "Batticaloa", bounds: { x: 560, y: 310, width: 60, height: 60 } },
  "Ampara": { keywords: ["ampara", "eastern"], displayName: "Ampara", bounds: { x: 560, y: 370, width: 60, height: 60 } },
  "Matara South": { keywords: ["matara", "southern"], displayName: "Matara", bounds: { x: 430, y: 450, width: 60, height: 50 } },
  "Anuradhapura": { keywords: ["anuradhapura", "north central", "dry"], displayName: "Anuradhapura", bounds: { x: 440, y: 200, width: 80, height: 80 } },
  "Polonnaruwa": { keywords: ["polonnaruwa", "north central", "dry"], displayName: "Polonnaruwa", bounds: { x: 520, y: 230, width: 70, height: 70 } },
  "Kurunegala": { keywords: ["kurunegala", "north western", "intermediate"], displayName: "Kurunegala", bounds: { x: 400, y: 260, width: 70, height: 60 } },
  "Kegalle": { keywords: ["kegalle", "central"], displayName: "Kegalle", bounds: { x: 450, y: 320, width: 60, height: 60 } },
  "Nuwara Eliya": { keywords: ["nuwara eliya", "upcountry", "central"], displayName: "Nuwara Eliya", bounds: { x: 490, y: 340, width: 50, height: 60 } },
  "Badulla": { keywords: ["badulla", "upcountry", "eastern"], displayName: "Badulla", bounds: { x: 530, y: 340, width: 60, height: 80 } },
  "Monaragala": { keywords: ["monaragala", "eastern", "dry"], displayName: "Monaragala", bounds: { x: 540, y: 420, width: 70, height: 70 } },
  "Ratnapura": { keywords: ["ratnapura", "sabaragamuwa", "wet"], displayName: "Ratnapura", bounds: { x: 440, y: 380, width: 60, height: 60 } },
  "Kalmunai": { keywords: ["kalmunai", "eastern"], displayName: "Kalmunai", bounds: { x: 570, y: 340, width: 50, height: 50 } },
  "Puttalam": { keywords: ["puttalam", "north western", "dry"], displayName: "Puttalam", bounds: { x: 380, y: 220, width: 60, height: 80 } },
  "Jaffna-Mullaitivu": { keywords: ["jaffna", "northern", "peninsula"], displayName: "Jaffna Region", bounds: { x: 460, y: 120, width: 60, height: 80 } },
};

function statusFill(status: string): string {
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

function statusName(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("suitable") && !normalized.includes("un")) {
    return "Suitable";
  }
  if (normalized.includes("stable")) {
    return "Stable";
  }
  if (normalized.includes("likely")) {
    return "Likely Suitable";
  }
  if (normalized.includes("unsuitable") || normalized.includes("not")) {
    return "Unsuitable";
  }
  return "No data";
}

export default function SriLankaMap({ dashboard, selectedZone, onZoneSelect }: SriLankaMapProps) {
  const rows2030 = useMemo(
    () => dashboard.forecastRows.filter((row) => row.year === 2030),
    [dashboard.forecastRows],
  );

  const districtStatus = useMemo(() => {
    const mapping: Record<string, { status: string; speciesCount: number; rowCount: number }> = {};

    Object.entries(districtMap).forEach(([district, config]) => {
      const matchingRows = rows2030.filter((row) => {
        const normalized = row.habitatRegion.toLowerCase();
        return config.keywords.some((keyword) => normalized.includes(keyword));
      });

      if (matchingRows.length > 0) {
        const statusCount = matchingRows.reduce<Record<string, number>>((accumulator, row) => {
          accumulator[row.status] = (accumulator[row.status] ?? 0) + 1;
          return accumulator;
        }, {});

        const dominantStatus = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No data";
        const speciesCount = matchingRows.reduce((sum, row) => sum + row.plantSpeciesCount, 0);

        mapping[district] = {
          status: dominantStatus,
          speciesCount,
          rowCount: matchingRows.length,
        };
      } else {
        mapping[district] = {
          status: "No data",
          speciesCount: 0,
          rowCount: 0,
        };
      }
    });

    return mapping;
  }, [rows2030]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
        <svg
          viewBox="0 0 650 550"
          role="img"
          aria-label="Sri Lanka 2030 medicinal plant suitability by district"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="oceanTone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0c4a6e" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
          </defs>

          {/* Ocean background */}
          <rect width="650" height="550" fill="url(#oceanTone)" />

          {/* District boxes with status colors */}
          {Object.entries(districtMap).map(([district, config]) => {
            const districtData = districtStatus[district];
            const fill = statusFill(districtData.status);
            const isSelected = selectedZone === district;

            return (
              <g key={district}>
                {/* District rectangle */}
                <rect
                  x={config.bounds.x}
                  y={config.bounds.y}
                  width={config.bounds.width}
                  height={config.bounds.height}
                  fill={fill}
                  fillOpacity={isSelected ? 0.9 : 0.7}
                  stroke="#e0f2fe"
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeOpacity="0.6"
                  className="cursor-pointer transition"
                  onClick={() => onZoneSelect(district)}
                />

                {/* District label */}
                <text
                  x={config.bounds.x + config.bounds.width / 2}
                  y={config.bounds.y + config.bounds.height / 2 + 4}
                  textAnchor="middle"
                  fill="#ecfeff"
                  fontSize={config.bounds.width > 70 ? "10" : "8"}
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {config.displayName}
                </text>
              </g>
            );
          })}

          {/* Title */}
          <text x="325" y="30" textAnchor="middle" fill="#e0f2fe" fontSize="14" fontWeight="bold">
            2030 Medicinal Plant Climate Suitability by District
          </text>
        </svg>
      </div>

      {/* District info cards */}
      {selectedZone && districtStatus[selectedZone] && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
          <h3 className="text-lg font-semibold text-white">{selectedZone}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">2030 Status</p>
              <p className="mt-2 text-base font-semibold text-white">{statusName(districtStatus[selectedZone].status)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Rows (2030)</p>
              <p className="mt-2 text-base font-semibold text-white">{districtStatus[selectedZone].rowCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Species Signals</p>
              <p className="mt-2 text-base font-semibold text-white">{districtStatus[selectedZone].speciesCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="grid gap-2 sm:grid-cols-4">
        {[
          { status: "Suitable", color: "#10b981" },
          { status: "Stable", color: "#06b6d4" },
          { status: "Likely Suitable", color: "#f59e0b" },
          { status: "Unsuitable", color: "#f43f5e" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-slate-200">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
