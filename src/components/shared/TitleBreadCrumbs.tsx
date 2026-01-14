import { IconHome } from "@tabler/icons-react";
import React from "react";
import { Link } from "react-router-dom";

type TitleBreadCrumbsProps = {
  title: string;
  breadCrumbTitle: string;
};

const TitleBreadCrumbs: React.FC<TitleBreadCrumbsProps> = ({
  title,
  breadCrumbTitle,
}) => {
  const crumbs = breadCrumbTitle
    .split("/")
    .map((crumb) => crumb.trim())
    .filter(Boolean);

  return (
    <div className="flex items-center justify-between">
      {/* LEFT — PAGE TITLE */}
      <h1 className="text-2xl font-semibold text-slate-900">
        {title}
      </h1>

      {/* RIGHT — BREADCRUMBS */}
      <nav
        aria-label="breadcrumb"
        className="flex items-center gap-2 text-sm text-slate-500"
      >
        <Link
          to="/"
          className="flex items-center transition-colors hover:text-slate-700"
          aria-label="Home"
        >
          <IconHome className="h-4 w-4" />
        </Link>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <React.Fragment key={`${crumb}-${index}`}>
              <span className="text-slate-400">/</span>
              <span
                className={
                  isLast
                    ? "font-medium text-slate-900"
                    : "font-normal text-slate-500"
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default TitleBreadCrumbs;
