import { useEffect } from "react"
import {
  Activity,
  ArrowUpDown,
  Building,
  ChevronDown,
  Filter,
  Fish,
  Grid,
  Heart,
  Lock,
  MapPin,
  Music,
  Star,
  Waves,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"

type Deal = {
  id: string
  merchantName: string
  title: string
  imageUrl: string
  location: string
  distance: string
  rating: number
  reviewCount: number
  originalPrice: number
  discountedPrice: number
  promoPrice?: number
  promoCode?: string
  percentOff: number
  isPopular: boolean
  headline: string
}

const categoryPills = [
  { id: "all", label: "All", count: "400+", icon: Grid },
  { id: "trampoline", label: "Trampoline & Bounce Houses", count: "18", icon: Activity },
  { id: "escape", label: "Escape Games", count: "19", icon: Lock },
  { id: "museums", label: "Museums", count: "17", icon: Building },
  { id: "water", label: "Water Sports", count: "16", icon: Waves },
  { id: "theater", label: "Theater & Shows", count: "4", icon: Music },
  { id: "whale", label: "Whale Watching", count: "8", icon: Fish },
]

const deals: Deal[] = [
  {
    id: "deal-1",
    merchantName: "Aurora Skin Studio",
    title: "Hydrodermabrasion & LED Facial with Personalized Serum",
    imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    location: "Gold Coast, Chicago",
    distance: "0.8 mi",
    rating: 4.9,
    reviewCount: 512,
    originalPrice: 210,
    discountedPrice: 139,
    promoPrice: 42.12,
    promoCode: "NEWYEAR",
    percentOff: 34,
    isPopular: true,
    headline: "Indoor Jumping Experience at My Kidzplay Alsip, Illinois",
  },
  {
    id: "deal-2",
    merchantName: "Waves Massage Atelier",
    title: "60-Minute Swedish Massage + Aromatherapy Upgrade",
    imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80",
    location: "River North, Chicago",
    distance: "1.2 mi",
    rating: 4.8,
    reviewCount: 389,
    originalPrice: 155,
    discountedPrice: 104,
    promoPrice: 47.34,
    promoCode: "NEWYEAR",
    percentOff: 33,
    isPopular: true,
    headline: "Blissful Riverside Massage Ritual at River North",
  },
  {
    id: "deal-3",
    merchantName: "Luminous Brow & Beauty Bar",
    title: "Microshading Touch-Up + Brow Tinting Combo",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    location: "Lincoln Park, Chicago",
    distance: "2.6 mi",
    rating: 4.7,
    reviewCount: 221,
    originalPrice: 145,
    discountedPrice: 89,
    promoPrice: 43.15,
    promoCode: "NEWYEAR",
    percentOff: 39,
    isPopular: false,
    headline: "Microshading Touch-Up & Tint at Luminous Brow",
  },
  {
    id: "deal-4",
    merchantName: "Elemental Spa Lab",
    title: "Infrared Sauna Session & Cold Plunge Prep",
    imageUrl: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80",
    location: "West Loop, Chicago",
    distance: "3.1 mi",
    rating: 4.9,
    reviewCount: 178,
    originalPrice: 190,
    discountedPrice: 129,
    promoPrice: 39.99,
    promoCode: "NEWYEAR",
    percentOff: 32,
    isPopular: false,
    headline: "Infrared Sauna Session & Cold Plunge Prep",
  },
  {
    id: "deal-5",
    merchantName: "Velvet Touch Laser",
    title: "Six Laser Hair Removal Sessions (Upper Lip & Chin)",
    imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80&sat=-100",
    location: "Wicker Park, Chicago",
    distance: "2.9 mi",
    rating: 4.6,
    reviewCount: 295,
    originalPrice: 450,
    discountedPrice: 249,
    promoPrice: 57.54,
    promoCode: "NEWYEAR",
    percentOff: 45,
    isPopular: true,
    headline: "Laser Hair Removal Sessions for Upper Lip & Chin",
  },
  {
    id: "deal-6",
    merchantName: "Petal & Stone Salon",
    title: "Signature Blowout with Scalp Massage + Glass Hair Refresh",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    location: "Bucktown, Chicago",
    distance: "3.8 mi",
    rating: 4.8,
    reviewCount: 348,
    originalPrice: 140,
    discountedPrice: 88,
    promoPrice: 41.12,
    promoCode: "NEWYEAR",
    percentOff: 37,
    isPopular: false,
    headline: "Signature Blowout with Scalp Massage",
  },
  {
    id: "deal-7",
    merchantName: "Glow Rituals",
    title: "Vitamin C Glow Peel With High-Frequency Finish",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    location: "South Loop, Chicago",
    distance: "4.2 mi",
    rating: 4.7,
    reviewCount: 410,
    originalPrice: 175,
    discountedPrice: 114,
    promoPrice: 45.99,
    promoCode: "NEWYEAR",
    percentOff: 35,
    isPopular: false,
    headline: "Vitamin C Glow Peel with High-Frequency Finish",
  },
  {
    id: "deal-8",
    merchantName: "Cypress Nail Atelier",
    title: "Deluxe Gel Manicure + Paraffin Wrap",
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
    location: "Old Town, Chicago",
    distance: "1.4 mi",
    rating: 4.9,
    reviewCount: 652,
    originalPrice: 120,
    discountedPrice: 79,
    promoPrice: 39.05,
    promoCode: "NEWYEAR",
    percentOff: 34,
    isPopular: true,
    headline: "Deluxe Gel Manicure & Paraffin Wrap",
  },
  {
    id: "deal-9",
    merchantName: "Harbor Day Spa",
    title: "Couples Spa Ritual with Champagne & Signature Massage",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    location: "Gold Coast, Chicago",
    distance: "1.1 mi",
    rating: 4.8,
    reviewCount: 288,
    originalPrice: 360,
    discountedPrice: 219,
    promoPrice: 55.12,
    promoCode: "NEWYEAR",
    percentOff: 39,
    isPopular: false,
    headline: "Couples Spa Ritual with Champagne Massage",
  },
  {
    id: "deal-10",
    merchantName: "Nectar Lash Studio",
    title: "Volume Lash Extensions with Luxury Sealant",
    imageUrl: "https://images.unsplash.com/photo-1510577908338-35d04bb3be63?auto=format&fit=crop&w=900&q=80",
    location: "Gold Coast, Chicago",
    distance: "0.9 mi",
    rating: 4.6,
    reviewCount: 312,
    originalPrice: 220,
    discountedPrice: 149,
    promoPrice: 39.99,
    promoCode: "NEWYEAR",
    percentOff: 32,
    isPopular: false,
    headline: "Volume Lash Extensions with Luxury Sealant",
  },
  {
    id: "deal-11",
    merchantName: "Moonlit Spa Collective",
    title: "Signature Detox Body Wrap with Gua Sha Finish",
    imageUrl: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80",
    location: "Lincoln Park, Chicago",
    distance: "2.3 mi",
    rating: 4.9,
    reviewCount: 186,
    originalPrice: 210,
    discountedPrice: 128,
    promoPrice: 43.99,
    promoCode: "NEWYEAR",
    percentOff: 39,
    isPopular: false,
    headline: "Detox Body Wrap with Gua Sha Finish",
  },
  {
    id: "deal-12",
    merchantName: "Opal Beauty Lounge",
    title: "Dermaplane & Oxygen Infusion with Eye Lift",
    imageUrl: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=900&q=80",
    location: "River North, Chicago",
    distance: "1.7 mi",
    rating: 4.7,
    reviewCount: 273,
    originalPrice: 185,
    discountedPrice: 119,
    promoPrice: 41.25,
    promoCode: "NEWYEAR",
    percentOff: 36,
    isPopular: false,
    headline: "Dermaplane & Oxygen Infusion with Eye Lift",
  },
]

function DealCard({ deal }: { deal: Deal }) {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden cursor-pointer rounded-[28px] border border-slate-200 bg-white transition ">
      <div className="relative aspect-video overflow-hidden rounded-t-[28px]">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {deal.isPopular ? (
          <Badge className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#fce8f8] px-3 py-1 text-xs font-semibold text-[#96004d] shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 14 15"
              className="h-3 w-3 text-special-pink"
            >
              <path
                fill="currentColor"
                d="M13.417 3.466H12.02c.14-.278.219-.583.23-.894A2.1 2.1 0 0 0 10.11.549 3.624 3.624 0 0 0 7 2.601 3.607 3.607 0 0 0 3.908.549h-.066A2.097 2.097 0 0 0 1.75 2.572v.038c.011.298.087.59.221.856H.583A.583.583 0 0 0 0 4.049V5.8a.583.583 0 0 0 .583.584h12.834A.583.583 0 0 0 14 5.799V4.05a.583.583 0 0 0-.583-.583Zm-3.288-1.75a.933.933 0 0 1 .954.856.926.926 0 0 1-.918.894H7.862c.363-.734 1.085-1.75 2.267-1.75Zm-7.212.875a.933.933 0 0 1 .941-.875c1.207.005 1.914 1.01 2.281 1.75H3.864a.943.943 0 0 1-.947-.875Zm5.25 4.958v7h2.916a1.75 1.75 0 0 0 1.75-1.75V7.55H8.167Zm-7 0h4.666v7H2.917a1.75 1.75 0 0 1-1.75-1.75V7.55Z"
              />
            </svg>
            <span className="text-[11px]">Popular Gift</span>
          </Badge>
        ) : null}
        <div className="absolute right-3 top-3">
          <Button variant="ghost" size="icon" className="bg-white text-slate-600 shadow">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
          <span className="h-1.5 w-6 rounded-full bg-white/70" />
          <span className="h-1.5 w-3 rounded-full bg-white/60" />
          <span className="h-1.5 w-3 rounded-full bg-white/60" />
        </div>
      </div>
      <CardContent className="space-y-2 p-5">
        <p className="text-sm text-slate-500">{deal.headline}</p>
        <h2 className="text-lg leading-snug text-slate-900 line-clamp-2 group-hover:underline">{deal.title}</h2>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">{deal.location}</span>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-slate-400 underline decoration-dotted decoration-slate-300" type="button">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="currentColor">
              <path d="m21.5 8.5-19-6 6 19 4-9 9-4Z" />
            </svg>
            {deal.distance}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
          <Star className="h-4 w-4 text-amber-500" />
          <span className="text-slate-900">{deal.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({deal.reviewCount})</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="line-through decoration-slate-400">${deal.originalPrice.toFixed(2)}</span>
            <span className="text-green-600">${(deal.originalPrice * 0.9).toFixed(2)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">${deal.discountedPrice.toFixed(2)}</span>
            <span className="text-xs font-bold text-rose-600">-{deal.percentOff}%</span>
            <span className="text-xs font-bold text-rose-600">Limited time</span>
          </div>
          {deal.promoPrice && deal.promoCode ? (
            <p className="text-sm font-semibold text-indigo-900">
              ${deal.promoPrice.toFixed(2)} with code <span className="text-indigo-500">{deal.promoCode}</span>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Marketplace() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("Marketplace"))
  }, [dispatch])
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <section className="space-y-4">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Local</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Things To Do</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Fun & Leisure</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-4xl font-semibold text-slate-900">Fun & Leisure Activities Near You in Chicago</h1>
            <ChevronDown className="h-5 w-5 text-slate-500" />
          </div>
        </section>

        <section>
          <ScrollArea className="rounded-2xl border border-slate-200 bg-white px-3 py-2 ">
            <div className="flex flex-nowrap items-center gap-3">
              {categoryPills.map((category, index) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={category.id === "all" ? "secondary" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500">
                      {category.count}
                    </span>
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-600">
              <Filter className="h-4 w-4" />
              Show filters
            </Button>
            <span className="text-xs tracking-wide text-slate-500">400+ deals</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-600">
              <ArrowUpDown className="h-4 w-4" />
              Sort by
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full border-slate-300 bg-white text-slate-700">
              <MapPin className="h-4 w-4" />
              Show Map
            </Button>
          </div>
        </section>

        <Separator className="border-slate-200" />

        <section className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" size="lg" className="border-slate-300 text-slate-700">
              Load more
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
