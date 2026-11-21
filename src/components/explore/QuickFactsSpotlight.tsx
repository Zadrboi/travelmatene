"use client";
import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/context/MotionPreferenceContext";
import SafeImage from "@/components/ui/SafeImage";

interface Fact { label: string; value: string; }

interface QuickFactsProps {
  title: string;
  subtitle?: string;
  audioSummary: string;
  facts: Fact[];
  portrait: string;
  portraitAlt: string;
}

export default function QuickFactsSpotlight({ title, subtitle, audioSummary, facts, portrait, portraitAlt }: QuickFactsProps) {
  const { prefersReducedMotion, isLiteMode } = useMotion();
  const reduced = prefersReducedMotion || isLiteMode;
  const sectionRef = useRef<HTMLElement>(null);
  const portraitImgRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reduced);
  const [playing, setPlaying] = useState(false);

  // ── IntersectionObserver reveal ──
  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [reduced]);

  // ── Scroll parallax on 2:3 portrait (±7%) ──
  useEffect(() => {
    if (reduced) return;
    function onScroll() {
      if (!portraitImgRef.current || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
        // Map progress 0..1 to -7%..+7% translateY
        const offsetPercent = (progress - 0.5) * 14;
        portraitImgRef.current.style.transform = `scale(1.08) translateY(${offsetPercent}%)`;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  // ── Web Speech API ──
  function toggleAudio() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(audioSummary);
      utterance.rate = 0.95;
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    }
  }

  // Split title into space-separated words for word-safe wrapping
  const words = title.toUpperCase().split(" ");

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[var(--bg-editorial)] py-16 overflow-hidden border-y border-[var(--border-hairline)]"
      aria-label={`Quick facts spotlight: ${title}`}
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        {/* 3-column editorial grid (1.12fr / 1.12fr / 0.96fr) */}
        <div className="grid grid-cols-1 lg:[grid-template-columns:1.12fr_1.12fr_0.96fr] gap-8 lg:gap-12 items-start">
          {/* Col 1 — Terracotta micro-label, stacked title + 84px rotating radial SVG play badge */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-accent-terracotta font-label-caps text-label-caps uppercase tracking-widest font-bold">
                <span className="w-2.5 h-[2px] bg-accent-terracotta" />
                Field Dossier & Audio Brief
              </div>

              <div className="flex items-start gap-4">
                {/* 84px 48-tick rotating radial SVG play badge */}
                <button
                  onClick={toggleAudio}
                  className="shrink-0 w-[84px] h-[84px] relative group focus:outline-none focus:ring-2 focus:ring-accent-terracotta rounded-full"
                  title={playing ? "Pause 30-second audio summary" : "Play 30-second audio briefing"}
                  aria-label={playing ? "Pause audio summary" : "Listen to audio destination briefing"}
                >
                  <svg
                    viewBox="0 0 84 84"
                    className={`w-[84px] h-[84px] transition-transform ${!reduced ? "animate-[spin_12s_linear_infinite]" : ""}`}
                    aria-hidden="true"
                  >
                    {Array.from({ length: 48 }, (_, i) => {
                      const angle = (i / 48) * 2 * Math.PI - Math.PI / 2;
                      const r1 = 38;
                      const r2 = i % 4 === 0 ? 28 : 32;
                      const isQuarter = i % 12 === 0;
                      return (
                        <line
                          key={i}
                          x1={42 + r2 * Math.cos(angle)}
                          y1={42 + r2 * Math.sin(angle)}
                          x2={42 + r1 * Math.cos(angle)}
                          y2={42 + r1 * Math.sin(angle)}
                          stroke={isQuarter ? "#E0531F" : i % 4 === 0 ? "var(--text-ink)" : "var(--text-muted)"}
                          strokeWidth={isQuarter ? "2" : "1.5"}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-[var(--bg-surface)] text-accent-terracotta flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">
                        {playing ? "pause" : "play_arrow"}
                      </span>
                    </span>
                  </span>
                </button>

                {/* Stacked Bodoni Moda title with character-by-character rise (28ms stagger) & word-safe wrapping */}
                <h2
                  className="font-editorial text-2xl sm:text-3xl lg:text-[2.05rem] xl:text-[2.25rem] font-semibold text-[var(--text-ink)] leading-[1.12] tracking-tight"
                  aria-label={title.toUpperCase()}
                  style={{ fontOpticalSizing: "none", fontVariationSettings: '"opsz" 11' }}
                >
                  {(() => {
                    let charIndex = 0;
                    return words.map((word, wIdx) => {
                      const letters = word.split("");
                      return (
                        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em] last:mr-0">
                          {letters.map((ch) => {
                            const delay = charIndex * 28;
                            charIndex++;
                            return (
                              <span key={charIndex} className="char-split-wrap">
                                <span
                                  aria-hidden="true"
                                  className={`char-split-inner ${visible ? "visible" : ""}`}
                                  style={visible ? {
                                    transform: "translateY(0) rotate(0deg)",
                                    opacity: 1,
                                    transitionDelay: `${delay}ms`,
                                  } : {}}
                                >
                                  {ch}
                                </span>
                              </span>
                            );
                          })}
                        </span>
                      );
                    });
                  })()}
                </h2>
              </div>
            </div>

            {subtitle && (
              <p
                className="font-body-md text-body-md text-[var(--text-muted)] font-medium"
                style={visible && !reduced ? { opacity: 1, transform: "translateY(0)", transition: "all 0.6s ease 0.3s" } : { opacity: reduced ? 1 : 0, transform: reduced ? "none" : "translateY(12px)" }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Col 2 — Concise documentary paragraph + hairline key-value table */}
          <div className="space-y-5">
            <p className="font-body-md text-body-md text-[var(--text-muted)] leading-relaxed">
              Audited by district transit councils and eco-tourism boards. Real-time road clearance, inner-line permit checklists, and verified shared vehicle departure stands.
            </p>

            <table className="w-full" role="table" aria-label="Destination key facts">
              <tbody>
                {facts.map((f, i) => (
                  <tr
                    key={f.label}
                    className="border-b border-[var(--border-hairline)]"
                    style={visible && !reduced ? {
                      opacity: 1,
                      transform: "translateY(0)",
                      transition: `all 0.5s ease ${i * 70}ms`,
                    } : {
                      opacity: reduced ? 1 : 0,
                      transform: reduced ? "none" : "translateY(10px)",
                    }}
                  >
                    <td className="py-3 pr-4 font-label-caps text-label-caps uppercase text-[var(--text-muted)] whitespace-nowrap">
                      {f.label}
                    </td>
                    <td className="py-3 font-data-tabular text-data-tabular text-[var(--text-ink)] font-semibold text-right sm:text-left">
                      {f.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Col 3 — Tall 2:3 verified documentary portrait wiping upward via clip-path: inset(100% 0 0 0) → inset(0) with ±7% scroll parallax */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-card aspect-[2/3] w-full max-w-sm mx-auto lg:max-w-none bg-[var(--bg-surface)] border border-[var(--border-hairline)]"
          >
            <div
              ref={portraitImgRef}
              className="w-full h-full relative"
              style={visible && !reduced ? {
                clipPath: "inset(0 0 0 0)",
                transition: "clip-path 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
              } : {
                clipPath: reduced ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
              }}
            >
              <SafeImage
                src={portrait}
                alt={portraitAlt}
                fallbackTitle={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="font-badge-gov text-badge-gov uppercase px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                  Field Photography Node
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
