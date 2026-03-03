import { useEffect, useState, useRef ,useCallback} from "react";
import { Plus } from "lucide-react";

function HistorySidebar({ onSelectProject, onNewProject, selectedId, refreshKey })  {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);

  const fetchHistory = useCallback(async (pageNumber = 1) => {
    if (pageNumber > totalPages) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/history?page=${pageNumber}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await res.json();

      setHistory(prev => {
        const map = new Map();

        [...prev, ...(result.projects || [])].forEach(p => {
          map.set(p._id, p);
        });

        return Array.from(map.values());
      });
      setTotalPages(result.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error("History fetch failed");
    } finally {
      setLoading(false);
    }
  },[totalPages]);

  // Initial load
  useEffect(() => {
    setHistory([]);
    setPage(1);
    fetchHistory(1);
  }, [refreshKey,fetchHistory]);
  // Infinite scroll listener
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    if (
      el.scrollTop + el.clientHeight >= el.scrollHeight - 50 &&
      !loading &&
      page < totalPages
    ) {
      fetchHistory(page + 1);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-y-auto scrollbar-hidden h-full"
    >
      {/* New Project Button */}
      <div className="mb-4">
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg 
          bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* History List */}
      {history.map(item => (
        <div
          key={item._id}
          onClick={() => onSelectProject(item)}
          className={`p-3 mb-2 rounded-xl cursor-pointer border transition
            ${
              selectedId === item._id
                ? "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500"
                : "bg-gray-100 dark:bg-gray-800 border-transparent hover:bg-indigo-100 dark:hover:bg-gray-700"
            }`}
        >
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
            {item.title || "Untitled"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {item.prompt}
          </p>
        </div>
      ))}

      {loading && (
        <p className="text-center text-gray-400 text-sm py-2">
          Loading more...
        </p>
      )}
    </div>
  );
}

export default HistorySidebar;