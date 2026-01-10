import { useEffect } from "react";
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";

export default function ErrorPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Error"));
  }, [dispatch]);

  const error = useRouteError();

  const status =
    (isRouteErrorResponse(error) && error.status) ||
    (error as { status?: number })?.status ||
    500;

  const message =
    (isRouteErrorResponse(error) && error.statusText) ||
    (error as { message?: string })?.message ||
    "Something went wrong. Please try again.";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md p-8 space-y-6 text-center border border-slate-100">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#0b59a2]">Oops</p>
          <h1 className="text-3xl font-bold text-slate-900">We hit a bump</h1>
          <p className="text-sm text-slate-600">
            {status} — {message}
          </p>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p>Try going back home or refreshing the page.</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="default">
            <Link to="/">Go to sign up</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
