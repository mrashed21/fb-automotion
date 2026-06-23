# 🤖 Facebook Auto-Poster

Azure AI দিয়ে ফেসবুক পেজে দৈনিক ৫টা পোস্ট অটোমেটিক।

## পোস্টের ধরন

| সময় (BD) | টাইপ | বিবরণ |
|---|---|---|
| সকাল ৯টা | আইরনি টেক্সট | বর্তমান টপিকে ব্যঙ্গাত্মক পোস্ট |
| দুপুর ১২টা | তথ্য + ইমেজ | গুরুত্বপূর্ণ তথ্য |
| বিকাল ৩টা | আইরনি টেক্সট | আরেকটা ব্যঙ্গ পোস্ট |
| সন্ধ্যা ৬টা | আর্টিকেল + ইমেজ | গভীর বিশ্লেষণ |
| রাত ৯টা | তথ্য + ইমেজ | তথ্যমূলক পোস্ট |

## Setup

### ১. Repo তৈরি করো
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/fb-automation
```

### ২. GitHub Secrets সেট করো
`Settings → Secrets → Actions → New secret`:

```
AZURE_ENDPOINT      → Azure AI Foundry endpoint
AZURE_API_KEY       → Azure API key
TAVILY_API_KEY      → Tavily search key
NEWS_API_KEY        → NewsAPI key
FB_PAGE_ID          → 106486845119179
FB_PAGE_ACCESS_TOKEN → Facebook page token (long-lived)
FB_APP_ID           → Facebook App ID
FB_APP_SECRET       → Facebook App Secret
```

### ৩. .env ফাইল তৈরি করো (local test এর জন্য)
```bash
cp .env.example .env
# .env ফাইলে values বসাও
```

### ৪. Local test করো
```bash
npm install
npx ts-node src/index.ts --now      # random একটা পোস্ট
npx ts-node src/index.ts --irony    # আইরনি পোস্ট
npx ts-node src/index.ts --info     # তথ্য পোস্ট
npx ts-node src/index.ts --article  # আর্টিকেল পোস্ট
```

### ৫. GitHub এ push করো
```bash
git add .
git commit -m "fb automation setup"
git push origin main
```

## Facebook Long-Lived Token

Short-lived token (২ ঘণ্টা) থেকে long-lived token (৬০ দিন) বানাতে:
১. FB_APP_ID ও FB_APP_SECRET .env এ দাও
২. `npx ts-node src/index.ts` চালাও
৩. Console এ নতুন token দেখাবে — সেটা .env ও GitHub Secret এ দাও

## Azure Endpoint Format

```
https://YOUR-RESOURCE.services.ai.azure.com/api/projects/YOUR-PROJECT
```
