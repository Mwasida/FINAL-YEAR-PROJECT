import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminStats } from "@/lib/admin.functions";
import { Users, Package, Camera, MessageSquareText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fn = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  const stats = [
    { label: "Total users", value: data?.totalUsers ?? 0, icon: Users, accent: "bg-sky-500/20 text-sky-300" },
    { label: "Farmers", value: data?.farmerCount ?? 0, icon: Users, accent: "bg-emerald-500/20 text-emerald-300" },
    { label: "Products", value: data?.totalProducts ?? 0, icon: Package, accent: "bg-amber-500/20 text-amber-300" },
    { label: "Diagnoses", value: data?.totalDiagnoses ?? 0, icon: Camera, accent: "bg-fuchsia-500/20 text-fuchsia-300" },
    { label: "Conversations", value: data?.totalThreads ?? 0, icon: MessageSquareText, accent: "bg-indigo-500/20 text-indigo-300" },
    { label: "Admins", value: data?.adminCount ?? 0, icon: Users, accent: "bg-rose-500/20 text-rose-300" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{s.label}</span>
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${s.accent}`}>
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 font-display text-4xl font-semibold text-white">
              {isLoading ? "—" : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/admin/products"
          className="group rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/20 to-amber-500/5 p-6 transition hover:border-amber-400/50"
        >
          <Package className="h-6 w-6 text-amber-300" />
          <h3 className="mt-3 font-display text-xl font-semibold">Manage products</h3>
          <p className="mt-1 text-sm text-slate-300">Add, edit, and remove products in the catalog.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-300 group-hover:gap-2 transition-all">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          to="/admin/users"
          className="group rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/20 to-sky-500/5 p-6 transition hover:border-sky-400/50"
        >
          <Users className="h-6 w-6 text-sky-300" />
          <h3 className="mt-3 font-display text-xl font-semibold">View registered users</h3>
          <p className="mt-1 text-sm text-slate-300">See every farmer and admin who signed up.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-300 group-hover:gap-2 transition-all">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
