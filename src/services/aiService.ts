import axios from "axios";
import { GeneratedContent, TrendingTopic } from "../types";

const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT!;
const AZURE_API_KEY = process.env.AZURE_API_KEY!;

const DEFAULT_HASHTAGS = `\n\n#motivation #selfimprovement #psychology #islamicquotes #timemanagement #বাংলা #আত্মউন্নয়ন #mrashed21`;

// কনটেন্ট টপিক — news এর বদলে fixed topics
const CONTENT_TOPICS = [
  { title: "সাইকোলজিক্যাল ফ্যাক্ট", category: "psychology" },
  { title: "সেলফ ইমপ্রুভমেন্ট", category: "self_improve" },
  { title: "টাইম ম্যানেজমেন্ট", category: "time" },
  { title: "আত্মনির্ভরশীলতা", category: "independence" },
  { title: "মোটিভেশন", category: "motivation" },
  { title: "হাদীস", category: "hadith" },
];

export function getRandomTopic(): TrendingTopic {
  const t = CONTENT_TOPICS[Math.floor(Math.random() * CONTENT_TOPICS.length)];
  return {
    title: t.title,
    description: "",
    source: "",
    category: t.category as any,
  };
}

function getBaseUrl(): string {
  return AZURE_ENDPOINT.replace(/\/api\/projects\/.*$/, "").replace(
    /\/openai\/v1.*$/,
    "",
  );
}

async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const base = getBaseUrl();
  const res = await axios.post(
    `${base}/openai/deployments/gpt-4.1/chat/completions?api-version=2024-12-01-preview`,
    {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.88,
    },
    {
      headers: {
        "api-key": AZURE_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    },
  );
  return res.data.choices[0].message.content as string;
}

// ১. শর্ট মোটিভেশনাল / ফ্যাক্ট পোস্ট (টেক্সট only)
export async function generateIronyPost(
  topic: TrendingTopic,
): Promise<GeneratedContent> {
  const prompts: Record<string, string> = {
    psychology: `তুমি একজন মনোবিজ্ঞান বিশেষজ্ঞ যে সোশ্যাল মিডিয়ায় চমকপ্রদ সাইকোলজিক্যাল ফ্যাক্ট শেয়ার করো।
প্রতিটা পোস্ট হবে ২-৩ লাইনের, চমকে দেওয়ার মতো একটা তথ্য দিয়ে।
বাংলায় লেখো, ইমোজি ব্যবহার করো। শুধু পোস্টের টেক্সট দাও।`,

    motivation: `তুমি একজন বাংলাদেশি motivational speaker যে মানুষের জীবন বদলে দেওয়া কথা বলো।
২-৩ লাইনে এমন কিছু বলো যা মানুষ screenshot নেবে।
বাংলায় লেখো, ইমোজি ব্যবহার করো। শুধু পোস্টের টেক্সট দাও।`,

    hadith: `তুমি একজন ইসলামিক স্কলার যে ছোট ও অর্থবহ হাদীস শেয়ার করো।
একটা ছোট সহীহ হাদীস বাংলা অনুবাদসহ দাও, সাথে সংক্ষিপ্ত ব্যাখ্যা।
বাংলায় লেখো। শুধু পোস্টের টেক্সট দাও।`,

    default: `তুমি একজন বাংলাদেশি লাইফ কোচ যে সংক্ষিপ্ত জীবনবোধের কথা শেয়ার করো।
২-৩ লাইনে এমন কিছু বলো যা মানুষকে ভাবাবে।
বাংলায় লেখো, ইমোজি ব্যবহার করো। শুধু পোস্টের টেক্সট দাও।`,
  };

  const system = prompts[topic.category] || prompts.default;
  const user = `বিষয়: ${topic.title} — একটা নতুন ও অনন্য পোস্ট লেখো।`;
  const caption = await chatCompletion(system, user);

  return {
    type: "irony_text",
    caption: caption.trim(),
  };
}

// ২. তথ্যমূলক পোস্ট + ইমেজ
export async function generateInfoPost(
  topic: TrendingTopic,
): Promise<GeneratedContent> {
  const system = `তুমি একজন বাংলাদেশি লাইফ কোচ ও কনটেন্ট রাইটার।
তুমি ${topic.title} বিষয়ে গভীর জ্ঞান রাখো এবং সেটা সহজভাবে মানুষের কাছে পৌঁছে দাও।
লেখা হবে উষ্ণ, মানবিক — যেন একজন বিশ্বস্ত বন্ধু পরামর্শ দিচ্ছে।
Response format:
[পোস্ট টেক্সট]
###IMAGE###
[ইংরেজিতে image prompt, inspirational minimalist style]`;

  const user = `বিষয়: ${topic.title}

- প্রথম লাইনটা এমন হবে যা স্ক্রল করতে করতে মানুষকে থামিয়ে দেবে
- ৩-৫টা practical পয়েন্ট দাও
- শেষে পাঠককে একটা কাজ করতে উৎসাহিত করো
- ২০০-২৫০ শব্দ`;

  const response = await chatCompletion(system, user);
  const parts = response.split("###IMAGE###");
  const caption = (parts[0]?.trim() || response.trim()) + DEFAULT_HASHTAGS;
  const imagePrompt =
    parts[1]?.trim() ||
    `Inspirational minimalist poster about ${topic.title}, warm colors, Bengali text style`;

  return { type: "info_image", caption, imagePrompt };
}

// ৩. আর্টিকেল পোস্ট + ইমেজ
export async function generateArticlePost(
  topic: TrendingTopic,
): Promise<GeneratedContent> {
  const system = `তুমি একজন অভিজ্ঞ বাংলাদেশি লেখক ও লাইফ কোচ।
তুমি ${topic.title} বিষয়ে গভীর ও অনুপ্রেরণামূলক আর্টিকেল লেখো যা মানুষের জীবন পরিবর্তন করে।
লেখা হবে প্রফেশনাল, হৃদয়স্পর্শী, এবং সম্পূর্ণ মানবিক।
Response format:
[আর্টিকেল টেক্সট]
###IMAGE###
[ইংরেজিতে image prompt, motivational magazine style]`;

  const user = `বিষয়: ${topic.title}

- একটা শক্তিশালী শিরোনাম দিয়ে শুরু করো
- বাস্তব জীবনের উদাহরণ দাও
- ৩-৪ প্যারাগ্রাফে বিষয়টা বিশ্লেষণ করো
- শেষে পাঠককে অনুপ্রাণিত করো
- ৩০০-৩৫০ শব্দ`;

  const response = await chatCompletion(system, user);
  const parts = response.split("###IMAGE###");
  const caption = (parts[0]?.trim() || response.trim()) + DEFAULT_HASHTAGS;
  const imagePrompt =
    parts[1]?.trim() ||
    `Motivational magazine style illustration about ${topic.title}, warm inspiring colors`;

  return { type: "article_image", caption, imagePrompt };
}

// ইমেজ জেনারেশন
export async function generateImage(prompt: string): Promise<Buffer | null> {
  try {
    const base = getBaseUrl();
    const res = await axios.post(
      `${base}/openai/deployments/gpt-image-1-mini/images/generations?api-version=2024-12-01-preview`,
      {
        prompt: `${prompt}. High quality, professional, suitable for Facebook page.`,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          "api-key": AZURE_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
    );

    const imageData = res.data.data[0];
    if (!imageData) return null;

    if (imageData.b64_json) {
      return Buffer.from(imageData.b64_json, "base64");
    }

    if (imageData.url) {
      const imgRes = await axios.get(imageData.url, {
        responseType: "arraybuffer",
        timeout: 30000,
      });
      return Buffer.from(imgRes.data);
    }

    return null;
  } catch (err: any) {
    console.error(
      "Image generation error:",
      err?.response?.data || err.message,
    );
    return null;
  }
}
