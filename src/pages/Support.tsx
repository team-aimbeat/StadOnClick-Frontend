import { useEffect } from "react"
import eventImage from "@/assets/Images/event.jpg"
import vacationImage from "@/assets/Images/vacation.jpeg"
import hotel1 from "@/assets/Images/hotel1.jpg"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"

const faqs = [
  {
    question: "How do I reschedule a booking?",
    answer:
      "Open your booking details and choose a new slot. If the venue confirms, the change is instant.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Refunds depend on the venue policy. Eligible refunds are processed within 5-7 business days.",
  },
  {
    question: "How do I contact a venue directly?",
    answer:
      "Use the in-app chat on the booking page to reach the venue team.",
  },
  {
    question: "Payment failed but money deducted",
    answer:
      "Most failed payments are auto-reversed within 24 hours. If not, contact support with the transaction ID.",
  },
]

const contactCards = [
  {
    title: "Live chat",
    body: "Mon–Sun · 9:00 AM – 10:00 PM",
    action: "Start chat",
  },
  {
    title: "Email support",
    body: "support@stadonclick.com",
    action: "Send email",
  },
  {
    title: "Call us",
    body: "+91 98765 43210",
    action: "Call now",
  },
]

const tips = [
  "Keep your booking ID handy for faster help.",
  "Reschedules are available until 2 hours before the slot.",
  "For group bookings, use the chat to confirm capacity.",
  "Refund timelines vary by venue and payment method.",
]

export default function Support() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("Support"))
  }, [dispatch])

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 sm:px-6 lg:px-8 text-slate-900">
     <header
  className="
    relative left-1/2 right-1/2
    -ml-[50vw] -mr-[50vw]
    w-screen
    overflow-hidden
    py-16 text-center text-white
  "
  style={{
    backgroundImage: `url(${eventImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* overlay */}
  <div className="absolute inset-0 bg-slate-900/60" />

  {/* content container */}
  <div className="relative mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
      Customer Support
    </p>
    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
      We are here to help
    </h1>
    <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
      Get quick answers, manage bookings, or reach our support team.
    </p>
  </div>
</header>


      <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Find answers fast</h2>
          <p className="mt-2 text-sm text-slate-600">
            Browse common questions or contact us for personalized help.
          </p>
          <div className="mt-5 space-y-4">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {contactCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
              <button
                type="button"
                className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                {card.action}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Helpful tips</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={vacationImage}
            alt="Support team"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-6 text-white">
            <h3 className="text-lg font-semibold">Priority assistance</h3>
            <p className="mt-1 text-sm text-white/80">
              Booking issues, payment support, and venue coordination.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#EDE9FE] via-[#FCE7F3] to-[#DBEAFE] p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold">Need urgent help?</h2>
            <p className="mt-3 text-sm text-slate-700">
              Our team prioritizes active bookings and payment concerns. Share
              your booking ID for faster resolution.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white"
              >
                Raise a ticket
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-800"
              >
                Track my request
              </button>
            </div>
          </div>
          <div className="relative min-h-[220px] overflow-hidden rounded-3xl">
            <img
              src={hotel1}
              alt="Support desk"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>
        </div>
      </section>
    </main>
  )
}
