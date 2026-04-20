import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertTriangle, CloudSun, Gauge, RefreshCcw, Thermometer, Waves, Wind } from "lucide-react";
import { getPM25Forecast } from "./api";

import { resolveApiBaseUrl } from "./api/base";
import { Card, CardContent } from "./components/ui/card";
import DashboardHero from "./components/DashboardHero.jsx";

const REFRESH_MS = 60_000;
const API_BASE = resolveApiBaseUrl();
const SOURCE_OPTIONS = ["PMS7003", "KY-015", "MQ-9", "Open-Meteo", "Official PM2.5", "Google Trends"];
const DASHBOARD_RETRY_DELAYS = [0, 600, 1400];

const displaySourceName = (source) => (source === "MQ-9" ? "CO" : source);
const displayColumnName = (column) => (column === "mq9_raw" ? "CO" : column);

const riskTone = {
  safe: {
    badge: "bg-emerald-500/12 text-emerald-700 ring-emerald-300/80",
    surface: "from-emerald-300/20 via-cyan-200/12 to-white",
  },
  moderate: {
    badge: "bg-amber-500/12 text-amber-700 ring-amber-300/80",
    surface: "from-amber-300/18 via-sky-200/10 to-white",
  },
  unhealthy: {
    badge: "bg-rose-500/12 text-rose-700 ring-rose-300/80",
    surface: "from-rose-300/18 via-orange-200/10 to-white",
  },
};

const formatTimestamp = (value) => {
  if (!value) return "No data";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatFreshness = (minutes) => {
  if (minutes == null) return "No update";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  return remain ? `${hours}h ${remain}m ago` : `${hours}h ago`;
};

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function fetchJsonWithRetry(url, delays) {
  let lastError = null;

  for (let index = 0; index < delays.length; index += 1) {
    const delay = delays[index];
    if (delay > 0) {
      await sleep(delay);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const retryable = response.status >= 500;
        if (!retryable || index === delays.length - 1) {
          throw new Error(`API ${response.status}`);
        }
        lastError = new Error(`API ${response.status}`);
        continue;
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (index === delays.length - 1) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Request failed");
}

function MetricCard({ icon: Icon, label, value, unit, accent }) {
  return (
    <div className="flex min-h-[182px] flex-col justify-between rounded-[1.5rem] border border-white/75 bg-white/88 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{label}</div>
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-[1.15rem] bg-gradient-to-br ${accent}`}>
          <Icon className="size-6 text-white" />
        </div>
      </div>
      <div className="mt-5 flex items-end gap-2">
        <div className="text-[3.15rem] leading-none font-black tracking-[-0.05em] text-slate-950">{value}</div>
        <div className="pb-1.5 text-base font-semibold text-slate-400">{unit}</div>
      </div>
    </div>
  );
}

function SourceItem({ source }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.6rem] border border-slate-100 bg-white/68 px-5 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
      <div>
        <div className="text-[1.1rem] leading-none font-black tracking-[-0.04em] text-slate-800">{displaySourceName(source.source)}</div>
        <div className="mt-2 text-sm font-semibold text-slate-500">{formatTimestamp(source.latest_at)}</div>
      </div>
      <div className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
        {formatFreshness(source.freshness_minutes)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [forecast, setForecast] = useState(null);
  const [forecastError, setForecastError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedSource, setSelectedSource] = useState("PMS7003");
  const [tableData, setTableData] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const preservedScrollY = useRef(null);
  const latestDashboardRef = useRef(null);
  const latestTableDataRef = useRef(null);

  useEffect(() => {
    latestDashboardRef.current = dashboard;
  }, [dashboard]);

  useEffect(() => {
    latestTableDataRef.current = tableData;
  }, [tableData]);

  useEffect(() => {
    let active = true;

    const load = async (background = false) => {
      try {
        if (background) setRefreshing(true);
        else setLoading(true);

        const payload = await fetchJsonWithRetry(
          `${API_BASE}/api/v1/integration/live-dashboard?hours=24`,
          DASHBOARD_RETRY_DELAYS,
        );
        if (!active) return;
        setDashboard(payload);
        setError("");
        try {
          const forecastResponse = await getPM25Forecast(12, 12);
          if (!active) return;
          setForecast(forecastResponse.data);
          setForecastError("");
        } catch (forecastErr) {
          if (!active) return;
          setForecastError(forecastErr?.response?.data?.detail || forecastErr?.message || "Unable to load forecast");
        }
      } catch (err) {
        if (!active) return;
        if (!latestDashboardRef.current) {
          setError(err.message || "Unable to load dashboard");
        }
      } finally {
        if (!active) return;
        setLoading(false);
        setRefreshing(false);
      }
    };

    load(false);
    const timer = window.setInterval(() => load(true), REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [reloadToken]);

  useEffect(() => {
    let active = true;

    const loadRows = async () => {
      if (!dashboard) {
        setTableLoading(false);
        setTableError("");
        return;
      }

      try {
        setTableLoading(true);
        setTableError("");
        const params = new URLSearchParams({
          source: selectedSource,
          page: String(currentPage),
          page_size: "8",
        });
        const payload = await fetchJsonWithRetry(
          `${API_BASE}/api/v1/integration/source-rows?${params.toString()}`,
          DASHBOARD_RETRY_DELAYS,
        );
        if (!active) return;
        setTableData(payload);
      } catch (err) {
        if (!active) return;
        if (!latestTableDataRef.current) {
          setTableError(err.message || "Unable to load table");
        }
      } finally {
        if (!active) return;
        setTableLoading(false);
      }
    };

    loadRows();
    return () => {
      active = false;
    };
  }, [selectedSource, currentPage, dashboard?.generated_at]);

  useLayoutEffect(() => {
    if (tableLoading) return;
    if (preservedScrollY.current == null) return;

    window.scrollTo(0, preservedScrollY.current);
    preservedScrollY.current = null;
  }, [tableLoading, tableData]);

  const tone = riskTone[dashboard?.safety?.risk_level] || riskTone.safe;
  const snapshot = dashboard?.snapshot;
  const sources = dashboard?.source_status || [];

  const headline = useMemo(() => {
    if (!dashboard) return "Connecting to live database";
    if (dashboard.safety.risk_level === "safe") return "Conditions look stable right now";
    if (dashboard.safety.risk_level === "moderate") return "Air conditions need attention";
    return "Air quality is currently high risk";
  }, [dashboard]);

  const pageNumbers = useMemo(() => {
    if (!tableData?.total_pages) return [];
    const maxVisible = 5;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(tableData.total_pages, start + maxVisible - 1);
    const normalizedStart = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
  }, [tableData, currentPage]);

  const changePage = (page) => {
    preservedScrollY.current = window.scrollY;
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.16),_transparent_22%),linear-gradient(180deg,_#dff1ff_0%,_#eff7ff_22%,_#eef4ff_100%)]">
      <div className="mx-auto max-w-[1320px] px-4 py-4 sm:px-6 lg:px-6 lg:py-5">
        <DashboardHero
          current="dashboard"
          icon={Activity}
          title="Live Dashboard"
          subtitle="Real-time health context from sensors, weather, and public air-quality data."
          badge="Live analytics"
          path="/dashboard"
        />

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.68fr)]">
          <div className="grid gap-5">
            <Card className={`overflow-hidden border-white/75 bg-gradient-to-br ${tone.surface}`}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-[760px]">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white">
                      <Gauge className="size-3" />
                      Live status
                    </div>
                    <h1 className="mt-4 max-w-[9ch] text-[2.2rem] leading-[0.92] font-black tracking-[-0.06em] text-slate-950 sm:text-[2.9rem] xl:text-[3.2rem]">
                      {headline}
                    </h1>
                    <p className="mt-3 max-w-xl text-[15px] leading-6 text-slate-600">
                      {dashboard?.trend?.summary || "Streaming readings from PMS7003, KY-015, CO, official PM2.5, Open-Meteo, and Google Trends."}
                    </p>
                  </div>

                  <div className="flex w-full max-w-[260px] flex-col gap-2 xl:items-end">
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <span className={`inline-flex w-fit items-center rounded-full px-3.5 py-1.5 text-xs font-bold capitalize ring-1 ${tone.badge}`}>
                        {dashboard?.safety?.risk_level || "loading"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReloadToken((value) => value + 1)}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 transition hover:bg-slate-50"
                      >
                        <RefreshCcw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                      </button>
                    </div>
                    <div className="text-sm font-semibold leading-6 text-slate-500 xl:text-right">
                      Last update: {formatTimestamp(dashboard?.generated_at)}
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
                    Unable to load dashboard: {error}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
                  <MetricCard icon={Wind} label="PM2.5" value={snapshot?.pm2_5?.toFixed(1) || "--"} unit="ug/m3" accent="from-cyan-500 to-blue-500" />
                  <MetricCard icon={Wind} label="PM10" value={snapshot?.pm10?.toFixed(1) || "--"} unit="ug/m3" accent="from-violet-500 to-indigo-500" />
                  <MetricCard icon={AlertTriangle} label="CO" value={snapshot?.mq9_raw?.toFixed(0) || "--"} unit="" accent="from-blue-500 to-indigo-500" />
                  <MetricCard icon={Thermometer} label="Temperature" value={snapshot?.temperature?.toFixed(1) || "--"} unit="°C" accent="from-orange-400 to-rose-500" />
                  <MetricCard icon={Waves} label="Humidity" value={snapshot?.humidity?.toFixed(1) || "--"} unit="%" accent="from-emerald-400 to-cyan-500" />
                </div>

                {dashboard?.trend?.weather_summary || dashboard?.trend?.weather_outlook ? (
                  <div className="mt-4 rounded-[1.25rem] border border-slate-200/80 bg-white/72 px-4 py-3 text-sm leading-6 text-slate-600">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Weather insight</div>
                    {dashboard?.trend?.weather_summary ? <div className="mt-2">{dashboard.trend.weather_summary}</div> : null}
                    {dashboard?.trend?.weather_outlook ? <div className="mt-1.5 font-semibold text-slate-800">{dashboard.trend.weather_outlook}</div> : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            <Card className="border-white/70 bg-white/84">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Forecast</div>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">PM2.5 next 6-12h</h2>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-[1rem] bg-violet-50 text-violet-500">
                    <Wind className="size-5" />
                  </div>
                </div>
                {forecastError ? (
                  <div className="mt-4 text-sm font-semibold text-rose-600">{forecastError}</div>
                ) : forecast ? (
                  <>
                    <div className="mt-4 grid gap-3">
                      {forecast.points?.map((point) => (
                        <div key={point.hours_ahead} className="rounded-[1.2rem] border border-slate-100 bg-slate-50/70 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-black tracking-[-0.03em] text-slate-900">+{point.hours_ahead}h</div>
                            <div className="text-lg font-black tracking-[-0.04em] text-slate-950">{point.predicted_pm25.toFixed(1)} <span className="text-xs font-bold text-slate-400">ug/m3</span></div>
                          </div>
                          <div className="mt-1 text-xs font-medium text-slate-500">
                            Trend {point.trend_delta >= 0 ? "+" : ""}{point.trend_delta} · Weather {point.weather_adjustment >= 0 ? "+" : ""}{point.weather_adjustment}
                          </div>
                          <div className="mt-2 text-xs leading-5 text-slate-600">{point.outlook}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs leading-5 text-slate-500">
                      {forecast.summary}
                    </div>
                    <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Confidence: {forecast.confidence}
                    </div>
                  </>
                ) : (
                  <div className="mt-4 text-sm font-semibold text-slate-500">Loading forecast...</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/84">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Source freshness</div>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Sensor pipeline</h2>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-[1rem] bg-sky-50 text-sky-500">
                    <CloudSun className="size-5" />
                  </div>
                </div>
                <div className="mt-4 grid gap-2.5">
                  {sources.filter(s => ['PMS7003','KY-015','MQ-9'].includes(s.source)).map((source) => (
                    <SourceItem key={source.source} source={source} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/84">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Source freshness</div>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Web APIs pipeline</h2>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-[1rem] bg-indigo-50 text-indigo-500">
                    <CloudSun className="size-5" />
                  </div>
                </div>
                <div className="mt-4 grid gap-2.5">
                  {sources.filter(s => ['Open-Meteo','Official PM2.5','Google Trends'].includes(s.source)).map((source) => (
                    <SourceItem key={source.source} source={source} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-5 border-white/70 bg-white/86">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Live data rows</div>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Data source explorer</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Select a source to view the latest row in a cleaner database-style layout.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SOURCE_OPTIONS.map((source) => {
                  const active = selectedSource === source;
                  return (
                    <button
                      key={source}
                      type="button"
                      onClick={() => {
                        preservedScrollY.current = window.scrollY;
                        setSelectedSource(source);
                        setCurrentPage(1);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-slate-950 text-white shadow-[0_8px_24px_rgba(15,23,42,0.14)]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {displaySourceName(source)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50/60">
              <div className="grid gap-3 border-b border-slate-100 bg-white/80 px-4 py-4 md:grid-cols-[1.15fr_1fr_auto] md:items-center">
                <div>
                  <div className="text-lg font-black tracking-[-0.04em] text-slate-900">{displaySourceName(tableData?.source || selectedSource)}</div>
                  <div className="mt-1 text-sm font-medium text-slate-500">Showing real database rows, 8 records per page.</div>
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  Total rows: {tableData?.total_rows ?? "--"}
                </div>
                <div className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                  Page {tableData?.page ?? currentPage} / {tableData?.total_pages ?? "--"}
                </div>
              </div>

              {tableLoading ? (
                <div className="absolute right-4 top-4 z-10 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]">
                  Loading
                </div>
              ) : null}

              <div className="hidden gap-4 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 md:grid" style={{ gridTemplateColumns: `repeat(${tableData?.columns?.length || 1}, minmax(0, 1fr))` }}>
                {(tableData?.columns || []).map((column) => (
                  <div key={column}>{displayColumnName(column)}</div>
                ))}
              </div>

              <div className={`max-h-[340px] overflow-y-auto divide-y divide-slate-100 bg-white/70 transition-opacity ${tableLoading ? "opacity-70" : "opacity-100"}`}>
                {tableError ? (
                  <div className="px-4 py-4 text-sm font-semibold text-rose-600">{tableError}</div>
                ) : null}
                {!tableError && (tableData?.rows || []).map((row, index) => (
                  <div key={`${tableData.source}-${index}`} className="grid gap-3 px-4 py-2.5 md:gap-4" style={{ gridTemplateColumns: `repeat(${tableData?.columns?.length || 1}, minmax(0, 1fr))` }}>
                    {(tableData?.columns || []).map((column) => (
                      <div key={column} className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 md:hidden">{column}</div>
                        <div className="truncate text-sm font-semibold text-slate-600">{String(row[column] ?? "-")}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white/80 px-4 py-4">
                <div className="text-sm font-medium text-slate-500">
                  Showing {(tableData?.rows || []).length} of {tableData?.total_rows ?? 0} rows
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!tableData || currentPage <= 1}
                    onClick={() => changePage(Math.max(1, currentPage - 1))}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => changePage(page)}
                      className={`rounded-full px-3 py-2 text-sm font-semibold ${
                        page === currentPage ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!tableData || currentPage >= (tableData?.total_pages || 1)}
                    onClick={() => changePage(Math.min(tableData?.total_pages || currentPage, currentPage + 1))}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="mt-5 rounded-[1.4rem] border border-white/70 bg-white/84 px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
            Loading live dashboard data...
          </div>
        ) : null}
      </div>
    </div>
  );
}
