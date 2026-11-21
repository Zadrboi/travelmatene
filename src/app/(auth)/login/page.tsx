"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          setError("Your email has not been confirmed yet. Please verify your inbox or use Demo Sign-In below.");
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials or create a new account.");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        if (
          oauthError.message.includes("Unsupported provider") ||
          oauthError.message.includes("not enabled") ||
          oauthError.message.includes("provider is not enabled")
        ) {
          setError(
            "Google OAuth not enabled on this Supabase project yet — use Email/Password or Demo Traveler Sign-In below."
          );
        } else {
          setError(oauthError.message);
        }
        setOauthLoading(false);
      }
    } catch (err: any) {
      setError(
        "Google OAuth not enabled on this Supabase project yet — use Email/Password or Demo Traveler Sign-In below."
      );
      setOauthLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    // Set demo cookie and localStorage session for instant preview mode
    document.cookie = "travelmate_demo=true; path=/; max-age=86400; SameSite=Lax";
    localStorage.setItem("travelmate_demo", "true");
    router.push("/dashboard");
  };

  return (
    <div className="pt-[108px] min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--bg-surface)] rounded-2xl shadow-card border border-[var(--border-hairline)] p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-xl bg-brand-pine flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[22px] text-white">landscape</span>
            </div>
            <h1 className="font-editorial text-2xl text-[var(--text-ink)] mt-3" style={{ fontOpticalSizing: "none" }}>
              Sign in
            </h1>
            <p className="font-body-sm text-body-sm text-[var(--text-muted)]">
              Access saved trips, offline permits, and transit passes
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="p-3.5 rounded-xl bg-accent-terracotta/10 border border-accent-terracotta/20 text-accent-terracotta text-body-sm flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out]"
              role="alert"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <p className="leading-snug text-xs sm:text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Google OAuth with high-contrast theme-aware styling */}
          <button
            onClick={handleGoogleSignIn}
            disabled={oauthLoading}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[var(--bg-canvas)] text-[var(--text-ink)] border border-[var(--border-hairline)] font-label-caps text-label-caps uppercase hover:bg-[var(--bg-editorial)] transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{oauthLoading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border-hairline)]" />
            <span className="font-label-caps text-label-caps text-[var(--text-subtle)] uppercase">or</span>
            <div className="flex-1 h-px bg-[var(--border-hairline)]" />
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div>
              <label className="font-label-caps text-label-caps uppercase text-[var(--text-muted)] block mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-hairline)] font-body-md text-body-md text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-brand-pine"
              />
            </div>
            <div>
              <label className="font-label-caps text-label-caps uppercase text-[var(--text-muted)] block mb-1">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-hairline)] font-body-md text-body-md text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-brand-pine"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-pine text-white font-label-caps text-label-caps uppercase tracking-wider hover:bg-brand-pine/80 transition-colors shadow-sm disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Demo Sign-In Link */}
          <div className="pt-2 border-t border-[var(--border-hairline)] text-center">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="inline-flex items-center gap-1.5 text-xs text-brand-pine dark:text-primary-fixed hover:underline font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">badge</span>
              <span>Quick Demo Sign-In (Judge / Preview Mode) →</span>
            </button>
          </div>

          <p className="text-center font-body-sm text-body-sm text-[var(--text-muted)]">
            New here?{" "}
            <Link href="/register" className="text-accent-terracotta hover:underline font-semibold">
              Create account
            </Link>
          </p>
          <p className="text-center font-label-caps text-[9px] uppercase text-[var(--text-subtle)]">
            Secured with Supabase RLS — your data never leaves the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
