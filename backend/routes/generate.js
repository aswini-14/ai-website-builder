const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const formatAsTerminal = require("../utils/terminalFormatter");
const { buildStaticPreview, buildRuntimePreview } = require("../utils/previewBuilder");


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

        4. For static websites:
          - Use simple file structure:
              index.html
              style.css
              script.js

        5. Do NOT assume modern frameworks unless mentioned.

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