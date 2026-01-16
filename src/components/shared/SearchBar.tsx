import { useState } from "react";
import { Search, X } from "lucide-react";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
          console.log("Searching for:", searchQuery);
        }
      }}
    >
      <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-11 text-sm text-gray-800 placeholder:text-gray-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400"
        placeholder="Search"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
