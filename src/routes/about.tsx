import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { Card } from "@/components/ui/card";
import { Sprout, Brain, Eye, Mic2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AgriSage" },
      { name: "description", content: "Our mission, the AI technologies behind AgriSage, and how we help farmers grow smarter." },
      { property: "og:title", content: "About AgriSage" },
      { property: "og:description", content: "Mission, technology, and benefits for farmers." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our mission</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-balance">
          Putting an expert agronomist in every farmer's pocket.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Smallholder farmers grow most of the world's food, often with very little access to specialist crop advice. AgriSage uses modern AI vision and language models to deliver that expertise — instantly, in plain language, wherever the farmer is.
        </p>

        <h2 className="mt-16 font-display text-3xl font-semibold">What we believe</h2>
        <ul className="mt-4 space-y-3 text-muted-foreground">
          <li>• Good agronomy advice should be available to every farmer, not just those with paid consultants.</li>
          <li>• AI should reduce — not increase — the amount of jargon farmers face.</li>
          <li>• Diagnoses are only useful if they come with a clear plan and accessible inputs.</li>
        </ul>

        <h2 className="mt-16 font-display text-3xl font-semibold">The AI behind AgriSage</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { icon: Brain, t: "Multimodal LLM", d: "Gemini-class models reason over text and images to provide context-aware advice." },
            { icon: Eye, t: "Vision diagnosis", d: "The vision model inspects your uploaded leaf, fruit or stem photos for disease signs." },
            { icon: Mic2, t: "Voice input", d: "Built-in browser speech recognition lets farmers ask questions hands-free." },
            { icon: ShoppingBag, t: "Product matching", d: "We map diagnoses to active ingredients and surface the products that treat them." },
          ].map((x) => (
            <Card key={x.t} className="rounded-3xl border-border/60 p-6">
              <x.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-display text-xl font-semibold">{x.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
            </Card>
          ))}
        </div>

        <h2 className="mt-16 font-display text-3xl font-semibold">Benefits for farmers</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Catch crop disease early and reduce losses",
            "Save on agronomist consultation fees",
            "Get crop advice 24/7 — even at midnight",
            "Discover nearby shops carrying the inputs you need",
            "Build a private history of every diagnosis",
            "Voice-friendly for busy hands in the field",
          ].map((b) => (
            <div key={b} className="flex items-start gap-3 rounded-2xl border border-border/60 p-4">
              <Sprout className="mt-0.5 h-5 w-5 flex-none text-primary" />
              <p className="text-sm">{b}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
