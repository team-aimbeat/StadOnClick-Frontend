import type { IconType } from "react-icons"
import {
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineHomeModern,
  HiOutlineMap,
  HiOutlineGlobeAlt,
  HiOutlineBuildingOffice2,
  HiOutlineScissors,
} from "react-icons/hi2"
import well from "@/assets/Images/well.jpg"
import family from "@/assets/Images/family.jpg"
import learn from "@/assets/Images/learn.jpg"
import wellness from "@/assets/Images/wellness.jpg"
import travel from "@/assets/Images/travel.jpg"
import home from "@/assets/Images/home.jpg"
import food from "@/assets/Images/food.jpg"
import wash from "@/assets/Images/wash.jpg"

export type VendorServiceCategory = {
  name: string
  slug: string
  icon: IconType
  image: string
  highlights: string[]
  subcategories: string[]
  accent?: string
}

export const plannedCategories: VendorServiceCategory[] = [
  {
    name: "Experiences & Activities",
    slug: "experiences-activities",
    icon: HiOutlineSparkles,
    image: well,
    highlights: [
      "Events around the city",
      "Concerts & Live Shows",
      "Movie bookings",
      "Museums & exhibitions",
      "Tourist buses & boat tours",
      "Tourist activities & attractions",
      "Places to visit near the city",
    ],
    subcategories: [
      "City tours",
      "Live shows",
      "Museum passes",
      "Food & culture walks",
    ],
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    icon: HiOutlineHeart,
    image: wellness,
    highlights: [
      "Gym & fitness studios",
      "Yoga / meditation classes",
      "Massage & spa services",
      "Swimming classes",
      "Health & essential services",
    ],
    subcategories: [
      "Yoga & meditation",
      "Rehab therapies",
      "Spa packages",
      "Fitness training",
    ],
  },
  {
    name: "Kids & Family",
    slug: "kids-family",
    icon: HiOutlineUsers,
    image: family,
    highlights: [
      "Kids events",
      "Kids play areas & activities",
      "Educational / hobby classes",
      "Birthday parties & decorations",
    ],
    subcategories: [
      "Birthday parties",
      "Play experiences",
      "Edutainment camps",
      "Decor planning",
    ],
  },
  {
    name: "Learning & Skill Development",
    slug: "learning-skill-development",
    icon: HiOutlineAcademicCap,
    image: learn,
    highlights: [
      "Driving classes",
      "Workshops & short courses",
      "Sports academies & coaching",
      "Creative skill labs",
    ],
    subcategories: [
      "Driving lessons",
      "Short workshops",
      "Sports coaching",
      "Creative labs",
    ],
  },
  {
    name: "Home & Personal Services",
    slug: "home-personal-services",
    icon: HiOutlineHomeModern,
    image: wash,
    highlights: [
      "House help services",
      "Cleaning & car wash",
      "Movers & packers",
      "Plumbers / electricians / handymen",
      "Home-based businesses",
    ],
    subcategories: [
      "Cleaning services",
      "Handyman visits",
      "Packers & movers",
      "Home chefs",
    ],
  },
  {
    name: "Travel & Transportation",
    slug: "travel-transportation",
    icon: HiOutlineMap,
    image: travel,
    highlights: [
      "Cab services",
      "Ferry, bus & train information",
      "Courier service (domestic / EU / international)",
    ],
    subcategories: [
      "Cab bookings",
      "Commuter info",
      "Courier logistics",
    ],
  },
  {
    name: "Food & Leisure",
    slug: "food-leisure",
    icon: HiOutlineGlobeAlt,
    image: food,
    highlights: [
      "Eateries & hotspots",
      "Cafes & restaurants",
      "Weekend / weekday markets",
    ],
    subcategories: [
      "Eateries & hotspots",
      "Neighborhood consults",
      "Local business support",
    ],
  },
  {
    name: "Real Estate & Local Support",
    slug: "real-estate-local-support",
    icon: HiOutlineBuildingOffice2,
    image: home,
    highlights: [
      "Property brokers",
      "Local business listings",
      "Community / neighborhood services",
    ],
    subcategories: [
      "Property tours",
      "Neighborhood consults",
      "Local business support",
    ],
  },
]

export const plannedCategoryNames = new Set(plannedCategories.map((cat) => cat.name))

export const slugifyCategory = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
