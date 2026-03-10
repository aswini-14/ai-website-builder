const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const formatAsTerminal = require("../utils/terminalFormatter");
const { buildStaticPreview, buildRuntimePreview } = require("../utils/previewBuilder");
const { extractLayout } = require("../utils/figmaParser");

/* ===============================
   SUPER SAFE JSON PARSER
================================= */
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (err) {

    try {
      // remove markdown fences
      let cleaned = text.replace(/```json|```/g, "").trim();

      // find first { and last }
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start !== -1 && end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
      }

      return JSON.parse(cleaned);

    } catch (err2) {

      console.error("RAW AI RESPONSE:\n", text);

      throw new Error("AI returned invalid JSON");

    }
  }
}

/* ===============================
   GENERATE ROUTE
================================= */
router.post("/", authMiddleware, async (req, res) => {
  const { prompt = "", figmaUrl = "" } = req.body;

  try {

    const API_URL =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const systemInstruction = `
You are an expert web developer.

IMPORTANT STACK RULES:

1. If the user DOES NOT explicitly mention a framework or backend,
   you MUST generate a plain static website using:
   - HTML
   - CSS
   - Vanilla JavaScript

2. ONLY use React, Node, Express, Next.js, etc
   IF the user explicitly asks for them.

3. Default stack is ALWAYS:
   HTML + CSS + JavaScript

4. For static websites use structure:
   index.html
   style.css
   script.js

Return ONLY valid JSON.
Do NOT include markdown.
Do NOT include explanations.

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

    let userPrompt = prompt;

    /* ===============================
       FIGMA HANDLING
    ================================ */

    if (figmaUrl) {

      let fileKey = null;

      if (figmaUrl.includes("/file/")) {
        fileKey = figmaUrl.split("/file/")[1].split("/")[0];
      } else if (figmaUrl.includes("/design/")) {
        fileKey = figmaUrl.split("/design/")[1].split("/")[0];
      }

      const figmaResponse = await fetch(
        `https://api.figma.com/v1/files/${fileKey}`,
        {
          headers: {
            "X-Figma-Token": process.env.FIGMA_API_KEY
          }
        }
      );

      const figmaJson = await figmaResponse.json();

      if (figmaJson && figmaJson.document) {
        const layout = extractLayout(figmaJson);

        userPrompt = `
Convert this Figma layout into a responsive website.

Layout Structure:
${JSON.stringify(layout)}

Rules:
- Use semantic HTML
- Use CSS Flexbox/Grid
- Make it responsive
- Generate index.html, style.css, script.js

${systemInstruction}
`;
      } else {
        console.error("Invalid Figma response:", figmaJson);
      }

    } else {

      /* ===============================
         NORMAL PROMPT GENERATION
      ================================ */

      userPrompt = `
Create a website based on this request:

${prompt}

${systemInstruction}
`;

    }

    /* ===============================
       GEMINI REQUEST
    ================================ */

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: userPrompt
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

    /* ===============================
       PREVIEW BUILDER
    ================================ */

    if (files["index.html"]) {

      preview = buildStaticPreview(files);

    } else {

      preview = buildRuntimePreview(
        result.project?.name || "Generated Project",
        result.project?.techStack || ["Runtime Stack"],
        result.runInstructions || "Run locally",
        formatAsTerminal
      );

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