import { Heart, MapPin, Star, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { slugifyServiceTitle } from "@/utils/slugify";
import {
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
} from "@/services/wishlistApi";

export default function Wishlist() {
  const dispatch = useAppDispatch();
  const { data: items = [], isLoading } = useGetWishlistQuery();
  const [removeWishlistItem] = useRemoveWishlistItemMutation();

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

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center">
              <p className="text-sm text-slate-500">Loading wishlist...</p>
            </div>
          ) : items.length === 0 ? (
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
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-44 w-full object-cover"
                  />
                  <div className="space-y-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {item.categoryName}
                    </p>
                    <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {item.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to={`/service/${slugifyServiceTitle(item.title)}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeWishlistItem({ serviceId: item.serviceId })}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
