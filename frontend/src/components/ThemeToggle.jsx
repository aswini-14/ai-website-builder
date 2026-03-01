import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="
        fixed top-6 right-6
        z-50
        p-3 rounded-2xl
        backdrop-blur-md
        bg-white/70 dark:bg-gray-900/70
        border border-gray-200 dark:border-gray-700
        shadow-lg
        hover:scale-110
        hover:shadow-xl
        transition-all duration-300
      "
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800" />
      )}
    </button>
  );
}

export default ThemeToggle;