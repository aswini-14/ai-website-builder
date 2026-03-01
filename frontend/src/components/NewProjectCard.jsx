function NewProjectCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-3xl shadow-xl 
        hover:shadow-2xl 
        hover:-translate-y-1 
        hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-500
        transition-all duration-300
        cursor-pointer 
        flex flex-col items-center justify-center 
        p-8 text-center
      "
    >
      <div className="
        w-14 h-14 
        bg-indigo-100 dark:bg-indigo-900/40
        rounded-full 
        flex items-center justify-center 
        mb-4
        transition-colors
      ">
        <span className="text-3xl text-indigo-600 dark:text-indigo-400 font-bold">
          +
        </span>
      </div>

      <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
        New Project
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Start building something new
      </p>
    </div>
  );
}

export default NewProjectCard;