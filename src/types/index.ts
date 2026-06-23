export type PostType = "irony_text" | "info_image" | "article_image";

export interface TrendingTopic {
  title: string;
  description: string;
  source: string;
  category: "politics" | "economy" | "tech" | "general";
}

export interface GeneratedContent {
  type: PostType;
  caption: string;
  imagePrompt?: string;
  imageUrl?: string;
  imageBuffer?: Buffer;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
  type: PostType;
}
