export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-terracotta focus:text-white focus:rounded-lg focus:shadow-lg focus:font-sans focus:text-sm focus:font-semibold focus:uppercase focus:tracking-wider"
    >
      Skip to main content
    </a>
  );
}
