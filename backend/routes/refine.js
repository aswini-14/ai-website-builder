const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const formatAsTerminal = require("../utils/terminalFormatter");
const { buildStaticPreview, buildRuntimePreview } = require("../utils/previewBuilder");

async function callGroq(prompt, systemInstruction) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
${systemInstruction}

STRICT RULES:
- Return ONLY valid JSON
- Do NOT add explanations
- Do NOT add markdown
- Do NOT wrap in \`\`\`
- Ensure JSON is COMPLETE and parsable
- If JSON is invalid, regenerate internally before sending response
`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2
    })
  });

  const data = await res.json();

  console.log("GROQ RESPONSE:", data);

  return data?.choices?.[0]?.message?.content;
}


function isStaticProject(files){

  if(!files) return false;

  return Object.keys(files)
  .some(f => f.toLowerCase().endsWith(".html"));

}


/* ===============================
   STACK DETECTOR
================================= */

function isStackChange(prompt){

const text = prompt.toLowerCase();

return (
text.includes("mern") ||
text.includes("mean") ||
text.includes("react") ||
text.includes("next") ||
text.includes("node") ||
text.includes("express") ||
text.includes("backend") ||
text.includes("flask") ||
text.includes("django") ||
text.includes("python")
);

}


/* ===============================
   SAFE JSON PARSER
================================= */

function safeParseJSON(text){

try{
return JSON.parse(text);
}catch{}

try{

const cleaned = text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();

return JSON.parse(cleaned);

}catch{}

try{

const match = text.match(/\{[\s\S]*\}/);

if(match)
return JSON.parse(match[0]);

}catch{}

throw new Error("AI returned invalid JSON");

}


/* ===============================
   REFINE ROUTE
================================= */

router.post("/", authMiddleware, async (req,res)=>{

const { files, refinementPrompt, projectId } = req.body;

try{

const stackChange = isStackChange(refinementPrompt);


/* ===============================
   AI PROMPT
================================= */

const instruction = stackChange
? `
Convert the project to the requested tech stack.

IMPORTANT:
Return the COMPLETE project.

CURRENT FILES:
${JSON.stringify(files).slice(0,10000)}

USER REQUEST:
${refinementPrompt}

Return ONLY JSON:

{
  "project":{
    "name":"",
    "techStack":[]
  },
  "files":{
    "file/path.ext":"file content"
  },
  "runInstructions":""
}
`
: `
Modify the following project.

CURRENT FILES:
${JSON.stringify(files).slice(0,10000)}

USER REQUEST:
${refinementPrompt}

Return ONLY JSON:

{
"modifiedFiles":{
"file/path.ext":"file content"
}
}
`;


/* ===============================
   GEMINI API
================================= */

const API_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

const response = await fetch(API_URL,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({

contents:[
{
role:"user",
parts:[
{
text:instruction
}
]
}
],

generationConfig:{
temperature:0.2
}

})
});


let rawText = "";

try {
  const raw = await response.json();

  if (raw.error) {
    console.log("Gemini failed → switching to Groq");
    rawText = await callGroq(instruction);
  } else if (raw?.candidates?.length) {
    rawText = raw.candidates[0].content.parts
      .map(p => p.text || "")
      .join("");
  }

} catch (err) {
  console.log("Gemini crashed → switching to Groq");
  rawText = await callGroq(userPrompt, systemInstruction);
}

// 🔥 FINAL SAFETY
if (!rawText) {
  console.log("Both AI failed → using fallback");

  rawText = JSON.stringify({
    project: {
      name: "Demo Project",
      techStack: ["HTML", "CSS", "JS"]
    },
    files: files || {},
    modifiedFiles: files || {},
    runInstructions: "Open index.html"
  });
}


/* ===============================
   PARSE AI RESPONSE
================================= */

const parsed = safeParseJSON(rawText);

const projectMeta = parsed.project || {};
const runInstructions = parsed.runInstructions || "";


/* ===============================
   FILE HANDLING
================================= */

let updatedFiles;

if(stackChange){

// replace project completely
updatedFiles = parsed.files || files;

}else{

// merge UI changes
updatedFiles = {
...files,
...parsed.modifiedFiles
};

}


/* ===============================
   BUILD PREVIEW
================================= */

let preview = null;

if(updatedFiles && isStaticProject(updatedFiles)){
  preview = buildStaticPreview(updatedFiles);
}

if(!preview){
preview = buildRuntimePreview(
projectMeta.name || "Generated Project",
projectMeta.techStack || ["Runtime Stack"],
runInstructions || "Run locally",
formatAsTerminal
);
}


/* ===============================
   SAVE PROJECT
================================= */

const project = await Project.findOne({
  _id: projectId,
  userId: req.user.id
});

if (!project) {
  return res.status(404).json({ error: "Project not found" });
}

const newHistory = project.history.slice(0, project.currentIndex + 1);

newHistory.push({
  code: { files: updatedFiles },
  preview
});

project.history = newHistory;
project.currentIndex = newHistory.length - 1;
project.code = { files: updatedFiles };
project.preview = preview;

await project.save();

const updatedProject = project;


/* ===============================
   RESPONSE
================================= */

res.json({
modifiedFiles:parsed.modifiedFiles || {},
preview,
project:updatedProject
});

}catch(err){

console.error("REFINE ERROR:",err);

console.error("REFINE ERROR:", err);

// 🔥 FALLBACK RESPONSE
return res.json({
  modifiedFiles: files || {},
  preview: buildRuntimePreview(
    "Demo Project",
    ["Fallback"],
    "Run locally",
    formatAsTerminal
  ),
  project: {
    code: { files: files || {} }
  }
});

}

});


module.exports = router;