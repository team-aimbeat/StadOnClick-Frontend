import { useEffect, useMemo } from "react"
import {
  Bath,
  Bike,
  Brush,
  Car,
  Clock,
  Dumbbell,
  HeartPulse,
  MapPin,
  Sparkles,
  Star,
  Sun,
  TicketPercent,
  Utensils,
  Wand2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Category = { id: string; label: string; icon: LucideIcon; tone: string }
type Service = {
  id: string
  title: string
  vendor: string
  category: string
  description: string
  duration: string
  city: string
  locality: string
  rating: { average: number; count: number }
  originalPrice: number
  finalPrice: number
  discountPct?: number
  discountLabel?: string
  tags?: string[]
  image: string
  sponsored?: boolean
  walletDeal?: boolean
  timeSensitive?: boolean
}

type Coupon = {
  id: string
  title: string
  vendor: string
  category: string
  discount: string
  expires: string
  tone: string
}

const city = { name: "Stockholm", context: "Popular things happening near you today" }

const categories: Category[] = [
  { id: "fitness", label: "Fitness & Yoga", icon: Dumbbell, tone: "from-emerald-50 to-white" },
  { id: "events", label: "Events & Workshops", icon: Wand2, tone: "from-sky-50 to-white" },
  { id: "kids", label: "Kids Programs", icon: Bike, tone: "from-amber-50 to-white" },
  { id: "home", label: "Home Services", icon: Sparkles, tone: "from-slate-50 to-white" },
  { id: "beauty", label: "Beauty & Wellness", icon: Bath, tone: "from-rose-50 to-white" },
  { id: "learning", label: "Learning & Skills", icon: Brush, tone: "from-indigo-50 to-white" },
  { id: "travel", label: "Travel & Attractions", icon: Sun, tone: "from-purple-50 to-white" },
]

const services: Service[] = [
  {
    id: "svc-1",
    title: "Sunrise Kayak Tour",
    vendor: "Archipelago Guides",
    category: "Travel & Attractions",
    description: "Guided island circuit with fika stop; dry-bag included.",
    duration: "2.5 hrs",
    city: "Stockholm",
    locality: "Djurgården",
    rating: { average: 4.8, count: 121 },
    originalPrice: 1150,
    finalPrice: 890,
    discountPct: 23,
    discountLabel: "Wallet Deal",
    tags: ["Popular", "Limited"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    sponsored: true,
    walletDeal: true,
    timeSensitive: true,
  },
  {
    id: "svc-2",
    title: "Nordic Spa Escape",
    vendor: "Harbour Calm Spa",
    category: "Beauty & Wellness",
    description: "Steam, sauna, and cold plunge ritual inspired by the archipelago.",
    duration: "90 min",
    city: "Stockholm",
    locality: "Norrmalm",
    rating: { average: 4.8, count: 214 },
    originalPrice: 1299,
    finalPrice: 899,
    discountPct: 31,
    tags: ["Featured"],
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    sponsored: true,
    walletDeal: true,
  },
  {
    id: "svc-3",
    title: "Strength Training Session",
    vendor: "Forma Athletics",
    category: "Fitness & Yoga",
    description: "One-on-one mobility and strength block tailored to your routine.",
    duration: "75 min",
    city: "Stockholm",
    locality: "Södermalm",
    rating: { average: 4.9, count: 138 },
    originalPrice: 950,
    finalPrice: 760,
    discountPct: 20,
    tags: ["Popular"],
    image: "https://images.unsplash.com/photo-1502772066658-30023ab1f986?auto=format&fit=crop&w=900&q=80",
    walletDeal: true,
  },
  {
    id: "svc-4",
    title: "Scandi Brunch Flight",
    vendor: "Södra Kitchen",
    category: "Food & Drink",
    description: "Seasonal brunch platter, cinnamon buns, and coffee tasting for two.",
    duration: "75 min",
    city: "Stockholm",
    locality: "Gamla Stan",
    rating: { average: 4.6, count: 204 },
    originalPrice: 720,
    finalPrice: 540,
    discountPct: 25,
    discountLabel: "Cashback",
    tags: ["Wallet Deal"],
    image: "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=900&q=80",
    walletDeal: true,
  },
  {
    id: "svc-5",
    title: "Kids Coding Camp",
    vendor: "Future Lab",
    category: "Kids Programs",
    description: "Weekend coding lab for ages 8-12, devices included.",
    duration: "2 sessions",
    city: "Stockholm",
    locality: "Östermalm",
    rating: { average: 4.7, count: 89 },
    originalPrice: 1450,
    finalPrice: 1150,
    discountPct: 21,
    tags: ["New"],
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    timeSensitive: true,
  },
  {
    id: "svc-6",
    title: "Move-In Deep Clean",
    vendor: "Bright Abode",
    category: "Home Services",
    description: "Floor-to-ceiling detail with appliance degrease and window polish.",
    duration: "4 hrs",
    city: "Stockholm",
    locality: "Kungsholmen",
    rating: { average: 4.5, count: 91 },
    originalPrice: 2590,
    finalPrice: 2090,
    discountPct: 19,
    image: "https://images.unsplash.com/photo-1486591978090-58e619d37fe7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "svc-7",
    title: "Glow Facial & LED",
    vendor: "Nord Esthetics",
    category: "Beauty & Wellness",
    description: "Custom peel, LED therapy, and hydration mask for city skin reset.",
    duration: "55 min",
    city: "Stockholm",
    locality: "Vasastan",
    rating: { average: 4.7, count: 174 },
    originalPrice: 1050,
    finalPrice: 820,
    discountPct: 22,
    tags: ["Trending"],
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "svc-8",
    title: "Architectural Photo Walk",
    vendor: "Lens & Lines",
    category: "Events & Workshops",
    description: "Guided Gamla Stan tour with pro tips; edited shots included.",
    duration: "90 min",
    city: "Stockholm",
    locality: "Gamla Stan",
    rating: { average: 4.7, count: 77 },
    originalPrice: 890,
    finalPrice: 690,
    discountPct: 22,
    tags: ["Limited"],
    image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80",
    timeSensitive: true,
  },
]

const coupons: Coupon[] = [
  { id: "c1", title: "20% Wallet Boost", vendor: "StadonClick", category: "Any service", discount: "20% off", expires: "Ends today", tone: "from-emerald-50 to-emerald-100" },
  { id: "c2", title: "Spa Day Flash", vendor: "Harbour Calm", category: "Beauty & Wellness", discount: "SEK 250 off", expires: "6 hrs left", tone: "from-rose-50 to-rose-100" },
  { id: "c3", title: "Class Pack", vendor: "Forma Athletics", category: "Fitness & Yoga", discount: "15% off", expires: "This week", tone: "from-sky-50 to-sky-100" },
  { id: "c4", title: "Family Bundle", vendor: "Future Lab", category: "Kids Programs", discount: "SEK 300 off", expires: "Sun", tone: "from-amber-50 to-amber-100" },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value)
}

function ServiceCard({ service }: { service: Service }) {
  const hasDiscount = service.finalPrice < service.originalPrice

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl hover:ring-emerald-100">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {service.discountPct ? (
            <Badge className="bg-emerald-600 text-white shadow">{service.discountPct}% OFF</Badge>
          ) : null}
          {service.discountLabel ? (
            <Badge variant="secondary" className="bg-white/90 text-emerald-700 shadow">
              {service.discountLabel}
            </Badge>
          ) : null}
          {service.sponsored ? (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              Sponsored
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            {service.category}
          </Badge>
          <div className="flex items-center gap-1 text-amber-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {service.rating.average.toFixed(1)} ({service.rating.count})
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">{service.title}</p>
          <p className="text-sm font-medium text-emerald-700">{service.vendor}</p>
          <p className="line-clamp-2 text-sm text-slate-600">{service.description}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            {service.duration}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4 text-slate-400" />
              {service.locality}
            </span>
          </div>
          {service.walletDeal ? (
            <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">Wallet Deal</Badge>
          ) : null}
          {service.timeSensitive ? (
            <Badge className="bg-orange-50 text-orange-700 ring-1 ring-orange-100">Ends soon</Badge>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(service.originalPrice)}
                </span>
              ) : null}
              <span className="text-xl font-bold text-emerald-700">{formatCurrency(service.finalPrice)}</span>
            </div>
            <div className="flex flex-wrap gap-1 text-[11px] text-slate-500">
              {service.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-[2px] text-slate-700 ring-1 ring-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Button className="h-10 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow transition hover:from-emerald-700 hover:to-emerald-600">
            View details
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function Marketplace() {
  const dispatch = useAppDispatch()
  const featured = useMemo(() => services.filter((s) => s.sponsored || s.featured), [])
  const walletDeals = useMemo(() => services.filter((s) => s.walletDeal), [])
  const timeSensitive = useMemo(() => services.filter((s) => s.timeSensitive), [])
  const popular = useMemo(() => services.filter((s) => !s.sponsored && !s.timeSensitive).slice(0, 6), [])

  useEffect(() => {
    dispatch(setPageTitle("Marketplace"))
  }, [dispatch])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-8 space-y-10">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Showing activities in {city.name}</p>
          <h1 className="text-3xl font-semibold text-slate-900">StadonClick Marketplace</h1>
          <p className="text-sm text-slate-600">{city.context}</p>
        </div>

        <section className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: "Book a class", icon: Dumbbell },
            { label: "Today’s deals", icon: TicketPercent },
            { label: "Wallet offers", icon: HeartPulse },
            { label: "Kids activities", icon: Bike },
            { label: "Wellness near you", icon: Bath },
            { label: "Weekend events", icon: Wand2 },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.label}
                className="min-w-[160px] flex-1 cursor-pointer border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
              >
                <CardContent className="flex items-center gap-2 p-0 text-sm font-semibold text-slate-800">
                  <Icon className="h-4 w-4 text-emerald-600" />
                  {item.label}
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.id}
                  className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-br ${category.tone} px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-inner ring-1 ring-slate-100">
                    <Icon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{category.label}</p>
                    <p className="text-xs text-slate-500">Tap to explore</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Featured & Sponsored</h2>
                <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-100">Ads & promos</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featured.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>

            <Card className="border-none bg-white shadow-sm ring-1 ring-slate-100">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800">Deals & Coupons</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className={`min-w-[220px] rounded-xl border border-slate-100 bg-gradient-to-br ${coupon.tone} p-4 shadow-sm`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Coupon</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{coupon.discount}</p>
                    <p className="text-sm font-semibold text-emerald-800">{coupon.title}</p>
                    <p className="text-xs text-slate-600">{coupon.vendor} · {coupon.category}</p>
                    <div className="mt-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-100">
                      {coupon.expires}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nearby Popular Services</h2>
              <span className="text-xs text-slate-500">Based on {city.name} demand</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {popular.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Wallet-Friendly Deals</h2>
              <span className="text-xs text-slate-500">Boost conversions with wallet and coupons</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {walletDeals.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Time-Sensitive Activities</h2>
              <span className="text-xs text-slate-500">Slots closing soon</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {timeSensitive.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-100">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800">Top rated this week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Avg. rating 4.7 across all services.</p>
              <p>Harbour Calm Spa and Forma Athletics are trending with 120+ bookings.</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-100">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800">Booked 120+ times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Sunrise Kayak Tour and Nordic Spa Escape show high liquidity and repeat purchases.</p>
              <p>Wallet deals drive conversions on Scandi Brunch and Glow Facial.</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-100">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-800">Monetization signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Sponsored placements active, coupon usage visible, and wallet incentives linked to bookings.</p>
              <p>Commission-ready, ad-ready, and subscription-ready flows displayed in feed density.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
