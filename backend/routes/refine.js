const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

function buildInlinePreview(files) {
  const html = files["index.html"] || "";
  const css = files["style.css"] || "";
  const js = files["script.js"] || "";

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>${css}</style>
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

${html
  .replace(/<!DOCTYPE[^>]*>/i, "")
  .replace(/<html[^>]*>|<\/html>/gi, "")
  .replace(/<head[^>]*>[\\s\\S]*?<\/head>/i, "")
  .replace(/<body[^>]*>|<\/body>/gi, "")
}

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
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    const raw = await response.json();
    const rawText = raw?.candidates?.[0]?.content?.parts?.[0]?.text;

    const parsed = JSON.parse(extractJSON(rawText));

    const updatedFiles = {
      ...files,
      ...parsed.modifiedFiles
    };

    const preview = buildInlinePreview(updatedFiles);

    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, userId: req.user.id },
      { code: { files: updatedFiles }, preview },
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