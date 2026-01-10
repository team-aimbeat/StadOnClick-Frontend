import HomeHero from "@/components/shared/home/HomeHero"
import HomeNewYearDeals from "@/components/shared/home/HomeOffer"
import HomePopular from "@/components/shared/home/HomePopular"
import GlowCategory from "@/components/shared/home/GlowCategory"
import FitnessCategory from "@/components/shared/home/FitnessCategory"
import NewSkillsCategory from "@/components/shared/home/NewSkillsCategory"
import HomeBrowse from "@/components/shared/home/HomeBrowse"
import HomeWhy from "@/components/shared/home/HomeWhy"
import HomeTestimonial from "@/components/shared/home/HomeTestimonial"
import HomeTopCategories from "@/components/shared/home/HomeTopCategories"

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
