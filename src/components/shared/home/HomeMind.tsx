import spa from "@/assets/Images/mind1.jpg";
import buffet from "@/assets/Images/mind2.jpg";
import party from "@/assets/Images/mind3.jpg";
import yoga from "@/assets/Images/mind4.jpg";
import salon from "@/assets/Images/mind5.jpg";
import event from "@/assets/Images/mind6.jpg";
import family from "@/assets/Images/family.jpg";
import { useNavigate } from "react-router-dom";
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton";

const mindItems = [
  { name: "Massage & Spa Services", image: spa, slug: "massage-spa-services" },
  {
    name: "Yoga & Meditation Classes",
    image: yoga,
    slug: "yoga-meditation-classes",
  },
  { name: "Gym & Fitness Studios", image: salon, slug: "gym-fitness-studios" },
  { name: "Cafes & Restaurants", image: buffet, slug: "cafes-restaurants" },
  {
    name: "Events Around the City",
    image: event,
    slug: "events-around-the-city",
  },
  { name: "Movie Bookings", image: party, slug: "movie-bookings" },
  {
    name: "Kids Play Areas & Activities",
    image: family,
    slug: "kids-play-areas-activities",
  },
];

export default function HomeMind() {
  const navigate = useNavigate();

  return (
    <section className="">
      <div className="mx-auto max-w-full px-2 sm:px-4">
        <h3 className="text-[32px] tracking-wide font-semibold text-black sm:text-2xl">
          Whats on your mind
        </h3>

        <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-7 sm:gap-5">
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
                <ImageWithSkeleton
                  src={item.image}
                  alt={item.name}
                  containerClassName="h-full w-full rounded-full"
                  skeletonClassName="rounded-full"
                  className="h-full w-full rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
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
  );
}
