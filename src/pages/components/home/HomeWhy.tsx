const reasons = [
  {
    title: "Choose Stadium",
    body: "Browse verified venues in your city.",
    tone: "from-[#E0F2FE] via-[#EDE9FE] to-white",
    accent: "text-[#4F46E5]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
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
    tone: "from-[#EDE9FE] via-[#FCE7F3] to-white",
    accent: "text-[#7C3AED]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
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
    tone: "from-[#E0F2FE] via-[#DCFCE7] to-white",
    accent: "text-[#0EA5E9]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
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
    tone: "from-[#FCE7F3] via-[#E0F2FE] to-white",
    accent: "text-[#EC4899]",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
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
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-900">
          Why StadOnClick Works
        </h2>
       
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reasons.map((item, index) => (
          <div key={item.title} className="relative">
            <div
              className={`relative overflow-hidden rounded-[28px] border border-white/70 bg-[#baa7fa]  ${item.tone} p-5 shadow-[0_20px_55px_-45px_rgba(76,81,191,0.6)]`}
            >
              <div className="relative mb-4 flex h-28 items-center justify-center">
                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ${item.accent}`}
                >
                  {item.icon}
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 text-left shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white ${item.accent}`}
                  >
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                </div>
                <p className="mt-3 text-xs text-slate-600">{item.body}</p>
              </div>
            </div>

            {index < reasons.length - 1 ? (
              <div className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 lg:block">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400">
                    <path
                      d="M8 5l8 7-8 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
