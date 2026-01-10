import HomeBrowse from "@/components/shared/home/HomeBrowse";
import HomeHero from "@/components/shared/home/HomeHero";
import HomeNewYearDeals from "@/components/shared/home/HomeOffer";
import HomeTestimonial from "@/components/shared/home/HomeTestimonial";
import HomeWhy from "@/components/shared/home/HomeWhy";
import HomeLaunchStrip from "@/components/shared/home/Promo";
import HomeGlowSale from "@/components/shared/home/Sale";

export default function Home() {
  return (
    <div className="text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <HomeHero />
        <HomeLaunchStrip />
        <HomeNewYearDeals />
        <HomeGlowSale />
        <HomeBrowse />
        <HomeWhy />
        <HomeTestimonial />
      </div>
    </div>
  )
}
