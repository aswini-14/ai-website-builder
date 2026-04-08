import {
    Code,
    History,
    Home,
    LayoutTemplate,
    LogOut,
    Menu,
    Sparkles,
    User
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Navbar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsername(data.name);
    } catch {
      console.log("Error fetching user");
    }
  };

  // Close dropdowns
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 🔥 Reusable menu item with ACTIVE STATE
  const menuItem = (path, label, Icon) => {
    const active = location.pathname === path;

    return (
      <button
        onClick={() => {
          navigate(path);
          setMenuOpen(false);
        }}
        className={`
          relative flex items-center gap-2 w-full px-4 py-2 text-sm rounded-lg transition

          ${active
            ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
          }
        `}
      >
        {/* LEFT ACTIVE BAR */}
        {active && (
          <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500 rounded-r"></span>
        )}

        <Icon className={`w-4 h-4 ${active ? "text-indigo-500" : ""}`} />
        {label}
      </button>
    );
  };

  return (
    <nav className="
      sticky top-0 z-50
      backdrop-blur-xl
      bg-white/70 dark:bg-black/30
      border-b border-gray-200 dark:border-white/10
    ">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <span className="text-lg font-semibold text-gray-800 dark:text-white">
            AI Code Builder
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* PROFILE */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="
                w-10 h-10 rounded-xl
                bg-gradient-to-br from-indigo-500 to-purple-600
                flex items-center justify-center
                text-white shadow-md
              "
            >
              {username ? username.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </button>

            {profileOpen && (
              <div className="
                absolute right-0 mt-3 w-56
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-white/10
                backdrop-blur-xl
                rounded-xl shadow-xl
                py-2
              ">

                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {username}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate("/profile");
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm 
                  text-gray-700 dark:text-gray-300 
                  hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm 
                  text-red-600 dark:text-red-400 
                  hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>

              </div>
            )}
          </div>

          {/* HAMBURGER */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="
                w-10 h-10 rounded-xl
                bg-gray-100 dark:bg-white/5
                hover:bg-gray-200 dark:hover:bg-white/10
                border border-gray-300 dark:border-white/10
                flex items-center justify-center
                text-gray-700 dark:text-white
                transition
              "
            >
              <Menu className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="
                absolute right-0 mt-3 w-56
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-white/10
                backdrop-blur-xl
                rounded-xl shadow-xl
                py-2
              ">

                {menuItem("/", "Home", Home)}

                <div className="my-1 border-t border-gray-200 dark:border-white/10"></div>

                {menuItem("/builder", "Builder", Code)}
                {menuItem("/templates", "Templates", LayoutTemplate)}
                {menuItem("/history", "History", History)}

              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;