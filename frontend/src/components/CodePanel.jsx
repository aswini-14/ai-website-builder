import {
  Sparkles,
  Loader2,
  Download,
  Mic,
  MicOff
} from "lucide-react";
import { useState, useRef } from "react";

function CodePanel({
  data,
  prompt,
  setPrompt,
  refinementPrompt,
  setRefinementPrompt,
  isGenerated,
  isLoading,
  isRefining,
  activeFile,
  setActiveFile,
  copiedFile,
  handleCopy,
  handleSubmit,
  handleRefine,
  mobileView,
  selectedProjectId
}) {
  const [isListeningGenerate, setIsListeningGenerate] = useState(false);
  const generateRecognitionRef = useRef(null);

  const [isListeningRefine, setIsListeningRefine] = useState(false);
  const refineRecognitionRef = useRef(null);

  const createRecognition = (onResult, setListeningState, ref) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setListeningState(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) =>
      console.error("Speech error:", event.error);

    recognition.onend = () => setListeningState(false);

    recognition.start();
    ref.current = recognition;
  };

  const startGenerateListening = () => {
    createRecognition(
      (transcript) =>
        setPrompt((prev) =>
          prev ? prev + " " + transcript : transcript
        ),
      setIsListeningGenerate,
      generateRecognitionRef
    );
  };

  const stopGenerateListening = () => {
    generateRecognitionRef.current?.stop();
  };

  const startRefineListening = () => {
    createRecognition(
      (transcript) =>
        setRefinementPrompt((prev) =>
          prev ? prev + " " + transcript : transcript
        ),
      setIsListeningRefine,
      refineRecognitionRef
    );
  };

  const stopRefineListening = () => {
    refineRecognitionRef.current?.stop();
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/history/${selectedProjectId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "project.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700
      w-full lg:w-1/2 flex flex-col 
      rounded-3xl shadow-xl p-2 h-[80vh]
      transition-colors duration-300
      ${mobileView === "preview" ? "hidden lg:flex" : ""}`}
    >
      {/* TITLE */}
      {isGenerated && (
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {prompt}
          </h2>
        </div>
      )}

      {/* CODE SECTION */}
      {data?.code ? (
        <div className="flex flex-col flex-1 overflow-hidden px-4 py-2 text-gray-900 dark:text-gray-100">
          <div className="w-full flex items-center justify-between">
            <h2 className="text-xl mb-3">Generated Code</h2>
            <button
              onClick={handleDownload}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 
              text-white rounded-xl transition"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* FILE TABS */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {Object.keys(data.code.files).map((file) => (
              <button
                key={file}
                onClick={() => setActiveFile(file)}
                className={`px-3 py-1 text-sm rounded-lg transition ${
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

                <pre className="text-sm whitespace-pre-wrap break-words 
                bg-gray-100 dark:bg-gray-800 
                text-gray-800 dark:text-gray-200
                p-3 pt-10 rounded-lg transition-colors duration-300">
                  {data.code.files[activeFile]}
                </pre>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
          No code generated yet
        </div>
      )}

      {/* GENERATE SECTION */}
      {!isGenerated && (
        <div className="px-6 py-4 shrink-0 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <textarea
              rows="4"
              className="w-full px-4 py-3 pr-14 
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-2 border-gray-200 dark:border-gray-700
              rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500
              transition"
              placeholder="Describe website + tech stack"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <button
              type="button"
              onClick={
                isListeningGenerate
                  ? stopGenerateListening
                  : startGenerateListening
              }
              className={`absolute top-3 right-3 p-2 rounded-full transition ${
                isListeningGenerate
                  ? "bg-red-500 text-white"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {isListeningGenerate ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {isListeningGenerate && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 animate-pulse">
              Listening...
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 
              text-white rounded-xl flex gap-2 items-center transition"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Generate
            </button>
          </div>
        </div>
      )}

      {/* REFINE SECTION */}
      {isGenerated && data?.code && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <textarea
              rows="3"
              className="w-full px-4 py-3 pr-14 
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-2 border-gray-200 dark:border-gray-700
              rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500
              transition"
              placeholder="Refine code (e.g., Change button color to orange)"
              value={refinementPrompt}
              onChange={(e) =>
                setRefinementPrompt(e.target.value)
              }
            />

            <button
              type="button"
              onClick={
                isListeningRefine
                  ? stopRefineListening
                  : startRefineListening
              }
              className={`absolute top-3 right-3 p-2 rounded-full transition ${
                isListeningRefine
                  ? "bg-red-500 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {isListeningRefine ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {isListeningRefine && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 animate-pulse">
              Listening...
            </div>
          )}

          <div className="flex justify-end mt-3">
            <button
              onClick={handleRefine}
              disabled={isRefining}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 
              text-white rounded-xl transition"
            >
              {isRefining ? "Refining..." : "Refine"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodePanel;