import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import ServicesExplorer from "@/components/marketplace/ServicesExplorer";

export default function RestaurantMarketplace() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPageTitle("Restaurants"));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <ServicesExplorer />
    </div>
  );
}
