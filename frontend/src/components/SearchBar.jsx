import { Search, X } from "lucide-react";

function SearchBar({ value, onChange, onSearch, onClear }) {
  return (
    <div className="relative w-full md:w-96 flex items-center">
      <input
        type="text"
        placeholder="Search projects..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-2 pr-20 
          border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-900
          text-gray-800 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          rounded-xl 
          focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500
          outline-none
          transition-colors duration-300
        "
      />

      {/* Search Icon Button */}
      <button
        onClick={onSearch}
        className="
          absolute right-10 
          text-gray-500 dark:text-gray-400
          hover:text-indigo-600 dark:hover:text-indigo-400
          transition
        "
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Clear Button */}
      {value && (
        <button
          onClick={onClear}
          className="
            absolute right-3 
            text-gray-400 dark:text-gray-500
            hover:text-gray-600 dark:hover:text-gray-300
            transition
          "
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;