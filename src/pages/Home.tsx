import HomeHero from "@/pages/components/home/HomeHero"
import HomeNewYearDeals from "@/pages/components/home/HomeOffer"
import HomePopular from "@/pages/components/home/HomePopular"
import GlowCategory from "@/pages/components/home/GlowCategory"
import FitnessCategory from "@/pages/components/home/FitnessCategory"
import NewSkillsCategory from "@/pages/components/home/NewSkillsCategory"
import HomeBrowse from "@/pages/components/home/HomeBrowse"
import HomeWhy from "@/pages/components/home/HomeWhy"
import HomeTestimonial from "@/pages/components/home/HomeTestimonial"
import HomeTopCategories from "@/pages/components/home/HomeTopCategories"

export default function Home() {
  return (
    <div className="text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <HomeTopCategories />
        <HomeHero />
        <HomePopular />
        <GlowCategory />
        <FitnessCategory />
        <NewSkillsCategory />
        <HomeNewYearDeals />
        <HomeBrowse />
        <HomeWhy />
        <HomeTestimonial />
      </div>
    </div>
  )
}
