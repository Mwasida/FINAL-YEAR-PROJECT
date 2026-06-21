import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { isCurrentUserAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Leaf, LayoutDashboard, MessageSquareText, Camera, ShoppingBag, LogOut, Menu, X, Shield } from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Chat", icon: MessageSquareText },
  { to: "/diagnose", label: "Diagnose", icon: Camera },
  { to: "/products", label: "Products", icon: ShoppingBag },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const isAdminFn = useServerFn(isCurrentUserAdmin);
  const { data: adminData } = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const isAdmin = adminData?.isAdmin ?? false;


  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar p-4 transition-transform lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-sidebar-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf text-primary-foreground shadow-soft">
              <Leaf className="h-5 w-5" />
            </span>
            AgriSage
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-8 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "mt-4 flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-sm font-semibold transition",
                pathname.startsWith("/admin")
                  ? "bg-amber-400 text-slate-950"
                  : "text-amber-300 hover:bg-amber-400/20",
              )}
            >
              <Shield className="h-4 w-4" />
              Admin Console
            </Link>
          )}
        </nav>
        <div className="absolute inset-x-4 bottom-4">
          <Button onClick={signOut} variant="ghost" className="w-full justify-start rounded-2xl text-sidebar-foreground/80">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Leaf className="h-5 w-5 text-primary" /> AgriSage
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <main className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen">{children}</main>

      {open && (
        <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
