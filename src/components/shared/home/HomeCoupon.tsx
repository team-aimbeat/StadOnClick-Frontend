import eventImage from "@/assets/images/event.jpg"
import hotelImage from "@/assets/images/hotel3.jpg"

const coupons = [
  {
    title: "Christmas eve",
    description: "Your ticket to the best experience.",
    code: "QE2345",
    image: eventImage,
  },
  {
    title: "Christmas eve",
    description: "Your ticket to the best experience.",
    code: "QE2345",
    image: hotelImage,
  },
]

type Coupon = {
  title: string
  description: string
  code: string
  image: string
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <article className="relative h-[120px] overflow-hidden rounded-lg border border-amber-300 bg-[#fffaf0] shadow-sm">
      <span className="pointer-events-none absolute left-[120px] top-0 hidden h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f7ecc3] sm:block" />
      <span className="pointer-events-none absolute left-[120px] bottom-0 hidden h-6 w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#f7ecc3] sm:block" />

      <div className="flex h-full flex-col sm:flex-row">
        <div className="flex w-full flex-col justify-center gap-1 border-b border-dashed border-amber-300 px-4 py-4 sm:w-[120px] sm:border-b-0 sm:border-r">
          <p className="text-[11px] font-medium tracking-wide text-slate-700">
            Code
          </p>
          <p className="text-[18px] font-bold text-[#D62A2A]">
            {coupon.code}
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-4">
          <p className="text-[13px] font-semibold text-slate-800">
            {coupon.title}
          </p>
          <p className="text-[12px] text-slate-600">
            {coupon.description}
          </p>
        </div>

        <div className="h-[120px] w-full overflow-hidden sm:h-auto sm:w-[170px]">
          <img
            src={coupon.image}
            alt={coupon.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </article>
  )
}

export default function HomeCoupon() {
  return (
    <section className="w-screen -mx-[calc((100vw-100%)/2)] bg-[#f7ecc3] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {coupons.map((coupon, index) => (
            <CouponCard key={`${coupon.code}-${index}`} coupon={coupon} />
          ))}
        </div>
      </div>
    </section>
  )
}
