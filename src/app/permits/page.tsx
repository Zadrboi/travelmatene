import EligibilityWizard from "@/components/permits/EligibilityWizard";
import DocumentChecklist from "@/components/permits/DocumentChecklist";
import { PERMITS } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Permits — ILP/PAP/RAP Directory | TravelMateNE" };

export default function PermitsPage() {
  return (
    <div className="pt-[112px] min-h-screen bg-bg-canvas pb-20 md:pb-8">
      <div className="max-w-[1280px] mx-auto px-8 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent-terracotta font-label-caps text-label-caps uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">policy</span>
            Official Gov.in Sources
          </div>
          <h1 className="font-editorial text-4xl lg:text-5xl text-[var(--text-ink)]" style={{ fontOpticalSizing: "none" }}>
            Permits Directory & Eligibility Checker
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted max-w-2xl">
            Inner Line Permits, Protected Area Permits, and Restricted Area Permits. All data sourced from official state portals.
          </p>
        </div>

        {/* Permit cards grid */}
        <section aria-labelledby="permits-grid-heading">
          <h2 id="permits-grid-heading" className="font-headline-md text-headline-md text-[var(--text-ink)] mb-4">State-wise Permit Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERMITS.map(p => (
              <div key={p.state} className="bg-[var(--bg-surface)] rounded-xl p-5 shadow-card space-y-3 border border-border-hairline">
                <div className="flex items-start justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-[var(--text-ink)]">{p.state}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-badge-gov text-badge-gov uppercase",
                    p.type === "open" ? "badge-open" : p.type === "ilp" ? "badge-ilp" : p.type === "pap" ? "badge-pap" : "badge-rap"
                  )}>
                    {p.type.toUpperCase()}
                  </span>
                </div>
                <dl className="space-y-1.5">
                  {[["Fee", p.fee], ["Validity", p.validity]].map(([k, v]) => (
                    <div key={k} className="flex items-center gap-3">
                      <dt className="font-label-caps text-[9px] uppercase text-text-muted w-16 shrink-0">{k}</dt>
                      <dd className="font-data-tabular text-data-tabular text-text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="font-body-sm text-body-sm text-text-muted text-[12px]">{p.notes}</p>
                <a href={p.portal} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-label-caps text-label-caps uppercase text-accent-terracotta hover:underline text-[10px]">
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  Official Portal
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 2-column wizard + checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section aria-labelledby="wizard-heading">
            <h2 id="wizard-heading" className="font-headline-md text-headline-md text-[var(--text-ink)] mb-4">Eligibility Checker</h2>
            <EligibilityWizard />
          </section>
          <section aria-labelledby="checklist-heading">
            <h2 id="checklist-heading" className="font-headline-md text-headline-md text-[var(--text-ink)] mb-4">Document Checklist</h2>
            <DocumentChecklist />
          </section>
        </div>
      </div>
    </div>
  );
}
