import { useState } from "react";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";

const SearchBar = () => {
  const [search, setSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add your search logic here
    }
    setSearch(false);
  };

  return (
    <div className="relative">
      {/* Search Button for Mobile */}
      <button
        type="button"
        onClick={() => setSearch(true)}
        className="search-btn sm:hidden p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
      >
        <HiMagnifyingGlass className="w-4.5 h-4.5 mx-auto dark:text-[#d0d2d6]" />
      </button>

      {/* Search Bar - Always visible on desktop, conditionally on mobile */}
      <form
        className={`
                    ${search ? "!block" : "hidden"} 
                    sm:block 
                    sm:relative 
                    absolute 
                    inset-x-0 
                    top-full 
                    sm:top-auto
                    mt-2 
                    sm:mt-0
                    sm:mx-0 
                    mx-4 
                    z-50
                `}
        onSubmit={handleSearch}
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
                            form-input 
                            w-full 
                            py-3 
                            pl-12 
                            pr-10 
                            rounded-2xl
                            border 
                            border-gray-300 
                            dark:border-gray-600 
                            bg-white 
                            dark:bg-gray-800 
                            text-gray-900 
                            dark:text-white 
                            placeholder-gray-500 
                            dark:placeholder-gray-400
                            focus:border-primary 
                            focus:ring-2 
                            focus:ring-primary/20 
                            dark:focus:border-primary 
                            transition-all 
                            duration-200
                        
                        "
            placeholder="Search anything here..."
            autoFocus={search}
          />

          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <HiMagnifyingGlass className="w-5 h-5 text-gray-900 dark:text-gray-500" />
          </div>

          {/* Clear/Close Button */}
          {(searchQuery || search) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                if (window.innerWidth < 640) setSearch(false);
              }}
              className="
                                absolute 
                                right-3 
                                top-1/2 
                                -translate-y-1/2 
                                p-1 
                                rounded-full 
                                hover:bg-gray-100 
                                dark:hover:bg-gray-700 
                                transition-colors
                            "
            >
              <HiXMark className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Search Suggestions (Optional) */}
        {searchQuery && (
          <div
            className="
                        absolute 
                        top-full 
                        left-0 
                        right-0 
                        mt-1 
                        bg-white 
                        dark:bg-gray-800 
                        rounded-lg 
                        shadow-lg 
                        border 
                        border-gray-200 
                        dark:border-gray-700 
                        overflow-hidden 
                        z-50
                    "
          >
            <div className="py-2">
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                Recent searches
              </div>
              <button
                type="button"
                className="
                                    w-full 
                                    text-left 
                                    px-4 
                                    py-3 
                                    hover:bg-gray-50 
                                    dark:hover:bg-gray-700 
                                    flex 
                                    items-center 
                                    gap-3
                                "
                onClick={() => setSearchQuery("Dashboard analytics")}
              >
                <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
                <span>Dashboard analytics</span>
              </button>
              <button
                type="button"
                className="
                                    w-full 
                                    text-left 
                                    px-4 
                                    py-3 
                                    hover:bg-gray-50 
                                    dark:hover:bg-gray-700 
                                    flex 
                                    items-center 
                                    gap-3
                                "
                onClick={() => setSearchQuery("User settings")}
              >
                <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
                <span>User settings</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Overlay for mobile when search is active */}
      {search && (
        <div
          className="
                        fixed 
                        inset-0 
                        bg-black/50 
                        z-40 
                        sm:hidden
                    "
          onClick={() => setSearch(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
