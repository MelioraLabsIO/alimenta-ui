// src/app/(marketing)/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Leaf, BarChart2, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border/40 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold tracking-tight text-primary">
          🌿 Alimenta
        </span>
        <Link href="/login">
          <Button size="sm">Sign In</Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto w-full gap-6">
        <Badge variant="secondary" className="text-xs px-3 py-1">
          Food + Wellness Discovery
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Eat well.{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Feel better.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Alimenta helps you discover which foods fuel your mood, energy, and
          digestion — not just count calories. Log meals, spot patterns, and
          build a diet that actually works for you.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Learn more
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Leaf className="h-6 w-6 text-emerald-400" />,
              title: "Smart Meal Logging",
              desc: "Log meals manually or just describe them in plain English — Alimenta parses the rest.",
            },
            {
              icon: <BarChart2 className="h-6 w-6 text-teal-400" />,
              title: "Trend Insights",
              desc: "See how your food choices correlate with mood, energy, and digestion over time.",
            },
            {
              icon: <Zap className="h-6 w-6 text-yellow-400" />,
              title: "Personalized Patterns",
              desc: "Discover your top foods, consistency streaks, and what to eat more (or less) of.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border/50 bg-card p-6 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-semibold text-base">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Alimenta. Built for your wellbeing.
      </footer>
    </main>
  );
}
