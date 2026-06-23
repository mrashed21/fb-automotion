import axios from "axios";
import { TrendingTopic } from "../types";

const TAVILY_KEY = process.env.TAVILY_API_KEY!;
const NEWS_KEY = process.env.NEWS_API_KEY!;

// Tavily দিয়ে trending টপিক খোঁজা
export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  const topics: TrendingTopic[] = [];

  try {
    // Tavily search — বাংলাদেশ ও বিশ্বের আলোচিত বিষয়
    const tavilyRes = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: TAVILY_KEY,
        query: "Bangladesh latest news today trending topics 2026",
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      },
      { timeout: 10000 }
    );

    if (tavilyRes.data?.results) {
      for (const r of tavilyRes.data.results.slice(0, 3)) {
        topics.push({
          title: r.title,
          description: r.content?.slice(0, 300) || "",
          source: r.url,
          category: detectCategory(r.title),
        });
      }
    }
  } catch (err) {
    console.error("Tavily error:", err);
  }

  try {
    // NewsAPI — top headlines
    const newsRes = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        apiKey: NEWS_KEY,
        country: "bd",
        pageSize: 5,
      },
      timeout: 10000,
    });

    if (newsRes.data?.articles) {
      for (const a of newsRes.data.articles.slice(0, 3)) {
        if (!a.title || a.title === "[Removed]") continue;
        topics.push({
          title: a.title,
          description: a.description || "",
          source: a.url,
          category: detectCategory(a.title),
        });
      }
    }
  } catch (err) {
    // Bangladesh news না পেলে global try করি
    try {
      const newsRes = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          apiKey: NEWS_KEY,
          language: "en",
          pageSize: 5,
          q: "Bangladesh OR economy OR technology",
        },
        timeout: 10000,
      });

      if (newsRes.data?.articles) {
        for (const a of newsRes.data.articles.slice(0, 2)) {
          if (!a.title || a.title === "[Removed]") continue;
          topics.push({
            title: a.title,
            description: a.description || "",
            source: a.url,
            category: detectCategory(a.title),
          });
        }
      }
    } catch (e) {
      console.error("NewsAPI error:", e);
    }
  }

  // ফ্যালব্যাক — কোনো টপিক না পেলে default
  if (topics.length === 0) {
    topics.push(
      {
        title: "বাংলাদেশের অর্থনৈতিক পরিস্থিতি",
        description: "দেশের বর্তমান অর্থনীতি ও মূল্যস্ফীতি নিয়ে আলোচনা",
        source: "",
        category: "economy",
      },
      {
        title: "প্রযুক্তি ও কৃত্রিম বুদ্ধিমত্তা",
        description: "AI এর প্রভাব ও ভবিষ্যৎ পরিকল্পনা",
        source: "",
        category: "tech",
      }
    );
  }

  return topics;
}

function detectCategory(title: string): TrendingTopic["category"] {
  const lower = title.toLowerCase();
  if (lower.includes("politic") || lower.includes("government") || lower.includes("election") || lower.includes("রাজনীতি"))
    return "politics";
  if (lower.includes("economy") || lower.includes("price") || lower.includes("inflation") || lower.includes("অর্থ"))
    return "economy";
  if (lower.includes("tech") || lower.includes("ai") || lower.includes("digital") || lower.includes("প্রযুক্তি"))
    return "tech";
  return "general";
}
