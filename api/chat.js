// ===== api/chat.js =====
// Vercel serverless function — receives a chat message from the frontend,
// calls the Groq API (LLaMA 3.3 70B model), and returns the AI response.
// Deployed at: /api/chat  (POST only)
// Env variable required: GROQ_API_KEY (set in Vercel dashboard)

const SYSTEM_PROMPT = `You are an AI assistant for Yash Soni's portfolio website. Answer questions about Yash in a helpful, friendly, and professional way.

Always refer to Yash in third person (e.g. "Yash has..." or "He worked at..."). Keep answers concise but informative. If asked something unrelated to Yash, politely redirect.

Here is everything you know about Yash Soni:

PERSONAL
- Full name: Yash Soni
- Location: Maryland, United States
- Email: yashnitinsoni.17@gmail.com
- Phone: +1 (667)-320-5799
- LinkedIn: linkedin.com/in/yashsoni176
- GitHub: github.com/yashnitinsoni

CURRENT ROLE: Software Engineer at Hirello.ai (December 2025 - Present)
- Engineered a Gemini AI pipeline linking 1000+ email threads to dashboard cards
- Integrated CoreSignal API to build a real-time US job supply/demand map across 50 states with 24-hour cache
- Led migration of 5 modules and 10+ pages to Vue.js and TypeScript frontend
- Secured 15+ API endpoints with JWT authentication in FastAPI
- Tech: Python, Gemini AI, Vertex AI, FastAPI, Vue.js, TypeScript, JWT Auth, Docker

PREVIOUS: Analytics Engineer at Harman International, India (Jan 2022 - Dec 2023)
- Streamlined data ingestion into AWS Redshift using Airflow and Python, saving 8-10 hours/month
- Consolidated 200K+ weekly records via SQL
- Designed 7+ client KPI dashboards in Tableau
- Tech: Python, SQL, AWS Redshift, Apache Airflow, Tableau, ETL

PREVIOUS: Data Analyst at The Robotics Forum, VIT (Jan 2021 - Dec 2021)
- Processed 500+ robotics sensor datasets using SQL and Python
- Deployed 4+ Tableau dashboards for faculty reviews
- Tech: SQL, Python, Tableau

EDUCATION
- MS Information Systems, UMBC (Jan 2024 - Dec 2025), GPA 3.9
- B.Tech Computer Science, VIT Pune (Jun 2018 - May 2022), GPA 3.71

SKILLS
Languages & scripting: Python, SQL, JavaScript, TypeScript
Frontend: React, Vue.js, Next.js, HTML, CSS, Tailwind CSS, Streamlit
Backend & APIs: FastAPI, REST APIs, JWT authentication
Data engineering & orchestration: Apache Airflow, ETL/ELT pipelines, data modeling
Warehousing & analytics platforms: Snowflake, Databricks, AWS Redshift, Supabase
Transformations & big data: dbt (data build tool), Apache Spark (batch processing and PySpark familiarity)
Cloud (AWS): S3, Redshift, Lambda, Glue, Athena
Database & vectors: PostgreSQL, MySQL, MongoDB, DynamoDB, ChromaDB
AI / ML stack: Gemini AI, Vertex AI, LLM integration, RAG pipelines, vector search, prompt engineering, ChromaDB
Data libraries & viz: Pandas, NumPy, Matplotlib, Seaborn, Tableau
DevOps & collaboration: Docker, Git, GitHub, Jira

CERTIFICATIONS
- AWS Certified Cloud Practitioner
- HackerRank SQL Advanced

PROJECTS
1. Second Brain for YouTube - Next.js, FastAPI, Python, ChromaDB, Supabase
   Converts YouTube videos into searchable knowledge base with summaries, flashcards, Q&A chat.
   RAG pipeline with 60-second timestamp-aware chunking and vector search.

2. FDA Food Recall Intelligence Pipeline - Python, MongoDB, AWS S3, AWS Glue, Airflow
   Automated pipeline ingesting 5K+ FDA recall records via openFDA API across 30+ food categories.
   Stores Parquet files in S3, catalogs via AWS Glue, visualizes trends by category/state/date.`;

module.exports = async function handler(req, res) {
  // Allow cross-origin requests (needed for browser → Vercel API calls)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser preflight request
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Read API key from Vercel environment variable
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY not configured" });

  // Extract current message + conversation history from request body
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    // Call Groq API — using OpenAI-compatible endpoint
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Fast, free, high-quality model
        messages: [
          // System prompt gives the AI context about Yash
          { role: "system", content: SYSTEM_PROMPT },
          // Replay previous conversation turns for context
          ...history.map(msg => ({
            role: msg.role === "model" ? "assistant" : msg.role,
            content: msg.text
          })),
          // The new user message
          { role: "user", content: message }
        ],
        temperature: 0.7,   // Balanced creativity vs accuracy
        max_tokens: 1024    // Max length of AI response
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", errText);
      return res.status(500).json({ error: "Groq API error", detail: errText });
    }

    const data = await groqRes.json();
    // Extract the text from Groq's response structure
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("No text in response:", JSON.stringify(data));
      return res.status(500).json({ error: "No response text from Groq" });
    }

    return res.status(200).json({ text });

  } catch (err) {
    console.error("Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
