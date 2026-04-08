import { Heart, MapPin, Star } from "lucide-react"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"
import { Service } from "./types"
import { useGetServiceOfferingsQuery } from "@/services/vendorOfferingsApi"
import { useGetServiceReviewsQuery } from "@/services/serviceReviewsApi"
import { useAddWishlistItemMutation, useGetWishlistQuery, useRemoveWishlistItemMutation } from "@/services/wishlistApi"
import { getEffectivePrice } from "@/utils/deals"

type ServiceCardProps = {
  service: Service
  canAccessHotDeals?: boolean
  onViewDetails: (service: Service) => void
  onEnquiry: (service: Service) => void
}

export default function ServiceCard({
  service,
  onViewDetails,
  onEnquiry,
}: ServiceCardProps) {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const { data: wishlistItems = [] } = useGetWishlistQuery(undefined, { skip: !user })
  const [addWishlistItem] = useAddWishlistItemMutation()
  const [removeWishlistItem] = useRemoveWishlistItemMutation()
  const { data: fetchedOfferings = [] } = useGetServiceOfferingsQuery(service.id)
  const { data: fetchedReviews = [] } = useGetServiceReviewsQuery(service.id)

  const wishlisted = wishlistItems.some(
    (item) => item.serviceId === service.id || item.id === service.id,
  )

  const image = service.images?.[0] ?? service.image
  const primaryDetail = service.details[0]
  const rating = useMemo(() => {
    const liveRatings = fetchedReviews
      .map((review) => Number(review.rating))
      .filter((value) => Number.isFinite(value) && value > 0)

    if (liveRatings.length > 0) {
      const total = liveRatings.reduce((sum, value) => sum + value, 0)
      return total / liveRatings.length
    }

    const fallback = Number(service.rating ?? 0)
    return Number.isFinite(fallback) ? fallback : 0
  }, [fetchedReviews, service.rating])
  const reviewCount = fetchedReviews.length > 0 ? fetchedReviews.length : Number(service.reviews ?? 0)

  const priceLabel = useMemo(() => {
    const liveOfferings = fetchedOfferings
      .map((offering) => {
        const basePrice = Number(offering.basePrice ?? 0)
        const salePrice = Number(offering.salePrice ?? 0)
        const amount = Number(
          getEffectivePrice({
            basePrice,
            salePrice,
            dealStartTime: offering.dealStartTime ?? null,
            dealEndTime: offering.dealEndTime ?? null,
            effectivePrice: offering.effectivePrice == null ? undefined : Number(offering.effectivePrice),
            isDealActive: offering.isDealActive,
          }),
        )

        return {
          amount,
          currency: offering.currency ?? "SEK",
        }
      })
      .filter((entry) => Number.isFinite(entry.amount) && entry.amount > 0)

    if (liveOfferings.length > 0) {
      const lowestLiveOffering = liveOfferings.reduce((current, entry) =>
        entry.amount < current.amount ? entry : current,
      )

      return new Intl.NumberFormat(
        lowestLiveOffering.currency === "INR" ? "en-IN" : "en-US",
        {
          style: "currency",
          currency: lowestLiveOffering.currency,
          currencyDisplay: lowestLiveOffering.currency === "SEK" ? "code" : "symbol",
          maximumFractionDigits: 0,
        },
      )
        .format(lowestLiveOffering.amount)
        .replace(/\u00A0/g, " ")
    }

    const prices = service.details
      .map((detail) => detail.price?.trim() ?? "")
      .filter(Boolean)

    if (!prices.length) return "Price on request"

    const parsedPrices = prices
      .map((price) => {
        const normalized = price.replace(/\s+/g, " ")
        const currency = normalized.includes("kr") || normalized.includes("SEK")
          ? "SEK"
          : normalized.includes("₹") || normalized.includes("INR")
            ? "INR"
            : null
        const numericMatch = normalized.replace(/[^\d.,]/g, "").match(/\d[\d.,]*/)
        const amount = numericMatch ? Number(numericMatch[0].replace(/,/g, "")) : Number.NaN

        return { price: normalized, currency, amount }
      })
      .filter((entry) => Number.isFinite(entry.amount))

    if (!parsedPrices.length) return prices[0]!

    const lowest = parsedPrices.reduce((current, entry) =>
      entry.amount < current.amount ? entry : current,
    )

    if (lowest.currency === "SEK") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "SEK",
        currencyDisplay: "code",
        maximumFractionDigits: 0,
      })
        .format(lowest.amount)
        .replace(/\u00A0/g, " ")
    }

    if (lowest.currency === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(lowest.amount)
    }

    return lowest.price
  }, [fetchedOfferings, service.details])

  return (
    <article className="group flex min-h-full flex-col overflow-hidden bg-white  transition hover:-translate-y-0.5 hover">
      <div className="relative h-55 overflow-hidden">
        <img
          src={image}
          alt={service.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/22 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3765ff] ">
          {service.categoryName || "Service"}
        </span>
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.45)] backdrop-blur-sm transition ${
            wishlisted
              ? "text-rose-500"
              : "text-slate-400 hover:text-slate-500"
          }`}
          onClick={async () => {
            if (!user) {  
              navigate("/sign-in")
              return
            }
            if (wishlisted) {
              await removeWishlistItem({ serviceId: service.id })
              return
            }
            await addWishlistItem({ serviceId: service.id })
          }}
        >
          <Heart className={`h-4.5 w-4.5 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5 border-2 border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[22px] font-semibold leading-tight text-slate-900">
              {service.title}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[13px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={`rating-star-${service.id}-${index}`}
                className={`h-3.5 w-3.5 ${
                  index < Math.round(rating)
                    ? "fill-[#F5A623] text-[#F5A623]"
                    : "fill-[#E7EAF3] text-[#E7EAF3]"
                }`}
              />
            ))}
            <span className="ml-1 font-semibold text-slate-900">{rating.toFixed(1)}</span>
            <span className="text-slate-500">({reviewCount.toLocaleString()})</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[13px] text-slate-500">
          <MapPin className="h-4 w-4 shrink-0 text-black font-semibold" />
          <span className="truncate">{service.location}</span>
        </div>

        <div className="mt-5 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black">
            Starts from
          </p>
          <div className="flex items-end gap-2">
            <span className="text-[20px] font-bold text-[#1E9E5A]">
              {priceLabel}
            </span>
            {primaryDetail?.duration ? (
              <span className="pb-0.5 text-xs font-medium text-slate-500">
                / {primaryDetail.duration}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
          <button
            type="button"
            onClick={() => onViewDetails(service)}
            className="w-full  bg-[#4F7DFF] px-4 py-3 text-sm font-semibold text-white  transition hover:bg-[#3f59ff]"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onEnquiry(service)}
            className="w-full  border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Send Enquiry
          </button>
        </div>
      </div>
    </article>
  )
}
