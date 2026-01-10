import hotel1 from "@/assets/images/hotel1.jpg"
import hotel2 from "@/assets/images/hotel2.jpg"
import hotel3 from "@/assets/images/hotel3.jpg"
import hotel4 from "@/assets/images/hotel4.jpg"
import hotel5 from "@/assets/images/hotel5.jpg"
import hotel6 from "@/assets/images/hotel6.jpg"

const makeSvg = (label: string, bg: string, accent: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${bg}"/>
        <stop offset="1" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" rx="18" fill="url(#g)"/>
    <rect x="18" y="18" width="284" height="144" rx="14" fill="rgba(255,255,255,0.08)"/>
    <text x="160" y="98" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" text-anchor="middle">${label}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const hotelBrands = [
  { name: "Radisson", image: hotel1 },
  { name: "Lalit", image: hotel2 },
  { name: "Novotel", image: hotel3 },
  { name: "Courtyard", image: hotel4 },
  { name: "Hilton", image: hotel5 },
  { name: "Marriott", image: hotel6 },
]

const nextOnMind = [
  {
    title: "Massage",
    subtitle: "under Rs 999",
    image: makeSvg("Massage", "#F59E0B", "#FDBA74"),
  },
  {
    title: "Dinner Buffets",
    subtitle: "under Rs 1199",
    image: makeSvg("Dinner", "#10B981", "#6EE7B7"),
  },
  {
    title: "Lunch Buffets",
    subtitle: "under Rs 999",
    image: makeSvg("Lunch", "#0EA5E9", "#7DD3FC"),
  },
  {
    title: "Party Nights",
    subtitle: "under Rs 999",
    image: makeSvg("Party", "#8B5CF6", "#C4B5FD"),
  },
  {
    title: "Haircuts",
    subtitle: "under Rs 99",
    image: makeSvg("Haircuts", "#EC4899", "#F9A8D4"),
  },
  {
    title: "Barbeque Buffets",
    subtitle: "under Rs 799",
    image: makeSvg("BBQ", "#F97316", "#FDBA74"),
  },
]

const weekendActivities = [
  { title: "Bowling", image: makeSvg("Bowling", "#0F172A", "#334155") },
  { title: "Gaming", image: makeSvg("Gaming", "#1D4ED8", "#60A5FA") },
  { title: "Escape Room", image: makeSvg("Escape", "#7C2D12", "#FDBA74") },
  { title: "Amusement Parks", image: makeSvg("Parks", "#065F46", "#34D399") },
  { title: "Water Parks", image: makeSvg("Water", "#0E7490", "#67E8F9") },
]

const giftCards = [
  {
    brand: "Westside",
    offer: "Flat 8% off",
    image: makeSvg("Westside", "#0F172A", "#475569"),
  },
  {
    brand: "Pantaloons",
    offer: "Flat 7% off",
    image: makeSvg("Pantaloons", "#0EA5E9", "#7DD3FC"),
  },
  {
    brand: "Ajio",
    offer: "Flat 4% off",
    image: makeSvg("AJIO", "#111827", "#6B7280"),
  },
  {
    brand: "Croma",
    offer: "Flat 1% off",
    image: makeSvg("Croma", "#0F766E", "#5EEAD4"),
  },
  {
    brand: "McDonalds",
    offer: "Offers @ Rs 525",
    image: makeSvg("McD", "#DC2626", "#FCA5A5"),
  },
  {
    brand: "Amazon Prime",
    offer: "Flat 13% off",
    image: makeSvg("Prime", "#2563EB", "#93C5FD"),
  },
  {
    brand: "BookMyShow",
    offer: "Flat 2% off",
    image: makeSvg("BMS", "#991B1B", "#FCA5A5"),
  },
]

function SectionHeader({ title }: { title: string }) {
  return <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
}

function BrandTile({ name, image }: { name: string; image: string }) {
  return (
    <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm">
      <img src={image} alt={name} className="h-full w-full object-cover" />
    </div>
  )
}

function ImageCard({
  title,
  subtitle,
  image,
}: {
  title: string
  subtitle?: string
  image: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className="h-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="px-3 py-2 text-sm font-semibold text-slate-900">{title}</div>
      {subtitle ? (
        <div className="px-3 pb-3 text-xs text-slate-500">{subtitle}</div>
      ) : null}
    </div>
  )
}

function ActivityCard({ title, image }: { title: string; image: string }) {
  return (
    <div className="relative flex h-20 w-28 items-end justify-center overflow-hidden rounded-xl border border-slate-200 bg-white pb-2 text-xs font-semibold text-white shadow-sm">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="relative rounded-full bg-black/50 px-2 py-1">{title}</div>
    </div>
  )
}

function GiftCard({
  brand,
  offer,
  image,
}: {
  brand: string
  offer: string
  image: string
}) {
  return (
    <div className="flex w-32 flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm">
      <div className="flex h-10 w-20 items-center justify-center overflow-hidden rounded-md border border-slate-200 text-xs font-semibold text-slate-700">
        <img src={image} alt={brand} className="h-full w-full object-cover" />
      </div>
      <span className="rounded-full bg-[#0EA5E9] px-2 py-1 text-[10px] font-semibold text-white">
        {offer}
      </span>
    </div>
  )
}

export default function HomeFeaturedRows() {
  return (
    <section className="mt-12 space-y-10">
      <div>
        <SectionHeader title="Dine At 5 Star Hotels" />
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ">
          {hotelBrands.map((brand) => (
            <BrandTile key={brand.name} name={brand.name} image={brand.image} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Next Thing On Your Mind" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {nextOnMind.map((item) => (
            <ImageCard
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              image={item.image}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Weekend Activities" />
        <div className="mt-4 flex flex-wrap gap-4">
          {weekendActivities.map((item) => (
            <ActivityCard key={item.title} title={item.title} image={item.image} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Popular Gift Cards" />
        <div className="mt-4 flex flex-wrap gap-4">
          {giftCards.map((card) => (
            <GiftCard
              key={card.brand}
              brand={card.brand}
              offer={card.offer}
              image={card.image}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
