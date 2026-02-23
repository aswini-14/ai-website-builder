import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const fetchHistory = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/history?page=${page}&limit=7`,
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
  };

  const handleOpenProject = (id) => {
    navigate(`/builder?project=${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 py-12">

        <h1 className="text-3xl font-bold text-indigo-600 mb-10">
          Project History
        </h1>

        {history.length === 0 ? (
          <p className="text-gray-400">No projects yet.</p>
        ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

              {/* NEW PROJECT CARD */}
              <div
                  onClick={() => navigate("/builder")}
                  className="bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-indigo-300 transition duration-300 cursor-pointer flex flex-col items-center justify-center p-8 text-center"
              >
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl text-indigo-600 font-bold">+</span>
                  </div>

                  <h2 className="text-lg font-semibold text-indigo-600">
                  New Project
                  </h2>

                  <p className="text-sm text-gray-400 mt-2">
                  Start building something new
                  </p>
              </div>

              {/* EXISTING PROJECTS */}
              {history.map((item) => (
                  <div
                  key={item._id}
                  onClick={() => handleOpenProject(item._id)}
                  className="bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-indigo-200 transition duration-300 cursor-pointer overflow-hidden"
                  >
                  
                  <div className="hidden md:block aspect-video bg-gray-100">
                      {item.thumbnail ? (
                      <img
                          src={item.thumbnail}
                          alt="Preview"
                          className="w-full h-full object-cover"
                      />
                      ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          No preview
                      </div>
                      )}
                  </div>

                  <div className="p-6">
                      <h2 className="text-base font-semibold text-gray-800 line-clamp-2">
                      {item.prompt}
                      </h2>

                      <p className="text-sm text-gray-400 mt-3">
                      {new Date(item.createdAt).toLocaleString()}
                      </p>
                  </div>
                  </div>
              ))}

          </div>
          <div className="flex justify-center items-center gap-2 mt-8">
            
            {/* Previous */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-indigo-50 transition"
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
                  className={`px-4 py-2 rounded-lg text-sm transition
                    ${
                      currentPage === page
                        ? "bg-indigo-600 text-white shadow-md"
                        : "border hover:bg-indigo-50"
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
              className="px-3 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-indigo-50 transition"
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