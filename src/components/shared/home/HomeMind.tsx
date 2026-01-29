import spa from "@/assets/Images/mind1.jpg"
import buffet from "@/assets/Images/mind2.jpg"
import party from "@/assets/Images/mind3.jpg"
import yoga from "@/assets/Images/mind4.jpg"
import salon from "@/assets/Images/mind5.jpg"
import event from "@/assets/Images/mind6.jpg"
import { useNavigate } from "react-router-dom"

const mindItems = [
  { name: "Massage", image: spa, slug: "massage" },
  { name: "Buffet", image: buffet, slug: "buffet" },
  { name: "Party night", image: party, slug: "party-night" },
  { name: "Gym", image: yoga, slug: "gym" },
  { name: "Haircut", image: salon, slug: "haircut" },
  { name: "BBQ", image: event, slug: "bbq" },
  { name: "Buffet", image: buffet, slug: "buffet" },
]

export default function HomeMind() {
  const navigate = useNavigate()

  return (
    <section className="mt-8">
      <div className="mx-auto max-w-full px-2 sm:px-4">
        <h3 className="text-[32px] tracking-wide font-semibold text-black sm:text-2xl">
          Whats on your mind
        </h3>

        <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-7">
          {mindItems.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => navigate(`/place/${item.slug}`)}
              className="group text-center"
            >
              {/* Circle with WHITE border */}
              <div
                className="mx-auto flex h-[147px] w-[147px] items-center justify-center
                           rounded-full 
                           shadow-md transition-transform duration-300
                           group-hover:scale-105"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <p className="mt-3 text-[17px] font-semibold text-black">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
