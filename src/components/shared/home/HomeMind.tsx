import spa from "@/assets/Images/mind1.svg"
import buffet from "@/assets/Images/mind2.svg"
import party from "@/assets/Images/mind3.svg"
import yoga from "@/assets/Images/mind4.svg"
import salon from "@/assets/Images/mind5.svg"
import event from "@/assets/Images/mind6.svg"
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
      <div className="mx-auto max-w-full px-2 sm:px-4 ">
      <h3 className="text-[32px] font-medium text-black sm:text-2xl">
          Whats on your mind
        </h3>
        <div className="mt-6 grid grid-cols-3 gap-15 sm:grid-cols-7">
          {mindItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => navigate(`/place/${item.slug}`)}
              className="text-center"
            >
              <div className="mx-auto flex h-[145px] w-[145px] items-center justify-center rounded-full bg-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-[145px] w-[145px] rounded-full object-cover"
                />
              </div>
              <p className="mt-3 text-[17px] font-semibold text-">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
