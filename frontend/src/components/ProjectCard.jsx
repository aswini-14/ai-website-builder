import { Trash2 } from "lucide-react";

function ProjectCard({ project, onOpen, onDelete, view = "grid" }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(project._id);
  };

  const containerStyles = {
    grid: `
      relative
      rounded-3xl shadow-xl
      hover:shadow-2xl hover:-translate-y-1
      overflow-hidden
    `,
    list: `
      rounded-xl p-4 flex justify-between items-center
      hover:shadow-lg
    `,
    compact: `
      rounded-xl p-3
      hover:shadow-md
    `,
    detailed: `
      rounded-2xl p-6 flex gap-6 items-start
      hover:shadow-xl
    `,
  };

  return (
    <div
      onClick={() => onOpen(project._id)}
      className={`
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        transition-all duration-300
        cursor-pointer
        ${containerStyles[view]}
      `}
    >
      {/* DELETE BUTTON */}
      {view === "grid" && (
        <button
          onClick={handleDelete}
          className="
            absolute top-4 right-4
            p-2 rounded-full
            bg-white/80 dark:bg-gray-800/80
            backdrop-blur
            hover:bg-red-100 dark:hover:bg-red-900/40
            transition z-10
          "
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      )}

      {/* PREVIEW */}
      {(view === "grid" || view === "detailed") && (
      <div
        className={`
          ${view === "grid" ? "aspect-video" : "w-48 h-28"}
          bg-gray-100 dark:bg-gray-800
          ${view === "grid" ? "" : "rounded-lg"}
          overflow-hidden
          relative
        `}
      >
        {project.preview ? (
          <div className="w-full h-full overflow-hidden">
            <iframe
              srcDoc={project.preview}
              title="preview"
              sandbox="allow-scripts"
              scrolling="no"
              className="
                w-full
                h-[600px]
                pointer-events-none
                border-0
              "
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            No preview
          </div>
        )}
      </div>
    )}

      {/* CONTENT */}
      <div
        className={`
          ${view === "grid" ? "p-6" : ""}
          ${view === "detailed" ? "flex-1" : ""}
        `}
      >
        <h2
          className={`
            font-semibold text-gray-800 dark:text-gray-100
            ${view === "compact" ? "text-sm truncate" : ""}
            ${view === "detailed" ? "text-lg font-bold" : ""}
          `}
        >
          {project.prompt}
        </h2>

        {view !== "compact" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {new Date(project.createdAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* INLINE DELETE */}
      {(view === "list" || view === "detailed") && (
        <Trash2
          onClick={handleDelete}
          className="w-5 h-5 text-red-500 hover:scale-110 transition ml-auto"
        />
      )}
    </div>
  );
}

export default ProjectCard;