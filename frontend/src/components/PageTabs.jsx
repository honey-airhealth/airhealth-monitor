const tabs = [
  { href: "/", label: "Home", key: "home" },
  { href: "/dashboard", label: "Live", key: "dashboard" },
  { href: "/api", label: "API", key: "api" },
];

export default function PageTabs({ current }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-slate-950/20 p-2 backdrop-blur-md sm:flex-nowrap">
      {tabs.map((tab) => {
        const active = current === tab.key;
        return (
          <a
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-white text-sky-700 shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
                : "text-white/84 hover:bg-white/12 hover:text-white"
            }`}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}
