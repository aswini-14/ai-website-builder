import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import NewProjectCard from "../components/NewProjectCard";
import SearchBar from "../components/SearchBar";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchHistory = useCallback(
    async (page = 1) => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/history?page=${page}&limit=7&search=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await res.json();

        setHistory(result.projects);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
      } catch (err) {
        console.error("Failed to fetch history");
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, fetchHistory]);

  const handleOpenProject = (id) => {
    navigate(`/builder?project=${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/history/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchHistory(currentPage);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-indigo-50 via-white to-purple-50
        dark:from-gray-900 dark:via-gray-950 dark:to-black
        transition-colors duration-300
      "
    >
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header + Search */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            Project History
          </h1>

          <SearchBar
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
            onSearch={() => {
              setSearchQuery(searchInput);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSearchInput("");
              setSearchQuery("");
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500">
            No projects yet.
          </p>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <NewProjectCard onClick={() => navigate("/builder")} />

              {history.map((item) => (
                <ProjectCard
                  key={item._id}
                  project={item}
                  onOpen={handleOpenProject}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-10">

              {/* Previous */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="
                  px-3 py-2 rounded-lg text-sm
                  border border-gray-300 dark:border-gray-700
                  text-gray-700 dark:text-gray-300
                  hover:bg-indigo-50 dark:hover:bg-gray-800
                  disabled:opacity-40
                  transition
                "
              >
                «
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      px-4 py-2 rounded-lg text-sm transition
                      ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-md"
                          : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="
                  px-3 py-2 rounded-lg text-sm
                  border border-gray-300 dark:border-gray-700
                  text-gray-700 dark:text-gray-300
                  hover:bg-indigo-50 dark:hover:bg-gray-800
                  disabled:opacity-40
                  transition
                "
              >
                »
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;