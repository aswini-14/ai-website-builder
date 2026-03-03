const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const authMiddleware = require("../middleware/authMiddleware");

function extractJSON(text) {
  return text.replace(/```json|```/g, "").trim();
}

router.post("/", authMiddleware, async (req, res) => {
  const { fileName, fileContent } = req.body;

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
Explain this file clearly but briefly.

Rules:
- Maximum 300 words
- Use short paragraphs
- Use bullet points
- Use headings where needed
- Focus on structure and purpose
- Do NOT repeat obvious HTML syntax
- Be concise and structured

File Name: ${fileName}

Code:
${fileContent}
`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3
        }
      })
    });

    const raw = await response.json();
    const explanation =
      raw?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ explanation });

  } catch (err) {
    console.error("EXPLAIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;