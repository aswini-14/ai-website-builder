import { useState } from "react";
import { PanelLeft } from "lucide-react";
import html2canvas from "html2canvas";

import Navbar from "../components/Navbar";
import CodePanel from "../components/CodePanel";
import PreviewPanel from "../components/PreviewPanel";
import HistorySidebar from "../components/HistorySidebar";

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
  const [showHistory, setShowHistory] = useState(
    window.innerWidth >= 1024
  );
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  /* ===============================
      GENERATE INITIAL PROJECT
  =============================== */
  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        throw new Error("Generate failed");
      }

      const result = await res.json();

      setData(result);
      setIsGenerated(true);
      setSelectedProjectId(result._id);
      setHistoryRefreshKey(prev => prev + 1);

      const firstFile = Object.keys(result.code?.files || {})[0];
      if (firstFile) setActiveFile(firstFile);

      const entry =
        result.pages?.find(p => p.entry) || result.pages?.[0];

      if (entry) setActivePage(entry.id);

      /* ===============================
        GENERATE & SAVE THUMBNAIL
      =============================== */

      if (entry && result.preview?.[entry.id]) {
        const thumbnail = await generateThumbnail(result.preview[entry.id]);

        await fetch(`http://localhost:5000/history/${result._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            thumbnail
          })
        });
      }

    } catch (err) {
      console.error(err);
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
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          files: data.code.files,
          refinementPrompt
        })
      });

      if (!res.ok) {
        throw new Error("Refine failed");
      }

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

    } catch (err) {
      console.error(err);
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

  /* ===============================
      LOGOUT
  =============================== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  /* ===============================
      LOAD PROJECT FROM HISTORY
  =============================== */
  const handleProjectLoad = (project) => {
    setData(project);
    setIsGenerated(true);
    setSelectedProjectId(project._id);
    setPrompt(project.prompt || "");

    const firstFile = Object.keys(project.code?.files || {})[0];
    if (firstFile) setActiveFile(firstFile);

    const entry =
      project.pages?.find(p => p.entry) || project.pages?.[0];

    if (entry) setActivePage(entry.id);
  };

  /* ===============================
      START NEW PROJECT
  =============================== */
  const handleNewProject = () => {
    setPrompt("");
    setRefinementPrompt("");
    setData(null);
    setActiveFile(null);
    setActivePage(null);
    setIsGenerated(false);
    setSelectedProjectId(null);
  };

  const generateThumbnail = async (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "0";
    tempDiv.style.width = "1024px";
    tempDiv.innerHTML = htmlContent;

    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv, {
      useCORS: true,
      scale: 0.5
    });

    const image = canvas.toDataURL("image/png");

    document.body.removeChild(tempDiv);

    return image;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      <Navbar onLogout={handleLogout} />

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

          {/* HISTORY SIDEBAR */}
          <div
            className={`bg-white shadow-xl rounded-3xl p-4
              h-[80vh] overflow-y-auto
              transition-all duration-300
              ${showHistory ? "w-64" : "w-16"}
              flex-shrink-0`}
          >
            <div className="flex items-center justify-between mb-4">
              {showHistory && (
                <h2 className="text-lg font-semibold text-gray-800">
                  History
                </h2>
              )}

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <PanelLeft className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {showHistory && (
              <HistorySidebar
                onSelectProject={handleProjectLoad}
                onNewProject={handleNewProject}
                selectedId={selectedProjectId}
                refreshKey={historyRefreshKey}
              />
            )}
          </div>

          {/* CODE PANEL */}
          <CodePanel
            data={data}
            prompt={prompt}
            setPrompt={setPrompt}
            refinementPrompt={refinementPrompt}
            setRefinementPrompt={setRefinementPrompt}
            isGenerated={isGenerated}
            isLoading={isLoading}
            isRefining={isRefining}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            copiedFile={copiedFile}
            handleCopy={handleCopy}
            handleSubmit={handleSubmit}
            handleRefine={handleRefine}
            mobileView={mobileView}
            selectedProjectId={selectedProjectId}
          />

          {/* PREVIEW PANEL */}
          <PreviewPanel
            data={data}
            activePage={activePage}
            mobileView={mobileView}
          />

        </div>
      </div>
    </div>
  );
}

export default Builder;