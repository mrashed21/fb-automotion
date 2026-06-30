import "dotenv/config";
import cron from "node-cron";

import {
  generateArticlePost,
  generateImage,
  generateInfoPost,
  generateIronyPost,
  getRandomTopic,
} from "./services/aiService";
import { postToFacebook } from "./services/facebookService";
import { GeneratedContent, PostType } from "./types";

// ডেইলি পোস্ট schedule — বাংলাদেশ সময় (UTC+6)
// ১০টি পোস্ট প্রতিদিন, সকাল ৮টা থেকে রাত ১০টার মধ্যে সমানভাবে বিতরণ
// প্রতিটি স্লটে ~৯৩ মিনিটের গ্যাপ থাকবে
// BD সময় → UTC সময় (UTC = BD - 6h):
//   BD  8:00 = UTC  2:00  (slot  1)
//   BD  9:33 = UTC  3:33  (slot  2)
//   BD 11:07 = UTC  5:07  (slot  3)
//   BD 12:40 = UTC  6:40  (slot  4)
//   BD 14:13 = UTC  8:13  (slot  5)
//   BD 15:47 = UTC  9:47  (slot  6)
//   BD 17:20 = UTC 11:20  (slot  7)
//   BD 18:53 = UTC 12:53  (slot  8)
//   BD 20:27 = UTC 14:27  (slot  9)
//   BD 22:00 = UTC 16:00  (slot 10)
// পোস্ট টাইপ round-robin: irony×4, info×3, article×3 = ১০ পোস্ট/দিন
// প্রতিটি টপিক র‍্যান্ডমলি সিলেক্ট হয়, ৬টি টপিক × ২ বার ≈ ১২ → ১০ স্লটে গড়ে ২বার/টপিক
const SCHEDULES: { cron: string; type: PostType; label: string }[] = [
  { cron: "0 2 * * *",   type: "irony_text",   label: "সকাল ৮:০০ — আইরনি পোস্ট (slot 1)" },
  { cron: "33 3 * * *",  type: "info_image",   label: "সকাল ৯:৩৩ — তথ্য পোস্ট (slot 2)" },
  { cron: "7 5 * * *",   type: "article_image",label: "সকাল ১১:০৭ — আর্টিকেল পোস্ট (slot 3)" },
  { cron: "40 6 * * *",  type: "irony_text",   label: "দুপুর ১২:৪০ — আইরনি পোস্ট (slot 4)" },
  { cron: "13 8 * * *",  type: "info_image",   label: "দুপুর ২:১৩ — তথ্য পোস্ট (slot 5)" },
  { cron: "47 9 * * *",  type: "article_image",label: "বিকাল ৩:৪৭ — আর্টিকেল পোস্ট (slot 6)" },
  { cron: "20 11 * * *", type: "irony_text",   label: "বিকাল ৫:২০ — আইরনি পোস্ট (slot 7)" },
  { cron: "53 12 * * *", type: "info_image",   label: "সন্ধ্যা ৬:৫৩ — তথ্য পোস্ট (slot 8)" },
  { cron: "27 14 * * *", type: "article_image",label: "রাত ৮:২৭ — আর্টিকেল পোস্ট (slot 9)" },
  { cron: "0 16 * * *",  type: "irony_text",   label: "রাত ১০:০০ — আইরনি পোস্ট (slot 10)" },
];

async function runPost(type: PostType): Promise<void> {
  console.log(
    `\n🚀 শুরু হচ্ছে: ${type} — ${new Date().toLocaleString("bn-BD")}`,
  );

  try {
    // ১. Random টপিক সিলেক্ট করো

    const topic = getRandomTopic();
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
  console.log("📅 Schedule (১০ পোস্ট/দিন — সকাল ৮টা থেকে রাত ১০টা, BD সময়):");

  for (const schedule of SCHEDULES) {
    console.log(`   ${schedule.label} → ${schedule.cron}`);
    cron.schedule(schedule.cron, () => runPost(schedule.type), {
      timezone: "UTC",
    });
  }

  console.log(
    "\n✅ সব schedule সেট হয়েছে। প্রতিদিন ১০টি পোস্ট হবে বাংলাদেশ সময় অনুযায়ী (৮am–১০pm)।\n",
  );
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
