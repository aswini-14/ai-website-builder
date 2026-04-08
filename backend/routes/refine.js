const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const formatAsTerminal = require("../utils/terminalFormatter");
const { buildStaticPreview, buildRuntimePreview } = require("../utils/previewBuilder");

const Groq = require("groq-sdk");
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


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
   GROQ API
================================= */

/* ===============================
   GROQ API
================================= */

const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "user",
      content: instruction
    }
  ],
  temperature: 0.2,
});

const rawText = completion.choices[0]?.message?.content;

if (!rawText) {
  console.error("Groq failed response:", completion);
  throw new Error("Empty AI response");
}

if(!rawText){

console.error("FULL GEMINI RESPONSE:",raw);
throw new Error("Empty AI response");

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

res.status(500).json({
error:err.message
});

}

});


module.exports = router;