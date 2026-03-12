import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import NewProjectCard from "../components/NewProjectCard";
import SearchBar from "../components/SearchBar";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);

  /* ================= Fetch History ================= */

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/history?page=${page}&limit=7&search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error("Failed to fetch history");

      const result = await res.json();

      setHistory(result.projects || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /* ================= Reset Page When Search Changes ================= */

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  /* ================= Handlers ================= */

  const handleOpenProject = (id) => {
    navigate(`/builder?project=${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchHistory();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ================= Layout Modes ================= */

  const layoutClasses = {
    grid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8",
    list: "flex flex-col gap-4",
    compact: "grid grid-cols-2 md:grid-cols-4 gap-4",
    detailed: "flex flex-col gap-6",
  };

  const toggleSelect = (id) => {
    setSelectedProjects((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    const pageIds = history.map((p) => p._id);

    const allSelected = pageIds.every((id) =>
      selectedProjects.includes(id)
    );

    if (allSelected) {
      setSelectedProjects((prev) =>
        prev.filter((id) => !pageIds.includes(id))
      );
    } else {
      setSelectedProjects((prev) =>
        Array.from(new Set([...prev, ...pageIds]))
      );
    }
  };

  const clearSelection = () => {
    setSelectedProjects([]);
    setSelectionMode(false);
  };

  const deleteSelected = async () => {
    for (let id of selectedProjects) {
      await handleDelete(id);
    }
    setSelectedProjects([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors duration-300">
      <Navbar onLogout={() => navigate("/")} />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ================= Header ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            Project History
          </h1>

          <SearchBar
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
            onSearch={() => setSearchQuery(searchInput)}
            onClear={() => {
              setSearchInput("");
              setSearchQuery("");
            }}
          />

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="
              px-4 py-2 rounded-xl
              border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-900
              text-gray-800 dark:text-gray-100
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500
              transition
            "
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
            <option value="compact">Compact</option>
            <option value="detailed">Detailed</option>
          </select>

        </div>
        <div className="flex items-center gap-4 mb-6">

          {!selectionMode && (
            <button
              onClick={() => setSelectionMode(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Select
            </button>
          )}

          {selectionMode && (
            <>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {selectedProjects.length} selected
              </span>

              <button
                onClick={selectAll}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Select All
              </button>

              <button
                onClick={deleteSelected}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>

              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded"
              >
                Cancel
              </button>
            </>
          )}

        </div>

        {/* ================= Projects Layout ================= */}
        <div className={layoutClasses[viewMode]}>

          <NewProjectCard
            onClick={() => navigate("/builder")}
            view={viewMode}
          />

          {history.map((item) => (
            <ProjectCard
              key={item._id}
              project={item}
              onOpen={handleOpenProject}
              onDelete={handleDelete}
              view={viewMode}
              selectionMode={selectionMode}
              selected={selectedProjects.includes(item._id)}
              onSelect={toggleSelect}
            />
          ))}

        </div>

        {/* ================= Pagination Controls ================= */}
        <div className="flex justify-center items-center gap-6 mt-12">

          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          <span className="text-gray-600 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
}

export default HistoryPage;