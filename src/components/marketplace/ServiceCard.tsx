import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Service } from "./types"

type ServiceCardProps = {
  service: Service
  onViewDetails: (service: Service) => void
  onEnquiry: (service: Service) => void
}

export default function ServiceCard({
  service,
  onViewDetails,
  onEnquiry,
}: ServiceCardProps) {
  const images = useMemo(() => {
    const list =
      service.images && service.images.length > 0 ? service.images : [service.image]
    return list.filter(Boolean)
  }, [service.image, service.images])
  const imagesKey = useMemo(() => images.join("|"), [images])

  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    setActiveImageIndex(0)
  }, [imagesKey])

  const showPrev = () => {
    if (images.length <= 1) return
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const showNext = () => {
    if (images.length <= 1) return
    setActiveImageIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg bg-white transition shadow-md w-81.25 h-139.5">
      <div className="relative h-51 overflow-hidden">
        <img
          src={images[activeImageIndex] ?? service.image}
          alt={service.title}
          className="h-full w-full object-cover transition duration-500"
        />
        <button
          type="button"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-600 shadow-lg shadow-slate-900/10"
          onClick={showPrev}
        >
        
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-600 shadow-lg shadow-slate-900/10"
          onClick={showNext}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[19px] font-bold text-slate-900">{service.title}</h3>
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
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {service.details.map((detail, index) => (
            <div
              key={`${service.id}-detail-${index}`}
              className="flex items-center justify-between rounded-sm bg-[#F6F6F6] px-4 py-3 w-70.75 h-17 transform-gpu transition-transform duration-200 group-hover:scale-[1.01]"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{detail.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {detail.compareAtPrice ? (
                  <span className="text-xs font-semibold text-slate-400 line-through">
                    {detail.compareAtPrice}
                  </span>
                ) : null}
                <span className="text-[16px] font-bold text-slate-900">{detail.price}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onViewDetails(service)}
            className="min-w-33.75 rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            View all services
          </button>
          <button
            type="button"
            className="min-w-33.75 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            onClick={() => onEnquiry(service)}
          >
            <div className="flex items-center justify-center gap-2">
              Send Enquiry
              <ChevronRight size={16} />
            </div>
          </button>
        </div>
      </div>
    </article>
  )
}
