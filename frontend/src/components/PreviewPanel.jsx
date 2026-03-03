function PreviewPanel({ data, mobileView, setMobileView }) {

  // 🔥 SUPPORT BOTH STRING AND OBJECT
  const previewContent =
    typeof data?.preview === "string"
      ? data.preview
      : typeof data?.preview === "object"
        ? Object.values(data.preview)[0]
        : null;

  return (
    <div
      className={`
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-3xl shadow-xl p-6
        transition-colors duration-300
        w-full flex flex-col h-[80vh]
        ${mobileView === "code" ? "hidden lg:flex" : ""}
      `}
    >

      {/* ✅ MOBILE TOGGLE (ADDED HERE) */}
      <div className="flex lg:hidden justify-center gap-3 mb-4">
        <button
          onClick={() => setMobileView("code")}
          className={`px-4 py-1 rounded-lg text-sm transition ${
            mobileView === "code"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          Code
        </button>

        <button
          onClick={() => setMobileView("preview")}
          className={`px-4 py-1 rounded-lg text-sm transition ${
            mobileView === "preview"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          Preview
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Live Preview
      </h2>

      {previewContent ? (
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <iframe
            key={data?._id}
            title="preview"
            srcDoc={previewContent}
            sandbox="allow-scripts allow-forms"
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
          No preview available
        </div>
      )}
    </div>
  );
}

export default PreviewPanel;