// ===== CONTACT DETAILS (used for contact links in chat) =====
const YASH = {
  name: "Yash Soni",
  location: "Maryland, United States",
  email: "yashnitinsoni.17@gmail.com",
  phone: "+1 (667)-320-5799",
  linkedin: "https://www.linkedin.com/in/yashsoni176",
  github: "https://github.com/yashnitinsoni",
  currentRole: "Software Engineer at Hirello.ai",
  summary: "Software Engineer and Data Engineer with 3+ years of experience building AI-powered applications, data pipelines, and full stack systems. Master's in Information Systems from UMBC (GPA 3.9). Currently building AI pipelines and full stack features at Hirello.ai.",

  experience: [
    {
      role: "Software Engineer",
      company: "Hirello.ai",
      location: "USA",
      dates: "December 2025 – Present",
      highlights: [
        "Engineered a Gemini AI pipeline linking 1000+ email threads to dashboard cards for one-click conversation access",
        "Proactively integrated CoreSignal API to build a real-time US job supply and demand map across 50 states, independently adding a 24-hour cache layer to eliminate redundant API calls and boost page load performance",
        "Led the migration of 5 modules and 10+ pages to a redesigned frontend using Vue.js and TypeScript, owning UI consistency improvements across 4 key features",
        "Secured 15+ API endpoints by implementing a JWT authentication layer in FastAPI, validating bearer tokens from request headers and cookies across all product surfaces",
        "Collaborated with 2 cross-functional stakeholders across engineering and product teams to clarify requirements, align priorities, and deliver features on schedule"
      ],
      skills: ["Python", "Gemini AI", "FastAPI", "Vue.js", "TypeScript", "JWT Auth", "CoreSignal API", "Docker"]
    },
    {
      role: "Analytics Engineer",
      company: "Harman International",
      location: "India",
      dates: "January 2022 – December 2023",
      highlights: [
        "Streamlined data ingestion and validation into AWS Redshift using Apache Airflow and Python, eliminating 8-10 hours of manual processing per month and strengthening pipeline reliability",
        "Partnered with client teams to extract and consolidate 200K+ weekly records via SQL, delivering clean datasets to reporting teams and supporting data-driven decisions across accounts",
        "Designed 7+ client KPI dashboards tracking throughput and service performance metrics, enabling consistent weekly reporting and data-driven decision making across accounts",
        "Documented data pipelines and dashboards, enabling faster onboarding across 3+ client accounts"
      ],
      skills: ["Python", "SQL", "AWS Redshift", "Apache Airflow", "Tableau", "ETL", "Data Pipelines"]
    },
    {
      role: "Data Analyst",
      company: "The Robotics Forum – VIT",
      location: "India",
      dates: "January 2021 – December 2021",
      highlights: [
        "Processed 500+ robotics sensor datasets using SQL and Python, advancing data quality and reporting accuracy",
        "Deployed 4+ Tableau dashboards surfacing performance trends and insights for weekly faculty reviews",
        "Drove logging standardization across 5+ experiment types, establishing data quality standards for the research team"
      ],
      skills: ["SQL", "Python", "Tableau", "Data Cleaning"]
    }
  ],

  education: [
    {
      degree: "Master of Science in Information Systems",
      school: "University of Maryland, Baltimore County (UMBC)",
      location: "Baltimore, MD",
      dates: "January 2024 – December 2025",
      gpa: "3.9",
      courses: ["Management Information Systems", "Data Mining", "Data Analysis for Cybersecurity", "Decision Making Support Systems", "Advanced Database Projects", "Statistical Learning for Data Analysis"]
    },
    {
      degree: "Bachelor of Technology in Computer Science",
      school: "Vishwakarma Institute of Technology (VIT)",
      location: "Pune, India",
      dates: "June 2018 – May 2022",
      gpa: "3.71",
      courses: ["Python", "Data Structures and Algorithms", "OOP", "Database Management Systems", "Java", "C++"]
    }
  ],

  skills: {
    "Programming & Databases": ["Python", "SQL", "JavaScript", "TypeScript", "PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "Pandas", "NumPy"],
    "Backend & APIs": ["FastAPI", "REST APIs", "JWT Auth", "Apache Airflow", "Docker", "ETL Pipelines", "Data Modeling"],
    "Frontend": ["React", "Vue.js", "Next.js", "Streamlit", "Tailwind CSS", "HTML", "CSS"],
    "AI & ML": ["RAG Pipelines", "LLM Integration", "Vector Search", "Prompt Engineering", "ChromaDB", "Gemini AI"],
    "Visualization": ["Tableau", "Streamlit", "Matplotlib", "Seaborn"],
    "Cloud & Platforms": ["AWS (S3, Lambda, Redshift, Athena, Glue)", "Snowflake", "Supabase", "ChromaDB", "Git", "GitHub", "Jira"]
  },

  certifications: ["AWS Certified Cloud Practitioner", "HackerRank SQL (Advanced)"],

  projects: [
    {
      name: "Second Brain for YouTube",
      tech: "Next.js, FastAPI, Python, ChromaDB, Supabase",
      description: "Converts any YouTube video into a searchable personal knowledge base with auto-generated summaries, flashcards, and a Q&A chat interface. Answers include clickable timestamp links back to the exact video moment. Built a RAG pipeline with transcript extraction, 60-second timestamp-aware chunking, and vector search."
    },
    {
      name: "FDA Food Recall Intelligence Pipeline",
      tech: "Python, MongoDB, AWS S3, AWS Glue, Airflow",
      description: "Engineered an automated pipeline ingesting 5K+ FDA recall records via openFDA API across 30+ food categories. Transforms and stores datasets as Parquet files in AWS S3 using Airflow DAGs, catalogs via AWS Glue, and visualizes recall trends by category, state, and date range."
    }
  ]
};

// Mouse/trackpad UIs — auto-focus the chat input. Touch-primary devices skip focus so Safari does not
// open the keyboard until the user taps the field (and iOS avoids zoom quirks when combined with 16px input CSS).
function prefersFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// ===== CHATBOT ENGINE =====
// Sends messages to /api/chat (Vercel serverless function → Groq LLaMA 3.3 70B).
// Maintains conversation history so follow-up questions work naturally.
class ChatBot {
  constructor() {
    this.messagesEl   = document.getElementById("chatMessages");
    this.inputEl      = document.getElementById("chatInput");
    this.sendBtn      = document.getElementById("chatSend");
    this.suggestionsEl = document.getElementById("chatSuggestions");

    if (!this.inputEl) return;

    // Stores previous turns so the AI has context for follow-up questions
    this.history = [];
    // Prevents sending a new message while a response is loading
    this.isStreaming = false;

    this.sendBtn.addEventListener("click", () => this.handleSend());
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) this.handleSend();
    });

    this.suggestionsEl.querySelectorAll(".chat-suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.addMessage(btn.dataset.q, "user");
        this.streamResponse(btn.dataset.q);
        this.suggestionsEl.style.display = "none";
      });
    });
  }

  handleSend() {
    if (this.isStreaming) return;
    const text = this.inputEl.value.trim();
    if (!text) return;
    this.addMessage(text, "user");
    this.inputEl.value = "";
    this.suggestionsEl.style.display = "none";
    this.streamResponse(text);
  }

  addMessage(text, type) {
    const msg = document.createElement("div");
    msg.className = `chat-msg ${type}`;
    if (type === "bot") {
      msg.innerHTML = `<div class="chat-msg-avatar">YS</div><div class="chat-bubble"></div>`;
    } else {
      msg.innerHTML = `<div class="chat-bubble">${text}</div>`;
    }
    this.messagesEl.appendChild(msg);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return msg;
  }

  showTyping() {
    const typing = document.createElement("div");
    typing.className = "chat-msg bot";
    typing.id = "typingIndicator";
    typing.innerHTML = `<div class="chat-msg-avatar">YS</div><div class="typing-indicator"><span></span><span></span><span></span></div>`;
    this.messagesEl.appendChild(typing);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  removeTyping() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
  }

  async streamResponse(userMessage) {
    this.isStreaming = true;
    this.sendBtn.disabled = true;
    this.showTyping();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: this.history
        })
      });

      this.removeTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) {
          this.addMessage("I'm getting too many requests right now. Please wait a moment and try again!", "bot");
        } else {
          this.addMessage("Sorry, I ran into an issue. Please try again in a moment.", "bot");
        }
        console.error("API error:", err);
        return;
      }

      const data = await res.json();
      const fullText = data.text || "Sorry, I didn't get a response. Please try again.";

      // Render with markdown bold + line breaks
      const html = fullText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");

      const botMsg = this.addMessage("", "bot");
      botMsg.querySelector(".chat-bubble").innerHTML = html;
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;

      // Save to history for follow-up context
      this.history.push({ role: "user",  text: userMessage });
      this.history.push({ role: "model", text: fullText });

      // Keep last 10 exchanges max
      if (this.history.length > 20) this.history = this.history.slice(-20);

    } catch (err) {
      this.removeTyping();
      this.addMessage("Connection error — please check your internet and try again.", "bot");
      console.error("Fetch error:", err);
    } finally {
      this.isStreaming = false;
      this.sendBtn.disabled = false;
      if (prefersFinePointer()) this.inputEl.focus();
    }
  }
}

// ===== THEME (light / dark) =====
const THEME_STORAGE_KEY = "theme";

function getStoredThemeChoice() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function effectiveTheme() {
  const saved = getStoredThemeChoice();
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyDocumentTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const sw = document.getElementById("themeSwitch");
  if (!sw) return;
  const isDark = theme === "dark";
  sw.setAttribute("aria-checked", isDark ? "true" : "false");
  sw.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

class ThemeToggle {
  constructor() {
    const sw = document.getElementById("themeSwitch");
    if (!sw) return;
    applyDocumentTheme(document.documentElement.dataset.theme || effectiveTheme());
    sw.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) {}
      applyDocumentTheme(next);
    });
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if (getStoredThemeChoice() === "light" || getStoredThemeChoice() === "dark") return;
      applyDocumentTheme(effectiveTheme());
    });
  }
}

// ===== VIEW TOGGLE =====
class ViewToggle {
  constructor() {
    this.btns = document.querySelectorAll(".view-toggle-btn");
    this.chatOverlay = document.getElementById("chatbotOverlay");
    this.websiteContent = document.getElementById("websiteContent");
    this.btns.forEach((btn) => {
      btn.addEventListener("click", () => this.switchView(btn.dataset.view));
    });
  }
  switchView(view, scrollTarget) {
    this.btns.forEach((b) => b.classList.remove("active"));
    document.querySelector(`[data-view="${view}"]`).classList.add("active");
    if (view === "ai") {
      this.websiteContent.classList.add("hidden");
      this.chatOverlay.classList.add("active");
      if (prefersFinePointer()) document.getElementById("chatInput").focus();
    } else {
      this.chatOverlay.classList.remove("active");
      this.websiteContent.classList.remove("hidden");
      if (scrollTarget) {
        requestAnimationFrame(() => {
          const el = document.querySelector(scrollTarget);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        });
      }
    }
  }
}

// ===== TERMINAL TYPING EFFECT =====
// Cycles through commands and outputs in the hero terminal window.
class TerminalEffect {
  constructor() {
    this.commands = [
      { cmd: "whoami", output: "yash_soni — software engineer & data engineer" },
      { cmd: "cat skills.txt", output: "Python · AI Pipelines · Full Stack · Cloud · Data Engineering" },
      { cmd: "ls projects/", output: "second-brain-youtube/  fda-food-recall-pipeline/" },
      { cmd: "echo $experience", output: "3+ years in software & data engineering" },
      { cmd: "echo $current_role", output: "Software Engineer @ Hirello.ai — building AI pipelines" },
    ];
    this.cmdIndex = 0;
    this.commandEl = document.getElementById("typingCommand");
    this.outputEl = document.getElementById("terminalOutput");
    if (this.commandEl) this.typeNextCommand();
  }
  typeNextCommand() {
    const { cmd } = this.commands[this.cmdIndex];
    let charIndex = 0;
    this.commandEl.textContent = "";
    this.outputEl.innerHTML = "";
    const type = () => {
      if (charIndex < cmd.length) {
        this.commandEl.textContent += cmd[charIndex];
        charIndex++;
        setTimeout(type, 60 + Math.random() * 40);
      } else {
        setTimeout(() => this.showOutput(), 500);
      }
    };
    type();
  }
  showOutput() {
    const { output } = this.commands[this.cmdIndex];
    const line = document.createElement("div");
    line.className = "output-line";
    line.textContent = output;
    this.outputEl.appendChild(line);
    this.cmdIndex = (this.cmdIndex + 1) % this.commands.length;
    setTimeout(() => this.typeNextCommand(), 2500);
  }
}

// ===== STATS COUNTER =====
class StatsCounter {
  constructor() {
    this.animated = false;
    const el = document.getElementById("heroStats");
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.animated) {
        this.animated = true;
        this.animate();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
  }
  animate() {
    document.querySelectorAll(".stat-number").forEach((el) => {
      const target = parseInt(el.dataset.value);
      const suffix = el.dataset.suffix || "";
      const steps = 40;
      let step = 0;
      const counter = setInterval(() => {
        step++;
        const progress = 1 - Math.pow(1 - step / steps, 3);
        const current = Math.floor(target * progress);
        if (step >= steps) { el.textContent = target.toLocaleString() + suffix; clearInterval(counter); }
        else { el.textContent = current.toLocaleString() + suffix; }
      }, 45);
    });
  }
}

// ===== PROJECT CARD TILT =====
class CardTilt {
  constructor() {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotX = ((y - rect.height / 2) / (rect.height / 2)) * 6;
        const rotY = ((rect.width / 2 - x) / (rect.width / 2)) * 6;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale(1)";
      });
    });
  }
}

// ===== SCROLL PROGRESS =====
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.getElementById("scrollProgress").style.width = progress + "%";
}

// ===== ACTIVE NAV =====
function updateActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const scrollY = window.scrollY + 100;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) link.classList.toggle("active", scrollY >= top && scrollY < top + height);
  });
}

// ===== SCROLL REVEAL =====
function initRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  toggle.addEventListener("click", () => { toggle.classList.toggle("active"); menu.classList.toggle("active"); });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => { toggle.classList.remove("active"); menu.classList.remove("active"); });
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(form.action, { method: form.method, body: new FormData(form), headers: { Accept: "application/json" } });
      if (response.ok) {
        document.getElementById("form-message").style.display = "block";
        form.reset();
        setTimeout(() => { document.getElementById("form-message").style.display = "none"; }, 4000);
      } else { alert("Something went wrong. Please try again!"); }
    } catch { alert("Something went wrong. Please try again!"); }
  });
}

// ===== RESUME MODAL =====
function initResumeModal() {
  const modal = document.getElementById("resumeModal");
  const iframe = document.getElementById("resumeIframe");
  if (!modal || !iframe) return;
  const observer = new MutationObserver(() => {
    if (modal.classList.contains("active") && !iframe.dataset.loaded) {
      iframe.src = iframe.dataset.src;
      iframe.dataset.loaded = "true";
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) modal.classList.remove("active");
  });
}

// ===== SCROLL TO TOP ON REFRESH =====
if (history.scrollRestoration) history.scrollRestoration = "manual";
window.addEventListener("beforeunload", () => { window.scrollTo(0, 0); });

// ===== INIT =====
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => { updateScrollProgress(); updateActiveNav(); ticking = false; });
    ticking = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash) history.replaceState(null, "", window.location.pathname);
  window.scrollTo(0, 0);
  new ThemeToggle();
  window._viewToggle = new ViewToggle();
  new ChatBot();

  // Make nav links work from AI chat view — switch back to website and scroll to section
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const chatOverlay = document.getElementById("chatbotOverlay");
      const isAiActive = chatOverlay && chatOverlay.classList.contains("active");
      if (isAiActive && link.getAttribute("href") && link.getAttribute("href").startsWith("#")) {
        e.preventDefault();
        const target = link.getAttribute("href");
        window._viewToggle.switchView("website", target);
      }
    });
  });
  new TerminalEffect();
  new StatsCounter();
  new CardTilt();
  initRevealObserver();
  initMobileMenu();
  initContactForm();
  initResumeModal();
  window.addEventListener("scroll", onScroll, { passive: true });
  updateScrollProgress();
  updateActiveNav();
});