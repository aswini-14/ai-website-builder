const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

/* ===============================
   IMPROVED PREVIEW BUILDER
================================= */
function buildInlinePreview(files) {
  if (!files["index.html"]) return null;

  const html = files["index.html"];

  // 🔥 Auto-detect CSS file (even in folders)
  const cssFileKey = Object.keys(files).find(file =>
    file.toLowerCase().endsWith(".css")
  );

  // 🔥 Auto-detect JS file (even in folders)
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
   SAFE JSON PARSER
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
   REFINE ROUTE
================================= */
router.post("/", authMiddleware, async (req, res) => {
  const { files, refinementPrompt, projectId } = req.body;

  try {
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
You are modifying a browser-compatible website.

CURRENT FILES:
${JSON.stringify(files)}

USER REQUEST:
${refinementPrompt}

Keep everything compatible with plain HTML, CSS, JS.
Do NOT use React, Node, import/export, modules.

Return ONLY valid JSON:

{
  "modifiedFiles": {
    "filename": "updated content"
  }
}
`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    const raw = await response.json();
    const rawText = raw?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty AI response");

    const parsed = safeParseJSON(rawText);

    const updatedFiles = {
      ...files,
      ...parsed.modifiedFiles
    };

    const preview = buildInlinePreview(updatedFiles);

    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, userId: req.user.id },
      {
        code: { files: updatedFiles },
        preview,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({
      modifiedFiles: parsed.modifiedFiles,
      preview,
      project: updatedProject
    });

  } catch (err) {
    console.error("REFINE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;