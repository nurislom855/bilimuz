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
`index.html` ni brauzerda oching. Gemini uchun API kalitni
[aistudio.google.com/apikey](https://aistudio.google.com/apikey) dan oling va **Sozlamalar** bo'limiga kiriting.
Kalit faqat foydalanuvchining brauzerida saqlanadi, bazaga yoki GitHub'ga yozilmaydi.

## Baza (Supabase)
Sxema: `supabase/migrations/`. Jadvallar: `profiles`, `tasks`, `quiz_results`, `chat_messages`.
Hamma jadvalda RLS yoqilgan: har bir talaba faqat o'z ma'lumotini ko'radi.
`index.html` ichidagi kalit — ommaviy (publishable) kalit; maxfiy (service_role) kalit kodda bo'lmasligi kerak.

## Deploy
GitHub Pages: **Settings → Pages → Deploy from branch → main / (root)**.
