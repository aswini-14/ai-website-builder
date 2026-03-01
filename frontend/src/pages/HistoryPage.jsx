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

  const navigate = useNavigate();

  /* ================= Fetch History ================= */

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/history?search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = await res.json();
      setHistory(result.projects || []);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /* ================= Handlers ================= */

  const handleOpenProject = (id) => {
    navigate(`/builder?project=${id}`);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/history/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchHistory();
  };

  /* ================= Layout Modes ================= */

  const layoutClasses = {
    grid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8",
    list: "flex flex-col gap-4",
    compact: "grid grid-cols-2 md:grid-cols-4 gap-4",
    detailed: "flex flex-col gap-6",
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
            />
          ))}

        </div>

      </div>
    </div>
  );
}

export default HistoryPage;