const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

/* ===============================
   CLEAN + SAFE PREVIEW BUILDER
================================= */
function buildInlinePreview(files) {
  const html = files["index.html"] || "";
  const css = files["style.css"] || "";
  const js = files["script.js"] || "";

  const cleanedHTML = html
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .replace(/<html[^>]*>|<\/html>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/i, "")
    .replace(/<body[^>]*>|<\/body>/gi, "")
    // remove external script tags
    .replace(/<script[^>]*src=["'][^"']+["'][^>]*><\/script>/gi, "")
    // remove external css links
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

function extractJSON(text) {
  return text.replace(/```json|```/g, "").trim();
}

/* ===============================
   GENERATE ROUTE
================================= */
router.post("/", authMiddleware, async (req, res) => {
  const { prompt } = req.body;

  try {
    const lowerPrompt = prompt.toLowerCase();
    const wantsSPA =
      lowerPrompt.includes("react") ||
      lowerPrompt.includes("node") ||
      lowerPrompt.includes("express") ||
      lowerPrompt.includes("spa") ||
      lowerPrompt.includes("single page");

    const generationInstruction = wantsSPA
      ? `
Generate a SINGLE PAGE APPLICATION using:

- Only HTML
- CSS
- JavaScript
- One index.html
- Dynamic show/hide section switching
- No page reload
- No href navigation

DO NOT use React, Node, import/export, require, JSX, modules.
`
      : `
Generate a STATIC website using:

- HTML
- CSS
- JavaScript
- Standard navigation

DO NOT use React, Node, import/export, require, JSX, modules.
`;

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
${prompt}

${generationInstruction}

Return ONLY valid JSON:

{
  "project": { "name": "", "techStack": [] },
  "pages": [],
  "code": {
    "files": {
      "index.html": "",
      "style.css": "",
      "script.js": ""
    }
  }
}
`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    const raw = await response.json();
    const rawText = raw?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty AI response");

    const result = JSON.parse(extractJSON(rawText));

    const preview = buildInlinePreview(result.code.files);

    const newProject = await Project.create({
      userId: req.user.id,
      title: result.project?.name || "Untitled Project",
      prompt,
      code: result.code,
      preview,
      pages: result.pages
    });

    res.json(newProject);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;