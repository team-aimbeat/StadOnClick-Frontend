export const DEAL_DURATION_OPTIONS = [
  { label: "1 hour", value: "1" },
  { label: "6 hours", value: "6" },
  { label: "12 hours", value: "12" },
  { label: "24 hours", value: "24" },
  { label: "3 days", value: "72" },
  { label: "7 days", value: "168" },
] as const;

export const calculateDiscountPercent = (basePrice?: number, salePrice?: number) => {
  if (!basePrice || !salePrice || basePrice <= 0 || salePrice >= basePrice) return 0;
  return Math.round(((basePrice - salePrice) / basePrice) * 100);
};

export const isDealActive = (dealEndTime?: string | null, dealStartTime?: string | null) => {
  if (!dealStartTime || !dealEndTime) return false;
  const start = new Date(dealStartTime);
  const end = new Date(dealEndTime);
  const now = Date.now();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  return start.getTime() <= now && now < end.getTime();
};

export const getEffectivePrice = (input: {
  basePrice: number;
  salePrice: number;
  dealStartTime?: string | null;
  dealEndTime?: string | null;
  effectivePrice?: number | null;
  isDealActive?: boolean | null;
}) => {
  if (typeof input.effectivePrice === "number") return input.effectivePrice;
  if (typeof input.isDealActive === "boolean") {
    return input.isDealActive ? input.salePrice : input.basePrice;
  }
  return isDealActive(input.dealEndTime, input.dealStartTime)
    ? input.salePrice
    : input.basePrice;
};

export const formatDealCountdown = (endTime?: string | null) => {
  if (!endTime) return null;
  const distance = new Date(endTime).getTime() - Date.now();
  if (!Number.isFinite(distance) || distance <= 0) return null;

  const totalSeconds = Math.floor(distance / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [days, hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};
