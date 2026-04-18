import PageTabs from "./PageTabs.jsx";

export default function DashboardHero({ current, icon: Icon, title, subtitle, badge, path, compact = false }) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="animate-fade-up flex justify-end">
        <PageTabs current={current} />
      </div>

      <div className={`animate-fade-up relative overflow-hidden rounded-[1.55rem] border border-white/80 bg-white/78 px-4 text-slate-950 shadow-[0_22px_64px_rgba(14,165,233,0.15)] ring-1 ring-sky-100/80 backdrop-blur-2xl sm:px-5 ${compact ? "py-3" : "py-3.5 md:py-4"}`} style={{ animationDelay: "0.08s" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(125,211,252,0.28),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(37,99,235,0.16),transparent_26%),radial-gradient(circle_at_46%_96%,rgba(34,211,238,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,248,255,0.94)_46%,rgba(230,247,255,0.88))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:76px_76px] opacity-45" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />
        <div className="animate-glow-pulse absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-300/32 blur-3xl" />
        <div className="animate-drift absolute left-[32%] top-0 h-24 w-24 rounded-full bg-cyan-200/36 blur-2xl" />
        <div className="absolute -bottom-20 right-[22%] h-28 w-28 rounded-full bg-sky-200/24 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`relative flex shrink-0 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-600 text-white shadow-[0_14px_28px_rgba(56,189,248,0.24)] ring-1 ring-white/80 ${compact ? "size-10" : "size-12 md:size-14"}`}>
              <div className="absolute inset-0 rounded-[1.15rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
              <Icon className={`relative ${compact ? "size-5" : "size-6 md:size-7"}`} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.34em] text-sky-700/70">AirHealth Monitor</span>
              <span className={`bg-[linear-gradient(90deg,#0f172a_0%,#0369a1_44%,#2563eb_100%)] bg-clip-text font-black tracking-[-0.055em] text-transparent ${compact ? "text-[1.45rem] sm:text-[1.7rem]" : "text-[1.65rem] sm:text-[1.95rem] md:text-[2.15rem]"}`}>{title}</span>
              <span className={`max-w-3xl font-semibold leading-5 text-slate-600 ${compact ? "mt-0.5 text-xs" : "mt-0.5 text-[13px]"}`}>{subtitle}</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:min-w-[460px] lg:items-end">
            <div className="flex flex-wrap justify-start gap-3 lg:justify-end">
              <div className="rounded-full border border-sky-200/85 bg-white/72 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-sky-700 shadow-[0_10px_22px_rgba(56,189,248,0.1)] backdrop-blur-md">
                {badge}
              </div>
              <div className="rounded-full border border-blue-200/85 bg-gradient-to-r from-sky-500 to-blue-500 px-3.5 py-1.5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.16)] backdrop-blur-md">
                {path}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
