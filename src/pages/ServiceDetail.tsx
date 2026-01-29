import { ChevronLeft, Heart, MapPin, Share2, Star } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { services } from "@/data/services"
import salon1 from "@/assets/images/salon1.png"
import salon2 from "@/assets/images/salon2.png"
import salon3 from "@/assets/images/salon3.png"


type ReviewCard = {
  id: string
  name: string
  initials: string
  role: string
  rating: number
  text: string
  date: string
  location: string
}

const reviewCards: ReviewCard[] = [
  {
    id: "review-1",
    name: "Nitya Shah",
    initials: "NS",
    role: "Wellness editor",
    rating: 5,
    text: "The team choreographed every detail—translating my tired body into a soft, glowing ritual. The facilities felt bespoke.",
    date: "Apr 22, 2025",
    location: "Birmingham, AL",
  },
  {
    id: "review-2",
    name: "Lara Bennett",
    initials: "LB",
    role: "Beauty therapist",
    rating: 4.9,
    text: "Bookended by calming lounges and curated playlists, the massage and facial pairings are a perfect unwind.",
    date: "Mar 13, 2025",
    location: "Homewood, AL",
  },
  {
    id: "review-3",
    name: "Amelia Soto",
    initials: "AS",
    role: "Studio founder",
    rating: 4.8,
    text: "Signature therapists kept my skin radiant the whole week, and the studio was spotless from lobby to treatment room.",
    date: "Jan 17, 2025",
    location: "Mountain Brook, AL",
  },
]

const metricHighlights = [
  { label: "Ambiance", value: 4.8 },
  { label: "Cleanliness", value: 4.7 },
  { label: "Service flow", value: 4.9 },
]

const starBreakdown = [
  { label: "5 ⭐", percent: 72 },
  { label: "4 ⭐", percent: 17 },
  { label: "3 ⭐", percent: 7 },
  { label: "2 ⭐", percent: 3 },
  { label: "1 ⭐", percent: 1 },
]

import { useGetVendorServicesQuery } from "@/services/vendorServicesApi"
import { useGetServiceMediaQuery } from "@/services/serviceMediaApi"
import { useGetServiceOfferingsQuery } from "@/services/vendorOfferingsApi"
import { useGetServiceReviewsQuery } from "@/services/serviceReviewsApi"

const VENDOR_ID = "e6f6ce15-ff9f-40da-b1c8-88afd9aee225"

export default function ServiceDetail() {
  const navigate = useNavigate()
  const { serviceSlug } = useParams<{ serviceSlug?: string }>()

  // 1. Fetch vendor services list (scoped by vendorId)
  const { data: vendorServices, isLoading: servicesLoading } = useGetVendorServicesQuery(VENDOR_ID)

  // Find the specific service matching the slug
  const service = vendorServices?.find((s) => s.name.toLowerCase().replace(/ /g, '-') === serviceSlug) || vendorServices?.[0]
  const serviceId = service?.id

  // 2. Fetch Media (isolated)
  const { data: media, isLoading: mediaLoading } = useGetServiceMediaQuery(serviceId ?? "", { skip: !serviceId })

  // 3. Fetch Offerings (isolated)
  const { data: offerings, isLoading: offeringsLoading } = useGetServiceOfferingsQuery(serviceId ?? "", { skip: !serviceId })

  // 4. Fetch Reviews (isolated)
  const { data: reviews, isLoading: reviewsLoading } = useGetServiceReviewsQuery(serviceId ?? "", { skip: !serviceId })

  if (servicesLoading || mediaLoading || offeringsLoading || reviewsLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!service) {
    return <div className="flex min-h-screen items-center justify-center">Service not found</div>
  }

  const galleryImages = media?.filter(m => m.type === 'IMAGE').map(m => m.signedUrl) || [salon1, salon2, salon3]


  return (
    <section className="min-h-screen bg-[#F4F6FA] py-10 text-slate-700 ">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 lg:px-8 ">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to services
        </button>
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="grid gap-6 lg:grid-cols-[0.fr_1.5fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">
                    {service.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-600">
                      <Star className="h-4 w-4" />
                      {(reviews && reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0")}
                    </div>
                    <span className="text-xs text-slate-400">
                      ({reviews?.length || 0} verified guest reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.50fr_0.9fr]">
                <div className="aspect-[4/3] w-full overflow-hidden  bg-slate-100 shadow-inner">
                  <img
                    src={galleryImages[0]}
                    alt={`${service.name} hero`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  {galleryImages.slice(1).map((image) => (
                    <div
                      key={image}
                      className="relative h-57 w-full overflow-hidden  bg-slate-100 shadow-inner"
                    >
                      <img
                        src={image}
                        alt={`${service.name} gallery`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
           <button className="absolute mt-[420px] right-96 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold shadow hover:bg-white">
          See all photos
        </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {service.status && (
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    {service.status}
                  </span>
                )}
                {service.categoryId && (
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    Category ID: {service.categoryId}
                  </span>
                )}
              </div>
            </div>

            {/* <div className="space-y-5 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-slate-600">
                  {service.location}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Curated by StadOnClick</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {service.rating.toFixed(1)} average rating
                </p>
                <p className="text-xs text-slate-400">{service.reviews} reviews</p>
              </div>
              <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Book a slot
              </button>
              <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-slate-300">
                Send enquiry
              </button>
            </div> */}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.9fr]">
          <div className="space-y-5 rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Services
                </h2>
                <p className="text-sm text-slate-500">
                  Choose a ritual that suits your mood
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-500">
                {offerings?.length || 0} packages
              </span>
            </div>
            <div className="space-y-4">
              {offerings?.map((offering) => (
                <div
                  key={offering.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {offering.name}
                    </p>
                    <p className="text-xs text-slate-500">{offering.id}</p>
                    <p className="text-xs font-semibold text-slate-400">
                      Max Qty: {offering.maxQuantity || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="text-lg font-bold text-slate-900">
                      ${offering.salePrice}
                    </span>
                    <button className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-600">
                      Reserve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5 rounded-3xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              Reviews snapshot
            </h3>
            <div className="space-y-4">
              {metricHighlights.map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{metric.label}</span>
                    <span>{metric.value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(metric.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Share the good vibes—help others find their oasis.
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
              <p className="text-sm text-slate-500">
                Guests recap their experience in the studio lounge and treatment
                rooms.
              </p>
            </div>
            <button className="text-sm font-semibold text-blue-600">
              View all {reviews?.length || 0} reviews
            </button>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {reviews?.map((review) => (
              <article
                key={review.id}
                className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-700">
                      {review.comment.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Guest
                      </p>
                      <p className="text-xs text-slate-500">Verified Visit</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Star className="h-4 w-4" />
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {review.comment}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  <span>Online Guest</span>
                </div>
              </article>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-3 rounded-2xl border border-slate-100 p-5">
              <p className="text-lg font-semibold text-slate-900">
                Customer reviews
              </p>
              <div className="flex items-center gap-3">
                <p className="text-4xl font-bold text-slate-900">
                {(reviews && reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0")}
              </p>
              <div className="flex flex-col text-sm text-slate-500">
                <span>Based on {reviews?.length || 0} reviews</span>
                <span>Let us know what stood out</span>
              </div>
              </div>
              <div className="space-y-2">
                {starBreakdown.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 text-xs font-semibold text-slate-500"
                  >
                    <span className="w-12">{row.label}</span>
                    <div className="flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span>{row.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-lg font-semibold text-slate-900">Write a review</p>
              <textarea
                placeholder="Tell fellow guests what made your visit special"
                className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus:border-blue-400 focus:outline-none"
              />
              <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Submit review
              </button>
              <p className="text-xs text-slate-400">
                Reviews are moderated before publishing.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              About the spa
            </h2>
            <span className="text-sm font-semibold text-blue-600">
              Directions
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            {service.description ??
              "An elevated wellness studio delivering tailored rituals, smart touches, and seamless reservations."}
          </p>
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <iframe
              title={`Map for ${service.name}`}
              src="https://www.openstreetmap.org/export/embed.html?bbox=-86.7551%2C33.5122%2C-86.7475%2C33.5061&layer=mapnik"
              className="h-64 w-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
