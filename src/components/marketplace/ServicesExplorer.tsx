import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bannerImage from "@/assets/images/bgsalon.jpg"
import { ChevronDown } from "lucide-react"
import { Service } from "./types"
import ServicesSidebar from "./ServicesSidebar"
import EnquiryModal from "./enquiry/EnquiryModal"
import ServiceCard from "./ServiceCard"

const services: Service[] = [
  {
    id: "service-1",
    title: "Your hair salon",
    location: "Stockholms",
    rating: 4.4,
    reviews: 312,
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80",
    slug: "salon-deals",
    details: [
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-2",
    title: "Saloooon",
    location: "Stockholms",
    rating: 4.4,
    reviews: 248,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    slug: "new-deals",
    details: [
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-3",
    title: "Salon now",
    location: "Stockholms",
    rating: 4.4,
    reviews: 201,
    image:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80",
    slug: "buffet-deals",
    details: [
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-4",
    title: "Your hair salon",
    location: "Stockholms",
    rating: 4.4,
    reviews: 219,
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    slug: "games-outings",
    details: [
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-5",
    title: "Saloooon",
    location: "Stockholms",
    rating: 4.4,
    reviews: 186,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    slug: "new-deals",
    details: [
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
  {
    id: "service-6",
    title: "Salon now",
    location: "Stockholms",
    rating: 4.4,
    reviews: 195,
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    slug: "salon-deals",
    details: [
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
      {
        title: "Haircut with Nikita",
        subtitle: "For Nape & Longer Styles",
        duration: "2 hr",
        price: "$200",
      },
    ],
  },
]

export type ServicesExplorerProps = {
  services?: Service[]
  headerTitle?: string
  headerDescription?: string
  bannerImage?: string
  stats?: { label: string; color: string }[]
}

const defaultStats = [
  { label: "24 stylists online now", color: "bg-emerald-400" },
  { label: "98% booked for this week", color: "bg-sky-400" },
  { label: "Avg. response under 10 min", color: "bg-amber-400" },
]

export default function ServicesExplorer({
  services: providedServices,
  headerTitle = "Services near you",
  headerDescription = "Explore and book local services · 132 results",
  bannerImage: headerBanner = bannerImage,
  stats,
}: ServicesExplorerProps = {}) {
  const navigate = useNavigate()
  const [enquiryService, setEnquiryService] = useState<Service | null>(null)

  const activeServices = providedServices ?? services
  const statRows = stats ?? defaultStats

  return (
    <section className="min-h-screen bg-[#F9F9F9] py-8">
      <div className="mx-auto flex max-w-370 gap-8 px-6 lg:px-8">
        <ServicesSidebar />

        <div className="flex-1 space-y-6">
          <header
            className="space-y-4 rounded-lg px-6 py-15 text-white shadow-lg min-h-25"
            style={{
              backgroundImage: `url(${headerBanner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[28px] font-bold text-black">{headerTitle}</h1>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
              >
                Sort: Popular
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[16px] text-black">{headerDescription}</p>

            <div className="flex flex-wrap gap-4 text-sm text-black">
              {statRows.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 rounded-2xl bg-white/40 px-4 py-2"
                >
                  <span className={`h-2 w-2 rounded-full ${stat.color}`} />
                  {stat.label}
                </div>
              ))}
            </div>
          </header>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onViewDetails={(item) => navigate(`/services/${item.slug}`)}
                onEnquiry={(item) => setEnquiryService(item)}
              />
            ))}
          </div>
        </div>
      </div>
      {enquiryService && (
        <EnquiryModal service={enquiryService} onClose={() => setEnquiryService(null)} />
      )}
    </section>
  )
}
