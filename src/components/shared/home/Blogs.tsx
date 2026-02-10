import profile1 from "@/assets/Images/profile-7.jpeg"
import profile2 from "@/assets/Images/profile-8.jpeg"
import profile3 from "@/assets/Images/profile-9.jpeg"
import cover1 from "@/assets/Images/hotel1.jpg"
import cover2 from "@/assets/Images/hotel2.jpg"
import cover3 from "@/assets/Images/hotel3.jpg"
import cover4 from "@/assets/Images/hotel4.jpg"

const profiles = [
  {
    name: "Yeray Rosales",
    role: "UI/UX Designer",
    image: profile1,
    cover: cover1,

  },
  {
    name: "Maya Chen",
    role: "Product Designer",
    image: profile2,
    cover: cover2,
  
  },
  {
    name: "Hugo Park",
    role: "Visual Artist",
    image: profile3,
    cover: cover3,
 
  },
  {
    name: "Sofia Allen",
    role: "Brand Strategist",
    image: profile1,
    cover: cover4,
  
  },
]

export default function RecentPosts() {
  return (
    <section className="relative w-screen -mx-[calc((100vw-100%)/2)] bg-slate-50 py-20">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-slate-900 -mt-10">
           Latest Blogs & Insights
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Follow top designers and creators to stay inspired.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {profiles.map((profile, index) => (
            <article
              key={`${profile.name}-${index}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="relative h-42.5">
                <img
                  src={profile.cover}
                  alt={`${profile.name} cover`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="relative -mt-8 px-4 pb-5">
                <div className="flex items-end justify-between">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-14 w-14 rounded-full border-4 border-white object-cover shadow"
                  />
                  <button
                    type="button"
                    className=" mt-10 rounded-full border border-blue-400 px-4 py-1 text-xs font-semibold text-blue-500 transition hover:border-blue-500 hover:text-blue-600"
                  >
                    Follow
                  </button>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {profile.name}
                </h3>
                <p className="text-xs text-slate-500">{profile.role}</p>

                <p className="mt-4  border-slate-100 pt-3 text-sm text-slate-500">
                  Thoughtful designer focused on clean systems, fast UX, and
                  friendly visual language.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
