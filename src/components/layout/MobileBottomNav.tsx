"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { icon: "explore",          label: "Explore",   href: "/explore"   },
  { icon: "policy",           label: "Permits",   href: "/permits"   },
  { icon: "directions_bus",   label: "Transport", href: "/transport" },
  { icon: "bar_chart",        label: "Insights",  href: "/insights"  },
  { icon: "dashboard",        label: "Dashboard", href: "/dashboard" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 z-40 flex md:hidden bg-bg-canvas border-t border-border-hairline"
      aria-label="Mobile navigation"
    >
      {TABS.map(t => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
              active ? "text-accent-terracotta" : "text-text-muted hover:text-text-ink"
            )}
          >
            <span className={cn(
              "material-symbols-outlined text-[22px] transition-transform",
              active ? "scale-110" : ""
            )}>
              {t.icon}
            </span>
            <span className="font-label-caps text-[9px] uppercase tracking-wider leading-none">
              {t.label}
            </span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent-terracotta rounded-full" aria-hidden />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
