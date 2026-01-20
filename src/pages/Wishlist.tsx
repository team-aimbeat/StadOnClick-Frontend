import { Heart } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";

export default function Wishlist() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPageTitle("Wishlist"));
  }, [dispatch]);

  return (
    <div className=" bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb />

        <div className="mt-6 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Wishlist
            </h1>
          </div>

          <div>
            <div className="rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center ">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50/70 shadow-inner shadow-slate-200">
                <Heart className="h-10 w-10 text-slate-600" />
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-900">
                Your wishlist is empty
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Save your favorite experiences and they'll be waiting for you here.
              </p>
              <Link
                to="/marketplace"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
