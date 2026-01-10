const reasons = [
  {
    title: "Choose Stadium",
    body: "Browse verified venues in your city.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M4 9h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9zm2-4h12a2 2 0 0 1 2 2v1H4V7a2 2 0 0 1 2-2zm4 6h4v6h-4v-6z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: "Select Date & Time",
    body: "Pick a slot that fits your team.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M7 3v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2V3h-2v2H9V3H7zm12 8H5v8h14v-8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: "Secure Payments",
    body: "Pay quickly with protected checkout.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M12 2l7 3v6c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3zm-1 11l4-4-1.4-1.4L11 10.2 9.4 8.6 8 10l3 3z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: "Trusted by Players",
    body: "Rated by thousands of regulars.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.3 0-8 1.7-8 5v3h16v-3c0-3.3-4.7-5-8-5z"
          fill="currentColor"
        />
      </svg>
    ),
  },
]

export default function HomeWhy() {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold">Why StadOnClick Works</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reasons.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_10px_35px_-25px_rgba(15,23,42,0.2)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5]">
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            </div>
            <p className="mt-3 text-xs text-slate-500">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
