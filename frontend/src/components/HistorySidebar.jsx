import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

function HistorySidebar({ onSelectProject, onNewProject, selectedId, refreshKey }) {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/history", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await res.json();
      setHistory(result.projects || []);
    } catch (err) {
      console.error("History fetch failed");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshKey]);

  const handleLoad = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const project = await res.json();
      onSelectProject(project);
    } catch {
      alert("Failed to load project");
    }
  };

  return (
    <div className="overflow-y-auto">

      {/* New Project Button */}
      <div className="mb-4">
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg 
          bg-indigo-600 text-white hover:bg-indigo-700 
          transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          No projects yet
        </p>
      ) : (
        history.map((item) => (
          <div
            key={item._id}
            onClick={() => handleLoad(item._id)}
            className={`
              p-3 mb-2 rounded-xl cursor-pointer
              border transition-all duration-200
              ${
                selectedId === item._id
                  ? "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500"
                  : "bg-gray-100 dark:bg-gray-800 border-transparent hover:bg-indigo-100 dark:hover:bg-gray-700"
              }
            `}
          >
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
              {item.title || "Untitled"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {item.prompt}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default HistorySidebar;