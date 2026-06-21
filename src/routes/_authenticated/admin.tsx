import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { isCurrentUserAdmin } from "@/lib/admin.functions";
import { Shield, LayoutDashboard, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — AgriSage" }] }),
  component: AdminLayout,
});

const TABS: ReadonlyArray<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
];

function AdminLayout() {
  const fn = useServerFn(isCurrentUserAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["is-admin"], queryFn: () => fn() });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) {
    return <div className="p-10 text-muted-foreground">Checking access…</div>;
  }
  if (!data?.isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <Shield className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">Your account does not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Admin Console</p>
              <h1 className="font-display text-2xl font-semibold">AgriSage Administration</h1>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to as any}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-amber-400 text-slate-950 shadow"
                      : "bg-white/5 text-slate-200 hover:bg-white/10",
                  )}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <Outlet />
      </div>
    </div>
  );
}
