import { ChevronLeft, ChevronRight, Clock, Heart, MapPin, Star } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Service } from "./types"
import {
  WISHLIST_UPDATED_EVENT,
  isWishlisted,
  toggleWishlist,
} from "@/utils/wishlistStorage"

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
  const [wishlisted, setWishlisted] = useState<boolean>(() => isWishlisted(service.id))

  const images = useMemo(() => {
    const list =
      service.images && service.images.length > 0 ? service.images : [service.image]
    return list.filter(Boolean)
  }, [service.image, service.images])
  const imagesKey = useMemo(() => images.join("|"), [images])

  const loopImages = useMemo(() => {
    if (images.length <= 1) return images
    return [images[images.length - 1]!, ...images, images[0]!]
  }, [images])

  const [activeImageIndex, setActiveImageIndex] = useState(images.length > 1 ? 1 : 0)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const isAnimatingRef = useRef(false)
  const snapRafRef = useRef<number | null>(null)

  useEffect(() => {
    setTransitionEnabled(false)
    setActiveImageIndex(images.length > 1 ? 1 : 0)
    if (snapRafRef.current != null) window.cancelAnimationFrame(snapRafRef.current)
    snapRafRef.current = window.requestAnimationFrame(() => {
      setTransitionEnabled(true)
      isAnimatingRef.current = false
    })

    return () => {
      if (snapRafRef.current != null) window.cancelAnimationFrame(snapRafRef.current)
      snapRafRef.current = null
    }
  }, [imagesKey])

  useEffect(() => {
    const syncWishlist = () => setWishlisted(isWishlisted(service.id))
    syncWishlist()
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncWishlist)
    window.addEventListener("storage", syncWishlist)
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncWishlist)
      window.removeEventListener("storage", syncWishlist)
    }
  }, [service.id])

  const showPrev = () => {
    if (images.length <= 1) return
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true
    setActiveImageIndex((prev) => prev - 1)
  }

  const showNext = () => {
    if (images.length <= 1) return
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true
    setActiveImageIndex((prev) => prev + 1)
  }

  const handleCarouselTransitionEnd = () => {
    if (images.length <= 1) return

    // [cloneLast, ...realImages, cloneFirst]
    if (activeImageIndex === 0) {
      setTransitionEnabled(false)
      setActiveImageIndex(images.length)
      if (snapRafRef.current != null) window.cancelAnimationFrame(snapRafRef.current)
      snapRafRef.current = window.requestAnimationFrame(() => {
        setTransitionEnabled(true)
        isAnimatingRef.current = false
      })
      return
    }

    if (activeImageIndex === images.length + 1) {
      setTransitionEnabled(false)
      setActiveImageIndex(1)
      if (snapRafRef.current != null) window.cancelAnimationFrame(snapRafRef.current)
      snapRafRef.current = window.requestAnimationFrame(() => {
        setTransitionEnabled(true)
        isAnimatingRef.current = false
      })
      return
    }

    isAnimatingRef.current = false
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-white transition shadow-md w-81.25 h-139.5">
      <div className="relative h-51 overflow-hidden">
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 shadow-sm transition ${
            wishlisted
              ? "border-rose-200 text-rose-500"
              : "border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-500"
          }`}
          onClick={() => {
            const next = toggleWishlist({
              id: service.id,
              title: service.title,
              image: service.image,
              location: service.location,
              categoryName: service.categoryName,
              rating: service.rating,
              reviews: service.reviews,
            })
            setWishlisted(next)
          }}
        >
          <Heart className={`h-4.5 w-4.5 ${wishlisted ? "fill-current" : ""}`} />
        </button>
        <div
          className={`flex h-full w-full transform-gpu will-change-transform ${transitionEnabled ? "transition-transform duration-500 ease-out" : ""}`}
          style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
          onTransitionEnd={handleCarouselTransitionEnd}
        >
          {loopImages.map((src, index) => (
            <div key={`${index}-${src}`} className="h-full w-full shrink-0">
              <img src={src} alt={service.title} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Previous image"
          disabled={images.length <= 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-600 shadow-lg shadow-slate-900/10 transition-transform hover:bg-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-40"
          onClick={showPrev}
        >
        
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next image"
          disabled={images.length <= 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-600 shadow-lg shadow-slate-900/10 transition-transform hover:bg-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-40"
          onClick={showNext}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[19px] font-bold text-slate-900">{service.title}</h3>
              <div className="mt-1 text-sm font-semibold text-blue-600">
                {service.categoryName}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[14px] text-slate-500 font-medium">
                <MapPin className="h-5 w-5 text-black font-semibold" />
                {service.location}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="flex items-center gap-1 text-[12px] font-semibold text-amber-500">
                     <Star className="h-4 w-4 fill-[#F4D62F] text-[#F4D62F] " />
                {service.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {service.details.map((detail, index) => (
            <div
              key={`${service.id}-detail-${index}`}
              className="w-70.75 rounded-sm bg-[#F6F6F6] px-4 py-3 h-17 transform-gpu transition-transform duration-200 hover:scale-[1.01]"
            >

              <div className="mt-0.5 flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-sm font-black leading-snug text-slate-900">
                  {detail.title}
                </p>
                <span className="shrink-0 text-[18px] font-black text-slate-900">
                  {detail.price}
                </span>
              </div>

              {detail.duration ? (
                <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span>{detail.duration}</span>
                </div>
              ) : null}
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
