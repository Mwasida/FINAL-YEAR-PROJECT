import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AgriSage" },
      { name: "description", content: "Get in touch with the AgriSage team — questions, partnerships, or support." },
      { property: "og:title", content: "Contact AgriSage" },
      { property: "og:description", content: "Reach the AgriSage team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Get in touch</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-balance">
            We'd love to hear from you.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Questions, feedback, or partnership ideas? Drop us a note and we'll get back to you within one business day.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /> hello@agrisage.app</div>
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /> +1 (555) 010-0142</div>
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /> 12 Greenfield Lane, Pune, India</div>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-border/60 shadow-soft">
            <iframe
              title="Map"
              src="https://www.google.com/maps?q=Pune,India&output=embed"
              className="h-64 w-full"
              loading="lazy"
            />
          </div>
        </div>

        <Card className="rounded-3xl border-border/60 p-8 shadow-soft">
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              await new Promise((r) => setTimeout(r, 700));
              setSubmitting(false);
              toast.success("Thanks! We'll be in touch soon.");
              (e.currentTarget as HTMLFormElement).reset();
            }}
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required maxLength={100} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required maxLength={255} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" required maxLength={1000} rows={5} className="mt-1.5" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full rounded-full">
              {submitting ? "Sending..." : "Send message"}
            </Button>
          </form>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
}
