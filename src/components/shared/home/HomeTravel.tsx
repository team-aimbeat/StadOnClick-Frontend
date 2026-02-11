import spa from "@/assets/Images/travel1.svg";
import buffet from "@/assets/Images/travel2.svg";
import party from "@/assets/Images/travel3.svg";
import yoga from "@/assets/Images/travel4.svg";
import salon from "@/assets/Images/travel5.svg";
import event from "@/assets/Images/travel6.svg";
import travelMain from "@/assets/Images/travel.jpg";
import bowling from "@/assets/Images/bowling.svg";
import kidsEvent from "@/assets/Images/event.jpg";
import partyIcon from "@/assets/Images/party.svg";
import learn from "@/assets/Images/learn.jpg";
import football from "@/assets/Images/football.jpg";
import document from "@/assets/Images/document.png";
import { useNavigate } from "react-router-dom";
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton";

const mindItems = [
  { name: "Cab Services", image: spa, slug: "cab-services" },
  {
    name: "Ferry, Bus & Train Information",
    image: buffet,
    slug: "ferry-bus-train-information",
  },
  { name: "Courier Services", image: party, slug: "courier-services" },
  { name: "Tourist Buses & Boat Tours", image: yoga, slug: "tourist-buses-boat-tours" },
  {
    name: "Tourist Activities & Attractions",
    image: salon,
    slug: "tourist-activities-attractions",
  },
  { name: "Museums & Exhibitions", image: event, slug: "museums-exhibitions" },
  { name: "Places to Visit Near the City", image: travelMain, slug: "places-to-visit-near-city" },
];

const kidsFamilyItems = [
  { name: "Kids Events", image: kidsEvent, slug: "kids-events" },
  { name: "Kids Play Areas & Activities", image: bowling, slug: "kids-play-areas-activities" },
  { name: "Educational & Hobby Classes", image: learn, slug: "educational-hobby-classes" },
  { name: "Birthday Parties & Decorations", image: partyIcon, slug: "birthday-parties-decorations" },
  { name: "Sports Academies & Coaching", image: football, slug: "sports-academies-coaching" },
  { name: "Workshops & Short Courses", image: document, slug: "workshops-short-courses" },
];

export default function HomeTravel() {
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
                className="mx-auto flex h-36.75 w-36.75 items-center justify-center
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

        <div className="mt-12">
          <h3 className="text-[32px] font-semibold text-black sm:text-2xl tracking-wide">
            Popular for Kids &amp; Family
          </h3>
          <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-6">
            {kidsFamilyItems.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => navigate(`/place/${item.slug}`)}
                className="group text-center"
              >
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
      </div>
    </section>
  );
}
