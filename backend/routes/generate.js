const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");


function extractJSON(text) {
  return text.replace(/```json|```/g, "").trim();
}


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
  .replace(/<head[^>]*>[\s\S]*?<\/head>/i, "")
  .replace(/<body[^>]*>|<\/body>/gi, "")
}
<script>${js}</script>
</body>
</html>
`;
}

router.post("/", async (req, res) => {
  const { prompt } = req.body;

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
${prompt}

STRICT RULES:
- Return ONLY valid JSON
- Generate REAL project code (multi-file)
- Do NOT inline CSS/JS in real code
- Backend will build preview

JSON FORMAT:
{
  "project": {
    "name": "",
    "techStack": []
  },
  "pages": [
    { "id": "home", "route": "/", "title": "Home", "entry": true }
  ],
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
    const rawText = raw.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty AI response");

    const result = JSON.parse(extractJSON(rawText));

    // Determine entry page
    const entryPage =
      result.pages?.find(p => p.entry) || result.pages?.[0];

    // Build preview safely
    result.preview = {
      [entryPage.id]: buildInlinePreview(result.code.files)
    };

    res.json(result);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
