import { Link } from "react-router-dom"
import WhiteCard from "@/components/shared/WhiteCard"
import footballImage from "@/assets/Images/football.jpg"
import cricketImage from "@/assets/Images/cricket.jpg"
import badmintonImage from "@/assets/Images/batminton.jpg"
import tennisImage from "@/assets/Images/tennis.jpg"
import barbellIcon from "@/assets/icons/barbell.svg"
import groupIcon from "@/assets/icons/group.svg"
import s1Icon from "@/assets/icons/s1.png"
import s2Icon from "@/assets/icons/s2.png"
import sunIcon from "@/assets/icons/sun.svg"
import targetIcon from "@/assets/icons/target.svg"

const activities = [
  {
    title: "Night Football",
    price: "1,200",
    image: footballImage,
    slug: "weight-loss-week",
  },
  {
    title: "Box Cricket",
    price: "1,800",
    image: cricketImage,
    slug: "spring-break",
  },
]

const categories = [
  { title: "Football Turfs", icon: targetIcon, slug: "games-outings" },
  { title: "Cricket Grounds", icon: sunIcon, slug: "buffet-deals" },
  { title: "Badminton Courts", icon: s1Icon, slug: "spa-deals" },
  { title: "Swimming Pools", icon: s2Icon, slug: "new-deals" },
  { title: "Corporate Events", icon: groupIcon, slug: "new-deals" },
  { title: "Fitness & Training", icon: barbellIcon, slug: "health" },
]

export default function HomePopular() {
  return (
    <section className="mt-12">
      <h2 className="text-center text-3xl font-semibold text-slate-900">
        Explore by Category
      </h2>

      <WhiteCard className="mt-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={footballImage}
              alt="Football venues"
              className="h-56 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 px-6 text-white">
              <h3 className="text-2xl font-semibold">
                Book Football &amp;
                <br />
                Sports Venues
              </h3>
              <p className="text-sm text-white/85">
                Discover &amp; instantly book turfs
                <br />
                &amp; stadiums near you
              </p>
              <p className="text-xs text-white/70">
                Best prices, verified venues, flexible slots.
              </p>
              <button
                type="button"
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                Explore Now <span className="text-base">&gt;</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">
              Popular activities
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {activities.map((activity) => (
                <Link
                  key={activity.title}
                  to={`/deals/${activity.slug}`}
                  className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1"
                >
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    Rs {activity.price}
                  </div>
                  <div className="space-y-1 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      Evening slots, instant confirmation
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          </div>

          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map((category) => (
                <Link
                  key={category.title}
                  to={`/services/${category.slug}`}
                  className="flex min-h-[92px] items-center gap-4 rounded-2xl bg-[#F8F8F8] p-5 shadow-sm transition hover:bg-white"
                >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                  <img
                    src={category.icon}
                    alt=""
                    className="h-7 w-7"
                  />
                </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {category.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      Curated options near you
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </WhiteCard>
    </section>
  )
}

