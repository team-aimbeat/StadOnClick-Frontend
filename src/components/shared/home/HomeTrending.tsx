import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import parkImage from "@/assets/images/trending1.jpg";
import mallImage from "@/assets/images/trending2.jpg";
import marketImage from "@/assets/images/trending3.jpg";
import restaurantImage from "@/assets/images/place4.png";
import trendingBg from "@/assets/Images/trending.jpg";
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton";

type TrendingCard = {
  title: string;
  offers: string;
  price: string;
  image: string;
  link: string;
};

type HomeTrendingContent = {
  heading: string;
  backgroundImage: string;
  places: TrendingCard[];
};

type HomeTrendingProps = {
  content?: Partial<HomeTrendingContent>;
};

const TRENDING_CARD_COUNT = 4;

const fallbackPlaces: TrendingCard[] = [
  {
    title: "Connaught Place",
    offers: "25 Offers",
    price: "Rs 119",
    image: parkImage,
    link: "/marketplace?place=connaught-place",
  },
  {
    title: "Club Road",
    offers: "8 Offers",
    price: "Rs 159",
    image: restaurantImage,
    link: "/marketplace?place=club-road",
  },
  {
    title: "Aerocity",
    offers: "6 Offers",
    price: "Rs 1129",
    image: mallImage,
    link: "/marketplace?place=aerocity",
  },
  {
    title: "Ramphal Chowk Road",
    offers: "5 Offers",
    price: "Rs 199",
    image: marketImage,
    link: "/marketplace?place=ramphal-chowk-road",
  },
];

const fallbackContent: HomeTrendingContent = {
  heading: "Elevated Experiences Nearby",
  backgroundImage: trendingBg,
  places: fallbackPlaces,
};

export default function HomeTrending({ content }: HomeTrendingProps) {
  const navigate = useNavigate();
  const merged = useMemo<HomeTrendingContent>(() => {
    const rawPlaces = Array.isArray(content?.places) ? content.places : [];
    const places = Array.from({ length: TRENDING_CARD_COUNT }, (_, index) => {
      const fallback = fallbackPlaces[index];
      const raw = rawPlaces[index] ?? {};
      return {
        title: String(raw.title ?? "").trim() || fallback.title,
        offers: String(raw.offers ?? "").trim() || fallback.offers,
        price: String(raw.price ?? "").trim() || fallback.price,
        image: String(raw.image ?? "").trim() || fallback.image,
        link: String(raw.link ?? "").trim() || fallback.link,
      };
    });

    return {
      heading: String(content?.heading ?? "").trim() || fallbackContent.heading,
      backgroundImage: String(content?.backgroundImage ?? "").trim() || fallbackContent.backgroundImage,
      places,
    };
  }, [content]);

  const handleNavigate = useCallback(
    (link: string) => {
      navigate(link);
    },
    [navigate],
  );
  return (
    <section className="relative mt-16 w-screen -mx-[calc((100vw-100%)/2)] py-16">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${merged.backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      {/* Shared Container */}
      <div className="relative max-w-380 mx-auto px-6">
        {/* Heading */}
        <div className="mb-10">
          <h3 className="relative inline-block text-3xl font-semibold text-slate-900 tracking-wide">
            {merged.heading}
            <span className="absolute left-0 -bottom-2 h-[3px] w-16 bg-slate-900 rounded-full"></span>
          </h3>
        </div>
        {/* Cards Grid (Same Container) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {merged.places.map((place) => (
            <article
              key={place.title}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:shadow-xl hover:-translate-y-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
              role="button"
              tabIndex={0}
              onClick={() => handleNavigate(place.link)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleNavigate(place.link);
                }
              }}
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
                <h4 className="text-xl font-semibold text-slate-900">{place.title}</h4>
                <p className="mt-1 text-lg text-slate-500">{place.offers}</p>
                <p className="mt-2 text-sm font-medium text-slate-700">Starting from {place.price}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

