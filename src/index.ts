import "dotenv/config";
import cron from "node-cron";
import { getTrendingTopics } from "./services/newsService";
import {
  generateIronyPost,
  generateInfoPost,
  generateArticlePost,
  generateImage,
} from "./services/aiService";
import { postToFacebook } from "./services/facebookService";
import { GeneratedContent, PostType } from "./types";

// ডেইলি পোস্ট schedule — বাংলাদেশ সময় (UTC+6)
// UTC তে: 3,6,9,12,15 = BD তে: 9am, 12pm, 3pm, 6pm, 9pm
const SCHEDULES: { cron: string; type: PostType; label: string }[] = [
  { cron: "0 3 * * *", type: "irony_text",    label: "সকাল ৯টা — আইরনি পোস্ট" },
  { cron: "0 6 * * *", type: "info_image",    label: "দুপুর ১২টা — তথ্য পোস্ট" },
  { cron: "0 9 * * *", type: "irony_text",    label: "বিকাল ৩টা — আইরনি পোস্ট" },
  { cron: "0 12 * * *", type: "article_image", label: "সন্ধ্যা ৬টা — আর্টিকেল পোস্ট" },
  { cron: "0 15 * * *", type: "info_image",    label: "রাত ৯টা — তথ্য পোস্ট" },
];

async function runPost(type: PostType): Promise<void> {
  console.log(`\n🚀 শুরু হচ্ছে: ${type} — ${new Date().toLocaleString("bn-BD")}`);

  try {
    // ১. Trending টপিক নাও
    const topics = await getTrendingTopics();
    if (!topics.length) {
      console.error("❌ কোনো টপিক পাওয়া যায়নি");
      return;
    }

    // Random টপিক সিলেক্ট করো
    const topic = topics[Math.floor(Math.random() * topics.length)];
    console.log(`📌 টপিক: ${topic.title}`);

    // ২. কনটেন্ট জেনারেট করো
    let content: GeneratedContent;

    switch (type) {
      case "irony_text":
        content = await generateIronyPost(topic);
        break;
      case "info_image":
        content = await generateInfoPost(topic);
        break;
      case "article_image":
        content = await generateArticlePost(topic);
        break;
    }

    console.log(`✍️ ক্যাপশন তৈরি হয়েছে (${content.caption.length} chars)`);

    // ৩. ইমেজ দরকার হলে জেনারেট করো
    if (content.imagePrompt && type !== "irony_text") {
      console.log("🎨 ইমেজ তৈরি হচ্ছে...");
      const imgBuffer = await generateImage(content.imagePrompt);
      if (imgBuffer) {
        content.imageBuffer = imgBuffer;
        console.log("✅ ইমেজ তৈরি হয়েছে");
      } else {
        console.warn("⚠️ ইমেজ তৈরি হয়নি, শুধু টেক্সট পোস্ট হবে");
      }
    }

    // ৪. Facebook এ পোস্ট করো
    const result = await postToFacebook(content);

    if (result.success) {
      console.log(`🎉 পোস্ট সফল! Post ID: ${result.postId}`);
    } else {
      console.error(`❌ পোস্ট ব্যর্থ: ${result.error}`);
    }
  } catch (err: any) {
    console.error("❌ Error:", err.message);
  }
}

// Manual run — একটা পোস্ট এখনই করতে চাইলে
async function runNow(): Promise<void> {
  const types: PostType[] = ["irony_text", "info_image", "article_image"];
  const randomType = types[Math.floor(Math.random() * types.length)];
  await runPost(randomType);
}

// Cron jobs সেট করো
function startScheduler(): void {
  console.log("⏰ Facebook Auto-Poster চালু হয়েছে!");
  console.log("📅 Schedule:");

  for (const schedule of SCHEDULES) {
    console.log(`   ${schedule.label} → ${schedule.cron}`);
    cron.schedule(schedule.cron, () => runPost(schedule.type), {
      timezone: "UTC",
    });
  }

  console.log("\n✅ সব schedule সেট হয়েছে। পোস্ট হবে বাংলাদেশ সময় অনুযায়ী।\n");
}

// CLI argument check
const arg = process.argv[2];

if (arg === "--now") {
  // এখনই একটা পোস্ট করো
  runNow().then(() => process.exit(0));
} else if (arg === "--irony") {
  runPost("irony_text").then(() => process.exit(0));
} else if (arg === "--info") {
  runPost("info_image").then(() => process.exit(0));
} else if (arg === "--article") {
  runPost("article_image").then(() => process.exit(0));
} else {
  // Normal mode — scheduler চালু করো
  startScheduler();
}
