import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listProductsWithShops } from "@/lib/catalog.functions";
import { upsertProduct, deleteProduct } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type ProductForm = {
  id?: string;
  name: string;
  description: string;
  usage: string;
  price: string;
  image_url: string;
};

const EMPTY: ProductForm = { name: "", description: "", usage: "", price: "", image_url: "" };

function AdminProducts() {
  const list = useServerFn(listProductsWithShops);
  const save = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY);

  const saveMut = useMutation({
    mutationFn: async (f: ProductForm) => save({
      data: {
        id: f.id,
        name: f.name,
        description: f.description || null,
        usage: f.usage || null,
        price: f.price ? Number(f.price) : null,
        image_url: f.image_url || null,
      },
    }),
    onSuccess: () => {
      toast.success(form.id ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setOpen(false);
      setForm(EMPTY);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() { setForm(EMPTY); setOpen(true); }
  function openEdit(p: any) {
    setForm({
      id: p.id,
      name: p.name ?? "",
      description: p.description ?? "",
      usage: p.usage ?? "",
      price: p.price != null ? String(p.price) : "",
      image_url: p.image_url ?? "",
    });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Products</h2>
          <p className="text-sm text-slate-300">{data?.length ?? 0} item(s) in catalog</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300">
              <Plus className="mr-1 h-4 w-4" /> New product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit product" : "New product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Usage</Label>
                <Textarea rows={2} value={form.usage} onChange={(e) => setForm({ ...form, usage: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={() => saveMut.mutate(form)}
                disabled={!form.name || saveMut.isPending}
              >
                {saveMut.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!isLoading && (data ?? []).length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No products yet.</td></tr>
            )}
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-slate-300">{p.price != null ? `$${Number(p.price).toFixed(2)}` : "—"}</td>
                <td className="px-4 py-3 text-slate-400 line-clamp-1 max-w-md">{p.description ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-300 hover:text-rose-200"
                    onClick={() => {
                      if (confirm(`Delete "${p.name}"?`)) delMut.mutate(p.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
