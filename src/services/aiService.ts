// import axios from "axios";
// import { GeneratedContent, TrendingTopic } from "../types";

// const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT!;
// const AZURE_API_KEY = process.env.AZURE_API_KEY!;

// // Azure AI Foundry এর endpoint থেকে base URL বের করি
// // https://fb-automotion-resource.services.ai.azure.com/api/projects/fb-automotion
// // → https://fb-automotion-resource.services.ai.azure.com
// function getBaseUrl(): string {
//   return AZURE_ENDPOINT.replace(/\/api\/projects\/.*$/, "").replace(
//     /\/openai\/v1.*$/,
//     "",
//   );
// }

// // Azure AI Foundry chat completion
// async function chatCompletion(
//   systemPrompt: string,
//   userPrompt: string,
// ): Promise<string> {
//   const base = getBaseUrl();
//   const res = await axios.post(
//     `${base}/openai/deployments/gpt-4.1/chat/completions?api-version=2024-12-01-preview`,
//     {
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//       max_tokens: 1500,
//       temperature: 0.85,
//     },
//     {
//       headers: {
//         "api-key": AZURE_API_KEY,
//         "Content-Type": "application/json",
//       },
//       timeout: 30000,
//     },
//   );

//   return res.data.choices[0].message.content as string;
// }

// // ১. আইরনি/ব্যঙ্গ টেক্সট পোস্ট
// export async function generateIronyPost(
//   topic: TrendingTopic,
// ): Promise<GeneratedContent> {
//   const system = `তুমি একজন বাংলাদেশি সোশ্যাল মিডিয়া কনটেন্ট ক্রিয়েটর।
// তুমি বর্তমান সময়ের ঘটনা নিয়ে তীক্ষ্ণ আইরনি ও ব্যঙ্গাত্মক পোস্ট লেখো।
// পোস্ট হবে ২-৩ লাইনের, সরাসরি, মজাদার কিন্তু চিন্তার খোরাক দেয়।
// ইমোজি ব্যবহার করো। বাংলায় লেখো।`;

//   const user = `এই টপিক নিয়ে একটা আইরনিক ফেসবুক পোস্ট লেখো:
// টপিক: ${topic.title}
// বিবরণ: ${topic.description}

// শুধু পোস্টের টেক্সট দাও, অন্য কিছু না।`;

//   const caption = await chatCompletion(system, user);

//   return {
//     type: "irony_text",
//     caption: caption.trim(),
//   };
// }

// // ২. তথ্যমূলক পোস্ট + ইমেজ প্রম্পট
// export async function generateInfoPost(
//   topic: TrendingTopic,
// ): Promise<GeneratedContent> {
//   const system = `তুমি একজন বাংলাদেশি তথ্য ও শিক্ষামূলক কনটেন্ট ক্রিয়েটর।
// তুমি গুরুত্বপূর্ণ তথ্য সহজ ও আকর্ষণীয়ভাবে উপস্থাপন করো।
// বাংলায় লেখো। ইমোজি ও বোল্ড টেক্সট ব্যবহার করো।`;

//   const user = `এই বিষয়ে একটা তথ্যমূলক ফেসবুক পোস্ট লেখো।
// সাথে একটা image generation prompt ও দাও (ইংরেজিতে)।

// টপিক: ${topic.title}
// বিবরণ: ${topic.description}

// এই format এ দাও:
// CAPTION:
// [পোস্ট ক্যাপশন এখানে]

// IMAGE_PROMPT:
// [ইংরেজিতে image prompt এখানে, professional infographic style]`;

//   const response = await chatCompletion(system, user);
//   const captionMatch = response.match(
//     /CAPTION:\n([\s\S]*?)(?=IMAGE_PROMPT:|$)/,
//   );
//   const imageMatch = response.match(/IMAGE_PROMPT:\n([\s\S]*?)$/);

//   return {
//     type: "info_image",
//     caption: captionMatch?.[1]?.trim() || response.trim(),
//     imagePrompt:
//       imageMatch?.[1]?.trim() ||
//       `Professional infographic about ${topic.title}, clean design, blue and white colors`,
//   };
// }

// // ৩. আর্টিকেল পোস্ট + ইমেজ প্রম্পট
// export async function generateArticlePost(
//   topic: TrendingTopic,
// ): Promise<GeneratedContent> {
//   const system = `তুমি একজন অভিজ্ঞ বাংলাদেশি সাংবাদিক ও কলামিস্ট।
// তুমি গভীর বিশ্লেষণমূলক আর্টিকেল লেখো যা পাঠককে ভাবায়।
// লেখা হবে প্রফেশনাল, তথ্যসমৃদ্ধ, এবং নিরপেক্ষ।
// বাংলায় লেখো। ৩০০-৪০০ শব্দের মধ্যে রাখো।`;

//   const user = `এই বিষয়ে একটা গভীর বিশ্লেষণমূলক আর্টিকেল লেখো।
// সাথে একটা image generation prompt ও দাও।

// টপিক: ${topic.title}
// বিবরণ: ${topic.description}
// ক্যাটাগরি: ${topic.category}

// এই format এ দাও:
// CAPTION:
// [আর্টিকেল এখানে — শিরোনাম সহ]

// IMAGE_PROMPT:
// [ইংরেজিতে image prompt, editorial magazine style]`;

//   const response = await chatCompletion(system, user);
//   const captionMatch = response.match(
//     /CAPTION:\n([\s\S]*?)(?=IMAGE_PROMPT:|$)/,
//   );
//   const imageMatch = response.match(/IMAGE_PROMPT:\n([\s\S]*?)$/);

//   return {
//     type: "article_image",
//     caption: captionMatch?.[1]?.trim() || response.trim(),
//     imagePrompt:
//       imageMatch?.[1]?.trim() ||
//       `Editorial magazine style photo about ${topic.title}`,
//   };
// }

// // ইমেজ জেনারেশন — Azure gpt-image-1-mini
// export async function generateImage(prompt: string): Promise<Buffer | null> {
//   try {
//     const base = getBaseUrl();
//     const res = await axios.post(
//       `${base}/openai/deployments/gpt-image-1-mini/images/generations?api-version=2024-12-01-preview`,
//       {
//         model: "gpt-image-1-mini",
//         prompt: `${prompt}. High quality, professional, suitable for Facebook page.`,
//         n: 1,
//         size: "1024x1024",
//         response_format: "url",
//       },
//       {
//         headers: {
//           "api-key": AZURE_API_KEY,
//           "Content-Type": "application/json",
//         },
//         timeout: 60000,
//       },
//     );

//     const imageUrl = res.data.data[0]?.url;
//     if (!imageUrl) return null;

//     // URL থেকে image buffer download করি
//     const imgRes = await axios.get(imageUrl, {
//       responseType: "arraybuffer",
//       timeout: 30000,
//     });
//     return Buffer.from(imgRes.data);
//   } catch (err: any) {
//     console.error(
//       "Image generation error:",
//       err?.response?.data || err.message,
//     );
//     return null;
//   }
// }

import axios from "axios";
import { GeneratedContent, TrendingTopic } from "../types";

const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT!;
const AZURE_API_KEY = process.env.AZURE_API_KEY!;

const DEFAULT_HASHTAGS = `\n\n #mrashed21 #fbautomation #ai`;

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
      temperature: 0.85,
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

// ১. আইরনি পোস্ট
export async function generateIronyPost(
  topic: TrendingTopic,
): Promise<GeneratedContent> {
  const system = `তুমি একজন বাংলাদেশি সোশ্যাল মিডিয়া কনটেন্ট ক্রিয়েটর।
তুমি বর্তমান সময়ের ঘটনা নিয়ে তীক্ষ্ণ আইরনি ও ব্যঙ্গাত্মক পোস্ট লেখো।
পোস্ট হবে ২-৩ লাইনের, সরাসরি, মজাদার কিন্তু চিন্তার খোরাক দেয়।
ইমোজি ব্যবহার করো। বাংলায় লেখো।
শুধু পোস্টের টেক্সট দাও, অন্য কিছু না।`;

  const user = `টপিক: ${topic.title}\nবিবরণ: ${topic.description}`;
  const caption = await chatCompletion(system, user);

  return {
    type: "irony_text",
    caption: caption.trim(),
  };
}

// ২. তথ্যমূলক পোস্ট
export async function generateInfoPost(
  topic: TrendingTopic,
): Promise<GeneratedContent> {
  const system = `তুমি একজন অভিজ্ঞ বাংলাদেশি কনটেন্ট রাইটার।
তোমার লেখা হবে সম্পূর্ণ মানবিক, উষ্ণ — যেন একজন বন্ধু গুরুত্বপূর্ণ কিছু শেয়ার করছে।
কোনো AI ভাষা বা শুষ্ক তথ্য নয়। বাংলায় লেখো। প্রাসঙ্গিক ইমোজি ব্যবহার করো।
Response এর format হবে:
[পোস্ট টেক্সট এখানে]
###IMAGE###
[ইংরেজিতে image prompt, professional infographic style]`;

  const user = `টপিক: ${topic.title}
বিবরণ: ${topic.description}

- প্রথম লাইন এমন হবে যা মানুষকে থামিয়ে পড়াবে
- শেষে একটা প্রশ্ন বা call-to-action রাখো
- ২০০-২৫০ শব্দ`;

  const response = await chatCompletion(system, user);
  const parts = response.split("###IMAGE###");
  const caption = (parts[0]?.trim() || response.trim()) + DEFAULT_HASHTAGS;
  const imagePrompt =
    parts[1]?.trim() ||
    `Professional infographic about ${topic.title}, clean modern design, blue white colors`;

  return { type: "info_image", caption, imagePrompt };
}

// ৩. আর্টিকেল পোস্ট
export async function generateArticlePost(
  topic: TrendingTopic,
): Promise<GeneratedContent> {
  const system = `তুমি একজন অভিজ্ঞ বাংলাদেশি সাংবাদিক ও কলামিস্ট।
তোমার লেখায় থাকে গভীর বিশ্লেষণ, মানবিক দৃষ্টিভঙ্গি, এবং পাঠককে ভাবিয়ে তোলার ক্ষমতা।
লেখা হবে প্রফেশনাল কিন্তু সহজবোধ্য — সম্পূর্ণ মানবিক কণ্ঠস্বর।
Response এর format হবে:
[আর্টিকেল টেক্সট এখানে]
###IMAGE###
[ইংরেজিতে image prompt, editorial magazine style]`;

  const user = `টপিক: ${topic.title}
বিবরণ: ${topic.description}
ক্যাটাগরি: ${topic.category}

- শক্তিশালী শিরোনাম দিয়ে শুরু করো
- ৩-৪ প্যারাগ্রাফে বিশ্লেষণ করো
- শেষে পাঠকের মতামত চাও
- ৩০০-৩৫০ শব্দ`;

  const response = await chatCompletion(system, user);
  const parts = response.split("###IMAGE###");
  const caption = (parts[0]?.trim() || response.trim()) + DEFAULT_HASHTAGS;
  const imagePrompt =
    parts[1]?.trim() ||
    `Editorial magazine style illustration about ${topic.title}`;

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
