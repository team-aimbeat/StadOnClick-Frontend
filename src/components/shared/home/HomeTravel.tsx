import { useNavigate } from "react-router-dom";

import spa from "@/assets/Images/travel1.svg";
import estate from "@/assets/Images/travel2.svg";
import marina from "@/assets/Images/travel3.svg";
import gastronomy from "@/assets/Images/travel4.svg";
import events from "@/assets/Images/travel5.svg";
import security from "@/assets/Images/travel6.svg";
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton";

const domainItems = [
  { name: "Wellness", image: spa, slug: "wellness" },
  { name: "Estates", image: estate, slug: "estates" },
  { name: "Marine", image: marina, slug: "marine" },
  { name: "Gastronomy", image: gastronomy, slug: "gastronomy" },
  { name: "Events", image: events, slug: "events" },
  { name: "Security", image: security, slug: "security" },
];

export default function HomeTravel() {
  const navigate = useNavigate();

  return (
    <section className="relative py-10 sm:py-14">
      <div className=" px-4">
        <div className=" max-w-9xl rounded-[2.25rem] border border-white/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-10 shadow-[0_30px_80px_-42px_rgba(79,70,229,0.28)] sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Explore by Domain
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Explore by Domain
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Seamlessly navigate the world of high-end utility and leisure through our specialized service categories.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
            {domainItems.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => navigate(`/place/${item.slug}`)}
                className="group flex flex-col items-center rounded-[1.5rem] bg-white px-4 py-6 text-center shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-28px_rgba(15,23,42,0.3)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition duration-300 group-hover:bg-blue-200">
                  <ImageWithSkeleton
                    src={item.image}
                    alt={item.name}
                    containerClassName="h-7 w-7"
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-900">{item.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
