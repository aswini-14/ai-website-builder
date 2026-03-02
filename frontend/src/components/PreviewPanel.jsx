function PreviewPanel({ data, mobileView }) {

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
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Live Preview
      </h2>

      {previewContent ? (
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <iframe
            key={data?._id}
            title="preview"
            srcDoc={previewContent}
            sandbox="allow-scripts allow-forms allow-same-origin"
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