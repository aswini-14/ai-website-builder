import { Sparkles, Loader2 } from "lucide-react";

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
  mobileView
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 
        w-full lg:w-1/2 flex flex-col 
        rounded-3xl shadow-xl p-2 h-[80vh]
        ${mobileView === "preview" ? "hidden lg:flex" : ""}`}
    >
      {/* PROMPT TITLE AFTER GENERATION */}
      {isGenerated && (
        <div className="px-6 py-3 border-b">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-50">
            {prompt}
          </h2>
        </div>
      )}

      {/* GENERATED CODE */}
      {data?.code ? (
        <div className="flex flex-col flex-1 overflow-hidden px-4 py-2 text-gray-900 dark:text-gray-100">

          <h2 className="text-xl mb-3 shrink-0">
            Generated Code
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
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl flex gap-2 items-center"
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
  );
}

export default CodePanel;