import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import bannerImage from "@/assets/Images/bgsalon.jpg"
import { ChevronDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/app/hooks"
import {
  hasActivePaidPlan,
  useGetMyPlanQuery,
} from "@/features/userSubscriptions/api/userSubscriptionsApi"
import { slugifyServiceTitle } from "@/utils/slugify"
import { Service } from "./types"
import ServicesSidebar from "./ServicesSidebar"
import EnquiryModal from "./enquiry/EnquiryModal"
import ServiceCard from "./ServiceCard"
import {
  type MarketplaceService,
  useLazyListMarketplaceServicesQuery,
} from "@/services/marketplaceApi"
import { useListServiceCategoriesQuery } from "@/services/serviceCategoriesApi"
import { useGetCitiesQuery } from "@/features/auth/api/authApi"

const PAGE_SIZE = 18
const PRICE_MIN = 0
const PRICE_MAX = 10000
const DEFAULT_RATING_FILTER = 4.5

const formatMoney = (amount: number, currency: string) => {
  try {
    const locale =
      currency === "SEK" ? "sv-SE" : currency === "INR" ? "en-IN" : undefined
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

const toServiceCardModel = (
  service: MarketplaceService,
  canAccessHotDeals: boolean,
): Service => {
  const images = service.mediaUrls?.length
    ? service.mediaUrls
    : service.thumbnailUrl
      ? [service.thumbnailUrl]
      : []

  const details = (service.offeringsPreview ?? []).map((offering) => ({
    title: offering.name,
    subtitle: offering.description ?? undefined,
    duration: offering.durationLabel ?? undefined,
    price: formatMoney(
      canAccessHotDeals ? offering.salePrice ?? offering.basePrice : offering.basePrice,
      offering.currency ?? "INR",
    ),
    compareAtPrice:
      canAccessHotDeals && offering.basePrice > offering.salePrice
        ? formatMoney(offering.basePrice, offering.currency ?? "INR")
        : undefined,
    discountPercent: canAccessHotDeals ? offering.discountPercent : undefined,
    dealEndTime: canAccessHotDeals ? offering.dealEndTime ?? undefined : undefined,
    isDealActive: canAccessHotDeals ? offering.isDealActive : false,
  }))

  const fallbackPrice =
    service.priceMin != null ? formatMoney(service.priceMin, "SEK") : "Price on request"

  return {
    id: service.id,
    vendorId: service.vendorId,
    title: service.title || service.vendorName,
    location: service.cityName ?? "-",
    rating: service.ratingAvg,
    reviews: service.ratingCount,
    image: images[0] ?? bannerImage,
    images,
    slug: slugifyServiceTitle(service.title),
    categoryName: service.categoryName ?? "-",
    categoryId: service.categoryId,
    details:
      details.length > 0
        ? details
        : [
            {
              title: service.title || "Service details",
              subtitle: "Offering details will be available soon",
              price: fallbackPrice,
            },
          ],
  }
}
export type ServicesExplorerProps = {
  services?: Service[]
  headerTitle?: string
  headerDescription?: string
  bannerImage?: string
  stats?: { label: string; color: string }[]
}

const defaultStats = [
  { label: "24 stylists online now", color: "bg-emerald-400" },
  { label: "98% booked for this week", color: "bg-sky-400" },
  { label: "Avg. response under 10 min", color: "bg-amber-400" },
]

function MarketplaceCardSkeleton({ index }: { index: number }) {
  return (
    <div
      key={`marketplace-skeleton-${index}`}
      className="flex h-155 w-81.25 flex-col overflow-hidden rounded-lg bg-white shadow-md"
    >
      <Skeleton className="h-50 w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-12" />
        </div>

        <div className="flex-1 space-y-3">
          {Array.from({ length: 3 }).map((_, detailIndex) => (
            <div key={`marketplace-skeleton-detail-${index}-${detailIndex}`} className="h-17 rounded-sm bg-[#F6F6F6] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Skeleton className="h-10 min-w-33.75 rounded-lg" />
          <Skeleton className="h-10 min-w-33.75 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function ServicesExplorer({
  services: providedServices,
  headerTitle = "Services near you",
  headerDescription = "Explore and book local services · 132 results",
  bannerImage: headerBanner = bannerImage,
  stats,
}: ServicesExplorerProps = {}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [enquiryService, setEnquiryService] = useState<Service | null>(null)
  const authUser = useAppSelector((state) => state.auth.user)
  const { data: myPlanRes } = useGetMyPlanQuery(undefined, { skip: !authUser })
  const canAccessHotDeals = hasActivePaidPlan(myPlanRes?.data)

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([])
  const [ratingMin, setRatingMin] = useState<number | undefined>(undefined)
  const [priceRange, setPriceRange] = useState({ min: PRICE_MIN, max: PRICE_MAX })
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: PRICE_MIN, max: PRICE_MAX })

  const { data: serviceCategories = [] } = useListServiceCategoriesQuery()
  const { data: citiesResponse } = useGetCitiesQuery()
  const cities = citiesResponse?.data ?? []

  const [triggerList, listState] = useLazyListMarketplaceServicesQuery()
  const [marketplaceRows, setMarketplaceRows] = useState<MarketplaceService[]>([])
  const [marketplaceTotal, setMarketplaceTotal] = useState<number | undefined>(undefined)
  const didHydrateCategoryFromQueryRef = useRef(false)

  const requestIdRef = useRef(0)
  const inFlightRef = useRef(false)
  const rowsLengthRef = useRef(0)
  const hasMoreRef = useRef(true)
  const isFetchingRef = useRef(false)

  useEffect(() => {
    rowsLengthRef.current = marketplaceRows.length
  }, [marketplaceRows.length])

  const hasMore = marketplaceTotal == null ? true : marketplaceRows.length < marketplaceTotal

  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  useEffect(() => {
    isFetchingRef.current = listState.isFetching
  }, [listState.isFetching])

  const baseQueryParams = useMemo(() => {
    const params: Record<string, unknown> = { sort: "POPULAR" }
    if (selectedCategoryIds.length) params.categoryIds = selectedCategoryIds
    if (selectedCityIds.length) params.cityIds = selectedCityIds
    if (ratingMin != null) params.ratingMin = ratingMin
    if (appliedPriceRange.min > PRICE_MIN) params.minPrice = appliedPriceRange.min
    if (appliedPriceRange.max < PRICE_MAX) params.maxPrice = appliedPriceRange.max
    return params
  }, [appliedPriceRange.max, appliedPriceRange.min, ratingMin, selectedCategoryIds, selectedCityIds])

  const baseQueryKey = useMemo(() => JSON.stringify(baseQueryParams), [baseQueryParams])

  const loadNextPage = useCallback(async () => {
    if (providedServices) return
    if (!hasMoreRef.current) return
    if (inFlightRef.current) return

    const offset = rowsLengthRef.current
    inFlightRef.current = true
    const activeRequestId = requestIdRef.current

    try {
      const response = await triggerList(
        {
          ...(baseQueryParams as any),
          limit: PAGE_SIZE,
          offset,
        },
        true,
      ).unwrap()

      if (requestIdRef.current !== activeRequestId) return

      setMarketplaceTotal(response.total)
      setMarketplaceRows((prev) => {
        if (offset === 0) return response.data
        return [...prev, ...response.data]
      })
    } catch (error) {
      console.error("Failed to load marketplace services", error)
    } finally {
      inFlightRef.current = false
    }
  }, [baseQueryParams, providedServices, triggerList])

  useEffect(() => {
    if (providedServices) return

    requestIdRef.current += 1
    inFlightRef.current = false
    rowsLengthRef.current = 0
    hasMoreRef.current = true
    setMarketplaceRows([])
    setMarketplaceTotal(undefined)

    void loadNextPage()
  }, [baseQueryKey, loadNextPage, providedServices])

  useEffect(() => {
    if (providedServices) return

    let rafId = 0

    const onScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        if (isFetchingRef.current) return
        if (!hasMoreRef.current) return

        const threshold = 500
        const scrollPosition = window.scrollY + window.innerHeight
        const bottom = document.documentElement.scrollHeight - threshold
        if (scrollPosition >= bottom) {
          void loadNextPage()
        }
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [loadNextPage, providedServices])

  const activeServices = useMemo(() => {
    if (providedServices) return providedServices
    const mapped = marketplaceRows.map((row) => toServiceCardModel(row, canAccessHotDeals))
    if (mapped.length) return mapped
    return []
  }, [canAccessHotDeals, marketplaceRows, providedServices])


  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of marketplaceRows) {
      counts.set(row.categoryId, (counts.get(row.categoryId) ?? 0) + 1)
    }
    return counts
  }, [marketplaceRows])

 
  const cityCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of marketplaceRows) {
      if (!row.cityName) continue
      const city = cities.find((c) => c.name === row.cityName)
      if (!city) continue
      counts.set(city.id, (counts.get(city.id) ?? 0) + 1)
    }
    return counts
  }, [cities, marketplaceRows])

  const sidebarCategories = useMemo(
    () =>
      serviceCategories.map((category) => ({
        id: category.id,
        label: category.name,
        count: categoryCounts.get(category.id) ?? 0,
      })),
    [categoryCounts, serviceCategories],
  )

  const sidebarLocations = useMemo(
    () =>
      cities.map((city) => ({
        id: city.id,
        label: city.name,
        count: cityCounts.get(city.id) ?? 0,
      })),
    [cities, cityCounts],
  )

  const requestedCategoryTokens = useMemo(() => {
    const rawCategory = searchParams.get("category")
    const rawCategoryIds = searchParams.get("categoryIds")
    const merged = [rawCategory, rawCategoryIds].filter(Boolean).join(",")
    return merged
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  }, [searchParams])

  useEffect(() => {
    if (didHydrateCategoryFromQueryRef.current) return
    if (!requestedCategoryTokens.length) {
      didHydrateCategoryFromQueryRef.current = true
      return
    }
    if (!serviceCategories.length) return

    const selectedIds = serviceCategories
      .filter((category) => {
        const id = category.id.toLowerCase()
        const slug = category.slug.toLowerCase()
        return requestedCategoryTokens.includes(id) || requestedCategoryTokens.includes(slug)
      })
      .map((category) => category.id)

    if (selectedIds.length) {
      setSelectedCategoryIds(selectedIds)
    }

    didHydrateCategoryFromQueryRef.current = true
  }, [requestedCategoryTokens, serviceCategories])

  const effectiveHeaderDescription =
    providedServices == null && marketplaceTotal != null
      ? `Explore and book local services Â· ${marketplaceTotal} results`
      : headerDescription

  const statRows = stats ?? defaultStats
  const showInitialSkeleton =
    providedServices == null && listState.isFetching && marketplaceRows.length === 0
  const showPaginationSkeleton =
    providedServices == null && listState.isFetching && marketplaceRows.length > 0

  const toggleSelected = (ids: string[], id: string) =>
    ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id]

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) => toggleSelected(prev, categoryId))
  }

  const handleToggleLocation = (cityId: string) => {
    setSelectedCityIds((prev) => toggleSelected(prev, cityId))
  }

  const handleClearAll = () => {
    setSelectedCategoryIds([])
    setSelectedCityIds([])
    setRatingMin(undefined)
    setPriceRange({ min: PRICE_MIN, max: PRICE_MAX })
    setAppliedPriceRange({ min: PRICE_MIN, max: PRICE_MAX })
  }

  const handleToggleRatingMin = (value: number) => {
    setRatingMin((prev) => (prev === value ? undefined : value))
  }

  const handleApplyPrice = () => {
    setAppliedPriceRange(priceRange)
  }

  const handleResetPrice = () => {
    setPriceRange({ min: PRICE_MIN, max: PRICE_MAX })
    setAppliedPriceRange({ min: PRICE_MIN, max: PRICE_MAX })
  }

  return (
    <section className="min-h-screen bg-[#F9F9F9] py-8">
      <div className="mx-auto flex items-start max-w-370 gap-8 px-6 lg:px-8">
        <ServicesSidebar
          categories={sidebarCategories}
          locations={sidebarLocations}
          selectedCategoryIds={selectedCategoryIds}
          selectedLocationIds={selectedCityIds}
          onToggleCategory={handleToggleCategory}
          onToggleLocation={handleToggleLocation}
          ratingMin={ratingMin}
          onToggleRatingMin={() => handleToggleRatingMin(DEFAULT_RATING_FILTER)}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          onApplyPrice={handleApplyPrice}
          onResetPrice={handleResetPrice}
          onClearAll={handleClearAll}
        />

        <div className="flex-1 space-y-6">
          <header
            className="relative overflow-hidden rounded-[28px] px-6 py-6 text-white shadow-[0_18px_40px_-24px_rgba(29,118,255,0.65)]"
            style={{
              backgroundImage: `url(${headerBanner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(62,87,222,0.9)_0%,rgba(74,105,242,0.82)_42%,rgba(84,118,255,0.56)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(16,24,40,0.12))]" />

            <div className="relative flex max-w-2xl flex-col gap-5 py-3">
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">
                  Limited Offer
                </span>
                <div className="space-y-2">
                  <h1 className="max-w-xl text-[32px] font-bold leading-tight text-white sm:text-[36px]">
                    {headerTitle}
                  </h1>
                  <p className="max-w-xl text-[14px] leading-6 text-white/75 sm:text-[15px]">
                    Book premium home services with verified experts.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#415ee6] shadow-[0_16px_30px_-18px_rgba(15,23,42,0.5)] transition hover:translate-y-[-1px] hover:bg-slate-50"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-white/85">
                {statRows.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm"
                  >
                    <span className={`h-2 w-2 rounded-full ${stat.color}`} />
                    {stat.label}
                  </div>
                ))}
              </div>
            </div>
          </header>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showInitialSkeleton
              ? Array.from({ length: 6 }).map((_, index) => (
                  <MarketplaceCardSkeleton key={`initial-skeleton-${index}`} index={index} />
                ))
              : activeServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    canAccessHotDeals={canAccessHotDeals}
                    onViewDetails={(item) => navigate(`/service/${item.slug}`)}
                    onEnquiry={(item) => setEnquiryService(item)}
                  />
                ))}
            {showPaginationSkeleton
              ? Array.from({ length: 3 }).map((_, index) => (
                  <MarketplaceCardSkeleton key={`pagination-skeleton-${index}`} index={index + 100} />
                ))
              : null}
          </div>
        </div>
      </div>
      {enquiryService && (
        <EnquiryModal service={enquiryService} onClose={() => setEnquiryService(null)} />
      )}
    </section>
  )
}


