import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react"
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
  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-white transition hover:-translate-y-1 shadow-md w-81.25 h-139.5">
      <div className="relative h-51 overflow-hidden">
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

        <div className="space-y-3">
          {service.details.map((detail, index) => (
            <div
              key={`${service.id}-detail-${index}`}
              className="flex items-center justify-between rounded-sm bg-[#F6F6F6] px-4 py-3 w-70.75 h-17"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{detail.title}</p>
                <p className="text-xs text-slate-500">{detail.subtitle}</p>
                <p className="text-xs font-semibold text-slate-400">{detail.duration}</p>
              </div>
              <span className="text-[16px] font-bold text-slate-900">{detail.price}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
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
