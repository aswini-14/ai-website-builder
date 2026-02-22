import { useState, useRef, useEffect } from "react";
import { Sparkles, User, LogOut, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

useEffect(() => {
  fetchUser();
}, []);

const fetchUser = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setUsername(data.name);

  } catch (err) {
    console.error("Failed to fetch user");
  }
};

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-indigo-600">
            AI Code Builder
          </span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center hover:bg-indigo-200 transition"
          >
            <User className="w-5 h-5 text-indigo-600" />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border py-2 z-50">
              
              {/* Username */}
              <div className="px-4 py-2 text-sm border-b">
                <div className="text-gray-500">Signed in as</div>
                <div className="font-semibold text-indigo-600">
                  {username}
                </div>
              </div>

              {/* History */}
              <button
                onClick={() => {
                  navigate("/history");
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
              >
                <History className="w-4 h-4" />
                History
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;