import { Sparkles, LogOut } from "lucide-react";

function Navbar({ onLogout }) {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-indigo-600">
            AI Code Builder
          </span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;