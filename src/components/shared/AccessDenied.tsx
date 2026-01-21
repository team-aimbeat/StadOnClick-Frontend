import { Link } from "react-router-dom";

type Props = {
  title?: string;
  message?: string;
  primaryActionTo?: string;
  primaryActionLabel?: string;
};

export default function AccessDenied({
  title = "Access denied",
  message = "You don’t have permission to access this portal. If you believe this is a mistake, contact your administrator.",
  primaryActionTo = "/sign-in",
  primaryActionLabel = "Go back to User Portal",
}: Props) {
  return (
    <div className="min-h-[70vh] w-full">
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center justify-center px-6 py-14 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            StadonClick Security
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            {title}
          </h1>

          <p className="mt-2 text-sm text-slate-600">{message}</p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              to={primaryActionTo}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {primaryActionLabel}
            </Link>

            <Link
              to="/admin/sign-in"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Try Admin Sign in
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
            <p className="text-xs font-semibold text-amber-800">
              Why am I seeing this?
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Your account is authenticated, but your roles do not include access
              to the Admin Portal (ADMIN / MODERATOR / SUPPORT / VENDOR).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
