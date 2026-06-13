import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { diagnoseImage, listDiagnoses } from "@/lib/diagnose.functions";
import { listProductsWithShops } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Upload, Leaf, ShoppingBag, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/diagnose")({
  head: () => ({ meta: [{ title: "Crop Diagnosis — AgriSage" }] }),
  component: Diagnose,
});

type Diag = Awaited<ReturnType<typeof diagnoseImage>>;

function Diagnose() {
  const diagnose = useServerFn(diagnoseImage);
  const productsFn = useServerFn(listProductsWithShops);
  const historyFn = useServerFn(listDiagnoses);

  const [preview, setPreview] = useState<string | null>(null);
  const [cropHint, setCropHint] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => productsFn() });
  const { data: history = [], refetch } = useQuery({ queryKey: ["diagnoses"], queryFn: () => historyFn() });

  const m = useMutation({
    mutationFn: async (file: File) => {
      const base64 = await fileToBase64(file);
      return diagnose({ data: { imageBase64: base64, mimeType: file.type, cropHint: cropHint || undefined } });
    },
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Diagnosis failed"),
  });

  const result: Diag | undefined = m.data;
  const recommendedProducts = result
    ? products.filter((p) => result.recommendedProductIds.includes(p.id))
    : [];

  function handlePick(f: File) {
    if (f.size > 8 * 1024 * 1024) return toast.error("Image too large (max 8 MB)");
    setPreview(URL.createObjectURL(f));
    m.mutate(f);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Diagnosis</p>
      <h1 className="mt-1 font-display text-4xl font-semibold">Photo crop diagnosis</h1>
      <p className="mt-2 text-muted-foreground">Upload or take a photo of an affected leaf or plant. We'll identify it and recommend treatments.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upload */}
        <Card className="rounded-3xl border-border/60 p-6">
          <Label htmlFor="hint" className="text-sm">Crop (optional)</Label>
          <Input id="hint" value={cropHint} onChange={(e) => setCropHint(e.target.value)} maxLength={80} className="mt-1.5" placeholder="e.g. Tomato, Rice…" />

          <div className="mt-4 grid place-items-center rounded-3xl border-2 border-dashed border-border bg-muted/30 p-8">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-72 rounded-2xl object-contain" />
            ) : (
              <div className="text-center">
                <Leaf className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-2 font-medium">Drop or pick a leaf photo</p>
                <p className="text-xs text-muted-foreground">JPG / PNG, up to 8 MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handlePick(e.target.files[0])}
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={() => fileRef.current?.click()} className="flex-1 rounded-full">
              <Upload className="mr-1 h-4 w-4" /> Upload
            </Button>
            <Button
              variant="outline"
              onClick={() => { if (fileRef.current) { fileRef.current.setAttribute("capture", "environment"); fileRef.current.click(); } }}
              className="flex-1 rounded-full"
            >
              <Camera className="mr-1 h-4 w-4" /> Camera
            </Button>
          </div>
        </Card>

        {/* Result */}
        <Card className="rounded-3xl border-border/60 p-6">
          {m.isPending ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-muted-foreground">Analyzing your image…</p>
              </div>
            </div>
          ) : !result ? (
            <div className="grid h-full place-items-center text-center text-muted-foreground">
              <p>Your diagnosis will appear here.</p>
            </div>
          ) : !result.isPlant ? (
            <div className="text-center text-muted-foreground">
              <p>That doesn't look like a crop image. Try a close-up of the affected plant part.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">{result.diseaseName}</h2>
                <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                  {Math.round(result.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Crop: {result.crop}</p>

              <Section title="Symptoms" body={result.symptoms} />
              <Section title="Causes" body={result.causes} />
              <Section title="Treatment" body={result.treatment} />
              <Section title="Prevention" body={result.prevention} />
            </div>
          )}
        </Card>
      </div>

      {/* Recommendations */}
      {recommendedProducts.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Recommended products</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedProducts.map((p) => (
              <Card key={p.id} className="rounded-3xl border-border/60 p-5">
                <div className="font-semibold">{p.name}</div>
                <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                <p className="mt-2 text-sm"><span className="font-medium">Use:</span> {p.usage}</p>
                {p.price && <p className="mt-2 text-sm font-semibold text-primary">${Number(p.price).toFixed(2)}</p>}
                {p.shops.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">Available at:</div>
                    {p.shops.map((s) => (
                      <a
                        key={s.id}
                        href={`https://maps.google.com/?q=${s.latitude},${s.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-1 hover:text-primary"
                      >
                        <MapPin className="mt-0.5 h-3 w-3 flex-none" />
                        <span>{s.name} — {s.address} · {s.contact}</span>
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Past diagnoses</h2>
          <Card className="mt-4 rounded-3xl border-border/60 p-2">
            <ul className="divide-y divide-border">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{h.disease_name}</div>
                    <div className="text-xs text-muted-foreground">{h.crop} · {new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs">{Math.round((Number(h.confidence) || 0) * 100)}%</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{title}</div>
      <p className="mt-1 text-sm">{body}</p>
    </div>
  );
}

async function fileToBase64(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      const i = r.indexOf(",");
      resolve(i >= 0 ? r.slice(i + 1) : r);
    };
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });
}
