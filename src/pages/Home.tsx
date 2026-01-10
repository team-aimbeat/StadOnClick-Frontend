import HomeHero from "@/pages/components/home/HomeHero"
import HomeLaunchStrip from "@/pages/components/home/Promo"
import HomeGlowSale from "@/pages/components/home/Sale"
import HomeNewYearDeals from "@/pages/components/home/HomeOffer"
import HomeBrowse from "@/pages/components/home/HomeBrowse"
import HomeWhy from "@/pages/components/home/HomeWhy"
import HomeTestimonial from "@/pages/components/home/HomeTestimonial"

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
