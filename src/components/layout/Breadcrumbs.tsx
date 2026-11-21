import Link from "next/link";

interface Crumb { label: string; href?: string; }

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-body-sm text-body-sm text-text-muted">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className="text-text-subtle">›</span>}
          {c.href ? (
            <Link href={c.href} className="hover:text-accent-terracotta transition-colors">{c.label}</Link>
          ) : (
            <span className="text-text-ink font-semibold" aria-current="page">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
