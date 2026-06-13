import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import {
  Sprout, MessageSquareText, Mic, Camera, ShoppingBag, MapPin,
  Leaf, Sparkles, ShieldCheck, Languages, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriSage — AI Agricultural Advisor for Farmers" },
      { name: "description", content: "Chat with an AI agronomist, detect crop diseases from a photo, and find the right products and shops near you." },
      { property: "og:title", content: "AgriSage — AI Agricultural Advisor" },
      { property: "og:description", content: "AI-powered crop diagnosis, chat advice, and product recommendations for farmers." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: MessageSquareText, title: "AI Chat Advisor", desc: "Ask anything about crops, soil, pests, or fertilizers and get instant expert guidance." },
  { icon: Camera, title: "Photo Disease Detection", desc: "Snap a leaf — our vision AI identifies the disease with confidence scores and treatment steps." },
  { icon: Mic, title: "Voice Input", desc: "Speak your question in the field. No typing needed — perfect for busy hands." },
  { icon: ShoppingBag, title: "Product Recommendations", desc: "Get the exact fungicide, pesticide or fertilizer that fits your diagnosis." },
  { icon: MapPin, title: "Find Nearby Shops", desc: "See which local shops carry the recommended product, with contact details." },
  { icon: ShieldCheck, title: "Always Private", desc: "Your conversations, photos and history are tied to your account — never shared." },
];

const STEPS = [
  { n: "01", t: "Ask or upload", d: "Type a question, speak it, or upload a photo of an affected plant." },
  { n: "02", t: "AI analyzes", d: "Our agronomy-trained AI identifies the issue and tailors the response." },
  { n: "03", t: "Get a plan", d: "Receive treatment steps, recommended products, and nearby shops." },
];

const TESTIMONIALS = [
  { name: "Ravi Kumar", role: "Tomato farmer, Maharashtra", q: "Caught early blight in two days. Saved my entire harvest." },
  { name: "Aisha Bello", role: "Rice grower, Kano", q: "The voice input is brilliant — I just talk to it while I walk the field." },
  { name: "Carlos Mendes", role: "Maize farmer, Minas Gerais", q: "Cheaper than the agronomist visit and the advice is solid." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,oklch(1_0_0/.18),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32">
          <div className="text-primary-foreground">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Lovable AI
            </div>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
              Your AI agronomist, <span className="text-accent">always in the field.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
              Chat, snap a photo, or speak — AgriSage diagnoses crop diseases, recommends treatments, and points you to local shops carrying the products you need.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start free diagnosis <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/10 text-primary-foreground backdrop-blur hover:bg-white/20">
                <Link to="/about">How it works</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2"><Leaf className="h-4 w-4" /> 50+ diseases</div>
              <div className="flex items-center gap-2"><Languages className="h-4 w-4" /> Voice-ready</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Private</div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/20 bg-card/95 p-6 shadow-glow backdrop-blur">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success" /> AgriSage online
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                  My tomato leaves have brown spots with yellow rings. What's happening?
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-foreground">
                  <p className="font-medium text-primary">Likely Tomato Early Blight (Alternaria solani).</p>
                  <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                    <li>Remove affected leaves at the base</li>
                    <li>Apply Mancozeb 75% WP — 2g/L water</li>
                    <li>Mulch + avoid overhead watering</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-accent/20 px-4 py-3 text-sm">
                  <span className="font-medium">Found 3 products at Green Valley Agro</span> — 12 Market Rd
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl bg-card px-5 py-3 shadow-soft md:flex md:items-center md:gap-3">
              <Sprout className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-semibold">94% confidence</div>
                <div className="text-xs text-muted-foreground">Photo analyzed in 2.1s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Everything farmers need</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-balance sm:text-5xl">One advisor. Every question.</h2>
          <p className="mt-4 text-muted-foreground">From diagnosing a sick plant to finding the bag of fungicide that fixes it.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group rounded-3xl border-border/60 p-6 transition hover:shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf text-primary-foreground transition group-hover:scale-105">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Diagnose in three steps.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-3xl bg-card p-8 shadow-soft">
                <div className="font-display text-5xl font-semibold text-primary/30">{s.n}</div>
                <h3 className="mt-4 font-display text-2xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">Loved by farmers worldwide.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="rounded-3xl border-border/60 p-6">
              <p className="font-display text-lg leading-snug">“{t.q}”</p>
              <div className="mt-6">
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-hero p-12 text-center text-primary-foreground shadow-glow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(1_0_0/.2),transparent_60%)]" />
          <div className="relative">
            <h2 className="font-display text-4xl font-semibold text-balance sm:text-5xl">
              Try AgriSage on your next sick plant.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Free to start. No card required. Get your first AI diagnosis in under a minute.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Create free account <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
