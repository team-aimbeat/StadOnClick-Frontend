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

export default function HomeCoupon() {
  return (
    <section className=" w-screen -mx-[calc((100vw-100%)/2)] bg-[#f7ecc3] py-8">
      <div className="relative mx-auto max-w-7xl px-4">
       

        <div className="grid gap-5 md:grid-cols-2">
          {coupons.map((coupon, index) => (
            <article
              key={`${coupon.code}-${index}`}
              className="relative overflow-hidden  border border-1 border-amber-300 bg-white/80 h-[119px] w-[600px]"
            >
              <span className="pointer-events-none absolute left-[140px] top-0 hidden h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300 bg-amber-50 sm:block" />
              <span className="pointer-events-none absolute left-[140px] bottom-0 hidden h-6 w-6 -translate-x-1/2 translate-y-1/2 rounded-full border border-dashed border-amber-300 bg-amber-50 sm:block" />

              <div className="flex flex-col sm:flex-row">
                <div className="flex w-full flex-col justify-center gap-1 border-b border-dashed border-amber-300 px-5 py-5 sm:w-[140px] sm:border-b-0 sm:border-r">
                  <p className="text-[11px]  tracking-wide text-black font-medium">
                    Code
                  </p>
                  <p className="text-[19px] font-bold text-[#D62A2A]">
                    {coupon.code}
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-center gap-1 px-5 py-5">
                  <p className="text-[#575656] font-bold text-[14px]">
                    {coupon.title}
                  </p>
                  <p className="text-[19px] text-[#575656]">
                    {coupon.description}
                  </p>
                </div>

                <div className="h-[119px] w-[173px] overflow-hidden sm:h-auto sm:w-[170px]">
                  <img
                    src={coupon.image}
                    alt={coupon.title}
                    className="h-[119px] w-[173px] object-cover"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
