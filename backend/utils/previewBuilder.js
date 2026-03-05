function buildStaticPreview(files) {

if (!files["index.html"]) return null;

return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<script>

const files = JSON.parse(
decodeURIComponent("${encodeURIComponent(JSON.stringify(files))}")
);

function getFile(path){

if(!path) return null;

if(files[path]) return files[path];

if(files[path.replace("./","")])
return files[path.replace("./","")];

const clean = path.split("/").pop();

if(files[clean]) return files[clean];

return null;

}

function getAllCSS(){
return Object.keys(files)
.filter(f => f.endsWith(".css"))
.map(f => files[f])
.join("\\n\\n");
}

function getAllJS(){
return Object.keys(files)
.filter(f => f.endsWith(".js"))
.map(f => files[f])
.join("\\n\\n");
}

function extractBody(html){

if(!html) return "";

const bodyMatch = html.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i);

if(bodyMatch) return bodyMatch[1];

return html;

}

function loadPage(path){

if(!path || path === "/")
path = "index.html";

if(path.startsWith("/"))
path = path.slice(1);

const file = getFile(path);

if(!file){
document.getElementById("app").innerHTML =
"<h2>404 Page Not Found</h2>";
return;
}

const html = extractBody(file);

document.getElementById("app").innerHTML = html;

patchImages();

runScripts();

}

function runScripts(){

const js = getAllJS();

try{

const script = document.createElement("script");

script.innerHTML = js;

document.body.appendChild(script);

}catch(e){
console.error(e);
}

}

function patchImages(){

document.querySelectorAll("img").forEach(img=>{

const src = img.getAttribute("src");

if(files[src]){

const blob = new Blob([files[src]]);

img.src = URL.createObjectURL(blob);

return;

}

const clean = src.split("/").pop();

if(files[clean]){

const blob = new Blob([files[clean]]);

img.src = URL.createObjectURL(blob);

}

});

}

document.addEventListener("click",function(e){

const link = e.target.closest("a");

if(!link) return;

const href = link.getAttribute("href");

if(!href) return;

if(href.startsWith("http")) return;

if(href.startsWith("#")){

e.preventDefault();

const el = document.querySelector(href);

if(el) el.scrollIntoView({behavior:"smooth"});

return;

}

e.preventDefault();

loadPage(href);

history.pushState({}, "", href);

});

window.addEventListener("popstate",()=>{
loadPage(location.pathname);
});

document.addEventListener("DOMContentLoaded",()=>{

const style = document.createElement("style");

style.innerHTML = getAllCSS();

document.head.appendChild(style);

loadPage("index.html");

});

</script>

<style>
body{margin:0;}
</style>

</head>

<body>

<div id="app"></div>

</body>
</html>
`;
}


function buildRuntimePreview(projectName, techStack, runInstructions, formatAsTerminal){

return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />

<style>

body {
margin:0;
padding:0;
font-family:Inter,Arial,sans-serif;
background:linear-gradient(135deg,#0f172a,#1e293b);
color:white;
display:flex;
align-items:center;
justify-content:center;
height:100vh;
}

.container {
background:#111827;
padding:40px;
border-radius:20px;
width:90%;
max-width:800px;
box-shadow:0 20px 60px rgba(0,0,0,0.5);
}

.badge {
display:inline-block;
padding:6px 12px;
background:#6366f1;
border-radius:999px;
font-size:13px;
margin-bottom:15px;
}

.terminal {
background:#0f172a;
padding:20px;
border-radius:12px;
font-family:Consolas,monospace;
font-size:14px;
line-height:1.6;
overflow-x:auto;
}

</style>

</head>

<body>

<div class="container">

<h2>${projectName}</h2>

<div class="badge">
${techStack.join(", ")}
</div>

<h3>Run Instructions</h3>

<div class="terminal">
${formatAsTerminal(runInstructions)}
</div>

<p style="margin-top:20px;color:#9ca3af">
This stack requires local execution.
</p>

</div>

</body>
</html>
`;
}

module.exports = {
buildStaticPreview,
buildRuntimePreview
};