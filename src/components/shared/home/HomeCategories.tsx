import Restro from "@/assets/Images/hotel.jpg"
import hotel from "@/assets/Images/hotel2.jpg"
import beauty from "@/assets/Images/beauty.jpg"
import party from "@/assets/Images/party.jpg"

const categories = [
  { name: "Restaurants", image: Restro },
  { name: "Hotel", image: hotel },
  { name: "Beauty", image: beauty },
  { name: "Party", image: party },
  { name: "Salon", image: beauty },
]

export default function HomeCategories() {
  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#dad6d6] overflow-hidden">
      
      {/* HALF BACKGROUND */}
      {/* <div className="absolute inset-x-0 top-0 h-[100%] bg-[#f4f5de]" /> */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
          <h2 className="text-[28px] font-bold text-black text-center mb-3">
          Services Made Easy
        </h2>
        {/* PARAGRAPH */}
        <p className="max-w-2xl mx-auto text-center text-[17px] text-slate-600 mb-10">
          Discover and book top-rated services around you from restaurants and hotels
          to beauty, parties, and salons all in one place.
        </p>

       <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
  {categories.map((category) => (
    <div
      key={category.name}
      className="w-[222px] h-[273px] bg-white  shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 mx-auto flex flex-col"
    >
      {/* IMAGE CENTERED */}
      <div className="flex items-center justify-center h-[224px] mt-2">
        <img
          src={category.image}
          alt={category.name}
          className="w-[207px] h-[224px] object-cover"
        />
      </div>

      {/* TITLE */}
      <p className="px-2 py-2 text-sm font-semibold text-slate-700 text-center">
        {category.name}
      </p>
    </div>
  ))}
</div>

      </div>
    </section>
  )
}
