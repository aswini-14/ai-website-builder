import { useState } from "react";
import { Sparkles, Loader2, LogOut } from "lucide-react";

function Builder() {
  const [prompt, setPrompt] = useState("");
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [data, setData] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [mobileView, setMobileView] = useState("code");
  const [activeFile, setActiveFile] = useState(null);
  const [copiedFile, setCopiedFile] = useState(null);

  /* ===============================
      GENERATE INITIAL PROJECT
  =============================== */
  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const result = await res.json();
      setData(result);
      setIsGenerated(true);

      const firstFile = Object.keys(result.code?.files || {})[0];
      if (firstFile) setActiveFile(firstFile);

      const entry =
        result.pages?.find(p => p.entry) || result.pages?.[0];

      if (entry) setActivePage(entry.id);

    } catch {
      alert("Error generating website");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
      REFINEMENT FEATURE
  =============================== */
  const handleRefine = async () => {
    if (!refinementPrompt.trim() || !data?.code?.files) return;

    setIsRefining(true);

    try {
      const res = await fetch("http://localhost:5000/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: data.code.files,
          refinementPrompt
        })
      });

      const result = await res.json();

      if (result.modifiedFiles) {
        const updatedFiles = {
          ...data.code.files,
          ...result.modifiedFiles
        };

        setData({
          ...data,
          code: { files: updatedFiles },
          preview: result.preview
        });

        const modifiedFile = Object.keys(result.modifiedFiles)[0];
        if (modifiedFile) setActiveFile(modifiedFile);
      }

      setRefinementPrompt("");

    } catch {
      alert("Refinement failed");
    } finally {
      setIsRefining(false);
    }
  };

  /* ===============================
      COPY FEATURE
  =============================== */
  const handleCopy = (content, file) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(file);
    setTimeout(() => setCopiedFile(null), 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-indigo-600">
              AI Code Builder
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-full mx-auto px-6 py-12">

        {/* MOBILE TOGGLE */}
        <div className="flex lg:hidden mb-4 gap-2">
          <button
            onClick={() => setMobileView("code")}
            className={`flex-1 py-2 rounded-xl ${
              mobileView === "code"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Code
          </button>

          <button
            onClick={() => setMobileView("preview")}
            className={`flex-1 py-2 rounded-xl ${
              mobileView === "preview"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Preview
          </button>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-6">

          {/* LEFT COLUMN */}
          <div
            className={`bg-white dark:bg-gray-900 
                        w-full lg:w-1/2 flex flex-col 
                        rounded-3xl shadow-xl p-2 h-[80vh]
                        ${mobileView === "preview" ? "hidden lg:flex" : ""}`}
          >

            {/* PROMPT TITLE AFTER GENERATION */}
            {isGenerated && (
              <div className="px-6 py-3 border-b">
                <h2 className="text-lg font-semibold text-indigo-600">
                  {prompt}
                </h2>
              </div>
            )}

            {/* GENERATED CODE */}
            {data?.code ? (
              <div className="flex flex-col flex-1 overflow-hidden px-4 py-2 text-gray-900 dark:text-gray-100">
                
                <h2 className="text-xl mb-3 shrink-0">
                  Generated Code ({data.project?.techStack?.join(", ")})
                </h2>

                {/* FILE TABS */}
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {Object.keys(data.code.files).map((file) => (
                    <button
                      key={file}
                      onClick={() => setActiveFile(file)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        activeFile === file
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {file}
                    </button>
                  ))}
                </div>

                {/* CODE VIEW */}
                <div className="relative flex-1 overflow-y-auto pr-2">
                  {activeFile && (
                    <>
                      <button
                        onClick={() =>
                          handleCopy(data.code.files[activeFile], activeFile)
                        }
                        className="absolute top-2 right-2 px-3 py-1 text-xs rounded-md bg-indigo-600 text-white"
                      >
                        {copiedFile === activeFile ? "Copied ✔" : "Copy"}
                      </button>

                      <pre className="text-sm whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-800 p-3 pt-10 rounded-lg">
                        {data.code.files[activeFile]}
                      </pre>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                No code generated yet
              </div>
            )}

            {/* GENERATE TEXTAREA (ONLY BEFORE GENERATION) */}
            {!isGenerated && (
              <div className="px-6 py-4 shrink-0">
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="Describe website + tech stack"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl flex gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Generate
                  </button>
                </div>
              </div>
            )}

            {/* REFINEMENT SECTION (ONLY AFTER GENERATION) */}
            {isGenerated && data?.code && (
              <div className="px-6 py-4 border-t">
                <textarea
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="Refine code (e.g., Change button color to orange)"
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                />

                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleRefine}
                    disabled={isRefining}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl"
                  >
                    {isRefining ? "Refining..." : "Refine"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div
            className={`bg-white rounded-3xl shadow-xl p-6 
                        w-full lg:w-1/2 flex flex-col h-[80vh]
                        ${mobileView === "code" ? "hidden lg:flex" : ""}`}
          >
            <h2 className="text-xl font-semibold mb-4">
              Live Preview
            </h2>

            {data?.preview && activePage ? (
              <iframe
                title="preview"
                srcDoc={data.preview[activePage]}
                sandbox="allow-scripts allow-forms"
                className="w-full flex-1 border rounded-xl"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                No preview available
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Builder;