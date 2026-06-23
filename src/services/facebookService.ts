import axios from "axios";
import FormData from "form-data";
import { GeneratedContent, PostResult } from "../types";

const PAGE_ID = process.env.FB_PAGE_ID!;
const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
const FB_BASE = "https://graph.facebook.com/v19.0";

// টেক্সট-only পোস্ট
async function postText(caption: string): Promise<string> {
  const res = await axios.post(`${FB_BASE}/${PAGE_ID}/feed`, {
    message: caption,
    access_token: ACCESS_TOKEN,
    published: true,
  });
  return res.data.id;
}

// ইমেজ সহ পোস্ট
async function postWithImage(
  caption: string,
  imageBuffer: Buffer,
): Promise<string> {
  // Step 1: ছবি upload করি
  const form = new FormData();
  form.append("source", imageBuffer, {
    filename: "post-image.png",
    contentType: "image/png",
  });
  form.append("caption", caption);
  form.append("access_token", ACCESS_TOKEN);

  const res = await axios.post(`${FB_BASE}/${PAGE_ID}/photos`, form, {
    headers: form.getHeaders(),
    timeout: 60000,
  });

  return res.data.id || res.data.post_id;
}

// Main poster function
export async function postToFacebook(
  content: GeneratedContent,
): Promise<PostResult> {
  try {
    let postId: string;

    if (content.type === "irony_text") {
      // শুধু টেক্সট
      postId = await postText(content.caption);
    } else if (content.imageBuffer) {
      // ইমেজ + ক্যাপশন
      postId = await postWithImage(content.caption, content.imageBuffer);
    } else {
      // ইমেজ না থাকলে শুধু টেক্সট
      postId = await postText(content.caption);
    }

    console.log(`✅ Posted [${content.type}] → ID: ${postId}`);
    return { success: true, postId, type: content.type };
  } catch (err: any) {
    const error = err?.response?.data?.error?.message || err.message;
    console.error(`❌ Post failed [${content.type}]:`, error);
    return { success: false, error, type: content.type };
  }
}

// Long-lived token refresh (৬০ দিনের জন্য)
export async function refreshLongLivedToken(): Promise<string | null> {
  try {
    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;

    if (!appId || !appSecret) {
      console.warn(
        "⚠️ FB_APP_ID বা FB_APP_SECRET নেই, token refresh skip করছি",
      );
      return null;
    }

    const res = await axios.get(`${FB_BASE}/oauth/access_token`, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: ACCESS_TOKEN,
      },
    });

    console.log("✅ Long-lived token পাওয়া গেছে, .env আপডেট করো!");
    console.log("নতুন token:", res.data.access_token);
    return res.data.access_token;
  } catch (err) {
    console.error("Token refresh error:", err);
    return null;
  }
}
