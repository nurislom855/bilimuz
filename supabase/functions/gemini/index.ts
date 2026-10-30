import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const DAILY_LIMIT = 150; // bitta foydalanuvchi uchun 24 soatdagi so'rovlar
const MAX_TEXT = 30000; // so'rovdagi jami belgilar
const MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Faqat POST" }, 405);

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "Serverda GEMINI_API_KEY sozlanmagan." }, 500);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Foydalanuvchini tekshirish
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: auth } = await admin.auth.getUser(token);
    const user = auth?.user;
    if (!user) return json({ error: "Avval hisobga kiring." }, 401);

    // Kunlik limit
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count } = await admin
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= DAILY_LIMIT) {
      return json({ error: "Kunlik limit tugadi. Ertaga qayta urinib ko'ring." }, 429);
    }

    // So'rovni tekshirish
    const body = await req.json();
    const contents = body?.contents;
    if (!Array.isArray(contents) || contents.length === 0 || contents.length > 60) {
      return json({ error: "Noto'g'ri so'rov." }, 400);
    }
    let total = 0;
    for (const c of contents) {
      if (!c || !Array.isArray(c.parts) || (c.role !== "user" && c.role !== "model")) {
        return json({ error: "Noto'g'ri so'rov." }, 400);
      }
      for (const p of c.parts) {
        if (typeof p?.text !== "string") return json({ error: "Noto'g'ri so'rov." }, 400);
        total += p.text.length;
      }
    }
    if (total > MAX_TEXT) return json({ error: "Matn juda uzun." }, 413);

    const sys = body?.systemInstruction?.parts?.[0]?.text;
    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: 8192,
        ...(body?.json ? { responseMimeType: "application/json" } : {}),
      },
    };
    if (typeof sys === "string" && sys.length < 4000) {
      payload.systemInstruction = { parts: [{ text: sys }] };
    }

    await admin.from("ai_usage").insert({ user_id: user.id });

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(payload),
      },
    );
    const d = await r.json();
    if (!r.ok) return json({ error: d?.error?.message || `Gemini xatosi: ${r.status}` }, 502);

    const text = d?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") || "";
    if (!text) return json({ error: "Gemini bo'sh javob qaytardi." }, 502);
    return json({ text });
  } catch (e) {
    return json({ error: `Server xatosi: ${(e as Error).message}` }, 500);
  }
});
