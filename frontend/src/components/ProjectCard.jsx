import { Trash2 } from "lucide-react";

function ProjectCard({ project, onOpen, onDelete, view = "grid",selectionMode,selected,onSelect }) {
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
      relative
      rounded-xl p-4 flex justify-between items-center
      hover:shadow-lg
    `,
    compact: `
      relative
      rounded-xl p-3
      hover:shadow-md
    `,
    detailed: `
      relative
      rounded-2xl p-6 flex gap-6 items-start
      hover:shadow-xl
    `,
  };
  const displayTitle =
    project.prompt?.trim() ||
    project.title ||
    "Figma Design";

  return (
    <div
      onClick={() => {
        if (!selectionMode) {
          onOpen(project._id);
        }
      }}
      className={`
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        transition-all duration-300
        ${selectionMode ? "cursor-default" : "cursor-pointer"}
        ${containerStyles[view]}
        ${selected ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : ""}
      `}
    >
      {selectionMode && (
        <div className="
          absolute inset-0
          bg-indigo-50/40 dark:bg-indigo-900/20
          pointer-events-none
        " />
      )}
      {selectionMode && (
        <input
          type="checkbox"
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onSelect(project._id)}
          className="
            absolute top-3 left-3
            w-5 h-5
            accent-indigo-600
            cursor-pointer
            z-10
            transition-transform duration-200
            hover:scale-110
            "
        />
      )}
      {/* DELETE BUTTON */}
      {view === "grid" && !selectionMode && (
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
            line-clamp-2
          `}
          title={displayTitle}
        >
          {displayTitle}
        </h2>

        {view !== "compact" && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {new Date(project.createdAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* INLINE DELETE */}
      {(view === "list" || view === "detailed") && !selectionMode && (
        <Trash2
          onClick={handleDelete}
          className="w-5 h-5 text-red-500 hover:scale-110 transition ml-auto"
        />
      )}
    </div>
  );
}

export default ProjectCard;