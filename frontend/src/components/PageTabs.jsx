const tabs = [
  { href: "/", label: "Home", key: "home", widthClass: "w-[92px]" },
  { href: "/dashboard", label: "Live", key: "dashboard", widthClass: "w-[92px]" },
  { href: "/api", label: "API", key: "api", widthClass: "w-[92px]" },
  { href: "/statistic", label: "statistic", key: "statistic", widthClass: "w-[112px]" },
  { href: "/visualization", label: "analytic", key: "analytic", widthClass: "w-[112px]" },
];

export default function PageTabs({ current }) {
  return (
    <div className="inline-flex w-[560px] flex-nowrap items-center justify-between gap-2 rounded-full border border-white/15 bg-slate-950/20 p-2 backdrop-blur-md">
      {tabs.map((tab) => {
        const active = current === tab.key;
        return (
          <a
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`${tab.widthClass} inline-flex shrink-0 justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
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
