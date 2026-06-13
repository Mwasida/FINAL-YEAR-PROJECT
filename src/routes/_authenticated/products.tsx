import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listProductsWithShops } from "@/lib/catalog.functions";
import { Card } from "@/components/ui/card";
import { MapPin, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({ meta: [{ title: "Products — AgriSage" }] }),
  component: Products,
});

function Products() {
  const fn = useServerFn(listProductsWithShops);
  const { data = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: () => fn() });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Catalog</p>
      <h1 className="mt-1 font-display text-4xl font-semibold">Recommended products</h1>
      <p className="mt-2 text-muted-foreground">Fungicides, insecticides and inputs commonly recommended by AgriSage.</p>

      {isLoading ? (
        <p className="mt-10 text-center text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <Card key={p.id} className="rounded-3xl border-border/60 p-6 transition hover:shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf text-primary-foreground">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-3 text-sm"><span className="font-medium">Usage:</span> {p.usage}</p>
              {p.price && <p className="mt-2 font-semibold text-primary">${Number(p.price).toFixed(2)}</p>}
              {p.shops.length > 0 && (
                <div className="mt-4 border-t border-border pt-3 text-xs">
                  <div className="font-medium">Stocked at:</div>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {p.shops.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`https://maps.google.com/?q=${s.latitude},${s.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start gap-1 hover:text-primary"
                        >
                          <MapPin className="mt-0.5 h-3 w-3 flex-none" />
                          <span>{s.name} — {s.address}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
