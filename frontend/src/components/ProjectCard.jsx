import { Trash2 } from "lucide-react";

function ProjectCard({ project, onOpen, onDelete }) {
  return (
    <div
      onClick={() => onOpen(project._id)}
      className="bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-indigo-200 transition duration-300 cursor-pointer overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="hidden md:block aspect-video bg-gray-100">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No preview
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-base font-semibold text-gray-800 line-clamp-2">
          {project.prompt}
        </h2>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400 mt-3">
            {new Date(project.createdAt).toLocaleString()}
          </p>

          <Trash2
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project._id);
            }}
            className="w-5 h-5 text-red-500 hover:scale-110 transition"
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;