import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import banner1 from "@/assets/Images/banner1.png";
import banner2 from "@/assets/Images/banner2.png";
import banner3 from "@/assets/Images/banner3.png";

const searchCategories = [
  { label: "Wellness", slug: "spa-deals" },
  { label: "Personal Chef", slug: "buffet-deals" },
  { label: "Home Office", slug: "home-office" },
  { label: "Concierge Choice", slug: "new-deals" },
];

const popularChips = [
  { label: "Wellness", slug: "spa-deals" },
  { label: "Personal Chef", slug: "buffet-deals" },
  { label: "Home Office", slug: "home-office" },
  { label: "Concierge Choice", slug: "new-deals" },
];

const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad"];

type HomeHeroProps = {
  heading?: string;
  subheading?: string;
  banners?: string[];
  popularChips?: Array<{ label: string; slug: string }>;
};

export default function HomeHero({ heading, subheading, banners: dynamicBanners, popularChips: dynamicPopularChips }: HomeHeroProps) {
  const navigate = useNavigate();
  const [location] = useState(locations[0]);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const safePopularChips = useMemo(() => {
    const incoming = Array.isArray(dynamicPopularChips)
      ? dynamicPopularChips.filter((chip) => chip?.label && chip?.slug)
      : [];
    return incoming.length > 0 ? incoming : popularChips;
  }, [dynamicPopularChips]);

  const safeBanners = useMemo(() => {
    const fallback = [banner1, banner2, banner3];
    const incoming = Array.isArray(dynamicBanners)
      ? dynamicBanners.filter((item) => String(item ?? "").trim())
      : [];
    const source = incoming.length > 0 ? incoming : fallback;
    return Array.from({ length: 3 }, (_, index) => source[index % source.length]);
  }, [dynamicBanners]);

  useEffect(() => {
    if (safeBanners.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeBanners.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [safeBanners]);

  const categoryLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    searchCategories.forEach((item) => lookup.set(item.label.toLowerCase(), item.slug));
    return lookup;
  }, []);

  const handleSearch = () => {
    const normalized = query.trim().toLowerCase();
    const directMatch = categoryLookup.get(normalized);
    const partialMatch = searchCategories.find((item) => item.label.toLowerCase().includes(normalized));
    const target = directMatch ?? partialMatch?.slug ?? "new-deals";
    navigate(`/services/${target}`, { state: { location, query } });
  };

  const headline = heading?.trim() || "Discover Services. Book Instantly.";
  const [headlineLeft, headlineRight] = headline.includes(".")
    ? headline.split(".").map((part) => part.trim()).filter(Boolean)
    : [headline, "Book Instantly."];

  return (
    <section className="relative overflow-hidden bg-[#efe9ff] px-4 py-14 sm:px-6 lg:px-8 lg:py-16 relative w-screen -mx-[calc((100vw-100%)/2)] py-10 sm:py-14">
      {safeBanners.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
      ))}
      <div className="absolute inset-0 " />

      <div className="relative mx-auto w-full max-w-[1100px] rounded-[2.5rem] border border-white/60 bg-white/60 px-5 py-10 shadow-[0_30px_90px_-50px_rgba(76,29,149,0.28)] backdrop-blur-sm sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-200/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-900 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-900/80" />
            Curated Premium Services
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#2f336d]  lg:text-[4.25rem] lg:leading-[0.95]">
            <span className="block">{headlineLeft || "Discover Services."}</span>
            <span className="block text-[#2563eb]">{headlineRight || "Book Instantly."}</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
              <span className="block font-extrabold  text-[#2f336d]">{ "Experience the ultimate digital concierge. Access a handpicked selection of premium services tailored to your lifestyle."}</span>
            {subheading?.trim() ||
              "Experience the ultimate digital concierge. Access a handpicked selection of premium services tailored to your lifestyle."}
          </p>

          <div className="mt-8 w-full max-w-5xl rounded-full border border-white/80 bg-white p-2 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.35)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex flex-1 items-center gap-3 rounded-full px-5 py-3 text-left text-slate-500">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="hidden h-10 w-px bg-slate-200 sm:block" />

              <div className="flex flex-1 items-center gap-3 rounded-full px-5 py-3 text-left text-slate-500">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="text-sm text-slate-500">In your city...</span>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="font-bold text-slate-500">Popular:</span>
            {safePopularChips.map((chip) => (
              <button
                key={`${chip.label}-${chip.slug}`}
                type="button"
                onClick={() => navigate(`/marketplace?category=${chip.slug}`)}
                className="rounded-lg border border-slate-200 bg-white/70 px-4 py-2 font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
