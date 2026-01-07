import React from "react";
import {
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiArrowDownTray,
  HiEllipsisHorizontal,
} from "react-icons/hi2";

interface TableHeaderProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  placeholder = "Search for vendors and documents",
  onSearch,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-white dark:bg-gray-900">
      {/* 🔍 Search */}
      <div className="relative w-full max-w-sm">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white h-4 w-4" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="
            w-full h-9 pl-9 pr-3
            rounded-full
            border border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800
            text-sm
            text-black dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          "
        />
      </div>

      {/* ⚙ Actions */}
      <div className="flex items-center gap-1 text-black dark:text-white">
        {[
          HiAdjustmentsHorizontal,
          HiArrowPath,
          HiArrowDownTray,
          HiEllipsisHorizontal,
        ].map((Icon, i) => (
          <button
            key={i}
            className="
              h-9 w-9
              flex items-center justify-center
              rounded-md
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition
            "
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableHeader;
