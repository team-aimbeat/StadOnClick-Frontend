import spa from "@/assets/Images/travel1.svg";
import buffet from "@/assets/Images/travel2.svg";
import party from "@/assets/Images/travel3.svg";
import yoga from "@/assets/Images/travel3.svg";
import salon from "@/assets/Images/travel4.svg";
import event from "@/assets/Images/travel5.svg";
import { useNavigate } from "react-router-dom";

const mindItems = [
  { name: "Airport Transfers", image: spa, slug: "Airport Transfers" },
  { name: "Cab Services", image: buffet, slug: "Cab Services" },
  { name: "Bus", image: party, slug: "Bus" },
  { name: "Ferry", image: yoga, slug: "Ferry" },
  { name: "Train Tickets", image: salon, slug: "Train Tickets" },
  { name: "City Cab", image: event, slug: "City Cab" },
  { name: "Buffet", image: buffet, slug: "buffet" },
];

export default function HomeMind() {
  const navigate = useNavigate();

  return (
    <section className="mt-8">
      <div className="mx-auto max-w-full px-2 sm:px-4 mb-10">
        <h3 className="text-[32px] font-semibold text-black sm:text-2xl tracking-wide">
          Popular in travel
        </h3>
      
        <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-7">
          {mindItems.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => navigate(`/place/${item.slug}`)}
              className="group text-center"
            >
              {/* Circle with WHITE BORDER */}
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
  );
}
