import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton"
import sight1 from "@/assets/Images/add1.jpg"
import sight2 from "@/assets/Images/add2.jpg"
import sight3 from "@/assets/Images/add3.jpg"
import sight4 from "@/assets/Images/sight4.svg"
import sight5 from "@/assets/Images/sight5.svg"

const detailTiles = [
  {
    title: "About the exhibition",
    body: "Real and true moments that celebrate stories from the city and beyond.",
    icon: "Art Gallery",
  },
  {
    title: "Curator Spotlight",
    body: "Meet Julia Harrison, creator of sensory journeys that blend light, sound, and form.",
    icon: "Creative",
  },
  {
    title: "Upcoming events",
    body: "Weekend artist talks, intimate sittings, and exclusive previews.",
    icon: "Events",
  },
]

const tags = ["Fine Art", "Sculpture", "Photography", "Museums"]

export default function HomeSightseeing() {
  return (
    <section className="bg-[#fdf6ee] py-16">
      <div className="mx-auto max-w-387.5 space-y-12 px-4">
        <div className="flex flex-col gap-6 rounded-[32px] bg-white p-6 shadow-2xl md:flex-row md:items-center">
          <div className="space-y-4 md:flex-1">
            <p className="text-sm uppercase tracking-[0.5em] text-amber-500">The exhibition</p>
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Real & true moments worth collecting
            </h2>
            <p className="text-lg text-slate-600">
              Experience galleries, cultural landmarks, and immersive art spaces curated for curious travelers.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Learn more
              </button>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900">
                Book gallery tour
              </button>
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-[28px] border border-slate-100 shadow-xl">
            <ImageWithSkeleton
              src={sight1}
              alt="Art exhibition"
              containerClassName="h-full w-full"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-4 right-4 rounded-2xl bg-white/90 p-4 shadow-xl">
              <p className="text-sm text-slate-500">Museum hours</p>
              <p className="text-lg font-semibold text-slate-900">Open until midnight</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 rounded-[28px] border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-slate-500">
              <span className="h-1.5 w-10 rounded-full bg-slate-900" />
              About
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">About the exhibition</h3>
            <p className="text-base text-slate-600">
              We bring together global creators, live stories, and immersive installations that inspire wonder and calm.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border border-slate-200 bg-white p-2">
                <ImageWithSkeleton
                  src={sight4}
                  alt="Artist"
                  containerClassName="h-full w-full"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="text-sm font-semibold text-slate-700">Curated by Alex Morse</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-[32px] border border-white/40 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-2xl">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-200">Real & true moment</p>
            <h3 className="text-2xl font-semibold">Art gallery story</h3>
            <p className="text-base text-white/80">
              Each installation is curated to remind you that motion, shape, and texture carry emotion.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-2xl font-bold uppercase text-white">
                ✶
              </span>
              <div>
                <p className="text-sm font-semibold">Special moment</p>
                <p className="text-xs text-white/70">Captured by the creative team</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white/60 p-6 shadow-2xl">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Gallery picks</p>
              <h3 className="text-2xl font-semibold text-slate-900">Featured tours</h3>
            </div>
            <div className="grid gap-3">
              {[sight2, sight3, sight5].map((img, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl border border-slate-200 overflow-hidden">
                    <ImageWithSkeleton
                      src={img}
                      alt={`Gallery ${index}`}
                      containerClassName="h-full w-full"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Signature tour #{index + 1}
                    </p>
                    <p className="text-xs text-slate-500">Curated itinerary</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
