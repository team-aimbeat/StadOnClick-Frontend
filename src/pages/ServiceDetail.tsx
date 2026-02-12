import {
  BadgeCheck,
  Check,
  ChevronLeft,
  Heart,
  MapPinIcon,
  Share2,
  Star,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import salon1 from "@/assets/images/salon1.png";
import salon2 from "@/assets/images/salon2.png";
import salon3 from "@/assets/images/salon3.png";
import { BookingModal } from "@/components/booking/BookingModal";
import {
  slotStatusLegend,
  slotStatusMeta,
  SlotOption,
  SlotStatus,
} from "@/components/booking/slotData";
import { useAppSelector } from "@/app/hooks";

import { useGetVendorServicesQuery } from "@/services/vendorServicesApi";
import { useListMarketplaceServicesQuery } from "@/services/marketplaceApi";
import { useGetServiceMediaQuery } from "@/services/serviceMediaApi";
import {
  useGetServiceOfferingsQuery,
  useLazyGetOfferingSlotsQuery,
  VendorOffering,
  VendorSlot,
} from "@/services/vendorOfferingsApi";
import { DateTime } from "luxon";
import {
  useGetServiceReviewsQuery,
  useCreateReviewMutation,
} from "@/services/serviceReviewsApi";
import { useApplyCouponMutation } from "@/services/vendorOrdersApi";
import { useCreateCheckoutSessionMutation } from "@/services/checkoutApi";
import { useCreateAffiliateServiceLinkMutation } from "@/features/affiliate/api/affiliateApi";
import { Button } from "@/components/ui/button";
import { ServiceGallery } from "@/components/shared/ServiceGallery";
import { Badge } from "@/components/ui/badge";
import { LocationMap } from "@/components/marketplace/Map/LocationMap";
import toast from "react-hot-toast";
import { slugifyServiceTitle, slugToSearchQuery } from "@/utils/slugify";

const STOCKHOLM_TIMEZONE = "Europe/Stockholm";

const formatSlotLabel = (start: string, end?: string | null) => {
  const formatTime = (value: string) =>
    DateTime.fromISO(value).setZone(STOCKHOLM_TIMEZONE).toFormat("HH:mm");

  const startLabel = formatTime(start);
  if (!end) return startLabel;
  const endLabel = formatTime(end);
  return `${startLabel} - ${endLabel}`;
};

const getStockholmDateKey = (value?: Date | string) => {
  if (!value) return "";
  const dt =
    typeof value === "string"
      ? DateTime.fromISO(value).setZone(STOCKHOLM_TIMEZONE)
      : DateTime.fromJSDate(value).setZone(STOCKHOLM_TIMEZONE);
  return dt.toISODate();
};

const determineSlotStatus = (slot: VendorSlot): SlotStatus => {
  if (slot.status !== "OPEN") {
    return "unavailable";
  }

  const capacity = Math.max(slot.capacity ?? 1, 1);
  const remaining = Math.max(slot.remaining ?? 0, 0);
  const threshold = Math.max(1, Math.ceil(capacity * 0.25));
  return remaining <= threshold ? "few" : "available";
};

const formatSlotSeats = (slot: VendorSlot) => {
  const capacity = Math.max(slot.capacity ?? 0, 0);
  const remaining = Math.max(slot.remaining ?? 0, 0);
  return `${remaining} / ${capacity} seats`;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SEK",
  minimumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

type CartItem = {
  offering: VendorOffering;
  quantity: number;
  slotId: string | null;
};

export default function ServiceDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { serviceId: serviceIdParam, serviceSlug } = useParams<{
    serviceId?: string;
    serviceSlug?: string;
  }>();
  const authUser = useAppSelector((state) => state.auth.user);
  const userId = authUser?.id;
  const isAffiliate = (authUser?.roles ?? []).includes("AFFILIATE");

  const [createCheckoutSession, { isLoading: isCreatingSession }] =
    useCreateCheckoutSessionMutation();
  const [applyCoupon, { isLoading: isApplyingCoupon }] =
    useApplyCouponMutation();
  const [createAffiliateServiceLink, { data: affiliateLinkRes, isLoading: isGeneratingAffiliateLink }] =
    useCreateAffiliateServiceLinkMutation();

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [activeTab, setActiveTab] = useState<"services" | "description">(
    "services",
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date(),
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const selectedDateIso = selectedDate
    ? DateTime.fromJSDate(selectedDate)
        .setZone(STOCKHOLM_TIMEZONE, { keepLocalTime: true })
        .toISODate()
    : "";
  const formattedSelectedDate = selectedDate
    ? new Intl.DateTimeFormat("default", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(selectedDate)
    : "Pick a date";
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookedOffering, setBookedOffering] = useState<VendorOffering | null>(
    null,
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    value: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);


  const resetCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponError(null);
    
    
  };
  const [fetchOfferingSlots, { data: fetchedSlots }] =
    useLazyGetOfferingSlotsQuery();

  const slugSearchQuery = serviceSlug
    ? slugToSearchQuery(serviceSlug)
    : undefined;
  const affiliateRef = (searchParams.get("ref") ?? "").trim() || undefined;
  const referralCodeForCheckout = affiliateRef || undefined;
  const marketplaceParams = serviceIdParam
    ? { serviceId: serviceIdParam, ref: affiliateRef, limit: 12, offset: 0 }
    : slugSearchQuery
      ? { q: slugSearchQuery, ref: affiliateRef, limit: 12, offset: 0 }
      : undefined;

  const skipMarketplace = !serviceIdParam && !serviceSlug;

  const { data: marketplaceList, isLoading: marketplaceLoading } =
    useListMarketplaceServicesQuery(marketplaceParams, {
      skip: skipMarketplace,
    });

  const matchedMarketplaceService = useMemo(() => {
    if (!marketplaceList?.data || marketplaceList.data.length === 0)
      return undefined;
    if (serviceIdParam) {
      return marketplaceList.data[0];
    }
    if (!serviceSlug) return undefined;
    return marketplaceList.data.find(
      (row) => slugifyServiceTitle(row.title) === serviceSlug,
    );
  }, [marketplaceList?.data, serviceIdParam, serviceSlug]);

  const vendorId = matchedMarketplaceService?.vendorId;
  const serviceCity = matchedMarketplaceService?.cityName ?? "—";
  const rules = matchedMarketplaceService?.offeringsPreview ?? "—";
  console.log(rules);
  useEffect(() => {
    if (bookedOffering) {
      fetchOfferingSlots({
        offeringId: bookedOffering.id,
        vendorId: vendorId,
      });
    }
  }, [bookedOffering, fetchOfferingSlots]);

  const slotsForBookedOffering = useMemo(
    () => (bookedOffering ? (fetchedSlots ?? bookedOffering.slots ?? []) : []),
    [bookedOffering, fetchedSlots],
  );

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return slotsForBookedOffering;
    return slotsForBookedOffering.filter((slot) => {
      const slotDate = getStockholmDateKey(slot.startTime);
      return slotDate === selectedDateIso;
    });
  }, [slotsForBookedOffering, selectedDateIso, selectedDate]);

  const bookingSlotOptions = useMemo<SlotOption[]>(() => {
    return slotsForSelectedDate.map((slot) => ({
      id: slot.id,
      label: formatSlotLabel(slot.startTime, slot.endTime),
      status: determineSlotStatus(slot),
      seats: formatSlotSeats(slot),
    }));
  }, [slotsForSelectedDate]);
  const selectedSlot = bookingSlotOptions.find(
    (slot) => slot.id === selectedSlotId,
  );
  const requiresSlot =
    (bookedOffering?.usesSlots ?? false) || slotsForBookedOffering.length > 0;

  const addOrUpdateCartItem = (
    offering: VendorOffering,
    slotId: string | null,
  ) => {
    resetCoupon();
    setCartItems((prev) => {
      const exists = prev.find((item) => item.offering.id === offering.id);
      if (exists) {
        return prev.map((item) =>
          item.offering.id === offering.id
            ? { ...item, slotId: slotId ?? item.slotId }
            : item,
        );
      }
      return [...prev, { offering, quantity: 1, slotId }];
    });
  };

  const updateCartQuantity = (offeringId: string, delta: number) => {
    resetCoupon();
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.offering.id !== offeringId) return item;
          const nextQuantity = Math.max(item.quantity + delta, 1);
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveCartItem = (offeringId: string) => {
    resetCoupon();
    setCartItems((prev) =>
      prev.filter((item) => item.offering.id !== offeringId),
    );
  };

  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.offering.salePrice * item.quantity,
    0,
  );
  const cartTaxRate = 0.12;
  const cartTaxes = cartSubtotal * cartTaxRate;
  const cartDiscount = couponDiscount;
  const cartTotal = cartSubtotal + cartTaxes;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    if (cartItems.length === 0) {
      toast.success("Add services to your cart before applying a coupon.");
      return;
    }

    try {
      const response = await applyCoupon({
        vendorId: vendorId,
        promoCode: promoCode.trim(),
        subtotal: cartSubtotal,
      }).unwrap();

      setCouponDiscount(response.data.discount);
      setAppliedCoupon(response.data.coupon);
      setCouponError(null);
      toast.success(`Coupon ${response.data.coupon.code} applied`);
    } catch (error: any) {
      resetCoupon();
      setCouponError(
        error?.data?.message ||
          error?.error ||
          "Coupon is not valid for this cart",
      );
    }
  };

  const openBookingModal = (offering: VendorOffering) => {
    setBookedOffering(offering);
    setSelectedSlotId(null);
    setBookingModalOpen(true);
  };

  const handleBookClick = (offering: VendorOffering) => {
    const slots = offering.slots ?? [];
    const slotCount = slots.length;
    const requiresSlot = offering.usesSlots || slotCount > 0;

    if (requiresSlot) {
      if (slotCount === 0) {
        toast.success("Slots are unavailable for this service at the moment.");
        return;
      }
      openBookingModal(offering);
      return;
    }

    addOrUpdateCartItem(offering, null);
    toast.success("Added service to your cart. Checkout when ready.");
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
    setSelectedSlotId(null);
    setBookedOffering(null);
  };

  const handleConfirmBooking = () => {
    if (!bookedOffering) return;
    if (requiresSlot && !selectedSlot) {
      toast.success("Please choose a slot before confirming.");
      return;
    }

    addOrUpdateCartItem(
      bookedOffering,
      requiresSlot ? (selectedSlot?.id ?? null) : null,
    );
    toast.success("Added service to your cart. Checkout when ready.");
    handleCloseBooking();
  };

  const handleCheckoutCart = async () => {
    if (cartItems.length === 0) {
      toast.success("Add at least one service to your order before booking.");
      return;
    }

    if (!userId) {
      toast.error("Sign in to confirm a booking before proceeding.");
      return;
    }

    if (!vendorId) {
      toast.error("Unable to resolve the vendor for this booking.");
      return;
    }

    try {
      const response = await createCheckoutSession({
        userId,
        vendorId,
        items: cartItems.map((item) => ({
          offeringId: item.offering.id,
          quantity: item.quantity,
          slotId: item.slotId ?? undefined,
        })),
        promoCode: appliedCoupon?.code || undefined,
        referralCode: referralCodeForCheckout,
      }).unwrap();

      if (typeof window !== "undefined") {
        const storagePayload = {
          orderId: response.data?.orderId ?? null,
          sessionId: response.data?.sessionId ?? null,
        };

        if (storagePayload.orderId || storagePayload.sessionId) {
          window.sessionStorage.setItem(
            "stadonclick.latestOrderReceipt",
            JSON.stringify(storagePayload),
          );
        }
      }

      setCartItems([]);
      setPromoCode("");
      resetCoupon();

      toast.success("Redirecting you to Stripe checkout…");
      const redirectUrl = response.data?.sessionUrl;
      if (redirectUrl && typeof window !== "undefined") {
        window.location.assign(redirectUrl);
      }
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);
      const serverMessage = error?.data?.message || error?.error;
      toast.error(
        serverMessage || "Failed to start checkout. Please try again.",
      );
    }
  };

  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();

  const { data: vendorServices, isLoading: servicesLoading } =
    useGetVendorServicesQuery(vendorId ?? "", {
      skip: !vendorId,
    });

  const service =
    vendorServices != null
      ? serviceIdParam
        ? vendorServices.find((item) => item.id === serviceIdParam)
        : serviceSlug
          ? vendorServices.find(
              (item) => slugifyServiceTitle(item.title) === serviceSlug,
            )
          : vendorServices[0]
      : undefined;
  const currentServiceId = service?.id;

  // 2. Fetch Media (isolated)
  const { data: media, isLoading: mediaLoading } = useGetServiceMediaQuery(
    currentServiceId ?? "",
    {
      skip: !currentServiceId,
    },
  );

  // 3. Fetch Offerings (isolated)
  const { data: offerings, isLoading: offeringsLoading } =
    useGetServiceOfferingsQuery(currentServiceId ?? "", {
      skip: !currentServiceId,
    });

  const { data: reviews, isLoading: reviewsLoading } =
    useGetServiceReviewsQuery(currentServiceId ?? "", {
      skip: !currentServiceId,
    });

  const starBreakdown = useMemo(() => {
    const list = reviews ?? [];
    const total = list.length;
    if (total === 0) {
      return [5, 4, 3, 2, 1].map((rating) => ({
        label: `${rating} ⭐`,
        percent: 0,
      }));
    }
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = list.filter((review) => review.rating === rating).length;
      const percent = Math.round((count / total) * 100);
      return {
        label: `${rating} ⭐`,
        percent,
      };
    });
  }, [reviews]);

  const descriptionRules = useMemo(() => {
    const seen = new Map<string, { label: string; value?: string | null }>();
    for (const offering of offerings ?? []) {
      for (const rule of offering.rules ?? []) {
        const key = `${rule.ruleType}:${rule.value ?? ""}`;
        if (!seen.has(key)) {
          seen.set(key, {
            label: formatRuleLabel(rule.ruleType),
            value: rule.value ?? null,
          });
        }
      }
    }
    return Array.from(seen.values());
  }, [offerings]);

  const handleSubmitReview = async () => {
    if (!currentServiceId) return;
    if (userRating === 0) {
      toast.success("Please select a rating");
      return;
    }

    try {
      await createReview({
        userId,
        serviceId: currentServiceId,
        rating: userRating,
        comment: userComment,
      }).unwrap();
      setUserRating(0);
      setUserComment("");
      toast.success("Review submitted successfully!");
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.success("Failed to submit review. Please try again.");
    }
  };

  if (
    marketplaceLoading ||
    servicesLoading ||
    mediaLoading ||
    offeringsLoading ||
    reviewsLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Service not found
      </div>
    );
  }

  const galleryImages = media
    ?.filter((m) => m.type === "IMAGE")
    .map((m) => m.signedUrl) || [salon1, salon2, salon3];
  const tabs: { id: "services" | "description"; label: string }[] = [
    { id: "services", label: "Services" },
    { id: "description", label: "Description" },
  ];
  const serviceDescription =
    service.description ||
    "Our team curates a premium experience for every guest—scroll through the service options to choose what fits your visit.";

  const statusStyles: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    PAUSED: "bg-red-100 text-red-700",
    LIVE: "bg-green-100 text-green-700",
  };

  return (
    <section className="min-h-screen bg-[#F4F6FA] py-10 text-slate-700 ">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 ">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4 mt-4" />
          Back to services
        </button>
        <div className="rounded-xl ">
          <div className="grid gap-6 lg:grid-cols-[0.fr_1.5fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">
                    {service.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-black">
                    <div className="flex">
                      <MapPinIcon className="h-5 w-5 " />
                      <div className="ml-2 font-semibold">{serviceCity}</div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full px-3 py-1 font-bold ">
                      <Star className="h-4 w-4 fill-[#F4D62F] text-[#F4D62F] " />
                      {reviews && reviews.length > 0
                        ? (
                            reviews.reduce((acc, r) => acc + r.rating, 0) /
                            reviews.length
                          ).toFixed(1)
                        : "0.0"}
                    </div>
                    <span className="text-xs text-black">
                      ({reviews?.length || 0}+ verified guest reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ServiceGallery
                galleryImages={galleryImages}
                serviceName={service.title}
              />
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {service.status && (
                  <span
                    className={`rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold ${statusStyles[service.status] ?? "border-slate-200 text-slate-700"}`}
                  >
                    {service.status}
                  </span>
                )}
              </div>

              {isAffiliate && (
                <div className="w-full max-w-[520px] rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-blue-900">
                      Affiliate link for this service
                    </p>
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!service.id) return;
                        try {
                          await createAffiliateServiceLink({ serviceId: service.id }).unwrap();
                        } catch (error: any) {
                          toast.error(error?.data?.message || "Unable to generate affiliate link.");
                        }
                      }}
                      disabled={isGeneratingAffiliateLink}
                      className="ml-auto"
                    >
                      {isGeneratingAffiliateLink ? "Generating..." : "Generate Link"}
                    </Button>
                  </div>

                  {affiliateLinkRes?.data?.url ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-blue-800">Referral code</p>
                      <p className="text-sm font-semibold text-blue-900">{affiliateLinkRes.data.code}</p>
                      <p className="text-xs text-blue-800">Shareable link</p>
                      <div className="rounded-lg border border-blue-200 bg-white p-2 text-xs font-mono break-all text-slate-700">
                        {affiliateLinkRes.data.url}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          await navigator.clipboard.writeText(affiliateLinkRes.data.url);
                          toast.success("Affiliate link copied");
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* <div className="space-y-5 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-slate-600">
                  {service.location}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Curated by StadOnClick</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {service.rating.toFixed(1)} average rating
                </p>
                <p className="text-xs text-slate-400">{service.reviews} reviews</p>
              </div>
              <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Book a slot
              </button>
              <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-slate-300">
                Send enquiry
              </button>
            </div> */}
          </div>
        </div>

        <div className="grid gap-6 grid-cols-5">
          <div className="col-span-3">
            <div className="space-y-5 rounded-3xl bg-white p-8 ">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Services
                  </h2>
                  <p className="text-sm text-slate-500">
                    Choose a ritual that suits your mood
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-500">
                  {offerings?.length || 0} packages
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mt-5">
                {activeTab === "services" ? (
                  <div className="space-y-4">
                    {offerings?.map((offering) => {
                      const slotCount = offering.slots?.length ?? 0;
                      const requiresSlot = offering.usesSlots || slotCount > 0;
                      const buttonLabel = requiresSlot
                        ? slotCount > 0
                          ? "Book"
                          : "Slots unavailable"
                        : "Add to cart";
                      const isSlotUnavailable = requiresSlot && slotCount === 0;
                      return (
                        <div
                          key={offering.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm"
                        >
                          <div>
                            <p className="text-base font-semibold text-slate-900">
                              {offering.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {offering.id}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              Max Qty: {offering.maxQuantity || "N/A"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <span className="text-lg font-bold text-slate-900">
                              ${offering.salePrice}
                            </span>
                            <button
                              className={`min-w-[30px]  rounded-lg border bg-white border-blue-200 px-4 py-2 text-sm font-semibold text-blue-400 ${
                                isSlotUnavailable
                                  ? "bg-slate-300 cursor-not-allowed opacity-60"
                                  : "bg-blue-500 hover:bg-white hover:text-blue-800 hover:border-blue-600  "
                              }`}
                              disabled={isSlotUnavailable}
                              onClick={() => handleBookClick(offering)}
                            >
                              {buttonLabel}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">
                      {serviceDescription} {offerings.rules}
                    </p>
                    <p className="text-xs text-slate-400">
                      {`We keep this experience updated—check the services tab to explore current offerings.`}
                    </p>
                    {descriptionRules.length > 0 && (
                      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">
                            Service rules
                          </p>
                          <span className="text-xs font-medium text-slate-400">
                            {descriptionRules.length} total
                          </span>
                        </div>
                        <div className="space-y-1">
                          {descriptionRules.map((rule) => (
                            <div
                              key={`${rule.label}-${rule.value}`}
                              className="flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-500"
                            >
                              <span className="text-slate-700">
                                {rule.label}
                              </span>
                              {rule.value ? (
                                <span className="text-slate-400">—</span>
                              ) : null}
                              {rule.value ? <span>{rule.value}</span> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Your order
                  </h3>
                  <p className="text-xs text-slate-500">
                    Added services appear here. Adjust quantity anytime.
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </span>
              </div>
              {cartItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Choose a service from the list to start your booking.
                </p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.offering.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.offering.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.offering.description ?? "Premium experience"}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item.offering.id)}
                          className="mt-2 text-xs font-semibold text-blue-600"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(item.offering.salePrice)} per person
                        </p>
                        <div className="mt-2 flex items-center justify-end gap-2 rounded-full  px-2 py-1">
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full bg-slate-200 text-sm font-semibold text-slate-700 shadow-sm"
                            onClick={() =>
                              updateCartQuantity(item.offering.id, -1)
                            }
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full bg-slate-200 text-sm font-semibold text-slate-700 shadow-sm"
                            onClick={() =>
                              updateCartQuantity(item.offering.id, 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-semibold text-slate-900">
                  Wallet & promo
                </h4>
                <p className="text-xs text-slate-500">
                  Apply discount or use StadOnClick wallet balance.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                  <Button
                    variant={"default"}
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim() || isApplyingCoupon}
                    className="min-w-[30px]  rounded-lg border bg-blue-50 border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 "
                  >
                    {isApplyingCoupon ? "Checking..." : "Apply"}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs font-semibold text-red-600">
                    {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <span>
                      Coupon {appliedCoupon.code} applied (
                      {appliedCoupon.discountType === "FLAT"
                        ? formatCurrency(appliedCoupon.value)
                        : `${appliedCoupon.value}%`}
                      )
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        resetCoupon();
                        setPromoCode("");
                      }}
                      className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900">
                    {formatCurrency(cartSubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Taxes</span>
                  <span className="text-slate-900">
                    {formatCurrency(cartTaxes)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Discount</span>
                  <span className="text-emerald-600">
                    −{formatCurrency(cartDiscount)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              <Button
                onClick={handleCheckoutCart}
                className="w-full"
                disabled={cartItems.length === 0 || isCreatingSession}
              >
                {isCreatingSession ? "Processing..." : "Confirm booking"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-5 rounded-3xl bg-white max-w-[800px] max-h-[380px] p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {service.title}'s Location
              </h2>

              <a
                href={`https://www.google.com/maps?q=${service.latitude},${service.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Directions
              </a>
            </div>

            <LocationMap
              lat={service.latitude}
              lng={service.longitude}
              name={service.title}
            />
          </div>
        </div>

        <div className="max-w-[800px]">
          {/* Highlights & Amenities Section */}
          <div className="space-y-6 rounded-3xl bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Highlights & Amenities
            </h2>
            <div className="flex flex-wrap gap-4">
              {["AC Rooms", "Parking Available", "Family Friendly"].map(
                (amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4"
                  >
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[15px] font-medium text-slate-700">
                      {amenity}
                    </span>
                  </div>
                ),
              )}
            </div>

            {/* Menu Preview Section */}
            <div className="space-y-4 rounded-3xl bg-white p-8">
              <h3 className="text-xl font-bold text-slate-900">Menu Preview</h3>
              <p className="text-sm text-slate-500">
                View uploaded menu photos from the restaurant
              </p>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="min-w-[100px] shrink-0">
                    <img
                      src={galleryImages[i % galleryImages.length]}
                      alt={`Menu preview ${i}`}
                      className="h-48 w-full rounded-2xl object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[800px]">
          {/* Trust/Feature Banner */}
          <div className="rounded-3xl bg-white p-8">
            <div className="grid grid-cols-4 gap-8">
              {[
                {
                  icon: <BadgeCheck className="h-6 w-6 text-emerald-500" />,
                  title: "Verified Providers",
                  desc: "Trusted & quality-checked",
                },
                {
                  icon: (
                    <svg
                      className="h-6 w-6 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                  title: "Secure Payments",
                  desc: "Protected transactions",
                },
                {
                  icon: (
                    <svg
                      className="h-6 w-6 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Easy Rescheduling",
                  desc: "Change plans easily",
                },
                {
                  icon: (
                    <svg
                      className="h-6 w-6 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ),
                  title: "Customer Support",
                  desc: "We're here to help",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-3xl bg-white p-8 ">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
              <p className="text-sm text-slate-500">
                Guests recap their experience in the studio lounge and treatment
                rooms.
              </p>
            </div>
            <button className="text-sm font-semibold text-blue-600">
              View all {reviews?.length || 0} reviews
            </button>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {reviews?.map((review) => {
              const reviewerName =
                review.user?.nickName?.trim() ||
                [review.user?.firstName?.trim(), review.user?.lastName?.trim()]
                  .filter(Boolean)
                  .join(" ") ||
                "Anonymous User";
              const reviewerInitial = reviewerName.charAt(0).toUpperCase();

              return (
              <article
                key={review.id}
                className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                    {reviewerInitial}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold text-slate-900">
                        {reviewerName}
                      </p>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check className="h-3 w-3 stroke-[3px]" />
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= review.rating
                              ? "fill-orange-400 text-orange-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600">
                  {review.comment}
                </p>
                <div className="text-[13px] font-medium text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </article>
              );
            })}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.0fr_0.9fr]">
            <div className="space-y-3 rounded-2xl border border-slate-100 p-5">
              <p className="text-lg font-semibold text-slate-900">
                Customer reviews
              </p>
              <div className="flex items-center gap-3">
                <p className="text-4xl font-bold text-slate-900">
                  {reviews && reviews.length > 0
                    ? (
                        reviews.reduce((acc, r) => acc + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
                <div className="flex flex-col text-sm text-slate-500">
                  <span>Based on {reviews?.length || 0} reviews</span>
                  <span>Let us know what stood out</span>
                </div>
              </div>
              <div className="space-y-2">
                {starBreakdown.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 text-xs font-semibold text-slate-500"
                  >
                    <span className="w-12">{row.label}</span>
                    <div className="flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span>{row.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Write a Review
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  Your rating
                </p>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || userRating)
                          ? "fill-orange-400 text-orange-400"
                          : "text-orange-400"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={userComment}
                onChange={(evt) => setUserComment(evt.target.value)}
                placeholder="Tell fellow guests what made your visit special"
                className="min-h-35 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus:border-blue-400 focus:outline-none"
              />

              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className=""
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        serviceName={service.title}
        bookedOfferingName={bookedOffering?.name}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        selectedSlotId={selectedSlotId}
        formattedSelectedDate={formattedSelectedDate}
        selectedDateIso={selectedDateIso}
        slotOptions={bookingSlotOptions}
        slotStatusLegend={slotStatusLegend}
        slotStatusMeta={slotStatusMeta}
        requiresSlot={requiresSlot}
        isLoading={isCreatingSession}
        onSelectDate={(date) => setSelectedDate(date)}
        onSelectSlot={(slotId) => setSelectedSlotId(slotId)}
        onClose={handleCloseBooking}
        onConfirm={handleConfirmBooking}
      />
    </section>
  );
}
