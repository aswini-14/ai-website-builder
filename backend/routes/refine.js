const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

/* ---------- SAME PREVIEW BUILDER AS generate.js ---------- */
function buildInlinePreview(files) {
  const html = files["index.html"] || "";
  const css = files["style.css"] || "";
  const js = files["script.js"] || "";

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<base href="/" />
<style>${css}</style>
</head>
<body>
${html
  .replace(/<!DOCTYPE[^>]*>/i, "")
  .replace(/<html[^>]*>|<\/html>/gi, "")
  .replace(/<head[^>]*>[\\s\\S]*?<\/head>/i, "")
  .replace(/<body[^>]*>|<\/body>/gi, "")
}
<script>${js}</script>
</body>
</html>
`;
}

/* -------- REMOVE MARKDOWN -------- */
function extractJSON(text) {
  if (!text) return "";
  return text.replace(/```json|```/g, "").trim();
}

/* -------- FIX INVALID ESCAPES -------- */
function fixInvalidEscapes(text) {
  return text.replace(/\\(?!["\\/bfnrtu])/g, "");
}

/* -------- SAFE PARSE -------- */
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

router.post("/", async (req, res) => {
  const { files, refinementPrompt } = req.body;

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
You are modifying an existing project.

CURRENT FILES:
${JSON.stringify(files)}

USER REQUEST:
${refinementPrompt}

STRICT RULES:
- Modify ONLY required parts
- Keep all other code EXACTLY the same
- Return ONLY modified files
- Return valid JSON

FORMAT:
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

    if (!rawText) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    let cleaned = extractJSON(rawText);
    let parsed = safeParse(cleaned);

    if (!parsed) {
      cleaned = fixInvalidEscapes(cleaned);
      parsed = safeParse(cleaned);
    }

    if (!parsed) {
      console.error("❌ Refinement JSON invalid:", cleaned);
      return res.status(500).json({
        error: "AI returned malformed JSON during refinement."
      });
    }

    /* ---------- MERGE FILES ---------- */
    const updatedFiles = {
      ...files,
      ...parsed.modifiedFiles
    };

    /* ---------- REBUILD PREVIEW ---------- */
    const preview = {
      home: buildInlinePreview(updatedFiles)
    };

    res.json({
      modifiedFiles: parsed.modifiedFiles,
      preview
    });

  } catch (err) {
    console.error("REFINEMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;