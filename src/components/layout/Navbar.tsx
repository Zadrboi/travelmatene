"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useMotion } from "@/context/MotionPreferenceContext";
import { NE_STATES } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Explore",         href: "/explore",          path: "explore" },
  { label: "Permits",         href: "/permits",          path: "permits" },
  { label: "Transport",       href: "/transport",        path: "transport" },
  { label: "Insights",        href: "/insights",         path: "insights" },
  { label: "Dashboard",       href: "/dashboard",        path: "dashboard" },
];

export default function Navbar({ onCommandPalette }: { onCommandPalette?: () => void }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const {
    isLiteMode,
    setLiteMode,
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    prefersReducedMotion,
  } = useMotion();

  const [scrolled, setScrolled] = useState(false);
  const [statesOpen, setStatesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    setMounted(true);
    if (!isHome) { setScrolled(true); return; }
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [isHome]);

  useEffect(() => {
    // Check demo mode session
    if (typeof window !== "undefined") {
      const hasDemo = document.cookie.includes("travelmate_demo=true") || localStorage.getItem("travelmate_demo") === "true";
      setIsDemoUser(hasDemo);
    }

    // Subscribe to live Supabase auth state
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (typeof window !== "undefined") {
        const hasDemo = document.cookie.includes("travelmate_demo=true") || localStorage.getItem("travelmate_demo") === "true";
        setIsDemoUser(hasDemo);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = "travelmate_demo=; path=/; max-age=0";
    localStorage.removeItem("travelmate_demo");
    setUser(null);
    setIsDemoUser(false);
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  useEffect(() => {
    const pwaHandler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", pwaHandler);
    window.addEventListener("appinstalled", () => setIsPwaInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", pwaHandler);
  }, []);

  const isOverHero = !scrolled && isHome;

  const textClass = isOverHero ? "text-white/95" : "text-[var(--text-ink)]";
  const iconBtnClass = isOverHero
    ? "text-white/90 hover:text-white hover:bg-white/15"
    : "text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-editorial)]";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Layer 1 (0px to 72px): Sticky/fixed 72px Navbar */}
      <div
        className={cn(
          "h-[72px] w-full transition-colors duration-300 relative z-20",
          isOverHero
            ? "bg-[#0D1512]/80 backdrop-blur-md border-b border-white/10"
            : "bg-[var(--bg-canvas)]/92 backdrop-blur-md shadow-nav border-b border-[var(--border-hairline)]"
        )}
      >
        <div className="h-full max-w-[1280px] mx-auto px-6 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Logo + compact States dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-brand-pine flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px] text-white">landscape</span>
            </div>
            <span className={cn("font-headline-sm text-headline-sm tracking-tight transition-colors", textClass)}>
              TravelMate<span className="text-accent-terracotta">NE</span>
            </span>
          </Link>

          <div className="relative hidden md:block">
            <button
              onClick={() => { setStatesOpen(o => !o); setSettingsOpen(false); }}
              className={cn(
                "flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-body-sm font-semibold transition-colors",
                isOverHero
                  ? "text-white/90 bg-white/10 hover:bg-white/20"
                  : "text-[var(--text-ink)] bg-[var(--bg-surface)] hover:bg-[var(--bg-editorial)] border border-[var(--border-hairline)]"
              )}
              aria-label="Filter by 8 North East states"
              aria-expanded={statesOpen}
              aria-haspopup="true"
            >
              <span className="material-symbols-outlined text-[15px] text-accent-terracotta">location_on</span>
              <span className="text-[13px]">States</span>
              <span className="material-symbols-outlined text-[15px]">arrow_drop_down</span>
            </button>
            {statesOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStatesOpen(false)} aria-hidden />
                <div className="absolute left-0 top-9 z-50 w-52 bg-[var(--bg-surface)] rounded-xl shadow-card border border-[var(--border-hairline)] p-1.5 overflow-hidden">
                  <div className="px-3 py-1.5 font-label-caps text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
                    8 Sister States
                  </div>
                  {NE_STATES.map(s => (
                    <Link
                      key={s}
                      href={`/explore?state=${encodeURIComponent(s)}`}
                      onClick={() => setStatesOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg font-body-sm text-body-sm text-[var(--text-ink)] hover:bg-[var(--bg-editorial)] hover:text-accent-terracotta transition-colors"
                    >
                      <span>{s}</span>
                      <span className="material-symbols-outlined text-[14px] opacity-40">arrow_forward</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Clean single-line links with whitespace-nowrap and gap-5 */}
        <nav className="hidden lg:flex items-center gap-5 whitespace-nowrap" aria-label="Main navigation">
          {NAV_LINKS.map(l => {
            const active = pathname.startsWith(`/${l.path}`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-label-caps text-label-caps uppercase tracking-wider transition-colors py-1 px-1 relative",
                  active
                    ? isOverHero
                      ? "text-white font-bold border-b-2 border-accent-terracotta"
                      : "text-accent-terracotta font-bold border-b-2 border-accent-terracotta"
                    : isOverHero
                      ? "text-white/80 hover:text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Compact icon-only utilities with aria-label + tooltips */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Button (Ctrl+K) */}
          <button
            onClick={onCommandPalette}
            className={cn(
              "h-8 px-2.5 rounded-full flex items-center gap-1.5 transition-colors",
              isOverHero
                ? "text-white/90 bg-white/10 hover:bg-white/20"
                : "text-[var(--text-muted)] bg-[var(--bg-surface)] hover:text-[var(--text-ink)] border border-[var(--border-hairline)]"
            )}
            title="Search destinations and routes (Ctrl+K)"
            aria-label="Search destinations and routes (Ctrl+K)"
          >
            <span className="material-symbols-outlined text-[17px]">search</span>
            <span className="hidden 2xl:inline font-data-tabular text-[11px] opacity-75">Ctrl+K</span>
          </button>

          {/* Settings & Tools Popover (groups Lite Mode, Accessibility, PWA) */}
          <div className="relative">
            <button
              onClick={() => { setSettingsOpen(o => !o); setStatesOpen(false); }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors relative",
                iconBtnClass
              )}
              title="Settings, Data Saver & Accessibility"
              aria-label="Settings, Data Saver and Accessibility preferences"
              aria-expanded={settingsOpen}
              aria-haspopup="true"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              {(isLiteMode || highContrast) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-terracotta" />
              )}
            </button>

            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} aria-hidden />
                <div
                  role="dialog"
                  aria-label="Preferences and tools"
                  className="absolute right-0 top-10 z-50 w-72 bg-[var(--bg-surface)] rounded-2xl shadow-card border border-[var(--border-hairline)] p-4 space-y-4 text-[var(--text-ink)] animate-[scale-in_0.15s_ease-out]"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2.5">
                    <span className="font-label-caps text-label-caps uppercase text-[var(--text-muted)] tracking-wider">
                      Preferences & Tools
                    </span>
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                      aria-label="Close preferences"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  {/* Lite Mode / Data Saver */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-accent-terracotta">
                          {isLiteMode ? "data_saver_on" : "data_saver_off"}
                        </span>
                        <div>
                          <p className="font-body-sm text-[13px] font-semibold">Lite Mode (Data Saver)</p>
                          <p className="font-body-sm text-[11px] text-[var(--text-muted)]">Collapse heavy assets for 2G zones</p>
                        </div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={isLiteMode}
                        onClick={() => setLiteMode(!isLiteMode)}
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative shrink-0 p-0.5",
                          isLiteMode ? "bg-accent-terracotta" : "bg-[var(--border-hairline)]"
                        )}
                        aria-label="Toggle Lite Mode Data Saver"
                      >
                        <span
                          className={cn(
                            "block w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                            isLiteMode ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Accessibility: Text Size */}
                  <div className="space-y-2 border-t border-[var(--border-hairline)] pt-3">
                    <p className="font-label-caps text-[11px] uppercase text-[var(--text-muted)] tracking-wider">
                      Text Size
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["sm", "base", "lg"] as const).map((s, i) => (
                        <button
                          key={s}
                          onClick={() => setFontScale(s)}
                          className={cn(
                            "py-1 rounded-lg font-semibold text-xs transition-colors border",
                            fontScale === s
                              ? "bg-brand-pine text-white border-brand-pine"
                              : "bg-[var(--bg-canvas)] text-[var(--text-muted)] border-[var(--border-hairline)] hover:bg-[var(--bg-editorial)]"
                          )}
                        >
                          {["A− (Compact)", "A (Normal)", "A+ (Large)"][i]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility: High Contrast */}
                  <div className="flex items-center justify-between border-t border-[var(--border-hairline)] pt-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-surface-tint">contrast</span>
                      <span className="font-body-sm text-[13px]">High Contrast</span>
                    </div>
                    <button
                      role="switch"
                      aria-checked={highContrast}
                      onClick={() => setHighContrast(!highContrast)}
                      className={cn(
                        "w-10 h-6 rounded-full transition-colors relative shrink-0 p-0.5",
                        highContrast ? "bg-brand-pine" : "bg-[var(--border-hairline)]"
                      )}
                      aria-label="Toggle high contrast"
                    >
                      <span
                        className={cn(
                          "block w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                          highContrast ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Motion status indicator */}
                  <div className="flex items-center justify-between border-t border-[var(--border-hairline)] pt-3 text-[11px] text-[var(--text-muted)]">
                    <span>Reduced Motion:</span>
                    <span className="font-semibold text-[var(--text-ink)]">
                      {prefersReducedMotion ? "OS Enabled (Reduced)" : "Full Motion"}
                    </span>
                  </div>

                  {/* PWA Install */}
                  <div className="border-t border-[var(--border-hairline)] pt-3">
                    {installPrompt && !isPwaInstalled ? (
                      <button
                        onClick={async () => {
                          await installPrompt.prompt();
                          const { outcome } = await installPrompt.userChoice;
                          if (outcome === "accepted") setIsPwaInstalled(true);
                          setSettingsOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-accent-terracotta text-white font-label-caps text-label-caps uppercase flex items-center justify-center gap-1.5 shadow hover:bg-accent-rust transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Install TravelMateNE App
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-[var(--bg-canvas)] text-[var(--text-muted)] text-[11px]">
                        <span className="material-symbols-outlined text-[16px] text-status-verified">offline_pin</span>
                        <span>Offline PWA Ready & Cached</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle Button (with mounted guard to prevent hydration mismatch) */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              iconBtnClass
            )}
            title={mounted && resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-label={mounted && resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            suppressHydrationWarning
          >
            <span className="material-symbols-outlined text-[18px]" suppressHydrationWarning>
              {!mounted ? "dark_mode" : resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Auth State: User Avatar with menu OR Login terracotta button */}
          {user || isDemoUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(o => !o);
                  setSettingsOpen(false);
                  setStatesOpen(false);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors",
                  isOverHero
                    ? "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                    : "bg-[var(--bg-surface)] text-[var(--text-ink)] hover:bg-[var(--bg-editorial)] border border-[var(--border-hairline)]"
                )}
                aria-label="User account menu"
                aria-expanded={userMenuOpen}
              >
                <span className="w-5 h-5 rounded-full bg-accent-terracotta text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || (isDemoUser ? "D" : "U")}
                </span>
                <span className="hidden sm:inline font-label-caps text-label-caps tracking-wider max-w-[80px] truncate">
                  {user?.user_metadata?.full_name?.split(" ")[0] || (isDemoUser ? "Demo" : "Traveler")}
                </span>
                <span className="material-symbols-outlined text-[15px]">arrow_drop_down</span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-9 z-50 w-56 bg-[var(--bg-surface)] rounded-xl shadow-card border border-[var(--border-hairline)] p-2 text-[var(--text-ink)] animate-[scale-in_0.15s_ease-out]">
                    <div className="px-3 py-2 border-b border-[var(--border-hairline)]">
                      <p className="font-label-caps text-label-caps uppercase text-accent-terracotta font-bold text-[10px]">
                        {isDemoUser && !user ? "Demo Mode Session" : "Signed In Traveler"}
                      </p>
                      <p className="font-headline-sm text-sm font-semibold truncate text-[var(--text-ink)]">
                        {user?.user_metadata?.full_name || (isDemoUser ? "Judge / Demo Traveler" : "Northeast Explorer")}
                      </p>
                      <p className="font-data-tabular text-[11px] text-[var(--text-muted)] truncate">
                        {user?.email || "demo@travelmatene.gov.in"}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg font-body-sm text-body-sm text-[var(--text-ink)] hover:bg-[var(--bg-editorial)] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-brand-pine">dashboard</span>
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        href="/permits"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg font-body-sm text-body-sm text-[var(--text-ink)] hover:bg-[var(--bg-editorial)] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-surface-tint">policy</span>
                        <span>My Permits</span>
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-[var(--border-hairline)]">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-body-sm text-body-sm text-accent-terracotta hover:bg-accent-terracotta/10 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-accent-terracotta text-white font-label-caps text-label-caps uppercase tracking-wider hover:bg-accent-rust transition-colors shadow-sm shrink-0"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>

      {/* Layer 2 (72px to 108px): Live Advisories bar */}
      <div
        className={cn(
          "h-9 px-6 sm:px-8 overflow-hidden transition-colors duration-300 relative z-10",
          isOverHero
            ? "bg-[#0B1410]/95 backdrop-blur-md border-b border-white/10 text-white"
            : "bg-brand-pine text-white border-b border-brand-pine/20"
        )}
      >
        <div className="h-full max-w-[1280px] mx-auto flex items-center justify-between font-body-sm text-body-sm">
          <div className="flex items-center gap-3 truncate">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/25 text-white font-badge-gov text-badge-gov uppercase shrink-0">
              <span className="material-symbols-outlined text-[14px]">campaign</span>
              Live Advisories
            </div>
            <div className="flex items-center gap-6 overflow-x-auto">
              <span className="flex items-center gap-1.5 font-data-tabular text-[12px] text-white whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-primary-fixed" />ILP Portals: Online
              </span>
              <span className="hidden md:flex items-center gap-1.5 font-data-tabular text-[12px] text-white whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-primary-fixed" />Sela Pass: Open
              </span>
              <span className="hidden lg:flex items-center gap-1.5 font-data-tabular text-[12px] text-secondary-fixed whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed" />Peak Season: Oct – Apr
              </span>
            </div>
          </div>
          <Link href="/permits/checker" className="flex items-center gap-1 font-label-caps text-label-caps uppercase text-primary-fixed hover:text-white shrink-0 transition-colors">
            Check Eligibility
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
