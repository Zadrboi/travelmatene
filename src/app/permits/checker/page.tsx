import EligibilityWizard from "@/components/permits/EligibilityWizard";
import DocumentChecklist from "@/components/permits/DocumentChecklist";

export const metadata = { title: "Permit Eligibility Checker | TravelMateNE" };

export default function PermitCheckerPage() {
  return (
    <div className="pt-[112px] min-h-screen bg-bg-canvas pb-20 md:pb-8">
      <div className="max-w-[1280px] mx-auto px-8 py-12">
        <div className="mb-8 space-y-2">
          <h1 className="font-editorial text-4xl text-brand-pine" style={{ fontOpticalSizing: "none" }}>Permit Eligibility Checker</h1>
          <p className="font-body-md text-body-md text-text-muted">Answer 3 questions to get the exact permit you need and direct link to the official portal.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EligibilityWizard />
          <DocumentChecklist />
        </div>
      </div>
    </div>
  );
}
