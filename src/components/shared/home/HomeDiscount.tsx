import buffetImage from "@/assets/Images/buffet.svg"
import salonImage from "@/assets/Images/spa.svg"
import spaImage from "@/assets/Images/salon.svg"
import partyImage from "@/assets/Images/party.svg"
import activityImage from "@/assets/Images/hotel.svg"
import green from "@/assets/images/green.png"
import pink from "@/assets/images/pink.png"
import blue from "@/assets/images/blue.png"
import purple from "@/assets/images/purple.png"


const offerCards = [
  {
    title: "Buffet",
    subtitle: "Offers from",
    price: "₹249",
    image: buffetImage,
    bgImage: green,
  },
  {
    title: "Salon",
    subtitle: "Offers from",
    price: "₹249",
    image: salonImage,
    bgImage: pink,
  },
  {
    title: "Spa",
    subtitle: "Offers from",
    price: "₹249",
    image: spaImage,
    bgImage: blue,
  },
  {
    title: "Party",
    subtitle: "Offers from",
    price: "₹249",
    image: partyImage,
    bgImage: purple,
  },
  {
    title: "Hotels",
    subtitle: "Offers from",
    price: "₹249",
    image: activityImage,
    bgImage: green,
  },

   

]

export default function HomeDiscount() {
  return (
    <div className="space-y-10 text-start">
      <section className="mt-2">
        <h2 className="text-[28px] font-semibold text-slate-800 text-start mb-4 -tracking-tight">
          Save big across services
        </h2>


        <div className="mt-5 flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:justify-items-center lg:gap-10 lg:overflow-visible">
          {offerCards.map((card) => (
            <article
              key={card.title}
              className="relative h-[186px] min-w-[225px] overflow-hidden rounded-3xl bg-cover bg-center p-3 text-left text-white shadow-md"
              style={{ backgroundImage: `url(${card.bgImage})` }}
            >
              <div className="relative z-10">
                <p className="text-xl tracking-wider font-semibold">{card.title}</p>
                <p className="text-[12px] text-white font-medium">
                  {card.subtitle}
                </p>
                <p className="mt-1 text-sm font-semibold">{card.price}</p>
              </div>

              <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/60 text-xs">
                →
              </div>
              <div className="absolute h-[97px] overflow-hidden -ml-1">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-[104px] w-[205px] object-cover"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
