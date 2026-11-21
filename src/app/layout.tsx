import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "@/app/globals.css";
import { MotionPreferenceProvider } from "@/context/MotionPreferenceContext";
import { FlipTransitionProvider } from "@/context/FlipTransitionContext";
import SkipToContent from "@/components/accessibility/SkipToContent";
import OfflineBanner from "@/components/offline/OfflineBanner";
import SWRegister from "@/components/offline/SWRegister";
import NavbarShell from "@/components/layout/NavbarShell";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ChatWidget from "@/components/ai/ChatWidget";

export const metadata: Metadata = {
  title:       "TravelMateNE — North East India Tourism Explorer",
  description: "Plan your North East India trip with verified shared Sumo fares, automated ILP/PAP protocols, offline maps, and council-vetted homestays across all 8 Sister States.",
  keywords:    ["North East India", "ILP permit", "Shared Sumo", "Meghalaya", "Arunachal Pradesh", "Nagaland", "Manipur", "Mizoram"],
  manifest:    "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#12372A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Gilda+Display&family=Inter:wght@300;400;500;600;700&family=Urbanist:wght@300;400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <MotionPreferenceProvider>
            <FlipTransitionProvider>
              <SkipToContent />
              <OfflineBanner />
              <SWRegister />
              <NavbarShell />
              <main id="main-content">
                {children}
              </main>
              <MobileBottomNav />
              <ChatWidget />
            </FlipTransitionProvider>
          </MotionPreferenceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
