import { useMemo } from "react"
import { useParams } from "react-router-dom"

import salonImage from "@/assets/Images/salon (1).png"
import spaImage from "@/assets/Images/mind1.jpg"
import yogaImage from "@/assets/Images/mind4.jpg"
import gymImage from "@/assets/Images/wellness.jpg"
import cafeImage from "@/assets/Images/Cafe.png"
import eventImage from "@/assets/Images/event.jpg"
import movieImage from "@/assets/Images/movie.jpg"
import familyImage from "@/assets/Images/family.jpg"
import bowlingImage from "@/assets/Images/bowling.svg"
import learnImage from "@/assets/Images/learn.jpg"
import partyImage from "@/assets/Images/party.jpg"
import footballImage from "@/assets/Images/football.jpg"
import documentImage from "@/assets/Images/document.png"
import travel1 from "@/assets/Images/travel1.svg"
import travel2 from "@/assets/Images/travel2.svg"
import travel3 from "@/assets/Images/travel3.svg"
import travel4 from "@/assets/Images/travel4.svg"
import travel5 from "@/assets/Images/travel5.svg"
import travel6 from "@/assets/Images/travel6.svg"
import travelMain from "@/assets/Images/travel.jpg"

const places = {
  haircut: {
    name: "You Do You Hair Studio",
    location: "Santacruz West, Mumbai",
    rating: "4.9",
    reviews: "717",
    image: salonImage,
  },
  massage: {
    name: "Serenity Massage Studio",
    location: "Bandra West, Mumbai",
    rating: "4.8",
    reviews: "412",
    image: salonImage,
  },
  buffet: {
    name: "City Lights Buffet",
    location: "Lower Parel, Mumbai",
    rating: "4.7",
    reviews: "305",
    image: salonImage,
  },
  "party-night": {
    name: "Neon Party Lounge",
    location: "Andheri West, Mumbai",
    rating: "4.6",
    reviews: "228",
    image: salonImage,
  },
  gym: {
    name: "Peak Performance Gym",
    location: "Powai, Mumbai",
    rating: "4.8",
    reviews: "389",
    image: salonImage,
  },
  bbq: {
    name: "Smokehouse BBQ",
    location: "Juhu, Mumbai",
    rating: "4.7",
    reviews: "256",
    image: salonImage,
  },
  "massage-spa-services": {
    name: "Massage & Spa Services",
    location: "Stockholm, SE",
    rating: "4.8",
    reviews: "412",
    image: spaImage,
  },
  "yoga-meditation-classes": {
    name: "Yoga & Meditation Classes",
    location: "Stockholm, SE",
    rating: "4.9",
    reviews: "389",
    image: yogaImage,
  },
  "gym-fitness-studios": {
    name: "Gym & Fitness Studios",
    location: "Stockholm, SE",
    rating: "4.8",
    reviews: "717",
    image: gymImage,
  },
  "cafes-restaurants": {
    name: "Cafes & Restaurants",
    location: "Stockholm, SE",
    rating: "4.7",
    reviews: "305",
    image: cafeImage,
  },
  "events-around-the-city": {
    name: "Events Around the City",
    location: "Stockholm, SE",
    rating: "4.6",
    reviews: "228",
    image: eventImage,
  },
  "movie-bookings": {
    name: "Movie Bookings",
    location: "Stockholm, SE",
    rating: "4.7",
    reviews: "256",
    image: movieImage,
  },
  "kids-play-areas-activities": {
    name: "Kids Play Areas & Activities",
    location: "Stockholm, SE",
    rating: "4.8",
    reviews: "198",
    image: bowlingImage,
  },
  "kids-events": {
    name: "Kids Events",
    location: "Stockholm, SE",
    rating: "4.7",
    reviews: "164",
    image: familyImage,
  },
  "educational-hobby-classes": {
    name: "Educational & Hobby Classes",
    location: "Stockholm, SE",
    rating: "4.8",
    reviews: "142",
    image: learnImage,
  },
  "birthday-parties-decorations": {
    name: "Birthday Parties & Decorations",
    location: "Stockholm, SE",
    rating: "4.6",
    reviews: "121",
    image: partyImage,
  },
  "sports-academies-coaching": {
    name: "Sports Academies & Coaching",
    location: "Stockholm, SE",
    rating: "4.8",
    reviews: "208",
    image: footballImage,
  },
  "workshops-short-courses": {
    name: "Workshops & Short Courses",
    location: "Stockholm, SE",
    rating: "4.7",
    reviews: "176",
    image: documentImage,
  },
  "cab-services": {
    name: "Cab Services",
    location: "Stockholm, SE",
    rating: "4.6",
    reviews: "341",
    image: travel1,
  },
  "ferry-bus-train-information": {
    name: "Ferry, Bus & Train Information",
    location: "Stockholm, SE",
    rating: "4.5",
    reviews: "287",
    image: travel2,
  },
  "courier-services": {
    name: "Courier Services",
    location: "Stockholm, SE",
    rating: "4.6",
    reviews: "193",
    image: travel3,
  },
  "tourist-buses-boat-tours": {
    name: "Tourist Buses & Boat Tours",
    location: "Stockholm, SE",
    rating: "4.7",
    reviews: "219",
    image: travel4,
  },
  "tourist-activities-attractions": {
    name: "Tourist Activities & Attractions",
    location: "Stockholm, SE",
    rating: "4.8",
    reviews: "264",
    image: travel5,
  },
  "museums-exhibitions": {
    name: "Museums & Exhibitions",
    location: "Stockholm, SE",
    rating: "4.9",
    reviews: "302",
    image: travel6,
  },
  "places-to-visit-near-city": {
    name: "Places to Visit Near the City",
    location: "Stockholm, SE",
    rating: "4.8",
    reviews: "178",
    image: travelMain,
  },
} as const

const services = [
  {
    name: "Haircut with Dwyesh (FOR PIXIE / BUZZER CUTS)",
    duration: "1 hr",
    price: "Rs 2,000",
  },
  {
    name: "Haircut with Nikita (FOR NAPE AND LONGER)",
    duration: "1 hr",
    price: "Rs 2,500",
  },
  {
    name: "Haircut with Dwyesh (FOR NAPE AND LONGER)",
    duration: "1 hr",
    price: "Rs 2,500",
  },
]

export default function PlaceDetail() {
  const { slug } = useParams()

  const place = useMemo(() => {
    if (slug && slug in places) {
      return places[slug as keyof typeof places]
    }

    return places.haircut
  }, [slug])

  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="h-56 w-full overflow-hidden">
            <img
              src={place.image}
              alt={place.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-start justify-between gap-4 px-4 pb-2 pt-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {place.name}
              </h3>
              <p className="text-sm text-slate-500">{place.location}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 fill-[#f59e0b]"
              >
                <path d="M12 2.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 2.5z" />
              </svg>
              <span>{place.rating}</span>
              <span className="text-slate-400">({place.reviews})</span>
            </div>
          </div>

          <div className="space-y-3 px-4 pb-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="rounded-xl bg-slate-50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {service.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {service.duration}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {service.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-6">
            <button
              type="button"
              className="text-sm font-semibold text-blue-600"
            >
              See all 50 services
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
