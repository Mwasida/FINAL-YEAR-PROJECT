import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { dashboardStats } from "@/lib/catalog.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Camera, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AgriSage" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(dashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fn() });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Welcome back</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">Your farm at a glance</h1>
        </div>
        <Button asChild className="hidden rounded-full md:inline-flex">
          <Link to="/diagnose"><Camera className="mr-1 h-4 w-4" /> New diagnosis</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Conversations" value={data?.totalConversations ?? 0} icon={MessageSquareText} loading={isLoading} />
        <StatCard label="Diagnoses" value={data?.totalDiagnoses ?? 0} icon={Camera} loading={isLoading} />
        <StatCard label="Products available" value={data?.totalProducts ?? 0} icon={ShoppingBag} loading={isLoading} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-border/60 p-6 lg:col-span-2">
          <h2 className="font-display text-2xl font-semibold">Recent diagnoses</h2>
          {isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : data?.recentDiagnoses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No diagnoses yet.</p>
              <Button asChild className="mt-4 rounded-full">
                <Link to="/diagnose">Start your first <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data!.recentDiagnoses.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{d.disease_name}</div>
                    <div className="text-xs text-muted-foreground">{d.crop} · {new Date(d.created_at).toLocaleString()}</div>
                  </div>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                    {Math.round((Number(d.confidence) || 0) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="rounded-3xl border-border/60 bg-leaf p-6 text-primary-foreground shadow-glow">
          <Sparkles className="h-6 w-6" />
          <h3 className="mt-3 font-display text-2xl font-semibold">Ask AgriSage</h3>
          <p className="mt-2 text-sm text-primary-foreground/85">Get instant advice on any crop, pest, or fertilizer question.</p>
          <Button asChild className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/chat">Open chat</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, loading }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; loading: boolean }) {
  return (
    <Card className="rounded-3xl border-border/60 p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 font-display text-4xl font-semibold">{loading ? "—" : value}</div>
    </Card>
  );
}
