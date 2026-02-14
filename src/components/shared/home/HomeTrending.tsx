import parkImage from "@/assets/images/trending1.jpg";
import mallImage from "@/assets/images/trending2.jpg";
import marketImage from "@/assets/images/trending3.jpg";
import restaurantImage from "@/assets/images/place4.png";
import trendingBg from "@/assets/Images/trending.jpg";
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton";

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
   <section className="relative mt-16 w-screen -mx-[calc((100vw-100%)/2)] py-16">

  {/* Background */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: `url(${trendingBg})` }}
  />
  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

  {/* Shared Container */}
  <div className="relative max-w-380 mx-auto px-6">

    {/* Heading */}
    <div className="mb-10">
    <h3 className="relative inline-block text-3xl font-semibold text-slate-900 tracking-wide">
  Elevated Experiences Nearby
  <span className="absolute left-0 -bottom-2 h-[3px] w-16 bg-slate-900 rounded-full"></span>
</h3>

    </div>

    {/* Cards Grid (Same Container) */}
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

      {places.map((place) => (
        <article
          key={place.title}
          className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:shadow-xl hover:-translate-y-2"
        >
          <div className="h-72 overflow-hidden">
            <ImageWithSkeleton
              src={place.image}
              alt={place.title}
              containerClassName="h-full w-full"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="p-5">
            <h4 className="text-xl font-semibold text-slate-900">
              {place.title}
            </h4>
            <p className="mt-1 text-lg text-slate-500">
              {place.offers}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              Starting from {place.price}
            </p>
          </div>
        </article>
      ))}

    </div>

  </div>
</section>

  );
}

