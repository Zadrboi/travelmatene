"use client";
import { useCallback, useRef, useState } from "react";
import { useMotion } from "@/context/MotionPreferenceContext";
import { cn } from "@/lib/utils";
import type { SavedItinerary } from "@/types/travel";

const CHIPS = [
  "Best time to visit Meghalaya",
  "ILP for Arunachal Pradesh",
  "Budget circuit under ₹2,000/day",
  "Shared Sumo from Guwahati",
  "Tawang permit process",
];

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  itinerary?: SavedItinerary;
}

function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  function flushList() {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-1 pl-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  }

  function formatInline(str: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-semibold text-[var(--text-ink)]">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={match.index} className="italic">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith("[")) {
        const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={match.index}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-terracotta underline font-medium hover:opacity-80"
            >
              {linkMatch[1]}
            </a>
          );
        } else {
          parts.push(token);
        }
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }
    return parts;
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      elements.push(<div key={`br-${idx}`} className="h-1.5" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={`h4-${idx}`} className="font-semibold text-sm text-[var(--text-ink)] mt-2 mb-1">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${idx}`} className="font-semibold text-base text-[var(--text-ink)] mt-2 mb-1">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const itemContent = trimmed.replace(/^[-*•]\s+/, "");
      currentList.push(
        <li key={`li-${idx}-${currentList.length}`} className="text-[13px] leading-relaxed text-[var(--text-ink)]">
          {formatInline(itemContent)}
        </li>
      );
    } else {
      flushList();
      elements.push(
        <p key={`p-${idx}`} className="text-[13px] leading-relaxed text-[var(--text-ink)]">
          {formatInline(trimmed)}
        </p>
      );
    }
  });

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

function ItineraryPreviewCard({ itinerary }: { itinerary: SavedItinerary }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itinerary),
      });
      const { saveOfflineTrip } = await import("@/lib/offlineStorage");
      await saveOfflineTrip(itinerary);
      setSaved(true);
    } catch (e) {
      console.warn("Save itinerary failed:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--border-hairline)] pb-2.5">
        <div>
          <span className="font-label-caps text-[10px] uppercase text-accent-terracotta tracking-wider font-semibold block">
            Generated Field Circuit
          </span>
          <h4 className="font-editorial text-sm font-semibold text-[var(--text-ink)] leading-snug">
            {itinerary.title}
          </h4>
          <p className="font-data-tabular text-[11px] text-[var(--text-muted)] mt-0.5">
            {itinerary.states?.join(", ")} · {itinerary.days} Days
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-data-tabular text-sm font-bold text-accent-terracotta block">
            ₹{itinerary.totalBudgetINR?.toLocaleString("en-IN")}
          </span>
          <span className="font-badge-gov text-[9px] uppercase text-surface-tint">
            Est. Total
          </span>
        </div>
      </div>

      {itinerary.permitsSummary && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[var(--bg-editorial)] text-[11px] text-[var(--text-ink)]">
          <span className="material-symbols-outlined text-[15px] text-accent-terracotta shrink-0">verified</span>
          <span className="line-clamp-2">{itinerary.permitsSummary}</span>
        </div>
      )}

      {/* Day by Day list */}
      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
        {itinerary.dayByDay?.map((d, i) => (
          <div key={i} className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-xs space-y-0.5">
            <div className="flex items-center justify-between font-semibold text-[var(--text-ink)]">
              <span>Day {d.day}: {d.title}</span>
              <span className="text-accent-terracotta font-data-tabular">₹{d.costINR}</span>
            </div>
            {d.transportTip && (
              <p className="text-[11px] text-[var(--text-muted)] italic">
                {d.transportTip}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saved || saving}
        className={cn(
          "w-full py-2 px-3 rounded-lg font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-colors",
          saved
            ? "bg-status-verified text-white cursor-default"
            : "bg-accent-terracotta text-white hover:bg-accent-rust"
        )}
      >
        <span className="material-symbols-outlined text-[16px]">
          {saved ? "check_circle" : "save_alt"}
        </span>
        {saved ? "Saved to Dashboard & Offline ✓" : saving ? "Saving..." : "Save to Dashboard & Cache Offline"}
      </button>
    </div>
  );
}

export default function ChatWidget() {
  const { isOffline } = useMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  function parseItineraryBlock(text: string): { cleanText: string; itinerary?: SavedItinerary } {
    const match = text.match(/:::itinerary\n([\s\S]*?)(?:\n:::|$)/);
    if (match) {
      try {
        const itinerary = JSON.parse(match[1].trim()) as SavedItinerary;
        const cleanText = text.replace(/:::itinerary\n[\s\S]*?(?:\n:::|$)/, "").trim();
        return { cleanText, itinerary };
      } catch {
        return { cleanText: text };
      }
    }
    return { cleanText: text };
  }

  async function saveItinerary(itinerary: SavedItinerary) {
    try {
      await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itinerary),
      });
    } catch {
      // Silently fail - user can manually save
    }
  }

  async function saveOfflineTripFn(itinerary: SavedItinerary) {
    try {
      const { saveOfflineTrip } = await import("@/lib/offlineStorage");
      await saveOfflineTrip(itinerary);
    } catch {
      // Silently fail
    }
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (isStreaming) return;

    const userMessage = text.trim();
    setMessages(m => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setIsStreaming(true);

    // Pocket mode / offline fallback
    if (isOffline) {
      setMessages(m => [...m, {
        role: "ai",
        text: "You are offline. Permit rules, state checklists, and cached fares are available in the app. Reconnect to get real-time NE-Mitra AI advice.",
      }]);
      setIsStreaming(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
            { role: "user", content: userMessage },
          ],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let aiMessageId = messages.length;
      let accumulatedText = "";
      let itinerarySaved = false;

      setMessages(m => [...m, { role: "ai", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        const { cleanText, itinerary } = parseItineraryBlock(accumulatedText);

        setMessages(m => {
          const newMessages = [...m];
          newMessages[aiMessageId] = { role: "ai", text: cleanText, itinerary };
          return newMessages;
        });

        if (itinerary && !itinerarySaved) {
          itinerarySaved = true;
          await saveItinerary(itinerary);
          await saveOfflineTripFn(itinerary);
        }
      }

      if (!itinerarySaved) {
        const { itinerary } = parseItineraryBlock(accumulatedText);
        if (itinerary) {
          await saveItinerary(itinerary);
          await saveOfflineTripFn(itinerary);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages(m => [...m, {
        role: "ai",
        text: "Connection error. Please check your network and try again. Offline permit data is still available in the Permits section.",
      }]);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isOffline, isStreaming, messages]);

  return (
    <>
      {/* Trigger pill — z-50 with safe footer spacing */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-pine text-white shadow-card hover:shadow-card-hover hover:scale-105 active:scale-95 transition-all font-label-caps text-label-caps uppercase border border-white/10"
          aria-label="Open NE-Mitra AI assistant"
        >
          <span className="material-symbols-outlined text-[18px]">assistant</span>
          <span>NE-Mitra AI</span>
          {isOffline && <span className="w-2 h-2 rounded-full bg-status-amber" title="Offline mode" />}
        </button>
      )}

      {/* Slide-over drawer */}
      {open && (
        <div
          className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-sm bg-[var(--bg-surface)] shadow-2xl border-l border-[var(--border-hairline)]"
          role="dialog"
          aria-label="NE-Mitra AI assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-pine flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-white">assistant</span>
              </div>
              <div>
                <p className="font-headline-sm text-[14px] text-[var(--text-ink)] font-semibold">NE-Mitra AI</p>
                <p className="font-label-caps text-[9px] uppercase text-status-verified flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-verified inline-block" />
                  {isOffline ? "Offline Pocket Mode" : "Online Advisory"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-[var(--bg-editorial)] flex items-center justify-center transition-colors"
              aria-label="Close NE-Mitra AI assistant"
            >
              <span className="material-symbols-outlined text-[18px] text-[var(--text-muted)]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[var(--bg-canvas)]">
            {messages.length === 0 && (
              <div className="text-center py-10 px-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                </div>
                <p className="font-headline-sm text-sm text-[var(--text-ink)]">Ask NE-Mitra anything</p>
                <p className="font-body-sm text-xs text-[var(--text-muted)]">
                  Ask about ILP/PAP permit rules, shared Sumo pickup stands, circuits, or day-by-day travel costs across all 8 Sister States.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className="space-y-1">
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 shadow-sm",
                    m.role === "user"
                      ? "ml-auto bg-brand-pine text-white"
                      : "bg-[var(--bg-editorial)] text-[var(--text-ink)] border border-[var(--border-hairline)]"
                  )}
                >
                  {m.role === "user" ? (
                    <p className="text-[13px] leading-relaxed">{m.text}</p>
                  ) : (
                    renderMarkdown(m.text)
                  )}
                </div>
                {m.itinerary && (
                  <ItineraryPreviewCard itinerary={m.itinerary} />
                )}
              </div>
            ))}
          </div>

          {/* Quick prompt chips */}
          {messages.length === 0 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-[var(--bg-surface)] border-t border-[var(--border-hairline)]">
              {CHIPS.map(c => (
                <button
                  key={c}
                  onClick={() => sendMessage(c)}
                  className="shrink-0 px-3 py-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)] font-body-sm text-[var(--text-muted)] hover:border-accent-terracotta hover:text-accent-terracotta transition-colors whitespace-nowrap text-[11px]"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about permits, routes, circuits…"
              className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-hairline)] font-body-sm text-body-sm text-[var(--text-ink)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-brand-pine"
            />
            <button
              onClick={() => sendMessage(input)}
              className="w-9 h-9 rounded-xl bg-accent-terracotta text-white flex items-center justify-center hover:bg-accent-rust transition-colors shadow-sm shrink-0"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
