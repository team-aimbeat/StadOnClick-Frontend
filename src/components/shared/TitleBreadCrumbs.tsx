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
    <div className="flex flex-col gap-1">
      <h1 className="page-title">{title}</h1>

      <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          to="/"
          className="flex items-center text-gray-500 transition-colors duration-200 hover:text-primary-red"
          aria-label="Home"
        >
          <IconHome className="h-4 w-4" />
        </Link>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <React.Fragment key={`${crumb}-${index}`}>
              <span className="text-gray-400">/</span>
              <span
                className={
                  isLast
                    ? 'font-["proxima-medium"] text-primary-black dark:text-white'
                    : 'font-["proxima-regular"] text-gray-500'
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
