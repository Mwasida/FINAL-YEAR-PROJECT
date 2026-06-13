import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { generateObject } from "ai";

const DiagnoseInput = z.object({
  imageBase64: z.string().min(20),
  mimeType: z.string().min(3).max(60),
  cropHint: z.string().max(80).optional(),
});

const DiagnosisSchema = z.object({
  diseaseName: z.string(),
  crop: z.string(),
  confidence: z.number().min(0).max(1),
  symptoms: z.string(),
  causes: z.string(),
  treatment: z.string(),
  prevention: z.string(),
  productKeywords: z.array(z.string()).max(6),
  isPlant: z.boolean(),
});

export const diagnoseImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DiagnoseInput.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const result = await generateObject({
      model,
      schema: DiagnosisSchema,
      messages: [
        {
          role: "system",
          content:
            "You are an expert agronomist. Analyze the crop image and identify the most likely disease. " +
            "Return confidence between 0 and 1. If image is not a plant/crop, set isPlant=false and leave fields like 'N/A'. " +
            "Provide concise, farmer-friendly text. productKeywords should be short active ingredients (e.g. 'Mancozeb', 'Copper').",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: data.cropHint
                ? `Crop hint from farmer: ${data.cropHint}. Diagnose the disease and recommend treatments.`
                : "Diagnose the disease shown in this crop image and recommend treatments.",
            },
            {
              type: "image",
              image: `data:${data.mimeType};base64,${data.imageBase64}`,
            },
          ],
        },
      ],
    });

    const diag = result.object;

    // Match products by keyword
    let recommendedProductIds: string[] = [];
    if (diag.isPlant && diag.productKeywords.length > 0) {
      const orFilter = diag.productKeywords
        .map((k) => `name.ilike.%${k.replace(/[%,]/g, "")}%`)
        .join(",");
      const { data: prods } = await context.supabase
        .from("products")
        .select("id")
        .or(orFilter)
        .limit(6);
      recommendedProductIds = (prods ?? []).map((p) => p.id);
    }

    const { data: saved, error } = await context.supabase
      .from("diagnoses")
      .insert({
        user_id: context.userId,
        disease_name: diag.diseaseName,
        crop: diag.crop,
        confidence: diag.confidence,
        symptoms: diag.symptoms,
        treatment: diag.treatment,
        prevention: diag.prevention,
        recommended_product_ids: recommendedProductIds,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: saved.id, ...diag, recommendedProductIds };
  });

export const listDiagnoses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("diagnoses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
