import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import heroImage from "@/assets/images/event.svg";
import highlightImage from "@/assets/images/wheel.svg";
import bowlingImage from "@/assets/images/bowling.svg";
import waterImage from "@/assets/images/aqua.svg";
import ServicesSidebar from "@/components/marketplace/ServicesSidebar";

const activityHighlights = [
  {
    title: "Adventure Activities",
    description: "Go-karting, trampoline parks, indoor climbing and neon laser tag.",
    tag: "Weekend Highlight",
    image: highlightImage,
  },
];

const experienceCards = [
  {
    title: "Bowling & Arcade",
    detail: "Bowling • Arcade • VR zones",
    image: bowlingImage,
  },
  {
    title: "Water Parks & Rides",
    detail: "Slides • Wave pools • Kids zones",
    image: waterImage,
  },
  {
    title: "Immersive Story Rooms",
    detail: "Escape rooms • Mystery dungeons • Puzzle hunts",
    image: highlightImage,
  },
];

export default function WeekendActivities() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setPageTitle("Weekend Activities"));
  }, [dispatch]);

  const goToMarket = () => navigate("/marketplace?category=weekend-activities");

  return (
    <main className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        
        <header className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500">
            Weekend activities & experiences
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Weekend Activities & Experiences
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            Curated adventures, family fun and unforgettable escape rooms near you. Pick an
            experience and book the weekend you deserve.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="relative overflow-hidden rounded-3xl bg-[#E5E5E5] p-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">Weekend Activities</h2>
              <p className="text-slate-600">
                Find top-rated places for friends, couples, and families nearby. Pickup
                experiences curated by local hosts ready to show you the best weekend spots.
              </p>
              <button
                type="button"
                onClick={goToMarket}
                className="mt-2 inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold tracking-widest text-slate-900 transition hover:border-slate-400"
              >
                Explore Activities
              </button>
            </div>

            <img
              src={heroImage}
              alt="Weekend activity"
              className="absolute bottom-0 right-0 h-104 w-[280px] object-contain"
            />
          </article>

          <div className="grid gap-6">
            {activityHighlights.map((highlight) => (
              <article
                key={highlight.title}
                className="relative min-h-[270px] overflow-hidden rounded-3xl bg-black p-6 text-white"
              >
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[12px] uppercase tracking-[0.3em]">
                  {highlight.tag}
                </span>
                <div className="relative z-10 mt-4 max-w-[65%]">
                  <h3 className="text-2xl font-semibold">{highlight.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{highlight.description}</p>
                  <button
                    type="button"
                    onClick={goToMarket}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-slate-100"
                  >
                    Explore
                  </button>
                </div>

                <img
                  src={highlight.image}
                  alt={highlight.title}
                  className="absolute inset-y-0 right-0 h-full w-[45%] object-contain"
                />
              </article>
            ))}

            <div className="grid gap-5 sm:grid-cols-2">
              {experienceCards.map((item) => (
                <article
                  key={item.title}
                  className="relative min-h-[220px] overflow-hidden rounded-3xl bg-cover bg-center p-6 text-white shadow-lg"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[12px] uppercase tracking-[0.4em]">
                    Popular
                  </span>
                  <div className="absolute bottom-6 left-6 space-y-1">
                    <h3 className="text-2xl font-semibold">{item.title}</h3>
                    <p className="text-sm">{item.detail}</p>
                    <button
                      type="button"
                      onClick={goToMarket}
                      className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-black transition hover:bg-slate-100"
                    >
                      Explore
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
