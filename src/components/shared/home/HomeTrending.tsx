import parkImage from "@/assets/images/place1.png";
import mallImage from "@/assets/images/place2.png";
import marketImage from "@/assets/images/place3.png";
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
    <section className="relative mt-10 h-[612px] w-screen -mx-[calc((100vw-100%)/2)] py-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat "
        style={{ backgroundImage: `url(${trendingBg})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="relative">
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="mt-5 text-[28px] font-semibold text-black tracking-wide">
          Trending places near you
        </h3>
      </div>

      {/* Cards */}
      <div className="mt-5 flex justify-center">
        <div className="flex gap-10 overflow-x-auto">
          {places.map((place) => (
            <article
              key={place.title}
              className="relative h-[380px] w-[275px] flex-shrink-0 overflow-hidden  border-0 border-white"
            >
              <img
                src={place.image}
                alt={place.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-[18px] font-semibold tracking-wide">{place.title}</p>
                <p className="text-[14px] text-white">{place.offers}</p>
                <p className="text-[11px] text-white/80">
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
