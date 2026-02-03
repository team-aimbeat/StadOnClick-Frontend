import parkImage from "@/assets/images/trending1.jpg";
import mallImage from "@/assets/images/trending2.jpg";
import marketImage from "@/assets/images/trending3.jpg";
import restaurantImage from "@/assets/images/place4.png";
import trendingBg from "@/assets/Images/trending.jpg";

const places = [
  {
    title: "Connaught Place",
    offers: "25 Offers",
    price: "Rs 119",
    image: parkImage,
  },
  {
    title: "Club Road",
    offers: "8 Offers",
    price: "Rs 159",
    image: restaurantImage,
  },
  { title: "Aerocity", offers: "6 Offers", price: "Rs 1129", image: mallImage },
  {
    title: "Ramphal Chowk Road",
    offers: "5 Offers",
    price: "Rs 199",
    image: marketImage,
  },
];

export default function HomeTrending() {
  return (
    <section className="relative mt-10 w-screen -mx-[calc((100vw-100%)/2)] py-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat "
        style={{ backgroundImage: `url(${trendingBg})` }}
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      <div className="relative">
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="mt-5 text-[28px] font-semibold text-black tracking-wide">
          Trending places near you
        </h3>
      </div>

      {/* Cards */}
      <div className="mt-5 flex justify-center">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {places.map((place) => (
            <article
              key={place.title}
              className="group relative h-95 w-full overflow-hidden rounded-3xl border border-transparent bg-white/10 shadow-lg transition duration-500 hover:-translate-y-2 hover:border-white/70 hover:shadow-2xl"
            >
              <img
                src={place.image}
                alt={place.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-transparent transition duration-500 group-hover:from-black/60 group-hover:via-black/40" />
              <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-black/40 p-3 shadow-lg transition duration-500 group-hover:bg-black/60">
                <p className="text-[18px] font-semibold tracking-wide text-white transition group-hover:text-amber-200">
                  {place.title}
                </p>
                <p className="text-[14px] text-white/80 transition group-hover:text-white">
                  {place.offers}
                </p>
                <p className="text-[11px] text-white/70 transition group-hover:text-white/90">
                  Starting from {place.price}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
