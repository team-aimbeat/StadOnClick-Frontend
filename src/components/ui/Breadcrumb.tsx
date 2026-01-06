import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: string;
  path: string;
};

const formatLabel = (segment: string) =>
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const Breadcrumb = () => {
  const location = useLocation();

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean);

  const crumbs: Crumb[] = pathnames.map((segment, index) => {
    const path = "/" + pathnames.slice(0, index + 1).join("/");
    return {
      label: formatLabel(segment),
      path,
    };
  });

  return (
    <nav className="flex items-center text-sm text-gray-500">
      <Link
        to="/"
        className="font-medium text-gray-600 hover:text-primary"
      >
        Home
      </Link>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <div key={crumb.path} className="flex items-center">
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />

            {isLast ? (
              <span className="font-semibold text-primary">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-primary transition"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
