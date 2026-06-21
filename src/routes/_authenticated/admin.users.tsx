import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listUsersAdmin } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, Sprout } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const fn = useServerFn(listUsersAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => fn() });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "farmer" | "admin">("all");

  const filtered = (data ?? []).filter((u) => {
    if (filter !== "all" && !u.roles.includes(filter)) return false;
    if (!q) return true;
    const t = q.toLowerCase();
    return (
      u.email.toLowerCase().includes(t) ||
      (u.full_name ?? "").toLowerCase().includes(t) ||
      (u.phone ?? "").toLowerCase().includes(t)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Registered users</h2>
          <p className="text-sm text-slate-300">{data?.length ?? 0} total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "farmer", "admin"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                filter === f ? "bg-amber-400 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="pl-8 bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Last sign-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No users match.</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{u.full_name || u.email}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">{u.phone || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length === 0 && <span className="text-xs text-slate-500">none</span>}
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          r === "admin"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {r === "admin" ? <ShieldCheck className="h-3 w-3" /> : <Sprout className="h-3 w-3" />}
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-slate-400">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
