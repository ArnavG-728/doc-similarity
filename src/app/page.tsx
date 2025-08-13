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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <Header />

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-30 blur-3xl bg-[radial-gradient(1200px_600px_at_50%_-10%,hsl(var(--primary)/0.3),transparent)]" />
          <div className="container mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                AI-powered recruiting assistant
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
                Find the <span className="text-primary">right profiles</span> for every JD—fast.
              </h1>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                Upload job descriptions, compare consultant profiles, rank matches, and email
                PDFs—all in one place. Built for AR Requestors and Recruiter Admins.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {user ? (
                  <>
                    {user.role === "AR Requestor" && (
                      <Button size="lg" onClick={() => router.push("/ar-dashboard")}>
                        Go to AR Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {user.role === "Recruiter Admin" && (
                      <Button size="lg" onClick={() => router.push("/recruiter-admin")}>
                        Go to Recruiter Admin <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="lg" onClick={signOut}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" onClick={() => router.push("/login")}>
                      Log In
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => router.push("/signup")}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6 max-w-lg">
                <Stat label="Profiles Ranked" value="10k+" />
                <Stat label="Avg. Time Saved" value="68%" />
                <Stat label="Email Attachments" value="PDF-ready" />
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl border bg-card shadow-sm p-6 md:p-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-xl">Why Profile Ranker?</h3>
                  <Feature
                    icon={<Gauge className="h-5 w-5" />}
                    title="Lightning-fast comparisons"
                    text="AI ranks top matches from multiple profiles against your JD in seconds."
                  />
                  <Feature
                    icon={<Mail className="h-5 w-5" />}
                    title="One-click emails"
                    text="Send results with attached PDFs to ARs or recruiters directly."
                  />
                  <Feature
                    icon={<Shield className="h-5 w-5" />}
                    title="Secure by design"
                    text="Your data stays private. We use least-privilege and app passwords for SMTP."
                  />
                </div>

                <ul className="mt-6 space-y-2 text-sm">
                  {[
                    "Upload JD once, reuse anytime",
                    "Top-3 preview + full results",
                    "Download resumes as PDFs quickly",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How it works</h2>
          <p className="text-muted-foreground mt-2">
            A simple three-step flow designed for speed and clarity.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Step
              number="1"
              title="Upload JDs & Profiles"
              text="Add job descriptions and consultant profiles (PDF/Docx/Txt)."
            />
            <Step
              number="2"
              title="Compare & Rank"
              text="Our agents analyze, score, and rank candidates against the JD."
            />
            <Step
              number="3"
              title="Share Results"
              text="Email ARs or recruiters with the top matches and PDF attachments."
            />
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-muted/50 border-t">
          <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Ready to speed up your shortlisting?</h3>
              <p className="text-muted-foreground">
                Start by uploading your first JD or jump straight into your dashboard.
              </p>
            </div>
            <div className="flex gap-3">
              {user ? (
                <>
                  {user.role === "AR Requestor" && (
                    <Button onClick={() => router.push("/ar-dashboard/upload")}>Upload JD</Button>
                  )}
                  <Button variant="outline" onClick={() => router.push("/ar-dashboard")}>
                    Open Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => router.push("/signup")}>Create Account</Button>
                  <Button variant="outline" onClick={() => router.push("/login")}>
                    Log In
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 grid gap-6 md:grid-cols-3">
          <div>
            <div className="font-semibold">Profile Ranker</div>
            <p className="text-sm text-muted-foreground mt-2">
              AI assistance for faster, smarter candidate matching.
            </p>
          </div>
          <div>
            <div className="font-semibold">Product</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <a href="/ar-dashboard" className="hover:underline">
                  AR Dashboard
                </a>
              </li>
              <li>
                <a href="/recruiter-admin" className="hover:underline">
                  Recruiter Admin
                </a>
              </li>
              <li>
                <a href="/ar-dashboard/compare" className="hover:underline">
                  Compare & Rank
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Account</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {user ? (
                <>
                  <li>
                    <button className="hover:underline" onClick={signOut}>
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a href="/login" className="hover:underline">
                      Log in
                    </a>
                  </li>
                  <li>
                    <a href="/signup" className="hover:underline">
                      Create account
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Profile Ranker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
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
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md border bg-background p-2">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
        {number}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}