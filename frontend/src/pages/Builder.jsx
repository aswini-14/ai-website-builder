import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { PanelLeft } from "lucide-react";

import Navbar from "../components/Navbar";
import CodePanel from "../components/CodePanel";
import PreviewPanel from "../components/PreviewPanel";
import HistorySidebar from "../components/HistorySidebar";

function Builder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [prompt, setPrompt] = useState("");
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [data, setData] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [mobileView, setMobileView] = useState("code");
  const [isMobile, setIsMobile] = useState(window.innerWidth <1024);
  const [activeFile, setActiveFile] = useState(null);
  const [copiedFile, setCopiedFile] = useState(null);
  const [showHistory, setShowHistory] = useState(
    window.innerWidth >=1024
  );
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [codePanelWidth, setCodePanelWidth] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setShowHistory(false);
      } else {
        setShowHistory(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const projectIdFromURL = searchParams.get("project");

  /* ===============================
      NEW PROJECT HANDLER
  =============================== */

  const handleNewProject = () => {
    navigate("/builder"); // remove query param

    setData(null);
    setIsGenerated(false);
    setSelectedProjectId(null);
    setPrompt("");
    setRefinementPrompt("");
    setActiveFile(null);
    setActivePage(null);
  };

  /* ===============================
      RESIZABLE PANEL LOGIC
  =============================== */

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = codePanelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [codePanelWidth]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerWidth =
      containerRef.current.getBoundingClientRect().width;

    const delta = e.clientX - startX.current;
    const deltaPercent = (delta / containerWidth) * 100;

    const newWidth = Math.min(
      Math.max(startWidth.current + deltaPercent, 20),
      80
    );

    setCodePanelWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  /* ===============================
      LOAD PROJECT FROM URL
  =============================== */

  useEffect(() => {
    if (!projectIdFromURL) return;

    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/history/${projectIdFromURL}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) throw new Error("Failed to fetch project");

        const project = await res.json();

        setData(project);
        setIsGenerated(true);
        setSelectedProjectId(project._id);
        setPrompt(project.prompt || "");

        const firstFile = Object.keys(project.code?.files || {})[0];
        if (firstFile) setActiveFile(firstFile);

        const entry =
          project.pages?.find(p => p.entry) || project.pages?.[0];

        if (entry) setActivePage(entry.id);

      } catch (err) {
        console.error("Project load failed:", err);
      }
    };

    fetchProject();
  }, [projectIdFromURL]);

  /* ===============================
      GENERATE PROJECT
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

      if (!res.ok) throw new Error("Generate failed");

      const result = await res.json();

      setData({
        ...result,
        originalPrompt: prompt
      });
      setIsGenerated(true);
      setSelectedProjectId(result._id);
      setHistoryRefreshKey(prev => prev + 1);

      const firstFile = Object.keys(result.code?.files || {})[0];
      if (firstFile) setActiveFile(firstFile);

      const entry =
        result.pages?.find(p => p.entry) || result.pages?.[0];

      if (entry) setActivePage(entry.id);

    } catch (err) {
      console.error(err);
      alert("Error generating website");
    } finally {
      setIsLoading(false);
    }
  };

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

      if (!res.ok) throw new Error("Refine failed");

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors duration-300">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-full mx-auto px-6 py-12">
        <div className="w-full flex flex-col lg:flex-row gap-0 items-center">

          {/* HISTORY SIDEBAR */}
          <div
            className={`bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            shadow-xl rounded-3xl
            transition-all duration-300
            ${showHistory ? "w-64 h-[80vh] overflow-y-auto p-4 mr-6" : "w-14 h-14 overflow-hidden p-2 mr-2"}
            flex-shrink-0`}
          >
            <div className="flex items-center justify-between mb-4">
              {showHistory && (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  History
                </h2>
              )}

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                <PanelLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {showHistory && (
              <HistorySidebar
                onSelectProject={(project) => {
                  setData(project);
                  setIsGenerated(true);
                  setSelectedProjectId(project._id);

                  const firstFile = Object.keys(project.code?.files || {})[0];
                  if (firstFile) setActiveFile(firstFile);

                  const entry =
                    project.pages?.find(p => p.entry) || project.pages?.[0];

                  if (entry) setActivePage(entry.id);
                }}
                onNewProject={handleNewProject}
                selectedId={selectedProjectId}
                refreshKey={historyRefreshKey}
              />
            )}
          </div>

          {/* PANELS */}
          <div ref={containerRef} className="flex flex-1 min-w-0 overflow-hidden">

            {/* MOBILE VIEW */}
            {isMobile ? (
              <>
                {mobileView === "code" && (
                  <div className="w-full h-full">
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
                      setMobileView={setMobileView}
                      selectedProjectId={selectedProjectId}
                    />
                  </div>
                )}

                {mobileView === "preview" && (
                  <div className="w-full h-full">
                    <PreviewPanel
                      key={selectedProjectId}
                      data={data}
                      mobileView={mobileView}
                      setMobileView={setMobileView}
                    />
                  </div>
                )}
              </>
            ) : (
              /* DESKTOP VIEW */
              <div className="flex flex-row flex-1 min-w-0 overflow-hidden">

                <div style={{ width: `${codePanelWidth}%` }} className="flex-shrink-0 min-w-0 h-full">
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
                </div>

                <div
                  onMouseDown={handleMouseDown}
                  className="flex-shrink-0 w-2 mx-1 cursor-col-resize relative z-10"
                />

                <div style={{ width: `${100 - codePanelWidth}%` }} className="flex-shrink-0 min-w-0 h-full">
                  <PreviewPanel
                    key={selectedProjectId}
                    data={data}
                    mobileView={mobileView}
                  />
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Builder;