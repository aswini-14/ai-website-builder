function PreviewPanel({ data, activePage, mobileView }) {
  return (
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
  );
}

export default PreviewPanel;