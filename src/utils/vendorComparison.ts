import { VendorComparisonRecord } from "@/services/vendorComparisonApi";

export function deriveTags(vendor: VendorComparisonRecord, vendors: VendorComparisonRecord[]) {
  const tags = new Set(vendor.tags);
  const maxVisitors = Math.max(...vendors.map((v) => v.stats.totalVisitors));
  const maxConversion = Math.max(...vendors.map((v) => v.stats.conversionRate));
  if (vendor.stats.totalVisitors === maxVisitors && maxVisitors > 0) tags.add("🏆 Most Popular");
  if (vendor.stats.conversionRate === maxConversion && maxConversion > 0) tags.add("⚡ Best Conversion");
  if (vendor.stats.visitorsLast7Days > 50) tags.add("🔥 Trending");
  if (vendor.stats.repeatVisitorsPercentage > 50) tags.add("💎 Most Trusted");
  if (vendor.stats.conversionRate >= 25 && vendor.stats.totalVisitors >= 20) tags.add("💎 Best Value Vendor");
  return Array.from(tags);
}
