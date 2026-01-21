import buffetImage from "@/assets/Images/buffet.svg"
import salonImage from "@/assets/Images/spa.svg"
import spaImage from "@/assets/Images/salon.svg"
import partyImage from "@/assets/Images/party.svg"
import activityImage from "@/assets/Images/hotel.svg"

const offerCards = [
  {
    title: "Buffet",
    subtitle: "Offers from",
    price: "₹249",
    image: buffetImage,
    color: "bg-[#1fa260]",
  },
  {
    title: "Salon",
    subtitle: "Offers from",
    price: "₹249",
    image: salonImage,
    color: "bg-[#1f6fb6]",
  },
  {
    title: "Spa",
    subtitle: "Offers from",
    price: "₹249",
    image: spaImage,
    color: "bg-[#a7b11a]",
  },
  {
    title: "Party",
    subtitle: "Offers from",
    price: "₹249",
    image: partyImage,
    color: "bg-[#7b77d6]",
  },
  {
    title: "Hotels",
    subtitle: "Offers from",
    price: "₹249",
    image: activityImage,
    color: "bg-[#ef635a]",
  },

   

]

export default function HomeDiscount() {
  return (
    <section className="mt-10  text-start lg:px-1">
      <h2 className="text-[28px] font-normal text-black">
          Save big across services
        </h2>


      <div className="mt-5  flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:justify-items-center lg:gap-10 lg:overflow-visible ">
        {offerCards.map((card) => (
          <article
            key={card.title}
            className={`relative min-w-[215px] h-[215px] overflow-hidden rounded-3xl ${card.color} p-3 text-left text-white shadow-md`}
          >
            <div className="relative z-10">
              <p className="text-base font-semibold">{card.title}</p>
              <p className="text-[11px] text-white/90">{card.subtitle}</p>
              <p className="mt-1 text-xs font-semibold">{card.price}</p>
            </div>
          
            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/60 text-xs">
              →
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[220px] overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="h-full w-full object-cover"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
