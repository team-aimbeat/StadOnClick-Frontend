import { Link } from "react-router-dom"
import { useState } from "react"
import iconVerified from "@/assets/icons/check.svg"
import iconLock from "@/assets/icons/Lock.svg"
import iconTrust from "@/assets/icons/group.svg"
import iconTarget from "@/assets/icons/target.svg"
import iconStar from "@/assets/icons/Star.svg"
import iconTime from "@/assets/icons/Time.svg"

const benefits = [
  {
    title: "Earn by campaign",
    body: "Join and earn commission on select packages.",
    icon: iconTarget,
  },
  {
    title: "Sample available",
    body: "Exclusive offers for verified partners.",
    icon: iconStar,
  },
  {
    title: "Top-ranking items",
    body: "Explore trending activities and venues.",
    icon: iconVerified,
  },
  {
    title: "Easy inquiries",
    body: "Request a quote directly in the chat.",
    icon: iconTime,
  },
]

const rightItems = [
  { label: "Influencers", icon: iconTrust, href: "/signup" },
  { label: "Wholesalers", icon: iconVerified, href: "/signup" },
  { label: "Dropshippers", icon: iconLock, href: "/signup" },
]

export default function HomeDeals() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsModalOpen(false)
    setEmail("")
    setPhone("")
  }

  return (
    <section className="mt-12">
      <div className="rounded-[28px] bg-gradient-to-r from-[#7AA8FF] via-[#7B9BFF] to-[#8BB3FF] p-6 text-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="rounded-full bg-white/20 px-3 py-1">
                Business benefits
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="flex -space-x-2">
                  <span className="h-6 w-6 rounded-full bg-white/80" />
                  <span className="h-6 w-6 rounded-full bg-white/70" />
                  <span className="h-6 w-6 rounded-full bg-white/60" />
                </span>
                Save Rs 200+/month with StadOnClick perks
              </span>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {benefits.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#4F73FF]">
                    <img src={item.icon} alt="" className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className="text-sm text-white/80">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/20 p-6 text-white">
            <div className="space-y-4">
              {rightItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 transition hover:bg-white/25"
                >
                  <img src={item.icon} alt="" className="h-5 w-5" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#4F73FF]"
            >
              Verify identity to access benefits
            </button>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Verify your details
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-sm text-slate-500"
                aria-label="Close"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Enter your contact details and we will reach out with next steps.
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4F73FF]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4F73FF]"
                  placeholder="+91 98765 43210"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-[#4F73FF] px-4 py-2 text-sm font-semibold text-white"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
