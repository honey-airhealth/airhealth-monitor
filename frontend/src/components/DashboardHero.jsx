import PageTabs from "./PageTabs.jsx";

export default function DashboardHero({ current, icon: Icon, title, subtitle, badge, path, compact = false }) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="animate-fade-up flex justify-end">
        <PageTabs current={current} />
      </div>

      <div className={`animate-fade-up relative overflow-hidden rounded-[1.8rem] border border-white/50 bg-[linear-gradient(120deg,rgba(8,47,73,0.96)_0%,rgba(6,78,120,0.9)_24%,rgba(14,165,233,0.9)_58%,rgba(59,130,246,0.92)_100%)] px-6 text-white shadow-[0_28px_80px_rgba(14,165,233,0.28)] ${compact ? "py-4" : "py-6"}`} style={{ animationDelay: "0.08s" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.2),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(191,219,254,0.22),transparent_22%),linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:auto,auto,72px_72px,72px_72px] opacity-60" />
        <div className="animate-glow-pulse absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/14 blur-3xl" />
        <div className="animate-drift absolute left-1/3 top-0 h-24 w-24 rounded-full bg-cyan-200/18 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex shrink-0 items-center justify-center rounded-[1.35rem] bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md ${compact ? "size-12" : "size-16"}`}>
              <Icon className={compact ? "size-6" : "size-8"} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-[0.38em] text-cyan-100/85">AirHealth Monitor</span>
              <span className={`font-black tracking-[-0.05em] text-white ${compact ? "text-[1.75rem] sm:text-[2.05rem]" : "text-[2rem] sm:text-[2.4rem]"}`}>{title}</span>
              <span className={`font-medium text-cyan-50/82 ${compact ? "mt-0.5 text-[13px]" : "mt-1 text-sm"}`}>{subtitle}</span>
            </div>
          </div>

          <div className="flex min-w-[460px] flex-col items-end gap-3">
            <div className="flex flex-wrap justify-end gap-3">
              <div className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-50/90 backdrop-blur-md">
                {badge}
              </div>
              <div className="rounded-full border border-white/18 bg-slate-950/20 px-4 py-2 text-sm font-semibold text-white/92 backdrop-blur-md">
                {path}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
