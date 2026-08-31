import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Check,
  ChevronLeft,
  Eye,
  Heart,
  Lock,
  MapPinIcon,
  Snowflake,
  Share2,
  Star,
  TicketPercent,
  Users,
  Wallet,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import salon1 from "@/assets/Images/salon1.png";
import salon2 from "@/assets/Images/salon2.png";
import salon3 from "@/assets/Images/salon3.png";
import map from "@/assets/icons/map.png";
import { BookingModal } from "@/components/booking/BookingModal";
import {
  slotStatusLegend,
  slotStatusMeta,
  SlotOption,
  SlotStatus,
} from "@/components/booking/slotData";
import { useAppSelector } from "@/app/hooks";

import { useGetVendorServicesQuery } from "@/services/vendorServicesApi";
import {
  useGetVendorStoreVisitStatsQuery,
  useListMarketplaceServicesQuery,
  useTrackVendorStoreVisitMutation,
} from "@/services/marketplaceApi";
import { useGetServiceMediaQuery } from "@/services/serviceMediaApi";
import { useGetServiceMenuMediaQuery } from "@/services/menuMediaApi";
import {
  useGetServiceOfferingsQuery,
  useLazyGetOfferingSlotsQuery,
  VendorOffering,
  VendorSlot,
} from "@/services/vendorOfferingsApi";
import {
  useGetServiceReviewsQuery,
  useCreateReviewMutation,
} from "@/services/serviceReviewsApi";
import { useApplyCouponMutation } from "@/services/vendorOrdersApi";
import { useGetPublicVendorCouponsQuery } from "@/services/vendoiCouponsApi";
import { useCreateCheckoutSessionMutation } from "@/services/checkoutApi";
import { useCreateAffiliateServiceLinkMutation } from "@/features/affiliate/api/affiliateApi";
import { useGetMyReferralSummaryQuery } from "@/features/referrals/api/referralApi";
import {
  hasActivePaidPlan,
  useGetMyPlanQuery,
} from "@/features/userSubscriptions/api/userSubscriptionsApi";
import { Button } from "@/components/ui/button";
import { DealTimer } from "@/components/marketplace/DealTimer";
import { ServiceGallery } from "@/components/shared/ServiceGallery";
import { Badge } from "@/components/ui/badge";
import { LocationMap } from "@/components/marketplace/Map/LocationMap";
import toast from "react-hot-toast";
import { slugifyServiceTitle, slugToSearchQuery } from "@/utils/slugify";
import { clearStoredCart, setStoredCart } from "@/utils/cartStorage";
import { calculateDiscountPercent, getEffectivePrice } from "@/utils/deals";

const formatSlotLabel = (start: string, end?: string | null) => {
  const formatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const startLabel = formatTime(start);
  if (!end) return startLabel;
  const endLabel = formatTime(end);
  return `${startLabel} - ${endLabel}`;
};

const getLocalDateKey = (value?: Date | string) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const determineSlotStatus = (slot: VendorSlot): SlotStatus => {
  if (slot.status !== "OPEN") {
    return "unavailable";
  }

  const capacity = Math.max(slot.capacity ?? 1, 1);
  const remaining = Math.max(slot.remaining ?? 0, 0);
  if (remaining <= 0) {
    return "unavailable";
  }
  // Color should react directly to remaining seats:
  // full capacity -> green, any booked seat -> amber, 0 -> gray/full.
  return remaining < capacity ? "few" : "available";
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
const formatRuleLabel = (value?: string | null) =>
  String(value ?? "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveReviewerImageUrl = (review: {
  user?: {
    profileImageUrl?: string | null;
    avatar?: string | null;
    image?: string | null;
    profileImage?: string | null;
  } | null;
  profileImageUrl?: string | null;
  avatar?: string | null;
  image?: string | null;
}) => {
  const candidate =
    review.user?.profileImageUrl?.trim() ||
    review.user?.avatar?.trim() ||
    review.user?.image?.trim() ||
    review.user?.profileImage?.trim() ||
    review.profileImageUrl?.trim() ||
    review.avatar?.trim() ||
    review.image?.trim() ||
    "";

  if (!candidate) return "";
  if (/^https?:\/\//i.test(candidate) || candidate.startsWith("data:")) {
    return candidate;
  }

  const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
  if (!apiBaseUrl) return candidate;
  return `${apiBaseUrl}/${candidate.replace(/^\/+/, "")}`;
};

const formatRelativeReviewTime = (dateValue?: string | null) => {
  if (!dateValue) return "";
  const reviewDate = new Date(dateValue);
  if (Number.isNaN(reviewDate.getTime())) return "";

  const diffMs = reviewDate.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(diffDays) >= 1) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      diffDays,
      "day",
    );
  }

  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) >= 1) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      diffHours,
      "hour",
    );
  }

  const diffMinutes = Math.round(diffMs / (1000 * 60));
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    diffMinutes,
    "minute",
  );
};

type CartItem = {
  offering: VendorOffering;
  quantity: number;
  slotId: string | null;
};

const couponThemes = [
  {
    leftPanel: "bg-[#E9ECF2]",
    rightPanel: "bg-gradient-to-r from-[#2A2236] via-[#7A1D34] to-[#E30B24]",
  },
  {
    leftPanel: "bg-[#E8F2EE]",
    rightPanel: "bg-gradient-to-r from-[#12322C] via-[#1D6B59] to-[#26B68A]",
  },
  {
    leftPanel: "bg-[#EAF0FA]",
    rightPanel: "bg-gradient-to-r from-[#1E2A4A] via-[#2E4FA4] to-[#4F7DF3]",
  },
  {
    leftPanel: "bg-[#F8ECE7]",
    rightPanel: "bg-gradient-to-r from-[#40210F] via-[#8E3E1B] to-[#E66A2C]",
  },
] as const;

export default function ServiceDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { serviceSlug } = useParams<{
    serviceSlug?: string;
  }>();
  const authUser = useAppSelector((state) => state.auth.user);
  const userId = authUser?.id;
  const { data: myPlanRes } = useGetMyPlanQuery(undefined, { skip: !authUser });
  const canAccessHotDeals = hasActivePaidPlan(myPlanRes?.data);
  const isAffiliate = (authUser?.roles ?? []).includes("AFFILIATE");
  const { data: myReferralSummary } = useGetMyReferralSummaryQuery(undefined, {
    skip: !userId,
  });

  const [createCheckoutSession, { isLoading: isCreatingSession }] =
    useCreateCheckoutSessionMutation();
  const [trackVendorStoreVisit] = useTrackVendorStoreVisitMutation();
  const [applyCoupon, { isLoading: isApplyingCoupon }] =
    useApplyCouponMutation();
  const [
    createAffiliateServiceLink,
    { data: affiliateLinkRes, isLoading: isGeneratingAffiliateLink },
  ] = useCreateAffiliateServiceLinkMutation();

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date(),
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const selectedDateIso = selectedDate ? getLocalDateKey(selectedDate) : "";
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
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [appliedReferralCode, setAppliedReferralCode] = useState<string | null>(
    null,
  );
  const [referralCodeFeedback, setReferralCodeFeedback] = useState<string | null>(
    null,
  );
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    value: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [failedReviewerImages, setFailedReviewerImages] = useState<
    Record<string, boolean>
  >({});
  const [selectedMenuImage, setSelectedMenuImage] = useState<string | null>(
    null,
  );

  const resetCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponError(null);
  };
  const [fetchOfferingSlots, { data: fetchedSlots }] =
    useLazyGetOfferingSlotsQuery();

  const isUuidLikeServiceKey = Boolean(
    serviceSlug &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceSlug),
  );
  const serviceIdParam = isUuidLikeServiceKey ? serviceSlug : undefined;
  const slugSearchQuery =
    serviceSlug && !isUuidLikeServiceKey
      ? slugToSearchQuery(serviceSlug)
      : undefined;
  const affiliateRef = (searchParams.get("ref") ?? "").trim() || undefined;
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

  useEffect(() => {
    if (!affiliateRef) return;
    const normalized = affiliateRef.trim().toUpperCase();
    if (!normalized) return;
    setReferralCodeInput(normalized);
    setAppliedReferralCode(normalized);
    setReferralCodeFeedback(`Referral code ${normalized} applied`);
  }, [affiliateRef]);

  const matchedMarketplaceService = useMemo(() => {
    if (!marketplaceList?.data || marketplaceList.data.length === 0)
      return undefined;
    if (serviceIdParam) {
      return marketplaceList.data.find((row) => row.id === serviceIdParam);
    }
    if (!serviceSlug) return undefined;
    return marketplaceList.data.find(
      (row) => slugifyServiceTitle(row.title) === serviceSlug,
    );
  }, [marketplaceList?.data, serviceIdParam, serviceSlug]);

  const vendorId = matchedMarketplaceService?.vendorId;
  const { data: vendorVisitStatsResponse } = useGetVendorStoreVisitStatsQuery(
    vendorId ?? "",
    { skip: !vendorId },
  );
  const totalVisitors = vendorVisitStatsResponse?.data?.totalVisitors ?? 0;
  const todayVisitors = vendorVisitStatsResponse?.data?.todayVisitors ?? 0;
  const serviceCity = matchedMarketplaceService?.cityName ?? "â€”";
  const rules = matchedMarketplaceService?.offeringsPreview ?? "â€”";
  console.log(rules);

  useEffect(() => {
    if (!vendorId || typeof window === "undefined") return;

    const now = new Date();
    const visitDateKey = [
      now.getUTCFullYear(),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
      String(now.getUTCDate()).padStart(2, "0"),
    ].join("-");
    const storageKey = `stadonclick.vendorVisit.${vendorId}.${visitDateKey}`;

    if (window.sessionStorage.getItem(storageKey) === "1") return;

    window.sessionStorage.setItem(storageKey, "1");
    trackVendorStoreVisit({ vendorId })
      .unwrap()
      .catch(() => {
        window.sessionStorage.removeItem(storageKey);
      });
  }, [trackVendorStoreVisit, vendorId]);

  useEffect(() => {
    if (!bookedOffering?.id || !vendorId) return;
    fetchOfferingSlots({
      offeringId: bookedOffering.id,
      vendorId,
    });
  }, [bookedOffering?.id, fetchOfferingSlots, vendorId]);

  const slotsForBookedOffering = useMemo(
    () => (bookedOffering ? (fetchedSlots ?? bookedOffering.slots ?? []) : []),
    [bookedOffering, fetchedSlots],
  );

  const reservedSlotQuantityById = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) {
      if (!item.slotId) continue;
      map.set(item.slotId, (map.get(item.slotId) ?? 0) + Math.max(item.quantity, 1));
    }
    return map;
  }, [cartItems]);

  const slotsForBookedOfferingWithCartHold = useMemo(
    () =>
      slotsForBookedOffering.map((slot) => {
        const reserved = reservedSlotQuantityById.get(slot.id) ?? 0;
        const nextRemaining = Math.max((slot.remaining ?? 0) - reserved, 0);
        return {
          ...slot,
          remaining: nextRemaining,
          status:
            slot.status === "OPEN" && nextRemaining <= 0
              ? ("FULL" as const)
              : slot.status,
        };
      }),
    [reservedSlotQuantityById, slotsForBookedOffering],
  );

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return slotsForBookedOfferingWithCartHold;
    return slotsForBookedOfferingWithCartHold.filter((slot) => {
      const slotDate = getLocalDateKey(slot.startTime);
      return slotDate === selectedDateIso;
    });
  }, [slotsForBookedOfferingWithCartHold, selectedDateIso, selectedDate]);

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
          const maxAllowed = item.offering.remainingQuantity ?? Number.POSITIVE_INFINITY;
          const nextQuantity = Math.min(
            Math.max(item.quantity + delta, 1),
            Math.max(maxAllowed, 1),
          );
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
    (sum, item) => sum + getEffectivePrice(item.offering) * item.quantity,
    0,
  );
  const serviceFee = 0;
  const cartDiscount = couponDiscount;
  const cartTotal = Math.max(cartSubtotal + serviceFee - cartDiscount, 0);

  useEffect(() => {
    if (cartItems.length === 0) {
      clearStoredCart();
      return;
    }

    setStoredCart(
      cartItems.map((item) => ({
        id: item.offering.id,
        title: item.offering.name,
        description: item.offering.description ?? "Premium experience",
        quantity: item.quantity,
        unitPrice: getEffectivePrice(item.offering),
        totalPrice: getEffectivePrice(item.offering) * item.quantity,
      })),
    );
  }, [cartItems]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    if (cartItems.length === 0) {
      toast.success("Add services to your cart before applying a coupon.");
      return;
    }
    if (!vendorId) {
      toast.error("Unable to resolve the vendor for this booking.");
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

  const handleApplyReferralCode = () => {
    const code = referralCodeInput.trim().toUpperCase();
    if (!code) {
      setAppliedReferralCode(null);
      setReferralCodeFeedback(null);
      return;
    }
    setReferralCodeInput(code);
    setAppliedReferralCode(code);
    setReferralCodeFeedback(`Referral code ${code} applied`);
  };

  const openBookingModal = (offering: VendorOffering) => {
    setBookedOffering(offering);
    setSelectedSlotId(null);
    setBookingModalOpen(true);
  };

  const handleBookClick = (offering: VendorOffering) => {
    if (isMovieBookingService) {
      const url = offering.bookingUrl?.trim();
      if (!url) {
        toast.error("Booking URL is not configured for this movie offering.");
        return;
      }
      if (typeof window !== "undefined") {
        window.location.assign(url);
      }
      return;
    }

    const slots = offering.slots ?? [];
    const slotCount = slots.length;
    const requiresSlot = offering.usesSlots || slotCount > 0;
    const outOfStock =
      !requiresSlot &&
      offering.remainingQuantity !== null &&
      offering.remainingQuantity <= 0;

    if (requiresSlot) {
      if (slotCount === 0) {
        toast.success("Slots are unavailable for this service at the moment.");
        return;
      }
      openBookingModal(offering);
      return;
    }
    if (outOfStock) {
      toast.error("This offering is currently out of stock.");
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
        referralCode: appliedReferralCode ?? undefined,
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

      toast.success("Redirecting you to Stripe checkoutâ€¦");
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
  const resolvedLatitude =
    matchedMarketplaceService?.latitude ?? service?.latitude ?? 0;
  const resolvedLongitude =
    matchedMarketplaceService?.longitude ?? service?.longitude ?? 0;
  const isMovieBookingService =
    String(service?.category?.slug ?? "").toLowerCase() === "movie-bookings" ||
    String(matchedMarketplaceService?.categoryName ?? "").toLowerCase() ===
      "movie bookings";
  const currentServiceId = matchedMarketplaceService?.id ?? service?.id;

  // 2. Fetch Media (isolated)
  const { data: media, isLoading: mediaLoading } = useGetServiceMediaQuery(
    currentServiceId ?? "",
    {
      skip: !currentServiceId,
    },
  );
  const { data: menuMedia = [], isLoading: menuMediaLoading } =
    useGetServiceMenuMediaQuery(currentServiceId ?? "", {
      skip: !currentServiceId,
    });

  // 3. Fetch Offerings (isolated)
  const { data: offerings, isLoading: offeringsLoading } =
    useGetServiceOfferingsQuery(currentServiceId ?? "", {
      skip: !currentServiceId,
    });
  const serviceOfferingsFallback = useMemo<VendorOffering[]>(() => {
    const list = service?.offerings ?? [];
    return list.map((offering) => ({
      createdAt: new Date().toISOString(),
      id: offering.id,
      serviceId: offering.serviceId ?? currentServiceId ?? "",
      name: offering.name,
      description: offering.description ?? null,
      bookingUrl: offering.bookingUrl ?? null,
      usesSlots: false,
      basePrice: Number(offering.basePrice ?? 0),
      salePrice: Number(offering.salePrice ?? 0),
      discountPercent:
        offering.discountPercent == null ? null : Number(offering.discountPercent),
      dealStartTime: offering.dealStartTime ?? null,
      dealEndTime: offering.dealEndTime ?? null,
      isDealActive: Boolean(offering.isDealActive),
      effectivePrice:
        offering.effectivePrice == null
          ? getEffectivePrice({
              basePrice: Number(offering.basePrice ?? 0),
              salePrice: Number(offering.salePrice ?? 0),
              dealStartTime: offering.dealStartTime ?? null,
              dealEndTime: offering.dealEndTime ?? null,
            })
          : Number(offering.effectivePrice),
      currency: offering.currency ?? "SEK",
      maxQuantity: offering.maxQuantity ?? null,
      remainingQuantity: offering.remainingQuantity ?? null,
      slots: [],
      rules: [],
    }));
  }, [currentServiceId, service?.offerings]);
  const effectiveOfferings =
    (offerings?.length ?? 0) > 0 ? offerings ?? [] : serviceOfferingsFallback;
  const visibleOfferings = useMemo(
    () =>
      effectiveOfferings.map((offering) =>
        !canAccessHotDeals && offering.isDealActive
          ? {
              ...offering,
              salePrice: offering.basePrice,
              discountPercent: null,
              dealEndTime: null,
              dealStartTime: null,
              isDealActive: false,
              effectivePrice: Number(offering.basePrice ?? 0),
            }
          : offering,
      ),
    [canAccessHotDeals, effectiveOfferings],
  );
  const { data: vendorCoupons = [] } = useGetPublicVendorCouponsQuery(
    vendorId ?? "",
    { skip: !vendorId },
  );

  const { data: reviews, isLoading: reviewsLoading } =
    useGetServiceReviewsQuery(currentServiceId ?? "", {
      skip: !currentServiceId,
    });

  const averageReviewRating = useMemo(() => {
    const list = reviews ?? [];
    if (list.length === 0) return 0;
    return list.reduce((acc, review) => acc + review.rating, 0) / list.length;
  }, [reviews]);

  const starBreakdown = useMemo(() => {
    const list = reviews ?? [];
    const total = list.length;
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = list.filter((review) => review.rating === rating).length;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        rating,
        count,
        percent,
      };
    });
  }, [reviews]);

  const descriptionRules = useMemo(() => {
    const seen = new Map<string, { label: string; value?: string | null }>();
    for (const offering of visibleOfferings ?? []) {
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
  }, [visibleOfferings]);
  const marketplaceOfferingsPreview =
    (matchedMarketplaceService?.offeringsPreview ?? []).map((offering) =>
      !canAccessHotDeals && offering.isDealActive
        ? {
            ...offering,
            salePrice: offering.basePrice,
            discountPercent: 0,
            dealEndTime: null,
            dealStartTime: null,
            isDealActive: false,
            effectivePrice: Number(offering.basePrice ?? 0),
          }
        : offering,
    );
  const hasLiveOfferings = (effectiveOfferings?.length ?? 0) > 0;
  const packagesCount = hasLiveOfferings
    ? visibleOfferings?.length ?? 0
    : marketplaceOfferingsPreview.length;

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
    menuMediaLoading ||
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
      <div className="flex min-h-screen items-center justify-center bg-[#F1F3F7] px-4">
      <div className="w-full max-w-xl rounded-3xl border border-[#DCE6F5] bg-white p-8 text-center shadow-sm">
          <h2 className="text-3xl font-semibold tracking-tight text-[#0F2A44]">
            Sign in to view services
          </h2>
          <p className="mt-3 text-sm text-[#5F7390]">
            We need to know who you are before showing your bookings and
            purchases.
          </p>
          <Button
            type="button"
            onClick={() => navigate("/sign-in")}
            className="mt-6 h-11 w-full rounded-full bg-[#DBEAFE] text-base font-semibold text-[#0F2A44] hover:bg-[#BFDBFE]"
          >
            Go to sign in
          </Button>
        </div>
      </div>
    );
  }

  const galleryImages = media
    ?.filter((m) => m.type === "IMAGE")
    .map((m) => m.signedUrl) || [salon1, salon2, salon3];
  const menuPreviewImages =
    menuMedia
      ?.filter((m) => m.type === "IMAGE")
      .map((m) => m.signedUrl) || [];
  const serviceDescription =
    service.description ||
    "Our team curates a premium experience for every guest - scroll through the service options to choose what fits your visit.";

  const statusStyles: Record<string, string> = {
    DRAFT: "bg-[#EAF1FF] text-[#2563EB]",
    PAUSED: "bg-[#EAF1FF] text-[#5F7390]",
    LIVE: "bg-[#EAF1FF] text-[#1D4ED8]",
  };

  return (
    <section className="min-h-screen bg-[#F3F7FF] py-10 text-[#0F2A44] ">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 ">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5F7390] transition hover:text-[#0F2A44]"
        >
          <ChevronLeft className="h-4 w-4 mt-4" />
          Back to services
        </button>
        <div className="rounded-xl ">
          <div className="grid gap-6 lg:grid-cols-[0.fr_1.5fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-[#0F2A44]">
                    {service.title}
                  </h1>
                   <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#0F2A44]">
                    <div className="flex">
                      <MapPinIcon className="h-5 w-5 " />
                      <div className="ml-2 font-semibold">{serviceCity}</div>
                    </div>
                    <div className="inline-flex items-center gap-1.5  px-2.5 py-1 text-xs font-bold text-[#D4AF37]">
                      <span className="inline-flex h-4.5 w-4.5 items-center justify-center  bg-[#FEF3C7] text-[#F5A623]">
                        <Star className="h-4 w-4 fill-current text-current" />
                      </span>
                      {reviews && reviews.length > 0
                        ? (
                            reviews.reduce((acc, r) => acc + r.rating, 0) /
                            reviews.length
                          ).toFixed(1)
                        : "0.0"}
                    </div>
                    <span className="text-xs text-[#5F7390]">
                      ({reviews?.length || 0}+ verified guest reviews)
                    </span>
                    <span className="inline-flex ml-4 items-center gap-1.5 rounded-full border border-[#DCE6F5] bg-white px-3 py-1 text-xs font-extrabold tracking-wide text-[#2563EB] shadow-sm">
                      <Eye className="h-3.5 w-3.5" />
                      {totalVisitors} visitors
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#4b76d5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
                        {todayVisitors} today
                     </span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                      {myReferralSummary?.referralCode ? (
                     <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6F5] bg-[#EAF1FF] px-2.5 py-1">
                       <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#2563EB]">
                        {myReferralSummary.referralCode}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            myReferralSummary.referralCode ?? "",
                          );
                          toast.success("Referral code copied");
                        }}
                         className="rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0F2A44] hover:bg-[#BFDBFE]"
                      >
                        Copy
                      </button>
                    </div>
                  ) : null}   
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCE6F5] bg-white text-[#5F7390] shadow-sm transition hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCE6F5] bg-white text-[#5F7390] shadow-sm transition hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
              
                </div>
              </div>
              <ServiceGallery
                galleryImages={galleryImages}
                serviceName={service.title}
                categoryLabel={
                  matchedMarketplaceService?.categoryName ??
                  service.category?.name ??
                  "Service"
                }
                ratingLabel={
                  reviews && reviews.length > 0
                    ? (
                        reviews.reduce((acc, r) => acc + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)
                    : "0.0"
                }
                reviewText={`Over ${(reviews?.length || 0).toLocaleString()} verified reviews`}
                ctaLabel="Reserve Your Spot"
                onCtaClick={() =>
                  document
                    .getElementById("service-offerings")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              />
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#5F7390]">
                {service.status && (
                  <span
                    className={`rounded-full border border-[#DCE6F5] px-3 py-1 text-sm font-semibold ${statusStyles[service.status] ?? "border-[#DCE6F5] text-[#5F7390]"}`}
                  >
                    {service.status}
                  </span>
                )}
              </div>

              {isAffiliate && (
                <div className="w-full max-w-[520px] rounded-2xl border border-[#DCE6F5] bg-[#EAF1FF] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#0F2A44]">
                      Affiliate link for this service
                    </p>
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!service.id) return;
                        try {
                          await createAffiliateServiceLink({
                            serviceId: service.id,
                          }).unwrap();
                        } catch (error: any) {
                          toast.error(
                            error?.data?.message ||
                              "Unable to generate affiliate link.",
                          );
                        }
                      }}
                      disabled={isGeneratingAffiliateLink}
                      className="ml-auto"
                    >
                      {isGeneratingAffiliateLink
                        ? "Generating..."
                        : "Generate Link"}
                    </Button>
                  </div>

                  {affiliateLinkRes?.data?.url ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-[#5F7390]">Referral code</p>
                      <p className="text-sm font-semibold text-[#0F2A44]">
                        {affiliateLinkRes.data.code}
                      </p>
                      <p className="text-xs text-[#5F7390]">Shareable link</p>
                      <div className="rounded-lg border border-[#DCE6F5] bg-white p-2 text-xs font-mono break-all text-[#0F2A44]">
                        {affiliateLinkRes.data.url}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            affiliateLinkRes.data.url,
                          );
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
            <div id="service-offerings" className="col-span-3 min-w-0 space-y-6">
              <div className="rounded-[30px] border border-[#DCE6F5] bg-white p-7">
                <div className="max-w-3xl">
 
                  <h2 className="mt-3 text-[28px] font-semibold leading-tight text-[#0F2A44]">
                    About {service.title}
                  </h2>
                  <p className="mt-4 text-[15px] font-medium leading-8 text-[#5F7390]">
                    {serviceDescription}
                  </p>
                </div>

                {descriptionRules.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {descriptionRules.map((rule, index) => {
                      const tones = [
                        "bg-[#EAF1FF] text-[#2563EB]",
                        "bg-[#F3F7FF] text-[#1D4ED8]",
                        "bg-[#EAF1FF] text-[#60A5FA]",
                        "bg-[#FFFFFF] text-[#2563EB]",
                      ];
                      const tone = tones[index % tones.length];

                      return (
                        <span
                          key={`${rule.label}-${rule.value}`}
                          className={`inline-flex rounded-xl px-4 py-2 text-[13px] font-semibold ${tone}`}
                        >
                          {rule.label}
                          {rule.value ? `: ${rule.value}` : ""}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="space-y-5 rounded-3xl border border-[#DCE6F5] bg-white p-8 ">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0F2A44]">
                      Services
                    </h2>
                    <p className="text-sm text-[#5F7390]">
                      Choose a ritual that suits your mood
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#5F7390]">
                    {packagesCount} packages
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {hasLiveOfferings ? (
                    visibleOfferings?.map((offering) => {
                      const displayPrice = getEffectivePrice(offering);
                      const activeDiscountPercent =
                        Number(offering.discountPercent ?? 0) ||
                        calculateDiscountPercent(offering.basePrice, offering.salePrice);
                      const isMovieBookingOffering = isMovieBookingService;
                      const slotCount = offering.slots?.length ?? 0;
                      const requiresSlot = offering.usesSlots || slotCount > 0;
                      const outOfStock =
                        !requiresSlot &&
                        offering.remainingQuantity !== null &&
                        offering.remainingQuantity <= 0;
                      const missingBookingUrl =
                        isMovieBookingOffering && !offering.bookingUrl?.trim();
                      const isSlotUnavailable =
                        missingBookingUrl ||
                        ((requiresSlot && slotCount === 0) || outOfStock);
                      const maxQty = offering.maxQuantity ?? null;
                      const remainingQty =
                        offering.remainingQuantity ?? offering.maxQuantity ?? null;
                      const hasInventory =
                        maxQty !== null &&
                        Number.isFinite(maxQty) &&
                        remainingQty !== null &&
                        Number.isFinite(remainingQty);
                      const remainingPercent = hasInventory
                        ? Math.max(
                            0,
                            Math.min(100, (Number(remainingQty) / Number(maxQty)) * 100),
                          )
                        : null;
                      const inventoryBarClass = outOfStock
                        ? "bg-rose-500"
                        : hasInventory &&
                            Number(remainingQty) <= Math.max(1, Math.ceil(Number(maxQty) * 0.25))
                          ? "bg-[#60A5FA]"
                          : "bg-[#DBEAFE]";
                      return (
                        <div
                          key={offering.id}
                          className="space-y-4 rounded-[26px] border border-[#DCE6F5] bg-white p-5 "
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                  isSlotUnavailable
                                    ? "bg-[#EAF1FF] text-[#5F7390]"
                                    : "bg-[#EAF1FF] text-[#4b76d5]"
                                }`}
                              >
                                {isSlotUnavailable ? "Limited" : "Available now"}
                              </span>
                              <p className="mt-4 text-[22px] font-semibold leading-tight text-[#0F2A44]">
                                {offering.name}
                              </p>
                              <div className="mt-2 flex items-center gap-2 text-xs text-[#5F7390]">
                                <MapPinIcon className="h-3.5 w-3.5" />
                                <span>{serviceCity}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[28px] font-bold leading-none text-[#4b76d5]">
                                {formatCurrency(displayPrice)}
                              </p>
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5F7390]">
                                {offering.usesSlots || (offering.slots?.length ?? 0) > 0
                                  ? "PER SLOT"
                                  : offering.maxQuantity
                                    ? "PER UNIT"
                                    : "PER BOOKING"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm text-[#5F7390]">
                              {offering.description ??
                                "Exclusive access with a streamlined booking experience and flexible scheduling."}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#5F7390]">
                              <span>Created {new Date(offering.createdAt).toLocaleDateString()}</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f4f8] px-3 py-1 text-[#4b76d5]">
                                <Users className="h-3.5 w-3.5" />
                                Up to {offering.maxQuantity || "N/A"}
                              </span>
                              <span>Remaining {offering.remainingQuantity ?? "N/A"}</span>
                            </div>
                            {hasInventory && remainingPercent !== null ? (
                              <div className="max-w-[220px]">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EAF1FF]">
                                  <div
                                    className={`h-full rounded-full ${inventoryBarClass}`}
                                    style={{ width: `${remainingPercent}%` }}
                                  />
                                </div>
                              </div>
                            ) : null}
                            {offering.isDealActive ? (
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <p className="font-semibold text-[#5F7390] line-through">
                                  {formatCurrency(offering.basePrice)}
                                </p>
                                <p className="font-black text-[#2563EB]">
                                  {activeDiscountPercent}% OFF
                                </p>
                                <DealTimer
                                  endTime={offering.dealEndTime}
                                  className="font-semibold text-[#5F7390]"
                                />
                              </div>
                            ) : null}
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              className={`min-w-[132px] rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                isSlotUnavailable
                                  ? "cursor-not-allowed border border-[#DCE6F5] bg-[#EAF1FF] text-[#5F7390]"
                                  : requiresSlot || isMovieBookingOffering
                                    ? "bg-[#DBEAFE] text-[#0F2A44] hover:bg-[#BFDBFE] active:bg-[#93C5FD]"
                                    : "border border-[#DCE6F5] bg-[#4b76d5] text-white"
                              }`}
                              disabled={isSlotUnavailable}
                              onClick={() => handleBookClick(offering)}
                            >
                              {requiresSlot || isMovieBookingOffering ? "Book" : "Add to cart"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : marketplaceOfferingsPreview.length > 0 ? (
                    marketplaceOfferingsPreview.map((offering) => (
                      <div
                        key={offering.id}
                        className="space-y-4 rounded-[26px] border border-[#DCE6F5] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,42,68,0.14)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-flex rounded-full bg-[#EAF1FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                              Preview
                            </span>
                            <p className="mt-4 text-[22px] font-semibold leading-tight text-[#0F2A44]">
                              {offering.name}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-[#5F7390]">
                              <MapPinIcon className="h-3.5 w-3.5" />
                              <span>{serviceCity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[28px] font-bold leading-none text-[#2563EB]">
                              {formatCurrency(
                                Number(offering.effectivePrice ?? offering.salePrice ?? offering.basePrice ?? 0),
                              )}
                            </p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5F7390]">
                              {offering.durationLabel?.toUpperCase() ?? "PER BOOKING"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-[#5F7390]">
                            {offering.description ??
                              "Exclusive access with curated service details available at launch."}
                          </p>
                          {offering.durationLabel ? (
                            <p className="text-xs font-medium text-[#5F7390]">
                              Duration: {offering.durationLabel}
                            </p>
                          ) : null}
                          {offering.isDealActive ? (
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <p className="font-semibold text-[#5F7390] line-through">
                                {formatCurrency(Number(offering.basePrice ?? 0))}
                              </p>
                              <p className="font-black text-[#2563EB]">
                                {Number(offering.discountPercent ?? 0)}% OFF
                              </p>
                              <DealTimer
                                endTime={offering.dealEndTime}
                                className="font-semibold text-[#5F7390]"
                              />
                            </div>
                          ) : null}
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="min-w-[132px] rounded-xl border border-[#DCE6F5] bg-[#EAF1FF] px-4 py-2.5 text-sm font-semibold text-[#5F7390]"
                            disabled
                            type="button"
                          >
                            Available soon
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-[#DCE6F5] bg-[#EAF1FF] p-4 text-sm text-[#5F7390]">
                      No service packages are available yet for this listing.
                    </div>
                  )}
                </div>
              </div>
            </div>

          <div className="col-span-2">
            <div className="space-y-5 rounded-3xl border border-[#DCE6F5] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#0F2A44]">
                    Your order
                  </h3>

                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-[#5F7390]">
                    {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>
              {cartItems.length === 0 ? (
                <p className="text-sm text-[#5F7390]">
                  Choose a service from the list to start your booking.
                </p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.offering.id}
                      className="flex items-start justify-between gap-4 overflow-hidden"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="max-w-full break-words text-sm font-semibold text-[#0F2A44]">
                          {item.offering.name}
                        </p>
                        <p className="max-w-full overflow-hidden break-all text-xs text-[#5F7390]">
                          {item.offering.description ?? "Premium experience"}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item.offering.id)}
                          className="mt-2 text-xs font-semibold text-[#2563EB]"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="w-[136px] shrink-0 text-right">
                        <p className="text-sm font-semibold text-[#0F2A44]">
                          {formatCurrency(getEffectivePrice(item.offering))} per person
                        </p>
                        <div className="mt-2 flex items-center justify-end gap-2 rounded-full px-2 py-1">
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full bg-[#EAF1FF] text-sm font-semibold text-[#0F2A44] shadow-sm"
                            onClick={() =>
                              updateCartQuantity(item.offering.id, -1)
                            }
                          >
                           -
                          </button>
                          <span className="text-sm font-semibold text-[#0F2A44]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full bg-[#EAF1FF] text-sm font-semibold text-[#0F2A44] shadow-sm"
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
              <div className="space-y-5 rounded-[28px] border border-[#DCE6F5] bg-[#EAF1FF] p-5 ">
                <div className="flex items-center gap-2 text-[#0F2A44]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#2563EB]">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <h4 className="text-lg font-semibold">Wallet & Rewards</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#5F7390]">
                    Apply promo code
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="ENTER CODE"
                    className="h-11 flex-1 rounded-xl border border-[#DCE6F5] bg-white px-4 text-sm font-semibold uppercase tracking-wide text-[#0F2A44] placeholder:text-[#5F7390] focus:border-[#2563EB] focus:outline-none"
                  />
                  <Button
                    variant={"default"}
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim() || isApplyingCoupon}
                    className="h-11 rounded-xl bg-[#DBEAFE] px-5 text-sm font-semibold uppercase tracking-wide text-[#0F2A44] hover:bg-[#BFDBFE] active:bg-[#93C5FD]"
                  >
                    {isApplyingCoupon ? "Checking..." : "Apply"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#5F7390]">
                    Available coupons
                  </p>
                  <div className="space-y-2.5">
                    {vendorCoupons.slice(0, 2).map((coupon, index) => {
                      const locked = index === 1;

                      return (
                        <button
                          key={coupon.code}
                          type="button"
                          disabled={locked}
                          onClick={() => {
                            if (locked) return;
                            setPromoCode(coupon.code);
                            setCouponError(null);
                          }}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                            locked
                              ? "border-[#DCE6F5] bg-white/70 text-[#5F7390]"
                              : "border-[#DCE6F5] bg-white text-[#0F2A44] hover:border-[#2563EB]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${locked ? "bg-[#EAF1FF] text-[#5F7390]" : "bg-[#EAF1FF] text-[#2563EB]"}`}>
                              <TicketPercent className="h-4 w-4" />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${locked ? "text-[#5F7390]" : "text-[#2563EB]"}`}>
                                {coupon.code}
                              </p>
                              <p className="mt-1 text-xs text-[#5F7390]">
                                {coupon.title}
                              </p>
                            </div>
                          </div>
                          {locked ? (
                            <Lock className="h-4 w-4 shrink-0" />
                          ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 text-[#2563EB]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#5F7390]">
                    User referral code
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => {
                        setReferralCodeInput(e.target.value);
                        setReferralCodeFeedback(null);
                      }}
                      placeholder="ENTER REFERRAL CODE"
                      className="h-11 flex-1 rounded-xl border border-[#DCE6F5] bg-white px-4 text-sm font-semibold uppercase tracking-wide text-[#0F2A44] placeholder:text-[#5F7390] focus:border-[#2563EB] focus:outline-none"
                    />
                    <Button
                      variant={"default"}
                      onClick={handleApplyReferralCode}
                      disabled={!referralCodeInput.trim()}
                      className="h-11 rounded-xl border border-[#DCE6F5] bg-[#EAF1FF] px-5 text-sm font-semibold uppercase tracking-wide text-[#2563EB] hover:bg-[#F3F7FF]"
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedReferralCode ? (
                    <div className="rounded-2xl bg-[#EAF1FF] px-4 py-3 text-xs font-semibold text-[#2563EB]">
                      {referralCodeFeedback ?? `Referral code ${appliedReferralCode} applied`}
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedReferralCode(null);
                          setReferralCodeInput("");
                          setReferralCodeFeedback(null);
                        }}
                        className="ml-2 underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </div>
                {couponError ? (
                  <p className="text-xs font-semibold text-red-600">{couponError}</p>
                ) : null}
                {appliedCoupon ? (
                  <div className="rounded-2xl bg-[#EAF1FF] px-4 py-3 text-xs font-semibold text-[#2563EB]">
                    Coupon {appliedCoupon.code} applied (
                    {appliedCoupon.discountType === "FLAT"
                      ? formatCurrency(appliedCoupon.value)
                      : `${appliedCoupon.value}%`}
                    )
                    <button
                      type="button"
                      onClick={() => {
                        resetCoupon();
                        setPromoCode("");
                      }}
                      className="ml-2 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-5 rounded-[28px] border border-[#DCE6F5] bg-white p-6 ">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-[#5F7390]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#0F2A44]">
                      {formatCurrency(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#5F7390]">
                    <span>Service Fee</span>
                    <span className="font-semibold text-[#0F2A44]">
                      {formatCurrency(serviceFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#4b76d5]">
                    <span className="font-semibold">Discount (Promo)</span>
                    <span className="font-semibold">
                      -{formatCurrency(cartDiscount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between border-t border-[#DCE6F5] pt-4">
                  <span className="text-[28px] font-semibold text-[#0F2A44]">Total</span>
                  <span className="text-[34px] font-bold leading-none text-[#2563EB]">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckoutCart}
                  className="h-14 w-full rounded-2xl bg-[#DBEAFE] text-base font-semibold text-[#0F2A44] hover:bg-[#BFDBFE] active:bg-[#93C5FD]"
                  disabled={cartItems.length === 0 || isCreatingSession}
                >
                  <span className="inline-flex items-center gap-2">
                    {isCreatingSession ? "Processing..." : "Confirm booking"}
                    <Lock className="h-4 w-4" />
                  </span>
                </Button>
          
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ================= LEFT SIDE - LOCATION ================= */}
          <div className="lg:col-span-3 space-y-5 rounded-3xl border border-[#DCE6F5] bg-white max-w-[800px] max-h-[380px] p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0F2A44]">
                {service.title}'s Location
              </h2>

              <a
                href={`https://www.google.com/maps?q=${resolvedLatitude},${resolvedLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-[#2563EB] hover:underline"
              >
                <img src={map} className="h-5 w-5" />
                <span>Google Maps</span>
              </a>
            </div>

            <LocationMap
              lat={resolvedLatitude}
              lng={resolvedLongitude}
              name={service.title}
            />
          </div>

          {/* ================= RIGHT SIDE - COUPONS ================= */}
          {vendorCoupons.length > 0 && (
            <div className="lg:col-span-2 space-y-3 rounded-2xl border border-[#DCE6F5] bg-[#EAF1FF] p-4">
              <h4 className="text-sm font-semibold text-[#0F2A44]">Coupons</h4>

              <div className="space-y-3">
                {vendorCoupons.slice(0, 4).map((coupon, index) => {
                  const theme = couponThemes[index % couponThemes.length];

                  return (
                    <div
                      key={coupon.code}
                      className="relative overflow-hidden rounded-2xl shadow-sm"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[122px_1fr]">
                        {/* LEFT PANEL */}
                        <div
                          className={`relative px-3 py-4 text-center ${theme.leftPanel}`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#0F2A44]">
                            Shopping Coupon
                          </p>

                          <p className="mt-2 text-[30px] font-black leading-none text-[#0F2A44]">
                            {coupon.discountType === "FLAT"
                              ? `${formatCurrency(coupon.discount)}`
                              : `${coupon.discount}%`}
                          </p>

                          <p className="text-[28px] font-black leading-none text-[#0F2A44]">
                            OFF
                          </p>

                          <div className="mt-3 space-y-1 text-[11px] text-[#5F7390]">
                            <p>Min order {formatCurrency(coupon.minOrder)}</p>
                            <p>Max uses {coupon.maxUses}</p>
                          </div>

                          <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#F3F7FF]" />
                        </div>

                        {/* RIGHT PANEL */}
                        <div
                          className={`relative px-4 py-4 text-white ${theme.rightPanel}`}
                        >
                          <span className="absolute -left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#F3F7FF]" />

                          <div className="pl-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                              STADONCLICK.COM
                            </p>

                            <p className="mt-1 text-lg font-bold leading-tight">
                              {coupon.title}
                            </p>

                            <p className="mt-2 text-xs text-white/85">
                              Valid until{" "}
                              <span className="font-semibold text-white">
                                {new Intl.DateTimeFormat("en-US", {
                                  month: "long",
                                  year: "numeric",
                                }).format(new Date(coupon.expiry))}
                              </span>
                            </p>

                            <p className="mt-2 text-base font-bold tracking-[0.22em]">
                              Code : {coupon.code}
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-3">
                              <p className="text-[11px] text-white/90">
                                Apply this code at checkout to unlock the offer.
                              </p>

                              <Button
                                type="button"
                                variant="secondary"
                                className="h-8 shrink-0 rounded-md border border-[#DCE6F5] bg-[#DBEAFE]/20 px-3 text-xs font-semibold text-white hover:bg-[#DBEAFE]/30"
                                onClick={() => {
                                  setPromoCode(coupon.code);
                                  setCouponError(null);
                                }}
                              >
                                Use code
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[800px]">
          {/* Highlights & Amenities Section */}
          <div className="space-y-6 rounded-3xl border border-[#DCE6F5] bg-white p-8">
            <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-[#0F2A44]">
                Highlights & Amenities
              </h2>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
                <span className="h-2 w-2 rounded-full bg-[#60A5FA]" />
                All Inclusive
              </span>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  title: "Climate Controlled",
                  description:
                    "High-performance AC rooms designed for data-intensive sessions and executive comfort.",
                  icon: Snowflake,
                  iconTone: "bg-[#ece9ff] text-[#5b57e6]",
                },
                {
                  title: "Executive Parking",
                  description:
                    "Dedicated secure parking area with valet services available for all institutional guests.",
                  icon: CarFront,
                  iconTone: "bg-[#efeaff] text-[#6a5bff]",
                  iconLabel: "P",
                },
                {
                  title: "Family Friendly",
                  description:
                    "Professional lounge and waiting areas optimized for companions and private family discussions.",
                  icon: Users,
                  iconTone: "bg-[#e9f4ff] text-[#2f7ddf]",
                },
              ].map(({ title, description, icon: Icon, iconTone, iconLabel }) => (
                <div
                  key={title}
                  className="rounded-[28px] border border-[#DCE6F5] bg-white p-6 "
                >
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconTone}`}>
                    {iconLabel ? (
                      <span className="text-[28px] font-bold leading-none">{iconLabel}</span>
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                  </span>
                  <h3 className="mt-6 text-[18px] font-semibold leading-tight text-[#0F2A44]">
                    {title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#5F7390]">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            {/* Menu Preview Section */}
            <div className="space-y-4 rounded-3xl border border-[#DCE6F5] bg-white p-8">
              <h3 className="text-xl font-bold text-[#0F2A44]">Menu Preview</h3>
              <p className="text-sm text-[#5F7390]">
                View uploaded menu photos from the restaurant
              </p>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {menuPreviewImages.length > 0 ? (
                  menuPreviewImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      className="min-w-[100px] shrink-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                      onClick={() => setSelectedMenuImage(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Menu preview ${index + 1}`}
                        className="h-48 w-full rounded-2xl object-cover transition-transform duration-200 hover:scale-[1.02] cursor-zoom-in"
                      />
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-[#5F7390]">No menu images uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[800px]">
          {/* Trust/Feature Banner */}
          <div className="rounded-3xl border border-[#DCE6F5] bg-white p-8">
            <div className="grid grid-cols-4 gap-8">
              {[
                {
                  icon: <BadgeCheck className="h-6 w-6 text-[#34D399]" />,
                  title: "Verified Providers",
                  desc: "Trusted & quality-checked",
                },
                {
                  icon: (
                    <svg
                      className="h-6 w-6 text-[#60A5FA]"
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
                      className="h-6 w-6 text-[#C084FC]"
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
                      className="h-6 w-6 text-[#FB923C]"
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
                  <h4 className="text-sm font-bold text-[#0F2A44]">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-[#5F7390]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-3xl border border-[#DCE6F5] bg-white p-8 ">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0F2A44]">Reviews</h2>
              <p className="text-sm text-[#5F7390]">
                Guests recap their experience in the studio lounge and treatment
                rooms.
              </p>
            </div>
            <button className="text-sm font-semibold text-[#2563EB]">
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
              const reviewerImageUrl = resolveReviewerImageUrl(
                review as typeof review & {
                  user?: {
                    profileImageUrl?: string | null;
                    avatar?: string | null;
                    image?: string | null;
                    profileImage?: string | null;
                  } | null;
                  profileImageUrl?: string | null;
                  avatar?: string | null;
                  image?: string | null;
                },
              );
              const showReviewerImage =
                !!reviewerImageUrl && !failedReviewerImages[review.id];
              const reviewTimeLabel = formatRelativeReviewTime(review.createdAt);

              return (
                <article
                  key={review.id}
                  className="rounded-[24px] border border-[#DCE6F5] bg-white p-6 "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      {showReviewerImage ? (
                        <img
                          src={reviewerImageUrl}
                          alt={reviewerName}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                          onError={() =>
                            setFailedReviewerImages((prev) => ({
                              ...prev,
                              [review.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF1FF] text-lg font-bold text-[#2563EB]">
                          {reviewerInitial}
                        </div>
                      )}
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[15px] font-bold text-[#0F2A44]">
                            {reviewerName}
                          </p>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border border-[#DCE6F5] bg-[#EAF1FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB] hover:bg-[#EAF1FF]"
                          >
                            <Check className="h-3 w-3 stroke-[3px]" />
                            Verified
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-5 w-5 ${
                                s <= review.rating
                                  ? "fill-[#F5A623] text-[#F5A623]"
                                  : "fill-[#DCE6F5] text-[#DCE6F5]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-medium text-[#5F7390]">
                      {reviewTimeLabel || new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="mt-4 text-[15px] leading-8 text-[#5F7390]">
                    {review.comment}
                  </p>
                </article>
              );
            })}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.0fr_0.9fr]">
            <div className="rounded-[28px] border border-[#DCE6F5] bg-white p-6 ">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-[46px] font-bold leading-none text-[#4b76d5]">
                    {averageReviewRating.toFixed(1)}
                  </p>
                   <p className="text-sm font-semibold text-[#5F7390]">
                    Based on {reviews?.length || 0} reviews
                  </p>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageReviewRating)
                            ? "fill-[#F5A623] text-[#F5A623]"
                          : "fill-[#DCE6F5] text-[#DCE6F5]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 h-px w-full bg-[#DCE6F5]" />

              <div className="mt-6 space-y-3">
                {starBreakdown.map((row) => (
                  <div
                    key={row.rating}
                    className="grid grid-cols-[14px_1fr] items-center gap-x-4 gap-y-1"
                  >
                    <span className="text-sm font-semibold text-[#0F2A44]">
                      {row.rating}
                    </span>
                    <div className="h-2 rounded-full bg-[#EAF1FF]">
                      <div
                        className="h-2 rounded-full bg-[#F5A623] transition-all"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6 rounded-[32px] border border-[#DCE6F5] bg-white p-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#0F2A44]">
                  Write a Review
                </h3>
                <p className="text-sm font-medium text-[#5F7390]">
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
                          ? "fill-[#F5A623] text-[#F5A623]"
                          : "text-[#F5A623]"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={userComment}
                onChange={(evt) => setUserComment(evt.target.value)}
                placeholder="Tell fellow guests what made your visit special"
                className="min-h-35 w-full rounded-2xl border border-[#DCE6F5] bg-white px-4 py-3 text-sm text-[#0F2A44] focus:border-[#4b76d5]focus:outline-none"
              />

              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className=" font-semibold bg-[#4b76d5]"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedMenuImage && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedMenuImage(null)}
        >
          <button
            type="button"
            aria-label="Close image preview"
            className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xl font-semibold text-white backdrop-blur hover:bg-white/30"
            onClick={() => setSelectedMenuImage(null)}
          >
            Ã—
          </button>
          <img
            src={selectedMenuImage}
            alt="Enlarged menu preview"
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

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



