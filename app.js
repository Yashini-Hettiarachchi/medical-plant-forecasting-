const DATA_FILES = {
  suitability: "plant_suitability_2026_2030.csv",
  temperature: "forecast_temperature_2m_mean.csv",
  precipitation: "forecast_precipitation_sum.csv",
  plants: "cleaned_sinhala_plants.csv"
};

const CLINICAL_TAGS = {
  "Aegle marmelos": ["digestive"],
  "Terminalia chebula": ["digestive", "anti-inflammatory"],
  "Terminalia bellirica": ["digestive"],
  "Phyllanthus emblica": ["metabolic", "anti-inflammatory"],
  "Tinospora cordifolia": ["metabolic", "anti-inflammatory"],
  "Justicia adhatoda": ["respiratory"],
  "Andrographis paniculata": ["anti-inflammatory", "respiratory"],
  "Centella asiatica": ["wound-healing", "anti-inflammatory"],
  "Hemidesmus indicus": ["metabolic", "digestive"],
  "Asparagus racemosus": ["metabolic"],
  "Gymnema sylvestre": ["metabolic"],
  "Azadirachta indica": ["anti-inflammatory", "wound-healing"],
  "Piper longum": ["respiratory", "digestive"],
  "Tribulus terrestris": ["metabolic"],
  "Boerhavia diffusa": ["anti-inflammatory"],
  "Hygrophila auriculata": ["metabolic"],
  "Cassia fistula": ["digestive"],
  "Clitoria ternatea": ["anti-inflammatory"],
  "Murraya koenigii": ["digestive"],
  "Eclipta prostrata": ["wound-healing"]
};

const ZONE_POINTS = [
  { zone: "Wet", name: "Western Wet Belt", lat: 6.9271, lon: 79.8612 },
  { zone: "Dry", name: "North Central Dry Zone", lat: 8.3114, lon: 80.4037 },
  { zone: "Intermediate", name: "Kandy Intermediate", lat: 7.2906, lon: 80.6337 },
  { zone: "Coastal", name: "Southern Coastal", lat: 6.0328, lon: 80.2168 },
  { zone: "Upcountry", name: "Central Highlands", lat: 6.9497, lon: 80.7891 }
];

const state = {
  suitabilityRows: [],
  temperatureRows: [],
  precipitationRows: [],
  plantRows: [],
  year: "all",
  status: "all",
  zone: "all",
  clinical: "all",
  search: ""
};

const charts = {
  temperature: null,
  precipitation: null,
  suitability: null
};

const mapState = {
  map: null,
  layers: []
};

function parseCsv(text) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (value) => value.trim()
  });
  return result.data;
}

async function loadCsv(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  const text = await response.text();
  return parseCsv(text);
}

function normalizeSuitability(rows) {
  return rows
    .map((row) => ({
      year: Number.parseInt(String(row.Year || "").trim(), 10),
      habitat: String(row.Habitat_Region || "").trim(),
      avgPrecip: Number.parseFloat(String(row.Avg_Daily_Precip || "0").trim()),
      status: String(row.Status || "").trim(),
      speciesCount: Number.parseInt(String(row.Plant_Species_Count || "0").trim(), 10)
    }))
    .filter((row) => Number.isFinite(row.year) && row.habitat && row.status);
}

function normalizeForecast(rows) {
  return rows
    .map((row) => ({
      date: String(row.ds || "").trim(),
      value: Number.parseFloat(String(row.yhat || "0").trim())
    }))
    .filter((row) => row.date && Number.isFinite(row.value));
}

function normalizePlants(rows) {
  return rows
    .map((row) => ({
      scientific: String(row["Scientific Name"] || "").trim(),
      sinhala: String(row["Sinhala Name"] || "").trim(),
      habitat1: String(row["Habitat/Region_1"] || "").trim(),
      habitat2: String(row["Habitat/Region_2"] || "").trim(),
      habitat3: String(row["Habitat/Region_3"] || "").trim()
    }))
    .filter((row) => row.scientific);
}

function getYears() {
  return [...new Set(state.suitabilityRows.map((row) => row.year))].sort((a, b) => a - b);
}

function zoneFromHabitat(habitat) {
  const label = habitat.toLowerCase();
  if (label.includes("wet")) return "Wet";
  if (label.includes("dry")) return "Dry";
  if (label.includes("intermediate")) return "Intermediate";
  if (label.includes("coastal") || label.includes("lagoon") || label.includes("estuar")) return "Coastal";
  if (label.includes("upcountry") || label.includes("montane")) return "Upcountry";
  return "Other";
}

function withFilters(rows) {
  return rows.filter((row) => {
    const zone = zoneFromHabitat(row.habitat);
    const yearOk = state.year === "all" || row.year === Number.parseInt(state.year, 10);
    const statusOk = state.status === "all" || row.status === state.status;
    const zoneOk = state.zone === "all" || zone === state.zone;
    return yearOk && statusOk && zoneOk;
  });
}

function selectedYearRows() {
  const targetYear = state.year === "all" ? Math.max(...getYears()) : Number.parseInt(state.year, 10);
  return state.suitabilityRows.filter((row) => row.year === targetYear);
}

function aggregateSuitabilityByYear(rows) {
  const statuses = ["Suitable", "Likely Suitable", "Stable", "Unsuitable"];
  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);
  const series = statuses.map((status) => ({
    status,
    values: years.map(
      (year) => rows.filter((row) => row.year === year && row.status === status).length
    )
  }));
  return { years, series };
}

function monthlyAverage(rows) {
  const groups = new Map();
  for (const row of rows) {
    const month = row.date.slice(0, 7);
    if (!groups.has(month)) {
      groups.set(month, []);
    }
    groups.get(month).push(row.value);
  }
  return [...groups.entries()]
    .map(([month, values]) => ({
      month,
      avg: values.reduce((sum, value) => sum + value, 0) / values.length
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function zoneSummaryForMap(rows) {
  const summary = new Map();
  for (const row of rows) {
    const zone = zoneFromHabitat(row.habitat);
    if (!summary.has(zone)) {
      summary.set(zone, {
        suitableCount: 0,
        totalCount: 0,
        species: 0
      });
    }
    const item = summary.get(zone);
    if (row.status === "Suitable" || row.status === "Likely Suitable") {
      item.suitableCount += 1;
    }
    item.totalCount += 1;
    item.species += row.speciesCount;
  }
  return summary;
}

function statusFromRatio(ratio) {
  if (ratio >= 0.55) return "healthy";
  if (ratio >= 0.35) return "mixed";
  return "risk";
}

function colorForZoneState(zoneState) {
  if (zoneState === "healthy") return "#0f9d58";
  if (zoneState === "mixed") return "#e67e22";
  return "#c0392b";
}

function updateKpis(filteredRows) {
  const speciesCount = new Set(state.plantRows.map((row) => row.scientific)).size;
  const years = getYears();
  const yearMin = Math.min(...years);
  const yearMax = Math.max(...years);

  const zoneStats = zoneSummaryForMap(selectedYearRows());
  let worstZone = "Not available";
  let worstRatio = 2;
  for (const [zone, stats] of zoneStats.entries()) {
    const ratio = stats.totalCount > 0 ? stats.suitableCount / stats.totalCount : 0;
    if (ratio < worstRatio) {
      worstRatio = ratio;
      worstZone = zone;
    }
  }

  const suitableShare =
    filteredRows.length > 0
      ? (filteredRows.filter((row) => row.status === "Suitable" || row.status === "Likely Suitable").length /
          filteredRows.length) *
        100
      : 0;

  document.getElementById("kpiSpecies").textContent = `${speciesCount}`;
  document.getElementById("kpiHorizon").textContent = `${yearMin} - ${yearMax}`;
  document.getElementById("kpiRiskZone").textContent = worstZone;
  document.getElementById("kpiSuitability").textContent = `${suitableShare.toFixed(1)}%`;
}

function initMap() {
  mapState.map = L.map("sriLankaMap", {
    zoomControl: true,
    attributionControl: true
  }).setView([7.85, 80.78], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(mapState.map);
}

function redrawMap(filteredRows) {
  mapState.layers.forEach((layer) => layer.remove());
  mapState.layers = [];

  const summary = zoneSummaryForMap(filteredRows);

  for (const point of ZONE_POINTS) {
    const stats = summary.get(point.zone) || { suitableCount: 0, totalCount: 0, species: 0 };
    const ratio = stats.totalCount > 0 ? stats.suitableCount / stats.totalCount : 0;
    const zoneState = statusFromRatio(ratio);

    const radius = Math.max(8000, Math.sqrt(Math.max(stats.species, 1)) * 1600);
    const circle = L.circle([point.lat, point.lon], {
      radius,
      color: colorForZoneState(zoneState),
      fillColor: colorForZoneState(zoneState),
      fillOpacity: 0.24,
      weight: 2
    }).addTo(mapState.map);

    circle.bindPopup(
      `<strong>${point.name}</strong><br/>Zone: ${point.zone}<br/>Suitable share: ${(ratio * 100).toFixed(
        1
      )}%<br/>Species represented: ${stats.species}`
    );

    mapState.layers.push(circle);
  }
}

function drawForecastChart(canvasId, rows, label, color) {
  const monthly = monthlyAverage(rows).filter((entry) => entry.month >= "2026-01");
  const labels = monthly.map((entry) => entry.month);
  const values = monthly.map((entry) => Number(entry.avg.toFixed(2)));

  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }

  charts[canvasId] = new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label,
          data: values,
          borderColor: color,
          backgroundColor: `${color}22`,
          borderWidth: 2,
          tension: 0.32,
          fill: true,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { maxTicksLimit: 10 }
        }
      }
    }
  });
}

function drawSuitabilityChart(rows) {
  const aggregated = aggregateSuitabilityByYear(rows);

  if (charts.suitability) {
    charts.suitability.destroy();
  }

  const colors = {
    Suitable: "#0f9d58",
    "Likely Suitable": "#55b987",
    Stable: "#e67e22",
    Unsuitable: "#c0392b"
  };

  charts.suitability = new Chart(document.getElementById("suitabilityChart"), {
    type: "bar",
    data: {
      labels: aggregated.years,
      datasets: aggregated.series.map((series) => ({
        label: series.status,
        data: series.values,
        backgroundColor: colors[series.status],
        borderWidth: 0,
        borderRadius: 6
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
}

function chosenClinicalTag(scientificName) {
  const tags = CLINICAL_TAGS[scientificName] || [];
  if (state.clinical === "all") return tags[0] || "general";
  return tags.includes(state.clinical) ? state.clinical : "-";
}

function statusBadgeClass(status) {
  const normalized = status.toLowerCase();
  if (normalized.includes("unsuitable")) return "status-pill status-risk";
  if (normalized.includes("suitable")) return "status-pill status-suitable";
  return "status-pill status-stable";
}

function rowStatusForYear(primaryHabitat) {
  const targetYear = state.year === "all" ? Math.max(...getYears()) : Number.parseInt(state.year, 10);
  const hit = state.suitabilityRows.find(
    (row) => row.year === targetYear && row.habitat.toLowerCase().includes(primaryHabitat.toLowerCase())
  );
  return hit ? hit.status : "No match";
}

function filteredPlants() {
  return state.plantRows.filter((row) => {
    const zone = zoneFromHabitat(row.habitat1);
    const searchTerm = state.search.trim().toLowerCase();
    const nameMatch =
      !searchTerm ||
      row.scientific.toLowerCase().includes(searchTerm) ||
      row.sinhala.toLowerCase().includes(searchTerm);

    const zoneMatch = state.zone === "all" || zone === state.zone;

    const clinicalList = CLINICAL_TAGS[row.scientific] || [];
    const clinicalMatch = state.clinical === "all" || clinicalList.includes(state.clinical);

    return nameMatch && zoneMatch && clinicalMatch;
  });
}

function updatePlantTable() {
  const tableBody = document.getElementById("plantTableBody");
  const plants = filteredPlants().slice(0, 80);

  if (plants.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="5">No plants match the current filter combination.</td></tr>';
    return;
  }

  tableBody.innerHTML = plants
    .map((plant) => {
      const clinical = chosenClinicalTag(plant.scientific);
      const status = rowStatusForYear(plant.habitat1 || plant.habitat2 || plant.habitat3 || "");
      return `
        <tr>
          <td>${plant.scientific}</td>
          <td>${plant.sinhala || "-"}</td>
          <td>${plant.habitat1 || "-"}</td>
          <td>${clinical}</td>
          <td><span class="${statusBadgeClass(status)}">${status}</span></td>
        </tr>
      `;
    })
    .join("");
}

function updateDashboard() {
  const filteredRows = withFilters(state.suitabilityRows);
  updateKpis(filteredRows);
  redrawMap(filteredRows.length ? filteredRows : selectedYearRows());
  drawSuitabilityChart(filteredRows.length ? filteredRows : state.suitabilityRows);
  updatePlantTable();
}

function initYearFilter() {
  const yearFilter = document.getElementById("yearFilter");
  const years = getYears();
  yearFilter.innerHTML = `<option value="all">All (${Math.min(...years)}-${Math.max(...years)})</option>`;
  years.forEach((year) => {
    yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
  });
}

function registerEvents() {
  document.getElementById("yearFilter").addEventListener("change", (event) => {
    state.year = event.target.value;
    updateDashboard();
  });

  document.getElementById("statusFilter").addEventListener("change", (event) => {
    state.status = event.target.value;
    updateDashboard();
  });

  document.getElementById("zoneFilter").addEventListener("change", (event) => {
    state.zone = event.target.value;
    updateDashboard();
  });

  document.getElementById("clinicalFilter").addEventListener("change", (event) => {
    state.clinical = event.target.value;
    updateDashboard();
  });

  document.getElementById("plantSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    updateDashboard();
  });

  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    state.year = "all";
    state.status = "all";
    state.zone = "all";
    state.clinical = "all";
    state.search = "";

    document.getElementById("yearFilter").value = "all";
    document.getElementById("statusFilter").value = "all";
    document.getElementById("zoneFilter").value = "all";
    document.getElementById("clinicalFilter").value = "all";
    document.getElementById("plantSearch").value = "";

    updateDashboard();
  });

  document.getElementById("downloadSuitabilityBtn").addEventListener("click", () => {
    const rows = withFilters(state.suitabilityRows);
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "filtered_suitability.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

function showError(message) {
  const kpiGrid = document.getElementById("kpiGrid");
  kpiGrid.innerHTML = `<article class="kpi-card"><h2>Frontend Error</h2><p>${message}</p></article>`;
}

async function bootstrap() {
  try {
    const [suitability, temperature, precipitation, plants] = await Promise.all([
      loadCsv(DATA_FILES.suitability),
      loadCsv(DATA_FILES.temperature),
      loadCsv(DATA_FILES.precipitation),
      loadCsv(DATA_FILES.plants)
    ]);

    state.suitabilityRows = normalizeSuitability(suitability);
    state.temperatureRows = normalizeForecast(temperature);
    state.precipitationRows = normalizeForecast(precipitation);
    state.plantRows = normalizePlants(plants);

    initYearFilter();
    initMap();

    drawForecastChart(
      "temperatureChart",
      state.temperatureRows,
      "Monthly Mean Temperature Forecast (C)",
      "#0f9d58"
    );
    drawForecastChart(
      "precipitationChart",
      state.precipitationRows,
      "Monthly Mean Precipitation Forecast",
      "#e67e22"
    );

    registerEvents();
    updateDashboard();
  } catch (error) {
    showError(error.message || "Failed to initialize dashboard.");
  }
}

window.addEventListener("DOMContentLoaded", bootstrap);
