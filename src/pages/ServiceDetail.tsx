import { BadgeCheck, BadgeCheckIcon, Check, ChevronLeft, Heart, MapPin, Share2, Star } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { services } from "@/data/services"
import salon1 from "@/assets/images/salon1.png"
import salon2 from "@/assets/images/salon2.png"
import salon3 from "@/assets/images/salon3.png"
import verify from "@/assets/images/check_in.png"


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
import { useGetServiceReviewsQuery, useCreateReviewMutation } from "@/services/serviceReviewsApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LocationMap } from "@/components/marketplace/Map/LocationMap"

const VENDOR_ID = "e6f6ce15-ff9f-40da-b1c8-88afd9aee225"

export default function ServiceDetail() {
  const navigate = useNavigate()
  const { serviceSlug } = useParams<{ serviceSlug?: string }>()

  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [hoverRating, setHoverRating] = useState(0)

  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation()

  // 1. Fetch vendor services list (scoped by vendorId)
  const { data: vendorServices, isLoading: servicesLoading } = useGetVendorServicesQuery(VENDOR_ID)

  // Find the specific service matching the slug
  const service = vendorServices?.find((s) => s.name.toLowerCase().replace(/ /g, '-') === serviceSlug) || vendorServices?.[0]
  const serviceId = service?.id

  // 2. Fetch Media (isolated)
  const { data: media, isLoading: mediaLoading } = useGetServiceMediaQuery(serviceId ?? "", { skip: !serviceId })

  // 3. Fetch Offerings (isolated)
  const { data: offerings, isLoading: offeringsLoading } = useGetServiceOfferingsQuery(serviceId ?? "", { skip: !serviceId })

  const { data: reviews, isLoading: reviewsLoading } = useGetServiceReviewsQuery(serviceId ?? "", { skip: !serviceId })

  const handleSubmitReview = async () => {
    if (!serviceId) return
    if (userRating === 0) {
      alert("Please select a rating")
      return
    }
    if (!userComment.trim()) {
      alert("Please enter a comment")
      return
    }

    try {
      await createReview({
        serviceId,
        rating: userRating,
        comment: userComment,
      }).unwrap()
      setUserRating(0)
      setUserComment("")
      alert("Review submitted successfully!")
    } catch (err) {
      console.error("Failed to submit review:", err)
      alert("Failed to submit review. Please try again.")
    }
  }

  if (servicesLoading || mediaLoading || offeringsLoading || reviewsLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!service) {
    return <div className="flex min-h-screen items-center justify-center">Service not found</div>
  }

  const galleryImages = media?.filter(m => m.type === 'IMAGE').map(m => m.signedUrl) || [salon1, salon2, salon3]


  return (
    <section className="min-h-screen bg-[#F4F6FA] py-4 text-slate-700 ">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 lg:px-8 ">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to services
        </button>
        <div className="rounded-3xl bg-white p-8 ">
          <div className="grid gap-6 lg:grid-cols-[0.fr_1.5fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">
                    {service.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-black">
                    <div className="flex items-center gap-1 rounded-full px-3 py-1 font-bold ">
                      <Star className="h-4 w-4 fill-[#F4D62F] text-[#F4D62F] " />
                      {(reviews && reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0")}
                    </div>
                    <span className="text-xs text-black">
                      ({reviews?.length || 0}+ verified guest reviews)
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
                <div className="aspect-4/3 w-full overflow-hidden  bg-slate-100 shadow-inner">
                  <img
                    src={galleryImages[0]}
                    alt={`${service.name} hero`}
                    className="h-full w-full  rounded-2xl"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  {galleryImages.slice(1).map((image) => (
                    <div
                      key={image}
                      className="relative h-57 w-full overflow-hidden  bg-slate-100 "
                    >
                      <img
                        src={image}
                        alt={`${service.name} gallery`}
                        className="h-full w-full object-cover rounded-2xl"
                      />
                    </div>
                  ))}
           <button className="absolute mt-105 right-96 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold shadow hover:bg-white">
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
                {/* {service.category && (
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    Category ID: {service.category.id}
                  </span>
                )} */}
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

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5 rounded-3xl bg-white p-8 ">
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
                    <button className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600">
                      Reserve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

       <div className="space-y-5 rounded-3xl bg-white max-w-[600px] p-8">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold text-slate-900">
      About the spa
    </h2>

    <a
      href={`https://www.google.com/maps?q=${service.latitude},${service.longitude}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm  font-semibold text-blue-600 hover:underline"
    >
      Directions
    </a>
  </div>

  <LocationMap
    lat={19.136326}

    lng={72.827660}
    name={service.name}
  />
</div>
       
        </div>

<div className="max-w-[800px]">
          {/* Highlights & Amenities Section */}
          <div className="space-y-6 rounded-3xl bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-900">Highlights & Amenities</h2>
            <div className="flex flex-wrap gap-4">
              {["AC Rooms", "Parking Available", "Family Friendly"].map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[15px] font-medium text-slate-700">{amenity}</span>
                </div>
              ))}
            </div>
         
             {/* Menu Preview Section */}
        <div className="space-y-4 rounded-3xl bg-white p-8">
          <h3 className="text-xl font-bold text-slate-900">Menu Preview</h3>
          <p className="text-sm text-slate-500">View uploaded menu photos from the restaurant</p>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[100px] shrink-0">
                <img
                  src={galleryImages[i % galleryImages.length]}
                  alt={`Menu preview ${i}`}
                  className="h-48 w-full rounded-2xl object-cover"
                />
              </div>
            ))}
          </div>
        </div>
  
         </div>


        </div>


<div className="max-w-[800px]">
              {/* Trust/Feature Banner */}
          <div className="rounded-3xl bg-white p-8">
            <div className="grid grid-cols-4 gap-8">
              {[
                {
                  icon: <BadgeCheck  className="h-6 w-6 text-emerald-500" />,
                  title: "Verified Providers",
                  desc: "Trusted & quality-checked",
                },
                {
                  icon: (
                    <svg
                      className="h-6 w-6 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                  title: "Secure Payments",
                  desc: "Protected transactions",
                },
                {
                  icon: (
                    <svg
                      className="h-6 w-6 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Easy Rescheduling",
                  desc: "Change plans easily",
                },
                {
                  icon: (
                    <svg
                      className="h-6 w-6 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ),
                  title: "Customer Support",
                  desc: "We're here to help",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[12px] text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
</div>
        

        <div className="space-y-5 rounded-3xl bg-white p-8 ">
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
                className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                    {review.comment.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold text-slate-900">
                        Ananya R.
                      </p>
                      <Badge variant="outline" className="flex items-center gap-1 border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50">
                        <Check className="h-3 w-3 stroke-[3px]" />
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= review.rating
                              ? "fill-orange-400 text-orange-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600">
                  {review.comment}
                </p>
                <div className="text-[13px] font-medium text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </article>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.0fr_0.9fr]">
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
            <div className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Write a Review</h3>
                <p className="text-sm font-medium text-slate-500">Your rating</p>
              </div>
              
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || userRating)
                          ? "fill-orange-400 text-orange-400"
                          : "text-orange-400"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Tell fellow guests what made your visit special"
                className="min-h-35 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus:border-blue-400 focus:outline-none"
              />

              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className=""
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>



      </div>
    </section>
  )
}
