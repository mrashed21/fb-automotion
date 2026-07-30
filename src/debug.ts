import "dotenv/config";
import axios from "axios";

const ENDPOINT = process.env.AZURE_ENDPOINT!;
const API_KEY = process.env.AZURE_API_KEY!;
async function test() {

  console.log("ENDPOINT:", ENDPOINT);
  console.log("API_KEY:", API_KEY ? API_KEY.slice(0, 10) + "..." : "❌ নেই");
  
  const base = ENDPOINT.replace(/\/api\/projects\/.*$/, "").replace(/\/openai\/v1.*$/, "");
  console.log("BASE URL:", base);

  
  // সব possible endpoint format try করি
  const urls = [
    `${base}/openai/deployments/gpt-4.1/chat/completions?api-version=2024-12-01-preview`,
    `${base}/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview`,
    `${ENDPOINT}/chat/completions?api-version=2024-12-01-preview`,
    `${base}/v1/chat/completions`,
  ];

  for (const url of urls) {
    try {
      console.log(`\n🔄 Trying: ${url}`);
      const res = await axios.post(
        url,
        {
          messages: [{ role: "user", content: "Say hello in one word" }],
          max_tokens: 10,
        },
        {
          headers: {
            "api-key": API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      console.log("✅ SUCCESS! Response:", res.data.choices[0].message.content);
      console.log("✅ এই URL কাজ করছে:", url);
      break;
    } catch (err: any) {
      console.log(`❌ Failed (${err?.response?.status}):`, err?.response?.data?.error?.message || err.message);
    }
  }
}

test();

