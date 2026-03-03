const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const formatAsTerminal = require("../utils/terminalFormatter");

/* ===============================
   IMPROVED STATIC PREVIEW BUILDER
================================= */
function buildInlinePreview(files) {
  if (!files["index.html"]) return null;

  const html = files["index.html"];

  // 🔥 Auto-detect CSS file (even inside folders like css/style.css)
  const cssFileKey = Object.keys(files).find(file =>
    file.toLowerCase().endsWith(".css")
  );

  // 🔥 Auto-detect JS file (even inside folders like js/script.js)
  const jsFileKey = Object.keys(files).find(file =>
    file.toLowerCase().endsWith(".js")
  );

  const css = cssFileKey ? files[cssFileKey] : "";
  const js = jsFileKey ? files[jsFileKey] : "";

  const cleanedHTML = html
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .replace(/<html[^>]*>|<\/html>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/i, "")
    .replace(/<body[^>]*>|<\/body>/gi, "")
    .replace(/<script[^>]*src=["'][^"']+["'][^>]*><\/script>/gi, "")
    .replace(/<link[^>]*href=["'][^"']+["'][^>]*>/gi, "");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
${css}
</style>
</head>
<body>

<script>
document.addEventListener("click", function(e) {
  const link = e.target.closest("a");
  if (link && link.getAttribute("href")) {
    e.preventDefault();
  }
});
</script>

${cleanedHTML}

<script>
try {
${js}
} catch(e) {
console.error("Preview Script Error:", e);
}
</script>

</body>
</html>
`;
}

/* ===============================
   SUPER SAFE JSON PARSER
================================= */
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    try {
      const cleaned = text
        .replace(/```json|```/g, "")
        .replace(/\r?\n|\r/g, "")
        .trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      throw new Error("AI returned invalid JSON");
    }
  }
}

/* ===============================
   GENERATE ROUTE
================================= */
router.post("/", authMiddleware, async (req, res) => {
  const { prompt } = req.body;

  try {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const systemInstruction = `
You are an expert full-stack web developer.

Generate a complete web application based on the user's requested tech stack.

IMPORTANT RULES:
- Detect stack automatically from prompt.
- Use proper folder structure.
- Include all necessary config files.
- Do NOT include explanations.
- Do NOT include markdown.
- Return ONLY valid JSON.

JSON FORMAT:

{
  "project": {
    "name": "",
    "techStack": []
  },
  "code": {
    "files": {
      "file/path.ext": "file content"
    }
  },
  "runInstructions": ""
}
`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${prompt}\n\n${systemInstruction}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2
        }
      })
    });

    const raw = await response.json();
    const rawText = raw?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty AI response");

    const result = safeParseJSON(rawText);
    const files = result?.code?.files || {};

    let preview = null;

    // ✅ STATIC SITE PREVIEW
    if (files["index.html"]) {
      preview = buildInlinePreview(files);
    } else {
      // ✅ Non-static stacks (React, Node, etc)
      preview = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
body {
  margin: 0;
  padding: 0;
  font-family: Inter, Arial, sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.container {
  background: #111827;
  padding: 40px;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  background: #6366f1;
  border-radius: 999px;
  font-size: 13px;
  margin-bottom: 15px;
}

.terminal {
  background: #0f172a;
  padding: 20px;
  border-radius: 12px;
  font-family: Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
}
</style>
</head>

<body>
  <div class="container">
    <h2>${result.project?.name || "Generated Project"}</h2>

    <div class="badge">
      ${(result.project?.techStack || []).join(", ")}
    </div>

    <h3>Run Instructions</h3>

    <div class="terminal">
      ${formatAsTerminal(result.runInstructions || "Run locally")}
    </div>

    <p style="margin-top:20px;color:#9ca3af">
      This stack requires local execution.
    </p>
  </div>
</body>
</html>
`;
    }

    const newProject = await Project.create({
      userId: req.user.id,
      title: result.project?.name || "Untitled Project",
      prompt,
      code: result.code,
      preview,
      pages: [],
      thumbnail: null
    });

    res.json(newProject);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;