import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";

function PreviewPanel({ data, mobileView, setMobileView }) {

  /* ==============================
     SAFE PREVIEW EXTRACTION
  ============================== */

  let previewContent = null;

  if (typeof data?.preview === "string") {
    previewContent = data.preview;
  } 
  else if (data?.preview && typeof data.preview === "object") {
    const values = Object.values(data.preview || {});
    previewContent = values.length ? values[0] : null;
  }


  /* ==============================
     DEPLOY STATES
  ============================== */

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState(null);
  const [copied, setCopied] = useState(false);


  /* ==============================
     DEPLOY FUNCTION
  ============================== */

  const handleDeploy = async () => {
    if (!data?._id) return;

    try {
      setIsDeploying(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/deploy/${data._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setDeployUrl(result.url);

    } catch (err) {
      console.error(err);
      alert("Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };


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

      {/* ==============================
         MOBILE VIEW TOGGLE
      ============================== */}

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


      {/* ==============================
         HEADER + DEPLOY BUTTON
      ============================== */}

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Live Preview
        </h2>

        {previewContent && (
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Deploy
              </>
            )}
          </button>
        )}

      </div>


      {/* ==============================
         DEPLOY SUCCESS MESSAGE
      ============================== */}

      {deployUrl && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-xl">

          <p className="text-sm text-green-700 dark:text-green-400 mb-2">
            🎉 Site deployed successfully!
          </p>

          <div className="flex items-center gap-2">

            <input
              value={deployUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(deployUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>

            <button
              onClick={() => window.open(deployUrl, "_blank")}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
            >
              Open
            </button>

          </div>

        </div>
      )}


      {/* ==============================
         PREVIEW IFRAME
      ============================== */}

      {previewContent ? (

        <div className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">

          <iframe
            key={data?._id}
            title="preview"
            srcDoc={previewContent}
            sandbox="allow-scripts allow-forms allow-modals"
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