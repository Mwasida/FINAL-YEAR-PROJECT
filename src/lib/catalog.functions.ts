import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listProductsWithShops = createServerFn({ method: "GET" }).handler(async () => {
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);

  const { data: links } = await supabaseAdmin.from("product_shops").select("product_id,shop_id");
  const { data: shops } = await supabaseAdmin.from("shops").select("*");

  const shopMap = new Map((shops ?? []).map((s) => [s.id, s]));
  const productShops = new Map<string, typeof shops>();
  for (const link of links ?? []) {
    const arr = productShops.get(link.product_id) ?? [];
    const shop = shopMap.get(link.shop_id);
    if (shop) arr.push(shop);
    productShops.set(link.product_id, arr);
  }

  return (products ?? []).map((p) => ({ ...p, shops: productShops.get(p.id) ?? [] }));
});

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [chats, diags, prods] = await Promise.all([
      context.supabase.from("threads").select("id", { count: "exact", head: true }),
      context.supabase.from("diagnoses").select("id", { count: "exact", head: true }),
      context.supabase.from("products").select("id", { count: "exact", head: true }),
    ]);

    const { data: recentDiagnoses } = await context.supabase
      .from("diagnoses")
      .select("id,disease_name,crop,created_at,confidence")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      totalConversations: chats.count ?? 0,
      totalDiagnoses: diags.count ?? 0,
      totalProducts: prods.count ?? 0,
      recentDiagnoses: recentDiagnoses ?? [],
    };
  });
