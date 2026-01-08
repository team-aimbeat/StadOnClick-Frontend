import footballImage from "@/assets/images/football.jpg"
import cricketImage from "@/assets/images/cricket.jpg"
import badmintonImage from "@/assets/images/batminton.jpg"
import tennisImage from "@/assets/images/tennis.jpg"

const cards = [
  { title: "Massage", price: "799", image: footballImage },
  { title: "Dinner Buffets", price: "1199", image: cricketImage },
  { title: "Lunch Buffets", price: "799", image: badmintonImage },
  { title: "Party Nights", price: "999", image: tennisImage },
    { title: "Party Nights", price: "999", image: tennisImage },

  // { title: "Haircuts", price: "99", image: cricketImage },
  // { title: "Barbeque Buffets", price: "999", image: footballImage },
]

export default function HomeBrowse() {
  return (
    <section className="mt-12">
      <h2 className="text-center text-2xl font-semibold">
        Next Thing On Your Mind
      </h2>

      <div className="relative mt-6">
      

        <div className="flex justify-center gap-5 overflow-x-auto pb-2">
          {cards.map((card) => (
            <div key={card.title} className="w-64 shrink-0 text-center">
              <div className="overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-36 w-full object-cover sm:h-40"
                />
              </div>
              <p className="mt-3 text-base font-semibold text-slate-900">
                {card.title}
              </p>
              <p className="text-sm text-slate-500">under Rs {card.price}</p>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  )
}
