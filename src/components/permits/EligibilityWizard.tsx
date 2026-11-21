"use client";
import { useState } from "react";
import { PERMITS } from "@/lib/data";
import type { NEState } from "@/lib/data";

type Answer = { state?: NEState; nationality?: string; purpose?: string };

export default function EligibilityWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [result, setResult] = useState<typeof PERMITS[0] | null>(null);

  const NE_ILP_STATES: NEState[] = ["Arunachal Pradesh", "Nagaland", "Manipur", "Mizoram", "Sikkim"];

  function compute(a: Answer) {
    if (!a.state) return;
    const permit = PERMITS.find(p => p.state === a.state);
    setResult(permit ?? null);
    setStep(3);
  }

  if (step === 3 && result) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4 shadow-card">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-[22px] ${result.type === "open" ? "text-status-verified" : "text-status-amber"}`}>
            {result.type === "open" ? "check_circle" : "policy"}
          </span>
          <h3 className="font-headline-sm text-headline-sm text-brand-pine">{result.state} — {result.type.toUpperCase()}</h3>
        </div>
        <dl className="space-y-2">
          {[["Permit Type", result.type.toUpperCase()], ["Fee", result.fee], ["Validity", result.validity], ["Portal", result.portal]].map(([k, v]) => (
            <div key={k} className="flex items-start gap-4">
              <dt className="font-label-caps text-label-caps uppercase text-text-muted w-24 shrink-0">{k}</dt>
              <dd className="font-data-tabular text-data-tabular text-text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="font-body-sm text-body-sm text-text-muted bg-surface-container p-3 rounded-lg">{result.notes}</p>
        <div className="flex gap-3">
          <a href={result.portal} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-pine text-white font-label-caps text-label-caps uppercase hover:bg-brand-pine/80 transition-colors">
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Apply Online
          </a>
          <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
            className="px-4 py-2 rounded-lg border border-border-hairline font-label-caps text-label-caps uppercase text-text-muted hover:bg-surface-container transition-colors">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card space-y-6">
      {/* Progress */}
      <div className="flex gap-1" role="progressbar" aria-valuenow={step} aria-valuemax={2}>
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-accent-terracotta" : "bg-surface-container-high"}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-brand-pine">Which state are you visiting?</h3>
          <div className="grid grid-cols-2 gap-2">
            {PERMITS.map(p => (
              <button key={p.state}
                onClick={() => { setAnswers(a => ({ ...a, state: p.state as NEState })); setStep(1); }}
                className="text-left px-4 py-3 rounded-xl border border-border-hairline hover:border-accent-terracotta hover:bg-surface-container transition-colors font-body-sm text-body-sm text-text-ink">
                {p.state}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-brand-pine">Your nationality?</h3>
          {["Indian Citizen", "OCI / PIO Cardholder", "Foreign National"].map(n => (
            <button key={n}
              onClick={() => { setAnswers(a => ({ ...a, nationality: n })); setStep(2); }}
              className="w-full text-left px-4 py-3 rounded-xl border border-border-hairline hover:border-accent-terracotta hover:bg-surface-container transition-colors font-body-md text-body-md text-text-ink">
              {n}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-brand-pine">Purpose of visit?</h3>
          {["Tourism / Leisure", "Research / Academic", "Business", "Media / Journalism"].map(p => (
            <button key={p}
              onClick={() => { const a = { ...answers, purpose: p }; setAnswers(a); compute(a); }}
              className="w-full text-left px-4 py-3 rounded-xl border border-border-hairline hover:border-accent-terracotta hover:bg-surface-container transition-colors font-body-md text-body-md text-text-ink">
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
