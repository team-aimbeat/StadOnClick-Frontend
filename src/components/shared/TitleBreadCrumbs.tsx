import React from "react";
import { Link } from "react-router-dom";
import { IconHome } from "@tabler/icons-react";
import { HiChevronRight } from "react-icons/hi2";
import { cn } from "@/lib/utils";

type TitleBreadCrumbsProps = {
  title: string;
  breadCrumbTitle: string;
  className?: string;
};

const TitleBreadCrumbs: React.FC<TitleBreadCrumbsProps> = ({
  title,
  breadCrumbTitle,
  className,
}) => {
  const crumbs = breadCrumbTitle
    .split("/")
    .map((crumb) => crumb.trim())
    .filter(Boolean);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* LEFT — PAGE TITLE */}
      <div className="min-w-0">
        <h1 className="truncate text-[24px] font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Overview and key insights
        </p>
      </div>

      {/* RIGHT — BREADCRUMBS */}
      <nav
        aria-label="breadcrumb"
        className="hidden shrink-0 items-center sm:flex"
      >
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
          {/* Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="Home"
          >
            <IconHome className="h-4 w-4" />
          </Link>

          {/* Crumbs */}
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <React.Fragment key={`${crumb}-${index}`}>
                <HiChevronRight className="h-4 w-4 text-slate-400" />

                <span
                  className={cn(
                    "max-w-[180px] truncate rounded-full px-2 py-1 transition-colors",
                    isLast
                      ? "bg-slate-50 font-semibold text-slate-900"
                      : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default TitleBreadCrumbs;
