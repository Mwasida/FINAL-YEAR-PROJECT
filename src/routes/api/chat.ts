import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `You are AgriSage, an expert AI agricultural advisor helping farmers.

You give concise, practical advice on:
- Crop diseases and pests (symptoms, causes, treatments)
- Fertilizer & nutrient recommendations
- Irrigation, soil health, and sustainable practices
- Pesticide selection and safe application
- Seasonal/weather-aware planning

Always:
- Use simple, farmer-friendly language. Prefer bullet lists and short paragraphs.
- When recommending a chemical, name the active ingredient and a safe dose rate.
- Note safety precautions and pre-harvest intervals when relevant.
- Encourage IPM (integrated pest management) and resistant varieties.
- If unsure, ask a brief clarifying question (crop, region, growth stage).`;

async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await client.auth.getClaims(token);
  return data?.claims?.sub ?? null;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getUserFromRequest(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as { messages?: UIMessage[]; threadId?: string };
        const { messages, threadId } = body;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("Missing messages or threadId", { status: 400 });
        }

        // Verify thread ownership
        const { data: thread } = await supabaseAdmin
          .from("threads")
          .select("id,user_id,title")
          .eq("id", threadId)
          .maybeSingle();
        if (!thread || thread.user_id !== userId) {
          return new Response("Forbidden", { status: 403 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Persist latest user message
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await supabaseAdmin.from("messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            parts: lastUser.parts as never,
          });

          // If thread title is default, set from first user message
          if (thread.title === "New conversation") {
            const text =
              (lastUser.parts as Array<{ type: string; text?: string }>)
                .filter((p) => p.type === "text")
                .map((p) => p.text ?? "")
                .join(" ")
                .slice(0, 60) || "New conversation";
            await supabaseAdmin.from("threads").update({ title: text }).eq("id", threadId);
          } else {
            await supabaseAdmin.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
          }
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-2.5-flash");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const assistant = [...finalMessages].reverse().find((m) => m.role === "assistant");
            if (assistant) {
              await supabaseAdmin.from("messages").insert({
                thread_id: threadId,
                user_id: userId,
                role: "assistant",
                parts: assistant.parts as never,
              });
              await supabaseAdmin
                .from("threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId);
            }
          },
        });
      },
    },
  },
});
