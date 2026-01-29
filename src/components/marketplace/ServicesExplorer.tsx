import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bannerImage from "@/assets/images/bgsalon.jpg"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
} from "lucide-react"
import { Service } from "./types"
import ServicesSidebar from "./ServicesSidebar"
import EnquiryModal from "./enquiry/EnquiryModal"

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

export default function ServicesExplorer() {
  const navigate = useNavigate()
  const [enquiryService, setEnquiryService] = useState<Service | null>(null)

  return (
    <section className="min-h-screen bg-[#F9F9F9] py-8">
      <div className="mx-auto flex max-w-370 gap-8 px-6 lg:px-8">
        <ServicesSidebar />

        <div className="flex-1 space-y-6">
          <header
            className="space-y-4 rounded-lg px-6 py-10 text-white shadow-lg min-h-[250px]"
            style={{
              backgroundImage: ` url(${bannerImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[28px] font-bold text-black">
                  Services near you
                </h1>
              </div>
               {/* <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                Sales
              </button>
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                Price
              </button>
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                Recommended
              </button>
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                Apply
              </button>
            </div>   */}
              <button
                type="button"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
              >
                Sort: Popular
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[16px] text-black">
              Explore and book local services • 132 results
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-black">
              <div className="flex items-center gap-2 rounded-2xl bg-white/40 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                24 stylists online now
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/40 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                98% booked for this week
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/40 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Avg. response under 10 min
              </div>
            </div>
          </header> 
           

          <div className="grid gap-6  md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="flex flex-col overflow-hidden rounded-lg  bg-white  transition hover:-translate-y-1 w-[325px] h-[558px] shadow-md"
              >
                <div className="relative h-[204px] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <button
                    type="button"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-600 shadow-lg shadow-slate-900/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-600 shadow-lg shadow-slate-900/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[19px] font-bold text-slate-900">
                        {service.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-[14px] text-slate-500 font-medium">
                        <MapPin className="h-5 w-5 text-black" />
                        {service.location}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-amber-500">
                        <Star className="h-4 w-4" />
                        {service.rating.toFixed(1)}
                      </span>
                      {/* <span className="text-[12px] font-semibold text-slate-400">
                        {service.reviews} reviews
                      </span> */}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {service.details.map((detail, index) => (
                      <div
                        key={`${service.id}-detail-${index}`}
                        className="flex items-center justify-between rounded-sm  bg-[#F6F6F6] px-4 py-3 w-[283px] h-[68px] "
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {detail.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {detail.subtitle}
                          </p>
                          <p className="text-xs font-semibold text-slate-400">
                            {detail.duration}
                          </p>
                        </div>
                        <span className="text-[16px] font-bold text-slate-900">
                          {detail.price}
                        </span>
                      </div>
                    ))}
                  </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/services/${service.slug}`)}
                        className="min-w-[135px]  rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        View all services
                      </button>
                      <button
                        type="button"
                        className="min-w-[135px] rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                        onClick={() => setEnquiryService(service)}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Send Enquiry
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    </div>
                </div>
              </article>
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
