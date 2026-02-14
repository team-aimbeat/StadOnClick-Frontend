import { useNavigate } from "react-router-dom"
import buffetImage from "@/assets/Images/buffet.svg"
import salonImage from "@/assets/Images/spa.svg"
import spaImage from "@/assets/Images/salon.svg"
import partyImage from "@/assets/Images/party.svg"
import activityImage from "@/assets/Images/hotel.svg"
import green from "@/assets/images/green.png"
import pink from "@/assets/images/pink.png"
import blue from "@/assets/images/blue.png"
import purple from "@/assets/images/purple.png"
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton"
import { motion } from "framer-motion"


const offerCards = [
  {
    title: "Buffet",
    subtitle: "Offers from",
    price: "₹249",
    image: buffetImage,
    bgImage: green,
    slug: "buffet-deals",
  },
  {
    title: "Salon",
    subtitle: "Offers from",
    price: "₹249",
    image: salonImage,
    bgImage: pink,
    slug: "salon-deals",
  },
  {
    title: "Spa",
    subtitle: "Offers from",
    price: "₹249",
    image: spaImage,
    bgImage: blue,
    slug: "spa-deals",
  },
  {
    title: "Party",
    subtitle: "Offers from",
    price: "₹249",
    image: partyImage,
    bgImage: purple,
    slug: "party-deals",
  },
  {
    title: "Hotels",
    subtitle: "Offers from",
    price: "₹249",
    image: activityImage,
    bgImage: green,
    slug: "hotel-deals",
  },
]

export default function HomeDiscount() {
  const navigate = useNavigate()
  return (
    <div className="space-y-10 text-start">
      <section className=" max-w-387.5">
<h2 className="relative inline-block text-start text-[26px] sm:text-3xl lg:text-3xl font-semibold text-gray-900 group">
  Grab the Best Deals Today

</h2>





        <div className="mt-5 flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:justify-items-center lg:gap-10 lg:overflow-visible">
          {offerCards.map((card) => (
         <article
  key={card.title}
  className="relative h-[230px] min-w-[280px] overflow-hidden rounded-3xl text-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
  style={{ backgroundImage: `url(${card.bgImage})`, backgroundSize: "cover" }}
  role="button"
  tabIndex={0}
  onClick={() => navigate(`/marketplace?category=${card.slug}`)}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      navigate(`/marketplace?category=${card.slug}`)
    }
  }}
>

  {/* Content Wrapper */}
  <div className="relative z-10 p-5 h-full flex flex-col justify-between">

    {/* Top Text */}
    <div>
      <p className="text-[20px] font-bold tracking-wide ">{card.title}</p>
      <p className="text-[16px] opacity-90">{card.subtitle}</p>
      <p className="mt-1 text-lg font-bold">{card.price}</p>
    </div>

    {/* Arrow */}
    <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 text-sm">
      →
    </div>

  </div>

  {/* EDGE-TO-EDGE IMAGE */}
 <div className="absolute bottom-3 left-3 right-3">
  <ImageWithSkeleton
    src={card.image}
    alt={card.title}
    containerClassName="w-full h-[200px]"
    className="w-full h-full object-cover"
    loading="lazy"
    decoding="async"
  />
</div>

</article>

          ))}
        </div>
      </section>
    </div>
  )
}
