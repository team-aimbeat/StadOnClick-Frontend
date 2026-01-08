import HomeHero from "@/pages/components/home/HomeHero"
import HomeNewYearDeals from "@/pages/components/home/HomeOffer"
import HomePopular from "@/pages/components/home/HomePopular"
import HomeBrowse from "@/pages/components/home/HomeBrowse"
import HomeWhy from "@/pages/components/home/HomeWhy"
import HomeTestimonial from "@/pages/components/home/HomeTestimonial"

export default function Home() {
  return (
    <div className="text-slate-900">
      <div className="w-full px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <HomeHero />
        <HomePopular />
        <HomeNewYearDeals />
        <HomeBrowse />
        <HomeWhy />
        <HomeTestimonial />
      </div>
    </div>
  )
}
