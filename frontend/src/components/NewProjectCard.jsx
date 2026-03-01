function NewProjectCard({ onClick, view }) {
  const base = `
    bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-700
    transition-all duration-300
    cursor-pointer
    flex items-center justify-center
  `;

  /* GRID */
  if (view === "grid") {
    return (
      <div
        onClick={onClick}
        className={`${base}
          rounded-3xl shadow-xl p-8 text-center
          hover:shadow-2xl hover:-translate-y-1
        `}
      >
        <div className="text-4xl text-indigo-600 dark:text-indigo-400 font-bold">
          +
        </div>
      </div>
    );
  }

  /* LIST */
  if (view === "list") {
    return (
      <div
        onClick={onClick}
        className={`${base}
          rounded-xl p-4 hover:shadow-lg
        `}
      >
        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
          + New Project
        </span>
      </div>
    );
  }

  /* COMPACT */
  if (view === "compact") {
    return (
      <div
        onClick={onClick}
        className={`${base}
          rounded-xl p-3 hover:shadow-md
        `}
      >
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          + New
        </span>
      </div>
    );
  }

  /* DETAILED */
  if (view === "detailed") {
    return (
      <div
        onClick={onClick}
        className={`${base}
          rounded-2xl p-6 hover:shadow-xl
        `}
      >
        <div>
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            Create New Project
          </h2>
        </div>
      </div>
    );
  }

  return null;
}

export default NewProjectCard;