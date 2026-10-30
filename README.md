# BilimUz — talabalar uchun o'quv platformasi

Gemini AI bilan ishlaydigan o'quv platformasi (bitta `index.html` fayl).

## Imkoniyatlar
- 🤖 AI Ustoz — Gemini bilan chat
- 📝 Konspekt — matndan konspekt, lug'at, imtihon savollari
- 🧪 Test — mavzu bo'yicha avtomatik test
- 🃏 Kartochkalar — yodlash uchun
- ✅ Reja — vazifalar va AI reja
- 👤 Hisob — Supabase Auth (email/parol); vazifalar, test natijalari va chat tarixi bulutda saqlanadi

## Ishga tushirish
**`index.html`** — oddiy variant: hisob kerak emas. **⚙️ Sozlamalar**da Gemini API kalitini
([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) bir marta kiritasiz, kalit faqat shu brauzerda saqlanadi.
Ma'lumotlar (vazifalar, statistika) brauzerda qoladi.

**`cloud.html`** — bulutli variant: Supabase hisob, ma'lumotlarni bulutda saqlash va serverdagi Gemini kaliti.

## Baza (Supabase)
Sxema: `supabase/migrations/`. Jadvallar: `profiles`, `tasks`, `quiz_results`, `chat_messages`.
Hamma jadvalda RLS yoqilgan: har bir talaba faqat o'z ma'lumotini ko'radi.
`index.html` ichidagi kalit — ommaviy (publishable) kalit; maxfiy (service_role) kalit kodda bo'lmasligi kerak.

## Deploy
GitHub Pages: **Settings → Pages → Deploy from branch → main / (root)**.

## Gemini (Supabase Edge Function)
Funksiya: `supabase/functions/gemini/index.ts`. Kalit **GEMINI_API_KEY** nomi bilan Supabase'da
(Edge Functions → Secrets) saqlanadi va kodga/GitHub'ga yozilmaydi.
Funksiya faqat tizimga kirgan foydalanuvchilarga ishlaydi va kuniga 150 ta so'rov bilan cheklangan.
