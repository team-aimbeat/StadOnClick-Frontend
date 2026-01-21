import { useEffect } from "react";
import HomeBrowse from "@/components/shared/home/HomeBrowse";
import HomeHero from "@/components/shared/home/HomeHero";
import HomeCategories from "@/components/shared/home/HomeCategories";
import HomeMind from "@/components/shared/home/HomeMind";
import HomeServices from "@/components/shared/home/HomeServices";
import HomeDiscount from "@/components/shared/home/HomeDiscount";
import HomeTrendingNow from "@/components/shared/home/HomeTrendingNow";
import HomeStudios from "@/components/shared/home/HomeStudios";
import HomeTrending from "@/components/shared/home/HomeTrending";
import HomeCoupon from "@/components/shared/home/HomeCoupon";
import HomeTestimonial from "@/components/shared/home/HomeTestimonial";
import HomeSightseeing from "@/components/shared/home/HomeSightseeing";
import HomeLaunchStrip from "@/components/shared/home/Promo";
import HomeGlowSale from "@/components/shared/home/Sale";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import HomeSubscribe from "@/components/shared/home/HomeSubscribe";
import Addvertise from "@/components/shared/home/Addvertise";

export default function Home() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Home"));
  }, [dispatch]);

  return (
    <div className="text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <HomeHero />
        <HomeCategories />
        {/* <HomeServices /> */}
        <HomeLaunchStrip />
       
      
        <HomeDiscount />
        <Addvertise />
        {/* <HomeStudios /> */}
        <HomeMind />
        <HomeTrendingNow />
        {/* <HomeGlowSale /> */}
          <HomeTrending />
          <HomeCoupon />
        <HomeSightseeing />
        {/* <HomeBrowse /> */}
        {/* <HomeTestimonial /> */}
        <HomeSubscribe />
      </div>
    </div>
  )
}
