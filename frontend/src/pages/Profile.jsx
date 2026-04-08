import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Profile() {
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setUser(data);
      setEditName(data.name);
    };

    fetchUser();
  }, []);


  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: editName })
    });

    setUser({ ...user, name: editName });
    setIsEditing(false);
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center 
      text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );

    const handleLogout = () => {
        const theme = localStorage.getItem("theme");

        localStorage.clear();

        // restore theme
        if (theme) {
            localStorage.setItem("theme", theme);
        }

        window.location.href = "/login";
    };

  return (
    <div className="relative min-h-screen px-2 pb-12 overflow-hidden 
    bg-gradient-to-br 
    from-indigo-50 via-white to-purple-50
    dark:from-[#020617] dark:via-[#020617] dark:to-[#020617]">
        <Navbar onLogout={handleLogout} />

      {/* 🌌 Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] 
      bg-indigo-500/20 dark:bg-indigo-600/20 blur-[120px] rounded-full"></div>

      <div className="absolute bottom-[-120px] right-[-100px] w-[400px] h-[400px] 
      bg-purple-500/20 dark:bg-purple-600/20 blur-[120px] rounded-full"></div>

      <div className="max-w-3xl mx-auto relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mb-10"
        >
          <div className="
            w-20 h-20 rounded-full 
            bg-gradient-to-br from-indigo-500 to-purple-600
            flex items-center justify-center 
            text-white text-2xl font-bold
            shadow-lg
          ">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {user.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {user.email}
            </p>
          </div>
        </motion.div>

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="
            p-8 rounded-3xl
            bg-white/70 dark:bg-white/10
            backdrop-blur-2xl
            border border-gray-200 dark:border-white/10
            shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]
          "
        >

          <h3 className="text-xl font-semibold mb-8 
          text-gray-800 dark:text-white/90">
            Account Information
          </h3>

          {/* NAME */}
          <div className="mb-6">
            <p className="text-sm mb-2 
            text-gray-500 dark:text-gray-400">
              Full Name
            </p>

            <div className="flex gap-3">
              <input
                value={editName}
                disabled={!isEditing}
                onChange={(e) => setEditName(e.target.value)}
                className="
                  flex-1 px-4 py-3 rounded-xl
                  bg-white dark:bg-white/5
                  border border-gray-300 dark:border-white/10
                  text-gray-800 dark:text-white
                  focus:outline-none
                  focus:ring-2 focus:ring-indigo-500
                  transition-all
                "
              />

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="
                  px-4 py-2 rounded-xl
                  bg-gray-100 hover:bg-gray-200
                  dark:bg-white/5 dark:hover:bg-white/10
                  border border-gray-300 dark:border-white/10
                  text-gray-700 dark:text-white
                  text-sm transition
                "
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          {/* EMAIL */}
          <div className="mb-10">
            <p className="text-sm mb-2 
            text-gray-500 dark:text-gray-400">
              Email Address
            </p>

            <div className="
              px-4 py-3 rounded-xl
              bg-white dark:bg-white/5
              border border-gray-300 dark:border-white/10
              text-gray-800 dark:text-white
            ">
              {user.email}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col gap-4">

            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={handleUpdate}
                className="
                  py-3 rounded-xl
                  bg-gradient-to-r from-indigo-500 to-purple-500
                  text-white font-medium
                  shadow-md
                "
              >
                Save Changes
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate("/forgot-password")}
              className="
                py-3 rounded-xl
                bg-gray-100 hover:bg-gray-200
                dark:bg-white/5 dark:hover:bg-white/10
                border border-gray-300 dark:border-white/10
                text-gray-800 dark:text-white
                transition
              "
            >
              Change Password
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={handleLogout}
              className="
                py-3 rounded-xl
                bg-gradient-to-r from-red-500 to-pink-500
                text-white font-medium
                shadow-md
              "
            >
              Logout
            </motion.button>

          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;