// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Mail, Gauge, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative flex flex-1 items-center justify-center px-8">
        {/* Decorative gradients */}
        <div className="pointer-events-none absolute -z-10 inset-0">
          <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 via-accent/25 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-gradient-to-tr from-accent/20 to-transparent blur-2xl" />
        </div>
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full items-center">
          {/* Left Section */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-snug">
              Find the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">right profiles</span> fast.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Upload a JD, rank consultant profiles instantly, and email results—all in one step.
            </p>

            <div className="flex flex-wrap gap-4">
              {user ? (
                <>
                  {user.role === "AR Requestor" && (
                    <Button variant="accent" size="lg" onClick={() => router.push("/ar-dashboard")}>
                      AR Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {user.role === "Recruiter Admin" && (
                    <Button variant="accent" size="lg" onClick={() => router.push("/recruiter-admin")}>
                      Recruiter Admin <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="accent" size="lg" onClick={signOut}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="accent" size="lg" onClick={() => router.push("/login")}>
                    Log In
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => router.push("/signup")}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-2">
              <Stat label="Profiles Ranked" value="10k+" />
              <Stat label="Time Saved" value="68%" />
              <Stat label="PDF Export" value="Yes" />
            </div>
          </div>

          {/* Right Section */}
          <div className="rounded-xl border bg-card shadow p-8 space-y-6">
            <Feature
              icon={<Gauge className="h-5 w-5" />}
              title="Fast comparisons"
              text="AI ranks matches in seconds."
            />
            <Feature
              icon={<Mail className="h-5 w-5" />}
              title="One-click emails"
              text="Send results instantly."
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              title="Secure"
              text="Data stays private."
            />
            <ul className="space-y-2 text-sm">
              {[
                "Upload once, reuse anytime",
                "Top-3 preview + full results",
                "Download resumes as PDFs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-6 py-6 grid gap-6 md:grid-cols-3 text-sm">
          <div>
            <div className="font-semibold text-base">Profile Ranker</div>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              AI assistance for faster, smarter candidate matching.
            </p>
          </div>
          <div>
            <div className="font-semibold text-base">Product</div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li><a href="/ar-dashboard" className="hover:underline">AR Dashboard</a></li>
              <li><a href="/recruiter-admin" className="hover:underline">Recruiter Admin</a></li>
              <li><a href="/ar-dashboard/compare" className="hover:underline">Compare & Rank</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-base">Account</div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {user ? (
                <li>
                  <button className="hover:underline" onClick={signOut}>
                    Sign out
                  </button>
                </li>
              ) : (
                <>
                  <li><a href="/login" className="hover:underline">Log in</a></li>
                  <li><a href="/signup" className="hover:underline">Create account</a></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="container mx-auto px-6 py-4 text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Profile Ranker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-md border border-accent/30 bg-accent/10 p-3 text-accent">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
